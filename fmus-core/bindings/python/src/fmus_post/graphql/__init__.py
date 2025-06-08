"""
GraphQL module for FMUS-POST.

This module provides GraphQL client functionality for working with GraphQL APIs.
"""
from typing import Any, Dict, List, Optional, Union
from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport


class GraphQLClient:
    """
    GraphQL client for making GraphQL queries and mutations.
    """

    def __init__(self, endpoint: str, options: Optional[Dict[str, Any]] = None):
        """
        Create a new GraphQL client.

        Args:
            endpoint: GraphQL endpoint URL
            options: Client options
                - headers: Custom headers
                - auth: Authentication configuration
                - timeout: Request timeout in seconds
        """
        self.endpoint = endpoint
        self.options = options or {}

        # Setup transport with default options
        headers = self.options.get('headers', {})

        # Apply authentication to headers if provided
        if 'auth' in self.options:
            self._apply_auth(headers, self.options['auth'])

        # Create transport
        transport = RequestsHTTPTransport(
            url=self.endpoint,
            headers=headers,
            timeout=self.options.get('timeout', 30)
        )

        # Create client
        self.client = Client(transport=transport, fetch_schema_from_transport=True)

    def query(self, query_str: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Execute a GraphQL query or mutation.

        Args:
            query_str: GraphQL query/mutation string
            variables: Query variables

        Returns:
            Query results

        Raises:
            Exception: If the query fails
        """
        # Parse the query
        query = gql(query_str)

        # Execute and return results
        result = self.client.execute(query, variable_values=variables or {})
        return result

    def _apply_auth(self, headers: Dict[str, str], auth: Dict[str, Any]) -> None:
        """Apply authentication to headers."""
        auth_type = auth.get('type', '').lower()

        if auth_type == 'basic':
            import base64
            auth_str = f"{auth.get('username', '')}:{auth.get('password', '')}"
            encoded = base64.b64encode(auth_str.encode()).decode()
            headers['Authorization'] = f"Basic {encoded}"

        elif auth_type == 'bearer':
            headers['Authorization'] = f"Bearer {auth.get('token', '')}"

        elif auth_type == 'api-key':
            if auth.get('location', 'header').lower() == 'header':
                headers[auth.get('key', '')] = auth.get('value', '')


def graphql(
    endpoint: str,
    query: str = None,
    variables: Optional[Dict[str, Any]] = None,
    options: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Execute a GraphQL query/mutation.

    Args:
        endpoint: GraphQL endpoint URL
        query: GraphQL query string
        variables: Query variables
        options: Client options
            - headers: Custom headers
            - auth: Authentication configuration

    Returns:
        Query results

    Raises:
        Exception: If the query fails or is not provided
    """
    if not query:
        raise ValueError("GraphQL query is required")

    client = GraphQLClient(endpoint, options)
    return client.query(query, variables)
