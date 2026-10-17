# Aaryan Patel, portfolio

A single page that is a scroll-driven ascent of Mt Tamalpais, drawn as a USGS-style topographic sheet. Mt Tam is the territory and the metaphor: the trailhead is the introduction, the route climbs through the work, and the summit register holds the resume and email.

Live: https://aaryanp35.vercel.app

## The world
- Map paper ground, sienna contour lines, vegetation green and water blue fields, black ink type, road red only for actions and the route marker.
- Condensed caps display face (Big Shoulders Display), Source Serif 4 for reading, Martian Mono for measurements. Four type sizes.
- Neatline frame with coordinates (Mt Tam East Peak 37.9235 N, 122.5965 W), scale bar, declination diagram, and an elevation profile at the bottom edge that doubles as scroll progress.

## The climb
Scroll position maps to elevation (0 to 2,571 ft). One system drives everything: the three-peak Tam ridgelines with parallax, fog that fills the valleys, a sun that rises with altitude, vegetation zones that shift from redwood green to golden chaparral, the active contour band, the route that draws itself, and the elevation counter.

| Zone | Content |
|---|---|
| Trailhead | Name, roles, portrait, resume and email |
| Redwood canyon | The four headline features |
| Oak and bay woodland | Experience as waypoints on the route, a margin note |
| Chaparral and serpentine | Smaller projects, Karl the Fog, athletics, education and skills |
| East Peak | Summit register |

## Stack
Static HTML, CSS and JavaScript, no build step. GSAP 3.13 (ScrollTrigger, MotionPathPlugin) and Lenis 1.3.1 from pinned CDN URLs, Google Fonts. Reduced motion renders a static expedition; content is visible without JavaScript.

## Run locally
    python3 -m http.server 8000

then open http://localhost:8000.

## Structure
- `index.html`: the page, with the SVG scene, contours, route, profile and symbol sprite inlined.
- `styles.css`: tokens, fixed sheet chrome, content.
- `script.js`: the orchestrated climb.
- `assets-src/`: procedural Python (fixed seed) that generates the SVG art. `python3 assets-src/gen.py` writes `assets-src/out/*.svg`; `python3 assets-src/inline.py assets-src/index.template.html index.html` inlines them. Edit markup in `assets-src/index.template.html`, then rebuild.
- `images/`, `resume.pdf`, `site.webmanifest`: assets.
