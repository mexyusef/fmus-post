"""
WebSocket module for FMUS-POST.

This module provides WebSocket client functionality for real-time communication.
"""
import json
import threading
import time
from typing import Any, Callable, Dict, List, Optional, Union
import websocket

# Type definitions
OpenHandler = Callable[[], None]
MessageHandler = Callable[[Union[str, bytes]], None]
CloseHandler = Callable[[int, str], None]
ErrorHandler = Callable[[Exception], None]


class WebSocketClient:
    """
    WebSocket client for real-time communication.
    """

    def __init__(self, url: str, options: Optional[Dict[str, Any]] = None):
        """
        Create a new WebSocket client.

        Args:
            url: WebSocket server URL
            options: Connection options
                - headers: Custom headers
                - protocols: WebSocket protocols
                - timeout: Connection timeout
                - reconnect: Whether to reconnect after disconnection
                - max_reconnect_attempts: Maximum reconnection attempts
        """
        self.url = url
        self.options = options or {}
        self.ws = None
        self.connected = False
        self.reconnect_attempts = 0

        # Event handlers
        self._on_open_handler = None
        self._on_message_handler = None
        self._on_close_handler = None
        self._on_error_handler = None

        # Default options
        if 'timeout' not in self.options:
            self.options['timeout'] = 30
        if 'reconnect' not in self.options:
            self.options['reconnect'] = False
        if 'max_reconnect_attempts' not in self.options:
            self.options['max_reconnect_attempts'] = 3

    def connect(self):
        """
        Connect to the WebSocket server.

        Raises:
            Exception: If connection fails
        """
        try:
            self.ws = websocket.WebSocketApp(
                self.url,
                header=self.options.get('headers', {}),
                on_open=self._on_open,
                on_message=self._on_message,
                on_close=self._on_close,
                on_error=self._on_error
            )

            # Start the WebSocket connection in a separate thread
            wst = threading.Thread(target=self._connect_background)
            wst.daemon = True
            wst.start()

            # Wait for connection to establish or fail
            timeout = self.options.get('timeout', 30)
            start_time = time.time()
            while not self.connected and (time.time() - start_time) < timeout:
                time.sleep(0.1)

            if not self.connected:
                raise Exception(f"Failed to connect to {self.url} within {timeout} seconds")

        except Exception as e:
            if self._on_error_handler:
                self._on_error_handler(e)
            raise

    def _connect_background(self):
        """Run the WebSocket connection in the background."""
        self.ws.run_forever()

    def _on_open(self, ws):
        """Handle WebSocket open event."""
        self.connected = True
        self.reconnect_attempts = 0
        if self._on_open_handler:
            self._on_open_handler()

    def _on_message(self, ws, message):
        """Handle WebSocket message event."""
        if self._on_message_handler:
            self._on_message_handler(message)

    def _on_close(self, ws, close_code, close_reason):
        """Handle WebSocket close event."""
        self.connected = False

        if self._on_close_handler:
            self._on_close_handler(close_code, close_reason)

        # Handle reconnection
        if (self.options.get('reconnect', False) and
                self.reconnect_attempts < self.options.get('max_reconnect_attempts', 3)):
            self.reconnect_attempts += 1
            time.sleep(1 * (2 ** self.reconnect_attempts))  # Exponential backoff
            try:
                self.connect()
            except Exception:
                # Failed to reconnect
                pass

    def _on_error(self, ws, error):
        """Handle WebSocket error event."""
        if self._on_error_handler:
            self._on_error_handler(error)

    def on_open(self, handler: Optional[OpenHandler] = None):
        """
        Set the open event handler.

        Args:
            handler: Function to call when connection opens
        """
        if handler:
            self._on_open_handler = handler

        # Return self for use as a decorator
        return handler if handler else lambda f: self._set_open_handler(f)

    def _set_open_handler(self, handler: OpenHandler):
        """Set open handler and return it (for decorator usage)."""
        self._on_open_handler = handler
        return handler

    def on_message(self, handler: Optional[MessageHandler] = None):
        """
        Set the message event handler.

        Args:
            handler: Function to call when a message is received
        """
        if handler:
            self._on_message_handler = handler

        # Return self for use as a decorator
        return handler if handler else lambda f: self._set_message_handler(f)

    def _set_message_handler(self, handler: MessageHandler):
        """Set message handler and return it (for decorator usage)."""
        self._on_message_handler = handler
        return handler

    def on_close(self, handler: Optional[CloseHandler] = None):
        """
        Set the close event handler.

        Args:
            handler: Function to call when connection closes
        """
        if handler:
            self._on_close_handler = handler

        # Return self for use as a decorator
        return handler if handler else lambda f: self._set_close_handler(f)

    def _set_close_handler(self, handler: CloseHandler):
        """Set close handler and return it (for decorator usage)."""
        self._on_close_handler = handler
        return handler

    def on_error(self, handler: Optional[ErrorHandler] = None):
        """
        Set the error event handler.

        Args:
            handler: Function to call when an error occurs
        """
        if handler:
            self._on_error_handler = handler

        # Return self for use as a decorator
        return handler if handler else lambda f: self._set_error_handler(f)

    def _set_error_handler(self, handler: ErrorHandler):
        """Set error handler and return it (for decorator usage)."""
        self._on_error_handler = handler
        return handler

    def send(self, data: Union[str, bytes]) -> None:
        """
        Send data to the WebSocket server.

        Args:
            data: String or bytes to send

        Raises:
            Exception: If not connected or send fails
        """
        if not self.connected or not self.ws:
            raise Exception("WebSocket is not connected")

        self.ws.send(data)

    def send_json(self, data: Any) -> None:
        """
        Send JSON data to the WebSocket server.

        Args:
            data: Object to be JSON-serialized and sent

        Raises:
            Exception: If not connected or send fails
        """
        json_str = json.dumps(data)
        self.send(json_str)

    def close(self, code: int = 1000, reason: str = "") -> None:
        """
        Close the WebSocket connection.

        Args:
            code: WebSocket close code
            reason: Close reason
        """
        if self.ws:
            self.ws.close(code, reason)
            self.connected = False

    @property
    def is_connected(self) -> bool:
        """Check if the WebSocket is connected."""
        return self.connected


def websocket(url: str, options: Optional[Dict[str, Any]] = None) -> WebSocketClient:
    """
    Create a new WebSocket client.

    Args:
        url: WebSocket server URL
        options: Connection options

    Returns:
        WebSocketClient instance
    """
    return WebSocketClient(url, options)
