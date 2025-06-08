/**
 * WebSocket implementation for FMUS-POST
 */
import WebSocket from 'ws';

interface WebSocketOptions {
  headers?: Record<string, string>;
  protocols?: string | string[];
  timeout?: number;
  autoReconnect?: boolean;
  maxRetries?: number;
}

interface WebSocketClient {
  url: string;
  socket: WebSocket | null;
  options: WebSocketOptions;
  isConnected: boolean;
  send: (data: any) => void;
  close: (code?: number, reason?: string) => void;
  onOpen: (callback: () => void) => WebSocketClient;
  onMessage: (callback: (data: any) => void) => WebSocketClient;
  onClose: (callback: (code: number, reason: string) => void) => WebSocketClient;
  onError: (callback: (error: Error) => void) => WebSocketClient;
}

/**
 * Create a WebSocket connection
 */
export const websocket = (url: string, options: WebSocketOptions = {}): WebSocketClient => {
  let socket: WebSocket | null = null;
  let retryCount = 0;
  let reconnectTimer: any = null;

  // Event listeners
  const listeners = {
    open: new Set<() => void>(),
    message: new Set<(data: any) => void>(),
    close: new Set<(code: number, reason: string) => void>(),
    error: new Set<(error: Error) => void>()
  };

  // Default options
  const defaultOptions: WebSocketOptions = {
    autoReconnect: false,
    maxRetries: 3,
    timeout: 30000
  };

  // Merged options
  const mergedOptions = { ...defaultOptions, ...options };

  /**
   * Initialize the WebSocket connection
   */
  const connect = () => {
    try {
      socket = new WebSocket(url, mergedOptions.protocols, {
        headers: mergedOptions.headers
      });

      // Connection timeout
      const timeoutId = setTimeout(() => {
        if (socket && socket.readyState !== WebSocket.OPEN) {
          socket.terminate();
          const error = new Error(`Connection timeout after ${mergedOptions.timeout}ms`);
          listeners.error.forEach(cb => cb(error));
        }
      }, mergedOptions.timeout);

      // Setup event listeners
      socket.on('open', () => {
        clearTimeout(timeoutId);
        retryCount = 0;
        client.isConnected = true;
        listeners.open.forEach(cb => cb());
      });

      socket.on('message', (data) => {
        // Parse JSON if possible
        let parsedData;
        if (typeof data === 'string') {
          try {
            parsedData = JSON.parse(data as string);
          } catch (e) {
            parsedData = data;
          }
        } else {
          parsedData = data;
        }

        listeners.message.forEach(cb => cb(parsedData));
      });

      socket.on('close', (code, reason) => {
        clearTimeout(timeoutId);
        client.isConnected = false;
        listeners.close.forEach(cb => cb(code, reason));

        // Auto reconnect if enabled
        if (mergedOptions.autoReconnect && retryCount < (mergedOptions.maxRetries || 0)) {
          retryCount++;
          const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

          reconnectTimer = setTimeout(() => {
            connect();
          }, delay);
        }
      });

      socket.on('error', (error) => {
        listeners.error.forEach(cb => cb(error));
      });
    } catch (error: any) {
      listeners.error.forEach(cb => cb(error));
    }
  };

  /**
   * WebSocket client interface
   */
  const client: WebSocketClient = {
    url,
    socket,
    options: mergedOptions,
    isConnected: false,

    /**
     * Send data through the WebSocket
     */
    send: (data: any) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket is not connected');
      }

      // Convert objects to JSON
      const payload = typeof data === 'object' ? JSON.stringify(data) : data;
      socket.send(payload);
    },

    /**
     * Close the WebSocket connection
     */
    close: (code?: number, reason?: string) => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      if (socket) {
        // Disable auto reconnect when manually closing
        mergedOptions.autoReconnect = false;
        socket.close(code, reason);
      }
    },

    /**
     * Register open event listener
     */
    onOpen: (callback: () => void) => {
      listeners.open.add(callback);
      // If already connected, call the callback immediately
      if (socket && socket.readyState === WebSocket.OPEN) {
        callback();
      }
      return client;
    },

    /**
     * Register message event listener
     */
    onMessage: (callback: (data: any) => void) => {
      listeners.message.add(callback);
      return client;
    },

    /**
     * Register close event listener
     */
    onClose: (callback: (code: number, reason: string) => void) => {
      listeners.close.add(callback);
      return client;
    },

    /**
     * Register error event listener
     */
    onError: (callback: (error: Error) => void) => {
      listeners.error.add(callback);
      return client;
    }
  };

  // Start the connection
  connect();

  return client;
};
