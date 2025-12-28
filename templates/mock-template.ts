import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../types/template";
// We don't need actual React import for types, but for JSX we might.
// Since we are using typescript, we can just return null or a simple object if we aren't using a bundler that handles JSX yet.
// However, the project is Next.js, so JSX is supported.
// But to keep it simple and testable without a full React test renderer, I'll essentially make it a functional component.

const FadeInRender = ({ assets }: RenderProps) => {
  void assets;
  return null;
};

export const FadeInTemplate: AnimationTemplate = {
  id: "fade-in",
  name: "Fade In",
  slots: [{ id: "asset", name: "Main Asset", type: "file", required: true }],
  propsSchema: z.object({
    duration: z.number().min(1),
  }),
  render: FadeInRender,
};
