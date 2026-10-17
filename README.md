# Aaryan Patel | Portfolio

A static, single-page portfolio for Aaryan Patel (product, data and AI). The page is one topographic quadrangle map sheet: contour lines over the whole ground, a green vegetation tint, a blue bay at the foot, and a trail route that a marker travels as you scroll. Light only, no build step.

Live: https://aaryanp35.vercel.app (Vercel, deploys from `main`)

## Stack

- Plain HTML, CSS and JavaScript. No framework, no bundler, no package manager.
- Motion: GSAP 3.13.0 (core, ScrollTrigger, MotionPathPlugin) from cdnjs and Lenis 1.3.1 from jsDelivr. Versions are pinned in `index.html`.
- Fonts from Google Fonts: Big Shoulders Display (titles), Source Serif 4 (text), Martian Mono (coordinates, dates, scale bar).
- Map symbols are authored inline SVG in one stroke weight.

## Run locally

```
python3 -m http.server 8000
```

Then visit http://localhost:8000. The CDN libraries and fonts need a connection; without them the page still renders fully, just without animation.

## Structure

```
index.html        Markup, SEO meta, JSON-LD, the inline contour and water layers
styles.css        Tokens (palette, four type sizes), frame, layout, states
script.js         Trail route, scale bar, section readout, scroll-linked motion
tools/contours.mjs  Generator for the contour, vegetation and water layers
images/           Portrait (webp + jpg), favicons, social image
resume.pdf        The primary action
site.webmanifest  Web app manifest
```

## The map layers

The contour lines are generated, not drawn by hand. To change them, edit the seed or the field in `tools/contours.mjs` and run:

```
node tools/contours.mjs
```

It rewrites the SVG between the `contours` and `water` marker comments in `index.html`. Output is deterministic.

## How it behaves

- Content is visible without JavaScript. Hidden start states apply only when `<html>` has the `js` class, and a 3 second backstop removes it if the script never finishes.
- With `prefers-reduced-motion: reduce` everything renders in its final state: contours drawn, fog light and still, the marker resting at the trailhead.
- The trail is built in `script.js` from the numbered waypoints, so adding an item to a list extends the route.
- Update copy directly in `index.html`. Replace `resume.pdf` to update the download.
