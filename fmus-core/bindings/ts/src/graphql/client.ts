/**
 * GraphQL client implementation for FMUS-POST
 */
import { client as httpClient } from '../http/client';
import { RequestOptions, Response } from '../types';

interface GraphQLVariables {
  [key: string]: any;
}

interface GraphQLOptions extends Omit<RequestOptions, 'body'> {
  variables?: GraphQLVariables;
  operationName?: string;
}

interface GraphQLResponse extends Response {
  data?: any;
  errors?: any[];
}

/**
 * Execute a GraphQL query
 */
export const graphql = async (
  url: string,
  options: GraphQLOptions & { query: string }
): Promise<GraphQLResponse> => {
  const { query, variables, operationName, ...restOptions } = options;

  // Create GraphQL request body
  const body = {
    query,
    variables,
    operationName
  };

  // Default headers for GraphQL
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  // Execute request
  const response = await httpClient.request({
    url,
    method: 'POST',
    body,
    headers,
    ...restOptions
  });

  // Enhanced response with GraphQL-specific fields
  const graphqlResponse = response as GraphQLResponse;

  // Parse GraphQL response
  const responseBody = typeof response.body === 'string'
    ? JSON.parse(response.body)
    : response.body;

  // Add GraphQL-specific fields to response
  graphqlResponse.data = responseBody.data;
  graphqlResponse.errors = responseBody.errors;

  // Validate GraphQL response
  if (graphqlResponse.errors && graphqlResponse.errors.length > 0) {
    console.warn('GraphQL query returned errors:', graphqlResponse.errors);
  }

  return graphqlResponse;
};

/**
 * Create a GraphQL client for a specific endpoint
 */
export const createGraphQLClient = (baseUrl: string, defaultOptions: GraphQLOptions = {}) => {
  return {
    /**
     * Execute a query operation
     */
    query: (query: string, variables?: GraphQLVariables, options?: GraphQLOptions) => {
      return graphql(baseUrl, {
        ...defaultOptions,
        ...options,
        query,
        variables
      });
    },

    /**
     * Execute a mutation operation
     */
    mutation: (mutation: string, variables?: GraphQLVariables, options?: GraphQLOptions) => {
      return graphql(baseUrl, {
        ...defaultOptions,
        ...options,
        query: mutation, // GraphQL uses the query field for mutations too
        variables
      });
    },

    /**
     * Execute a subscription operation (this is a placeholder - real implementation would use WebSockets)
     */
    subscription: (subscription: string, variables?: GraphQLVariables, options?: GraphQLOptions) => {
      console.warn('Subscriptions require WebSocket transport which is not implemented in this example');
      return {
        subscribe: (onNext: (data: any) => void, onError?: (error: any) => void) => {
          onError && onError(new Error('Subscriptions not implemented'));
          return {
            unsubscribe: () => {}
          };
        }
      };
    }
  };
};
