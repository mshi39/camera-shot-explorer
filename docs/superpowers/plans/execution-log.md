# Execution ledger: 2026-10-22-camera-shot-explorer-v1

Native execution on feature/camera-explorer-v1; baseline b68963e. The only pre-existing untracked file is the user's StudioBinder reference image.

Preflight: camera types/store feed scene, controls, classifier, prompt. Classifier consumes the exact preview projection. No competing source of truth.

Ruling: work in the provided project on a new feature branch, keeping the user's local startup path stable. Skill shell bookkeeping is adapted to this Windows environment using this durable ledger.
Ruling: install/configure the test runner before running the first test; the plan puts npm test before package.json exists.
Ruling: reduce minimum radius from 1.5m to 0.35m to support ECU; constrain against the model envelope. Cost: close shots need careful clipping verification.
Ruling: initial camera is at eye height with a small downward pitch to achieve waist-up framing and modest headroom. A perfectly level eye-centered lens cannot also produce a conventional waist-up composition without lens shift.
Ruling: landscape gate is 36 x 20.25mm; portrait rotates that crop to 20.25 x 36mm. Both fit within a rotated 36 x 24 full-frame sensor. No camera translation on ratio change.
Ruling: use behavioral integration tests instead of tests of constant declarations or mocked WebGL. Each stage retains meaningful test coverage.

Tasks 1-5: implemented and verified with app shell, camera math/store/persistence, landmark projection, fallback, control and menu tests. First RED runs failed on absent modules, followed by GREEN. 17 tests passed at that checkpoint.
Tasks 6-7: implemented; 37 tests passed including drag parameter isolation and shot classification fixtures.
Task 8: prompt implemented, 40 unit/component tests pass. Initial browser run: workspace and menus pass; landscape frame ratio failed at 2.45 instead of 1.778. Fixed CSS container sizing; 3/3 browser tests now pass.

Ruling: the whole-body 25% visibility cutoff incorrectly rejects valid face detail shots. Facial landmark visibility overrides that cutoff for CU/ECU. Covered by a tight-face fixture. Cost: oblique face crops remain heuristic.
Ruling: keep the native feature branch in the supplied checkout and group related work into verified commits instead of introducing a separate worktree or reproducing shell helper machinery.
Ruling: current minimum-radius guarantee is an orbit-center exclusion, not a complete body collision system. Do not claim full mesh collision prevention.
Tasks 1-8 implemented. Direct camera dragging and independent ring dragging verified in Chrome. Added visible ring grab knobs after overlap caused the roll gesture to select yaw. Preview aspect ratio checked at 1366x768 and 1600x1000; portrait checked too. Actual rendered lens/orientation matches authoritative projection.

Final calibration: initial pitch -6 degrees leaves visible headroom while retaining waist-up Medium Shot. Numerical input supports clearing/retyping before blur normalization. Orbit guide follows actual camera radius and height.

Fresh read-only whole-implementation review identified two issues: Full Shot with lateral clipping and low-angle face rejection based on torso position. Both reproduced in failing camera-state tests, then fixed in shared classifier. Review declined-to-judge rulings accepted: no mesh collision, initial pitch, portrait gate, close-face exception, screen-direction drag mapping, native checkout, conservative ambiguous oblique crops. These are documented V1 boundaries, not missing fixes.

README includes local startup, controls, framing conventions and limits. No deployment, backend, remote model or AI call. Final verification: 44/44 unit/component tests, 7/7 Chrome WebGL browser tests, and production build pass. Landscape and portrait screenshots visually inspected. Non-blocking tooling warnings: test environment imports multiple Three instances and Node experimental localStorage; production bundle size warning reflects Three.js. Cross-browser and real-hardware FPS certification are not claimed.
