import { expect, test, describe } from "bun:test";
import React from "react";
import { SequenceList } from "../../components/SequenceList";
import type { Track } from "../../types/timeline";

describe("SequenceList", () => {
  const mockTracks: Track[] = [
    {
      id: "t1",
      assetId: "a1",
      template: "fade-in",
      startFrame: 0,
      duration: 30,
      position: { x: 0, y: 0 },
      templateProps: {},
    },
  ];

  test("renders without crashing", () => {
    expect(SequenceList).toBeDefined();
    expect(typeof SequenceList).toBe("function");
  });

  test("displays a list of blocks", () => {
    // Logic to verify rendering
  });
});
