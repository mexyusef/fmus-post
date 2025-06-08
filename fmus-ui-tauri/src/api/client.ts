import { get as getRequest, post as postRequest, put as putRequest, del as deleteRequest } from 'fmus-post';

// Komentar: Interface untuk HTTP request options
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
  auth?: any;
  timeout?: number;
}

// Komentar: Interface untuk HTTP response
export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
  time: number;
  json: () => any;
}

// Komentar: Adapter function untuk convert fmus-post Response ke ApiResponse
const adaptResponse = (response: any): ApiResponse => {
  return {
    status: response.status,
    headers: response.headers,
    body: response.body,
    time: response.time,
    json: () => response.json()
  };
};

// Komentar: Adapter function untuk convert RequestOptions ke fmus-post options
const adaptRequestOptions = (options?: RequestOptions): any => {
  if (!options) return {};

  return {
    headers: options.headers,
    params: options.params,
    body: options.body,
    auth: options.auth,
    timeout: options.timeout
  };
};

// Komentar: Fungsi untuk membuat HTTP GET request
export const get = async (url: string, options?: RequestOptions): Promise<ApiResponse> => {
  const response = await getRequest(url, adaptRequestOptions(options));
  return adaptResponse(response);
};

// Komentar: Fungsi untuk membuat HTTP POST request
export const post = async (url: string, options?: RequestOptions): Promise<ApiResponse> => {
  const response = await postRequest(url, adaptRequestOptions(options));
  return adaptResponse(response);
};

// Komentar: Fungsi untuk membuat HTTP PUT request
export const put = async (url: string, options?: RequestOptions): Promise<ApiResponse> => {
  const response = await putRequest(url, adaptRequestOptions(options));
  return adaptResponse(response);
};

// Komentar: Fungsi untuk membuat HTTP DELETE request
export const del = async (url: string, options?: RequestOptions): Promise<ApiResponse> => {
  const response = await deleteRequest(url, adaptRequestOptions(options));
  return adaptResponse(response);
};
