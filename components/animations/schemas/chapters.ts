import { z } from "zod";
import { AssetSchema } from "@/types/timeline";

export const ChaptersSchema = z.object({
  // Content
  data: z.string().describe("Chapter content: 'Title, Subtitle' per line"),
  
  // Configuration
  startNumber: z.number().default(1),
  showNumber: z.boolean().default(true),
  accentColor: z.string().default("#00d09c"),
  textColor: z.string().default("#1a1a1a"),
  introFrames: z.number().min(10).max(120).default(30),
  framesPerChapter: z.number().min(30).max(600).default(60),
  
  // Background Settings
  backgroundEnabled: z.boolean().default(false),
  backgroundColor: z.string().default("#ffffff"),
  backgroundOpacity: z.number().min(0).max(1).default(1),
  backgroundScale: z.number().min(1000).max(12000).default(6000),
  backgroundVideoAspect: z.number().min(0.2).max(5).default(16 / 9),
  background: AssetSchema.optional().describe("Background asset reference or object"),
});

export type ChaptersConfig = z.infer<typeof ChaptersSchema>;

export interface ChapterItem {
  title: string;
  subtitle?: string;
}

export interface ChaptersProps extends ChaptersConfig {
  frame: number;
  fontUrl?: string;
}
