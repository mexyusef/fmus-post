use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{command, State};
use uuid::Uuid;

use crate::AppState;
use crate::collections::{Collection, Request};

// Komentar: Format untuk Postman collection v2.1
#[derive(Debug, Deserialize, Serialize)]
struct PostmanCollection {
    info: PostmanInfo,
    item: Vec<PostmanItem>,
    variable: Option<Vec<PostmanVariable>>,
}

#[derive(Debug, Deserialize, Serialize)]
struct PostmanInfo {
    name: String,
    description: Option<String>,
    #[serde(rename = "_postman_id")]
    postman_id: Option<String>,
    schema: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
struct PostmanItem {
    name: String,
    description: Option<String>,
    item: Option<Vec<PostmanItem>>,
    request: Option<PostmanRequest>,
}

#[derive(Debug, Deserialize, Serialize)]
struct PostmanRequest {
    method: String,
    url: PostmanUrl,
    header: Option<Vec<PostmanHeader>>,
    body: Option<PostmanBody>,
    auth: Option<Value>,
}

#[derive(Debug, Deserialize, Serialize)]
struct PostmanUrl {
    raw: String,
    #[serde(default)]
    host: Vec<String>,
    #[serde(default)]
    path: Vec<String>,
    #[serde(default)]
    query: Option<Vec<PostmanQueryParam>>,
}

#[derive(Debug, Deserialize, Serialize)]
struct PostmanQueryParam {
    key: String,
    value: String,
    disabled: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
struct PostmanHeader {
    key: String,
    value: String,
    disabled: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
struct PostmanBody {
    mode: String,
    raw: Option<String>,
    formdata: Option<Vec<PostmanFormData>>,
    urlencoded: Option<Vec<PostmanUrlEncoded>>,
}

#[derive(Debug, Deserialize, Serialize)]
struct PostmanFormData {
    key: String,
    value: String,
    #[serde(rename = "type")]
    form_type: String,
    disabled: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
struct PostmanUrlEncoded {
    key: String,
    value: String,
    disabled: Option<bool>,
}

#[derive(Debug, Deserialize, Serialize)]
struct PostmanVariable {
    key: String,
    value: String,
    #[serde(rename = "type")]
    var_type: Option<String>,
    disabled: Option<bool>,
}

// Komentar: Fungsi untuk import Postman collection
fn import_postman_collection(content: &str) -> Result<Collection, String> {
    let postman_collection: PostmanCollection = serde_json::from_str(content)
        .map_err(|e| format!("Komentar: Failed to parse Postman collection: {}", e))?;

    let collection_id = Uuid::new_v4().to_string();
    let mut collection = Collection {
        id: collection_id,
        name: postman_collection.info.name,
        description: postman_collection.info.description,
        requests: Vec::new(),
        folders: Vec::new(),
        variables: HashMap::new(),
    };

    // Komentar: Convert variables
    if let Some(variables) = postman_collection.variable {
        for var in variables {
            if var.disabled.unwrap_or(false) {
                continue;
            }
            collection.variables.insert(var.key, var.value);
        }
    }

    // Komentar: Future implementation: handle postman items recursively (folders)

    Ok(collection)
}

// Komentar: Command untuk import collection
#[command]
pub async fn import_collection(format: String, content: String, state: State<AppState>) -> Result<Collection, String> {
    match format.to_lowercase().as_str() {
        "postman" => {
            let collection = import_postman_collection(&content)?;

            // Komentar: Save the imported collection
            let mut store = state.collections.lock().unwrap();
            store.create_collection(collection.name.clone(), collection.description.clone());

            Ok(collection)
        },
        _ => Err(format!("Komentar: Unsupported format: {}", format)),
    }
}

// Komentar: Command untuk export collection
#[command]
pub async fn export_collection(collection_id: String, format: String, state: State<AppState>) -> Result<String, String> {
    let store = state.collections.lock().unwrap();
    let collection = store.get_collection(&collection_id)
        .ok_or_else(|| format!("Komentar: Collection not found: {}", collection_id))?;

    match format.to_lowercase().as_str() {
        "json" => {
            serde_json::to_string_pretty(collection)
                .map_err(|e| format!("Komentar: Failed to serialize collection: {}", e))
        },
        "postman" => {
            // Komentar: Convert to Postman format
            let postman_collection = convert_to_postman(collection)?;

            serde_json::to_string_pretty(&postman_collection)
                .map_err(|e| format!("Komentar: Failed to serialize collection: {}", e))
        },
        _ => Err(format!("Komentar: Unsupported format: {}", format)),
    }
}

// Komentar: Convert FMUS collection to Postman format
fn convert_to_postman(collection: &Collection) -> Result<PostmanCollection, String> {
    let postman_info = PostmanInfo {
        name: collection.name.clone(),
        description: collection.description.clone(),
        postman_id: Some(collection.id.clone()),
        schema: Some("https://schema.getpostman.com/json/collection/v2.1.0/collection.json".to_string()),
    };

    // Komentar: Convert variables
    let mut postman_variables = Vec::new();
    for (key, value) in &collection.variables {
        postman_variables.push(PostmanVariable {
            key: key.clone(),
            value: value.clone(),
            var_type: Some("string".to_string()),
            disabled: None,
        });
    }

    // Komentar: Future implementation: convert requests and folders to Postman items

    Ok(PostmanCollection {
        info: postman_info,
        item: Vec::new(), // Komentar: Temporary empty list
        variable: if postman_variables.is_empty() { None } else { Some(postman_variables) },
    })
}
