"""
Basic HTTP request example using FMUS-POST.
"""
import sys
import os

# Add the src directory to the path so we can import the module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from fmus_post import get, post, client


def basic_requests_example():
    """Demonstrate basic HTTP requests."""
    print("Basic HTTP Requests Example")
    print("--------------------------")

    # Simple GET request
    print("\nMaking GET request to httpbin.org/get...")
    response = get("https://httpbin.org/get")
    print(f"Status: {response.status}")
    print("Response headers:")
    for name, value in response.headers.items():
        print(f"  {name}: {value}")
    print("\nResponse body (JSON):")
    print(response.json())

    # POST request with JSON body
    print("\nMaking POST request to httpbin.org/post...")
    data = {
        "name": "John Smith",
        "email": "john@example.com"
    }
    response = post("https://httpbin.org/post", body=data)
    print(f"Status: {response.status}")
    print("Response contains our posted data:")
    json_data = response.json()
    print(f"  Posted name: {json_data['json']['name']}")
    print(f"  Posted email: {json_data['json']['email']}")


def client_example():
    """Demonstrate using the HTTP client."""
    print("\nHTTP Client Example")
    print("------------------")

    # Create a client with a base URL
    api_client = client({
        "base_url": "https://httpbin.org",
        "headers": {
            "User-Agent": "FMUS-POST Example/1.0",
            "X-Custom-Header": "CustomValue"
        }
    })

    # Make requests with the client
    print("\nMaking GET request to /headers with custom headers...")
    response = api_client.get("/headers")
    print(f"Status: {response.status}")

    # Show our custom headers were sent
    headers = response.json()["headers"]
    print("Custom headers in the request:")
    print(f"  User-Agent: {headers.get('User-Agent')}")
    print(f"  X-Custom-Header: {headers.get('X-Custom-Header')}")

    # Multiple requests with the same client
    print("\nMaking more requests with the same client...")
    get_response = api_client.get("/get")
    post_response = api_client.post("/post", body={"key": "value"})

    print(f"GET status: {get_response.status}")
    print(f"POST status: {post_response.status}")


if __name__ == "__main__":
    basic_requests_example()
    client_example()
