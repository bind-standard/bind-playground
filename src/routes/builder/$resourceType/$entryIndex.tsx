import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
  Title,
  Stack,
  Breadcrumbs,
  Anchor,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { SchemaForm } from '@/components/schema-form/SchemaForm';
import { useBundle } from '@/lib/bundle/BundleProvider';

export const Route = createFileRoute('/builder/$resourceType/$entryIndex')({
  component: EditResourcePage,
});

function EditResourcePage() {
  const { resourceType, entryIndex } = Route.useParams();
  const { bundle, dispatch } = useBundle();
  const navigate = useNavigate();
  const index = parseInt(entryIndex, 10);
  const entry = bundle.entry[index];

  if (!entry) {
    return <Text>Entry not found.</Text>;
  }

  return (
    <Stack gap="md" maw={720}>
      <Breadcrumbs>
        <Anchor component={Link} to="/builder" size="sm">
          Builder
        </Anchor>
        <Text size="sm">Edit {resourceType}</Text>
      </Breadcrumbs>

      <Title order={2}>Edit {resourceType}</Title>

      <SchemaForm
        schemaName={resourceType}
        initialValues={entry.resource}
        submitLabel="Update Resource"
        onSubmit={(values) => {
          dispatch({
            type: 'UPDATE_RESOURCE',
            index,
            resource: values,
          });
          notifications.show({
            title: 'Resource Updated',
            message: `${resourceType} updated in bundle`,
            color: 'green',
          });
          navigate({ to: '/builder' });
        }}
      />
    </Stack>
  );
}
