import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";

/**
 * FadeInTemplate: Simple opacity transition.
 */
export const FadeInTemplate: AnimationTemplate = {
  id: "fade-in",
  name: "Fade In",
  propsSchema: z.object({
    duration: z.number().default(30),
  }),
  render: ({ asset, frame, duration, props }: RenderProps<{ duration: number }>) => {
    // In actual implementation, we'd use frame/duration to calculate opacity.
    return asset; 
  },
};

/**
 * SlideTemplate: Directional slide-in.
 */
export const SlideTemplate: AnimationTemplate = {
  id: "slide-in",
  name: "Slide In",
  propsSchema: z.object({
    direction: z.enum(["left", "right", "top", "bottom"]).default("left"),
    duration: z.number().default(30),
  }),
  render: ({ asset }: RenderProps) => asset,
};

/**
 * ScalePopTemplate: Elastic scale-up.
 */
export const ScalePopTemplate: AnimationTemplate = {
  id: "scale-pop",
  name: "Scale Pop",
  propsSchema: z.object({
    duration: z.number().default(30),
  }),
  render: ({ asset }: RenderProps) => asset,
};

/**
 * MaskRevealTemplate: Linear wipe or mask.
 */
export const MaskRevealTemplate: AnimationTemplate = {
  id: "mask-reveal",
  name: "Mask Reveal",
  propsSchema: z.object({
    direction: z.enum(["horizontal", "vertical"]).default("horizontal"),
    duration: z.number().default(30),
  }),
  render: ({ asset }: RenderProps) => asset,
};
