import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";

/**
 * CounterTemplate: Animated number interpolation.
 */
export const CounterTemplate: AnimationTemplate = {
  id: "counter",
  name: "Counter",
  slots: [
    { id: "label", name: "Label Text", type: "text" }
  ],
  propsSchema: z.object({
    startValue: z.number().default(0),
    endValue: z.number().default(100),
    duration: z.number().default(60),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
  }),
  render: ({ assets }: RenderProps) => assets.label,
};

/**
 * TimelineRevealTemplate: Progressive horizontal/vertical reveal.
 */
export const TimelineRevealTemplate: AnimationTemplate = {
  id: "timeline-reveal",
  name: "Timeline Reveal",
  slots: [
    { id: "asset", name: "Asset to Reveal", type: "file", required: true }
  ],
  propsSchema: z.object({
    direction: z.enum(["ltr", "rtl", "ttb", "btt"]).default("ltr"),
    duration: z.number().default(60),
  }),
  render: ({ assets }: RenderProps) => assets.asset,
};
