#!/usr/bin/env python3
"""Procedural SVG landscape for the I-280 drive. Fixed seed, deterministic output.
Writes svg/<name>.svg fragments and svg/sprite.svg. Colors come from CSS classes
(see styles.css) with literal fill fallbacks so each file also renders standalone."""
import math
import os
import random

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "svg")
os.makedirs(OUT, exist_ok=True)

FALLBACK = {
    "c-mtn1": "#8da4b1", "c-mtn2": "#7490a0", "c-straw": "#dcbb62", "c-gold": "#c8962f",
    "c-ochre": "#a8741f", "c-oak": "#3b4a2c", "c-oakd": "#26331f", "c-oakl": "#566b3a",
    "c-water": "#3f7f9f", "c-waterl": "#86b9cf", "c-city": "#8fa0aa", "c-cityhill": "#a9b8bd",
    "c-white": "#ffffff", "c-steel": "#8e979b",
}


def f(v):
    s = "%.1f" % v
    return s[:-2] if s.endswith(".0") else s


def fill(cls):
    return 'class="%s" fill="%s"' % (cls, FALLBACK[cls])


def smooth_d(pts, close_to=None):
    """Catmull-Rom through pts as cubic beziers. close_to=(w,h) closes along the bottom."""
    d = "M%s %s" % (f(pts[0][0]), f(pts[0][1]))
    n = len(pts)
    for i in range(n - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < n else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
        d += "C%s %s %s %s %s %s" % (f(c1[0]), f(c1[1]), f(c2[0]), f(c2[1]), f(p2[0]), f(p2[1]))
    if close_to:
        w, h = close_to
        d += "L%s %sL%s %sZ" % (f(pts[-1][0]), f(h), f(pts[0][0]), f(h))
    return d


def make_ridge(r, w, base, amp, harmonics, step=48):
    ph = [r.uniform(0, 6.283) for _ in harmonics]
    norm = sum(a for _, a in harmonics)
    pts = []
    x = 0
    while x <= w + step:
        t = x / float(w) * 6.283
        v = sum(a * math.sin(t * k + p) for (k, a), p in zip(harmonics, ph)) / norm
        pts.append((x, base - amp * v))
        x += step
    return pts


def y_at(pts, x):
    for i in range(len(pts) - 1):
        if pts[i][0] <= x <= pts[i + 1][0]:
            t = (x - pts[i][0]) / float(pts[i + 1][0] - pts[i][0])
            return pts[i][1] * (1 - t) + pts[i + 1][1] * t
    return pts[-1][1]



def band(pts, cls, w, h, opacity=None):
    op = ' opacity="%s"' % opacity if opacity else ""
    return '<path %s d="%s"%s/>' % (fill(cls), smooth_d(pts, (w, h)), op)


def shift(pts, dy):
    return [(x, y + dy) for x, y in pts]


def canopy_crest(r, pts, w, step, rmin, rmax, drop=0.0):
    """Scalloped row of oak canopies sitting on a ridge: woodland in the folds."""
    out = []
    x = r.uniform(0, step)
    while x < w:
        y = y_at(pts, x) + drop
        rx = r.uniform(rmin, rmax)
        ry = rx * r.uniform(0.62, 0.78)
        out.append('<ellipse %s cx="%s" cy="%s" rx="%s" ry="%s"/>' % (fill("c-oakd"), f(x), f(y + ry * 0.1), f(rx), f(ry)))
        if r.random() < 0.7:
            out.append('<ellipse %s cx="%s" cy="%s" rx="%s" ry="%s"/>' % (fill("c-oakl"), f(x - rx * 0.2), f(y - ry * 0.3), f(rx * 0.62), f(ry * 0.5)))
        x += step * r.uniform(0.55, 1.35)
    return "".join(out)


def folds(r, pts, w, n, lmin, lmax, wmin, wmax, cls, opacity=None, canopies=None):
    """Dark gullies descending from the ridge. Returns svg string. canopies: (count_min, count_max)."""
    out = []
    xs = sorted(r.uniform(80, w - 80) for _ in range(n))
    for x in xs:
        wd = r.uniform(wmin, wmax)
        ln = r.uniform(lmin, lmax)
        drift = r.uniform(-0.5, 0.5) * wd
        xl, xr = x - wd / 2.0, x + wd / 2.0
        yl, yr = y_at(pts, xl), y_at(pts, xr)
        ym = (yl + yr) / 2.0
        xb, yb = x + drift, ym + ln
        d = "M%s %sQ%s %s %s %sQ%s %s %s %sZ" % (
            f(xl), f(yl), f(xl + drift * 0.4), f(ym + ln * 0.5), f(xb), f(yb),
            f(xr + drift * 0.4), f(ym + ln * 0.5), f(xr), f(yr))
        op = ' opacity="%s"' % opacity if opacity else ""
        out.append('<path %s d="%s"%s/>' % (fill(cls), d, op))
        if canopies:
            k = r.randint(*canopies)
            for _ in range(k):
                t = r.uniform(0.3, 1.0)
                cx = x + drift * t + r.uniform(-wd * 0.25, wd * 0.25)
                cy = ym + ln * t
                rx = r.uniform(11, 26) * (0.55 + 0.6 * t)
                ry = rx * r.uniform(0.62, 0.8)
                out.append('<ellipse %s cx="%s" cy="%s" rx="%s" ry="%s"/>' % (fill("c-oakd"), f(cx), f(cy), f(rx), f(ry)))
                out.append('<ellipse %s cx="%s" cy="%s" rx="%s" ry="%s"/>' % (
                    fill("c-oakl"), f(cx - rx * 0.22), f(cy - ry * 0.32), f(rx * 0.66), f(ry * 0.55)))
    return "".join(out)


def lone_oaks(r, pts, w, count, scale=1.0):
    out = []
    for _ in range(count):
        x = r.uniform(120, w - 120)
        y = y_at(pts, x) + 6 * scale
        s = r.uniform(0.8, 1.3) * scale
        out.append('<path %s d="M%s %sl%s %sh%sl%s %sz"/>' % (fill("c-oakd"), f(x - 1.5 * s), f(y), f(1 * s), f(-14 * s), f(1 * s), f(1 * s), f(14 * s)))
        for dx, dy, rx, ry in ((0, -22, 20, 13), (-12, -16, 13, 9), (12, -17, 14, 10), (3, -28, 12, 8)):
            out.append('<ellipse %s cx="%s" cy="%s" rx="%s" ry="%s"/>' % (fill("c-oakd"), f(x + dx * s), f(y + dy * s), f(rx * s), f(ry * s)))
        out.append('<ellipse %s cx="%s" cy="%s" rx="%s" ry="%s"/>' % (fill("c-oakl"), f(x - 4 * s), f(y - 26 * s), f(11 * s), f(6 * s)))
    return "".join(out)


def grass(r, pts, w, h, n, cls_light="c-straw", cls_dark="c-ochre"):
    out = []
    for i in range(n):
        x = r.uniform(0, w)
        top = y_at(pts, x)
        y = r.uniform(top + 14, h - 20)
        ln = r.uniform(8, 20) * (0.6 + (y - top) / (h - top))
        bend = r.uniform(-6, 6)
        cls = cls_light if r.random() < 0.55 else cls_dark
        col = FALLBACK[cls]
        out.append('<path class="g-%s" stroke="%s" d="M%s %sq%s %s %s %s"/>' % (cls[2:], col, f(x), f(y), f(bend * 0.4), f(-ln * 0.6), f(bend), f(-ln)))
    return '<g fill="none" stroke-width="1.6" stroke-linecap="round" opacity=".55">%s</g>' % "".join(out)


def svg(name, vb_w, vb_h, body, cls, par="none", defs=""):
    attrs = 'id="svg-%s" class="layer__svg %s" viewBox="0 0 %d %d" preserveAspectRatio="%s" aria-hidden="true" focusable="false"' % (name, cls, vb_w, vb_h, par)
    d = "<defs>%s</defs>" % defs if defs else ""
    return '<svg xmlns="http://www.w3.org/2000/svg" %s>%s%s</svg>' % (attrs, d, body)


def write(name, s):
    with open(os.path.join(OUT, name + ".svg"), "w") as fh:
        fh.write(s)
    return len(s)


# ---------------------------------------------------------------- mountains
def mountains():
    r = random.Random(280 + 1)
    w, h = 2400, 520
    far = make_ridge(r, w, 215, 120, ((1, 1.0), (2.7, 0.55), (6.3, 0.3), (13, 0.12)), 40)
    mid = make_ridge(r, w, 290, 110, ((1.3, 1.0), (3.1, 0.5), (7.7, 0.26), (15, 0.1)), 40)
    front = make_ridge(r, w, 370, 80, ((1.8, 1.0), (4.1, 0.5), (9.7, 0.22)), 40)
    body = band(far, "c-mtn1", w, h, "0.7")
    body += band(mid, "c-mtn1", w, h)
    body += band(shift(mid, 46), "c-mtn2", w, h, "0.35")
    body += band(front, "c-mtn2", w, h)
    body += '<path fill="none" stroke="#c9d6dc" stroke-width="2.5" opacity=".6" d="%s"/>' % smooth_d(mid)
    return write("mountains", svg("mtn", w, h, body, "layer__svg--mtn"))


# ---------------------------------------------------------------- skyline
def skyline():
    r = random.Random(280 + 2)
    w, h = 1200, 240
    body = ""
    hill = [(0, 170), (60, 150), (160, 118), (250, 100), (330, 118), (420, 150), (520, 190), (600, 215), (1200, 225)]
    body += '<path %s d="%s"/>' % (fill("c-cityhill"), smooth_d(hill, (w, h)))
    # Sutro-style mast on the hill
    sx, sy = 252, 98
    body += '<g %s>' % fill("c-city")
    for dx in (-7, 0, 7):
        body += '<rect x="%s" y="%s" width="2.6" height="%s"/>' % (f(sx + dx - 1.3), f(sy - 64), f(64))
    for k, yy in enumerate((20, 34, 48)):
        body += '<rect x="%s" y="%s" width="%s" height="2"/>' % (f(sx - 9), f(sy - 64 + yy), f(18))
    body += '<rect x="%s" y="%s" width="2" height="26"/>' % (f(sx - 1), f(sy - 90))
    body += "</g>"
    # downtown
    x = 540
    body += '<g %s>' % fill("c-city")
    while x < 1120:
        bw = r.uniform(18, 40)
        bh = r.uniform(38, 120)
        base = 232
        body += '<rect x="%s" y="%s" width="%s" height="%s"/>' % (f(x), f(base - bh), f(bw), f(bh))
        x += bw + r.uniform(1, 8)
    # Salesforce-style tower
    tx = 700
    body += '<path d="M%s 232V70Q%s 40 %s 70V232Z"/>' % (f(tx - 14), f(tx), f(tx + 14))
    # Transamerica-style pyramid
    px = 860
    body += '<path d="M%s 232L%s 30L%s 232Z"/>' % (f(px - 22), f(px), f(px + 22))
    body += '<rect x="%s" y="%s" width="8" height="40"/><rect x="%s" y="%s" width="8" height="40"/>' % (f(px - 34), f(150), f(px + 26), f(150))
    body += "</g>"
    return write("skyline", svg("skyline", w, h, body, "layer__svg--skyline"))


# ---------------------------------------------------------------- golden far hills
def gold_far():
    r = random.Random(280 + 3)
    w, h = 3200, 560
    back = make_ridge(r, w, 220, 110, ((1, 1.0), (2.2, 0.6), (4.9, 0.28), (9.8, 0.1)), 56)
    front = make_ridge(r, w, 320, 100, ((1.4, 1.0), (3.3, 0.5), (6.9, 0.22), (12, 0.08)), 56)
    body = band(back, "c-straw", w, h)
    body += band(shift(back, 70), "c-gold", w, h, "0.28")
    body += canopy_crest(r, shift(back, 74), w, 120, 9, 16, 0)
    body += band(front, "c-straw", w, h)
    body += band(shift(front, 80), "c-gold", w, h, "0.34")
    body += '<path fill="none" stroke="#f0d98c" stroke-width="3" opacity=".7" d="%s"/>' % smooth_d(front)
    return write("hills-gold-far", svg("gold-far", w, h, body, "layer__svg--gold-far"))


# ---------------------------------------------------------------- dish
def dish_svg():
    w, h = 520, 360
    hill = [(0, 345), (70, 296), (150, 246), (240, 222), (330, 232), (430, 272), (520, 326)]
    body = '<path %s d="%s"/>' % (fill("c-straw"), smooth_d(hill, (w, h)))
    body += '<path %s opacity=".38" d="M180 250Q240 306 320 360H110Z"/>' % fill("c-gold")
    body += '<path fill="none" stroke="#f0d98c" stroke-width="3" opacity=".7" d="%s"/>' % smooth_d(hill)
    # pedestal
    body += '<path class="c-steel" fill="#aab3b7" d="M236 228L246 150H262L272 228Z"/>'
    body += '<rect class="c-steel" fill="#8e979b" x="242" y="150" width="24" height="8"/>'
    # dish bowl tilted skyward, parabolic section
    body += '<g transform="rotate(-24 254 146)">'
    body += '<path fill="#8e979b" d="M146 140Q254 224 362 140Q254 190 146 140Z"/>'
    body += '<path fill="#f1f4f4" d="M146 140Q254 214 362 140Q254 176 146 140Z"/>'
    body += '<ellipse cx="254" cy="140" rx="108" ry="14" fill="#dfe4e5" stroke="#ffffff" stroke-width="2"/>'
    body += '<path fill="none" stroke="#8e979b" stroke-width="3" stroke-linecap="round" d="M254 150V92M168 140L254 92L340 140"/>'
    body += '<circle cx="254" cy="90" r="5" fill="#8e979b"/>'
    body += "</g>"
    return write("dish", svg("dish", w, h, body, "layer__svg--dish"))


# ---------------------------------------------------------------- oak hills (mid)
def oak():
    r = random.Random(280 + 4)
    w, h = 3600, 600
    A = make_ridge(r, w, 190, 110, ((1, 1.0), (2.4, 0.6), (5.2, 0.3), (10.5, 0.12)), 52)
    B = make_ridge(r, w, 300, 90, ((1.5, 1.0), (3.2, 0.55), (6.8, 0.25)), 52)
    C = make_ridge(r, w, 400, 70, ((1.2, 1.0), (2.9, 0.5), (6.1, 0.22)), 52)
    body = band(A, "c-gold", w, h)
    body += band(shift(A, 60), "c-straw", w, h, "0.32")
    body += '<path fill="none" stroke="#f0d98c" stroke-width="3" opacity=".6" d="%s"/>' % smooth_d(A)
    # oak-dark woodland in the folds between the gold ridges
    body += band(B, "c-oak", w, h)
    body += canopy_crest(r, B, w, 46, 14, 26)
    body += band(shift(B, 70), "c-oakd", w, h, "0.55")
    body += band(C, "c-gold", w, h)
    body += band(shift(C, 60), "c-ochre", w, h, "0.3")
    body += lone_oaks(r, C, w, 12, 1.1)
    body += '<path fill="none" stroke="#f0d98c" stroke-width="3" opacity=".6" d="%s"/>' % smooth_d(C)
    return write("hills-oak", svg("oak", w, h, body, "layer__svg--oak"))


# ---------------------------------------------------------------- reservoir
def reservoir():
    r = random.Random(280 + 5)
    w, h = 2000, 300
    shore = make_ridge(r, w, 96, 34, ((1.2, 1.0), (3.4, 0.5), (7.2, 0.25)), 40)

    def taper(x):
        e = min(1.0, min(x, w - x) / 320.0)
        return e * e * (3 - 2 * e)
    shore = [(x, y + (h + 40 - y) * (1 - taper(x))) for x, y in shore]
    body = band(shore, "c-oak", w, h)
    body += canopy_crest(r, shore, w, 36, 9, 17)
    body += band(shift(shore, 22), "c-oakd", w, h, "0.45")
    water = [(30, 150), (200, 128), (520, 120), (820, 124), (1120, 118), (1420, 126), (1700, 120), (1880, 130), (1980, 160)]
    body += '<path %s d="%s"/>' % (fill("c-water"), smooth_d(water) + "L2000 300L0 300Z")
    body += '<path %s opacity=".55" d="%s"/>' % (fill("c-waterl"), smooth_d([(x, y + 2) for x, y in water]) + "L1980 168Q1000 186 30 168Z")
    sh = []
    for _ in range(80):
        x = r.uniform(60, 1940)
        y = r.uniform(150, 290)
        ln = r.uniform(20, 80)
        sh.append("M%s %sh%s" % (f(x), f(y), f(ln)))
    body += '<path fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" opacity=".4" d="%s"/>' % "".join(sh)
    body += '<path fill="none" stroke="#ffffff" stroke-width="2" opacity=".6" d="%s"/>' % smooth_d(water)
    return write("reservoir", svg("reservoir", w, h, body, "layer__svg--reservoir"))


# ---------------------------------------------------------------- near golden hills
def gold_near():
    r = random.Random(280 + 6)
    w, h = 4400, 640
    R1 = make_ridge(r, w, 320, 70, ((1, 1.0), (2.1, 0.62), (4.6, 0.3), (9.3, 0.12)), 60)
    R2 = make_ridge(r, w, 430, 55, ((1.3, 1.0), (2.8, 0.55), (5.9, 0.25)), 60)
    body = band(R1, "c-oak", w, h, "0.9")
    body += canopy_crest(r, R1, w, 70, 12, 22)
    body += band(R2, "c-gold", w, h)
    body += band(shift(R2, 70), "c-ochre", w, h, "0.42")
    body += band(shift(R2, 6), "c-straw", w, h, "0.5")
    body += grass(r, R2, w, h, 360)
    body += lone_oaks(r, R2, w, 9, 1.5)
    body += '<path fill="none" stroke="#f3dd95" stroke-width="3.5" opacity=".75" d="%s"/>' % smooth_d(R2)
    return write("hills-gold-near", svg("gold-near", w, h, body, "layer__svg--gold-near"))


# ---------------------------------------------------------------- fog
def fog(name, seed, count, w=1600, h=420):
    r = random.Random(seed)
    defs = []
    body = ""
    for i in range(count):
        gid = "fg-%s-%d" % (name, i)
        defs.append('<radialGradient id="%s"><stop offset="0" stop-color="#f5f7f6" stop-opacity=".96"/><stop offset=".5" stop-color="#f5f7f6" stop-opacity=".55"/><stop offset="1" stop-color="#f5f7f6" stop-opacity="0"/></radialGradient>' % gid)
        cx = r.uniform(140, w - 140)
        cy = r.uniform(h * 0.3, h * 0.72)
        rx = r.uniform(260, 460)
        ry = r.uniform(80, 150)
        body += '<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="url(#%s)"/>' % (f(cx), f(cy), f(rx), f(ry), gid)
    return write("fog-" + name, svg("fog-" + name, w, h, body, "layer__svg--fog", defs="".join(defs)))


# ---------------------------------------------------------------- horizon light
def sun():
    w, h = 1200, 800
    defs = ('<radialGradient id="sg-cool"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".35" stop-color="#fff6dd" stop-opacity=".55"/><stop offset="1" stop-color="#fff6dd" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="sg-warm"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset=".38" stop-color="#ffb04a" stop-opacity=".5"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>')
    body = '<circle id="sun-cool" cx="600" cy="520" r="520" fill="url(#sg-cool)"/><circle id="sun-warm" cx="600" cy="520" r="520" fill="url(#sg-warm)"/>'
    return write("sky-sun", svg("sun", w, h, body, "layer__svg--sun", defs=defs))


# ---------------------------------------------------------------- road
def road():
    w, h = 1200, 120
    body = '<rect fill="#b4bcbf" x="0" y="0" width="1200" height="9"/>'
    body += '<rect fill="#7e878a" x="0" y="9" width="1200" height="3"/>'
    body += "".join('<rect fill="#7e878a" x="%d" y="9" width="5" height="20"/>' % x for x in range(20, 1200, 100))
    body += '<rect fill="#8a7a4a" x="0" y="12" width="1200" height="18"/>'
    body += '<rect fill="#3a3e41" x="0" y="30" width="1200" height="90"/>'
    body += '<rect fill="#f2c200" x="0" y="35" width="1200" height="2"/><rect fill="#f2c200" x="0" y="40" width="1200" height="2"/>'
    body += '<line id="centerline" x1="0" y1="76" x2="1200" y2="76" stroke="#ffffff" stroke-width="4" stroke-dasharray="34 46" vector-effect="non-scaling-stroke"/>'
    body += '<rect fill="#ffffff" x="0" y="110" width="1200" height="3"/>'
    return write("road", svg("road", w, h, body, "layer__svg--road"))


# ---------------------------------------------------------------- route (HUD)
def route():
    r = random.Random(280 + 7)
    w, h = 560, 36
    n = 14
    ys = [24, 20, 14, 18, 22, 16, 10, 14, 20, 17, 12, 15, 20, 14, 12]
    pts = [(6 + i * (548.0 / (len(ys) - 1)), ys[i]) for i in range(len(ys))]
    d = smooth_d(pts)
    # sample the same beziers for exact exit ticks along path length
    samples = []
    m = len(pts)
    for i in range(m - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < m else p2
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
        for k in range(0, 41):
            t = k / 40.0
            x = (1 - t) ** 3 * p1[0] + 3 * (1 - t) ** 2 * t * c1[0] + 3 * (1 - t) * t * t * c2[0] + t ** 3 * p2[0]
            y = (1 - t) ** 3 * p1[1] + 3 * (1 - t) ** 2 * t * c1[1] + 3 * (1 - t) * t * t * c2[1] + t ** 3 * p2[1]
            samples.append((x, y))
    cum = [0.0]
    for a, b in zip(samples, samples[1:]):
        cum.append(cum[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    total = cum[-1]

    def at(frac):
        target = frac * total
        for i in range(1, len(cum)):
            if cum[i] >= target:
                t = (target - cum[i - 1]) / max(1e-6, cum[i] - cum[i - 1])
                a, b = samples[i - 1], samples[i]
                return a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
        return samples[-1]

    body = '<path id="route-path" d="%s" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>' % d
    for mile in (3, 6, 9, 12, 15, 30):
        x, y = at(mile / 30.0)
        body += '<circle class="route-tick" cx="%s" cy="%s" r="3.4"/>' % (f(x), f(y))
    body += '<circle id="route-dot" r="6" cx="6" cy="24"/>'
    return write("route", svg("route", w, h, body, "hud__route-svg", par="xMidYMid meet"))


# ---------------------------------------------------------------- sprite
SYMS = {
    "sym-arrow-exit": '<path d="M6 6L18 18M18 8V18H8"/>',
    "sym-arrow-down": '<path d="M12 4V20M5 13l7 7 7-7"/>',
    "sym-camera": '<path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="3.6"/>',
    "sym-rest": '<path d="M3 10h18M7 10L4.5 19M17 10l2.5 9M9.5 14.5h5M2.5 14.5H8M16 14.5h5.5"/><path d="M12 3v3M9 5l3-2 3 2"/>',
    "sym-fog": '<path d="M3 8q3-3 6 0t6 0t6 0M3 13q3-3 6 0t6 0t6 0M3 18q3-3 6 0t6 0t6 0"/>',
    "sym-lake": '<path d="M3 15q3-3 6 0t6 0t6 0M3 19.5q3-3 6 0t6 0t6 0M4 11l4-6 3 4 3-5 6 7"/>',
    "sym-route": '<circle cx="5" cy="12" r="2"/><path d="M7 12h4M11 12L17 6M11 12h6M11 12l6 6"/><circle cx="19" cy="6" r="1.8"/><circle cx="19" cy="12" r="1.8"/><circle cx="19" cy="18" r="1.8"/>',
    "sym-columns": '<path d="M3 9l9-5 9 5zM6 11.5V18M10 11.5V18M14 11.5V18M18 11.5V18M3 20.5h18"/>',
    "sym-grid-flag": '<path d="M5 21V4M5 5h11l-2.5 3.5L16 12H5"/><path d="M10 21h10M15 17h5"/>',
    "sym-pin": '<path d="M12 21S5 14.6 5 10a7 7 0 0 1 14 0c0 4.600-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    "sym-scatter": '<path d="M4 4v16h16M7 16l11-9"/><circle cx="8" cy="12" r=".9"/><circle cx="12" cy="14" r=".9"/><circle cx="12.5" cy="9" r=".9"/><circle cx="17" cy="11" r=".9"/><circle cx="16" cy="6.500" r=".9"/>',
    "sym-quote": '<path d="M4 5h16v10h-9l-4 4v-4H4z"/>',
    "sym-note": '<path d="M9 18V5l10-2v13"/><ellipse cx="6.500" cy="18" rx="2.600" ry="2.200"/><ellipse cx="16.500" cy="16" rx="2.600" ry="2.200"/>',
    "sym-fork": '<path d="M5 3v6a3 3 0 0 0 6 0V3M8 3v18M17 21V3c3 1 4 5 4 9h-4"/>',
    "sym-oar": '<path d="M4 20L15 9"/><ellipse cx="18" cy="6" rx="2" ry="4.400" transform="rotate(45 18 6)"/>',
    "sym-school": '<path d="M2 9l10-5 10 5-10 5zM6 11.500V16c2 2 10 2 12 0v-4.500M22 9v6"/>',
    "sym-code": '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 5l-4 14"/>',
    "sym-doc": '<path d="M6 3h8l5 5v13H6zM14 3v5h5M9 13h7M9 17h7"/>',
    "sym-mail": '<path d="M3 6h18v12H3zM3 7l9 7 9-7"/>',
    "sym-branch": '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 5-12 2-12 7"/>',
    "sym-linkedin": '<path d="M4 4h16v16H4zM8 10v6M8 7.500v.100M12 16v-6M12 12.500c0-3 6-3 6 .5V16"/>',
    "sym-external": '<path d="M14 4h6v6M20 4l-9 9M18 14v6H5V6h5"/>',
}

SHIELD = (
    '<symbol id="sym-shield-280" viewBox="0 0 48 54">'
    '<path d="M24 1.500C30 4 38 4.500 46 3.500C47.500 14 47.500 28 43 39C39.500 47 32 51 24 53C16 51 8.500 47 5 39C.5 28 .5 14 2 3.500C10 4.500 18 4 24 1.500Z" fill="#ffffff"/>'
    '<path d="M24 4.200C29.500 6.400 37 7 44.200 6.200C45.200 16 45 28 41.300 37.500C38.200 44.600 31.600 48.200 24 50.200C16.400 48.200 9.800 44.600 6.700 37.500C3 28 2.800 16 3.800 6.200C11 7 18.500 6.400 24 4.200Z" fill="#0a4a97"/>'
    '<path d="M24 4.200C29.500 6.400 37 7 44.200 6.200C44.400 8 44.500 10 44.500 12.500H3.500C3.500 10 3.600 8 3.800 6.200C11 7 18.500 6.400 24 4.200Z" fill="#c8102e"/>'
    '<text x="24" y="38.500" text-anchor="middle" font-family="Overpass, Arial, sans-serif" font-weight="800" font-size="19" fill="#ffffff">280</text>'
    "</symbol>"
)


def sprite():
    parts = [SHIELD]
    for sid, inner in SYMS.items():
        parts.append('<symbol id="%s" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">%s</g></symbol>' % (sid, inner))
    s = '<svg xmlns="http://www.w3.org/2000/svg" class="sprite" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">%s</svg>' % "".join(parts)
    return write("sprite", s)


if __name__ == "__main__":
    sizes = {}
    sizes["mountains"] = mountains()
    sizes["skyline"] = skyline()
    sizes["hills-gold-far"] = gold_far()
    sizes["dish"] = dish_svg()
    sizes["hills-oak"] = oak()
    sizes["reservoir"] = reservoir()
    sizes["hills-gold-near"] = gold_near()
    sizes["fog-a"] = fog("a", 280 + 11, 5)
    sizes["fog-b"] = fog("b", 280 + 12, 6)
    sizes["fog-c"] = fog("c", 280 + 13, 5)
    sizes["sky-sun"] = sun()
    sizes["road"] = road()
    sizes["route"] = route()
    sizes["sprite"] = sprite()
    for k, v in sizes.items():
        print("%-16s %6d bytes" % (k, v))
    print("total", sum(sizes.values()))
