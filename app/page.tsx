"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { AssetsPanel } from "@/components/AssetsPanel";
import { AssetLibrary } from "@/components/AssetLibrary";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { SequenceList } from "@/components/SequenceList";
import { DetailsPanel } from "@/components/DetailsPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Canvas3D } from "@/components/Canvas3D";
import { Renderer3D, TEMPLATE_REGISTRY } from "@/components/Renderer3D";
import { ProjectManager } from "@/components/project/ProjectManager";
import { SaveStatusIndicator } from "@/components/project/SaveStatusIndicator";
import { projectService, initializeProjectService } from "@/lib/services/project-service.factory";
import { useProjectStore, useUIStore, useTimelineStore } from "@/lib/stores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import type { Asset, Track } from "@/types/timeline";
import type { TemplateSlot } from "@/types/template";
import { Box, Layers, Play, Pause, Save, Sparkles, Clock, Maximize2, Minimize2, FolderOpen, X } from "lucide-react";

export default function Home() {
  // Zustand stores
  const {
    project,
    setProject,
    updateSettings,
    addAssets,
    addTrack,
    updateTrack,
    removeTrack,
    reorderTracks,
    forceSave,
  } = useProjectStore();

  const {
    showProjectManager,
    setShowProjectManager,
  } = useUIStore();

  const {
    isPlaying,
    currentFrame,
    totalFrames,
    selectedAssetId,
    selectedTrackId,
    setIsPlaying,
    setCurrentFrame,
    incrementFrame,
    setTotalFrames,
    setSelectedAssetId,
    setSelectedTrackId,
    play,
    pause,
    togglePlay,
    seekToFrame,
  } = useTimelineStore();

  const previewRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentProjectName, setCurrentProjectName] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Get assets and tracks from project
  const assets = project?.assets || [];
  const tracks = project?.tracks || [];
  
  // Global font settings
  const globalFontUrl = project?.settings.globalFontUrl || "";
  const globalFontPreset = project?.settings.globalFontPreset || "custom";

  // Computed total duration
  const totalDuration = useMemo(() => tracks.reduce((acc, t) => acc + t.duration, 0), [tracks]);

  // Initialize project service on mount
  useEffect(() => {
    const init = async () => {
      await initializeProjectService();
      setIsInitialized(true);
    };
    init();
  }, []);

  // Load current project state
  useEffect(() => {
    const loadProject = async () => {
      const current = projectService.getCurrent();
      if (current) {
        setProject(current);
        setCurrentProjectName(current.metadata.name);
        setTotalFrames(current.tracks.reduce((acc, t) => acc + t.duration, 0));
      } else {
        setCurrentProjectName("");
      }
    };

    if (isInitialized) {
      loadProject();
    }
  }, [showProjectManager, isInitialized, setProject, setTotalFrames]);

  // Playback Loop
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying && totalDuration > 0) {
      interval = setInterval(() => {
        const next = currentFrame + 1;
        if (next >= totalDuration) {
          pause();
          setCurrentFrame(Math.max(0, totalDuration - 1));
        } else {
          incrementFrame();
        }
      }, 1000 / 30);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalDuration, currentFrame, pause, incrementFrame, setCurrentFrame]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFsChange);
    onFsChange();
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    let currentProject = project || projectService.getCurrent();

    if (!currentProject) {
      const newProject = await projectService.create({
        name: "Untitled Project",
        description: "",
        settings: {},
      });
      setProject(newProject);
      setCurrentProjectName(newProject.metadata.name);
      currentProject = newProject;
    }

    try {
      const uploadedAssets: Asset[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.set("file", file);

        const res = await fetch(`/api/assets/upload?projectId=${encodeURIComponent(currentProject.metadata.id)}`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) {
          throw new Error(`Upload failed (${res.status})`);
        }

        const json = (await res.json()) as { asset: Asset };
        uploadedAssets.push(json.asset);
      }

      addAssets(uploadedAssets);
    } catch (error) {
      console.error("Asset upload failed:", error);
    }
  }, [addAssets, project, setProject, setCurrentProjectName]);

  const addTemplateToSequence = useCallback(async (templateId: string) => {
    // If no project exists, create a default one
    let currentProject = project || await projectService.getCurrent();
    
    if (!currentProject) {
      const newProject = await projectService.create({
        name: "Untitled Project",
        description: "",
        settings: {},
      });
      setProject(newProject);
      setCurrentProjectName(newProject.metadata.name);
      currentProject = newProject;
    }
    
    const startFrame = currentProject.tracks.reduce((acc, t) => acc + t.duration, 0);
    const newTrack: Track = {
      id: Math.random().toString(36).substr(2, 9),
      assetId: "", 
      template: templateId,
      startFrame: startFrame,
      duration: templateId === "timeline-reveal" ? 240 : 60,
      position: { x: 0, y: 0 },
      templateProps: {},
    };
    
    addTrack(newTrack);
    
    // Force save to ensure persistence
    await forceSave();
  }, [project, setProject, addTrack, forceSave, setCurrentProjectName]);

  const handleUpdateTrack = useCallback((updatedTrack: Track) => {
    updateTrack(updatedTrack.id, updatedTrack);
    void forceSave();
  }, [updateTrack, forceSave]);

  const handleReorderTracks = useCallback((newOrder: Track[]) => {
    reorderTracks(newOrder);
  }, [reorderTracks]);

  const handleCameraSave = useCallback((pos: [number, number, number], target: [number, number, number]) => {
    if (selectedTrackId) {
      const track = (project?.tracks || []).find(t => t.id === selectedTrackId);
      if (track) {
        updateTrack(track.id, {
          ...track,
          templateProps: {
            ...track.templateProps,
            cameraPosition: pos,
            cameraTarget: target,
          }
        });
      }
    }
  }, [selectedTrackId, project?.tracks, updateTrack]);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId);
  const activeTrack = useMemo(() => {
    return tracks.find(t => currentFrame >= t.startFrame && currentFrame < t.startFrame + t.duration);
  }, [tracks, currentFrame]);

  // Save project
  const handleSaveProject = useCallback(async () => {
    try {
      await forceSave();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  }, [forceSave]);

  const handleProjectLoaded = useCallback(() => {
    setShowProjectManager(false);
    // Project data will be loaded via useEffect
  }, []);

  return (
    <>
      {/* Project Manager Overlay */}
      {showProjectManager && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="h-full max-w-2xl mx-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-black tracking-tight">MotionBlocks</h1>
                <p className="text-muted-foreground mt-1">Create, manage, and edit your animation projects</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProjectManager(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ProjectManager
              projectService={projectService}
              onProjectLoaded={handleProjectLoaded}
            />
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowProjectManager(true)}
                  title="Open Project Manager"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
                <ThemeToggle />
              </div>
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
                        const bgEnabled = currentTrack?.templateProps?.backgroundEnabled === true;
                        const backgroundSlot = bgEnabled
                          ? template?.slots.find((s: TemplateSlot) => s.type === "file" && s.id === "background")
                          : undefined;
                        const fileSlot =
                          backgroundSlot ?? template?.slots.find((s: TemplateSlot) => s.type === "file");
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

                <Separator className="opacity-50" />

                <section className="space-y-3">
                  <h2 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Global</h2>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Font preset</label>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      value={globalFontPreset}
                      onChange={(e) => {
                        const next = e.target.value;
                        updateSettings({ globalFontPreset: next });
                        if (next === "custom") return;
                        if (next === "") {
                          updateSettings({ globalFontUrl: "" });
                          return;
                        }
                        updateSettings({ globalFontUrl: next });
                      }}
                    >
                      <option value="">Default</option>
                      <option value="custom">Custom URL…</option>
                      <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/bebasneue/BebasNeue-Regular.ttf">Bebas Neue</option>
                      <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/bangers/Bangers-Regular.ttf">Bangers</option>
                      <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/lobster/Lobster-Regular.ttf">Lobster</option>
                      <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/pacifico/Pacifico-Regular.ttf">Pacifico</option>
                      <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/orbitron/Orbitron%5Bwght%5D.ttf">Orbitron</option>
                      <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/PressStart2P-Regular.ttf">Press Start 2P</option>
                      <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf">Anton</option>
                      <option value="https://raw.githubusercontent.com/google/fonts/main/ofl/abrilfatface/AbrilFatface-Regular.ttf">Abril Fatface</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Font URL</label>
                    <Input
                      value={globalFontUrl}
                      placeholder="https://.../font.woff"
                      onChange={(e) => updateSettings({ globalFontUrl: e.target.value })}
                      disabled={globalFontPreset !== "custom"}
                    />
                  </div>
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
              {currentProjectName && (
                <div className="flex flex-col text-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Project</span>
                  <span className="text-sm font-bold truncate max-w-[200px]">{currentProjectName}</span>
                </div>
              )}
              <div className="flex flex-col text-center">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Status</span>
                <Badge variant={isPlaying ? "default" : "secondary"} className="text-[9px] h-4 font-black">
                  {isPlaying ? "RENDERING" : "READY"}
                </Badge>
              </div>
              <SaveStatusIndicator />
            </div>
            
            <div className="flex gap-3 pointer-events-auto">
              <Button
                size="icon-lg"
                variant="outline"
                className="rounded-full bg-card/40 text-foreground border-border/60 backdrop-blur-xl shadow-2xl hover:bg-card transition-all dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black"
                onClick={async () => {
                  if (document.fullscreenElement) {
                    await document.exitFullscreen();
                    return;
                  }

                  const el = previewRef.current;
                  if (!el) return;
                  await el.requestFullscreen();
                }}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>

              <Button
                size="lg"
                variant={isPlaying ? "destructive" : "default"}
                onClick={() => {
                  if (isPlaying) {
                    pause();
                    return;
                  }

                  if (totalDuration > 0 && currentFrame >= totalDuration - 1) {
                    seekToFrame(0);
                  }
                  play();
                }}
                className="rounded-full shadow-2xl font-black px-10 tracking-widest transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />} 
                {isPlaying ? "STOP" : "PREVIEW"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full bg-card/40 text-foreground border-border/60 backdrop-blur-xl shadow-2xl font-black px-10 tracking-widest hover:bg-card transition-all dark:bg-white/5 dark:text-white dark:border-white/10 dark:hover:bg-white dark:hover:text-black"
                onClick={handleSaveProject}
              >
                <Save className="w-4 h-4 mr-2" /> SAVE
              </Button>
            </div>
          </header>

          <div className="flex-1 flex items-center justify-center p-12">
            <div
              ref={previewRef}
              className="aspect-video w-full max-w-5xl bg-card shadow-[0_0_120px_rgba(0,0,0,0.18)] ring-1 ring-border relative overflow-hidden rounded-2xl border border-border"
            >
              <Canvas3D onCameraSave={handleCameraSave}>
                <Renderer3D 
                  activeTrack={activeTrack} 
                  currentFrame={currentFrame} 
                  assets={assets} 
                  globalFontUrl={globalFontUrl.trim().length > 0 ? globalFontUrl.trim() : undefined}
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
                seekToFrame(val);
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
                    onDelete={(id) => removeTrack(id)}
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
    </>
  );
}
