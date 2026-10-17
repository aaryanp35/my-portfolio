# Aaryan Patel | Portfolio

A static, single-page portfolio for Aaryan Patel (product, data science and AI engineering).
Light and dark themes, scroll-driven motion, and no build step.

Live: https://aaryanp35.vercel.app (Vercel, deploys from `main`)

## Stack

- Plain HTML, CSS and JavaScript. No framework, no bundler, no package manager.
- Motion: GSAP 3.13.0 (core, ScrollTrigger, SplitText, MotionPathPlugin) from cdnjs, and Lenis 1.3.1 smooth scroll from jsDelivr. Versions are pinned in `index.html`.
- Fonts: Instrument Serif, Inter Tight and JetBrains Mono from Google Fonts.
- Icons are inline SVG sprites in `index.html`.

## Run locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

Then visit http://localhost:8000. An internet connection is needed for the CDN libraries and fonts. Without them the page still renders fully, just without animation.

## Structure

```
index.html        Markup, SEO meta, Open Graph tags, JSON-LD Person schema
styles.css        Design tokens (custom properties), layout, components
script.js         Theme, nav, scroll-spy, copy-email, clock, GSAP motion
images/           Profile photo (webp + jpg), social and favicon assets
resume.pdf        Linked from the nav, hero and contact section
site.webmanifest  Web app manifest
```

## How it behaves

- Content is visible without JavaScript. Hidden start states only apply when `<html>` has the `js` class.
- If GSAP fails to load, or 3 seconds pass without the script finishing, the `js` class is removed and everything shows in its final state.
- With `prefers-reduced-motion: reduce`, all animation and smooth scrolling are off.
- Theme follows the system by default. The toggle stores the choice in `localStorage` (wrapped in try/catch).

## Update content

- Text lives directly in `index.html`, one section per block: hero, work, experience, focus band, athletics, skills, contact.
- Metrics that count up use `<span class="count" data-to="230" data-prefix="$" data-suffix="M">$230M</span>`. Keep the final value in the HTML.
- Colors, fonts and radii are CSS custom properties at the top of `styles.css`.
- Replace `resume.pdf` to update the download. Keep the filename.
- Page URL, Open Graph and JSON-LD values are in the `<head>` of `index.html`.

## Credits

- [GSAP](https://gsap.com) by GreenSock, including ScrollTrigger, SplitText and MotionPathPlugin.
- [Lenis](https://github.com/darkroomengineering/lenis) by Darkroom Engineering.
- [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif), [Inter Tight](https://fonts.google.com/specimen/Inter+Tight) and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) via Google Fonts.
