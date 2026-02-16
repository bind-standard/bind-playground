import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Box, Group } from '@mantine/core';
import { BuilderSidebar } from '@/components/builder/BuilderSidebar';

export const Route = createFileRoute('/builder')({
  component: BuilderLayout,
});

function BuilderLayout() {
  return (
    <Group align="flex-start" wrap="nowrap" gap={0}>
      <Box
        w={260}
        style={{
          flexShrink: 0,
          position: 'sticky',
          top: 56,
          height: 'calc(100vh - 56px)',
          overflowY: 'auto',
        }}
      >
        <BuilderSidebar />
      </Box>
      <Box flex={1} style={{ minWidth: 0 }} p="md">
        <Outlet />
      </Box>
    </Group>
  );
}
