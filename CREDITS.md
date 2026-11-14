# Asset provenance

All entries below were prepared for the Mission Control menu revision dated 2026-11-14. No reference-game artwork, logos or fonts were copied into the package.

| Asset | Tool / process | AI-assisted | Notes |
| --- | --- | --- | --- |
| `art-src/observatory-concept.png` | OpenAI image generation with the environment atlas as a style reference | Yes | Original detailed observatory with an empty exhibit platform. |
| `art-src/environment-concept-atlas.png` | OpenAI image generation | Yes | Original four-scene industrial environment concept; no people, text or logos. |
| `public/assets/backgrounds/title.png` | Native Canvas build script, nearest-neighbour sampling, palette reduction and deterministic field cleanup | Yes, derived concept | 480×270; launch structure / pad only. Moving spacecraft is separate. |
| `public/assets/backgrounds/crew-cabin.png` | Same source / build pipeline | Yes, derived concept | 480×270; empty cabin above Earth's night side. Moving crew is separate. |
| `public/assets/backgrounds/mars-surface.png` | Same source / build pipeline | Yes, derived concept | 480×270; dry Mars landscape, rover, thermal shade and empty chair. |
| `public/assets/backgrounds/maintenance-bay.png` | Same source / build pipeline | Yes, derived concept | 480×270; empty spacecraft workshop. |
| `public/assets/backgrounds/dest-mars.png` | Native crop from the palette-constrained Mars plate | Yes, derived concept | 200×125 card. |
| `public/assets/backgrounds/dest-moon.png` | Original deterministic pixel construction in `scripts/build-plates.mjs` | Yes, AI-authored code; no generated painting | 200×125 card; stepped lunar shading and craters. |
| `public/assets/backgrounds/event-observatory.png` | Native palette and cleanup pipeline from the observatory concept | Yes, derived concept | 480×270; the moving orbital sculpture is separate, with no team logo. |
| Live pressure-suit rig and six `menu-suit-*.svg` snapshots | Original integer-raster geometry and two-bone solver in TypeScript; run-merged SVG export | Yes, AI-authored code; no generated character painting | Shared 88×88 snapshot canvas; float, rear-view bench repair and rest poses. |
| Live shuttle, plumes, tether, tools and orbital sculpture | Original TypeScript pixel geometry and state-driven animation | Yes, AI-authored code; no generated painting | Moving elements rendered by the application, not prerecorded video. |
| `art-src/palette.hex` | Mission Night 48 custom palette | Yes, art-directed code selection | Replaces Endesga 32 to follow the direct user request. |
| `public/assets/fonts/barlow-condensed-latin-500.woff2` | Barlow Condensed by Jeremy Tribby; distributed through Fontsource | No | SIL Open Font License 1.1; license included as `public/assets/fonts/OFL.txt`. |

Font source: [Fontsource Barlow Condensed](https://fontsource.org/fonts/barlow-condensed). License source: [Google Fonts Barlow Condensed OFL](https://github.com/google/fonts/blob/main/ofl/barlowcondensed/OFL.txt).

The supplied spacecraft, astronaut and game-menu images were visual references. Their original files are not embedded. The environment concept and deterministic cleanup are identified explicitly; the deliverable does not claim that AI-assisted source painting was hand-painted by a human artist.
