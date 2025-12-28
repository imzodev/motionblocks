"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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
        "p-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-card/60",
        isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
        className
      )}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <div className="p-3 bg-muted rounded-full">
        <Upload className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">
          {isDragActive ? "Drop files here" : "Click or drag assets here"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, SVG</p>
      </div>
    </Card>
  );
}
