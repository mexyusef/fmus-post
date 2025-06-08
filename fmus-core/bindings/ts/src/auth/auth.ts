/**
 * Authentication implementation for FMUS-POST
 */
import {
  AuthOptions,
  BasicAuthOptions,
  BearerAuthOptions,
  ApiKeyAuthOptions,
  OAuth2Options
} from '../types';

/**
 * Apply authentication to a request configuration
 */
export const applyAuth = (config: any): any => {
  const { auth, ...rest } = config;

  if (!auth || !auth.type) {
    return config;
  }

  switch (auth.type) {
    case 'basic':
      return applyBasicAuth(config, auth as BasicAuthOptions);
    case 'bearer':
      return applyBearerAuth(config, auth as BearerAuthOptions);
    case 'apikey':
      return applyApiKeyAuth(config, auth as ApiKeyAuthOptions);
    case 'oauth2':
      return applyOAuth2Auth(config, auth as OAuth2Options);
    default:
      // Return unmodified if auth type not recognized
      return config;
  }
};

/**
 * Apply Basic Authentication
 */
export const applyBasicAuth = (config: any, auth: BasicAuthOptions): any => {
  const { headers = {} } = config;

  // Create base64 encoded credentials
  const credentials = btoa(`${auth.username}:${auth.password}`);

  return {
    ...config,
    headers: {
      ...headers,
      'Authorization': `Basic ${credentials}`
    }
  };
};

/**
 * Apply Bearer Token Authentication
 */
export const applyBearerAuth = (config: any, auth: BearerAuthOptions): any => {
  const { headers = {} } = config;

  return {
    ...config,
    headers: {
      ...headers,
      'Authorization': `Bearer ${auth.token}`
    }
  };
};

/**
 * Apply API Key Authentication
 */
export const applyApiKeyAuth = (config: any, auth: ApiKeyAuthOptions): any => {
  const { headers = {}, params = {} } = config;

  switch (auth.in) {
    case 'header':
      return {
        ...config,
        headers: {
          ...headers,
          [auth.key]: auth.value
        }
      };
    case 'query':
      return {
        ...config,
        params: {
          ...params,
          [auth.key]: auth.value
        }
      };
    case 'cookie':
      // This is a simplification, in a real implementation we'd need to handle cookies properly
      return {
        ...config,
        headers: {
          ...headers,
          'Cookie': `${auth.key}=${auth.value}`
        }
      };
    default:
      return config;
  }
};

/**
 * Apply OAuth 2.0 Authentication
 */
export const applyOAuth2Auth = (config: any, auth: OAuth2Options): any => {
  const { headers = {} } = config;

  // In a real implementation, this would handle token acquisition and refresh
  if (auth.accessToken) {
    return {
      ...config,
      headers: {
        ...headers,
        'Authorization': `Bearer ${auth.accessToken}`
      }
    };
  }

  // If no access token, this would trigger the OAuth2 flow
  // This is a placeholder that would be implemented in a real library
  console.warn('OAuth2 token acquisition not implemented in this example');

  return config;
};

/**
 * Shorthand auth methods for fluent API
 */
export const auth = {
  basic: (username: string, password: string): BasicAuthOptions => ({
    type: 'basic',
    username,
    password
  }),

  bearer: (token: string): BearerAuthOptions => ({
    type: 'bearer',
    token
  }),

  apiKey: (key: string, value: string, location: 'header' | 'query' | 'cookie' = 'header'): ApiKeyAuthOptions => ({
    type: 'apikey',
    key,
    value,
    in: location
  }),

  oauth2: (options: Omit<OAuth2Options, 'type'>): OAuth2Options => ({
    type: 'oauth2',
    ...options
  })
};
