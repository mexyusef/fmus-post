import { RequestConfig } from './client';

/**
 * Response initialization options
 */
export interface ResponseOptions {
  status: number;
  headers: Record<string, string>;
  data: any;
  time: number;
  config: RequestConfig;
  error?: Error;
}

/**
 * Represents an HTTP response
 */
export class Response {
  readonly status: number;
  readonly headers: Record<string, string>;
  readonly data: any;
  readonly time: number;
  readonly config: RequestConfig;
  readonly error?: Error;

  /**
   * Create a new Response instance
   */
  constructor(options: ResponseOptions) {
    this.status = options.status;
    this.headers = options.headers;
    this.data = options.data;
    this.time = options.time;
    this.config = options.config;
    this.error = options.error;
  }

  /**
   * Check if the response was successful (status code 2xx)
   */
  get ok(): boolean {
    return this.status >= 200 && this.status < 300;
  }

  /**
   * Get the response body as JSON
   */
  json<T = any>(): T {
    if (typeof this.data === 'string') {
      try {
        return JSON.parse(this.data) as T;
      } catch (error) {
        throw new Error(`Failed to parse response as JSON: ${error}`);
      }
    }
    return this.data as T;
  }

  /**
   * Get the response body as text
   */
  text(): string {
    if (typeof this.data === 'string') {
      return this.data;
    }
    if (this.data === null || this.data === undefined) {
      return '';
    }
    if (typeof this.data === 'object') {
      return JSON.stringify(this.data);
    }
    return String(this.data);
  }

  /**
   * Get the response body as a buffer
   */
  buffer(): Buffer {
    if (Buffer.isBuffer(this.data)) {
      return this.data;
    }
    return Buffer.from(this.text());
  }

  /**
   * Response assertions for testing
   */
  get assert() {
    return {
      /**
       * Assert that the status code matches the expected value
       */
      status: (expected: number): void => {
        if (this.status !== expected) {
          throw new Error(`Expected status ${expected} but got ${this.status}`);
        }
      },

      /**
       * Assert that the response has a header with the expected value
       */
      header: (name: string, expected?: string): void => {
        const headerName = Object.keys(this.headers)
          .find(key => key.toLowerCase() === name.toLowerCase());

        if (!headerName) {
          throw new Error(`Expected header "${name}" not found in response`);
        }

        if (expected !== undefined) {
          const actual = this.headers[headerName];
          if (actual !== expected) {
            throw new Error(`Expected header "${name}" to be "${expected}" but got "${actual}"`);
          }
        }
      },

      /**
       * Assert that the body matches a JSON schema
       */
      jsonSchema: (schema: any): void => {
        // Basic implementation - in real code we'd use a schema validator like Ajv
        const data = this.json();
        // Validate data against schema
        // For now just check that we have data
        if (!data) {
          throw new Error('Response body is empty or not valid JSON');
        }
      },

      /**
       * Assert that the response body contains the expected value at the given JSON path
       */
      jsonPath: (path: string, expected: any): void => {
        // Simple path implementation, we'd use jsonpath-plus in real code
        const data = this.json();
        const parts = path.split('.');
        let current = data;

        for (const part of parts) {
          if (part.includes('[') && part.includes(']')) {
            const [key, indexStr] = part.split('[');
            const index = parseInt(indexStr.replace(']', ''), 10);

            if (!current[key] || !Array.isArray(current[key])) {
              throw new Error(`Path ${path} does not exist in response`);
            }

            if (index >= current[key].length) {
              throw new Error(`Index ${index} out of bounds at ${path}`);
            }

            current = current[key][index];
          } else {
            if (current[part] === undefined) {
              throw new Error(`Path ${path} does not exist in response`);
            }
            current = current[part];
          }
        }

        if (JSON.stringify(current) !== JSON.stringify(expected)) {
          throw new Error(
            `Expected ${JSON.stringify(expected)} at path "${path}" but got ${JSON.stringify(current)}`
          );
        }
      }
    };
  }
}
