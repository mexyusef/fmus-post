use std::collections::HashMap;
use std::time::Duration;

use reqwest::{header, Client as ReqwestClient, Method, RequestBuilder, Response};
use serde::{Deserialize, Serialize};
use serde_json::Value;

// Tipe untuk konfigurasi HTTP client
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClientConfig {
    pub base_url: Option<String>,
    pub timeout: Option<u64>,
    pub headers: Option<HashMap<String, String>>,
}

// Tipe untuk parameter request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestParams {
    pub url: String,
    pub method: String,
    pub headers: Option<HashMap<String, String>>,
    pub params: Option<HashMap<String, String>>,
    pub body: Option<Value>,
    pub timeout: Option<u64>,
    pub auth: Option<AuthConfig>,
}

// Tipe untuk konfigurasi authentication
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthConfig {
    pub auth_type: String,
    pub credentials: Value,
}

// Hasil response HTTP yang akan dikembalikan ke client
#[derive(Debug, Clone, Serialize)]
pub struct HttpResponse {
    pub status: u16,
    pub headers: HashMap<String, String>,
    pub body: Vec<u8>,
    pub time: u128,
}

// HTTP Client utama
pub struct HttpClient {
    client: ReqwestClient,
    config: ClientConfig,
}

impl HttpClient {
    // Membuat instance client baru
    pub fn new(config: Option<ClientConfig>) -> Self {
        let mut headers = header::HeaderMap::new();
        headers.insert(
            header::USER_AGENT,
            header::HeaderValue::from_static("fmus-post/0.0.1"),
        );

        let client = ReqwestClient::builder()
            .default_headers(headers)
            .build()
            .expect("Failed to create HTTP client");

        Self {
            client,
            config: config.unwrap_or_else(|| ClientConfig {
                base_url: None,
                timeout: Some(30),
                headers: None,
            }),
        }
    }

    // Fungsi untuk mengirim request HTTP
    pub async fn request(&self, params: RequestParams) -> Result<HttpResponse, String> {
        let start = std::time::Instant::now();

        let method = match params.method.to_uppercase().as_str() {
            "GET" => Method::GET,
            "POST" => Method::POST,
            "PUT" => Method::PUT,
            "DELETE" => Method::DELETE,
            "PATCH" => Method::PATCH,
            "HEAD" => Method::HEAD,
            "OPTIONS" => Method::OPTIONS,
            "TRACE" => Method::TRACE,
            "CONNECT" => Method::CONNECT,
            _ => return Err(format!("Unsupported HTTP method: {}", params.method)),
        };

        let url = match &self.config.base_url {
            Some(base_url) => {
                if params.url.starts_with("http://") || params.url.starts_with("https://") {
                    params.url
                } else {
                    format!("{}{}", base_url, params.url)
                }
            }
            None => params.url,
        };

        let mut req_builder = self.client.request(method, &url);

        // Set query parameters
        if let Some(query_params) = params.params {
            req_builder = req_builder.query(&query_params);
        }

        // Set global headers
        if let Some(global_headers) = &self.config.headers {
            for (key, value) in global_headers {
                req_builder = req_builder.header(key, value);
            }
        }

        // Set request-specific headers
        if let Some(req_headers) = params.headers {
            for (key, value) in req_headers {
                req_builder = req_builder.header(key, value);
            }
        }

        // Set request body
        if let Some(body) = params.body {
            req_builder = req_builder.json(&body);
        }

        // Set timeout
        let timeout = params.timeout
            .or(self.config.timeout)
            .unwrap_or(30);
        req_builder = req_builder.timeout(Duration::from_secs(timeout));

        // Menambahkan autentikasi jika ada
        if let Some(auth) = params.auth {
            req_builder = self.apply_auth(req_builder, auth);
        }

        // Mengirim request
        let response = match req_builder.send().await {
            Ok(resp) => resp,
            Err(e) => return Err(format!("Request failed: {}", e)),
        };

        // Membuat HttpResponse dari response reqwest
        let http_response = self.create_response(response, start.elapsed().as_millis()).await?;

        Ok(http_response)
    }

    // Membuat HttpResponse dari response reqwest
    async fn create_response(&self, response: Response, elapsed: u128) -> Result<HttpResponse, String> {
        let status = response.status().as_u16();

        // Mengambil headers
        let mut headers = HashMap::new();
        for (key, value) in response.headers() {
            if let Ok(v) = value.to_str() {
                headers.insert(key.as_str().to_string(), v.to_string());
            }
        }

        // Mengambil response body
        let body = match response.bytes().await {
            Ok(bytes) => bytes.to_vec(),
            Err(e) => return Err(format!("Failed to read response body: {}", e)),
        };

        Ok(HttpResponse {
            status,
            headers,
            body,
            time: elapsed,
        })
    }

    // Menerapkan autentikasi ke request
    fn apply_auth(&self, builder: RequestBuilder, auth: AuthConfig) -> RequestBuilder {
        match auth.auth_type.as_str() {
            "basic" => {
                if let Some(obj) = auth.credentials.as_object() {
                    if let (Some(username), Some(password)) = (
                        obj.get("username").and_then(|u| u.as_str()),
                        obj.get("password").and_then(|p| p.as_str()),
                    ) {
                        return builder.basic_auth(username, Some(password));
                    }
                }
                builder
            },
            "bearer" => {
                if let Some(token) = auth.credentials.as_str() {
                    return builder.bearer_auth(token);
                }
                builder
            },
            // Dukungan untuk tipe auth lainnya bisa ditambahkan di sini
            _ => builder,
        }
    }
}

// Fungsi helper untuk membuat clients dengan HTTP methods umum
pub async fn get(url: &str, params: Option<RequestParams>) -> Result<HttpResponse, String> {
    let client = HttpClient::new(None);
    let params = params.unwrap_or_else(|| RequestParams {
        url: url.to_string(),
        method: "GET".to_string(),
        headers: None,
        params: None,
        body: None,
        timeout: None,
        auth: None,
    });

    client.request(params).await
}

pub async fn post(url: &str, params: Option<RequestParams>) -> Result<HttpResponse, String> {
    let client = HttpClient::new(None);
    let params = params.unwrap_or_else(|| RequestParams {
        url: url.to_string(),
        method: "POST".to_string(),
        headers: None,
        params: None,
        body: None,
        timeout: None,
        auth: None,
    });

    client.request(params).await
}

pub async fn put(url: &str, params: Option<RequestParams>) -> Result<HttpResponse, String> {
    let client = HttpClient::new(None);
    let params = params.unwrap_or_else(|| RequestParams {
        url: url.to_string(),
        method: "PUT".to_string(),
        headers: None,
        params: None,
        body: None,
        timeout: None,
        auth: None,
    });

    client.request(params).await
}

pub async fn delete(url: &str, params: Option<RequestParams>) -> Result<HttpResponse, String> {
    let client = HttpClient::new(None);
    let params = params.unwrap_or_else(|| RequestParams {
        url: url.to_string(),
        method: "DELETE".to_string(),
        headers: None,
        params: None,
        body: None,
        timeout: None,
        auth: None,
    });

    client.request(params).await
}

pub async fn patch(url: &str, params: Option<RequestParams>) -> Result<HttpResponse, String> {
    let client = HttpClient::new(None);
    let params = params.unwrap_or_else(|| RequestParams {
        url: url.to_string(),
        method: "PATCH".to_string(),
        headers: None,
        params: None,
        body: None,
        timeout: None,
        auth: None,
    });

    client.request(params).await
}
