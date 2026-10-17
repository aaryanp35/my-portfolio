# TEAM.md: interface contract for the Interstate 280 drive (Team 280)

Not served, not referenced by the page. Authoritative for ids, classes, tokens, hooks and copy limits.
Where the packet's topo-sheet rules conflict with the highway brief, the highway brief wins (see DEPARTURES).

## 1. World

One scroll-driven drive south on Interstate 280, San Francisco to Menlo Park. Material: the Caltrans sign system
(guide green, recreation brown, service blue, white Highway Gothic via Overpass, yellow only for actions).
A fixed `.world` scene (hills, fog, reservoir, road) sits behind all content; content is made of signs and panels
with solid fills, so text never depends on the scenery behind it. Light only. Daylight ground, golden hills.

## 2. Section order, ids, stretches, mile ranges (data-mile-from / data-mile-to on each section)

| id | stretch | content | miles |
|---|---|---|---|
| `merge` | Merge, San Francisco | h1, hero sign, vista-point portrait, actions, ahead strip | 0 to 2 |
| `crystal-springs` | Daly City stretch (carries the fog) | h2 Selected work, Karl the Fog advisory, four headline signs each with a "My part." line, four small signs | 2 to 10 |
| `daly-city` | Crystal Springs stretch (carries the reservoir) | h2 Experience, five exits (DeUNA APM, Strand, DeUNA DS full size; LookAcross, American Precision Gear compact) | 10 to 22 |
| `serra` | Junipero Serra rest area | h2 Rest area, "How the work connects" note, rowing strip | 22 to 26 |
| `stanford` | Stanford dish hills | h2 Vista point, education, skills | 26 to 29 |
| `sand-hill` | Sand Hill Road exit | h2 Contact, final sign with resume and email | 29 to 30 |

Ids keep their v1 names but sections follow document order (Selected work before Experience), so miles still increase down the page.
Exit numbers equal drive miles and are aria-hidden wayfinding: DeUNA APM exit 12, Strand exit 14, DeUNA DS exit 16, LookAcross exit 18,
American Precision Gear exit 20, Sand Hill Road exit 30. These are the page's own miles, not real postmiles.

Scroll-to-mile: sections are the anchors. For scroll y inside section s: local = clamp((y + 0.4*vh - s.top) / s.height);
mile = lerp(s.from, s.to, local). Counter shows one decimal, tabular mono. mileFraction = mile / 30 drives the route dot.
Global progress p = scrollY / (docHeight - vh) drives world layers.

## 3. Class names

Layout: `.skip`, `.hud`, `.hud__shield`, `.hud__mile`, `.hud__mile-num`, `.hud__place`, `.hud__route`, `.hud__nav`, `.hud__resume`,
`.world`, `.layer` (+ `.layer--sky-cool`, `--sky-warm`, `--sun`, `--sun-warm`, `--mtn`, `--skyline`, `--gold-far`, `--dish`, `--oak`,
`--reservoir`, `--gold-near`, `--fog-a`, `--fog-b`, `--fog-c`, `--warm`, `--road`), `.stretch`, `.stretch__head`, `.wrap`.
Signs: `.sign` (+ `--green`, `--brown`, `--blue`, `--white`), `.sign__tab`, `.sign__legend`, `.sign__sub`, `.sign__meta`, `.sign__body`,
`.sign__arrow`, `.sign__symbol`, `.sign__links`, `.gantry`, `.post-sign`, `.sign-grid`, `.sign-grid--small`, `.advisory`.
Panels: `.panel` (+ `--rest`, `--vista`), `.panel__title`, `.photo`, `.photo__cap`, `.strip`, `.strip__list`, `.facts`.
Actions: `.btn`, `.btn--primary` (yellow, Resume and Email only), `.btn--quiet`.
Motion hooks: `[data-reveal]`, `[data-stretch]`, `[data-mile-from]`, `[data-mile-to]`, `[data-layer]`, `[data-fog]`, `#route-path`, `#route-dot`, `#centerline`.

## 4. CSS custom properties (:root)

Sign colors: `--sign-green #00674b`, `--sign-green-deep #004d38`, `--sign-brown #5b3a26`, `--sign-blue #0a5aa8`, `--sign-white #ffffff`,
`--sign-yellow #f7c600` (action only), `--sign-ink #15211a`, `--steel #8e979b`, `--steel-dark #5d6568`.
Ground and light: `--ground #ddd2b2`, `--sky-top #bcd6e4`, `--sky-haze #f1e6cc`, `--sun-warm #ffc063`, `--fog-white #f5f7f6`, `--asphalt #3a3e41`.
Hills: `--hill-mtn-1 #8da4b1`, `--hill-mtn-2 #7490a0`, `--hill-straw #dcbb62`, `--hill-gold #c8962f`, `--hill-ochre #a8741f`,
`--hill-oak #3b4a2c`, `--hill-oak-dark #26331f`. Water: `--water #3f7f9f`, `--water-light #86b9cf`.
Type: `--f-sign "Overpass"`, `--f-body "Source Serif 4"`, `--f-mono "Azeret Mono"`.
Four sizes only: `--fs-display clamp(2.75rem, 7vw, 5.25rem)`, `--fs-title clamp(1.5rem, 2.6vw, 2.25rem)`, `--fs-body 1.0625rem`, `--fs-label 0.8125rem`.
Spacing (8px grid): `--s-1 .5rem` `--s-2 1rem` `--s-3 1.5rem` `--s-4 2rem` `--s-5 3rem` `--s-6 5rem` `--s-7 8rem`.
Sign geometry: `--rim 3px`, `--rim-gap 7px`, `--radius 14px`.
Scene state (set by JS or by `.world[data-stretch]` when motion is reduced): `--fog-o`, `--warm-o`, `--lx-mtn`, `--lx-gold-far`, `--lx-oak`, `--lx-gold-near`.

## 5. SVG assets (source: assets-src/build_assets.py, seed 280; inlined into index.html by assets-src/inline.py)

Placeholders `<!-- asset: name -->` in assets-src/index.template.html. Landscape layers are inlined inline, one per placeholder:

| name | svg id | viewBox | notes |
|---|---|---|---|
| sky-sun | `svg-sun` | 0 0 1200 800 | horizon light, two radial glows: `#sun-cool`, `#sun-warm` |
| mountains | `svg-mtn` | 0 0 2400 520 | Santa Cruz Mountains, two blue-gray ridges |
| skyline | `svg-skyline` | 0 0 1200 240 | San Francisco skyline silhouette with Sutro Tower |
| hills-gold-far | `svg-gold-far` | 0 0 3200 560 | straw rolling hills with ochre folds |
| dish | `svg-dish` | 0 0 520 360 | Stanford dish on its hill |
| hills-oak | `svg-oak` | 0 0 3600 600 | gold hills, oak-dark folds and canopies |
| reservoir | `svg-reservoir` | 0 0 2000 300 | Crystal Springs water band with shimmer |
| hills-gold-near | `svg-gold-near` | 0 0 4400 640 | golden near hills, grass strokes, lone oaks |
| fog-a, fog-b, fog-c | `svg-fog-a`, `svg-fog-b`, `svg-fog-c` | 0 0 1600 420 | radial-gradient puffs (no filters) |
| road | `svg-road` | 0 0 1200 120 | guardrail, asphalt, edge line, `<line id="centerline">` non-scaling dashes |
| route | `svg-route` | 0 0 560 36 | HUD route path `#route-path`, exit ticks, `#route-dot` |

Sprite (one inline `<svg>` of `<symbol>`s, 24x24 viewBox unless noted, one 2px stroke, round caps): `sym-shield-280` (viewBox 0 0 48 54),
`sym-arrow-exit`, `sym-arrow-down`, `sym-camera`, `sym-rest`, `sym-fog`, `sym-lake`, `sym-route` (DeUNA), `sym-columns` (Athenaeum),
`sym-grid-flag` (Strand), `sym-pin` (Proxii), `sym-scatter` (ECO225), `sym-quote` (Firsthand), `sym-note` (Auratune), `sym-fork` (Meal Planner),
`sym-school`, `sym-code`, `sym-doc`, `sym-mail`, `sym-branch`, `sym-linkedin`, `sym-external`.

## 6. JS hooks (script.js)

Head inline script adds `js` to html and a 3s backstop `reveal-all` unless `drive-ready` is set. script.js sets `drive-ready`.
`gsap.matchMedia`: no-preference builds the drive; reduce adds `reveal-all` and `drive-static`, swaps `.world[data-stretch]` per stretch
through IntersectionObserver, updates the mile counter without smoothing, rests the route dot, never moves layers.
Drive: one paused master timeline (duration 1 = page progress) holds mountains, skyline, gold-far, dish, oak, reservoir, gold-near,
fog opacity, warm tint, sun, centerline dash offset; ticker lerps scroll progress into it. MotionPathPlugin moves `#route-dot` along
`#route-path` by mile fraction. Fog puffs drift by independent 70 to 90s yoyo tweens. Lenis on fine pointers only.
Reveals: `[data-reveal]` expo.out 0.6s, 18px rise, once. Hidden initial state exists only under `.js:not(.reveal-all)`.

## 7. Copy inventory (limits in words)

hero intro 3 sentences, 60 words; role lines 2, 8 each; exit blurbs 45 each; feature "what" 20, "my part" 32; small signs 28 each;
rest note 55; rowing strip 6 facts of 8 words plus one 20-word outreach line; education 55; skills 3 groups of 30; contact 30.
No digits followed by M, K or %; no dollar signs; no phone; no em dashes; Karl the Fog advisory: "Seasonal. Rolls in over the hills most summer evenings."

## DEPARTURES from the packet (highway brief wins)

Ground: daylight sky and golden hills, not map paper. Contours, neatline, title block, declination diagram, scale bar, fold creases and legend rows
are replaced by the drive: HUD mile marker, exits, points-of-interest signs. Action color is sign yellow (not road red). Fonts: Overpass for signs,
Source Serif 4 body, Azeret Mono for mile markers and dates (Big Shoulders and Martian Mono dropped). Sky and fog use soft gradients.
Trail route and MotionPath marker become the HUD route dot on a miniature of the drive. Numbered waypoints become exit numbers equal to drive miles.
