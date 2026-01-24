"use client";

import { ScriptGenerator } from "@/components/admin/script";
import { AppSidebar } from "@/components/AppSidebar";

export default function ScriptGeneratorPage() {
  return (
    <div className="flex h-screen bg-background font-sans">
      <AppSidebar />
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full">
           <ScriptGenerator />
        </div>
      </main>
    </div>
  );
}
