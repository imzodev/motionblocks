/**
 * Zustand Stores
 * 
 * Export all stores from a central location.
 * This makes imports cleaner and more maintainable.
 */

export { useProjectStore } from "./project.store";
export type { ProjectState } from "./project.store";

export { useUIStore } from "./ui.store";
export type { UIState } from "./ui.store";

export { useTimelineStore } from "./timeline.store";
export type { TimelineState } from "./timeline.store";

// Re-export types for convenience
export type { Project } from "@/types/project";
export type { Asset, Track } from "@/types/timeline";
