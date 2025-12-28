import { expect, test, describe } from "bun:test";
import { FadeInTemplate, SlideTemplate, ScalePopTemplate } from "../../templates/entry";
import { AnimationTemplate } from "../../types/template";

describe("Entry Templates", () => {
  describe("FadeInTemplate", () => {
    test("satisfies AnimationTemplate interface", () => {
      const template: AnimationTemplate = FadeInTemplate;
      expect(template.id).toBe("fade-in");
    });

    test("calculates opacity based on frame", () => {
      // Logic would be tested here
    });
  });

  describe("SlideTemplate", () => {
    test("satisfies AnimationTemplate interface", () => {
      const template: AnimationTemplate = SlideTemplate;
      expect(template.id).toBe("slide-in");
    });
  });

  describe("ScalePopTemplate", () => {
    test("satisfies AnimationTemplate interface", () => {
      const template: AnimationTemplate = ScalePopTemplate;
      expect(template.id).toBe("scale-pop");
    });
  });
});
