"""
HTTP response module.
"""
import json
from typing import Any, Dict, Optional, Union
import jsonpath_ng
import jsonschema

class Response:
    """
    Represents an HTTP response.
    """

    def __init__(
        self,
        status: int,
        headers: Dict[str, str],
        data: Union[bytes, str, Dict, Any],
        time: int,
        request: Dict[str, Any],
        error: Optional[Exception] = None
    ):
        """
        Create a new Response.

        Args:
            status: HTTP status code
            headers: Response headers
            data: Response body data
            time: Response time in milliseconds
            request: Original request details
            error: Optional error that occurred
        """
        self.status = status
        self.headers = headers
        self._data = data
        self.time = time
        self.request = request
        self.error = error

    @property
    def ok(self) -> bool:
        """
        Check if the response was successful (status 200-299).

        Returns:
            bool: True if successful, False otherwise
        """
        return 200 <= self.status < 300

    def json(self) -> Any:
        """
        Get the response body as JSON.

        Returns:
            The parsed JSON data

        Raises:
            ValueError: If the response body is not valid JSON
        """
        if isinstance(self._data, (dict, list)):
            return self._data

        if isinstance(self._data, bytes):
            text = self._data.decode('utf-8')
        else:
            text = self._data

        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse response as JSON: {e}")

    def text(self) -> str:
        """
        Get the response body as text.

        Returns:
            str: The response body as a string
        """
        if isinstance(self._data, bytes):
            return self._data.decode('utf-8')
        elif isinstance(self._data, str):
            return self._data
        elif self._data is None:
            return ""
        else:
            return json.dumps(self._data)

    def content(self) -> bytes:
        """
        Get the response body as bytes.

        Returns:
            bytes: The response body as bytes
        """
        if isinstance(self._data, bytes):
            return self._data
        else:
            return self.text().encode('utf-8')

    def __repr__(self) -> str:
        """String representation of the response."""
        return f"<Response [{self.status}]>"

    # Assertion methods

    def assert_status(self, expected: int) -> 'Response':
        """
        Assert that the status code matches the expected value.

        Args:
            expected: The expected status code

        Returns:
            self for method chaining

        Raises:
            AssertionError: If the status code doesn't match
        """
        if self.status != expected:
            raise AssertionError(f"Expected status {expected} but got {self.status}")
        return self

    def assert_header(self, name: str, expected: Optional[str] = None) -> 'Response':
        """
        Assert that the response has a header with the expected value.

        Args:
            name: The header name
            expected: The expected header value, or None to just check existence

        Returns:
            self for method chaining

        Raises:
            AssertionError: If the header doesn't exist or doesn't match
        """
        header_name = next((k for k in self.headers.keys()
                           if k.lower() == name.lower()), None)

        if not header_name:
            raise AssertionError(f'Expected header "{name}" not found in response')

        if expected is not None:
            actual = self.headers[header_name]
            if actual != expected:
                raise AssertionError(
                    f'Expected header "{name}" to be "{expected}" but got "{actual}"'
                )

        return self

    def assert_json_schema(self, schema: Dict) -> 'Response':
        """
        Assert that the response body matches a JSON schema.

        Args:
            schema: The JSON schema to validate against

        Returns:
            self for method chaining

        Raises:
            AssertionError: If validation fails
        """
        try:
            data = self.json()
            jsonschema.validate(instance=data, schema=schema)
        except ValueError as e:
            raise AssertionError(f"Response body is not valid JSON: {e}")
        except jsonschema.exceptions.ValidationError as e:
            raise AssertionError(f"JSON schema validation failed: {e}")

        return self

    def assert_json_path(self, path: str, expected: Any) -> 'Response':
        """
        Assert that the response body contains the expected value at the given JSON path.

        Args:
            path: JSONPath expression
            expected: The expected value

        Returns:
            self for method chaining

        Raises:
            AssertionError: If the path doesn't exist or the value doesn't match
        """
        try:
            data = self.json()
            jsonpath_expr = jsonpath_ng.parse(path)
            matches = jsonpath_expr.find(data)

            if not matches:
                raise AssertionError(f"Path '{path}' not found in response")

            # Get the first match
            actual = matches[0].value

            if actual != expected:
                raise AssertionError(
                    f"Expected {expected!r} at path '{path}' but got {actual!r}"
                )

        except ValueError as e:
            raise AssertionError(f"Response body is not valid JSON: {e}")

        return self
