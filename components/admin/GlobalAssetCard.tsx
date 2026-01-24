"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit, Copy, Image, Video, FileText, FileCode, Sparkles, Trash2 } from "lucide-react";
import type { GlobalAsset } from "@/lib/admin/types";

interface GlobalAssetCardProps {
  asset: GlobalAsset;
  onEdit: (asset: GlobalAsset) => void;
  onCopyId: (id: string) => void;
  onDelete?: (asset: GlobalAsset) => void;
  onCreateMeme?: (asset: GlobalAsset) => void;
  selected?: boolean;
  onToggleSelected?: (asset: GlobalAsset) => void;
}

const typeIcons = {
  image: Image,
  video: Video,
  text: FileText,
  svg: FileCode,
};

export function GlobalAssetCard({
  asset,
  onEdit,
  onCopyId,
  onDelete,
  onCreateMeme,
  selected,
  onToggleSelected,
}: GlobalAssetCardProps) {
  const TypeIcon = typeIcons[asset.type] || Image;
  const canCreateMeme = asset.type === "image" || asset.type === "video";

  return (
    <Card className="group overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {onToggleSelected && (
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={!!selected}
              onChange={() => onToggleSelected(asset)}
              className="h-4 w-4 accent-primary"
              aria-label={selected ? "Deselect asset" : "Select asset"}
            />
          </div>
        )}
        {asset.type === "image" && (
          <img
            src={asset.src}
            alt={asset.name || asset.originalName}
            className="w-full h-full object-cover"
          />
        )}
        {asset.type === "video" && (
          <video
            src={asset.src}
            className="w-full h-full object-cover"
            muted
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => {
              e.currentTarget.pause();
              e.currentTarget.currentTime = 0;
            }}
          />
        )}
        {(asset.type === "svg" || asset.type === "text") && (
          <div className="w-full h-full flex items-center justify-center">
            <TypeIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {canCreateMeme && onCreateMeme && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => onCreateMeme(asset)}>
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create Meme</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {onDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => onDelete(asset)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => onEdit(asset)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit metadata</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => onCopyId(asset.id)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy ID</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">
          {asset.type}
        </Badge>
      </div>
      <CardContent className="p-3 space-y-2">
        <div className="font-medium text-sm truncate" title={asset.name || asset.originalName}>
          {asset.name || asset.originalName}
        </div>
        {asset.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{asset.description}</p>
        )}
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {asset.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {asset.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{asset.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
