import React, { useState, useEffect, useCallback } from "react";
import { ProjectService } from "@/lib/services/project.service";
import { ProjectListItem } from "@/types/project";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { ProjectList } from "./ProjectList";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from "lucide-react";

interface ProjectManagerProps {
  projectService: ProjectService;
  onProjectLoaded: (projectId: string) => void;
}

export function ProjectManager({ projectService, onProjectLoaded }: ProjectManagerProps) {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load projects
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const allProjects = await projectService.getAll();
      setProjects(allProjects);
      
      // Set selected project if there's a current project
      const current = projectService.getCurrent();
      if (current) {
        setSelectedId(current.metadata.id);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectService]);

  // Initial load
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = useCallback(async () => {
    await loadProjects();
    // The newly created project should be the current one
    const current = projectService.getCurrent();
    if (current) {
      setSelectedId(current.metadata.id);
      onProjectLoaded(current.metadata.id);
    }
  }, [projectService, loadProjects, onProjectLoaded]);

  const handleLoadProject = useCallback(async (id: string) => {
    try {
      await projectService.load(id);
      setSelectedId(id);
      onProjectLoaded(id);
    } catch (error) {
      console.error("Error loading project:", error);
    }
  }, [projectService, onProjectLoaded]);

  const handleDeleteProject = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return;
    }

    try {
      await projectService.delete(id);
      await loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  }, [projectService, loadProjects]);

  const handleDuplicateProject = useCallback(async (id: string) => {
    try {
      await projectService.duplicate(id);
      await loadProjects();
    } catch (error) {
      console.error("Error duplicating project:", error);
    }
  }, [projectService, loadProjects]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your animation projects
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Project List */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 animate-pulse" />
              <span>Loading projects...</span>
            </div>
          </div>
        ) : (
          <ProjectList
            projects={projects}
            onLoadProject={handleLoadProject}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            selectedId={selectedId}
          />
        )}
      </div>

      {/* Create Dialog */}
      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        projectService={projectService}
        onCreate={handleCreateProject}
      />
    </div>
  );
}
