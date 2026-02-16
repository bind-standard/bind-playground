import { createFileRoute } from '@tanstack/react-router';
import { Title, Stack, Text, Container } from '@mantine/core';
import { CodeSystemList } from '@/components/terminology/CodeSystemList';

export const Route = createFileRoute('/terminology/')({
  component: TerminologyPage,
});

function TerminologyPage() {
  return (
    <Container size="lg">
      <Stack gap="lg">
        <div>
          <Title order={2} mb="xs">Terminology Browser</Title>
          <Text size="sm" c="dimmed">
            Browse 280+ insurance code systems from the BIND terminology server at
            bind.codes.
          </Text>
        </div>
        <CodeSystemList />
      </Stack>
    </Container>
  );
}
