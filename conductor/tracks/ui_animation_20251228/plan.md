# Track Plan: UI & Animation Foundation

## Phase 1: Assets Panel & Sequencing Logic
- [x] Task: Create `components/AssetsPanel.tsx` with a drag-and-drop uploader. <!-- bd73db9 -->
    - [x] Write Tests: Ensure files can be dropped and the upload handler is called. <!-- bd73db9 -->
    - [x] Implement Feature: Integrate Shadcn `Dropzone` or similar and update local state. <!-- bd73db9 -->
- [x] Task: Create `components/AssetLibrary.tsx` to display uploaded assets. <!-- f2bf7da -->
    - [x] Write Tests: Ensure a list of assets renders as a grid of thumbnails. <!-- f2bf7da -->
    - [x] Implement Feature: Render a grid of assets with selection state. <!-- f2bf7da -->
- [ ] Task: Implement `components/SequenceList.tsx` for reorderable blocks.
    - [ ] Write Tests: Ensure blocks can be reordered and the `Timeline` state updates.
    - [ ] Implement Feature: Use `@dnd-kit` or similar to create a reorderable list of blocks.
- [ ] Task: Implement `components/DetailsPanel.tsx` for computed timing.
    - [ ] Write Tests: Ensure it correctly calculates and displays start frames based on sequence order.
    - [ ] Implement Feature: Create a read-only panel showing Start Frame and Duration for the selected block.
- [ ] Task: Conductor - User Manual Verification 'Assets Panel & Sequencing Logic' (Protocol in workflow.md)

## Phase 2: Core Animation Templates (2D)
- [ ] Task: Implement Entry Templates (Fade In, Slide, Scale Pop, Mask Reveal).
    - [ ] Write Tests: Verify the `render` function returns the correct motion props/styles for each template.
    - [ ] Implement Feature: Create the functional components for each entry animation.
- [ ] Task: Implement Emphasis Templates (Pulse, Glow, Bounce, Shake).
    - [ ] Write Tests: Verify the animation loops and properties match the schema.
    - [ ] Implement Feature: Create the functional components for each emphasis animation.
- [ ] Task: Implement Data Templates (Counter, Timeline Reveal).
    - [ ] Write Tests: Verify number interpolation and mask progress logic.
    - [ ] Implement Feature: Create the specialized data-driven animation components.
- [ ] Task: Conductor - User Manual Verification 'Core Animation Templates (2D)' (Protocol in workflow.md)

## Phase 3: Advanced 3D Templates & Visuals
- [ ] Task: Setup React Three Fiber environment and `components/Canvas3D.tsx`.
    - [ ] Write Tests: Ensure the 3D canvas mounts and handles basic resize.
    - [ ] Implement Feature: Initialize R3F and create a basic scene wrapper.
- [ ] Task: Implement the **3D Mind Map** template.
    - [ ] Write Tests: Verify node positioning and relationship rendering in the 3D space.
    - [ ] Implement Feature: Use R3F to create a node-link diagram with depth.
- [ ] Task: Implement the **Animated 3D Graphs** template.
    - [ ] Write Tests: Verify bar/line generation from data props.
    - [ ] Implement Feature: Create 3D bar/line graphs with animated entry.
- [ ] Task: Implement **YouTube-style Text Highlights**.
    - [ ] Write Tests: Verify high-impact text animation logic.
    - [ ] Implement Feature: Create high-fidelity text reveal/highlight templates.
- [ ] Task: Conductor - User Manual Verification 'Advanced 3D Templates & Visuals' (Protocol in workflow.md)
