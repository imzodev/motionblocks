import { create } from "zustand";

/**
 * Timeline Store State
 * Manages playback and timeline state
 */
export interface TimelineState {
  // Playback state
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  
  // Selection state
  selectedAssetId: string | undefined;
  selectedTrackId: string | undefined;
  
  // Actions
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentFrame: (frame: number) => void;
  incrementFrame: () => void;
  setTotalFrames: (frames: number) => void;
  setSelectedAssetId: (assetId: string | undefined) => void;
  setSelectedTrackId: (trackId: string | undefined) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seekToFrame: (frame: number) => void;
  resetToStart: () => void;
}

/**
 * Timeline Store
 * 
 * Manages playback, frame tracking, and selection state.
 * Pure store without side effects.
 */
export const useTimelineStore = create<TimelineState>((set) => ({
  // Initial state
  isPlaying: false,
  currentFrame: 0,
  totalFrames: 0,
  selectedAssetId: undefined,
  selectedTrackId: undefined,

  /**
   * Set playing state
   */
  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
  },

  /**
   * Set current frame
   */
  setCurrentFrame: (frame) => {
    set({ currentFrame: frame });
  },

  /**
   * Increment current frame (for playback loop)
   */
  incrementFrame: () => {
    set((state) => ({ currentFrame: state.currentFrame + 1 }));
  },

  /**
   * Set total frames
   */
  setTotalFrames: (frames) => {
    set({ totalFrames: frames });
  },

  /**
   * Set selected asset ID
   */
  setSelectedAssetId: (assetId) => {
    set({ selectedAssetId: assetId });
  },

  /**
   * Set selected track ID
   */
  setSelectedTrackId: (trackId) => {
    set({ selectedTrackId: trackId });
  },

  /**
   * Start playback
   */
  play: () => {
    set({ isPlaying: true });
  },

  /**
   * Pause playback
   */
  pause: () => {
    set({ isPlaying: false });
  },

  /**
   * Toggle play/pause
   */
  togglePlay: () => {
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  /**
   * Seek to specific frame
   */
  seekToFrame: (frame) => {
    set({ 
      currentFrame: frame,
      isPlaying: false, // Pause when seeking
    });
  },

  /**
   * Reset to start
   */
  resetToStart: () => {
    set({ 
      currentFrame: 0,
      isPlaying: false,
    });
  },
}));
