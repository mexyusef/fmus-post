# FMUS-POST

TypeScript bindings for FMUS-POST, a modern, human-centered API testing toolkit.

## Installation

```bash
npm install fmus-post
# or
yarn add fmus-post
# or
bun add fmus-post
```

## Usage

### HTTP Requests

```typescript
import { get, post, put, patch, del, client } from 'fmus-post';

// Simple GET request
const response = await get('https://api.example.com/users');
console.log(response.json());

// POST with JSON body
const user = await post('https://api.example.com/users', {
  body: { name: 'John', email: 'john@example.com' }
});

// PUT with query parameters and headers
const updated = await put('https://api.example.com/users/1', {
  params: { version: '2' },
  headers: { 'Content-Type': 'application/json' },
  body: { name: 'John Updated' }
});

// DELETE with authentication
const deleted = await del('https://api.example.com/users/1', {
  auth: { type: 'bearer', token: 'my-token' }
});
```

### Using HTTP Client

```typescript
import { client } from 'fmus-post';

// Create a client with base URL and default headers
const apiClient = client({
  baseUrl: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer token123'
  }
});

// Use the client for requests
const users = await apiClient.get('/users');
const user = await apiClient.post('/users', {
  body: { name: 'John' }
});
```

### WebSockets

```typescript
import { websocket } from 'fmus-post';

// Create a WebSocket connection
const ws = websocket('wss://echo.websocket.org');

// Connect and set up event handlers
await ws.connect();

ws.on('open', () => console.log('Connected!'));
ws.on('message', (data) => console.log('Received:', data));
ws.on('close', (event) => console.log('Disconnected:', event.code, event.reason));
ws.on('error', (error) => console.error('Error:', error));

// Send messages
ws.send('Hello WebSocket!');
ws.sendJSON({ type: 'subscribe', channel: 'updates' });

// Close the connection
setTimeout(() => ws.close(), 5000);
```

### GraphQL

```typescript
import { graphql } from 'fmus-post';

// Simple query
const response = await graphql('https://api.example.com/graphql', {
  query: `
    query GetUser($id: ID!) {
      user(id: $id) {
        name
        email
        posts {
          title
        }
      }
    }
  `,
  variables: { id: '123' }
});

// Access data
console.log(response.user);
```

### Authentication

```typescript
import { Auth, get } from 'fmus-post';

// Basic auth
const response1 = await get('https://api.example.com/users', {
  auth: Auth.basic('username', 'password')
});

// Bearer token
const response2 = await get('https://api.example.com/users', {
  auth: Auth.bearer('my-token')
});

// API key in headers
const response3 = await get('https://api.example.com/users', {
  auth: Auth.apiKey('X-API-Key', 'api-key-value')
});
```

### Middleware

```typescript
import { createMiddleware, client } from 'fmus-post';

// Create a logger middleware
const logger = createMiddleware({
  name: 'logger',
  request: (req) => {
    console.log(`${req.method} ${req.url}`);
    return req;
  },
  response: (res) => {
    console.log(`Response: ${res.status}`);
    return res;
  }
});

// Use middleware globally
const apiClient = client({
  baseUrl: 'https://api.example.com'
});

apiClient.use(logger);

// Make requests with middleware
const response = await apiClient.get('/users');
```

## API Reference

See the [full documentation](https://your-documentation-url.com) for detailed API reference.

## License

MIT
