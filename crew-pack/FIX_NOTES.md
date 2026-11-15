# Crew repair · 1.1.0

The supplied screenshots exposed real defects in 1.0.0: cropped fabric was deformed along limb segments, hands and shins could look thin or bent, the gait lacked convincing contact, facial features were lost in the small source/mask pass, and rear heads were recolored front artwork. The previous tests checked bounds and mathematical lengths without adequately checking those visual results.

The new pipeline replaces that construction:

- Solid upper/lower arm and leg meshes, joint housings, gloves and boots preserve thickness while joints move. No fabric strips are stretched to make limbs.
- Two-bone 3D inverse kinematics keep every segment length fixed. Stance soles stay at ground height, with a defined root distance/cadence that cancels their relative motion.
- Dedicated directional head artwork preserves clear eyes, glasses, headsets, hair and distinct faces. NE/NW use actual rear artwork. Neck anchors attach heads consistently through breathing and walking.
- Actual directional suit/backpack geometry replaces mirrored body substitutes. Held meters, tablets, samples and drivers attach to solved hands. Foreground hands can cover the head correctly during headset/glasses gestures.
- Detail-size exports and a default detailed preview make facial and joint inspection possible. Full walk cycles and both rear directions are included in review sheets; the motion study shows front/rear walking on a matching floor.

The existing eight IDs, roles, traits, four facings, eleven states, eight frames per row, standard/gameplay filenames, atlas dimensions and pivots remain. `detailFrame`, `atlas.detail` and `movement` are added to the manifest. The supplied schemas and adapter accept version `1.1.0`; update a copied strict `1.0.0` schema when replacing the pack. Replace the manifest and PNGs together and refresh the host build/cache for inspection.

The separate player ZIP was delivered first and is unchanged by this repair. No menu/gameplay source in the parent project is modified by the crew asset replacement.
