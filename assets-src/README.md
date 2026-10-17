# assets-src

`gen.py` (seed 20261017) writes `out/*.svg`; `inline.py template out` inlines them at `<!-- asset: name -->` placeholders.

| name | root id | viewBox | notes |
|---|---|---|---|
| scene | `scene` | 0 0 1600 1000 (slice, bottom anchored) | `#sun`, `.lyr` layers `tam mid near`, fog `fog-far fog-mid fog-near`, `.fg` layers `fg-redwood fg-oak fg-chap fg-summit`, `#hatch` pattern |
| contours | `contours` | 0 0 1600 1200 | 30 `.contour` paths, every fifth `.index`, six mono labels |
| route | `route-svg` | 0 0 100 1000 | `#route-path`, `#route-done`, absolute M and C commands, rescaled by script.js |
| profile | `profile` | 0 0 600 48 | `#profile-line #profile-area #pf-clip-rect`, zone rects `#pf-z0` to `#pf-z3` |
| sprite | `sprite` | 24 x 24 symbols | `sym-benchmark shelter lookout spring junction viewpoint saddle camp fog rest trailhead summit register resume email github linkedin arrow` |
| declination | `decl-svg` | 0 0 64 64 | `#decl-rose` |
| scalebar | `scalebar-svg` | -2 0 164 20 | quarter mile steps |
