/**
 * HTTP Client implementation for FMUS-POST
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import { RequestOptions, Response, Middleware, ResponseData, HttpMethod } from '../types';
import { applyAuth } from '../auth/auth';
import { Auth, AuthConfig } from '../auth';

/**
 * HTTP request configuration
 */
export interface RequestConfig {
  method?: Method;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
  timeout?: number;
  auth?: AuthConfig;
}

/**
 * HTTP client configuration
 */
export interface ClientConfig {
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Main HTTP client class
 */
export class HttpClient {
  private client: AxiosInstance;
  private config: ClientConfig;
  private middlewareManager: MiddlewareManager = new MiddlewareManager();

  /**
   * Create a new HTTP client
   */
  constructor(config?: ClientConfig) {
    this.config = config || {};

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout || 30000,
      headers: {
        'User-Agent': 'fmus-post/0.0.1',
        ...(this.config.headers || {})
      }
    });
  }

  /**
   * Add middleware to the client
   */
  use(middleware: Middleware): HttpClient {
    this.middlewareManager.add(middleware);
    return this;
  }

  /**
   * Send an HTTP request
   */
  async request(config: RequestConfig): Promise<Response> {
    const startTime = Date.now();

    // Apply request middleware
    let processedConfig = this.middlewareManager.applyToRequest(config);

    // Prepare Axios request config
    const axiosConfig: AxiosRequestConfig = {
      method: processedConfig.method || 'GET',
      url: processedConfig.url,
      headers: processedConfig.headers || {},
      params: processedConfig.params,
      data: processedConfig.body,
      timeout: processedConfig.timeout || this.config.timeout || 30000,
      validateStatus: () => true, // Don't throw on any status code
    };

    // Add authentication if provided
    if (processedConfig.auth) {
      this.applyAuth(axiosConfig, processedConfig.auth);
    }

    try {
      // Send the request
      const axiosResponse = await this.client.request(axiosConfig);

      // Create our response object
      let response = new Response({
        status: axiosResponse.status,
        headers: axiosResponse.headers as Record<string, string>,
        data: axiosResponse.data,
        time: Date.now() - startTime,
        config: processedConfig
      });

      // Apply response middleware
      response = this.middlewareManager.applyToResponse(response);

      return response;
    } catch (error) {
      // Handle Axios errors
      if (axios.isAxiosError(error) && error.response) {
        // Create response object from error
        let response = new Response({
          status: error.response.status,
          headers: error.response.headers as Record<string, string>,
          data: error.response.data,
          time: Date.now() - startTime,
          config: processedConfig,
          error: error
        });

        // Apply response middleware
        response = this.middlewareManager.applyToResponse(response);

        return response;
      }

      // For network errors or other issues, create a generic error response
      let response = new Response({
        status: 0,
        headers: {},
        data: null,
        time: Date.now() - startTime,
        config: processedConfig,
        error: error instanceof Error ? error : new Error(String(error))
      });

      // Apply response middleware
      response = this.middlewareManager.applyToResponse(response);

      return response;
    }
  }

  /**
   * Apply authentication configuration to Axios request config
   */
  private applyAuth(axiosConfig: AxiosRequestConfig, auth: AuthConfig): void {
    switch (auth.type) {
      case 'basic':
        axiosConfig.auth = {
          username: auth.username || '',
          password: auth.password || ''
        };
        break;

      case 'bearer':
        axiosConfig.headers = axiosConfig.headers || {};
        axiosConfig.headers.Authorization = `Bearer ${auth.token}`;
        break;

      case 'api-key':
        axiosConfig.headers = axiosConfig.headers || {};
        if (auth.location === 'header') {
          axiosConfig.headers[auth.key] = auth.value;
        } else if (auth.location === 'query') {
          axiosConfig.params = axiosConfig.params || {};
          axiosConfig.params[auth.key] = auth.value;
        }
        break;

      // OAuth and other auth methods would be implemented here
    }
  }

  /**
   * Send a GET request
   */
  async get(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
    return this.request({
      method: 'GET',
      url,
      ...config
    });
  }

  /**
   * Send a POST request
   */
  async post(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
    return this.request({
      method: 'POST',
      url,
      ...config
    });
  }

  /**
   * Send a PUT request
   */
  async put(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
    return this.request({
      method: 'PUT',
      url,
      ...config
    });
  }

  /**
   * Send a PATCH request
   */
  async patch(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
    return this.request({
      method: 'PATCH',
      url,
      ...config
    });
  }

  /**
   * Send a DELETE request
   */
  async delete(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
    return this.request({
      method: 'DELETE',
      url,
      ...config
    });
  }

  /**
   * Send a HEAD request
   */
  async head(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
    return this.request({
      method: 'HEAD',
      url,
      ...config
    });
  }

  /**
   * Send an OPTIONS request
   */
  async options(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
    return this.request({
      method: 'OPTIONS',
      url,
      ...config
    });
  }
}

/**
 * Create an HTTP client
 */
export function client(config?: ClientConfig): HttpClient {
  return new HttpClient(config);
}

/**
 * Send a GET request
 */
export async function get(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
  return new HttpClient().get(url, config);
}

/**
 * Send a POST request
 */
export async function post(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
  return new HttpClient().post(url, config);
}

/**
 * Send a PUT request
 */
export async function put(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
  return new HttpClient().put(url, config);
}

/**
 * Send a PATCH request
 */
export async function patch(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
  return new HttpClient().patch(url, config);
}

/**
 * Send a DELETE request
 */
export async function del(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
  return new HttpClient().delete(url, config);
}

/**
 * Send a HEAD request
 */
export async function head(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
  return new HttpClient().head(url, config);
}

/**
 * Send an OPTIONS request
 */
export async function options(url: string, config?: Omit<RequestConfig, 'method' | 'url'>): Promise<Response> {
  return new HttpClient().options(url, config);
}
