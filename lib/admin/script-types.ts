/**
 * Video Script Generator Types
 * Single Responsibility: Type definitions for script generation
 */

export type VideoType =
  | "tutorial"
  | "explainer"
  | "promo"
  | "story"
  | "review"
  | "comparison"
  | "listicle"
  | "vlog";

export type ScriptTone =
  | "professional"
  | "casual"
  | "humorous"
  | "dramatic"
  | "educational"
  | "inspirational"
  | "conversational";

export type VideoDuration = "30s" | "60s" | "2min" | "5min" | "10min";

export type TargetAudience =
  | "general"
  | "technical"
  | "kids"
  | "business"
  | "creative"
  | "beginners"
  | "experts";

export type ScriptStructure =
  | "hook-problem-solution"
  | "story-arc"
  | "list-format"
  | "qa"
  | "before-after"
  | "step-by-step";

export type ScriptLanguage = "english" | "spanish";

export interface ScriptSettings {
  videoType: VideoType;
  tone: ScriptTone;
  duration: VideoDuration;
  audience: TargetAudience;
  structure: ScriptStructure;
  language: ScriptLanguage;
  includeCta: boolean;
  includeBrollSuggestions: boolean;
  includeTimestamps: boolean;
}

export interface ScriptInput {
  topic: string;
  keyPoints: string[];
  brandName?: string;
  brandContext?: string;
  keywords?: string[];
  additionalContext?: string;
  topicsToAvoid?: string;
  sourceUrls?: string[];
  extractedContent?: string;
}

export interface ScriptSection {
  timestamp?: string;
  sectionTitle: string;
  narration: string;
  visualNotes?: string;
}

export interface VideoScript {
  title: string;
  hook: string;
  sections: ScriptSection[];
  cta?: string;
  estimatedDuration: string;
  bRollSuggestions?: string[];
}

export interface GenerateScriptRequest {
  input: ScriptInput;
  settings: ScriptSettings;
}

export interface GenerateScriptResponse {
  script: VideoScript;
  provider: string;
  model: string;
}

export const DEFAULT_SCRIPT_SETTINGS: ScriptSettings = {
  videoType: "explainer",
  tone: "professional",
  duration: "2min",
  audience: "general",
  structure: "hook-problem-solution",
  language: "english",
  includeCta: true,
  includeBrollSuggestions: true,
  includeTimestamps: true,
};

export const LANGUAGE_OPTIONS: { value: ScriptLanguage; label: string }[] = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
];

export const VIDEO_TYPE_OPTIONS: { value: VideoType; label: string; description: string }[] = [
  { value: "tutorial", label: "Tutorial", description: "Step-by-step instructional content" },
  { value: "explainer", label: "Explainer", description: "Explain a concept or idea" },
  { value: "promo", label: "Promotional", description: "Promote a product or service" },
  { value: "story", label: "Story", description: "Narrative-driven content" },
  { value: "review", label: "Review", description: "Product or service review" },
  { value: "comparison", label: "Comparison", description: "Compare multiple options" },
  { value: "listicle", label: "Listicle", description: "List-based content (Top 5, etc.)" },
  { value: "vlog", label: "Vlog", description: "Personal video blog style" },
];

export const TONE_OPTIONS: { value: ScriptTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "humorous", label: "Humorous" },
  { value: "dramatic", label: "Dramatic" },
  { value: "educational", label: "Educational" },
  { value: "inspirational", label: "Inspirational" },
  { value: "conversational", label: "Conversational" },
];

export const DURATION_OPTIONS: { value: VideoDuration; label: string; seconds: number }[] = [
  { value: "30s", label: "30 seconds", seconds: 30 },
  { value: "60s", label: "1 minute", seconds: 60 },
  { value: "2min", label: "2 minutes", seconds: 120 },
  { value: "5min", label: "5 minutes", seconds: 300 },
  { value: "10min", label: "10 minutes", seconds: 600 },
];

export const AUDIENCE_OPTIONS: { value: TargetAudience; label: string }[] = [
  { value: "general", label: "General Audience" },
  { value: "technical", label: "Technical/Developers" },
  { value: "kids", label: "Kids & Family" },
  { value: "business", label: "Business/Corporate" },
  { value: "creative", label: "Creatives/Artists" },
  { value: "beginners", label: "Beginners" },
  { value: "experts", label: "Experts/Advanced" },
];

export const STRUCTURE_OPTIONS: { value: ScriptStructure; label: string; description: string }[] = [
  { value: "hook-problem-solution", label: "Hook → Problem → Solution", description: "Classic marketing structure" },
  { value: "story-arc", label: "Story Arc", description: "Beginning, middle, end narrative" },
  { value: "list-format", label: "List Format", description: "Numbered points or tips" },
  { value: "qa", label: "Q&A", description: "Question and answer format" },
  { value: "before-after", label: "Before & After", description: "Transformation showcase" },
  { value: "step-by-step", label: "Step by Step", description: "Sequential instructions" },
];

export type BRollType = "video" | "image" | "animation" | "text_overlay";

export interface BRollSegment {
  segmentText: string;
  visualDescription: string;
  visualType: BRollType;
  matchType: "global_asset" | "generative";
  assetId?: string;
  assetName?: string;
}

export type VideoVisualPlan = BRollSegment[];

