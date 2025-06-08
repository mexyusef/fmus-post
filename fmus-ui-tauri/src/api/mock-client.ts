import axios from 'axios';

// Komentar: Mock response untuk testing UI
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
}

interface Response {
  status: number;
  headers: Record<string, string>;
  body: any;
  time: number;
  json: () => any;
}

// Komentar: Fungsi untuk membuat HTTP request dengan axios
const makeRequest = async (
  method: string,
  url: string,
  options: RequestOptions = {}
): Promise<Response> => {
  const startTime = Date.now();

  try {
    const response = await axios({
      method,
      url,
      headers: options.headers,
      params: options.params,
      data: options.body,
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      status: response.status,
      headers: response.headers as Record<string, string>,
      body: response.data,
      time: responseTime,
      json: () => response.data
    };
  } catch (error: any) {
    if (error.response) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        status: error.response.status,
        headers: error.response.headers as Record<string, string>,
        body: error.response.data,
        time: responseTime,
        json: () => error.response.data
      };
    }

    throw error;
  }
};

// Komentar: Method-method untuk HTTP requests
export const get = (url: string, options?: RequestOptions) =>
  makeRequest('GET', url, options);

export const post = (url: string, options?: RequestOptions) =>
  makeRequest('POST', url, options);

export const put = (url: string, options?: RequestOptions) =>
  makeRequest('PUT', url, options);

export const del = (url: string, options?: RequestOptions) =>
  makeRequest('DELETE', url, options);
