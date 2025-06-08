import React, { useState } from 'react';
import {
  Container,
  Title,
  Paper,
  Switch,
  TextInput,
  NumberInput,
  Divider,
  Stack,
  Button,
  Group,
  Select,
  Text,
  Alert,
} from '@mantine/core';
import { IconInfoCircle, IconSettings } from '@tabler/icons-react';

// Komentar: Halaman pengaturan aplikasi
export function SettingsPage() {
  const [appVersion] = useState('0.0.1');
  const [timeout, setTimeout] = useState(30000);
  const [followRedirects, setFollowRedirects] = useState(true);
  const [defaultContentType, setDefaultContentType] = useState('application/json');
  const [proxyEnabled, setProxyEnabled] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [maxHistoryItems, setMaxHistoryItems] = useState(50);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Komentar: Handler untuk menyimpan pengaturan
  const saveSettings = () => {
    // Di sini kita akan menyimpan pengaturan ke penyimpanan lokal
    // Untuk saat ini, kita hanya mensimulasikan penyimpanan
    setUnsavedChanges(false);
    // TODO: Implementasi penyimpanan pengaturan yang sebenarnya
  };

  // Komentar: Handler untuk perubahan pengaturan
  const handleChange = () => {
    setUnsavedChanges(true);
  };

  return (
    <Container size="xl" py="lg">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Settings</Title>
        <Text size="sm" c="dimmed">Application Version: {appVersion}</Text>
      </Group>

      <Alert icon={<IconInfoCircle size={16} />} title="Settings" color="blue" mb="lg">
        Configure the application settings to customize your experience. Changes will be applied immediately after saving.
      </Alert>

      <Paper p="lg" radius="md" withBorder mb="lg">
        <Title order={3} mb="md">General Settings</Title>

        <Stack gap="md">
          <Select
            label="Default Content Type"
            placeholder="Select content type"
            value={defaultContentType}
            onChange={(value) => { setDefaultContentType(value || 'application/json'); handleChange(); }}
            data={[
              { value: 'application/json', label: 'application/json' },
              { value: 'application/x-www-form-urlencoded', label: 'application/x-www-form-urlencoded' },
              { value: 'multipart/form-data', label: 'multipart/form-data' },
              { value: 'text/plain', label: 'text/plain' },
            ]}
          />

          <NumberInput
            label="Request Timeout (ms)"
            description="Maximum time to wait for a response"
            value={timeout}
            onChange={(value) => { if (typeof value === 'number') { setTimeout(value); handleChange(); } }}
            min={1000}
            max={120000}
            step={1000}
          />

          <NumberInput
            label="Maximum History Items"
            description="Number of requests to keep in history"
            value={maxHistoryItems}
            onChange={(value) => { if (typeof value === 'number') { setMaxHistoryItems(value); handleChange(); } }}
            min={10}
            max={200}
            step={10}
          />

          <Switch
            label="Follow Redirects"
            description="Automatically follow 3xx redirects"
            checked={followRedirects}
            onChange={(event) => { setFollowRedirects(event.currentTarget.checked); handleChange(); }}
            mb="xs"
          />
        </Stack>
      </Paper>

      <Paper p="lg" radius="md" withBorder mb="lg">
        <Title order={3} mb="md">Proxy Settings</Title>

        <Stack gap="md">
          <Switch
            label="Enable Proxy"
            description="Use a proxy server for requests"
            checked={proxyEnabled}
            onChange={(event) => { setProxyEnabled(event.currentTarget.checked); handleChange(); }}
          />

          <TextInput
            label="Proxy URL"
            placeholder="http://proxy.example.com:8080"
            value={proxyUrl}
            onChange={(event) => { setProxyUrl(event.currentTarget.value); handleChange(); }}
            disabled={!proxyEnabled}
          />
        </Stack>
      </Paper>

      <Group justify="flex-end">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Cancel
        </Button>
        <Button
          onClick={saveSettings}
          disabled={!unsavedChanges}
        >
          Save Settings
        </Button>
      </Group>
    </Container>
  );
}
