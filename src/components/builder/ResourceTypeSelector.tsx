import { SimpleGrid, Card, Text, Button, Stack, Badge } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { getResourceNames, getSchema } from '@/lib/schemas/registry';
import { resolveRootRef } from '@/lib/schemas/ref-resolver';

const RESOURCE_DESCRIPTIONS: Record<string, string> = {
  Submission: 'Request for insurance coverage sent to a carrier',
  Insured: 'The entity being covered by insurance',
  Quote: 'A carrier\'s pricing response to a submission',
  Policy: 'Bound insurance contract with coverages',
  Coverage: 'Specific coverage within a policy',
  Claim: 'A reported loss or claim event',
  Organization: 'An insurance company, brokerage, or other entity',
  Location: 'A physical location or insured property',
  Risk: 'A unit of risk being insured',
  Person: 'An individual in the insurance ecosystem',
  PersonRole: 'A person\'s role within an organization',
  Certificate: 'A Certificate of Insurance (COI) proving coverage to a third party',
};

// Bundle is a container type assembled by the playground, not a user-created resource
const EXCLUDED_RESOURCES = new Set(['Bundle']);

export function ResourceTypeSelector() {
  const navigate = useNavigate();
  const resourceNames = getResourceNames().filter(
    (n) => !EXCLUDED_RESOURCES.has(n)
  );

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
      {resourceNames.map((name) => {
        const schema = getSchema(name);
        const rootDef = schema ? resolveRootRef(schema) : null;
        const desc =
          RESOURCE_DESCRIPTIONS[name] ||
          (rootDef?.schema.description as string) ||
          '';

        return (
          <Card key={name} padding="md">
            <Stack gap="sm">
              <Badge variant="light" size="sm" w="fit-content">
                Resource
              </Badge>
              <Text fw={600}>{name}</Text>
              <Text size="xs" c="dimmed" lineClamp={2}>
                {desc}
              </Text>
              <Button
                variant="light"
                size="xs"
                leftSection={<IconPlus size={14} />}
                onClick={() =>
                  navigate({
                    to: '/builder/$resourceType',
                    params: { resourceType: name },
                  })
                }
              >
                Add {name}
              </Button>
            </Stack>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
