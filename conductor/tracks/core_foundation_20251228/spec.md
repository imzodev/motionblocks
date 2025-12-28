# Track Specification: Core Foundation

## Goal
Establish the architectural backbone of MotionBlocks by defining the TypeScript schemas for the Timeline, Tracks, and Assets, and implementing the core Template interface. This ensures a strict contract between the Editor and the Remotion Renderer.

## Requirements

### 1. Data Models (Schema)
- Define a `Timeline` interface that acts as the root of the document.
    - Properties: `fps`, `width`, `height`, `durationInFrames`, `tracks`.
- Define a `Track` interface representing a layer in the timeline.
    - Properties: `id`, `assetId`, `template`, `startFrame`, `duration`, `position`, `templateProps`.
- Define an `Asset` interface for user-provided content.
    - Properties: `id`, `type` (image/text/svg), `src`, `content`.

### 2. Template Interface
- Create a strict `AnimationTemplate` interface.
    - Properties: `name`, `propsSchema` (Zod schema for validation), `render` function.
- The `render` function must accept frame context and render a pure React component.

### 3. Validation
- Use `zod` to create runtime validation schemas for all the above interfaces to ensure data integrity when saving/loading projects.

## Out of Scope
- Building the UI components (Assets Panel, Timeline UI).
- Implementing specific templates (Pop, Glow, etc.).
- Remotion rendering logic (just the schema support).
