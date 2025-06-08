declare module 'commander';
declare module 'chalk';
declare module 'fmus-post' {
  export function get(url: string, options?: {
    headers?: Record<string, string>;
    params?: Record<string, string>;
  }): Promise<{
    status: number;
    time: number;
    headers: Record<string, string>;
    json: () => any;
  }>;

  export function post(url: string, options?: {
    headers?: Record<string, string>;
    params?: Record<string, string>;
    body?: any;
  }): Promise<{
    status: number;
    time: number;
    headers: Record<string, string>;
    json: () => any;
  }>;

  export function put(url: string, options?: {
    headers?: Record<string, string>;
    params?: Record<string, string>;
    body?: any;
  }): Promise<{
    status: number;
    time: number;
    headers: Record<string, string>;
    json: () => any;
  }>;

  export function del(url: string, options?: {
    headers?: Record<string, string>;
    params?: Record<string, string>;
  }): Promise<{
    status: number;
    time: number;
    headers: Record<string, string>;
    json: () => any;
  }>;

  export function client(options?: {
    baseUrl?: string;
    headers?: Record<string, string>;
    timeout?: number;
  }): {
    get: typeof get;
    post: typeof post;
    put: typeof put;
    del: typeof del;
  };
}
