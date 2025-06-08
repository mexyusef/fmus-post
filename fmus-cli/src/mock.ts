// Komentar: Mock implementasi dari fmus-post untuk tujuan demo

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

// Komentar: Fungsi mock untuk simulasi respons HTTP
function mockResponse(url: string, method: string): Response {
  const startTime = Date.now();

  // Komentar: Data mock berdasarkan URL
  let responseBody: any;
  let status = 200;

  if (url.includes('jsonplaceholder.typicode.com')) {
    if (url.endsWith('/todos/1')) {
      responseBody = {
        userId: 1,
        id: 1,
        title: "delectus aut autem",
        completed: false
      };
    } else if (url.includes('/users/')) {
      const userId = url.split('/users/')[1].split('/')[0];
      responseBody = {
        id: parseInt(userId),
        name: "John Doe",
        username: "johndoe",
        email: "john@example.com"
      };

      if (url.includes('/posts')) {
        responseBody = [
          {
            userId: parseInt(userId),
            id: 1,
            title: "Sample post title",
            body: "Sample post body"
          }
        ];
      }
    } else if (url.includes('/posts') && method.toLowerCase() === 'post') {
      status = 201;
      responseBody = {
        id: 101,
        title: "Test Post",
        body: "This is a test post",
        userId: 1
      };
    } else {
      responseBody = { message: "Resource not found" };
      status = 404;
    }
  } else {
    responseBody = { message: "Mock response" };
  }

  const endTime = Date.now();

  return {
    status,
    time: endTime - startTime,
    headers: {
      'content-type': 'application/json',
      'x-powered-by': 'FMUS-POST Mock',
      'cache-control': 'no-cache'
    },
    json: () => responseBody
  };
}

// Komentar: Implementasi fungsi HTTP GET
export function get(url: string, options?: RequestOptions): Promise<Response> {
  console.log(`Mock GET request to ${url}`);
  return Promise.resolve(mockResponse(url, 'get'));
}

// Komentar: Implementasi fungsi HTTP POST
export function post(url: string, options?: RequestOptions): Promise<Response> {
  console.log(`Mock POST request to ${url}`);
  console.log('Request body:', options?.body);
  return Promise.resolve(mockResponse(url, 'post'));
}

// Komentar: Implementasi fungsi HTTP PUT
export function put(url: string, options?: RequestOptions): Promise<Response> {
  console.log(`Mock PUT request to ${url}`);
  console.log('Request body:', options?.body);
  return Promise.resolve(mockResponse(url, 'put'));
}

// Komentar: Implementasi fungsi HTTP DELETE
export function del(url: string, options?: RequestOptions): Promise<Response> {
  console.log(`Mock DELETE request to ${url}`);
  return Promise.resolve(mockResponse(url, 'delete'));
}

// Komentar: Implementasi fungsi client
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
  console.log('Creating mock client with options:', options);

  return {
    get,
    post,
    put,
    del
  };
}
