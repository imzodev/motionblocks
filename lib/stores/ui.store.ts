import { create } from "zustand";

/**
 * UI Store State
 * Manages all UI-related state (modals, panels, layout)
 */
export interface UIState {
  // Modal states
  showProjectManager: boolean;
  showCreateProjectDialog: boolean;
  
  // Panel visibility
  showAssetsPanel: boolean;
  showTemplatesPanel: boolean;
  showDetailsPanel: boolean;
  
  // Actions
  setShowProjectManager: (show: boolean) => void;
  setShowCreateProjectDialog: (show: boolean) => void;
  setShowAssetsPanel: (show: boolean) => void;
  setShowTemplatesPanel: (show: boolean) => void;
  setShowDetailsPanel: (show: boolean) => void;
}

/**
 * UI Store
 * 
 * Manages UI state across the application.
 * Simple, focused store for interface state.
 */
export const useUIStore = create<UIState>((set) => ({
  // Initial state
  showProjectManager: false,
  showCreateProjectDialog: false,
  showAssetsPanel: true,
  showTemplatesPanel: true,
  showDetailsPanel: true,

  /**
   * Toggle project manager modal
   */
  setShowProjectManager: (show) => {
    set({ showProjectManager: show });
  },

  /**
   * Toggle create project dialog
   */
  setShowCreateProjectDialog: (show) => {
    set({ showCreateProjectDialog: show });
  },

  /**
   * Toggle assets panel
   */
  setShowAssetsPanel: (show) => {
    set({ showAssetsPanel: show });
  },

  /**
   * Toggle templates panel
   */
  setShowTemplatesPanel: (show) => {
    set({ showTemplatesPanel: show });
  },

  /**
   * Toggle details panel
   */
  setShowDetailsPanel: (show) => {
    set({ showDetailsPanel: show });
  },
}));
