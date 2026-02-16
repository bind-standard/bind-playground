import { useState, useMemo } from 'react';
import {
  TextInput,
  Table,
  Badge,
  Text,
  Stack,
  Loader,
  Alert,
} from '@mantine/core';
import { IconSearch, IconAlertCircle } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { useCodeSystemList } from '@/lib/terminology/hooks';

export function CodeSystemList() {
  const { data, isLoading, error } = useCodeSystemList();
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!data) return [];
    if (!filter) return data;
    const q = filter.toLowerCase();
    return data.filter(
      (cs) =>
        cs.id?.toLowerCase().includes(q) ||
        cs.title?.toLowerCase().includes(q) ||
        cs.name?.toLowerCase().includes(q)
    );
  }, [data, filter]);

  if (isLoading) return <Loader />;
  if (error)
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
        Failed to load code systems: {(error as Error).message}
      </Alert>
    );

  return (
    <Stack gap="md">
      <TextInput
        placeholder="Filter code systems..."
        leftSection={<IconSearch size={16} />}
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />
      <Text size="sm" c="dimmed">
        {filtered.length} of {data?.length ?? 0} code systems
      </Text>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Title</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filtered.map((cs) => (
            <Table.Tr
              key={cs.id}
              style={{ cursor: 'pointer' }}
            >
              <Table.Td>
                <Link
                  to="/terminology/$systemId"
                  params={{ systemId: cs.id! }}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Text size="sm" fw={500} c="indigo">
                    {cs.id}
                  </Text>
                </Link>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{cs.title || cs.name}</Text>
              </Table.Td>
              <Table.Td>
                <Badge
                  size="sm"
                  variant="light"
                  color={cs.status === 'active' ? 'green' : 'gray'}
                >
                  {cs.status}
                </Badge>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
