# Source map · repaired crew

| File                                           | Responsibility                                                                                                                   |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `content/crew.json`                            | Stable roster/roles/traits, heights, personality, cadence and original concept crop annotations                                  |
| `content/models.json`                          | Shoulder/hip dimensions and directional head target height                                                                       |
| `content/animations.json`                      | Eleven IDs, eight frames, baseline timing and looping                                                                            |
| `content/roles.json`                           | Role descriptions and accent palette                                                                                             |
| `art-src/palette.hex`, `content/palette.json`  | One 64-color palette; JSON is generated from the hex file                                                                        |
| `art-src/crew-concept.png`                     | Original full-body reference and portrait source                                                                                 |
| `art-src/crew-heads-a.png`, `crew-heads-b.png` | Dedicated front/rear directional head artwork                                                                                    |
| `art-src/head-sprites.json`                    | Generated palette indices, alpha, feature-region tags, neck anchors and source crop coordinates                                  |
| `src/data.ts`                                  | Validated content and standard frame contract                                                                                    |
| `src/human/data.ts`                            | Visual models, pressure-suit materials, camera/projection and base gait parameters                                               |
| `src/human/math.ts`                            | 3D vectors and two-bone IK                                                                                                       |
| `src/human/pose.ts`                            | Shared grounded idle/walk skeleton                                                                                               |
| `src/pose.ts`                                  | Role/signature/action targets, tools, bracing and zero-g poses                                                                   |
| `src/human/raster.ts`                          | Depth-tested meshes, stepped shading and pixel outline                                                                           |
| `src/human/render.ts`                          | Solid suit/body volumes, joints, gloves, boots, control unit, role patches, pack, instruments, helmet and directional head layer |
| `src/render.ts`                                | Public crew renderer and standard-size sampling from detail pixels                                                               |
| `src/pixels.ts`, `src/human/pixels.ts`         | Integer pixel buffers/primitives for standard and detailed raster stages                                                         |
| `src/manifest.ts`                              | Version 1.1.0 output schema                                                                                                      |
| `adapters/canvas.ts`, `canvas.js`              | Runtime frame/pivot/attachment selection, EVA guard and matching projected walking velocity                                      |
| `scripts/prepare-heads.ts`                     | Alpha cleanup, quantization, connected head cleanup and neck alignment; braid-aware anchor for Zara                              |
| `scripts/build.ts`                             | Three atlas sizes, all frame metadata, standard and detail stills                                                                |
| `scripts/portraits.ts`                         | Existing matched portrait crops and expressions from the original concept                                                        |
| `scripts/stills.ts`                            | Small individual/legacy SVG and PNG compatibility exports                                                                        |
| `scripts/lib.ts`                               | Canvas upload and integer-path pixel SVG export                                                                                  |
| `scripts/design-review.ts`, `review.ts`        | Full action, walk, front and rear contact sheets                                                                                 |
| `scripts/preview.ts`, `preview/*`              | Self-contained inspection HTML, selections, stepped playback, physical floor and contact guides                                  |
| `scripts/adapter.ts`                           | Emits dependency-free runtime JS from TypeScript                                                                                 |
| `scripts/rebuild.ts`                           | Ordered generation pipeline                                                                                                      |
| `scripts/video.ts`                             | Optional ffmpeg motion study from actual exported detail atlases                                                                 |
| `scripts/verify.ts`                            | Atlas/path checks and SHA-256 inventory                                                                                          |
| `tests/`                                       | Geometry, contact, full-frame, face/rear/EVA, adapter and offline viewer checks                                                  |

The earlier `skin.ts`, cropped fabric limb textures and recolored-head rendering are removed. The original concept annotations remain for portraits/reference; `heightCm` is authoritative for the body rig. Source paths are relative and both this folder and its ZIP are standalone. Build before tests after changing source. No generator dependency is needed to draw the PNG/SVG assets in the game.
