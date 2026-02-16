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

export const Route = createFileRoute('/builder/$resourceType/')({
  component: NewResourcePage,
});

function NewResourcePage() {
  const { resourceType } = Route.useParams();
  const { dispatch } = useBundle();
  const navigate = useNavigate();

  return (
    <Stack gap="md" maw={720}>
      <Breadcrumbs>
        <Anchor component={Link} to="/builder" size="sm">
          Builder
        </Anchor>
        <Text size="sm">New {resourceType}</Text>
      </Breadcrumbs>

      <Title order={2}>New {resourceType}</Title>

      <SchemaForm
        schemaName={resourceType}
        onSubmit={(values) => {
          dispatch({ type: 'ADD_RESOURCE', resource: values });
          notifications.show({
            title: 'Resource Added',
            message: `${resourceType} added to bundle`,
            color: 'green',
          });
          navigate({ to: '/builder' });
        }}
      />
    </Stack>
  );
}
