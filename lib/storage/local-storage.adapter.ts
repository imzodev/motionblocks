import { IStorage } from "./storage.interface";

/**
 * LocalStorage Adapter (Concrete Implementation)
 * 
 * This class implements the IStorage interface using browser's localStorage.
 * Following SOLID principles:
 * - Single Responsibility: Only handles localStorage operations
 * - Open/Closed: Open for extension (can add caching), closed for modification
 * - Liskov Substitution: Properly implements IStorage contract
 */
export class LocalStorageAdapter<T> implements IStorage<T> {
  private readonly prefix: string;

  constructor(prefix: string = "motionblocks") {
    this.prefix = prefix;
  }

  /**
   * Get full key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get an item by key
   */
  async get(key: string): Promise<T | null> {
    try {
      const fullKey = this.getKey(key);
      const item = localStorage.getItem(fullKey);
      
      if (item === null) {
        return null;
      }

      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error getting item "${key}" from localStorage:`, error);
      return null;
    }
  }

  /**
   * Set an item with key and value
   */
  async set(key: string, value: T): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      const serialized = JSON.stringify(value);
      localStorage.setItem(fullKey, serialized);
    } catch (error) {
      console.error(`Error setting item "${key}" in localStorage:`, error);
      throw error;
    }
  }

  /**
   * Delete an item by key
   */
  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      localStorage.removeItem(fullKey);
    } catch (error) {
      console.error(`Error deleting item "${key}" from localStorage:`, error);
      throw error;
    }
  }

  /**
   * Check if a key exists
   */
  async has(key: string): Promise<boolean> {
    try {
      const fullKey = this.getKey(key);
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      console.error(`Error checking if key "${key}" exists in localStorage:`, error);
      return false;
    }
  }

  /**
   * Get all keys with the prefix
   */
  async keys(): Promise<string[]> {
    try {
      const prefixLength = this.prefix.length + 1; // +1 for the colon
      const allKeys = Object.keys(localStorage);
      
      return allKeys
        .filter(key => key.startsWith(`${this.prefix}:`))
        .map(key => key.substring(prefixLength));
    } catch (error) {
      console.error("Error getting keys from localStorage:", error);
      return [];
    }
  }

  /**
   * Clear all items with the prefix
   */
  async clear(): Promise<void> {
    try {
      const prefix = `${this.prefix}:`;
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      throw error;
    }
  }
}
