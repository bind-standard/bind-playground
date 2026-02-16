import { Group, NumberInput, Select } from '@mantine/core';

interface MoneyValue {
  value?: number;
  currency?: string;
}

interface MoneyFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: MoneyValue;
  onChange: (value: MoneyValue) => void;
  error?: string;
}

const CURRENCIES = [
  { value: 'USD', label: 'USD' },
  { value: 'CAD', label: 'CAD' },
  { value: 'GBP', label: 'GBP' },
  { value: 'EUR', label: 'EUR' },
];

export function MoneyField({
  label,
  description,
  required,
  value,
  onChange,
  error,
}: MoneyFieldProps) {
  return (
    <Group gap="xs" grow>
      <NumberInput
        label={label}
        description={description}
        required={required}
        value={value?.value ?? ''}
        onChange={(v) =>
          onChange({
            ...value,
            value: v === '' ? undefined : (v as number),
            currency: value?.currency || 'USD',
          })
        }
        error={error}
        thousandSeparator=","
        decimalScale={2}
        prefix="$"
      />
      <Select
        label="Currency"
        value={value?.currency || 'USD'}
        onChange={(v) => onChange({ ...value, currency: v || 'USD' })}
        data={CURRENCIES}
        w={100}
        style={{ flexGrow: 0 }}
      />
    </Group>
  );
}
