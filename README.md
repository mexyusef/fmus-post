# FMUS-POST

A modern API testing toolkit.

## Project Structure

This project consists of three main components:

1. **fmus-core**: Core library for API testing
   - TypeScript bindings for easy integration with web and Node.js projects
   - Supports various API protocols (HTTP, WebSocket, GraphQL)

2. **fmus-ui-tauri**: Modern desktop app built with Tauri
   - React-based UI for a smooth user experience
   - Uses the core library for API testing functionality

3. **fmus-cli**: Command line interface
   - Simple CLI for integration with CI/CD pipelines
   - Supports collection and environment files

## Getting Started

### Core Library (TypeScript)

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
```

### CLI

```bash
# Simple GET request
fmus-post request get https://api.example.com/users

# POST request with body
fmus-post request post https://api.example.com/users -b '{"name":"John"}'

# Run a collection with environment
fmus-post collection my-collection.json -e dev-environment.json
```

### Desktop Application

The desktop application provides a user-friendly interface for:

- Creating and sending requests
- Viewing response details
- Managing collections and environments
- Running automated tests

## Development

### Prerequisites

- Node.js 16+
- Rust (for Tauri)
- C++ development environment (for native modules)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mexyusef/fmus-post.git
   cd fmus-post
   ```

2. Install dependencies for each component:
   ```bash
   # Core library
   cd fmus-core/bindings/ts
   npm install

   # Desktop UI
   cd ../../fmus-ui-tauri
   npm install

   # CLI
   cd ../fmus-cli
   npm install
   ```

3. Build all components:
   ```bash
   npm run build
   ```

4. Install the CLI globally for testing:
   ```bash
   npm install -g ./dist/packages/cli
   ```

## License

MIT
