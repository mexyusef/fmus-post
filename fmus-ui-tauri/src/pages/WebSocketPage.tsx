import React from 'react';
import { Container, Title, Paper, Text, Button, Group, Code, Box } from '@mantine/core';
import { IconWorld } from '@tabler/icons-react';

// Komentar: Halaman placeholder untuk WebSocket
export function WebSocketPage() {
  return (
    <Container size="xl" py="lg">
      <Title order={2} mb="lg">WebSocket</Title>

      <Paper p="lg" radius="md" withBorder mb="xl">
        <Group align="flex-start" mb="md">
          <IconWorld size={34} color="#1d9bf0" />
          <div>
            <Title order={3}>WebSocket Client</Title>
            <Text c="dimmed" size="sm">
              The WebSocket client is coming soon. You'll be able to:
            </Text>
          </div>
        </Group>

        <Box my="lg">
          <Text mb="xs" fw={500}>Future features:</Text>
          <ul>
            <li>Connect to WebSocket servers</li>
            <li>Send and receive real-time messages</li>
            <li>Format and validate message payloads</li>
            <li>Monitor connection status</li>
            <li>Save connection profiles</li>
          </ul>
        </Box>

        <Box my="lg">
          <Text mb="xs" fw={500}>Sample WebSocket setup:</Text>
          <Code block mb="md">
{`// Client code
const socket = new WebSocket('wss://echo.websocket.org');

socket.onopen = function(e) {
  console.log("Connection established");
  socket.send("Hello Server!");
};

socket.onmessage = function(event) {
  console.log(\`Data received: \${event.data}\`);
};`}
          </Code>
        </Box>

        <Button variant="light" color="teal" disabled>
          Coming Soon
        </Button>
      </Paper>
    </Container>
  );
}
