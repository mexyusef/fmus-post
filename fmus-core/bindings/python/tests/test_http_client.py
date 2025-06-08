"""
Tests for the HTTP client module.
"""
import unittest
from unittest import mock
import json

from fmus_post.http import get, post, client, HttpClient
from fmus_post.http.response import Response


class TestHttpClient(unittest.TestCase):
    """Tests for the HTTP client."""

    @mock.patch('requests.Session.request')
    def test_get_request(self, mock_request):
        """Test basic GET request."""
        # Mock the response
        mock_response = mock.MagicMock()
        mock_response.status_code = 200
        mock_response.headers = {'Content-Type': 'application/json'}
        mock_response.content = json.dumps({'key': 'value'}).encode('utf-8')
        mock_request.return_value = mock_response

        # Make request
        response = get('https://api.example.com/test')

        # Assertions
        self.assertEqual(response.status, 200)
        self.assertEqual(response.headers['Content-Type'], 'application/json')
        self.assertEqual(response.json(), {'key': 'value'})

        # Check that the request was made correctly
        mock_request.assert_called_once()
        args, kwargs = mock_request.call_args
        self.assertEqual(args[0], 'GET')
        self.assertEqual(args[1], 'https://api.example.com/test')

    @mock.patch('requests.Session.request')
    def test_post_request_with_json(self, mock_request):
        """Test POST request with JSON body."""
        # Mock the response
        mock_response = mock.MagicMock()
        mock_response.status_code = 201
        mock_response.headers = {'Content-Type': 'application/json'}
        mock_response.content = json.dumps({'id': 123}).encode('utf-8')
        mock_request.return_value = mock_response

        # Make request
        response = post(
            'https://api.example.com/users',
            body={'name': 'Test User', 'email': 'test@example.com'}
        )

        # Assertions
        self.assertEqual(response.status, 201)
        self.assertEqual(response.json(), {'id': 123})

        # Check that the request was made correctly
        mock_request.assert_called_once()
        args, kwargs = mock_request.call_args
        self.assertEqual(args[0], 'POST')
        self.assertEqual(args[1], 'https://api.example.com/users')
        self.assertEqual(kwargs['json'], {'name': 'Test User', 'email': 'test@example.com'})

    @mock.patch('requests.Session.request')
    def test_client_with_base_url(self, mock_request):
        """Test client with base URL."""
        # Mock the response
        mock_response = mock.MagicMock()
        mock_response.status_code = 200
        mock_response.headers = {'Content-Type': 'application/json'}
        mock_response.content = json.dumps({'key': 'value'}).encode('utf-8')
        mock_request.return_value = mock_response

        # Create client and make request
        api_client = client({'base_url': 'https://api.example.com'})
        response = api_client.get('/test')

        # Assertions
        self.assertEqual(response.status, 200)

        # Check that the request was made with the correct URL
        mock_request.assert_called_once()
        args, kwargs = mock_request.call_args
        self.assertEqual(args[1], 'https://api.example.com/test')

    @mock.patch('requests.Session.request')
    def test_error_handling(self, mock_request):
        """Test HTTP error handling."""
        # Mock an exception
        mock_request.side_effect = Exception("Connection error")

        # Make request
        response = get('https://api.example.com/test')

        # Assertions
        self.assertEqual(response.status, 0)
        self.assertIsNotNone(response.error)
        self.assertEqual(str(response.error), "Connection error")


if __name__ == '__main__':
    unittest.main()
