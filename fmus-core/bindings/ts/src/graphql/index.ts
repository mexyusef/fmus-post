import { gql, request } from 'graphql-request';
import { ClientConfig } from '../http/client';
import { AuthConfig } from '../auth';

/**
 * GraphQL client options
 */
export interface GraphQLOptions extends ClientConfig {
  headers?: Record<string, string>;
  auth?: AuthConfig;
}

/**
 * GraphQL request options
 */
export interface GraphQLRequestOptions {
  variables?: Record<string, any>;
  operationName?: string;
  headers?: Record<string, string>;
}

/**
 * GraphQL client
 */
export class GraphQLClient {
  private endpoint: string;
  private options: GraphQLOptions;

  /**
   * Create a new GraphQL client
   */
  constructor(endpoint: string, options: GraphQLOptions = {}) {
    this.endpoint = endpoint;
    this.options = options;
  }

  /**
   * Send a GraphQL query/mutation
   */
  async query<T = any>(
    query: string,
    options: GraphQLRequestOptions = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(this.options.headers || {}),
      ...(options.headers || {}),
    };

    // Add authentication headers if needed
    if (this.options.auth) {
      this.applyAuth(headers, this.options.auth);
    }

    return request<T>(
      this.endpoint,
      query,
      options.variables,
      headers
    );
  }

  /**
   * Apply authentication to headers
   */
  private applyAuth(headers: Record<string, string>, auth: AuthConfig): void {
    switch (auth.type) {
      case 'basic':
        const basicAuth = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
        headers.Authorization = `Basic ${basicAuth}`;
        break;

      case 'bearer':
        headers.Authorization = `Bearer ${auth.token}`;
        break;

      case 'api-key':
        if (auth.location === 'header') {
          headers[auth.key] = auth.value;
        }
        break;

      // Add other auth methods as needed
    }
  }
}

/**
 * Send a GraphQL query/mutation
 */
export async function graphql<T = any>(
  endpoint: string,
  options: {
    query: string;
    variables?: Record<string, any>;
    headers?: Record<string, string>;
    auth?: AuthConfig;
  }
): Promise<T> {
  const client = new GraphQLClient(endpoint, {
    headers: options.headers,
    auth: options.auth,
  });

  return client.query<T>(options.query, {
    variables: options.variables,
  });
}
