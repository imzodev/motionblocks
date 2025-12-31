import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Text } from "@react-three/drei";

/**
 * GraphTemplate: 3D Bar graph.
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
  render: ({ assets, frame, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;

    const dataString = typeof assets.data === "string" ? assets.data : "";
    const lines = dataString.split("\n").filter((l: string) => l.trim().length > 0);
    const title = typeof assets.title === "string" ? assets.title : "";

    return (
      <group>
        {title ? (
          <Text font={globalFontUrl} position={[0, 400, 0]} fontSize={50} color="white" font-weight="bold">
            {title}
          </Text>
        ) : null}
        <group position={[-(lines.length * 120) / 2, 0, 0]}>
          {lines.map((line: string, i: number) => {
            const parts = line.split(",").map((s) => s.trim());
            const label = parts[0];
            const value = parseFloat(parts[1]) || 0;
            const progress = Math.min(1, frame / 45);
            const height = progress * value * 3;

            return (
              <group key={i} position={[i * 150, 0, 0]}>
                <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[80, height, 80]} />
                  <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.8} />
                </mesh>
                <Text font={globalFontUrl} position={[0, -40, 0]} fontSize={20} color="#94a3b8">
                  {label}
                </Text>
                <Text
                  font={globalFontUrl}
                  position={[0, height + 40, 0]}
                  fontSize={24}
                  color="white"
                  font-weight="black"
                >
                  {Math.floor(progress * value)}
                </Text>
              </group>
            );
          })}
        </group>
      </group>
    );
  },
};
