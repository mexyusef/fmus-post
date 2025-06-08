// Prevent additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod collections;
mod environments;
mod utils;

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

// Komentar: AppState untuk menyimpan data aplikasi
struct AppState {
    collections: Mutex<collections::CollectionStore>,
    environments: Mutex<environments::EnvironmentStore>,
}

// Komentar: Ini adalah file utama untuk aplikasi Tauri FMUS-POST
fn main() {
    // Komentar: Inisialisasi app state
    let app_state = AppState {
        collections: Mutex::new(collections::CollectionStore::new()),
        environments: Mutex::new(environments::EnvironmentStore::new()),
    };

    // Komentar: Inisialisasi aplikasi Tauri
    tauri::Builder::default()
        .manage(app_state)
        // Komentar: API commands
        .invoke_handler(tauri::generate_handler![
            api::http_request,
            api::websocket_connect,
            api::graphql_request,

            // Komentar: Collection commands
            collections::list_collections,
            collections::get_collection,
            collections::create_collection,
            collections::update_collection,
            collections::delete_collection,
            collections::add_request_to_collection,
            collections::remove_request_from_collection,

            // Komentar: Environment commands
            environments::list_environments,
            environments::get_environment,
            environments::create_environment,
            environments::update_environment,
            environments::delete_environment,

            // Komentar: Utility commands
            utils::import_collection,
            utils::export_collection
        ])
        .run(tauri::generate_context!())
        .expect("Komentar: Error saat menjalankan aplikasi Tauri");
}
