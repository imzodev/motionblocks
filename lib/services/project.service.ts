import { ProjectRepository } from "../repositories/project.repository";
import { Project, ProjectListItem, CreateProjectParams, UpdateProjectParams } from "@/types/project";

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
        this.currentProject = project;
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

    this.currentProject = project;
    await this.repository.setCurrentProjectId(id);

    return project;
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
   * Save the current project state
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
   * Delete a project by ID
   */
  async delete(id: string): Promise<void> {
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
}
