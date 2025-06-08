import WebSocket from 'ws';

/**
 * WebSocket event map
 */
export interface WebSocketEventMap {
  open: () => void;
  message: (data: string | Buffer) => void;
  close: (event: WebSocketCloseEvent) => void;
  error: (error: Error) => void;
}

/**
 * WebSocket close event
 */
export interface WebSocketCloseEvent {
  code: number;
  reason: string;
  wasClean: boolean;
}

/**
 * WebSocket client options
 */
export interface WebSocketOptions {
  headers?: Record<string, string>;
  protocols?: string | string[];
  timeout?: number;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
}

/**
 * WebSocket client
 */
export class WebSocketClient {
  private url: string;
  private options: WebSocketOptions;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private eventHandlers: Partial<WebSocketEventMap> = {};

  /**
   * Create a new WebSocket client
   */
  constructor(url: string, options: WebSocketOptions = {}) {
    this.url = url;
    this.options = {
      timeout: 30000,
      reconnect: false,
      maxReconnectAttempts: 3,
      ...options,
    };
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url, {
          headers: this.options.headers,
          timeout: this.options.timeout,
          protocols: this.options.protocols,
        });

        // Set up event listeners
        this.ws.on('open', () => {
          this.reconnectAttempts = 0;
          if (this.eventHandlers.open) {
            this.eventHandlers.open();
          }
          resolve();
        });

        this.ws.on('message', (data) => {
          if (this.eventHandlers.message) {
            this.eventHandlers.message(data);
          }
        });

        this.ws.on('close', (code, reason) => {
          const event = {
            code,
            reason: reason.toString(),
            wasClean: code === 1000,
          };

          if (this.eventHandlers.close) {
            this.eventHandlers.close(event);
          }

          // Handle reconnection
          if (
            this.options.reconnect &&
            this.reconnectAttempts < (this.options.maxReconnectAttempts || 3)
          ) {
            this.reconnectAttempts++;
            setTimeout(() => {
              this.connect().catch(() => {
                // Failed to reconnect
              });
            }, 1000 * Math.pow(2, this.reconnectAttempts));
          }
        });

        this.ws.on('error', (error) => {
          if (this.eventHandlers.error) {
            this.eventHandlers.error(error);
          }
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Set event handler
   */
  on<T extends keyof WebSocketEventMap>(event: T, handler: WebSocketEventMap[T]): void {
    this.eventHandlers[event] = handler;
  }

  /**
   * Send message to the WebSocket server
   */
  send(data: string | Buffer): void {
    if (!this.ws) {
      throw new Error('WebSocket is not connected');
    }
    this.ws.send(data);
  }

  /**
   * Send JSON message to the WebSocket server
   */
  sendJSON(data: any): void {
    this.send(JSON.stringify(data));
  }

  /**
   * Close the WebSocket connection
   */
  close(code?: number, reason?: string): void {
    if (!this.ws) {
      return;
    }
    this.ws.close(code, reason);
  }

  /**
   * Check if the WebSocket is connected
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

/**
 * Create a WebSocket connection
 */
export function websocket(url: string, options?: WebSocketOptions): WebSocketClient {
  const client = new WebSocketClient(url, options);
  return client;
}
