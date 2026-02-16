import { useState, useEffect } from 'react';
import {
  Stack,
  Button,
  TextInput,
  Textarea,
  Text,
  Card,
  Group,
  Badge,
  CopyButton,
  ActionIcon,
  Tooltip,
  Alert,
  Loader,
} from '@mantine/core';
import {
  IconKey,
  IconCopy,
  IconCheck,
  IconAlertCircle,
  IconShieldCheck,
  IconShieldOff,
} from '@tabler/icons-react';
import {
  generateKeyPair,
  computeKid,
  importPrivateKey,
  fetchIssuerJwks,
  extractIssuerSlug,
} from '@/lib/exchange/crypto';
import type { StoredKeyPair } from '@/lib/exchange/keys';
import type { JWK } from 'jose';

interface KeyManagerProps {
  keyPair: StoredKeyPair | null;
  issuer: string;
  onKeyPairChange: (pair: StoredKeyPair) => void;
  onIssuerChange: (iss: string) => void;
}

type DirectoryStatus =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'found'; keys: JWK[]; kidMatch: boolean }
  | { state: 'not-found'; error: string };

export function KeyManager({
  keyPair,
  issuer,
  onKeyPairChange,
  onIssuerChange,
}: KeyManagerProps) {
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [directoryStatus, setDirectoryStatus] = useState<DirectoryStatus>({ state: 'idle' });

  // Fetch JWKS when issuer changes (debounced)
  useEffect(() => {
    const slug = extractIssuerSlug(issuer);
    if (!slug) {
      setDirectoryStatus({ state: 'idle' });
      return;
    }

    setDirectoryStatus({ state: 'loading' });
    const timeout = setTimeout(async () => {
      try {
        const keys = await fetchIssuerJwks(issuer);
        const kidMatch = keyPair
          ? keys.some((k) => k.kid === keyPair.kid)
          : false;
        setDirectoryStatus({ state: 'found', keys, kidMatch });
      } catch (e) {
        setDirectoryStatus({
          state: 'not-found',
          error: e instanceof Error ? e.message : 'Failed to fetch',
        });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [issuer, keyPair?.kid]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const pair = await generateKeyPair();
      onKeyPairChange(pair);
    } finally {
      setGenerating(false);
    }
  }

  async function handleImportFromText() {
    setImportError(null);
    try {
      const jwk = JSON.parse(importText) as JWK;
      if (!jwk.kty || !jwk.d) {
        throw new Error('Not a valid private key JWK (missing kty or d)');
      }
      await importPrivateKey(jwk);
      const publicKey: JWK = { ...jwk };
      delete publicKey.d;
      const kid = await computeKid(publicKey);
      onKeyPairChange({
        privateKey: { ...jwk, kid },
        publicKey: { ...publicKey, kid },
        kid,
      });
      setImporting(false);
      setImportText('');
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Invalid JWK');
    }
  }

  // Pull a key from the directory JWKS (public only — user still needs private key)
  const directoryKeys =
    directoryStatus.state === 'found' ? directoryStatus.keys : [];

  const publicKeyJson = keyPair
    ? JSON.stringify(keyPair.publicKey, null, 2)
    : '';

  return (
    <Stack gap="md">
      <TextInput
        label="Issuer Identifier"
        description="Your BIND Directory slug or URL (e.g. https://bindpki.org/my-org)"
        placeholder="https://bindpki.org/my-org"
        value={issuer}
        onChange={(e) => onIssuerChange(e.currentTarget.value)}
      />

      {/* Directory lookup status */}
      {directoryStatus.state === 'loading' && (
        <Group gap="xs">
          <Loader size={14} />
          <Text size="xs" c="dimmed">
            Looking up issuer in BIND Directory...
          </Text>
        </Group>
      )}

      {directoryStatus.state === 'not-found' && (
        <Alert
          color="yellow"
          icon={<IconShieldOff size={16} />}
          py="xs"
        >
          <Text size="sm">
            {directoryStatus.error}. Exchange will be classified as{' '}
            <Text span fw={600}>untrusted</Text> (10KB max, 1h expiry).
          </Text>
        </Alert>
      )}

      {directoryStatus.state === 'found' && (
        <Alert
          color={directoryStatus.kidMatch ? 'green' : 'yellow'}
          icon={
            directoryStatus.kidMatch ? (
              <IconShieldCheck size={16} />
            ) : (
              <IconShieldOff size={16} />
            )
          }
          py="xs"
        >
          <Text size="sm">
            {directoryStatus.kidMatch ? (
              <>
                Issuer found in directory — your key{' '}
                <Text span fw={600}>matches</Text> a registered public key.
                Exchange will be <Text span fw={600}>trusted</Text>.
              </>
            ) : keyPair ? (
              <>
                Issuer found ({directoryKeys.length} key
                {directoryKeys.length !== 1 ? 's' : ''} registered) but your
                current key does <Text span fw={600}>not match</Text>. Exchange
                will be untrusted.
              </>
            ) : (
              <>
                Issuer found with {directoryKeys.length} registered key
                {directoryKeys.length !== 1 ? 's' : ''}. Load your private
                key below.
              </>
            )}
          </Text>
        </Alert>
      )}

      <Group gap="sm">
        <Button
          leftSection={<IconKey size={16} />}
          onClick={handleGenerate}
          loading={generating}
        >
          Generate Key Pair
        </Button>
        <Button
          variant="light"
          onClick={() => setImporting(!importing)}
        >
          {importing ? 'Cancel' : 'Import Private Key'}
        </Button>
      </Group>

      {importing && (
        <Stack gap="xs">
          <Textarea
            label="JWK Private Key"
            placeholder='{"kty":"EC","crv":"P-256","d":"...","x":"...","y":"..."}'
            autosize
            minRows={3}
            maxRows={8}
            value={importText}
            onChange={(e) => setImportText(e.currentTarget.value)}
          />
          {importError && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {importError}
            </Alert>
          )}
          <Button size="xs" onClick={handleImportFromText} disabled={!importText.trim()}>
            Import
          </Button>
        </Stack>
      )}

      {keyPair && (
        <Stack gap="sm">
          <Group gap="xs">
            <Badge variant="light" color="green">
              Key Pair Loaded
            </Badge>
            <Text size="xs" c="dimmed" ff="monospace">
              kid: {keyPair.kid}
            </Text>
          </Group>

          <Card padding="sm" withBorder>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                Public Key JWK
              </Text>
              <CopyButton value={publicKeyJson}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied' : 'Copy'}>
                    <ActionIcon
                      variant="subtle"
                      color={copied ? 'teal' : 'gray'}
                      onClick={copy}
                    >
                      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Text
              size="xs"
              ff="monospace"
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              {publicKeyJson}
            </Text>
          </Card>
        </Stack>
      )}
    </Stack>
  );
}
