use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{command, State};
use uuid::Uuid;

use crate::AppState;

// Komentar: Struktur untuk environment variable
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EnvVariable {
    pub key: String,
    pub value: String,
    pub enabled: bool,
    #[serde(default)]
    pub is_secret: bool,
}

// Komentar: Struktur untuk environment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Environment {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub variables: Vec<EnvVariable>,
    pub is_active: bool,
}

// Komentar: Store untuk environments
#[derive(Debug, Default)]
pub struct EnvironmentStore {
    environments: HashMap<String, Environment>,
    active_environment_id: Option<String>,
}

impl EnvironmentStore {
    pub fn new() -> Self {
        EnvironmentStore {
            environments: HashMap::new(),
            active_environment_id: None,
        }
    }

    // Komentar: Membuat environment baru
    pub fn create_environment(&mut self, name: String, description: Option<String>) -> Environment {
        let id = Uuid::new_v4().to_string();
        let environment = Environment {
            id: id.clone(),
            name,
            description,
            variables: Vec::new(),
            is_active: false,
        };

        self.environments.insert(id, environment.clone());
        environment
    }

    // Komentar: Mendapatkan environment berdasarkan ID
    pub fn get_environment(&self, id: &str) -> Option<&Environment> {
        self.environments.get(id)
    }

    // Komentar: Mendapatkan semua environments
    pub fn list_environments(&self) -> Vec<Environment> {
        self.environments.values().cloned().collect()
    }

    // Komentar: Update environment
    pub fn update_environment(
        &mut self,
        id: &str,
        name: Option<String>,
        description: Option<String>,
        is_active: Option<bool>
    ) -> Option<Environment> {
        if let Some(env) = self.environments.get_mut(id) {
            if let Some(new_name) = name {
                env.name = new_name;
            }

            if description.is_some() {
                env.description = description;
            }

            if let Some(active) = is_active {
                if active && !env.is_active {
                    // Komentar: Deaktifkan environment lain yang aktif
                    if let Some(active_id) = &self.active_environment_id {
                        if let Some(active_env) = self.environments.get_mut(active_id) {
                            active_env.is_active = false;
                        }
                    }

                    env.is_active = true;
                    self.active_environment_id = Some(id.to_string());
                } else if !active && env.is_active {
                    env.is_active = false;
                    self.active_environment_id = None;
                }
            }

            return Some(env.clone());
        }

        None
    }

    // Komentar: Menghapus environment
    pub fn delete_environment(&mut self, id: &str) -> bool {
        if self.environments.contains_key(id) {
            // Komentar: Hapus active environment jika yang dihapus adalah active
            if Some(id.to_string()) == self.active_environment_id {
                self.active_environment_id = None;
            }

            self.environments.remove(id);
            return true;
        }

        false
    }

    // Komentar: Menambahkan variable ke environment
    pub fn add_variable(&mut self, env_id: &str, variable: EnvVariable) -> Option<Environment> {
        if let Some(env) = self.environments.get_mut(env_id) {
            // Komentar: Cek apakah variable dengan key yang sama sudah ada
            if let Some(index) = env.variables.iter().position(|v| v.key == variable.key) {
                env.variables[index] = variable;
            } else {
                env.variables.push(variable);
            }

            return Some(env.clone());
        }

        None
    }

    // Komentar: Menghapus variable dari environment
    pub fn remove_variable(&mut self, env_id: &str, key: &str) -> Option<Environment> {
        if let Some(env) = self.environments.get_mut(env_id) {
            env.variables.retain(|v| v.key != key);
            return Some(env.clone());
        }

        None
    }

    // Komentar: Mendapatkan active environment
    pub fn get_active_environment(&self) -> Option<&Environment> {
        if let Some(id) = &self.active_environment_id {
            return self.environments.get(id);
        }

        None
    }

    // Komentar: Set active environment
    pub fn set_active_environment(&mut self, id: &str) -> Option<Environment> {
        if !self.environments.contains_key(id) {
            return None;
        }

        // Komentar: Deaktifkan environment lain yang aktif
        if let Some(active_id) = &self.active_environment_id {
            if let Some(active_env) = self.environments.get_mut(active_id) {
                active_env.is_active = false;
            }
        }

        // Komentar: Aktifkan environment baru
        if let Some(env) = self.environments.get_mut(id) {
            env.is_active = true;
            self.active_environment_id = Some(id.to_string());
            return Some(env.clone());
        }

        None
    }
}

// Komentar: Command untuk mendapatkan daftar environments
#[command]
pub fn list_environments(state: State<AppState>) -> Vec<Environment> {
    let store = state.environments.lock().unwrap();
    store.list_environments()
}

// Komentar: Command untuk mendapatkan environment berdasarkan ID
#[command]
pub fn get_environment(id: String, state: State<AppState>) -> Option<Environment> {
    let store = state.environments.lock().unwrap();
    store.get_environment(&id).cloned()
}

// Komentar: Command untuk membuat environment baru
#[command]
pub fn create_environment(name: String, description: Option<String>, state: State<AppState>) -> Environment {
    let mut store = state.environments.lock().unwrap();
    store.create_environment(name, description)
}

// Komentar: Command untuk update environment
#[command]
pub fn update_environment(
    id: String,
    name: Option<String>,
    description: Option<String>,
    is_active: Option<bool>,
    state: State<AppState>
) -> Option<Environment> {
    let mut store = state.environments.lock().unwrap();
    store.update_environment(&id, name, description, is_active)
}

// Komentar: Command untuk menghapus environment
#[command]
pub fn delete_environment(id: String, state: State<AppState>) -> bool {
    let mut store = state.environments.lock().unwrap();
    store.delete_environment(&id)
}

// Komentar: Command untuk menambahkan variable ke environment
#[command]
pub fn add_environment_variable(
    env_id: String,
    key: String,
    value: String,
    enabled: bool,
    is_secret: bool,
    state: State<AppState>
) -> Option<Environment> {
    let mut store = state.environments.lock().unwrap();

    let variable = EnvVariable {
        key,
        value,
        enabled,
        is_secret,
    };

    store.add_variable(&env_id, variable)
}

// Komentar: Command untuk menghapus variable dari environment
#[command]
pub fn remove_environment_variable(env_id: String, key: String, state: State<AppState>) -> Option<Environment> {
    let mut store = state.environments.lock().unwrap();
    store.remove_variable(&env_id, &key)
}
