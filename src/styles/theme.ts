import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'indigo',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  defaultRadius: 'lg',
  components: {
    Card: {
      defaultProps: {
        bg: 'var(--mantine-color-gray-0)',
      },
      styles: {
        root: {
          border: 'none',
        },
      },
    },
  },
});
