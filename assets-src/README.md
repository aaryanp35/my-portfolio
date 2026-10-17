# assets-src

Procedural SVG for the Interstate 280 drive. `python3 build_assets.py` (fixed seed 280) writes `svg/*.svg`;
`python3 inline.py` inlines them into `index.template.html` at `<!-- asset: name -->` and writes `../index.html`.

| name | id | viewBox |
|---|---|---|
| sky-sun | svg-sun (`#sun-cool`, `#sun-warm`) | 0 0 1200 800 |
| mountains | svg-mtn | 0 0 2400 520 |
| skyline | svg-skyline | 0 0 1200 240 |
| hills-gold-far | svg-gold-far | 0 0 3200 560 |
| dish | svg-dish | 0 0 520 360 |
| hills-oak | svg-oak | 0 0 3600 600 |
| reservoir | svg-reservoir | 0 0 2000 300 |
| hills-gold-near | svg-gold-near | 0 0 4400 640 |
| fog-a, fog-b, fog-c | svg-fog-a, svg-fog-b, svg-fog-c | 0 0 1600 420 |
| road | svg-road (`#centerline`) | 0 0 1200 120 |
| route | svg-route (`#route-path`, `#route-dot`) | 0 0 560 36 |
| sprite | symbols (sym-shield-280 is 0 0 48 54, others 0 0 24 24) | n/a |

Colors come from CSS classes (`c-straw`, `c-oak`, ...) defined in `styles.css`; literal fills are fallbacks.
