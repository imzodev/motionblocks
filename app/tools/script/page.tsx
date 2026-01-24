"use client";

import { ScriptGenerator } from "@/components/admin/script";
import { AppSidebar } from "@/components/AppSidebar";

export default function ScriptGeneratorPage() {
  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden">
       <ScriptGenerator />
    </div>
  );
}
