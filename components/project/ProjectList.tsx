import React from "react";
import { ProjectListItem } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Trash2, Copy, Calendar } from "lucide-react";

interface ProjectListProps {
  projects: ProjectListItem[];
  onLoadProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (id: string) => void;
  selectedId?: string;
}

export function ProjectList({
  projects,
  onLoadProject,
  onDeleteProject,
  onDuplicateProject,
  selectedId,
}: ProjectListProps) {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Create your first project to start building amazing animations
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {projects.map((project) => (
        <Card
          key={project.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedId === project.id ? "ring-2 ring-primary" : ""
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{project.name}</CardTitle>
                {project.description && (
                  <CardDescription className="text-xs mt-1 line-clamp-2">
                    {project.description}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateProject(project.id);
                  }}
                  title="Duplicate project"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatDate(project.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>{project.trackCount} tracks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{project.assetCount} assets</span>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] font-normal">
                v{project.version}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
