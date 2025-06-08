use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::net::TcpStream;
use tokio::sync::mpsc::{self, Receiver, Sender};
use tokio_tungstenite::{connect_async, MaybeTlsStream, WebSocketStream};
use tokio_tungstenite::tungstenite::Message;
use url::Url;

type WsStream = WebSocketStream<MaybeTlsStream<TcpStream>>;
type MessageHandler = Arc<dyn Fn(String) + Send + Sync>;
type ErrorHandler = Arc<dyn Fn(String) + Send + Sync>;
type OpenHandler = Arc<dyn Fn() + Send + Sync>;
type CloseHandler = Arc<dyn Fn(Option<u16>, String) + Send + Sync>;

// Pesan websocket yang dikirim antara thread
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum WsCommand {
    Send(String),
    Close,
}

// Konfigurasi untuk websocket
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WsConfig {
    pub headers: Option<HashMap<String, String>>,
    pub timeout: Option<u64>,
    pub auto_reconnect: Option<bool>,
    pub max_reconnect_attempts: Option<u32>,
}

// Status koneksi websocket
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WsStatus {
    Connecting,
    Connected,
    Disconnecting,
    Disconnected,
    Reconnecting,
    Error,
}

// Client websocket
pub struct WebSocketClient {
    url: String,
    config: WsConfig,
    status: Arc<Mutex<WsStatus>>,
    command_tx: Option<Sender<WsCommand>>,
    on_message: Option<MessageHandler>,
    on_error: Option<ErrorHandler>,
    on_open: Option<OpenHandler>,
    on_close: Option<CloseHandler>,
}

impl WebSocketClient {
    // Membuat client websocket baru
    pub fn new(url: &str, config: Option<WsConfig>) -> Self {
        Self {
            url: url.to_string(),
            config: config.unwrap_or_else(|| WsConfig {
                headers: None,
                timeout: Some(30),
                auto_reconnect: Some(true),
                max_reconnect_attempts: Some(3),
            }),
            status: Arc::new(Mutex::new(WsStatus::Disconnected)),
            command_tx: None,
            on_message: None,
            on_error: None,
            on_open: None,
            on_close: None,
        }
    }

    // Mendapatkan status koneksi
    pub fn status(&self) -> WsStatus {
        *self.status.lock().unwrap()
    }

    // Mengatur status koneksi
    fn set_status(&self, status: WsStatus) {
        *self.status.lock().unwrap() = status;
    }

    // Mengatur handler untuk pesan yang diterima
    pub fn on_message<F>(&mut self, handler: F)
    where
        F: Fn(String) + Send + Sync + 'static,
    {
        self.on_message = Some(Arc::new(handler));
    }

    // Mengatur handler untuk error
    pub fn on_error<F>(&mut self, handler: F)
    where
        F: Fn(String) + Send + Sync + 'static,
    {
        self.on_error = Some(Arc::new(handler));
    }

    // Mengatur handler untuk koneksi terbuka
    pub fn on_open<F>(&mut self, handler: F)
    where
        F: Fn() + Send + Sync + 'static,
    {
        self.on_open = Some(Arc::new(handler));
    }

    // Mengatur handler untuk koneksi tertutup
    pub fn on_close<F>(&mut self, handler: F)
    where
        F: Fn(Option<u16>, String) + Send + Sync + 'static,
    {
        self.on_close = Some(Arc::new(handler));
    }

    // Memulai koneksi websocket
    pub async fn connect(&mut self) -> Result<(), String> {
        if self.status() != WsStatus::Disconnected {
            return Err("WebSocket is already connecting or connected".to_string());
        }

        self.set_status(WsStatus::Connecting);

        // Setup communication channels
        let (command_tx, command_rx) = mpsc::channel::<WsCommand>(100);
        self.command_tx = Some(command_tx);

        let url = match Url::parse(&self.url) {
            Ok(url) => url,
            Err(e) => {
                self.set_status(WsStatus::Error);
                return Err(format!("Invalid URL: {}", e));
            }
        };

        // Clone values for async task
        let url_clone = url.clone();
        let status_clone = self.status.clone();
        let on_message = self.on_message.clone();
        let on_error = self.on_error.clone();
        let on_open = self.on_open.clone();
        let on_close = self.on_close.clone();
        let config = self.config.clone();

        // Spawn connection task
        tokio::spawn(async move {
            Self::connection_loop(
                url_clone,
                command_rx,
                status_clone,
                on_message,
                on_error,
                on_open,
                on_close,
                config,
            )
            .await;
        });

        Ok(())
    }

    // Loop koneksi untuk websocket
    async fn connection_loop(
        url: Url,
        mut command_rx: Receiver<WsCommand>,
        status: Arc<Mutex<WsStatus>>,
        on_message: Option<MessageHandler>,
        on_error: Option<ErrorHandler>,
        on_open: Option<OpenHandler>,
        on_close: Option<CloseHandler>,
        config: WsConfig,
    ) {
        let mut reconnect_attempts = 0;
        let max_reconnect_attempts = config.max_reconnect_attempts.unwrap_or(3);
        let auto_reconnect = config.auto_reconnect.unwrap_or(true);

        loop {
            // Connect to WebSocket server
            let result = connect_async(url.clone()).await;

            match result {
                Ok((ws_stream, _)) => {
                    // Reset reconnect attempts on successful connection
                    reconnect_attempts = 0;

                    // Set status to connected
                    *status.lock().unwrap() = WsStatus::Connected;

                    // Call on_open handler
                    if let Some(handler) = &on_open {
                        handler();
                    }

                    // Start processing WebSocket messages
                    if let Err(err) = Self::process_websocket(
                        ws_stream,
                        &mut command_rx,
                        &status,
                        &on_message,
                        &on_error,
                        &on_close,
                    )
                    .await
                    {
                        // Call on_error handler
                        if let Some(handler) = &on_error {
                            handler(err.to_string());
                        }
                    }
                }
                Err(e) => {
                    // Call on_error handler
                    if let Some(handler) = &on_error {
                        handler(format!("Connection error: {}", e));
                    }

                    *status.lock().unwrap() = WsStatus::Error;
                }
            }

            // Handle reconnection logic
            if auto_reconnect && reconnect_attempts < max_reconnect_attempts {
                reconnect_attempts += 1;
                *status.lock().unwrap() = WsStatus::Reconnecting;

                // Exponential backoff
                let backoff_secs = 2_u64.pow(reconnect_attempts);
                tokio::time::sleep(Duration::from_secs(backoff_secs)).await;

                continue;
            }

            // No reconnection, exit the loop
            *status.lock().unwrap() = WsStatus::Disconnected;

            // Call on_close handler
            if let Some(handler) = &on_close {
                handler(None, "Connection closed".to_string());
            }

            break;
        }
    }

    // Memproses pesan websocket
    async fn process_websocket(
        mut ws_stream: WsStream,
        command_rx: &mut Receiver<WsCommand>,
        status: &Arc<Mutex<WsStatus>>,
        on_message: &Option<MessageHandler>,
        on_error: &Option<ErrorHandler>,
        on_close: &Option<CloseHandler>,
    ) -> Result<(), String> {
        let (mut write, mut read) = ws_stream.split();

        let mut last_ping = Instant::now();

        loop {
            tokio::select! {
                // Handle incoming WebSocket messages
                msg = read.next() => {
                    match msg {
                        Some(Ok(Message::Text(text))) => {
                            if let Some(handler) = on_message {
                                handler(text);
                            }
                        },
                        Some(Ok(Message::Binary(data))) => {
                            if let Some(handler) = on_message {
                                match String::from_utf8(data) {
                                    Ok(text) => handler(text),
                                    Err(_) => {
                                        if let Some(err_handler) = on_error {
                                            err_handler("Received binary data that is not valid UTF-8".to_string());
                                        }
                                    }
                                }
                            }
                        },
                        Some(Ok(Message::Ping(_))) => {
                            if let Err(e) = write.send(Message::Pong(vec![])).await {
                                if let Some(handler) = on_error {
                                    handler(format!("Failed to send pong: {}", e));
                                }
                                return Err(format!("Failed to send pong: {}", e));
                            }
                        },
                        Some(Ok(Message::Pong(_))) => {
                            // Update last ping time
                            last_ping = Instant::now();
                        },
                        Some(Ok(Message::Close(frame))) => {
                            if let Some(handler) = on_close {
                                handler(
                                    frame.as_ref().map(|f| f.code.into()),
                                    frame.as_ref().map(|f| f.reason.to_string()).unwrap_or_default(),
                                );
                            }

                            *status.lock().unwrap() = WsStatus::Disconnected;
                            return Ok(());
                        },
                        Some(Err(e)) => {
                            if let Some(handler) = on_error {
                                handler(format!("WebSocket error: {}", e));
                            }
                            return Err(format!("WebSocket error: {}", e));
                        },
                        None => {
                            if let Some(handler) = on_close {
                                handler(None, "Connection closed".to_string());
                            }
                            *status.lock().unwrap() = WsStatus::Disconnected;
                            return Ok(());
                        }
                    }
                },

                // Handle commands from the channel
                cmd = command_rx.recv() => {
                    match cmd {
                        Some(WsCommand::Send(text)) => {
                            if let Err(e) = write.send(Message::Text(text)).await {
                                if let Some(handler) = on_error {
                                    handler(format!("Failed to send message: {}", e));
                                }
                                return Err(format!("Failed to send message: {}", e));
                            }
                        },
                        Some(WsCommand::Close) => {
                            *status.lock().unwrap() = WsStatus::Disconnecting;

                            if let Err(e) = write.close().await {
                                if let Some(handler) = on_error {
                                    handler(format!("Failed to close connection: {}", e));
                                }
                                return Err(format!("Failed to close connection: {}", e));
                            }

                            *status.lock().unwrap() = WsStatus::Disconnected;
                            return Ok(());
                        },
                        None => {
                            // Command channel closed, exit
                            return Ok(());
                        }
                    }
                },

                // Send ping every 30 seconds to keep connection alive
                _ = tokio::time::sleep(Duration::from_secs(30)) => {
                    if last_ping.elapsed() > Duration::from_secs(30) {
                        if let Err(e) = write.send(Message::Ping(vec![])).await {
                            if let Some(handler) = on_error {
                                handler(format!("Failed to send ping: {}", e));
                            }
                            return Err(format!("Failed to send ping: {}", e));
                        }
                    }
                }
            }
        }
    }

    // Mengirim pesan teks
    pub async fn send(&self, message: &str) -> Result<(), String> {
        if self.status() != WsStatus::Connected {
            return Err("WebSocket is not connected".to_string());
        }

        if let Some(tx) = &self.command_tx {
            tx.send(WsCommand::Send(message.to_string()))
                .await
                .map_err(|e| format!("Failed to send command: {}", e))?;
            Ok(())
        } else {
            Err("Command channel not initialized".to_string())
        }
    }

    // Mengirim pesan JSON
    pub async fn send_json<T: Serialize>(&self, message: &T) -> Result<(), String> {
        let json = match serde_json::to_string(message) {
            Ok(j) => j,
            Err(e) => return Err(format!("Failed to serialize to JSON: {}", e)),
        };
        self.send(&json).await
    }

    // Menutup koneksi websocket
    pub async fn close(&self) -> Result<(), String> {
        if self.status() == WsStatus::Disconnected {
            return Ok(());
        }

        if let Some(tx) = &self.command_tx {
            tx.send(WsCommand::Close)
                .await
                .map_err(|e| format!("Failed to send close command: {}", e))?;
            Ok(())
        } else {
            Err("Command channel not initialized".to_string())
        }
    }
}

// Menandai tipe yang bisa digunakan di lingkungan async
impl std::fmt::Debug for WebSocketClient {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("WebSocketClient")
            .field("url", &self.url)
            .field("status", &self.status)
            .finish()
    }
}

// Fungsi helper untuk membuat koneksi websocket
pub async fn connect_websocket(url: &str, config: Option<WsConfig>) -> Result<WebSocketClient, String> {
    let mut client = WebSocketClient::new(url, config);
    client.connect().await?;
    Ok(client)
}
