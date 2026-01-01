/**
 * Storage Interface (Abstraction)
 * 
 * This interface defines the contract for storage operations following SOLID principles:
 * - Interface Segregation: Small, focused interface
 * - Dependency Inversion: High-level modules depend on this abstraction
 */
export interface IStorage<T> {
  /**
   * Get an item by key
   */
  get(key: string): Promise<T | null>;
  
  /**
   * Set an item with key and value
   */
  set(key: string, value: T): Promise<void>;
  
  /**
   * Delete an item by key
   */
  delete(key: string): Promise<void>;
  
  /**
   * Check if a key exists
   */
  has(key: string): Promise<boolean>;
  
  /**
   * Get all keys
   */
  keys(): Promise<string[]>;
  
  /**
   * Clear all items
   */
  clear(): Promise<void>;
}
