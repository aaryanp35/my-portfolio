/* Regenerates the map layers in index.html.
   Usage: node tools/contours.mjs
   Deterministic: a seeded height field is cut at evenly spaced levels (marching squares),
   chained into lines and smoothed. A second seeded field gives the vegetation tint regions,
   and a shoreline gives the water field at the foot of the sheet.
   Output goes between the <!--contours:start/end--> and <!--water:start/end--> markers. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const W = 1440;
const H = 7000;
const STEP = 24;
const LEVELS = 34;
const INDEX_EVERY = 5;
const STRIP = [1354, 1408];
const MARGIN = 2; /* cells sampled beyond the sheet so lines run off the edge */

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(0xfc6c3a93);

/* gradient noise */
const P = new Uint8Array(512);
{
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) P[i] = p[i & 255];
}
const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a, b, t) => a + (b - a) * t;
function grad(h, x, y) {
  switch (h & 7) {
    case 0: return x + y; case 1: return x - y; case 2: return -x + y; case 3: return -x - y;
    case 4: return x; case 5: return -x; case 6: return y; default: return -y;
  }
}
function noise(x, y) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  x -= Math.floor(x); y -= Math.floor(y);
  const u = fade(x), v = fade(y);
  const a = P[X] + Y, b = P[X + 1] + Y;
  return lerp(lerp(grad(P[a], x, y), grad(P[b], x - 1, y), u),
              lerp(grad(P[a + 1], x, y - 1), grad(P[b + 1], x - 1, y - 1), u), v);
}
function fbm(x, y, oct = 4) {
  let s = 0, amp = 1, f = 1, norm = 0;
  for (let o = 0; o < oct; o++) { s += amp * noise(x * f, y * f); norm += amp; amp *= 0.5; f *= 2.05; }
  return s / norm;
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const gauss = (x, y, cx, cy, sx, sy) => Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2));

function height(x, y) {
  const wx = x + 150 * noise(x / 520 + 7.3, y / 900 + 2.1);
  const wy = y + 190 * noise(x / 640 + 1.7, y / 1100 + 9.4);
  const v = y / H, u = x / W;
  const trend = 0.62 * (1 - v) + 0.2 * u;
  const rolling = fbm(wx / 430, wy / 760);
  const ridge = Math.exp(-Math.pow((wx * 0.55 + wy * 0.18 - 760) / 330, 2)) * 0.28;
  /* a summit behind the portrait inset, so closed rings circle it */
  const summit = 0.62 * gauss(wx, wy, 1130, 360, 300, 380);
  const knoll = 0.34 * gauss(wx, wy, 330, 2900, 300, 520) + 0.3 * gauss(wx, wy, 1160, 4300, 260, 480);
  return trend + 0.55 * rolling + ridge + summit + knoll;
}

function vegetation(x, y) {
  const wx = x + 120 * noise(x / 480 + 3.1, y / 700 + 5.5);
  const wy = y + 140 * noise(x / 500 + 8.8, y / 800 + 1.2);
  const base = fbm(wx / 360 + 20, wy / 520 + 40, 3);
  const hero = 0.9 * gauss(wx, wy, 1180, 330, 330, 420);
  const lowerLeft = 0.42 * gauss(wx, wy, 150, 3500, 360, 620);
  const lowerRight = 0.5 * gauss(wx, wy, 1240, 5100, 300, 560);
  return base * 0.55 + hero + lowerLeft + lowerRight - 0.2;
}

const nx = Math.ceil(W / STEP) + 2 * MARGIN;
const ny = Math.ceil(H / STEP) + 2 * MARGIN;
const X0 = -MARGIN * STEP, Y0 = -MARGIN * STEP;

function sample(fn) {
  const F = new Float32Array((nx + 1) * (ny + 1));
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) F[j * (nx + 1) + i] = fn(X0 + i * STEP, Y0 + j * STEP);
  return F;
}

function contour(F, level, closeEdges) {
  const at = (i, j) => {
    if (closeEdges && (i === 0 || j === 0 || i === nx || j === ny)) return -1e3;
    return F[j * (nx + 1) + i];
  };
  const segs = [];
  const pts = new Map();
  const edgePt = (key, i, j, horizontal) => {
    if (pts.has(key)) return;
    const a = at(i, j);
    const b = horizontal ? at(i + 1, j) : at(i, j + 1);
    const t = (level - a) / (b - a);
    pts.set(key, horizontal ? [X0 + (i + t) * STEP, Y0 + j * STEP] : [X0 + i * STEP, Y0 + (j + t) * STEP]);
  };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const tl = at(i, j) >= level, tr = at(i + 1, j) >= level, br = at(i + 1, j + 1) >= level, bl = at(i, j + 1) >= level;
    const edges = [];
    if (tl !== tr) { edges.push(`h${i},${j}`); edgePt(`h${i},${j}`, i, j, true); }
    if (tr !== br) { edges.push(`v${i + 1},${j}`); edgePt(`v${i + 1},${j}`, i + 1, j, false); }
    if (bl !== br) { edges.push(`h${i},${j + 1}`); edgePt(`h${i},${j + 1}`, i, j + 1, true); }
    if (tl !== bl) { edges.push(`v${i},${j}`); edgePt(`v${i},${j}`, i, j, false); }
    if (edges.length === 2) segs.push([edges[0], edges[1]]);
    else if (edges.length === 4) {
      const c = (at(i, j) + at(i + 1, j) + at(i + 1, j + 1) + at(i, j + 1)) / 4 >= level;
      const T = `h${i},${j}`, R = `v${i + 1},${j}`, B = `h${i},${j + 1}`, L = `v${i},${j}`;
      if (c === tl) { segs.push([T, R], [B, L]); } else { segs.push([T, L], [B, R]); }
    }
  }
  const adj = new Map();
  segs.forEach((s, k) => s.forEach((e) => { if (!adj.has(e)) adj.set(e, []); adj.get(e).push(k); }));
  const used = new Array(segs.length).fill(false);
  const lines = [];
  for (let k = 0; k < segs.length; k++) {
    if (used[k]) continue;
    used[k] = true;
    const chain = [segs[k][0], segs[k][1]];
    for (const dir of [1, 0]) {
      for (;;) {
        const end = dir ? chain[chain.length - 1] : chain[0];
        const next = (adj.get(end) || []).find((q) => !used[q]);
        if (next === undefined) break;
        used[next] = true;
        const o = segs[next][0] === end ? segs[next][1] : segs[next][0];
        if (dir) chain.push(o); else chain.unshift(o);
      }
    }
    const closed = chain.length > 3 && chain[0] === chain[chain.length - 1];
    lines.push({ pts: chain.map((e) => pts.get(e)), closed });
  }
  return lines;
}

function rdp(p, eps) {
  if (p.length < 3) return p;
  let dmax = 0, idx = 0;
  const [a, b] = [p[0], p[p.length - 1]];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < p.length - 1; i++) {
    const d = Math.abs(dy * p[i][0] - dx * p[i][1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax > eps) { const l = rdp(p.slice(0, idx + 1), eps), r = rdp(p.slice(idx), eps); return l.slice(0, -1).concat(r); }
  return [a, b];
}

const r = (n) => Math.round(n);
function smoothPath(line, eps = 1.6) {
  let p;
  if (line.closed) {
    /* a closed ring starts and ends on one point, so split it before simplifying */
    const h = Math.floor(line.pts.length / 2);
    p = rdp(line.pts.slice(0, h + 1), eps).slice(0, -1).concat(rdp(line.pts.slice(h), eps)).map(([x, y]) => [r(x), r(y)]);
    p = p.slice(0, -1);
  } else {
    p = rdp(line.pts, eps).map(([x, y]) => [r(x), r(y)]);
  }
  if (p.length < 3) return `M${p[0][0]} ${p[0][1]}L${p[p.length - 1][0]} ${p[p.length - 1][1]}`;
  const mid = (a, b) => [r((a[0] + b[0]) / 2), r((a[1] + b[1]) / 2)];
  let d = '';
  let cur;
  if (line.closed) {
    cur = mid(p[p.length - 1], p[0]);
    d = `M${cur[0]} ${cur[1]}`;
    for (let i = 0; i < p.length; i++) {
      const c = p[i], m = mid(p[i], p[(i + 1) % p.length]);
      d += `q${c[0] - cur[0]} ${c[1] - cur[1]} ${m[0] - cur[0]} ${m[1] - cur[1]}`;
      cur = m;
    }
    d += 'z';
  } else {
    cur = p[0];
    d = `M${cur[0]} ${cur[1]}`;
    for (let i = 1; i < p.length - 1; i++) {
      const c = p[i], m = mid(p[i], p[i + 1]);
      d += `q${c[0] - cur[0]} ${c[1] - cur[1]} ${m[0] - cur[0]} ${m[1] - cur[1]}`;
      cur = m;
    }
    const e = p[p.length - 1];
    d += `l${e[0] - cur[0]} ${e[1] - cur[1]}`;
  }
  return d;
}
const lineLen = (l) => l.pts.reduce((s, p, i) => (i ? s + Math.hypot(p[0] - l.pts[i - 1][0], p[1] - l.pts[i - 1][1]) : 0), 0);

/* ---- contour lines ---- */
const HF = sample(height);
const sorted = Array.from(HF).sort((a, b) => a - b);
const lo = sorted[Math.floor(sorted.length * 0.03)];
const hi = sorted[Math.floor(sorted.length * 0.97)];

let paths = '', defs = '', labels = '';
let minorCount = 0, total = 0, bytes = 0;
for (let k = 0; k < LEVELS; k++) {
  const level = lo + ((k + 0.5) * (hi - lo)) / LEVELS;
  const lines = contour(HF, level, false).filter((l) => lineLen(l) > 110);
  if (!lines.length) continue;
  const isIndex = k % INDEX_EVERY === INDEX_EVERY - 1;
  const d = lines.map((l) => smoothPath(l)).join('');
  let cls = 'c';
  if (isIndex) cls += ' idx';
  else { minorCount++; if (minorCount % 2 === 0) cls += ' x'; }
  paths += `<path class="${cls}" pathLength="1" d="${d}"/>\n`;
  total++; bytes += d.length;
  if (isIndex) {
    /* labels sit in the strip just inside the right margin, where no copy runs:
       take the longest stretch of any line of this level that stays in that strip */
    let best = null;
    for (const l of lines) {
      let run = [];
      const flush = () => {
        if (run.length > 2) {
          const len = lineLen({ pts: run });
          if (len > 34 && (!best || len > best.len)) best = { pts: run.slice(), len };
        }
        run = [];
      };
      for (const p of l.pts) { if (p[0] >= STRIP[0] && p[0] <= STRIP[1] && p[1] > 160 && p[1] < H - 1500) run.push(p); else flush(); }
      flush();
    }
    if (best) {
      const pts = best.pts[0][0] <= best.pts[best.pts.length - 1][0] ? best.pts : best.pts.slice().reverse();
      const id = `el${k}`;
      defs += `<path id="${id}" d="${smoothPath({ pts, closed: false }, 0.6)}"/>\n`;
      labels += `<text text-anchor="middle"><textPath href="#${id}" startOffset="50%">${40 * (k + 1)}</textPath></text>\n`;
    }
  }
}

/* ---- vegetation tint ---- */
const VF = sample(vegetation);
const vlines = contour(VF, 0.18, true).filter((l) => l.closed && lineLen(l) > 260);
const ground = vlines.map((l) => smoothPath(l, 2)).join('');

const svg = `<div class="cf-wrap" aria-hidden="true">
<svg class="cf cf-a" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" focusable="false">
<defs>
${defs}</defs>
<g id="cl-ground" class="c-ground"><path fill-rule="evenodd" d="${ground}"/></g>
<g id="cl-lines" class="c-lines">
${paths}</g>
<g id="cl-labels" class="c-labels">
${labels}</g>
</svg>
<svg class="cf cf-b" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" focusable="false"><use href="#cl-ground"/><use href="#cl-lines"/></svg>
<svg class="cf cf-c" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" focusable="false"><use href="#cl-ground"/><use href="#cl-lines"/></svg>
</div>`;

/* ---- water: a bay along the foot of the sheet, with a few depth lines ---- */
const WH = 800;
function shore(off, wob) {
  const pts = [];
  for (let x = -40; x <= W + 40; x += 40) {
    const n = fbm(x / 520 + 31, 4.2 + off / 90, 3);
    const cove = 70 * gauss(x, 0, 330, 0, 190, 1) - 60 * gauss(x, 0, 1120, 0, 260, 1);
    pts.push([x, 200 + off + wob * n * 2 + cove * (off < 300 ? 1 - off / 360 : 0)]);
  }
  return pts;
}
function openPath(pts) {
  const rp = pts.map(([x, y]) => [r(x), r(y)]);
  const mid = (a, b) => [r((a[0] + b[0]) / 2), r((a[1] + b[1]) / 2)];
  let cur = rp[0];
  let d = `M${cur[0]} ${cur[1]}`;
  for (let i = 1; i < rp.length - 1; i++) {
    const c = rp[i], m = mid(rp[i], rp[i + 1]);
    d += `q${c[0] - cur[0]} ${c[1] - cur[1]} ${m[0] - cur[0]} ${m[1] - cur[1]}`;
    cur = m;
  }
  const e = rp[rp.length - 1];
  d += `l${e[0] - cur[0]} ${e[1] - cur[1]}`;
  return d;
}
const shoreline = shore(0, 70);
const bay = `${openPath(shoreline)}V${WH}H-40Z`;
let depth = '';
[70, 150, 250].forEach((o, i) => { depth += `<path d="${openPath(shore(o, 70 - i * 18))}"/>\n`; });
const water = `<svg class="bay" viewBox="0 0 ${W} ${WH}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
<path class="bay-fill" d="${bay}"/>
<g class="bay-lines">
${depth}</g>
</svg>`;

const here = dirname(fileURLToPath(import.meta.url));
const file = join(here, '..', 'index.html');
let html = readFileSync(file, 'utf8');
function inject(a, b, body) {
  const i = html.indexOf(a), j = html.indexOf(b);
  if (i < 0 || j < 0) { console.error(`markers ${a} not found in index.html`); process.exit(1); }
  html = html.slice(0, i + a.length) + '\n' + body + '\n' + html.slice(j);
}
inject('<!--contours:start-->', '<!--contours:end-->', svg);
inject('<!--water:start-->', '<!--water:end-->', water);
writeFileSync(file, html);
console.log(`contour paths: ${total}, vegetation loops: ${vlines.length}, line data: ${(bytes / 1024).toFixed(1)} KB, ground: ${(ground.length / 1024).toFixed(1)} KB`);
