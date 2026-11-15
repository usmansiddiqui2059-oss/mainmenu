# Mission Control · Crew pack 1.1.0

This repair replaces the earlier stretched sprite construction. All eight people now use **solid fixed-length limbs, grounded walking, dedicated front/rear head artwork, readable eyes, and properly oriented backs**. The role actions, signature gestures, eight IDs and four-person mission selection remain intact.

Extract the ZIP and open **`preview/index.html`**. Choose a person, action, facing and suit; pause and step through frames. The preview starts with the new **128 × 192 detail** assets. Its walking floor follows the gait so you can inspect foot contact. Both rear directions are drawn explicitly. There is no runtime mirroring or recoloring a front face to make a back.

Give Claude the whole folder and start with [CLAUDE_HANDOFF.md](CLAUDE_HANDOFF.md), then [FIX_NOTES.md](FIX_NOTES.md). This pack is separate from the main-player appearances and the menu.

| ID     | Role / trait                     | Height / build                  | Signature                      |
| ------ | -------------------------------- | ------------------------------- | ------------------------------ |
| ayesha | Power & Life Support / Practical | 168 cm, sturdy                  | Wrist-seal inspection          |
| maya   | Power & Life Support / Leader    | 162 cm, compact broad shoulders | Calm open-palm acknowledgement |
| bilal  | Comms & Navigation / Thinker     | 183 cm, tall and lean           | Headset and readout check      |
| lin    | Comms & Navigation / Leader      | 170 cm, balanced                | Listening/readback gesture     |
| sana   | Science / Thinker                | 159 cm, compact                 | Glasses adjustment             |
| kofi   | Science / Practical              | 180 cm, athletic                | Sealed sample inspection       |
| omar   | Launch & Budget / Practical      | 166 cm, stocky                  | Deliberate checklist           |
| zara   | Launch & Budget / Leader         | 178 cm, athletic                | Plan check and indication      |

Heights/builds are fictional visual design choices; IDs, roles and traits follow the supplied roster. Five women and three men share one practical suit family. Hair, glasses, headsets, age and stance remain distinct. The player keeps the separate navy/ivory/copper suit; supporting crew wear ivory pressure suits with role patches and chest controls.

## Ready files

| Export                     |            Quantity | Frame / atlas                                                        |
| -------------------------- | ------------------: | -------------------------------------------------------------------- |
| Detail atlases             |              64 PNG | 128 × 192 / 1024 × 2112                                              |
| Standard atlases           |              64 PNG | 64 × 96 / 512 × 1056                                                 |
| Gameplay atlases           |              64 PNG | 16 × 24 / 128 × 264                                                  |
| Frames                     | 5632 per resolution | Eight crew × two suits × four facings × eleven states × eight frames |
| Detail idle stills         |     64 PNG + 64 SVG | Every person/suit/facing                                             |
| Standard idle stills       |     16 PNG + 16 SVG | Front three-quarter, both suits                                      |
| Portraits                  |     24 PNG + 24 SVG | 64 × 64, neutral/worried/happy                                       |
| Small compatibility stills |     40 PNG + 40 SVG | Individual idle + four walk frames                                   |
| Legacy aliases             |               7 SVG | Ayesha base idle/walk and two EVA defaults                           |

The eleven states remain `idle`, `walk`, `work`, `talk`, `think`, `concern`, `celebrate`, `point`, `signature`, `eva_float`, `eva_repair`. Work varies by role; signatures vary by person. Point and celebrate play once. Individual timing lives in each manifest row.

Facings remain `se`, `sw`, `ne`, `nw` for compatibility. All four now have actual directional body/equipment geometry and dedicated head art. The two main-player choices have their own eight-direction pack.

## Integration

Copy `assets/` to `public/assets/crew/`. Load its manifest and resolve paths under `/assets/crew/`. Existing standard and gameplay filenames, dimensions, row order, frame counts, IDs and foot pivots remain compatible. Version is now `1.1.0`; replace assets and manifest together. The new optional atlas field is `detail`.

| Resolution       | Pivot     |
| ---------------- | --------- |
| Standard 64 × 96 | (32, 88)  |
| Detail 128 × 192 | (64, 176) |
| Gameplay 16 × 24 | (8, 22)   |

Use `adapters/canvas.js` directly or its editable TypeScript source. It selects frames, scales every attachment, guards EVA actions and exposes walking velocity matched to each person's cadence. Draw around the foot pivot, keep one display scale for everyone, disable smoothing and depth-sort by world foot Y.

Cabin means helmet off inside a pressurized interior. Outside—including Moon/Mars—use EVA suits. `eva_float` needs an environmental tether; `eva_repair` needs the panel/foot restraint placed at its attachment coordinates. Held work instruments follow the actual solved hands.

## Inspect and regenerate

Review files include `crew-designs.png`, `rear-views.png`, `walk-cycles.png`, `all-actions.png`, portraits and `crew-motion.mp4`. These are native art/atlas reviews, not browser screenshots. The offline HTML exposes every exported combination.

Use Node 20.19+ or 22.12+ and pnpm:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm check
pnpm test
pnpm verify
```

The build uses checked-in art, geometry and palette; no image-service calls or keys. Only the optional MP4 rebuild needs ffmpeg (`pnpm review:video`). See [docs/CODE_MAP.md](docs/CODE_MAP.md), [VALIDATION.md](VALIDATION.md) and [CREDITS.md](CREDITS.md).
