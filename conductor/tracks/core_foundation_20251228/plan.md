# Track Plan: Core Foundation

## Phase 1: Data Models & Schema Definitions
- [x] Task: Install `zod` for runtime schema validation. <!-- 8bd6421 -->
- [x] Task: Create `types/timeline.ts` and define the Zod schemas and TypeScript types for `Timeline`, `Track`, and `Asset`. <!-- 537b4a8 -->
    - [x] Sub-task: Define `AssetSchema` (id, type, src, content). <!-- 537b4a8 -->
    - [x] Sub-task: Define `TrackSchema` (id, assetId, startFrame, duration, position, templateProps). <!-- 537b4a8 -->
    - [x] Sub-task: Define `TimelineSchema` (fps, dimensions, duration, tracks array). <!-- 537b4a8 -->
    - [x] Sub-task: Export inferred TypeScript types from Zod schemas. <!-- 537b4a8 -->
- [x] Task: Create a simple test script `tests/schema.test.ts` to verify that valid JSON objects pass validation and invalid ones fail. <!-- 537b4a8 -->
- [x] Task: Conductor - User Manual Verification 'Data Models & Schema Definitions' (Protocol in workflow.md) <!-- 188561d -->

## Phase 2: Template Architecture
- [ ] Task: Create `types/template.ts` to define the `AnimationTemplate` interface.
    - [ ] Sub-task: Define the structure for `name`, `id`, and `propsSchema` (Zod).
    - [ ] Sub-task: Define the `RenderComponent` type signature (props: frame, duration, asset, customProps).
- [ ] Task: Create a mock template implementation in `templates/mock-template.ts` to validate the interface design.
    - [ ] Sub-task: Implement a dummy "FadeIn" template that satisfies the `AnimationTemplate` interface.
- [ ] Task: Conductor - User Manual Verification 'Template Architecture' (Protocol in workflow.md)
