# TEAM.md: interface contract, Team South (Mt Tamalpais expedition)

Not served, not referenced by any page file. `.vercelignore` excludes it, `assets-src/` and `.impeccable/`.
Ground truth for the whole build. Files: `index.html`, `styles.css`, `script.js`, `assets-src/*` (Python, fixed seed 20261017).

## 1. Concept
One map sheet that is a scroll-driven ascent of Mt Tamalpais (Marin). Scroll = elevation. The visitor is never said to hike it; Mt Tam is the territory and the metaphor.
Fixed layers, back to front: `#stage` (zone wash, sun, ridgelines, fog, foreground vegetation, summit lookout), `#contours` (sienna contour overprint), `main` (content, trail column at left), chrome (neatline, top bar, bottom bar with profile). Content scrolls under the opaque bars.

## 2. Sections, ids, elevation bands
Elevation E in feet. `main > #trailhead` then `.route > #canyon #woodland #chaparral #summit`.
| id | band (ft) | zone label (top bar) | content |
|---|---|---|---|
| trailhead | 0 to 100 | TRAILHEAD | title block, intro, actions, portrait inset, trail start |
| canyon | 100 to 700 | REDWOOD CANYON | headline legend points 1 to 4 (DeUNA, Athenaeum, Strand Analytica, Proxii) |
| woodland | 700 to 1400 | OAK AND BAY WOODLAND | route waypoints 5 to 9 (experience, in order), rest stop: payments and defense note |
| chaparral | 1400 to 2300 | CHAPARRAL AND SERPENTINE | legend points 10 to 13 (ECO225, Firsthand, Auratune, Meal Planner), 14 Karl the Fog, rest stop athletics, rest stop education and skills |
| summit | 2300 to 2571 | EAST PEAK | summit register: Resume (PDF), Email, GitHub, LinkedIn, revised line |
One numbering run in trail order (1 to 14). Headline legend points sit before the experience waypoints so the four headline features are inside the first scroll.
Every stop is `<article class="stop ..." data-elev="N" id="...">`; elevation table is the scroll-to-elevation map (section 6).
Stops (id, data-elev): trailhead 0; canyon-head 100; deuna 160; athenaeum 280; strand 400; proxii 540; woodland-head 700; wp-deuna-pm 800; wp-strand 920; wp-deuna-ds 1040; wp-lookacross 1160; wp-apg 1280; rest-defense 1380; chaparral-head 1480; eco225 1620; firsthand 1720; auratune 1800; mealplanner 1880; karl 1960; rest-athletics 2080; rest-education 2220; summit-head 2400; register 2571.

## 3. Class names
Chrome: `.neatline .nl-top .nl-bottom .nl-left .nl-right .nl-corner`, `.bar-top .bar-bottom`, `.coords`, `.elev .elev-num .elev-zone`, `.profile` (svg id `profile`), `.profile-dot`, `.zone-links`, `.decl`, `.scalebar`, `.scale-pin`.
Scene: `.stage`, `svg#scene`, `.lyr` with `data-lyr` and `data-t`, `.fog`, `.drift`, `#sun`, `.fg`, `svg#contours`, `.contour`, `.contour.index`.
Content: `.hero .title-block .roles .series .intro .marks .mark .mark-primary .mark-quiet .inset .inset-cap`, `.route .trail .trail-svg .route-line #route-path #route-done .route-marker`, `.zone .zone-head`, `.stop .pin .stop-body .stop-meta .stop-name .stop-what .stop-part .stop-links`, `.stop-headline` (large), `.stop-minor` (compact), `.stop-wp` (experience waypoint), `.stop-rest` (rest stop), `.legend-sym`, `.margin-note`, `.strip` (athletics), `.kv` (education, skills), `.register`, `.reveal` (entrance hook), `.sr-only`, `.skip`.
State classes on `html`: `js`, `reveal-all` (3s backstop), `rm` (reduced motion static).

## 4. CSS custom properties
Palette: `--paper #F3F5F1`, `--ink #13171A`, `--ink-2 #3A4146`, `--sienna #8A4B2B` (text), `--sienna-line #B27650` (lines), `--veg #5F8350`, `--veg-tint #D9E6D0`, `--veg-deep #2F5238`, `--water #3E6F8E`, `--water-tint #D6E4EB`, `--road #B7281E` (actions and route marker only), `--fog #FBFCFA`.
Zone palette (set live by JS on `.stage`): `--wash --far --mid --near --fg --sun --fog-o --hatch-o`. Defaults at E=0 so no-JS renders the trailhead pose.
Zones: canyon wash #DCE8D8 far #B9CEC8 mid #9DBB95 near #7FA386 fg #6C9772; woodland #E4EAD2 / #BFCFC6 / #A9BE8A / #8AA46A / #7FA874; chaparral #EDE5C9 / #C9D0C4 / #D3C28E / #BC9F68 / #B0A068; summit #EEF2F1 / #C9D6DA / #D8DDD2 / #C5C6AF / #B3B09A.
Type (four sizes only): `--t-label 0.75rem` (mono), `--t-body 1.0625rem` (serif), `--t-head clamp(1.5rem, 1.1rem + 1.4vw, 2rem)` (condensed caps), `--t-display clamp(3rem, 1.6rem + 6vw, 6rem)` (condensed caps). Families: `--f-display 'Big Shoulders Display'`, `--f-serif 'Source Serif 4'`, `--f-mono 'Martian Mono'`.
Layout (8px grid): `--s1 8px --s2 16px --s3 24px --s4 32px --s5 48px --s6 64px --s7 96px`, `--inset 12px` (6px phone), `--bar-top 44px`, `--bar-bot 84px` (56px phone), `--trail-w 144px` (40px phone), `--measure 40rem`.
Motion: `--ease-out cubic-bezier(.16,1,.3,1)`.

## 5. SVG assets (`assets-src/gen.py` writes `assets-src/out/<name>.svg`; `inline.py` inlines into `<!-- asset: name -->`)
| name | id | viewBox | notes |
|---|---|---|---|
| scene | `scene` | 0 0 1600 1000, `xMidYMax slice` | layers in order: `#sun`, `lyr tam` (West, Middle, East Peak, lookout, labels), `fog-far`, `lyr mid` (Marin ridge), `fog-mid`, `lyr near` (oak domes), `fog-near`, `fg-redwood`, `fg-oak`, `fg-chap`, `fg-summit` (lookout tower, rises in). Hatch shade shapes per ridge use `<pattern id="hatch">`. |
| contours | `contours` | 0 0 1600 1200, `xMidYMid slice` | 30 paths `.contour` (every fifth `.index`) with `data-lvl`, mono index labels |
| route | `route-svg` | 0 0 100 1000, `none` (JS rebuilds at pixel size) | `#route-path` base, `#route-done` overlay, C-only absolute commands |
| profile | `profile` | 0 0 600 48, `none` | `#profile-line #profile-area #profile-done` + `#pf-clip-rect`, zone bands |
| sprite | `sprite` | symbols 24x24, stroke 1.5 | `sym-benchmark sym-shelter sym-lookout sym-spring sym-junction sym-viewpoint sym-camp sym-fog sym-rest sym-trailhead sym-summit sym-register sym-resume sym-email sym-github sym-linkedin sym-arrow` |
| declination | `decl-svg` | 0 0 64 64 | `#decl-rose` rotates with scroll, true north star and magnetic arrow |
| scalebar | `scalebar-svg` | 0 0 160 20 | alternating segments |
All inline (page self-contained). Sprite symbols used by `<use href="#sym-...">`.

## 6. JS hooks and scroll-to-elevation
`script.js` (all defer; GSAP 3.13.0 ScrollTrigger and MotionPathPlugin, Lenis 1.3.1 on fine pointers).
- `buildRoute()`: rescales `#route-path` control points to the `.trail` pixel size, sets viewBox, places each `.pin` at the path point nearest its stop (`--pin-x`).
- `buildMap()`: stops `[ {scroll, elev} ]` where `scroll` is the scroll position at which the stop's pin sits on the 42% line of the window; E = piecewise linear over the stops, clamped 0 to 2571.
- Master timeline: one `gsap.timeline` with ScrollTrigger scrub (0.6). Tween A drives a proxy `e` with ease = scroll fraction to E fraction; Tween B moves `.route-marker` along `#route-path` with MotionPathPlugin, ease = scroll fraction to arc fraction. `render(E)` sets: counter and zone label, layer transforms (`data-t` is translateY at the summit), fog opacity and tops, sun arc, hatch angle and opacity, zone palette interpolated across zone centers (350, 1000, 1800, 2500), foreground crossfades, declination rotation, scale pin, profile clip and dot, active contour band, `#route-done` dashoffset.
- Entrances: `.reveal` rises 4px, 0.5s expo.out, once. Contours draw once on load (`pathLength=1`, staggered, under 1.6s).
- Fog drift: `.drift` translateX loop 60 to 90s.
- `gsap.matchMedia`: `(prefers-reduced-motion: no-preference)` full system; `reduce` adds `html.rm`: no scrub, no Lenis, no drift, no draw; route fully drawn; pose snaps per stop via IntersectionObserver; counter, zone, profile dot and route marker update discretely.
- No JS: all content visible, route and profile static, scene at trailhead pose. Hidden initial states only under `html.js`, backstop `reveal-all` at 3s.

## 7. Copy inventory and word limits
Hero: h1 AARYAN PATEL; roles two lines (6 words each max); mono lines; series PRODUCT, DATA, AI; intro 3 sentences, 70 words max; marks Resume (PDF), Email, GitHub, LinkedIn.
Zone heads: h2 plus one line, 20 words max.
Headline points: what 18 words max, part 40 words max. Waypoints: role, company, mono dates, 35 words max. Minor points: what 20 words, part 12 words. Karl: one line from the packet. Rest stops: note 60 words; athletics list; education and skills 90 words.
Rules: no digits with M K or %, no dollar signs, no em dashes, no phone, no "passionate", no invented facts, never claim he hikes Mt Tam.

## 8. Build notes (lead)
The Agent tool was not available in this session, so the lead built every file named in sections 1 to 7 directly (structure and copy, CSS, SVG generator, motion, QA) instead of four parallel specialists. Source of the page markup is `assets-src/index.template.html`; `index.html` is its inlined output.
Departures from the packet's first viewport: the portrait inset sits low in the right column over the scene (not mid-sheet on a contour field); the route begins in the left trail column inside the first viewport; the right half is the Mt Tam ridgeline scene instead of a green tint region; a role line pair (Associate PM at DeUNA, AI for defense wargaming at Strand Analytica) is added under the name. Headline features precede the experience route so they fall inside the first scroll; numbering is one run in trail order. The scale bar is paired with the elevation profile as the progress indicator.
