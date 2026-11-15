# Claude handoff · Crew pack 1.1.0

Integrate the repaired eight-person crew art. Read `FIX_NOTES.md` for why this version replaces 1.0.0. The user's screenshots specifically flagged noodle-like arms/walking, missing eyes, inconsistent turnarounds and incorrect backs. The old stretched-texture and recolored-head pipeline has been removed.

## Preserve the game

IDs remain `ayesha`, `maya`, `bilal`, `lin`, `sana`, `kofi`, `omar`, `zara`. Roles remain power/life support, comms/navigation, science, launch/budget. Traits and the four-person mission selection are unchanged. Match the host's enum keys explicitly; do not overwrite gameplay stats or saves with visual metadata. The player appearance IDs belong to the separate player pack, not this roster.

Inspect the host's actual recruitment, portrait resolver, isometric renderer, input/pathfinding and save code before editing. Do not overwrite the previously corrected menu technician or navigation while importing crew artwork.

## Files and compatibility

Copy `assets/` to the host's `public/assets/crew/`. Fetch `/assets/crew/manifest.json`; all manifest paths are relative to that directory. For example `master/ayesha-cabin-se.png` resolves under `/assets/crew/`.

The standard atlas contract remains 512 × 1056: eight 64 × 96 columns and eleven rows. Gameplay remains 128 × 264 with 16 × 24 frames. IDs, filenames, row order and frame counts are unchanged. New `detail` atlases are 1024 × 2112 with 128 × 192 frames. Strict manifest validators must accept version `1.1.0` and its added fields; the included schema/adapter already do.

Row order:

```text
0 idle      1 walk       2 work       3 talk
4 think     5 concern    6 celebrate  7 point
8 signature 9 eva_float 10 eva_repair
```

Four facings: `se`, `sw` front three-quarter; `ne`, `nw` rear three-quarter. All four are rendered directly with their own head art. Do not mirror the west sprites again.

Pivots remain `(32,88)` standard and `(8,22)` gameplay; detail pivot is `(64,176)`. Draw top-left at `worldFoot - pivot × scale`, use one scale for everyone, and sort by worldFoot.y. No height normalization or alpha-trim pivot loss. `heightCm` drives geometry; the legacy `heightPx` and source rectangles remain reference annotations for the original concept/portrait pipeline.

Portrait paths remain `portraits/crew-<id>.svg`, `crew-<id>-worried.svg`, `crew-<id>-happy.svg`, also available as PNG. Copy those into the existing portrait folder if the host expects `/assets/portraits/` rather than the crew subdirectory. `sana` displays as `Dr. Sana`.

## Animation and movement

Read each manifest row's fps/loop flag. Both point and celebrate are one-shots; finish after eight frame durations and return to the host's prior state. Other actions loop. Index is `floor(max(0,elapsedMs) * fps / 1000)`, modulo eight for loops, clamped to seven for one-shots. Reset an action clock when entering that action; keep walk phase while turning so the legs do not restart at a different step.

The walk is an in-place body cycle. Move its world foot position through the host's navigation system. Root distance is `11 / 0.6` model units per full eight-frame cycle. Standard projection uses one pixel per model unit; ground Y is compressed to 0.5. The included `getCrewWalkVelocity()` returns the projected velocity matching that person's actual row fps and chosen resolution. Faster/slower personalities therefore keep matching translation and gait. If the host changes speed, change fps by the same ratio to avoid foot sliding.

Work chooses a role instrument/action automatically. Signatures are unique: seal inspection, acknowledgement, headset/readout, listening, glasses, sample inspection, checklist and briefing. Solid segments, joint housings and hand positions are solved together; the source does not stretch cropped fabric. The preview's moving floor is for checking stance contact, not gameplay art.

Use `adapters/canvas.js` as a dependency-free ES module. The TypeScript source imports only manifest types. `getCrewFrame()` accepts `resolution: 'master' | 'detail' | 'gameplay'` and returns path, rectangle, scaled pivot, all anchors, plant flags and completion. `drawCrewFrame()` uses integer positions and nearest-neighbour drawing. The helper owns no scheduler or game state.

## Environments and physical contact

Cabin means helmet off only in a pressurized vehicle/habitat. Use EVA for exterior idle/walk/work on the Moon, Mars or vehicle surface. The adapter and preview require a sealed suit for `eva_*` actions. Cabin versions of those rows remain in the regular atlas grid but are not valid exterior outfits.

Each frame supplies hand, sole, tether and optional tool-tip anchors in selected-facing image coordinates. They are already projected, so do not apply a second mirror. World attachment = `worldFoot + (anchor - pivot) × displayScale`.

`eva_float` has no foot plants. Draw a tether from the vehicle to the supplied backpack anchor, behind the body. This represents restrained zero-g drift, not flight or surface walking.

`eva_repair` supplies a stable driver tip and a nearby bracing hand. Place the panel/contact area at those anchors and a floor or foot restraint at the boots. The preview shows a contact-board guide. Do not place the technician in empty space with the tool pointing at nothing. Scene panels, rails, safety tethers and sparking remain scene elements, not baked sprite backgrounds.

During headset/glasses gestures, hands can occlude the head because the renderer compares foreground geometry depth with the directional head layer. This fixes the earlier floating/incorrect face contact while retaining readable dedicated artwork.

## Performance and source edits

Use prebuilt PNG sheets at runtime. Decode/cache only active crew/suit/facing sheets. A standard atlas is about 2.06 MiB decoded; four active crew use about 8.25 MiB. Detail atlases are about 8.25 MiB each and suit close-up views. Never eagerly decode every atlas. Keep generation scripts, native Canvas, source paintings, the standalone HTML and review videos out of the game bundle. Use the existing scheduler, suspend while hidden, and honor reduced-motion settings for nonessential animation.

See `docs/CODE_MAP.md`. `content/models.json` sets build dimensions; `content/crew.json` keeps IDs, roles, heights, personality and tempo. `src/pose.ts` choreographs actions around the shared fixed-length human rig. `src/human/` draws the solid bodies/equipment. `art-src/crew-heads-a.png` and `crew-heads-b.png` contain dedicated directional source heads; `prepare-heads.ts` cleans alpha, quantizes and aligns necks. The original full-body concept remains the portrait reference. All AI-assisted art is credited.

After edits run `pnpm build`, `pnpm check`, `pnpm test`, `pnpm verify`. Refresh the optional MP4 with `pnpm review:video` if poses change. Inspect all actions and walk/rear reviews. The pack tests cannot exercise an unknown host's camera, collisions, saves or store; verify those after integration, including old-save loading, four-person team selection and both the shortest/tallest crew at a common scale.
