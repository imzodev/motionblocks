"use client";

import React, { useState } from "react";
import { AssetsPanel } from "@/components/AssetsPanel";
import { AssetLibrary } from "@/components/AssetLibrary";
import { TemplatesPanel } from "@/components/TemplatesPanel";
import { SequenceList } from "@/components/SequenceList";
import { DetailsPanel } from "@/components/DetailsPanel";
import type { Asset, Track } from "@/types/timeline";
import { Box, Layers, Play, Save, Sparkles } from "lucide-react";

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>();
  const [selectedTrackId, setSelectedTrackId] = useState<string>();

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
      assetId: "", // Empty slot initially
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

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Left Sidebar: Assets & Templates */}
      <aside className="w-80 border-r bg-muted/20 flex flex-col">
        <header className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-primary" />
            <h1 className="font-bold tracking-tight">Assets</h1>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> Templates
            </h2>
            <TemplatesPanel onSelect={addTemplateToSequence} />
          </div>

          <div className="space-y-3 pt-6 border-t">
            <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Uploads</h2>
            <AssetsPanel onUpload={handleFileUpload} />
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Library</h2>
            <AssetLibrary 
              assets={assets} 
              onSelect={(a) => {
                setSelectedAssetId(a.id);
                if (selectedTrackId) {
                  handleUpdateTrack({ ...selectedTrack!, assetId: a.id });
                }
              }}
              selectedId={selectedAssetId}
            />
          </div>
        </div>
      </aside>

      {/* Center: Canvas Preview (Placeholder) */}
      <main className="flex-1 flex flex-col relative bg-zinc-950">
        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
          <div className="bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-4">
            <span className="text-xs font-mono text-white/70">1920x1080 • 30fps</span>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
              <Play className="w-4 h-4" /> Preview
            </button>
            <button className="flex items-center gap-2 px-4 py-1.5 bg-white text-black rounded-full text-sm font-bold hover:bg-white/90 transition-colors">
              <Save className="w-4 h-4" /> Export
            </button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-12">
          {/* Mock Canvas Container */}
          <div className="aspect-video w-full max-w-4xl bg-black shadow-2xl ring-1 ring-white/10 flex items-center justify-center relative overflow-hidden">
            <p className="text-white/20 font-mono tracking-[0.2em] text-sm">3D CANVAS PREVIEW</p>
            {/* Logic to render active assets will go here in next tracks */}
          </div>
        </div>
      </main>

      {/* Right Sidebar: Sequence & Details */}
      <aside className="w-80 border-l bg-muted/20 flex flex-col">
        <header className="p-4 border-b flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <h1 className="font-bold tracking-tight">Sequence</h1>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Blocks</h2>
            <SequenceList 
              tracks={tracks} 
              onReorder={setTracks}
              onSelect={(t) => setSelectedTrackId(t.id)}
              onDelete={(id) => setTracks(prev => prev.filter(t => t.id !== id))}
              selectedId={selectedTrackId}
            />
          </div>

          <DetailsPanel 
            selectedTrack={selectedTrack} 
            assets={assets}
            onUpdateTrack={handleUpdateTrack}
          />
        </div>
      </aside>
    </div>
  );
}
