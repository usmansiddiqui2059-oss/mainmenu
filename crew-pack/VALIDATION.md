# Validation · crew repair 1.1.0

The complete build, strict TypeScript check, eleven tests and package verifier were run before delivery. The image test renders all 5632 person/suit/facing/action/frame combinations.

Coverage includes all roster IDs/role pairs, distinct height/build parameters, fixed upper/lower limb lengths, reachable ankle targets, planted sole heights, looping joints, root-speed cancellation during stance, full-frame geometry margins, binary alpha, palette membership and connected solid sprite silhouettes. Front eye regions, actual rear artwork without eyes, and sealed EVA helmets without exposed skin/hair are checked for every person and facing.

Adapter tests cover cadence, one-shot completion, standard/gameplay/detail scaling, pivots and attachments, invalid clocks and the EVA guard. The actual embedded viewer JavaScript runs in jsdom with native PNG data-URL decoding and recorded draw calls. It exercises crew choice, walking floor, suits, resolutions, pause and stepping; paused previews stop scheduling animation frames.

Visual review artifacts show full action rows, every walk frame, both rear facings, cabin/EVA lineups and a motion study with front/rear walking, role work, signatures, float and braced repair. The moving floor uses the declared gait travel, so it can reveal sliding rather than hide it.

The tests do not substitute for inspecting the art. They also cannot test browser layout/GPU performance or an unknown gameplay host's stores, collision map, camera, saves or recruitment rules. Complete the host checks in the handoff after integration. The supporting crew's standard atlas layout/pivots remain compatible; the newly added detail export is optional for gameplay.

The delivered GitHub ZIP was retrieved and compared byte-for-byte, with every internal SHA-256 entry checked. Reproduce with `pnpm build`, `pnpm check`, `pnpm test`, `pnpm verify`; optional MP4 generation additionally needs ffmpeg.
