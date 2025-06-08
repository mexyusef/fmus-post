use reqwest::header::{HeaderMap, HeaderName, HeaderValue};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::time::{Duration, Instant};
use tauri::command;

// Komentar: Struktur untuk request options
#[derive(Debug, Deserialize)]
pub struct RequestOptions {
    #[serde(default)]
    headers: HashMap<String, String>,
    #[serde(default)]
    params: HashMap<String, String>,
    #[serde(default)]
    body: Option<Value>,
    #[serde(default)]
    timeout: Option<u64>,
    #[serde(default)]
    auth: Option<Auth>,
}

// Komentar: Struktur untuk authentication
#[derive(Debug, Deserialize)]
pub struct Auth {
    #[serde(rename = "type")]
    auth_type: String,
    #[serde(default)]
    username: Option<String>,
    #[serde(default)]
    password: Option<String>,
    #[serde(default)]
    token: Option<String>,
    #[serde(default)]
    api_key: Option<String>,
    #[serde(default)]
    prefix: Option<String>,
}

// Komentar: Struktur untuk HTTP response
#[derive(Debug, Serialize)]
pub struct HttpResponse {
    status: u16,
    headers: HashMap<String, String>,
    body: Value,
    time: u64,
}

// Komentar: Konversi HeaderMap ke HashMap untuk serialisasi
fn headers_to_map(headers: &HeaderMap) -> HashMap<String, String> {
    let mut map = HashMap::new();
    for (key, value) in headers.iter() {
        if let Ok(v) = value.to_str() {
            map.insert(key.as_str().to_string(), v.to_string());
        }
    }
    map
}

// Komentar: Fungsi untuk menambahkan auth headers
fn apply_auth(headers: &mut HeaderMap, auth: &Auth) -> Result<(), String> {
    match auth.auth_type.as_str() {
        "basic" => {
            let username = auth.username.as_ref().ok_or("Username is required for basic auth")?;
            let password = auth.password.as_ref().ok_or("Password is required for basic auth")?;

            let auth_str = format!("{}:{}", username, password);
            let auth_header = format!("Basic {}", base64::encode(auth_str));

            headers.insert(
                reqwest::header::AUTHORIZATION,
                HeaderValue::from_str(&auth_header).map_err(|e| e.to_string())?,
            );
        },
        "bearer" => {
            let token = auth.token.as_ref().ok_or("Token is required for bearer auth")?;
            let auth_header = format!("Bearer {}", token);

            headers.insert(
                reqwest::header::AUTHORIZATION,
                HeaderValue::from_str(&auth_header).map_err(|e| e.to_string())?,
            );
        },
        "apikey" => {
            let key = auth.api_key.as_ref().ok_or("API key is required")?;
            let prefix = auth.prefix.as_deref().unwrap_or("X-API-Key");

            headers.insert(
                HeaderName::from_bytes(prefix.as_bytes()).map_err(|e| e.to_string())?,
                HeaderValue::from_str(key).map_err(|e| e.to_string())?,
            );
        },
        _ => return Err(format!("Unsupported auth type: {}", auth.auth_type)),
    }

    Ok(())
}

// Komentar: Fungsi untuk mengirim HTTP request
#[command]
pub async fn http_request(method: String, url: String, options: RequestOptions) -> Result<HttpResponse, String> {
    let start_time = Instant::now();

    // Komentar: Setup HTTP client
    let client = reqwest::Client::new();

    // Komentar: Setup request builder
    let mut req_builder = match method.to_uppercase().as_str() {
        "GET" => client.get(url),
        "POST" => client.post(url),
        "PUT" => client.put(url),
        "DELETE" => client.delete(url),
        "PATCH" => client.patch(url),
        "HEAD" => client.head(url),
        "OPTIONS" => client.request(reqwest::Method::OPTIONS, url),
        _ => return Err(format!("Unsupported HTTP method: {}", method)),
    };

    // Komentar: Set query parameters
    if !options.params.is_empty() {
        req_builder = req_builder.query(&options.params);
    }

    // Komentar: Set headers
    let mut headers = HeaderMap::new();
    for (key, value) in options.headers {
        if let Ok(header_name) = HeaderName::from_bytes(key.as_bytes()) {
            if let Ok(header_value) = HeaderValue::from_str(&value) {
                headers.insert(header_name, header_value);
            }
        }
    }

    // Komentar: Apply authentication if provided
    if let Some(auth) = &options.auth {
        apply_auth(&mut headers, auth)?;
    }

    req_builder = req_builder.headers(headers);

    // Komentar: Set request body
    if let Some(body) = options.body {
        req_builder = req_builder.json(&body);
    }

    // Komentar: Set timeout
    if let Some(timeout) = options.timeout {
        req_builder = req_builder.timeout(Duration::from_millis(timeout));
    }

    // Komentar: Send request
    let response = req_builder.send().await.map_err(|e| e.to_string())?;

    // Komentar: Process response
    let status = response.status().as_u16();
    let headers = headers_to_map(response.headers());

    // Komentar: Parse response body
    let body = response.json::<Value>().await.unwrap_or(Value::Null);

    let elapsed = start_time.elapsed().as_millis() as u64;

    Ok(HttpResponse {
        status,
        headers,
        body,
        time: elapsed,
    })
}

// Komentar: Struktur untuk GraphQL request
#[derive(Debug, Deserialize)]
pub struct GraphQLRequest {
    query: String,
    #[serde(default)]
    variables: Option<Value>,
    #[serde(default)]
    operation_name: Option<String>,
}

// Komentar: Fungsi untuk mengirim GraphQL request
#[command]
pub async fn graphql_request(url: String, request: GraphQLRequest, options: RequestOptions) -> Result<HttpResponse, String> {
    let start_time = Instant::now();

    // Komentar: Setup HTTP client
    let client = reqwest::Client::new();

    // Komentar: Build request body
    let mut body = json!({
        "query": request.query
    });

    if let Some(variables) = request.variables {
        body["variables"] = variables;
    }

    if let Some(operation_name) = request.operation_name {
        body["operationName"] = Value::String(operation_name);
    }

    // Komentar: Setup headers
    let mut headers = HeaderMap::new();
    headers.insert(
        reqwest::header::CONTENT_TYPE,
        HeaderValue::from_static("application/json"),
    );

    for (key, value) in options.headers {
        if let Ok(header_name) = HeaderName::from_bytes(key.as_bytes()) {
            if let Ok(header_value) = HeaderValue::from_str(&value) {
                headers.insert(header_name, header_value);
            }
        }
    }

    // Komentar: Apply authentication if provided
    if let Some(auth) = &options.auth {
        apply_auth(&mut headers, auth)?;
    }

    // Komentar: Build request
    let mut req_builder = client.post(url).headers(headers).json(&body);

    // Komentar: Set timeout
    if let Some(timeout) = options.timeout {
        req_builder = req_builder.timeout(Duration::from_millis(timeout));
    }

    // Komentar: Send request
    let response = req_builder.send().await.map_err(|e| e.to_string())?;

    // Komentar: Process response
    let status = response.status().as_u16();
    let headers = headers_to_map(response.headers());
    let body = response.json::<Value>().await.unwrap_or(Value::Null);

    let elapsed = start_time.elapsed().as_millis() as u64;

    Ok(HttpResponse {
        status,
        headers,
        body,
        time: elapsed,
    })
}

// Komentar: Struktur untuk WebSocket message
#[derive(Debug, Serialize, Deserialize)]
pub struct WebSocketMessage {
    #[serde(rename = "type")]
    message_type: String,
    data: Value,
}

// Komentar: Fungsi untuk membuat WebSocket connection
#[command]
pub async fn websocket_connect(url: String) -> Result<String, String> {
    // Komentar: Untuk saat ini, hanya return connection ID
    // Komentar: Implementasi lengkap membutuhkan state management untuk WebSocket connections
    Ok(uuid::Uuid::new_v4().to_string())
}
