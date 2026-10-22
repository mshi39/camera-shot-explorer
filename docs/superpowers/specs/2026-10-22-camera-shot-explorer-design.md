# Camera Shot Explorer V1 Design

## Product intent

Camera Shot Explorer is a local, browser-based 3D learning tool for beginner filmmakers and AI short-drama creators. It lets users manipulate a virtual filming camera around a human subject, observe the resulting composition in real time, learn the corresponding cinematography terminology, and generate a concise AI-ready shot description on demand.

V1 prioritizes direct experimentation, predictable camera behavior, and technical clarity. It runs entirely in the browser and requires no backend or external AI service.

## Visual direction

The interface uses a cinematic dark aesthetic that remains simple, practical, and technical. The palette consists mainly of near-black and charcoal surfaces, neutral borders and guides, off-white primary text, and muted-gray supporting text. A single restrained cool-gray or desaturated-blue accent identifies selection, active controls, keyboard focus, and important warnings.

The application uses a split-screen desktop layout. The interactive 3D workspace occupies the left side. The right side contains the labeled Camera Preview, current shot information, mode-specific controls, camera actions, and AI prompt. The workspace has no visible title.

The interface must remain usable at 1366 by 768. At narrower desktop widths, controls may become denser or stack beneath the preview, but the workspace and preview must remain visible and usable.

## Technical approach

The application will use React, TypeScript, Vite, Three.js, and React Three Fiber. The UI and both rendered views consume one authoritative filming-camera state. The observation camera used to inspect the workspace has separate state and cannot change the shot.

The application is local-only for V1. It will include commands for local development, testing, and production builds. Publication and hosting are outside the current scope.

## Scene and subject

The scene contains a neutral ground plane, a full-body human mannequin, a visible filming-camera object, position guides, and rotation controls. The initial mannequin is built from simple 3D geometry with realistic adult proportions. It exposes stable landmarks for the eye midpoint, top of head, shoulders, chest, waist, mid-thighs, knees, and feet.

These landmarks support deterministic shot classification. A later visual model may replace the procedural mesh if it preserves the landmark contract and forward-facing direction.

The subject stands at the world origin in a neutral pose and faces the documented forward axis. The initial filming-camera state produces a front-facing, eye-level Medium Shot in 16:9.

## Camera model

The filming camera uses a 50mm focal length and a 36 by 24mm full-frame sensor convention. Focal length is read-only in V1. The supported aspect ratios are exactly 16:9 and 9:16.

The authoritative camera state contains:

- horizontal orbit;
- vertical orbit;
- distance from the subject;
- yaw;
- pitch;
- roll;
- selected aspect ratio;
- active Position or Rotation mode.

Position and rotation are independent transforms. Position changes preserve yaw, pitch, and roll. Rotation changes preserve camera position.

## Workspace navigation

The workspace is viewed through a separate observation camera. Dragging empty workspace space orbits this observation camera. Scrolling the mouse wheel over the workspace zooms the observation camera. Neither interaction changes the filming camera, shot classification, or Camera Preview.

Input ownership is explicit:

- dragging empty workspace space navigates the observation view;
- dragging the filming camera or a position handle changes filming-camera position in Position mode;
- dragging a rotation handle changes filming-camera orientation in Rotation mode.

## Position controls

Position mode exposes horizontal orbit, vertical orbit, and distance. Users may adjust each value through synchronized numerical sliders and direct 3D handles. Direct manipulation uses constrained handles so a two-dimensional pointer gesture maps predictably to one three-dimensional parameter.

Horizontal orbit supports a full 360 degrees. Vertical orbit is limited to -80 through 80 degrees to avoid polar singularities. Camera distance is limited to 1.5 through 20 meters to prevent clipping through the subject and keep the camera within the useful workspace.

## Rotation controls

Rotation mode exposes yaw, pitch, and roll through synchronized numerical controls and direct rotation rings around the selected camera. Selecting and manipulating the camera must provide clear visual feedback. The UI uses the correct label `Yaw`.

Pressing `S` toggles Position and Rotation modes when application focus is not inside a text-entry or conflicting control context. The visible mode control updates immediately.

## Camera actions

The mode-specific camera action is a split button.

In Position mode, the primary action is Position Reset. Its dropdown contains Look at Subject and Rotation Reset.

In Rotation mode, the primary action is Rotation Reset. Its dropdown contains Position Reset and Look at Subject.

Position Reset restores the default position and preserves the current rotation. Rotation Reset restores default yaw, pitch, and roll and preserves the current position. Performing both restores the complete initial transform.

Look at Subject preserves camera position, aims the camera at the midpoint between the subject's eyes, and preserves the current roll. It is a one-time action; subsequent rotation remains unrestricted. Because position is preserved, using Look at Subject from above or below eye height may still produce a high- or low-angle shot.

## Camera Preview

The right-side Camera Preview renders continuously from the filming camera's actual position and orientation. It reflects the fixed 50mm lens, full-frame convention, and selected aspect ratio. Changes to filming-camera position, rotation, resets, Look at Subject, or aspect ratio update the preview immediately. Workspace-only navigation does not update the shot.

Changing aspect ratio adjusts the preview framing without moving the camera. The shot classifier re-evaluates the visible composition after the ratio changes.

## Shot classification

Classification uses projected body landmarks and visible framing, not camera distance alone. It evaluates the current Camera Preview and produces shot size, camera angle, subject-relative viewpoint, composition, and Dutch-angle status.

The ordered shot-size vocabulary is:

1. Long Shot;
2. Full Shot;
3. Medium Full Shot;
4. Cowboy Shot;
5. Medium Shot;
6. Medium Close-Up;
7. Close-Up;
8. Extreme Close-Up.

The executable definitions are:

- Long Shot: the full subject is visible and occupies less than 70 percent of frame height, leaving substantial surrounding space.
- Full Shot: the subject is visible head to toe and occupies at least 70 percent of frame height.
- Medium Full Shot: the bottom frame boundary falls nearest the knee landmark.
- Cowboy Shot: the bottom frame boundary falls nearest the mid-thigh landmark.
- Medium Shot: the bottom frame boundary falls nearest the waist landmark.
- Medium Close-Up: the bottom frame boundary falls nearest the chest landmark.
- Close-Up: the face dominates the frame, generally from the shoulders, neck, or lower face through the top of the head.
- Extreme Close-Up: only part of the face or an individual facial feature fills the frame, or the complete face no longer fits comfortably.

Classification uses a two-percent-of-frame-height tolerance band around each landmark boundary and retains the previous category while the framing remains inside that band. This prevents rapid label flicker during manipulation. A shot is Unclassified when less than 25 percent of the projected subject bounds intersects the frame, required landmarks are unavailable, or no category can be selected outside the tolerance bands.

Camera-angle classification considers both camera height and viewing direction. V1 identifies Eye Level, High Angle, Low Angle, and Overhead. Subject-relative viewpoint identifies Front, Three-Quarter Front, Profile, Rear Three-Quarter, and Back based on the subject's forward direction and camera bearing.

Composition identifies centered, left-weighted, and right-weighted placement from the projected subject bounds. Shot size remains independent of horizontal placement when the visible framing is deliberate and classifiable.

Dutch Angle is active when absolute filming-camera roll is at least 5 degrees.

## AI shot prompt

The prompt panel starts empty and displays `Click Refresh to generate a prompt.` Clicking Refresh generates one concise sentence from the current shot size, camera angle, subject-relative viewpoint, relevant tilt, fixed 50mm lens, aspect ratio, and composition.

The prompt does not refresh automatically. Camera or ratio changes leave the displayed prompt unchanged until Refresh is clicked. The UI displays an `Out of date` indicator when the camera-state revision differs from the revision used to generate the prompt. Copy copies the displayed prompt exactly and does not regenerate it.

The prompt does not invent lighting, mood, movement, or any attribute the application does not represent.

## State and data flow

The application keeps filming-camera state, observation-camera state, selection, and generated-prompt state separate.

Filming-camera controls update the authoritative filming-camera state. The visible camera model, Camera Preview, numerical controls, and classifier derive from that state. Classification results feed the shot-information panel and are sampled by the prompt generator only when Refresh is clicked.

Observation-camera controls update only observation state. Prompt state contains the displayed sentence plus the camera-state revision from which it was generated, allowing the UI to identify stale output.

The current filming-camera and observation-camera state is stored in browser local storage to survive an accidental page refresh. Invalid or outdated stored state falls back to the default scene.

## Error and edge states

The application provides an Unclassified state when framing cannot be identified reliably. Direct-manipulation limits prevent invalid distances and unstable vertical-orbit positions. If WebGL initialization fails, the app shows a concise compatibility message instead of a blank viewport.

Clipboard failure leaves the prompt visible and displays a non-destructive error message. Missing or invalid persisted state never prevents the default scene from loading.

## Accessibility and usability

All on-screen controls have keyboard focus states and accessible names. Sliders expose current values and units. Text and active controls meet readable contrast targets against the dark surfaces. Motion is functional and limited to direct manipulation and state feedback. Reduced-motion preferences disable nonessential transitions.

Beginner tooltips explain controls and terminology without blocking manipulation. The interface avoids excessive color and decorative animation.

## Verification strategy

Automated unit tests cover:

- independent position and rotation updates;
- Position Reset and Rotation Reset behavior;
- Look at Subject preserving position and targeting the eyes;
- aspect-ratio state;
- Dutch-angle threshold behavior;
- shot-size boundary and hysteresis behavior;
- prompt generation only on explicit refresh;
- stale-prompt detection.

Component and interaction tests cover mode switching, split-button actions, synchronized controls, prompt copying, and keyboard safety. Browser-level verification covers workspace navigation independence, direct manipulation, live preview synchronization, aspect-ratio framing, and layout usability at 1366 by 768.

## V1 exclusions

V1 does not include adjustable focal length, lens presets, camera-shot presets, cinematic-effect explanations, multiple subjects, animated poses, environments, backend services, external AI generation, or public deployment.

