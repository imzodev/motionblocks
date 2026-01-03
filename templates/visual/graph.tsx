import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import {
  Graph3D,
  GraphDataPoint,
  GraphType,
  DEFAULT_GRAPH_INTRO_FRAMES,
  DEFAULT_GRAPH_PER_ITEM_FRAMES
} from "../../components/animations/Graph3D";

/**
 * GraphTemplate: 3D Graph visualization (Bar, Line, Pie).
 */
export const GraphTemplate: AnimationTemplate = {
  id: "graph",
  name: "3D Graph",
  slots: [
    { id: "title", name: "Graph Title", type: "text" },
    { id: "data", name: "Labels & Values", type: "data-table", required: true },
  ],
  propsSchema: z.object({
    type: z.enum(["bar", "line", "pie"]).default("bar"),
    barWidth: z.number().min(10).max(200).default(60),
    barGap: z.number().min(0).max(200).default(40),
    lineThickness: z.number().min(1).max(50).default(8),
    pieRadius: z.number().min(50).max(500).default(200),
    pieHeight: z.number().min(5).max(200).default(40),
    colors: z.string().default("#3b82f6,#60a5fa,#93c5fd,#2563eb,#1d4ed8"),
    textColor: z.string().default("#ffffff"),
    introFrames: z.number().min(0).max(120).default(DEFAULT_GRAPH_INTRO_FRAMES),
    perItemFrames: z.number().min(10).max(120).default(DEFAULT_GRAPH_PER_ITEM_FRAMES),
    showAxes: z.boolean().default(true),
    axisColor: z.string().default("#ffffff"),
    yAxisTickCount: z.number().min(2).max(10).default(5),
  }),
  render: ({ assets, frame, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;
    const title = typeof assets.title === "string" ? assets.title : "";

    // Parse Data
    const dataString = typeof assets.data === "string" ? assets.data : "";
    const lines = dataString.split("\n").filter((l: string) => l.trim().length > 0);
    const data: GraphDataPoint[] = lines.map((line: string) => {
      const parts = line.split(",").map((s) => s.trim());
      const label = parts[0] || "";
      const value = parseFloat(parts[1]) || 0;
      return { label, value };
    });

    // Parse Props
    const type = (p.type as GraphType) || "bar";
    const colors = (typeof p.colors === "string" ? p.colors : "#3b82f6").split(",");
    
    return (
      <Graph3D
        data={data}
        type={type}
        frame={frame}
        title={title}
        globalFontUrl={globalFontUrl}
        // Config
        introFrames={Number(p.introFrames ?? DEFAULT_GRAPH_INTRO_FRAMES)}
        perItemFrames={Number(p.perItemFrames ?? DEFAULT_GRAPH_PER_ITEM_FRAMES)}
        barWidth={Number(p.barWidth ?? 60)}
        barGap={Number(p.barGap ?? 40)}
        lineThickness={Number(p.lineThickness ?? 8)}
        pieRadius={Number(p.pieRadius ?? 200)}
        pieHeight={Number(p.pieHeight ?? 40)}
        colors={colors}
        textColor={String(p.textColor ?? "#ffffff")}
        // Axis config
        showAxes={Boolean(p.showAxes ?? true)}
        axisColor={String(p.axisColor ?? p.textColor ?? "#ffffff")}
        yAxisTickCount={Number(p.yAxisTickCount ?? 5)}
      />
    );
  },
};
