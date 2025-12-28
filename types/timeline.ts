import { z } from "zod";

export const AssetSchema = z.object({
  id: z.string(),
  type: z.enum(["image", "text", "svg"]),
  src: z.string().optional(),
  content: z.string().optional(),
});

export type Asset = z.infer<typeof AssetSchema>;

export const TrackSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  template: z.string(),
  startFrame: z.number(),
  duration: z.number(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  templateProps: z.record(z.string(), z.any()),
});

export type Track = z.infer<typeof TrackSchema>;

export const TimelineSchema = z.object({
  fps: z.number(),
  width: z.number(),
  height: z.number(),
  durationInFrames: z.number(),
  tracks: z.array(TrackSchema),
});

export type Timeline = z.infer<typeof TimelineSchema>;
