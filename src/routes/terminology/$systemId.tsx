import { createFileRoute, Link } from '@tanstack/react-router';
import { Container, Breadcrumbs, Anchor, Text } from '@mantine/core';
import { CodeSystemDetail } from '@/components/terminology/CodeSystemDetail';

export const Route = createFileRoute('/terminology/$systemId')({
  component: SystemDetailPage,
});

function SystemDetailPage() {
  const { systemId } = Route.useParams();
  return (
    <Container size="lg">
      <Breadcrumbs mb="md">
        <Anchor component={Link} to="/terminology" size="sm">
          Terminology
        </Anchor>
        <Text size="sm">{systemId}</Text>
      </Breadcrumbs>
      <CodeSystemDetail systemId={systemId} />
    </Container>
  );
}
