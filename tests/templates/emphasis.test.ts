import { expect, test, describe } from "bun:test";
import { PulseTemplate, GlowTemplate, BounceTemplate, ShakeTemplate } from "../../templates/emphasis";
import { AnimationTemplate } from "../../types/template";

describe("Emphasis Templates", () => {
  test("PulseTemplate satisfies interface", () => {
    const template: AnimationTemplate = PulseTemplate;
    expect(template.id).toBe("pulse");
  });

  test("GlowTemplate satisfies interface", () => {
    const template: AnimationTemplate = GlowTemplate;
    expect(template.id).toBe("glow");
  });

  test("BounceTemplate satisfies interface", () => {
    const template: AnimationTemplate = BounceTemplate;
    expect(template.id).toBe("bounce");
  });

  test("ShakeTemplate satisfies interface", () => {
    const template: AnimationTemplate = ShakeTemplate;
    expect(template.id).toBe("shake");
  });
});
