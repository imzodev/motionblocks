"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface AssetsPanelProps {
  onUpload: (files: File[]) => void;
  className?: string;
}

/**
 * AssetsPanel component provides a drag-and-drop interface for uploading images and SVGs.
 */
export function AssetsPanel({ onUpload, className }: AssetsPanelProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (onUpload) {
        onUpload(acceptedFiles);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".svg"],
    },
  });

  return (
    <Card
      className={cn(
        "border-2 border-dashed transition-all cursor-pointer bg-muted/30 hover:bg-muted/50 hover:border-primary/50",
        isDragActive && "border-primary bg-primary/5",
        className
      )}
      {...getRootProps()}
    >
      <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
        <input {...getInputProps()} />
        <div className="p-4 bg-background rounded-full shadow-sm border border-border/50">
          <Upload className={cn("w-6 h-6 transition-colors", isDragActive ? "text-primary" : "text-muted-foreground")} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-bold tracking-tight">
            {isDragActive ? "Drop to upload" : "Click or drag assets"}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">
            PNG • JPG • SVG
          </p>
        </div>
      </CardContent>
    </Card>
  );
}