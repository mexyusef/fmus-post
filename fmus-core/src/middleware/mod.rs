use std::sync::Arc;

use crate::http::{RequestParams, HttpResponse};

// Tipe untuk middleware yang memproses request
pub type RequestMiddlewareFn = Arc<dyn Fn(RequestParams) -> RequestParams + Send + Sync>;

// Tipe untuk middleware yang memproses response
pub type ResponseMiddlewareFn = Arc<dyn Fn(HttpResponse) -> HttpResponse + Send + Sync>;

// Struktur middleware
#[derive(Clone)]
pub struct Middleware {
    pub name: String,
    pub request_fn: Option<RequestMiddlewareFn>,
    pub response_fn: Option<ResponseMiddlewareFn>,
}

impl Middleware {
    // Membuat middleware baru
    pub fn new(
        name: &str,
        request_fn: Option<RequestMiddlewareFn>,
        response_fn: Option<ResponseMiddlewareFn>,
    ) -> Self {
        Self {
            name: name.to_string(),
            request_fn,
            response_fn,
        }
    }

    // Menerapkan middleware ke request
    pub fn apply_to_request(&self, params: RequestParams) -> RequestParams {
        if let Some(req_fn) = &self.request_fn {
            req_fn(params)
        } else {
            params
        }
    }

    // Menerapkan middleware ke response
    pub fn apply_to_response(&self, response: HttpResponse) -> HttpResponse {
        if let Some(resp_fn) = &self.response_fn {
            resp_fn(response)
        } else {
            response
        }
    }
}

// Manager untuk menangani middleware
#[derive(Clone, Default)]
pub struct MiddlewareManager {
    middlewares: Vec<Middleware>,
}

impl MiddlewareManager {
    // Membuat instance baru dari middleware manager
    pub fn new() -> Self {
        Self {
            middlewares: Vec::new(),
        }
    }

    // Menambahkan middleware ke manager
    pub fn add(&mut self, middleware: Middleware) {
        self.middlewares.push(middleware);
    }

    // Menerapkan semua middleware ke request
    pub fn apply_to_request(&self, params: RequestParams) -> RequestParams {
        let mut current_params = params;
        for middleware in &self.middlewares {
            current_params = middleware.apply_to_request(current_params);
        }
        current_params
    }

    // Menerapkan semua middleware ke response
    pub fn apply_to_response(&self, response: HttpResponse) -> HttpResponse {
        let mut current_response = response;
        // Apply in reverse order for responses
        for middleware in self.middlewares.iter().rev() {
            current_response = middleware.apply_to_response(current_response);
        }
        current_response
    }
}

// Helper untuk membuat request middleware
pub fn create_request_middleware<F>(f: F) -> RequestMiddlewareFn
where
    F: Fn(RequestParams) -> RequestParams + Send + Sync + 'static,
{
    Arc::new(f)
}

// Helper untuk membuat response middleware
pub fn create_response_middleware<F>(f: F) -> ResponseMiddlewareFn
where
    F: Fn(HttpResponse) -> HttpResponse + Send + Sync + 'static,
{
    Arc::new(f)
}

// Fungsi untuk membuat middleware
pub fn create_middleware(
    name: &str,
    request_fn: Option<impl Fn(RequestParams) -> RequestParams + Send + Sync + 'static>,
    response_fn: Option<impl Fn(HttpResponse) -> HttpResponse + Send + Sync + 'static>,
) -> Middleware {
    Middleware::new(
        name,
        request_fn.map(|f| create_request_middleware(f)),
        response_fn.map(|f| create_response_middleware(f)),
    )
}
