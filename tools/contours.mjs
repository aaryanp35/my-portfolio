/* Regenerates the contour layer in index.html.
   Usage: node tools/contours.mjs
   Deterministic: a seeded height field is cut at evenly spaced levels (marching squares),
   chained into lines, smoothed, and written between the contour markers in index.html. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const W = 1440;
const H = 6000;
const STEP = 28;
const LEVELS = 34;
const INDEX_EVERY = 5;

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
function fbm(x, y) {
  let s = 0, amp = 1, f = 1, norm = 0;
  for (let o = 0; o < 4; o++) { s += amp * noise(x * f, y * f); norm += amp; amp *= 0.5; f *= 2.05; }
  return s / norm;
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

function height(x, y) {
  const wx = x + 150 * noise(x / 520 + 7.3, y / 900 + 2.1);
  const wy = y + 190 * noise(x / 640 + 1.7, y / 1100 + 9.4);
  const v = y / H, u = x / W;
  const trend = 0.62 * (1 - v) + 0.22 * u;
  const rolling = fbm(wx / 430, wy / 760);
  const ridge = Math.exp(-Math.pow((wx * 0.55 + wy * 0.18 - 760) / 330, 2)) * 0.28;
  const bay = -0.7 * smooth(0.86, 1.0, v);
  return trend + 0.55 * rolling + ridge + bay;
}

/* sample the field */
const nx = Math.ceil(W / STEP), ny = Math.ceil(H / STEP);
const F = new Float32Array((nx + 1) * (ny + 1));
let lo = Infinity, hi = -Infinity;
const vals = [];
for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
  const f = height(i * STEP, j * STEP);
  F[j * (nx + 1) + i] = f; vals.push(f);
}
vals.sort((a, b) => a - b);
lo = vals[Math.floor(vals.length * 0.03)];
hi = vals[Math.floor(vals.length * 0.97)];
const at = (i, j) => F[j * (nx + 1) + i];

function contour(level) {
  const segs = [];
  const pts = new Map();
  const edgePt = (key, i, j, horizontal) => {
    if (pts.has(key)) return;
    const a = horizontal ? at(i, j) : at(i, j);
    const b = horizontal ? at(i + 1, j) : at(i, j + 1);
    const t = (level - a) / (b - a);
    pts.set(key, horizontal ? [(i + t) * STEP, j * STEP] : [i * STEP, (j + t) * STEP]);
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
    let chain = [segs[k][0], segs[k][1]];
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
function smoothPath(line) {
  let p = rdp(line.pts, 1.1).map(([x, y]) => [r(x), r(y)]);
  if (line.closed) p = p.slice(0, -1);
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

let paths = '', defs = '', labels = '';
let minorCount = 0, total = 0, bytes = 0;
for (let k = 0; k < LEVELS; k++) {
  const level = lo + ((k + 0.5) * (hi - lo)) / LEVELS;
  const lines = contour(level).filter((l) => lineLen(l) > 70);
  if (!lines.length) continue;
  const isIndex = k % INDEX_EVERY === 2;
  const d = lines.map(smoothPath).join('');
  let cls = 'c';
  if (isIndex) cls += ' idx';
  else { minorCount++; if (minorCount % 2 === 0) cls += ' x'; }
  paths += `<path class="${cls}" pathLength="1" d="${d}"/>\n`;
  total++; bytes += d.length;
  if (isIndex) {
    const sorted = lines.slice().sort((a, b) => lineLen(b) - lineLen(a));
    const L = sorted[0];
    if (lineLen(L) > 420) {
      const pts = L.pts[0][0] <= L.pts[L.pts.length - 1][0] ? L.pts : L.pts.slice().reverse();
      const id = `l${k}`;
      defs += `<path id="${id}" d="${smoothPath({ pts, closed: false })}"/>\n`;
      const elev = 120 + Math.round(k * 22 / 20) * 20;
      labels += `<text><textPath href="#${id}" startOffset="38%">${elev}</textPath></text>\n`;
    }
  }
}

const svg = `<svg class="contours" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">
<defs>
${defs}</defs>
<g class="c-lines">
${paths}</g>
<g class="c-labels">
${labels}</g>
</svg>`;

const here = dirname(fileURLToPath(import.meta.url));
const file = join(here, '..', 'index.html');
const html = readFileSync(file, 'utf8');
const a = '<!--contours:start-->', b = '<!--contours:end-->';
const i = html.indexOf(a), j = html.indexOf(b);
if (i < 0 || j < 0) { console.error('markers not found in index.html'); process.exit(1); }
writeFileSync(file, html.slice(0, i + a.length) + '\n' + svg + '\n' + html.slice(j));
console.log(`contour paths: ${total}, path data: ${(bytes / 1024).toFixed(1)} KB`);
