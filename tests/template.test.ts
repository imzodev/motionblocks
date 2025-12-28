import { expect, test, describe } from "bun:test";
import { z } from "zod";
import type { AnimationTemplate, RenderProps } from "../types/template";

// Mock React component (since we are in a test environment, we just need a function)
const MockRender = (props: RenderProps<any>) => null;

describe("AnimationTemplate Type Validation", () => {
  test("allows creating a valid template object", () => {
    const validTemplate: AnimationTemplate = {
      id: "test-template",
      name: "Test Template",
      propsSchema: z.object({
        opacity: z.number(),
      }),
      render: MockRender,
    };

    expect(validTemplate.id).toBe("test-template");
    expect(validTemplate.name).toBe("Test Template");
  });

  test("validates props using the template's schema", () => {
    const validTemplate: AnimationTemplate = {
      id: "test-template",
      name: "Test Template",
      propsSchema: z.object({
        opacity: z.number().min(0).max(1),
      }),
      render: MockRender,
    };

    const validProps = { opacity: 0.5 };
    const invalidProps = { opacity: 2 };

    expect(validTemplate.propsSchema.safeParse(validProps).success).toBe(true);
    expect(validTemplate.propsSchema.safeParse(invalidProps).success).toBe(false);
  });
});
