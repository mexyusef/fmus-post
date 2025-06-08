# FMUS-POST CLI

Command line interface for FMUS-POST API testing.

## Installation

```bash
npm install -g fmus-cli
```

## Usage

### Making a Simple Request

```bash
fmus request get https://api.example.com
```

### Adding Headers

```bash
fmus request get https://api.example.com -h "Content-Type:application/json" -h "Authorization:Bearer token123"
```

### Adding Query Parameters

```bash
fmus request get https://api.example.com -p "page:1" -p "limit:10"
```

### POST Request with Body

```bash
fmus request post https://api.example.com -b '{"name":"John","age":30}'
```

### Running a Collection

```bash
fmus collection ./my-collection.json
```

## Options

### Global Options

- `-v, --version`: Display version information
- `-h, --help`: Display help information

### Request Command Options

- `-h, --header <headers...>`: HTTP headers in format "key:value"
- `-p, --param <params...>`: Query parameters in format "key:value"
- `-b, --body <body>`: Request body (JSON string)
- `-a, --auth <auth>`: Authentication in format "type:credentials"

### Collection Command Options

- `-e, --env <environment>`: Environment JSON file path

## License

MIT 