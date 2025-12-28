import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";

/**
 * PulseTemplate: Periodic scaling.
 */
export const PulseTemplate: AnimationTemplate = {
  id: "pulse",
  name: "Pulse",
  slots: [{ id: "asset", name: "Main Asset", type: "file", required: true }],
  propsSchema: z.object({
    intensity: z.number().default(1.1),
    duration: z.number().default(60),
  }),
  render: ({ assets }: RenderProps) => assets.asset,
};

/**
 * GlowTemplate: Pulsing outer shadow/glow.
 */
export const GlowTemplate: AnimationTemplate = {
  id: "glow",
  name: "Glow",
  slots: [{ id: "asset", name: "Main Asset", type: "file", required: true }],
  propsSchema: z.object({
    color: z.string().default("#ffffff"),
    radius: z.number().default(20),
  }),
  render: ({ assets }: RenderProps) => assets.asset,
};

/**
 * BounceTemplate: Vertical bouncing motion.
 */
export const BounceTemplate: AnimationTemplate = {
  id: "bounce",
  name: "Bounce",
  slots: [{ id: "asset", name: "Main Asset", type: "file", required: true }],
  propsSchema: z.object({
    height: z.number().default(50),
  }),
  render: ({ assets }: RenderProps) => assets.asset,
};

/**
 * ShakeTemplate: Rapid random or periodic oscillation.
 */
export const ShakeTemplate: AnimationTemplate = {
  id: "shake",
  name: "Shake",
  slots: [{ id: "asset", name: "Main Asset", type: "file", required: true }],
  propsSchema: z.object({
    intensity: z.number().default(5),
  }),
  render: ({ assets }: RenderProps) => assets.asset,
};
