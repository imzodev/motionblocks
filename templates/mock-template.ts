import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../types/template";
// We don't need actual React import for types, but for JSX we might.
// Since we are using typescript, we can just return null or a simple object if we aren't using a bundler that handles JSX yet.
// However, the project is Next.js, so JSX is supported.
// But to keep it simple and testable without a full React test renderer, I'll essentially make it a functional component.

const FadeInRender = ({ asset, props }: RenderProps<{ duration: number }>) => {
  // In a real implementation, this would use the frame count to calculate opacity.
  // For now, we just return the asset.
  return asset;
};

export const FadeInTemplate: AnimationTemplate = {
  id: "fade-in",
  name: "Fade In",
  propsSchema: z.object({
    duration: z.number().min(1),
  }),
  render: FadeInRender,
};
