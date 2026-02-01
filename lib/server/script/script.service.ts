/**
 * Script Generation Service
 * Single Responsibility: Orchestrates script generation using LLM providers
 */

import { createLLMProvider } from "../llm";
import type {
  ScriptInput,
  ScriptSettings,
  VideoScript,
  GenerateScriptResponse,
} from "@/lib/admin/script-types";
import {
  VIDEO_TYPE_OPTIONS,
  TONE_OPTIONS,
  DURATION_OPTIONS,
  AUDIENCE_OPTIONS,
  STRUCTURE_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/lib/admin/script-types";

function buildSystemPrompt(settings: ScriptSettings): string {
  const videoType = VIDEO_TYPE_OPTIONS.find((v) => v.value === settings.videoType);
  const tone = TONE_OPTIONS.find((t) => t.value === settings.tone);
  const duration = DURATION_OPTIONS.find((d) => d.value === settings.duration);
  const audience = AUDIENCE_OPTIONS.find((a) => a.value === settings.audience);
  const structure = STRUCTURE_OPTIONS.find((s) => s.value === settings.structure);
  const language = LANGUAGE_OPTIONS.find((l) => l.value === settings.language);

  return `You are an expert video scriptwriter. Your task is to create engaging, well-structured video scripts.

SCRIPT REQUIREMENTS:
- Video Type: ${videoType?.label} (${videoType?.description})
- Tone: ${tone?.label}
- Target Duration: ${duration?.label} (approximately ${duration?.seconds} seconds)
- Target Audience: ${audience?.label}
- Structure: ${structure?.label} (${structure?.description})
- Language: ${language?.label} (Write the ENTIRE script in ${language?.label})

OUTPUT FORMAT:
You MUST respond with a valid JSON object in this exact format:
{
  "title": "Video title",
  "hook": "Opening hook (first 3-5 seconds to grab attention)",
  "sections": [
    {
      ${settings.includeTimestamps ? '"timestamp": "0:00-0:15",' : ""}
      "sectionTitle": "Section name",
      "narration": "The actual script text to be spoken",
      "visualNotes": "Brief notes on what visuals to show"
    }
  ],
  ${settings.includeCta ? '"cta": "Call to action text",' : ""}
  "estimatedDuration": "${duration?.label}"${settings.includeBrollSuggestions ? ',\n  "bRollSuggestions": ["suggestion 1", "suggestion 2"]' : ""}
}

GUIDELINES:
- Write natural, conversational narration that sounds good when spoken aloud
- Keep sentences short and punchy for video format
- Include pauses and emphasis where appropriate
- Match the tone consistently throughout
- Ensure the script fits within the target duration (assume ~150 words per minute)
- Make the hook compelling and attention-grabbing
${settings.includeBrollSuggestions ? "- Suggest 3-5 B-roll ideas that would enhance the video" : ""}
${settings.includeCta ? "- End with a clear, compelling call to action" : ""}

IMPORTANT: Respond ONLY with the JSON object, no additional text or markdown.`;
}

function buildUserPrompt(input: ScriptInput): string {
  let prompt = `Create a video script about: ${input.topic}\n\n`;

  if (input.keyPoints.length > 0) {
    prompt += `KEY POINTS TO COVER:\n${input.keyPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\n`;
  }

  if (input.brandName) {
    prompt += `BRAND: ${input.brandName}\n`;
    if (input.brandContext) {
      prompt += `BRAND CONTEXT: ${input.brandContext}\n`;
    }
    prompt += "\n";
  }

  if (input.keywords && input.keywords.length > 0) {
    prompt += `KEYWORDS TO INCLUDE: ${input.keywords.join(", ")}\n\n`;
  }

  if (input.extractedContent) {
    prompt += `SOURCE CONTENT (use this as reference material for the script):\n${input.extractedContent}\n\n`;
  }

  if (input.additionalContext) {
    prompt += `ADDITIONAL CONTEXT:\n${input.additionalContext}\n\n`;
  }

  if (input.topicsToAvoid) {
    prompt += `TOPICS/CONCEPTS TO AVOID (do NOT mention or include these in the script):\n${input.topicsToAvoid}\n`;
  }

  return prompt;
}

export async function generateScript(
  input: ScriptInput,
  settings: ScriptSettings
): Promise<GenerateScriptResponse> {
  const provider = createLLMProvider();

  const systemPrompt = buildSystemPrompt(settings);
  const userPrompt = buildUserPrompt(input);

  const response = await provider.generateText(userPrompt, {
    systemPrompt,

  });

  let script: VideoScript;
  try {
    const text = response.text.trim();
    const startIndex = text.indexOf("{");
    const endIndex = text.lastIndexOf("}");

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No JSON object found in response");
    }

    const cleanedText = text.slice(startIndex, endIndex + 1);
    script = JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse script response. Raw text:", response.text);
    throw new Error(`Failed to parse script response: ${error}`);
  }

  return {
    script,
    provider: provider.getName(),
    model: provider.getModel(),
  };
}
