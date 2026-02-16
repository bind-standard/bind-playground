import { Switch } from '@mantine/core';

interface BooleanFieldProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function BooleanField({
  label,
  description,
  value,
  onChange,
}: BooleanFieldProps) {
  return (
    <Switch
      label={label}
      description={description}
      checked={value || false}
      onChange={(e) => onChange(e.currentTarget.checked)}
    />
  );
}
