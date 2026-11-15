# Claude handoff · Mission Control crew pack 1.0.0

Implement the eight-person crew art and animation system in the existing Mission Control game. Read this file before editing the host. The attached asset brief is reference material; this pack covers characters, not the brief's whole environment/rocket checklist. The user's latest request is eight different people in matching suits, distinct personalities, correct height/build differences, shared animation coverage and complete editable files.

## 1. Inspect the host first

Find the actual crew data, recruitment UI, mission team selection, event portrait lookup and isometric renderer. Match IDs `ayesha`, `maya`, `bilal`, `lin`, `sana`, `kofi`, `omar`, `zara`. Keep existing game stats, IDs, role enum values, four-person team size and save formats. This pack's role keys are `power`, `comms`, `science`, `launch`; map them explicitly if the host uses other keys. Do not silently replace gameplay crew data with visual metadata.

The parent repository is the completed menu demo. Do not overwrite its Settings technician or change its navigation while adding this pack. Character assets do not add missions, scoring, navigation, audio or a new save system.

## 2. Copy assets and use the right paths

Copy the contents of `assets/` into the host's `public/assets/crew/`. Fetch `/assets/crew/manifest.json`. Atlas paths inside it are relative to this directory: `master/ayesha-cabin-se.png` means `/assets/crew/master/ayesha-cabin-se.png`. No runtime source-art files or build dependencies are required.

Portraits follow the brief's names:

```text
portraits/crew-ayesha.svg
portraits/crew-ayesha-worried.svg
portraits/crew-ayesha-happy.svg
```

The same pattern exists for all IDs and as PNG. If the existing UI expects `/assets/portraits/crew-<id>.svg`, copy just those SVGs into that existing folder or change the centralized resolver. Do not invent crew IDs from display names; `sana` displays as `Dr. Sana`.

Master stills are `stills/<id>-cabin.{png,svg}` and `<id>-eva.{png,svg}`. `sprites/crew-<id>-idle` and `crew-<id>-walk-1..4` are optional brief-compatible 16 × 24 stills. The generic `crew-base-*` and `eva-1/2.svg` aliases depict Ayesha. They are compatibility defaults, not extra crew members. Prefer each person's atlas when identity matters.

## 3. Frame layout and origin

Every master atlas: width 512, height 1056. Eight 64 × 96 columns, eleven state rows. All character/suit/direction atlases use the same row order, also stated explicitly in the manifest:

```text
0 idle      1 walk       2 work       3 talk
4 think     5 concern    6 celebrate  7 point
8 signature 9 eva_float 10 eva_repair
```

Gameplay atlases have the same layout at exactly one-quarter size: width 128, height 264; frames 16 × 24. Divide master rectangles and attachment coordinates by four when using gameplay atlases. The included adapter already does this.

Common foot origin `(32,88)` master / `(8,22)` gameplay. Image top-left is `worldFoot - origin × scale`. All height differences are already in the pixels. Keep one scale for everyone. Depth-sort by worldFoot.y. Use nearest-neighbour drawing, integer destination positions and whole-number display scales.

`se/sw` show the front; `ne/nw` show the rear. West views are mirrored exports. Sprite handedness and accents mirror with the sprite. Do not mirror them again. These are four directional views, not eight independent view angles.

## 4. Timing and state transitions

Read each row's `fps` and `loop`; tempo differs between people. Reset the state-local elapsed clock when entering an action. Compute `tick = floor(max(0, elapsedMs) * fps / 1000)`. Loop index is `tick % 8`; one-shot index is `min(tick, 7)`. `point` and `celebrate` finish after `8 / fps` seconds, then the host can return to its previous state. Use the provided adapter or the same arithmetic. `adapters/canvas.js` is a directly usable ES module with no imports; its editable TypeScript source is `adapters/canvas.ts`. If copying the TypeScript version alone, replace its type-only manifest import with the host's types or carry the included schema/types with it.

`idle` lasts about four to five seconds per breath. Collar, head and shoulders move together; inverse kinematics keep planted hand/foot targets coherent. `walk` is an in-place gait. Translate the world position through the host's navigation system; there is no baked root travel. The gait's ground axis follows the game's 2:1 screen projection. For `ne/nw` walking, the host's world movement goes toward the rear diagonal; the sprite remains an in-place cycle. Tune movement speed to foot cadence and stop at a planted-foot frame.

`work` automatically uses the crew member's role action. Ayesha/Maya read a diagnostic meter; Bilal/Lin use headset and tablet; Sana/Kofi inspect a sealed sample; Omar/Zara check a tablet. `signature` provides the eight individual gestures listed in `content/crew.json`. Other shared states are talk, think, concern, restrained success, point, tethered float and braced repair. These are animation states, not a dialogue/personality AI system.

For a sudden action change, finish a short gesture or switch at a neutral/plant frame. Do not crossfade sprite images; that creates doubled limbs. A host that needs arbitrary pose blending should drive the editable rig and interpolate targets, rather than alpha-blend baked sheets.

## 5. EVA and physical contact

Use `cabin` only inside a pressurized space. Outside a vehicle/habitat—including the Moon and Mars—select `eva`, including for idle/walk/work. `eva_float` and `eva_repair` require `eva`; the adapter rejects a cabin/EVA-action combination. Both sets contain all rows for regular indexing, but cabin EVA-action rows are not a scientifically valid exterior outfit.

Each frame supplies hand, foot, tool-tip and tether attachment coordinates in image coordinates, already mirrored for its facing. Convert an anchor to world coordinates as:

```text
worldAnchor = worldFoot + (frameAnchor - frameOrigin) * displayScale
```

`eva_float` has no foot plants. Draw an environmental tether to `anchors.tether`, behind the body; connect its far end to the vehicle. This loop depicts restrained drift, not self-propelled flight.

`eva_repair` has a driver with a stable `toolTip`. Place the repair contact on this point; place a handrail/foot restraint at the planted feet. The backdrop, mounting geometry, safety tether and sparking are the host scene's responsibility. Avoid a technician pointing a driver into empty air. The standalone preview supplies a simple contact-board guide. `work` uses held instruments and does not require a wall panel.

For surface tasks, use the sealed `work`, `walk`, `idle` etc. Do not use zero-g floating to depict walking on Mars or the Moon. Helmet-off faces and hair are absent from the EVA rendering.

## 6. Runtime performance

Prebuilt sheets are the normal runtime path. Load only the active crew/suit/facing sheets, decode once and reuse them. A master atlas decodes to about 2.06 MiB; four active crew use about 8.25 MiB for one suit/facing each. Do not eagerly decode all 64 master atlases. Gameplay atlases are about 132 KiB decoded each.

Use the host's existing frame scheduler. Suspend animation while hidden; pause or hold idle under reduced-motion settings. The adapter adds no scheduler. Keep `art-src`, scripts, tests, review videos and the offline preview out of the game bundle. Never import the PNG generator or native Canvas dependency into browser gameplay.

## 7. Edit and regenerate

See `docs/CODE_MAP.md`. Roster appearance/tempo: `content/crew.json`. Neutral skeleton: `content/rig.json`. Shared animation timing: `content/animations.json`. Role accents: `content/roles.json`. Pose targets: `src/pose.ts`. Skinning/suit/props: `src/skin.ts` and `src/render.ts`. Source concept and annotations: `art-src/`. The concept is credited AI-assisted artwork. Production exports are deterministic from the checked-in sources.

Run `pnpm build`, `pnpm check`, `pnpm test`, `pnpm verify` after changes. Rebuild the optional motion study with `pnpm review:video` if the rig changes. Do not edit generated sheets as the only source of a correction; it will disappear on the next build.

## 8. Verify in the actual host

Recruit and display each of the eight IDs. Confirm roles and traits still affect gameplay as before. Check a four-person team with the tallest and shortest people beside each other; feet should align and heads should differ in height. Test all four facings, suit swaps, worry/happy portraits and one-shot completion. Check role tools meet the hands and exterior repair tools meet their panel. Confirm a saved mission still loads. Test the host at its intended viewport and zoom, including a lower-powered device.

Pack checks cover generation, exported dimensions, palette/alpha, bone lengths, looping, adapter logic and offline viewer interaction. They cannot verify an unknown host's state store, collision map, camera, save implementation or browser layout. See `VALIDATION.md` for exactly what was exercised.
