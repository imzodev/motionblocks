import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Chapters } from "../../components/animations/Chapters";
import { isAsset } from "./shared";

export const ChaptersTemplate: AnimationTemplate = {
  id: "chapters",
  name: "Chapters",
  slots: [
    { id: "background", name: "Background (Image/Video)", type: "file" },
    { id: "data", name: "Chapters (Title, Subtitle)", type: "data-table", required: true },
  ],
  propsSchema: z.object({
    startNumber: z.number().default(1),
    showNumber: z.boolean().default(true),
    accentColor: z.string().default("#00d09c"),
    textColor: z.string().default("#1a1a1a"),
    introFrames: z.number().min(10).max(120).default(30),
    framesPerChapter: z.number().min(30).max(600).default(60),
    // Background
    backgroundEnabled: z.boolean().default(false),
    backgroundColor: z.string().default("#ffffff"),
    backgroundOpacity: z.number().min(0).max(1).default(1),
    backgroundScale: z.number().min(1000).max(12000).default(6000),
    backgroundVideoAspect: z.number().min(0.2).max(5).default(16 / 9),
  }),
  render: ({ assets, frame, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;

    // Background Props
    const backgroundEnabled = typeof p.backgroundEnabled === "boolean" ? p.backgroundEnabled : false;
    const backgroundColor = typeof p.backgroundColor === "string" ? p.backgroundColor : "#ffffff";
    const backgroundOpacity = typeof p.backgroundOpacity === "number" ? p.backgroundOpacity : 1;
    const backgroundScale = typeof p.backgroundScale === "number" ? p.backgroundScale : 6000;
    const backgroundVideoAspect = typeof p.backgroundVideoAspect === "number" ? p.backgroundVideoAspect : 16 / 9;
    const backgroundAsset = isAsset(assets.background) ? assets.background : undefined;
    
    // Parse Data
    const dataString = typeof assets.data === "string" ? assets.data : "";
    const lines = dataString.split("\n").filter((l: string) => l.trim().length > 0);
    const data = lines.map((line: string) => {
      // Split by first comma only to allow commas in subtitle
      const firstCommaIndex = line.indexOf(",");
      if (firstCommaIndex === -1) {
        return { title: line.trim(), subtitle: "" };
      }
      const title = line.substring(0, firstCommaIndex).trim();
      const subtitle = line.substring(firstCommaIndex + 1).trim();
      return { title, subtitle };
    });

    if (data.length === 0) {
      data.push({ title: "Chapter Title", subtitle: "Subtitle" });
    }

    return (
      <Chapters
        data={data}
        startNumber={Number(p.startNumber ?? 1)}
        showNumber={Boolean(p.showNumber ?? true)}
        frame={frame}
        introFrames={Number(p.introFrames ?? 30)}
        framesPerChapter={Number(p.framesPerChapter ?? 60)}
        accentColor={String(p.accentColor ?? "#00d09c")}
        textColor={String(p.textColor ?? "#1a1a1a")}
        fontUrl={globalFontUrl}
        // Background
        backgroundEnabled={backgroundEnabled}
        backgroundColor={backgroundColor}
        backgroundOpacity={backgroundOpacity}
        backgroundScale={backgroundScale}
        backgroundVideoAspect={backgroundVideoAspect}
        backgroundAsset={backgroundAsset}
      />
    );
  },
};
