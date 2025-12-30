"use client";

import React from "react";
import { Sparkles, Layout, BarChart3, Share2, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Mock list of template categories and recipes for the initial UI.
 */
const TEMPLATES = [
  { id: "fade-in", name: "Fade In", type: "entry", icon: Layout },
  { id: "slide-in", name: "Slide In", type: "entry", icon: Layout },
  { id: "scale-pop", name: "Scale Pop", type: "entry", icon: Layout },
  { id: "mask-reveal", name: "Mask Reveal", type: "entry", icon: Layout },
  { id: "pulse", name: "Pulse", type: "emphasis", icon: Sparkles },
  { id: "glow", name: "Glow", type: "emphasis", icon: Sparkles },
  { id: "bounce", name: "Bounce", type: "emphasis", icon: Sparkles },
  { id: "shake", name: "Shake", type: "emphasis", icon: Sparkles },
  { id: "counter", name: "Counter", type: "data", icon: Type },
  { id: "timeline-reveal", name: "Timeline Reveal", type: "data", icon: BarChart3 },
  { id: "mind-map", name: "3D Mind Map", type: "visual", icon: Share2 },
  { id: "graph", name: "3D Graph", type: "visual", icon: BarChart3 },
  { id: "highlight", name: "Text Highlight", type: "text", icon: Type },
  { id: "kinetic-text", name: "Kinetic Text", type: "text", icon: Type },
];

interface TemplatesPanelProps {
  onSelect: (templateId: string) => void;
  className?: string;
}

/**
 * TemplatesPanel allows users to browse and select animation templates.
 */
export function TemplatesPanel({ onSelect, className }: TemplatesPanelProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 gap-2">
        {TEMPLATES.map((template) => (
          <Button
            key={template.id}
            onClick={() => onSelect(template.id)}
            variant="outline"
            className="h-auto justify-start gap-3 p-3 bg-card hover:bg-accent/40 hover:border-primary/50 transition-all text-left group"
          >
            <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <template.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{template.name}</p>
              <div className="pt-1">
                <Badge variant="secondary" className="uppercase tracking-widest text-[10px]">
                  {template.type}
                </Badge>
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
