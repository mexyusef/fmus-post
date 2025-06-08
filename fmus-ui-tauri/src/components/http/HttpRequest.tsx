import React, { useState } from 'react';
import {
  TextInput,
  Button,
  Group,
  Select,
  Tabs,
  Box,
  Textarea,
  Paper,
  Grid,
  LoadingOverlay,
  Text,
  JsonInput,
  Table,
  Code,
  Badge,
  ScrollArea
} from '@mantine/core';
import { get, post, put, del } from '../../api/client';
import { showNotification } from '@mantine/notifications';
import { IconSend, IconX } from '@tabler/icons-react';
import { KeyValueEditor } from './KeyValueEditor';

// Komentar: Tipe untuk respon HTTP
interface ResponseData {
  status: number;
  time: number;
  headers: Record<string, string>;
  body: any;
}

// Komentar: Komponen untuk HTTP request
export function HttpRequest() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [params, setParams] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }]);
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState('params');
  const [responseTab, setResponseTab] = useState('preview');

  const httpMethods = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'DELETE', label: 'DELETE' },
    { value: 'PATCH', label: 'PATCH' },
    { value: 'OPTIONS', label: 'OPTIONS' },
  ];

  // Komentar: Konversi array key-value menjadi object
  const arrayToObject = (array: Array<{ key: string; value: string }>) => {
    return array.reduce((obj, item) => {
      if (item.key.trim()) {
        obj[item.key.trim()] = item.value;
      }
      return obj;
    }, {} as Record<string, string>);
  };

  const handleSend = async () => {
    if (!url) {
      showNotification({
        title: 'Error',
        message: 'Please enter a URL',
        color: 'red',
        icon: <IconX />
      });
      return;
    }

    setLoading(true);
    try {
      // Komentar: Konversi headers dan params ke format yang dibutuhkan
      const headerObj = arrayToObject(headers);
      const paramObj = arrayToObject(params);

      // Komentar: Parse body jika format JSON
      let parsedBody: any = undefined;
      if (body) {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          parsedBody = body;
        }
      }

      let response;
      const options = {
        headers: headerObj,
        params: paramObj,
        body: parsedBody
      };

      // Komentar: Kirim request berdasarkan method
      switch (method) {
        case 'GET':
          response = await get(url, options);
          break;
        case 'POST':
          response = await post(url, options);
          break;
        case 'PUT':
          response = await put(url, options);
          break;
        case 'DELETE':
          response = await del(url, options);
          break;
        default:
          showNotification({
            title: 'Error',
            message: `Method ${method} is not yet supported`,
            color: 'red',
            icon: <IconX />
          });
          setLoading(false);
          return;
      }

      // Komentar: Persiapkan data response
      const jsonData = response.json();
      setResponse({
        status: response.status,
        time: response.time,
        headers: response.headers,
        body: jsonData
      });
    } catch (error: any) {
      showNotification({
        title: 'Error',
        message: error.message || 'An error occurred',
        color: 'red',
        icon: <IconX />
      });
    } finally {
      setLoading(false);
    }
  };

  // Komentar: Render status badge dengan warna yang sesuai
  const getStatusBadge = (status: number) => {
    let color = 'gray';
    if (status >= 200 && status < 300) color = 'green';
    else if (status >= 300 && status < 400) color = 'blue';
    else if (status >= 400 && status < 500) color = 'orange';
    else if (status >= 500) color = 'red';

    return <Badge color={color}>{status}</Badge>;
  };

  // Komentar: Handler untuk tab change yang kompatibel dengan Mantine
  const handleTabChange = (value: string | null) => {
    if (value) setActiveTab(value);
  };

  // Komentar: Handler untuk response tab change
  const handleResponseTabChange = (value: string | null) => {
    if (value) setResponseTab(value);
  };

  return (
    <Box pos="relative" style={{ minHeight: '100%' }}>
      <LoadingOverlay visible={loading} />

      <Paper p="md" shadow="xs" style={{ marginBottom: 16 }}>
        <Grid align="flex-end">
          <Grid.Col span={2}>
            <Select
              label="Method"
              value={method}
              onChange={(value) => setMethod(value || 'GET')}
              data={httpMethods}
            />
          </Grid.Col>
          <Grid.Col span={8}>
            <TextInput
              label="URL"
              placeholder="https://api.example.com"
              value={url}
              onChange={(e) => setUrl(e.currentTarget.value)}
              required
            />
          </Grid.Col>
          <Grid.Col span={2}>
            <Button
              fullWidth
              onClick={handleSend}
              leftSection={<IconSend size={16} />}
              disabled={!url}
            >
              Send
            </Button>
          </Grid.Col>
        </Grid>
      </Paper>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" shadow="xs">
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tabs.List>
                <Tabs.Tab value="params">Query Params</Tabs.Tab>
                <Tabs.Tab value="headers">Headers</Tabs.Tab>
                <Tabs.Tab value="body">Body</Tabs.Tab>
                <Tabs.Tab value="auth">Auth</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="params" pt="xs">
                <KeyValueEditor
                  items={params}
                  onChange={setParams}
                  keyPlaceholder="Parameter name"
                  valuePlaceholder="Value"
                />
              </Tabs.Panel>

              <Tabs.Panel value="headers" pt="xs">
                <KeyValueEditor
                  items={headers}
                  onChange={setHeaders}
                  keyPlaceholder="Header name"
                  valuePlaceholder="Value"
                />
              </Tabs.Panel>

              <Tabs.Panel value="body" pt="xs">
                <JsonInput
                  value={body}
                  onChange={setBody}
                  minRows={8}
                  validationError="Invalid JSON"
                  formatOnBlur
                  autosize
                  placeholder='{ "key": "value" }'
                />
              </Tabs.Panel>

              <Tabs.Panel value="auth" pt="xs">
                <Text size="sm" c="dimmed">Authentication options will be implemented in a future version.</Text>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" shadow="xs" style={{ minHeight: '300px' }}>
            {response ? (
              <>
                <Group justify="space-between" mb="md">
                  <Group>
                    <Text fw={500}>Status:</Text>
                    {getStatusBadge(response.status)}
                  </Group>
                  <Text size="sm" c="dimmed">{response.time}ms</Text>
                </Group>

                <Tabs value={responseTab} onChange={handleResponseTabChange}>
                  <Tabs.List>
                    <Tabs.Tab value="preview">Preview</Tabs.Tab>
                    <Tabs.Tab value="headers">Headers</Tabs.Tab>
                    <Tabs.Tab value="raw">Raw</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="preview" pt="xs">
                    <ScrollArea h={300}>
                      <Box p="xs">
                        <Code block>{JSON.stringify(response.body, null, 2)}</Code>
                      </Box>
                    </ScrollArea>
                  </Tabs.Panel>

                  <Tabs.Panel value="headers" pt="xs">
                    <ScrollArea h={300}>
                      <Table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(response.headers).map(([key, value]) => (
                            <tr key={key}>
                              <td>{key}</td>
                              <td>{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </ScrollArea>
                  </Tabs.Panel>

                  <Tabs.Panel value="raw" pt="xs">
                    <ScrollArea h={300}>
                      <Box p="xs">
                        <Textarea
                          readOnly
                          value={JSON.stringify(response.body)}
                          minRows={10}
                          autosize
                        />
                      </Box>
                    </ScrollArea>
                  </Tabs.Panel>
                </Tabs>
              </>
            ) : (
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  minHeight: '300px'
                }}
              >
                <Text c="dimmed">Response will appear here</Text>
              </Box>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
}
