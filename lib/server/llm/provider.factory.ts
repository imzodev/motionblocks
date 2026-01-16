/**
 * LLM Provider Factory
 * Open/Closed Principle: Easy to add new providers without modifying existing code
 */

import type { ILLMProvider } from "./provider.interface";
import type { LLMConfig } from "./types";
import { getLLMConfig } from "./types";
import { OpenAIProvider } from "./providers/openai.provider";
import { GeminiProvider } from "./providers/gemini.provider";

export function createLLMProvider(config?: LLMConfig): ILLMProvider {
  const cfg = config || getLLMConfig();

  if (!cfg.apiKey) {
    throw new Error("LLM_API_KEY environment variable is not set");
  }

  switch (cfg.provider) {
    case "gemini":
      return new GeminiProvider(cfg);

    case "openai":
    case "deepseek":
    case "zai":
      return new OpenAIProvider(cfg);

    default:
      throw new Error(`Unknown LLM provider: ${cfg.provider}`);
  }
}

export { getLLMConfig } from "./types";
