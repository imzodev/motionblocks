"use client";

import React from "react";
import type { Track } from "@/types/timeline";
import type { AnimationTemplate, TemplateSlot } from "@/types/template";
import { Database, Layout } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DetailsPanelSlotsSectionProps {
  selectedTrack: Track;
  template?: AnimationTemplate;
  onSlotUpdate: (slotId: string, value: unknown) => void;
}

function shouldRenderSlot(selectedTrack: Track, slot: TemplateSlot) {
  if (selectedTrack.template === "kinetic-text" && slot.id === "script") return false;
  return true;
}

export function DetailsPanelSlotsSection({
  selectedTrack,
  template,
  onSlotUpdate,
}: DetailsPanelSlotsSectionProps) {
  return (
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
        .filter((slot) => shouldRenderSlot(selectedTrack, slot))
        .map((slot) => (
          <div key={slot.id} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium truncate">{slot.name}</label>
              {slot.required && <Badge className="text-[10px] uppercase tracking-widest">required</Badge>}
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
                      onClick={() => onSlotUpdate(slot.id, "")}
                      aria-label="Clear slot"
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground italic px-1">Click asset in library to assign</p>
                )}
              </div>
            )}

            {slot.type === "text" && (
              <Input
                placeholder={`Enter ${slot.name.toLowerCase()}...`}
                value={String(selectedTrack.templateProps[slot.id] || "")}
                onChange={(e) => onSlotUpdate(slot.id, e.target.value)}
              />
            )}

            {slot.type === "data-table" && (
              <Textarea
                className="font-mono text-[12px]"
                placeholder="Label, Value\nItem A, 10\nItem B, 20"
                value={String(selectedTrack.templateProps[slot.id] || "")}
                onChange={(e) => onSlotUpdate(slot.id, e.target.value)}
              />
            )}
          </div>
        ))}

      {!template && (
        <Card className="p-4 text-center border border-dashed bg-card/60">
          <p className="text-[10px] text-muted-foreground">No dynamic slots defined for this template yet.</p>
        </Card>
      )}
    </div>
  );
}
