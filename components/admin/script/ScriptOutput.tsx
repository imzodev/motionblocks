"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Copy, Download, Clock, Sparkles, Pencil, Loader2, X, Film, SplitSquareHorizontal } from "lucide-react";
import type { VideoScript, VideoVisualPlan } from "@/lib/admin/script-types";
import { VisualPlanDisplay } from "./VisualPlanDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScriptOutputProps {
  script: VideoScript | null;
  provider?: string;
  model?: string;
  isLoading?: boolean;
  onScriptUpdate?: (script: VideoScript) => void;
  language?: string;
}

interface EditState {
  isOpen: boolean;
  sectionType: "hook" | "section" | "cta" | null;
  sectionIndex?: number;
  instruction: string;
  isLoading: boolean;
}

export function ScriptOutput({
  script,
  provider,
  model,
  isLoading,
  onScriptUpdate,
  language,
}: ScriptOutputProps) {
  const [editState, setEditState] = useState<EditState>({
    isOpen: false,
    sectionType: null,
    instruction: "",
    isLoading: false,
  });
  
  const [visualPlan, setVisualPlan] = useState<VideoVisualPlan | null>(null);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
  const [activeTab, setActiveTab] = useState<"script" | "visuals">("script");

  const openEdit = (sectionType: "hook" | "section" | "cta", sectionIndex?: number) => {
    setEditState({
      isOpen: true,
      sectionType,
      sectionIndex,
      instruction: "",
      isLoading: false,
    });
  };

  const closeEdit = () => {
    setEditState({
      isOpen: false,
      sectionType: null,
      instruction: "",
      isLoading: false,
    });
  };

  const handleEdit = async () => {
    if (!script || !editState.instruction.trim() || !onScriptUpdate) return;

    setEditState((prev) => ({ ...prev, isLoading: true }));

    try {
      const res = await fetch("/api/admin/script/edit-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          sectionType: editState.sectionType,
          sectionIndex: editState.sectionIndex,
          editInstruction: editState.instruction,
          language,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to edit section");
      }

      const updatedScript = { ...script };
      if (editState.sectionType === "hook") {
        updatedScript.hook = data.editedContent;
      } else if (editState.sectionType === "section" && editState.sectionIndex !== undefined) {
        updatedScript.sections = [...script.sections];
        updatedScript.sections[editState.sectionIndex] = {
          ...updatedScript.sections[editState.sectionIndex],
          narration: data.editedContent,
        };
      } else if (editState.sectionType === "cta") {
        updatedScript.cta = data.editedContent;
      }

      onScriptUpdate(updatedScript);
      closeEdit();
    } catch (error) {
      console.error("Edit error:", error);
    } finally {
      setEditState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleGenerateVisuals = async () => {
    if (!script) return;

    setIsGeneratingVisuals(true);
    try {
      const res = await fetch("/api/admin/script/generate-broll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setVisualPlan(data.plan);
      setActiveTab("visuals");
    } catch (error) {
      console.error("Failed to generate visuals:", error);
    } finally {
      setIsGeneratingVisuals(false);
    }
  };

  const copyToClipboard = () => {
    if (!script) return;

    const text = formatScriptAsText(script);
    navigator.clipboard.writeText(text);
  };

  const downloadScript = () => {
    if (!script) return;

    const text = formatScriptAsText(script);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${script.title.replace(/[^a-z0-9]/gi, "_")}_script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-primary animate-pulse" />
            <p className="text-muted-foreground">Generating your script...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!script) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center space-y-2">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Your generated script will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "script" | "visuals")} className="h-full flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2 px-1 shrink-0">
          <TabsList>
            <TabsTrigger value="script" className="flex items-center gap-2">
              <SplitSquareHorizontal className="h-4 w-4" />
              Script
            </TabsTrigger>
            <TabsTrigger value="visuals" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Visual Plan
              {visualPlan && <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">Ready</Badge>}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            {activeTab === "script" && (
              <>
                <Button variant="outline" size="sm" onClick={handleGenerateVisuals} disabled={isGeneratingVisuals}>
                  {isGeneratingVisuals ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                      Planning Visuals...
                    </>
                  ) : (
                    <>
                      <Film className="h-3.5 w-3.5 mr-2" />
                      Generate B-Roll Plan
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadScript}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </>
            )}
          </div>
        </div>

        <TabsContent value="script" className="flex-1 mt-0 min-h-0">
          <Card className="h-full flex flex-col min-h-0">
            <CardHeader className="py-3 px-4 border-b shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{script.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {script.estimatedDuration}
                    </Badge>
                    {provider && model && (
                      <Badge variant="secondary" className="text-xs">
                        {provider}/{model}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="h-full min-h-0">
              <CardContent className="p-4 space-y-6">
                <div className="group relative bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-primary">🎬 Hook</h3>
                    {onScriptUpdate && (
                      <Popover
                        open={editState.isOpen && editState.sectionType === "hook"}
                        onOpenChange={(open) => !open && closeEdit()}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => openEdit("hook")}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">Edit Hook</h4>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={closeEdit}>
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <Textarea
                              placeholder="Describe what to change..."
                              value={editState.instruction}
                              onChange={(e) => setEditState((prev) => ({ ...prev, instruction: e.target.value }))}
                              rows={3}
                              className="text-sm"
                            />
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={handleEdit}
                              disabled={editState.isLoading || !editState.instruction.trim()}
                            >
                              {editState.isLoading ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                  Editing...
                                </>
                              ) : (
                                "Apply Edit"
                              )}
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  <p className="text-sm">{script.hook}</p>
                </div>

                {script.sections.map((section, index) => (
                  <div key={index} className="group relative border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {section.timestamp && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {section.timestamp}
                          </Badge>
                        )}
                        <h4 className="font-semibold">{section.sectionTitle}</h4>
                      </div>
                      {onScriptUpdate && (
                        <Popover
                          open={editState.isOpen && editState.sectionType === "section" && editState.sectionIndex === index}
                          onOpenChange={(open) => !open && closeEdit()}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => openEdit("section", index)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80" align="end">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">Edit Section</h4>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={closeEdit}>
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <Textarea
                                placeholder="Describe what to change..."
                                value={editState.instruction}
                                onChange={(e) => setEditState((prev) => ({ ...prev, instruction: e.target.value }))}
                                rows={3}
                                className="text-sm"
                              />
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={handleEdit}
                                disabled={editState.isLoading || !editState.instruction.trim()}
                              >
                                {editState.isLoading ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                    Editing...
                                  </>
                                ) : (
                                  "Apply Edit"
                                )}
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{section.narration}</p>
                    {section.visualNotes && (
                      <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-3">
                        📹 {section.visualNotes}
                      </p>
                    )}
                  </div>
                ))}

                {script.cta && (
                  <div className="group relative bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-green-600 dark:text-green-400">
                        📢 Call to Action
                      </h3>
                      {onScriptUpdate && (
                        <Popover
                          open={editState.isOpen && editState.sectionType === "cta"}
                          onOpenChange={(open) => !open && closeEdit()}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => openEdit("cta")}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80" align="end">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">Edit CTA</h4>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={closeEdit}>
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                              <Textarea
                                placeholder="Describe what to change..."
                                value={editState.instruction}
                                onChange={(e) => setEditState((prev) => ({ ...prev, instruction: e.target.value }))}
                                rows={3}
                                className="text-sm"
                              />
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={handleEdit}
                                disabled={editState.isLoading || !editState.instruction.trim()}
                              >
                                {editState.isLoading ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                    Editing...
                                  </>
                                ) : (
                                  "Apply Edit"
                                )}
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                    <p className="text-sm">{script.cta}</p>
                  </div>
                )}

                {script.bRollSuggestions && script.bRollSuggestions.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold mb-2">🎥 B-Roll Suggestions (General)</h3>
                    <ul className="text-sm space-y-1">
                      {script.bRollSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </TabsContent>

        <TabsContent value="visuals" className="flex-1 mt-0 min-h-0">
          {visualPlan ? (
            <VisualPlanDisplay plan={visualPlan} />
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Film className="h-8 w-8 text-primary" />
                </div>
                <div className="max-w-xs space-y-2">
                  <h3 className="text-lg font-medium">No Visual Plan Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate a detailed B-Roll plan to break down your script into visual segments.
                  </p>
                </div>
                <Button onClick={handleGenerateVisuals} disabled={isGeneratingVisuals}>
                  {isGeneratingVisuals ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Visual Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatScriptAsText(script: VideoScript): string {
  let text = `# ${script.title}\n`;
  text += `Duration: ${script.estimatedDuration}\n\n`;

  text += `## HOOK\n${script.hook}\n\n`;

  script.sections.forEach((section, index) => {
    text += `## ${section.sectionTitle}`;
    if (section.timestamp) text += ` [${section.timestamp}]`;
    text += `\n${section.narration}\n`;
    if (section.visualNotes) text += `[Visual: ${section.visualNotes}]\n`;
    text += "\n";
  });

  if (script.cta) {
    text += `## CALL TO ACTION\n${script.cta}\n\n`;
  }

  if (script.bRollSuggestions && script.bRollSuggestions.length > 0) {
    text += `## B-ROLL SUGGESTIONS\n`;
    script.bRollSuggestions.forEach((s) => {
      text += `- ${s}\n`;
    });
  }

  return text;
}
