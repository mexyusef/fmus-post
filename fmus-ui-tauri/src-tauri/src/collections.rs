use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{command, State};
use uuid::Uuid;

use crate::AppState;

// Komentar: Struktur untuk request dalam collection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Request {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub method: String,
    pub url: String,
    pub headers: HashMap<String, String>,
    pub params: HashMap<String, String>,
    pub body: Option<Value>,
    pub auth: Option<Value>,
}

// Komentar: Struktur untuk folder dalam collection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Folder {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub requests: Vec<String>, // Komentar: Request IDs
    pub folders: Vec<String>,  // Komentar: Sub-folder IDs
}

// Komentar: Struktur untuk collection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub requests: Vec<String>, // Komentar: Request IDs
    pub folders: Vec<String>,  // Komentar: Folder IDs
    pub variables: HashMap<String, String>,
}

// Komentar: Store untuk semua collections, requests, dan folders
#[derive(Debug, Default)]
pub struct CollectionStore {
    collections: HashMap<String, Collection>,
    requests: HashMap<String, Request>,
    folders: HashMap<String, Folder>,
}

impl CollectionStore {
    pub fn new() -> Self {
        CollectionStore {
            collections: HashMap::new(),
            requests: HashMap::new(),
            folders: HashMap::new(),
        }
    }

    // Komentar: Membuat collection baru
    pub fn create_collection(&mut self, name: String, description: Option<String>) -> Collection {
        let id = Uuid::new_v4().to_string();
        let collection = Collection {
            id: id.clone(),
            name,
            description,
            requests: Vec::new(),
            folders: Vec::new(),
            variables: HashMap::new(),
        };

        self.collections.insert(id, collection.clone());
        collection
    }

    // Komentar: Mendapatkan collection berdasarkan ID
    pub fn get_collection(&self, id: &str) -> Option<&Collection> {
        self.collections.get(id)
    }

    // Komentar: Mendapatkan semua collections
    pub fn list_collections(&self) -> Vec<Collection> {
        self.collections.values().cloned().collect()
    }

    // Komentar: Update collection
    pub fn update_collection(&mut self, id: &str, name: Option<String>, description: Option<String>) -> Option<Collection> {
        if let Some(collection) = self.collections.get_mut(id) {
            if let Some(new_name) = name {
                collection.name = new_name;
            }

            if description.is_some() {
                collection.description = description;
            }

            return Some(collection.clone());
        }

        None
    }

    // Komentar: Menghapus collection
    pub fn delete_collection(&mut self, id: &str) -> bool {
        if self.collections.contains_key(id) {
            // Komentar: Hapus requests dan folders yang terkait
            if let Some(collection) = self.collections.get(id) {
                for request_id in &collection.requests {
                    self.requests.remove(request_id);
                }

                for folder_id in &collection.folders {
                    self.remove_folder_recursively(folder_id);
                }
            }

            self.collections.remove(id);
            return true;
        }

        false
    }

    // Komentar: Hapus folder dan semua kontennya secara rekursif
    fn remove_folder_recursively(&mut self, folder_id: &str) {
        if let Some(folder) = self.folders.get(folder_id) {
            let request_ids = folder.requests.clone();
            let folder_ids = folder.folders.clone();

            for request_id in request_ids {
                self.requests.remove(&request_id);
            }

            for sub_folder_id in folder_ids {
                self.remove_folder_recursively(&sub_folder_id);
            }

            self.folders.remove(folder_id);
        }
    }

    // Komentar: Menambahkan request ke collection
    pub fn add_request(&mut self, collection_id: &str, request: Request) -> Option<String> {
        if !self.collections.contains_key(collection_id) {
            return None;
        }

        let request_id = request.id.clone();
        self.requests.insert(request_id.clone(), request);

        if let Some(collection) = self.collections.get_mut(collection_id) {
            collection.requests.push(request_id.clone());
            return Some(request_id);
        }

        None
    }

    // Komentar: Menghapus request dari collection
    pub fn remove_request(&mut self, collection_id: &str, request_id: &str) -> bool {
        if let Some(collection) = self.collections.get_mut(collection_id) {
            collection.requests.retain(|id| id != request_id);
            self.requests.remove(request_id);
            return true;
        }

        false
    }
}

// Komentar: Command untuk mendapatkan daftar collections
#[command]
pub fn list_collections(state: State<AppState>) -> Vec<Collection> {
    let store = state.collections.lock().unwrap();
    store.list_collections()
}

// Komentar: Command untuk mendapatkan collection berdasarkan ID
#[command]
pub fn get_collection(id: String, state: State<AppState>) -> Option<Collection> {
    let store = state.collections.lock().unwrap();
    store.get_collection(&id).cloned()
}

// Komentar: Command untuk membuat collection baru
#[command]
pub fn create_collection(name: String, description: Option<String>, state: State<AppState>) -> Collection {
    let mut store = state.collections.lock().unwrap();
    store.create_collection(name, description)
}

// Komentar: Command untuk update collection
#[command]
pub fn update_collection(id: String, name: Option<String>, description: Option<String>, state: State<AppState>) -> Option<Collection> {
    let mut store = state.collections.lock().unwrap();
    store.update_collection(&id, name, description)
}

// Komentar: Command untuk menghapus collection
#[command]
pub fn delete_collection(id: String, state: State<AppState>) -> bool {
    let mut store = state.collections.lock().unwrap();
    store.delete_collection(&id)
}

// Komentar: Struktur untuk request dalam collection
#[derive(Debug, Deserialize)]
pub struct RequestInput {
    pub name: String,
    pub description: Option<String>,
    pub method: String,
    pub url: String,
    pub headers: HashMap<String, String>,
    pub params: HashMap<String, String>,
    pub body: Option<Value>,
    pub auth: Option<Value>,
}

// Komentar: Command untuk menambahkan request ke collection
#[command]
pub fn add_request_to_collection(collection_id: String, input: RequestInput, state: State<AppState>) -> Option<String> {
    let mut store = state.collections.lock().unwrap();

    let request = Request {
        id: Uuid::new_v4().to_string(),
        name: input.name,
        description: input.description,
        method: input.method,
        url: input.url,
        headers: input.headers,
        params: input.params,
        body: input.body,
        auth: input.auth,
    };

    store.add_request(&collection_id, request)
}

// Komentar: Command untuk menghapus request dari collection
#[command]
pub fn remove_request_from_collection(collection_id: String, request_id: String, state: State<AppState>) -> bool {
    let mut store = state.collections.lock().unwrap();
    store.remove_request(&collection_id, &request_id)
}
