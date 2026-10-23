# Camera Shot Explorer

An interactive, browser-based 3D camera exploration tool that helps beginner filmmakers and AI short-drama creators understand camera positioning, shot composition, and cinematography terminology through hands-on experimentation. Built with React, Three.js, and TypeScript. No account, backend, or AI API is required.

## Start locally

Install Node.js 22.12 or newer, then run in this folder:

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. Keep that terminal running. Nothing is published online.

## Controls

- Drag the background to orbit your workspace viewpoint. Scroll to zoom the workspace only.
- Select and drag the camera to change its position. H/V/D handles isolate horizontal orbit, vertical orbit, and distance. Distance follows the radial path on screen: drag toward the subject to move closer, away to move farther. When viewing that path directly end-on, orbit the workspace slightly or use the distance slider.
- Press **S** or use the Position/Rotation toggle. Press **H/V/D** in Position mode or **Y/P/R** in Rotation mode to restrict camera dragging to one axis; the matching handle is highlighted. Press the same key again or **Esc** to release the restriction. The axis buttons in the workspace footer do the same. Sliders and number fields provide precise values.
- Position edits preserve orientation; rotation edits preserve location. The camera does not automatically track the subject.
- The reset dropdown contains the other reset action and **Look at Subject**. **Shift+R** resets position in Position mode and rotation in Rotation mode. Each reset changes only its own transform. **L** aims at the eye midpoint and preserves roll and location. Shortcuts are inactive while typing or dragging.
- Choose **16:9** or **9:16** from the ratio dropdown. The lens is fixed at **50mm**.
- Labels update live. The one-line shot prompt updates only when **Refresh** is clicked. Copy copies the displayed version; an out-of-date indicator appears after camera changes.
- Camera and workspace settings are saved on this browser/device. Prompts are not saved. Clear this site's browser storage to restore the first-run state.

## Framing conventions

Roll uses a visual matching convention: the preview tilts in the same direction as the workspace camera body. This intentionally reverses physical camera roll for rendering; classification uses that same preview projection.

The supplied StudioBinder chart guides the landmark-based size labels: knees (Medium Full), thigh (Cowboy), waist (Medium), chest (Medium Close-Up), head/shoulders (Close-Up), facial detail (Extreme Close-Up). Full Shot shows the whole body; Long Shot adds substantial surrounding space. Full/Long use a 70% frame-height boundary with a small dead band. Dutch Angle starts at 5 degrees of roll.

The initial shot places the camera at eye height, front-facing, with a slight downward pitch for a waist-up medium composition. Landscape uses a 36 × 20.25mm gate; portrait rotates this crop to 20.25 × 36mm. Ratio changes do not move the camera.

Camera level follows the physical lens height, independently of shot size and lens tilt. From eyes to floor, it chooses the nearest height landmark with no unclassified gaps: Eye 1.64m, Shoulder 1.44m, Chest 1.28m, Waist 0.96m, Hip 0.89m, Knee 0.49m, Shin 0.35m, Tatami 0.245m, Ankle 0.10m, and Ground 0m. Tatami is defined here as exactly halfway between knee height and floor. Category boundaries fall midway between neighboring landmarks. Below ground or more than 0.08m above the eyes is Unclassified unless overhead applies. Overhead Level requires a position more than 0.05m above the head, within 0.08m horizontally of its center, and a lens pointed within 5° of straight down. Vertical orbit and pitch both allow ±90° to reach this position. These are app-specific conventions for the bundled mannequin.

Handle colors are deliberately muted: vertical and yaw are soft red, horizontal and pitch soft green, and distance and roll soft blue. The active handle is highlighted in white; labels and keyboard shortcuts remain available alongside color.

Classification uses projected landmarks, not distance alone. It is a practical heuristic for the bundled mannequin, not a universal cinematography standard. Unreadable and unsupported framing returns Unclassified. Extreme oblique angles and partial crops can be ambiguous. The procedural mannequin can be replaced later; its landmark positions must be updated with it. Camera movement is bounded but does not provide mesh collision avoidance.

Thigh Level is centered at the mannequin's 0.73m thigh landmark, between Hip and Knee. POV and Over-the-Shoulder are deferred Framing options, not shot-size categories; their behavior will be designed later.

## Verify

```sh
npm test
npm run build
# With the development server running, and Google Chrome installed:
npm run test:e2e
```

Browser checks cover real WebGL rendering, aspect ratios, independent navigation and camera transforms, manual prompts, resets, keyboard controls, and persisted settings. Tests currently target desktop Chrome. Other browsers and hardware performance need separate verification before publishing.

The production bundle can also run locally with `npm run preview` after a build. It uses bundled assets and requires no remote model or font downloads.
