import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";

export const FadeInTemplate: AnimationTemplate = {
  id: "fade-in",
  name: "Fade In",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    duration: z.number().default(30),
  }),
  render: ({ assets }: RenderProps) => assets.asset,
};

export const SlideTemplate: AnimationTemplate = {
  id: "slide-in",
  name: "Slide In",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    direction: z.enum(["left", "right", "top", "bottom"]).default("left"),
    duration: z.number().default(30),
  }),
  render: ({ assets }: RenderProps) => assets.asset,
};

/**
 * ScalePopTemplate: Elastic scale-up.
 */
export const ScalePopTemplate: AnimationTemplate = {
  id: "scale-pop",
  name: "Scale Pop",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    duration: z.number().default(30),
  }),
  render: ({ assets }: RenderProps) => assets.asset,
};

/**
 * MaskRevealTemplate: Linear wipe or mask.
 */
export const MaskRevealTemplate: AnimationTemplate = {
  id: "mask-reveal",
  name: "Mask Reveal",
  slots: [
    { id: "asset", name: "Main Asset", type: "file", required: true }
  ],
  propsSchema: z.object({
    direction: z.enum(["horizontal", "vertical"]).default("horizontal"),
    duration: z.number().default(30),
  }),
  render: ({ assets }: RenderProps) => assets.asset,
};
