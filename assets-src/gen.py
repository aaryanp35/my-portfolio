#!/usr/bin/env python3
"""Procedural SVG assets for the Mt Tamalpais expedition sheet. Fixed seed, no dependencies.
Run: python3 assets-src/gen.py   (writes assets-src/out/*.svg)
"""
import math
import os
import random

SEED = 20261017
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")
os.makedirs(OUT, exist_ok=True)


def f(n):
    s = "%.1f" % n
    return s[:-2] if s.endswith(".0") else s


def simplify(pts, eps):
    """Douglas-Peucker: drop points that sit within eps of the line through their neighbours."""
    keep, stack = {0, len(pts) - 1}, [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        (ax, ay), (bx, by) = pts[a], pts[b]
        L = math.hypot(bx - ax, by - ay) or 1e-9
        best, bi = 0, None
        for i in range(a + 1, b):
            dd = abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / L
            if dd > best:
                best, bi = dd, i
        if bi is not None and best > eps:
            keep.add(bi)
            stack += [(a, bi), (bi, b)]
    return [pts[i] for i in sorted(keep)]


def pts_to_d(pts, close=False, eps=0.3):
    """Polyline as one absolute move and relative line steps, one decimal (sub-pixel at any size the page uses)."""
    if eps and len(pts) > 2:
        pts = simplify(pts, eps)
    r = [(round(x, 1), round(y, 1)) for x, y in pts]
    d = "M%s %s" % (f(r[0][0]), f(r[0][1]))
    if len(r) > 1:
        d += "l" + " ".join("%s %s" % (f(b[0] - a[0]), f(b[1] - a[1])) for a, b in zip(r, r[1:]))
    return d + ("Z" if close else "")


class Noise:
    def __init__(self, seed, octaves=5, base=0.006):
        r = random.Random(seed)
        self.t = []
        for o in range(octaves):
            fr = base * (2.1 ** o) * r.uniform(0.9, 1.15)
            self.t.append((fr, r.uniform(0, 6.283), 1.0 / (1.7 ** o)))

    def __call__(self, x):
        return sum(a * math.sin(fr * x + ph) for fr, ph, a in self.t)


def catmull(keys, per=10):
    k = [keys[0]] + list(keys) + [keys[-1]]
    out = []
    for i in range(1, len(k) - 2):
        p0, p1, p2, p3 = k[i - 1], k[i], k[i + 1], k[i + 2]
        for j in range(per):
            t = j / per
            t2, t3 = t * t, t * t * t
            x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    out.append(keys[-1])
    return out


def bezier_path(keys):
    """Catmull-Rom keys to absolute cubic Bezier path (M and C only)."""
    k = [keys[0]] + list(keys) + [keys[-1]]
    d = "M%s %s" % (f(keys[0][0]), f(keys[0][1]))
    for i in range(1, len(k) - 2):
        p0, p1, p2, p3 = k[i - 1], k[i], k[i + 1], k[i + 2]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += " C%s %s %s %s %s %s" % (f(c1[0]), f(c1[1]), f(c2[0]), f(c2[1]), f(p2[0]), f(p2[1]))
    return d


def ridge(keys, noise, amp, step_per=9):
    pts = catmull(keys, step_per)
    return [(x, y + noise(x) * amp) for x, y in pts]


def ridge_fill(pts, bottom=2300):
    return pts_to_d(pts) + " L%s %s L%s %s Z" % (f(pts[-1][0] + 100), bottom, f(pts[0][0] - 100), bottom)


def shade_strips(pts, depth=70, thr=0.10, dx=18):
    """Lee side strips (slope falling to the right) used with the hatch pattern."""
    out, run = [], []
    for i in range(len(pts) - 1):
        (x0, y0), (x1, y1) = pts[i], pts[i + 1]
        slope = (y1 - y0) / max(0.1, x1 - x0)
        if slope > thr:
            run.append(pts[i])
        else:
            if len(run) > 4:
                out.append(run)
            run = []
    if len(run) > 4:
        out.append(run)
    d = []
    for r in out:
        top = r
        bot = [(x + dx, y + depth) for x, y in reversed(r)]
        d.append(pts_to_d(top + bot, close=True))
    return " ".join(d)


def dome_path(cx, cy, r, down=0):
    if down:
        return "M%s %s a%s %s 0 0 1 %s 0 V%s H%s Z" % (f(cx - r), f(cy), f(r), f(r), f(2 * r), f(down), f(cx - r))
    return "M%s %s a%s %s 0 0 1 %s 0 Z" % (f(cx - r), f(cy), f(r), f(r), f(2 * r))


def conifer(cx, base, h, w, tiers, r):
    tip = (cx, base - h)
    right, left = [], []
    for k in range(1, tiers + 1):
        yk = base - h + h * 0.92 * (k / tiers)
        wk = w * (k / tiers) ** 0.8 * r.uniform(0.9, 1.1)
        right += [(cx + wk, yk), (cx + wk * 0.42, yk - h * 0.01)]
        left += [(cx - wk, yk), (cx - wk * 0.42, yk - h * 0.01)]
    tw = max(2, w * 0.12)
    poly = [tip] + right + [(cx + tw, base), (cx - tw, base)] + list(reversed(left))
    return pts_to_d(poly, close=True)


def lookout(cx, base, s, stroke="var(--ink)"):
    """Fire lookout: four legs, braces, cabin with windows, roof, rail and mast."""
    u = s
    h_leg = 26 * u
    top = base - h_leg
    g = []
    g.append('<path d="M%s %s L%s %s M%s %s L%s %s" />' % (f(cx - 9 * u), f(base), f(cx - 6 * u), f(top), f(cx + 9 * u), f(base), f(cx + 6 * u), f(top)))
    g.append('<path d="M%s %s L%s %s M%s %s L%s %s" />' % (f(cx - 8 * u), f(base - 4 * u), f(cx + 6 * u), f(top + 6 * u), f(cx + 8 * u), f(base - 4 * u), f(cx - 6 * u), f(top + 6 * u)))
    g.append('<path d="M%s %s H%s" />' % (f(cx - 8 * u), f(base - 13 * u), f(cx + 8 * u)))
    g.append('<rect x="%s" y="%s" width="%s" height="%s" class="paperfill" />' % (f(cx - 10 * u), f(top - 12 * u), f(20 * u), f(12 * u)))
    g.append('<path d="M%s %s H%s M%s %s V%s M%s %s V%s" />' % (f(cx - 7 * u), f(top - 7 * u), f(cx + 7 * u), f(cx - 3 * u), f(top - 11 * u), f(top - 3 * u), f(cx + 3 * u), f(top - 11 * u), f(top - 3 * u)))
    g.append('<path d="M%s %s L%s %s L%s %s Z" class="paperfill" />' % (f(cx - 13 * u), f(top - 12 * u), f(cx), f(top - 21 * u), f(cx + 13 * u), f(top - 12 * u)))
    g.append('<path d="M%s %s V%s" />' % (f(cx), f(top - 21 * u), f(top - 31 * u)))
    return '<g fill="none" stroke="%s" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">%s</g>' % (stroke, "".join(g))


# California quail facing right, about 26 units long: body, head with the topknot plume, legs
QUAIL = ('<path d="M-12 -2 C-12 -10 -3 -15 6 -11 C10 -10 11 -6 10 -4 C11 -2 10 1 6 2 C0 5 -9 4 -12 -2 Z" fill="var(--ink)" fill-opacity="0.78"/>'
         '<circle cx="11" cy="-12" r="3.6" fill="var(--ink)" fill-opacity="0.78"/>'
         '<path d="M11 -15 C9 -22 14 -23 14.5 -18" fill="none" stroke="var(--ink)" stroke-opacity="0.78" stroke-width="1.4" stroke-linecap="round"/>'
         '<path d="M14.5 -12 L17.5 -11" fill="none" stroke="var(--sienna)" stroke-width="1.4" stroke-linecap="round"/>'
         '<path d="M-1 4 L-2 9 M4 4 L5 9" fill="none" stroke="var(--ink)" stroke-opacity="0.78" stroke-width="1.2" stroke-linecap="round"/>')


# ---------------------------------------------------------------- scene
def build_scene():
    r = random.Random(SEED)
    layers = []

    # Tam far silhouette: West Peak, Middle Peak, East Peak (E=0 pose).
    # The three summits are packed to the right of the title plate (x 1110 to 1505) so West Peak and its label clear the card at 1440 wide.
    def X(x):
        return 1110 + (x - 480) * 0.82
    base_keys = [(-60, 570), (60, 530), (180, 480), (290, 425), (380, 350), (440, 300), (480, 282), (520, 292), (565, 330), (615, 352),
                 (655, 326), (700, 304), (745, 322), (795, 362), (850, 332), (915, 282), (962, 256), (1005, 274), (1065, 336),
                 (1145, 404), (1255, 452), (1385, 474)]
    tam_keys = [(-100, 640), (150, 628), (420, 604)] + [(X(x), y) for x, y in base_keys] + [(2000, 520), (2100, 560)]
    tam = ridge(tam_keys, Noise(11, 4, 0.02), 4.0, 12)
    tam_d = ridge_fill(tam)
    tam_shade = shade_strips(tam, 80, 0.16)

    def crest(x):
        return min(tam, key=lambda p: abs(p[0] - x))[1]

    ex, mx, wx = X(962), X(700), X(480)
    ey, my, wy = crest(ex), crest(mx), crest(wx)
    # one fire lookout, East Peak's own (the lookout cabin is the beacon's anchor in script.js)
    lk = lookout(ex, ey + 1, 1.05)
    dome = ('<path d="M%s %s a9 9 0 0 1 18 0 Z" class="paperfill" fill="none" stroke="var(--ink)" stroke-width="1.2"/><path d="M%s %s V%s" fill="none" stroke="var(--ink)" stroke-width="1.2"/>'
            % (f(mx - 9), f(my + 1), f(mx), f(my - 8), f(my - 19)))
    labels = ('<g class="lyr peak-labels" data-lyr="labels" data-t="330" font-family="Big Shoulders Display, Arial Narrow, sans-serif" font-weight="800" font-size="19" fill="var(--ink)" letter-spacing="1.5">'
              '<text x="%s" y="%s" text-anchor="middle">WEST PEAK</text><text x="%s" y="%s" text-anchor="middle">MIDDLE PEAK</text>'
              '<text x="%s" y="%s" text-anchor="end">EAST PEAK</text></g>'
              % (f(wx), f(wy - 22), f(mx), f(my - 30), f(ex - 34), f(ey - 14)))
    # data-bx and data-by: the cabin of East Peak's lookout in scene units at the E=0 pose (script.js anchors the beacon there)
    layers.append('<g class="lyr" data-lyr="tam" data-t="330" data-bx="%s" data-by="%s"><path class="ridge-far" d="%s"/><path class="shade" d="%s"/>'
                  '<path class="ridge-line" d="%s"/>%s%s</g>' % (f(ex), f(ey + 1 - 32 * 1.05), tam_d, tam_shade, pts_to_d(tam), lk, dome))
    layers.append(labels)
    def fog(name, top, t, amp, seed, op):
        n = Noise(seed, 3, 0.01)
        pts = []
        x = -500
        while x <= 2100:
            y = top + amp * math.sin(x / 130.0 + seed) + amp * 0.5 * math.sin(x / 47.0 + seed * 2) + 10 * math.sin(x / 331.0 + seed * 3) + 2 * n(x)
            pts.append((x, y))
            x += 14
        d = pts_to_d(pts) + " L2100 1100 L-500 1100 Z"
        return ('<g class="lyr fog" data-lyr="%s" data-t="%s" data-o="%s"><g class="drift"><path d="%s"/></g></g>' % (name, t, op, d))

    # mid ridge (Marin ridges beyond)
    mid_keys = [(-80, 500)]
    x = 40
    while x < 1700:
        mid_keys.append((x, r.uniform(400, 535)))
        x += r.uniform(95, 150)
    mid = ridge(mid_keys, Noise(23, 5, 0.012), 6.0, 8)
    mid_d = ridge_fill(mid)
    mid_shade = shade_strips(mid, 64, 0.12)

    # near ridge with oak and bay domes
    near_keys = [(-80, 700)]
    x = 20
    while x < 1700:
        near_keys.append((x, r.uniform(625, 735)))
        x += r.uniform(100, 170)
    near = ridge(near_keys, Noise(37, 5, 0.01), 7.0, 8)
    near_d = ridge_fill(near)
    near_shade = shade_strips(near, 56, 0.10)
    domes = []
    xi = -20
    while xi < 1650:
        # find crest y near xi
        yc = min(near, key=lambda p: abs(p[0] - xi))[1]
        rad = r.uniform(11, 21)
        domes.append(dome_path(xi, yc + 5, rad))
        xi += r.uniform(30, 56)

    layers.append(fog("fog-far", 330, 320, 16, 3, 0.9))
    layers.append('<g class="lyr" data-lyr="mid" data-t="290"><path class="ridge-mid" d="%s"/><path class="shade" d="%s"/><path class="ridge-line" d="%s"/></g>' % (mid_d, mid_shade, pts_to_d(mid)))
    layers.append(fog("fog-mid", 470, 330, 22, 5, 0.95))
    layers.append('<g class="lyr" data-lyr="near" data-t="720"><path class="ridge-near" d="%s"/><path class="shade" d="%s"/><path class="oaks" d="%s"/><path class="ridge-line" d="%s"/></g>' % (near_d, near_shade, " ".join(domes), pts_to_d(near)))
    layers.append(fog("fog-near", 650, 360, 26, 8, 1.0))

    # foreground redwoods (edge heavy)
    rw_back, rw_front = [], []
    for cx in [-10, 30, 75, 120, 170, 225, 270, 1330, 1380, 1430, 1480, 1535, 1590, 1640]:
        h = r.uniform(620, 860) if (cx < 300 or cx > 1300) else r.uniform(300, 420)
        rw_back.append(conifer(cx + r.uniform(-14, 14), 1010, h * 0.82, h * 0.06, 9, r))
    for cx in [5, 62, 150, 235, 1360, 1455, 1520, 1610]:
        h = r.uniform(560, 760)
        rw_front.append(conifer(cx + r.uniform(-10, 10), 1020, h, h * 0.075, 8, r))
    for cx in range(330, 1300, 70):
        rw_back.append(conifer(cx + r.uniform(-20, 20), 1010, r.uniform(110, 190), 20, 5, r))
    layers.append('<g class="fg" data-lyr="fg-redwood" data-t="300"><path class="fg-back" d="%s"/><path class="fg-front" d="%s"/></g>' % (" ".join(rw_back), " ".join(rw_front)))

    # foreground oaks and bay
    oak = []
    xi = -40
    while xi < 1660:
        oak.append(dome_path(xi, r.uniform(880, 930), r.uniform(34, 60)))
        xi += r.uniform(40, 80)
    for cx, cy, rad in [(60, 760, 120), (170, 800, 90), (1450, 740, 130), (1560, 790, 100)]:
        oak.append(dome_path(cx, cy + 40, rad, 1100))
    layers.append('<g class="fg" data-lyr="fg-oak" data-t="120"><path class="fg-front" d="%s"/><rect class="fg-front" x="-100" y="860" width="1900" height="500"/></g>' % " ".join(oak))

    # foreground chaparral and serpentine grassland
    scrub = []
    xi = -40
    while xi < 1660:
        scrub.append(dome_path(xi, r.uniform(870, 915), r.uniform(20, 40)))
        xi += r.uniform(22, 44)
    rocks = []
    for cx in range(100, 1600, 260):
        w = r.uniform(50, 90)
        y0 = r.uniform(850, 885)
        rocks.append("M%s %s L%s %s L%s %s L%s %s L%s %s Z" % (f(cx), f(y0 + 40), f(cx + w * 0.2), f(y0), f(cx + w * 0.6), f(y0 - 12), f(cx + w), f(y0 + 10), f(cx + w * 1.15), f(y0 + 40)))
    grass = []
    for i in range(160):
        gx = r.uniform(-20, 1620)
        gy = r.uniform(890, 1000)
        gl = r.uniform(8, 20)
        grass.append("M%s %s l%s %s" % (f(gx), f(gy), f(r.uniform(-3, 3)), f(-gl)))
    layers.append('<g class="fg" data-lyr="fg-chap" data-t="70"><path class="fg-front" d="%s"/><rect class="fg-front" x="-100" y="860" width="1900" height="500"/>'
                  '<path class="rock" d="%s"/><path class="grass" d="%s"/></g>' % (" ".join(scrub), " ".join(rocks), " ".join(grass)))
    # a pair of quail cross the chaparral once (CSS animation on the walk group, hop on the bird)
    layers.append('<g class="fg quail" data-lyr="quail" data-t="70"><g class="q-walk"><g transform="translate(-80 903)"><g class="q">%s</g></g></g>'
                  '<g class="q-walk q2"><g transform="translate(-130 910) scale(0.8)"><g class="q">%s</g></g></g></g>' % (QUAIL, QUAIL))

    # summit outcrop: the visitor's own ground, rises into view low in the frame (no second lookout; East Peak's is the one)
    rock_keys = [(560, 1160), (680, 1010), (820, 950), (960, 915), (1080, 902), (1200, 912), (1320, 940), (1440, 985), (1560, 1030), (1700, 1160)]
    rock = ridge(rock_keys, Noise(51, 4, 0.03), 4.0, 10)
    rock_d = ridge_fill(rock, 1400)
    strata = "".join('<path class="ridge-line" d="%s"/>' % pts_to_d([(x + (off * 0.6 if x < 1080 else -off * 0.6), y + off) for x, y in rock if (x > 560 + off and x < 1700 - off)]) for off in (26, 54, 86))
    layers.append('<g class="fg" data-lyr="fg-summit" data-t="0" data-t0="360"><path class="fg-rock" d="%s"/><path class="ridge-line" d="%s"/>%s</g>' % (rock_d, pts_to_d(rock), strata))

    # Karl the Fog: a dense sea of soft white bands that fills the valleys in the final stretch. Gradient fills with soft top edges, no blur filter.
    def sea_band(name, top, amp, seed, grad, drift):
        pts = []
        x = -300
        while x <= 1900:
            y = top + amp * math.sin(x / 150.0 + seed) + amp * 0.55 * math.sin(x / 61.0 + seed * 2.3) + amp * 0.8 * math.sin(x / 290.0 + seed * 1.7)
            pts.append((x, y))
            x += 20
        d = pts_to_d(pts) + " L1900 1100 L-300 1100 Z"
        return '<g class="drift" data-drift="%s"><path d="%s" fill="url(#%s)"/></g>' % (drift, d, grad)
    bands = [sea_band("a", 650, 12, 1.0, "seaA", 1), sea_band("b", 700, 14, 2.2, "seaB", -1), sea_band("c", 765, 16, 3.1, "seaA", 1),
             sea_band("d", 835, 18, 4.4, "seaB", -1), sea_band("e", 915, 20, 5.3, "seaC", 1)]
    karl = ('<text x="1235" y="846" text-anchor="middle" font-family="Source Serif 4, Georgia, serif" font-style="italic" font-size="17" fill="var(--ink-2)" letter-spacing="0.5">Karl the Fog</text>')
    sea = '<g class="lyr sea" data-lyr="fog-sea" data-t="0" data-t0="340">%s%s</g>' % ("".join(bands), karl)
    # the sea sits behind the foreground ground (redwoods, oaks, scrub, summit rock) and in front of every ridge
    layers.insert([i for i, l in enumerate(layers) if 'data-lyr="fog-near"' in l][0] + 1, sea)

    defs = ('<defs><pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">'
            '<path d="M0 0 V7" stroke="var(--sienna-line)" stroke-width="1"/></pattern>'
            '<filter id="fogblur" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>'
            '<linearGradient id="seaA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9F0F2" stop-opacity="0"/><stop offset="0.14" stop-color="#E9F0F2" stop-opacity="0.7"/><stop offset="1" stop-color="#E3EBEE" stop-opacity="0.82"/></linearGradient>'
            '<linearGradient id="seaB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6F9F9" stop-opacity="0"/><stop offset="0.12" stop-color="#F6F9F9" stop-opacity="0.78"/><stop offset="1" stop-color="#F0F4F4" stop-opacity="0.88"/></linearGradient>'
            '<linearGradient id="seaC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDFEFD" stop-opacity="0"/><stop offset="0.1" stop-color="#FDFEFD" stop-opacity="0.9"/><stop offset="1" stop-color="#FBFCFA" stop-opacity="0.96"/></linearGradient>'
            '</defs>')
    # the sun rides from (1000, 560) up and right; script.js moves its layer
    sun = '<g class="lyr" data-lyr="sun">%s<g transform="translate(1000 560)"><circle class="sun-glow" r="130"/><circle class="sun-disc" r="46"/><circle class="sun-ring" r="62"/><circle class="sun-ring" r="82"/></g></g>' % defs
    # one root svg per layer, so the browser moves each one on the GPU instead of repainting the whole scene
    head = '<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMax slice" focusable="false" '
    return "".join(head + l[3:-4] + "</svg>" for l in [sun] + layers)


# ---------------------------------------------------------------- contours
def build_contours():
    W, H = 1600, 1200
    gw, gh = 100, 75
    cx, cy = W / gw, H / gh
    n1 = Noise(71, 5, 0.011)
    n2 = Noise(72, 5, 0.013)
    bumps = [(1000, 560, 330, 240, 1.0), (640, 600, 210, 170, 0.78), (330, 760, 240, 190, 0.55), (1360, 930, 260, 200, 0.45),
             (200, 240, 250, 180, 0.38), (900, 1050, 300, 120, 0.3), (1450, 260, 230, 170, 0.34)]

    def hgt(x, y):
        v = 0.0
        for bx, by, sx, sy, a in bumps:
            v += a * math.exp(-(((x - bx) / sx) ** 2 + ((y - by) / sy) ** 2))
        v += 0.05 * n1(x * 1.0 + y * 0.6) + 0.04 * n2(y * 1.1 - x * 0.4)
        return v

    grid = [[hgt(i * cx, j * cy) for i in range(gw + 1)] for j in range(gh + 1)]
    vmax = max(max(r) for r in grid)
    nlev = 30
    levels = [0.05 + (vmax * 0.97 - 0.05) * k / (nlev - 1) for k in range(nlev)]

    def interp(p, q, v0, v1, lv):
        t = (lv - v0) / (v1 - v0) if v1 != v0 else 0.5
        return (p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t)

    paths, labels = [], []
    for li, lv in enumerate(levels):
        segs = {}
        for j in range(gh):
            for i in range(gw):
                v00, v10, v11, v01 = grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]
                idx = (v00 > lv) * 1 + (v10 > lv) * 2 + (v11 > lv) * 4 + (v01 > lv) * 8
                if idx in (0, 15):
                    continue
                P00, P10, P11, P01 = (i * cx, j * cy), ((i + 1) * cx, j * cy), ((i + 1) * cx, (j + 1) * cy), (i * cx, (j + 1) * cy)
                e = {
                    "t": (("h", i, j), interp(P00, P10, v00, v10, lv)),
                    "r": (("v", i + 1, j), interp(P10, P11, v10, v11, lv)),
                    "b": (("h", i, j + 1), interp(P01, P11, v01, v11, lv)),
                    "l": (("v", i, j), interp(P00, P01, v00, v01, lv)),
                }
                table = {1: ["lt"], 2: ["tr"], 3: ["lr"], 4: ["rb"], 5: ["lt", "rb"], 6: ["tb"], 7: ["lb"], 8: ["lb"], 9: ["tb"], 10: ["tr", "lb"], 11: ["rb"], 12: ["lr"], 13: ["tr"], 14: ["lt"]}
                for pair in table[idx]:
                    a, b = e[pair[0]], e[pair[1]]
                    segs.setdefault(a[0], []).append((b[0], a[1], b[1]))
                    segs.setdefault(b[0], []).append((a[0], b[1], a[1]))
        # chain
        used = set()
        polys = []
        for start in list(segs.keys()):
            for s0 in segs[start]:
                key0 = (start, s0[0])
                if key0 in used or (s0[0], start) in used:
                    continue
                used.add(key0)
                chain = [s0[1], s0[2]]
                prev, cur = start, s0[0]
                while True:
                    nxt = None
                    for s in segs.get(cur, []):
                        if s[0] != prev and (cur, s[0]) not in used and (s[0], cur) not in used:
                            nxt = s
                            break
                    if not nxt:
                        break
                    used.add((cur, nxt[0]))
                    chain.append(nxt[2])
                    prev, cur = cur, nxt[0]
                    if cur == start:
                        break
                if len(chain) > 6:
                    polys.append(chain)

        def chaikin(pl, it=2):
            for _ in range(it):
                q = []
                for a, b in zip(pl, pl[1:]):
                    q.append((0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]))
                    q.append((0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]))
                pl = [pl[0]] + q + [pl[-1]]
            return pl

        d = []
        longest = None
        for pl in polys:
            sm = chaikin(pl)
            sm = sm[::3]
            d.append(pts_to_d(sm))
            if longest is None or len(sm) > len(longest):
                longest = sm
        is_index = li % 5 == 4
        elev = int(round(lv / vmax * 2600 / 100.0) * 100)
        paths.append('<path class="contour%s" pathLength="1" d="%s"/>' % (" index" if is_index else "", " ".join(d)))
        if is_index and longest and len(longest) > 20:
            m = len(longest) // 2
            a, b = longest[m - 2], longest[m + 2]
            ang = math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
            if ang > 90:
                ang -= 180
            if ang < -90:
                ang += 180
            labels.append('<text x="%s" y="%s" transform="rotate(%s %s %s)" class="contour-label" text-anchor="middle">%s</text>' % (f(longest[m][0]), f(longest[m][1]), f(ang), f(longest[m][0]), f(longest[m][1]), "{:,}".format(elev)))
    svg = ('<svg id="contours" viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMid slice" role="presentation" focusable="false" aria-hidden="true">'
           '%s%s</svg>' % ("".join(paths), "".join(labels)))
    return svg, len(paths)


# ---------------------------------------------------------------- route
def build_route():
    r = random.Random(SEED + 5)
    n = 24
    keys = [(46, 0)]
    for i in range(n):
        y = 24 + i * (950.0 / (n - 1))
        x = (86 if i % 2 == 0 else 14) + r.uniform(-5, 5)
        keys.append((x, y))
    keys.append((50, 1000))
    d = bezier_path(keys)
    return ('<svg class="trail-svg" id="route-svg" viewBox="0 0 100 1000" preserveAspectRatio="none" role="presentation" focusable="false" aria-hidden="true">'
            '<path id="route-path" class="route-line" d="%s" vector-effect="non-scaling-stroke"/>'
            '<path id="route-done" class="route-done" d="%s" vector-effect="non-scaling-stroke"/></svg>' % (d, d))


# ---------------------------------------------------------------- profile
def build_profile():
    stops = [(0, 0), (0.02, 100), (0.08, 160), (0.12, 280), (0.17, 400), (0.22, 540), (0.27, 700), (0.33, 800), (0.38, 920), (0.43, 1040), (0.48, 1160),
             (0.53, 1280), (0.58, 1380), (0.63, 1480), (0.69, 1620), (0.74, 1720), (0.78, 1800), (0.82, 1880), (0.86, 1960), (0.9, 2080), (0.94, 2220), (0.97, 2400), (1.0, 2571)]
    pts = [(p * 600, 44 - e / 2571.0 * 40) for p, e in stops]
    line = bezier_path(pts)
    area = line + " L600 48 L0 48 Z"
    # zone bands (x from nominal p at 700, 1400, 2300)
    def px(e):
        for (p0, e0), (p1, e1) in zip(stops, stops[1:]):
            if e0 <= e <= e1:
                return (p0 + (p1 - p0) * (e - e0) / (e1 - e0)) * 600
        return 600
    b = [0, px(700), px(1400), px(2300), 600]
    zones = ""
    for i, (c, a) in enumerate(zip(["var(--z1)", "var(--z2)", "var(--z3)", "var(--z4)"], range(4))):
        zones += '<rect id="pf-z%d" x="%s" y="0" width="%s" height="48" fill="%s"/>' % (i, f(b[i]), f(b[i + 1] - b[i]), c)
    svg = ('<svg id="profile" class="profile-svg" viewBox="0 0 600 48" preserveAspectRatio="none" role="img" aria-label="Elevation profile of the route from the trailhead to East Peak">'
           '<defs><clipPath id="pf-area"><path id="profile-area" d="%s"/></clipPath><clipPath id="pf-clip"><rect id="pf-clip-rect" x="0" y="0" width="0" height="48"/></clipPath></defs>'
           '<g clip-path="url(#pf-area)" class="pf-zones">%s</g>'
           '<g clip-path="url(#pf-area)"><g clip-path="url(#pf-clip)"><path class="pf-done" d="%s"/></g></g>'
           '<path id="profile-line" class="pf-line" d="%s" vector-effect="non-scaling-stroke"/></svg>' % (area, zones, area, line))
    return svg


# ---------------------------------------------------------------- sprite
def build_sprite():
    S = {
        "benchmark": '<path d="M12 4 L20 19 H4 Z"/><circle cx="12" cy="14.5" r="1.6"/>',
        "shelter": '<path d="M3 19 L12 6 L21 19 Z"/><path d="M10 19 V14 H14 V19"/>',
        "lookout": '<path d="M7 21 L9.5 10 M17 21 L14.5 10 M8 16 H16"/><rect x="8" y="5" width="8" height="5"/><path d="M6.5 5 H17.5 M12 5 V2"/>',
        "spring": '<circle cx="12" cy="16" r="3"/><path d="M4 8 q2 -2 4 0 t4 0 t4 0 t4 0"/><path d="M12 11 V13"/>',
        "junction": '<path d="M12 21 V13 M12 13 L5 5 M12 13 L19 5"/><circle cx="12" cy="13" r="1.6"/>',
        "viewpoint": '<path d="M3 12 q9 -9 18 0 q-9 9 -18 0"/><circle cx="12" cy="12" r="2.6"/>',
        "camp": '<path d="M3 20 L12 5 L21 20 Z"/><path d="M12 5 L9 20 M12 5 L15 20"/>',
        "fog": '<path d="M3 8 q3 -3 6 0 t6 0 t6 0"/><path d="M3 13 q3 -3 6 0 t6 0 t6 0"/><path d="M3 18 q3 -3 6 0 t6 0 t6 0"/>',
        "saddle": '<path d="M2 19 C5 8 8 8 12 15 C16 8 19 8 22 19 Z"/>',
        "rest": '<path d="M4 12 H20 M6 12 V19 M18 12 V19 M5 8 H19"/>',
        "trailhead": '<path d="M12 3 V21 M12 6 H19 L21 8 L19 10 H12 M12 13 H5 L3 15 L5 17 H12"/>',
        "summit": '<path d="M3 20 L10 8 L14 14 L17 10 L21 20 Z"/><path d="M10 8 V3 L15 5 L10 7"/>',
        "register": '<rect x="5" y="4" width="14" height="16"/><path d="M9 4 V20 M12 9 H16 M12 13 H16"/>',
        "resume": '<path d="M7 3 H14 L18 7 V21 H7 Z M14 3 V7 H18 M12 11 V17 M9.5 14.5 L12 17 L14.5 14.5"/>',
        "email": '<rect x="3" y="6" width="18" height="12"/><path d="M3 7 L12 14 L21 7"/>',
        "github": '<circle cx="7" cy="6" r="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="9" r="2"/><path d="M7 8 V16 M17 11 C17 14 7 13 7 16"/>',
        "linkedin": '<rect x="3" y="3" width="18" height="18"/><path d="M8 10 V17 M8 7 V7.2 M12 17 V10 M12 13 C12 10 17 10 17 13 V17"/>',
        "arrow": '<path d="M8 16 L16 8 M9 8 H16 V15"/>',
    }
    body = "".join('<symbol id="sym-%s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">%s</symbol>' % (k, v) for k, v in S.items())
    return '<svg id="sprite" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">%s</svg>' % body


# ---------------------------------------------------------------- declination, scale bar
def build_decl():
    th = math.radians(13)
    mx, my = 32 + 20 * math.sin(th), 32 - 20 * math.cos(th)
    return ('<svg class="decl-svg" id="decl-svg" viewBox="0 0 64 64" role="presentation" focusable="false" aria-hidden="true">'
            '<g id="decl-rose" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">'
            '<circle cx="32" cy="32" r="26"/><path d="M32 6 V12 M32 52 V58 M6 32 H12 M52 32 H58"/>'
            '<path d="M32 12 L35 22 L32 20 L29 22 Z"/><path d="M32 32 V22"/>'
            '<path d="M32 32 L%s %s M%s %s l-3.5 2.5 M%s %s l-2.8 -3.4"/></g></svg>' % (f(mx), f(my), f(mx), f(my), f(mx), f(my)))


def build_scalebar():
    segs = ""
    for i in range(4):
        fill = "var(--ink)" if i % 2 == 0 else "var(--paper)"
        segs += '<rect x="%d" y="7" width="40" height="6" fill="%s"/>' % (i * 40, fill)
    ticks = "".join('<path d="M%d 3 V17"/>' % (i * 40) for i in range(5))
    return ('<svg class="scalebar-svg" id="scalebar-svg" viewBox="-2 0 164 20" role="presentation" focusable="false" aria-hidden="true">'
            '<g stroke="var(--ink)" stroke-width="1">%s<rect x="0" y="7" width="160" height="6" fill="none"/>%s</g></svg>' % (segs, ticks))


def main():
    contours, n = build_contours()
    assets = {
        "scene": build_scene(),
        "contours": contours,
        "route": build_route(),
        "profile": build_profile(),
        "sprite": build_sprite(),
        "declination": build_decl(),
        "scalebar": build_scalebar(),
    }
    for k, v in assets.items():
        with open(os.path.join(OUT, k + ".svg"), "w") as fh:
            fh.write(v)
        print("%-12s %7d bytes" % (k, len(v)))
    print("contour paths:", n)


if __name__ == "__main__":
    main()
