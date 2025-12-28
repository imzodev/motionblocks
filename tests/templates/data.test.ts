import { expect, test, describe } from "bun:test";
import { CounterTemplate, TimelineRevealTemplate } from "../../templates/data";
import { AnimationTemplate } from "../../types/template";

describe("Data Templates", () => {
  test("CounterTemplate satisfies interface", () => {
    const template: AnimationTemplate = CounterTemplate;
    expect(template.id).toBe("counter");
  });

  test("TimelineRevealTemplate satisfies interface", () => {
    const template: AnimationTemplate = TimelineRevealTemplate;
    expect(template.id).toBe("timeline-reveal");
  });
});
