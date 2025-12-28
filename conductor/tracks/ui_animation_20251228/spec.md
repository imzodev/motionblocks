# Track Specification: UI & Animation Foundation

## Overview
This track implements the primary editor interface (Assets Panel, Sequence UI) and the core library of animation templates. It establishes the visual "YouTube-ready" aesthetic by integrating React Three Fiber for advanced 3D effects, mind maps, and data visualizations.

## Functional Requirements

### 1. Assets Panel (Shadcn)
- **Uploader:** Drag-and-drop zone for local images and SVGs.
- **Library Grid:** Thumbnail view of available assets.
- **Asset Inspector:** View and edit metadata/properties for selected library items.

### 2. Sequence UI (Dynamic Orchestration)
- **List-Based Sequencing:** A vertical list of animation "blocks" instead of a manual timeline.
- **Auto-Duration:** Total duration is computed automatically based on the sequence of templates; adding an item extends the video.
- **Drag-to-Reorder:** Change the order of events with automatic start-time recalculation.
- **Computed Timing Panel:** Read-only view of the precise Start Frame and Duration for each block.

### 3. Animation Template Library
- **Entry:** Fade In, Slide (Directional), Scale Pop, Mask Reveal.
- **Emphasis:** Pulse, Glow, Bounce, Shake.
- **Data & Visuals:** 
    - **Counter:** Animated number interpolation.
    - **Timeline Reveal:** Progressive width/masking.
    - **Attractive Highlights:** Professional text highlighting effects.
- **Advanced 3D (React Three Fiber):**
    - **3D Mind Map:** Interactive, node-based layout with depth.
    - **Animated Graphs:** 3D bars/lines with camera-aware transitions.

## Non-Functional Requirements
- **Visual Aesthetic:** Minimalist & Professional (Shadcn) with "snappy" high-impact motion.
- **Performance:** Optimized React Three Fiber rendering to ensure smooth previews.
- **Determinism:** All 3D animations must be frame-based to ensure identical Remotion exports.

## Acceptance Criteria
- User can upload an asset and see it in the library.
- User can build a sequence of at least 3 blocks and reorder them.
- A "3D Mind Map" template can be applied to an asset and renders with depth in the preview.
- All "YouTube-style" templates (Entry/Emphasis/Data) are selectable and functional.

## Out of Scope
- Final MP4 export pipeline (Renderer).
- User authentication or cloud storage.
- Custom 3D model importing (using primitives/SVGs for now).
