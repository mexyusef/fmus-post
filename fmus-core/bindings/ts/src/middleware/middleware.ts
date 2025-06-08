/**
 * Middleware implementation for FMUS-POST
 */
import { Middleware } from '../types';

/**
 * Create a middleware function for request/response processing
 */
export const createMiddleware = (options: {
  name: string;
  request?: (req: any) => any;
  response?: (res: any) => any;
}): Middleware => {
  return {
    name: options.name,
    request: options.request,
    response: options.response
  };
};

/**
 * Common middleware creators for convenience
 */

/**
 * Logger middleware to log request and response details
 */
export const loggerMiddleware = createMiddleware({
  name: 'logger',
  request: (req) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    return req;
  },
  response: (res) => {
    console.log(`[${new Date().toISOString()}] Response: ${res.status} (${res.time}ms)`);
    return res;
  }
});

/**
 * Timeout middleware to abort requests that take too long
 */
export const timeoutMiddleware = (ms: number) => createMiddleware({
  name: 'timeout',
  request: async (req) => {
    // Add timeout to request context
    return {
      ...req,
      timeout: ms
    };
  }
});

/**
 * Retry middleware to retry failed requests
 */
export const retryMiddleware = (times: number, conditions?: (error: any, attempt: number) => boolean) => createMiddleware({
  name: 'retry',
  request: (req) => {
    // Add retry config to request context
    return {
      ...req,
      retry: {
        times,
        conditions
      }
    };
  }
});

/**
 * Cache middleware to cache responses
 */
export const cacheMiddleware = (options: {
  maxAge?: number;
  maxSize?: number;
  keyGenerator?: (req: any) => string;
}) => {
  // Simple in-memory cache
  const cache = new Map();

  return createMiddleware({
    name: 'cache',
    request: async (req) => {
      const key = options.keyGenerator
        ? options.keyGenerator(req)
        : `${req.method}:${req.url}`;

      // Skip cache for non-GET methods
      if (req.method !== 'GET') {
        return req;
      }

      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < (options.maxAge || 60000)) {
        // Return a special flag to short-circuit the request pipeline
        return {
          ...req,
          _cachedResponse: cached.response
        };
      }

      // Add cache key to context
      return {
        ...req,
        _cacheKey: key
      };
    },
    response: (res) => {
      // Store response in cache if we have a cache key
      if (res.request._cacheKey && res.status >= 200 && res.status < 300) {
        cache.set(res.request._cacheKey, {
          timestamp: Date.now(),
          response: res
        });

        // If cache is too large, remove oldest entries
        if (options.maxSize && cache.size > options.maxSize) {
          const keys = Array.from(cache.keys());
          const oldest = keys.sort((a, b) =>
            (cache.get(a).timestamp - cache.get(b).timestamp)
          ).slice(0, keys.length - options.maxSize);

          oldest.forEach(key => cache.delete(key));
        }
      }

      return res;
    }
  });
};
