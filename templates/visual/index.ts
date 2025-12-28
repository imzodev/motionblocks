import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";

/**
 * MindMapTemplate: 3D Node-link diagram.
 */
export const MindMapTemplate: AnimationTemplate = {
  id: "mind-map",
  name: "3D Mind Map",
  slots: [
    { id: "rootImage", name: "Central Image", type: "file" },
    { id: "rootText", name: "Central Topic", type: "text", required: true },
    { id: "nodes", name: "Nodes Data", type: "data-table" },
  ],
  propsSchema: z.object({
    depth: z.number().default(200),
    spread: z.number().default(1.5),
  }),
  render: ({ assets }: RenderProps) => assets.rootText,
};

/**
 * GraphTemplate: 3D Bar/Line graph.
 */
export const GraphTemplate: AnimationTemplate = {
  id: "graph",
  name: "3D Graph",
  slots: [
    { id: "title", name: "Graph Title", type: "text" },
    { id: "data", name: "Labels & Values", type: "data-table", required: true },
  ],
  propsSchema: z.object({
    type: z.enum(["bar", "line"]).default("bar"),
    color: z.string().default("#3b82f6"),
  }),
  render: ({ assets }: RenderProps) => assets.title,
};
