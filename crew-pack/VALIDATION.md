# Validation · crew pack 1.0.0

The source build, strict TypeScript check, nine automated tests and package verification were run before delivery. The full-frame test renders all 5632 combinations, not a sample.

Checks cover:

- Exactly eight unique IDs, two people per role and eight distinct native heights.
- Fixed upper/lower arm and leg lengths across all actions; planted standing feet remain at their targets.
- Every looping joint pose returns to its initial pose at phase 1.
- All 5632 master frames draw without clipping, use only the 64-color palette and contain only alpha 0/255.
- Idle sequences contain visible changes beyond a single blink, and all signature images differ.
- Adapter timing, looping, one-shot completion, gameplay-coordinate scaling, invalid clocks and sealed-suit enforcement.
- The actual embedded viewer JavaScript runs in jsdom. Tests exercise eight-person selection, EVA switching, low-resolution drawing, pause/step and stopping its scheduler while paused. Data-URL image decoding uses native Canvas; draw calls are recorded for coordinate checks.
- Every exported atlas decodes at its declared dimensions; frame rectangles stay within the sheet; paths stay relative to the asset root. `FILES.sha256.json` records package contents.

Visual reviews were produced with the actual native raster: `review/crew-designs.png`, `all-actions.png`, `rear-views.png`, `portraits.png` and `crew-motion.mp4`. The MP4 shows work, signatures, walking, zero-g drift and repair across the roster; the offline viewer exposes all eleven actions and four facings.

The jsdom test is not browser-layout or GPU performance testing. No full gameplay host, mission store, save adapter, collision system or mobile rendering engine was supplied for integration testing. Claude should complete the host checks in `CLAUDE_HANDOFF.md` after connecting the assets. Rendering cost is minimized by prebuilt sheets, lazy decoding and reuse; actual frame rate depends on the host and device.

Reproduce from this folder:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm check
pnpm test
pnpm verify
```

The optional motion study additionally needs ffmpeg (`pnpm review:video`). The checked-in MP4 and ready sprite assets work without it. GitHub delivery includes a standalone ZIP whose retrieved bytes were compared with the local ZIP after upload.
