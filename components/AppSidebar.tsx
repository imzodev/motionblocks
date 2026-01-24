"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, FileText, PenTool, Home as HomeIcon, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  defaultCollapsed?: boolean;
}

export function AppSidebar({ defaultCollapsed = false }: AppSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Sync state to cookie whenever it changes
  useEffect(() => {
    document.cookie = `sidebar:state=${isCollapsed}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }, [isCollapsed]);

  // Prevent hydration mismatch by using defaultCollapsed during SSR/initial render
  // but we can't easily avoid the mismatch if we want to use the stored value immediately.
  // The useEffect approach ensures we match hydration then update.

  return (
    <aside 
      className={cn(
        "border-r border-border bg-card/50 backdrop-blur-sm flex flex-col h-full transition-all duration-300 relative",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className={cn("h-16 flex items-center border-b border-border", isCollapsed ? "justify-center" : "justify-between px-4")}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <LayoutDashboard className="w-6 h-6 text-primary flex-shrink-0" />
            <h1 className="text-xl font-black tracking-tight whitespace-nowrap">
              MotionBlocks
            </h1>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-2">
         <Link href="/" passHref>
          <Button 
            variant={pathname === "/" ? "secondary" : "ghost"} 
            className={cn("w-full justify-start font-medium mb-1", isCollapsed ? "justify-center px-2" : "px-4")}
            title="Projects"
          >
            <HomeIcon className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && "Projects"}
          </Button>
         </Link>
         <Link href="/tools/script" passHref>
          <Button 
            variant={pathname.startsWith("/tools/script") ? "secondary" : "ghost"} 
            className={cn("w-full justify-start font-medium mb-1", isCollapsed ? "justify-center px-2" : "px-4")}
            title="Script Generator"
          >
            <FileText className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && "Script Generator"}
          </Button>
         </Link>
         <Link href="/editor/assets" passHref>
          <Button 
            variant={pathname.startsWith("/editor/assets") ? "secondary" : "ghost"} 
            className={cn("w-full justify-start font-medium mb-1", isCollapsed ? "justify-center px-2" : "px-4")}
            title="Assets Editor"
          >
            <PenTool className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && "Assets Editor"}
          </Button>
         </Link>
      </nav>
    </aside>
  );
}
