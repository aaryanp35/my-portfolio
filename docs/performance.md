# How I made the site load and scroll faster

The Mt Tam climb kept its look, its motion and every feature, but it now ships far less code and does far less work per frame. This is what was slow, what I changed, and how I measured it.

## What was slow

I started with a review of the code for tech debt, asking what the page actually needs to do and what the simplest way to do each part is. Four problems stood out.

1. **Three animation libraries and a scroll library for one effect.** GSAP, ScrollTrigger, MotionPathPlugin and Lenis added about 154 KB of JavaScript (59 KB gzipped) and two extra domains, to drive one scroll-linked climb.
2. **Every scroll frame repainted the whole scene.** The ridges, fog, sun and contours lived inside two large SVGs, and every frame changed attributes inside them, so the browser redrew all of it 60 times a second.
3. **Layout was read in the middle of every frame.** The render loop read element sizes right after writing styles, which forces the browser to recompute layout each frame.
4. **The drawings were heavier than they needed to be.** The contour and mountain SVGs were written with absolute coordinates and many redundant points: 204 KB inlined into the page.

## What I changed

1. **Removed all four libraries.**
   - One small `requestAnimationFrame` loop now drives the climb, and it only runs while something is moving.
   - The hiker's position comes straight from the sampled trail path, so MotionPathPlugin was not needed.
   - Card reveals, the contour draw-in, the fog drift and the quail are now CSS animations and transitions, which the browser runs on its own.
   - Scrolling is the browser's native scrolling, with no scroll hijacking.
2. **Gave every scene layer its own SVG.**
   - Each ridge, fog bank, foreground and the contour sheet is a separate SVG, moved with `translate3d`.
   - Scrolling now moves finished pictures instead of redrawing them.
   - On phones each layer is also pinned to the GPU (`will-change`), which measured smoother there.
   - On large desktop windows pinning measured slower, so it is phone-only.
3. **Repainted the colours rarely and gently.**
   - The scene palette shifts in 40 ft steps instead of every frame. The change per step is too small to see.
   - Each step is handed out a few layers per frame, so no single frame has to repaint everything.
4. **Took layout reads out of the frame loop.**
   - Sizes are measured once on load and on resize.
   - Position measurements are batched, all reads first and then all writes.
   - Small indicators move with `transform` instead of `left` and `top`.
5. **Made the drawings lighter.**
   - The generator writes relative path coordinates with one decimal, and drops points that sit within a third of a unit of a straight line.
   - Every fill stops just past the bottom of the frame, so each layer stays small even though it may draw past its own box.
   - `index.html` went from 243 KB to 145 KB (85 KB to 44 KB gzipped) with no visible change.
6. **Trimmed the CSS.**
   - Fourteen scattered copies of the same phone media query became one block, and every other media condition was merged the same way.
   - Rules that never applied were removed.
   - I checked every step with pixel-for-pixel screenshots at seven screen sizes.
7. **Shortened the phone page.** Tighter spacing, 16 px body text and no repeated summary at the summit make the phone page about 19% shorter to scroll.

## How I measured

I served the page locally the way Vercel does (gzip, same fonts and files) and drove Chromium with Playwright.

- **Load, phone profile:** 390 x 844, slow 4G (150 ms round trip, 1.6 Mbps), CPU slowed 4x.
- **Load, desktop profile:** 1440 x 900, fast 4G, normal CPU.
- **Scroll:** a wheel flick through the whole page with the CPU slowed 4x. I counted frames that took longer than 25 ms (slower than about 40 frames a second) and the time the browser spent on script and drawing.

Load numbers are medians of 5 runs before and 3 after.

| Load | Before | After |
|---|---|---|
| Phone: main content visible (LCP) | 748 ms | 536 ms (28% faster) |
| Phone: fully loaded | 1,776 ms | 1,314 ms (26% faster) |
| Phone: climb ready to move | 1,305 ms | 853 ms (35% faster) |
| Desktop: main content visible (LCP) | 596 ms | 348 ms (42% faster) |
| Desktop: fully loaded | 403 ms | 293 ms (27% faster) |
| Data downloaded | 316 KB | 215 KB (32% less) |
| JavaScript shipped, gzipped | 69 KB | 8 KB (89% less) |

| Scroll | Before | After |
|---|---|---|
| Desktop: frames over 25 ms | 67% | 24% |
| Phone: frames over 25 ms | 32% | 12% |
| Desktop: script time during the scroll | 5.1 s | 0.35 s |
| Desktop: drawing (raster) time during the scroll | 47.9 s | 15.7 s |

| Code | Before | After |
|---|---|---|
| Hand-written lines (`script.js`, `styles.css`, `gen.py`, template) | 2,186 | about 1,960 |
| `script.js` lines | 649 | about 410 |

**Caveats.**
- These runs use a headless browser with no graphics card, so absolute numbers on a real laptop or phone will differ.
- The before and after comparison is the meaningful part.
- Desktop first paint (the first pixel of text) is about 60 to 80 ms later than before, even though main content now appears about 40% sooner. Tracing shows the new page does less script and layout work before that first paint, and both versions spend most of that time drawing the scene in software. On a machine with a graphics card that drawing is much cheaper.
