function reveal(cx, cy, r) { const seen = new Set(S.world.seen); for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) seen.add(x + "," + y); S.world.seen = [...seen]; }
let mapSel = null;
/* Карта рисуется в два слоя: рельеф (кэшируется на мир и размер) и живой слой — туман, дороги, места, пометки сюжета. */
const BIOME_PAL = {
  coast: { deep: [14, 40, 52], shallow: [34, 78, 90], sand: [156, 138, 96], grass: [74, 88, 60], grass2: [88, 98, 64], forest: [40, 62, 46], rock: [104, 104, 94], snow: [206, 210, 204], marsh: [64, 80, 60], ink: [22, 20, 16] },
  marsh: { deep: [22, 42, 40], shallow: [44, 70, 62], sand: [120, 112, 80], grass: [70, 82, 54], grass2: [80, 88, 56], forest: [38, 56, 40], rock: [96, 96, 84], snow: [200, 204, 196], marsh: [58, 74, 52], ink: [20, 20, 14] },
  mountains: { deep: [18, 36, 50], shallow: [40, 70, 86], sand: [140, 128, 98], grass: [78, 90, 66], grass2: [92, 100, 74], forest: [44, 64, 52], rock: [112, 112, 108], snow: [224, 228, 230], marsh: [64, 80, 62], ink: [24, 22, 20] },
  forest: { deep: [16, 38, 46], shallow: [36, 74, 80], sand: [140, 128, 90], grass: [66, 86, 54], grass2: [78, 96, 58], forest: [34, 58, 38], rock: [98, 100, 90], snow: [206, 210, 204], marsh: [56, 76, 52], ink: [20, 22, 16] }
};
function makeNoise(seed) {
  const r = mulberry(seed); const N = 256; const g = new Float32Array(N * N); for (let i = 0; i < g.length; i++) g[i] = r();
  const v = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi; const i0 = (yi & 255) * N, i1 = ((yi + 1) & 255) * N, x0 = xi & 255, x1 = (xi + 1) & 255;
    const a = g[i0 + x0], b = g[i0 + x1], c = g[i1 + x0], d = g[i1 + x1]; const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
  return (x, y, o) => { let s = 0, amp = .5, f = 1, n = 0; for (let k = 0; k < (o || 4); k++) { s += v(x * f + k * 17.3, y * f - k * 9.1) * amp; n += amp; amp *= .5; f *= 2.03; } return s / n; };
}
function tileFields() {
  const F = { w: new Float32Array(MAP_W * MAP_H), f: new Float32Array(MAP_W * MAP_H), r: new Float32Array(MAP_W * MAP_H), n: new Float32Array(MAP_W * MAP_H), m: new Float32Array(MAP_W * MAP_H), a: new Float32Array(MAP_W * MAP_H), road: new Uint8Array(MAP_W * MAP_H) };
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) { const t = tileAt(x, y), i = y * MAP_W + x;
    F.w[i] = t === "S" || t === "W" ? 1 : 0; F.f[i] = t === "f" ? 1 : 0; F.r[i] = t === "r" || t === "n" ? 1 : 0; F.n[i] = t === "n" ? 1 : 0; F.m[i] = t === "m" ? 1 : 0; F.a[i] = t === "a" ? 1 : 0; F.road[i] = ROAD.has(x + "," + y) ? 1 : 0; }
  return F;
}
function bil(arr, x, y) {
  x = clamp(x, 0, MAP_W - 1.001); y = clamp(y, 0, MAP_H - 1.001); const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const x1 = Math.min(MAP_W - 1, xi + 1), y1 = Math.min(MAP_H - 1, yi + 1);
  const a = arr[yi * MAP_W + xi], b = arr[yi * MAP_W + x1], c = arr[y1 * MAP_W + xi], d = arr[y1 * MAP_W + x1];
  return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
}
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
/* Поле рельефа в точке (u, v) в координатах клеток — общее для пикселей и глифов */
function fieldAt(F, nz, u, v) {
  const wu = u - .5 + (nz(u * .55, v * .55, 3) - .5) * 1.25, wv = v - .5 + (nz(u * .55 + 40, v * .55 + 40, 3) - .5) * 1.25;
  let w = bil(F.w, wu, wv) + (nz(u * 2.6, v * 2.6, 3) - .5) * .34;
  const ti = clamp(Math.floor(v), 0, MAP_H - 1) * MAP_W + clamp(Math.floor(u), 0, MAP_W - 1);
  if (F.road[ti]) w -= .22;
  for (const p of F.pois) { const d = Math.hypot(u - p[0], v - p[1]); if (d < .75) w -= (.75 - d) * 1.1; }
  return { w, f: bil(F.f, wu, wv) + (nz(u * 1.9 + 7, v * 1.9, 3) - .5) * .5, r: bil(F.r, wu, wv) + (nz(u * 1.4, v * 1.4 + 9, 3) - .5) * .45, n: bil(F.n, wu, wv), m: bil(F.m, wu, wv), a: bil(F.a, wu, wv) };
}
const mapCache = new Map();
function mapBase(width, Q) {
  const key = `${WD.id}|${Math.round(width)}|${Q}`; if (mapCache.has(key)) return mapCache.get(key);
  const W = Math.round(width * Q), H = Math.round(width * Q * MAP_H / MAP_W); const t = width / MAP_W;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d");
  const nz = makeNoise(hash(WD.id)); const F = tileFields(); F.pois = Object.values(POIS).map(p => [p.x + .5, p.y + .5]);
  const P = BIOME_PAL[WD.biome] || BIOME_PAL.coast; const img = g.createImageData(W, H); const d = img.data;
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const u = px / W * MAP_W, v = py / H * MAP_H; const fd = fieldAt(F, nz, u, v); const n1 = nz(u * 4, v * 4, 2), n2 = nz(u * 11, v * 11, 2);
    let c;
    if (fd.w > .5) {
      const depth = smooth(.5, 1.05, fd.w); c = [mix(P.shallow[0], P.deep[0], depth), mix(P.shallow[1], P.deep[1], depth), mix(P.shallow[2], P.deep[2], depth)];
      const band = (lo, hi, a) => { if (fd.w > lo && fd.w < hi) { c = c.map(x => x + a); } };
      band(.54, .565, 26); band(.64, .655, 14); band(.76, .77, 8);
      const wave = Math.sin((u * 3.1 + nz(u, v, 2) * 6) * 2.2 + v * 1.3); if (wave > .985 && depth > .4) c = c.map(x => x + 14);
      c = c.map(x => x + (n2 - .5) * 10);
    } else {
      const shore = smooth(.32, .48, fd.w);
      c = [mix(P.grass[0], P.grass2[0], n1), mix(P.grass[1], P.grass2[1], n1), mix(P.grass[2], P.grass2[2], n1)];
      const ft = smooth(.45, .8, fd.f); c = c.map((x, i) => mix(x, P.forest[i], ft * .85));
      const mt = smooth(.4, .75, fd.m); if (mt > 0) { c = c.map((x, i) => mix(x, P.marsh[i], mt)); if (n2 > .62 && mt > .5) c = c.map((x, i) => mix(x, P.shallow[i], .7)); }
      const rt = smooth(.45, .85, fd.r); c = c.map((x, i) => mix(x, P.rock[i], rt * .8));
      const st = smooth(.5, .8, fd.n); c = c.map((x, i) => mix(x, P.snow[i], st));
      const sa = Math.max(shore, smooth(.4, .8, fd.a) * .8); c = c.map((x, i) => mix(x, P.sand[i], sa));
      const hs = (nz(u * 3 + .04, v * 3, 3) - nz(u * 3 - .04, v * 3, 3)) * 40 * (1 + rt * 3); c = c.map(x => x + hs * 6 + (n2 - .5) * 12);
      if (fd.w > .44) { const k = smooth(.44, .5, fd.w); c = c.map((x, i) => mix(x, P.ink[i], k * .85)); }
    }
    const vx = px / W - .5, vy = py / H - .5; const vig = 1 - (vx * vx + vy * vy) * .55; const o = (py * W + px) * 4;
    d[o] = clamp(c[0] * vig, 0, 255); d[o + 1] = clamp(c[1] * vig, 0, 255); d[o + 2] = clamp(c[2] * vig, 0, 255); d[o + 3] = 255;
  }
  g.putImageData(img, 0, 0); g.setTransform(Q, 0, 0, Q, 0, 0);
  const rr = mulberry(hash(WD.id + "glyph"));
  const sizeK = clamp(t / 19, .75, 1.6);
  // горы
  const ms = 15 * sizeK; const peaks = [];
  for (let y = ms * .6; y < width * MAP_H / MAP_W; y += ms * .7) for (let x = (y / ms % 2) * ms * .5; x < width; x += ms) {
    const jx = x + (rr() - .5) * ms * .6, jy = y + (rr() - .5) * ms * .4; const fd = fieldAt(F, nz, jx / t, jy / t);
    if (fd.r > .62 && fd.w < .35) peaks.push([jx, jy, fd.n > .4, (8 + rr() * 6) * sizeK]);
  }
  peaks.sort((a, b) => a[1] - b[1]).forEach(([x, y, snow, s]) => {
    g.beginPath(); g.moveTo(x - s, y + s * .5); g.lineTo(x, y - s * .8); g.lineTo(x + s, y + s * .5); g.closePath(); g.fillStyle = "rgba(70,70,64,.95)"; g.fill();
    g.beginPath(); g.moveTo(x, y - s * .8); g.lineTo(x + s, y + s * .5); g.lineTo(x + s * .15, y + s * .5); g.closePath(); g.fillStyle = "rgba(30,30,28,.55)"; g.fill();
    if (snow) { g.beginPath(); g.moveTo(x - s * .35, y - s * .2); g.lineTo(x, y - s * .8); g.lineTo(x + s * .35, y - s * .2); g.lineTo(x + s * .1, y - s * .3); g.lineTo(x - s * .1, y - s * .15); g.closePath(); g.fillStyle = "rgba(235,238,236,.9)"; g.fill(); }
    g.beginPath(); g.moveTo(x - s, y + s * .5); g.lineTo(x, y - s * .8); g.lineTo(x + s, y + s * .5); g.strokeStyle = "rgba(20,18,14,.7)"; g.lineWidth = .8; g.stroke();
  });
  // деревья
  const ts = 7.5 * sizeK; const trees = [];
  for (let y = ts * .5; y < width * MAP_H / MAP_W; y += ts * .8) for (let x = 0; x < width; x += ts) {
    const jx = x + (rr() - .5) * ts * .9, jy = y + (rr() - .5) * ts * .7; const fd = fieldAt(F, nz, jx / t, jy / t);
    if (fd.f > .6 && fd.w < .32 && fd.r < .6) trees.push([jx, jy, (3.6 + rr() * 2.2) * sizeK, rr()]);
    else if (fd.m > .6 && fd.w < .4 && rr() > .55) trees.push([jx, jy, (2.5 + rr()) * sizeK, -1]);
    else if (fd.f > .35 && fd.w < .3 && rr() > .93) trees.push([jx, jy, (3.2 + rr()) * sizeK, rr()]);
  }
  trees.sort((a, b) => a[1] - b[1]).forEach(([x, y, s, k]) => {
    if (k < 0) { g.strokeStyle = "rgba(150,170,110,.55)"; g.lineWidth = .9; g.beginPath(); g.moveTo(x - s * .5, y + s); g.lineTo(x - s * .7, y - s * .4); g.moveTo(x, y + s); g.lineTo(x, y - s * .8); g.moveTo(x + s * .5, y + s); g.lineTo(x + s * .8, y - s * .3); g.stroke(); return; }
    g.fillStyle = "rgba(10,18,12,.35)"; g.beginPath(); g.ellipse(x + s * .4, y + s * 1.1, s * .9, s * .3, 0, 0, 7); g.fill();
    const dark = `rgb(${24 + k * 12},${44 + k * 14},${30 + k * 8})`, lite = `rgb(${50 + k * 14},${78 + k * 16},${50 + k * 8})`;
    g.fillStyle = dark; g.beginPath(); g.moveTo(x, y - s * 1.5); g.lineTo(x + s, y + s); g.lineTo(x - s, y + s); g.closePath(); g.fill();
    g.fillStyle = lite; g.beginPath(); g.moveTo(x, y - s * 1.5); g.lineTo(x, y + s); g.lineTo(x - s, y + s); g.closePath(); g.fill();
  });
  // дома
  const hr = mulberry(hash(WD.id + "h"));
  (WD.houses || []).forEach(([hx, hy]) => { for (let k = 0; k < 2; k++) {
    const x = (hx + .25 + hr() * .5) * t, y = (hy + .3 + hr() * .45) * t, s = (3.2 + hr() * 1.4) * sizeK;
    g.fillStyle = "rgba(12,10,8,.35)"; g.fillRect(x - s + 1, y - s * .2 + 1.5, s * 2, s * 1.3);
    g.fillStyle = "#8f7b5e"; g.fillRect(x - s, y - s * .2, s * 2, s * 1.2);
    g.fillStyle = "#7c3a2a"; g.beginPath(); g.moveTo(x - s * 1.2, y - s * .1); g.lineTo(x, y - s * 1.2); g.lineTo(x + s * 1.2, y - s * .1); g.closePath(); g.fill();
    g.fillStyle = "rgba(242,180,92,.85)"; g.fillRect(x - s * .3, y + s * .25, s * .45, s * .4);
  } });
  // подписи моря и рамка
  const out = { cv, t, peaks, nz, F };
  mapCache.set(key, out); if (mapCache.size > 8) mapCache.delete(mapCache.keys().next().value);
  return out;
}
function roadPaths(t) {
  const start = POIS[WD.start] || Object.values(POIS)[0]; const s0 = [start.x, start.y]; const out = {};
  const rr = mulberry(hash(WD.id + "road"));
  Object.entries(POIS).forEach(([id, p]) => {
    if (id === WD.start) return; const prev = new Map(); const q = [s0]; prev.set(s0.join(","), null); let found = false;
    while (q.length) { const [x, y] = q.shift(); if (x === p.x && y === p.y) { found = true; break; }
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + a, ny = y + b, k = nx + "," + ny; if (prev.has(k) || !(ROAD.has(k) || (nx === p.x && ny === p.y))) continue; prev.set(k, x + "," + y); q.push([nx, ny]); } }
    if (!found) return; const pts = []; let k = p.x + "," + p.y; while (k) { const [x, y] = k.split(",").map(Number); pts.unshift([(x + .5) * t, (y + .5) * t]); k = prev.get(k); }
    let P2 = pts.map(([x, y], i) => i === 0 || i === pts.length - 1 ? [x, y] : [x + (rr() - .5) * t * .35, y + (rr() - .5) * t * .35]);
    for (let it = 0; it < 3; it++) { const n = [P2[0]]; for (let i = 0; i < P2.length - 1; i++) { const [ax, ay] = P2[i], [bx, by] = P2[i + 1]; n.push([ax * .75 + bx * .25, ay * .75 + by * .25], [ax * .25 + bx * .75, ay * .25 + by * .75]); } n.push(P2[P2.length - 1]); P2 = n; }
    out[id] = P2;
  });
  return out;
}
/* иконки мест — векторные */
function poiIcon(g, kind, x, y, s, col) {
  g.save(); g.translate(x, y); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = Math.max(1.2, s * .13); g.lineCap = "round"; g.lineJoin = "round"; const a = s * .5;
  g.beginPath();
  switch (kind) {
    case "inn": case "house": case "hut": g.moveTo(-a, a * .7); g.lineTo(-a, -a * .1); g.lineTo(0, -a * .85); g.lineTo(a, -a * .1); g.lineTo(a, a * .7); g.closePath(); g.stroke(); g.beginPath(); g.rect(-a * .25, a * .1, a * .5, a * .6); if (kind === "inn") g.fill(); else g.stroke(); break;
    case "chapel": case "shrine": g.moveTo(0, -a); g.lineTo(0, a); g.moveTo(-a * .55, -a * .35); g.lineTo(a * .55, -a * .35); g.stroke(); break;
    case "tower": g.moveTo(-a * .45, a * .85); g.lineTo(-a * .3, -a * .5); g.lineTo(a * .3, -a * .5); g.lineTo(a * .45, a * .85); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(-a * .45, -a * .5); g.lineTo(a * .45, -a * .5); g.lineTo(0, -a * 1.05); g.closePath(); g.fill(); break;
    case "cave": g.moveTo(-a, a * .7); g.quadraticCurveTo(-a * .8, -a, 0, -a * .8); g.quadraticCurveTo(a * .8, -a, a, a * .7); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(-a * .4, a * .7); g.quadraticCurveTo(0, -a * .2, a * .4, a * .7); g.fill(); break;
    case "ruin": case "gate": g.moveTo(-a * .6, a * .8); g.lineTo(-a * .6, -a * .5); g.moveTo(a * .6, a * .8); g.lineTo(a * .6, -a * .2); g.moveTo(-a * .9, -a * .55); g.lineTo(a * .2, -a * .7); g.moveTo(-a, a * .8); g.lineTo(a, a * .8); g.stroke(); break;
    case "camp": g.moveTo(-a, a * .7); g.lineTo(0, -a * .8); g.lineTo(a, a * .7); g.closePath(); g.stroke(); g.beginPath(); g.moveTo(0, -a * .8); g.lineTo(0, a * .7); g.stroke(); break;
    case "mine": g.moveTo(-a * .8, a * .8); g.lineTo(a * .5, -a * .5); g.moveTo(-a * .1, -a * .9); g.quadraticCurveTo(a * .6, -a * .9, a * .9, -a * .1); g.stroke(); break;
    case "farm": for (let i = -1; i <= 1; i++) { g.moveTo(i * a * .5, a * .8); g.lineTo(i * a * .5, -a * .4); g.moveTo(i * a * .5, -a * .2); g.lineTo(i * a * .5 - a * .2, -a * .6); g.moveTo(i * a * .5, -a * .2); g.lineTo(i * a * .5 + a * .2, -a * .6); } g.stroke(); break;
    case "pier": g.moveTo(0, -a * .8); g.lineTo(0, a * .7); g.moveTo(-a * .4, -a * .4); g.lineTo(a * .4, -a * .4); g.moveTo(-a * .8, a * .2); g.quadraticCurveTo(0, a * 1.1, a * .8, a * .2); g.stroke(); break;
    case "wreck": g.moveTo(-a * .7, -a * .7); g.lineTo(a * .7, a * .7); g.moveTo(a * .7, -a * .7); g.lineTo(-a * .7, a * .7); g.stroke(); break;
    case "grove": g.moveTo(0, -a); g.lineTo(a * .7, a * .4); g.lineTo(-a * .7, a * .4); g.closePath(); g.fill(); g.beginPath(); g.moveTo(0, a * .4); g.lineTo(0, a * .9); g.stroke(); break;
    case "bridge": g.moveTo(-a, a * .4); g.quadraticCurveTo(0, -a * .7, a, a * .4); g.moveTo(-a, a * .8); g.lineTo(a, a * .8); g.stroke(); break;
    case "well": g.arc(0, a * .1, a * .65, 0, 7); g.stroke(); g.beginPath(); g.moveTo(-a * .8, -a * .7); g.lineTo(a * .8, -a * .7); g.stroke(); break;
    default: g.arc(0, 0, a * .5, 0, 7); g.fill();
  }
  g.restore();
}
function placeState(id) {
  if (!S) return {};
  const p = POIS[id]; const vis = S.world.visited.includes(id); const foes = (p.enemies || []).filter(e => S.world.enemies[e]);
  const alive = foes.filter(e => S.world.enemies[e].alive).length;
  return { visited: vis, here: S.world.loc === id, danger: vis && alive > 0, cleared: vis && foes.length > 0 && alive === 0, clue: !!S.world.flags["clue_" + id], note: S.world.notes?.[id] || "", rumor: !!S.world.rumors?.includes(id) };
}
function paintMap(cv, opts) {
  const o = opts || {}; const width = o.width; const t = width / MAP_W; const H = t * MAP_H;
  const Q = Math.min(2, window.devicePixelRatio || 1, 1700 / width);
  cv.width = Math.round(width * Q); cv.height = Math.round(H * Q); cv.style.height = H + "px";
  const g = cv.getContext("2d"); const base = mapBase(width, Q);
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(base.cv, 0, 0); g.setTransform(Q, 0, 0, Q, 0, 0);
  const sizeK = clamp(t / 19, .75, 1.6);
  const seen = o.fog && S ? new Set(S.world.seen) : null;
  // дороги
  const paths = roadPaths(t);
  Object.entries(paths).forEach(([id, pts]) => {
    const st = placeState(id); const lit = !S || st.visited || (seen && seen.has(POIS[id].x + "," + POIS[id].y));
    g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
    g.strokeStyle = "rgba(18,12,6,.45)"; g.lineWidth = 3.2 * sizeK; g.lineCap = "round"; g.lineJoin = "round"; g.setLineDash([]); g.stroke();
    g.strokeStyle = lit ? "rgba(222,196,146,.9)" : "rgba(222,196,146,.45)"; g.lineWidth = 1.5 * sizeK; g.setLineDash([5 * sizeK, 3.5 * sizeK]); g.stroke(); g.setLineDash([]);
  });
  // туман войны
  if (seen) {
    const fog = document.createElement("canvas"); fog.width = cv.width; fog.height = cv.height; const f = fog.getContext("2d"); f.setTransform(Q, 0, 0, Q, 0, 0);
    const fg = f.createLinearGradient(0, 0, width, H); fg.addColorStop(0, "rgba(10,17,20,.94)"); fg.addColorStop(1, "rgba(14,22,26,.94)"); f.fillStyle = fg; f.fillRect(0, 0, width, H);
    const fr = mulberry(hash(WD.id + "fog")); f.fillStyle = "rgba(160,180,180,.035)";
    for (let i = 0; i < 70; i++) { f.beginPath(); f.ellipse(fr() * width, fr() * H, (20 + fr() * 50) * sizeK, (8 + fr() * 18) * sizeK, fr() * 3, 0, 7); f.fill(); }
    f.globalCompositeOperation = "destination-out";
    const hole = (x, y, r, a) => { const gr = f.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(.6, `rgba(0,0,0,${a * .85})`); gr.addColorStop(1, "rgba(0,0,0,0)"); f.fillStyle = gr; f.beginPath(); f.arc(x, y, r, 0, 7); f.fill(); };
    seen.forEach(k => { const [x, y] = k.split(",").map(Number); hole((x + .5) * t, (y + .5) * t, t * 1.15, 1); });
    (S.world.rumors || []).forEach(id => { const p = POIS[id]; if (p) hole((p.x + .5) * t, (p.y + .5) * t, t * 1.1, .55); });
    g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(fog, 0, 0); g.setTransform(Q, 0, 0, Q, 0, 0);
  }
  // места
  const labels = [];
  Object.entries(POIS).forEach(([id, p]) => {
    const st = placeState(id); const cx = (p.x + .5) * t, cy = (p.y + .5) * t;
    const known = !seen || seen.has(p.x + "," + p.y); const r = Math.max(8.5, t * .4);
    if (!known && !st.rumor) { g.fillStyle = "rgba(160,180,178,.35)"; g.font = `600 ${Math.round(r * 1.1)}px Cormorant, Georgia, serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", cx, cy); return; }
    if (st.here) { const gl = g.createRadialGradient(cx, cy, 0, cx, cy, r * 3.2); gl.addColorStop(0, "rgba(242,180,92,.45)"); gl.addColorStop(1, "rgba(242,180,92,0)"); g.fillStyle = gl; g.beginPath(); g.arc(cx, cy, r * 3.2, 0, 7); g.fill(); }
    if (p.kind === "tower" && known) { const gl = g.createRadialGradient(cx, cy - r, 0, cx, cy - r, r * 3); gl.addColorStop(0, "rgba(242,200,120,.35)"); gl.addColorStop(1, "rgba(242,200,120,0)"); g.fillStyle = gl; g.beginPath(); g.arc(cx, cy - r, r * 3, 0, 7); g.fill(); }
    g.beginPath(); g.arc(cx, cy + 1.5, r, 0, 7); g.fillStyle = "rgba(0,0,0,.4)"; g.fill();
    g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fillStyle = st.rumor && !known ? "rgba(16,26,30,.75)" : "#12201f"; g.fill();
    const ring = st.here ? "#f2b45c" : st.danger ? "#e8735a" : mapSel === id ? "#e9eee9" : st.visited ? "#c9b48a" : "#8fa5a2";
    g.lineWidth = st.here ? 2.2 : 1.4; g.strokeStyle = ring; if (st.rumor && !known) g.setLineDash([2.5, 2.5]); g.stroke(); g.setLineDash([]);
    poiIcon(g, p.kind, cx, cy, r * 1.05, st.here ? "#f2b45c" : "#e9eee9");
    const badge = (dx, dy, col, draw) => { const bx = cx + dx * r, by = cy + dy * r, br = Math.max(4.2, r * .42); g.beginPath(); g.arc(bx, by, br, 0, 7); g.fillStyle = col; g.fill(); g.strokeStyle = "#0b1417"; g.lineWidth = 1.2; g.stroke(); g.fillStyle = "#0b1417"; g.strokeStyle = "#0b1417"; draw(bx, by, br); };
    if (st.danger) badge(.8, -.8, "#e8735a", (x, y, b) => { g.lineWidth = 1.3; g.beginPath(); g.moveTo(x - b * .5, y - b * .5); g.lineTo(x + b * .5, y + b * .5); g.moveTo(x + b * .5, y - b * .5); g.lineTo(x - b * .5, y + b * .5); g.stroke(); });
    else if (st.cleared) badge(.8, -.8, "#7cc79c", (x, y, b) => { g.lineWidth = 1.4; g.beginPath(); g.moveTo(x - b * .5, y); g.lineTo(x - b * .1, y + b * .4); g.lineTo(x + b * .5, y - b * .4); g.stroke(); });
    if (st.clue || st.note) badge(-.85, -.8, "#f2b45c", (x, y, b) => { g.beginPath(); g.moveTo(x, y - b * .55); g.lineTo(x + b * .45, y); g.lineTo(x, y + b * .55); g.lineTo(x - b * .45, y); g.closePath(); g.fill(); });
    if (known || st.rumor) labels.push([p.name.replace(/[«»"]/g, ""), cx, cy + r + 4, st]);
  });
  const fs = clamp(t * .52, 10.5, 18);
  g.font = `600 ${fs}px Cormorant, Georgia, serif`; g.textBaseline = "top"; g.lineJoin = "round";
  labels.forEach(([txt, x, y, st]) => {
    let s = txt; const max = t * 5.2; while (g.measureText(s).width > max && s.length > 6) s = s.slice(0, -2); if (s !== txt) s = s.trim() + "…";
    const w = g.measureText(s).width; const lx = clamp(x, w / 2 + 4, width - w / 2 - 4); const ly = Math.min(y, H - fs - 4);
    g.textAlign = "center"; g.strokeStyle = "rgba(8,14,16,.85)"; g.lineWidth = 3.5; g.strokeText(s, lx, ly);
    g.fillStyle = st.here ? "#f6cf8e" : st.rumor && !st.visited && seen && !seen.has("") ? "rgba(233,238,233,.75)" : "#e9eee9"; g.fillText(s, lx, ly);
  });
  // роза ветров и рамка
  const R = clamp(t * .9, 12, 26), rx = width - R - 10, ry = R + 10;
  g.save(); g.translate(rx, ry); g.globalAlpha = .8;
  g.beginPath(); g.arc(0, 0, R * .62, 0, 7); g.strokeStyle = "rgba(233,238,233,.45)"; g.lineWidth = .8; g.stroke();
  for (let i = 0; i < 4; i++) { g.rotate(Math.PI / 2); g.beginPath(); g.moveTo(0, -R); g.lineTo(R * .16, 0); g.lineTo(-R * .16, 0); g.closePath(); g.fillStyle = i === 3 ? "#f2b45c" : "rgba(233,238,233,.7)"; g.fill(); }
  g.rotate(Math.PI / 2); g.globalAlpha = 1; g.font = `700 ${Math.round(R * .5)}px Cormorant, Georgia, serif`; g.textAlign = "center"; g.textBaseline = "bottom"; g.fillStyle = "#f2b45c"; g.fillText("С", 0, -R - 1);
  g.restore();
  g.strokeStyle = "rgba(201,180,138,.38)"; g.lineWidth = 1; g.strokeRect(4.5, 4.5, width - 9, H - 9); g.strokeStyle = "rgba(201,180,138,.18)"; g.strokeRect(8.5, 8.5, width - 17, H - 17);
  if (o.title) { g.font = `600 ${clamp(t * .8, 14, 30)}px Cormorant, Georgia, serif`; g.textAlign = "left"; g.textBaseline = "bottom"; const tw = g.measureText(o.title).width; g.fillStyle = "rgba(11,20,23,.78)"; g.fillRect(14, H - 22 - t * .8, tw + 20, t * .8 + 10); g.strokeStyle = "rgba(201,180,138,.5)"; g.strokeRect(14.5, H - 22 - t * .8 + .5, tw + 19, t * .8 + 9); g.fillStyle = "#e9eee9"; g.fillText(o.title, 24, H - 17); }
}
function drawMap() { const cv = document.getElementById("map"); if (!cv || !S) return; paintMap(cv, { width: cv.parentElement.clientWidth || 320, fog: true }); }
function hitPlace(ev) {
  const cv = ev.currentTarget; const r = cv.getBoundingClientRect(); const t = r.width / MAP_W; const x = (ev.clientX - r.left) / t, y = (ev.clientY - r.top) / t;
  let best = null, bd = 1.4; Object.entries(POIS).forEach(([id, p]) => { const d = Math.hypot(p.x + .5 - x, p.y + .5 - y); if (d < bd) { bd = d; best = id; } }); return best;
}
function mapClick(ev) { mapSel = hitPlace(ev); renderWorld(); }
function placeInfoHTML(id) {
  const p = POIS[id]; const st = placeState(id); const seen = new Set(S.world.seen); const known = seen.has(p.x + "," + p.y) || st.visited;
  if (!known && !st.rumor) return { name: "Неизведанное место", text: "Туман скрывает, что здесь. Можно дойти и узнать." };
  const bits = []; if (st.visited && p.npcs.length) bits.push("Здесь: " + p.npcs.filter(n => NPCS[n]).map(n => NPCS[n].name).join(", "));
  if (st.danger) bits.push("Опасно: здесь враги"); if (st.cleared) bits.push("Враги здесь повержены"); if (st.clue) bits.push("Здесь найдены улики");
  if (st.note) bits.push("Пометка: " + st.note); if (st.rumor && !st.visited) bits.push("Известно по слухам");
  return { name: p.name, text: (st.visited ? p.short : p.short) + (bits.length ? " · " + bits.join(" · ") : "") };
}
function openBigMap() {
  if (!S) return;
  modal(`<div class="bigmap"><div class="bigmap-head"><h2>${esc(WD.name)}</h2><button class="btn small" type="button" id="bm-close">Закрыть</button></div><div class="mapwrap"><canvas id="bigmap" aria-label="Большая карта"></canvas></div><div class="bigmap-foot" id="bm-info"><span class="home-note">Нажмите на место, чтобы узнать о нём или отправиться туда.</span></div>
    <div class="legend"><span><i style="border-color:#f2b45c"></i>вы здесь</span><span><i style="border-color:#c9b48a"></i>посещено</span><span><i style="background:#e8735a"></i>опасно</span><span><i style="background:#7cc79c"></i>зачищено</span><span><i style="background:#f2b45c;border-radius:2px;transform:rotate(45deg)"></i>улики и пометки</span><span><i style="border-style:dashed"></i>слухи</span></div></div>`, root => {
    root.querySelector(".modal").classList.add("wide");
    const cv = root.querySelector("#bigmap"); const draw = () => paintMap(cv, { width: cv.parentElement.clientWidth, fog: true, title: WD.name });
    requestAnimationFrame(draw);
    root.querySelector("#bm-close").onclick = () => { closeModal(); renderWorld(); };
    cv.onclick = ev => { const id = hitPlace(ev); mapSel = id; draw(); const info = root.querySelector("#bm-info");
      if (!id) { info.innerHTML = `<span class="home-note">Здесь ничего не отмечено.</span>`; return; }
      const pi = placeInfoHTML(id); const canGo = id !== S.world.loc && !busy && !S.world.combat;
      info.innerHTML = `<div style="flex:1;min-width:0"><b style="font-family:var(--display);font-size:24px;display:block;line-height:1.1">${esc(pi.name)}</b><span class="home-note" style="color:var(--mist)">${esc(pi.text)}</span></div>${id === S.world.loc ? '<span class="pill mode">Вы здесь</span>' : `<button class="btn primary" type="button" id="bm-go" ${canGo ? "" : "disabled"}>Идти</button>`}`;
      info.querySelector("#bm-go")?.addEventListener("click", () => { closeModal(); mapSel = null; takeTurn(`Иду: ${POIS[id].name}`, { checks: [], move_to: id }); }); };
  });
}
