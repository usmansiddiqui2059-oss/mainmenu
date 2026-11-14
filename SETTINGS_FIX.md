# Settings astronaut correction — 2.0.1

The technician now faces the board in a rear three-quarter view, with a visible pressure helmet shell and life-support pack. Foreground scale matches the workbench. The support hand braces the bench, both feet remain planted, and the driver rotates about the board contact at `(304,114)`; the occasional contact arc shares that exact point.

## Files changed for an already integrated v2 menu

- `src/controlroom/rig/astronaut.ts`: rear-view repair construction and task-specific joint targets. Float and rest construction is retained.
- `src/controlroom/rig/workshop.ts`: new focused placement and contact module; must be copied.
- `src/controlroom/scenes/animate.ts`: dispatches the Settings technician through that module.
- `src/controlroom/viewport.ts`: narrow-screen focus follows the corrected technician at x=352.
- `public/assets/sprites/menu-suit-repair-1.svg` and `menu-suit-repair-2.svg`: refreshed optional snapshots; the live menu uses code geometry.
- `art-src/plates.json` and `scripts/build-plates.mjs`: revised placement metadata, preserved when rebuilding assets.
- Menu/package version metadata, the regression tests, review renders and handoff documentation.

No menu behavior, font or color change is part of this patch. The other four native scene renders match v2 byte for byte. The full ZIP includes the standalone project for convenience; when merging into the host game, follow `CLAUDE_HANDOFF.md` rather than replacing its root configuration.

The fixed-contact test checks hand support, foot support, invariant tool engagement and actual driver movement over a complete animation cycle. All 22 checks, TypeScript, production build and compiled-preview checks pass. The fresh build matches the main build byte for byte. Native imagery was inspected; the existing browser/GPU verification limits still apply.
