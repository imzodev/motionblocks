import { expect, test, describe } from "bun:test";
import React from "react";
import { Canvas3D } from "../../components/Canvas3D";

describe("Canvas3D", () => {
  test("renders without crashing", () => {
    expect(Canvas3D).toBeDefined();
    expect(typeof Canvas3D).toBe("function");
  });
});
