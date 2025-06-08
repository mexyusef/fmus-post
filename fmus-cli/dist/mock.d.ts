interface RequestOptions {
    headers?: Record<string, string>;
    params?: Record<string, string>;
    body?: any;
}
interface Response {
    status: number;
    time: number;
    headers: Record<string, string>;
    json: () => any;
}
export declare function get(url: string, options?: RequestOptions): Promise<Response>;
export declare function post(url: string, options?: RequestOptions): Promise<Response>;
export declare function put(url: string, options?: RequestOptions): Promise<Response>;
export declare function del(url: string, options?: RequestOptions): Promise<Response>;
export declare function client(options?: {
    baseUrl?: string;
    headers?: Record<string, string>;
    timeout?: number;
}): {
    get: typeof get;
    post: typeof post;
    put: typeof put;
    del: typeof del;
};
export {};
