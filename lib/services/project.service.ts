import { ProjectRepository } from "../repositories/project.repository";
import { Project, ProjectListItem, CreateProjectParams, UpdateProjectParams } from "@/types/project";
import { Asset } from "@/types/timeline";

/**
 * Project Service (Business Logic Layer)
 * 
 * This class handles all business logic for project operations.
 * Following SOLID principles:
 * - Single Responsibility: Only handles project business logic
 * - Dependency Inversion: Depends on ProjectRepository abstraction
 * - Open/Closed: Open for extension, closed for modification
 */
export class ProjectService {
  private readonly repository: ProjectRepository;
  private currentProject: Project | null = null;

  constructor(repository: ProjectRepository) {
    this.repository = repository;
  }

  /**
   * Initialize the service and load the last active project
   */
  async initialize(): Promise<void> {
    const currentId = await this.repository.getCurrentProjectId();
    
    if (currentId) {
      const project = await this.repository.getById(currentId);
      if (project) {
        // Filter out assets with invalid blob URLs
        const cleanedProject = this.cleanInvalidAssets(project);
        this.currentProject = await this.hydratePersistedAssets(cleanedProject);
      }
    }
  }

  /**
   * Create a new project
   */
  async create(params: CreateProjectParams): Promise<Project> {
    const now = Date.now();
    const id = this.generateId();

    const project: Project = {
      metadata: {
        id,
        name: params.name,
        description: params.description,
        createdAt: now,
        updatedAt: now,
        version: "1.0.0",
      },
      settings: {
        fps: 30,
        width: 1920,
        height: 1080,
        globalFontPreset: "custom",
        ...params.settings,
      },
      assets: [],
      tracks: [],
    };

    const saved = await this.repository.save(project);
    this.currentProject = saved;
    await this.repository.setCurrentProjectId(id);

    return saved;
  }

  /**
   * Get the current project
   */
  getCurrent(): Project | null {
    return this.currentProject;
  }

  /**
   * Load a project by ID
   */
  async load(id: string): Promise<Project> {
    const project = await this.repository.getById(id);

    if (!project) {
      throw new Error(`Project "${id}" not found`);
    }

    // Filter out assets with invalid blob URLs
    const cleanedProject = this.cleanInvalidAssets(project);
    const hydratedProject = await this.hydratePersistedAssets(cleanedProject);

    this.currentProject = hydratedProject;
    await this.repository.setCurrentProjectId(id);

    return hydratedProject;
  }

  /**
   * Get a project by ID without setting it as current
   */
  async getById(id: string): Promise<Project | null> {
    return await this.repository.getById(id);
  }

  /**
   * Update the current project
   */
  async update(params: UpdateProjectParams): Promise<Project> {
    if (!this.currentProject) {
      throw new Error("No project loaded");
    }

    const updated: Project = {
      ...this.currentProject,
      metadata: {
        ...this.currentProject.metadata,
        ...(params.name !== undefined && { name: params.name }),
        ...(params.description !== undefined && { description: params.description }),
      },
      ...(params.settings && {
        settings: {
          ...this.currentProject.settings,
          ...params.settings,
        },
      }),
    };

    const saved = await this.repository.save(updated);
    this.currentProject = saved;

    return saved;
  }

  /**
   * Save the current project state (for external state management)
   */
  async save(): Promise<Project> {
    if (!this.currentProject) {
      throw new Error("No project loaded");
    }

    const saved = await this.repository.save(this.currentProject);
    this.currentProject = saved;

    return saved;
  }

  /**
   * Save a project state object (for Zustand store integration)
   */
  async saveProjectState(project: Project): Promise<Project> {
    const saved = await this.repository.save(project);
    this.currentProject = saved;
    return saved;
  }

  /**
   * Delete a project by ID
   */
  async delete(id: string): Promise<void> {
    // Best-effort: delete persisted assets for this project (SQLite + local files)
    // Projects are still stored in localStorage, but assets are stored server-side.
    try {
      await fetch(`/api/assets/project/${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (error) {
      console.error(`Failed to delete assets for project "${id}":`, error);
    }

    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new Error(`Failed to delete project "${id}"`);
    }

    // If the deleted project was the current project, clear it
    if (this.currentProject?.metadata.id === id) {
      this.currentProject = null;
      await this.repository.setCurrentProjectId(null);
    }
  }

  /**
   * Get all projects
   */
  async getAll(): Promise<ProjectListItem[]> {
    return await this.repository.getAll();
  }

  /**
   * Duplicate a project
   */
  async duplicate(id: string): Promise<Project> {
    const original = await this.repository.getById(id);

    if (!original) {
      throw new Error(`Project "${id}" not found`);
    }

    const now = Date.now();
    const duplicate: Project = {
      ...original,
      metadata: {
        ...original.metadata,
        id: this.generateId(),
        name: `${original.metadata.name} (Copy)`,
        createdAt: now,
        updatedAt: now,
      },
    };

    return await this.repository.save(duplicate);
  }

  /**
   * Close the current project without saving
   */
  async close(): Promise<void> {
    this.currentProject = null;
    await this.repository.setCurrentProjectId(null);
  }

  /**
   * Check if a project exists
   */
  async exists(id: string): Promise<boolean> {
    return await this.repository.exists(id);
  }

  /**
   * Generate a unique ID for a project
   */
  private generateId(): string {
    return `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Hydrate assets that are persisted server-side (non-text assets) for a given project.
   * Keeps any local text assets stored in the project itself.
   */
  private async hydratePersistedAssets(project: Project): Promise<Project> {
    try {
      const res = await fetch(`/api/assets/project/${encodeURIComponent(project.metadata.id)}`);
      if (!res.ok) return project;

      const json = (await res.json()) as { assets: Asset[] };
      const persistedAssets = Array.isArray(json.assets) ? json.assets : [];

      const localTextAssets = project.assets.filter((a: Asset) => a.type === "text" || !a.src);

      return {
        ...project,
        assets: [...localTextAssets, ...persistedAssets],
      };
    } catch {
      return project;
    }
  }

  /**
   * Filter out assets with invalid blob URLs
   * Blob URLs are only valid for the current session and become invalid on page refresh
   */
  private cleanInvalidAssets(project: Project): Project {
    const validAssets = project.assets.filter((asset: Asset) => {
      // Keep assets without src (text assets)
      if (!asset.src) return true;
      
      // Filter out blob URLs as they're invalid after page refresh
      if (asset.src.startsWith('blob:')) return false;
      
      // Keep other URLs (http, https, data, etc.)
      return true;
    });

    // Also clean up track templateProps that reference invalid assets
    const validAssetIds = new Set(validAssets.map(a => a.id));
    const cleanedTracks = project.tracks.map(track => ({
      ...track,
      templateProps: Object.fromEntries(
        Object.entries(track.templateProps).filter(([key, value]) => {
          // Keep non-asset values
          if (typeof value !== 'string') return true;
          
          // Filter out references to invalid assets
          return !validAssetIds.has(value) || key === 'assetId';
        })
      ),
    }));

    return {
      ...project,
      assets: validAssets,
      tracks: cleanedTracks,
    };
  }
}
