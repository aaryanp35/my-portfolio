---
name: Aaryan Patel
description: A career read as a climb up Mount Tamalpais, drawn in USGS topographic map material.
colors:
  map-paper: "#F3F5F1"
  black-ink: "#13171A"
  slate-ink: "#3A4146"
  contour-sienna: "#8A4B2B"
  contour-line: "#B27650"
  road-red: "#B7281E"
  vegetation-green: "#5F8350"
  vegetation-tint: "#D9E6D0"
  fog-white: "#FBFCFA"
  zone-redwood: "#B7D1AE"
  zone-woodland: "#C9D6A6"
  zone-chaparral: "#DDCD97"
  zone-summit: "#D4DFE0"
typography:
  display:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "clamp(3rem, 1.6rem + 6vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "clamp(1.5rem, 1.1rem + 1.4vw, 2rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "0.01em"
  title:
    fontFamily: "'Big Shoulders Display', 'Arial Narrow', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "0.05em"
  body:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
    fontVariation: "'opsz' 14"
  label:
    fontFamily: "'Martian Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.06em"
    fontFeature: "'tnum' 1"
  caption:
    fontFamily: "'Source Serif 4', Georgia, serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  square: "0px"
  focus: "2px"
  pin: "50%"
spacing:
  s1: "8px"
  s2: "16px"
  s3: "24px"
  s4: "32px"
  s5: "48px"
  s6: "64px"
  s7: "96px"
components:
  button-resume:
    backgroundColor: "{colors.road-red}"
    textColor: "{colors.map-paper}"
    typography: "{typography.title}"
    rounded: "{rounded.square}"
    padding: "0 16px"
    height: "44px"
  button-resume-hover:
    backgroundColor: "#99251D"
  button-skip-summit:
    backgroundColor: "{colors.map-paper}"
    textColor: "{colors.black-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.square}"
    padding: "0 14px"
    height: "44px"
  button-skip-summit-hover:
    backgroundColor: "{colors.vegetation-tint}"
  mark-primary:
    textColor: "{colors.black-ink}"
    typography: "{typography.headline}"
    rounded: "{rounded.square}"
    padding: "4px 0"
    height: "48px"
  mark-primary-hover:
    backgroundColor: "{colors.vegetation-tint}"
  mark-quiet:
    textColor: "{colors.black-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "4px 0"
    height: "48px"
  link-inline:
    textColor: "{colors.black-ink}"
    typography: "{typography.body}"
    height: "44px"
  link-inline-hover:
    backgroundColor: "{colors.vegetation-tint}"
  legend-box:
    backgroundColor: "{colors.map-paper}"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.square}"
    padding: "{spacing.s3}"
  title-plate:
    backgroundColor: "{colors.map-paper}"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.square}"
    padding: "16px 32px"
  trail-pin:
    backgroundColor: "{colors.black-ink}"
    rounded: "{rounded.pin}"
    size: "26px"
  trail-pin-rest:
    backgroundColor: "{colors.map-paper}"
    textColor: "{colors.contour-sienna}"
    rounded: "{rounded.pin}"
    size: "36px"
---

# Design System: Aaryan Patel

## Overview

**Creative North Star: "The Trail Sheet"**

The whole site is one USGS quadrangle sheet of Mount Tamalpais that the visitor climbs. A fixed neatline frames the window: a thin black rule with corner ticks and edge graduations, a paper margin, a top bar carrying the mountain name and coordinates with a live altimeter, and a bottom bar carrying the declination, an elevation profile that acts as the progress instrument, and a scale bar. Inside the frame, a living illustration (layered ridgelines of West, Middle and East Peak, vegetation that shifts from redwood to woodland to chaparral to bare summit, Karl the Fog drifting in the valleys) scrolls behind sienna contour lines. Content arrives as map furniture set on solid paper: a title plate, legend boxes, sign boards and a summit register.

Density is that of a printed map: compact, hairline-ruled, information in small mono annotations, with one condensed display voice for names and a calm serif for reading. Color comes from the map's own ink set; nothing glows, nothing is glassy, and depth comes from overlapping printed layers, not shadows. The owner rejected the dark, glassy, neon-accent instrument-panel look; this world is its opposite, light only.

Motion is the climb: the scroll drives elevation, the hiker marker walks the dashed route, contours draw in, the scene's palette re-tints by zone, and a flag goes up once at the summit. All motion is transform and opacity, and the page reads complete without JavaScript or under reduced motion.

**Key Characteristics:**
- One sheet, one neatline: fixed paper margin, black hairline frame, top and bottom map bars.
- Every block of text sits on solid map paper with a black hairline border.
- Three voices: condensed caps display, Source Serif 4 body, Martian Mono for measurements.
- Road red is reserved for actions and the position marker.
- Vegetation zones tint the scene by elevation; the route and contours are drawn, not decorated.
- Square corners everywhere except trail pins and the profile dot, which are circles.

## Colors

The palette is a topographic map's printed ink set: cool paper, black ink, sienna contours, vegetation green, and one road red.

### Primary
- **Road Red** (road-red): Actions and position only. The top-bar Resume button fill, the underline under every link and mark label, legend-row symbols, the focus ring, the hiker's pack, the profile position dot and the scale pin. Passes 5.7:1 on map paper, so it may carry text.

### Secondary
- **Contour Sienna** (contour-sienna): The map's brown plate at text weight. Feature-class labels, the series line, zone names in the altimeter, list headings inside legend boxes, dates in strips, active contour strokes, rest-stop pin glyphs, text selection fill. 6.1:1 on paper.
- **Contour Line** (contour-line): The same brown at line weight. Contour strokes, dashed pin leaders, row rules under legend rows and lists, the rest-stop outer rule, scrollbar. Never used for text (3.4:1).

### Tertiary
- **Vegetation Green** (vegetation-green): Fill of the completed portion of the elevation profile (mixed 55% with paper).
- **Vegetation Tint** (vegetation-tint): The single hover and pressed ground for every interactive row, link and button that is not the red Resume button.
- **Zone fills** (zone-redwood, zone-woodland, zone-chaparral, zone-summit): The four vegetation bands painted into the elevation profile. They name the route sections; they are not general UI fills.

### Neutral
- **Map Paper** (map-paper): The ground of the page, the margin, both bars, and every text panel.
- **Black Ink** (black-ink): Body and display text, hairline borders, the neatline, the route line, the hiker. 16.4:1 on paper.
- **Slate Ink** (slate-ink): Secondary text: the role sub-clause, mono meta lines, captions, inactive zone links, coordinates detail. 9.5:1 on paper.
- **Fog White** (fog-white): Base of Karl the Fog in the scene, mixed toward the far-ridge color.

The illustrated scene carries its own per-zone sub-palette (wash, far, mid, near, foreground, sun) that the climb interpolates between four elevation stops; those values live in the sidecar and belong to the scene only.

### Named Rules
**The Road Red Rule.** Red marks where you can go and where you are: actions, their underlines and symbols, the focus ring and the position marker. It never fills a panel, never colors a heading, never decorates.

**The Two Browns Rule.** Sienna at text weight, contour line at stroke weight. Light brown never carries words.

## Typography

**Display Font:** Big Shoulders Display (with Arial Narrow, sans-serif), weights 600 and 800
**Body Font:** Source Serif 4 (with Georgia, serif), optical size 14, weights 400 and 600, italic 400
**Label/Mono Font:** Martian Mono (with ui-monospace, SFMono-Regular, Menlo), weights 400 and 500

**Character:** Condensed uppercase map lettering for names and wayfinding, a warm book serif for anything read in sentences, and a measurement mono for numbers the map would print: elevations, coordinates, dates.

### Hierarchy
- **Display** (800, clamp(3rem, 1.6rem + 6vw, 6rem), 0.9, uppercase): The name on the title plate and each zone heading. On phones it clamps to 2.25rem to 3rem.
- **Headline** (800, clamp(1.5rem, 1.1rem + 1.4vw, 2rem), 1.05, uppercase): Stop names, role lines (line-height 1.3), primary mark labels, the canyon zone heading. The altimeter number uses this size in mono 500.
- **Title** (800, 1.0625rem, 1.15, 0.05em, uppercase): Display-face labels at body size: buttons, list headings, zone links, "My part." leads, the trailhead sign.
- **Body** (400, 1.0625rem, 1.55): Intros, project descriptions, strips, key-value text. Stops hold to a 36rem measure, the intro to 38rem. Italic marks the "what it is" line and zone notes.
- **Label** (400, 0.75rem, 0.06em, uppercase, tabular numerals): Coordinates, place and series lines, dates, inset captions, declination and scale labels.
- **Caption** (italic 400, 0.75rem, 1.4): The plain-language line under a primary mark ("Dates, detail and numbers").

### Named Rules
**The Four Sizes Rule.** The type system has four sizes: label, body, headline and display. Weight, case and face change the voice; size does not multiply.

**The Measurement Mono Rule.** Mono is for elevations, coordinates and dates. Labels, buttons and headings speak in the display face.

## Layout

The viewport is a fixed map window: a paper margin (12px, 6px on phones), a top bar (56px; 52px on phones), a bottom bar (84px; 56px on phones), and the illustrated stage and contour layer pinned between them. Content scrolls over the stage inside that window.

A trail column runs down the left edge (144px wide, 96px below 960px, a 40px spine below 700px). The dashed route, the hiker marker and the circular pins live there; each stop's legend box sits to its right, joined to its pin by a dashed sienna leader. Rest stops shift right on desktop (up to 24rem) as sign boards set off the trail. The hero is a three-column grid (trail, a title plate up to 44rem, and the photo inset aligned to the bottom right); below 960px the inset drops under the plate, and on phones the plate reorders so name, roles, Resume, Email and the four points ahead come first.

Spacing follows an 8px grid (8, 16, 24, 32, 48, 64, 96). Zones open with 96px of air (64px on phones); stops are separated by 48px (32px on phones); legend boxes pad 24px (16px on phones). Every interactive target is at least 44px tall. Breakpoints: 400px and 370px for small-phone fit, 700px for phone to tablet, 960px for tablet to desktop, 1100px and 1400px for neatline labels and peak labels, and a short-landscape query (max-height 520px) that turns the title plate into two columns.

## Elevation & Depth

The system is flat print. Depth comes from overlapping map layers (paper frame over neatline over content over contours over the parallax scene) and from tonal recession in the ridgelines, never from cast shadows.

### Shadow Vocabulary
- **Double neatline** (`box-shadow: 0 0 0 4px` map paper plus a 1px black outline at 4px offset): A zero-offset paper gap and second rule around the title plate, zone headings and summit register, making a printed double frame. The rest-stop variant uses a 3px gap and a contour-line outer rule.
- **Paper halo** (`drop-shadow(0 0 1px paper) drop-shadow(0 0 2px paper)` on the hiker; `paint-order: stroke` with a 4px paper stroke on contour labels): Keeps ink legible where it crosses linework, as map lettering is haloed.

### Named Rules
**The Solid Paper Rule.** Text never sits directly on illustration. Every block of words is set on an opaque map-paper panel with a black hairline.

**The Zero Offset Rule.** Rings and halos are concentric. Nothing on the sheet casts a directional shadow.

## Shapes

Square corners throughout: panels, buttons, marks, the photo inset and bars are all 0px. The only circles are trail pins, the profile position dot and the sun; the only other radius is the 2px softening of the focus ring. Borders are 1px black hairlines; row rules and leaders are 1px contour line, leaders dashed. The route is a dashed black line (3 on, 5 off) that becomes a solid 2.5px stroke behind the hiker. Neatline corners are heavy 3px L-brackets and the frame edges carry small graduation ticks.

## Components

### Buttons
Two buttons exist, both square and 44px tall, set in the Title voice.
- **Resume (top bar):** Road-red fill, map-paper text, a 16px document symbol, 0 16px padding (12px on phones). Hover darkens the red toward ink by 18%; focus switches the ring to black ink so it reads against red.
- **Skip to summit:** Map-paper fill, black text and 1px black border, 0 14px padding, summit glyph. Fades in after the hero and hides at the summit; vegetation-tint hover on pointer devices. Lives in the top bar on desktop and tablet, at the right of the bottom bar on phones.

### Legend Rows (marks)
The signature action pattern: a map legend entry with a 24px road-red line symbol, a 12px gap, and a label, over a 1px contour-line rule, minimum 48px tall, laid out two per row.
- **Primary (Resume, Email):** Label in the Headline voice with a 2px road-red underline at 0.2em offset; a Caption line under it (italic serif, slate ink, indented 40px). Hover lays vegetation tint under the row and thickens the underline to 3px; pressed mixes tint toward contour line.
- **Quiet (GitHub, LinkedIn):** Label in body serif at body size, no underline, same row and hover.

### Inline Links
Body serif at 600, 2px road-red underline, 0.2em offset, 44px minimum height, an optional 18px road-red arrow symbol. Hover lays vegetation tint behind.

### Cards / Containers
- **Title plate and zone headings:** Map paper, 1px black border, double neatline. Plate pads 16px 32px; zone headings pad 16px 24px 24px and size to their content.
- **Legend boxes (stops):** Map paper, 1px black border, 24px padding. Headline and minor stops lead with a line symbol column (56px and 28px); on phones the symbol moves to the top-right corner at 28px.
- **Rest-stop sign boards:** Legend box plus the contour-line double rule, narrower (29rem), offset right of the trail on desktop.
- **Map legend key:** Paper box with a single contour-line border, a sienna symbol and a sienna Title-voice term.
- **Photo inset:** 6px paper mat, 1px black border, double neatline, 4:5 crop, mono coordinate caption.
- **Lists inside boxes:** Rows ruled with 1px contour line; sienna mono dates or sienna Title-voice keys to the left.

### Navigation
- **Highlights:** Under a hairline rule inside the title plate, a sienna Title-voice lead, then four display-face links at 1.25rem (1.125rem and 1.0625rem on phones), each with a 22px ink line symbol and a 2px road-red underline; vegetation-tint hover.
- **Zone links:** Five Title-voice links under the elevation profile in slate ink; hover turns road red and underlined; the current zone is ink with a 2px road-red underline. Hidden below 960px.
- **Altimeter:** Mono numerals at Headline size, a slate "ft" label, and the zone name in sienna Title voice.

### Trail Pins
Circles on the route. Waypoints are 22px ink discs; headline stops are 26px ink discs with a 4px paper inner ring; rest stops are 36px paper discs with a sienna rim and glyph; the summit pin is 48px with an ink rim. Pins pop in with a short overshoot as their stop reveals.

### Elevation Profile
The bottom-bar progress instrument: a black 1.5px profile line over four zone bands, the climbed portion filled in vegetation green, faint ink ticks at each stop, and a 14px road-red dot with a paper ring marking the current position.

## Do's and Don'ts

### Do:
- **Do** set every block of text on an opaque map-paper panel with a 1px black hairline (The Solid Paper Rule).
- **Do** reserve road red for actions, link underlines, legend-row symbols, focus and the position marker.
- **Do** use Martian Mono only for elevations, coordinates and dates, uppercase with 0.06em tracking and tabular numerals.
- **Do** frame important plates with the double neatline: a 4px paper gap and a second 1px black rule.
- **Do** keep corners square; reserve circles for trail pins and the profile dot.
- **Do** give every interactive target at least 44px of height and a vegetation-tint hover.
- **Do** draw symbols as 1.5px line glyphs in a shared sprite, map-legend style, labeled by text beside them.
- **Do** keep motion to transform and opacity, tied to the climb, with the page complete without JavaScript and static under reduced motion.

### Don't:
- **Don't** place text directly over the illustration, the contours or the fog.
- **Don't** add a fifth type size; change face, weight or case instead.
- **Don't** use light contour brown for text.
- **Don't** add directional or blurred drop shadows, glass, glows on UI, or a dark theme.
- **Don't** round panel or button corners, or turn actions into pills.
- **Don't** reach for a centered hero with metric chips or a grid of identical project cards; stops are legend entries along a route.
