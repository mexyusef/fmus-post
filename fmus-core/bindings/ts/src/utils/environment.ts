/**
 * Environment implementation for FMUS-POST
 */
import { EnvironmentOptions } from '../types';

/**
 * Environment class for managing environment variables
 */
export class Environment {
  private name: string;
  private variables: Record<string, any>;

  /**
   * Create a new environment
   */
  constructor(options: EnvironmentOptions) {
    this.name = options.name;
    this.variables = { ...options.variables };
  }

  /**
   * Get the name of the environment
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get all variables
   */
  getVariables(): Record<string, any> {
    return { ...this.variables };
  }

  /**
   * Get a specific variable
   */
  get(key: string): any {
    return this.variables[key];
  }

  /**
   * Set a variable
   */
  set(key: string, value: any): this {
    this.variables[key] = value;
    return this;
  }

  /**
   * Set multiple variables
   */
  setMany(variables: Record<string, any>): this {
    this.variables = { ...this.variables, ...variables };
    return this;
  }

  /**
   * Remove a variable
   */
  remove(key: string): boolean {
    if (!(key in this.variables)) {
      return false;
    }

    delete this.variables[key];
    return true;
  }

  /**
   * Clear all variables
   */
  clear(): this {
    this.variables = {};
    return this;
  }

  /**
   * Convert environment to plain object
   */
  toObject(): Record<string, any> {
    return { ...this.variables };
  }

  /**
   * Export environment to JSON
   */
  toJSON(): string {
    return JSON.stringify({
      name: this.name,
      variables: this.variables
    });
  }

  /**
   * Import environment from JSON
   */
  static fromJSON(json: string): Environment {
    try {
      const data = JSON.parse(json);
      return new Environment(data);
    } catch (error) {
      throw new Error(`Failed to parse environment JSON: ${error}`);
    }
  }
}
