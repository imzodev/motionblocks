# Tech Stack: MotionBlocks

## Core Frameworks
- **Next.js (App Router):** Primary framework for the editor interface and server-side logic.
- **TypeScript:** Ensuring type safety across the timeline schema, templates, and editor state.
- **Remotion:** The source of truth for deterministic video rendering and frame-perfect compositions.

## UI & Styling
- **Tailwind CSS:** For rapid, utility-first styling and consistent layout.
- **Shadcn UI:** Accessible, customizable component library used for the editor's panels, inspectors, and controls.

## Animation & 3D
- **Framer Motion:** Used for smooth, reactive browser-based previews within the editor.
- **Three.js / React Three Fiber:** Powering 3D animations and spatial depth effects within the motion templates.

## UI Libraries
- **react-dropzone:** For handling drag-and-drop file uploads in the Assets Panel.
- **@dnd-kit:** For implementing reorderable lists in the Sequence UI.
- **lucide-react:** For consistent iconography.

## Infrastructure & Tooling
- **Bun:** High-performance JavaScript runtime and package manager used for the local development environment.
- **ESLint & Prettier:** For maintaining code quality and consistent formatting.

## State Management & Schema
- **Local State (React Context/Zustand):** For managing the editor's interactive state and the complex timeline JSON.
- **Zod:** For runtime schema validation and defining the strict contract for the MotionBlocks Timeline to ensure compatibility between the Editor and the Remotion Renderer.
