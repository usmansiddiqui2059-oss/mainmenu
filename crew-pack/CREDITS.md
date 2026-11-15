# Asset provenance

Date: 2026-11-15. Original characters for Mission Control; fictional names/designs, no real astronaut likenesses or agency insignia.

| Files                                               | Tool / method                                                                                                  | AI-assisted                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `art-src/crew-concept.png`                          | OpenAI image generation; original eight-person visual concept using the previous suit as reference             | Yes, generated concept                                                    |
| `art-src/previous-suit-reference.png`               | Previous Mission Control menu's code-defined suit review                                                       | Code artwork; reference for this AI-assisted pack                         |
| `art-src/bases/*.png`, `base-anchors.json`          | TypeScript + @napi-rs/canvas; annotated crops, native sampling, palette reduction and background cleanup       | Derived from AI concept                                                   |
| `assets/master/*.png`, `assets/gameplay/*.png`      | Original TypeScript rig/IK/texture skinning, drawn helmets/rear packs/tools, deterministic pixel raster/export | Mixed: concept-derived fabric/faces plus code-defined rig/suit components |
| `assets/stills/*`, `assets/sprites/*`               | Same rig; PNG and integer pixel-path SVG exports                                                               | Same derivation as animation atlases                                      |
| `assets/portraits/*`                                | Same concept faces, matched framing, palette pass, code-defined subtle expressions and pixel SVG conversion    | Derived from AI concept                                                   |
| `review/*.png`, `review/crew-motion.mp4`            | Native Canvas compositions of actual exports/rig poses; ffmpeg H.264 motion study                              | Displays the above AI-assisted artwork                                    |
| `preview/barlow-condensed-latin-500.woff2`          | Barlow Condensed, Jeremy Tribby and contributors, SIL Open Font License 1.1                                    | No; license in `preview/FONT_LICENSE.txt`                                 |
| TypeScript/JavaScript, JSON, HTML and documentation | Original implementation and design direction produced in this collaboration                                    | AI-assisted code and writing                                              |

The PNG concept is retained for provenance and editing. It is not the shipped runtime sprite sheet. The pack does not claim the generated concept or derived textures were hand-painted. No external stock portraits, astronaut photographs, game character sprites, NASA/company logos or movie characters are embedded.

Dependency licenses remain with their respective packages. Native Canvas, tsx, Zod, TypeScript, Vitest and jsdom are development/export tools except for optional schema validation; PNG/SVG gameplay rendering does not require those packages.
