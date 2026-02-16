import { useState } from 'react';
import { Group, TextInput, Button, Text, Paper, Code } from '@mantine/core';
import { IconBook } from '@tabler/icons-react';
import { TerminologyPicker } from '@/components/terminology/TerminologyPicker';

interface CodingValue {
  system?: string;
  code?: string;
  display?: string;
}

interface CodingFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: CodingValue;
  onChange: (value: CodingValue) => void;
  systemFilter?: string;
}

export function CodingField({
  label,
  description,
  required,
  value,
  onChange,
  systemFilter,
}: CodingFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const hasValue = value?.code;

  return (
    <>
      <Paper withBorder p="sm">
        <Group justify="space-between" mb="xs">
          <div>
            <Text size="sm" fw={500}>
              {label}
              {required && (
                <Text component="span" c="red" ml={2}>
                  *
                </Text>
              )}
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
            leftSection={<IconBook size={14} />}
            onClick={() => setPickerOpen(true)}
          >
            Browse
          </Button>
        </Group>
        {hasValue ? (
          <Group gap="xs">
            <Code>{value.code}</Code>
            {value.display && (
              <Text size="sm" c="dimmed">
                {value.display}
              </Text>
            )}
            {value.system && (
              <Text size="xs" c="dimmed">
                ({value.system})
              </Text>
            )}
          </Group>
        ) : (
          <Group gap="xs" grow>
            <TextInput
              size="xs"
              placeholder="system"
              value={value?.system || ''}
              onChange={(e) =>
                onChange({ ...value, system: e.currentTarget.value })
              }
            />
            <TextInput
              size="xs"
              placeholder="code"
              value={value?.code || ''}
              onChange={(e) =>
                onChange({ ...value, code: e.currentTarget.value })
              }
            />
            <TextInput
              size="xs"
              placeholder="display"
              value={value?.display || ''}
              onChange={(e) =>
                onChange({ ...value, display: e.currentTarget.value })
              }
            />
          </Group>
        )}
      </Paper>
      <TerminologyPicker
        opened={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(coding) =>
          onChange({
            system: coding.system,
            code: coding.code,
            display: coding.display,
          })
        }
        systemFilter={systemFilter}
      />
    </>
  );
}
