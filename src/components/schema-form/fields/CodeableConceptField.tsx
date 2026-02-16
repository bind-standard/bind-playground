import { Stack, TextInput, Text, Paper, Group, Button, ActionIcon } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { CodingField } from './CodingField';

interface CodingValue {
  system?: string;
  code?: string;
  display?: string;
}

interface CodeableConceptValue {
  coding?: CodingValue[];
  text?: string;
}

interface CodeableConceptFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: CodeableConceptValue;
  onChange: (value: CodeableConceptValue) => void;
  systemFilter?: string;
}

export function CodeableConceptField({
  label,
  description,
  required,
  value,
  onChange,
  systemFilter,
}: CodeableConceptFieldProps) {
  const codings = value?.coding || [];

  return (
    <Paper withBorder p="sm">
      <Stack gap="sm">
        <Group justify="space-between">
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
            leftSection={<IconPlus size={14} />}
            onClick={() =>
              onChange({
                ...value,
                coding: [...codings, { system: '', code: '', display: '' }],
              })
            }
          >
            Add Coding
          </Button>
        </Group>
        {codings.map((coding, i) => (
          <Group key={i} gap="xs" align="flex-start">
            <div style={{ flex: 1 }}>
              <CodingField
                label={`Coding #${i + 1}`}
                value={coding}
                onChange={(newCoding) => {
                  const updated = [...codings];
                  updated[i] = newCoding;
                  onChange({ ...value, coding: updated });
                }}
                systemFilter={systemFilter}
              />
            </div>
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              mt="xl"
              onClick={() => {
                const updated = codings.filter((_, idx) => idx !== i);
                onChange({ ...value, coding: updated });
              }}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        ))}
        <TextInput
          label="Text"
          description="Plain text representation"
          size="sm"
          value={value?.text || ''}
          onChange={(e) =>
            onChange({ ...value, text: e.currentTarget.value })
          }
        />
      </Stack>
    </Paper>
  );
}
