import { LocalStorageAdapter } from "../storage/local-storage.adapter";
import { ProjectRepository } from "../repositories/project.repository";
import { ProjectService } from "./project.service";
import { Project, ProjectListItem } from "@/types/project";

/**
 * Project Service Factory (Dependency Injection)
 * 
 * This module creates and provides a singleton instance of the ProjectService.
 * Following SOLID principles:
 * - Dependency Inversion: Injects dependencies through factory
 * - Single Responsibility: Only handles service instantiation
 */

// Create storage adapters
const projectStorage = new LocalStorageAdapter<Project>("motionblocks");
const listStorage = new LocalStorageAdapter<Record<string, ProjectListItem>>("motionblocks");
const metadataStorage = new LocalStorageAdapter<string>("motionblocks");

// Create repository
const repository = new ProjectRepository(projectStorage, listStorage, metadataStorage);

// Create and export singleton service instance
export const projectService = new ProjectService(repository);

/**
 * Initialize the project service
 * Call this when the application starts
 */
export async function initializeProjectService(): Promise<void> {
  await projectService.initialize();
}
