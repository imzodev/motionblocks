"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface KineticTextTemplateSectionProps {
  selectedTrack: Track;
  onSlotUpdate: (slotId: string, value: unknown) => void;
  onUpdateTrack: (track: Track) => void;
}

export function KineticTextTemplateSection({
  selectedTrack,
  onSlotUpdate,
  onUpdateTrack,
}: KineticTextTemplateSectionProps) {
  if (selectedTrack.template !== "kinetic-text") return null;

  return (
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
                typeof selectedTrack.templateProps.fontSize === "number" ? selectedTrack.templateProps.fontSize : 78
              )}
              onChange={(e) => onSlotUpdate("fontSize", Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Main color</label>
            <div className="flex items-center gap-2 rounded-xl border bg-card/60 px-2 py-1.5">
              <input
                type="color"
                className="h-7 w-8 bg-transparent"
                value={String(selectedTrack.templateProps.fontColor || "#ffffff")}
                onChange={(e) => onSlotUpdate("fontColor", e.target.value)}
              />
              <Input
                value={String(selectedTrack.templateProps.fontColor || "#ffffff")}
                onChange={(e) => onSlotUpdate("fontColor", e.target.value)}
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
              onChange={(e) => onSlotUpdate("accentColor", e.target.value)}
            />
            <Input
              value={String(selectedTrack.templateProps.accentColor || "#ffffff")}
              onChange={(e) => onSlotUpdate("accentColor", e.target.value)}
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
              onChange={(e) => onSlotUpdate("perSegmentFrames", Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium">Enter (frames)</label>
            <Input
              type="number"
              min={4}
              max={60}
              value={String(
                typeof selectedTrack.templateProps.enterFrames === "number" ? selectedTrack.templateProps.enterFrames : 14
              )}
              onChange={(e) => onSlotUpdate("enterFrames", Number(e.target.value))}
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
                typeof selectedTrack.templateProps.exitFrames === "number" ? selectedTrack.templateProps.exitFrames : 10
              )}
              onChange={(e) => onSlotUpdate("exitFrames", Number(e.target.value))}
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
              onChange={(e) => onSlotUpdate("continuationDelayFrames", Number(e.target.value))}
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
              onChange={(e) => onSlotUpdate("continuationTypeFrames", Number(e.target.value))}
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
              typeof selectedTrack.templateProps.slidePx === "number" ? selectedTrack.templateProps.slidePx : 32
            )}
            onChange={(e) => onSlotUpdate("slidePx", Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Camera motion</label>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onSlotUpdate("cameraMotionEnabled", !(selectedTrack.templateProps.cameraMotionEnabled === true))}
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
                        onSlotUpdate("segmentEffects", next);
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
              onClick={() => onSlotUpdate("backgroundEnabled", !(selectedTrack.templateProps.backgroundEnabled === true))}
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
                  onChange={(e) => onSlotUpdate("backgroundColor", e.target.value)}
                />
                <Input
                  value={String(selectedTrack.templateProps.backgroundColor || "#0b1220")}
                  onChange={(e) => onSlotUpdate("backgroundColor", e.target.value)}
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
                    onChange={(e) => onSlotUpdate("backgroundScale", Number(e.target.value))}
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
                    onChange={(e) => onSlotUpdate("backgroundVideoAspect", Number(e.target.value))}
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
                  onValueChange={(v) => onSlotUpdate("backgroundOpacity", v[0])}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
