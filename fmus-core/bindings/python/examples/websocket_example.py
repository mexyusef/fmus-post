"""
WebSocket example using FMUS-POST.
"""
import sys
import os
import time

# Add the src directory to the path so we can import the module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from fmus_post import websocket


def decorator_style():
    """Demonstrate WebSocket with decorator-style event handlers."""
    print("WebSocket Example (Decorator Style)")
    print("----------------------------------")

    # Create WebSocket client
    ws = websocket("wss://echo.websocket.org")
    print("Connecting to echo.websocket.org...")

    # Set up event handlers using decorators
    @ws.on_open
    def handle_open():
        print("Connected! Sending a message...")
        ws.send("Hello, WebSocket!")
        # Send a JSON message too
        ws.send_json({
            "type": "greeting",
            "message": "Hello from FMUS-POST",
            "timestamp": time.time()
        })

    @ws.on_message
    def handle_message(data):
        print(f"Received message: {data}")

    @ws.on_close
    def handle_close(code, reason):
        print(f"Connection closed: Code={code}, Reason={reason}")

    @ws.on_error
    def handle_error(error):
        print(f"Error: {error}")

    try:
        # Connect and wait for messages
        ws.connect()

        # Keep the connection open for a while
        print("Waiting for messages (will close after 5 seconds)...")
        time.sleep(5)

    except Exception as e:
        print(f"Failed to connect: {e}")
    finally:
        # Close the connection
        print("Closing connection...")
        ws.close()


def direct_style():
    """Demonstrate WebSocket with direct function assignment."""
    print("\nWebSocket Example (Direct Assignment Style)")
    print("-----------------------------------------")

    # Create WebSocket client
    ws = websocket("wss://echo.websocket.org")
    print("Connecting to echo.websocket.org...")

    # Define event handlers
    def on_open():
        print("Connected! Sending a message...")
        ws.send("Hello, WebSocket!")

    def on_message(data):
        print(f"Received message: {data}")

    def on_close(code, reason):
        print(f"Connection closed: Code={code}, Reason={reason}")

    def on_error(error):
        print(f"Error: {error}")

    # Assign event handlers
    ws.on_open(on_open)
    ws.on_message(on_message)
    ws.on_close(on_close)
    ws.on_error(on_error)

    try:
        # Connect and wait for messages
        ws.connect()

        # Keep the connection open for a while
        print("Waiting for messages (will close after 5 seconds)...")
        time.sleep(5)

    except Exception as e:
        print(f"Failed to connect: {e}")
    finally:
        # Close the connection
        print("Closing connection...")
        ws.close()


if __name__ == "__main__":
    decorator_style()
    direct_style()
