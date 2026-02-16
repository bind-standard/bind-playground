import { useRef, useState } from 'react';
import { Group, Button, Modal, Textarea, Stack, Alert } from '@mantine/core';
import { IconCopy, IconDownload, IconUpload, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useBundle } from '@/lib/bundle/BundleProvider';
import type { Bundle } from '@/lib/bundle/types';

export function BundleExporter() {
  const { bundle, dispatch } = useBundle();
  const json = JSON.stringify(bundle, null, 2);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteError, setPasteError] = useState<string | null>(null);

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

  function importBundle(text: string): boolean {
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Input must be a JSON object');
      }
      if (parsed.resourceType !== 'Bundle') {
        throw new Error('JSON is not a Bundle (missing resourceType: "Bundle")');
      }
      if (!Array.isArray(parsed.entry)) {
        throw new Error('Bundle has no entry array');
      }
      dispatch({ type: 'IMPORT', bundle: parsed as Bundle });
      notifications.show({
        title: 'Imported',
        message: `Bundle imported with ${parsed.entry.length} ${parsed.entry.length === 1 ? 'entry' : 'entries'}`,
        color: 'green',
      });
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON';
      setPasteError(msg);
      return false;
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setPasteError(null);
      if (!importBundle(text)) {
        // If file import fails, open the paste modal showing the error
        setPasteText(text);
        setPasteOpen(true);
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  function handlePasteImport() {
    setPasteError(null);
    if (importBundle(pasteText)) {
      setPasteOpen(false);
      setPasteText('');
    }
  }

  return (
    <>
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
        <Button
          variant="light"
          color="teal"
          leftSection={<IconUpload size={16} />}
          onClick={() => setPasteOpen(true)}
        >
          Import JSON
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </Group>

      <Modal
        opened={pasteOpen}
        onClose={() => {
          setPasteOpen(false);
          setPasteError(null);
          setPasteText('');
        }}
        title="Import Bundle JSON"
        size="lg"
      >
        <Stack gap="md">
          <Group>
            <Button
              variant="light"
              leftSection={<IconUpload size={14} />}
              size="xs"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload File
            </Button>
          </Group>
          <Textarea
            placeholder='{"resourceType":"Bundle","type":"collection","entry":[...]}'
            autosize
            minRows={8}
            maxRows={20}
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.currentTarget.value);
              setPasteError(null);
            }}
          />
          {pasteError && (
            <Alert color="red" icon={<IconAlertCircle size={16} />}>
              {pasteError}
            </Alert>
          )}
          <Button onClick={handlePasteImport} disabled={!pasteText.trim()}>
            Import
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
