from setuptools import setup, find_packages

setup(
    name="fmus-post",
    version="0.0.1",
    description="Python bindings for FMUS-POST API testing toolkit",
    author="Yusef Ulum",
    author_email="yusef314159@gmail.com",
    url="https://github.com/mexyusef/fmus-post",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.25.0",
        "websocket-client>=1.2.0",
        "gql>=3.0.0",
        "jsonpath-ng>=1.5.0",
        "jsonschema>=4.0.0",
    ],
    extras_require={
        "dev": [
            "pytest>=6.0.0",
            "pytest-cov>=2.10.0",
            "black>=20.8b1",
            "isort>=5.0.0",
            "mypy>=0.800",
            "flake8>=3.8.0",
        ]
    },
)
