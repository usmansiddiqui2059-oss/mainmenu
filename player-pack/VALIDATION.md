# Validation · player pack 1.0.0

The complete export build, strict TypeScript check, nine tests and package verifier were run before delivery.

Checks include fixed upper/lower limb lengths, reachable ankle targets, planted sole heights, exact root-speed cancellation during stance, looping pose continuity, all 640 frame combinations, safe raster bounds, binary alpha, palette membership and a single connected sprite silhouette. They also check eight distinct facing images, visible front/profile eye regions, no eye regions in rear views, and no skin/hair/eyes exposed through EVA helmets.

Adapter checks cover frame rows, timing, scaled pivots/attachments, eight-direction input mapping and projection speed. The actual embedded preview JavaScript runs in jsdom with native data-URL PNG decoding and recorded drawing calls. Tests switch the player, suit, direction and resolution, then verify pause/frame-step behavior and that paused previews stop scheduling animation frames.

Visual inspection artifacts include `turnarounds.png`, both `*-walk-cycles.png` sheets and `Player-Animation-Study.mp4`. The preview's moving 2:1 floor exposes planted-foot sliding; it is not an extra effect attached to a static illustration.

This is asset and standalone preview verification. jsdom does not test browser layout or GPU performance, and no full gameplay host was supplied for save/collision/camera integration checks. Claude should perform the host checks in the handoff after connecting the pack. Inspect detail masters for facial features; the optional 16 × 24 gameplay export necessarily reduces tiny face detail.

The GitHub delivery ZIP was retrieved and checked byte-for-byte, including all internal SHA-256 entries. Reproduce locally with `pnpm build`, `pnpm check`, `pnpm test`, `pnpm verify`. Only the optional MP4 rebuild requires ffmpeg.
