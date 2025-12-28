"use client";

import React from "react";
import { Sparkles, Layout, BarChart3, Share2, Type } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mock list of template categories and recipes for the initial UI.
 */
const TEMPLATES = [
  { id: "fade-in", name: "Fade In", type: "entry", icon: Layout },
  { id: "slide-in", name: "Slide In", type: "entry", icon: Layout },
  { id: "mind-map", name: "3D Mind Map", type: "visual", icon: Share2 },
  { id: "graph", name: "3D Graph", type: "visual", icon: BarChart3 },
  { id: "highlight", name: "Text Highlight", type: "text", icon: Type },
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
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:border-primary/50 transition-all text-left group"
          >
            <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <template.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{template.name}</p>
              <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                {template.type}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
