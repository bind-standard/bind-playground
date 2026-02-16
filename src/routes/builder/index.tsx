import { createFileRoute } from '@tanstack/react-router';
import { Title, Stack, Text, Container } from '@mantine/core';
import { ResourceTypeSelector } from '@/components/builder/ResourceTypeSelector';

export const Route = createFileRoute('/builder/')({
  component: BuilderPage,
});

function BuilderPage() {
  return (
    <Container size="lg">
      <Stack gap="lg">
        <div>
          <Title order={2}>Resource Builder</Title>
          <Text size="sm" c="dimmed">
            Forms are auto-generated from the BIND standard JSON schemas.
            Select a resource type to get started, or use the + button in the sidebar.
          </Text>
        </div>

        <ResourceTypeSelector />
      </Stack>
    </Container>
  );
}
