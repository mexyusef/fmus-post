/**
 * FMUS-POST - A modern, human-centered API testing library
 *
 * This is the main entry point for the library which exports all
 * the public API functions and types.
 */

// HTTP client exports
export {
  get, post, put, patch, del, head, options, client,
  HttpClient, RequestConfig, ClientConfig
} from './http';
export { Response } from './http/response';

// Authentication exports
export { Auth, AuthConfig } from './auth';

// Middleware exports
export {
  createMiddleware, Middleware, MiddlewareManager,
  MiddlewareOptions, RequestMiddlewareFn, ResponseMiddlewareFn
} from './middleware';

// WebSocket exports
export {
  WebSocketClient, WebSocketOptions,
  WebSocketEventMap, WebSocketCloseEvent
} from './ws';

// GraphQL exports
export {
  graphql, GraphQLClient, GraphQLOptions, GraphQLRequestOptions
} from './graphql';

// gRPC exports (placeholder)
// export { grpc, GrpcClient } from './grpc';

// Types
export * from './types';

/**
 * Library version
 */
export const VERSION = '0.0.1';

/**
 * Client factory for creating a preconfigured HTTP client
 */
export function createClient(config?: ClientConfig) {
  return client(config);
}
