import { RequestConfig } from '../http/client';
import { Response } from '../http/response';

/**
 * Function that processes a request before it's sent
 */
export type RequestMiddlewareFn = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

/**
 * Function that processes a response after it's received
 */
export type ResponseMiddlewareFn = (response: Response) => Response | Promise<Response>;

/**
 * Middleware options
 */
export interface MiddlewareOptions {
  name: string;
  request?: RequestMiddlewareFn;
  response?: ResponseMiddlewareFn;
}

/**
 * Middleware that can process requests and responses
 */
export class Middleware {
  readonly name: string;
  readonly requestFn?: RequestMiddlewareFn;
  readonly responseFn?: ResponseMiddlewareFn;

  /**
   * Create a new middleware
   */
  constructor(options: MiddlewareOptions) {
    this.name = options.name;
    this.requestFn = options.request;
    this.responseFn = options.response;
  }

  /**
   * Apply middleware to a request
   */
  async applyToRequest(config: RequestConfig): Promise<RequestConfig> {
    if (this.requestFn) {
      return await this.requestFn(config);
    }
    return config;
  }

  /**
   * Apply middleware to a response
   */
  async applyToResponse(response: Response): Promise<Response> {
    if (this.responseFn) {
      return await this.responseFn(response);
    }
    return response;
  }
}

/**
 * Manager for handling middleware chains
 */
export class MiddlewareManager {
  private middlewares: Middleware[] = [];

  /**
   * Add middleware to the manager
   */
  add(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  /**
   * Apply all middleware to a request
   */
  async applyToRequest(config: RequestConfig): Promise<RequestConfig> {
    let current = config;
    for (const middleware of this.middlewares) {
      current = await middleware.applyToRequest(current);
    }
    return current;
  }

  /**
   * Apply all middleware to a response
   */
  async applyToResponse(response: Response): Promise<Response> {
    let current = response;
    // Apply middleware in reverse order for responses
    for (const middleware of [...this.middlewares].reverse()) {
      current = await middleware.applyToResponse(current);
    }
    return current;
  }
}

/**
 * Create middleware with the given options
 */
export function createMiddleware(options: MiddlewareOptions): Middleware {
  return new Middleware(options);
}
