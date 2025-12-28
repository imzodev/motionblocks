"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AssetsPanel } from "@/components/AssetsPanel";
import { AssetLibrary } from "@/components/AssetLibrary";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { SequenceList } from "@/components/SequenceList";
import { DetailsPanel } from "@/components/DetailsPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Canvas3D } from "@/components/Canvas3D";
import { Renderer3D, TEMPLATE_REGISTRY } from "@/components/Renderer3D";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import type { Asset, Track } from "@/types/timeline";
import type { TemplateSlot } from "@/types/template";
import { Box, Layers, Play, Pause, Save, Sparkles, Clock } from "lucide-react";

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>();
  const [selectedTrackId, setSelectedTrackId] = useState<string>();
  
  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Computed total duration
  const totalDuration = useMemo(() => tracks.reduce((acc, t) => acc + t.duration, 0), [tracks]);

  // Playback Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying && totalDuration > 0) {
      interval = setInterval(() => {
        setCurrentFrame((prev) => {
          const next = prev + 1;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 1000 / 30);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalDuration]);

  const handleFileUpload = (files: File[]) => {
    const newAssets: Asset[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      type: file.type.includes("svg") ? "svg" : "image",
      src: URL.createObjectURL(file),
    }));
    setAssets((prev) => [...prev, ...newAssets]);
  };

  const addTemplateToSequence = (templateId: string) => {
    setTracks((prev) => {
      const startFrame = prev.reduce((acc, t) => acc + t.duration, 0);
      const newTrack: Track = {
        id: Math.random().toString(36).substr(2, 9),
        assetId: "", 
        template: templateId,
        startFrame: startFrame,
        duration: templateId === "timeline-reveal" ? 240 : 60,
        position: { x: 0, y: 0 },
        templateProps: {},
      };
      return [...prev, newTrack];
    });
  };

  const handleUpdateTrack = (updatedTrack: Track) => {
    setTracks((prev) => {
      const newTracks = prev.map((t) => (t.id === updatedTrack.id ? updatedTrack : t));
      let currentStart = 0;
      return newTracks.map(t => {
        const tWithUpdatedStart = { ...t, startFrame: currentStart };
        currentStart += t.duration;
        return tWithUpdatedStart;
      });
    });
  };

  const handleReorderTracks = (newOrder: Track[]) => {
    let currentStart = 0;
    const sequenced = newOrder.map(t => {
      const tWithUpdatedStart = { ...t, startFrame: currentStart };
      currentStart += t.duration;
      return tWithUpdatedStart;
    });
    setTracks(sequenced);
  };

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const activeTrack = useMemo(() => {
    return tracks.find(t => currentFrame >= t.startFrame && currentFrame < t.startFrame + t.duration);
  }, [tracks, currentFrame]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Left Sidebar */}
      <aside className="w-80 border-r border-border bg-background flex flex-col">
        <Card className="h-full rounded-none border-0 bg-card/50 backdrop-blur-sm flex flex-col">
          <CardHeader className="py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-primary" />
                <CardTitle className="text-base font-black uppercase">Assets</CardTitle>
              </div>
              <ThemeToggle />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-8">
                <section className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> Recipes
                  </h2>
                  <TemplatesPanel onSelect={addTemplateToSequence} />
                </section>
                <Separator className="opacity-50" />
                <section className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Uploader</h2>
                  <AssetsPanel onUpload={handleFileUpload} />
                </section>
                <section className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Collection</h2>
                  <AssetLibrary
                    assets={assets}
                    onSelect={(a) => {
                      setSelectedAssetId(a.id);
                      if (selectedTrackId) {
                        const currentTrack = tracks.find(t => t.id === selectedTrackId);
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
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        <main className="flex-1 flex flex-col relative bg-background dark:bg-zinc-950">
          <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 pointer-events-none">
            <div className="bg-card/80 text-foreground backdrop-blur-2xl px-5 py-2.5 rounded-full border border-border/60 flex items-center gap-8 shadow-2xl">
              <div className="flex flex-col text-center">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Status</span>
                <Badge variant={isPlaying ? "default" : "secondary"} className="text-[9px] h-4 font-black">
                  {isPlaying ? "RENDERING" : "READY"}
                </Badge>
              </div>
            </div>
            
            <div className="flex gap-3 pointer-events-auto">
              <Button
                size="lg"
                variant={isPlaying ? "destructive" : "default"}
                onClick={() => setIsPlaying(!isPlaying)}
                className="rounded-full shadow-2xl font-black px-10 tracking-widest transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />} 
                {isPlaying ? "STOP" : "PREVIEW"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full bg-card/40 text-foreground border-border/60 backdrop-blur-xl shadow-2xl font-black px-10 tracking-widest hover:bg-card transition-all dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black"
              >
                <Save className="w-4 h-4 mr-2" /> EXPORT
              </Button>
            </div>
          </header>

          <div className="flex-1 flex items-center justify-center p-12">
            <div className="aspect-video w-full max-w-5xl bg-card shadow-[0_0_120px_rgba(0,0,0,0.18)] ring-1 ring-border relative overflow-hidden rounded-2xl border border-border">
              <Canvas3D>
                <Renderer3D 
                  activeTrack={activeTrack} 
                  currentFrame={currentFrame} 
                  assets={assets} 
                />
              </Canvas3D>

              {!activeTrack && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-background/55 backdrop-blur-[2px] dark:bg-black/40">
                  <div className="text-center space-y-4 opacity-40">
                    <Sparkles className="w-12 h-12 mx-auto text-primary" />
                    <p className="text-foreground font-mono tracking-[0.4em] text-[10px] uppercase font-bold">Waiting for Sequence</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Seek Bar Area */}
        <div className="h-20 border-t border-border bg-background/80 backdrop-blur-md px-8 flex items-center gap-8">
          <div className="flex items-center gap-4 bg-muted/50 px-4 py-2 rounded-lg border">
            <Clock className="w-4 h-4 text-primary" />
            <div className="flex flex-col min-w-[80px]">
              <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Frame</span>
              <span className="text-sm font-mono font-bold">{currentFrame} / {totalDuration}</span>
            </div>
          </div>
          
          <div className="flex-1">
            <Slider
              value={[currentFrame]}
              max={totalDuration > 0 ? totalDuration - 1 : 0}
              step={1}
              onValueChange={([val]) => {
                setIsPlaying(false);
                setCurrentFrame(val);
              }}
              className="py-4"
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="w-80 border-l border-border bg-background flex flex-col">
        <Card className="h-full rounded-none border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="py-4 border-b">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-black uppercase">Sequence</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-8">
                <section className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Timeline</h2>
                  <SequenceList
                    tracks={tracks}
                    onReorder={handleReorderTracks}
                    onSelect={(t) => setSelectedTrackId(t.id)}
                    onDelete={(id) => setTracks((prev) => prev.filter((t) => t.id !== id))}
                    selectedId={selectedTrackId}
                  />
                </section>
                <Separator className="opacity-50" />
                <section className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Properties</h2>
                  <DetailsPanel
                    selectedTrack={selectedTrack}
                    template={selectedTrack ? TEMPLATE_REGISTRY[selectedTrack.template] : undefined}
                    assets={assets}
                    onUpdateTrack={handleUpdateTrack}
                  />
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
