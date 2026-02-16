import { Group, Text, UnstyledButton, Box } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons-react';
import { Link, useRouterState } from '@tanstack/react-router';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Terminology', to: '/terminology' },
  { label: 'Builder', to: '/builder' },
  { label: 'Bundle', to: '/bundle' },
] as const;

export function AppHeader() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <Group h="100%" px="xl" justify="space-between">
      <Text
        component={Link}
        to="/"
        fw={700}
        size="lg"
        c="indigo"
        style={{ textDecoration: 'none' }}
      >
        BIND Playground
      </Text>

      <Group gap="xs">
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? currentPath === '/'
              : currentPath.startsWith(item.to);

          return (
            <UnstyledButton
              key={item.to}
              component={Link}
              to={item.to}
              px="sm"
              py={4}
              style={(theme) => ({
                borderRadius: theme.radius.sm,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive
                  ? 'var(--mantine-color-indigo-7)'
                  : 'var(--mantine-color-gray-7)',
                backgroundColor: isActive
                  ? 'var(--mantine-color-indigo-0)'
                  : 'transparent',
                transition: 'color 0.15s ease, background-color 0.15s ease',
                '&:hover': {
                  color: 'var(--mantine-color-indigo-7)',
                  backgroundColor: 'var(--mantine-color-gray-0)',
                },
              })}
            >
              {item.label}
            </UnstyledButton>
          );
        })}

        <Box
          component="a"
          href="https://github.com/bindstandard"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'var(--mantine-color-gray-6)',
            transition: 'color 0.15s ease',
            marginLeft: 4,
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = 'var(--mantine-color-gray-8)';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.color = 'var(--mantine-color-gray-6)';
          }}
        >
          <IconBrandGithub size={20} />
        </Box>
      </Group>
    </Group>
  );
}
