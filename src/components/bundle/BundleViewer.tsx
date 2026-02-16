import { CodeHighlight } from '@mantine/code-highlight';
import { useBundle } from '@/lib/bundle/BundleProvider';

export function BundleViewer() {
  const { bundle } = useBundle();
  const json = JSON.stringify(bundle, null, 2);

  return <CodeHighlight code={json} language="json" />;
}
