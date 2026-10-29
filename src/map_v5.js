function reveal(cx, cy, r) { const seen = new Set(S.world.seen); for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) seen.add(x + "," + y); S.world.seen = [...seen]; }
let mapSel = null;
/* =========================================================================
   MAP v5 — иллюстрированная карта в духе Wonderdraft/Inkarnate.
   Холст: рельеф, береговая рябь, лес и горы с обводкой, дороги, туман.
   Поверх — DOM-слой меток (медальоны, подписи, значки сюжета), зум и панорама.
   ========================================================================= */
const MAP_PAL = {
  coast: { deep: [44, 86, 104], shallow: [92, 142, 150], paper: [198, 182, 140], grass: [148, 146, 96], grass2: [126, 132, 84], forest: [86, 104, 62], rock: [170, 156, 124], snow: [236, 232, 222], marsh: [112, 122, 84], sand: [216, 196, 146], ink: [46, 36, 24] },
  marsh: { deep: [52, 80, 78], shallow: [96, 128, 116], paper: [186, 176, 136], grass: [134, 138, 90], grass2: [116, 124, 78], forest: [80, 98, 58], rock: [160, 150, 120], snow: [230, 228, 218], marsh: [102, 116, 78], sand: [200, 186, 140], ink: [42, 36, 24] },
  mountains: { deep: [46, 80, 104], shallow: [96, 138, 156], paper: [200, 188, 152], grass: [150, 150, 106], grass2: [130, 136, 94], forest: [82, 102, 70], rock: [176, 164, 136], snow: [244, 242, 236], marsh: [112, 122, 88], sand: [214, 198, 154], ink: [44, 36, 26] },
  forest: { deep: [44, 84, 96], shallow: [90, 138, 140], paper: [194, 180, 136], grass: [138, 142, 88], grass2: [116, 128, 74], forest: [72, 96, 54], rock: [164, 152, 120], snow: [234, 232, 222], marsh: [104, 118, 76], sand: [210, 192, 142], ink: [40, 34, 22] }
};
const SEA_NAMES = { coast: "Море", marsh: "Топь", mountains: "Озеро", forest: "Озеро" };
function makeNoise(seed) {
  const r = mulberry(seed); const N = 256; const g = new Float32Array(N * N); for (let i = 0; i < g.length; i++) g[i] = r();
  const v = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi; const i0 = (yi & 255) * N, i1 = ((yi + 1) & 255) * N, x0 = xi & 255, x1 = (xi + 1) & 255;
    const a = g[i0 + x0], b = g[i0 + x1], c = g[i1 + x0], d = g[i1 + x1]; const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
  return (x, y, o) => { let s = 0, amp = .5, f = 1, n = 0; for (let k = 0; k < (o || 4); k++) { s += v(x * f + k * 17.3, y * f - k * 9.1) * amp; n += amp; amp *= .5; f *= 2.03; } return s / n; };
}
function tileFields() {
  const n = MAP_W * MAP_H; const F = { w: new Float32Array(n), f: new Float32Array(n), r: new Float32Array(n), n: new Float32Array(n), m: new Float32Array(n), a: new Float32Array(n), road: new Uint8Array(n) };
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) { const t = tileAt(x, y), i = y * MAP_W + x;
    F.w[i] = t === "S" || t === "W" ? 1 : 0; F.f[i] = t === "f" ? 1 : 0; F.r[i] = t === "r" || t === "n" ? 1 : 0; F.n[i] = t === "n" ? 1 : 0; F.m[i] = t === "m" ? 1 : 0; F.a[i] = t === "a" ? 1 : 0; F.road[i] = ROAD.has(x + "," + y) ? 1 : 0; }
  F.pois = Object.values(POIS).map(p => [p.x + .5, p.y + .5]); return F;
}
function bil(arr, x, y, W, H) {
  W = W || MAP_W; H = H || MAP_H; x = clamp(x, 0, W - 1.001); y = clamp(y, 0, H - 1.001); const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
  const x1 = Math.min(W - 1, xi + 1), y1 = Math.min(H - 1, yi + 1); const a = arr[yi * W + xi], b = arr[yi * W + x1], c = arr[y1 * W + xi], d = arr[y1 * W + x1];
  return a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
}
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
function fieldAt(F, nz, u, v) {
  const wu = u - .5 + (nz(u * .5, v * .5, 3) - .5) * 1.3, wv = v - .5 + (nz(u * .5 + 40, v * .5 + 40, 3) - .5) * 1.3;
  let w = bil(F.w, wu, wv) + (nz(u * 2.4, v * 2.4, 4) - .5) * .42;
  const ti = clamp(Math.floor(v), 0, MAP_H - 1) * MAP_W + clamp(Math.floor(u), 0, MAP_W - 1); if (F.road[ti]) w -= .2;
  for (const p of F.pois) { const d = Math.hypot(u - p[0], v - p[1]); if (d < .8) w -= (.8 - d) * 1.2; }
  return { w, f: bil(F.f, wu, wv) + (nz(u * 1.7 + 7, v * 1.7, 3) - .5) * .55, r: bil(F.r, wu, wv) + (nz(u * 1.3, v * 1.3 + 9, 3) - .5) * .5, n: bil(F.n, wu, wv), m: bil(F.m, wu, wv), a: bil(F.a, wu, wv) };
}
function chamfer(src, W, H) {
  const d = new Float32Array(W * H); for (let i = 0; i < d.length; i++) d[i] = src[i] ? 0 : 1e6; const D = 1.4142;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; let v = d[i]; if (!v) continue;
    if (x > 0) v = Math.min(v, d[i - 1] + 1); if (y > 0) { v = Math.min(v, d[i - W] + 1); if (x > 0) v = Math.min(v, d[i - W - 1] + D); if (x < W - 1) v = Math.min(v, d[i - W + 1] + D); } d[i] = v; }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const i = y * W + x; let v = d[i]; if (!v) continue;
    if (x < W - 1) v = Math.min(v, d[i + 1] + 1); if (y < H - 1) { v = Math.min(v, d[i + W] + 1); if (x < W - 1) v = Math.min(v, d[i + W + 1] + D); if (x > 0) v = Math.min(v, d[i + W - 1] + D); } d[i] = v; }
  return d;
}
const mapCache = new Map();
function mapBase(width, Q) {
  const key = `${WD.id}|${Math.round(width)}|${Q}`; if (mapCache.has(key)) return mapCache.get(key);
  const W = Math.round(width * Q), H = Math.round(width * Q * MAP_H / MAP_W); const t = width / MAP_W; const px1 = W / 760; // масштаб линий
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const g = cv.getContext("2d");
  const nz = makeNoise(hash(WD.id)); const F = tileFields(); const P = MAP_PAL[WD.biome] || MAP_PAL.coast;
  // 1. поля на сетке пониже, затем — на пиксели
  const FW = Math.min(W, 640), FH = Math.round(FW * MAP_H / MAP_W); const fw = new Float32Array(FW * FH), ff = new Float32Array(FW * FH), fr = new Float32Array(FW * FH), fn = new Float32Array(FW * FH), fm = new Float32Array(FW * FH), fa = new Float32Array(FW * FH), fe = new Float32Array(FW * FH);
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const u = (x + .5) / FW * MAP_W, v = (y + .5) / FH * MAP_H; const d = fieldAt(F, nz, u, v); const i = y * FW + x;
    fw[i] = d.w; ff[i] = d.f; fr[i] = d.r; fn[i] = d.n; fm[i] = d.m; fa[i] = d.a; fe[i] = nz(u * 1.6 + 3, v * 1.6 - 5, 4); }
  const land = new Uint8Array(W * H), water = new Uint8Array(W * H); const sx = FW / W, sy = FH / H;
  const WV = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; const w = bil(fw, x * sx - .5, y * sy - .5, FW, FH); WV[i] = w; if (w > .5) water[i] = 1; else land[i] = 1; }
  const dW = chamfer(land, W, H), dL = chamfer(water, W, H); // dW — до суши (для воды), dL — до воды (для суши)
  // 2. пиксели
  const grain = makeNoise(hash(WD.id + "grain")); const img = g.createImageData(W, H); const D = img.data;
  const ripples = [3.2, 7.5, 13, 20, 29].map(r => r * px1);
  let seaX = 0, seaY = 0, seaN = 0, landX = 0, landY = 0, landN = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; const fx = x * sx - .5, fy = y * sy - .5; const gr = grain(x / (6 * px1), y / (6 * px1), 2), gr2 = grain(x / (40 * px1), y / (40 * px1), 3);
    let c;
    if (water[i]) {
      const dw = dW[i]; seaX += x; seaY += y; seaN++;
      const depth = smooth(0, 90 * px1, dw); c = [mix(P.shallow[0], P.deep[0], depth), mix(P.shallow[1], P.deep[1], depth), mix(P.shallow[2], P.deep[2], depth)];
      const wash = 1 - smooth(0, 14 * px1, dw); c = c.map((v, k) => mix(v, P.shallow[k] + 26, wash * .55));
      for (let k = 0; k < ripples.length; k++) { const dd = Math.abs(dw - ripples[k]); const lw = (.9 + k * .15) * px1; if (dd < lw) { const a = (1 - dd / lw) * (.42 - k * .07); c = c.map((v, j) => mix(v, P.ink[j] + 30, a)); } }
      if (dw < 1.6 * px1) c = c.map((v, j) => mix(v, P.ink[j], .85));
      c = c.map(v => v + (gr - .5) * 10 + (gr2 - .5) * 14);
    } else {
      const dl = dL[i]; landX += x; landY += y; landN++;
      const f = bil(ff, fx, fy, FW, FH), r = bil(fr, fx, fy, FW, FH), n = bil(fn, fx, fy, FW, FH), m = bil(fm, fx, fy, FW, FH), a = bil(fa, fx, fy, FW, FH), e = bil(fe, fx, fy, FW, FH);
      c = [mix(P.grass[0], P.grass2[0], gr2), mix(P.grass[1], P.grass2[1], gr2), mix(P.grass[2], P.grass2[2], gr2)];
      c = c.map((v, k) => mix(v, P.paper[k], .28 + (e - .5) * .3));
      const ft = smooth(.42, .78, f); c = c.map((v, k) => mix(v, P.forest[k], ft * .75));
      const mt = smooth(.4, .75, m); if (mt > 0) { c = c.map((v, k) => mix(v, P.marsh[k], mt * .85)); if (gr > .66 && mt > .5) c = c.map((v, k) => mix(v, P.shallow[k], .55)); }
      const rt = smooth(.42, .85, r); c = c.map((v, k) => mix(v, P.rock[k], rt * .8));
      const st = smooth(.5, .85, n); c = c.map((v, k) => mix(v, P.snow[k], st * .9));
      const beach = Math.max(1 - smooth(1.5 * px1, 7 * px1, dl), smooth(.4, .8, a) * .7); c = c.map((v, k) => mix(v, P.sand[k], beach * .85));
      const hs = (bil(fe, fx + 1.2, fy, FW, FH) - bil(fe, fx - 1.2, fy, FW, FH)) * 160 * (.35 + rt); c = c.map(v => v + hs);
      if (dl < 2.4 * px1) c = c.map((v, k) => mix(v, P.ink[k], (1 - dl / (2.4 * px1)) * .9));
      c = c.map(v => v + (gr - .5) * 14);
    }
    const vx = x / W - .5, vy = y / H - .5; const vig = 1 - Math.pow(vx * vx + vy * vy, 1.3) * 1.1; const o = i * 4;
    D[o] = clamp(c[0] * vig, 0, 255); D[o + 1] = clamp(c[1] * vig, 0, 255); D[o + 2] = clamp(c[2] * vig - (1 - vig) * 8, 0, 255); D[o + 3] = 255;
  }
  g.putImageData(img, 0, 0); g.setTransform(Q, 0, 0, Q, 0, 0);
  const isWater = (X, Y) => { const xi = clamp(Math.round(X * Q), 0, W - 1), yi = clamp(Math.round(Y * Q), 0, H - 1); return water[yi * W + xi]; };
  const distLand = (X, Y) => { const xi = clamp(Math.round(X * Q), 0, W - 1), yi = clamp(Math.round(Y * Q), 0, H - 1); return dL[yi * W + xi] / Q; };
  const at = (X, Y) => { const fx = X * Q * sx - .5, fy = Y * Q * sy - .5; return { f: bil(ff, fx, fy, FW, FH), r: bil(fr, fx, fy, FW, FH), n: bil(fn, fx, fy, FW, FH), m: bil(fm, fx, fy, FW, FH) }; };
  const rr = mulberry(hash(WD.id + "glyph")); const k = clamp(t / 19, .8, 1.7); const Hc = width * MAP_H / MAP_W;
  const nearPoi = (X, Y, rad) => F.pois.some(([px, py]) => Math.hypot(px * t - X, py * t - Y) < rad);
  const items = [];
  // горы
  const ms = 16 * k;
  for (let y = 0; y < Hc + ms; y += ms * .62) for (let x = 0; x < width + ms; x += ms * .9) {
    const X = x + (rr() - .5) * ms * .7, Y = y + (rr() - .5) * ms * .5; if (isWater(X, Y) || distLand(X, Y) < 5 * k) continue; const a = at(X, Y);
    if (a.r > .62 && !nearPoi(X, Y, t * .75)) items.push({ type: "m", X, Y, s: (7 + rr() * 6 + (a.r - .6) * 8) * k, snow: a.n > .35 || (a.r > .9 && rr() > .5), q: rr() });
    else if (a.r > .45 && rr() > .6 && !nearPoi(X, Y, t * .6)) items.push({ type: "h", X, Y, s: (5 + rr() * 3) * k, q: rr() });
  }
  // лес
  const conifer = WD.biome === "mountains" || WD.biome === "coast";
  const ts = 6.2 * k;
  for (let y = 0; y < Hc + ts; y += ts * .62) for (let x = 0; x < width + ts; x += ts * .82) {
    const X = x + (rr() - .5) * ts * .9, Y = y + (rr() - .5) * ts * .7; if (isWater(X, Y) || distLand(X, Y) < 3.5 * k || nearPoi(X, Y, t * .62)) continue; const a = at(X, Y);
    if (a.f > .55 && a.r < .62) items.push({ type: (conifer && rr() > .25) || a.r > .4 ? "c" : "t", X, Y, s: (3.4 + rr() * 2 + (a.f - .5) * 2) * k, q: rr() });
    else if (a.f > .32 && rr() > .9) items.push({ type: "t", X, Y, s: (3 + rr()) * k, q: rr() });
    else if (a.m > .55 && rr() > .55) items.push({ type: "reed", X, Y, s: (2.6 + rr()) * k, q: rr() });
  }
  // дома
  const hr = mulberry(hash(WD.id + "h"));
  (WD.houses || []).forEach(([hx, hy]) => { for (let j = 0; j < 3; j++) { const X = (hx + .2 + hr() * .6) * t, Y = (hy + .25 + hr() * .55) * t; if (!isWater(X, Y) && !nearPoi(X, Y, t * .5)) items.push({ type: "house", X, Y, s: (2.6 + hr() * 1.2) * k, q: hr() }); } });
  items.sort((a, b) => a.Y - b.Y);
  const ink = `rgb(${P.ink.join(",")})`; g.lineJoin = "round"; g.lineCap = "round";
  for (const it of items) {
    const { X, Y, s, q } = it;
    if (it.type === "m") {
      const lean = (q - .5) * .4 * s;
      g.fillStyle = "rgba(40,30,18,.22)"; g.beginPath(); g.ellipse(X + s * .4, Y + s * .5, s * 1.25, s * .28, 0, 0, 7); g.fill();
      g.beginPath(); g.moveTo(X - s * 1.1, Y + s * .5); g.lineTo(X + lean, Y - s); g.lineTo(X + s * 1.1, Y + s * .5); g.closePath(); g.fillStyle = "#d9caa4"; g.fill();
      g.beginPath(); g.moveTo(X + lean, Y - s); g.lineTo(X + s * 1.1, Y + s * .5); g.lineTo(X + lean * .3 + s * .1, Y + s * .5); g.closePath(); g.fillStyle = "#9d8b68"; g.fill();
      g.strokeStyle = "rgba(60,46,28,.55)"; g.lineWidth = .7; g.beginPath(); for (let j = 1; j <= 3; j++) { const tt = j / 4; g.moveTo(X + lean + (s * 1.1 - lean) * tt, Y - s + s * 1.5 * tt); g.lineTo(X + lean * .5 + s * .2 + (s * .9) * tt * .4, Y + s * .5); } g.stroke();
      if (it.snow) { g.beginPath(); g.moveTo(X + lean - s * .38, Y - s * .45); g.lineTo(X + lean, Y - s); g.lineTo(X + lean + s * .4, Y - s * .42); g.lineTo(X + lean + s * .12, Y - s * .55); g.lineTo(X + lean - s * .1, Y - s * .38); g.closePath(); g.fillStyle = "#f6f3ea"; g.fill(); }
      g.beginPath(); g.moveTo(X - s * 1.1, Y + s * .5); g.lineTo(X + lean, Y - s); g.lineTo(X + s * 1.1, Y + s * .5); g.strokeStyle = ink; g.lineWidth = 1.05; g.stroke();
    } else if (it.type === "h") {
      g.beginPath(); g.moveTo(X - s, Y + s * .3); g.quadraticCurveTo(X, Y - s * .9, X + s, Y + s * .3); g.fillStyle = "rgba(170,150,104,.55)"; g.fill(); g.strokeStyle = "rgba(60,46,28,.75)"; g.lineWidth = .9; g.stroke();
      g.beginPath(); g.moveTo(X + s * .15, Y - s * .3); g.quadraticCurveTo(X + s * .6, Y - s * .1, X + s * .75, Y + s * .2); g.strokeStyle = "rgba(60,46,28,.4)"; g.lineWidth = .6; g.stroke();
    } else if (it.type === "t") {
      const base = [74 + q * 18, 98 + q * 16, 54 + q * 10];
      g.fillStyle = "rgba(30,24,14,.28)"; g.beginPath(); g.ellipse(X + s * .5, Y + s * 1.05, s * 1.05, s * .35, 0, 0, 7); g.fill();
      g.strokeStyle = ink; g.lineWidth = .8; g.beginPath(); g.moveTo(X, Y + s * .6); g.lineTo(X, Y + s * 1.2); g.stroke();
      g.beginPath(); g.arc(X, Y - s * .05, s, 0, 7); g.fillStyle = `rgb(${base.join(",")})`; g.fill(); g.lineWidth = .85; g.stroke();
      g.beginPath(); g.arc(X - s * .32, Y - s * .38, s * .45, 0, 7); g.fillStyle = `rgba(${base[0] + 46},${base[1] + 40},${base[2] + 22},.85)`; g.fill();
    } else if (it.type === "c") {
      const base = [58 + q * 14, 84 + q * 14, 52 + q * 8];
      g.fillStyle = "rgba(30,24,14,.28)"; g.beginPath(); g.ellipse(X + s * .45, Y + s * 1.15, s * .9, s * .3, 0, 0, 7); g.fill();
      g.beginPath(); g.moveTo(X, Y - s * 1.7); g.lineTo(X + s * .85, Y + s * 1.05); g.lineTo(X - s * .85, Y + s * 1.05); g.closePath(); g.fillStyle = `rgb(${base.join(",")})`; g.fill();
      g.beginPath(); g.moveTo(X, Y - s * 1.7); g.lineTo(X, Y + s * 1.05); g.lineTo(X - s * .85, Y + s * 1.05); g.closePath(); g.fillStyle = `rgba(${base[0] + 40},${base[1] + 38},${base[2] + 20},.9)`; g.fill();
      g.beginPath(); g.moveTo(X, Y - s * 1.7); g.lineTo(X + s * .85, Y + s * 1.05); g.lineTo(X - s * .85, Y + s * 1.05); g.closePath(); g.strokeStyle = ink; g.lineWidth = .8; g.stroke();
    } else if (it.type === "reed") {
      g.strokeStyle = "rgba(60,58,30,.8)"; g.lineWidth = .7; g.beginPath(); g.moveTo(X - s * .6, Y + s); g.quadraticCurveTo(X - s * .7, Y, X - s * .9, Y - s * .6); g.moveTo(X, Y + s); g.lineTo(X, Y - s); g.moveTo(X + s * .6, Y + s); g.quadraticCurveTo(X + s * .7, Y, X + s, Y - s * .4); g.stroke();
      g.fillStyle = "rgba(70,90,96,.5)"; g.beginPath(); g.ellipse(X, Y + s * 1.15, s * 1.2, s * .3, 0, 0, 7); g.fill();
    } else if (it.type === "house") {
      g.fillStyle = "rgba(30,24,14,.3)"; g.fillRect(X - s + 1, Y - s * .1 + 1.2, s * 2, s * 1.2);
      g.fillStyle = "#e6d6b0"; g.fillRect(X - s, Y - s * .2, s * 2, s * 1.2); g.strokeStyle = ink; g.lineWidth = .7; g.strokeRect(X - s, Y - s * .2, s * 2, s * 1.2);
      g.beginPath(); g.moveTo(X - s * 1.25, Y - s * .1); g.lineTo(X, Y - s * 1.3); g.lineTo(X + s * 1.25, Y - s * .1); g.closePath(); g.fillStyle = q > .5 ? "#9c4a32" : "#7d5a3a"; g.fill(); g.stroke();
    }
  }
  // точечная фактура бумаги
  g.setTransform(1, 0, 0, 1, 0, 0); const sp = mulberry(hash(WD.id + "sp")); g.fillStyle = "rgba(60,40,20,.08)";
  for (let j = 0; j < W * H / 900; j++) { g.fillRect(sp() * W, sp() * H, 1 + sp() * 1.5, 1 + sp() * 1.5); }
  const out = { cv, t, water, W, H, Q, sea: seaN > W * H * .06 ? [seaX / seaN / Q / t, seaY / seaN / Q / t] : null, land: landN ? [landX / landN / Q / t, landY / landN / Q / t] : null };
  if (out.sea) { // точка моря подальше от берега
    let best = null, bd = -1; for (let j = 0; j < 400; j++) { const X = Math.floor(sp() * W), Y = Math.floor(sp() * H); const i = Y * W + X; if (water[i] && dW[i] > bd && X > W * .08 && X < W * .85 && Y > H * .08 && Y < H * .92) { bd = dW[i]; best = [X / Q / t, Y / Q / t]; } }
    if (best && bd > 30 * px1) out.sea = best; else out.sea = null;
  }
  mapCache.set(key, out); if (mapCache.size > 8) mapCache.delete(mapCache.keys().next().value);
  return out;
}
function roadPaths(t) {
  const start = POIS[WD.start] || Object.values(POIS)[0]; const s0 = [start.x, start.y]; const out = {};
  Object.entries(POIS).forEach(([id, p]) => {
    if (id === WD.start) return; const prev = new Map(); const q = [s0]; prev.set(s0.join(","), null); let found = false;
    while (q.length) { const [x, y] = q.shift(); if (x === p.x && y === p.y) { found = true; break; }
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + a, ny = y + b, k = nx + "," + ny; if (prev.has(k) || !(ROAD.has(k) || (nx === p.x && ny === p.y))) continue; prev.set(k, x + "," + y); q.push([nx, ny]); } }
    if (!found) return; const pts = []; let k = p.x + "," + p.y; while (k) { const [x, y] = k.split(",").map(Number); pts.unshift([x, y]); k = prev.get(k); }
    let P2 = pts.map(([x, y], i) => { const c = [(x + .5) * t, (y + .5) * t]; if (i === 0 || i === pts.length - 1) return c; const h = hash(WD.id + x + "," + y); return [c[0] + ((h % 1000) / 1000 - .5) * t * .4, c[1] + (((h >> 10) % 1000) / 1000 - .5) * t * .4]; });
    for (let it = 0; it < 3; it++) { const n = [P2[0]]; for (let i = 0; i < P2.length - 1; i++) { const [ax, ay] = P2[i], [bx, by] = P2[i + 1]; n.push([ax * .75 + bx * .25, ay * .75 + by * .25], [ax * .25 + bx * .75, ay * .25 + by * .75]); } n.push(P2[P2.length - 1]); P2 = n; }
    out[id] = P2;
  });
  return out;
}
function placeState(id) {
  if (!S) return {};
  const p = POIS[id]; const vis = S.world.visited.includes(id); const foes = (p.enemies || []).filter(e => S.world.enemies[e]); const alive = foes.filter(e => S.world.enemies[e].alive).length;
  return { visited: vis, here: S.world.loc === id, danger: vis && alive > 0, cleared: vis && foes.length > 0 && alive === 0, clue: !!S.world.flags["clue_" + id], note: S.world.notes?.[id] || "", rumor: !!S.world.rumors?.includes(id) };
}
/* холст: рельеф + дороги + туман */
function paintMap(cv, opts) {
  const o = opts || {}; const width = Math.max(200, o.width); const t = width / MAP_W; const H = t * MAP_H;
  const Q = Math.min(o.hires ? 2.4 : 2, Math.max(1, window.devicePixelRatio || 1) * (o.hires ? 1.25 : 1), 2400 / width);
  cv.width = Math.round(width * Q); cv.height = Math.round(H * Q); cv.style.height = H + "px";
  const g = cv.getContext("2d"); const base = mapBase(width, Q);
  g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(base.cv, 0, 0); g.setTransform(Q, 0, 0, Q, 0, 0);
  const k = clamp(t / 19, .8, 1.7); const seen = o.fog && S ? new Set(S.world.seen) : null;
  const paths = roadPaths(t);
  Object.entries(paths).forEach(([id, pts]) => {
    const st = placeState(id); const lit = !S || !o.fog || st.visited;
    const line = () => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); };
    line(); g.strokeStyle = "rgba(236,222,186,.55)"; g.lineWidth = 3.4 * k; g.lineCap = "round"; g.lineJoin = "round"; g.setLineDash([]); g.stroke();
    line(); g.strokeStyle = lit ? "rgba(92,62,34,.95)" : "rgba(92,62,34,.55)"; g.lineWidth = 1.5 * k; g.setLineDash([4.5 * k, 3 * k]); g.stroke(); g.setLineDash([]);
  });
  if (seen) {
    const FW = 160, FH = Math.round(FW * MAP_H / MAP_W); const fc = document.createElement("canvas"); fc.width = FW; fc.height = FH; const f = fc.getContext("2d"); const fd = f.createImageData(FW, FH);
    const S1 = new Float32Array(MAP_W * MAP_H); seen.forEach(key => { const [x, y] = key.split(",").map(Number); if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) S1[y * MAP_W + x] = 1; });
    (S.world.rumors || []).forEach(id => { const p = POIS[id]; if (p) S1[p.y * MAP_W + p.x] = Math.max(S1[p.y * MAP_W + p.x], .62); });
    const nz = makeNoise(hash(WD.id + "fog"));
    for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
      const u = (x + .5) / FW * MAP_W, v = (y + .5) / FH * MAP_H; const n = nz(u * .9, v * .9, 4);
      const sv = bil(S1, u - .5 + (n - .5) * .9, v - .5 + (nz(u * .9 + 30, v * .9, 3) - .5) * .9) + (n - .5) * .35;
      const a = 1 - smooth(.18, .62, sv); const tone = nz(u * 2.2, v * 2.2, 3); const o4 = (y * FW + x) * 4;
      fd.data[o4] = 14 + tone * 16; fd.data[o4 + 1] = 22 + tone * 18; fd.data[o4 + 2] = 28 + tone * 20; fd.data[o4 + 3] = a * 248;
    }
    f.putImageData(fd, 0, 0); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = "high"; g.drawImage(fc, 0, 0, width, H);
  }
  g.strokeStyle = "rgba(46,36,24,.55)"; g.lineWidth = 1.4; g.strokeRect(5, 5, width - 10, H - 10); g.strokeStyle = "rgba(46,36,24,.3)"; g.lineWidth = .8; g.strokeRect(9, 9, width - 18, H - 18);
  return base;
}
const MK_ICON = {
  inn: '<path d="M4 20V10l8-6 8 6v10"/><path d="M9 20v-6h6v6"/><path d="M7 9h10"/>', house: '<path d="M4 20V10l8-6 8 6v10"/><path d="M10 20v-5h4v5"/>', hut: '<path d="M3 20 12 5l9 15"/><path d="M10 20v-4h4v4"/>',
  chapel: '<path d="M12 3v6M9 6h6"/><path d="M6 21V13l6-4 6 4v8"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>', shrine: '<path d="M5 9h14M7 9v11M17 9v11M4 20h16"/><path d="M3 9l9-5 9 5"/>',
  tower: '<path d="M8 21 9 9h6l1 12"/><path d="M7 9V5h2v2h2V5h2v2h2V5h2v4z"/><path d="M12 13v2"/>', cave: '<path d="M2 20c2-9 6-14 10-14s8 5 10 14z"/><path d="M8 20c1-4 2.5-6 4-6s3 2 4 6"/>',
  ruin: '<path d="M5 21V8M10 21V11M15 21v-6M19 21V9"/><path d="M4 7h7M14 8h6M3 21h18"/>', gate: '<path d="M4 21V7h16v14"/><path d="M8 21v-6a4 4 0 0 1 8 0v6"/><path d="M4 7l2-3h12l2 3"/>',
  camp: '<path d="M3 20 12 5l9 15z"/><path d="M12 5v15M9 20l3-6 3 6"/>', mine: '<path d="M14 4c4 0 6 2 7 5"/><path d="M4 20 15 9"/><path d="M11 5l8 8"/>', farm: '<path d="M7 21V9M12 21V6M17 21V9"/><path d="M7 11 4 8M7 11l3-3M12 9 9 6M12 9l3-3M17 11l-3-3M17 11l3-3"/>',
  pier: '<path d="M12 4v15"/><circle cx="12" cy="5" r="1.6"/><path d="M8 9h8"/><path d="M5 14c0 4 3 6 7 6s7-2 7-6"/>', wreck: '<path d="M3 15h18l-3 4H6z"/><path d="M11 15V5l-5 9M13 7l5 6"/>',
  grove: '<path d="M12 3 6 13h3l-3 5h12l-3-5h3z"/><path d="M12 18v3"/>', bridge: '<path d="M2 17c4-7 16-7 20 0"/><path d="M2 12h20M6 12v5M18 12v5"/>', well: '<path d="M6 11h12v9H6z"/><path d="M4 7h16M7 7v4M17 7v4M12 4v3"/>'
};
function mkIcon(kind) { return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MK_ICON[kind] || '<circle cx="12" cy="12" r="4"/>'}</svg>`; }
function mapMarkup(id, cls) { return `<div class="map ${cls || ""}" id="${id}"><canvas aria-hidden="true"></canvas><div class="mk-layer"></div></div>`; }
/* Отрисовать карту в контейнер: холст + слой меток */
function renderMap(box, o) {
  if (!box) return; const cv = box.querySelector("canvas"); const width = o.width || box.clientWidth || 320;
  const base = paintMap(cv, { width, fog: o.fog, hires: o.hires }); const layer = box.querySelector(".mk-layer"); layer.innerHTML = "";
  const seen = o.fog && S ? new Set(S.world.seen) : null; const pos = (x, y) => `left:${(x / MAP_W * 100).toFixed(3)}%;top:${(y / MAP_H * 100).toFixed(3)}%`;
  if (base.sea && o.labels !== false) { const s = document.createElement("div"); s.className = "map-sea"; s.style.cssText = pos(base.sea[0], base.sea[1]); s.textContent = (WD.labels && WD.labels[0]?.t) || SEA_NAMES[WD.biome] || "Море"; if (!seen || seen.has(Math.floor(base.sea[0]) + "," + Math.floor(base.sea[1]))) layer.append(s); }
  if (o.region && base.land) { const r = document.createElement("div"); r.className = "map-region"; r.style.cssText = pos(base.land[0], Math.max(1.4, base.land[1] - 2.2)); r.textContent = WD.name; layer.append(r); }
  if (o.markers === false) return;
  Object.entries(POIS).forEach(([id, p]) => {
    const st = placeState(id); const known = !seen || seen.has(p.x + "," + p.y) || st.visited; const b = document.createElement(o.pick ? "button" : "div");
    if (o.pick) { b.type = "button"; b.onclick = e => { e.stopPropagation(); o.pick(id); }; }
    b.style.cssText = pos(p.x + .5, p.y + .5);
    if (!known && !st.rumor) { b.className = "mk unknown"; b.innerHTML = `<span class="mk-q">?</span>`; b.setAttribute("aria-label", "Неизведанное место"); layer.append(b); return; }
    b.className = ["mk", st.here && "here", st.visited && "visited", st.danger && "danger", st.cleared && "cleared", st.rumor && !known && "rumor", mapSel === id && "sel"].filter(Boolean).join(" ");
    b.setAttribute("aria-label", p.name + (st.here ? ", вы здесь" : ""));
    const badges = (st.danger ? `<i class="mk-b danger" title="Опасно">✕</i>` : st.cleared ? `<i class="mk-b ok" title="Зачищено">✓</i>` : "") + (st.clue || st.note ? `<i class="mk-b clue" title="${esc(st.note || "Найдены улики")}"></i>` : "");
    b.innerHTML = `<span class="mk-pin">${mkIcon(p.kind)}${badges}</span>${o.labels === false ? "" : `<span class="mk-label">${esc(p.name.replace(/[«»"]/g, ""))}</span>`}`;
    layer.append(b);
  });
}
function drawMap() { const box = document.getElementById("mapbox"); if (!box || !S) return; renderMap(box, { fog: true, pick: id => { mapSel = mapSel === id ? null : id; renderWorld(); } }); }
function mapClick() {}
function placeInfoHTML(id) {
  const p = POIS[id]; const st = placeState(id); const seen = new Set(S.world.seen); const known = seen.has(p.x + "," + p.y) || st.visited;
  if (!known && !st.rumor) return { name: "Неизведанное место", text: "Туман скрывает, что здесь. Можно дойти и узнать." };
  const bits = []; if (st.visited && p.npcs.length) bits.push("Здесь: " + p.npcs.filter(n => NPCS[n]).map(n => NPCS[n].name).join(", "));
  if (st.danger) bits.push("Опасно: здесь враги"); if (st.cleared) bits.push("Враги повержены"); if (st.clue) bits.push("Найдены улики");
  if (st.note) bits.push("Пометка: " + st.note); if (st.rumor && !st.visited) bits.push("Известно по слухам");
  return { name: p.name, text: p.short + (bits.length ? " · " + bits.join(" · ") : "") };
}
/* большая карта: зум колесом/кнопками, перетаскивание */
function openBigMap() {
  if (!S) return;
  modal(`<div class="bigmap"><div class="bigmap-head"><div><div class="eyebrow">Карта мира</div><h2>${esc(WD.name)}</h2></div><div class="bm-tools"><button class="btn small" type="button" id="bm-out" aria-label="Отдалить">−</button><button class="btn small" type="button" id="bm-in" aria-label="Приблизить">+</button><button class="btn small" type="button" id="bm-fit">Вся карта</button><button class="btn small" type="button" id="bm-close">Закрыть</button></div></div>
    <div class="bm-view" id="bm-view"><div class="bm-stage" id="bm-stage">${mapMarkup("bigbox", "big")}</div></div>
    <div class="bigmap-foot" id="bm-info"><span class="home-note">Нажмите на метку, чтобы узнать о месте или отправиться туда. Колесо мыши и перетаскивание — масштаб и обзор.</span></div>
    <div class="legend"><span><i class="lg here"></i>вы здесь</span><span><i class="lg visited"></i>посещено</span><span><i class="lg danger">✕</i>опасно</span><span><i class="lg ok">✓</i>зачищено</span><span><i class="lg clue"></i>улики и пометки</span><span><i class="lg rumor"></i>слухи</span><span><i class="lg q">?</i>неизведано</span></div></div>`, root => {
    root.querySelector(".modal").classList.add("wide");
    const view = root.querySelector("#bm-view"), stage = root.querySelector("#bm-stage"), box = root.querySelector("#bigbox");
    let z = 1, tx = 0, ty = 0; const apply = () => { const vw = view.clientWidth, vh = view.clientHeight, sw = vw * z, sh = stage.clientHeight * z;
      tx = clamp(tx, Math.min(0, vw - sw), 0); ty = clamp(ty, Math.min(0, vh - sh), 0); stage.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`; box.style.setProperty("--z", z); };
    const zoomAt = (nz, cx, cy) => { nz = clamp(nz, 1, 3); tx = cx - (cx - tx) * nz / z; ty = cy - (cy - ty) * nz / z; z = nz; apply(); };
    const pick = id => { mapSel = id; draw(); const info = root.querySelector("#bm-info"); const pi = placeInfoHTML(id); const canGo = id !== S.world.loc && !busy && !S.world.combat;
      info.innerHTML = `<div style="flex:1;min-width:0"><b style="font-family:var(--display);font-size:26px;display:block;line-height:1.05">${esc(pi.name)}</b><span class="home-note" style="color:var(--mist)">${esc(pi.text)}</span></div>${id === S.world.loc ? '<span class="pill mode">Вы здесь</span>' : `<button class="btn primary" type="button" id="bm-go" ${canGo ? "" : "disabled"}>Идти сюда</button>`}`;
      info.querySelector("#bm-go")?.addEventListener("click", () => { closeModal(); mapSel = null; takeTurn(`Иду: ${POIS[id].name}`, { checks: [], move_to: id }); }); };
    const draw = () => renderMap(box, { width: view.clientWidth, fog: true, hires: true, region: true, pick });
    requestAnimationFrame(() => { draw(); apply(); });
    view.addEventListener("wheel", e => { e.preventDefault(); const r = view.getBoundingClientRect(); zoomAt(z * (e.deltaY < 0 ? 1.18 : 1 / 1.18), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    let drag = null; view.addEventListener("pointerdown", e => { if (e.target.closest(".mk")) return; drag = { x: e.clientX, y: e.clientY, tx, ty, moved: false }; view.setPointerCapture(e.pointerId); view.classList.add("grab"); });
    view.addEventListener("pointermove", e => { if (!drag) return; tx = drag.tx + e.clientX - drag.x; ty = drag.ty + e.clientY - drag.y; apply(); });
    const end = () => { drag = null; view.classList.remove("grab"); }; view.addEventListener("pointerup", end); view.addEventListener("pointercancel", end);
    root.querySelector("#bm-in").onclick = () => zoomAt(z * 1.35, view.clientWidth / 2, view.clientHeight / 2);
    root.querySelector("#bm-out").onclick = () => zoomAt(z / 1.35, view.clientWidth / 2, view.clientHeight / 2);
    root.querySelector("#bm-fit").onclick = () => { z = 1; tx = 0; ty = 0; apply(); };
    root.querySelector("#bm-close").onclick = () => { closeModal(); renderWorld(); };
    const here = POIS[S.world.loc]; setTimeout(() => { if (view.clientWidth < 700) { const t = view.clientWidth / MAP_W; zoomAt(1.6, (here.x + .5) * t, (here.y + .5) * t); } }, 60);
  });
}
