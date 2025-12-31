"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface CounterTemplateSectionProps {
  selectedTrack: Track;
  onSlotUpdate: (slotId: string, value: unknown) => void;
}

export function CounterTemplateSection({
  selectedTrack,
  onSlotUpdate,
}: CounterTemplateSectionProps) {
  if (selectedTrack.template !== "counter") return null;

  return (
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
              onChange={(e) => onSlotUpdate("startValue", Number(e.target.value))}
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
              onChange={(e) => onSlotUpdate("endValue", Number(e.target.value))}
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
                typeof selectedTrack.templateProps.digits === "number" ? selectedTrack.templateProps.digits : 3
              )}
              onChange={(e) => onSlotUpdate("digits", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Font size</label>
            <Input
              type="number"
              min={24}
              max={160}
              value={String(
                typeof selectedTrack.templateProps.fontSize === "number" ? selectedTrack.templateProps.fontSize : 96
              )}
              onChange={(e) => onSlotUpdate("fontSize", Number(e.target.value))}
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
              typeof selectedTrack.templateProps.glowStrength === "number" ? selectedTrack.templateProps.glowStrength : 0.65,
            ]}
            onValueChange={(v) => onSlotUpdate("glowStrength", v[0])}
          />
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
                onChange={(e) => onSlotUpdate("textColor", e.target.value)}
              />
              <Input
                value={String(selectedTrack.templateProps.textColor || "#e2e8f0")}
                onChange={(e) => onSlotUpdate("textColor", e.target.value)}
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
                onChange={(e) => onSlotUpdate("glowColor", e.target.value)}
              />
              <Input
                value={String(selectedTrack.templateProps.glowColor || "#60a5fa")}
                onChange={(e) => onSlotUpdate("glowColor", e.target.value)}
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
              onChange={(e) => onSlotUpdate("digitSpacing", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Flip depth</label>
            <Input
              type="number"
              min={1}
              max={40}
              value={String(
                typeof selectedTrack.templateProps.flipDepth === "number" ? selectedTrack.templateProps.flipDepth : 14
              )}
              onChange={(e) => onSlotUpdate("flipDepth", Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Flip window</label>
            <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
              {(
                typeof selectedTrack.templateProps.flipWindow === "number" ? selectedTrack.templateProps.flipWindow : 0.22
              ).toFixed(2)}
            </Badge>
          </div>
          <Slider
            min={0.05}
            max={0.8}
            step={0.01}
            value={[
              typeof selectedTrack.templateProps.flipWindow === "number" ? selectedTrack.templateProps.flipWindow : 0.22,
            ]}
            onValueChange={(v) => onSlotUpdate("flipWindow", v[0])}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">Flip tilt</label>
            <Badge variant="secondary" className="tabular-nums text-[10px] px-2 py-0 leading-none">
              {(
                typeof selectedTrack.templateProps.flipTilt === "number" ? selectedTrack.templateProps.flipTilt : 0.35
              ).toFixed(2)}
            </Badge>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[
              typeof selectedTrack.templateProps.flipTilt === "number" ? selectedTrack.templateProps.flipTilt : 0.35,
            ]}
            onValueChange={(v) => onSlotUpdate("flipTilt", v[0])}
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
              onChange={(e) => onSlotUpdate("endFlourishFrames", Number(e.target.value))}
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
                typeof selectedTrack.templateProps.endZoom === "number" ? selectedTrack.templateProps.endZoom : 0.18
              )}
              onChange={(e) => onSlotUpdate("endZoom", Number(e.target.value))}
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
              onChange={(e) => onSlotUpdate("endGlowBoost", Number(e.target.value))}
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
              onChange={(e) => onSlotUpdate("endBurstStrength", Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </>
  );
}
