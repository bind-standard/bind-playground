import { Accordion, Text } from '@mantine/core';
import type { ReactNode } from 'react';

interface ObjectFieldProps {
  label: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function ObjectField({
  label,
  description,
  children,
  defaultOpen,
}: ObjectFieldProps) {
  return (
    <Accordion
      variant="contained"
      defaultValue={defaultOpen ? label : undefined}
    >
      <Accordion.Item value={label}>
        <Accordion.Control>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
        </Accordion.Control>
        <Accordion.Panel>{children}</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
