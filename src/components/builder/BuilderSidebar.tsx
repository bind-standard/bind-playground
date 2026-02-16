import {
  Stack,
  Group,
  Text,
  Badge,
  ActionIcon,
  Menu,
  ScrollArea,
  UnstyledButton,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useBundle } from '@/lib/bundle/BundleProvider';
import { getResourceDisplay } from '@/lib/bundle/utils';
import { getResourceNames } from '@/lib/schemas/registry';

const EXCLUDED_RESOURCES = new Set(['Bundle']);

export function BuilderSidebar() {
  const navigate = useNavigate();
  const router = useRouterState();
  const { bundle, dispatch } = useBundle();
  const resourceNames = getResourceNames().filter(
    (n) => !EXCLUDED_RESOURCES.has(n)
  );

  // Detect which entry is currently being edited
  const match = router.location.pathname.match(
    /\/builder\/([^/]+)\/(\d+)/
  );
  const activeIndex = match ? parseInt(match[2], 10) : -1;

  return (
    <Stack
      gap={0}
      h="100%"
      bg="var(--mantine-color-gray-0)"
    >
      <Group justify="space-between" px="sm" py="xs">
        <Group gap={6}>
          <Text size="xs" fw={700} c="dimmed" tt="uppercase">
            Bundle
          </Text>
          {bundle.entry.length > 0 && (
            <Badge size="xs" variant="filled" circle>
              {bundle.entry.length}
            </Badge>
          )}
        </Group>
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon size="sm" variant="light">
              <IconPlus size={14} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Add resource</Menu.Label>
            {resourceNames.map((name) => (
              <Menu.Item
                key={name}
                onClick={() =>
                  navigate({
                    to: '/builder/$resourceType',
                    params: { resourceType: name },
                  })
                }
              >
                {name}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>

      <ScrollArea flex={1} px="xs" pb="xs">
        {bundle.entry.length === 0 ? (
          <Text size="xs" c="dimmed" fs="italic" px="xs" py="md">
            Empty — add a resource to get started.
          </Text>
        ) : (
          <Stack gap={4}>
            {bundle.entry.map((entry, index) => {
              const resourceType =
                (entry.resource.resourceType as string) || 'Unknown';
              const display = getResourceDisplay(entry.resource);
              const isActive = index === activeIndex;

              return (
                <UnstyledButton
                  key={index}
                  onClick={() =>
                    navigate({
                      to: '/builder/$resourceType/$entryIndex',
                      params: {
                        resourceType,
                        entryIndex: String(index),
                      },
                    })
                  }
                  px="xs"
                  py={6}
                  style={{
                    borderRadius: 'var(--mantine-radius-sm)',
                    background: isActive
                      ? 'var(--mantine-color-indigo-light)'
                      : undefined,
                  }}
                >
                  <Group gap={6} justify="space-between" wrap="nowrap">
                    <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                      <Badge
                        size="xs"
                        variant="light"
                        style={{ flexShrink: 0 }}
                      >
                        {resourceType}
                      </Badge>
                      <Text size="xs" truncate style={{ minWidth: 0 }}>
                        {display}
                      </Text>
                    </Group>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch({ type: 'REMOVE_RESOURCE', index });
                      }}
                    >
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Group>
                </UnstyledButton>
              );
            })}
          </Stack>
        )}
      </ScrollArea>
    </Stack>
  );
}
