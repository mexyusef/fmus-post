/**
 * Common TypeScript types for FMUS-POST
 */

// HTTP Request types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | null | undefined>;
  body?: any;
  auth?: AuthOptions;
  timeout?: number;
  followRedirects?: boolean;
  maxRedirects?: number;
  responseType?: 'json' | 'text' | 'arraybuffer' | 'stream';
  validateStatus?: (status: number) => boolean;
  middleware?: Middleware[];
  [key: string]: any;
}

// Authentication types
export type AuthType = 'basic' | 'bearer' | 'apikey' | 'oauth1' | 'oauth2' | 'awsv4' | 'digest' | 'ntlm' | 'custom';

export interface AuthOptions {
  type: AuthType;
  [key: string]: any;
}

export interface BasicAuthOptions extends AuthOptions {
  type: 'basic';
  username: string;
  password: string;
}

export interface BearerAuthOptions extends AuthOptions {
  type: 'bearer';
  token: string;
}

export interface ApiKeyAuthOptions extends AuthOptions {
  type: 'apikey';
  key: string;
  value: string;
  in: 'header' | 'query' | 'cookie';
}

export interface OAuth2Options extends AuthOptions {
  type: 'oauth2';
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  authUrl?: string;
  scopes?: string[];
  refreshToken?: string;
  accessToken?: string;
  grantType?: 'authorization_code' | 'client_credentials' | 'password' | 'refresh_token';
}

// Response types
export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  time: number;
  request: {
    url: string;
    method: HttpMethod;
    headers: Record<string, string>;
    body?: any;
  };
}

export interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  time: number;
  request: {
    url: string;
    method: HttpMethod;
    headers: Record<string, string>;
    body?: any;
  };
  json: () => any;
  text: () => string;
  buffer: () => ArrayBuffer;
  assert: {
    status: (expected: number) => boolean;
    header: (name: string, value?: string) => boolean;
    body: (predicate: (body: any) => boolean) => boolean;
    jsonSchema: (schema: any) => boolean;
  };
}

// Middleware types
export interface Middleware {
  name: string;
  request?: (req: any) => any;
  response?: (res: any) => any;
}

// Collection and environment types
export interface CollectionItem {
  name: string;
  description?: string;
  request: {
    method: HttpMethod;
    url: string;
    [key: string]: any;
  };
  tests?: string;
}

export interface CollectionOptions {
  name: string;
  description?: string;
  items?: CollectionItem[];
}

export interface EnvironmentOptions {
  name: string;
  variables: Record<string, any>;
}

// Plugin types
export interface Plugin {
  name: string;
  version: string;
  description?: string;
  setup: (options?: any) => PluginHooks;
}

export interface PluginHooks {
  request?: (req: any) => any;
  response?: (res: any) => any;
  components?: Record<string, any>;
}
