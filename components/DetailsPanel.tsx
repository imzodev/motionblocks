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
    onUpdateTrack({
      ...selectedTrack,
      templateProps: {
        ...selectedTrack.templateProps,
        [slotId]: value,
      },
    });
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Block</p>
            <CardTitle className="text-base truncate uppercase tracking-tight">{selectedTrack.template}</CardTitle>
          </div>
          <Badge variant="secondary" className="tabular-nums">
            {selectedTrack.duration}f
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-4 space-y-6">
        <div className="space-y-4">
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
            <div key={slot.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium truncate">{slot.name}</label>
                {slot.required && (
                  <Badge className="text-[10px] uppercase tracking-widest">required</Badge>
                )}
              </div>

              {slot.type === "file" && (
                <Card className="p-2 bg-muted/20">
                  {selectedTrack.templateProps[slot.id] ? (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-7 h-7 bg-muted rounded-md overflow-hidden shrink-0 grid place-items-center">
                        <Layout className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <span className="flex-1 truncate font-mono text-xs">
                        {String(selectedTrack.templateProps[slot.id])}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
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
                </Card>
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

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Timing</h4>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Start</p>
              <p className="font-mono text-sm tabular-nums">{selectedTrack.startFrame}</p>
            </Card>
            <Card className="p-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">End</p>
              <p className="font-mono text-sm tabular-nums">{selectedTrack.startFrame + selectedTrack.duration}</p>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}