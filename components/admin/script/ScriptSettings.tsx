"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import type { ScriptSettings as ScriptSettingsType } from "@/lib/admin/script-types";
import {
  VIDEO_TYPE_OPTIONS,
  TONE_OPTIONS,
  DURATION_OPTIONS,
  AUDIENCE_OPTIONS,
  STRUCTURE_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/lib/admin/script-types";

interface ScriptSettingsProps {
  settings: ScriptSettingsType;
  onChange: (settings: ScriptSettingsType) => void;
}

export function ScriptSettings({ settings, onChange }: ScriptSettingsProps) {
  const update = (partial: Partial<ScriptSettingsType>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <Card>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm">Script Settings</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="videoType">Video Type</Label>
            <select
              id="videoType"
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={settings.videoType}
              onChange={(e) => update({ videoType: e.target.value as ScriptSettingsType["videoType"] })}
            >
              {VIDEO_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <select
              id="tone"
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={settings.tone}
              onChange={(e) => update({ tone: e.target.value as ScriptSettingsType["tone"] })}
            >
              {TONE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <select
              id="duration"
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={settings.duration}
              onChange={(e) => update({ duration: e.target.value as ScriptSettingsType["duration"] })}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <select
              id="audience"
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={settings.audience}
              onChange={(e) => update({ audience: e.target.value as ScriptSettingsType["audience"] })}
            >
              {AUDIENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="structure">Script Structure</Label>
            <select
              id="structure"
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={settings.structure}
              onChange={(e) => update({ structure: e.target.value as ScriptSettingsType["structure"] })}
            >
              {STRUCTURE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              value={settings.language}
              onChange={(e) => update({ language: e.target.value as ScriptSettingsType["language"] })}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {STRUCTURE_OPTIONS.find((s) => s.value === settings.structure)?.description}
        </p>

        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label htmlFor="includeCta" className="cursor-pointer">Include Call to Action</Label>
            <Switch
              id="includeCta"
              checked={settings.includeCta}
              onCheckedChange={(checked) => update({ includeCta: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="includeTimestamps" className="cursor-pointer">Include Timestamps</Label>
            <Switch
              id="includeTimestamps"
              checked={settings.includeTimestamps}
              onCheckedChange={(checked) => update({ includeTimestamps: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="includeBroll" className="cursor-pointer">Include B-Roll Suggestions</Label>
            <Switch
              id="includeBroll"
              checked={settings.includeBrollSuggestions}
              onCheckedChange={(checked) => update({ includeBrollSuggestions: checked })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
