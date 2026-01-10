import { IStorage } from "../storage/storage.interface";
import { Project, ProjectListItem, ProjectSchema } from "@/types/project";

/**
 * Project Repository (Data Access Layer)
 * 
 * This class handles all data access operations for projects.
 * Following SOLID principles:
 * - Single Responsibility: Only handles project data operations
 * - Dependency Inversion: Depends on IStorage abstraction
 * 
 * @see Repository Pattern for data access abstraction
 */
export class ProjectRepository {
  private readonly storage: IStorage<Project>;
  private readonly listStorage: IStorage<Record<string, ProjectListItem>>;
  private readonly metadataStorage: IStorage<string>;

  constructor(
    storage: IStorage<Project>,
    listStorage: IStorage<Record<string, ProjectListItem>>,
    metadataStorage: IStorage<string>
  ) {
    this.storage = storage;
    this.listStorage = listStorage;
    this.metadataStorage = metadataStorage;
  }

  /**
   * Get a project by ID
   */
  async getById(id: string): Promise<Project | null> {
    try {
      const project = await this.storage.get(id);
      
      if (!project) {
        return null;
      }

      // Validate project structure
      const validated = ProjectSchema.parse(project);

      // Strip any Proxy / non-serializable references by round-tripping through JSON
      const plain = JSON.parse(JSON.stringify(validated)) as Project;

      return plain;
    } catch (error) {
      console.error(`Error getting project "${id}":`, error);
      return null;
    }
  }

  /**
   * Save a project (create or update)
   */
  async save(project: Project): Promise<Project> {
    try {
      // Validate project structure
      const validated = ProjectSchema.parse(project);

      // Strip any Proxy / non-serializable references by round-tripping through JSON
      const plain = JSON.parse(JSON.stringify(validated)) as Project;
      
      // Update timestamp
      plain.metadata.updatedAt = Date.now();

      // Save full project
      await this.storage.set(plain.metadata.id, plain);

      // Update project list
      await this.updateProjectListItem(plain);

      return plain;
    } catch (error) {
      console.error("Error saving project:", error);
      throw error;
    }
  }

  /**
   * Delete a project by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.storage.delete(id);
      
      // Remove from project list
      const list = await this.listStorage.get("list") || {};
      delete list[id];
      await this.listStorage.set("list", list);

      return true;
    } catch (error) {
      console.error(`Error deleting project "${id}":`, error);
      return false;
    }
  }

  /**
   * Get all project list items (without loading full project data)
   */
  async getAll(): Promise<ProjectListItem[]> {
    try {
      const list = await this.listStorage.get("list");
      
      if (!list) {
        return [];
      }

      // Sort by updated date, most recent first
      return Object.values(list).sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error("Error getting project list:", error);
      return [];
    }
  }

  /**
   * Check if a project exists
   */
  async exists(id: string): Promise<boolean> {
    return await this.storage.has(id);
  }

  /**
   * Get the current/last active project ID
   */
  async getCurrentProjectId(): Promise<string | null> {
    try {
      return await this.metadataStorage.get("current");
    } catch (error) {
      console.error("Error getting current project ID:", error);
      return null;
    }
  }

  /**
   * Set the current/last active project ID
   */
  async setCurrentProjectId(id: string | null): Promise<void> {
    try {
      if (id === null) {
        await this.metadataStorage.delete("current");
      } else {
        await this.metadataStorage.set("current", id);
      }
    } catch (error) {
      console.error("Error setting current project ID:", error);
      throw error;
    }
  }

  /**
   * Update the project list item (helper method)
   */
  private async updateProjectListItem(project: Project): Promise<void> {
    const list = await this.listStorage.get("list") || {};

    const listItem: ProjectListItem = {
      id: project.metadata.id,
      name: project.metadata.name,
      description: project.metadata.description,
      createdAt: project.metadata.createdAt,
      updatedAt: project.metadata.updatedAt,
      version: project.metadata.version,
      trackCount: project.tracks.length,
      assetCount: project.assets.length,
    };

    list[project.metadata.id] = listItem;
    await this.listStorage.set("list", list);
  }
}
