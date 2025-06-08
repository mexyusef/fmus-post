import React from 'react';
import { Container, Title, Paper, Text, Button, Group, Code, Box } from '@mantine/core';
import { IconSitemap } from '@tabler/icons-react';

// Komentar: Halaman placeholder untuk Collections
export function CollectionsPage() {
  return (
    <Container size="xl" py="lg">
      <Title order={2} mb="lg">Collections</Title>

      <Paper p="lg" radius="md" withBorder mb="xl">
        <Group align="flex-start" mb="md">
          <IconSitemap size={34} color="#ff9900" />
          <div>
            <Title order={3}>Request Collections</Title>
            <Text c="dimmed" size="sm">
              The collections feature is coming soon. You'll be able to:
            </Text>
          </div>
        </Group>

        <Box my="lg">
          <Text mb="xs" fw={500}>Future features:</Text>
          <ul>
            <li>Organize requests into collections</li>
            <li>Create environment variables</li>
            <li>Run collections in sequence or parallel</li>
            <li>Export and import collections</li>
            <li>Share collections with team members</li>
          </ul>
        </Box>

        <Box my="lg">
          <Text mb="xs" fw={500}>Sample collection format:</Text>
          <Code block mb="md">
{`{
  "name": "My API Collection",
  "description": "A collection of API endpoints",
  "requests": [
    {
      "name": "Get Users",
      "method": "GET",
      "url": "https://api.example.com/users",
      "headers": {
        "Content-Type": "application/json",
        "Authorization": "Bearer {{token}}"
      }
    },
    {
      "name": "Create User",
      "method": "POST",
      "url": "https://api.example.com/users",
      "body": {
        "name": "{{userName}}",
        "email": "{{userEmail}}"
      }
    }
  ]
}`}
          </Code>
        </Box>

        <Button variant="light" color="orange" disabled>
          Coming Soon
        </Button>
      </Paper>
    </Container>
  );
}
