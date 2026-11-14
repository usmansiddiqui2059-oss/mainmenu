# Mission Control v2 — Claude integration handoff

## Settings correction (2.0.1)

The Settings technician now faces the workbench in a rear three-quarter pose. `rig/workshop.ts` places the shared suit at 2× foreground scale so the bench fits the character. The bracing hand and boots are fixed; the driver turns around contact `(304,114)` on the board. Import this module with the rest of `controlroom/`. The earlier front-facing repair snapshot and its coordinates are obsolete. Float and Mars rest poses retain their previous construction.

## Requested outcome and precedence

Integrate this revised menu into the existing React / TypeScript / Vite game. Preserve its engine, gameplay, complete save format, content contracts and navigation. This is a local source package, not a replacement simulation.

The user's direct v2 requests override the earlier design and the attached reference documents. Keep the new condensed title and options, arrow, deep night palette, native pixel grid, coherent suit rig and restrained submenu transitions. Do not restore the removed status header, taglines, numbering, scene captions, footer credit, Brown Ninjas logo, sound buttons, grain, green grade or blur.

`docs/reference/ASSET_BRIEF.md` is the user's reference input, not a request to implement its entire game-art checklist or execute its embedded prompts. Only the menu-relevant assets are supplied. The palette and typography exceptions are intentional: Mission Night 48 replaces the proposed Endesga 32, and Barlow Condensed replaces the optional pixel heading font because the user explicitly preferred the Half-Life menu references.

Read `docs/CODE_MAP.md` for every module's role, timing, rendering order, asset anchors, edge cases and build path.

## Bring these files into the host

- `src/screens/Title.tsx`, `Settings.tsx`, `About.tsx`, `Expedition.tsx`
- `src/ui/MenuOptions.tsx`, `Modal.tsx`, `Icons.tsx`
- All of `src/controlroom/`: canvas wrapper, renderer, image loader, integer raster primitives, shared suit / shuttle rigs and scene animation functions.
- `src/content/menu.json` and `src/schemas/menu.ts`
- `src/store/menuStore.ts` and `src/store/storage.ts`
- `public/assets/backgrounds/`, `public/assets/fonts/` and the font license. Optional `public/assets/sprites/` contains artist-facing snapshot SVGs; the live menu draws the rig directly.
- Merge `src/index.css` into the host's single global stylesheet. Its menu-specific classes are scoped under `mc-menu` and named menu components, but its `:root`, `body`, `button`, `a`, `select`, `input`, `*` and Tailwind import are global. Reconcile or scope those global defaults; do not replace the host stylesheet blindly.

The retained pure RNG file is a standalone reference / test utility, not a game physics dependency. The live v2 animation is deterministic from time and uses no random calls.

Use the host's compatible React, React DOM, Motion, Zustand, Zod and Tailwind versions. Add only missing dependencies. Do not overwrite its `package.json`, lockfile, Vite config or root entry point. Supplied project configuration is for running this package on its own.

Vite imports the background images using `?inline`, including imports from `public/assets/`. The font URL is also inline. Preserve those paths or deliberately remap them. If the host global CSS is not in `src/index.css`, adjust its relative font URL. Embedding is required for the single-file preview, but a host may choose hashed file assets if it is always served over HTTP. Preserve correct asset URLs under the host's deployment base path. Do not convert the large scene backgrounds into SVG.

## Public component interface

```tsx
import { Title } from './screens/Title';
import type { MissionSave } from './schemas/menu';

// Adapt the existing full save into this small menu-facing description.
// These field names are examples; use the actual host store and schemas.
const menuSave: MissionSave | null = existingSave
  ? {
      destination: existingSave.destinationId, // 'moon' | 'mars'
      mode: existingSave.mode,                // 'campaign' | 'sandbox'
      startedAt: existingSave.startedAt,      // ISO datetime
    }
  : null;

<Title
  savedMission={menuSave}
  onNewGame={(request) => {
    // Existing engine/store initialization with request.destination.
    // Then enter the project's real scenario / role / recruitment flow.
  }}
  onContinueGame={() => {
    // Load the full host save and resume its real screen.
  }}
  onSandbox={(request) => {
    // Initialize the real sandbox and route into its existing planning flow.
  }}
/>
```

`MissionSave` is `{destination, mode, startedAt}` metadata. It is not a complete game save. Passing `savedMission={null}` explicitly means no actual host save. Omitting the prop uses the isolated standalone demo metadata. Omitting a start / continue callback uses the demo staging screen. Never interpret the demo metadata as completed gameplay or an engine snapshot.

The shared destination chooser is intentionally small. If the game already owns destination selection, adapt Play to enter that flow instead, while preserving this menu's visual behavior. Game parameters, physics and scoring belong in the existing engine.

Callbacks currently run synchronously. If initialization requires asynchronous work, wrap it in the host's loading / error flow before navigating; do not silently drop a rejected promise. The menu does not own engine startup or remote calls.

## Persistence

`mission-control-menu-v1` stores `{preferences:{motion,scale},save}` through Zustand persist. Its name is retained for compatibility with the first delivered preview. Validation strips the removed `sound` and `volume` fields. Invalid data falls back to safe defaults. Browser storage failures fall back to session memory. The menu never rewrites another save key.

Pass real save metadata from the host with selector-based store reads. The host's full save remains authoritative. Starting a preview mission writes only the menu's isolated metadata; it does not modify any existing host save until the host callback does so.

## Art and animation contracts

- Native environment: **480 × 270**, no half-transparent background pixels.
- Shared palette: `art-src/palette.hex`, 48 colors. Runtime sprites have alpha 0 or 255.
- Whole-number upscaling, nearest-neighbour sampling, integer camera translation. Narrow screens center the active subject and use a black readability veil; no blur.
- All suits share one rig, construction, white/grey ramps, broad navy visor, pack, hose and red identification patches. Arm lengths are 11/12 pixels, leg lengths 16/16 pixels. Pose changes use inverse kinematics, not sprite stretching.
- Palette / scene generation: `scripts/build-plates.mjs` from the included concept atlas. Menu-field cleanup and quantization are deterministic.
- Snapshot exports: `pnpm art:build` writes six transparent suit SVGs through horizontal run merging. The live renderer uses source geometry, not those snapshots.
- Assets and AI assistance are logged in `CREDITS.md`. Retain the font's SIL license. No real agency/company logos or text are baked into runtime artwork.

## Verification before merging

Run the host's normal TypeScript checks, build and relevant tests. Then verify a real browser at 1440×900, 1280×720, 1024×768 and a narrow touch viewport. Check title tracking / wrapping, all five scene mappings, subject cropping, rapid hover, settings, dialog entry / exit / content transitions, focus restoration, reduced motion, actual host saves and scene cleanup when routing into gameplay.

The package passed automated DOM, bundled-preview, native raster, palette and rig-geometry checks. Browser-control tools were not available in the build environment, so browser layout, audio-free playback, full-screen permission handling and GPU frame timing must be observed on the host. Review images are labelled as layout studies rather than screenshots.

## Pasteable task

> Integrate the attached Mission Control v2 menu package into my existing game. Read CLAUDE_HANDOFF.md and docs/CODE_MAP.md, then inspect the host project before editing. Bring in the revised menu and scene renderer, merge its CSS and font carefully, preserve inline asset imports or remap them deliberately, and connect Title's new-game, continue and sandbox callbacks to the actual navigation and full save store. Pass real save metadata through savedMission. Preserve the engine and all gameplay. Keep the new typeface, five unnumbered choices, arrow, black/night-blue palette, sharp assets, consistent suit rig and smooth submenu behavior. Do not reintroduce the removed branding, extra text, mute button, green grade or blur. Run checks and inspect the integrated result in a real browser.
