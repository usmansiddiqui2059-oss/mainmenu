# Source map

| File                       | Responsibility                                                                                        | Safe edits                                                      |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `content/crew.json`        | Eight stable IDs, roles, traits, appearance, height, personality, tempo, concept crop rectangles      | Visual details and cadence; preserve IDs/roles when integrating |
| `content/rig.json`         | Neutral neck, shoulders, elbows, hands, hip, knees and feet for each person                           | Joint coordinates in master pixels                              |
| `content/roles.json`       | Shared role names, patch accents and instrument descriptions                                          | Patch colors and tool descriptions                              |
| `content/animations.json`  | Eleven action IDs, eight frames, baseline fps, loop/one-shot flags                                    | Timing; adding rows requires schema/export updates              |
| `src/data.ts`              | Zod validation of source data, constants, types                                                       | Schema and frame dimensions                                     |
| `src/pose.ts`              | Deterministic shared and personal joint targets, expressions, tool state, planted-foot flags          | Choreography; keep loops periodic                               |
| `src/kinematics.ts`        | Two-bone inverse kinematics with reach clamping                                                       | Solver only if tests remain valid                               |
| `src/skin.ts`              | Palette-texture deformation by body/arm/leg parts with blended joints                                 | Partition boundaries, joint blends                              |
| `src/render.ts`            | Layer order, continuous joint underlays, helmet, PLSS, gloves, held tools, rear view, final mirroring | Pixel geometry and suit details                                 |
| `src/pixels.ts`            | Integer raster primitives, binary alpha, clipping counter                                             | Drawing primitives                                              |
| `src/textures.ts`          | Nearest-neighbour texture reads and optional bone resampling helpers                                  | Texture utilities                                               |
| `src/manifest.ts`          | Output contract and Zod manifest schema                                                               | Coordinate/timing contract; update adapter too                  |
| `adapters/canvas.ts`       | Runtime frame selection, EVA guard and anchored Canvas draw                                           | Adapt to host renderer; no native Canvas runtime import         |
| `scripts/prepare-art.ts`   | Original concept → native transparent bases, palette reduction and source anchors                     | Crop/mask policy; sources remain in repo                        |
| `scripts/build.ts`         | Master/gameplay atlas PNGs, master stills, full manifest                                              | Export layout; paths relative to asset root                     |
| `scripts/portraits.ts`     | Matched 64 × 64 head/shoulder crops and subtle expressions, PNG/SVG                                   | Face annotations and expressions                                |
| `scripts/stills.ts`        | Small brief-compatible individual idle/walk SVG/PNG and Ayesha aliases                                | Legacy compatibility exports                                    |
| `scripts/design-review.ts` | Front cabin/EVA lineup                                                                                | Review only                                                     |
| `scripts/review.ts`        | All-action contact sheet and rear-view lineup                                                         | Review only                                                     |
| `scripts/preview.ts`       | Embeds manifest, PNGs, font and viewer into one HTML                                                  | Offline packaging                                               |
| `preview/shell.html`       | Preview structure/styles                                                                              | Review UI only, not game menu                                   |
| `preview/viewer.js`        | Crew/state selectors, frame clock, lazy image cache, pause/step/replay, context guides                | Review interaction                                              |
| `scripts/rebuild.ts`       | Runs the above export stages in dependency order                                                      | Build sequencing                                                |
| `scripts/video.ts`         | Optional ffmpeg motion-study export                                                                   | Review only; ffmpeg dependency is optional                      |
| `scripts/adapter.ts` | Emits dependency-free `adapters/canvas.js` from the TypeScript helper | Runtime JS packaging |
| `scripts/verify.ts`        | Manifest/path/dimension checks and file SHA-256 index                                                 | Package verification                                            |
| `tests/*.test.ts`          | Full-frame, rig, adapter and embedded-viewer checks                                                   | Behavior verification                                           |

`art-src/crew-concept.png` is the original generated visual concept, not a runtime atlas. `art-src/bases/` contains its native, palette-constrained cutouts. `art-src/base-anchors.json` maps head rectangles into the master grid. `art-src/previous-suit-reference.png` documents the prior menu's suit family. `art-src/palette.hex` is the single 64-color export palette.

`review/base-designs.png` is the palette/crop diagnostic generated alongside the bases.

Build order: prepare bases → atlas/manifest → portraits → compatibility stills → design/action reviews → embedded preview → runtime JS adapter. `pnpm check` type-checks all executable TypeScript. Tests read the built assets, so build before tests after editing source. The generated manifest is minified for runtime loading; human-edited content JSON stays formatted. No files depend on absolute workspace paths. `node_modules`, caches and local work files are excluded from delivery.

For Phaser/Pixi/Godot, treat a master atlas as eight columns by eleven rows. Use each manifest row's fps and loop flag. Anchor at `(0.5, 88/96)` for the full 64 × 96 frame, not its visible trim bounds. If an engine trims transparent pixels, preserve the original frame and pivot metadata. Attachment anchors are already in the selected facing's image space.
