# DAR-UL-HIKMAH FAMILY CARNIVAL 2026 — Interactive 3D Carnival

A premium, fully interactive **Three.js** visualization of the **DAR-UL-HIKMAH FAMILY CARNIVAL 2026**,
organized by **Dar-ul-Hikmah School, Kathore Kalan (Chak No. 303 JB), Punjab, Pakistan** —
**26 December 2026**. *Lighting Minds, Shaping Tomorrow.*

The scene is a real-time 3D world (not pictures): branded entrance gate, 8 detailed food stalls,
6 game booths, 6 modeled ride concepts (Mini Ferris Wheel, Mini Carousel, Bouncy Castle, Kiddie
Train, Inflatable Slide, Children's Spin Ride), main stage, Science • Art • Creativity zone,
family photo wall, seating & support facilities, visitors in Pakistani winter clothing, festive
decorations, day / golden-hour / evening lighting, cinematic promotional tour and clickable
planning information for every attraction.

---

## 1. Running locally

No build step, no bundler — plain ES modules.

```bash
cd /workspace
python3 -m http.server 8080
# then open  http://localhost:8080/
```

Any static server works (`npx serve`, VS Code Live Server, etc.). A local server is required
because browsers block ES-module loading from `file://`.

Three.js **r186.1** is vendored locally under `vendor/three/` and `vendor/three-addons/`
(OrbitControls) via an import map in `index.html`, so the app runs offline.

> If you have your own school logo file, drop it into `assets/` and use it in
> `src/gate.js` / `src/textures.js` where the typographic "DH" roundel is placed.
> Until then the project intentionally uses clean typographic branding only.

## 2. Project structure

```
index.html            App shell, UI panel, import map
styles.css            Red / white / charcoal UI theme
vendor/three/         three.module.js (vendored, offline)
vendor/three-addons/  OrbitControls
src/config.js         ★ ALL event text, colors, venue dims, stall/ride data, camera presets
src/main.js           Bootstrap, UI wiring, raycast picking, render loop, cleanup
src/textures.js       Procedural canvas textures (signs, menus, posters, stripes)
src/materials.js      Shared PBR materials + LightRegistry (emissive/lamp boost per mode)
src/venue.js          Ground, provisional boundary, extension treatment, measurements
src/gate.js           Entrance arch, balloons, bunting, lights, welcome desk
src/stalls.js         Reusable stall shells + all food displays & game apparatus
src/rides.js          Six animated ride models with labels & clearance rings
src/zones.js          Stage, science/art zone, photo wall, support facilities, emergency route
src/decor.js          Instanced bunting, balloon garlands, string lights, direction boards
src/people.js         Stylized visitors (winter wear) — empty / light / lively crowd modes
src/lighting.js       Day / golden hour / evening system with smooth transitions
src/camera.js         Orbit controls, tweened presets, cinematic tour player
README.md             This file
```

## 3. Configuration (`src/config.js`)

Everything editable lives in one object graph:

| Object | Purpose |
|---|---|
| `EVENT` | School name, title, date, village, location line, slogan, area (505.857 m²), capacity target (250), sponsor slots |
| `COLORS` | Deep red / white / charcoal brand palette + accents |
| `VENUE` | Provisional footprint (default 22.491 × 22.491 m ≈ 505.857 m²), gate size, extension size |
| `FOOD_STALLS`, `GAME_STALLS` | Names, canopies, footprints, notes (menus show "PROPOSED • PRICES EDITABLE") |
| `RIDES` | Six ride concepts incl. footprints, space needed, which layout they appear in |
| `LIGHT_PRESETS` | Day / golden / evening sky, sun, fog, exposure values |
| `SHOTS`, `VIEWS`, `PROMO_VIEWS` | Cinematic sequence, camera presets, advertising compositions |

Venue dimensions are also editable live from the UI panel
(*Venue Layout → Venue dimensions → Apply Dimensions*) — everything re-lays out.

### Venue honesty
* The confirmed area is exactly **505.857 m²**; the actual shape/perimeter is **not surveyed**.
  The default square 22.491 m side is clearly labelled **"PROVISIONAL UNSURVEYED FOOTPRINT"**
  on the ground.
* **Mode A — Main Venue**: fits the gate, food street, games street, stage, science zone,
  photo wall, seating/support and **one space-appropriate children's ride (Bouncy Castle)**.
* **Mode B — Expanded Carnival**: adds the visually distinct **"PROPOSED RIDES & ATTRACTIONS
  EXTENSION — ADDITIONAL SPACE REQUIRED • LOCATION NOT YET CONFIRMED"** gravel-toned area with
  the Ferris wheel, carousel, kiddie train, inflatable slide and spin ride fully modeled.
  Switch layouts any time; the ride-zone camera presets auto-switch to Mode B.

## 4. Controls

* **Camera Views** — Hero, Entrance Gate (+ elevated), Ride Zone, Ferris, Carousel, Food Street,
  Games Street, Science & Art, Main Stage, Photo Wall, Overhead Site Plan, Reset.
* **Cinematic Tour** — Play All / Pause / Restart + individual shot selection (10-shot promo
  walkthrough ending on the hero frame; Shot 9 transitions to evening automatically).
* **Lighting** — Daylight / Golden Hour / Evening (smoothly animated transitions; stall lamps,
  bulbs and the gate glow stronger at night, with restrained pulsing — never strobing).
* **Display toggles** — visitors (empty / lightly populated / lively crowd), decorations,
  ride labels, measurement overlay, ride animation on/off.
* **Ride selector** — show/hide each of the six rides individually (tooltips list proposed
  dimensions, operating space and verification notes).
* **Click anything** — stalls, rides, gate, stage, zones, support facilities open an info card
  with name, use, editable dimensions, footprint and planning notes.
* **Promo compositions** — 16:9 hero, 9:16 portrait (entrance-first), food/ride/games/evening
  showcases, sponsor view, site plan. Some auto-switch lighting/layout.

## 5. Screenshots / video export

This app does **not** claim built-in image/video export. Reliable workflow:

1. Choose a promo composition or play the cinematic tour.
2. Screenshot: browser DevTools → `Ctrl+Shift+P` → "Capture screenshot", or OS snipping tool.
3. Video: OS screen recorder (Xbox Game Bar / QuickTime / OBS) while running the tour.
   Set the window to 1920×1080 (16:9) or 1080×1920 (portrait) first.

## 6. Disclaimers (also shown in-scene)

* All stall/ride/zone positions & sizes are **editable concept proposals**, not bookings.
* Real equipment specifications, anchoring, clearances, routes and occupancy must be verified
  with suppliers and through an actual on-site safety assessment. Capacity target (≤250
  visitors) is a planning figure only.
* No trademarked logos are used; sponsor boards are neutral placeholders.

## 7. Performance notes

* Antialiasing, ACES tone mapping, sRGB output, PCF soft shadows (single 2048 shadow map).
* Balloons/bunting flags use `InstancedMesh`; materials and canvas textures are shared/cached.
* Pixel ratio capped at 2; usable on modern desktops and current mobile browsers.
* Resize handling and renderer/texture disposal on unload are implemented in `src/main.js`.
