# Mission Control — menu and character assets

## Main player — female and male

[Download the player asset/source ZIP](https://github.com/usmansiddiqui2059-oss/mainmenu/raw/refs/heads/main/downloads/Mission-Control-Player-Pack.zip). Two selectable appearances, eight actual directions, idle/walk cycles, cabin/EVA suits, three resolutions and an offline inspection preview.

Start with [player-pack/CLAUDE_HANDOFF.md](player-pack/CLAUDE_HANDOFF.md). Extract the ZIP and open `player-pack/preview/index.html`; use pause/step and the eight-direction strip to inspect the animation. The [turnaround review](player-pack/review/turnarounds.png) and [motion study](player-pack/review/Player-Animation-Study.mp4) are also included.


## Eight-person crew pack

[Download the complete crew pack ZIP](https://github.com/usmansiddiqui2059-oss/mainmenu/raw/refs/heads/main/downloads/Mission-Control-Crew-Pack.zip). The new [crew-pack/](crew-pack/) contains all eight character designs, portraits, cabin/EVA sprites, four facings, eleven animation states, editable sources and a standalone offline preview.

Give Claude the ZIP and start with [crew-pack/CLAUDE_HANDOFF.md](crew-pack/CLAUDE_HANDOFF.md). After extracting, open `crew-pack/preview/index.html`, or view [the motion study](crew-pack/review/crew-motion.mp4). The crew pack is independent of the menu package described below.


A complete local menu package for the Mission Control React / TypeScript game. The second revision replaces the previous typography, page-like layout, olive color grade, procedural scenery, miscellaneous captions, footer branding and sound controls.

This patch corrects the Settings technician: a rear three-quarter work pose, appropriate foreground scale, planted boots, bracing hand and tool tip anchored to the board.

## Download and Claude handoff

[Download the complete project ZIP](https://github.com/usmansiddiqui2059-oss/mainmenu/archive/refs/heads/main.zip). You can also use GitHub's **Code → Download ZIP** button.

Start with [CLAUDE_HANDOFF.md](CLAUDE_HANDOFF.md), then [docs/CODE_MAP.md](docs/CODE_MAP.md). The latest Settings correction is described in [SETTINGS_FIX.md](SETTINGS_FIX.md). Download and extract the ZIP to use all images, fonts, source files and the offline preview.

## Try it

Download and open `dist/Mission-Control-Preview.html` in a current desktop browser. All JavaScript, scene images and the licensed display font are embedded. There are no runtime web requests, videos, external fonts or API keys. If a file viewer shows source instead of running the page, download the HTML and open it in a browser.

The initial pad scene holds for six seconds, ignites, retracts its access arm and launches the vehicle. A launch runs once per visit; it does not teleport back into place. Hovering or focusing a menu option changes scenes. Leaving the navigation returns to the launch pad and starts a fresh sequence through a brief cut through darkness.

| Choice | Background and motion |
| --- | --- |
| Initial view | Earth launch complex at night, connected shuttle / booster assembly, ignition and ascent |
| Play Game | Detailed crew-cabin cutaway above Earth's night side, tethered crew movement |
| Continue Game | Same cabin scene; resumes the actual host save when connected |
| Sandbox mode | Dry Martian dunes, rover, thermal sunshade, astronaut reclining in a sealed pressure suit |
| Settings | Electrical maintenance bay, rigged repair movement, tool-tip contact arc |
| About the event | A physical rotating orbital sculpture in a dark observatory; no team logo |

The main screen contains only the title and five unnumbered choices. The selected choice keeps the arrow. There is no status header, tagline, scene caption, serial-number decoration, footer, logo credit, mute button or pause button. Scene motion is controlled inside Settings.

## Development

Use Node 20.19+ (or Node 22.12+) and pnpm:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm test
pnpm test:preview
```

`pnpm build` runs TypeScript, Vite and the self-contained HTML packager. `pnpm test:preview` executes the actual compiled JavaScript in jsdom. The image decoder, scene raster and browser layout are verified separately; see `VALIDATION.md` for the precise limits.

To regenerate the palette-constrained plates and the six suit snapshot SVGs:

```sh
pnpm art:build
```

This uses the included original concept atlas, observatory concept and pure TypeScript rig. It does not call an image service. The checked-in native PNGs and SVG snapshots are ready to use; normal application builds do not need to regenerate them.

## Visual system

The title and all navigation use self-hosted **Barlow Condensed, weight 500**, with controlled tracking and consistent uppercase treatment. Paragraphs retain a simple readable system sans. The font's SIL Open Font License is included.

Every environment plate is **480 × 270** on one **Mission Night 48** palette, specified in `art-src/palette.hex`. The palette uses ink black, midnight blue, neutral hardware greys, warm ivory, copper, restrained amber and Martian earth colors. This deliberately replaces the brief's proposed Endesga 32 palette to follow the user's direct revision request. No runtime color filters, gradients, grain overlays, bloom or backdrop blur are applied.

The renderer uses whole-number scale factors, integer camera placement and nearest-neighbour sampling. Dynamic sprite primitives write fully opaque or fully transparent pixels directly, without canvas path anti-aliasing. Display text is normal vector text, following the user's Half-Life-inspired typography direction rather than the brief's optional pixel display font.

The original AI-assisted environment concept atlas and observatory concept is included and credited. A reproducible build pass crops it, reduces it to the shared native grid and palette, and cleans the menu field. The moving shuttle, suit construction, limb solver, tether, tools and orbital sculpture are original code-defined artwork. The credits distinguish these contributions; the package does not claim the generated concept painting was hand-painted.

## Animation and interaction

One renderer owns one capped 30fps frame loop. It draws a decoded native plate and a small dynamic sprite layer. Paused scenes and hidden tabs stop scheduling scene frames. A 90ms hover-intent delay prevents accidental flicker. Scene transitions are 240ms cuts through darkness, without image overlap, blur or hue mixing. Rapid selections replace the pending scene cleanly.

The same pressure suit is used in all three character scenes. Two-bone inverse kinematics keep upper arms, forearms, thighs and shins at the same lengths across every pose. Breathing moves the collar, torso and shoulder roots together; elbows solve back to the hand targets. The backpack and hose stay attached. The repair tool follows the hand, and its contact arc appears at its tip. The slight float and tether movement share the same body motion. A pressure suit's rigid bulk is not exaggerated into an inflatable chest effect.

Up/Down navigate, Home/End jump, Enter/Space activate and Tab works normally. Dialogs trap focus, Escape closes them, and focus returns to the invoking option. System reduced-motion preferences disable scene animation and scene transition motion. Settings also control animation and menu text size. Full-screen mode is offered only when the browser supports it.

## Integration and scope

Read **CLAUDE_HANDOFF.md** first, then **docs/CODE_MAP.md**. The package provides the menu, relevant visual assets, settings, a small destination chooser and preview staging. It does not contain physics, mission scoring, crew AI or a complete gameplay save.

`Title` exposes new-game, continue and sandbox callbacks plus an optional real-save metadata adapter. Without callbacks, the preview demonstrates those actions with a local staging screen. The existing game's full store and navigation remain authoritative.

The persistence key remains `mission-control-menu-v1` to preserve earlier local demo saves. Legacy sound settings are discarded during validated hydration; motion and text-size preferences survive. A storage-denied environment still works for the current session.

`review/` contains native scene and rig reviews, typography layout studies and a rendered motion study. The layout studies are **native composites, not browser screenshots**; the motion study uses the actual scene rig functions, without HTML or DOM interaction. They are review aids, not runtime dependencies.
