# Claude handoff · Main player pack 1.0.0

Add the main player appearance choice and its eight-direction idle/walk art to the existing Mission Control project. This folder is self-contained. The supporting crew pack and menu remain separate. Do not replace crew IDs, team size, simulation rules, menus or save formats while integrating player art.

## Choose and persist

Two stable appearance IDs: `player_female` (170 cm) and `player_male` (178 cm). These are the two selectable versions of the same player role. Both use the same equipment, cadence, collision rules and movement speed. Their height/build differences are already in the sprite pixels; do not stretch them to the same visible height. Suggested choice UI: show both portraits with their idle sprite, let the player choose, and store the chosen ID in the host's existing profile. No names or backstory are imposed.

Inspect the host's actual player data, input, rendering and persistence before editing. Keep old saves working; select a default appearance when a legacy save lacks the new field. This pack supplies assets and a renderer helper, not a replacement game store.

## Asset paths

Copy the contents of `assets/` to `public/assets/player/`. Load `/assets/player/manifest.json`; all paths inside it are relative to that directory. For example `master/player_female-cabin-walk.png` becomes `/assets/player/master/player_female-cabin-walk.png`.

`cabin` is helmet off inside a pressurized environment. `eva` is a sealed helmet outside a vehicle or habitat, including the Moon and Mars. Only idle and grounded walking are provided here; walking is not a zero-g float animation. Select the suit according to the scene. The cloth design stays consistent between suit states and genders.

## Eight directions and layout

Rows are exactly `N, NE, E, SE, S, SW, W, NW`, in that order. N is screen-up, S is screen-down, E and W are true side views. Each diagonal is a separate geometric view. No runtime mirroring is needed.

Each atlas holds one player + suit + action. Idle has eight columns; walk has twelve. The master frames are 128 × 192. Idle atlas: 1024 × 1536; walk: 1536 × 1536. The compact set uses half-size coordinates (64 × 96); gameplay uses one-eighth coordinates (16 × 24). Read the manifest rather than assuming every clip has the same number of frames.

Master foot pivot `(64,168)`, compact `(32,84)`, gameplay `(8,21)`. These deliberately leave enough frame space for a moving boot. The earlier crew pack's `(32,88)` pivot does not apply to these players. Top-left is `worldFoot - pivot × displayScale`. Sort by world foot Y. Never trim frame transparency without retaining original frame/pivot metadata.

## Playback and physical movement

Idle: 8 frames, 2 fps, loop. Walk: 12 frames, 10 fps, loop. A full gait takes 1.2 seconds. Use a state-local clock; index is `floor(elapsedMs * fps / 1000) % frameCount`. Keep elapsed walk phase when changing direction. Direction changes should switch the row at the same phase, not reset the legs.

The walk is an in-place body cycle intended to move through the host world. Do not simply play it on a fixed floor. Feet have a 60% stance interval, opposing arm swing, bent swing knees and five model units of swing clearance. The root distance is 30 model units per cycle, or 25 model units per second. During a planted interval, foot motion relative to the body cancels this root travel. The offline preview uses a following camera and moving floor to make this visible.

The projection has two master pixels per model unit, ground Y compression 0.5, and height scale sqrt(0.75). At facing yaw θ, model-space forward motion projects to `(sin θ, 0.5 cos θ)`. `groundVelocity()` in the adapter returns the matching master-pixel velocity; scale that velocity by 0.5 for compact or 0.125 for gameplay world coordinates. Normalize input in the host's ground plane before projection so diagonals retain the same world speed. The helper also provides `facingFromScreenVector()` with deprojection and zero-input facing retention.

If the host uses a different movement speed, multiply animation fps and translation speed by the same factor. Otherwise feet will slide. Keep collision dimensions and step speed the same for the two gender choices. Use the host's normal transition handling for idle/walk; do not alpha-blend two sprite images, which doubles limbs. This pack covers the two requested states, not arbitrary locomotion blends or jump/run/float clips.

## Use the helper

`adapters/canvas.js` is a ready ES module with no imports or runtime package dependencies. Its editable source is `canvas.ts`; if copying TypeScript alone, adapt its type-only manifest imports to the host or carry the supplied schemas/types.

```js
import { getPlayerFrame, drawPlayerFrame, groundVelocity } from "./canvas.js";

const frame = getPlayerFrame(manifest, {
  player: profile.playerAppearance,
  variant: isPressurized ? "cabin" : "eva",
  direction: facing,
  action: isMoving ? "walk" : "idle",
  elapsedMs: actionClockMs,
  resolution: "master",
});
// Cache/decode this image once, resolving frame.path under /assets/player/.
const image = atlasCache.get("/assets/player/" + frame.path);
drawPlayerFrame(ctx, image, frame, worldFootX, worldFootY, displayScale);
```

Anchor coordinates are already in the selected facing's image space. Convert to world space as `worldFoot + (anchor - pivot) * displayScale`. The manifest supplies hands, soles and a backpack tether attachment. No generic ground shadow is baked into transparent sprites; draw shadows on the host floor separately.

## Runtime performance

Use prebuilt sheets. Do not ship the generator/native Canvas, concept image, review video or preview HTML inside the gameplay bundle. Decode only the selected player/suit/action sheets. Master walk sheet is 1536² pixels, about 9 MiB decoded; master idle about 6 MiB. Compact/gameplay sheets are smaller. Cache active sheets, reuse them, and release unused decoded alternatives. Suspend the existing animation scheduler while hidden and respect reduced-motion settings in nonessential previews.

## Edit and verify

See `docs/CODE_MAP.md` for every source stage. The bodies and equipment are articulated solid geometry rendered to a strict pixel grid. Faces use dedicated palette-constrained head art for each direction, rigidly attached at an annotated neck anchor. Rear heads use their own rear artwork, with no eye regions. The concept is credited AI-assisted artwork. No claim of hand-painting is made.

After source edits: `pnpm build`, `pnpm check`, `pnpm test`, `pnpm verify`. Refresh the optional video with `pnpm review:video` if the pose changes. Inspect turnarounds and full cycles, not just a single flattering frame.

In the actual host, verify both appearance choices persist and reload, all eight directions match input, walk phase survives turns, grounded feet match movement, body height remains distinct, and exterior scenes select sealed suits. Test at the intended zoom and viewport. This standalone pack's tests cannot exercise an unknown host's store, collision map, camera or save implementation.
