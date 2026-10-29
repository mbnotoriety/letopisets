/* =========================================================================
   ЗДАНИЯ: случайные дома, лавки и постройки с жильцами
   Здание — внутренняя локация (inner) при уличной сцене; на карте мира не отмечается.
   ========================================================================= */
const BLD_VER = 1;
const BLD_SLOTS = {
  street: [{ x: 2.7, y: 2.3, w: 4, h: 3.2, d: "b" }, { x: 7.6, y: 2.1, w: 3.6, h: 2.8, d: "b" }, { x: 12.2, y: 2.4, w: 4.2, h: 3.4, d: "b" }, { x: 16.4, y: 2.2, w: 2.9, h: 2.8, d: "b" },
    { x: 3.3, y: 9.8, w: 4.4, h: 3, d: "t" }, { x: 9.1, y: 10, w: 3.6, h: 2.8, d: "t" }, { x: 14.9, y: 9.7, w: 4.2, h: 3.2, d: "t" }],
  square: [{ x: 3.2, y: 1.6, w: 5.4, h: 3.2, d: "b" }, { x: 9.4, y: 1.4, w: 5, h: 2.8, d: "b" }, { x: 15.4, y: 1.8, w: 5.2, h: 3.6, d: "b" }],
  pier: [{ x: 15.2, y: 3.4, w: 4.6, h: 3.4, d: "l" }, { x: 16, y: 10.2, w: 3.6, h: 2.8, d: "t" }],
  farm: [{ x: 14, y: 2.6, w: 6.2, h: 4.2, d: "b" }, { x: 16.1, y: 6.9, w: 3.4, h: 2.6, d: "l" }],
  gate: [{ x: 15.2, y: 5.4, w: 3.8, h: 2.6, d: "l" }]
};
const BLD_TPL = { house: "b_house", poor: "b_poor", rich: "b_rich", farmhouse: "b_house", fisher: "b_house", shop: "b_shop", smithy: "b_smithy", barn: "b_barn", shed: "b_shed", guard: "b_guard" };
const BLD_SLEEPS = new Set(["house", "poor", "rich", "farmhouse", "fisher", "guard"]);
const NAMES_N = { m: ["Йорн", "Ульф", "Матс", "Гуннар", "Эрик", "Торвальд", "Бьярн", "Свен", "Олаф", "Хакон", "Ивар", "Рольф", "Кнуд", "Ларс", "Нильс", "Пер", "Агнар", "Эйвинд", "Харальд", "Стейн", "Арне", "Тойво"],
  f: ["Ингрид", "Сигрид", "Астрид", "Хельга", "Грета", "Ильза", "Марит", "Тора", "Сольвейг", "Рагна", "Лив", "Бирта", "Ханна", "Кая", "Гудрун", "Эбба", "Ауд", "Фрея"] };
const NAMES_S = { m: ["Ждан", "Мирон", "Горислав", "Велимир", "Остап", "Тихон", "Савва", "Прохор", "Ерёма", "Фрол", "Демьян", "Лука", "Игнат", "Матвей", "Гордей", "Яков", "Елисей", "Пантелей"],
  f: ["Ведана", "Злата", "Любава", "Мила", "Дарина", "Агафья", "Марфа", "Устинья", "Пелагея", "Олеся", "Василиса", "Арина", "Фёкла", "Ульяна", "Глафира", "Дуняша"] };
// роль, род. падеж, пол, предмет в доме, где встречается
const OWNER_ROLES = [["плотник", "плотника", "m", "workbench"], ["бондарь", "бондаря", "m", "workbench"], ["ткачиха", "ткачихи", "f", "loom"], ["вдова", "вдовы", "f", "loom", "", 1], ["гончар", "гончара", "m", "potwheel"],
  ["пастух", "пастуха", "m", "pelt", "", 1], ["травница", "травницы", "f", "herbs"], ["охотник", "охотника", "m", "pelt"], ["лодочник", "лодочника", "m", "net", "coast"], ["рыбак", "рыбака", "m", "net", "coast"],
  ["сапожник", "сапожника", "m", "workbench"], ["прачка", "прачки", "f", "barrel", "", 1], ["углежог", "углежога", "m", "sack", "forest,marsh,mountains", 1], ["знахарка", "знахарки", "f", "herbs", "", 1],
  ["старый солдат", "старого солдата", "m", "rack", "", 1], ["кожевник", "кожевника", "m", "workbench"], ["резчик по кости", "резчика по кости", "m", "workbench", "coast,mountains"], ["торфяник", "торфяника", "m", "sack", "marsh", 1],
  ["рудокоп", "рудокопа", "m", "sack", "mountains"], ["бортник", "бортника", "m", "crate", "forest"]];
const SHOPS = [{ name: "Пекарня", role: ["пекарь", "пекаря", "m"], shelf: "полки с хлебом", prop: "oven" }, { name: "Лавка старьёвщика", role: ["старьёвщик", "старьёвщика", "m"], shelf: "полки с хламом", prop: "junk" },
  { name: "Аптекарская лавка", role: ["аптекарь", "аптекаря", "m"], shelf: "полки со склянками", prop: "herbs" }, { name: "Лавка мясника", role: ["мясник", "мясника", "m"], shelf: "полки с колбасами", prop: "hook" },
  { name: "Лавка всякой всячины", role: ["лавочница", "лавочницы", "f"], shelf: "полки с товаром", prop: "goods" }, { name: "Свечная лавка", role: ["свечник", "свечника", "m"], shelf: "полки со свечами", prop: "candles" }];
const PERSONAS = ["Подозрительно смотрит на чужаков, но любит поговорить о погоде и ценах.", "Добродушный, но вечно в долгах; за пару монет расскажет лишнее.", "Ворчливый, держит язык за зубами, уважает только прямоту.",
  "Любопытный, суёт нос в чужие дела и знает все сплетни улицы.", "Набожный и пугливый, во всём видит дурные знаки.", "Жадный до денег, торгуется по любому поводу.", "Устал от жизни, говорит мало и коротко.",
  "Весёлый, любит выпить и прихвастнуть.", "Гордый и обидчивый, не терпит, когда его перебивают.", "Заботливый, первым делом предложит поесть.", "Хитрый, отвечает вопросом на вопрос.", "Нервный, вздрагивает от каждого стука."];
const SECRETS = ["Задолжал старосте и боится, что отнимут дом.", "Прячет под половицей скромные сбережения.", "Тайно встречается с кем-то из соседей.", "Видел ночью странные огни у воды, но никому не сказал.",
  "Приторговывает краденым по мелочи.", "Боится, что сын связался с дурной компанией.", "Слышал, что в округе недавно кто-то пропал.", "Ничего особенного не скрывает, но не любит, когда в доме шарят.",
  "Держит в сундуке старое письмо, которое никому не показывает.", "Знает обходную тропу, о которой не говорят чужакам.", "Однажды нашёл на берегу вещь с чужого корабля и оставил себе.", "Подслушал, как кто-то торговался в темноте о «грузе»."];
const LOOK_M = ["с обветренным лицом", "с проседью в бороде", "в заплатанной рубахе", "с мозолистыми руками", "с цепким взглядом", "с усталыми глазами", "с рябым лицом", "с шрамом на подбородке", "с густыми бровями", "в потёртом кожаном фартуке"];
const LOOK_F = ["в выцветшем платке", "с натруженными руками", "с тугой косой", "с цепким взглядом", "с усталыми глазами", "в переднике с заплатами", "с румяными щеками", "с серебряной серьгой", "с острым языком и острым носом", "в тёмной шерстяной шали"];
const BLD_DESC = {
  house: n => `Тесный жилой дом ${n}: очаг, стол, лавки, запах дыма и похлёбки.`, poor: n => `Бедная лачуга ${n}: земляной пол, тлеющий очаг, сквозняк из щелей.`, rich: () => "Просторный дом зажиточной семьи: ковры, сундуки, свечи в медных подсвечниках.",
  farmhouse: () => "Добротный дом хуторян: пахнет хлебом, сеном и овчиной.", fisher: () => "Дом рыбака: сети на стенах, запах соли и смолы, у порога вёсла.", shop: n => `${n}: прилавок, полки, хозяин зорко следит за товаром.`,
  smithy: () => "Кузница: жар горна, звон металла, пахнет углём и окалиной.", barn: () => "Амбар: сено, скотина в стойлах, под крышей сеновал.", shed: () => "Сарай: снасти, ящики, бочки и старый хлам.", guard: () => "Караульня: стол с кружками и костями, нары, стойка с оружием."
};
function tplOfPlace(p) {
  if (!p) return "square"; if (p.btpl) return p.btpl; if (p.kind === "street") return "street";
  const s = `${p.name || ""} ${p.short || ""}`; for (const [re, k] of SC_KW) if (re.test(p.name || "")) return k;
  if (SC_BY_KIND[p.kind]) return SC_BY_KIND[p.kind]; for (const [re, k] of SC_KW) if (re.test(s)) return k; return "square";
}
const isOuter = p => p && !p.inner;
function outerEntries() { return Object.entries(POIS).filter(([, p]) => !p.inner); }
function hereOuter() { const p = POIS[S.world.loc]; return p?.inner ? p.parent : S.world.loc; }
function ensureBuildings(wd) {
  if (!wd || !wd.places || wd.bver === BLD_VER) return; wd.bver = BLD_VER; const R = mulberry(hash(wd.id + "#bld"));
  const outer = () => Object.entries(wd.places).filter(([, p]) => !p.inner);
  const settled = outer().filter(([, p]) => ["inn", "house", "chapel", "well", "pier", "farm", "gate"].includes(p.kind) || ["square", "pier", "farm", "gate", "inn"].includes(tplOfPlace(p)));
  if (settled.length && !outer().some(([, p]) => tplOfPlace(p) === "street")) addStreet(wd, settled.map(([, p]) => p), R);
  const used = new Set(Object.values(wd.npcs).map(n => n.name));
  for (const [id, p] of outer()) { const t = tplOfPlace(p); if (BLD_SLOTS[t] && !p.blds) genBuildingsFor(wd, id, p, t, R, used); }
  try { mapCache.clear(); } catch (e) {}
}
function addStreet(wd, settled, R) {
  const cx = settled.reduce((a, p) => a + p.x, 0) / settled.length, cy = settled.reduce((a, p) => a + p.y, 0) / settled.length;
  const tile = (x, y) => (wd.tiles[y] || "")[x] || "S"; const pass = (x, y) => { const t = tile(x, y); return t !== "S" && t !== "W"; };
  const all = Object.values(wd.places); let best = null;
  for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) { if (!pass(x, y)) continue; const md = Math.min(...all.map(p => Math.hypot(p.x - x, p.y - y))); if (md < 1.9) continue;
    const sc = Math.hypot(x - cx, y - cy) + (md > 3.5 ? 2 : 0) + R() * .3; if (!best || sc < best.s) best = { x, y, s: sc }; }
  if (!best) return;
  const id = "street"; const bio = wd.biome || "coast";
  const desc = { coast: "Кривая улочка из почерневших от соли домов. Из труб тянется дым, за заборами сушатся сети.", marsh: "Дома на сваях вдоль раскисшей улицы, мостки через лужи, пахнет торфом и дымом.",
    mountains: "Каменные дома лепятся к склону, по мостовой гуляет холодный ветер.", forest: "Бревенчатые избы вдоль утоптанной улицы, за плетнями огороды, над крышами шумит лес." }[bio] || "Улица с жилыми домами, лавками и дворами.";
  wd.places[id] = { name: "Деревенская улица", kind: "street", x: best.x, y: best.y, short: "Жилые дома, лавки и дворы местных", desc, npcs: [], enemies: [], clue: "" };
  const roads = new Set(wd.roads || []); const key = (x, y) => x + "," + y; const q = [[best.x, best.y]]; const prev = new Map([[key(best.x, best.y), null]]); let hit = null;
  while (q.length) { const [x, y] = q.shift(); if ((roads.has(key(x, y)) || all.some(p => p.x === x && p.y === y)) && !(x === best.x && y === best.y)) { hit = key(x, y); break; }
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + a, ny = y + b, k = key(nx, ny); if (prev.has(k) || !pass(nx, ny)) continue; prev.set(k, key(x, y)); q.push([nx, ny]); } }
  for (let k = hit; k; k = prev.get(k)) roads.add(k); wd.roads = [...roads];
  wd.houses = wd.houses || []; [[1, 0], [-1, 1], [0, -1], [1, 1], [-1, -1]].forEach(([a, b]) => { const x = best.x + a, y = best.y + b; if (pass(x, y) && !roads.has(key(x, y)) && !all.some(p => p.x === x && p.y === y) && !wd.houses.some(h => h[0] === x && h[1] === y)) wd.houses.push([x, y]); });
}
function bldPick(R, arr) { return arr[Math.floor(R() * arr.length)]; }
function makeOcc(wd, bid, spec, R, used) {
  const names = ["forest", "marsh"].includes(wd.biome) ? NAMES_S : NAMES_N; let name = ""; for (let t = 0; t < 30; t++) { name = bldPick(R, names[spec.g]); if (!used.has(name)) break; } used.add(name);
  const id = `${bid}_${spec.i}`; const h = hash(wd.id + id); const age = spec.age || "adult";
  const noun = spec.g === "f" ? (age === "young" ? "девушка" : age === "old" ? "пожилая женщина" : "женщина") : (age === "young" ? "парень" : age === "old" ? "старик" : "мужчина");
  wd.npcs[id] = { name, role: spec.role, look: `${noun} ${bldPick(R, spec.g === "f" ? LOOK_F : LOOK_M)}`, persona: bldPick(R, PERSONAS), secret: bldPick(R, SECRETS), greet: "", minor: true, gender: spec.g, age,
    feature: FEATURES[h % FEATURES.length], hair: age === "old" ? (R() < .5 ? "grey" : "white") : Object.keys(HAIRS)[(h >>> 4) % 4], photo_prompt: "", bld: bid, away: spec.away || [] };
  return id;
}
function genBuildingsFor(wd, pid, p, t, R, used) {
  const slots = BLD_SLOTS[t]; let kinds;
  if (t === "street") { kinds = ["shop"]; if (R() < .75) kinds.push("smithy"); kinds.push(R() < .5 ? "barn" : "shed"); if (R() < .5) kinds.push("rich"); while (kinds.length < 5 + (R() < .5 ? 1 : 0)) kinds.push(R() < .3 ? "poor" : "house"); }
  else if (t === "square") kinds = ["house", "shop", R() < .5 ? "rich" : "house"]; else if (t === "pier") kinds = ["shed", "fisher"]; else if (t === "farm") kinds = ["barn", "farmhouse"]; else kinds = ["guard"];
  const order = slots.map((_, i) => i); if (t === "street") for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const bio = wd.biome || "coast"; const usedRoles = new Set(); p.blds = [];
  kinds.slice(0, slots.length).forEach((bk, i) => {
    const bid = `${pid}__b${i}`; const occ = []; let name = "", prop = "", shop = null; const add = s => occ.push(makeOcc(wd, bid, { ...s, i: occ.length }, R, used));
    const family = (gen, g, extra) => { if (extra > 0 && g === "m") add({ role: `жена ${gen}`, g: "f" }); else if (extra > 0) add({ role: R() < .5 ? `сын ${gen}` : `дочь ${gen}`, g: R() < .5 ? "m" : "f", age: "young", away: R() < .4 ? [1] : [] });
      if (extra > 1) { const s = R() < .5; add(R() < .6 ? { role: s ? `сын ${gen}` : `дочь ${gen}`, g: s ? "m" : "f", age: "young", away: R() < .4 ? [1] : [] } : { role: s ? `отец ${gen}` : `мать ${gen}`, g: s ? "m" : "f", age: "old" }); } };
    if (bk === "house" || bk === "poor" || bk === "fisher") {
      let pool = OWNER_ROLES.filter(r => (!r[4] || r[4].split(",").includes(bio)) && !usedRoles.has(r[0]) && (bk !== "poor" || r[5])); if (bk === "fisher") pool = OWNER_ROLES.filter(r => r[0] === "рыбак");
      const r = bldPick(R, pool.length ? pool : OWNER_ROLES); usedRoles.add(r[0]); prop = r[3];
      const worker = ["рыбак", "лодочник", "пастух", "охотник", "углежог", "рудокоп", "торфяник", "бортник"].includes(r[0]);
      add({ role: r[0], g: r[2], away: worker ? (R() < .7 ? [0, 1] : [1]) : (R() < .3 ? [1] : []) }); family(r[1], r[2], bk === "poor" ? (R() < .4 ? 1 : 0) : Math.floor(R() * 3));
      name = `${bk === "poor" ? "Лачуга" : "Дом"} ${r[1]}`;
    } else if (bk === "rich") { name = "Дом купца"; add({ role: "зажиточный купец", g: "m" }); add({ role: "служанка купца", g: "f", age: "young" }); if (R() < .6) add({ role: "жена купца", g: "f" }); prop = "rich"; }
    else if (bk === "farmhouse") { name = "Дом хуторянина"; add({ role: "хуторянин", g: "m", away: [1] }); family("хуторянина", "m", 1 + Math.floor(R() * 2)); prop = "pelt"; }
    else if (bk === "shop") { shop = bldPick(R, SHOPS); name = shop.name; add({ role: shop.role[0], g: shop.role[2], away: R() < .6 ? [3] : [] }); if (R() < .5) add({ role: shop.role[2] === "f" ? `помощница ${shop.role[1]}` : `подмастерье ${shop.role[1]}`, g: R() < .5 ? "m" : "f", age: "young", away: [3] }); prop = shop.prop; }
    else if (bk === "smithy") { name = "Кузница"; add({ role: "кузнец", g: "m", away: [3] }); if (R() < .7) add({ role: "подмастерье кузнеца", g: "m", age: "young", away: [3] }); }
    else if (bk === "barn") { name = "Амбар"; if (R() < .6) add({ role: "батрак", g: "m", age: R() < .5 ? "young" : "adult", away: [2, 3] }); }
    else if (bk === "shed") { name = t === "pier" ? "Сарай для снастей" : "Сарай"; }
    else if (bk === "guard") { name = "Караульня"; add({ role: "сержант стражи", g: "m" }); add({ role: "стражник", g: "m", age: "young", away: [0] }); }
    const lock = bk === "rich" ? 15 : bk === "poor" ? 10 : bk === "guard" ? 14 : 12 + Math.floor(R() * 2);
    wd.places[bid] = { name, short: shop ? `${shop.role[0][0].toUpperCase() + shop.role[0].slice(1)} и товар` : BLD_DESC[bk]("").split(":")[0], desc: (BLD_DESC[bk] || BLD_DESC.house)(name.toLowerCase().replace(/^дом |^лачуга /, "")),
      kind: "house", inner: true, parent: pid, slot: order[i], bk, btpl: BLD_TPL[bk], x: p.x, y: p.y, npcs: [], extra: [], occ, enemies: [], lock, prop, shelf: shop?.shelf || "" };
    p.blds.push(bid);
  });
}
/* ---------- состояние зданий во время игры ---------- */
function bstate(bid) { S.bst = S.bst || {}; return S.bst[bid] || (S.bst[bid] = {}); }
function tkey() { const t = worldTime(); return t.day * 4 + t.part; }
function bldHome(bid) { const b = POIS[bid]; const part = worldTime().part; return (b?.occ || []).filter(n => NPCS[n] && !(NPCS[n].away || []).includes(part)); }
function bldAsleep(bid) { const b = POIS[bid]; return !!b && worldTime().part === 3 && BLD_SLEEPS.has(b.bk) && bstate(bid).alarm !== tkey(); }
function bldLocked(bid) {
  const b = POIS[bid], st = bstate(bid), k = tkey(); if (!b || st.broken) return false; if (st.unlocked === k || st.open === k) return false;
  const part = worldTime().part; const h = hash(bid + ":" + worldTime().day);
  if (b.bk === "shop" || b.bk === "smithy") return part === 3; if (b.bk === "guard") return false; if (b.bk === "barn" || b.bk === "shed") return h % 4 === 0;
  return part === 3 || !bldHome(bid).length || h % 3 === 0;
}
function bldLit(bid) { return worldTime().part >= 2 && bldHome(bid).length > 0 && !bldAsleep(bid); }
function refreshBuildings() { if (!S) return; for (const [id, p] of Object.entries(POIS)) if (p.inner) p.npcs = [...new Set([...bldHome(id), ...(p.extra || [])])]; }
function bldStatus(bid) {
  const b = POIS[bid], st = bstate(bid); const met = (b.occ || []).filter(id => S.world.met?.includes(id)).map(id => NPCS[id].name); const bits = [];
  bits.push(met.length ? "Живут: " + met.join(", ") : (b.occ || []).length ? "Жильцы вам незнакомы" : "Похоже, здесь никто не живёт");
  if (st.broken) bits.push("дверь выбита"); else if ((b.bk === "shop" || b.bk === "smithy") && !bldLocked(bid)) bits.push("открыто для посетителей"); else if (st.known === tkey()) bits.push(bldLocked(bid) ? "заперто" : "не заперто");
  bits.push(bldLit(bid) ? "в окнах свет" : worldTime().part >= 2 ? "окна тёмные" : ""); return bits.filter(Boolean).join(" · ");
}
function doorPt(s) { return s.d === "b" ? { x: s.x, y: s.y + s.h / 2 + .6 } : s.d === "t" ? { x: s.x, y: s.y - s.h / 2 - .6 } : s.d === "l" ? { x: s.x - s.w / 2 - .6, y: s.y } : { x: s.x + s.w / 2 + .6, y: s.y }; }
function bldSlot(bid) { const b = POIS[bid]; return BLD_SLOTS[tplOfPlace(POIS[b.parent])]?.[b.slot]; }
function scBlds(sc) {
  const p = POIS[sc.id]; const slots = BLD_SLOTS[sc.tpl]; const free = new Set(slots.map((_, i) => i));
  (p?.blds || []).forEach(bid => { const b = POIS[bid]; const s = b && slots[b.slot]; if (!s) return; free.delete(b.slot);
    scAdd(sc, "bldroof", s.x, s.y, s.w, s.h, { label: b.name, acc: b.name, act: true, bld: bid, d: s.d, v: (hash(bid) % 100) / 100 }); const dp = doorPt(s); sc.doors[bid] = dp; });
  return [...free].map(i => slots[i]);
}
const BLD_ACTS = { knock: "Стучу в дверь", listen: "Подслушиваю у двери", peek: "Заглядываю в окно", pick: "Пытаюсь вскрыть замок", force: "Выбиваю дверь" };
function bldAction(bid, act) {
  if (busy || S.dead || !POIS[bid]) return; const b = POIS[bid]; const st = bstate(bid); const part = worldTime().part;
  const s = bldSlot(bid); if (s) { const dp = doorPt(s); scState(b.parent).player = { x: +dp.x.toFixed(2), y: +dp.y.toFixed(2) }; }
  S.pendingBld = { bid, act }; st.known = tkey();
  const checks = { knock: [], listen: [{ kind: "skill", skill: "perception", dc: 12, reason: "Расслышать, что за дверью" }], peek: [{ kind: "skill", skill: "stealth", dc: part >= 2 ? 11 : 13, reason: "Заглянуть в окно незаметно" }],
    pick: [{ kind: "skill", skill: "sleight", dc: b.lock, adv: C().cls === "rogue" ? 1 : 0, reason: "Вскрыть замок" }], force: [{ kind: "skill", skill: "athletics", dc: b.lock + 1, reason: "Выбить дверь" }] }[act];
  if (act === "enter") { st.how = st.broken ? "выбил дверь" : st.unlocked === tkey() ? "вскрыл замок" : st.open === tkey() ? "впустили хозяева" : (b.bk === "shop" || b.bk === "smithy") ? "заведение открыто" : "дверь была не заперта";
    return takeTurn(`Вхожу: ${b.name}`, { checks: [], move_to: bid }); }
  takeTurn(`${BLD_ACTS[act]}: ${b.name}`, { checks });
}
/* после бросков: что стало с дверью */
function bldAfterChecks(results) {
  const pb = S.pendingBld; if (!pb || !POIS[pb.bid]) return; const st = bstate(pb.bid); const k = tkey(); const r = results.find(x => x.kind === "skill"); const note = t => { results.push({ kind: "note", title: t }); pushFeed({ t: "sys", html: esc(t) }); };
  const home = bldHome(pb.bid).length;
  if (pb.act === "knock") { st.knocked = k; if (!home) note("На стук никто не отзывается"); else if (bldAsleep(pb.bid)) { st.alarm = k; note("Стук разбудил тех, кто внутри"); } }
  if (pb.act === "pick" && r) { if (r.ok) { st.unlocked = k; note("Замок поддался: дверь открыта"); sfx("chest"); } else { if (r.fumble || r.total <= r.dc - 5) { st.alarm = k; note("Отмычка сорвалась со скрежетом: внутри могли услышать"); } else note("Замок не поддаётся"); } }
  if (pb.act === "force" && r) { st.alarm = k; if (r.ok) { st.broken = true; note("Дверь с треском распахивается: шум слышен на всю улицу"); sfx("mace"); } else note("Дверь выдержала удар, но грохот был сильный"); }
  if (pb.act === "peek" && r && !r.ok && home && !bldAsleep(pb.bid)) { st.alarm = k; note("Кто-то внутри заметил лицо в окне"); }
}
function exitBuilding() {
  const b = POIS[S.world.loc]; if (!b?.inner || busy) return; const s = bldSlot(S.world.loc);
  S.world.loc = b.parent; if (s) { const dp = doorPt(s); scState(b.parent).player = { x: +dp.x.toFixed(2), y: +dp.y.toFixed(2) }; }
  S.log.push({ who: "p", text: `(выходит из здания «${b.name}» на улицу)` }); pushFeed({ t: "sys", html: `Вы выходите: <b>${esc(POIS[b.parent].name)}</b>` }); sfx("step"); lastSnap = null; after();
}
/* строки для рассказчика и арбитра */
function bldBrief() {
  const L = S.world.loc, p = POIS[L]; const out = [];
  const who = id => { const n = NPCS[id]; return `[${id}] ${n.name}, ${n.role}; ${n.look}; характер: ${n.persona}; тайна: ${n.secret}; отношение: ${S.world.npcs[id]?.att || 0}`; };
  if (p.inner) {
    const st = bstate(L); const home = p.npcs.filter(id => NPCS[id]);
    out.push(`ГЕРОЙ ВНУТРИ ЗДАНИЯ «${p.name}» (${p.desc}). Как попал: ${st.how || "вошёл"}. ${home.length ? (bldAsleep(L) ? "Жильцы СПЯТ (шум их разбудит)." : "Жильцы бодрствуют и видят героя.") : "Дома никого нет."}`);
    if (st.how && /выбил|вскрыл|не заперта/.test(st.how) && home.length && !bldAsleep(L)) out.push("Герой зашёл без приглашения — жильцы возмущены или напуганы и реагируют сразу (требуют уйти, кричат, хватают что под руку, грозят позвать соседей или стражу).");
    if (p.bk === "shop") out.push("Здесь можно купить обычные товары за золото (gold отрицательное, items_add)."); out.push(`Выход: на «${POIS[p.parent].name}» [${p.parent}].`);
  } else if (p.blds?.length) {
    out.push("ЗДАНИЯ НА ЭТОЙ УЛИЦЕ (move_to в здание — только если оно открыто): " + p.blds.map(bid => { const b = POIS[bid]; return `[${bid}] ${b.name} — ${bldLocked(bid) ? "заперто" : "не заперто"}, дома: ${bldHome(bid).length ? bldHome(bid).length + " чел." + (bldAsleep(bid) ? " (спят)" : "") : "никого"}`; }).join("; ") + ".");
  }
  const pb = S.pendingBld; if (pb && POIS[pb.bid] && pb.act !== "enter") { const b = POIS[pb.bid]; const home = bldHome(pb.bid);
    out.push(`ГЕРОЙ У ДВЕРИ «${b.name}» [${pb.bid}], действие: ${BLD_ACTS[pb.act].toLowerCase()}. Дверь: ${bstate(pb.bid).broken ? "выбита" : bldLocked(pb.bid) ? "заперта" : "не заперта"}. Внутри сейчас: ${home.length ? (bldAsleep(pb.bid) && bstate(pb.bid).alarm !== tkey() ? "(спят) " : "") + home.map(who).join(" | ") : "никого нет дома"}.
Жильцы герою пока незнакомы, если не встречались. Жилец может ответить из-за двери или выйти на порог — тогда укажи его id в speaker. Если жильцы впускают героя внутрь, добавь в JSON "building": {"id":"${pb.bid}","open":true}; если отказывают — {"id":"${pb.bid}","open":false}. Подглядывание и подслушивание дают обрывки разговоров и деталей обстановки, а не прямые признания.`); }
  if (pb?.act === "enter") out.push(`ГЕРОЙ ВХОДИТ в «${POIS[pb.bid].name}» (${bstate(pb.bid).how}). Опиши, что он видит внутри, и реакцию тех, кто дома.`);
  return out.join("\n");
}
function bldEffects(e) {
  if (!e || typeof e !== "object" || !POIS[e.id]?.inner) return; const st = bstate(e.id);
  if (e.open === true) { st.open = tkey(); pushFeed({ t: "chips", items: [{ c: "npc", x: `Вас впускают: ${POIS[e.id].name}` }] }); }
  else if (e.open === false) { st.open = null; if (S.world.loc === e.id) setTimeout(() => { if (S.world.loc === e.id) { pushFeed({ t: "sys", html: "Вас выставляют за дверь." }); exitBuilding(); } }, 400); }
}
/* ---------- планы внутри зданий ---------- */
function scInterior(sc, w, h, o = {}) {
  const b = POIS[sc.id]; const par = POIS[b.parent]; const pt = par ? tplOfPlace(par) : "street";
  const ground = { square: "cobble", gate: "cobble", pier: "sand", street: "dirt" }[pt] || "grass";
  w = Math.round(w * 2) / 2; h = Math.round(h * 2) / 2; const x0 = 9 - w / 2, x1 = 9 + w / 2, y0 = 6 - h / 2 - .2, y1 = 6 + h / 2 - .2; sc.flip = sc.R() < .5; const X = x => sc.flip ? 18 - x : x;
  sc.floor = [{ t: ground, box: [0, 0, SC_W, SC_H], dark: true }, { t: "shade" }, { t: o.floor || "planks", box: [x0, y0, x1, y1] }];
  scRoom(sc, x0, y0, x1, y1, { door: 9, mat: o.mat || "wood", windows: o.windows || [{ s: "t", p: X(9 - w / 4) }, { s: "t", p: X(9 + w / 4) }, { s: sc.flip ? "r" : "l", p: 6 }] });
  scAdd(sc, "door", 9, y1 - .25, 1.4, .4, { ghost: true }); sc.spawn = { x: 9, y: y1 - 1 }; sc.foes = { x: 9, y: y0 + 1.5 };
  return { x0, y0, x1, y1, X, w, h };
}
function scProp(sc, prop, x, y) {
  const P = { workbench: ["workbench", 2, .9], loom: ["loom", 1.4, 1.1], potwheel: ["potwheel", 1, 1], pelt: ["pelt", 1.6, 1.2], net: ["net", 1.5, 1.1], herbs: ["cauldron", .9, .9], rack: ["rack", 1.8, .5], barrel: ["barrel", 1, 1], sack: ["sack", 1, .8], crate: ["crate", 1, 1] }[prop];
  if (!P) return; const label = { barrel: ["корыто с бельём", "корыто с бельём"], sack: ["мешки", "мешки"], crate: ["ульи", "ульи"] }[prop]; scAdd(sc, P[0], x, y, P[1], P[2], label ? { label: label[0], acc: label[1] } : {});
  if (prop === "herbs") scAdd(sc, "herbs", x, y - 1, 2, .35, { ghost: true }); if (prop === "net") scAdd(sc, "oars", x + 1.4, y, .5, 1.8);
}
Object.assign(SC_BUILD, {
  street(sc) {
    const R = sc.R; const road = x => 6.1 + Math.sin(x * .45 + 1) * .3;
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H] }, { t: "path", pts: [-0.6, 2, 4.5, 7, 9.5, 12, 14.5, 18.6].map(x => [x, road(x)]), w: 2.2 }];
    const free = scBlds(sc);
    Object.entries(sc.doors).forEach(([, d]) => sc.floor.push({ t: "path", pts: [[d.x, d.y], [d.x + (R() - .5) * .4, road(d.x)]], w: .8 }));
    free.forEach(s => { if (R() < .6) { sc.floor.push({ t: "field", box: [s.x - s.w / 2 + .2, s.y - s.h / 2 + .2, s.x + s.w / 2 - .2, s.y + s.h / 2 - .2] }); sc.g.mark(s.x, s.y, s.w - .4, s.h - .4); scAdd(sc, "fence", s.x - s.w / 2 + .1, s.y, .2, s.h - .3, { ghost: true, act: false }); scAdd(sc, "fence", s.x + s.w / 2 - .1, s.y, .2, s.h - .3, { ghost: true, act: false }); }
      else scAdd(sc, "tree", s.x, s.y, 2.6, 2.6, { ghost: true, act: false }); });
    scAdd(sc, "well", 5.3, 4.25, 1.2, 1.2); scAdd(sc, "lamppost", 10.4, 4.6, .4, .4, { act: false }); scAdd(sc, "lamppost", 6.4, 7.7, .4, .4, { act: false });
    scAdd(sc, "cart", 11.6, 7.95, 1.3, 2.2, { r: 90 }); scScatter(sc, "barrel", 2, [0, 3.6, 18, 4.8], .85, .85, { pad: .3 }); scScatter(sc, "crate", 1, [0, 7.4, 18, 8.4], .9, .9, { pad: .3 });
    scScatter(sc, "bush", 6, [0, 0, SC_W, SC_H], 1, 1, { pad: .1, ghost: true, act: false, nofree: true, spread: 1, avoid: (x, y) => Math.abs(y - road(x)) < 1.7 || sc.objs.some(o => o.k === "bldroof" && Math.abs(o.x - x) < o.w / 2 + .5 && Math.abs(o.y - y) < o.h / 2 + .5) });
    for (const x of [2.6, 5.8, 8.8, 12.6, 15.6]) sc.anchors.stand.push({ x: x + R() * .6, y: road(x) + (R() < .5 ? -.75 : .75) });
    sc.spawn = { x: 1.2, y: road(1.2) }; sc.foes = { x: 16.2, y: road(16.2) };
  },
  b_house(sc) {
    const R = sc.R; const b = POIS[sc.id]; const occ = (b.occ || []).length; const { x0, y0, x1, y1, X, w } = scInterior(sc, 10.5 + R() * 2.5, 7.4 + R() * 1.2);
    scAdd(sc, "hearth", X(x0 + .6), 6 - .2, 1, 2.1); sc.anchors.stand.push({ x: X(x0 + 1.9), y: 5 });
    const tx = X(x0 + w * .4); scAdd(sc, "table", tx, 6.3, 2.3, 1.25); scChairsAround(sc, { x: tx, y: 6.3 }, 4, 1.15, "chair"); scAdd(sc, "candle", tx + .2, 6.2, .2, .2, { ghost: true, act: false });
    const beds = clamp(Math.ceil(occ / 2) + (occ > 2 ? 1 : 0), 1, 3);
    for (let i = 0; i < beds; i++) { const bx = X(x1 - 1.05 - i * 1.75), by = y0 + 1.55; scAdd(sc, "bed", bx, by, i === 0 && occ > 1 ? 1.6 : 1.15, 2.2); sc.anchors.sleep.push({ x: bx, y: by + .15 }); }
    scAdd(sc, "chest", X(x1 - 1.05), y0 + 3.25, 1.15, .75); scAdd(sc, "shelf", X(x0 + 2.7), y0 + .42, 2.8, .45);
    if (R() < .6) scAdd(sc, "cabinet", X(x0 + 5.2), y0 + .5, 1.4, .6); scAdd(sc, "rug", X(9.6), y1 - 1.9, 2.6, 1.5, { ghost: true, act: false, under: true });
    scProp(sc, b.prop, X(x1 - 1.6), y1 - 1.5); scScatter(sc, R() < .5 ? "barrel" : "sack", 1, [x0 + .6, y1 - 2, x0 + 3, y1 - .6], .9, .85, { pad: .2 });
    sc.anchors.work.push({ x: X(x0 + w * .4), y: 7.5 }, { x: X(x1 - 2.4), y: y1 - 1.6 });
  },
  b_poor(sc) {
    const R = sc.R; const { x0, y0, x1, y1, X } = scInterior(sc, 8 + R() * 1.5, 6 + R(), { floor: "dirt", mat: "log" });
    scAdd(sc, "campfire", 9, 5.6, 1.2, 1.2, { label: "очаг", acc: "очаг" }); scAdd(sc, "cauldron", 10.1, 6.4, .8, .8); scAdd(sc, "bedroll", X(x1 - 1), y0 + 1.5, 1.1, 1.9, { label: "лежанка", acc: "лежанку" }); sc.anchors.sleep.push({ x: X(x1 - 1), y: y0 + 1.5 });
    scAdd(sc, "table", X(x0 + 1.5), y0 + 1.2, 1.6, .9); scAdd(sc, "sack", X(x0 + 1), y1 - 1, .9, .8); scProp(sc, POIS[sc.id].prop, X(x1 - 1.4), y1 - 1.3);
    sc.anchors.stand.push({ x: 8, y: 4.8 }, { x: 10, y: 4.7 });
  },
  b_rich(sc) {
    const R = sc.R; const { x0, y0, x1, y1, X } = scInterior(sc, 14, 9.2);
    scAdd(sc, "rug", 9, 6, 6, 3.6, { ghost: true, act: false, under: true, v: .85 }); scAdd(sc, "hearth", X(x0 + .6), 5.4, 1.1, 2.4); scAdd(sc, "table", X(8.6), 6, 3.4, 1.3, { label: "обеденный стол", acc: "обеденный стол" });
    scChairsAround(sc, { x: X(8.6), y: 6 }, 6, 1.35, "chair"); scAdd(sc, "candle", X(8.2), 6, .2, .2, { ghost: true, act: false }); scAdd(sc, "candle", X(9.2), 6, .2, .2, { ghost: true, act: false });
    scAdd(sc, "bookcase", X(x0 + 3), y0 + .45, 3, .5); scAdd(sc, "cabinet", X(x0 + 5.5), y0 + .5, 1.4, .6, { label: "буфет с посудой", acc: "буфет с посудой" });
    scAdd(sc, "bed", X(x1 - 1.3), y0 + 1.7, 1.9, 2.4, { label: "хозяйская кровать", acc: "хозяйскую кровать" }); sc.anchors.sleep.push({ x: X(x1 - 1.3), y: y0 + 1.8 });
    scAdd(sc, "chest", X(x1 - 1.3), y0 + 3.6, 1.3, .8, { label: "окованный сундук", acc: "окованный сундук" }); scAdd(sc, "chest", X(x1 - .9), y1 - 1, 1.1, .7);
    scAdd(sc, "bed", X(x0 + 1), y1 - 1.5, 1.1, 2, { label: "кровать служанки", acc: "кровать служанки" }); sc.anchors.sleep.push({ x: X(x0 + 1), y: y1 - 1.5 }, { x: X(x1 - 1.6), y: y0 + 1.9 });
    scAdd(sc, "statue", X(x1 - 3.2), y0 + .8, .9, .9, { label: "бронзовая статуэтка", acc: "бронзовую статуэтку" }); scAdd(sc, "candle", X(x1 - 3.2), y1 - .8, .25, .25, { ghost: true, act: false });
    sc.anchors.work.push({ x: X(x0 + 2), y: 4.4 }, { x: X(8.6), y: 7.6 }, { x: X(x1 - 3), y: 7.2 }); void R;
  },
  b_shop(sc) {
    const R = sc.R; const b = POIS[sc.id]; const { x0, y0, x1, y1, X } = scInterior(sc, 11.5 + R(), 7.4);
    scAdd(sc, "shelf", 9, y0 + .42, 8, .5, { label: b.shelf || "полки с товаром", acc: b.shelf || "полки с товаром" }); scAdd(sc, "bar", 9, y0 + 2.5, 6, .9, { label: "прилавок", acc: "прилавок" });
    sc.anchors.work.push({ x: 8.2, y: y0 + 1.5 }, { x: 10.2, y: y0 + 1.5 }); scAdd(sc, "candle", 10.6, y0 + 2.5, .2, .2, { ghost: true, act: false });
    const pr = b.prop; if (pr === "oven") scAdd(sc, "hearth", X(x0 + .65), 6, 1.1, 2.4, { label: "печь", acc: "печь" }); if (pr === "herbs") { scAdd(sc, "herbs", X(x0 + 2.4), y0 + 1.1, 2.6, .35, { ghost: true }); scAdd(sc, "cauldron", X(x0 + 1.4), 6.4, .9, .9); }
    if (pr === "hook") { scAdd(sc, "hook", X(x0 + 1), 5.6, 1, 2.6); scAdd(sc, "table", X(x0 + 2.9), 7.2, 1.8, 1, { label: "разделочный стол", acc: "разделочный стол" }); }
    if (pr === "junk") { scScatter(sc, "crate", 3, [x0 + .5, y0 + 3.5, x0 + 4, y1 - .5], .9, .9, { rot: true, pad: .1, label: "ящики с хламом", acc: "ящики с хламом" }); scAdd(sc, "chest", X(x1 - 1.2), y1 - 1.2, 1.1, .7); }
    if (pr === "candles") { for (let i = 0; i < 5; i++) scAdd(sc, "candle", 6.6 + i * 1.2, y0 + 2.4, .2, .2, { ghost: true, act: false }); scAdd(sc, "table", X(x0 + 1.6), 7, 1.8, 1, { label: "стол свечника", acc: "стол свечника" }); }
    scScatter(sc, "barrel", 2, [x0 + .5, y0 + 3.3, x1 - .5, y1 - .5], .85, .85, { pad: .4 }); scScatter(sc, "sack", 2, [x0 + .5, y0 + 3.3, x1 - .5, y1 - .5], .9, .75, { pad: .4 });
    scAdd(sc, "bedroll", X(x1 - .9), y0 + 1.2, .9, 1.6, { label: "лежанка в углу", acc: "лежанку в углу" }); sc.anchors.sleep.push({ x: X(x1 - .9), y: y0 + 1.2 });
  },
  b_smithy(sc) {
    const R = sc.R; const { x0, y0, x1, y1, X } = scInterior(sc, 12.5, 8, { floor: "dirt", mat: "stone" });
    const f = scAdd(sc, "hearth", X(x0 + 1), 5.6, 1.7, 2.8, { label: "горн", acc: "горн", nolight: true }); sc.lights.push({ x: f.x, y: f.y, r: 210, c: "warm" });
    scAdd(sc, "anvil", X(x0 + 3.3), 5.8, 1, .7); scAdd(sc, "barrel", X(x0 + 3.2), 7.6, 1, 1, { label: "бочка с водой", acc: "бочку с водой" }); scAdd(sc, "rack", X(9.6), y0 + .4, 3, .5);
    scAdd(sc, "workbench", X(x1 - 1.6), 4.6, 2.2, 1); scAdd(sc, "sack", X(x1 - 1.2), y1 - 1, 1, .8, { label: "мешки с углём", acc: "мешки с углём" }); scAdd(sc, "crate", X(x1 - 2.5), y1 - 1, 1, 1, { label: "ящик с подковами", acc: "ящик с подковами" });
    sc.anchors.work.push({ x: X(x0 + 3.3), y: 4.8 }, { x: X(x0 + 2.3), y: 7 }); sc.anchors.sleep.push({ x: X(x1 - 1.4), y: 6.8 }); void R;
  },
  b_barn(sc) {
    const R = sc.R; const { x0, y0, x1, y1, X } = scInterior(sc, 13, 8.6, { floor: "dirt", mat: "log" });
    scScatter(sc, "hay", 3, [x0 + .5, y0 + .5, x0 + 5, y1 - 2], 1.6, 1.1, { pad: .2, rot: true });
    for (let i = 0; i < 3; i++) { const sx = X(x1 - 1.4 - i * 2.1); scAdd(sc, "fence", sx + 1, y0 + 1.6, .2, 2.6, { ghost: true, act: false }); scAdd(sc, "animal", sx, y0 + 1.6, 1.7, .9, { r: 90, label: ["корова", "лошадь", "коза"][i], acc: ["корову", "лошадь", "козу"][i], v: i / 3 }); }
    scAdd(sc, "stairs", X(x0 + 1.1), y1 - 1.6, 1.4, 2.2, { label: "лестница на сеновал", acc: "лестницу на сеновал" }); scAdd(sc, "cart", X(x1 - 2.5), y1 - 1.8, 1.3, 2.2, { r: 90 });
    scAdd(sc, "rack", X(x0 + 4.4), y1 - .4, 2.4, .45, { label: "вилы и грабли", acc: "вилы и грабли" }); sc.anchors.work.push({ x: X(x1 - 3), y: 5.6 }, { x: X(x0 + 4), y: 6 }); void R;
  },
  b_shed(sc) {
    const R = sc.R; const { x0, y0, x1, y1, X } = scInterior(sc, 8, 6, { mat: "log", windows: [] });
    scAdd(sc, "net", X(x0 + 1.4), y0 + 1.2, 1.8, 1.2); scAdd(sc, "oars", X(x1 - .7), 5.6, .5, 2); scScatter(sc, "crate", 3, [x0 + .5, y0 + .5, x1 - .5, y1 - 1.5], .9, .9, { pad: .2, rot: true });
    scScatter(sc, "barrel", 2, [x0 + .5, y0 + .5, x1 - .5, y1 - 1], .85, .85, { pad: .2 }); scAdd(sc, "lantern", X(x0 + .7), y1 - .8, .4, .4, { ghost: true, act: false }); sc.dark = .3; void R;
  },
  b_guard(sc) {
    const R = sc.R; const { x0, y0, x1, y1, X } = scInterior(sc, 11, 7.6, { floor: "flag", mat: "stone" });
    const tx = X(x0 + 4); scAdd(sc, "table", tx, 6, 2.2, 1.2, { label: "стол с костями", acc: "стол с костями" }); scChairsAround(sc, { x: tx, y: 6 }, 4, 1.15, "chair");
    scAdd(sc, "bed", X(x1 - 1), y0 + 1.5, 1.1, 2.1, { label: "нары", acc: "нары" }); scAdd(sc, "bed", X(x1 - 2.4), y0 + 1.5, 1.1, 2.1, { label: "нары", acc: "нары" }); sc.anchors.sleep.push({ x: X(x1 - 1), y: y0 + 1.6 }, { x: X(x1 - 2.4), y: y0 + 1.6 });
    scAdd(sc, "rack", X(x0 + 2.2), y0 + .4, 2.6, .5); scAdd(sc, "chest", X(x1 - 1.1), y1 - 1, 1.2, .75, { label: "сундук с конфискатом", acc: "сундук с конфискатом" }); scAdd(sc, "brazier", X(x0 + 1), y1 - 1.2, .9, .9);
    sc.anchors.work.push(...sc.anchors.sit.splice(0)); void R;
  }
});
Object.assign(SC_NAMES, { street: "Улица", b_house: "Дом", b_poor: "Лачуга", b_rich: "Богатый дом", b_shop: "Лавка", b_smithy: "Кузница", b_barn: "Амбар", b_shed: "Сарай", b_guard: "Караульня" });
Object.assign(SC_CROWD, { street: [["прохожий", "прачка", "мальчишка", "старуха", "торговец вразнос", "пьяница", "девчушка с корзиной"], [3, 4, 3, 1]], b_shop: [["покупатель", "покупательница"], [1, 1, 0, 0]] });
Object.assign(SC_AMB, { street: "birds", b_house: "campfire", b_poor: "campfire", b_rich: "campfire", b_smithy: "campfire" });
Object.assign(OBJ, { workbench: ["верстак", "верстак", 1], loom: ["прялка", "прялку"], potwheel: ["гончарный круг", "гончарный круг"], pelt: ["шкуры", "шкуры", 1], rack: ["стойка с оружием", "стойку с оружием", 1],
  animal: ["корова", "корову"], hook: ["туши на крюках", "туши на крюках"], oars: ["вёсла", "вёсла"], door: ["дверь", "дверь"] });
KINDS.street = "⌂";
MK_ICON.street = '<path d="M3 20v-8l4-3 4 3v8"/><path d="M13 20V10l4-3 4 3v10"/><path d="M2 20h20"/>';
