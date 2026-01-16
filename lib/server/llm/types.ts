/**
 * LLM Types and Interfaces
 * Single Responsibility: Type definitions for LLM integration
 */

export type LLMProviderType = "openai" | "gemini" | "deepseek" | "zai";

export interface LLMConfig {
  provider: LLMProviderType;
  apiKey: string;
  baseUrl?: string;
  model: string;
}

export interface GenerateOptions {
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export function getLLMConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER || "openai") as LLMProviderType;
  const apiKey = process.env.LLM_API_KEY || "";
  const baseUrl = process.env.LLM_BASE_URL;
  const model = process.env.LLM_MODEL || getDefaultModel(provider);

  return { provider, apiKey, baseUrl, model };
}

function getDefaultModel(provider: LLMProviderType): string {
  switch (provider) {
    case "openai":
      return "gpt-4o";
    case "gemini":
      return "gemini-2.5-flash";
    case "deepseek":
      return "deepseek-chat";
    case "zai":
      return "zai-1";
    default:
      return "gpt-4o";
  }
}
