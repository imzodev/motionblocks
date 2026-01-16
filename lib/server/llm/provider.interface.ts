/**
 * LLM Provider Interface
 * Dependency Inversion: Abstract interface for all LLM providers
 */

import type { GenerateOptions, LLMResponse } from "./types";

export interface ILLMProvider {
  /**
   * Generate text from a prompt
   */
  generateText(prompt: string, options?: GenerateOptions): Promise<LLMResponse>;

  /**
   * Generate text with streaming response
   */
  generateStream(
    prompt: string,
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown>;

  /**
   * Get the provider name
   */
  getName(): string;

  /**
   * Get the current model
   */
  getModel(): string;
}
