import { useState, useMemo } from 'react';
import { TextInput, Table, Text, Stack, Code } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

interface Concept {
  code: string;
  display?: string;
  definition?: string;
  designation?: { language?: string; value: string }[];
}

export function ConceptTable({ concepts }: { concepts: Concept[] }) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!filter) return concepts;
    const q = filter.toLowerCase();
    return concepts.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.display?.toLowerCase().includes(q) ||
        c.definition?.toLowerCase().includes(q)
    );
  }, [concepts, filter]);

  return (
    <Stack gap="sm">
      <TextInput
        placeholder="Search concepts..."
        leftSection={<IconSearch size={16} />}
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
        size="sm"
      />
      <Text size="xs" c="dimmed">
        {filtered.length} of {concepts.length} concepts
      </Text>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Code</Table.Th>
            <Table.Th>Display</Table.Th>
            <Table.Th>Definition</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filtered.map((c) => (
            <Table.Tr key={c.code}>
              <Table.Td>
                <Code>{c.code}</Code>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{c.display}</Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed" lineClamp={2}>
                  {c.definition}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
