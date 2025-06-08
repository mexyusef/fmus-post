import React from 'react';
import { Container, Title, Box, Paper, Text } from '@mantine/core';
import { HttpRequest } from '../components/http/HttpRequest';

// Komentar: Halaman untuk mengirim HTTP requests
export function HttpPage() {
  return (
    <Container size="xl" py="lg">
      <Title order={2} mb="lg">HTTP Requests</Title>
      <Paper p="xs" mb="md" withBorder>
        <Text size="sm">
          Send HTTP requests and view responses in real-time. Supports GET, POST, PUT, DELETE methods with custom headers, query parameters, and request body.
        </Text>
      </Paper>
      <Box>
        <HttpRequest />
      </Box>
    </Container>
  );
}
