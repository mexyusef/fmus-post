"""
Utilities module for FMUS-POST.

This module provides various helper utilities for working with API requests.
"""
import json
import os
import re
from typing import Any, Dict, List, Optional, Union

class Environment:
    """
    Represents an environment with variables for API testing.
    """

    def __init__(self, name: str = "", variables: Optional[Dict[str, str]] = None):
        """
        Create a new environment.

        Args:
            name: Environment name
            variables: Initial environment variables
        """
        self.name = name
        self.variables = variables or {}

    def get(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """
        Get a variable value.

        Args:
            key: Variable name
            default: Default value if not found

        Returns:
            Variable value or default
        """
        return self.variables.get(key, default)

    def set(self, key: str, value: str) -> None:
        """
        Set a variable value.

        Args:
            key: Variable name
            value: Variable value
        """
        self.variables[key] = value

    def delete(self, key: str) -> None:
        """
        Delete a variable.

        Args:
            key: Variable name to delete
        """
        if key in self.variables:
            del self.variables[key]

    def load(self, file_path: str) -> None:
        """
        Load environment from a JSON file.

        Args:
            file_path: Path to JSON file

        Raises:
            Exception: If file can't be loaded
        """
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)

            if isinstance(data, dict):
                if "name" in data:
                    self.name = data["name"]

                if "variables" in data and isinstance(data["variables"], dict):
                    self.variables = data["variables"]
                else:
                    # Assume the whole dict is variables
                    self.variables = data

        except Exception as e:
            raise Exception(f"Failed to load environment: {e}")

    def save(self, file_path: str) -> None:
        """
        Save environment to a JSON file.

        Args:
            file_path: Path to save JSON file

        Raises:
            Exception: If file can't be saved
        """
        try:
            data = {
                "name": self.name,
                "variables": self.variables
            }

            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)

        except Exception as e:
            raise Exception(f"Failed to save environment: {e}")

    def resolve(self, text: str) -> str:
        """
        Resolve variables in a text string.

        Replaces {{variable}} patterns with their values.

        Args:
            text: Text with variable placeholders

        Returns:
            Text with variables resolved
        """
        if not text:
            return text

        def replace_var(match):
            var_name = match.group(1).strip()
            return self.get(var_name, "")

        pattern = r"\{\{(.*?)\}\}"
        return re.sub(pattern, replace_var, text)

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert environment to a dictionary.

        Returns:
            Dictionary representation
        """
        return {
            "name": self.name,
            "variables": self.variables
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Environment':
        """
        Create an environment from a dictionary.

        Args:
            data: Dictionary with environment data

        Returns:
            Environment instance
        """
        name = data.get("name", "")
        variables = data.get("variables", {})
        return cls(name, variables)


class Collection:
    """
    Represents a collection of API requests.
    """

    def __init__(self, name: str = "", description: str = ""):
        """
        Create a new collection.

        Args:
            name: Collection name
            description: Collection description
        """
        self.name = name
        self.description = description
        self.requests = []

    def add_request(self, request: Dict[str, Any]) -> None:
        """
        Add a request to the collection.

        Args:
            request: Request configuration
        """
        self.requests.append(request)

    def load(self, file_path: str) -> None:
        """
        Load collection from a JSON file.

        Args:
            file_path: Path to JSON file

        Raises:
            Exception: If file can't be loaded
        """
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)

            if "name" in data:
                self.name = data["name"]

            if "description" in data:
                self.description = data["description"]

            if "requests" in data and isinstance(data["requests"], list):
                self.requests = data["requests"]

        except Exception as e:
            raise Exception(f"Failed to load collection: {e}")

    def save(self, file_path: str) -> None:
        """
        Save collection to a JSON file.

        Args:
            file_path: Path to save JSON file

        Raises:
            Exception: If file can't be saved
        """
        try:
            data = {
                "name": self.name,
                "description": self.description,
                "requests": self.requests
            }

            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2)

        except Exception as e:
            raise Exception(f"Failed to save collection: {e}")

    def to_dict(self) -> Dict[str, Any]:
        """
        Convert collection to a dictionary.

        Returns:
            Dictionary representation
        """
        return {
            "name": self.name,
            "description": self.description,
            "requests": self.requests
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Collection':
        """
        Create a collection from a dictionary.

        Args:
            data: Dictionary with collection data

        Returns:
            Collection instance
        """
        collection = cls(
            name=data.get("name", ""),
            description=data.get("description", "")
        )

        if "requests" in data and isinstance(data["requests"], list):
            collection.requests = data["requests"]

        return collection
