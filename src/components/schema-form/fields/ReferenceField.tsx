import { Select, TextInput, Stack, Group } from '@mantine/core';
import { useBundle } from '@/lib/bundle/BundleProvider';
import { buildReference, getEntryFullUrl } from '@/lib/bundle/utils';

interface ReferenceValue {
  reference?: string;
  type?: string;
  display?: string;
}

interface ReferenceFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  value: ReferenceValue;
  onChange: (value: ReferenceValue) => void;
  error?: string;
}

export function ReferenceField({
  label,
  description,
  required,
  value,
  onChange,
  error,
}: ReferenceFieldProps) {
  const { bundle } = useBundle();

  const options = bundle.entry
    .filter((entry) => entry.resource)
    .map((entry) => {
      const ref = buildReference(entry.resource);
      const fullUrl = getEntryFullUrl(entry);
      return {
        value: fullUrl,
        label: `${fullUrl} — ${ref.display}`,
      };
    });

  return (
    <Stack gap={4}>
      <Select
        label={label}
        description={description}
        required={required}
        value={value?.reference || null}
        onChange={(v) => {
          if (v) {
            const entry = bundle.entry.find(
              (e) => getEntryFullUrl(e) === v
            );
            if (entry) {
              const ref = buildReference(entry.resource);
              onChange({
                reference: ref.reference,
                display: ref.display,
              });
              return;
            }
          }
          onChange({ reference: v || '', display: '' });
        }}
        error={error}
        data={options}
        clearable
        searchable
        placeholder="Select a resource from bundle..."
      />
      <Group gap="xs" grow>
        <TextInput
          size="xs"
          placeholder="Or enter reference manually..."
          value={value?.reference || ''}
          onChange={(e) =>
            onChange({ ...value, reference: e.currentTarget.value })
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
    </Stack>
  );
}
