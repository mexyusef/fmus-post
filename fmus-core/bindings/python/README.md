# FMUS-POST

Python bindings for FMUS-POST, a modern, human-centered API testing toolkit.

## Installation

```bash
pip install fmus-post
```

## Usage

### HTTP Requests

```python
from fmus_post import get, post, put, patch, delete, client

# Simple GET request
response = get('https://api.example.com/users')
print(response.json())

# POST with JSON body
user = post('https://api.example.com/users',
            body={"name": "John", "email": "john@example.com"})

# PUT with query parameters and headers
updated = put('https://api.example.com/users/1',
              params={"version": "2"},
              headers={"Content-Type": "application/json"},
              body={"name": "John Updated"})

# DELETE with authentication
deleted = delete('https://api.example.com/users/1',
                auth={"type": "bearer", "token": "my-token"})
```

### Using HTTP Client

```python
from fmus_post import client

# Create a client with base URL and default headers
api_client = client(
    base_url='https://api.example.com',
    headers={
        'Authorization': 'Bearer token123'
    }
)

# Use the client for requests
users = api_client.get('/users')
user = api_client.post('/users', body={"name": "John"})
```

### WebSockets

```python
from fmus_post import websocket

# Create a WebSocket connection
ws = websocket('wss://echo.websocket.org')

# Connect and set up event handlers
ws.connect()

@ws.on_open
def handle_open():
    print('Connected!')

@ws.on_message
def handle_message(data):
    print(f'Received: {data}')

@ws.on_close
def handle_close(code, reason):
    print(f'Disconnected: {code}, {reason}')

@ws.on_error
def handle_error(error):
    print(f'Error: {error}')

# Send messages
ws.send('Hello WebSocket!')
ws.send_json({"type": "subscribe", "channel": "updates"})

# Close the connection after 5 seconds
import time
time.sleep(5)
ws.close()
```

### GraphQL

```python
from fmus_post import graphql

# Simple query
response = graphql('https://api.example.com/graphql',
    query="""
        query GetUser($id: ID!) {
            user(id: $id) {
                name
                email
                posts {
                    title
                }
            }
        }
    """,
    variables={"id": "123"}
)

# Access data
print(response['user'])
```

### Authentication

```python
from fmus_post import get, Auth

# Basic auth
response1 = get('https://api.example.com/users',
                auth=Auth.basic('username', 'password'))

# Bearer token
response2 = get('https://api.example.com/users',
                auth=Auth.bearer('my-token'))

# API key in headers
response3 = get('https://api.example.com/users',
                auth=Auth.api_key('X-API-Key', 'api-key-value'))
```

### Middleware

```python
from fmus_post import create_middleware, client

# Create a logger middleware
def logger_request(request):
    print(f"{request.method} {request.url}")
    return request

def logger_response(response):
    print(f"Response: {response.status}")
    return response

logger = create_middleware(
    name="logger",
    request=logger_request,
    response=logger_response
)

# Use middleware globally
api_client = client(base_url='https://api.example.com')
api_client.use(logger)

# Make requests with middleware
response = api_client.get('/users')
```

## API Reference

See the [full documentation](https://your-documentation-url.com) for detailed API reference.

## Development

### Setup

```bash
# Clone the repository
git clone https://github.com/mexyusef/fmus-post.git
cd fmus-post/fmus-core/bindings/python

# Install development dependencies
pip install -e ".[dev]"
```

### Testing

```bash
pytest
```

### Linting and Formatting

```bash
# Format code
black src tests

# Sort imports
isort src tests

# Type checking
mypy src

# Linting
flake8 src tests
```

## License

MIT
