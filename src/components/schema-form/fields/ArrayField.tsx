import { Stack, Group, Button, Text, Paper, ActionIcon } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface ArrayFieldProps {
  label: string;
  description?: string;
  items: unknown[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  renderItem: (index: number) => ReactNode;
}

export function ArrayField({
  label,
  description,
  items,
  onAdd,
  onRemove,
  renderItem,
}: ArrayFieldProps) {
  return (
    <Stack gap="sm">
      <Group justify="space-between">
        <div>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
        </div>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconPlus size={14} />}
          onClick={onAdd}
        >
          Add
        </Button>
      </Group>
      {items.map((_, index) => (
        <Paper key={index} withBorder p="sm">
          <Group justify="space-between" mb="xs">
            <Text size="xs" c="dimmed">
              {label} #{index + 1}
            </Text>
            <ActionIcon
              size="sm"
              variant="subtle"
              color="red"
              onClick={() => onRemove(index)}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
          {renderItem(index)}
        </Paper>
      ))}
      {items.length === 0 && (
        <Text size="sm" c="dimmed" fs="italic">
          No items. Click "Add" to create one.
        </Text>
      )}
    </Stack>
  );
}
