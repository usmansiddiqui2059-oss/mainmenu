# Mission Control · Eight-person crew pack

Eight distinct fictional crew members, one pressure-suit family. This is the character asset pack; the existing menu remains a separate project in the parent directory.

**Open `preview/index.html` after extracting the ZIP.** It embeds the images, metadata and font, works offline, and lets you inspect every person, animation, suit, facing and resolution. `review/crew-motion.mp4` is a 20-second motion study. Neither needs an installation.

**Giving this to Claude:** start with [CLAUDE_HANDOFF.md](CLAUDE_HANDOFF.md), then [docs/CODE_MAP.md](docs/CODE_MAP.md). Include this entire folder. The ready assets are in `assets/`; installing Node is only necessary to regenerate or test them.

| ID     | Role / trait                     | Distinction                                   | Signature action                              |
| ------ | -------------------------------- | --------------------------------------------- | --------------------------------------------- |
| ayesha | Power & Life Support / Practical | 168 cm, sturdy, greying low bun               | Checks a wrist seal                           |
| maya   | Power & Life Support / Leader    | 162 cm, compact broad shoulders, cropped hair | Gives a calm open-palm acknowledgement        |
| bilal  | Comms & Navigation / Thinker     | 183 cm, lean, swept hair, earpiece            | Adjusts headset and checks readout            |
| lin    | Comms & Navigation / Leader      | 170 cm, balanced build, neat bob              | Listens and gives a measured readback nod     |
| sana   | Science / Thinker                | 159 cm, compact, tied waves, glasses          | Adjusts glasses and studies a detail          |
| kofi   | Science / Practical              | 180 cm, athletic, textured crop, neat beard   | Raises a sealed sample for inspection         |
| omar   | Launch & Budget / Practical      | 166 cm, stocky, grey hair and beard           | Deliberately follows a checklist              |
| zara   | Launch & Budget / Leader         | 178 cm, athletic, auburn braid                | Checks the plan, then indicates the next task |

The roster IDs, four roles and three trait names follow the supplied brief. Heights, builds and visual details are fictional design choices. The eight candidates support the game's four-person mission selection; this pack does not change team size or simulation rules. Character and gender differences use ordinary proportions, posture, hair and faces; suit construction stays consistent.

## Ready files

| Export                         |            Quantity | Format / size                                                   |
| ------------------------------ | ------------------: | --------------------------------------------------------------- |
| Master animation atlases       |                  64 | PNG, 512 × 1056; each frame 64 × 96                             |
| Gameplay animation atlases     |                  64 | PNG, 128 × 264; each frame 16 × 24                              |
| Animation frames               | 5632 per resolution | 8 crew × 2 suits × 4 facings × 11 states × 8 frames             |
| Portraits                      |     24 PNG + 24 SVG | 64 × 64; neutral, worried, happy                                |
| Master idle stills             |     16 PNG + 16 SVG | 64 × 96; cabin and EVA for everyone                             |
| Brief-compatible sprite stills |     40 PNG + 40 SVG | 16 × 24; idle + four walk frames per person                     |
| Legacy aliases                 |               7 SVG | Ayesha: crew-base idle/four walk frames, two 24 × 32 EVA frames |

`assets/manifest.json` contains paths **relative to `assets/`**, frame rectangles, individual timing, loop flags, suit/facing, attachment coordinates and foot-contact flags. All sprite PNG pixels have alpha 0 or 255. SVG exports use integer pixel paths and `crispEdges`. Atlases deliberately use PNG for fast runtime drawing. Source textures, neutral skeletons, pose code, concept art and palette are included for edits.

The 11 states are `idle`, `walk`, `work`, `talk`, `think`, `concern`, `celebrate`, `point`, `signature`, `eva_float`, `eva_repair`. `work` varies by role; `signature` varies by person. `point` and `celebrate` play once. The others loop. Individual tempo changes playback speed without breaking loop continuity.

Both front and rear three-quarter views are supplied; west-facing exports mirror their corresponding east-facing view. Facing names refer to screen diagonals, not geographic navigation. Use whole-number display scales and disable image smoothing.

## Use in the game

Copy `assets/` to the host's `public/assets/crew/`. The manifest becomes `/assets/crew/manifest.json`; for an atlas path from that manifest, prepend `/assets/crew/`. For the brief's existing portrait lookup, copy `assets/portraits/crew-*.svg` into `public/assets/portraits/` instead. Preserve the exact IDs.

Use [adapters/canvas.ts](adapters/canvas.ts) as a small engine-independent example. It chooses a frame, scales coordinates for either resolution, enforces sealed suits for EVA actions and draws around the common foot anchor. The generated `adapters/canvas.js` is the same helper without TypeScript or package imports and can be copied directly. Neither helper runs a game loop or alters your store.

Standing origin: **(32, 88)** in master frames; **(8, 22)** in gameplay frames. Draw at `worldPosition - origin × displayScale`. Sort characters by their world foot Y, never by the top of the image. Everyone uses the same frame size and origin; do not stretch shorter people to fit taller people.

Cabin = helmet off inside a pressurized environment. EVA = opaque sealed helmet with backpack. Always use EVA suits outside a pressurized vehicle or habitat. The included adapter and preview enforce EVA suits for `eva_*` actions. See the handoff for surface walking, tether and repair-panel placement.

## Rebuild and check

Use Node 20.19+ or 22.12+ and pnpm. From this folder:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm check
pnpm test
pnpm verify
```

`build` runs the complete deterministic art/export pipeline. It does not call an image service or need an API key. `verify` checks atlas dimensions and manifest paths and refreshes `FILES.sha256.json`. To regenerate the optional MP4, install ffmpeg and run `pnpm review:video`; normal builds do not need ffmpeg.

See [VALIDATION.md](VALIDATION.md) for checks and scope, [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md) for suit and character choices, and [CREDITS.md](CREDITS.md) for the generated concept's provenance and font license. This is an AI-assisted original concept followed by a reproducible palette/grid/rig pipeline; it is not represented as hand-painted artwork.
