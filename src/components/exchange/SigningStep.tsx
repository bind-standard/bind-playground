import { useState, useMemo } from 'react';
import {
  Stack,
  Button,
  Text,
  Card,
  Group,
  Badge,
  CopyButton,
  ActionIcon,
  Tooltip,
  Alert,
  SegmentedControl,
  Textarea,
  List,
} from '@mantine/core';
import { IconSignature, IconCopy, IconCheck, IconAlertCircle, IconAlertTriangle } from '@tabler/icons-react';
import { BundleStats } from '@/components/bundle/BundleStats';
import { useBundle } from '@/lib/bundle/BundleProvider';
import { getResourceSummary } from '@/lib/bundle/utils';
import { signBundle } from '@/lib/exchange/crypto';
import { validateBundle } from '@/lib/exchange/validate';
import type { StoredKeyPair } from '@/lib/exchange/keys';
import type { Bundle } from '@/lib/bundle/types';

interface SigningStepProps {
  keyPair: StoredKeyPair | null;
  issuer: string;
  jws: string | null;
  onSign: (jws: string) => void;
}

export function SigningStep({ keyPair, issuer, jws, onSign }: SigningStepProps) {
  const { bundle: playgroundBundle } = useBundle();
  const [source, setSource] = useState<'playground' | 'paste'>('playground');
  const [pasteText, setPasteText] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function parsePastedBundle(): Record<string, unknown> | null {
    setPasteError(null);
    try {
      const parsed = JSON.parse(pasteText);
      if (typeof parsed !== 'object' || parsed === null) {
        setPasteError('Input must be a JSON object');
        return null;
      }
      return parsed as Record<string, unknown>;
    } catch {
      setPasteError('Invalid JSON');
      return null;
    }
  }

  const pastedBundle = pasteText.trim()
    ? (() => {
        try {
          const p = JSON.parse(pasteText);
          return typeof p === 'object' && p !== null ? (p as Bundle) : null;
        } catch {
          return null;
        }
      })()
    : null;

  const pastedSummary = pastedBundle ? getResourceSummary(pastedBundle) : null;
  const pastedTotal = pastedBundle?.entry?.length ?? 0;

  const isPlayground = source === 'playground';
  const playgroundEmpty = playgroundBundle.entry.length === 0;
  const pasteEmpty = !pasteText.trim();

  // Validation warnings
  const validationWarnings = useMemo(() => {
    if (isPlayground) {
      if (playgroundEmpty) return [];
      return validateBundle(playgroundBundle as unknown as Record<string, unknown>);
    }
    if (pastedBundle) {
      return validateBundle(pastedBundle as unknown as Record<string, unknown>);
    }
    return [];
  }, [isPlayground, playgroundBundle, pastedBundle, playgroundEmpty]);

  const canSign =
    !!keyPair &&
    !!issuer &&
    (isPlayground ? !playgroundEmpty : !pasteEmpty);

  async function handleSign() {
    if (!keyPair || !issuer) return;
    setSigning(true);
    setError(null);
    setPasteError(null);
    try {
      let payload: Record<string, unknown>;
      if (isPlayground) {
        payload = playgroundBundle as unknown as Record<string, unknown>;
      } else {
        const parsed = parsePastedBundle();
        if (!parsed) {
          setSigning(false);
          return;
        }
        payload = parsed;
      }

      const result = await signBundle(payload, keyPair.privateKey, keyPair.kid, issuer);
      onSign(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signing failed');
    } finally {
      setSigning(false);
    }
  }

  return (
    <Stack gap="md">
      <SegmentedControl
        value={source}
        onChange={(v) => setSource(v as 'playground' | 'paste')}
        data={[
          { label: 'Playground Bundle', value: 'playground' },
          { label: 'Paste JSON', value: 'paste' },
        ]}
      />

      {isPlayground ? (
        <>
          <BundleStats />
          {playgroundEmpty && (
            <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
              Your bundle is empty. Add resources in the Builder, or switch to
              Paste JSON.
            </Alert>
          )}
        </>
      ) : (
        <>
          <Textarea
            placeholder='{"resourceType":"Bundle","type":"collection","entry":[...]}'
            autosize
            minRows={4}
            maxRows={12}
            value={pasteText}
            onChange={(e) => setPasteText(e.currentTarget.value)}
          />
          {pasteError && (
            <Alert color="red" icon={<IconAlertCircle size={16} />} py="xs">
              {pasteError}
            </Alert>
          )}
          {pastedBundle && (
            <Card padding="sm">
              <Group gap="md">
                <Text size="sm" fw={500}>
                  {pastedTotal} {pastedTotal === 1 ? 'entry' : 'entries'}
                </Text>
                {pastedSummary &&
                  Object.entries(pastedSummary).map(([type, count]) => (
                    <Badge key={type} variant="light">
                      {type}: {count}
                    </Badge>
                  ))}
              </Group>
            </Card>
          )}
        </>
      )}

      {/* Validation warnings */}
      {validationWarnings.length > 0 && (
        <Alert
          color="yellow"
          icon={<IconAlertTriangle size={16} />}
          title={`${validationWarnings.length} validation warning${validationWarnings.length > 1 ? 's' : ''}`}
        >
          <List size="sm" spacing={4}>
            {validationWarnings.map((w, i) => (
              <List.Item key={i}>
                <Text size="sm">
                  <Text span ff="monospace" size="xs" c="yellow.8">
                    {w.path}
                  </Text>{' '}
                  {w.message}
                </Text>
              </List.Item>
            ))}
          </List>
        </Alert>
      )}

      <Button
        leftSection={<IconSignature size={16} />}
        onClick={handleSign}
        loading={signing}
        disabled={!canSign}
      >
        Sign Bundle
      </Button>

      {error && (
        <Alert color="red" icon={<IconAlertCircle size={16} />}>
          {error}
        </Alert>
      )}

      {jws && (
        <Card padding="sm" withBorder>
          <Group justify="space-between" mb="xs">
            <Group gap="xs">
              <Text size="sm" fw={500}>
                JWS
              </Text>
              <Badge variant="light" color="green" size="sm">
                Signed
              </Badge>
            </Group>
            <CopyButton value={jws}>
              {({ copied, copy }) => (
                <Tooltip label={copied ? 'Copied' : 'Copy JWS'}>
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
            c="dimmed"
            lineClamp={3}
            style={{ wordBreak: 'break-all' }}
          >
            {jws}
          </Text>
        </Card>
      )}
    </Stack>
  );
}
