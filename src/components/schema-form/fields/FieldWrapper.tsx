import { Stack, Text, Badge, Group, Tooltip } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import type { ReactNode } from 'react';

interface FieldWrapperProps {
  label: string;
  description?: string;
  required?: boolean;
  example?: string;
  children: ReactNode;
}

export function FieldWrapper({
  label,
  description,
  required,
  example,
  children,
}: FieldWrapperProps) {
  return (
    <Stack gap={4}>
      <Group gap={4}>
        <Text size="sm" fw={500}>
          {label}
          {required && (
            <Text component="span" c="red" ml={2}>
              *
            </Text>
          )}
        </Text>
        {description && (
          <Tooltip label={description} multiline w={300} withArrow>
            <IconInfoCircle size={14} style={{ opacity: 0.5, cursor: 'help' }} />
          </Tooltip>
        )}
        {example && (
          <Badge size="xs" variant="outline" color="gray">
            e.g. {example}
          </Badge>
        )}
      </Group>
      {children}
    </Stack>
  );
}
