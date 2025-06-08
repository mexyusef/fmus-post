use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use serde_json::Value;

use super::client::HttpResponse;

// Enum untuk menyimpan tipe konten response
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ResponseBodyType {
    Json,
    Text,
    Binary,
    Html,
    Xml,
    Image,
    Unknown,
}

// Helper untuk pemrosesan response body
impl HttpResponse {
    // Konversi body ke string
    pub fn text(&self) -> Result<String, String> {
        String::from_utf8(self.body.clone())
            .map_err(|e| format!("Failed to convert response body to text: {}", e))
    }

    // Konversi body ke JSON
    pub fn json(&self) -> Result<Value, String> {
        self.text()
            .and_then(|text| {
                serde_json::from_str(&text)
                    .map_err(|e| format!("Failed to parse response body as JSON: {}", e))
            })
    }

    // Mendeteksi tipe konten dari response
    pub fn detect_content_type(&self) -> ResponseBodyType {
        let content_type = self.headers.get("content-type")
            .or_else(|| self.headers.get("Content-Type"))
            .map(|ct| ct.to_lowercase());

        match content_type {
            Some(ct) if ct.contains("application/json") => ResponseBodyType::Json,
            Some(ct) if ct.contains("text/html") => ResponseBodyType::Html,
            Some(ct) if ct.contains("text/xml") || ct.contains("application/xml") => ResponseBodyType::Xml,
            Some(ct) if ct.contains("image/") => ResponseBodyType::Image,
            Some(ct) if ct.contains("text/") => ResponseBodyType::Text,
            Some(_) | None => {
                // Coba deteksi JSON dari konten body
                if let Ok(text) = self.text() {
                    if text.trim().starts_with('{') && text.trim().ends_with('}') {
                        if serde_json::from_str::<Value>(&text).is_ok() {
                            return ResponseBodyType::Json;
                        }
                    }
                }

                // Jika tidak bisa mendeteksi, kembalikan tipe binary
                if self.body.is_empty() {
                    ResponseBodyType::Text
                } else {
                    ResponseBodyType::Binary
                }
            }
        }
    }

    // Assert helpers untuk testing
    pub fn assert_status(&self, expected: u16) -> Result<(), String> {
        if self.status != expected {
            return Err(format!("Expected status {} but got {}", expected, self.status));
        }
        Ok(())
    }

    pub fn assert_header(&self, key: &str, expected: &str) -> Result<(), String> {
        let header_value = self.headers.get(&key.to_lowercase())
            .or_else(|| self.headers.get(key));

        match header_value {
            Some(value) if value == expected => Ok(()),
            Some(value) => Err(format!("Expected header '{}' to be '{}' but got '{}'", key, expected, value)),
            None => Err(format!("Expected header '{}' not found in response", key)),
        }
    }

    pub fn assert_json_path(&self, path: &str, expected: Value) -> Result<(), String> {
        let json_value = self.json()?;

        // Implementasi dasar untuk jsonpath sederhana
        // Untuk implementasi lengkap, bisa menggunakan library seperti jsonpath_lib
        let parts: Vec<&str> = path.split('.').collect();
        let mut current_value = &json_value;

        for part in parts {
            if let Some(index) = part.strip_prefix('[').and_then(|s| s.strip_suffix(']')) {
                if let Ok(idx) = index.parse::<usize>() {
                    if let Some(array_value) = current_value.as_array() {
                        if idx < array_value.len() {
                            current_value = &array_value[idx];
                        } else {
                            return Err(format!("Index {} out of bounds for array at path '{}'", idx, path));
                        }
                    } else {
                        return Err(format!("Value at path '{}' is not an array", path));
                    }
                } else {
                    return Err(format!("Invalid array index: {}", index));
                }
            } else {
                if let Some(obj) = current_value.as_object() {
                    if let Some(field_value) = obj.get(part) {
                        current_value = field_value;
                    } else {
                        return Err(format!("Field '{}' not found in object at path '{}'", part, path));
                    }
                } else {
                    return Err(format!("Value at path '{}' is not an object", path));
                }
            }
        }

        if *current_value == expected {
            Ok(())
        } else {
            Err(format!(
                "Expected value at path '{}' to be '{}' but got '{}'",
                path,
                expected.to_string(),
                current_value.to_string()
            ))
        }
    }
}
