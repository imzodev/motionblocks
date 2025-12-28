# Project Specification (Personal / Asset + Template Driven)

## Project Name (Working)

MotionBlocks (Personal Edition)

---

## 1. Purpose & Vision

Build a **personal motion graphics tool** that allows you to:

* Provide your own **assets** (images, SVGs, text)
* Apply reusable **animation templates** (pop, glow, counter, timeline, etc.)
* Preview animations in the browser
* Export **deterministic MP4 videos** using Remotion

This is a **single-user, local-first project** optimized for speed, control, and clarity — not for SaaS or collaboration.

---

## 2. Scope & Constraints

### In Scope

* Single user
* Local or single-server execution
* Manual exports
* Asset-based animations
* Template-driven motion system

### Explicitly Out of Scope

* Multi-user support
* Auth / billing
* Queues, Redis, background workers
* Cloud rendering
* Audio
* Collaboration

---

## 3. High-Level Architecture

Even for personal use, **editing and rendering are strictly separated**.

| Layer          | Responsibility        | Tech                    |
| -------------- | --------------------- | ----------------------- |
| Editor         | UI, preview, timeline | Next.js + React         |
| Animation Core | Templates & logic     | Shared React components |
| Renderer       | MP4 export            | Remotion (Node CLI)     |

No job queues. One export at a time.

---

## 4. Repository Structure (Single Repo)

```
/ app/                → Next.js editor
/ components/         → Shared render components
/ editor/             → Canvas, timeline, inspector
/ assets/             → Uploaded images / SVGs
/ templates/          → Animation templates
/ remotion/
  ├─ index.ts         → registerRoot
  ├─ Video.tsx        → Main composition
  ├─ render.ts        → CLI render entry
/ types/              → Timeline, asset, template types
```

---

## 5. Core Design Principles

### 5.1 Asset + Template Model

Animations are not tied to content types.

Everything is:

```
Asset + Animation Template + Timing
```

This allows:

* Any image to glow, pop, slide, pulse
* Any text to count, reveal, animate

---

### 5.2 Deterministic Rendering

* Frame-based timing only
* No browser-only APIs in render components
* No randomness
* Remotion is the source of truth

Preview approximates export; export is authoritative.

---

### 5.3 Simplicity Over Flexibility

* One export at a time
* Fixed resolution defaults
* Hard limits on duration

---

## 6. Assets

### 6.1 Supported Asset Types

* Images (PNG, JPG)
* SVGs (icons, paths)
* Text blocks

Assets are:

* Uploaded or referenced locally
* Positioned freely on the canvas
* Reusable across multiple tracks

---

## 7. Animation Templates (Core Concept)

Templates define **how an asset behaves over time**.

A template controls:

* Entry animation
* Optional emphasis animation
* Optional exit animation

Templates are reusable and parameterized.

---

## 7.1 Template Categories (MVP)

### Entry Templates

* Fade in
* Slide (up / down / left / right)
* Scale pop
* Mask reveal

### Emphasis Templates

* Pulse
* Glow
* Bounce
* Shake

### Data Templates

* Counter (number interpolation)
* Timeline reveal (progressive width / mask)

---

## 7.2 Template Interface

```ts
AnimationTemplate = {
  name: string
  propsSchema: Record<string, any>
  render: (params: {
    frame: number
    duration: number
    asset: ReactNode
    props: Record<string, any>
  }) => ReactNode
}
```

Templates are pure and deterministic.

---

## 8. Timeline System

All animations are driven by a **single timeline JSON**.

### Timeline Schema

```ts
Timeline = {
  fps: number
  width: number
  height: number
  durationInFrames: number
  tracks: Track[]
}

Track = {
  id: string
  assetId: string
  assetType: 'image' | 'text'
  content?: string
  src?: string
  template: string
  startFrame: number
  duration: number
  position: { x: number; y: number }
  size?: { width: number; height: number }
  templateProps: Record<string, any>
}
```

---

## 9. Editor UI (Next.js)

### 9.1 Layout

* Center: Canvas
* Bottom: Timeline
* Right: Inspector
* Left: Assets & Templates panel

---

### 9.2 Assets Panel

* Upload images / SVGs
* Create text assets
* Select asset for placement

---

### 9.3 Templates Panel

* List of animation templates
* Apply template to selected asset
* Configure template props

---

### 9.4 Canvas

* Fixed resolution (default 1920×1080)
* Drag to position assets
* Play / pause
* Frame scrub

Preview uses frame → time mapping.

---

### 9.5 Timeline

* Stacked tracks
* Numeric start / duration inputs
* Optional drag adjustment

---

## 10. Preview vs Export

### Preview

* Runs in browser
* Uses Framer Motion where helpful
* Best-effort timing

### Export

* Uses Remotion
* Frame-perfect
* Deterministic MP4

---

## 11. Export Pipeline (Simple)

### Flow

1. Click Export
2. Serialize timeline JSON
3. Spawn Remotion CLI
4. Render MP4
5. Save locally

No background jobs.

---

## 12. Render Constraints (Hard)

* Max duration: 30 seconds
* Resolution: max 1920×1080
* One export at a time
* No audio

---

## 13. What This Project Is NOT

* Not After Effects
* Not Canva
* Not a SaaS
* Not extensible by third parties

This is a **personal motion graphics power tool**.

---

## 14. Success Criteria

* Faster than traditional video editors for overlays
* Predictable exports
* Minimal maintenance burden
* Clean, understandable codebase

---

## 15. Suggested Build Order

1. Timeline + asset schema
2. Template interface
3. 3 core templates (pop, counter, glow)
4. Remotion export
5. Editor UI

---

## 16. Guiding Principles

* Assets are dumb, templates are smart
* Frame-based first, preview second
* Build only what you personally need
* Avoid future-proofing
