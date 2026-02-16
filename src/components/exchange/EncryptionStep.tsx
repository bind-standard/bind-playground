import { useEffect, useState } from 'react';
import {
  Stack,
  Text,
  Card,
  Group,
  Badge,
  TextInput,
  NumberInput,
  Alert,
} from '@mantine/core';
import { IconAlertCircle, IconLock } from '@tabler/icons-react';
import { encryptJws, createProofJwt } from '@/lib/exchange/crypto';
import type { StoredKeyPair } from '@/lib/exchange/keys';

interface EncryptionStepProps {
  jws: string | null;
  keyPair: StoredKeyPair | null;
  issuer: string;
  jwe: string | null;
  proof: string | null;
  label: string;
  passcode: string;
  expiryHours: string | number;
  onEncrypted: (jwe: string, key: Uint8Array, proof: string) => void;
  onLabelChange: (label: string) => void;
  onPasscodeChange: (passcode: string) => void;
  onExpiryHoursChange: (hours: string | number) => void;
}

export function EncryptionStep({
  jws,
  keyPair,
  issuer,
  jwe,
  proof,
  label,
  passcode,
  expiryHours,
  onEncrypted,
  onLabelChange,
  onPasscodeChange,
  onExpiryHoursChange,
}: EncryptionStepProps) {
  const [error, setError] = useState<string | null>(null);
  const [encrypting, setEncrypting] = useState(false);

  useEffect(() => {
    if (jws && keyPair && issuer && !jwe && !encrypting) {
      setEncrypting(true);
      setError(null);
      (async () => {
        try {
          const { jwe: encrypted, key } = await encryptJws(jws);
          const proofJwt = await createProofJwt(
            encrypted,
            keyPair.privateKey,
            keyPair.kid,
            issuer,
          );
          onEncrypted(encrypted, key, proofJwt);
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Encryption failed');
        } finally {
          setEncrypting(false);
        }
      })();
    }
  }, [jws, keyPair, issuer, jwe, encrypting, onEncrypted]);

  return (
    <Stack gap="md">
      {encrypting && (
        <Group gap="xs">
          <IconLock size={16} />
          <Text size="sm">Encrypting...</Text>
        </Group>
      )}

      {error && (
        <Alert color="red" icon={<IconAlertCircle size={16} />}>
          {error}
        </Alert>
      )}

      {jwe && (
        <Stack gap="sm">
          <Group gap="xs">
            <Badge variant="light" color="green">
              Encrypted
            </Badge>
            {proof && (
              <Badge variant="light" color="blue">
                Proof Created
              </Badge>
            )}
          </Group>

          <Card padding="sm" withBorder>
            <Text size="sm" fw={500} mb="xs">
              JWE Preview
            </Text>
            <Text
              size="xs"
              ff="monospace"
              c="dimmed"
              lineClamp={2}
              style={{ wordBreak: 'break-all' }}
            >
              {jwe}
            </Text>
          </Card>
        </Stack>
      )}

      <TextInput
        label="Label"
        description="Optional human-readable label for the exchange"
        placeholder="Q1 2026 Submission Package"
        value={label}
        onChange={(e) => onLabelChange(e.currentTarget.value)}
      />

      <TextInput
        label="Passcode"
        description="4-16 characters. Leave blank for no passcode protection."
        placeholder="No passcode if empty"
        value={passcode}
        onChange={(e) => onPasscodeChange(e.currentTarget.value)}
        maxLength={16}
      />

      <NumberInput
        label="Expiry (hours)"
        description="How long the exchange should remain available. Untrusted exchanges are capped at 1 hour."
        placeholder="Default based on trust tier"
        value={expiryHours}
        onChange={onExpiryHoursChange}
        min={1}
        max={8760}
      />
    </Stack>
  );
}
