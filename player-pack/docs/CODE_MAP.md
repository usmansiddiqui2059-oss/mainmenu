# Editable source map

| File                                          | Responsibility                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `content/players.json`                        | IDs, human heights/build dimensions, head target height and appearance metadata                                       |
| `content/suit.json`                           | Shared suit materials and description                                                                                 |
| `content/animations.json`                     | Frame counts/fps, stance fraction, stride and clearance                                                               |
| `content/palette.json`, `art-src/palette.hex` | One 64-color palette; JSON is regenerated from palette.hex                                                            |
| `src/data.ts`                                 | Source validation, frame constants, direction yaw and movement metrics                                                |
| `src/math.ts`                                 | Vector math and fixed-length 3D two-bone inverse kinematics                                                           |
| `src/pose.ts`                                 | Grounded gait targets, opposite arms, breathing and planted-foot flags                                                |
| `src/raster.ts`                               | Orthographic projection, depth buffer, mesh primitives, stepped materials, texture sampling, silhouette outline       |
| `src/render.ts`                               | Connected anatomical volumes, suit shells/seams, pockets, backpack, boots, helmet and neck-anchored directional heads |
| `src/manifest.ts`                             | Typed output contract and Zod schema                                                                                  |
| `adapters/canvas.ts`                          | Runtime frame selection, pivot drawing, input direction and projected velocity                                        |
| `adapters/canvas.js`                          | Generated dependency-free ES module for direct use                                                                    |
| `scripts/prepare-faces.ts`                    | Transparent eight-direction head sheet → normalized, quantized, neck-aligned head sprites                             |
| `art-src/head-sprites.json`                   | Generated head palette indices, transparency, neck anchors, source rectangles and feature-region tags                 |
| `scripts/build.ts`                            | Three atlas resolutions, direction strips, PNG/SVG stills, portraits, manifest, reviews, preview and JS helper        |
| `scripts/rebuild.ts`                          | Runs face preparation, then the export build                                                                          |
| `scripts/pixel-export.ts`                     | Native Canvas upload and integer-path pixel SVG generation                                                            |
| `scripts/review.ts`                           | All-view/suit turnaround contact sheet                                                                                |
| `scripts/cycles.ts`                           | Every walk frame from every direction for both players                                                                |
| `scripts/preview.ts`                          | Embeds images/font/manifest/JS into one offline HTML                                                                  |
| `preview/shell.html`, `preview/viewer.js`     | Inspection UI, shared-phase views, projected floor, pause and frame stepping                                          |
| `scripts/video.ts`                            | Optional ffmpeg motion review from the actual exported atlases                                                        |
| `scripts/verify.ts`                           | Output dimensions, safe paths, frame bounds and SHA-256 inventory                                                     |
| `tests/`                                      | Full-frame geometry, palette, contact, eyes/occlusion, adapter and preview tests                                      |

Build output is ready to use. Rebuilding needs Node/pnpm, but runtime PNG/SVG drawing has no native dependencies. All paths are relative to this folder. The original concept stays in `art-src/player-concept.png` for provenance and further art work. Only assets and an adapted helper belong in the host bundle.
