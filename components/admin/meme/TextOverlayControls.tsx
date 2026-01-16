"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  RotateCcw,
  CaseSensitive,
} from "lucide-react";
import type { TextOverlay } from "@/lib/admin/meme-types";
import { MEME_FONTS } from "@/lib/admin/meme-types";

interface TextOverlayControlsProps {
  overlay: TextOverlay;
  onChange: (overlay: TextOverlay) => void;
  onDelete: () => void;
}

export function TextOverlayControls({
  overlay,
  onChange,
  onDelete,
}: TextOverlayControlsProps) {
  const update = (partial: Partial<TextOverlay>) => {
    onChange({ ...overlay, ...partial });
  };

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Text Settings</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text-content">Text</Label>
          <Input
            id="text-content"
            value={overlay.text}
            onChange={(e) => update({ text: e.target.value })}
            placeholder="Enter text..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="font-family">Font</Label>
            <select
              id="font-family"
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={overlay.fontFamily}
              onChange={(e) => update({ fontFamily: e.target.value })}
            >
              {MEME_FONTS.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>Font Size: {overlay.fontSize}px</Label>
            <Slider
              value={[overlay.fontSize]}
              onValueChange={([v]) => update({ fontSize: v })}
              min={12}
              max={120}
              step={2}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="text-color"
                value={overlay.color}
                onChange={(e) => update({ color: e.target.value })}
                className="h-9 w-12 rounded border cursor-pointer"
              />
              <Input
                value={overlay.color}
                onChange={(e) => update({ color: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stroke-color">Stroke Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                id="stroke-color"
                value={overlay.strokeColor}
                onChange={(e) => update({ strokeColor: e.target.value })}
                className="h-9 w-12 rounded border cursor-pointer"
              />
              <Input
                value={overlay.strokeColor}
                onChange={(e) => update({ strokeColor: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Stroke Width: {overlay.strokeWidth}px</Label>
          <Slider
            value={[overlay.strokeWidth]}
            onValueChange={([v]) => update({ strokeWidth: v })}
            min={0}
            max={10}
            step={0.5}
          />
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Style:</Label>
          <Button
            variant={overlay.uppercase ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => update({ uppercase: !overlay.uppercase })}
            title="Uppercase"
          >
            <CaseSensitive className="h-4 w-4" />
          </Button>
          <Button
            variant={overlay.bold ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => update({ bold: !overlay.bold })}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={overlay.italic ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => update({ italic: !overlay.italic })}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant={overlay.textAlign === "left" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => update({ textAlign: "left" })}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={overlay.textAlign === "center" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => update({ textAlign: "center" })}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={overlay.textAlign === "right" ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => update({ textAlign: "right" })}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Rotation: {overlay.rotation}°</Label>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => update({ rotation: 0, x: 50, y: 10 })}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
          <Slider
            value={[overlay.rotation]}
            onValueChange={([v]) => update({ rotation: v })}
            min={-180}
            max={180}
            step={5}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>X Position: {overlay.x.toFixed(0)}%</Label>
            <Slider
              value={[overlay.x]}
              onValueChange={([v]) => update({ x: v })}
              min={0}
              max={100}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Y Position: {overlay.y.toFixed(0)}%</Label>
            <Slider
              value={[overlay.y]}
              onValueChange={([v]) => update({ y: v })}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
