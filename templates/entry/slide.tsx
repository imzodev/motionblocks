import type { AnimationTemplate, RenderProps } from "../../types/template";
import { SlideScene, SlideSchema, type SlideConfig, type SlideItem } from "../../components/animations";
import { isAsset } from "../text/shared";
import type { Asset } from "../../types/timeline";

export const SlideTemplate: AnimationTemplate = {
  id: "slide-in",
  name: "Slide In",
  slots: [
    { id: "background", name: "Background (Image/Video)", type: "file" },
    { id: "asset", name: "Asset 1", type: "file", required: true },
    { id: "asset2", name: "Asset 2 (Optional)", type: "file", required: false },
    { id: "asset3", name: "Asset 3 (Optional)", type: "file", required: false },
  ],
  propsSchema: SlideSchema,
  render: ({ assets, frame, props }: RenderProps) => {
    // Cast props to Config using the schema type, allowing for loose typing from the engine
    const p = (props ?? {}) as SlideConfig & { globalFontUrl?: string };
    const globalFontUrl = p.globalFontUrl;
    
    // Gather assets
    const items: SlideItem[] = [];
    
    // Check asset slots (render-time assets)
    // Note: The original code checked 'assets.asset'. 
    // If we want to support B-roll JSON "single source" style, we should also check p.asset if defined?
    // But SlideSchema doesn't have 'asset' field defined as AssetSchema/any like Chapters did.
    // For now, I will stick to the original behavior (checking 'assets') to ensure safety, 
    // unless SlideSchema is updated to include assets.
    // Given user didn't ask to update SlideSchema for B-roll yet, I'll stick to slots.
    
    const asset1 = isAsset(assets.asset) ? assets.asset : undefined;
    const asset2 = isAsset(assets.asset2) ? assets.asset2 : undefined;
    const asset3 = isAsset(assets.asset3) ? assets.asset3 : undefined;

    // TODO: If we want to support "Assets in Props" for SlideTemplate later, we should update Schema.
    
    if (asset1) items.push({ slotId: "asset", asset: asset1 });
    if (asset2) items.push({ slotId: "asset2", asset: asset2 });
    if (asset3) items.push({ slotId: "asset3", asset: asset3 });

    if (items.length === 0) return null;

    // Background resolution
    const background = p.background ?? (isAsset(assets.background) ? assets.background : undefined);

    const imageScaleXBySlot: Record<string, number> = {
      asset: p.assetScaleX,
      asset2: p.asset2ScaleX,
      asset3: p.asset3ScaleX,
    };

    const imageScaleYBySlot: Record<string, number> = {
      asset: p.assetScaleY,
      asset2: p.asset2ScaleY,
      asset3: p.asset3ScaleY,
    };

    return (
      <SlideScene
        {...p}
        items={items}
        imageScaleXBySlot={imageScaleXBySlot}
        imageScaleYBySlot={imageScaleYBySlot}
        background={background}
        frame={frame}
        globalFontUrl={globalFontUrl}
      />
    );
  },
};
