"""
Common types for FMUS-POST.
"""
from enum import Enum
from typing import Any, Dict, List, Optional, Union, TypedDict, Protocol, Callable

# HTTP methods
class HttpMethod(str, Enum):
    """HTTP methods."""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"

# Authentication
class ApiKeyLocation(str, Enum):
    """Locations for API key authentication."""
    HEADER = "header"
    QUERY = "query"
    COOKIE = "cookie"

class AuthType(str, Enum):
    """Authentication types."""
    NONE = "none"
    BASIC = "basic"
    BEARER = "bearer"
    API_KEY = "api-key"
    OAUTH2 = "oauth2"
    DIGEST = "digest"
    CUSTOM = "custom"

# Type aliases for request/response middleware
RequestMiddlewareFn = Callable[[Dict[str, Any]], Dict[str, Any]]
ResponseMiddlewareFn = Callable[[Any], Any]  # Response type is from http module
