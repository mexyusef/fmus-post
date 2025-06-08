import React from 'react';
import { Container, Title, Paper, Text, Button, Group, Code, Box } from '@mantine/core';
import { IconBrandGraphql } from '@tabler/icons-react';

// Komentar: Halaman placeholder untuk GraphQL
export function GraphQLPage() {
  return (
    <Container size="xl" py="lg">
      <Title order={2} mb="lg">GraphQL</Title>

      <Paper p="lg" radius="md" withBorder mb="xl">
        <Group align="flex-start" mb="md">
          <IconBrandGraphql size={34} color="#E535AB" />
          <div>
            <Title order={3}>GraphQL Explorer</Title>
            <Text c="dimmed" size="sm">
              The GraphQL explorer is coming soon. You'll be able to:
            </Text>
          </div>
        </Group>

        <Box my="lg">
          <Text mb="xs" fw={500}>Future features:</Text>
          <ul>
            <li>Create and send GraphQL queries</li>
            <li>Fetch and explore GraphQL schemas</li>
            <li>Interactive query builder with autocomplete</li>
            <li>Variables and header management</li>
            <li>History and saved queries</li>
          </ul>
        </Box>

        <Box my="lg">
          <Text mb="xs" fw={500}>Sample query:</Text>
          <Code block mb="md">
{`query GetUserData {
  user(id: "1234") {
    id
    name
    email
    posts {
      id
      title
      content
    }
  }
}`}
          </Code>
        </Box>

        <Button variant="light" color="violet" disabled>
          Coming Soon
        </Button>
      </Paper>
    </Container>
  );
}
