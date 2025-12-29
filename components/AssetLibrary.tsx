"use client";

import React from "react";
import type { Asset } from "@/types/timeline";
import { cn } from "@/lib/utils";
import { TypeIcon, FileIcon, VideoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface AssetLibraryProps {
  assets: Asset[];
  onSelect?: (asset: Asset) => void;
  selectedId?: string;
  className?: string;
}

/**
 * AssetLibrary component displays a grid of assets.
 */
export function AssetLibrary({
  assets,
  onSelect,
  selectedId,
  className,
}: AssetLibraryProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4",
        className
      )}
    >
      {assets.length === 0 ? (
        <Card className="col-span-full py-8 text-center text-muted-foreground border border-dashed bg-card/60">
          No assets yet. Upload some to get started.
        </Card>
      ) : (
        assets.map((asset) => (
          <Card
            key={asset.id}
            onClick={() => onSelect?.(asset)}
            className={cn(
              "group relative aspect-square overflow-hidden transition-all cursor-pointer",
              selectedId === asset.id
                ? "border-primary ring-1 ring-primary"
                : "border-border hover:border-primary/40"
            )}
          >
            <div className="absolute inset-0 flex items-center justify-center p-2 bg-muted/40">
              {asset.type === "image" && asset.src ? (
                <img
                  src={asset.src}
                  alt={asset.id}
                  className="w-full h-full object-contain"
                />
              ) : asset.type === "video" ? (
                <div className="flex flex-col items-center gap-1">
                  <VideoIcon className="w-8 h-8 text-muted-foreground" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground line-clamp-1 px-1 text-center">
                    Video
                  </span>
                </div>
              ) : asset.type === "text" ? (
                <div className="flex flex-col items-center gap-1">
                  <TypeIcon className="w-8 h-8 text-muted-foreground" />
                  <span className="text-[10px] uppercase font-bold text-muted-foreground line-clamp-1 px-1 text-center">
                    {asset.content || "Text"}
                  </span>
                </div>
              ) : (
                <FileIcon className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Badge variant="secondary" className="capitalize">
                {asset.type}
              </Badge>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
