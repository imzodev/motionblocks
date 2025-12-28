# Track Plan: Core Foundation

## Phase 1: Data Models & Schema Definitions
- [ ] Task: Install `zod` for runtime schema validation.
- [ ] Task: Create `types/timeline.ts` and define the Zod schemas and TypeScript types for `Timeline`, `Track`, and `Asset`.
    - [ ] Sub-task: Define `AssetSchema` (id, type, src, content).
    - [ ] Sub-task: Define `TrackSchema` (id, assetId, startFrame, duration, position, templateProps).
    - [ ] Sub-task: Define `TimelineSchema` (fps, dimensions, duration, tracks array).
    - [ ] Sub-task: Export inferred TypeScript types from Zod schemas.
- [ ] Task: Create a simple test script `tests/schema.test.ts` to verify that valid JSON objects pass validation and invalid ones fail.
- [ ] Task: Conductor - User Manual Verification 'Data Models & Schema Definitions' (Protocol in workflow.md)

## Phase 2: Template Architecture
- [ ] Task: Create `types/template.ts` to define the `AnimationTemplate` interface.
    - [ ] Sub-task: Define the structure for `name`, `id`, and `propsSchema` (Zod).
    - [ ] Sub-task: Define the `RenderComponent` type signature (props: frame, duration, asset, customProps).
- [ ] Task: Create a mock template implementation in `templates/mock-template.ts` to validate the interface design.
    - [ ] Sub-task: Implement a dummy "FadeIn" template that satisfies the `AnimationTemplate` interface.
- [ ] Task: Conductor - User Manual Verification 'Template Architecture' (Protocol in workflow.md)
