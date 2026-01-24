/**
 * B-Roll Generation Service
 * Orchestrates the generation of visual plans for video scripts
 */

import { createLLMProvider } from "../llm";
import type { VideoScript, VideoVisualPlan, BRollSegment } from "@/lib/admin/script-types";
import { assetService } from "@/lib/server/assets";
import type { AssetPublic } from "@/lib/server/assets/asset-types";

function buildBRollSystemPrompt(globalAssets: AssetPublic[]): string {
  const assetsContext = globalAssets.length > 0 
    ? `AVAILABLE GLOBAL ASSETS (Prioritize using these if relevant):
${globalAssets.map(a => `- ID: "${a.id}", Name: "${a.name || a.originalName}", Desc: "${a.description || 'No description'}", Use Case: "${a.whenToUse || 'General'}"`).join('\n')}
`
    : "";

  return `You are an expert video editor and creative director. Your task is to take a video script and create a detailed visual plan (B-roll plan).

TASK:
1.  Read the provided video script carefully.
2.  Break down the narration (from Hook, Sections, and CTA) into small, logical segments (e.g., sentences or phrases) that represent distinct visual beats.
3.  For EACH segment, determine the best visual:
    *   **Priority 1: Global Asset Match**: Check the "AVAILABLE GLOBAL ASSETS" list. If an asset is a strong match for the segment, select it.
    *   **Priority 2: Generative Description**: If no global asset fits, describe a specific, engaging visual to be generated or sourced from stock.

OUTPUT FORMAT:
You MUST respond with a valid JSON array of objects, where each object has this structure:
[
  {
    "segmentText": "The exact text from the script corresponding to this segment",
    "visualType": "video" | "image" | "animation" | "text_overlay",
    "matchType": "global_asset" | "generative",
    "assetId": "The ID of the matched global asset (ONLY if matchType is 'global_asset')",
    "visualDescription": "Detailed description of the visual. If matched, describe why it fits. If generative, describe the scene to be created."
  },
  ...
]

${assetsContext}

GUIDELINES:
- **Granularity**: aim for one visual change every 3-8 seconds.
- **Relevance**: The visual MUST directly relate to the text.
- **Variety**: Mix different types of visuals.
- **Conciseness**: Keep descriptions brief (max 15 words) to ensure the full plan fits.
- **Completeness**: Ensure EVERY part of the script text is covered. Do not skip any text.
- **JSON Safety**: Do NOT use unescaped newlines or invalid control characters in strings.

IMPORTANT: Respond ONLY with the JSON array. No markdown formatting or extra text.`;
}

function buildBRollUserPrompt(script: VideoScript): string {
  let prompt = `SCRIPT TITLE: ${script.title}\n\n`;

  prompt += `HOOK:\n${script.hook}\n\n`;

  script.sections.forEach((section) => {
    prompt += `SECTION: ${section.sectionTitle}\n${section.narration}\n\n`;
  });

  if (script.cta) {
    prompt += `CTA:\n${script.cta}\n`;
  }

  return prompt;
}

export async function generateBRollPlan(script: VideoScript): Promise<VideoVisualPlan> {
  const provider = createLLMProvider();
  
  // 1. Fetch Global Assets
  let globalAssets: AssetPublic[] = [];
  try {
    globalAssets = await assetService.listGlobalAssets();
  } catch (error) {
    console.warn("Failed to fetch global assets for B-roll generation:", error);
  }

  // 2. Build Prompts
  const systemPrompt = buildBRollSystemPrompt(globalAssets);
  const userPrompt = buildBRollUserPrompt(script);

  const response = await provider.generateText(userPrompt, {
    systemPrompt,
    maxTokens: 4096,
  });



  try {
    // Improved Extraction & Sanitization
    const rawText = response.text;
    const startIndex = rawText.indexOf('[');
    const endIndex = rawText.lastIndexOf(']');
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No JSON array found in response");
    }

    const jsonStr = rawText.substring(startIndex, endIndex + 1);
    
    // Attempt parse with fallback
    let rawPlan: BRollSegment[];
    try {
        rawPlan = JSON.parse(jsonStr);
    } catch {
        // Fallback: Aggressive newline removal (convert to single line)
        // This handles "Bad control character" (unescaped newline inside string)
        // while preserving structure (since spaces are valid separators)
        const sanitized = jsonStr.replace(/[\n\r\t]/g, " ");
        rawPlan = JSON.parse(sanitized);
    }

    // 3. Hydrate and Validate Assets
    const hydratedPlan: VideoVisualPlan = rawPlan.map(segment => {
      if (segment.matchType === "global_asset" && segment.assetId) {
        const asset = globalAssets.find(a => a.id === segment.assetId);
        if (asset) {
          // Map AssetType to BRollType
          let visualType: "video" | "image" | "text_overlay" | "animation" = segment.visualType;
          
          if (asset.type === "video") visualType = "video";
          else if (asset.type === "image" || asset.type === "svg") visualType = "image";
          else if (asset.type === "text") visualType = "text_overlay";

          return {
            ...segment,
            assetName: asset.name || asset.originalName || "Unknown Asset",
            visualType
          };
        } else {
          // Fallback if LLM made up an ID
          return {
            ...segment,
            matchType: "generative",
            assetId: undefined,
            visualDescription: `(Fallback from missing asset ${segment.assetId}) ${segment.visualDescription}`
          };
        }
      }
      return segment;
    });

    return hydratedPlan;
  } catch (error) {
    console.error("Failed to parse B-roll plan response. Raw text length:", response.text.length);
    console.error("First 100 chars:", response.text.substring(0, 100));
    console.error("Last 100 chars:", response.text.substring(response.text.length - 100));
    throw new Error(`Failed to parse B-roll plan: ${error}`);
  }
}
