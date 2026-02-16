import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Title,
  Text,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
  Stack,
  Button,
  Container,
  Box,
} from '@mantine/core';
import {
  IconBook,
  IconBuildingFactory,
  IconPackage,
  IconSend,
  IconArrowRight,
} from '@tabler/icons-react';

export const Route = createFileRoute('/')({ component: HomePage });

function HomePage() {
  return (
    <Container size="lg">
      <Stack gap={48}>
        {/* Hero section */}
        <Box py="xl" ta="center">
          <Title
            order={1}
            size="3rem"
            fw={800}
            c="indigo"
            mb="sm"
          >
            BIND Playground
          </Title>
          <Title order={2} size="1.5rem" fw={600} c="dark" mb="xs">
            Business Insurance Normalized Data
          </Title>
          <Text size="lg" c="dimmed" maw={640} mx="auto" mb="xl">
            Explore the open data standard for commercial insurance. Browse
            terminology, build resources, and assemble Bundles — all derived
            from the published JSON schemas.
          </Text>

          {/* CTA pills */}
          <Group justify="center" gap="sm">
            <Button
              component={Link}
              to="/terminology"
              variant="light"
              radius="xl"
              size="md"
            >
              Terminology
            </Button>
            <Button
              component={Link}
              to="/builder"
              variant="light"
              color="teal"
              radius="xl"
              size="md"
            >
              Builder
            </Button>
            <Button
              component={Link}
              to="/bundle"
              variant="light"
              color="grape"
              radius="xl"
              size="md"
            >
              Bundle
            </Button>
            <Button
              component={Link}
              to="/exchange"
              variant="light"
              color="orange"
              radius="xl"
              size="md"
            >
              Exchange
            </Button>
          </Group>
        </Box>

        {/* Key Concepts */}
        <Stack gap="md">
          <Title order={3}>Key Concepts</Title>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Card padding="lg">
              <Text fw={600} mb={4}>Resources</Text>
              <Text size="sm" c="dimmed">
                The building blocks of BIND. Each resource — Submission,
                Policy, Claim, Insured, Coverage, and more — has a typed
                schema with a resourceType discriminator, a logical id, and
                metadata.
              </Text>
            </Card>
            <Card padding="lg">
              <Text fw={600} mb={4}>Coding & Terminology</Text>
              <Text size="sm" c="dimmed">
                Instead of free-text fields, BIND uses coded values from 280+
                standardized code systems — lines of business, coverage types,
                peril codes, and more.
              </Text>
            </Card>
            <Card padding="lg">
              <Text fw={600} mb={4}>References</Text>
              <Text size="sm" c="dimmed">
                Resources don't exist in isolation. A Submission references an
                Insured, a Policy references its Coverages, a Claim references
                a Policy. These typed references create a connected graph.
              </Text>
            </Card>
            <Card padding="lg">
              <Text fw={600} mb={4}>Bundles</Text>
              <Text size="sm" c="dimmed">
                A Bundle is the container for exchanging BIND data. It packages
                related resources into a single payload — a complete
                submission, a policy snapshot, or any set of related resources.
              </Text>
            </Card>
          </SimpleGrid>
        </Stack>

        {/* What this playground does */}
        <Card padding="lg">
          <Stack gap="xs">
            <Title order={4}>What this playground does</Title>
            <Text size="sm" c="dimmed">
              The Resource Builder lets you create spec-compliant BIND resources
              by filling out forms that mirror the standard's schemas. As you
              add resources they accumulate in a Bundle — the same structure a
              real system would produce when packaging a submission, quoting a
              risk, or transmitting policy data. You can inspect the resulting
              JSON, copy it, or download it.
            </Text>
          </Stack>
        </Card>

        {/* Feature cards */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <Card padding="lg">
            <Stack gap="sm">
              <ThemeIcon size="xl" variant="light">
                <IconBook size={24} />
              </ThemeIcon>
              <Text fw={600} size="lg">
                Terminology Browser
              </Text>
              <Text size="sm" c="dimmed">
                Search and browse 280+ insurance code systems from the BIND
                terminology server. Look up codes for lines of business,
                coverage forms, peril types, and more.
              </Text>
              <Button
                component={Link}
                to="/terminology"
                variant="light"
                rightSection={<IconArrowRight size={14} />}
              >
                Browse Codes
              </Button>
            </Stack>
          </Card>

          <Card padding="lg">
            <Stack gap="sm">
              <ThemeIcon size="xl" variant="light" color="teal">
                <IconBuildingFactory size={24} />
              </ThemeIcon>
              <Text fw={600} size="lg">
                Resource Builder
              </Text>
              <Text size="sm" c="dimmed">
                Create BIND resources using forms auto-generated from the
                standard's JSON schemas. Every field, enum, and nested
                structure comes straight from the spec.
              </Text>
              <Button
                component={Link}
                to="/builder"
                variant="light"
                color="teal"
                rightSection={<IconArrowRight size={14} />}
              >
                Build Resources
              </Button>
            </Stack>
          </Card>

          <Card padding="lg">
            <Stack gap="sm">
              <ThemeIcon size="xl" variant="light" color="grape">
                <IconPackage size={24} />
              </ThemeIcon>
              <Text fw={600} size="lg">
                Bundle Viewer
              </Text>
              <Text size="sm" c="dimmed">
                Inspect the assembled Bundle as JSON. Copy it to your clipboard
                or download it — the output is a valid BIND Bundle ready for
                any system that speaks the standard.
              </Text>
              <Button
                component={Link}
                to="/bundle"
                variant="light"
                color="grape"
                rightSection={<IconArrowRight size={14} />}
              >
                View Bundle
              </Button>
            </Stack>
          </Card>

          <Card padding="lg">
            <Stack gap="sm">
              <ThemeIcon size="xl" variant="light" color="orange">
                <IconSend size={24} />
              </ThemeIcon>
              <Text fw={600} size="lg">
                Exchange
              </Text>
              <Text size="sm" c="dimmed">
                Sign your bundle with ES256 keys, encrypt it with AES-256-GCM,
                and send it via the BIND Exchange. Recipients get a passcode
                and a bindx:// link to retrieve and decrypt.
              </Text>
              <Button
                component={Link}
                to="/exchange"
                variant="light"
                color="orange"
                rightSection={<IconArrowRight size={14} />}
              >
                Sign & Send
              </Button>
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
