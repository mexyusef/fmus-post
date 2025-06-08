"""
Authentication module for FMUS-POST.

This module provides utilities for authenticating API requests.
"""
from enum import Enum
from typing import Dict, List, Optional, Union, Any

class ApiKeyLocation(str, Enum):
    """Locations for API key authentication."""
    HEADER = "header"
    QUERY = "query"
    COOKIE = "cookie"


class Auth:
    """
    Authentication utilities.

    This class provides static methods for creating different types of
    authentication configurations.
    """

    @staticmethod
    def basic(username: str, password: str) -> Dict[str, Any]:
        """
        Create basic authentication configuration.

        Args:
            username: The username
            password: The password

        Returns:
            Basic authentication configuration
        """
        return {
            "type": "basic",
            "username": username,
            "password": password
        }

    @staticmethod
    def bearer(token: str) -> Dict[str, Any]:
        """
        Create bearer token authentication configuration.

        Args:
            token: The bearer token

        Returns:
            Bearer token authentication configuration
        """
        return {
            "type": "bearer",
            "token": token
        }

    @staticmethod
    def api_key(key: str, value: str, location: str = ApiKeyLocation.HEADER) -> Dict[str, Any]:
        """
        Create API key authentication configuration.

        Args:
            key: The API key name
            value: The API key value
            location: Where to place the API key (header, query, cookie)

        Returns:
            API key authentication configuration
        """
        return {
            "type": "api-key",
            "key": key,
            "value": value,
            "location": location
        }

    @staticmethod
    def digest(username: str, password: str) -> Dict[str, Any]:
        """
        Create digest authentication configuration.

        Args:
            username: The username
            password: The password

        Returns:
            Digest authentication configuration
        """
        return {
            "type": "digest",
            "username": username,
            "password": password
        }

    @staticmethod
    def oauth2(
        client_id: str,
        client_secret: str,
        token_url: str,
        scopes: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Create OAuth 2.0 authentication configuration.

        Args:
            client_id: OAuth client ID
            client_secret: OAuth client secret
            token_url: Token endpoint URL
            scopes: OAuth scopes to request

        Returns:
            OAuth 2.0 authentication configuration
        """
        return {
            "type": "oauth2",
            "client_id": client_id,
            "client_secret": client_secret,
            "token_url": token_url,
            "scopes": scopes or []
        }

    @staticmethod
    def custom(auth_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create custom authentication configuration.

        Args:
            auth_type: Authentication type identifier
            data: Authentication data

        Returns:
            Custom authentication configuration
        """
        return {
            "type": "custom",
            "auth_type": auth_type,
            "data": data
        }
