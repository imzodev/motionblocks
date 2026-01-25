import { z } from "zod";
import { AssetSchema, type Asset } from "@/types/timeline";

export const SlideSchema = z.object({
  direction: z.enum(["left", "right", "top", "bottom"]).default("left"),
  duration: z.number().default(30),
  disableSlideAnimation: z.boolean().default(false),
  layout: z.enum(["row", "column"]).default("row"),
  gap: z.number().default(100),
  fontSize: z.number().default(60),
  textColor: z.string().default("#0f172a"),
  imageSize: z.number().default(400),
  assetScaleX: z.number().default(1),
  assetScaleY: z.number().default(1),
  asset2ScaleX: z.number().default(1),
  asset2ScaleY: z.number().default(1),
  asset3ScaleX: z.number().default(1),
  asset3ScaleY: z.number().default(1),
  staggerFrames: z.number().default(0),
  
  // Background
  backgroundEnabled: z.boolean().default(false),
  backgroundColor: z.string().default("#ffffff"),
  backgroundOpacity: z.number().min(0).max(1).default(1),
  backgroundScale: z.number().min(1000).max(12000).default(6000),
  backgroundVideoAspect: z.number().min(0.2).max(5).default(16 / 9),
  background: AssetSchema.optional().describe("Background asset reference or object"),
});

export type SlideConfig = z.infer<typeof SlideSchema>;

export interface SlideItem {
  slotId: "asset" | "asset2" | "asset3";
  asset: Asset;
}

export interface SlideSceneProps extends SlideConfig {
  items: SlideItem[];
  frame: number;
  globalFontUrl?: string;
  imageScaleXBySlot: Record<string, number>;
  imageScaleYBySlot: Record<string, number>;
  // We need to explicitly include backgroundAsset to match the previous component logic if it was separate from config
  // But in the previous code, it was passed as specific props.
  // We'll update the component to use the Config object mostly.
  // The previous props had `backgroundAsset` explicitly. 
  // In `SlideConfig`, we have `background` derived from AssetSchema.
}
