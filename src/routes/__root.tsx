import {
  HeadContent,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router';
import { MantineProvider, AppShell, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '../styles/theme';
import { AppHeader } from '../components/layout/AppHeader';
import { BundleProvider } from '../lib/bundle/BundleProvider';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/code-highlight/styles.css';
import '@mantine/notifications/styles.css';

const queryClient = new QueryClient();

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { title: 'BIND Playground' },
    ],
    links: [
      { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'shortcut icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/site.webmanifest' },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <HeadContent />
      </head>
      <body style={{ margin: 0 }}>
        <MantineProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <BundleProvider>
              <Notifications />
              <AppShell
                header={{ height: 56 }}
                padding="xl"
              >
                <AppShell.Header
                  style={{
                    borderBottom: '1px solid var(--mantine-color-gray-2)',
                  }}
                >
                  <AppHeader />
                </AppShell.Header>
                <AppShell.Main>{children}</AppShell.Main>
              </AppShell>
            </BundleProvider>
          </QueryClientProvider>
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  );
}
