import { expect, test, describe } from "bun:test";
import { FadeInTemplate } from "../templates/mock-template";
import type { AnimationTemplate } from "../types/template";

describe("Mock Template Implementation", () => {
  test("FadeInTemplate satisfies AnimationTemplate interface", () => {
    // This assignment checks type compatibility at compile time (conceptually)
    // and runtime structure
    const template: AnimationTemplate = FadeInTemplate;

    expect(template.id).toBe("fade-in");
    expect(template.name).toBe("Fade In");
    expect(template.propsSchema).toBeDefined();
  });

  test("FadeInTemplate has valid props schema", () => {
    const validProps = { duration: 30 };
    const result = FadeInTemplate.propsSchema.safeParse(validProps);
    expect(result.success).toBe(true);
  });
});
