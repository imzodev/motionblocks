import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../../types/template";
import { List, type BulletType, type ListStyle } from "../../components/animations/List";

export const ListTemplate: AnimationTemplate = {
  id: "list",
  name: "Bullet List",
  slots: [
    { id: "title", name: "List Title (Optional)", type: "text" },
    { id: "data", name: "List Items (One per line)", type: "data-table", required: true },
  ],
  propsSchema: z.object({
    textColor: z.string().default("#1a1a1a"),
    bulletColor: z.string().default("#00d09c"),
    fontSize: z.number().min(10).max(100).default(40),
    gap: z.number().min(10).max(200).default(60),
    introFrames: z.number().min(10).max(120).default(30),
    perItemFrames: z.number().min(5).max(120).default(60),
    bulletType: z.enum(["none", "bullet", "number", "arrow"]).default("bullet"),
    listStyle: z.enum(["classic", "neon", "3d"]).default("classic"),
  }),
  render: ({ assets, frame, props }: RenderProps) => {
    const p = (props ?? {}) as Record<string, unknown>;
    const globalFontUrl = typeof p.globalFontUrl === "string" ? p.globalFontUrl : undefined;
    
    // Parse Title
    const title = typeof assets.title === "string" ? assets.title : undefined;

    // Parse List Items
    const dataString = typeof assets.data === "string" ? assets.data : "";
    const items = dataString
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0);

    // Fallback if empty
    if (items.length === 0) {
        items.push("Item 1", "Item 2", "Item 3");
    }

    return (
      <List
        items={items}
        title={title}
        frame={frame}
        introFrames={Number(p.introFrames ?? 30)}
        perItemFrames={Number(p.perItemFrames ?? 60)}
        textColor={String(p.textColor ?? "#1a1a1a")}
        bulletColor={String(p.bulletColor ?? "#00d09c")}
        fontSize={Number(p.fontSize ?? 40)}
        gap={Number(p.gap ?? 60)}
        bulletType={(p.bulletType as BulletType) ?? "bullet"}
        listStyle={(p.listStyle as ListStyle) ?? "classic"}
        fontUrl={globalFontUrl}
      />
    );
  },
};
