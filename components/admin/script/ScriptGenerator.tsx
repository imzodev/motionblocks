"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Plus, X, Loader2, Link, Check } from "lucide-react";
import { ScriptSettings } from "./ScriptSettings";
import { ScriptOutput } from "./ScriptOutput";
import type {
  ScriptInput,
  ScriptSettings as ScriptSettingsType,
  VideoScript,
} from "@/lib/admin/script-types";
import { DEFAULT_SCRIPT_SETTINGS } from "@/lib/admin/script-types";

export function ScriptGenerator() {
  const [input, setInput] = useState<ScriptInput>({
    topic: "",
    keyPoints: [""],
    brandName: "",
    brandContext: "",
    keywords: [],
    additionalContext: "",
    topicsToAvoid: "",
    sourceUrls: [],
    extractedContent: "",
  });

  const [settings, setSettings] = useState<ScriptSettingsType>(DEFAULT_SCRIPT_SETTINGS);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [isExtractingUrl, setIsExtractingUrl] = useState(false);
  const [extractedSources, setExtractedSources] = useState<{ url: string; title: string; content: string }[]>([]);

  const [script, setScript] = useState<VideoScript | null>(null);
  const [provider, setProvider] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addKeyPoint = () => {
    setInput((prev) => ({ ...prev, keyPoints: [...prev.keyPoints, ""] }));
  };

  const updateKeyPoint = (index: number, value: string) => {
    setInput((prev) => ({
      ...prev,
      keyPoints: prev.keyPoints.map((kp, i) => (i === index ? value : kp)),
    }));
  };

  const removeKeyPoint = (index: number) => {
    if (input.keyPoints.length <= 1) return;
    setInput((prev) => ({
      ...prev,
      keyPoints: prev.keyPoints.filter((_, i) => i !== index),
    }));
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;

    try {
      new URL(urlInput);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    setIsExtractingUrl(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/script/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to extract content");
      }

      const newSource = {
        url: urlInput,
        title: data.title || urlInput,
        content: data.content
      };

      setExtractedSources((prev) => [...prev, newSource]);
      setInput((prev) => ({
        ...prev,
        sourceUrls: [...(prev.sourceUrls || []), urlInput],
      }));
      setUrlInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract content from URL");
    } finally {
      setIsExtractingUrl(false);
    }
  };

  const removeUrl = (index: number) => {
    setExtractedSources((prev) => prev.filter((_, i) => i !== index));
    setInput((prev) => ({
      ...prev,
      sourceUrls: prev.sourceUrls?.filter((_, i) => i !== index),
    }));
  };

  const handleGenerate = async () => {
    if (!input.topic.trim()) {
      setError("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const keywords = keywordsInput
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const cleanedInput = {
        ...input,
        keyPoints: input.keyPoints.filter((kp) => kp.trim()),
        keywords: keywords.length > 0 ? keywords : undefined,
        brandName: input.brandName?.trim() || undefined,
        brandContext: input.brandContext?.trim() || undefined,
        additionalContext: input.additionalContext?.trim() || undefined,
        topicsToAvoid: input.topicsToAvoid?.trim() || undefined,
        extractedContent: extractedSources
          .map((source) => `--- Source: ${source.title} ---\n${source.content}`)
          .join("\n\n"),
      };

      const res = await fetch("/api/admin/script/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: cleanedInput, settings }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate script");
      }

      setScript(data.script);
      setProvider(data.provider);
      setModel(data.model);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate script");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Video Script Generator</h1>
        <p className="text-sm text-muted-foreground">
          Generate professional video scripts using AI
        </p>
      </div>

      <div className="flex-1 grid grid-cols-[400px_1fr] grid-rows-[minmax(0,1fr)] gap-4 p-4 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4 pr-4">
            <Card>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-sm">Script Content</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Title *</Label>
                  <Input
                    id="topic"
                    value={input.topic}
                    onChange={(e) => setInput((prev) => ({ ...prev, topic: e.target.value }))}
                    placeholder="What is your video about?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Source URLs</Label>
                  <div className="flex gap-2">
                    <Input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/article"
                      onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={handleAddUrl}
                      disabled={isExtractingUrl || !urlInput.trim()}
                    >
                      {isExtractingUrl ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {extractedSources.length > 0 && (
                    <div className="space-y-1">
                      {extractedSources.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1"
                        >
                          <Link className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate flex-1" title={item.url}>
                            {item.title}
                          </span>
                          <Check className="h-3 w-3 text-green-500 shrink-0" />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0"
                            onClick={() => removeUrl(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Add URLs to extract content as source material
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Key Points</Label>
                    <Button variant="ghost" size="sm" className="h-7" onClick={addKeyPoint}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {input.keyPoints.map((kp, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={kp}
                          onChange={(e) => updateKeyPoint(index, e.target.value)}
                          placeholder={`Point ${index + 1}`}
                        />
                        {input.keyPoints.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            onClick={() => removeKeyPoint(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    placeholder="SEO keywords to include"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input
                      id="brandName"
                      value={input.brandName}
                      onChange={(e) => setInput((prev) => ({ ...prev, brandName: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brandContext">Brand Context</Label>
                    <Input
                      id="brandContext"
                      value={input.brandContext}
                      onChange={(e) => setInput((prev) => ({ ...prev, brandContext: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalContext">Additional Context</Label>
                  <Textarea
                    id="additionalContext"
                    value={input.additionalContext}
                    onChange={(e) =>
                      setInput((prev) => ({ ...prev, additionalContext: e.target.value }))
                    }
                    placeholder="Any extra information for the AI..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topicsToAvoid">Topics to Avoid</Label>
                  <Textarea
                    id="topicsToAvoid"
                    value={input.topicsToAvoid}
                    onChange={(e) =>
                      setInput((prev) => ({ ...prev, topicsToAvoid: e.target.value }))
                    }
                    placeholder="Topics or concepts the AI should NOT include in the script..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <ScriptSettings settings={settings} onChange={setSettings} />

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || !input.topic.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Script
                </>
              )}
            </Button>
          </div>
        </ScrollArea>

        <ScriptOutput
          script={script}
          provider={provider}
          model={model}
          isLoading={isGenerating}
          onScriptUpdate={setScript}
          language={settings.language}
        />
      </div>
    </div>
  );
}
