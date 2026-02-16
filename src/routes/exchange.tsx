import { createFileRoute } from '@tanstack/react-router';
import { Title, Stack, Text, Container } from '@mantine/core';
import { ExchangeStepper } from '@/components/exchange/ExchangeStepper';

export const Route = createFileRoute('/exchange')({
  component: ExchangePage,
});

function ExchangePage() {
  return (
    <Container size="lg">
      <Stack gap="lg">
        <div>
          <Title order={2} mb="xs">
            Exchange
          </Title>
          <Text size="sm" c="dimmed">
            Sign your bundle, encrypt it, and send it via the BIND Exchange.
            All crypto operations happen in your browser.
          </Text>
        </div>

        <ExchangeStepper />
      </Stack>
    </Container>
  );
}
