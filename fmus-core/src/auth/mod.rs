use serde::{Serialize, Deserialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AuthType {
    None,
    Basic,
    Bearer,
    ApiKey,
    OAuth2,
    AWS,
    NTLM,
    Digest,
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ApiKeyLocation {
    Header,
    Query,
    Cookie,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiKeyAuth {
    pub key: String,
    pub value: String,
    pub location: ApiKeyLocation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BasicAuth {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BearerAuth {
    pub token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OAuth2Auth {
    pub client_id: String,
    pub client_secret: String,
    pub token_url: String,
    pub scopes: Vec<String>,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub expires_at: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomAuth {
    pub auth_type: String,
    pub data: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Auth {
    None,
    Basic(BasicAuth),
    Bearer(BearerAuth),
    ApiKey(ApiKeyAuth),
    OAuth2(OAuth2Auth),
    Custom(CustomAuth),
}

impl Auth {
    pub fn basic(username: &str, password: &str) -> Self {
        Auth::Basic(BasicAuth {
            username: username.to_string(),
            password: password.to_string(),
        })
    }

    pub fn bearer(token: &str) -> Self {
        Auth::Bearer(BearerAuth {
            token: token.to_string(),
        })
    }

    pub fn api_key(key: &str, value: &str, location: ApiKeyLocation) -> Self {
        Auth::ApiKey(ApiKeyAuth {
            key: key.to_string(),
            value: value.to_string(),
            location,
        })
    }

    pub fn oauth2(
        client_id: &str,
        client_secret: &str,
        token_url: &str,
        scopes: Vec<String>,
    ) -> Self {
        Auth::OAuth2(OAuth2Auth {
            client_id: client_id.to_string(),
            client_secret: client_secret.to_string(),
            token_url: token_url.to_string(),
            scopes,
            access_token: None,
            refresh_token: None,
            expires_at: None,
        })
    }

    pub fn custom(auth_type: &str, data: Value) -> Self {
        Auth::Custom(CustomAuth {
            auth_type: auth_type.to_string(),
            data,
        })
    }

    pub fn to_http_auth(&self) -> Option<crate::http::AuthConfig> {
        match self {
            Auth::None => None,
            Auth::Basic(basic) => Some(crate::http::AuthConfig {
                auth_type: "basic".to_string(),
                credentials: serde_json::json!({
                    "username": basic.username,
                    "password": basic.password
                }),
            }),
            Auth::Bearer(bearer) => Some(crate::http::AuthConfig {
                auth_type: "bearer".to_string(),
                credentials: serde_json::json!(bearer.token),
            }),
            Auth::ApiKey(api_key) => Some(crate::http::AuthConfig {
                auth_type: "api_key".to_string(),
                credentials: serde_json::json!({
                    "key": api_key.key,
                    "value": api_key.value,
                    "location": match api_key.location {
                        ApiKeyLocation::Header => "header",
                        ApiKeyLocation::Query => "query",
                        ApiKeyLocation::Cookie => "cookie",
                    }
                }),
            }),
            Auth::OAuth2(oauth2) => Some(crate::http::AuthConfig {
                auth_type: "oauth2".to_string(),
                credentials: serde_json::json!({
                    "client_id": oauth2.client_id,
                    "client_secret": oauth2.client_secret,
                    "token_url": oauth2.token_url,
                    "scopes": oauth2.scopes,
                    "access_token": oauth2.access_token,
                    "refresh_token": oauth2.refresh_token,
                    "expires_at": oauth2.expires_at,
                }),
            }),
            Auth::Custom(custom) => Some(crate::http::AuthConfig {
                auth_type: custom.auth_type.clone(),
                credentials: custom.data.clone(),
            }),
        }
    }
}
