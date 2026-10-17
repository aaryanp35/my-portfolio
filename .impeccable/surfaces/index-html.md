---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: index.html (the whole single-page site)

Scope: the one public page at https://aaryanp35.vercel.app. Visitor mode: Persuade (a recruiter decides whether to keep reading, then reaches for the resume or email).

Audience and job: technical recruiters and hiring managers screening for 2027 APM, data science, and AI engineering roles, often on a phone, deciding in seconds. Action: download the resume, send an email, open a project. Proof: real roles with dates, four headline projects clearly explained in broad terms, public repos and a live app, athletics as character. Constraints: no specific metrics, dollar figures, or data results on the page (they live in the resume); not fintech-flavored; confidential work at resume level only; no phone number on the page (the owner keeps it in the PDF); works without JavaScript; respects reduced motion; must work well on mobile and hold at 360px wide.

Chosen direction and memorable moment: the page is an animated climb up Mount Tamalpais in Marin, drawn in the topographic map material. The memorable moment is rising through the redwoods, woodland, and chaparral as the altimeter climbs, and topping out above Karl the Fog with East Peak's fire lookout poking through, where the summit register holds the resume and email.

History: an earlier round rolled and locked a topographic quadrangle sheet (seed below). Six renditions were built. The recruiter review ranked the I-280 drive first and the owner briefly chose it, then switched to this Mt Tam climb, the version they originally asked for, with the recruiter's fixes applied.

Unresolved: Proxii repo rename; whether an Athenaeum public repo gets linked later.

## Direction contract

THESIS: The page is a climb, read like a trail map. It owns the idea that a career can be walked as a route with named stops, from a redwood trailhead to a summit, and refuses the category default of a centered hero with metric chips, pill buttons, and a grid of identical project cards.

OWN-WORLD: USGS topographic material carried into a living mountain. Map paper ground in a cool off-white, sienna contour lines as a drawn system, vegetation green and water blue fields, black ink type, road red only for actions and the route marker. Layered SVG ridgelines of Tam's real three-peak silhouette (West, Middle, East Peak with its lookout) with gentle parallax; vegetation zones shift with elevation, redwood green low, oak and bay woodland, golden chaparral and serpentine high; Karl the Fog fills the valleys and the visitor rises above it. Condensed caps display face (Big Shoulders Display), Source Serif 4 for body, a measurement mono for elevations, coordinates, and dates. Neatline chrome with East Peak coordinates, an elevation profile as the progress instrument, a scale bar and declination. Body text always sits on a solid paper ground, never directly on illustration. Four type sizes. Light only.

STORY: The visitor arrives at the trailhead, reads in three seconds that Aaryan is an Associate PM at DeUNA and builds AI systems for defense wargaming at Strand Analytica, sees his face as the sheet's photo inset, and sees Resume and Email as the primary marks. Climbing, they reach the four headline points first (DeUNA, Athenaeum, Strand Analytica, Proxii), then the experience waypoints in order, then the smaller points and Karl the Fog, then rest stops for the payments and defense note, rowing, education and skills, and top out at the summit register with resume and email. They leave able to name his role, two projects, and one thing about him.

FIRST VIEWPORT: Desktop 1440x900. A slim top bar with the mountain name and coordinates at left and the altimeter (elevation in feet and the current zone name) at right. The sheet below: AARYAN PATEL in condensed caps at display scale top left, the two role lines under it at title scale, the place and series lines in mono, a three-sentence first person intro on a solid paper ground, and the primary marks as legend rows: Resume (PDF) with the caption "Dates, detail and numbers", Email, then GitHub and LinkedIn. The Tam ridgeline with its three labeled peaks and lookout fills the upper right behind the photo inset, redwood spires frame the edges, and the trailhead sign with the red marker starts the dashed route at left. A bottom bar carries the declination, the elevation profile with its five zones, and the scale bar. On a 390 wide phone the name, the two role lines, Resume and Email are visible without scrolling, and the four headline points start immediately below.

FORM: Mount Tamalpais climb in the topographic material, chosen by the owner after the rendition round; it extends the rolled topo world rather than replacing it. Original roll seed:fc6c3a93d59d64b7.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Raises kept from the other renditions

- I-280 drive: a persistent Resume (PDF) action in the top bar, the four headline points named as links inside the first viewport, and the strongest phone first screen.
- Topo A: selected work comes before experience, and the resume carries the caption "Dates, detail and numbers".
- Topo B: each headline point carries an explicit "My part" ownership line.
- Topo C: discreet, plain description of confidential work; contours fade behind text blocks.
- Team North: one witty mapping applied consistently (here, map symbols by feature class).
