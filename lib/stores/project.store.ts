import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Project } from "@/types/project";
import { Asset, Track } from "@/types/timeline";
import { projectService } from "../services/project-service.factory";

/**
 * Project Store State
 */
export interface ProjectState {
  // Current project data
  project: Project | null;
  
  // Autosave state
  isAutosaving: boolean;
  lastSavedAt: number | null;
  hasUnsavedChanges: boolean;
  
  // Actions
  setProject: (project: Project) => void;
  updateAssets: (assets: Asset[]) => void;
  addAssets: (assets: Asset[]) => void;
  addAsset: (asset: Asset) => void;
  removeAsset: (assetId: string) => void;
  updateTracks: (tracks: Track[]) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  reorderTracks: (tracks: Track[]) => void;
  updateSettings: (settings: Partial<Project["settings"]>) => void;
  forceSave: () => Promise<void>;
  clearProject: () => void;
}

/**
 * Autosave configuration
 */
const AUTOSAVE_DELAY = 2000; // 2 seconds
let autosaveTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Project Store with Autosave
 * 
 * Manages project state with automatic debounced saving.
 * Uses immer middleware for immutable updates.
 */
export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    // Initial state
    project: null,
    isAutosaving: false,
    lastSavedAt: null,
    hasUnsavedChanges: false,

    /**
     * Set entire project
     */
    setProject: (project) => {
      set({ project });
      triggerAutosave(get, set);
    },

    /**
     * Update all assets
     */
    updateAssets: (assets: Asset[]) => {
      set((state) => {
        if (state.project) {
          state.project.assets = assets;
        }
      });
      triggerAutosave(get, set);
    },

    /**
     * Add multiple assets
     */
    addAssets: (assets) => {
      set((state) => {
        if (state.project) {
          state.project.assets.push(...assets);
        }
      });
      triggerAutosave(get, set);
    },

    /**
     * Add single asset
     */
    addAsset: (asset) => {
      set((state) => {
        if (state.project) {
          state.project.assets.push(asset);
        }
      });
      triggerAutosave(get, set);
    },

    /**
     * Remove asset by ID
     */
    removeAsset: (assetId) => {
      set((state) => {
        if (state.project) {
          state.project.assets = state.project.assets.filter(a => a.id !== assetId);
        }
      });
      triggerAutosave(get, set);
    },

    /**
     * Update all tracks
     */
    updateTracks: (tracks: Track[]) => {
      set((state) => {
        if (state.project) {
          state.project.tracks = tracks;
        }
      });
      triggerAutosave(get, set);
    },

    /**
     * Add single track
     */
    addTrack: (track) => {
      set((state) => {
        if (state.project) {
          state.project.tracks.push(track);
        }
      });
      triggerAutosave(get, set);
    },

    /**
     * Update specific track
     */
    updateTrack: (trackId, updates) => {
      set((state) => {
        if (state.project) {
          const track = state.project.tracks.find(t => t.id === trackId);
          if (track) {
            Object.assign(track, updates);
          }
        }
      });
      triggerAutosave(get, set);
    },

    /**
     * Remove track by ID
     */
    removeTrack: (trackId) => {
      set((state) => {
        if (state.project) {
          state.project.tracks = state.project.tracks.filter(t => t.id !== trackId);
        }
      });
      triggerAutosave(get, set);
    },

    /**
     * Reorder tracks and recalculate start frames
     */
    reorderTracks: (tracks: Track[]) => {
      set((state) => {
        if (state.project) {
          let currentStart = 0;
          state.project.tracks = tracks.map(t => {
            const tWithUpdatedStart = { ...t, startFrame: currentStart };
            currentStart += t.duration;
            return tWithUpdatedStart;
          });
        }
      });
      triggerAutosave(get, set);
    },

    /**
     * Update project settings
     */
    updateSettings: (settings) => {
      set((state) => {
        if (state.project) {
          state.project.settings = { ...state.project.settings, ...settings };
        }
      });
      triggerAutosave(get, set);
    },

    /**
     * Force immediate save (bypasses debounce)
     */
    forceSave: async () => {
      const state = get();
      if (!state.project) return;

      try {
        set({ isAutosaving: true });
        
        await projectService.saveProjectState(state.project);
        
        set({
          isAutosaving: false,
          lastSavedAt: Date.now(),
          hasUnsavedChanges: false,
        });
      } catch (error) {
        console.error("Failed to save project:", error);
        set({ isAutosaving: false });
        throw error;
      }
    },

    /**
     * Clear current project
     */
    clearProject: () => {
      set({
        project: null,
        isAutosaving: false,
        lastSavedAt: null,
        hasUnsavedChanges: false,
      });
    },
  }))
);

/**
 * Trigger debounced autosave
 */
function triggerAutosave(
  get: () => ProjectState,
  set: (partial: Partial<ProjectState>) => void
) {
  // Set unsaved changes flag
  set({ hasUnsavedChanges: true });

  // Clear existing timeout
  if (autosaveTimeout !== null) {
    clearTimeout(autosaveTimeout);
  }

  // Set new timeout
  autosaveTimeout = setTimeout(async () => {
    await performAutosave(get, set);
  }, AUTOSAVE_DELAY);
}

/**
 * Perform actual autosave
 */
async function performAutosave(
  get: () => ProjectState,
  set: (partial: Partial<ProjectState>) => void
) {
  const state = get();
  if (!state.project) return;

  try {
    set({ isAutosaving: true });
    
    await projectService.saveProjectState(state.project);
    
    set({
      isAutosaving: false,
      lastSavedAt: Date.now(),
      hasUnsavedChanges: false,
    });
  } catch (error) {
    console.error("Autosave failed:", error);
    set({ isAutosaving: false });
  }
}
