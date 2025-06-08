/**
 * Authentication types supported by the client
 */
export type AuthType = 'none' | 'basic' | 'bearer' | 'api-key' | 'oauth2' | 'custom';

/**
 * Locations for API key authentication
 */
export type ApiKeyLocation = 'header' | 'query' | 'cookie';

/**
 * Basic authentication configuration
 */
export interface BasicAuthConfig {
  type: 'basic';
  username: string;
  password: string;
}

/**
 * Bearer token authentication configuration
 */
export interface BearerAuthConfig {
  type: 'bearer';
  token: string;
}

/**
 * API key authentication configuration
 */
export interface ApiKeyAuthConfig {
  type: 'api-key';
  key: string;
  value: string;
  location: ApiKeyLocation;
}

/**
 * OAuth 2.0 authentication configuration
 */
export interface OAuth2AuthConfig {
  type: 'oauth2';
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  scopes: string[];
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Custom authentication configuration
 */
export interface CustomAuthConfig {
  type: 'custom';
  authType: string;
  data: Record<string, any>;
}

/**
 * Authentication configuration
 */
export type AuthConfig =
  | BasicAuthConfig
  | BearerAuthConfig
  | ApiKeyAuthConfig
  | OAuth2AuthConfig
  | CustomAuthConfig;

/**
 * Authentication utilities
 */
export class Auth {
  /**
   * Create basic authentication
   */
  static basic(username: string, password: string): BasicAuthConfig {
    return {
      type: 'basic',
      username,
      password
    };
  }

  /**
   * Create bearer token authentication
   */
  static bearer(token: string): BearerAuthConfig {
    return {
      type: 'bearer',
      token
    };
  }

  /**
   * Create API key authentication
   */
  static apiKey(key: string, value: string, location: ApiKeyLocation = 'header'): ApiKeyAuthConfig {
    return {
      type: 'api-key',
      key,
      value,
      location
    };
  }

  /**
   * Create OAuth 2.0 authentication
   */
  static oauth2(
    clientId: string,
    clientSecret: string,
    tokenUrl: string,
    scopes: string[] = []
  ): OAuth2AuthConfig {
    return {
      type: 'oauth2',
      clientId,
      clientSecret,
      tokenUrl,
      scopes
    };
  }

  /**
   * Create custom authentication
   */
  static custom(authType: string, data: Record<string, any>): CustomAuthConfig {
    return {
      type: 'custom',
      authType,
      data
    };
  }
}
