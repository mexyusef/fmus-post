/**
 * Collection implementation for FMUS-POST
 */
import { CollectionOptions, CollectionItem, HttpMethod } from '../types';
import { client } from '../http/client';

// Define the type for collection run results
interface CollectionRunResult {
  name: string;
  response?: any;
  error?: string;
  success: boolean;
}

/**
 * Collection class for organizing and running API requests
 */
export class Collection {
  private name: string;
  private description?: string;
  private items: CollectionItem[];

  /**
   * Create a new collection
   */
  constructor(options: CollectionOptions) {
    this.name = options.name;
    this.description = options.description;
    this.items = options.items || [];
  }

  /**
   * Add a request to the collection
   */
  add(item: CollectionItem): this {
    this.items.push(item);
    return this;
  }

  /**
   * Get all items in the collection
   */
  getItems(): CollectionItem[] {
    return [...this.items];
  }

  /**
   * Find an item by name
   */
  findItem(name: string): CollectionItem | undefined {
    return this.items.find(item => item.name === name);
  }

  /**
   * Remove an item by name
   */
  removeItem(name: string): boolean {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.name !== name);
    return initialLength !== this.items.length;
  }

  /**
   * Export collection to JSON
   */
  toJSON(): string {
    return JSON.stringify({
      name: this.name,
      description: this.description,
      items: this.items
    });
  }

  /**
   * Import collection from JSON
   */
  static fromJSON(json: string): Collection {
    try {
      const data = JSON.parse(json);
      return new Collection(data);
    } catch (error) {
      throw new Error(`Failed to parse collection JSON: ${error}`);
    }
  }

  /**
   * Run all requests in the collection
   */
  async run(options: { environment?: Record<string, any> } = {}): Promise<CollectionRunResult[]> {
    const results: CollectionRunResult[] = [];
    const { environment = {} } = options;

    for (const item of this.items) {
      try {
        const request = this.processRequest(item.request, environment);
        const response = await this.executeRequest(request);

        // TODO: Run tests if defined

        results.push({
          name: item.name,
          response,
          success: true
        });
      } catch (error: any) {
        results.push({
          name: item.name,
          error: error.message,
          success: false
        });
      }
    }

    return results;
  }

  /**
   * Process request with environment variables
   */
  private processRequest(request: any, environment: Record<string, any>): any {
    // Deep clone the request
    const clonedRequest = JSON.parse(JSON.stringify(request));

    // Process URL
    if (typeof clonedRequest.url === 'string') {
      clonedRequest.url = this.replaceVariables(clonedRequest.url, environment);
    }

    // Process headers
    if (clonedRequest.headers) {
      Object.keys(clonedRequest.headers).forEach(key => {
        clonedRequest.headers[key] = this.replaceVariables(clonedRequest.headers[key], environment);
      });
    }

    // Process body
    if (clonedRequest.body && typeof clonedRequest.body === 'object') {
      this.processBodyVariables(clonedRequest.body, environment);
    } else if (typeof clonedRequest.body === 'string') {
      clonedRequest.body = this.replaceVariables(clonedRequest.body, environment);
    }

    return clonedRequest;
  }

  /**
   * Replace environment variables in string
   */
  private replaceVariables(str: string, environment: Record<string, any>): string {
    if (typeof str !== 'string') return str;

    return str.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return environment[trimmedKey] !== undefined
        ? String(environment[trimmedKey])
        : match;
    });
  }

  /**
   * Process body object variables recursively
   */
  private processBodyVariables(obj: any, environment: Record<string, any>): void {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = this.replaceVariables(obj[key], environment);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.processBodyVariables(obj[key], environment);
      }
    }
  }

  /**
   * Execute a request
   */
  private async executeRequest(request: any): Promise<any> {
    const { method, url, ...options } = request;

    return client.request({
      method: method as HttpMethod,
      url,
      ...options
    });
  }
}
