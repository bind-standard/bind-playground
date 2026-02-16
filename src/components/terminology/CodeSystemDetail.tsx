import {
  Badge,
  Text,
  Stack,
  Loader,
  Alert,
  Group,
  Title,
  Card,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useCodeSystem } from '@/lib/terminology/hooks';
import { ConceptTable } from './ConceptTable';

export function CodeSystemDetail({ systemId }: { systemId: string }) {
  const { data, isLoading, error } = useCodeSystem(systemId);

  if (isLoading) return <Loader />;
  if (error)
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
        Failed to load code system: {(error as Error).message}
      </Alert>
    );
  if (!data) return <Text>Code system not found.</Text>;

  return (
    <Stack gap="md">
      <Group>
        <Title order={2}>{data.title || data.name}</Title>
        <Badge
          variant="light"
          color={data.status === 'active' ? 'green' : 'gray'}
        >
          {data.status}
        </Badge>
      </Group>

      {data.description && (
        <Text size="sm" c="dimmed">
          {data.description}
        </Text>
      )}

      <Card padding="sm">
        <Group gap="xl">
          <div>
            <Text size="xs" c="dimmed">ID</Text>
            <Text size="sm" fw={500}>{data.id}</Text>
          </div>
          {data.url && (
            <div>
              <Text size="xs" c="dimmed">URL</Text>
              <Text size="sm" fw={500}>{data.url}</Text>
            </div>
          )}
          <div>
            <Text size="xs" c="dimmed">Concepts</Text>
            <Text size="sm" fw={500}>{data.concept?.length ?? 0}</Text>
          </div>
        </Group>
      </Card>

      {data.concept && data.concept.length > 0 && (
        <ConceptTable concepts={data.concept} />
      )}
    </Stack>
  );
}
