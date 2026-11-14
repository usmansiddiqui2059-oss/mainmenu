# Validation — revision 2.0.1

## Settings correction

The repair astronaut is now a rear three-quarter foreground figure facing the board. The body is scaled to the bench, both boots and the bracing hand remain planted, and the driver turns around a fixed contact at `(304,114)`. The arc uses that same contact. The revised native frame was inspected. The other four scene renders match the previous revision byte for byte.

## Passed

- TypeScript project compilation and Vite production build.
- **22 automated checks passed** across the menu, renderer and native-artwork suites. The optional review-export check is skipped during normal tests and was also run separately to generate the review files.
- Menu checks cover exactly five unnumbered choices, removal of the old header/footer/credit/captions, hover scene mapping, pointer exit, arrow-key navigation, empty-save behavior, campaign and sandbox callbacks, resume, host-save precedence, legacy preference hydration, invalid data recovery, Settings, Escape, focus restoration, focus trapping and standalone staging.
- Rig / renderer checks cover fixed arm and leg lengths in every pose over many breathing phases; integer viewport framing and scene coverage at six desktop / phone sizes; camera handoff at the dark point of a scene cut; no scheduled scene drawing while paused; resume and disposal; reuse of the pixel upload allocation; and browser-storage failure fallback.
- The actual bundled HTML executes in jsdom: initial mount, all five choices, removed UI, embedded display font, Settings, persisted animation preference, dialog exit, sandbox staging and no uncaught runtime errors. The script and stylesheet are fully embedded; the scene PNGs and font are data URIs.
- All five scene plates and live rigs render in a real native canvas implementation. Every scene pixel is opaque and belongs to the shared 48-color palette. Suit snapshot transparency is binary. The scene contact sheet, suit sheet, typography layout studies and revised observatory were visually inspected.
- A separate clean directory installed from the frozen lockfile using the cached package store, including approved esbuild installation. It passed a fresh TypeScript / Vite build and the compiled-preview smoke check. The fresh build produced byte-identical JavaScript and CSS.
- A 12-second, 960×540 VP9 motion study was rendered from the actual native scene functions and decoded successfully. It shows the launch and three suit poses; it is a review aid rather than a screen recording.
- Production output is approximately **1.29 MB uncompressed** including embedded images and font, approximately **764 KB gzip** for JS and CSS. Runtime art files are below the reference's 10 MB budget. The larger single JS chunk is intentional so the HTML preview opens offline without dynamic imports; most of its added size is embedded art.
- The delivery ZIP is checked for integrity, required source / asset / guide entries, and SHA-256 hashes of every packaged file.

## Limits

The managed environment did not expose the browser-control tool required by its preview workflow. No alternative browser-control route or preview server was started. Full browser CSS layout, touch interaction, full-screen permission behavior and GPU frame timing were not directly observed.

The bundled DOM checks use image/canvas stubs. Native scene rendering, exact palette checks and rig geometry are tested separately. Layout studies are native compositions of the actual assets and display font, **not browser screenshots**. The motion study is rendered from code, **not a browser recording**. These checks cannot replace a target-browser inspection after integration.

The 30fps cap is an implementation target, not a guaranteed benchmark for every GPU or power mode. System reduced motion and the Settings toggle stop scene animation. The README and Claude handoff include target-device checks.

The standalone mission-ready screen demonstrates menu integration. Actual physics, crew state, gameplay routing and full saved expeditions belong to the host project and must be wired through the documented callbacks.
