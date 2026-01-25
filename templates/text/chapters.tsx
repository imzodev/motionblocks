import type { AnimationTemplate, RenderProps } from "../../types/template";
import { Chapters, ChaptersSchema, type ChaptersConfig } from "../../components/animations";
import { isAsset } from "../shared";

export const ChaptersTemplate: AnimationTemplate = {
  id: "chapters",
  name: "Chapters",
  slots: [
    { id: "background", name: "Background (Image/Video)", type: "file" },
    { id: "data", name: "Chapters (Title, Subtitle)", type: "data-table", required: true },
  ],
  propsSchema: ChaptersSchema,
  render: ({ assets, frame, props }: RenderProps) => {
    const p = (props ?? {}) as ChaptersConfig & { globalFontUrl?: string };
    const globalFontUrl = p.globalFontUrl;

    // Resolve background: Check props.background first, then assets.background
    const background = p.background ?? (isAsset(assets.background) ? assets.background : undefined);
    
    // Resolve Data: Check props.data first, then assets.data
    const data = p.data || (typeof assets.data === "string" ? assets.data : "");

    return (
      <Chapters
        {...p}
        data={data}
        background={background}
        frame={frame}
        fontUrl={globalFontUrl}
      />
    );
  },
};
