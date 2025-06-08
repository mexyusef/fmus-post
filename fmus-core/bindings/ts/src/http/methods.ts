/**
 * Core HTTP methods implementation for FMUS-POST
 */
import { client } from './client';
import { HttpMethod, RequestOptions, Response } from '../types';

/**
 * Create a request executor for a specific HTTP method
 */
const createMethodExecutor = (method: HttpMethod) => {
  return (url: string, options: RequestOptions = {}): Promise<Response> => {
    return client.request({
      url,
      method,
      ...options
    });
  };
};

/**
 * Send a GET request
 */
export const get = createMethodExecutor('GET');

/**
 * Send a POST request
 */
export const post = createMethodExecutor('POST');

/**
 * Send a PUT request
 */
export const put = createMethodExecutor('PUT');

/**
 * Send a PATCH request
 */
export const patch = createMethodExecutor('PATCH');

/**
 * Send a DELETE request
 */
export const del = createMethodExecutor('DELETE');

/**
 * Send a HEAD request
 */
export const head = createMethodExecutor('HEAD');

/**
 * Send an OPTIONS request
 */
export const options = createMethodExecutor('OPTIONS');

// Method chaining extensions for requests
// These are automatically applied to all method calls

export const withRetry = (request: Promise<Response>, times: number): Promise<Response> => {
  // Implementation for retry logic
  return request; // Placeholder
};

export const withTimeout = (request: Promise<Response>, ms: number): Promise<Response> => {
  // Implementation for timeout
  return request; // Placeholder
};

// Extend the request methods with chainable API
export const extendWithChaining = (method: Function): Function => {
  // Implementation for method chaining
  return method; // Placeholder
};
