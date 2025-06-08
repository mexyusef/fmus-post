export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
}

export interface Response {
  status: number;
  headers: Record<string, string>;
  body: any;
  time: number;
  json(): any;
}

export declare function get(url: string, options?: RequestOptions): Promise<Response>;
export declare function post(url: string, options?: RequestOptions): Promise<Response>;
export declare function put(url: string, options?: RequestOptions): Promise<Response>;
export declare function del(url: string, options?: RequestOptions): Promise<Response>;
export declare function patch(url: string, options?: RequestOptions): Promise<Response>;
export declare function head(url: string, options?: RequestOptions): Promise<Response>;
export declare function options(url: string, options?: RequestOptions): Promise<Response>;
