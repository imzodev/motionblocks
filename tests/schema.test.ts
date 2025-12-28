import { expect, test, describe } from "bun:test";
import { TimelineSchema, TrackSchema, AssetSchema } from "../types/timeline";

describe("Schema Validation", () => {
  describe("AssetSchema", () => {
    test("validates a valid image asset", () => {
      const validAsset = {
        id: "asset-1",
        type: "image",
        src: "/assets/image.png",
      };
      const result = AssetSchema.safeParse(validAsset);
      expect(result.success).toBe(true);
    });

    test("validates a valid text asset", () => {
      const validAsset = {
        id: "asset-2",
        type: "text",
        content: "Hello World",
      };
      const result = AssetSchema.safeParse(validAsset);
      expect(result.success).toBe(true);
    });

    test("fails on invalid asset type", () => {
      const invalidAsset = {
        id: "asset-3",
        type: "video", // Invalid type
        src: "/assets/video.mp4",
      };
      const result = AssetSchema.safeParse(invalidAsset);
      expect(result.success).toBe(false);
    });
  });

  describe("TrackSchema", () => {
    test("validates a valid track", () => {
      const validTrack = {
        id: "track-1",
        assetId: "asset-1",
        template: "fade-in",
        startFrame: 0,
        duration: 30,
        position: { x: 100, y: 100 },
        templateProps: { opacity: 1 },
      };
      const result = TrackSchema.safeParse(validTrack);
      expect(result.success).toBe(true);
    });

    test("fails if position is missing", () => {
      const invalidTrack = {
        id: "track-2",
        assetId: "asset-1",
        template: "fade-in",
        startFrame: 0,
        duration: 30,
      };
      const result = TrackSchema.safeParse(invalidTrack);
      expect(result.success).toBe(false);
    });
  });

  describe("TimelineSchema", () => {
    test("validates a valid timeline", () => {
      const validTimeline = {
        fps: 30,
        width: 1920,
        height: 1080,
        durationInFrames: 300,
        tracks: [],
      };
      const result = TimelineSchema.safeParse(validTimeline);
      expect(result.success).toBe(true);
    });

    test("validates a timeline with tracks", () => {
      const validTimeline = {
        fps: 30,
        width: 1920,
        height: 1080,
        durationInFrames: 300,
        tracks: [
          {
            id: "track-1",
            assetId: "asset-1",
            template: "fade-in",
            startFrame: 0,
            duration: 30,
            position: { x: 0, y: 0 },
            templateProps: {},
          },
        ],
      };
      const result = TimelineSchema.safeParse(validTimeline);
      expect(result.success).toBe(true);
    });
  });
});
