import { createFileRoute } from '@tanstack/react-router';
import { Title, Stack, Text, Container, Group, Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { BundleViewer } from '@/components/bundle/BundleViewer';
import { BundleExporter } from '@/components/bundle/BundleExporter';
import { BundleStats } from '@/components/bundle/BundleStats';
import { useBundle } from '@/lib/bundle/BundleProvider';

export const Route = createFileRoute('/bundle')({
  component: BundlePage,
});

function BundlePage() {
  const { bundle, dispatch } = useBundle();

  return (
    <Container size="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2} mb="xs">Bundle</Title>
            <Text size="sm" c="dimmed">
              Your assembled BIND Bundle as JSON. Copy or download to use.
            </Text>
          </div>
          {bundle.entry.length > 0 && (
            <Button
              variant="subtle"
              color="red"
              size="xs"
              leftSection={<IconTrash size={14} />}
              onClick={() => dispatch({ type: 'CLEAR' })}
            >
              Clear Bundle
            </Button>
          )}
        </Group>

        <BundleStats />
        <BundleExporter />
        <BundleViewer />
      </Stack>
    </Container>
  );
}
