import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text, Box } from "@react-three/drei";
import React from "react";

/**
 * HighlightTemplate: Animated text highlighting.
 */
export const HighlightTemplate: AnimationTemplate = {
  id: "highlight",
  name: "Text Highlight",
  slots: [
    { id: "text", name: "Text to Highlight", type: "text", required: true }
  ],
  propsSchema: z.object({
    color: z.string().default("#fde047"),
    duration: z.number().default(30),
  }),
  render: ({ assets, frame, props }: RenderProps) => {
    const progress = Math.min(1, frame / 30);
    const width = progress * 600;
    
    return (
      <group>
        <Box args={[width, 80, 10]} position={[-(600 - width) / 2, 0, -5]}>
          <meshStandardMaterial color={props.color || "#fde047"} transparent opacity={0.8} />
        </Box>
        <Text fontSize={60} color="black" position={[0, 0, 0]}>
          {assets.text || "Highlight Me"}
        </Text>
      </group>
    );
  },
};
