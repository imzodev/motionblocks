# Track Specification: UI & Animation Foundation

## Overview
This track implements the primary editor interface (Assets Panel, Sequence UI) and the core library of animation templates. It establishes the visual "YouTube-ready" aesthetic by integrating React Three Fiber for advanced 3D effects, mind maps, and data visualizations.

## Functional Requirements

### 1. Assets Panel
- **Uploader:** Drag-and-drop zone for local images and SVGs.
- **Library Grid:** Pool of assets (ingredients) to be used in animation slots.

### 2. Templates Panel (New)
- **Library:** A list of available animation "recipes" (e.g., 3D Mind Map, Fade In, Animated Graph).
- **Action:** Dragging a template into the sequence creates a new "Block".

### 3. Sequence UI (Dynamic Orchestration)
- **Block-Based sequencing:** Represents the logical flow of the video.
- **Auto-Duration:** Block duration is derived from the chosen template.

### 4. Dynamic Inspector (Slot-Based)
- **Context-Aware:** When a block is selected, the inspector shows "Slots" required by that specific template.
    - *Example (Fade In):* Shows a single "Asset" slot.
    - *Example (Mind Map):* Shows slots for "Central Image", "Nodes", and "Connector Style".
    - *Example (Graph):* Shows a data entry grid for values and labels.

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
