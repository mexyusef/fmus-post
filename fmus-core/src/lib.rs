pub mod auth;
pub mod http;
pub mod graphql;
pub mod grpc;
pub mod ws;
pub mod middleware;
pub mod plugins;
pub mod utils;

// Re-export penting dari masing-masing modul
pub use http::{get, post, put, patch, delete, HttpClient, ClientConfig, RequestParams, AuthConfig, HttpResponse};
pub use auth::Auth;

// Tipe-tipe utama yang diekspose

/// Type untuk Environment variables
pub type Environment = std::collections::HashMap<String, String>;

/// FmusClient adalah tipe utama yang digunakan untuk berinteraksi dengan API
pub struct FmusClient {
    http_client: http::HttpClient,
    environment: Environment,
}

impl FmusClient {
    /// Membuat instance client baru
    pub fn new(config: Option<http::ClientConfig>, env: Option<Environment>) -> Self {
        Self {
            http_client: http::HttpClient::new(config),
            environment: env.unwrap_or_default(),
        }
    }

    /// Mengembalikan referensi ke HTTP client
    pub fn http(&self) -> &http::HttpClient {
        &self.http_client
    }

    /// Mengembalikan referensi ke environment
    pub fn env(&self) -> &Environment {
        &self.environment
    }

    /// Mengatur variabel environment
    pub fn set_env(&mut self, key: &str, value: &str) {
        self.environment.insert(key.to_string(), value.to_string());
    }
}

// Fungsi untuk membuat client
pub fn client(config: Option<http::ClientConfig>, env: Option<Environment>) -> FmusClient {
    FmusClient::new(config, env)
}

// Fungsi versi library
pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}
