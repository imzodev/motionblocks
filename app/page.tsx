"use client";

import React, { useState, useEffect } from "react";
import { AssetsPanel } from "@/components/AssetsPanel";
import { AssetLibrary } from "@/components/AssetLibrary";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { SequenceList } from "@/components/SequenceList";
import { DetailsPanel } from "@/components/DetailsPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Canvas3D } from "@/components/Canvas3D";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Asset, Track } from "@/types/timeline";
import type { AnimationTemplate, TemplateSlot } from "@/types/template";
import { Box, Layers, Play, Pause, Save, Sparkles } from "lucide-react";

// Templates Registry
import { FadeInTemplate, SlideTemplate, ScalePopTemplate, MaskRevealTemplate } from "@/templates/entry";
import { PulseTemplate, GlowTemplate, BounceTemplate, ShakeTemplate } from "@/templates/emphasis";
import { CounterTemplate, TimelineRevealTemplate } from "@/templates/data";
import { MindMapTemplate, GraphTemplate } from "@/templates/visual";

const TEMPLATE_REGISTRY: Record<string, AnimationTemplate> = {
  "fade-in": FadeInTemplate,
  "slide-in": SlideTemplate,
  "scale-pop": ScalePopTemplate,
  "mask-reveal": MaskRevealTemplate,
  pulse: PulseTemplate,
  glow: GlowTemplate,
  bounce: BounceTemplate,
  shake: ShakeTemplate,
  counter: CounterTemplate,
  "timeline-reveal": TimelineRevealTemplate,
  "mind-map": MindMapTemplate,
  graph: GraphTemplate,
};

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>();
  const [selectedTrackId, setSelectedTrackId] = useState<string>();
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Playback Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          const totalDuration = tracks.reduce((acc, t) => acc + t.duration, 0);
          if (totalDuration === 0) return 0;
          if (prev >= totalDuration) return 0;
          return prev + 1;
        });
      }, 1000 / 30);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, tracks]);

  const handleFileUpload = (files: File[]) => {
    const newAssets: Asset[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      type: file.type.includes("svg") ? "svg" : "image",
      src: URL.createObjectURL(file),
    }));
    setAssets((prev) => [...prev, ...newAssets]);
  };

  const addTemplateToSequence = (templateId: string) => {
    const startFrame = tracks.reduce((acc, t) => acc + t.duration, 0);
    
    const newTrack: Track = {
      id: Math.random().toString(36).substr(2, 9),
      assetId: "", 
      template: templateId,
      startFrame: startFrame,
      duration: 30,
      position: { x: 540, y: 960 },
      templateProps: {},
    };
    
    setTracks((prev) => [...prev, newTrack]);
    setSelectedTrackId(newTrack.id);
  };

  const handleUpdateTrack = (updatedTrack: Track) => {
    setTracks((prev) => prev.map((t) => (t.id === updatedTrack.id ? updatedTrack : t)));
  };

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const activeTrack = tracks.find(t => currentFrame >= t.startFrame && currentFrame < t.startFrame + t.duration);

  const resolveAssetById = (id: string) => assets.find((a) => a.id === id);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Left Sidebar: Assets & Templates */}
      <aside className="w-80 border-r border-border bg-background flex flex-col">
        <Card className="h-full rounded-none border-0 bg-card/85 backdrop-blur-sm">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Assets</CardTitle>
              </div>
              <ThemeToggle />
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-72px)]">
              <div className="p-4 space-y-6">
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Templates
                  </h2>
                  <TemplatesPanel onSelect={addTemplateToSequence} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Uploads</h2>
                  <AssetsPanel onUpload={handleFileUpload} />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Library</h2>
                  <AssetLibrary
                    assets={assets}
                    onSelect={(a) => {
                      setSelectedAssetId(a.id);
                      if (selectedTrackId) {
                        // Find the first empty "file" slot for this template and assign it
                        const currentTrack = tracks.find((t) => t.id === selectedTrackId);
                        const template = TEMPLATE_REGISTRY[currentTrack?.template || ""];
                        const fileSlot = template?.slots.find((s: TemplateSlot) => s.type === "file");
                        if (fileSlot) {
                          handleUpdateTrack({
                            ...currentTrack!,
                            templateProps: { ...currentTrack!.templateProps, [fileSlot.id]: a.id },
                          });
                        }
                      }
                    }}
                    selectedId={selectedAssetId}
                  />
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>

      {/* Center: Canvas Preview */}
      <main className="flex-1 flex flex-col relative bg-background">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <div className="bg-card/70 text-foreground backdrop-blur px-3 py-1.5 rounded-full border border-border/70 flex items-center gap-4 shadow-sm">
            <span className="text-xs font-mono text-muted-foreground">Frame {currentFrame} • 30fps</span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-full shadow-sm"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />} 
              {isPlaying ? "Stop" : "Preview"}
            </Button>
            <Button
              variant="outline"
              className="rounded-full bg-card shadow-sm"
            >
              <Save className="w-4 h-4" /> Export
            </Button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-12">
          {/* 3D Canvas Environment */}
          <div className="aspect-video w-full max-w-4xl bg-card shadow-2xl ring-1 ring-border relative overflow-hidden rounded-lg">
            <Canvas3D>
              {/* Active Animation Layer */}
              {activeTrack && (
                <group>
                  {/* For now, we render a placeholder 3D object to show the canvas is active */}
                  <mesh position={[0, 0, 0]} castShadow receiveShadow>
                    <boxGeometry args={[100, 100, 100]} />
                    <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.8} />
                  </mesh>
                </group>
              )}
            </Canvas3D>

            {/* 2D Overlay for Current HTML Logic */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {activeTrack ? (
                <div className="text-foreground text-center bg-background/10 backdrop-blur-sm p-8 rounded-2xl border border-white/5 shadow-2xl pointer-events-auto">
                   <p className="text-[10px] uppercase font-bold text-primary mb-4 tracking-[0.3em]">Live Rendering: {activeTrack.template}</p>
                   <div className="w-full max-w-2xl mx-auto">
                      {(() => {
                        const template = TEMPLATE_REGISTRY[activeTrack.template];
                        const props = (activeTrack.templateProps ?? {}) as Record<string, unknown>;

                        if (!template) {
                          return (
                            <p className="text-sm text-muted-foreground italic">
                              No template registered for this block.
                            </p>
                          );
                        }

                        if (!template.slots || template.slots.length === 0) {
                          return (
                            <p className="text-sm text-muted-foreground italic">
                              This template has no active slots.
                            </p>
                          );
                        }

                        return (
                          <div className="space-y-6">
                            {template.slots.map((slot) => {
                              const value = props[slot.id];

                              if (slot.type === "file") {
                                const assetId = typeof value === "string" ? value : "";
                                const asset = assetId ? resolveAssetById(assetId) : undefined;

                                if (!asset) {
                                  return (
                                    <div key={slot.id} className="text-xs text-muted-foreground bg-muted/20 px-3 py-2 rounded border border-dashed border-border/50">
                                      {slot.name}: <span className="italic opacity-50">(unassigned)</span>
                                    </div>
                                  );
                                }

                                if ((asset.type === "image" || asset.type === "svg") && asset.src) {
                                  return (
                                    <div key={slot.id} className="space-y-3">
                                      <img
                                        src={asset.src}
                                        alt={slot.name}
                                        className="max-h-[280px] w-auto mx-auto object-contain drop-shadow-2xl"
                                      />
                                    </div>
                                  );
                                }

                                if (asset.type === "text") {
                                  return (
                                    <div key={slot.id} className="space-y-2">
                                      <p className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">
                                        {asset.content || "Text"}
                                      </p>
                                    </div>
                                  );
                                }

                                return (
                                  <div key={slot.id} className="text-xs font-mono text-muted-foreground">
                                    {slot.name}: {asset.id}
                                  </div>
                                );
                              }

                              if (slot.type === "text") {
                                return (
                                  <div key={slot.id} className="space-y-2">
                                    <p className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-white/50">
                                      {typeof value === "string" && value.trim().length > 0 ? value : "—"}
                                    </p>
                                  </div>
                                );
                              }

                              if (slot.type === "data-table") {
                                return (
                                  <div key={slot.id} className="space-y-2">
                                    <pre className="text-[10px] font-mono text-primary/80 bg-black/40 backdrop-blur border border-white/5 p-4 rounded-xl text-left inline-block mx-auto">
                                      {typeof value === "string" ? value : ""}
                                    </pre>
                                  </div>
                                );
                              }

                              return null;
                            })}
                          </div>
                        );
                      })()}
                   </div>
                </div>
              ) : (
                <p className="text-muted-foreground/30 font-mono tracking-[0.4em] text-[10px] uppercase">
                  {tracks.length > 0 ? "System Ready" : "Select a template to initialize"}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Sequence & Details */}
      <aside className="w-80 border-l border-border bg-background flex flex-col">
        <Card className="h-full rounded-none border-0 bg-card/85 backdrop-blur-sm">
          <CardHeader className="py-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Sequence</CardTitle>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-72px)]">
              <div className="p-4 space-y-6">
                <div className="space-y-3">
                  <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Blocks</h2>
                  <SequenceList
                    tracks={tracks}
                    onReorder={setTracks}
                    onSelect={(t) => setSelectedTrackId(t.id)}
                    onDelete={(id) => setTracks((prev) => prev.filter((t) => t.id !== id))}
                    selectedId={selectedTrackId}
                  />
                </div>

                <Separator />

                <DetailsPanel
                  selectedTrack={selectedTrack}
                  template={selectedTrack ? TEMPLATE_REGISTRY[selectedTrack.template] : undefined}
                  assets={assets}
                  onUpdateTrack={handleUpdateTrack}
                />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}