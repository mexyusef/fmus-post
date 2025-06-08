/**
 * Tests for HTTP methods in FMUS-POST
 */
import { describe, test, expect, beforeAll, afterAll, mock } from 'bun:test';
import { get, post, client, createMiddleware } from '../src';

// Mock global fetch
const originalFetch = globalThis.fetch;
let mockFetch: any;

beforeAll(() => {
  // Set up the mock
  mockFetch = mock(async (url: string, options: RequestInit) => {
    return {
      status: 200,
      statusText: 'OK',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, url, method: options.method }),
      text: async () => JSON.stringify({ success: true, url, method: options.method })
    };
  });

  // Replace global fetch
  globalThis.fetch = mockFetch;
});

afterAll(() => {
  // Restore original fetch
  globalThis.fetch = originalFetch;
});

describe('HTTP Methods', () => {
  test('GET request', async () => {
    const response = await get('https://api.example.com/users');

    expect(response.status).toBe(200);
    expect(response.json().success).toBe(true);
    expect(response.json().method).toBe('GET');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('POST request with JSON body', async () => {
    const body = { name: 'Test User', email: 'test@example.com' };
    const response = await post('https://api.example.com/users', { body });

    expect(response.status).toBe(200);
    expect(response.json().success).toBe(true);
    expect(response.json().method).toBe('POST');
    expect(mockFetch).toHaveBeenCalledTimes(2);

    // Get the second call arguments
    const callArgs = mockFetch.mock.calls[1];
    expect(callArgs[1].method).toBe('POST');
    expect(callArgs[1].headers['Content-Type']).toBe('application/json');

    // Verify body was properly serialized
    const passedBody = JSON.parse(callArgs[1].body);
    expect(passedBody).toEqual(body);
  });

  test('Request with custom headers', async () => {
    const response = await get('https://api.example.com/users', {
      headers: { 'X-API-Key': 'abc123', 'Accept-Language': 'en-US' }
    });

    expect(response.status).toBe(200);

    // Get the call arguments
    const callArgs = mockFetch.mock.calls[2];
    expect(callArgs[1].headers['X-API-Key']).toBe('abc123');
    expect(callArgs[1].headers['Accept-Language']).toBe('en-US');
  });

  test('Request with query parameters', async () => {
    const response = await get('https://api.example.com/users', {
      params: { limit: 10, page: 2 }
    });

    expect(response.status).toBe(200);

    // Get the call arguments
    const callArgs = mockFetch.mock.calls[3];
    expect(callArgs[0]).toContain('?limit=10&page=2');
  });

  test('Middleware applies to requests', async () => {
    // Create a test middleware
    const testMiddleware = createMiddleware({
      name: 'test-middleware',
      request: (req) => {
        return {
          ...req,
          headers: {
            ...req.headers,
            'X-Modified-By': 'TestMiddleware'
          }
        };
      },
      response: (res) => {
        return {
          ...res,
          modified: true
        };
      }
    });

    // Apply middleware for this test
    client.use(testMiddleware);

    const response = await get('https://api.example.com/users');

    expect(response.status).toBe(200);

    // Get the call arguments
    const callArgs = mockFetch.mock.calls[4];
    expect(callArgs[1].headers['X-Modified-By']).toBe('TestMiddleware');

    // Check if response was modified
    expect((response as any).modified).toBe(true);
  });
});
