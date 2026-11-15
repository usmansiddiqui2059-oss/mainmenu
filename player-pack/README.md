# Mission Control · Main player pack

Two selectable player appearances in the same distinctive expedition suit: **female, 170 cm**, and **male, 178 cm**. Each has **idle and walking animation in all eight directions: N, NE, E, SE, S, SW, W, NW**. Both choices share movement speed and game scale.

After extracting the ZIP, open **`preview/index.html`** in a current desktop browser. It works offline and includes player/suit selection, all eight directions, three resolutions, pause, frame stepping, and a moving isometric floor for checking foot contact. The eight-view strip shows the same animation phase from every angle. Give Claude this whole folder and start with [CLAUDE_HANDOFF.md](CLAUDE_HANDOFF.md).

The player suit uses ivory shoulder/chest shells, navy fabric, a weathered-copper chest chevron and backpack spine, ribbed joints, practical gloves and dark boots. It stands apart from the supporting crew's largely white suits. Faces use dedicated front, side and rear head artwork that follows the reference sheet and stays attached to the neck. Rear heads and equipment have actual rear surfaces. Limbs use rigid, connected volumes and fixed-length joint chains; no limb texture strips are stretched into poses.

## Files

| Export                |           Quantity | Details                                                 |
| --------------------- | -----------------: | ------------------------------------------------------- |
| Detail master atlases |              8 PNG | 128 × 192 frames                                        |
| Compact atlases       |              8 PNG | 64 × 96 frames                                          |
| Gameplay atlases      |              8 PNG | 16 × 24 frames                                          |
| Direction strips      |             64 PNG | One horizontal clip per player/suit/action/direction    |
| Idle stills           |    32 PNG + 32 SVG | Every player/suit/direction, detail size                |
| Selection portraits   |      2 PNG + 2 SVG | 128 × 128; same rendered faces as the sprites           |
| Animation frames      | 640 per resolution | 2 players × 2 suits × 8 directions × (8 idle + 12 walk) |

Body and equipment use the same articulated geometry at each actual yaw; heads have dedicated artwork for each of the eight views. They are not mirrored diagonal substitutes for N/S/E/W. Cabin = helmet off in a pressurized interior; EVA = sealed helmet outdoors. The EVA set includes no exposed face or hair.

`assets/manifest.json` records paths, frame rectangles, timing, direction, pivots, foot-contact flags, hand/foot/tether anchors and movement cadence. Paths are relative to `assets/`. The player IDs are `player_female` and `player_male`; they are appearance choices, not additional recruitable crew.

| Resolution | Frame     | Foot pivot | Idle atlas  | Walk atlas  |
| ---------- | --------- | ---------- | ----------- | ----------- |
| Master     | 128 × 192 | (64, 168)  | 1024 × 1536 | 1536 × 1536 |
| Compact    | 64 × 96   | (32, 84)   | 512 × 768   | 768 × 768   |
| Gameplay   | 16 × 24   | (8, 21)    | 128 × 192   | 192 × 192   |

All atlas rows follow `N, NE, E, SE, S, SW, W, NW`. Idle: eight frames at 2 fps, four-second breath. Walk: twelve frames at 10 fps, 1.2-second full gait cycle. Keep the walk clock when turning so the feet do not reset to an unrelated step.

## Integrate

Copy `assets/` to `public/assets/player/` in the host. Resolve manifest paths under `/assets/player/`. Use `adapters/canvas.js` directly, or adapt its TypeScript source. The helper selects frames, draws around the correct foot pivot, maps input vectors to eight directions, and exposes the projected walking speed. It owns no game loop, storage or navigation.

Draw with nearest-neighbour sampling, integer destination positions and a common whole-number scale. Keep the height difference already present in the pixels. Save the chosen appearance ID in the host's existing player profile. Use the manifest pivot rather than the supporting crew pack's older hard-coded pivot.

## Inspect and rebuild

`review/turnarounds.png` shows every suit and facing. The two `*-walk-cycles.png` sheets show all twelve frames in all eight directions. `review/Player-Animation-Study.mp4` shows both player choices in both suit states walking through all directions. The MP4 and HTML are review tools, not game dependencies.

Use Node 20.19+ or Node 22.12+ and pnpm, from this folder:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm check
pnpm test
pnpm verify
```

Rebuilding uses checked-in source art, palette, meshes and animation code; it does not call an image service or need a key. The optional MP4 rebuild needs ffmpeg: `pnpm review:video`. See [docs/CODE_MAP.md](docs/CODE_MAP.md), [VALIDATION.md](VALIDATION.md) and [CREDITS.md](CREDITS.md).
