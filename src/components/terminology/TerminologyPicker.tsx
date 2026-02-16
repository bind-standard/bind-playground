import { useState } from 'react';
import {
  Modal,
  TextInput,
  Table,
  Text,
  Stack,
  Loader,
  Button,
  Group,
  Code,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useCodeSystem, useCodeSystemList } from '@/lib/terminology/hooks';

interface CodingValue {
  system?: string;
  code: string;
  display?: string;
}

interface TerminologyPickerProps {
  opened: boolean;
  onClose: () => void;
  onSelect: (coding: CodingValue) => void;
  systemFilter?: string;
}

export function TerminologyPicker({
  opened,
  onClose,
  onSelect,
  systemFilter,
}: TerminologyPickerProps) {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(
    systemFilter ?? null
  );
  const [search, setSearch] = useState('');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Browse Terminology"
      size="xl"
    >
      {selectedSystem ? (
        <SystemBrowser
          systemId={selectedSystem}
          search={search}
          onSearchChange={setSearch}
          onSelect={(coding) => {
            onSelect(coding);
            onClose();
          }}
          onBack={systemFilter ? undefined : () => setSelectedSystem(null)}
        />
      ) : (
        <SystemSelector
          search={search}
          onSearchChange={setSearch}
          onSelect={(id) => {
            setSelectedSystem(id);
            setSearch('');
          }}
        />
      )}
    </Modal>
  );
}

function SystemSelector({
  search,
  onSearchChange,
  onSelect,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
}) {
  const { data, isLoading } = useCodeSystemList();
  const filtered = (data || []).filter(
    (cs) =>
      !search ||
      cs.id?.toLowerCase().includes(search.toLowerCase()) ||
      cs.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Stack gap="sm">
      <TextInput
        placeholder="Filter code systems..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Code System</Table.Th>
              <Table.Th>Title</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.slice(0, 50).map((cs) => (
              <Table.Tr
                key={cs.id}
                style={{ cursor: 'pointer' }}
                onClick={() => cs.id && onSelect(cs.id)}
              >
                <Table.Td>
                  <Text size="sm" fw={500} c="indigo">
                    {cs.id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{cs.title || cs.name}</Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}

function SystemBrowser({
  systemId,
  search,
  onSearchChange,
  onSelect,
  onBack,
}: {
  systemId: string;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (coding: CodingValue) => void;
  onBack?: () => void;
}) {
  const { data, isLoading } = useCodeSystem(systemId);
  const concepts = data?.concept || [];
  const filtered = concepts.filter(
    (c) =>
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.display?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Stack gap="sm">
      <Group>
        {onBack && (
          <Button variant="subtle" size="xs" onClick={onBack}>
            Back
          </Button>
        )}
        <Text fw={600}>{data?.title || systemId}</Text>
      </Group>
      <TextInput
        placeholder="Search concepts..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Code</Table.Th>
              <Table.Th>Display</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.slice(0, 100).map((c) => (
              <Table.Tr key={c.code}>
                <Table.Td>
                  <Code>{c.code}</Code>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{c.display}</Text>
                </Table.Td>
                <Table.Td>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() =>
                      onSelect({
                        system: data?.url,
                        code: c.code,
                        display: c.display,
                      })
                    }
                  >
                    Select
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
