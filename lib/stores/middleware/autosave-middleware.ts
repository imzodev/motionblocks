import { StateCreator } from "zustand";

/**
 * Autosave Middleware Configuration
 */
export interface AutosaveConfig {
  debounceMs: number;
  enabled: boolean;
  onSaveStart?: () => void;
  onSaveComplete?: () => void;
  onSaveError?: (error: Error) => void;
}

/**
 * Default autosave configuration
 */
const DEFAULT_CONFIG: AutosaveConfig = {
  debounceMs: 2000, // 2 seconds
  enabled: true,
};

/**
 * Autosave Middleware for Zustand
 * 
 * Debounces save operations and integrates with ProjectService.
 * Only saves when state actually changes and after debounce period.
 */
export const createAutosaveMiddleware = <T extends object>(
  config: Partial<AutosaveConfig> = {},
  onAutosave: (state: T) => Promise<void>
) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastState: T | null = null;
  let isSaving = false;

  return (config: StateCreator<T>) => (set, get, api) => {
    const originalSet = config(set, get, api);

    const setState: typeof originalSet = (...args) => {
      const result = originalSet(...args);
      
      // Get new state
      const newState = get();

      // Check if state actually changed (deep comparison)
      if (lastState !== null && !isStateChanged(lastState, newState)) {
        return result;
      }

      // Update last state
      lastState = newState;

      // Trigger autosave if enabled
      if (fullConfig.enabled) {
        triggerAutosave();
      }

      return result;
    };

    /**
     * Trigger debounced autosave
     */
    const triggerAutosave = () => {
      // Clear existing timeout
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      // Set new timeout
      timeoutId = setTimeout(async () => {
        await performAutosave();
      }, fullConfig.debounceMs);
    };

    /**
     * Perform actual save
     */
    const performAutosave = async () => {
      if (isSaving) {
        return;
      }

      const currentState = get();
      
      isSaving = true;
      fullConfig.onSaveStart?.();

      try {
        await onAutosave(currentState);
        fullConfig.onSaveComplete?.();
      } catch (error) {
        console.error("Autosave failed:", error);
        fullConfig.onSaveError?.(error as Error);
      } finally {
        isSaving = false;
      }
    };

    /**
     * Check if state has changed
     */
    const isStateChanged = (prev: T, curr: T): boolean => {
      return JSON.stringify(prev) !== JSON.stringify(curr);
    };

    return {
      ...originalSet,
      setState,
    };
  };
};
