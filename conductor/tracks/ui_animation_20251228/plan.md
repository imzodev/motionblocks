# Track Plan: UI & Animation Foundation

## Phase 1: Editor Infrastructure (Templates & Assets) [checkpoint: 0bfe5f3]
- [x] Task: Create `components/AssetsPanel.tsx` with a drag-and-drop uploader. <!-- bd73db9 -->
- [x] Task: Create `components/AssetLibrary.tsx` to display uploaded assets. <!-- f2bf7da -->
- [x] Task: Create `components/TemplatesPanel.tsx` to browse and select animation recipes. <!-- 0bfe5f3 -->
- [x] Task: Implement `components/SequenceList.tsx` for reorderable blocks. <!-- 70665c3 -->
- [x] Task: Upgrade `components/DetailsPanel.tsx` to a Dynamic Slot-Based Inspector. <!-- 0bfe5f3 -->
- [x] Task: Conductor - User Manual Verification 'Editor Infrastructure' (Protocol in workflow.md) <!-- 0bfe5f3 -->

## Phase 2: Core Animation Templates (2D)
- [x] Task: Implement Entry Templates (Fade In, Slide, Scale Pop, Mask Reveal). <!-- 245287a -->
    - [x] Write Tests: Verify the `render` function returns the correct motion props/styles for each template. <!-- 245287a -->
    - [x] Implement Feature: Create the functional components for each entry animation. <!-- 245287a -->
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
