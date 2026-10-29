/* =========================================================================
   ПЛАН ЛОКАЦИИ — вид сверху: мебель, люди, враги, предметы
   ========================================================================= */
const SC_W = 18, SC_H = 12, CS = 32;
const SC_BY_KIND = { inn: "inn", house: "house", hut: "hut", chapel: "chapel", shrine: "shrine", tower: "tower", cave: "cave", mine: "mine", ruin: "ruin", camp: "camp", farm: "farm", pier: "pier", wreck: "wreck", grove: "forest", bridge: "bridge", well: "square", gate: "gate" };
const SC_KW = [[/таверн|трактир|корчм|постоял|харчевн|кабак/i, "inn"], [/часовн|храм|собор|церк|молельн|монастыр/i, "chapel"], [/святилищ|капищ|круг камн|алтарь/i, "shrine"], [/пещер|грот|логов|подзем|склеп|катакомб/i, "cave"], [/шахт|рудник|копи\b/i, "mine"], [/маяк|башн/i, "tower"], [/пристан|причал|порт\b|гаван|док/i, "pier"], [/крушен|облом|остов/i, "wreck"], [/мост/i, "bridge"], [/руин|развалин/i, "ruin"], [/лагер|стоянк|бивак/i, "camp"], [/ферм|хутор|мельниц/i, "farm"], [/хижин|лачуг|землянк/i, "hut"], [/лес|рощ|чащ|опушк|бор\b/i, "forest"], [/дом|усадьб|лавк|кузниц|мастерск/i, "house"], [/ворот|застав/i, "gate"], [/площад|рын|улиц|колод/i, "square"]];
const SC_NAMES = { inn: "Таверна", house: "Дом", hut: "Хижина", chapel: "Святилище", shrine: "Капище", tower: "Башня", cave: "Пещера", mine: "Шахта", ruin: "Руины", camp: "Лагерь", farm: "Хутор", pier: "Пристань", wreck: "Берег", forest: "Лес", bridge: "Переправа", square: "Площадь", gate: "Ворота" };
// подпись, винительный падеж, можно ли обыскать
const OBJ = {
  bar: ["стойка", "стойку"], shelf: ["полки", "полки", 1], barrel: ["бочка", "бочку", 1], table: ["стол", "стол", 1], rtable: ["стол", "стол", 1], hearth: ["очаг", "очаг"],
  stairs: ["лестница", "лестницу"], bed: ["кровать", "кровать", 1], chest: ["сундук", "сундук", 1], cabinet: ["шкаф", "шкаф", 1], bookcase: ["книжные полки", "книжные полки", 1],
  altar: ["алтарь", "алтарь", 1], pew: ["скамья", "скамью"], statue: ["статуя", "статую"], font: ["чаша с водой", "чашу с водой"], brazier: ["жаровня", "жаровню"], crate: ["ящики", "ящики", 1],
  sack: ["мешки", "мешки", 1], tent: ["палатка", "палатку", 1], campfire: ["костёр", "костёр"], bedroll: ["лежанка", "лежанку", 1], hay: ["стог сена", "стог сена", 1], well: ["колодец", "колодец"],
  cart: ["телега", "телегу", 1], stall: ["прилавок", "прилавок", 1], boat: ["лодка", "лодку", 1], net: ["сети", "сети", 1], hull: ["остов корабля", "остов корабля", 1], rubble: ["завал", "завал", 1],
  stone: ["менгир", "менгир"], grave: ["надгробие", "надгробие"], minecart: ["вагонетка", "вагонетку", 1], table_map: ["стол с картами", "стол с картами", 1], cauldron: ["котёл", "котёл", 1],
  herbs: ["сушёные травы", "сушёные травы", 1], lantern: ["фонарь", "фонарь"], bell: ["колокол", "колокол"], body: ["тело", "тело", 1], item: ["находка", "находку", 1], anvil: ["наковальня", "наковальню"]
};
const OBJ_LIGHT = { hearth: [150, "warm"], campfire: [170, "warm"], brazier: [130, "warm"], candle: [70, "warm"], torch: [120, "warm"], lantern: [110, "warm"], lamppost: [120, "warm"], font: [50, "cold"], item: [36, "gold"] };
const SC_CROWD = {
  inn: [["рыбак", "рыбачка", "старый моряк", "пьянчужка", "служанка", "путник", "подмастерье", "торговец"], [3, 3, 6, 2]], house: [["домочадец", "слуга"], [1, 1, 1, 0]], hut: [[], [0, 0, 0, 0]],
  chapel: [["прихожанка", "старик", "вдова", "послушник"], [2, 1, 1, 0]], shrine: [["паломник"], [1, 0, 0, 0]], tower: [[], [0, 0, 0, 0]], cave: [[], [0, 0, 0, 0]], mine: [["рудокоп"], [1, 1, 0, 0]],
  ruin: [[], [0, 0, 0, 0]], camp: [["охотник", "наёмник", "дровосек"], [1, 1, 2, 1]], farm: [["батрак", "крестьянка", "мальчишка-пастух"], [2, 2, 1, 0]],
  pier: [["рыбак", "грузчик", "мальчишка", "торговка рыбой", "лодочник"], [3, 3, 1, 0]], wreck: [["мародёр"], [0, 0, 0, 0]], forest: [[], [0, 0, 0, 0]], bridge: [["путник"], [1, 1, 0, 0]],
  square: [["торговка", "стражник", "мальчишка", "нищий", "горожанин", "горожанка", "водонос"], [4, 5, 3, 1]], gate: [["стражник", "стражник", "путник", "возница"], [2, 3, 2, 2]]
};
const SC_AMB = { inn: "campfire", house: "campfire", hut: "campfire", camp: "campfire", pier: "ship", wreck: "ship", forest: "birds", shrine: "birds", farm: "birds", bridge: "birds", ruin: "birds" };
function sceneTpl(id) {
  const p = POIS[id]; if (!p) return "square";
  const s = `${p.name || ""} ${p.short || ""}`; for (const [re, k] of SC_KW) if (re.test(p.name || "")) return k;
  if (SC_BY_KIND[p.kind]) return SC_BY_KIND[p.kind]; for (const [re, k] of SC_KW) if (re.test(s)) return k; return "square";
}
class ScGrid {
  constructor() { this.c = new Uint8Array(SC_W * 2 * SC_H * 2); }
  cells(x, y, w, h, f) { const x0 = Math.max(0, Math.floor((x - w / 2) * 2)), x1 = Math.min(SC_W * 2 - 1, Math.ceil((x + w / 2) * 2) - 1), y0 = Math.max(0, Math.floor((y - h / 2) * 2)), y1 = Math.min(SC_H * 2 - 1, Math.ceil((y + h / 2) * 2) - 1);
    for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) if (f(j * SC_W * 2 + i) === false) return false; return true; }
  mark(x, y, w, h) { this.cells(x, y, w, h, k => { this.c[k] = 1; }); }
  free(x, y, w, h) { if (x - w / 2 < 0 || y - h / 2 < 0 || x + w / 2 > SC_W || y + h / 2 > SC_H) return false; return this.cells(x, y, w, h, k => !this.c[k]); }
  block(fn) { for (let j = 0; j < SC_H * 2; j++) for (let i = 0; i < SC_W * 2; i++) if (fn((i + .5) / 2, (j + .5) / 2)) this.c[j * SC_W * 2 + i] = 1; }
}
function scAdd(sc, k, x, y, w, h, o = {}) {
  const d = OBJ[k]; const ob = { k, x, y, w, h, r: o.r || 0, v: o.v ?? sc.R(), label: o.label || d?.[0] || "", acc: o.acc || d?.[1] || o.label || "", search: o.search ?? !!d?.[2], act: o.act ?? !!d, id: "o" + sc.objs.length, under: !!o.under };
  sc.objs.push(ob); if (!o.ghost) sc.g.mark(x, y, o.bw ?? w, o.bh ?? h); const L = OBJ_LIGHT[k]; if (L && !o.nolight) sc.lights.push({ x, y, r: L[0], c: L[1] }); return ob;
}
function scScatter(sc, k, n, box, w, h, o = {}) {
  const out = []; const R = sc.R; const pad = o.pad ?? .5;
  for (let t = 0; out.length < n && t < n * 40; t++) {
    const ww = o.vary ? w * (.75 + R() * .5) : w, hh = o.vary ? h * (.75 + R() * .5) : h;
    const x = box[0] + ww / 2 + R() * (box[2] - box[0] - ww), y = box[1] + hh / 2 + R() * (box[3] - box[1] - hh);
    if (o.avoid && o.avoid(x, y)) continue;
    if (sc.g.free(x, y, ww + pad, hh + pad)) out.push(scAdd(sc, k, x, y, ww, hh, { ...o, r: o.rot ? Math.round(R() * 360) : (o.r || 0) }));
  }
  return out;
}
function scRoom(sc, x0, y0, x1, y1, o = {}) {
  sc.rooms.push({ x0, y0, x1, y1, mat: o.mat || "wood", door: o.door ?? (x0 + x1) / 2, windows: o.windows || [], round: false });
  sc.g.block((x, y) => x < x0 + .35 || x > x1 - .35 || y < y0 + .35 || y > y1 - .35);
}
function scChairsAround(sc, t, n, dist, k) {
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + sc.R() * .5; const x = t.x + Math.cos(a) * dist, y = t.y + Math.sin(a) * dist;
    if (x < 1 || x > SC_W - 1 || y < 1 || y > SC_H - 1) continue; scAdd(sc, k || "stool", x, y, .55, .55, { ghost: true, act: false, r: Math.round(a * 57) }); sc.anchors.sit.push({ x, y }); }
}
const SC_BUILD = {
  inn(sc) {
    const R = sc.R; sc.floor = [{ t: "planks", box: [0, 0, SC_W, SC_H] }]; scRoom(sc, .5, .5, 17.5, 11.5, { door: 9, windows: [{ s: "t", p: 12.5 }, { s: "t", p: 15 }, { s: "l", p: 6 }] });
    scAdd(sc, "shelf", 5, 1.3, 7, .55); scAdd(sc, "bar", 5, 2.65, 7.2, .95); scAdd(sc, "barrel", 9.8, 1.5, .95, .95); scAdd(sc, "barrel", 10.85, 1.5, .95, .95);
    sc.anchors.work.push({ x: 4.2, y: 1.95 }, { x: 6.6, y: 1.95 });
    scAdd(sc, "rug", 14.9, 6, 2.6, 3.4, { ghost: true, act: false, under: true }); scAdd(sc, "hearth", 16.75, 6, 1.1, 2.6); sc.anchors.stand.push({ x: 15.4, y: 4.8 }, { x: 15.4, y: 7.2 });
    scAdd(sc, "stairs", 2.1, 9.7, 2.2, 2.8, { r: 0 });
    const ts = scScatter(sc, "rtable", 5, [3.6, 4.3, 14.6, 10.4], 1.35, 1.35, { pad: 1.7 }); ts.forEach(t => scChairsAround(sc, t, 3 + (R() < .5 ? 1 : 0), 1.05));
    if (ts.length < 4) scScatter(sc, "table", 1, [3.5, 4, 14, 10.5], 2.4, 1.2, { pad: 1.4 }).forEach(t => scChairsAround(sc, t, 4, 1.25, "chair"));
    scAdd(sc, "candle", 5, 2.65, .2, .2, { ghost: true, act: false }); ts.slice(0, 2).forEach(t => sc.lights.push({ x: t.x, y: t.y, r: 60, c: "warm" }));
    sc.spawn = { x: 9, y: 10.6 }; sc.foes = { x: 9, y: 5 };
  },
  house(sc) {
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H] }, { t: "path", pts: [[9, 10.5], [9.4, 11.4], [8.6, 12.2]] }, { t: "planks", box: [2.5, 1.5, 15.5, 10.5] }];
    scRoom(sc, 2.5, 1.5, 15.5, 10.5, { door: 9, windows: [{ s: "t", p: 5 }, { s: "t", p: 12 }, { s: "r", p: 7.5 }] });
    sc.g.block((x, y) => !(x > 2.85 && x < 15.15 && y > 1.85 && y < 10.15) && !(y > 10.4));
    scAdd(sc, "hearth", 3.45, 5.2, 1, 2.2); sc.anchors.stand.push({ x: 4.7, y: 4.4 });
    const t = scAdd(sc, "table", 7, 5.8, 2.5, 1.35); scChairsAround(sc, { x: 7, y: 5.8 }, 4, 1.2, "chair"); scAdd(sc, "candle", 7.3, 5.7, .2, .2, { ghost: true, act: false }); void t;
    scAdd(sc, "bed", 13.7, 3.6, 1.7, 2.6); scAdd(sc, "chest", 13.7, 5.6, 1.25, .8); scAdd(sc, "shelf", 6.8, 2.2, 3.2, .5); scAdd(sc, "cabinet", 10.6, 2.25, 1.6, .65);
    scAdd(sc, "rug", 10.2, 7.6, 3.2, 2, { ghost: true, act: false, under: true }); scAdd(sc, "barrel", 14.6, 9.4, .9, .9); scAdd(sc, "crate", 3.7, 9.3, 1, 1);
    scScatter(sc, "tree", 4, [0, 0, SC_W, SC_H], 2.4, 2.4, { pad: 0, ghost: true, act: false, avoid: (x, y) => x > 1.6 && x < 16.4 && y > .7 && y < 11.5 || (x > 7 && x < 11 && y > 10) });
    sc.spawn = { x: 9, y: 9.6 }; sc.foes = { x: 9, y: 4 }; sc.outdoorTrim = true;
  },
  hut(sc) {
    const R = sc.R; sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H], dark: true }, { t: "dirt", box: [4.5, 2.5, 13.5, 9.5] }];
    scRoom(sc, 4.5, 2.5, 13.5, 9.5, { door: 9, mat: "log", windows: [{ s: "t", p: 7 }] });
    sc.g.block((x, y) => !(x > 4.85 && x < 13.15 && y > 2.85 && y < 9.15) && !(y > 9.4));
    scAdd(sc, "campfire", 9, 6, 1.3, 1.3, { label: "очаг", acc: "очаг" }); scAdd(sc, "cauldron", 10.3, 6.9, .9, .9); scAdd(sc, "bedroll", 12, 4.1, 1.2, 2, { label: "лежанка", acc: "лежанку" });
    scAdd(sc, "table", 6.3, 4, 1.8, 1, { label: "стол с травами", acc: "стол с травами" }); scAdd(sc, "herbs", 6.3, 3.05, 2.4, .35, { ghost: true }); scAdd(sc, "sack", 5.6, 8.4, 1, .9); scAdd(sc, "shelf", 11.5, 2.95, 2.2, .45);
    sc.anchors.stand.push({ x: 8, y: 5.2 }, { x: 10, y: 5.1 });
    scScatter(sc, "tree", 7, [0, 0, SC_W, SC_H], 2.6, 2.6, { pad: 0, ghost: true, act: false, avoid: (x, y) => x > 3.4 && x < 14.6 && y > 1.6 && y < 10.8 });
    scScatter(sc, "bush", 6, [0, 0, SC_W, SC_H], 1.2, 1.2, { pad: 0, ghost: true, act: false, avoid: (x, y) => x > 3.8 && x < 14.2 && y > 1.9 && y < 10.6 });
    void R; sc.spawn = { x: 9, y: 8.6 }; sc.foes = { x: 9, y: 4 };
  },
  chapel(sc) {
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H] }, { t: "flag", box: [2.5, .5, 15.5, 11.5] }];
    scRoom(sc, 2.5, .5, 15.5, 11.5, { mat: "stone", door: 9, windows: [{ s: "l", p: 4.5, c: "#8fb7d8" }, { s: "l", p: 8, c: "#d8b48f" }, { s: "r", p: 4.5, c: "#d88f9c" }, { s: "r", p: 8, c: "#8fd8b4" }] });
    sc.g.block((x, y) => x < 2.85 || x > 15.15);
    scAdd(sc, "statue", 9, 1.25, 1.1, .9, { ghost: true }); scAdd(sc, "altar", 9, 2.35, 3, 1.05); scAdd(sc, "candle", 7.15, 2.1, .25, .25, { ghost: true, act: false }); scAdd(sc, "candle", 10.85, 2.1, .25, .25, { ghost: true, act: false });
    scAdd(sc, "rug", 9, 7.2, 1.5, 8.2, { ghost: true, act: false, under: true, v: .9 });
    for (const y of [4.4, 5.8, 7.2, 8.6]) { scAdd(sc, "pew", 5.8, y, 3.9, .55); scAdd(sc, "pew", 12.2, y, 3.9, .55); sc.anchors.sit.push({ x: 4.6, y: y - .02 }, { x: 13.4, y }, { x: 6.9, y }, { x: 11.1, y }); }
    for (const [x, y] of [[3.6, 3.2], [14.4, 3.2], [3.6, 10], [14.4, 10]]) scAdd(sc, "pillar", x, y, .8, .8, { act: false });
    scAdd(sc, "font", 12.7, 10.3, 1, 1); scAdd(sc, "candle", 3.6, 6.6, .25, .25, { ghost: true, act: false }); scAdd(sc, "candle", 14.4, 6.6, .25, .25, { ghost: true, act: false });
    for (let i = 0; i < 5; i++) { const x = i < 3 ? .9 + (i % 2) * .7 : 16.4 + (i % 2) * .7, y = 2 + i * 2.1; scAdd(sc, "grave", x, y, .7, .45, { v: i / 5 }); }
    sc.anchors.work.push({ x: 9, y: 3.45 }); sc.spawn = { x: 9, y: 10.6 }; sc.foes = { x: 9, y: 4 };
  },
  shrine(sc) {
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H] }, { t: "path", pts: [[9, 12.4], [9.6, 9.5], [9, 8.2]] }, { t: "dirtc", c: [9, 6], r: 3.2 }];
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 - Math.PI / 2 + .45; scAdd(sc, "stone", 9 + Math.cos(a) * 3.4, 6 + Math.sin(a) * 2.9, .9, .7, { r: Math.round(a * 57 + 90) }); }
    scAdd(sc, "altar", 9, 6, 1.6, 1.1, { label: "жертвенник", acc: "жертвенник" }); scAdd(sc, "candle", 8.4, 5.6, .25, .25, { ghost: true, act: false }); scAdd(sc, "candle", 9.6, 5.6, .25, .25, { ghost: true, act: false });
    scScatter(sc, "tree", 11, [0, 0, SC_W, SC_H], 2.6, 2.6, { pad: 0, ghost: true, act: false, avoid: (x, y) => ((x - 9) / 6.2) ** 2 + ((y - 6) / 4.8) ** 2 < 1 || (x > 7.5 && x < 11 && y > 8) });
    scScatter(sc, "bush", 6, [0, 0, SC_W, SC_H], 1.1, 1.1, { pad: .1, ghost: true, act: false, avoid: (x, y) => ((x - 9) / 4.8) ** 2 + ((y - 6) / 3.9) ** 2 < 1 });
    sc.anchors.work.push({ x: 9, y: 7.1 }); sc.spawn = { x: 9, y: 10.8 }; sc.foes = { x: 9, y: 3 };
  },
  tower(sc) {
    sc.floor = [{ t: "rockg", box: [0, 0, SC_W, SC_H] }, { t: "flagc", c: [9, 6], r: 5.1 }]; sc.round = { cx: 9, cy: 6, r: 5.4, door: 90 };
    sc.g.block((x, y) => Math.hypot(x - 9, y - 6) > 5 && !(Math.abs(x - 9) < .8 && y > 10));
    for (let i = 0; i < 11; i++) { const a = (-70 + i * 14) * Math.PI / 180; scAdd(sc, "step", 9 + Math.cos(a) * 4.35, 6 + Math.sin(a) * 4.35, 1.1, .5, { r: Math.round(a * 57 + 90), act: false, v: i / 11 }); }
    sc.objs.push({ k: "stairs_label", x: 13.2, y: 6, w: 1, h: 1, act: true, label: "винтовая лестница", acc: "винтовую лестницу", id: "ostair", hidden: true });
    scAdd(sc, "table_map", 6.6, 4.4, 1.9, 1.1); scAdd(sc, "chair", 6.6, 5.4, .55, .55, { ghost: true, act: false }); scAdd(sc, "brazier", 9, 6.3, 1, 1);
    scAdd(sc, "crate", 6, 8.2, 1, 1); scAdd(sc, "crate", 6.9, 8.9, .9, .9, { r: 20 }); scAdd(sc, "barrel", 11.3, 9, .9, .9); scAdd(sc, "sack", 10.5, 9.6, .9, .7);
    scScatter(sc, "rock", 7, [0, 0, SC_W, SC_H], 1.2, 1, { pad: 0, ghost: true, act: false, vary: true, rot: true, avoid: (x, y) => Math.hypot(x - 9, y - 6) < 6.3 });
    sc.anchors.stand.push({ x: 7.6, y: 6.8 }, { x: 10.4, y: 5.2 }); sc.spawn = { x: 9, y: 10.3 }; sc.foes = { x: 9, y: 3.4 }; sc.dark = .25;
  },
  cave(sc, mine) {
    const R = sc.R; const ph = [R() * 6, R() * 6, R() * 6];
    const rad = a => { const b = 1 + .1 * Math.sin(a * 3 + ph[0]) + .07 * Math.sin(a * 5 + ph[1]) + .05 * Math.sin(a * 9 + ph[2]); return b; };
    sc.cave = { cx: 9, cy: 5.8, rx: 7.6, ry: 4.7, rad }; sc.floor = [{ t: "cave", box: [0, 0, SC_W, SC_H] }];
    const inside = (x, y) => { const dx = (x - 9) / 7.6, dy = (y - 5.8) / 4.7; const a = Math.atan2(dy, dx); return Math.hypot(dx, dy) < rad(a) * .93 || (Math.abs(x - 9) < 1.2 && y > 8.5); };
    sc.g.block((x, y) => !inside(x, y));
    scScatter(sc, "puddle", 3, [3, 2, 15, 9], 1.6, .9, { ghost: true, act: false, vary: true, under: true });
    scScatter(sc, "rock", 6, [2, 1.5, 16, 9.5], 1, .9, { act: false, vary: true, rot: true, pad: .6 });
    if (mine) {
      sc.floor.push({ t: "rails", pts: [[1, 6.3], [6, 6.3], [9.5, 7.5]] }); scAdd(sc, "minecart", 5.2, 6.3, 1.5, 1, { ghost: true }); scAdd(sc, "anvil", 12.5, 3.6, .9, .6);
      for (const x of [4, 8, 12]) { scAdd(sc, "beam", x, 2.6, .5, .5, { act: false }); scAdd(sc, "beam", x, 9.2, .5, .5, { act: false }); }
      scAdd(sc, "lantern", 8, 2.9, .4, .4, { ghost: true, act: false }); scAdd(sc, "lantern", 12, 8.9, .4, .4, { ghost: true, act: false });
    }
    const stash = Object.values(ENEMIES).some(E => E.loc === sc.id && /bandit|thug|cultist|goblin/.test(E.type || "")) || R() < .45;
    if (stash) { scScatter(sc, "crate", 3, [10, 2, 15.5, 6], 1, 1, { pad: .1, rot: false }); scScatter(sc, "sack", 2, [10, 2, 15.5, 7], .9, .75, { pad: .1 }); scAdd(sc, "lantern", 12.4, 4.4, .4, .4, { ghost: true, act: false }); }
    for (const [x, y] of [[3.2, 4], [14.6, 7.6]]) sc.lights.push({ x, y, r: 105, c: "warm" });
    scAdd(sc, "torch", 3, 3.7, .3, .3, { ghost: true, act: false, nolight: true }); scAdd(sc, "torch", 14.8, 7.9, .3, .3, { ghost: true, act: false, nolight: true });
    sc.spawn = { x: 9, y: 10.4 }; sc.foes = { x: 9.5, y: 3.4 }; sc.dark = .5;
  },
  mine(sc) { SC_BUILD.cave(sc, true); },
  ruin(sc) {
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H] }, { t: "flag", box: [3, 2, 15, 10], broken: true }];
    const W = [[3, 2, 7, 2.5], [3, 2, 3.5, 6], [11, 2, 15, 2.5], [14.5, 2, 15, 7.5], [3, 8.5, 3.5, 10], [12, 9.5, 15, 10]];
    W.forEach(([x0, y0, x1, y1]) => scAdd(sc, "wallseg", (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0, { act: false }));
    for (const [x, y, f] of [[6, 4.5], [12, 4.5], [6, 7.6, 1], [12, 7.6]]) f ? scAdd(sc, "colfall", x + .9, y, 2.6, .7, { r: 25, label: "упавшая колонна", acc: "упавшую колонну" }) : scAdd(sc, "pillar", x, y, .9, .9, { act: false });
    scAdd(sc, "statue", 9, 3.6, 1.1, 1.1, { label: "разбитая статуя", acc: "разбитую статую" }); scScatter(sc, "rubble", 4, [3, 2, 15, 10], 1.3, 1.1, { vary: true, rot: true });
    scScatter(sc, "tree", 5, [0, 0, SC_W, SC_H], 2.5, 2.5, { pad: 0, ghost: true, act: false, avoid: (x, y) => x > 2 && x < 16 && y > 1 && y < 11 });
    scScatter(sc, "bush", 6, [0, 0, SC_W, SC_H], 1.1, 1.1, { pad: .1, ghost: true, act: false, avoid: (x, y) => x > 4 && x < 14 && y > 3 && y < 9 });
    sc.spawn = { x: 9, y: 10.8 }; sc.foes = { x: 9, y: 5.2 };
  },
  camp(sc) {
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H] }, { t: "dirtc", c: [9, 6.2], r: 4 }];
    scAdd(sc, "campfire", 9, 6.2, 1.4, 1.4); for (const a of [0.3, 2.3, 4.2]) scAdd(sc, "log", 9 + Math.cos(a) * 1.75, 6.2 + Math.sin(a) * 1.5, 1.6, .5, { r: Math.round(a * 57 + 90), act: false });
    for (const a of [3.6, 5.3, 1.3]) scAdd(sc, "tent", 9 + Math.cos(a) * 4.1, 6.2 + Math.sin(a) * 3.3, 2.2, 1.8, { r: Math.round(a * 57 + 90) });
    scAdd(sc, "bedroll", 12.4, 8.6, .9, 1.8, { r: 15 }); scAdd(sc, "crate", 5.4, 8.8, 1, 1); scAdd(sc, "sack", 6.3, 9.3, .9, .7);
    sc.anchors.sit.push({ x: 9 + Math.cos(.3) * 1.75, y: 6.2 + Math.sin(.3) * 1.5 }, { x: 9 + Math.cos(2.3) * 1.75, y: 6.2 + Math.sin(2.3) * 1.5 }, { x: 9 + Math.cos(4.2) * 1.75, y: 6.2 + Math.sin(4.2) * 1.5 });
    scScatter(sc, "tree", 9, [0, 0, SC_W, SC_H], 2.6, 2.6, { pad: 0, ghost: true, act: false, avoid: (x, y) => ((x - 9) / 6.6) ** 2 + ((y - 6.2) / 5) ** 2 < 1 });
    sc.spawn = { x: 9, y: 10.6 }; sc.foes = { x: 9, y: 2.6 };
  },
  farm(sc) {
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H] }, { t: "field", box: [.6, .6, 7.8, 11.4] }, { t: "path", pts: [[10, 12.4], [10.4, 8], [12, 5.5]] }];
    sc.g.block((x, y) => x < 7.9); for (let y = 1; y < 11.5; y += 1.4) scAdd(sc, "fencep", 8.4, y, .25, .25, { ghost: true, act: false });
    sc.objs.push({ k: "fence", x: 8.4, y: 6, w: .2, h: 10.8, act: false, id: "ofence" });
    scAdd(sc, "roof", 14, 2.6, 6.2, 4.2, { label: "амбар", acc: "амбар", search: true }); scAdd(sc, "hay", 10.4, 2.4, 1.6, 1.1); scAdd(sc, "hay", 10.6, 3.8, 1.3, .9, { r: 10 });
    scAdd(sc, "well", 13.6, 7.8, 1.3, 1.3); scAdd(sc, "cart", 15.6, 9.6, 1.4, 2.4, { r: 10 }); scAdd(sc, "barrel", 11.8, 9.8, .9, .9);
    sc.anchors.work.push({ x: 7, y: 4 }, { x: 6, y: 8 }); sc.spawn = { x: 10.4, y: 10.8 }; sc.foes = { x: 13, y: 5.5 };
    scScatter(sc, "tree", 2, [9, 5, 18, 12], 2.4, 2.4, { pad: 0, ghost: true, act: false, avoid: (x, y) => Math.abs(x - 10.4) < 2 || Math.hypot(x - 13.6, y - 7.8) < 2 });
  },
  pier(sc) {
    const shore = y => 6.6 + Math.sin(y * .55 + 1.2) * .7;
    sc.floor = [{ t: "dirt", box: [0, 0, SC_W, SC_H] }, { t: "sand", shore: y => shore(y) + 3.2 }, { t: "water", shore }, { t: "deck", box: [.6, 4.1, 9.4, 6.3] }, { t: "deck", box: [2.2, 8.4, 6.8, 9.5] }];
    sc.g.block((x, y) => x < shore(y) + .2 && !(x > .6 && x < 9.4 && y > 4.1 && y < 6.3) && !(x > 2.2 && x < 6.8 && y > 8.4 && y < 9.5));
    for (let x = 1; x < 9.4; x += 2) { scAdd(sc, "post", x, 4, .3, .3, { ghost: true, act: false }); scAdd(sc, "post", x, 6.4, .3, .3, { ghost: true, act: false }); }
    scAdd(sc, "boat", 3.4, 3.05, 3, 1.2, { ghost: true }); scAdd(sc, "boat", 4.6, 7.35, 2.7, 1.1, { ghost: true, r: 180, v: .3 }); scAdd(sc, "boat", 1.6, 10.6, 2.6, 1.1, { ghost: true, r: -20, v: .7 });
    scAdd(sc, "net", 6.4, 5.2, 1.6, 1.2, { r: 12 }); scAdd(sc, "lamppost", 1.1, 4.4, .4, .4, { act: false }); scAdd(sc, "barrel", 10.4, 3.4, .9, .9); scAdd(sc, "barrel", 11.2, 2.7, .9, .9); scAdd(sc, "crate", 10.6, 7.7, 1.05, 1.05, { r: 8 });
    scAdd(sc, "net", 12.4, 9.6, 1.8, 1.3, { label: "сохнущие сети", acc: "сохнущие сети", r: -8 }); scAdd(sc, "roof", 15.2, 3.4, 4.6, 3.4, { label: "сарай для снастей", acc: "сарай для снастей", search: true, v: .2 });
    scScatter(sc, "rock", 4, [0, 0, 9, SC_H], 1, .8, { ghost: true, act: false, vary: true, rot: true, pad: 0, avoid: (x, y) => x > shore(y) - .2 || (y > 3 && y < 7.6) || (y > 8 && y < 9.9 && x > 1.8) });
    sc.anchors.work.push({ x: 7.6, y: 5.2 }, { x: 11.9, y: 8.8 }); sc.spawn = { x: 13.6, y: 9.4 }; sc.foes = { x: 9.6, y: 5.2 };
  },
  wreck(sc) {
    const shore = x => 7.6 - x * .42 + Math.sin(x * .8) * .5;
    sc.floor = [{ t: "sand", box: [0, 0, SC_W, SC_H] }, { t: "waterTop", shore }];
    sc.g.block((x, y) => y < shore(x) - .2);
    scAdd(sc, "hull", 8.4, 6.3, 6.6, 2.5, { r: -22 }); scScatter(sc, "plank", 6, [2, 4, 17, 11.5], 1.6, .3, { rot: true, act: false, pad: .3 });
    scScatter(sc, "crate", 5, [3, 5, 17, 11.5], 1, 1, { rot: true, label: "разбитый ящик", acc: "разбитый ящик", pad: .5 }); scAdd(sc, "barrel", 13.4, 9.2, .9, .9);
    scScatter(sc, "rock", 6, [0, 0, SC_W, SC_H], 1.2, 1, { vary: true, rot: true, act: false, pad: .3, ghost: true });
    scScatter(sc, "kelp", 5, [0, 3, SC_W, SC_H], 1.4, .6, { ghost: true, act: false, rot: true, under: true, pad: 0 });
    sc.spawn = { x: 14.6, y: 10.6 }; sc.foes = { x: 6, y: 8.2 };
  },
  forest(sc) {
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H], dark: true }, { t: "path", pts: [[8.4, 12.4], [9.8, 8.6], [7.6, 5], [9.4, -0.4]], w: 1.3 }];
    const near = (x, y) => [[8.4, 12], [9.8, 8.6], [7.6, 5], [9.4, 0]].some(([px, py]) => Math.hypot(x - px, y - py) < 2.2) || Math.abs(x - (8.6 + Math.sin(y * .5) * 1.2)) < 1.3;
    scScatter(sc, "tree", 17, [-1, -1, SC_W + 1, SC_H + 1], 2.8, 2.8, { pad: -.4, ghost: true, act: false, avoid: near });
    scScatter(sc, "rock", 3, [1, 1, 17, 11], 1.3, 1.1, { vary: true, rot: true, act: false, avoid: near }); scScatter(sc, "stump", 2, [1, 1, 17, 11], .8, .8, { act: false, avoid: near });
    scScatter(sc, "bush", 9, [0, 0, SC_W, SC_H], 1.1, 1.1, { pad: .1, ghost: true, act: false, avoid: near }); sc.g.block((x, y) => !near(x, y) && sc.objs.some(o => o.k === "tree" && Math.hypot(o.x - x, o.y - y) < .9));
    sc.spawn = { x: 8.8, y: 10.8 }; sc.foes = { x: 8.2, y: 4.4 }; sc.dark = .12;
  },
  bridge(sc) {
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H] }, { t: "river", x0: 7.2, x1: 10.8 }, { t: "path", pts: [[-0.4, 6], [6.8, 6.1]] }, { t: "path", pts: [[11.2, 6.1], [18.4, 6.3]] }, { t: "deck", box: [6.5, 5.1, 11.5, 7.1], vert: true }];
    sc.g.block((x, y) => x > 7 && x < 11 && !(y > 5.1 && y < 7.1));
    for (const x of [6.7, 8.4, 10, 11.3]) { scAdd(sc, "post", x, 5.05, .3, .3, { ghost: true, act: false }); scAdd(sc, "post", x, 7.15, .3, .3, { ghost: true, act: false }); }
    scScatter(sc, "tree", 7, [0, 0, SC_W, SC_H], 2.6, 2.6, { pad: 0, ghost: true, act: false, avoid: (x, y) => (x > 6 && x < 12) || Math.abs(y - 6.1) < 2 });
    scScatter(sc, "rock", 5, [6.4, 0, 11.6, SC_H], .9, .8, { vary: true, rot: true, act: false, ghost: true, pad: 0, avoid: (x, y) => Math.abs(y - 6.1) < 1.6 });
    scScatter(sc, "reeds", 6, [6, 0, 12, SC_H], 1, 1, { ghost: true, act: false, pad: 0, avoid: (x, y) => Math.abs(y - 6.1) < 1.8 || (x > 7.6 && x < 10.4) });
    sc.spawn = { x: 2.4, y: 6.6 }; sc.foes = { x: 14.6, y: 6.1 };
  },
  square(sc) {
    sc.floor = [{ t: "cobble", box: [0, 0, SC_W, SC_H] }];
    scAdd(sc, "roof", 3.2, 1.6, 5.4, 3.2, { label: "дом", acc: "дом", act: false, v: .1 }); scAdd(sc, "roof", 9.4, 1.4, 5, 2.8, { label: "лавка", acc: "лавку", act: true, v: .5 }); scAdd(sc, "roof", 15.4, 1.8, 5.2, 3.6, { label: "дом", acc: "дом", act: false, v: .8 });
    scAdd(sc, "well", 9, 6.6, 1.5, 1.5); scAdd(sc, "stall", 4.4, 8.4, 2.6, 1.4, { v: .2 }); scAdd(sc, "stall", 13.8, 8.6, 2.6, 1.4, { v: .7 }); scAdd(sc, "cart", 15.8, 5.6, 1.4, 2.4, { r: 80 });
    scAdd(sc, "barrel", 6.2, 9.6, .85, .85); scAdd(sc, "crate", 12, 9.7, 1, 1); scAdd(sc, "lamppost", 6.6, 4.4, .4, .4, { act: false }); scAdd(sc, "lamppost", 11.6, 4.4, .4, .4, { act: false });
    scAdd(sc, "tree", 1.6, 10.2, 2.6, 2.6, { ghost: true, act: false }); sc.anchors.work.push({ x: 4.4, y: 9.4 }, { x: 13.8, y: 9.6 }); sc.spawn = { x: 9, y: 10.8 }; sc.foes = { x: 9, y: 4.6 };
  },
  gate(sc) {
    sc.floor = [{ t: "dirt", box: [0, 0, SC_W, SC_H] }, { t: "cobble", box: [0, 3, SC_W, SC_H] }, { t: "path", pts: [[9, -0.4], [9, 3.6]], w: 2 }];
    scAdd(sc, "citywall", 4, 2.4, 8, 1.1, { act: false }); scAdd(sc, "citywall", 14, 2.4, 8, 1.1, { act: false }); scAdd(sc, "towerb", 7.4, 2.4, 1.9, 1.9, { act: false }); scAdd(sc, "towerb", 10.6, 2.4, 1.9, 1.9, { act: false });
    sc.g.block((x, y) => y < 2.95 && !(x > 8.4 && x < 9.6)); scAdd(sc, "torch", 8.15, 3.2, .3, .3, { ghost: true, act: false }); scAdd(sc, "torch", 9.85, 3.2, .3, .3, { ghost: true, act: false });
    scAdd(sc, "table", 4.2, 5.4, 1.8, 1, { label: "стол стражи", acc: "стол стражи" }); scAdd(sc, "barrel", 3, 6.4, .9, .9); scAdd(sc, "brazier", 5.8, 6.2, .9, .9); scAdd(sc, "cart", 13.4, 7, 1.4, 2.4, { r: 95 });
    scAdd(sc, "crate", 14.8, 9.4, 1, 1); sc.anchors.work.push({ x: 8.2, y: 4 }, { x: 9.8, y: 4 }); sc.spawn = { x: 9, y: 10.6 }; sc.foes = { x: 9, y: .9 };
  }
};
const sceneCache = new Map();
function sceneOf(id) {
  const key = WD.id + ":" + id; let sc = sceneCache.get(key); if (sc) return sc;
  sc = { id, tpl: sceneTpl(id), objs: [], rooms: [], lights: [], floor: [], anchors: { work: [], sit: [], stand: [] }, g: new ScGrid(), R: mulberry(hash(key)), spawn: { x: 9, y: 10.5 }, foes: { x: 9, y: 4 }, dark: 0 };
  SC_BUILD[sc.tpl](sc); sceneCache.set(key, sc); return sc;
}
function scState(id) { S.scenes = S.scenes || {}; return S.scenes[id] || (S.scenes[id] = { add: [], removed: [], player: null, crowd: null }); }
function scFreeNear(sc, taken, x, y, maxR) {
  for (let r = 0; r <= (maxR || 4); r += .5) for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + r; const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
    if (sc.g.free(px, py, .8, .8) && !taken.some(t => Math.hypot(t.x - px, t.y - py) < 1)) return { x: px, y: py }; if (r === 0) break; }
  return { x, y };
}
/* динамическая часть: игрок, персонажи, фоновые люди, враги, добавленные предметы */
function scenePeople(id) {
  const sc = sceneOf(id), st = scState(id), loc = POIS[id], t = worldTime(); const R = mulberry(hash(id + ":" + t.day + ":" + t.part)); const taken = []; const out = [];
  const pl = st.player || sc.spawn; const pp = scFreeNear(sc, [], pl.x, pl.y, 3); taken.push(pp); out.push({ type: "hero", x: pp.x, y: pp.y });
  const pools = { work: [...sc.anchors.work], sit: [...sc.anchors.sit], stand: [...sc.anchors.stand] };
  const pick = kind => { const p = pools[kind]; while (p.length) { const i = Math.floor(R() * p.length); const a = p.splice(i, 1)[0]; if (!taken.some(q => Math.hypot(q.x - a.x, q.y - a.y) < .9)) return a; } return null; };
  (loc.npcs || []).filter(nid => NPCS[nid]).forEach(nid => { const n = NPCS[nid]; const worker = /хозя|трактир|корчм|бармен|торгов|продав|кузнец|лавоч|жри|свящ|монах|сестр|отец|староста|страж|смотрит/i.test(n.role || "");
    const a = (worker && pick("work")) || pick("stand") || pick("sit") || null; const p = a ? (sc.g.free(a.x, a.y, .5, .5) || pools.sit ? a : scFreeNear(sc, taken, a.x, a.y)) : scFreeNear(sc, taken, sc.spawn.x + (R() - .5) * 8, sc.spawn.y - 2 - R() * 5);
    taken.push(p); out.push({ type: "npc", id: nid, x: p.x, y: p.y }); });
  const [labels, counts] = SC_CROWD[sc.tpl] || [[], [0, 0, 0, 0]]; const foesHere = Object.keys(ENEMIES).some(e => ENEMIES[e].loc === id && S.world.enemies[e]?.alive);
  let n = st.crowd != null ? st.crowd : (labels.length && !foesHere ? counts[t.part] : 0); n = clamp(n, 0, 8);
  for (let i = 0; i < n; i++) { const a = pick("sit") || pick("stand") || pick("work"); const p = a && !taken.some(q => Math.hypot(q.x - a.x, q.y - a.y) < .9) ? a : scFreeNear(sc, taken, 2 + R() * 14, 2 + R() * 8);
    taken.push(p); out.push({ type: "crowd", id: "c" + i, label: labels.length ? labels[Math.floor(R() * labels.length)] : "местный", x: p.x, y: p.y }); }
  const foes = Object.keys(ENEMIES).filter(e => ENEMIES[e].loc === id && S.world.enemies[e]);
  foes.forEach((e, i) => { const es = S.world.enemies[e]; if (!es.alive) { const p = scFreeNear(sc, [], sc.foes.x + (i - foes.length / 2) * 1.6, sc.foes.y + (i % 2) * .8, 3); out.push({ type: "corpse", id: e, x: p.x, y: p.y }); return; }
    if (!S.world.combat) return; const p = scFreeNear(sc, taken, sc.foes.x + (i - (foes.length - 1) / 2) * 1.5, sc.foes.y + (i % 2) * .9, 4); taken.push(p); out.push({ type: "foe", id: e, x: p.x, y: p.y }); });
  return out;
}
function sceneObjects(id) {
  const sc = sceneOf(id), st = scState(id); const gone = new Set((st.removed || []).map(s => s.toLowerCase()));
  return [...sc.objs, ...(st.add || []).map((a, i) => ({ ...a, id: "a" + i, act: true, search: true, w: a.w || .9, h: a.h || .9, v: .5 }))].filter(o => !gone.has(String(o.label).toLowerCase()));
}
const SC_ADD_KINDS = { chest: [1.1, .75], crate: [1, 1], barrel: [.9, .9], table: [1.8, 1], bed: [1.5, 2.3], altar: [1.8, 1], statue: [1, 1], body: [1.4, .7], item: [.6, .6], fire: [1.2, 1.2], lantern: [.4, .4], boat: [2.6, 1.1], rock: [1, .9], bell: [1.1, 1.1], cart: [1.4, 2.4], cauldron: [.9, .9], sack: [.9, .75] };
function sceneEffects(e) {
  if (!e || typeof e !== "object" || !S) return; const id = S.world.loc; const st = scState(id); const sc = sceneOf(id);
  (Array.isArray(e.add) ? e.add : []).slice(0, 3).forEach((a, i) => { const label = str(a?.label, 32); if (!label || sceneObjects(id).some(o => String(o.label).toLowerCase() === label.toLowerCase())) return;
    let k = String(a.kind || "item"); if (k === "fire") k = "campfire"; if (!SC_ADD_KINDS[a.kind] && !SC_ADD_KINDS[k]) k = "item"; const [w, h] = SC_ADD_KINDS[a.kind] || SC_ADD_KINDS[k] || [.6, .6];
    const R = mulberry(hash(label + i)); const taken = (st.add || []).map(o => ({ x: o.x, y: o.y })); const p = scFreeNear(sc, taken, 4 + R() * 10, 3 + R() * 6, 6);
    st.add.push({ k, label, acc: str(a.acc, 40) || label, x: +p.x.toFixed(2), y: +p.y.toFixed(2), w, h }); pushFeed({ t: "chips", items: [{ c: "item", x: `На плане: ${label}` }] }); });
  (Array.isArray(e.remove) ? e.remove : []).slice(0, 3).forEach(l => { const s = str(l, 32); if (!s) return; const i = st.add.findIndex(a => a.label.toLowerCase() === s.toLowerCase()); if (i >= 0) st.add.splice(i, 1); else if (!st.removed.includes(s)) st.removed.push(s); });
  if (e.crowd != null && Number.isFinite(Number(e.crowd))) st.crowd = clamp(Math.round(Number(e.crowd)), 0, 8);
}
function sceneBriefLine() {
  const id = S.world.loc; const objs = sceneObjects(id).filter(o => o.act && !o.hidden); const ppl = scenePeople(id); const hero = ppl[0];
  const near = objs.map(o => [o, Math.hypot(o.x - hero.x, o.y - hero.y) - Math.max(o.w, o.h) / 2]).sort((a, b) => a[1] - b[1])[0];
  const crowd = ppl.filter(p => p.type === "crowd").map(p => p.label);
  return `ПЛАН СЦЕНЫ (видит игрок): предметы и мебель — ${[...new Set(objs.map(o => o.label))].join(", ") || "почти пусто"}; безымянные люди фоном — ${crowd.length ? crowd.length + " (" + [...new Set(crowd)].join(", ") + ")" : "нет"}${near && near[1] < 1.6 ? `; герой стоит рядом: ${near[0].label}` : ""}.`;
}

/* ---------- отрисовка ---------- */
let scSeq = 0;
const SCP = { wood: ["#6f4c2f", "#8b6340", "#3d2a1a"], dwood: ["#4f3420", "#6b4a2e", "#2a1b10"], stone: ["#6f7471", "#8d928c", "#3f4341"], cloth: ["#7b2f2a", "#a8843c"], leaf: ["#24391f", "#2f4a2a", "#3e5f34", "#4e7340"] };
const f1 = n => Math.round(n * 10) / 10;
function scFloorSVG(sc, P, R) {
  let s = ""; const W = SC_W * CS, H = SC_H * CS;
  const planks = (b, vert) => { const [x0, y0, x1, y1] = b.map(v => v * CS); let o = `<g clip-path="url(#${P}-c${Math.round(x0)}_${Math.round(y0)})">`; const bh = 14;
    if (!vert) for (let y = y0; y < y1; y += bh) { let x = x0 - R() * 60; while (x < x1) { const len = 50 + R() * 90; const L = 20 + R() * 9; o += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(len)}" height="${bh}" fill="hsl(28,${30 + R() * 8 | 0}%,${L | 0}%)"/>`; if (R() < .35) o += `<line x1="${f1(x + 6)}" y1="${f1(y + bh * .45)}" x2="${f1(x + len - 8)}" y2="${f1(y + bh * .5)}" stroke="#1b120a" stroke-opacity=".25"/>`; o += `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x)}" y2="${f1(y + bh)}" stroke="#1c130b" stroke-width="1.2"/>`; x += len; } o += `<line x1="${x0}" y1="${f1(y)}" x2="${x1}" y2="${f1(y)}" stroke="#1c130b" stroke-width="1.4"/>`; }
    else for (let x = x0; x < x1; x += bh) { let y = y0 - R() * 40; while (y < y1) { const len = 40 + R() * 70; const L = 22 + R() * 9; o += `<rect x="${f1(x)}" y="${f1(y)}" width="${bh}" height="${f1(len)}" fill="hsl(30,${28 + R() * 8 | 0}%,${L | 0}%)"/><line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x + bh)}" y2="${f1(y)}" stroke="#1c130b" stroke-width="1.2"/>`; y += len; } o += `<line x1="${f1(x)}" y1="${y0}" x2="${f1(x)}" y2="${y1}" stroke="#1c130b" stroke-width="1.4"/>`; }
    return `<clipPath id="${P}-c${Math.round(x0)}_${Math.round(y0)}"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/></clipPath>${o}</g>`; };
  const flags = (b, broken, circ) => { const [x0, y0, x1, y1] = b.map(v => v * CS); const id = `${P}-f${Math.round(x0)}`; let o = `<g clip-path="url(#${id})"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#232628"/>`;
    for (let y = y0, r = 0; y < y1; y += 30, r++) for (let x = x0 - (r % 2) * 18; x < x1; x += 36) { if (broken && R() < .22) continue; const L = 28 + R() * 12; o += `<rect x="${f1(x + 1.5)}" y="${f1(y + 1.5)}" width="${f1(33 - R() * 4)}" height="${f1(27 - R() * 3)}" rx="3" fill="hsl(${190 + R() * 30 | 0},${4 + R() * 5 | 0}%,${L | 0}%)"/>`; if (R() < .12) o += `<path d="M${f1(x + 6)} ${f1(y + 8)} l${f1(8 + R() * 8)} ${f1(5 + R() * 6)} l${f1(4 + R() * 6)} ${f1(-2)}" stroke="#1d2022" fill="none"/>`; }
    const clip = circ ? `<circle cx="${circ[0] * CS}" cy="${circ[1] * CS}" r="${circ[2] * CS}"/>` : `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}"/>`;
    return `<clipPath id="${id}">${clip}</clipPath>${o}</g>`; };
  const blobs = (b, cols, n, rmin, rmax, op) => { const [x0, y0, x1, y1] = b.map(v => v * CS); let o = ""; for (let i = 0; i < n; i++) o += `<circle cx="${f1(x0 + R() * (x1 - x0))}" cy="${f1(y0 + R() * (y1 - y0))}" r="${f1(rmin + R() * (rmax - rmin))}" fill="${cols[Math.floor(R() * cols.length)]}" opacity="${op}"/>`; return o; };
  const strip = (pts, w, fill, edge) => { const d = "M" + pts.map(p => `${f1(p[0] * CS)} ${f1(p[1] * CS)}`).join(" L"); return `<path d="${d}" stroke="${edge}" stroke-width="${w * CS + 8}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity=".7"/><path d="${d}" stroke="${fill}" stroke-width="${w * CS}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`; };
  for (const f of sc.floor) {
    if (f.t === "planks") s += planks(f.box);
    else if (f.t === "deck") s += `<rect x="${f.box[0] * CS - 3}" y="${f.box[1] * CS + 5}" width="${(f.box[2] - f.box[0]) * CS + 6}" height="${(f.box[3] - f.box[1]) * CS}" fill="#000" opacity=".35"/>` + planks(f.box, !f.vert);
    else if (f.t === "flag") s += flags(f.box, f.broken);
    else if (f.t === "flagc") s += flags([f.c[0] - f.r, f.c[1] - f.r, f.c[0] + f.r, f.c[1] + f.r], false, [f.c[0], f.c[1], f.r]);
    else if (f.t === "grass" || f.t === "rockg") { const dark = f.dark || f.t === "rockg"; s += `<rect width="${W}" height="${H}" fill="${f.t === "rockg" ? "#2d3a2c" : dark ? "#283d25" : "#334d2c"}"/>` + blobs(f.box, f.t === "rockg" ? ["#3b4637", "#24301f", "#4a5148"] : ["#3d5a33", "#2a4224", "#466839", "#22361d"], 120, 12, 46, .35);
      for (let i = 0; i < 160; i++) { const x = R() * W, y = R() * H; s += `<path d="M${f1(x)} ${f1(y)} l-2 -6 M${f1(x)} ${f1(y)} l2 -7 M${f1(x)} ${f1(y)} l5 -5" stroke="${R() < .5 ? "#5c8247" : "#3f6334"}" stroke-width="1.1" opacity=".55"/>`; } }
    else if (f.t === "dirt") s += `<rect x="${f.box[0] * CS}" y="${f.box[1] * CS}" width="${(f.box[2] - f.box[0]) * CS}" height="${(f.box[3] - f.box[1]) * CS}" fill="#4a3a29"/>` + blobs(f.box, ["#5a4632", "#3c2f21", "#64503a"], 70, 8, 30, .45) + blobs(f.box, ["#7a6a55"], 60, 1, 2.4, .7);
    else if (f.t === "dirtc") s += `<ellipse cx="${f.c[0] * CS}" cy="${f.c[1] * CS}" rx="${f.r * CS * 1.15}" ry="${f.r * CS * .9}" fill="#4d3d2a" opacity=".85"/>` + blobs([f.c[0] - f.r, f.c[1] - f.r * .7, f.c[0] + f.r, f.c[1] + f.r * .7], ["#5d4a35", "#3c2f21"], 30, 8, 22, .4);
    else if (f.t === "cave") { s += `<rect width="${W}" height="${H}" fill="#27241f"/>` + blobs(f.box, ["#322e28", "#1f1c18", "#3a352d"], 90, 10, 40, .5) + blobs(f.box, ["#57524a"], 80, 1, 2.5, .5); }
    else if (f.t === "cobble") { s += `<rect width="${W}" height="${H}" fill="#2c2a27"/>`; for (let y = 0; y < H; y += 13) for (let x = -(y % 26 ? 7 : 0); x < W; x += 15) s += `<rect x="${f1(x + 1 + R() * 2)}" y="${f1(y + 1 + R() * 2)}" width="${f1(11 + R() * 2)}" height="${f1(9 + R() * 2)}" rx="4" fill="hsl(${25 + R() * 20 | 0},${5 + R() * 6 | 0}%,${30 + R() * 12 | 0}%)"/>`; }
    else if (f.t === "path") s += strip(f.pts, f.w || 1.1, "#5b4834", "#3d3022");
    else if (f.t === "field") { const [x0, y0, x1, y1] = f.box.map(v => v * CS); s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#4a3826" rx="4"/>`; for (let x = x0 + 8; x < x1 - 4; x += 16) { s += `<line x1="${x}" y1="${y0 + 6}" x2="${x}" y2="${y1 - 6}" stroke="#2e2216" stroke-width="5" stroke-linecap="round"/>`; for (let y = y0 + 10; y < y1 - 8; y += 9 + R() * 4) s += `<circle cx="${f1(x + 8 + (R() - .5) * 3)}" cy="${f1(y)}" r="${f1(2.2 + R() * 1.6)}" fill="${R() < .5 ? "#6f8a3b" : "#8a9a44"}"/>`; } }
    else if (f.t === "sand") { const pts = []; if (f.shore) { for (let y = 0; y <= SC_H; y += .25) pts.push(`${f1(f.shore(y) * CS)},${f1(y * CS)}`); s += `<polygon points="0,0 ${pts.join(" ")} 0,${H}" fill="#a8916a"/>`; } else s += `<rect width="${W}" height="${H}" fill="#a8916a"/>`;
      s += blobs([0, 0, SC_W, SC_H], ["#b9a37c", "#96805b"], 60, 10, 40, .35).replace(/<circle/g, `<circle clip-path="url(#${P}-sand)"`); for (let i = 0; i < 30; i++) { const x = R() * W, y = R() * H; s += `<path d="M${f1(x)} ${f1(y)} q14 -5 28 0" stroke="#c7b48e" fill="none" opacity=".35" clip-path="url(#${P}-sand)"/>`; }
      s += `<clipPath id="${P}-sand">${f.shore ? `<polygon points="0,0 ${pts.join(" ")} 0,${H}"/>` : `<rect width="${W}" height="${H}"/>`}</clipPath>`; }
    else if (f.t === "water" || f.t === "waterTop" || f.t === "river") {
      let poly; if (f.t === "water") { const p = []; for (let y = 0; y <= SC_H; y += .25) p.push(`${f1(f.shore(y) * CS)},${f1(y * CS)}`); poly = `0,0 ${p.join(" ")} 0,${H}`; }
      else if (f.t === "waterTop") { const p = []; for (let x = 0; x <= SC_W; x += .25) p.push(`${f1(x * CS)},${f1(f.shore(x) * CS)}`); poly = `0,0 ${p.join(" ")} ${W},0`; }
      else { const l = [], r = []; for (let y = 0; y <= SC_H; y += .25) { const w = Math.sin(y * .7) * .35; l.push(`${f1((f.x0 + w) * CS)},${f1(y * CS)}`); r.unshift(`${f1((f.x1 + w) * CS)},${f1(y * CS)}`); } poly = [...l, ...r].join(" "); }
      s += `<clipPath id="${P}-wclip"><polygon points="${poly}"/></clipPath><polygon points="${poly}" fill="none" stroke="#c9b98f" stroke-width="10" opacity=".5"/><polygon points="${poly}" fill="url(#${P}-water)" stroke="#1a3a44" stroke-width="3"/>`;
      s += `<g clip-path="url(#${P}-wclip)">`; for (let i = 0; i < 26; i++) { const x = R() * W, y = R() * H; s += `<path class="sc-wave" style="animation-delay:-${(R() * 6).toFixed(1)}s" d="M${f1(x)} ${f1(y)} q10 -4 20 0 t20 0" stroke="#8fc3cf" stroke-width="1.4" fill="none" opacity=".35"/>`; } s += `</g>`;
    }
  }
  return s;
}
function scRoomSVG(sc) {
  let s = "";
  for (const r of sc.rooms) {
    const [x0, y0, x1, y1] = [r.x0, r.y0, r.x1, r.y1].map(v => v * CS); const col = r.mat === "stone" ? "#5b605d" : r.mat === "log" ? "#4a3220" : "#3b2a1c"; const hi = r.mat === "stone" ? "#878c86" : "#6b4c31"; const t = r.mat === "stone" ? 13 : 11;
    const dx = r.door * CS, dw = 46;
    const seg = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${col}" stroke-width="${t}" stroke-linecap="square"/><line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${hi}" stroke-width="2" stroke-opacity=".7" transform="translate(0,-${t / 2 - 1.5})"/>`;
    s += `<g filter="url(#SCP-wsh)">${seg(x0, y0, x1, y0)}${seg(x0, y0, x0, y1)}${seg(x1, y0, x1, y1)}${seg(x0, y1, dx - dw / 2, y1)}${seg(dx + dw / 2, y1, x1, y1)}</g>`;
    if (r.mat === "log") for (let x = x0; x <= x1; x += 18) s += `<circle cx="${x}" cy="${y0}" r="4" fill="#5c4029" stroke="#2b1c10"/>`;
    s += `<path d="M${dx - dw / 2} ${y1} a${dw} ${dw} 0 0 0 ${dw * .72} ${-dw * .68}" fill="none" stroke="#a88a5c" stroke-width="1" stroke-dasharray="3 3" opacity=".6"/><line x1="${dx - dw / 2}" y1="${y1}" x2="${dx - dw / 2 + 6}" y2="${y1 - dw + 4}" stroke="#7b5634" stroke-width="5" stroke-linecap="round"/>`;
    for (const w of r.windows) { const c = w.c || "#a9cbe0"; if (w.s === "t") s += `<rect x="${w.p * CS - 16}" y="${y0 - 3}" width="32" height="6" fill="${c}" opacity=".85"/>`; else { const xx = w.s === "l" ? x0 : x1; s += `<rect x="${xx - 3}" y="${w.p * CS - 16}" width="6" height="32" fill="${c}" opacity=".85"/>`; } }
  }
  if (sc.round) { const { cx, cy, r } = sc.round; s += `<g filter="url(#SCP-wsh)"><circle cx="${cx * CS}" cy="${cy * CS}" r="${r * CS}" fill="none" stroke="#585c58" stroke-width="18" stroke-dasharray="${(2 * Math.PI * r * CS) - 50} 50" stroke-dashoffset="${-(Math.PI / 2) * r * CS + 25 - (2 * Math.PI * r * CS) * 0}"/><circle cx="${cx * CS}" cy="${cy * CS}" r="${r * CS - 8}" fill="none" stroke="#8a8e88" stroke-width="2" opacity=".5" stroke-dasharray="${(2 * Math.PI * (r * CS - 8)) - 50} 50" stroke-dashoffset="${-(Math.PI / 2) * (r * CS - 8) + 25}"/></g>`; }
  if (sc.cave) { const { cx, cy, rx, ry, rad } = sc.cave; const pts = []; for (let a = 0; a < Math.PI * 2; a += .08) { let rr = rad(a); const bottom = Math.abs(a - Math.PI / 2) < .18; pts.push(`${f1((cx + Math.cos(a) * rx * rr) * CS)},${f1((cy + Math.sin(a) * ry * rr * (bottom ? 1.35 : 1)) * CS)}`); }
    s += `<path d="M0 0 H${SC_W * CS} V${SC_H * CS} H0 Z M${pts.join(" L")} Z" fill-rule="evenodd" fill="url(#${"SCP"}-rock)" stroke="#57524a" stroke-width="3" filter="url(#SCP-wsh)"/>`; }
  return s;
}
function scObjSVG(o, R) {
  const w = o.w * CS, h = o.h * CS, hw = w / 2, hh = h / 2, v = o.v ?? .5; let s = "";
  const wood = (l = 0) => `hsl(28,${34 - l * 4}%,${27 + l * 8 + v * 5}%)`;
  switch (o.k) {
    case "bar": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="3" fill="#4a3220" stroke="#22160c" stroke-width="2"/><rect x="${-hw + 3}" y="${-hh + 3}" width="${w - 6}" height="${h * .42}" fill="#6b4a2e"/>${[...Array(5)].map((_, i) => `<circle cx="${f1(-hw + 18 + i * (w - 36) / 4)}" cy="${f1(hh * .25)}" r="4" fill="#c9b27a" stroke="#5b4320"/>`).join("")}`; break;
    case "shelf": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" fill="#3a271a" stroke="#1d130b"/>${[...Array(Math.floor(w / 9))].map((_, i) => `<circle cx="${f1(-hw + 6 + i * 9)}" cy="${f1((R() - .5) * 3)}" r="${f1(2.6 + R() * 1.2)}" fill="${["#3f6b3a", "#6b3a2a", "#8a6a2a", "#2f4f5f", "#6a2a4a"][Math.floor(R() * 5)]}"/>`).join("")}`; break;
    case "barrel": s = `<circle r="${hw}" fill="#7a5434" stroke="#2b1d12" stroke-width="2"/><circle r="${hw * .72}" fill="none" stroke="#3b2a1b" stroke-width="2.4"/><circle r="${hw * .42}" fill="#8e6640"/><line x1="${-hw * .4}" y1="0" x2="${hw * .4}" y2="0" stroke="#5a3e26"/>`; break;
    case "rtable": s = `<circle r="${hw}" fill="${wood(0)}" stroke="#2a1c11" stroke-width="2"/><circle r="${hw * .78}" fill="none" stroke="#2a1c11" stroke-opacity=".35"/>${R() < .7 ? `<circle cx="${f1(hw * .3)}" cy="${f1(-hw * .25)}" r="4.5" fill="#b8a37a" stroke="#5b4a2a"/>` : ""}${R() < .6 ? `<circle cx="${f1(-hw * .35)}" cy="${f1(hw * .2)}" r="6" fill="#d8d0bd" stroke="#8a826f"/>` : ""}`; break;
    case "table": case "table_map": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="3" fill="${wood(0)}" stroke="#2a1c11" stroke-width="2"/>${[1, 2].map(i => `<line x1="${-hw + 3}" y1="${f1(-hh + i * h / 3)}" x2="${hw - 3}" y2="${f1(-hh + i * h / 3)}" stroke="#2a1c11" stroke-opacity=".3"/>`).join("")}${o.k === "table_map" ? `<rect x="${-hw * .7}" y="${-hh * .6}" width="${w * .55}" height="${h * .6}" fill="#d9c9a0" transform="rotate(-6)"/><path d="M${-hw * .5} ${-hh * .2} q8 -6 16 2 t14 -2" stroke="#7a5a3a" fill="none"/><circle cx="${hw * .55}" cy="${-hh * .3}" r="3" fill="#f4e3b0"/>` : `<rect x="${-6}" y="${-4}" width="12" height="8" rx="2" fill="#a8956a" opacity=".8"/>`}`; break;
    case "stool": s = `<circle r="${hw}" fill="#5a3d26" stroke="#24170d" stroke-width="1.5"/>`; break;
    case "chair": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2" fill="#5a3d26" stroke="#24170d" stroke-width="1.5"/><rect x="${-hw}" y="${-hh}" width="${w}" height="4" fill="#3b2817"/>`; break;
    case "hearth": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="4" fill="#55534e" stroke="#2c2b28" stroke-width="2"/><rect x="${-hw + 6}" y="${-hh + 8}" width="${w - 14}" height="${h - 16}" rx="3" fill="#1a110b"/><g class="sc-fire"><ellipse cx="${-2}" cy="0" rx="${w * .22}" ry="${h * .28}" fill="#e8642c"/><ellipse cx="${-2}" cy="1" rx="${w * .13}" ry="${h * .17}" fill="#ffc35a"/></g>`; break;
    case "stairs": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" fill="#3e2b1b" stroke="#1f150c" stroke-width="2"/>${[...Array(8)].map((_, i) => `<rect x="${-hw + 2}" y="${f1(-hh + 2 + i * (h - 4) / 8)}" width="${w - 4}" height="${f1((h - 4) / 8 - 2)}" fill="hsl(28,30%,${20 + i * 2.6}%)"/>`).join("")}`; break;
    case "rug": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="3" fill="${v > .8 ? "#5b2430" : "#6e2b26"}" opacity=".92"/><rect x="${-hw + 5}" y="${-hh + 5}" width="${w - 10}" height="${h - 10}" fill="none" stroke="#b08f45" stroke-width="2" stroke-dasharray="6 3" opacity=".8"/><rect x="${-hw + 11}" y="${-hh + 11}" width="${Math.max(0, w - 22)}" height="${Math.max(0, h - 22)}" fill="none" stroke="#3a1512" stroke-width="2"/>`; break;
    case "bed": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="3" fill="#4a3220" stroke="#22160c" stroke-width="2"/><rect x="${-hw + 3}" y="${-hh + 3}" width="${w - 6}" height="${h - 6}" rx="2" fill="#cdbf9f"/><rect x="${-hw + 6}" y="${-hh + 6}" width="${w - 12}" height="${h * .2}" rx="5" fill="#ece3cf"/><rect x="${-hw + 3}" y="${-hh + h * .36}" width="${w - 6}" height="${h * .6}" rx="3" fill="#36536b"/><path d="M${-hw + 6} ${-hh + h * .5} H${hw - 6}" stroke="#4a6b86" stroke-width="2"/>`; break;
    case "bedroll": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="${hw}" fill="#6b5a3d" stroke="#2f2618"/><rect x="${-hw + 2}" y="${-hh + h * .3}" width="${w - 4}" height="${h * .66}" rx="${hw - 2}" fill="#4d5b3a"/>`; break;
    case "chest": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="3" fill="#6a4523" stroke="#2a1a0c" stroke-width="2"/><rect x="${-hw}" y="${-hh + h * .38}" width="${w}" height="3" fill="#b08a3c"/><line x1="${-hw + w * .22}" y1="${-hh}" x2="${-hw + w * .22}" y2="${hh}" stroke="#b08a3c" stroke-width="2.5"/><line x1="${hw - w * .22}" y1="${-hh}" x2="${hw - w * .22}" y2="${hh}" stroke="#b08a3c" stroke-width="2.5"/><rect x="-3" y="${-hh + h * .3}" width="6" height="7" rx="1" fill="#e0bf63"/>`; break;
    case "cabinet": case "bookcase": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" fill="#3a271a" stroke="#1d130b" stroke-width="2"/>${[...Array(Math.floor((w - 4) / 6))].map((_, i) => `<rect x="${f1(-hw + 2 + i * 6)}" y="${-hh + 2}" width="5" height="${h - 4}" fill="${["#6b2a2a", "#2a4a6b", "#5a6b2a", "#7a5a2a", "#4a2a5a"][Math.floor(R() * 5)]}" opacity=".85"/>`).join("")}`; break;
    case "altar": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2" fill="#8e908a" stroke="#4a4c48" stroke-width="2"/><rect x="${-hw * .3}" y="${-hh}" width="${w * .3}" height="${h}" fill="${o.label === "жертвенник" ? "#5a2a24" : "#2f4d72"}"/><rect x="${-hw + 3}" y="${-hh + 3}" width="${w - 6}" height="3" fill="#b5b7b0" opacity=".6"/>${o.label === "жертвенник" ? `<ellipse cx="${hw * .5}" cy="2" rx="6" ry="4" fill="#5a1a14" opacity=".8"/>` : `<circle r="4" cx="${hw * .55}" fill="#d8c27a"/>`}`; break;
    case "pew": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2" fill="#5a3d26" stroke="#24170d" stroke-width="1.5"/><rect x="${-hw}" y="${hh - 4}" width="${w}" height="4" fill="#3b2817"/>`; break;
    case "statue": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="4" fill="#5d615e" stroke="#33363a"/><ellipse cx="0" cy="3" rx="${hw * .62}" ry="${hh * .5}" fill="#9a9d96"/><circle cx="0" cy="${-hh * .32}" r="${hw * .3}" fill="#b4b6ae"/>${o.label.includes("разбит") ? `<path d="M${-hw * .5} ${-hh * .1} l${hw * .5} ${hh * .3} l${hw * .4} ${-hh * .5}" stroke="#3a3d3a" stroke-width="1.6" fill="none"/>` : ""}`; break;
    case "font": s = `<circle r="${hw}" fill="#7a7d78" stroke="#3a3c39" stroke-width="2"/><circle r="${hw * .62}" fill="#3d7b8e"/><circle r="${hw * .3}" cx="-3" cy="-3" fill="#8fc8d6" opacity=".5"/>`; break;
    case "pillar": s = `<circle r="${hw}" fill="#7b7f7b" stroke="#3b3e3c" stroke-width="2"/><circle r="${hw * .62}" fill="none" stroke="#a3a7a1" stroke-opacity=".6"/><circle r="${hw * .3}" cx="${-hw * .25}" cy="${-hw * .25}" fill="#aeb2ab" opacity=".6"/>`; break;
    case "colfall": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="${hh}" fill="#7b7f7b" stroke="#3b3e3c" stroke-width="2"/>${[1, 2, 3].map(i => `<line x1="${f1(-hw + i * w / 4)}" y1="${-hh}" x2="${f1(-hw + i * w / 4)}" y2="${hh}" stroke="#4a4d4a"/>`).join("")}<rect x="${-hw}" y="${-hh}" width="${w}" height="${h * .35}" rx="${hh * .35}" fill="#a3a7a1" opacity=".35"/>`; break;
    case "candle": s = `<circle r="3.5" fill="#efe4c4"/><circle r="2" cy="-1" fill="#ffd27a" class="sc-flame"/>`; break;
    case "torch": s = `<circle r="4" fill="#4a3220"/><circle r="3.4" fill="#ff9a3a" class="sc-flame"/>`; break;
    case "lantern": case "lamppost": s = `<rect x="-5" y="-5" width="10" height="10" rx="2" fill="#2b2a26" stroke="#7a6a3a"/><circle r="3" fill="#ffd27a" class="sc-flame"/>`; break;
    case "brazier": s = `<circle r="${hw}" fill="#2b2a28" stroke="#6b665c" stroke-width="2"/><g class="sc-fire"><circle r="${hw * .62}" fill="#d8572a"/><circle r="${hw * .34}" fill="#ffc35a"/></g>`; break;
    case "crate": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" fill="#8a6a40" stroke="#3f2d17" stroke-width="2"/><rect x="${-hw + 4}" y="${-hh + 4}" width="${w - 8}" height="${h - 8}" fill="none" stroke="#5a4426" stroke-width="2"/><path d="M${-hw + 4} ${-hh + 4} L${hw - 4} ${hh - 4} M${hw - 4} ${-hh + 4} L${-hw + 4} ${hh - 4}" stroke="#5a4426" stroke-width="2.4"/>${o.label.includes("разбит") ? `<path d="M${-hw} ${hh * .2} l${w * .3} ${-hh * .5} l${w * .2} ${hh * .6}" stroke="#2a1d0f" stroke-width="2.4" fill="none"/>` : ""}`; break;
    case "sack": s = `<ellipse rx="${hw}" ry="${hh}" fill="#a08a62" stroke="#5a4a30" stroke-width="1.5"/><ellipse rx="${hw * .5}" ry="${hh * .4}" cx="${-hw * .2}" cy="${-hh * .2}" fill="#b49e74" opacity=".7"/><circle cx="${hw * .55}" cy="${-hh * .45}" r="3" fill="#6a5636"/>`; break;
    case "rock": { const n = 7; const p = [...Array(n)].map((_, i) => { const a = i / n * Math.PI * 2; const rr = .75 + R() * .3; return `${f1(Math.cos(a) * hw * rr)},${f1(Math.sin(a) * hh * rr)}`; }).join(" "); s = `<polygon points="${p}" fill="#6a6b66" stroke="#34352f" stroke-width="2"/><polygon points="${p}" fill="#8f918a" opacity=".55" transform="translate(-2,-2) scale(.6)"/>`; break; }
    case "stone": s = `<ellipse rx="${hw}" ry="${hh}" fill="#7d807b" stroke="#3a3c38" stroke-width="2"/><ellipse rx="${hw * .55}" ry="${hh * .45}" cx="-2" cy="-2" fill="#a3a69f" opacity=".6"/><path d="M-4 -1 l3 -3 l3 3 M-1 -4 v7" stroke="#4fa3a0" stroke-width="1.2" opacity=".8"/>`; break;
    case "grave": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="${hh}" fill="#6f726d" stroke="#363834"/><rect x="${-hw}" y="${hh}" width="${w}" height="${h * 1.4}" fill="#3a2f22" opacity=".55"/>`; break;
    case "tree": { const c = SCP.leaf; s = `<ellipse cx="6" cy="9" rx="${hw * .95}" ry="${hh * .85}" fill="#000" opacity=".35"/>${[...Array(6)].map((_, i) => { const a = i / 6 * Math.PI * 2 + R(); const d = hw * .38; return `<circle cx="${f1(Math.cos(a) * d)}" cy="${f1(Math.sin(a) * d)}" r="${f1(hw * (.45 + R() * .15))}" fill="${c[1]}" stroke="${c[0]}" stroke-width="1.5"/>`; }).join("")}<circle r="${f1(hw * .5)}" fill="${c[2]}"/><circle cx="${f1(-hw * .2)}" cy="${f1(-hw * .22)}" r="${f1(hw * .25)}" fill="${c[3]}" opacity=".8"/>`; break; }
    case "bush": s = `${[...Array(4)].map((_, i) => `<circle cx="${f1((R() - .5) * hw)}" cy="${f1((R() - .5) * hh)}" r="${f1(hw * (.45 + R() * .2))}" fill="${SCP.leaf[1 + (i % 2)]}" stroke="${SCP.leaf[0]}"/>`).join("")}`; break;
    case "reeds": s = [...Array(6)].map(() => { const x = (R() - .5) * w, y = (R() - .5) * h; return `<path d="M${f1(x)} ${f1(y)} l${f1((R() - .5) * 6)} -10" stroke="#7d8a4a" stroke-width="1.6"/>`; }).join(""); break;
    case "stump": s = `<circle r="${hw}" fill="#6b4a2e" stroke="#2f1f12" stroke-width="2"/><circle r="${hw * .7}" fill="#b28c5e"/><circle r="${hw * .42}" fill="none" stroke="#8a6a40"/><circle r="${hw * .18}" fill="none" stroke="#8a6a40"/>`; break;
    case "tent": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="3" fill="#9c8a62" stroke="#4a3f2a" stroke-width="2"/><rect x="${-hw}" y="0" width="${w}" height="${hh}" rx="2" fill="#7f6f4c"/><line x1="${-hw}" y1="0" x2="${hw}" y2="0" stroke="#4a3f2a" stroke-width="2.4"/><path d="M${hw} ${-hh * .5} l10 -6 M${hw} ${hh * .5} l10 6 M${-hw} ${-hh * .5} l-10 -6 M${-hw} ${hh * .5} l-10 6" stroke="#c9b98f" opacity=".6"/>`; break;
    case "campfire": s = `${[...Array(9)].map((_, i) => { const a = i / 9 * Math.PI * 2; return `<circle cx="${f1(Math.cos(a) * hw * .82)}" cy="${f1(Math.sin(a) * hw * .82)}" r="${f1(hw * .2)}" fill="#6d6c66" stroke="#2f2f2b"/>`; }).join("")}<rect x="${-hw * .6}" y="-3" width="${w * .6}" height="6" rx="3" fill="#4a3220" transform="rotate(30)"/><rect x="${-hw * .6}" y="-3" width="${w * .6}" height="6" rx="3" fill="#4a3220" transform="rotate(-35)"/><g class="sc-fire"><circle r="${hw * .45}" fill="#e8642c"/><circle r="${hw * .26}" fill="#ffc35a"/></g>`; break;
    case "log": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="${hh}" fill="#5c4029" stroke="#2b1c10" stroke-width="2"/><ellipse cx="${hw - 4}" cy="0" rx="3" ry="${hh - 2}" fill="#a07c50"/>`; break;
    case "hay": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="${hh * .8}" fill="#c4a352" stroke="#7a6428" stroke-width="2"/>${[...Array(9)].map(() => `<line x1="${f1((R() - .5) * w * .8)}" y1="${f1((R() - .5) * h * .7)}" x2="${f1((R() - .5) * w * .8)}" y2="${f1((R() - .5) * h * .7)}" stroke="#e0c46e" opacity=".7"/>`).join("")}`; break;
    case "fence": s = `<rect x="-2" y="${-hh}" width="4" height="${h}" fill="#6b4a2e"/>`; break;
    case "fencep": s = `<rect x="-4" y="-4" width="8" height="8" fill="#4a3220"/>`; break;
    case "well": s = `<circle r="${hw}" fill="#6d706b" stroke="#33352f" stroke-width="2"/>${[...Array(10)].map((_, i) => { const a = i / 10 * Math.PI * 2; return `<line x1="${f1(Math.cos(a) * hw * .7)}" y1="${f1(Math.sin(a) * hw * .7)}" x2="${f1(Math.cos(a) * hw)}" y2="${f1(Math.sin(a) * hw)}" stroke="#3f423d"/>`; }).join("")}<circle r="${hw * .62}" fill="#122329"/><circle r="${hw * .3}" cx="-3" cy="-3" fill="#2b5563" opacity=".7"/><rect x="${-hw - 4}" y="-3" width="${w + 8}" height="6" fill="#6b4a2e" stroke="#2f1f12"/>`; break;
    case "cart": s = `<rect x="${-hw - 4}" y="${-hh * .5}" width="5" height="${h * .26}" rx="2" fill="#2b1d12"/><rect x="${hw - 1}" y="${-hh * .5}" width="5" height="${h * .26}" rx="2" fill="#2b1d12"/><rect x="${-hw}" y="${-hh}" width="${w}" height="${h * .78}" rx="2" fill="#7a5434" stroke="#2f1f12" stroke-width="2"/>${[1, 2, 3].map(i => `<line x1="${-hw + 2}" y1="${f1(-hh + i * h * .78 / 4)}" x2="${hw - 2}" y2="${f1(-hh + i * h * .78 / 4)}" stroke="#4a3220"/>`).join("")}<path d="M${-hw * .5} ${hh * .56} L${-hw * .3} ${hh} M${hw * .5} ${hh * .56} L${hw * .3} ${hh}" stroke="#5a3d26" stroke-width="3"/><rect x="${-hw * .6}" y="${-hh * .8}" width="${w * .5}" height="${h * .3}" rx="3" fill="#a08a62" opacity=".9"/>`; break;
    case "stall": { const col = v > .5 ? "#7a2a2a" : "#2a4a6a"; s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" fill="#e2d6b8"/>${[...Array(6)].map((_, i) => i % 2 ? "" : `<rect x="${f1(-hw + i * w / 6)}" y="${-hh}" width="${f1(w / 6)}" height="${h}" fill="${col}"/>`).join("")}<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" fill="none" stroke="#2a2016" stroke-width="2"/><rect x="${-hw}" y="${hh - 4}" width="${w}" height="8" fill="#6b4a2e"/>${[...Array(5)].map((_, i) => `<circle cx="${f1(-hw + 8 + i * (w - 16) / 4)}" cy="${hh + 1}" r="3" fill="${["#c9502a", "#d8b43a", "#6a9a3a"][i % 3]}"/>`).join("")}`; break; }
    case "roof": { const col = v < .3 ? "#4c3a2a" : v < .6 ? "#6a3328" : "#4a4440"; s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" fill="${col}" stroke="#1d1510" stroke-width="3"/>${[...Array(Math.floor(h / 9))].map((_, i) => `<line x1="${-hw}" y1="${f1(-hh + i * 9)}" x2="${hw}" y2="${f1(-hh + i * 9)}" stroke="#1d1510" stroke-opacity=".4"/>`).join("")}<line x1="${-hw}" y1="0" x2="${hw}" y2="0" stroke="#2a1d14" stroke-width="5"/><rect x="${-hw}" y="${-hh}" width="${w}" height="${hh}" fill="#fff" opacity=".06"/><rect x="${hw * .45}" y="${-hh * .7}" width="12" height="12" fill="#3a3a38" stroke="#1d1510"/>`; break; }
    case "boat": s = `<path d="M${-hw} 0 Q${-hw * .4} ${-hh * 1.15} ${hw * .7} ${-hh * .8} L${hw} 0 L${hw * .7} ${hh * .8} Q${-hw * .4} ${hh * 1.15} ${-hw} 0 Z" fill="#6f4c2f" stroke="#2a1b10" stroke-width="2"/><path d="M${-hw * .78} 0 Q${-hw * .3} ${-hh * .78} ${hw * .6} ${-hh * .55} L${hw * .78} 0 L${hw * .6} ${hh * .55} Q${-hw * .3} ${hh * .78} ${-hw * .78} 0 Z" fill="#8b6844"/>${[-.3, .15].map(f => `<rect x="${f1(hw * f - 3)}" y="${f1(-hh * .6)}" width="6" height="${f1(h * .6)}" fill="#5a3d26"/>`).join("")}`; break;
    case "net": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="6" fill="#6b5a3d" opacity=".35"/><g stroke="#b39e72" stroke-width="1" opacity=".75">${[...Array(7)].map((_, i) => `<line x1="${f1(-hw + i * w / 6)}" y1="${-hh}" x2="${f1(-hw + i * w / 6 + 6)}" y2="${hh}"/><line x1="${-hw}" y1="${f1(-hh + i * h / 6)}" x2="${hw}" y2="${f1(-hh + i * h / 6 - 4)}"/>`).join("")}</g><circle cx="${-hw + 4}" cy="${-hh + 4}" r="3.5" fill="#c9502a"/><circle cx="${hw - 4}" cy="${hh - 4}" r="3.5" fill="#c9502a"/>`; break;
    case "post": s = `<circle r="5" fill="#3b2a1c" stroke="#1a110a"/>`; break;
    case "hull": s = `<path d="M${-hw} ${hh * .1} Q${-hw * .5} ${-hh * 1.1} ${hw * .5} ${-hh * .9} L${hw} ${-hh * .2} L${hw * .7} ${hh * .5} L${hw * .3} ${hh * .2} L${hw * .1} ${hh * .9} Q${-hw * .6} ${hh * 1.1} ${-hw} ${hh * .1} Z" fill="#4f3420" stroke="#21150b" stroke-width="3"/>${[...Array(7)].map((_, i) => `<path d="M${f1(-hw * .8 + i * w * .23)} ${f1(-hh * .75)} q4 ${hh * .7} 0 ${f1(hh * 1.4)}" stroke="#7a5434" stroke-width="3.5" fill="none"/>`).join("")}<path d="M${-hw * .9} 0 L${hw * .9} ${-hh * .15}" stroke="#2f1f12" stroke-width="5"/><line x1="${-hw * .1}" y1="${-hh * .5}" x2="${hw * .55}" y2="${hh * 1.6}" stroke="#3b2a1c" stroke-width="5"/>`; break;
    case "plank": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${Math.max(5, h)}" fill="#6f4c2f" stroke="#2a1b10"/>`; break;
    case "kelp": s = `<path d="M${-hw} 0 q${hw * .5} ${-hh * 2} ${hw} 0 t${hw} 0" stroke="#2f4a2a" stroke-width="4" fill="none" opacity=".8"/>`; break;
    case "rubble": s = [...Array(6)].map(() => { const x = (R() - .5) * w * .8, y = (R() - .5) * h * .8, r = 3 + R() * 6; return `<rect x="${f1(x - r)}" y="${f1(y - r)}" width="${f1(r * 2)}" height="${f1(r * 1.6)}" rx="2" fill="hsl(200,4%,${34 + R() * 14 | 0}%)" stroke="#2a2c2b" transform="rotate(${R() * 60 | 0} ${f1(x)} ${f1(y)})"/>`; }).join(""); break;
    case "wallseg": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" fill="#686c69" stroke="#2f3231" stroke-width="2"/><rect x="${-hw}" y="${-hh}" width="${w}" height="4" fill="#8f938e" opacity=".6"/>`; break;
    case "citywall": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" fill="#5e625f" stroke="#2c2f2d" stroke-width="2"/>${[...Array(Math.floor(w / 16))].map((_, i) => `<rect x="${f1(-hw + i * 16 + 3)}" y="${-hh}" width="9" height="6" fill="#7d817c"/>`).join("")}`; break;
    case "towerb": s = `<circle r="${hw}" fill="#5e625f" stroke="#2c2f2d" stroke-width="3"/><circle r="${hw * .7}" fill="#454846"/>${[...Array(8)].map((_, i) => { const a = i / 8 * Math.PI * 2; return `<rect x="${f1(Math.cos(a) * hw * .85 - 3)}" y="${f1(Math.sin(a) * hw * .85 - 3)}" width="6" height="6" fill="#7d817c"/>`; }).join("")}`; break;
    case "step": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" fill="hsl(30,6%,${30 + v * 22 | 0}%)" stroke="#2a2b29"/>`; break;
    case "puddle": s = `<ellipse rx="${hw}" ry="${hh}" fill="#1f3f4a" opacity=".55"/><ellipse rx="${hw * .5}" ry="${hh * .4}" cx="-3" cy="-2" fill="#6aa0b0" opacity=".25"/>`; break;
    case "beam": s = `<rect x="-6" y="-6" width="12" height="12" fill="#5c4029" stroke="#2b1c10" stroke-width="2"/>`; break;
    case "minecart": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="3" fill="#4a4a46" stroke="#22221f" stroke-width="2"/><rect x="${-hw + 4}" y="${-hh + 4}" width="${w - 8}" height="${h - 8}" fill="#2a2724"/>${[...Array(5)].map(() => `<circle cx="${f1((R() - .5) * (w - 14))}" cy="${f1((R() - .5) * (h - 12))}" r="${f1(3 + R() * 2)}" fill="#6a665e"/>`).join("")}`; break;
    case "anvil": s = `<path d="M${-hw} ${-hh} H${hw} L${hw * .5} 0 L${hw * .6} ${hh} H${-hw * .6} L${-hw * .5} 0 Z" fill="#3e4143" stroke="#1c1e1f" stroke-width="2"/>`; break;
    case "cauldron": s = `<circle r="${hw}" fill="#1f1f1e" stroke="#4a4a46" stroke-width="2"/><circle r="${hw * .72}" fill="#4f6b2f"/><circle r="${hw * .25}" cx="-3" cy="-2" fill="#8fb04f" opacity=".7" class="sc-bubble"/>`; break;
    case "herbs": s = `<line x1="${-hw}" y1="0" x2="${hw}" y2="0" stroke="#4a3220" stroke-width="2"/>${[...Array(6)].map((_, i) => `<path d="M${f1(-hw + 6 + i * (w - 12) / 5)} 0 l-3 6 m3 -6 l3 6" stroke="${["#6a8a3a", "#8a6a3a", "#7a8a5a"][i % 3]}" stroke-width="2"/>`).join("")}`; break;
    case "bell": s = `<circle r="${hw}" fill="#9a7a3a" stroke="#4a3818" stroke-width="2"/><circle r="${hw * .6}" fill="none" stroke="#d8b860" stroke-width="2"/><circle r="${hw * .2}" fill="#4a3818"/><rect x="${-hw * 1.1}" y="${-hh * 1.1}" width="${w * 1.1}" height="${h * .9}" fill="#a08a62" opacity=".45" transform="rotate(-12)"/>`; break;
    case "body": s = `<ellipse rx="${hw * 1.1}" ry="${hh * 1.2}" cx="6" fill="#5a1410" opacity=".55"/><ellipse rx="${hw * .6}" ry="${hh * .55}" fill="#3a3530" stroke="#1a1714"/><circle cx="${hw * .62}" r="${hh * .38}" fill="#5a524a" stroke="#1a1714"/><line x1="${-hw * .2}" y1="${-hh * .5}" x2="${-hw * .7}" y2="${-hh * 1.1}" stroke="#3a3530" stroke-width="4"/>`; break;
    case "item": s = `<circle r="${hw * 1.3}" fill="none" stroke="#f2b45c" stroke-width="1.5" class="sc-pulse"/><rect x="${-hw * .6}" y="${-hh * .45}" width="${w * .6}" height="${h * .8}" rx="2" fill="#d9c9a0" stroke="#6b5a3d" transform="rotate(-10)"/>`; break;
    default: s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="3" fill="#6b5a3d"/>`;
  }
  const shadow = ["rug", "puddle", "kelp", "step", "reeds", "herbs", "body", "candle", "torch", "post", "fencep", "net"].includes(o.k) ? "" : ` filter="url(#SCP-sh)"`;
  return `<g transform="translate(${f1(o.x * CS)},${f1(o.y * CS)})${o.r ? ` rotate(${o.r})` : ""}"${shadow}>${s}</g>`;
}
function scDefs(P, sc) {
  return `<defs><filter id="${P}-sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="2.5" dy="3.5" stdDeviation="2.2" flood-color="#000" flood-opacity=".55"/></filter>
  <filter id="${P}-wsh" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".7"/></filter>
  <radialGradient id="${P}-warm"><stop offset="0" stop-color="#ffc276" stop-opacity=".62"/><stop offset=".45" stop-color="#ff9a4a" stop-opacity=".22"/><stop offset="1" stop-color="#ff8a3a" stop-opacity="0"/></radialGradient>
  <radialGradient id="${P}-cold"><stop offset="0" stop-color="#9fd8ff" stop-opacity=".4"/><stop offset="1" stop-color="#9fd8ff" stop-opacity="0"/></radialGradient>
  <radialGradient id="${P}-gold"><stop offset="0" stop-color="#ffd98a" stop-opacity=".7"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
  <radialGradient id="${P}-vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>
  <linearGradient id="${P}-water" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#173f4d"/><stop offset="1" stop-color="#215867"/></linearGradient>
  <pattern id="${P}-rock" width="48" height="48" patternUnits="userSpaceOnUse"><rect width="48" height="48" fill="#141412"/><path d="M0 20 L14 12 L30 18 L48 8 M6 48 L18 34 L34 40 L48 30" stroke="#24231f" stroke-width="3" fill="none"/><circle cx="36" cy="26" r="5" fill="#1d1c19"/></pattern>
  <pattern id="${P}-grid" width="${CS}" height="${CS}" patternUnits="userSpaceOnUse"><path d="M${CS} 0 H0 V${CS}" fill="none" stroke="#fff" stroke-opacity=".05"/></pattern></defs>`;
}
const SC_DARK = { indoor: [.18, .1, .32, .52], outdoor: [.1, 0, .28, .58] };
function sceneStaticSVG(sc, P) {
  const R = mulberry(hash(sc.id + "#draw" + WD.id)); const indoor = sc.rooms.length || sc.round || sc.cave; const t = worldTime().part;
  const objs = sceneObjects(sc.id); const under = objs.filter(o => o.under), over = objs.filter(o => !o.under && !o.hidden);
  const lit = [...sc.lights, ...objs.filter(o => o.k === "item" && o.id[0] === "a").map(o => ({ x: o.x, y: o.y, r: 36, c: "gold" }))];
  const dark = Math.min(.8, (indoor ? SC_DARK.indoor : SC_DARK.outdoor)[t] + (sc.dark || 0)); const tint = !indoor && t === 2 ? "#2a1405" : !indoor && t === 3 ? "#04102a" : "#05080a";
  const shafts = !indoor || t === 3 ? "" : sc.rooms.flatMap(r => r.windows.map(w => { const c = w.c || "#fff8e0"; if (w.s === "t") return `<polygon points="${w.p * CS - 16},${r.y0 * CS} ${w.p * CS + 16},${r.y0 * CS} ${w.p * CS + 40},${r.y0 * CS + 110} ${w.p * CS - 4},${r.y0 * CS + 110}" fill="${c}" opacity="${t === 2 ? .05 : .09}"/>`;
    const xx = (w.s === "l" ? r.x0 : r.x1) * CS, d = w.s === "l" ? 1 : -1; return `<polygon points="${xx},${w.p * CS - 16} ${xx},${w.p * CS + 16} ${xx + d * 120},${w.p * CS + 38} ${xx + d * 120},${w.p * CS + 4}" fill="${c}" opacity="${t === 2 ? .06 : .11}"/>`; })).join("");
  return `${scDefs(P, sc)}${scFloorSVG(sc, P, R)}<rect width="${SC_W * CS}" height="${SC_H * CS}" fill="url(#${P}-grid)"/>${under.map(o => scObjSVG(o, R)).join("")}${scRoomSVG(sc)}${over.map(o => scObjSVG(o, R)).join("")}
  <rect width="${SC_W * CS}" height="${SC_H * CS}" fill="${tint}" opacity="${dark}"/>${shafts}<g style="mix-blend-mode:screen">${lit.map(l => `<circle class="sc-light" style="animation-delay:-${(R() * 3).toFixed(2)}s" cx="${f1(l.x * CS)}" cy="${f1(l.y * CS)}" r="${l.r * (t === 3 || indoor ? 1 : .7)}" fill="url(#${P}-${l.c})"/>`).join("")}</g>
  <rect width="${SC_W * CS}" height="${SC_H * CS}" fill="url(#${P}-vig)"/>`.replace(/url\(#SCP-/g, `url(#${P}-`).replace(/#SCP-/g, `#${P}-`);
}
const FOE_GLYPH = { zombie: "skull", skeleton: "skull", wolf: "beast", giant_rat: "beast", giant_spider: "beast" };
function scTokenSVG(p, P, big) {
  const x = f1(p.x * CS), y = f1(p.y * CS); let r = 13, ring = "#9fb0ad", fill = "#18262b", inner = "", label = "", hit = "", title = "";
  if (p.type === "hero") { const c = C(); r = 14; ring = "#f2b45c"; label = c.name; hit = "hero"; title = c.name + " (вы)"; inner = c.img ? `<image href="${esc(c.img)}" x="-12" y="-12" width="24" height="24" preserveAspectRatio="xMidYMin slice" clip-path="url(#${P}-tc)"/>` : `<text y="5" text-anchor="middle" font-size="14" font-weight="700" fill="#f2b45c" font-family="Cormorant, Georgia, serif">${esc(c.name[0] || "?")}</text>`; }
  else if (p.type === "npc") { const n = NPCS[p.id]; const att = S.world.npcs[p.id]?.att || 0; ring = att >= 8 ? "#7cc79c" : att <= -8 ? "#e8735a" : "#72aed0"; const img = npcImg(p.id); label = n.name; hit = "npc:" + p.id; title = `${n.name}, ${n.role}`;
    inner = img ? `<image href="${esc(img)}" x="-11.5" y="-11.5" width="23" height="23" preserveAspectRatio="xMidYMin slice" clip-path="url(#${P}-tc)"/>` : `<text y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#e9eee9" font-family="Cormorant, Georgia, serif">${esc(n.name[0])}</text>`; }
  else if (p.type === "crowd") { r = 10; ring = "#7d8a87"; fill = "#2a3337"; hit = "crowd:" + p.label; title = p.label; label = big ? p.label : ""; inner = `<circle cy="-3" r="3.6" fill="#b9c3c0" opacity=".75"/><path d="M-6.5 6.5 q6.5 -9 13 0" fill="#b9c3c0" opacity=".75"/>`; }
  else if (p.type === "foe") { const E = ENEMIES[p.id]; const es = S.world.enemies[p.id]; r = E.boss ? 15 : 13; ring = "#e8735a"; fill = "#2a1210"; hit = "foe:" + p.id; label = E.name; title = `${E.name} — ${enemyStatus(p.id)}`; const g = FOE_GLYPH[E.type] || "blade";
    inner = (g === "skull" ? `<circle cy="-1.5" r="6.5" fill="#d8cfc0"/><rect x="-3.5" y="3" width="7" height="4" fill="#d8cfc0"/><circle cx="-2.4" cy="-1.6" r="1.7" fill="#2a1210"/><circle cx="2.4" cy="-1.6" r="1.7" fill="#2a1210"/>` : g === "beast" ? `<path d="M-7 5 L-5 -6 L-1 -1 L1 -1 L5 -6 L7 5 Z" fill="#d8cfc0"/><circle cx="-2.5" cy="1" r="1.3" fill="#e8735a"/><circle cx="2.5" cy="1" r="1.3" fill="#e8735a"/>` : `<path d="M-6 6 L5 -5 M2 -6 L6 -6 L6 -2" stroke="#d8cfc0" stroke-width="2.4" fill="none"/><path d="M-4 2 L-2 4" stroke="#d8cfc0" stroke-width="3"/>`) + (es.asleep ? `<text x="9" y="-8" font-size="9" fill="#9fd8ff">z</text>` : "");
    const pct = es.hp / E.hp; inner += `<rect x="-12" y="${r + 3}" width="24" height="3.5" rx="1.5" fill="#000" opacity=".6"/><rect x="-12" y="${r + 3}" width="${f1(24 * pct)}" height="3.5" rx="1.5" fill="${pct > .5 ? "#e8735a" : "#c9402a"}"/>`; }
  else if (p.type === "corpse") { const E = ENEMIES[p.id]; return `<g transform="translate(${x},${y})" opacity=".85"><title>${esc(E.name)} (повержен)</title><ellipse rx="15" ry="10" fill="#4a0f0b" opacity=".55"/><path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke="#8a2a20" stroke-width="3.4" stroke-linecap="round"/></g>`; }
  const lab = label && (big || p.type === "hero") ? `<text class="sc-lab" y="${r + (p.type === "foe" ? 17 : 13)}" text-anchor="middle">${esc(label)}</text>` : "";
  return `<g class="sc-tok ${p.type}" data-hit="${esc(hit)}" data-x="${x}" data-y="${y}" transform="translate(${x},${y})" tabindex="0" role="button" aria-label="${esc(title)}"><title>${esc(title)}</title><circle r="${r + 1}" cy="3" fill="#000" opacity=".5"/>${p.type === "hero" ? `<circle r="${r + 5}" fill="none" stroke="#f2b45c" stroke-opacity=".5" class="sc-pulse"/>` : ""}<circle r="${r}" fill="${fill}" stroke="${ring}" stroke-width="2.6"/>${inner}${lab}</g>`;
}
function sceneSVG(id, big) {
  const sc = sceneOf(id); const P = "sc" + (++scSeq); const ppl = scenePeople(id); const objs = sceneObjects(id).filter(o => o.act);
  const hits = objs.map(o => `<rect class="sc-hit" data-hit="obj:${o.id}" x="${f1((o.x - Math.max(o.w, .8) / 2) * CS)}" y="${f1((o.y - Math.max(o.h, .8) / 2) * CS)}" width="${f1(Math.max(o.w, .8) * CS)}" height="${f1(Math.max(o.h, .8) * CS)}" transform="${o.r ? `rotate(${o.r} ${f1(o.x * CS)} ${f1(o.y * CS)})` : ""}" rx="4"><title>${esc(o.label)}</title></rect>`).join("");
  const labels = big ? objs.filter(o => !["pew", "stone", "grave"].includes(o.k) || o.id === objs.find(q => q.k === o.k)?.id).map(o => `<text class="sc-olab" x="${f1(o.x * CS)}" y="${f1((o.y + Math.min(o.h, 2.4) / 2) * CS + 11)}" text-anchor="middle">${esc(o.label)}</text>`).join("") : "";
  return `<svg class="sc-svg" viewBox="0 0 ${SC_W * CS} ${SC_H * CS}" xmlns="http://www.w3.org/2000/svg"><clipPath id="${P}-tc"><circle r="11.5"/></clipPath>${sceneStaticSVG(sc, P)}<g class="sc-hits">${hits}</g>${labels}<g class="sc-toks">${ppl.filter(p => p.type === "corpse").map(p => scTokenSVG(p, P, big)).join("")}${ppl.filter(p => p.type !== "corpse").sort((a, b) => (a.type === "hero") - (b.type === "hero")).map(p => scTokenSVG(p, P, big)).join("")}</g></svg>`;
}
function scenePanelHTML() {
  const id = S.world.loc, sc = sceneOf(id); const t = worldTime();
  return `<div class="scene-card${S.world.combat ? " combat" : ""}" id="scene-card"><div class="scene-head"><span class="eyebrow">План · ${SC_NAMES[sc.tpl]}</span><span class="scene-time">${DAY_PARTS[t.part]}</span></div><div class="scene-view" id="scene-view">${sceneSVG(id, false)}<button class="map-expand" type="button" id="scene-big" aria-label="Развернуть план" title="Развернуть план"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button><div class="sc-pop" id="sc-pop" hidden></div></div></div>`;
}
function bindScene(root, big) {
  const view = root.querySelector(big ? "#scene-view-big" : "#scene-view"); if (!view) return; const svg = view.querySelector("svg"); const pop = view.querySelector(".sc-pop");
  const id = S.world.loc; const sc = sceneOf(id);
  const toPx = (x, y) => { const r = svg.getBoundingClientRect(), vr = view.getBoundingClientRect(); return [r.left - vr.left + x / (SC_W * CS) * r.width, r.top - vr.top + y / (SC_H * CS) * r.height]; };
  const close = () => { pop.hidden = true; view.querySelectorAll(".sel").forEach(e => e.classList.remove("sel")); };
  const rerender = () => { if (big) { view.querySelector("svg").outerHTML = sceneSVG(id, true); bindScene(root, true); } renderWorld(); };
  const walkTo = (x, y) => { const taken = scenePeople(id).filter(p => p.type !== "hero"); const p = scFreeNear(sc, taken, x, y, 2.5); scState(id).player = { x: +p.x.toFixed(2), y: +p.y.toFixed(2) }; sfx("step"); save(); rerender(); };
  const open = (el, title, sub, acts) => {
    close(); el.classList?.add("sel"); const bx = +el.dataset.x || 0, by = +el.dataset.y || 0; const [px, py] = toPx(bx, by);
    pop.innerHTML = `<b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}<div class="sc-acts">${acts.map((a, i) => `<button type="button" class="btn small${i === 0 ? " primary" : ""}" data-i="${i}" ${a.dis ? "disabled" : ""}>${esc(a.t)}</button>`).join("")}</div>`;
    pop.hidden = false; const vw = view.clientWidth; const pw = pop.offsetWidth, ph = pop.offsetHeight;
    pop.style.left = clamp(px - pw / 2, 6, vw - pw - 6) + "px"; pop.style.top = (py - ph - 22 < 4 ? py + 22 : py - ph - 22) + "px";
    pop.querySelectorAll("button").forEach(b => b.onclick = ev => { ev.stopPropagation(); const a = acts[+b.dataset.i]; close(); if (big && a.closes !== false) closeModal(); a.fn(); });
  };
  const turn = t => { if (busy || S.dead) return; takeTurn(t); };
  const approach = (x, y) => () => walkTo(x, y + .9);
  view.onclick = ev => {
    const el = ev.target.closest("[data-hit]"); if (ev.target.closest(".sc-pop") || ev.target.closest(".map-expand")) return; sfx("tap");
    if (!el || !el.dataset.hit) { if (!pop.hidden) { close(); return; } const r = svg.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width * SC_W, y = (ev.clientY - r.top) / r.height * SC_H; if (busy) return; walkTo(x, y); return; }
    const [kind, ref] = el.dataset.hit.split(/:(.*)/s); const ppl = scenePeople(id);
    if (kind === "obj") { const o = sceneObjects(id).find(q => q.id === ref); if (!o) return; el.dataset.x = o.x * CS; el.dataset.y = o.y * CS;
      const acts = [{ t: "Осмотреть", fn: () => turn(`Осматриваю ${o.acc}`), dis: busy }]; if (o.search) acts.push({ t: "Обыскать", fn: () => turn(`Обыскиваю ${o.acc}`), dis: busy });
      const sp = { hearth: "Погреться у огня", bar: "Заказать выпивку", altar: "Помолиться", well: "Заглянуть в колодец", boat: "Сесть в лодку", stairs: "Подняться наверх", campfire: "Сесть у костра", bed: "Прилечь", font: "Окропить себя водой", stall: "Прицениться к товару" }[o.k];
      if (sp) acts.push({ t: sp, fn: () => turn(sp), dis: busy }); acts.push({ t: "Подойти", fn: approach(o.x, o.y), closes: false });
      open(el, o.label[0].toUpperCase() + o.label.slice(1), "", acts); return; }
    if (kind === "npc") { const n = NPCS[ref]; const p = ppl.find(q => q.id === ref); open(el, n.name, `${n.role} · ${attLabel(S.world.npcs[ref]?.att || 0)[0]}`, [
      { t: "Заговорить", fn: () => { walkTo(p.x, p.y + .9); showTab("story"); const inp = document.getElementById("act-input"); inp.value = `${n.name}, `; inp.focus(); }, closes: true },
      { t: "Присмотреться", fn: () => turn(`Незаметно присматриваюсь: ${n.name} (${n.role})`), dis: busy }, { t: "Подойти", fn: approach(p.x, p.y), closes: false }]); return; }
    if (kind === "crowd") { const p = ppl.find(q => q.type === "crowd" && q.label === ref && Math.abs(q.x * CS - +el.dataset.x) < 1 && Math.abs(q.y * CS - +el.dataset.y) < 1) || ppl.find(q => q.label === ref);
      open(el, ref[0].toUpperCase() + ref.slice(1), "безымянный местный житель", [{ t: "Заговорить", fn: () => turn(`Подхожу к человеку (${ref}) и заговариваю с ним`), dis: busy }, { t: "Подслушать", fn: () => turn(`Прислушиваюсь, о чём говорит ${ref}`), dis: busy }, { t: "Подойти", fn: approach(p.x, p.y), closes: false }]); return; }
    if (kind === "foe") { const E = ENEMIES[ref]; open(el, E.name, enemyStatus(ref), [{ t: "Атаковать", fn: () => turn(`Атакую: ${E.name}`), dis: busy }, { t: "Оценить врага", fn: () => turn(`Оцениваю, насколько опасен ${E.name}`), dis: busy }]); return; }
    if (kind === "hero") { open(el, C().name, "это вы · клик по полу — переместиться", [{ t: "Осмотреться", fn: () => turn("Осматриваюсь внимательно"), dis: busy }]); }
  };
  view.onkeydown = ev => { if ((ev.key === "Enter" || ev.key === " ") && ev.target.closest("[data-hit]")) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); } };
  if (!big) { const b = root.querySelector("#scene-big"); if (b) b.onclick = ev => { ev.stopPropagation(); openBigScene(); }; }
}
function openBigScene() {
  if (!S) return; const id = S.world.loc;
  modal(`<div class="bigmap"><div class="bigmap-head"><div><div class="eyebrow">План локации · ${SC_NAMES[sceneOf(id).tpl]} · ${DAY_PARTS[worldTime().part]}</div><h2>${esc(POIS[id].name)}</h2></div><div class="bm-tools"><button class="btn small" type="button" id="sb-close">Закрыть</button></div></div>
  <div class="scene-view big" id="scene-view-big">${sceneSVG(id, true)}<div class="sc-pop" hidden></div></div>
  <div class="legend"><span><i class="lg here"></i>вы</span><span><i class="lg tk-npc"></i>персонажи</span><span><i class="lg tk-crowd"></i>местные</span><span><i class="lg tk-foe"></i>враги</span><span class="home-note">Нажмите на человека или предмет, чтобы действовать. Клик по полу — подойти.</span></div></div>`, root => {
    root.querySelector(".modal").classList.add("wide"); root.querySelector("#sb-close").onclick = () => { closeModal(); renderWorld(); }; sfx("open"); bindScene(root, true);
  });
}
