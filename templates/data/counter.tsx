import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text } from "@react-three/drei";
import React from "react";

export const CounterTemplate: AnimationTemplate = {
  id: "counter",
  name: "Counter",
  slots: [{ id: "label", name: "Label Text", type: "text" }],
  propsSchema: z.object({
    startValue: z.number().default(0),
    endValue: z.number().default(100),
    duration: z.number().default(60),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
  }),
  render: ({ assets, frame, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const startValue = typeof p.startValue === "number" ? p.startValue : 0;
    const endValue = typeof p.endValue === "number" ? p.endValue : 100;
    const duration = typeof p.duration === "number" ? p.duration : 60;
    const prefix = typeof p.prefix === "string" ? p.prefix : "";
    const suffix = typeof p.suffix === "string" ? p.suffix : "";

    const progress = Math.min(1, frame / Math.max(1, duration));
    const value = Math.floor(startValue + (endValue - startValue) * progress);
    const label = typeof assets.label === "string" ? assets.label : "";

    return (
      <group>
        <Text fontSize={80} color="#0f172a" position={[0, 0, 0]}>
          {`${prefix}${value}${suffix}`}
        </Text>
        {label ? (
          <Text fontSize={30} color="#60a5fa" position={[0, -80, 0]}>
            {label}
          </Text>
        ) : null}
      </group>
    );
  },
};
