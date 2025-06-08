"""
FMUS-POST - A modern, human-centered API testing toolkit.

This is the main entry point for the FMUS-POST Python library.
"""

# HTTP client exports
from .http.client import get, post, put, patch, delete, head, options, client, HttpClient

# Response class
from .http.response import Response

# Authentication
from .auth import Auth

# Middleware
from .middleware import create_middleware, Middleware, MiddlewareManager

# WebSocket
from .ws import websocket, WebSocketClient

# GraphQL
from .graphql import graphql, GraphQLClient

# Version
__version__ = "0.0.1"


def create_client(config=None):
    """
    Create a pre-configured HTTP client.

    Args:
        config (dict, optional): Client configuration

    Returns:
        HttpClient: A new HTTP client
    """
    return client(config)
