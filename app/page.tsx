"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProjectManager } from "@/components/project/ProjectManager";
import { projectService, initializeProjectService } from "@/lib/services/project-service.factory";
import { AppSidebar } from "@/components/AppSidebar";

export default function Home() {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      await initializeProjectService();
      setIsInitialized(true);
    };
    init();
  }, []);

  const handleProjectLoaded = (id: string) => {
    router.push("/editor/assets");
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        {isInitialized ? (
           <ProjectManager
             projectService={projectService}
             onProjectLoaded={handleProjectLoaded}
           />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}
