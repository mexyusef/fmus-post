import axios from 'axios';

// Komentar: Interface untuk opsi request
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
}

// Komentar: Interface untuk respons HTTP
export interface Response {
  status: number;
  time: number;
  headers: Record<string, string>;
  json: () => any;
  text: () => string;
}

// Komentar: Fungsi dasar untuk membuat HTTP request
async function request(method: string, url: string, options?: RequestOptions): Promise<Response> {
  const startTime = Date.now();

  try {
    // Komentar: Persiapkan opsi axios
    const axiosOptions = {
      method: method.toUpperCase(),
      url: url,
      headers: options?.headers || {},
      params: options?.params || {},
      data: options?.body || null,
      timeout: 30000,
      validateStatus: () => true // Komentar: Terima semua status code
    };

    // Komentar: Kirim request
    const axiosResponse = await axios(axiosOptions);
    const endTime = Date.now();

    // Komentar: Buat objek Response
    return {
      status: axiosResponse.status,
      time: endTime - startTime,
      headers: axiosResponse.headers as Record<string, string>,
      json: () => axiosResponse.data,
      text: () => {
        if (typeof axiosResponse.data === 'object') {
          return JSON.stringify(axiosResponse.data);
        }
        return String(axiosResponse.data);
      }
    };
  } catch (error: any) {
    const endTime = Date.now();
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Komentar: Implementasi HTTP GET
export function get(url: string, options?: RequestOptions): Promise<Response> {
  return request('GET', url, options);
}

// Komentar: Implementasi HTTP POST
export function post(url: string, options?: RequestOptions): Promise<Response> {
  return request('POST', url, options);
}

// Komentar: Implementasi HTTP PUT
export function put(url: string, options?: RequestOptions): Promise<Response> {
  return request('PUT', url, options);
}

// Komentar: Implementasi HTTP DELETE
export function del(url: string, options?: RequestOptions): Promise<Response> {
  return request('DELETE', url, options);
}

// Komentar: Implementasi client
export function client(options?: {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeout?: number;
}): {
  get: typeof get;
  post: typeof post;
  put: typeof put;
  del: typeof del;
} {
  // Komentar: Implementasi client yang lebih lengkap bisa ditambahkan nanti
  return {
    get,
    post,
    put,
    del
  };
}
