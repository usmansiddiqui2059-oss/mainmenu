# Mission Control: Art Asset Brief (Pixel Art Edition)

**For:** the artist on our team
**Game:** *Mission Control*, a space mission design game for NASA Space Apps Challenge 2026
**Theme:** pixel art (retro, clean, readable), vector (SVG) wherever possible

---

## 0. Read this first (2 minutes)

**What the game is:** you're one member of a 4-person mission team. You plan a crewed mission to the **Moon** or **Mars**: pick the rocket, the base parts and the supplies, and recruit your crew. Then you live through the mission as events hit (dust storms, broken solar panels, arguments) and decide who fixes what. A friendly robot teacher called **NOVA** pops up to explain the real science.

**What your art does:** it makes the game feel alive and gives it one consistent look. The developers are already building the game with placeholder boxes. As you finish each file, drop it into the right folder with the right name and it appears in the game automatically. **You never block the developers, and they never block you.**

**Where your creativity goes:** each asset below has a **"Your call"** section. The **"Must have"** parts are fixed because the game logic depends on them (sizes, names, transparent backgrounds, what has to be visible). Everything else (faces, outfits, colours within the palette, small details, personality) is up to you.

**How to use the prompts:** every asset has a ready prompt for Gemini (or any image generator). AI-generated "pixel art" is usually *fake* pixel art: blurry pixels, uneven grid, too many colours. **Use the AI image as a concept or starting point, then clean it up** (section 1.6). The cleanup is what makes it look professional.

---

## 1. Global style guide (applies to EVERY asset)

### 1.1 The look in one sentence
> **Clean 16-bit-era pixel art of a near-future space agency: dark navy space, cyan tech glow, warm amber warning lights, readable shapes, a little bit of charm.**

Think: hand-made indie strategy game. Serious subject, friendly characters.

### 1.2 Palette (fixed)
- Use **one shared palette for everything**. Our pick: **Endesga 32** (free on lospec.com). If you prefer another, choose it **before** making anything and tell the devs.
- Main colour roles:
  - **Background / space:** darkest navys and blacks
  - **Tech / UI glow:** cyans and teals
  - **Warnings / alerts:** ambers and oranges
  - **Danger:** reds
  - **Success:** greens
  - **Skin tones and hair:** use the palette's skin and brown ramps, and make the crew diverse
- No gradients, no blur, no glow effects made with soft brushes. Shading is done with **palette steps (dithering is allowed, used sparingly)**.

### 1.3 Pixel rules
- **Every asset is drawn at a small "native" size** (listed per asset) on a strict pixel grid. The game scales it up 2×–6× with crisp edges.
- **1-pixel dark outline** on characters, sprites and objects (not on backgrounds).
- **Light comes from the top-left** on everything.
- **No anti-aliasing**, no half-transparent pixels on sprites (pixels are either fully opaque or fully transparent).
- **Isometric angle** for the control room and base: classic **2:1 pixel isometric** (lines go 2 pixels across for every 1 pixel up).

### 1.4 SVG or PNG? (important)

| Asset type | Format | Why |
|---|---|---|
| Small things: portraits, sprites, rockets, icons, logo, NOVA | **SVG** (converted from your pixel PNG, see 1.6) | Stays perfectly sharp at any size, tiny files, devs can recolour it in code |
| Big things: full-screen backgrounds, the control room, outcome scenes | **PNG at native size** (e.g. 480×270) | A big pixel scene as SVG = tens of thousands of shapes → slow game. A small PNG scaled up with crisp edges looks identical and loads instantly |

**Simple rule:** draw everything as PNG at native size. A dev script turns the small ones into SVG (section 4). You don't need to touch SVG yourself.

### 1.5 Tools (all free)
- **Piskel** (piskelapp.com, runs in the browser): easiest, great for sprites and animation.
- **LibreSprite** or **Aseprite** (paid but the best): for bigger pieces.
- **Lospec palette list** (lospec.com/palette-list): load Endesga 32 into your tool.
- **Gemini / any AI image tool:** for concepts only.

### 1.6 Workflow: AI concept → clean pixel art
1. Generate a concept with the prompt (add the **style anchor** below to every prompt).
2. In your pixel tool, **resize the image to the native size using "nearest neighbour"** (not smooth/bilinear).
3. **Reduce the colours to the Endesga 32 palette.**
4. **Clean by hand:** fix wobbly lines, stray pixels, uneven outlines, and make the face and silhouette readable.
5. Export **PNG at native size** with a transparent background (sprites) or full background (scenes).
6. Name it exactly as listed and drop it into the folder.

### 1.7 Style anchor (paste at the START of every AI prompt)
```
Pixel art, 16-bit era, clean crisp pixels on a strict grid, limited palette (Endesga 32 style: deep navy, cyan, teal, amber, warm skin tones), 1-pixel dark outlines, light from top-left, no gradients, no blur, no anti-aliasing, near-future space agency theme, charming indie game asset.
```

### 1.8 Hard rules (please don't break these)
- ❌ **No NASA logo or insignia**, no real space agency or rocket company logos or names on anything.
- ❌ **No characters from movies, anime or games** (no TARS, no Dr. Stone, no Star Wars droids). Everything is original.
- ❌ **No text inside images** (titles, labels, numbers). The game adds text in code so it can be translated and changed.
- ✅ **Log every asset** in `CREDITS.md`: file name, tool used, AI-assisted yes/no, date.

---

## 2. Master checklist

Priority: **M** = must (game looks broken without it), **S** = should, **N** = nice extra.
Native size = what you draw at. Final format = what goes in the game.

| ✓ | # | Asset | Pri | Count | Native size (px) | Final format | File name(s) |
|---|---|---|---|---|---|---|---|
| ☐ | 1 | Crew portraits | M | 8 | 64×64 | SVG | `portraits/crew-<id>.svg` |
| ☐ | 2 | Control room (isometric) | M | 1 | 480×270 | PNG | `backgrounds/control-room.png` |
| ☐ | 3 | Title screen scene | M | 1 | 480×270 | PNG | `backgrounds/title.png` |
| ☐ | 4 | Destination cards (Moon, Mars) | M | 2 | 200×125 | PNG | `backgrounds/dest-moon.png`, `dest-mars.png` |
| ☐ | 5 | Rockets (light, medium, heavy) | M | 3 | 32×96 | SVG | `sprites/rocket-light.svg`, `rocket-medium.svg`, `rocket-heavy.svg` |
| ☐ | 6 | Moon base (Planning Board) | M | 1 | 320×180 | PNG | `sprites/base-moon.png` |
| ☐ | 7 | App icon / logo mark | M | 1 | 32×32 | SVG + PNG | `icon.svg`, `icon.png` (512×512 upscale) |
| ☐ | 8 | NOVA robot (concept + sprite) | M | 1 (+3 frames) | 32×32 | SVG | `sprites/nova-idle-1.svg` … `nova-talk-2.svg` |
| ☐ | 9 | Portrait expressions | S | 8 × 2 | 64×64 | SVG | `crew-<id>-worried.svg`, `crew-<id>-happy.svg` |
| ☐ | 10 | Crew sprite (control room) | S | 1 (+walk frames) | 16×24 | SVG | `sprites/crew-base-idle.svg`, `crew-base-walk-1..4.svg` |
| ☐ | 11 | Moon surface / Mars surface | S | 2 | 480×270 | PNG | `backgrounds/moon-surface.png`, `mars-surface.png` |
| ☐ | 12 | Mars base (Planning Board) | S | 1 | 320×180 | PNG | `sprites/base-mars.png` |
| ☐ | 13 | Astronaut on EVA (spacewalk) | S | 1 (+2 frames) | 24×32 | SVG | `sprites/eva-1.svg`, `eva-2.svg` |
| ☐ | 14 | Rover | S | 1 | 32×20 | SVG | `sprites/rover.svg` |
| ☐ | 15 | Outcome scenes (success, partial, failed) | S | 3 | 300×150 | PNG | `backgrounds/outcome-success.png`, `-partial.png`, `-failed.png` |
| ☐ | 16 | Event illustrations | N | 6 | 200×100 | PNG | `events/event-<id>.png` |
| ☐ | 17 | Part icons | N | ~16 | 16×16 | SVG | `parts/part-<id>.svg` |
| ☐ | 18 | Scenario card art | N | 2 | 200×125 | PNG | `backgrounds/scenario-<id>.png` |

**All files go in:** `public/assets/<folder>/` in the repo (e.g. `public/assets/portraits/crew-ayesha.svg`).
**Suggested order:** 1 → 7 → 8 → 5 → 2 → 6 → 3 → 4 → then S items.

---

## 3. Asset-by-asset briefs and prompts

---

### #1 Crew portraits (MUST) · 8 × 64×64 → SVG

**What it's for:** shown on crew cards during recruitment, beside dialogue lines, and in event cards ("Ayesha goes on a spacewalk"). These are the **faces of the game**: players should remember them.

**Must have:**
- Head and shoulders, facing slightly toward the viewer, **same framing and eye height for all 8** (they sit side by side in the UI).
- **Transparent background** (the card behind provides the colour).
- Wearing a mission jumpsuit or polo with a **coloured collar or patch matching their role** (colours below), so players can tell roles apart at a glance.
- Readable at small size: clear eyes, clear hair silhouette.

**Role colours (collar / patch):**
| Role | Colour |
|---|---|
| Science | teal/green |
| Power and Life Support | amber/orange |
| Comms and Navigation | cyan/blue |
| Launch and Budget | purple/magenta |

**Proposed roster** (confirm the final list and ids with the devs; the `id` must match `crew.json` exactly):

| id | Name | Role | Trait | Personality to show in the face |
|---|---|---|---|---|
| `ayesha` | Ayesha | Power and Life Support | Practical | Veteran engineer, calm, confident, a little tired eyes, tool on collar |
| `maya` | Maya | Power and Life Support | Leader | Ex-submarine engineer, firm, short hair, direct gaze |
| `bilal` | Bilal | Comms and Navigation | Thinker | Fresh graduate, eager, slightly nervous smile, headset |
| `lin` | Lin | Comms and Navigation | Leader | Ex-air traffic controller, focused, headset, neat look |
| `sana` | Dr. Sana | Science | Thinker | Scientist, curious, glasses, notebook vibe |
| `kofi` | Kofi | Science | Practical | Field geologist, outdoorsy, friendly grin, rugged |
| `omar` | Omar | Launch and Budget | Practical | Ex-launch engineer, older, cautious, grey in hair/beard |
| `zara` | Zara | Launch and Budget | Leader | Generalist, energetic, confident smile, sleeves rolled up |

**Your call:** faces, hairstyles, skin tones, accessories (glasses, headsets, pins, scarves, hijab, braids, freckles), small personality details. Make them **diverse and distinct** so no two look alike in silhouette.

**Prompt (one per character, swap the bracketed part):**
```
[STYLE ANCHOR]
Character portrait, head and shoulders, centered, facing slightly toward viewer, plain transparent/flat background, 64x64 pixel art sprite.
Character: [Ayesha, a calm veteran power systems engineer, mid-40s, South Asian woman, confident tired eyes, wearing a navy mission jumpsuit with an amber collar and a small wrench pin].
Same framing as a set of 8 crew portraits for a strategy game, readable at small size, expressive face, no text.
```
**Cleanup tip:** draw a **template head outline once** (shoulders + head position), then build all 8 on top of it. That's the trick to making them look like one set.

---

### #2 Control room, isometric (MUST) · 480×270 → PNG

**What it's for:** the "home base" screen during the mission (like a Clash of Clans village view). Crew sprites walk between consoles; alerts flash over them.

**Must have:**
- **2:1 isometric** room seen from above at an angle.
- **4 workstations (consoles), one per role**, clearly separated, with **empty floor space in front of each** (crew sprites stand there).
- A **big wall screen** at the back (the game draws the planet or mission view on top of it, so keep it a plain dark rectangle).
- **No people in the image.**
- Leave the **top 40 px fairly calm** (UI sits there).
- **Tell the devs the pixel coordinates** of the standing spot in front of each console (just open the image and note x,y for each). This is how characters line up.

**Your call:** room shape, decor (plants, coffee mugs, posters with no text, cables, a window to space), lighting mood, little stories (a messy desk for Kofi, neat desk for Lin). Console colours can hint at roles (see role colours).

**Prompt:**
```
[STYLE ANCHOR]
Isometric 2:1 pixel art scene, 480x270, a cozy near-future space mission control room seen from above at an angle. Four separate workstations with glowing screens arranged in a semicircle, each with an empty standing spot in front. Large dark blank wall screen at the back. Dark navy walls, cyan screen glow, small amber warning lights, cables, a plant, coffee mugs, a window showing stars. No people, no text, no logos. Calm top area for UI.
```

---

### #3 Title screen scene (MUST) · 480×270 → PNG

**What it's for:** the first thing judges see. It sets the mood.

**Must have:** a strong scene with **empty space in the centre-left** for the game title and "Start" button (added in code). No text.

**Your call:** the composition. Ideas: a rocket on the pad at dawn with Earth's moon rising; a lander above a crater; a crew silhouette looking at Mars.

**Prompt:**
```
[STYLE ANCHOR]
Pixel art title screen background, 480x270, a rocket standing on a launch pad at dusk, huge moon rising behind, stars, distant mountains, cyan and amber lights on the launch tower, dramatic but hopeful. Large empty dark sky area on the left side for a game title. No text, no logos.
```

---

### #4 Destination cards: Moon and Mars (MUST) · 2 × 200×125 → PNG

**What it's for:** the first choice in the game, "Where are we going?" Two big clickable cards.

**Must have:** the planet or body clearly recognisable, same composition for both cards (so they feel like a pair), no text.

**Your call:** the angle (orbit view vs surface view), lighting, a tiny spacecraft for scale.

**Prompt (Moon, then swap for Mars):**
```
[STYLE ANCHOR]
Pixel art card illustration, 200x125, the Moon seen from lunar orbit, grey cratered surface with a dark shadowed south pole, a tiny spacecraft silhouette in the foreground, black starry space. Matching pair card style. No text.
```
Mars version: *"…Mars seen from orbit, rusty red-orange surface, thin pale atmosphere edge, dusty haze, a tiny spacecraft silhouette…"*

---

### #5 Rockets: light, medium, heavy (MUST) · 3 × 32×96 → SVG

**What it's for:** the rocket choice on the Planning Board and the launch animation. The player must **see the size difference** to feel the trade-off (bigger = carries more, costs more).

**Must have:**
- Side view, standing upright, **transparent background**, same base line (bottom pixel row) for all 3.
- Clear size progression: **light** is short and slim (fills ~60% height), **medium** is taller (~80%), **heavy** is full height, wider, with side boosters.
- **No real rocket designs or logos.** Original shapes.

**Your call:** paint schemes (palette colours), fin shapes, nose cones, little details like flags (no real flags/logos) or stripes.

**Prompt:**
```
[STYLE ANCHOR]
Three original rocket sprites side by side for a pixel art game, 32x96 each, side view, standing upright on the same baseline, transparent background. Left: small slim light launcher. Middle: medium two-stage rocket. Right: heavy rocket with two side boosters. White and navy bodies with cyan and amber stripes. No logos, no text, not based on any real rocket.
```

---

### #6 Moon base, Planning Board (MUST) · 320×180 → PNG

**What it's for:** the centrepiece of the main design screen. The game shows **which parts you've chosen by drawing highlights and icons on top of this picture**, so the base needs clear "slots".

**Must have:**
- Isometric lander and habitat on lunar ground, transparent or dark background.
- **Clearly visible areas for:** solar panels, battery/power unit, antenna/dish, habitat module, storage tanks (water/oxygen), airlock (for suits/EVA), science drill, rover parking.
- **Send the devs the x,y centre of each area** (like the control room consoles).

**Your call:** the base's layout and character, lights, tracks in the dust, flags (no real flags), a small greenhouse window.

**Prompt:**
```
[STYLE ANCHOR]
Isometric 2:1 pixel art, 320x180, a small crewed research base on the grey lunar surface near a crater rim: a cylindrical habitat module with an airlock, a deployable solar panel array, a battery/power unit, a dish antenna, water and oxygen storage tanks, a science drill rig, and an empty rover parking pad. Each part clearly separated and readable. Long dark shadows, black sky. No people, no text, no logos.
```

---

### #7 App icon / logo mark (MUST) · 32×32 → SVG + PNG

**What it's for:** browser tab icon, desktop app icon, small logo in the top bar.

**Must have:** readable at 16×16 and 32×32, works on a dark background, **no text** (maybe one letter max).

**Your call:** the idea. Options: a rocket over a crescent moon; a mission patch shape; NOVA's eye; an orbit ring around a planet.

**Prompt:**
```
[STYLE ANCHOR]
32x32 pixel art app icon for a space mission strategy game, a small rocket arcing around a crescent moon inside a round mission-patch shape, cyan and amber on deep navy, bold readable silhouette, no text.
```

---

### #8 NOVA, the robot teacher (MUST) · 32×32 → SVG (4 frames)

**What it's for:** NOVA floats in from the side of the screen and "talks" in every lesson popup. NOVA is the **mascot of the game**: the thing judges remember.

**Must have:**
- **Original design.** It must not look like TARS (Interstellar), BB-8, WALL-E, EVE, Baymax or any other famous robot. Avoid the "tall rectangular monolith" shape entirely.
- A **small hovering drone** with **one big expressive eye or visor** (that's how it shows emotion), friendly and curious.
- Frames: `nova-idle-1`, `nova-idle-2` (gentle hover up/down), `nova-talk-1`, `nova-talk-2` (eye or antenna animates while speaking). Transparent background.

**Your call:** everything else: body shape (round, hexagonal, pebble-like), antennas, tiny thruster flames, little arms or none, colour accents. Give it personality.

**Prompt (concept first, then pixel it):**
```
[STYLE ANCHOR]
Original cute robot mascot for an educational space game: a small floating drone with a rounded hexagonal body, one large glowing cyan eye-visor that shows emotion, a tiny antenna, small amber thruster glow underneath, friendly and curious. 32x32 pixel art sprite, transparent background. Must NOT resemble TARS, BB-8, WALL-E, EVE or any existing robot character. No text.
```

---

### #9 Portrait expressions (SHOULD) · 8 × 2 × 64×64 → SVG

**What it's for:** during events the portrait switches to **worried** (bad news) or **happy** (success), which makes the crew feel alive.

**Must have:** **exactly the same** framing, outfit and pixels as the base portrait; **only the face changes** (eyebrows, mouth, eyes; maybe a sweat drop for worried).

**Your call:** how each personality shows emotion (Omar's worried face is grumpy; Bilal's is panicked).

**How to make them:** don't use AI here. Duplicate the base portrait in your pixel tool and edit just the face. It's faster and keeps them consistent.

---

### #10 Crew sprite for the control room (SHOULD) · 16×24 → SVG (idle + 4 walk frames)

**What it's for:** tiny full-body characters standing at consoles and **walking to a console** when assigned a task.

**Must have:**
- **One base figure** in **neutral grey/white** clothes. The devs recolour the collar and clothes per crew member in code (role colours), so keep clothing in 2–3 flat grey tones.
- Isometric-friendly facing (3/4 view, facing down-right). Transparent background.
- Frames: `crew-base-idle` + `crew-base-walk-1` … `walk-4`.

**Your call:** the walk cycle style, little bounce.

**Prompt:**
```
[STYLE ANCHOR]
Tiny 16x24 pixel art character sprite sheet for an isometric game: one person in a plain light-grey mission jumpsuit, 3/4 view facing down-right, idle pose plus a 4-frame walk cycle, transparent background, simple readable silhouette, no face detail beyond two pixel eyes.
```

---

### #11 Moon surface / Mars surface (SHOULD) · 2 × 480×270 → PNG

**What it's for:** backgrounds behind the mission screen when you're on the surface, and behind EVA and rover events.

**Must have:** horizon in the **lower third**, calm areas for UI panels, no base buildings (the base is a separate image), no text.

**Your call:** time of day, Earth visible in the Moon sky (nice touch!), dust storms on the Mars horizon, rock formations.

**Prompt (Moon):**
```
[STYLE ANCHOR]
Pixel art landscape, 480x270, the lunar south pole surface: grey regolith, crater rims with long black shadows, low sun on the horizon, the small blue Earth in the black starry sky. Horizon in lower third, calm empty sky. No buildings, no people, no text.
```
**Mars:** *"…Martian plain near an ancient river delta, rust-red soil, scattered rocks, butterscotch hazy sky, faint dust storm on the horizon, small pale sun…"*

---

### #12 Mars base (SHOULD) · 320×180 → PNG

Same brief as **#6**, but on Mars, with **bigger habitat modules and recyclers** (the Mars mission lasts 2 years): add a **water recycler unit**, an **oxygen generator**, and a **radiation shelter** (a module covered in packed soil). Rusty ground, butterscotch sky. Send the devs the slot coordinates again.

---

### #13 Astronaut on EVA / spacewalk (SHOULD) · 24×32 → SVG (2 frames)

**What it's for:** plays when you send someone outside to fix something.

**Must have:** full spacesuit, helmet visor, a tool in hand, **suit stripe colour in neutral grey** (the devs tint it per role), transparent background, 2 frames (small movement).

**Your call:** suit design: bulky classic vs sleek future, backpack shape, a helmet light.

**Prompt:**
```
[STYLE ANCHOR]
24x32 pixel art sprite, an astronaut in a white spacesuit with a reflective gold visor, holding a wrench, slight floating pose, two-frame subtle animation, light grey stripe on the arm, transparent background, no text, no logos.
```

---

### #14 Rover (SHOULD) · 32×20 → SVG

**What it's for:** drives along a path on the surface map during science and "rover stuck" events.

**Must have:** side or 3/4 view facing right, 6 wheels, a mast camera, transparent background, original design (not a copy of a real rover).

**Your call:** shape, colours, little antenna flag.

**Prompt:**
```
[STYLE ANCHOR]
32x20 pixel art sprite of an original small six-wheeled science rover, 3/4 view facing right, mast camera, solar panel deck, white and grey body with amber details, transparent background, no text.
```

---

### #15 Outcome scenes (SHOULD) · 3 × 300×150 → PNG

**What it's for:** the top image on the Failure Review Board after a mission.

**Must have:** three moods with **the same scene composition** (same place, different emotion):
- **Success:** capsule splashdown at sunrise or crew celebrating at the base, warm light.
- **Partial:** the base at dusk, some lights off, calm but bittersweet.
- **Failed:** an empty, dark base, red warning light blinking, dust settling. Keep it sad, **not gruesome**, with no harmed people shown.

**Your call:** which scene to use and the storytelling details.

**Prompt (success; adapt for the other two):**
```
[STYLE ANCHOR]
Pixel art scene, 300x150, a small lunar base at sunrise, all lights glowing, a rover returning with samples, Earth in the sky, triumphant warm amber light, hopeful mood. No people visible, no text.
```

---

### #16 Event illustrations (NICE) · 6 × 200×100 → PNG

**What it's for:** shown on top of the most dramatic event cards.

| File | Event | Scene idea |
|---|---|---|
| `event-dust-storm.png` | Dust storm | Base being hit by a wall of dust, panels dimming |
| `event-solar-flare.png` | Solar flare | Sun flaring, crew running into the shelter module |
| `event-recycler-failure.png` | Recycler failure | Leaking pipe, warning lights, puddle |
| `event-ice-discovery.png` | Ice found! | Drill bringing up glittering ice core, happy vibe |
| `event-micrometeoroid.png` | Micrometeoroid hit | Tiny streak hitting a panel, sparks |
| `event-crew-argument.png` | Crew argument | Two silhouettes arguing over a console |

**Prompt template:**
```
[STYLE ANCHOR]
Pixel art event illustration, 200x100, [scene idea], dramatic lighting, readable at a glance, no text.
```
**Event file names must match the event ids** in `events.json`. Check with the devs.

---

### #17 Part icons (NICE) · ~16 × 16×16 → SVG

**What it's for:** the parts catalog on the Planning Board. (The game already has fallback icons, so this is pure polish.)

**Make one icon each for:** small/large solar panel, small/large battery, low/high-gain antenna, relay satellite, spectrometer, ice drill, camera, rover, basic/advanced water recycler, oxygen generator, spacesuit, spare parts kit, habitat module, radiation shelter. (Get the exact part ids from `parts.json`.)

**Must have:** same 16×16 grid, 1-px outline, readable silhouette, transparent background.

**Prompt:**
```
[STYLE ANCHOR]
16x16 pixel art icon set, transparent background, consistent style: solar panel, battery, dish antenna, satellite, drill, camera, rover, water recycler, oxygen tank, spacesuit, toolbox, habitat module, shelter. Each icon a separate readable silhouette, 1-pixel outline, no text.
```

---

### #18 Scenario card art (NICE) · 2 × 200×125 → PNG

- `scenario-shackleton.png`: Moon mission "Shackleton Ice Hunt" (lander at a dark crater rim, ice glint).
- `scenario-jezero.png`: Mars mission "Jezero Long Stay" (habitat near an ancient river delta).

Same composition as the destination cards (#4) so they feel like a set.

---

## 4. For the developers: PNG → SVG converter (Claude Code prompt)

Give this prompt to Claude Code once; the artist then just drops PNGs into `art-src/`:

```
Create a script scripts/pixel2svg.mjs (Node, use the "pngjs" package) that converts pixel-art PNGs into optimized SVGs for the game.

- Input: every PNG in art-src/ (recursive). Output: same relative path under public/assets/ with .svg extension.
- Each opaque pixel becomes part of the SVG; fully transparent pixels are skipped. Reject (warn) semi-transparent pixels.
- Optimize: merge horizontal runs of the same colour into one <rect> (x, y, width, height=1), then merge identical vertical runs where possible. Group rects by colour using <g fill="#rrggbb">.
- SVG root: viewBox="0 0 W H", width/height = native size, shape-rendering="crispEdges".
- Add a "data-palette" check: warn if any colour is not in the palette file art-src/palette.hex (Endesga 32, one hex per line).
- Add pnpm script "art:build". Print a table: file, native size, rect count, output KB. Warn if any SVG > 60 KB (that asset should stay PNG instead).
- Large PNG scenes (backgrounds/*, sprites/base-*) are NOT converted: copy them as PNG.
- In the UI, render all pixel PNGs with CSS image-rendering: pixelated and scale by whole numbers only (2x, 3x, 4x...).
Also update the design system to match the pixel theme: pixel display font for headings (e.g. "Pixelify Sans" or "Silkscreen" via @fontsource), keep a readable font for body text, square corners (radius 0–2px), 2px borders, and the Endesga 32 colours mapped into the existing theme tokens.
```

---

## 5. Hand-off checklist (for the artist)

- [ ] Palette loaded (Endesga 32) in your pixel tool
- [ ] Portrait template head made before drawing the 8 crew
- [ ] Crew ids confirmed with the devs before exporting
- [ ] Coordinates sent for: control room standing spots, Moon base slots, Mars base slots
- [ ] All files named exactly as in the checklist
- [ ] Transparent backgrounds on all sprites, portraits and icons
- [ ] No text, logos or famous characters anywhere
- [ ] Every asset logged in `CREDITS.md`

**Questions while working?** Ask the devs. If something in this brief blocks a good idea, the "Must have" lines are the only hard rules; everything else can bend.
