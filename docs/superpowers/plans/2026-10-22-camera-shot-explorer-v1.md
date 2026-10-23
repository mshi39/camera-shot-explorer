# Camera Shot Explorer V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local browser-based 3D camera-learning tool with independent workspace navigation, direct filming-camera controls, a synchronized Camera Preview, deterministic shot classification, and a manually refreshed AI-ready prompt.

**Architecture:** A React application renders the workspace and Camera Preview as separate React Three Fiber canvases that consume one authoritative filming-camera store. Pure TypeScript domain modules own camera math, classification, reset behavior, and prompt generation so core behavior can be tested without WebGL.

**Tech Stack:** React, TypeScript, Vite, Three.js, React Three Fiber, Drei, Zustand, Vitest, Testing Library, Playwright, CSS Modules or scoped application CSS.

**Spec:** `docs/superpowers/specs/2026-10-22-camera-shot-explorer-design.md`

## Global Constraints

- Run entirely in the browser with no backend, external AI API, or publication step.
- Use a fixed 50mm lens with a 36 by 24mm full-frame sensor convention.
- Support exactly 16:9 and 9:16 aspect ratios.
- Keep filming-camera position and rotation independent.
- Keep the observation camera independent from the filming camera.
- Use a cinematic dark interface built primarily from neutral grays with one restrained steel-blue accent.
- Start in a front-facing, eye-level Medium Shot at 16:9.
- Classify Dutch Angle at absolute roll greater than or equal to 5 degrees.
- Generate or update the prompt only after an explicit Refresh action.
- Keep the interface usable at 1366 by 768 in current desktop Chrome, Edge, Firefox, and Safari.

## Review Focus

- Pointer gestures that begin on a camera handle must not leak into workspace orbit; cover in Task 6 interaction tests.
- Stored state from an earlier schema version or malformed local storage must restore the default scene; cover in Task 2 tests.
- Boundary movement around body landmarks must not flicker classifications; cover in Task 7 hysteresis tests.
- Pressing `S` while a form control has focus must not switch modes; cover in Task 5 component tests.
- WebGL or clipboard failure must produce a readable fallback without destroying current state; cover in Tasks 4 and 8 tests.

---

## File Structure

```text
src/
  app/App.tsx                         application composition
  app/app.css                         global dark interface and responsive layout
  camera/cameraMath.ts                orbit, transform, reset, and look-at math
  camera/cameraStore.ts               authoritative camera and observation state
  camera/cameraTypes.ts               shared camera-state types and constants
  camera/cameraPersistence.ts         versioned local-storage boundary
  scene/Mannequin.tsx                 procedural subject and landmark contract
  scene/FilmingCameraModel.tsx        visible camera mesh and selection state
  scene/WorkspaceScene.tsx            observation canvas and scene composition
  scene/CameraPreview.tsx             filming-camera canvas and aspect framing
  scene/PositionHandles.tsx           constrained position manipulation
  scene/RotationHandles.tsx           yaw, pitch, and roll manipulation
  controls/ModeSwitcher.tsx           Position/Rotation UI and S shortcut
  controls/CameraControls.tsx          synchronized sliders and values
  controls/CameraActions.tsx           split-button reset and look-at menu
  classification/classifier.ts        pure shot classification engine
  classification/classification.ts    classification types and thresholds
  classification/useClassification.ts projected-landmark bridge from Three.js
  prompt/promptGenerator.ts            deterministic one-line prompt builder
  prompt/PromptPanel.tsx               refresh, stale state, and copy behavior
  ui/ShotInformation.tsx               live terminology display
  ui/WebGLFallback.tsx                 rendering compatibility state
  test/                                shared test setup and helpers
e2e/
  camera-explorer.spec.ts              browser interaction and layout verification
```

## Task 1: Local application foundation and visual shell

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `index.html`
- Create: `src/main.tsx`, `src/app/App.tsx`, `src/app/app.css`, `src/test/setup.ts`
- Test: `src/app/App.test.tsx`

**Interfaces:**
- Produces: a Vite React application with `dev`, `build`, `test`, and `test:e2e` scripts; the desktop split layout slots `workspace`, `preview`, `shot-information`, `controls`, and `prompt`.

- [ ] **Step 1: Write the failing application-shell test**
  Assert that the Camera Preview label exists, the workspace has no visible workspace title, and the initial controls expose Position mode and 16:9.
- [ ] **Step 2: Run `npm test -- src/app/App.test.tsx` and verify it fails because the app shell does not exist.**
- [ ] **Step 3: Scaffold the minimal Vite React TypeScript application and install only the listed stack dependencies.**
- [ ] **Step 4: Implement `App` and the responsive dark shell using the approved neutral palette, one steel-blue accent, readable focus states, and reduced-motion fallbacks.**
- [ ] **Step 5: Run `npm test -- src/app/App.test.tsx` and `npm run build`; expect both to pass.**
- [ ] **Step 6: Commit with `feat: scaffold camera shot explorer`.**

## Task 2: Camera domain, shared state, and persistence

**Files:**
- Create: `src/camera/cameraTypes.ts`, `src/camera/cameraMath.ts`, `src/camera/cameraStore.ts`, `src/camera/cameraPersistence.ts`
- Test: `src/camera/cameraMath.test.ts`, `src/camera/cameraStore.test.ts`, `src/camera/cameraPersistence.test.ts`

**Interfaces:**
- Produces: `CameraTransform`, `FilmingCameraState`, `ObservationCameraState`, `AspectRatio`, `ControlMode`, `DEFAULT_CAMERA_STATE`, `positionFromOrbit()`, `lookAtEyesPreservingRoll()`, `useCameraStore`, and versioned persistence helpers.
- Consumes: browser local storage through an injectable storage interface.

- [ ] **Step 1: Write failing tests for the default 16:9 Position state, independent position/rotation updates, -80 to 80 degree vertical limits, 1.5 to 20 meter distance limits, independent resets, and Look at Subject preserving position and roll.**
- [ ] **Step 2: Write failing persistence tests for valid restoration, malformed JSON, missing properties, and a mismatched schema version falling back to defaults.**
- [ ] **Step 3: Run the camera-domain tests and verify the expected missing-module failures.**
- [ ] **Step 4: Implement the types and pure camera math with exact constants from the specification.**
- [ ] **Step 5: Implement the Zustand store with separate filming-camera, observation-camera, selection, and generated-prompt revisions.**
- [ ] **Step 6: Implement versioned persistence for camera and observation state only.**
- [ ] **Step 7: Run the camera-domain tests; expect all to pass.**
- [ ] **Step 8: Commit with `feat: add authoritative camera state`.**

## Task 3: Procedural subject and visible filming camera

**Files:**
- Create: `src/scene/Mannequin.tsx`, `src/scene/FilmingCameraModel.tsx`, `src/scene/sceneConstants.ts`
- Test: `src/scene/sceneConstants.test.ts`

**Interfaces:**
- Produces: `SUBJECT_LANDMARKS` for eye midpoint, head top, shoulders, chest, waist, mid-thighs, knees, and feet; `<Mannequin />`; `<FilmingCameraModel />`.
- Consumes: `CameraTransform` and selection callbacks from Task 2.

- [ ] **Step 1: Write a failing landmark-contract test that asserts ordered adult-proportion landmark heights and a documented subject-forward axis.**
- [ ] **Step 2: Run the landmark test and verify it fails because the scene constants do not exist.**
- [ ] **Step 3: Implement exact landmark constants and a low-poly neutral mannequin assembled from simple Three.js geometry.**
- [ ] **Step 4: Implement the visible filming-camera mesh with lens direction, selected state, and pointer selection.**
- [ ] **Step 5: Run the landmark tests and production build; expect both to pass.**
- [ ] **Step 6: Commit with `feat: add procedural subject and camera model`.**

## Task 4: Independent workspace and synchronized Camera Preview

**Files:**
- Create: `src/scene/WorkspaceScene.tsx`, `src/scene/CameraPreview.tsx`, `src/ui/WebGLFallback.tsx`
- Modify: `src/app/App.tsx`, `src/app/app.css`
- Test: `src/scene/CameraPreview.test.tsx`, `src/ui/WebGLFallback.test.tsx`

**Interfaces:**
- Produces: `<WorkspaceScene />` with independent orbit/wheel navigation and `<CameraPreview />` driven by filming-camera state.
- Consumes: store selectors from Task 2 and scene components from Task 3.

- [ ] **Step 1: Write failing tests asserting 50mm preview configuration, 16:9 and 9:16 frame selection, and readable WebGL fallback copy.**
- [ ] **Step 2: Run the tests and verify the expected failures.**
- [ ] **Step 3: Implement the workspace canvas, ground plane, technical grid, subject, filming camera, orbit guides, and independent observation controls.**
- [ ] **Step 4: Implement the preview canvas using the filming-camera transform and 36 by 24mm sensor convention.**
- [ ] **Step 5: Add 16:9 and 9:16 preview containers without moving the filming camera.**
- [ ] **Step 6: Add an error boundary and WebGL compatibility fallback.**
- [ ] **Step 7: Run relevant tests and `npm run build`; expect all to pass.**
- [ ] **Step 8: Commit with `feat: render workspace and live camera preview`.**

## Task 5: Modes, sliders, camera actions, and keyboard behavior

**Files:**
- Create: `src/controls/ModeSwitcher.tsx`, `src/controls/CameraControls.tsx`, `src/controls/CameraActions.tsx`
- Modify: `src/app/App.tsx`, `src/app/app.css`
- Test: `src/controls/ModeSwitcher.test.tsx`, `src/controls/CameraActions.test.tsx`, `src/controls/CameraControls.test.tsx`

**Interfaces:**
- Produces: mode switching, synchronized numerical sliders, aspect-ratio dropdown, and split-button camera actions.
- Consumes: store actions and selectors from Task 2.

- [ ] **Step 1: Write failing tests for Position/Rotation switching, visible active state, S shortcut, S suppression on focused inputs, and aspect-ratio options limited to 16:9 and 9:16.**
- [ ] **Step 2: Write failing tests for Position-mode and Rotation-mode split-button menus, independent resets, and Look at Subject.**
- [ ] **Step 3: Run the control tests and verify they fail for missing components.**
- [ ] **Step 4: Implement `ModeSwitcher` and its keyboard guard.**
- [ ] **Step 5: Implement mode-specific sliders with accessible labels, values, units, synchronized store updates, and concise beginner tooltips for each control.**
- [ ] **Step 6: Implement the primary action plus dropdown menu for the three camera actions.**
- [ ] **Step 7: Run control tests and `npm run build`; expect all to pass.**
- [ ] **Step 8: Commit with `feat: add camera controls and actions`.**

## Task 6: Direct 3D position and rotation manipulation

**Files:**
- Create: `src/scene/PositionHandles.tsx`, `src/scene/RotationHandles.tsx`, `src/scene/pointerOwnership.ts`
- Modify: `src/scene/WorkspaceScene.tsx`, `src/scene/FilmingCameraModel.tsx`
- Test: `src/scene/pointerOwnership.test.ts`, `src/scene/manipulation.test.tsx`

**Interfaces:**
- Produces: constrained horizontal-orbit, vertical-orbit, distance, yaw, pitch, and roll manipulation with explicit pointer ownership.
- Consumes: active mode and store update actions from Task 2.

- [ ] **Step 1: Write failing tests showing handle pointer capture blocks workspace orbit and releases cleanly on pointer up or cancellation.**
- [ ] **Step 2: Write failing tests showing position interactions preserve rotation and rotation interactions preserve position.**
- [ ] **Step 3: Run manipulation tests and verify expected failures.**
- [ ] **Step 4: Implement Position handles with one constrained parameter per handle and immediate synchronized store updates.**
- [ ] **Step 5: Implement Rotation rings for yaw, pitch, and roll with immediate synchronized store updates.**
- [ ] **Step 6: Implement pointer ownership so empty-space drag remains workspace orbit while camera and handle drags never orbit the observation camera.**
- [ ] **Step 7: Run manipulation and camera-store tests; expect all to pass.**
- [ ] **Step 8: Commit with `feat: add direct camera manipulation`.**

## Task 7: Deterministic shot classification

**Files:**
- Create: `src/classification/classification.ts`, `src/classification/classifier.ts`, `src/classification/useClassification.ts`, `src/ui/ShotInformation.tsx`
- Modify: `src/app/App.tsx`
- Test: `src/classification/classifier.test.ts`, `src/ui/ShotInformation.test.tsx`

**Interfaces:**
- Produces: `classifyShot(input: ClassificationInput, previous?: ShotClassification): ShotClassification` and a hook that projects scene landmarks into normalized preview coordinates.
- Consumes: subject landmarks from Task 3 and filming-camera matrices from Task 4.

- [ ] **Step 1: Write failing table-driven tests for Long, Full, Medium Full, Cowboy, Medium, Medium Close-Up, Close-Up, Extreme Close-Up, and Unclassified.**
- [ ] **Step 2: Add failing tests for the 70-percent Long/Full boundary, two-percent landmark hysteresis, 25-percent visibility cutoff, camera angle, subject-relative viewpoint, composition, and the 5-degree Dutch threshold.**
- [ ] **Step 3: Run classifier tests and verify expected failures.**
- [ ] **Step 4: Implement pure classification types, thresholds, and `classifyShot`.**
- [ ] **Step 5: Implement landmark projection from Three.js world positions into preview-normalized coordinates.**
- [ ] **Step 6: Implement the live Shot Information panel with readable unavailable states.**
- [ ] **Step 7: Run classification tests and `npm run build`; expect all to pass.**
- [ ] **Step 8: Commit with `feat: classify camera shots from framing`.**

## Task 8: Manual prompt generation, copy behavior, and final verification

**Files:**
- Create: `src/prompt/promptGenerator.ts`, `src/prompt/PromptPanel.tsx`
- Modify: `src/app/App.tsx`, `src/app/app.css`
- Create: `playwright.config.ts`, `e2e/camera-explorer.spec.ts`
- Test: `src/prompt/promptGenerator.test.ts`, `src/prompt/PromptPanel.test.tsx`

**Interfaces:**
- Produces: `generateShotPrompt(classification, cameraState): string`, manual refresh, stale-state indicator, and exact-copy behavior.
- Consumes: current classification from Task 7 and camera revision state from Task 2.

- [ ] **Step 1: Write failing prompt tests for exact inclusion of shot size, angle, viewpoint, relevant Dutch tilt, 50mm, aspect ratio, and composition without invented mood or lighting.**
- [ ] **Step 2: Write failing component tests for the initial instruction, refresh-only generation, stale indicator, successful copy, and clipboard failure preserving the prompt.**
- [ ] **Step 3: Run prompt tests and verify expected failures.**
- [ ] **Step 4: Implement the pure prompt generator and Prompt panel.**
- [ ] **Step 5: Implement browser tests for independent workspace orbit, workspace wheel zoom, camera manipulation, preview synchronization, aspect-ratio changes, resets, prompt refresh, and the 1366 by 768 layout.**
- [ ] **Step 6: Run `npm test`, `npm run test:e2e`, and `npm run build`; expect all to pass.**
- [ ] **Step 7: Perform a visual QA pass at 1366 by 768 and one larger desktop viewport; fix overlap, clipping, contrast, focus, and label consistency issues only.**
- [ ] **Step 8: Confirm local startup instructions in `README.md` and commit with `feat: complete camera shot explorer v1`.**

