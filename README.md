# Aaryan Patel, portfolio

A single page that is a scroll-driven climb up Mt Tamalpais, drawn as a USGS-style topographic sheet. The trailhead is the introduction, the route climbs through the work, and the summit register holds the resume and email.

Live: https://aaryanp35.vercel.app

## The world
- Map paper ground, sienna contour lines, vegetation green and water blue fields, black ink type, road red only for actions and the hiker's pack.
- Big Shoulders Display for names and headings, Source Serif 4 for reading, Martian Mono for coordinates and dates.
- Every block of text sits on a solid paper panel (title plate, legend box or sign board). Contours and ridgelines stay behind.
- Neatline frame with East Peak coordinates, a scale bar, a declination diagram, and an elevation profile that doubles as scroll progress. The top bar holds the altimeter, Skip to summit, and a persistent Resume (PDF) button.

## The climb
Scroll position maps to elevation. One system drives the three-peak ridgelines, fog, sun, vegetation zones, the contour band, the self-drawing route, a small hiker who walks it, and the altimeter.

| Zone | Content |
|---|---|
| Trailhead | Name, roles, highlights, portrait, resume and email |
| Redwood canyon | The four headline points: DeUNA, Athenaeum, Strand Analytica, Proxii |
| Oak and bay woodland | Experience, newest first |
| Chaparral and serpentine | Smaller projects, Karl the Fog, athletics, education and skills |
| East Peak | Contact: resume, email, and an at-a-glance list (hidden on phones) |

Authored motion (transform, opacity and stroke-dashoffset only): a red-tailed hawk circling near the trailhead, contours that draw in zone by zone, pins that drop onto the trail, a lookout beacon near the summit, a warming sun, and a pair of quail crossing the chaparral. Scrolling is the browser's own (no scroll hijacking); the palette moves in 40 ft steps so it rarely repaints, and touch devices skip the fog drift and blur. Reduced motion renders a still, complete sheet.

## Stack
Static HTML, CSS and JavaScript with no libraries and no build step for the page itself: one requestAnimationFrame loop drives the climb, and each scene layer is its own SVG so the browser moves it on the GPU instead of repainting. Fonts from Google Fonts. Content is visible without JavaScript.

## Performance
I rebuilt the motion to load and scroll faster without changing the look. The full write-up, with the method and numbers, is in [docs/performance.md](docs/performance.md).

- No JavaScript libraries: one small animation loop plus CSS replaced GSAP, ScrollTrigger, MotionPathPlugin and Lenis (JavaScript shipped went from 69 KB to 8 KB gzipped).
- Each scene layer is its own SVG, so scrolling moves finished pictures instead of repainting the scene; colour shifts happen in small steps, a few layers per frame.
- No layout reads inside the animation loop; sizes are measured on load and resize.
- Lighter drawings: relative, simplified path data took the page from 85 KB to 44 KB gzipped.
- Measured in a headless browser: phone main content appears 28% sooner, desktop 42% sooner, and slow scroll frames fell from 67% to 24% on desktop and from 32% to 12% on phones.

## Run locally
    python3 -m http.server 8000

then open http://localhost:8000.

## Regenerate the art
`index.html` is generated. Edit `assets-src/index.template.html` and `assets-src/gen.py`, then:

    python3 assets-src/gen.py
    python3 assets-src/inline.py assets-src/index.template.html index.html

`gen.py` (fixed seed) writes the scene, contours, route, profile, symbol sprite, declination and scale bar SVG to `assets-src/out/`; `inline.py` inlines them at the `<!-- asset: name -->` placeholders.

## Files
- `index.html`, `styles.css`, `script.js`: the page.
- `assets-src/`: template, generator and notes (not deployed).
- `images/`: Golden Gate Bridge favicon (`favicon.svg` plus PNG sizes), OG image, portrait.
- `resume.pdf`, `site.webmanifest`: the resume and the manifest.
