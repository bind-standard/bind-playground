import { Group, Button } from '@mantine/core';
import { IconCopy, IconDownload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useBundle } from '@/lib/bundle/BundleProvider';

export function BundleExporter() {
  const { bundle } = useBundle();
  const json = JSON.stringify(bundle, null, 2);

  function copyToClipboard() {
    navigator.clipboard.writeText(json).then(() => {
      notifications.show({
        title: 'Copied',
        message: 'Bundle JSON copied to clipboard',
        color: 'green',
      });
    });
  }

  function downloadJson() {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bind-bundle.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Group>
      <Button
        variant="light"
        leftSection={<IconCopy size={16} />}
        onClick={copyToClipboard}
      >
        Copy to Clipboard
      </Button>
      <Button
        variant="light"
        leftSection={<IconDownload size={16} />}
        onClick={downloadJson}
      >
        Download JSON
      </Button>
    </Group>
  );
}
