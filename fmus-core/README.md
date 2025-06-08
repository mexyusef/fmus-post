# FMUS-Core

Core library for FMUS-POST, a modern, human-centered API testing toolkit.

## Overview

FMUS-Core is implemented in Rust with bindings for TypeScript and Python. It provides a powerful and flexible foundation for API testing with support for:

- HTTP/HTTPS requests
- WebSocket connections
- GraphQL operations
- gRPC communication (planned)
- Pre/post request processing via middleware
- Authentication mechanisms
- Environment variables for test configuration

## Getting Started

### Usage with TypeScript

```typescript
import { get, post, client } from 'fmus-post';

// Simple GET request
const response = await get('https://api.example.com/users');
console.log(response.json());

// Create a client with base URL and default headers
const apiClient = client({
  baseUrl: 'https://api.example.com',
  headers: {
    'Authorization': 'Bearer token123'
  }
});

// Use the client for requests
const user = await apiClient.get('/users/1');
console.log(user.json());

// Post with JSON body
const createResponse = await post('https://api.example.com/users', {
  body: { name: 'John', email: 'john@example.com' }
});

// Working with WebSockets
import { websocket } from 'fmus-post';

const ws = websocket('wss://echo.websocket.org');
await ws.connect();

ws.on('open', () => console.log('Connected!'));
ws.on('message', (data) => console.log('Received:', data));

ws.send('Hello WebSocket!');

// Close after 5 seconds
setTimeout(() => ws.close(), 5000);

// GraphQL requests
import { graphql } from 'fmus-post';

const response = await graphql('https://api.example.com/graphql', {
  query: `
    query GetUser($id: ID!) {
      user(id: $id) {
        name
        email
      }
    }
  `,
  variables: { id: '123' }
});
```

### Building from Source

#### Prerequisites

- Rust (latest stable)
- Node.js (v16+) for TypeScript bindings
- Python (3.8+) for Python bindings

#### Build Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/mexyusef/fmus-post.git
   cd fmus-post/fmus-core
   ```

2. Build the core Rust library:
   ```bash
   cargo build --release
   ```

3. Build the TypeScript bindings:
   ```bash
   cd bindings/ts
   npm install
   npm run build
   ```

4. Build the Python bindings:
   ```bash
   cd bindings/python
   pip install -e .
   ```

## Architecture

FMUS-Core follows a modular architecture with clean separation of concerns:

- **HTTP Module**: Core HTTP client and response processing
- **WebSocket Module**: Real-time bidirectional communication
- **GraphQL Module**: Specialized GraphQL client
- **gRPC Module**: (Planned) Protocol buffer-based RPC
- **Middleware System**: Request/response pipeline processing
- **Authentication**: Various auth mechanisms (Basic, Bearer, OAuth, etc.)
- **Utils**: Common utilities and helpers

## License

MIT
