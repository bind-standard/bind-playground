import { Group, TextInput } from '@mantine/core';

interface PeriodValue {
  start?: string;
  end?: string;
}

interface PeriodFieldProps {
  label: string;
  description?: string;
  value: PeriodValue;
  onChange: (value: PeriodValue) => void;
}

export function PeriodField({
  label,
  description,
  value,
  onChange,
}: PeriodFieldProps) {
  return (
    <Group gap="xs" grow>
      <TextInput
        label={`${label} — Start`}
        description={description}
        type="date"
        value={value?.start || ''}
        onChange={(e) =>
          onChange({ ...value, start: e.currentTarget.value })
        }
      />
      <TextInput
        label={`${label} — End`}
        type="date"
        value={value?.end || ''}
        onChange={(e) =>
          onChange({ ...value, end: e.currentTarget.value })
        }
      />
    </Group>
  );
}
