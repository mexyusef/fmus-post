"""
HTTP client module for making HTTP requests.
"""
import time
from typing import Any, Dict, List, Optional, Union
import requests
from requests.auth import HTTPBasicAuth, HTTPDigestAuth

from .response import Response
from ..middleware import MiddlewareManager

class HttpClient:
    """
    HTTP client for making API requests.
    """

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Create a new HTTP client.

        Args:
            config: Configuration options
                - base_url: Base URL for all requests
                - timeout: Request timeout in seconds
                - headers: Default headers for all requests
        """
        self.config = config or {}
        self.session = requests.Session()
        self.middleware_manager = MiddlewareManager()

        # Add default headers
        self.session.headers.update({
            'User-Agent': 'fmus-post/0.0.1',
            **(self.config.get('headers', {}))
        })

    def use(self, middleware):
        """
        Add middleware to the client.

        Args:
            middleware: Middleware instance

        Returns:
            self for method chaining
        """
        self.middleware_manager.add(middleware)
        return self

    def request(self, method: str, url: str, **kwargs) -> Response:
        """
        Send an HTTP request.

        Args:
            method: HTTP method (GET, POST, etc.)
            url: URL to request
            **kwargs: Request options
                - params: Query parameters
                - headers: Request headers
                - body: Request body
                - auth: Authentication configuration
                - timeout: Request timeout in seconds

        Returns:
            Response: Response object
        """
        # Start timing the request
        start_time = time.time()

        # Build request config
        config = {
            'method': method,
            'url': self._build_url(url),
            'headers': kwargs.get('headers', {}),
            'params': kwargs.get('params', {}),
            'body': kwargs.get('body'),
            'timeout': kwargs.get('timeout', self.config.get('timeout', 30)),
            'auth': kwargs.get('auth')
        }

        # Apply request middleware
        config = self.middleware_manager.apply_to_request(config)

        # Prepare request arguments
        request_kwargs = {
            'headers': config['headers'],
            'params': config['params'],
            'timeout': config['timeout']
        }

        # Add request body if present
        if config['body'] is not None:
            request_kwargs['json'] = config['body']

        # Add authentication if present
        if config['auth'] is not None:
            request_kwargs['auth'] = self._get_auth(config['auth'])

        # Send the request
        error = None
        try:
            resp = self.session.request(config['method'], config['url'], **request_kwargs)
        except Exception as e:
            # Handle request exceptions
            error = e
            resp = None

        # Calculate response time
        elapsed_time = int((time.time() - start_time) * 1000)

        # Build response object
        if resp is not None:
            response = Response(
                status=resp.status_code,
                headers=dict(resp.headers),
                data=resp.content,
                time=elapsed_time,
                request=config,
                error=error
            )
        else:
            # Create error response
            response = Response(
                status=0,
                headers={},
                data=None,
                time=elapsed_time,
                request=config,
                error=error
            )

        # Apply response middleware
        response = self.middleware_manager.apply_to_response(response)

        return response

    def _build_url(self, url: str) -> str:
        """Build the full URL based on the base URL (if any) and the given URL."""
        if url.startswith(('http://', 'https://')):
            return url

        base_url = self.config.get('base_url', '')
        if not base_url:
            return url

        if base_url.endswith('/') and url.startswith('/'):
            return base_url + url[1:]
        elif not base_url.endswith('/') and not url.startswith('/'):
            return base_url + '/' + url
        else:
            return base_url + url

    def _get_auth(self, auth_config: Dict[str, Any]):
        """Convert auth config to requests auth object."""
        auth_type = auth_config.get('type', '').lower()

        if auth_type == 'basic':
            return HTTPBasicAuth(auth_config.get('username', ''),
                                auth_config.get('password', ''))
        elif auth_type == 'bearer':
            return BearerAuth(auth_config.get('token', ''))
        elif auth_type == 'digest':
            return HTTPDigestAuth(auth_config.get('username', ''),
                                 auth_config.get('password', ''))
        elif auth_type == 'api-key':
            # API key auth is handled by adding headers or params,
            # not through the auth parameter
            location = auth_config.get('location', 'header').lower()
            key = auth_config.get('key', '')
            value = auth_config.get('value', '')

            if location == 'header':
                self.session.headers[key] = value
            elif location == 'query':
                self.session.params[key] = value

            return None

        return None

    def get(self, url, **kwargs):
        """Send a GET request."""
        return self.request('GET', url, **kwargs)

    def post(self, url, **kwargs):
        """Send a POST request."""
        return self.request('POST', url, **kwargs)

    def put(self, url, **kwargs):
        """Send a PUT request."""
        return self.request('PUT', url, **kwargs)

    def patch(self, url, **kwargs):
        """Send a PATCH request."""
        return self.request('PATCH', url, **kwargs)

    def delete(self, url, **kwargs):
        """Send a DELETE request."""
        return self.request('DELETE', url, **kwargs)

    def head(self, url, **kwargs):
        """Send a HEAD request."""
        return self.request('HEAD', url, **kwargs)

    def options(self, url, **kwargs):
        """Send an OPTIONS request."""
        return self.request('OPTIONS', url, **kwargs)


class BearerAuth(requests.auth.AuthBase):
    """Bearer token authentication for requests."""

    def __init__(self, token):
        self.token = token

    def __call__(self, r):
        r.headers['Authorization'] = f'Bearer {self.token}'
        return r


# Module-level convenience functions

def client(config=None):
    """Create a new HTTP client with the given configuration."""
    return HttpClient(config)

def get(url, **kwargs):
    """Send a GET request."""
    return HttpClient().get(url, **kwargs)

def post(url, **kwargs):
    """Send a POST request."""
    return HttpClient().post(url, **kwargs)

def put(url, **kwargs):
    """Send a PUT request."""
    return HttpClient().put(url, **kwargs)

def patch(url, **kwargs):
    """Send a PATCH request."""
    return HttpClient().patch(url, **kwargs)

def delete(url, **kwargs):
    """Send a DELETE request."""
    return HttpClient().delete(url, **kwargs)

def head(url, **kwargs):
    """Send a HEAD request."""
    return HttpClient().head(url, **kwargs)

def options(url, **kwargs):
    """Send an OPTIONS request."""
    return HttpClient().options(url, **kwargs)
