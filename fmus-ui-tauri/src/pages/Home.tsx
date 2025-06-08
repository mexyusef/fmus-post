import React from 'react';
import { Card, Text, Container, Title, Paper, SimpleGrid, Button, Group, ThemeIcon, useMantineTheme, Stack } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconBrandHtml5, IconBrandGraphql, IconWorld, IconSitemap, IconArrowRight } from '@tabler/icons-react';

// Komentar: Komponen untuk halaman home
export function Home() {
  const navigate = useNavigate();
  const theme = useMantineTheme();

  const features = [
    {
      title: 'HTTP Requests',
      description: 'Make RESTful API requests with support for various HTTP methods, headers, and authentication.',
      icon: <IconBrandHtml5 size={24} stroke={1.5} />,
      color: 'blue',
      path: '/http'
    },
    {
      title: 'GraphQL',
      description: 'Create and test GraphQL queries with full schema support and interactive explorer.',
      icon: <IconBrandGraphql size={24} stroke={1.5} />,
      color: 'violet',
      path: '/graphql'
    },
    {
      title: 'WebSockets',
      description: 'Establish real-time communication via WebSockets, with message formatter and listener.',
      icon: <IconWorld size={24} stroke={1.5} />,
      color: 'teal',
      path: '/websocket'
    },
    {
      title: 'Collections',
      description: 'Organize your requests into collections and environments for better workflow.',
      icon: <IconSitemap size={24} stroke={1.5} />,
      color: 'orange',
      path: '/collections'
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Title order={1}>Welcome to FMUS-POST</Title>
        <Paper p="md" radius="md" withBorder>
          <Text>
            A modern API testing and development tool for working with HTTP, WebSockets, GraphQL, and more.
            Choose one of the options below to get started.
          </Text>
        </Paper>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {features.map((feature) => (
            <Card key={feature.title} p="lg" radius="md" withBorder>
              <Group wrap="nowrap" mb="md">
                <ThemeIcon size={44} radius="md" color={feature.color} variant="light">
                  {feature.icon}
                </ThemeIcon>
                <Title order={4}>{feature.title}</Title>
              </Group>
              <Text size="sm" c="dimmed" mb="lg">{feature.description}</Text>
              <Button
                variant="light"
                color={feature.color}
                fullWidth
                onClick={() => navigate(feature.path)}
                rightSection={<IconArrowRight size={16} />}
              >
                Open {feature.title}
              </Button>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
