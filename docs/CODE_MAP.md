# Code map and operating details

## Entry and UI

| Module | Owns | Important behavior |
| --- | --- | --- |
| `src/main.tsx` | Standalone React root | Renders `Title` in StrictMode and imports the single global stylesheet. Do not copy it over a host root. |
| `screens/Title.tsx` | Menu orchestration | Holds selected option, active dialog and preview-ready metadata. Maps action to scene, chooses host or demo save, and dispatches callbacks. No simulation logic. |
| `ui/MenuOptions.tsx` | Five choices | Unnumbered text and retained arrow. 90ms hover intent, immediate keyboard focus, wrapped Up/Down, Home/End, native Enter/Space. Cancels hover timers on exit and unmount. |
| `ui/Modal.tsx` | Shared submenu shell | Left-aligned rounded panel, focus trap, Escape, outside-click dismissal and focus restoration. Panel entry/exit and internal view transitions share the same easing. No backdrop blur. |
| `screens/Expedition.tsx` | Destination choice and standalone staging | Uses native Moon/Mars cards. Emits validated metadata; the host callbacks replace staging. |
| `screens/Settings.tsx` | Preferences and display | Animation, text size, supported-browser full-screen toggle. Observes full-screen changes and catches rejected browser requests. |
| `screens/About.tsx` | Event description | Short text and an explicit external link, no team logo. |
| `ui/Icons.tsx` | Arrow | One simple inline SVG. |
| `src/index.css` | Entire visual system | Self-hosted display font, compact menu, responsive treatment, submenu styling and reduced-motion CSS. No grain, gradients or blur. |

The title and main options do not receive decorative entrance motion. A selected arrow moves five pixels into place. Main navigation disappears as the submenu enters. The scene persists behind the submenu, using the action's scene; a pointer leaving the hidden main menu does not change a Settings dialog into the launch scene.

## State and contracts

`content/menu.json` contains title, version, event, five menu labels / scene mappings, native resolution, frame cap, transition and hover timing, seed, and destination copy. `schemas/menu.ts` validates it with Zod and derives `SceneId`, `MenuAction`, `Preferences` and `MissionSave` types. The seed is retained for compatibility with the supplied architecture; v2's rig motion is deterministic from time and needs no randomness.

`store/menuStore.ts` owns an isolated Zustand store. Every React read uses a selector. `persist` saves only preferences and demo mission metadata. Hydration validates both pieces independently, preserves valid data, strips obsolete sound fields and rejects invalid values. The key remains `mission-control-menu-v1` on purpose. `store/storage.ts` catches browser storage access failures and keeps a bounded session-memory value for each key.

A host-provided `savedMission` always takes precedence over demo metadata. Passing null deliberately represents no host save. Callback metadata is not a complete mission snapshot. The host owns engine initialization, errors, routing and real persistence.

`engine/rng.ts` remains a small pure seeded RNG and is covered by a reproducibility check. It imports neither React nor UI. Do not duplicate it into a host that already has a seeded RNG.

## Scene pipeline

1. `controlroom/plates.ts` imports the five native scene images, using Vite inline asset handling. Its cached preload Promise decodes the five scene plates once.
2. `controlroom/MenuScene.tsx` starts a renderer only after preload resolves. An active flag prevents construction after unmount. A latest-props ref preserves hover and reduced-motion changes that occur while loading.
3. Before the renderer is ready, the launch plate is a static poster. A preload failure leaves a usable menu and poster and logs the error; it does not hide navigation.
4. `MenuScene` observes container size; the pure `viewport.ts` helper calculates framing. Scale is `max(ceil(width/480), ceil(height/270), 1)`. Width, height and camera offsets are integer pixels. Desktop cropping favors the right-side subject; narrow screens center each active subject and add a flat black readability veil.
5. `controlroom/renderer.ts` owns the display canvas, a transparent sprite canvas, a transition snapshot and a pixel buffer. Decoded plates are reused, not redrawn as vector geometry.
6. Each frame draws the native plate, clears and paints the sprite buffer, copies it into a reusable upload buffer in the sprite canvas, then composites that canvas onto the display.
7. Transitions draw the previously displayed snapshot for the first 35% of 240ms, fade it to black, then reveal the new scene. They never overlap old and new artwork. A new selection captures the frame already displayed, so interrupted transitions remain coherent. The narrow-screen camera receives its new subject only at the black point, avoiding a visible framing jump before the new scene appears.
8. Scene age resets on entry. Each active scene animates from its own age. The renderer advances time only while visible and enabled, caps its frame rate, carries timing remainder for stable pacing and clamps long-frame time jumps.
9. Disabling motion renders time zero and cancels the frame request. Hidden tabs also cancel it. Resume resets wall-clock bookkeeping so the scene does not jump ahead. `dispose()` cancels the frame and removes its document listener. StrictMode mount/cleanup is supported.

The decoded image cache is module-scoped and bounded to five plates for reuse across title-screen visits. It is not a growing per-hover cache. The renderer has no per-frame React state updates.

## Pixel and suit geometry

`controlroom/pixels.ts` implements integer rectangles, Bresenham lines, scanline polygons and stepped ellipses directly into RGBA bytes. Sprite pixels use alpha 0 or 255 only. Canvas path anti-aliasing, fractional sprite positioning, image smoothing and soft glows are avoided. The palette values in `suit` are shared across poses and are verified against `art-src/palette.hex`.

`rig/astronaut.ts` has two layers:

- `solveSuitPose` defines the torso root, collar, shoulders, wrists and ankles for float, repair and rest. A very small breathing cycle moves the torso / collar connection and shoulders together. Float adds shared body drift. Repair wrists stay at the work surface.
- `twoBone` solves elbows and knees, preserving upper/lower arm lengths of 11/12 native pixels and thigh/shin lengths of 16/16. Unreachable targets are clamped safely. The drawing layer then builds consistent bulky pressure segments, bellows, boots, gloves, chest module, identification stripes, helmet ring, dark visor, life-support pack and attached hose.

`rig/workshop.ts` renders the rear-view repair construction at the foreground scale appropriate to the workbench. The character faces the board, with the support hand on the bench and both boots on the floor. The tool is drawn between the right wrist and a fixed board contact, rather than as an independent floating prop. The tether terminates on the drifting body. A rigid pressure suit receives restrained motion rather than exaggerated torso swelling.

## Native anchors

Coordinates are in the 480×270 world and are visual placement, not game physics.

| Scene | Anchor / motion |
| --- | --- |
| Launch | Stack base `(350,243)`. Standby to 6s, ignition ramps 6–9s, access arm retracts from 8s, ascent from 11–19s. After departure the pad remains empty. Returning from another scene starts a fresh visit. |
| Crew cabin | Suit root input `(393,210)`, floating pose. Tether anchored to cabin `(345,215)`. |
| Mars | Suit root input `(404,220)`, seated/rest pose aligned to the chair. Rover mast camera turns slowly. |
| Workshop | Rear three-quarter suit, local root `(44,72)`, origin `(264,70)`, 2× foreground scale. World root `(352,214)`; fixed tool contact `(304,114)` on the circuit board. Bracing hand and boots remain planted; the driver rotates about that fixed contact. |
| Event | Orbital sculpture centered near `(365,126)`, above the exhibit platform at `(365,205)`. Rigid orbit rings rotate as linked physical pieces; no logo text. |

`scenes/animate.ts` dispatches the active scene's moving elements. `rig/shuttle.ts` draws tank, orbiter, boosters, plumes and access-arm geometry from the same launch state and transform. `scenes/event.ts` contains the orbital sculpture. If an artist replaces a background plate, update its anchors deliberately in these functions and the asset metadata; do not nudge individual limbs to compensate for a misplaced character.

## Art sources and regeneration

`art-src/environment-concept-atlas.png` is the credited AI-assisted source concept. `scripts/build-plates.mjs` crops four cells, resamples by nearest neighbour, quantizes into the shared 48-color palette, cleans the menu field, and writes the four scene plates. The additional observatory concept follows the same native palette pass; the destination cards are then generated. `art-src/plates.json` records output dimensions, paths and anchors.

`pnpm art:build` runs that script, then executes the native artwork check with snapshot export enabled. Six transparent 88×88 menu-suit SVGs are generated from the same live rig, with same-color horizontal pixels merged into rectangles. They are below the brief's 60KB guidance and do not contain partial alpha. The supplied menu rig deliberately uses a larger native character size than the brief's generic 24×32 EVA sprite; these are menu assets, not drop-in replacements for a gameplay sprite with a fixed smaller contract.

Keep the checked-in PNGs for big backgrounds. `public/assets/sprites/` is optional for the live menu. Source plates and the font are embedded into the production JS / CSS so the standalone preview has no file dependencies. Public assets are also included separately for a host or artist to reuse.

## Builds, reviews and tests

- `vite.config.ts`: relative base, React and Tailwind, forced inline build assets.
- `scripts/standalone.mjs`: embeds the built JS and CSS in one HTML file; rejects dynamic import splitting.
- `scripts/verify-preview.mjs`: executes the actual bundled module in jsdom with deterministic image/canvas stubs; checks main-screen scope, Settings, persistence, submenu exit and Sandbox staging.
- `tests/menu.test.tsx`: menu behavior, saved-state handling, callbacks, keyboard operation and removed UI.
- `tests/renderer.test.ts`: stopped frame scheduling, disposal, fixed joint lengths and storage failure fallback.
- `tests/artwork.test.ts`: real native canvas rendering, exact opaque palette, alpha rules and optional SVG export.
- `tests/review-export.test.ts`: opt-in generation of layout studies and native motion frames. It is skipped during ordinary tests.

To recreate review studies from the actual art and rig:

```sh
MC_REVIEW_EXPORT=1 MC_ARTIFACT_DIR=work/review pnpm exec vitest run tests/review-export.test.ts
```

For frame exports add `MC_VIDEO_FRAMES=1`. The environment variables shown use POSIX shell syntax; on Windows set them with PowerShell's `$env:` syntax before running the command. The optional video is encoded from those native frames. It is not used by the menu.

`CREDITS.md`, `REFERENCE_NOTES.md`, `VALIDATION.md` and `docs/DESIGN_NOTES.md` explain provenance, the source documents, checks and deliberate art-direction decisions. No automatic repo rules or unrequested full-game asset tasks are implied by the reference documents.
