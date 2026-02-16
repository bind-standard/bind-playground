import { Group, Badge, Text, Card } from '@mantine/core';
import { useBundle } from '@/lib/bundle/BundleProvider';
import { getResourceSummary } from '@/lib/bundle/utils';

export function BundleStats() {
  const { bundle } = useBundle();
  const summary = getResourceSummary(bundle);
  const total = bundle.entry.length;

  return (
    <Card padding="sm">
      <Group gap="md">
        <Text size="sm" fw={500}>
          {total} {total === 1 ? 'entry' : 'entries'}
        </Text>
        {Object.entries(summary).map(([type, count]) => (
          <Badge key={type} variant="light">
            {type}: {count}
          </Badge>
        ))}
        {total === 0 && (
          <Text size="sm" c="dimmed">
            Bundle is empty
          </Text>
        )}
      </Group>
    </Card>
  );
}
