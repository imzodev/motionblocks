import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { MindMap3D } from "../../components/animations/MindMap3D";

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
  render: ({ assets, frame }: RenderProps) => {
    const rootTopic = typeof assets.rootText === "string" ? assets.rootText : "";
    const nodesData = typeof assets.nodes === "string" ? assets.nodes : undefined;
    return <MindMap3D rootTopic={rootTopic} nodesData={nodesData} frame={frame} />;
  },
};
