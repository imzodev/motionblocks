"use client";

import React from "react";
import type { Track, Asset } from "@/types/timeline";
import type { AnimationTemplate } from "@/types/template";
import { cn } from "@/lib/utils";
import { Clock, Database, Layout } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface DetailsPanelProps {
  selectedTrack?: Track;
  template?: AnimationTemplate;
  assets: Asset[];
  onUpdateTrack: (track: Track) => void;
  className?: string;
}

export function DetailsPanel({
  selectedTrack,
  template,
  assets: _assets,
  onUpdateTrack,
  className
}: DetailsPanelProps) {
  if (!selectedTrack) {
    return (
      <Card className={cn("flex items-center justify-center h-full text-muted-foreground p-6 text-center border-dashed bg-card/60", className)}>
        <p className="text-sm">Select a block to configure its slots and timing.</p>
      </Card>
    );
  }

  const handleSlotUpdate = (slotId: string, value: unknown) => {
    const nextTemplateProps = {
      ...selectedTrack.templateProps,
      [slotId]: value,
    };

    let nextDuration = selectedTrack.duration;
    if (selectedTrack.template === "timeline-reveal") {
      const filled = new Set<number>();
      for (let i = 1; i <= 5; i += 1) {
        const labelVal = nextTemplateProps[`label${i}`];
        const imageVal = nextTemplateProps[`image${i}`];
        const hasLabel = typeof labelVal === "string" && labelVal.trim().length > 0;
        const hasImage = typeof imageVal === "string" && imageVal.trim().length > 0;
        if (hasLabel || hasImage) filled.add(i);
      }

      const itemCount = Math.max(1, filled.size);
      const perItemFrames =
        typeof nextTemplateProps.perItemFrames === "number"
          ? nextTemplateProps.perItemFrames
          : 110;
      const intro = 24;
      const outro = 18;
      const segments = Math.max(1, itemCount - 1);
      nextDuration = Math.max(80, Math.min(600, intro + outro + segments * perItemFrames));
    }

    onUpdateTrack({
      ...selectedTrack,
      duration: nextDuration,
      templateProps: nextTemplateProps,
    });
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="py-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Block</p>
            <CardTitle className="text-base truncate uppercase tracking-tight">{selectedTrack.template}</CardTitle>
          </div>
          <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
            {selectedTrack.duration}f
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-3 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-muted-foreground" />
              <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Slots</h4>
            </div>
            {!template && (
              <Badge variant="secondary" className="text-[10px] uppercase tracking-widest">
                none
              </Badge>
            )}
          </div>

          {template?.slots.map((slot) => (
            <div key={slot.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium truncate">{slot.name}</label>
                {slot.required && (
                  <Badge className="text-[10px] uppercase tracking-widest">required</Badge>
                )}
              </div>

              {slot.type === "file" && (
                <div className="rounded-xl border bg-muted/20 px-2 py-1.5">
                  {selectedTrack.templateProps[slot.id] ? (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-6 h-6 bg-muted rounded-md overflow-hidden shrink-0 grid place-items-center">
                        <Layout className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <span className="flex-1 truncate font-mono text-xs">
                        {String(selectedTrack.templateProps[slot.id])}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-7 w-7"
                        onClick={() => handleSlotUpdate(slot.id, "")}
                        aria-label="Clear slot"
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground italic px-1">
                      Click asset in library to assign
                    </p>
                  )}
                </div>
              )}

              {slot.type === "text" && (
                <Input
                  placeholder={`Enter ${slot.name.toLowerCase()}...`}
                  value={String(selectedTrack.templateProps[slot.id] || "")}
                  onChange={(e) => handleSlotUpdate(slot.id, e.target.value)}
                />
              )}

              {slot.type === "data-table" && (
                <Textarea
                  className="font-mono text-[12px]"
                  placeholder="Label, Value\nItem A, 10\nItem B, 20"
                  value={String(selectedTrack.templateProps[slot.id] || "")}
                  onChange={(e) => handleSlotUpdate(slot.id, e.target.value)}
                />
              )}
            </div>
          ))}

          {!template && (
            <Card className="p-4 text-center border border-dashed bg-card/60">
              <p className="text-[10px] text-muted-foreground">
                No dynamic slots defined for this template yet.
              </p>
            </Card>
          )}
        </div>

        {selectedTrack.template === "timeline-reveal" && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Template</h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Per-item frames</label>
                  <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
                    {typeof selectedTrack.templateProps.perItemFrames === "number"
                      ? selectedTrack.templateProps.perItemFrames
                      : 110}
                    f
                  </Badge>
                </div>
                <Slider
                  min={70}
                  max={150}
                  step={1}
                  value={[
                    typeof selectedTrack.templateProps.perItemFrames === "number"
                      ? selectedTrack.templateProps.perItemFrames
                      : 110,
                  ]}
                  onValueChange={(v) => handleSlotUpdate("perItemFrames", v[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Item zoom</label>
                  <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
                    {(
                      typeof selectedTrack.templateProps.itemZoom === "number"
                        ? selectedTrack.templateProps.itemZoom
                        : 0.35
                    ).toFixed(2)}
                  </Badge>
                </div>
                <Slider
                  min={0}
                  max={1.2}
                  step={0.01}
                  value={[
                    typeof selectedTrack.templateProps.itemZoom === "number"
                      ? selectedTrack.templateProps.itemZoom
                      : 0.35,
                  ]}
                  onValueChange={(v) => handleSlotUpdate("itemZoom", v[0])}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Dot color</label>
                  <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
                    <input
                      type="color"
                      className="h-7 w-8 bg-transparent"
                      value={String(selectedTrack.templateProps.accentColor || "#6366f1")}
                      onChange={(e) => handleSlotUpdate("accentColor", e.target.value)}
                    />
                    <Input
                      value={String(selectedTrack.templateProps.accentColor || "#6366f1")}
                      onChange={(e) => handleSlotUpdate("accentColor", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Line color</label>
                  <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
                    <input
                      type="color"
                      className="h-7 w-8 bg-transparent"
                      value={String(selectedTrack.templateProps.lineColor || "#94a3b8")}
                      onChange={(e) => handleSlotUpdate("lineColor", e.target.value)}
                    />
                    <Input
                      value={String(selectedTrack.templateProps.lineColor || "#94a3b8")}
                      onChange={(e) => handleSlotUpdate("lineColor", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Background</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      handleSlotUpdate(
                        "backgroundEnabled",
                        !(selectedTrack.templateProps.backgroundEnabled === true)
                      )
                    }
                  >
                    {selectedTrack.templateProps.backgroundEnabled === true ? "On" : "Off"}
                  </Button>
                </div>

                {selectedTrack.templateProps.backgroundEnabled === true && (
                  <>
                    <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
                      <input
                        type="color"
                        className="h-7 w-8 bg-transparent"
                        value={String(selectedTrack.templateProps.backgroundColor || "#ffffff")}
                        onChange={(e) => handleSlotUpdate("backgroundColor", e.target.value)}
                      />
                      <Input
                        value={String(selectedTrack.templateProps.backgroundColor || "#ffffff")}
                        onChange={(e) => handleSlotUpdate("backgroundColor", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium">Background opacity</label>
                        <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
                          {(
                            typeof selectedTrack.templateProps.backgroundOpacity === "number"
                              ? selectedTrack.templateProps.backgroundOpacity
                              : 1
                          ).toFixed(2)}
                        </Badge>
                      </div>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[
                          typeof selectedTrack.templateProps.backgroundOpacity === "number"
                            ? selectedTrack.templateProps.backgroundOpacity
                            : 1,
                        ]}
                        onValueChange={(v) => handleSlotUpdate("backgroundOpacity", v[0])}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Timing</h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border bg-card/60 px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-none">Start</p>
              <p className="font-mono text-xs tabular-nums leading-tight mt-1">{selectedTrack.startFrame}</p>
            </div>
            <div className="rounded-xl border bg-card/60 px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-none">End</p>
              <p className="font-mono text-xs tabular-nums leading-tight mt-1">{selectedTrack.startFrame + selectedTrack.duration}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}