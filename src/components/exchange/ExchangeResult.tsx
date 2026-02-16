import { useState } from 'react';
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
  Divider,
  Box,
} from '@mantine/core';
import { IconSend, IconCopy, IconCheck, IconAlertCircle, IconLockOpen } from '@tabler/icons-react';
import { QRCodeSVG } from 'qrcode.react';
import dayjs from 'dayjs';
import { createExchange, type ExchangeResponse } from '@/lib/exchange/client';
import { buildBindxLink } from '@/lib/exchange/crypto';

interface ExchangeResultProps {
  jwe: string | null;
  aesKey: Uint8Array | null;
  proof: string | null;
  label: string;
  passcode: string;
  expiryHours: string | number;
  exchangeResult: ExchangeResponse | null;
  onResult: (result: ExchangeResponse, bindxLink: string) => void;
}

export function ExchangeResult({
  jwe,
  aesKey,
  proof,
  label,
  passcode,
  expiryHours,
  exchangeResult,
  onResult,
}: ExchangeResultProps) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bindxLink, setBindxLink] = useState<string | null>(null);

  async function handleSend() {
    if (!jwe || !aesKey) return;
    setSending(true);
    setError(null);
    try {
      const request: Parameters<typeof createExchange>[0] = {
        payload: jwe,
      };
      if (proof) request.proof = proof;
      if (passcode) request.passcode = passcode;
      if (label) request.label = label;
      if (typeof expiryHours === 'number' && expiryHours > 0) {
        request.exp = expiryHours * 3600;
      }

      const result = await createExchange(request);
      const link = buildBindxLink(
        result.url,
        aesKey,
        result.exp,
        result.flag,
        label || undefined,
      );
      setBindxLink(link);
      onResult(result, link);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Exchange failed');
    } finally {
      setSending(false);
    }
  }

  const recipientInfo = exchangeResult
    ? [
        bindxLink ? `Link: ${bindxLink}` : null,
        exchangeResult.passcode ? `Passcode: ${exchangeResult.passcode}` : null,
        `Expires: ${dayjs(exchangeResult.exp).format('MMM D, YYYY h:mm A')}`,
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  return (
    <Stack gap="md">
      <Button
        leftSection={<IconSend size={16} />}
        onClick={handleSend}
        loading={sending}
        disabled={!jwe || !aesKey}
      >
        Send to Exchange
      </Button>

      {error && (
        <Alert color="red" icon={<IconAlertCircle size={16} />}>
          {error}
        </Alert>
      )}

      {exchangeResult && bindxLink && (
        <Card padding="lg" withBorder>
          <Stack gap="lg">
            <Group justify="space-between">
              <Text fw={600} size="lg">
                Share with Recipient
              </Text>
              <Badge
                variant="light"
                color={exchangeResult.trusted ? 'green' : 'yellow'}
                size="lg"
              >
                {exchangeResult.trusted ? 'Trusted' : 'Untrusted'}
              </Badge>
            </Group>

            {/* No passcode alert */}
            {!exchangeResult.passcode && (
              <Alert color="green" icon={<IconLockOpen size={16} />}>
                No passcode required — recipient can access directly via the link.
              </Alert>
            )}

            {/* QR Code */}
            <Box
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 16,
                backgroundColor: 'white',
                borderRadius: 'var(--mantine-radius-md)',
                border: '1px solid var(--mantine-color-gray-2)',
              }}
            >
              <QRCodeSVG value={bindxLink} size={200} level="M" />
            </Box>
            <Text size="xs" c="dimmed" ta="center">
              Scan to open in BIND Wallet
            </Text>

            <Divider />

            {/* Passcode */}
            {exchangeResult.passcode && (
              <Card padding="md" bg="var(--mantine-color-indigo-0)">
                <Group justify="space-between">
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
                      Passcode
                    </Text>
                    <Text size="xl" fw={700} ff="monospace">
                      {exchangeResult.passcode}
                    </Text>
                  </div>
                  <CopyButton value={exchangeResult.passcode}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copied' : 'Copy'}>
                        <ActionIcon
                          variant="subtle"
                          color={copied ? 'teal' : 'gray'}
                          onClick={copy}
                          size="lg"
                        >
                          {copied ? (
                            <IconCheck size={18} />
                          ) : (
                            <IconCopy size={18} />
                          )}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Card>
            )}

            {/* bindx link */}
            <div>
              <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb={4}>
                Link
              </Text>
              <Group gap="xs" wrap="nowrap" align="flex-start">
                <Text
                  size="sm"
                  ff="monospace"
                  style={{ wordBreak: 'break-all', flex: 1 }}
                >
                  {bindxLink}
                </Text>
                <CopyButton value={bindxLink}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied' : 'Copy'}>
                      <ActionIcon
                        variant="subtle"
                        color={copied ? 'teal' : 'gray'}
                        onClick={copy}
                        size="sm"
                        style={{ flexShrink: 0 }}
                      >
                        {copied ? (
                          <IconCheck size={14} />
                        ) : (
                          <IconCopy size={14} />
                        )}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
            </div>

            {/* Expiry */}
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                Expires:
              </Text>
              <Text size="sm">
                {dayjs(exchangeResult.exp).format('MMM D, YYYY h:mm A')}
              </Text>
            </Group>

            <Divider />

            {/* Copy all for sharing */}
            <CopyButton value={recipientInfo}>
              {({ copied, copy }) => (
                <Button
                  variant="light"
                  color={copied ? 'teal' : 'gray'}
                  onClick={copy}
                  leftSection={
                    copied ? <IconCheck size={14} /> : <IconCopy size={14} />
                  }
                >
                  {copied ? 'Copied' : 'Copy All'}
                </Button>
              )}
            </CopyButton>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
