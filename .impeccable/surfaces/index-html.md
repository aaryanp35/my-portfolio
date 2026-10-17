---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: index.html (the whole single-page site)

Scope: the one public page at https://aaryanp35.vercel.app. Visitor mode: Persuade (a recruiter decides whether to keep reading, then reaches for the resume or email).

Audience and job: technical recruiters and hiring managers screening for 2027 APM, data science, and AI engineering roles, often on a phone, deciding in seconds. Action: download the resume, send an email, open a project. Proof: real roles with dates, four headline projects clearly explained in broad terms, public repos and a live app, athletics as character. Constraints: no specific metrics, dollar figures, or data results on the page (they live in the resume); not fintech-flavored; confidential work at resume level only; no phone number; works without JavaScript; respects reduced motion; 360px wide holds.

Chosen direction and memorable moment: the page is one USGS-style topographic quadrangle sheet of Aaryan's territory, and the memorable moment is a trail route drawn across live contour lines that a marker travels as you scroll, with the sheet's scale bar counting progress.

Unresolved: whether a dark variant ships (not required); whether the rotating multi-language word returns (optional, only if it finds a functional home such as the sheet's language line); the Proxii repo rename.

## Direction contract

THESIS: One map sheet, read like a map. The page owns the idea that a person's work and ground can be surveyed and labeled honestly, and it refuses the category default of a centered hero with a positioning line, metric chips, pill buttons, and a grid of identical project cards.

OWN-WORLD: USGS quadrangle vocabulary carried as the page's own material. Ground is map paper, a cool off-white, never cream or parchment; contour lines in sienna own the whole background as a drawn system, with vegetation green tint fields and one water blue field owning entire regions of the sheet, so color commits at page scale. Road red is the single action color and appears only on things you can act on. Black ink for type. A neatline border runs around the viewport content with mono coordinate ticks and corner marks; section breaks are map margin rules, not cards. Type: a condensed display face in caps for the title block and section names in the manner of quad names (Big Shoulders Display or a comparable condensed face with character), a readable serif for body and italic feature labels (Source Serif 4), and a measurement mono for coordinates, dates, the scale bar, and the declination diagram (Martian Mono or Azeret Mono). Four type sizes only. Icons and map symbols are authored SVG in one stroke weight. No gradients, no glass, no glow, no grain filter over the whole page; wear only where the sheet would be handled (a fold crease at the quarter marks, nothing else). Light only; the scene is a recruiter at a desk or on a phone in daylight.

STORY: The visitor lands on a sheet titled with Aaryan's name and reads in three seconds that he is an Associate PM at DeUNA, builds AI systems for defense wargaming at Strand Analytica, and ships his own products, with a face and a place attached. They follow the route through his roles in order, scan the legend of four headline features (DeUNA, Athenaeum, Strand Analytica, Proxii) and the smaller features, read a short margin note on payments and defense work in plain language, see that he rows and hikes, and reach the revision block where the resume download and email sit as the sheet's primary marks. They leave able to name his role, two projects, and one thing about him as a person.

FIRST VIEWPORT: Desktop 1440x900. The neatline frame inset from the viewport edges with mono latitude and longitude ticks along all four sides (Menlo Park and Toronto coordinates). Top left, the title block: AARYAN PATEL in condensed caps at display scale, under it one line in mono, MENLO PARK, CALIFORNIA and TORONTO, ONTARIO QUADRANGLE, under it the series line, PRODUCT, DATA, AI. Left column below the title: a first person intro paragraph in the serif, three sentences, broad. Under it the two primary marks as legend rows with road-red symbols: Resume (PDF) and Email, plus GitHub and LinkedIn as quiet legend rows. Right half: the contour field, with a vegetation green tint region behind the upper right and the portrait photo set in as the sheet's photo inset, framed by its own neatline, with a mono caption of its coordinates and place. The route begins at the bottom edge of the first viewport, so the trail is visible before any scroll. On a 390 wide phone the title block and intro stack first, the two primary marks are visible without scrolling, and the photo inset follows.

FORM: USGS topographic quadrangle sheet, candidate 3 of the ordered grounded list, assigned by the roll. seed:fc6c3a93d59d64b7

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Raises kept from declined challengers

- One-bit desktop: total palette commitment. The sheet uses only the USGS ink set, no extra accents.
- Teletext: a rigid grid. The neatline, ticks, and legend sit on one strict 8px grid.
- Neubrutalist: decisive type sizes. Four sizes only, set left, no in-between scales.
- Numbered insert series: one numbering system. Waypoints and legend features share one numbered run across the page.
- Hand-processed film: artifacts tied to events. Paper wear only at the fold marks, never a global filter.
- Miura fold: one control propagates across the sheet. Scroll drives one linked system, the route marker, the active contour band, and the scale bar, rather than scattered effects.
