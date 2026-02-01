/**
 * OpenAI-Compatible Provider
 * Supports: OpenAI, DeepSeek, z.ai (any OpenAI-compatible API)
 * Single Responsibility: OpenAI API communication
 */

import type { ILLMProvider } from "../provider.interface";
import type { GenerateOptions, LLMResponse, LLMConfig } from "../types";

export class OpenAIProvider implements ILLMProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly providerName: string;

  constructor(config: LLMConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.providerName = config.provider;

    switch (config.provider) {
      case "deepseek":
        this.baseUrl = config.baseUrl || "https://api.deepseek.com/v1";
        break;
      case "zai":
        this.baseUrl = config.baseUrl || "https://api.zai.com/v1";
        break;
      default:
        this.baseUrl = config.baseUrl || "https://api.openai.com/v1";
    }
  }

  getName(): string {
    return this.providerName;
  }

  getModel(): string {
    return this.model;
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<LLMResponse> {
    const messages = [];

    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
        ...(options?.maxTokens && (
          this.model.startsWith("o1-") || this.model.startsWith("gpt-5-")
            ? { max_completion_tokens: options.maxTokens }
            : { max_tokens: options.maxTokens }
        )),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    const content = data.choices[0]?.message?.content;
    if (!content) {
      console.error("OpenAI Provider - No content received. Full response:", JSON.stringify(data, null, 2));
    }

    return {
      text: content || "",
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
    };
  }

  async *generateStream(
    prompt: string,
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    const messages = [];

    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
        ...(options?.maxTokens && (
          this.model.startsWith("o1-") || this.model.startsWith("gpt-5-")
            ? { max_completion_tokens: options.maxTokens }
            : { max_tokens: options.maxTokens }
        )),
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            yield content;
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
}
