/* =========================================================================
   ИНТЕРЬЕРЫ И МУЗЫКА СЕТТИНГОВ: разные таверны, облик помещений, плейлисты
   Музыка сеттингов — Kevin MacLeod (incompetech.com), CC BY 4.0
   ========================================================================= */
/* ---------- таверны: пять планировок × зеркало ---------- */
function innMirror(sc) { const fx = x => SC_W - x; sc.objs.forEach(o => { o.x = fx(o.x); if (o.r) o.r = -o.r; }); sc.lights.forEach(l => { l.x = fx(l.x); }); Object.values(sc.anchors).forEach(a => a.forEach(p => { p.x = fx(p.x); }));
  sc.rooms.forEach(r => { const a = fx(r.x1), b = fx(r.x0); r.x0 = a; r.x1 = b; r.door = fx(r.door); r.windows = r.windows.map(w => ({ ...w, s: w.s === "l" ? "r" : w.s === "r" ? "l" : w.s, p: w.s === "t" ? fx(w.p) : w.p })); });
  sc.spawn.x = fx(sc.spawn.x); sc.foes.x = fx(sc.foes.x); const g = new ScGrid(); const old = sc.g.c; for (let j = 0; j < SC_H * 2; j++) for (let i = 0; i < SC_W * 2; i++) g.c[j * SC_W * 2 + i] = old[j * SC_W * 2 + (SC_W * 2 - 1 - i)]; sc.g = g; }
const INN_VARIANTS = [
  SC_BUILD.inn,
  function hall(sc) { // длинный зал: два длинных стола, очаг у дальней стены, стойка сбоку
    sc.floor = [{ t: "planks", box: [0, 0, SC_W, SC_H] }]; scRoom(sc, .5, .5, 17.5, 11.5, { door: 9, windows: [{ s: "l", p: 4 }, { s: "l", p: 8 }, { s: "t", p: 4 }] });
    scAdd(sc, "hearth", 9, 1.1, 2.8, 1); sc.anchors.stand.push({ x: 7.4, y: 2.2 }, { x: 10.6, y: 2.2 }); scAdd(sc, "rug", 9, 2.6, 3.6, 1.6, { ghost: true, act: false, under: true });
    for (const y of [5, 8]) { const t = scAdd(sc, "table", 8, y, 7.2, 1.15, { label: "длинный стол", acc: "длинный стол" }); for (let i = 0; i < 6; i++) { const x = 5 + i * 1.2; scAdd(sc, "stool", x, y - 1, .55, .55, { ghost: true, act: false }); scAdd(sc, "stool", x, y + 1, .55, .55, { ghost: true, act: false }); sc.anchors.sit.push({ x, y: y - 1 }, { x, y: y + 1 }); } void t; sc.lights.push({ x: 8, y, r: 70, c: "warm" }); }
    scAdd(sc, "bar", 15.9, 5.5, .95, 5.4); scAdd(sc, "shelf", 17, 5.5, .5, 5); sc.anchors.work.push({ x: 16.6, y: 4.2 }, { x: 16.6, y: 6.8 }); scAdd(sc, "barrel", 16.6, 9.6, .95, .95); scAdd(sc, "barrel", 15.5, 9.9, .95, .95); scAdd(sc, "barrel", 16.6, 1.5, .95, .95);
    scAdd(sc, "stairs", 2, 2.2, 2.2, 2.8); scAdd(sc, "crate", 1.6, 10.3, 1, 1); scAdd(sc, "candle", 15.9, 3.4, .2, .2, { ghost: true, act: false });
    sc.spawn = { x: 9, y: 10.6 }; sc.foes = { x: 9, y: 3.4 };
  },
  function firepit(sc) { // очаг посреди зала, помост для музыкантов
    const R = sc.R; sc.floor = [{ t: "planks", box: [0, 0, SC_W, SC_H] }, { t: "dirtc", c: [9, 6], r: 1.6 }]; scRoom(sc, .5, .5, 17.5, 11.5, { door: 9, windows: [{ s: "t", p: 4 }, { s: "t", p: 14 }, { s: "r", p: 6 }] });
    scAdd(sc, "campfire", 9, 6, 1.5, 1.5, { label: "очаг посреди зала", acc: "очаг посреди зала" }); sc.anchors.stand.push({ x: 7.4, y: 6 }, { x: 10.6, y: 6 });
    scAdd(sc, "rug", 15, 2.3, 4.2, 2.6, { label: "помост для музыкантов", acc: "помост для музыкантов", under: true, act: true }); sc.anchors.stand.push({ x: 14.4, y: 2.2 }, { x: 15.8, y: 2.4 }); scAdd(sc, "candle", 13.2, 1.4, .2, .2, { ghost: true, act: false }); scAdd(sc, "candle", 16.8, 1.4, .2, .2, { ghost: true, act: false });
    scAdd(sc, "bar", 3.2, 3.3, 4.4, .95); scAdd(sc, "shelf", 3.2, 1.2, 4.4, .55); scAdd(sc, "barrel", 1.4, 4.9, .95, .95); scAdd(sc, "barrel", 1.4, 6, .95, .95); sc.anchors.work.push({ x: 2.4, y: 2.2 }, { x: 4.2, y: 2.2 });
    const ts = scScatter(sc, "rtable", 6, [2.5, 5.5, 16.5, 10.6], 1.3, 1.3, { pad: 1.6, avoid: (x, y) => Math.hypot(x - 9, y - 6) < 2.8 }); ts.forEach(t => scChairsAround(sc, t, 3 + (R() < .5 ? 1 : 0), 1.02));
    scAdd(sc, "stairs", 16.3, 9.8, 2, 2.6); sc.spawn = { x: 9, y: 10.6 }; sc.foes = { x: 9, y: 3.2 };
  },
  function twoRooms(sc) { // зал и кухня за перегородкой
    const R = sc.R; sc.floor = [{ t: "planks", box: [0, 0, SC_W, SC_H] }, { t: "flag", box: [12.2, .5, 17.5, 11.5] }]; scRoom(sc, .5, .5, 17.5, 11.5, { door: 6, windows: [{ s: "t", p: 3 }, { s: "t", p: 8 }, { s: "r", p: 3 }] });
    for (const y of [1.3, 2.4, 6.4, 7.5, 8.6, 9.7, 10.8]) scAdd(sc, "pillar", 12, y, .5, .9, { act: false, v: .2 });
    scAdd(sc, "bar", 11.2, 4.4, .95, 2.4); scAdd(sc, "shelf", 12, 4.4, .4, 2.2, { ghost: true }); sc.anchors.work.push({ x: 12.8, y: 4.4 });
    scAdd(sc, "hearth", 16.8, 3, 1.1, 2.4, { label: "кухонная печь", acc: "кухонную печь" }); scAdd(sc, "cauldron", 15.4, 3, .95, .95); scAdd(sc, "table", 14.6, 7.6, 2.2, 1.1, { label: "разделочный стол", acc: "разделочный стол" }); sc.anchors.work.push({ x: 14.6, y: 6.6 }, { x: 15.6, y: 4.6 });
    scAdd(sc, "sack", 13.2, 10.6, 1, .9); scAdd(sc, "crate", 16.6, 10.5, 1, 1); scAdd(sc, "barrel", 16.7, 8.6, .9, .9); scAdd(sc, "herbs", 15, 1.05, 2.6, .35, { ghost: true });
    const ts = scScatter(sc, "rtable", 4, [1.4, 3.5, 10.2, 10.4], 1.35, 1.35, { pad: 1.6 }); ts.forEach(t => scChairsAround(sc, t, 3 + (R() < .5 ? 1 : 0), 1.05));
    scAdd(sc, "table", 4.2, 1.7, 3.2, 1, { label: "стол у окна", acc: "стол у окна" }); scChairsAround(sc, { x: 4.2, y: 1.7 }, 3, 1.1, "chair"); scAdd(sc, "stairs", 9.6, 1.9, 2, 2.4);
    scAdd(sc, "candle", 11.2, 4.4, .2, .2, { ghost: true, act: false }); sc.spawn = { x: 6, y: 10.6 }; sc.foes = { x: 6, y: 4 };
  },
  function cellar(sc) { // подвальный кабак: камень, бочки вдоль стен, длинные скамьи
    const R = sc.R; sc.floor = [{ t: "flag", box: [0, 0, SC_W, SC_H] }]; scRoom(sc, .5, .5, 17.5, 11.5, { mat: "stone", door: 9, windows: [] }); sc.dark = .08;
    for (let i = 0; i < 6; i++) scAdd(sc, "barrel", 1.5 + i * 1.05, 1.5, .95, .95, { v: i / 6 }); for (let i = 0; i < 4; i++) scAdd(sc, "barrel", 1.5, 3 + i * 1.05, .95, .95, { v: i / 4 });
    scAdd(sc, "bar", 12.5, 1.9, 6, .95); scAdd(sc, "shelf", 12.5, .95, 6, .45, { ghost: true }); sc.anchors.work.push({ x: 11.2, y: 1.1 }, { x: 13.8, y: 1.1 });
    for (const y of [5, 8]) { scAdd(sc, "table", 10.5, y, 5, 1, { label: "длинный стол", acc: "длинный стол" }); scAdd(sc, "pew", 10.5, y - .95, 5, .5, { label: "скамья", acc: "скамью" }); scAdd(sc, "pew", 10.5, y + .95, 5, .5, { label: "скамья", acc: "скамью" }); for (const x of [8.8, 10.5, 12.2]) sc.anchors.sit.push({ x, y: y - .95 }, { x, y: y + .95 }); }
    scAdd(sc, "brazier", 5, 7, .9, .9); scAdd(sc, "brazier", 15.8, 6.5, .9, .9); sc.anchors.stand.push({ x: 4.8, y: 8.2 }, { x: 15.6, y: 7.8 });
    scScatter(sc, "rtable", 2, [2.6, 6, 6.8, 10.6], 1.2, 1.2, { pad: 1.4 }).forEach(t => scChairsAround(sc, t, 3, 1));
    scAdd(sc, "stairs", 16.2, 9.8, 2, 2.6, { label: "лестница наверх", acc: "лестницу наверх" }); void R; sc.spawn = { x: 9, y: 10.6 }; sc.foes = { x: 6, y: 4.5 };
  }
];
SC_BUILD.inn = function (sc) { const h = hash(WD.id + "#inn:" + sc.id); const v = h % INN_VARIANTS.length; INN_VARIANTS[v](sc); sc.innV = v; if ((h >>> 5) % 2) innMirror(sc);
  const R = sc.R; if (R() < .6) scAdd(sc, "rug", 3 + R() * 12, 4 + R() * 6, 1.8 + R(), 1.2 + R() * .6, { ghost: true, act: false, under: true, v: R() }); };
/* ---------- облик помещений по сеттингу ---------- */
const INT_STYLE = {
  steampunk: { floor: { flag: "tile" }, wall: ["#3a2a20", "#b08a4a"], filter: "brass", tint: ["#b07a30", .07] },
  cyberpunk: { floor: { planks: "neon", flag: "metal", dirt: "metal", dirtc: "metal" }, wall: ["#1a1f2c", "#ff5cd0"], filter: "chrome", tint: ["#7a2aa0", .12], light: "neon" },
  space: { floor: { planks: "metal", flag: "metal", dirt: "metal" }, wall: ["#596170", "#bfe6ff"], filter: "chrome", tint: ["#2050a0", .08], light: "cold" },
  postapoc: { floor: { planks: "concrete", flag: "concrete" }, wall: ["#4a3e34", "#8a6a4a"], filter: "rust", tint: ["#707020", .09] },
  western: { floor: {}, wall: ["#5a3a22", "#a07a4c"], filter: "dust", tint: ["#c08a40", .07] },
  pirates: { floor: {}, wall: ["#4a3220", "#8a6440"], tint: ["#2a7a90", .05] },
  modern: { floor: { planks: "parquet", flag: "tile" }, wall: ["#3a3434", "#b0a090"], filter: "modern", tint: ["#203060", .07] },
  east: { floor: { planks: "tatami" }, wall: ["#5a3a28", "#efe2c4"], tint: ["#a04030", .04] },
  myth: { floor: { flag: "marble", planks: "marble" }, wall: ["#b5ad9c", "#f3ecdc"], tint: ["#e0c080", .05] }
};
const BIOME_GROUND = { desert: "sand", tundra: "snow", wasteland: "waste", city: "asphalt", alien: "alien" };
function intStyle() { return INT_STYLE[settingOf(WD)] || null; }
function scSkin(sc) {
  const st = intStyle(); const gr = BIOME_GROUND[WD?.biome];
  sc.floor = sc.floor.map(f => { if ((f.t === "grass" || f.t === "rockg") && gr && f.box && f.box[2] - f.box[0] >= SC_W - .1) return { ...f, t: gr }; const m = st?.floor?.[f.t]; if (!m) return f; if (f.t === "dirtc" || f.t === "flagc") return { ...f, t: m, box: [f.c[0] - f.r, f.c[1] - f.r, f.c[0] + f.r, f.c[1] + f.r], circ: true }; return { ...f, t: m }; });
  if (st?.light === "neon") sc.lights.forEach((l, i) => { if (l.c === "warm") l.c = i % 2 ? "neonc" : "neonp"; }); else if (st?.light === "cold") sc.lights.forEach(l => { if (l.c === "warm") l.c = "cold"; });
}
for (const k of Object.keys(SC_BUILD)) { const f = SC_BUILD[k]; SC_BUILD[k] = function (sc) { const r = f.apply(this, arguments); try { scSkin(sc); } catch (e) { console.error(e); } return r; }; }
const NEW_FLOORS = new Set(["neon", "metal", "concrete", "parquet", "tile", "tatami", "marble", "asphalt", "waste", "alien", "snow"]);
function scFloorNew(f, P, R) {
  const b = (f.box || [0, 0, SC_W, SC_H]).map(v => v * CS); const [x0, y0, x1, y1] = b; const w = x1 - x0, h = y1 - y0; const id = `${P}-n${f.t}${Math.round(x0)}_${Math.round(y0)}`;
  const clip = f.circ ? `<ellipse cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" rx="${w / 2}" ry="${h / 2}"/>` : `<rect x="${x0}" y="${y0}" width="${w}" height="${h}"/>`; let o = "";
  const rnd = (a, b2) => a + R() * (b2 - a);
  if (f.t === "metal") { o += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#3b424d"/>`; for (let y = y0; y < y1; y += 48) for (let x = x0; x < x1; x += 64) { const L = rnd(24, 31); o += `<rect x="${x + 1}" y="${y + 1}" width="62" height="46" fill="hsl(215,10%,${L | 0}%)" stroke="#20252c" stroke-width="1.5"/><circle cx="${x + 5}" cy="${y + 5}" r="1.4" fill="#8a94a2"/><circle cx="${x + 59}" cy="${y + 5}" r="1.4" fill="#8a94a2"/><circle cx="${x + 5}" cy="${y + 43}" r="1.4" fill="#8a94a2"/><circle cx="${x + 59}" cy="${y + 43}" r="1.4" fill="#8a94a2"/>`; if (R() < .25) o += `<path d="M${x + 12} ${y + 12} h40 M${x + 12} ${y + 18} h40 M${x + 12} ${y + 24} h40" stroke="#22272e" stroke-width="2"/>`; } }
  else if (f.t === "neon") { o += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#11131c"/>`; for (let y = y0; y < y1; y += 32) for (let x = x0; x < x1; x += 32) o += `<rect x="${x + 1}" y="${y + 1}" width="30" height="30" fill="hsl(240,14%,${rnd(9, 14) | 0}%)"/>`;
    for (let i = 0; i < 9; i++) { const vert = R() < .5; const c = R() < .5 ? "#ff4fd0" : "#4fe6ff"; const p = vert ? x0 + Math.floor(R() * w / 32) * 32 : y0 + Math.floor(R() * h / 32) * 32; const s = rnd(0, .5), e = rnd(.5, 1); o += vert ? `<line x1="${p}" y1="${y0 + h * s}" x2="${p}" y2="${y0 + h * e}" stroke="${c}" stroke-width="1.6" opacity=".55"/>` : `<line x1="${x0 + w * s}" y1="${p}" x2="${x0 + w * e}" y2="${p}" stroke="${c}" stroke-width="1.6" opacity=".55"/>`; } }
  else if (f.t === "concrete" || f.t === "asphalt" || f.t === "waste") { const base = { concrete: "#56524c", asphalt: "#26282d", waste: "#5a4c3a" }[f.t]; const cols = { concrete: ["#625d56", "#4a4640", "#6a655d"], asphalt: ["#2f3238", "#1f2125", "#34373d"], waste: ["#66563f", "#4a3e2e", "#706048"] }[f.t]; o += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${base}"/>`;
    for (let i = 0; i < 90; i++) o += `<circle cx="${rnd(x0, x1) | 0}" cy="${rnd(y0, y1) | 0}" r="${rnd(8, 34) | 0}" fill="${cols[i % 3]}" opacity=".4"/>`;
    for (let i = 0; i < (f.t === "asphalt" ? 6 : 14); i++) { let x = rnd(x0, x1), y = rnd(y0, y1); let d = `M${x | 0} ${y | 0}`; for (let k = 0; k < 4; k++) { x += rnd(-30, 30); y += rnd(-30, 30); d += ` L${x | 0} ${y | 0}`; } o += `<path d="${d}" stroke="#1a1714" stroke-width="1.2" fill="none" opacity=".55"/>`; }
    if (f.t === "concrete") for (let x = x0 + 96; x < x1; x += 96) o += `<line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="#3a3632" stroke-width="1.5" opacity=".6"/>`;
    if (f.t === "waste") for (let i = 0; i < 40; i++) o += `<rect x="${rnd(x0, x1) | 0}" y="${rnd(y0, y1) | 0}" width="${rnd(2, 6) | 0}" height="${rnd(2, 5) | 0}" fill="${R() < .5 ? "#8a7a5a" : "#3a2e22"}" opacity=".8" transform="rotate(${rnd(0, 90) | 0})"/>`; }
  else if (f.t === "parquet") { o += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#5a3a22"/>`; for (let y = y0, r = 0; y < y1; y += 16, r++) for (let x = x0 - (r % 2) * 24; x < x1; x += 48) { const L = rnd(28, 38); o += `<rect x="${x + 1}" y="${y + 1}" width="46" height="14" fill="hsl(26,40%,${L | 0}%)"/>`; } }
  else if (f.t === "tile") { o += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#2c2f33"/>`; for (let y = y0, r = 0; y < y1; y += 32, r++) for (let x = x0, c = 0; x < x1; x += 32, c++) o += `<rect x="${x + 1}" y="${y + 1}" width="30" height="30" fill="${(r + c) % 2 ? "#7c7f84" : "#3a3d42"}" opacity="${rnd(.85, 1).toFixed(2)}"/>`; }
  else if (f.t === "tatami") { o += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#4a3a22"/>`; for (let y = y0, r = 0; y < y1; y += 64, r++) for (let x = x0, c = 0; x < x1; x += 64, c++) { const vert = (r + c) % 2; const L = rnd(40, 47); o += vert ? `<rect x="${x + 2}" y="${y + 2}" width="28" height="60" fill="hsl(52,38%,${L | 0}%)" stroke="#2e2414" stroke-width="1.6"/><rect x="${x + 34}" y="${y + 2}" width="28" height="60" fill="hsl(50,36%,${(L - 3) | 0}%)" stroke="#2e2414" stroke-width="1.6"/>` : `<rect x="${x + 2}" y="${y + 2}" width="60" height="28" fill="hsl(52,38%,${L | 0}%)" stroke="#2e2414" stroke-width="1.6"/><rect x="${x + 2}" y="${y + 34}" width="60" height="28" fill="hsl(50,36%,${(L - 3) | 0}%)" stroke="#2e2414" stroke-width="1.6"/>`; } }
  else if (f.t === "marble") { o += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#bdb6a8"/>`; for (let y = y0; y < y1; y += 48) for (let x = x0; x < x1; x += 48) { const L = rnd(74, 84); o += `<rect x="${x + 1}" y="${y + 1}" width="46" height="46" fill="hsl(40,14%,${L | 0}%)"/>`; if (R() < .5) o += `<path d="M${x + rnd(2, 20) | 0} ${y + 2} q${rnd(-10, 20) | 0} 20 ${rnd(10, 30) | 0} 44" stroke="#9a9488" stroke-width=".9" fill="none" opacity=".7"/>`; } }
  else if (f.t === "alien") { o += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#3a2a46"/>`; for (let i = 0; i < 90; i++) o += `<circle cx="${rnd(x0, x1) | 0}" cy="${rnd(y0, y1) | 0}" r="${rnd(8, 34) | 0}" fill="${["#4a3458", "#2e2238", "#3e3a5a"][i % 3]}" opacity=".45"/>`; for (let i = 0; i < 28; i++) o += `<circle cx="${rnd(x0, x1) | 0}" cy="${rnd(y0, y1) | 0}" r="${rnd(1.5, 3.5).toFixed(1)}" fill="${R() < .5 ? "#7ff0d8" : "#d88cff"}" opacity=".75"/>`; }
  else if (f.t === "snow") { o += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#c9d2da"/>`; for (let i = 0; i < 80; i++) o += `<circle cx="${rnd(x0, x1) | 0}" cy="${rnd(y0, y1) | 0}" r="${rnd(10, 40) | 0}" fill="${["#dfe6ec", "#b8c3cd", "#eef2f5"][i % 3]}" opacity=".45"/>`; }
  return `<clipPath id="${id}">${clip}</clipPath><g clip-path="url(#${id})">${o}</g>`;
}
{ const _fl = scFloorSVG; scFloorSVG = function (sc, P, R) { if (!sc.floor.some(f => NEW_FLOORS.has(f.t))) return _fl.apply(this, arguments); let s = ""; for (const f of sc.floor) s += NEW_FLOORS.has(f.t) ? scFloorNew(f, P, R) : _fl({ ...sc, floor: [f] }, P, R); return s; }; }
const INT_FILTER = { chrome: "0.55 0.2 0.1 0 0  0.15 0.6 0.15 0 0.01  0.15 0.2 0.75 0 0.05  0 0 0 1 0", brass: "0.6 0.35 0.1 0 0.02  0.3 0.55 0.1 0 0.01  0.2 0.3 0.4 0 0  0 0 0 1 0", rust: "0.6 0.3 0.1 0 0.01  0.3 0.5 0.15 0 0  0.25 0.3 0.35 0 0  0 0 0 1 0", dust: "0.85 0.15 0 0 0.02  0.1 0.8 0.05 0 0.01  0.05 0.15 0.65 0 0  0 0 0 1 0", modern: "0.7 0.25 0.05 0 0  0.15 0.7 0.15 0 0  0.1 0.25 0.65 0 0.02  0 0 0 1 0" };
function scSkinDefs(P) { const st = intStyle(); let s = `<radialGradient id="${P}-neonp"><stop offset="0" stop-color="#ff5cd0" stop-opacity=".55"/><stop offset=".5" stop-color="#ff3cb0" stop-opacity=".18"/><stop offset="1" stop-color="#ff3cb0" stop-opacity="0"/></radialGradient><radialGradient id="${P}-neonc"><stop offset="0" stop-color="#5ce8ff" stop-opacity=".5"/><stop offset=".5" stop-color="#3cc8ff" stop-opacity=".16"/><stop offset="1" stop-color="#3cc8ff" stop-opacity="0"/></radialGradient>`;
  if (st?.filter && INT_FILTER[st.filter]) s += `<filter id="${P}-skin" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${INT_FILTER[st.filter]}"/></filter>`; return s; }
{ const _d = scDefs; scDefs = function (P, sc) { return _d.apply(this, arguments).replace("<defs>", "<defs>" + scSkinDefs(P)); }; }
function scSkinOpen() { const st = intStyle(); return st?.filter ? `<g filter="url(#SCP-skin)">` : "<g>"; }
function scSkinClose() { const st = intStyle(); return "</g>" + (st?.tint ? `<rect width="${SC_W * CS}" height="${SC_H * CS}" fill="${st.tint[0]}" opacity="${st.tint[1]}" style="mix-blend-mode:color"/>` : ""); }
/* ---------- музыка по сеттингу: плейлисты и «мешок» без частых повторов ---------- */
const SET_MUSIC = /*MUSIC_MANIFEST*/{};
const MOOD_FALL = { forest: ["explore"], sacred: ["night", "explore"], deep: ["tension", "night"], night: ["tension", "explore"], tension: ["night", "explore"], menu: ["explore"], tavern: ["explore"], battle: ["tension"] };
function musicList(m) {
  const st = S?.wd ? settingOf(S.wd) : (D?.world ? settingOf(D.world) : "fantasy"); const M = SET_MUSIC[st];
  if (st === "fantasy" || !M) { const base = MUSIC[m] || MUSIC.explore; return m === "tavern" && SET_MUSIC.fantasy?.tavern ? [...base, ...SET_MUSIC.fantasy.tavern] : base; }
  if (m === "defeat") return MUSIC.defeat; let out = [...(M[m] || [])]; for (const f of MOOD_FALL[m] || ["explore"]) { if (out.length >= 3) break; out.push(...(M[f] || []).filter(t => !out.includes(t))); } return out.length ? out : (MUSIC[m] || MUSIC.explore);
}
function musicSet() { return S?.wd ? settingOf(S.wd) : (D?.world ? settingOf(D.world) : "fantasy"); }
AU.hist = [];
auNext = function () { const list = musicList(AU.mood); const keep = Math.min(list.length - 1, Math.max(1, Math.floor(list.length * .6))); const recent = AU.hist.slice(-keep - 2);
  let opts = list.filter(t => t !== AU.track && !recent.slice(-keep).includes(t)); if (!opts.length) opts = list.filter(t => t !== AU.track); if (!opts.length) opts = list;
  const pick = opts[Math.floor(Math.random() * opts.length)]; AU.hist.push(pick); if (AU.hist.length > 40) AU.hist.splice(0, 10); AU.set = musicSet(); auPlayTrack(pick); };
setMood = function (m) {
  if (!m || !MUSIC[m]) return; const set = musicSet(); if (AU.mood === m && AU.cur && AU.set === set) return; AU.mood = m;
  if (!AU.unlocked || !AU.cfg.on || AU.cfg.music <= 0) return; if (AU.cur && AU.set === set && musicList(m).includes(AU.track)) return; auNext();
};
{ const _sa = setAmbience; setAmbience = function (k) { const st = musicSet(); if (["cyberpunk", "space", "modern"].includes(st) && (k === "campfire" || k === "birds")) k = null; if (st === "postapoc" && k === "birds") k = null; return _sa.call(this, k); }; }
