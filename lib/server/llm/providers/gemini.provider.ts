/**
 * Gemini Provider
 * Uses Google's @google/genai SDK
 * Single Responsibility: Gemini API communication
 */

import type { ILLMProvider } from "../provider.interface";
import type { GenerateOptions, LLMResponse, LLMConfig } from "../types";

export class GeminiProvider implements ILLMProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || "gemini-2.5-flash";
  }

  getName(): string {
    return "gemini";
  }

  getModel(): string {
    return this.model;
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<LLMResponse> {
    const { GoogleGenAI } = await import("@google/genai");

    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    const contents = options?.systemPrompt
      ? `${options.systemPrompt}\n\n${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: this.model,
      contents,
      config: {
        temperature: options?.temperature ?? 0.7,
        ...(options?.maxTokens && { maxOutputTokens: options.maxTokens }),
      },
    });

    return {
      text: response.text || "",
      usage: response.usageMetadata
        ? {
            promptTokens: response.usageMetadata.promptTokenCount || 0,
            completionTokens: response.usageMetadata.candidatesTokenCount || 0,
            totalTokens: response.usageMetadata.totalTokenCount || 0,
          }
        : undefined,
    };
  }

  async *generateStream(
    prompt: string,
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    const { GoogleGenAI } = await import("@google/genai");

    const ai = new GoogleGenAI({ apiKey: this.apiKey });

    const contents = options?.systemPrompt
      ? `${options.systemPrompt}\n\n${prompt}`
      : prompt;

    const response = await ai.models.generateContentStream({
      model: this.model,
      contents,
      config: {
        temperature: options?.temperature ?? 0.7,
        ...(options?.maxTokens && { maxOutputTokens: options.maxTokens }),
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }
}
