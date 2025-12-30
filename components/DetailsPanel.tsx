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

    if (selectedTrack.template === "kinetic-text") {
      const script = typeof nextTemplateProps.script === "string" ? nextTemplateProps.script : "";
      const lines = script
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const per =
        typeof nextTemplateProps.perSegmentFrames === "number"
          ? nextTemplateProps.perSegmentFrames
          : 45;
      const count = Math.max(1, lines.length);
      nextDuration = Math.max(60, count * Math.max(12, Math.floor(per)));
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

          {template?.slots
            .filter((slot) => {
              if (selectedTrack.template === "kinetic-text" && slot.id === "script") return false;
              return true;
            })
            .map((slot) => (
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

        {selectedTrack.template === "counter" && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Template</h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Start value</label>
                  <Input
                    type="number"
                    value={String(
                      typeof selectedTrack.templateProps.startValue === "number"
                        ? selectedTrack.templateProps.startValue
                        : 0
                    )}
                    onChange={(e) => handleSlotUpdate("startValue", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">End value</label>
                  <Input
                    type="number"
                    value={String(
                      typeof selectedTrack.templateProps.endValue === "number"
                        ? selectedTrack.templateProps.endValue
                        : 100
                    )}
                    onChange={(e) => handleSlotUpdate("endValue", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Digits</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={String(
                      typeof selectedTrack.templateProps.digits === "number"
                        ? selectedTrack.templateProps.digits
                        : 3
                    )}
                    onChange={(e) => handleSlotUpdate("digits", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Font size</label>
                  <Input
                    type="number"
                    min={24}
                    max={160}
                    value={String(
                      typeof selectedTrack.templateProps.fontSize === "number"
                        ? selectedTrack.templateProps.fontSize
                        : 96
                    )}
                    onChange={(e) => handleSlotUpdate("fontSize", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Glow strength</label>
                  <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
                    {(
                      typeof selectedTrack.templateProps.glowStrength === "number"
                        ? selectedTrack.templateProps.glowStrength
                        : 0.65
                    ).toFixed(2)}
                  </Badge>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[
                    typeof selectedTrack.templateProps.glowStrength === "number"
                      ? selectedTrack.templateProps.glowStrength
                      : 0.65,
                  ]}
                  onValueChange={(v) => handleSlotUpdate("glowStrength", v[0])}
                />
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

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium">Background scale</label>
                      <Input
                        type="number"
                        min={1000}
                        max={12000}
                        value={String(
                          typeof selectedTrack.templateProps.backgroundScale === "number"
                            ? selectedTrack.templateProps.backgroundScale
                            : 6000
                        )}
                        onChange={(e) => handleSlotUpdate("backgroundScale", Number(e.target.value))}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Text color</label>
                  <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
                    <input
                      type="color"
                      className="h-7 w-8 bg-transparent"
                      value={String(selectedTrack.templateProps.textColor || "#e2e8f0")}
                      onChange={(e) => handleSlotUpdate("textColor", e.target.value)}
                    />
                    <Input
                      value={String(selectedTrack.templateProps.textColor || "#e2e8f0")}
                      onChange={(e) => handleSlotUpdate("textColor", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Glow color</label>
                  <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
                    <input
                      type="color"
                      className="h-7 w-8 bg-transparent"
                      value={String(selectedTrack.templateProps.glowColor || "#60a5fa")}
                      onChange={(e) => handleSlotUpdate("glowColor", e.target.value)}
                    />
                    <Input
                      value={String(selectedTrack.templateProps.glowColor || "#60a5fa")}
                      onChange={(e) => handleSlotUpdate("glowColor", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Digit spacing</label>
                  <Input
                    type="number"
                    min={30}
                    max={140}
                    value={String(
                      typeof selectedTrack.templateProps.digitSpacing === "number"
                        ? selectedTrack.templateProps.digitSpacing
                        : 74
                    )}
                    onChange={(e) => handleSlotUpdate("digitSpacing", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Flip depth</label>
                  <Input
                    type="number"
                    min={1}
                    max={40}
                    value={String(
                      typeof selectedTrack.templateProps.flipDepth === "number"
                        ? selectedTrack.templateProps.flipDepth
                        : 14
                    )}
                    onChange={(e) => handleSlotUpdate("flipDepth", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Flip window</label>
                  <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
                    {(
                      typeof selectedTrack.templateProps.flipWindow === "number"
                        ? selectedTrack.templateProps.flipWindow
                        : 0.22
                    ).toFixed(2)}
                  </Badge>
                </div>
                <Slider
                  min={0.05}
                  max={0.8}
                  step={0.01}
                  value={[
                    typeof selectedTrack.templateProps.flipWindow === "number"
                      ? selectedTrack.templateProps.flipWindow
                      : 0.22,
                  ]}
                  onValueChange={(v) => handleSlotUpdate("flipWindow", v[0])}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Flip tilt</label>
                  <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
                    {(
                      typeof selectedTrack.templateProps.flipTilt === "number"
                        ? selectedTrack.templateProps.flipTilt
                        : 0.35
                    ).toFixed(2)}
                  </Badge>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[
                    typeof selectedTrack.templateProps.flipTilt === "number"
                      ? selectedTrack.templateProps.flipTilt
                      : 0.35,
                  ]}
                  onValueChange={(v) => handleSlotUpdate("flipTilt", v[0])}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">End frames</label>
                  <Input
                    type="number"
                    min={0}
                    max={120}
                    value={String(
                      typeof selectedTrack.templateProps.endFlourishFrames === "number"
                        ? selectedTrack.templateProps.endFlourishFrames
                        : 18
                    )}
                    onChange={(e) => handleSlotUpdate("endFlourishFrames", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">End zoom</label>
                  <Input
                    type="number"
                    min={0}
                    max={0.6}
                    step={0.01}
                    value={String(
                      typeof selectedTrack.templateProps.endZoom === "number"
                        ? selectedTrack.templateProps.endZoom
                        : 0.18
                    )}
                    onChange={(e) => handleSlotUpdate("endZoom", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">End glow boost</label>
                  <Input
                    type="number"
                    min={0}
                    max={2}
                    step={0.01}
                    value={String(
                      typeof selectedTrack.templateProps.endGlowBoost === "number"
                        ? selectedTrack.templateProps.endGlowBoost
                        : 0.75
                    )}
                    onChange={(e) => handleSlotUpdate("endGlowBoost", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">End burst</label>
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    value={String(
                      typeof selectedTrack.templateProps.endBurstStrength === "number"
                        ? selectedTrack.templateProps.endBurstStrength
                        : 0.45
                    )}
                    onChange={(e) => handleSlotUpdate("endBurstStrength", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </>
        )}

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
                  max={2}
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

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Label color</label>
                <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
                  <input
                    type="color"
                    className="h-7 w-8 bg-transparent"
                    value={String(
                      selectedTrack.templateProps.labelColor || selectedTrack.templateProps.textColor || "#0b1220"
                    )}
                    onChange={(e) => handleSlotUpdate("labelColor", e.target.value)}
                  />
                  <Input
                    value={String(
                      selectedTrack.templateProps.labelColor || selectedTrack.templateProps.textColor || "#0b1220"
                    )}
                    onChange={(e) => handleSlotUpdate("labelColor", e.target.value)}
                  />
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

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium">Background scale</label>
                        <Input
                          type="number"
                          min={1000}
                          max={12000}
                          value={String(
                            typeof selectedTrack.templateProps.backgroundScale === "number"
                              ? selectedTrack.templateProps.backgroundScale
                              : 6000
                          )}
                          onChange={(e) => handleSlotUpdate("backgroundScale", Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium">Video aspect</label>
                        <Input
                          type="number"
                          min={0.2}
                          max={5}
                          step={0.01}
                          value={String(
                            typeof selectedTrack.templateProps.backgroundVideoAspect === "number"
                              ? selectedTrack.templateProps.backgroundVideoAspect
                              : 16 / 9
                          )}
                          onChange={(e) => handleSlotUpdate("backgroundVideoAspect", Number(e.target.value))}
                        />
                      </div>
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

        {selectedTrack.template === "highlight" && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Template</h4>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Font size</label>
                  <Input
                    type="number"
                    min={18}
                    max={140}
                    value={String(
                      typeof selectedTrack.templateProps.fontSize === "number"
                        ? selectedTrack.templateProps.fontSize
                        : 60
                    )}
                    onChange={(e) => handleSlotUpdate("fontSize", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Font color</label>
                  <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
                    <input
                      type="color"
                      className="h-7 w-8 bg-transparent"
                      value={String(selectedTrack.templateProps.fontColor || "#0f172a")}
                      onChange={(e) => handleSlotUpdate("fontColor", e.target.value)}
                    />
                    <Input
                      value={String(selectedTrack.templateProps.fontColor || "#0f172a")}
                      onChange={(e) => handleSlotUpdate("fontColor", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Highlight color</label>
                <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
                  <input
                    type="color"
                    className="h-7 w-8 bg-transparent"
                    value={String(selectedTrack.templateProps.highlightColor || "#fde047")}
                    onChange={(e) => handleSlotUpdate("highlightColor", e.target.value)}
                  />
                  <Input
                    value={String(selectedTrack.templateProps.highlightColor || "#fde047")}
                    onChange={(e) => handleSlotUpdate("highlightColor", e.target.value)}
                  />
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

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium">Background scale</label>
                        <Input
                          type="number"
                          min={1000}
                          max={12000}
                          value={String(
                            typeof selectedTrack.templateProps.backgroundScale === "number"
                              ? selectedTrack.templateProps.backgroundScale
                              : 6000
                          )}
                          onChange={(e) => handleSlotUpdate("backgroundScale", Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium">Video aspect</label>
                        <Input
                          type="number"
                          min={0.2}
                          max={5}
                          step={0.01}
                          value={String(
                            typeof selectedTrack.templateProps.backgroundVideoAspect === "number"
                              ? selectedTrack.templateProps.backgroundVideoAspect
                              : 16 / 9
                          )}
                          onChange={(e) => handleSlotUpdate("backgroundVideoAspect", Number(e.target.value))}
                        />
                      </div>
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

        {selectedTrack.template === "kinetic-text" && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Template</h4>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Script</label>
                <Textarea
                  rows={6}
                  value={String(selectedTrack.templateProps.script || "")}
                  onChange={(e) => {
                    const nextScript = e.target.value;
                    const nextLines = nextScript
                      .split(/\r?\n/)
                      .map((l) => l.trim())
                      .filter((l) => l.length > 0);
                    const prevEffects = Array.isArray(selectedTrack.templateProps.segmentEffects)
                      ? (selectedTrack.templateProps.segmentEffects as unknown[])
                      : [];
                    const nextEffects = nextLines.map((_, i) => {
                      const v = prevEffects[i];
                      return typeof v === "string" ? v : "pop_bounce";
                    });

                    const nextTemplateProps = {
                      ...selectedTrack.templateProps,
                      script: nextScript,
                      segmentEffects: nextEffects,
                    };

                    const per =
                      typeof selectedTrack.templateProps.perSegmentFrames === "number"
                        ? selectedTrack.templateProps.perSegmentFrames
                        : 45;
                    const count = Math.max(1, nextLines.length);
                    const nextDuration = Math.max(60, count * Math.max(12, Math.floor(per)));

                    onUpdateTrack({
                      ...selectedTrack,
                      duration: nextDuration,
                      templateProps: nextTemplateProps,
                    });
                  }}
                  placeholder={"One segment per line.\nUse: main | continuation (optional)"}
                />
              </div>

              <p className="text-[10px] text-muted-foreground leading-snug">
                Duration is auto-calculated: segments × per-segment frames
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Font size</label>
                  <Input
                    type="number"
                    min={18}
                    max={160}
                    value={String(
                      typeof selectedTrack.templateProps.fontSize === "number"
                        ? selectedTrack.templateProps.fontSize
                        : 78
                    )}
                    onChange={(e) => handleSlotUpdate("fontSize", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Main color</label>
                  <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
                    <input
                      type="color"
                      className="h-7 w-8 bg-transparent"
                      value={String(selectedTrack.templateProps.fontColor || "#ffffff")}
                      onChange={(e) => handleSlotUpdate("fontColor", e.target.value)}
                    />
                    <Input
                      value={String(selectedTrack.templateProps.fontColor || "#ffffff")}
                      onChange={(e) => handleSlotUpdate("fontColor", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Continuation color</label>
                <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
                  <input
                    type="color"
                    className="h-7 w-8 bg-transparent"
                    value={String(selectedTrack.templateProps.accentColor || "#ffffff")}
                    onChange={(e) => handleSlotUpdate("accentColor", e.target.value)}
                  />
                  <Input
                    value={String(selectedTrack.templateProps.accentColor || "#ffffff")}
                    onChange={(e) => handleSlotUpdate("accentColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Per segment (frames)</label>
                  <Input
                    type="number"
                    min={12}
                    max={240}
                    value={String(
                      typeof selectedTrack.templateProps.perSegmentFrames === "number"
                        ? selectedTrack.templateProps.perSegmentFrames
                        : 45
                    )}
                    onChange={(e) => handleSlotUpdate("perSegmentFrames", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Enter (frames)</label>
                  <Input
                    type="number"
                    min={4}
                    max={60}
                    value={String(
                      typeof selectedTrack.templateProps.enterFrames === "number"
                        ? selectedTrack.templateProps.enterFrames
                        : 14
                    )}
                    onChange={(e) => handleSlotUpdate("enterFrames", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Exit (frames)</label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={String(
                      typeof selectedTrack.templateProps.exitFrames === "number"
                        ? selectedTrack.templateProps.exitFrames
                        : 10
                    )}
                    onChange={(e) => handleSlotUpdate("exitFrames", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-1.5" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Continuation delay</label>
                  <Input
                    type="number"
                    min={0}
                    max={90}
                    value={String(
                      typeof selectedTrack.templateProps.continuationDelayFrames === "number"
                        ? selectedTrack.templateProps.continuationDelayFrames
                        : 10
                    )}
                    onChange={(e) => handleSlotUpdate("continuationDelayFrames", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Continuation type</label>
                  <Input
                    type="number"
                    min={4}
                    max={120}
                    value={String(
                      typeof selectedTrack.templateProps.continuationTypeFrames === "number"
                        ? selectedTrack.templateProps.continuationTypeFrames
                        : 16
                    )}
                    onChange={(e) => handleSlotUpdate("continuationTypeFrames", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Continuation slide (px)</label>
                <Input
                  type="number"
                  min={0}
                  max={240}
                  value={String(
                    typeof selectedTrack.templateProps.slidePx === "number"
                      ? selectedTrack.templateProps.slidePx
                      : 32
                  )}
                  onChange={(e) => handleSlotUpdate("slidePx", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Camera motion</label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() =>
                      handleSlotUpdate(
                        "cameraMotionEnabled",
                        !(selectedTrack.templateProps.cameraMotionEnabled === true)
                      )
                    }
                  >
                    {selectedTrack.templateProps.cameraMotionEnabled === true ? "On" : "Off"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium">Segments</label>
                  <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
                    {
                      String(selectedTrack.templateProps.script || "")
                        .split(/\r?\n/)
                        .map((l: string) => l.trim())
                        .filter((l: string) => l.length > 0).length
                    }
                  </Badge>
                </div>

                <div className="space-y-1">
                  {String(selectedTrack.templateProps.script || "")
                    .split(/\r?\n/)
                    .map((l: string) => l.trim())
                    .filter((l: string) => l.length > 0)
                    .map((line: string, i: number) => {
                      const effects = Array.isArray(selectedTrack.templateProps.segmentEffects)
                        ? (selectedTrack.templateProps.segmentEffects as unknown[])
                        : [];
                      const current = typeof effects[i] === "string" ? (effects[i] as string) : "pop_bounce";
                      return (
                        <div
                          key={`${i}-${line}`}
                          className="flex items-center justify-between gap-2 rounded-xl border bg-card/60 px-2 py-1.5"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate">{line}</p>
                            <p className="text-[10px] text-muted-foreground truncate">Segment {i + 1}</p>
                          </div>
                          <select
                            className="h-8 rounded-md border bg-background px-2 text-xs"
                            value={current}
                            onChange={(e) => {
                              const next = [...effects];
                              next[i] = e.target.value;
                              handleSlotUpdate("segmentEffects", next);
                            }}
                          >
                            <option value="pop_bounce">Pop + Bounce</option>
                            <option value="zoom_back">Zoom from Back</option>
                            <option value="zoom_punch">Zoom Punch</option>
                            <option value="slam_zoom">Slam Zoom</option>
                            <option value="slide_left">Slide Left</option>
                            <option value="slide_right">Slide Right</option>
                            <option value="whip_left">Whip Left</option>
                            <option value="whip_right">Whip Right</option>
                            <option value="typewriter">Typewriter</option>
                            <option value="spin_pop">Spin Pop</option>
                            <option value="glitch_shake">Glitch Shake</option>
                            <option value="pop_then_type">Pop + Continuation Type</option>
                            <option value="slide_then_type">Slide + Continuation Type</option>
                          </select>
                        </div>
                      );
                    })}
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
                        value={String(selectedTrack.templateProps.backgroundColor || "#0b1220")}
                        onChange={(e) => handleSlotUpdate("backgroundColor", e.target.value)}
                      />
                      <Input
                        value={String(selectedTrack.templateProps.backgroundColor || "#0b1220")}
                        onChange={(e) => handleSlotUpdate("backgroundColor", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium">Background scale</label>
                        <Input
                          type="number"
                          min={1000}
                          max={12000}
                          value={String(
                            typeof selectedTrack.templateProps.backgroundScale === "number"
                              ? selectedTrack.templateProps.backgroundScale
                              : 6000
                          )}
                          onChange={(e) => handleSlotUpdate("backgroundScale", Number(e.target.value))}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium">Video aspect</label>
                        <Input
                          type="number"
                          min={0.2}
                          max={5}
                          step={0.01}
                          value={String(
                            typeof selectedTrack.templateProps.backgroundVideoAspect === "number"
                              ? selectedTrack.templateProps.backgroundVideoAspect
                              : 16 / 9
                          )}
                          onChange={(e) => handleSlotUpdate("backgroundVideoAspect", Number(e.target.value))}
                        />
                      </div>
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Duration (frames)</label>
            <Input
              type="number"
              min={1}
              max={2000}
              value={String(selectedTrack.duration)}
              disabled={selectedTrack.template === "kinetic-text"}
              onChange={(e) => {
                if (selectedTrack.template === "kinetic-text") return;
                const nextDuration = Math.max(1, Number(e.target.value));
                onUpdateTrack({
                  ...selectedTrack,
                  duration: nextDuration,
                });
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}