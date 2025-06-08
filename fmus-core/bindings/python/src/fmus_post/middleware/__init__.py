"""
Middleware module for FMUS-POST.

This module provides a middleware system for processing requests and responses.
"""
from typing import Any, Callable, Dict, List, Optional, Union

# Type definitions
RequestMiddlewareFn = Callable[[Dict[str, Any]], Dict[str, Any]]
ResponseMiddlewareFn = Callable[[Any], Any]  # Response type is from http module


class Middleware:
    """
    Middleware for processing requests and responses.
    """

    def __init__(
        self,
        name: str,
        request: Optional[RequestMiddlewareFn] = None,
        response: Optional[ResponseMiddlewareFn] = None
    ):
        """
        Create a new middleware.

        Args:
            name: Middleware name
            request: Function to process requests before they're sent
            response: Function to process responses after they're received
        """
        self.name = name
        self.request_fn = request
        self.response_fn = response

    def apply_to_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply middleware to a request.

        Args:
            request: Request configuration

        Returns:
            Processed request configuration
        """
        if self.request_fn:
            return self.request_fn(request)
        return request

    def apply_to_response(self, response: Any) -> Any:
        """
        Apply middleware to a response.

        Args:
            response: Response object

        Returns:
            Processed response
        """
        if self.response_fn:
            return self.response_fn(response)
        return response


class MiddlewareManager:
    """
    Manager for middleware chains.
    """

    def __init__(self):
        """Create a new middleware manager."""
        self.middlewares: List[Middleware] = []

    def add(self, middleware: Middleware) -> None:
        """
        Add middleware to the manager.

        Args:
            middleware: Middleware to add
        """
        self.middlewares.append(middleware)

    def apply_to_request(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply all middleware to a request.

        Args:
            request: Request configuration

        Returns:
            Processed request configuration
        """
        result = request
        for middleware in self.middlewares:
            result = middleware.apply_to_request(result)
        return result

    def apply_to_response(self, response: Any) -> Any:
        """
        Apply all middleware to a response.

        Args:
            response: Response object

        Returns:
            Processed response
        """
        result = response
        # Apply middleware in reverse order for responses
        for middleware in reversed(self.middlewares):
            result = middleware.apply_to_response(result)
        return result


def create_middleware(
    name: str,
    request: Optional[RequestMiddlewareFn] = None,
    response: Optional[ResponseMiddlewareFn] = None
) -> Middleware:
    """
    Create a new middleware.

    Args:
        name: Middleware name
        request: Function to process requests
        response: Function to process responses

    Returns:
        Middleware instance
    """
    return Middleware(name, request, response)
