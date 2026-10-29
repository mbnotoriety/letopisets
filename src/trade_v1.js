/* =========================================================================
   ТОРГОВЛЯ: предметы, торговцы, цены, торг, сделка
   Деньги: 1 зм = 10 см. Цены в базе — в серебре (см).
   ========================================================================= */
Object.assign(WEAPONS, {
  dagger: { name: "Кинжал", dice: "1d4", abil: "finesse" }, handaxe: { name: "Ручной топор", dice: "1d6", abil: "str" }, spear: { name: "Копьё", dice: "1d6", abil: "str" },
  shortsword: { name: "Короткий меч", dice: "1d6", abil: "finesse" }, warhammer: { name: "Боевой молот", dice: "1d8", abil: "str" }, battleaxe: { name: "Боевой топор", dice: "1d8", abil: "str" },
  lcrossbow: { name: "Лёгкий арбалет", dice: "1d8", abil: "dex", ranged: true }
});
const SIMPLE_W = new Set(["staff", "mace", "dagger", "handaxe", "spear", "lcrossbow"]);
const WPROF = { fighter: () => true, cleric: w => SIMPLE_W.has(w), rogue: w => SIMPLE_W.has(w) || ["rapier", "shortsword", "longsword", "shortbow"].includes(w), wizard: w => ["staff", "dagger", "lcrossbow"].includes(w) };
const APROF = { fighter: ["light", "medium", "heavy", "shield"], cleric: ["light", "medium", "shield"], rogue: ["light"], wizard: [] };
const ITEMS = {
  dagger: { n: "Кинжал", cat: "weapon", p: 20, w: "dagger", d: "1d4 · фехтовальное, простое" }, handaxe: { n: "Ручной топор", cat: "weapon", p: 50, w: "handaxe", d: "1d6 · простое" },
  spear: { n: "Копьё", cat: "weapon", p: 10, w: "spear", d: "1d6 · простое" }, mace: { n: "Булава", cat: "weapon", p: 50, w: "mace", d: "1d6 · простое" }, staff: { n: "Боевой посох", cat: "weapon", p: 2, w: "staff", d: "1d6 · простое" },
  lcrossbow: { n: "Лёгкий арбалет", cat: "weapon", p: 250, w: "lcrossbow", d: "1d8 · дальнобойное, простое" }, shortsword: { n: "Короткий меч", cat: "weapon", p: 100, w: "shortsword", d: "1d6 · фехтовальное, воинское" },
  rapier: { n: "Рапира", cat: "weapon", p: 250, w: "rapier", d: "1d8 · фехтовальное, воинское" }, longsword: { n: "Длинный меч", cat: "weapon", p: 150, w: "longsword", d: "1d8 · воинское" },
  warhammer: { n: "Боевой молот", cat: "weapon", p: 150, w: "warhammer", d: "1d8 · воинское" }, battleaxe: { n: "Боевой топор", cat: "weapon", p: 100, w: "battleaxe", d: "1d8 · воинское" },
  shortbow: { n: "Короткий лук", cat: "weapon", p: 250, w: "shortbow", d: "1d6 · дальнобойное, воинское", alias: ["Короткий лук и 20 стрел"] },
  leather: { n: "Кожаный доспех", cat: "armor", p: 100, a: { base: 11, dex: 99, t: "light" }, d: "КД 11 + ЛОВ · лёгкий" }, studded: { n: "Клёпаная кожа", cat: "armor", p: 300, a: { base: 12, dex: 99, t: "light" }, d: "КД 12 + ЛОВ · лёгкий" },
  chainshirt: { n: "Кольчужная рубаха", cat: "armor", p: 350, a: { base: 13, dex: 2, t: "medium" }, d: "КД 13 + ЛОВ (макс. 2) · средний" }, scale: { n: "Чешуйчатый доспех", cat: "armor", p: 450, a: { base: 14, dex: 2, t: "medium" }, d: "КД 14 + ЛОВ (макс. 2) · средний" },
  chainmail: { n: "Кольчуга", cat: "armor", p: 600, a: { base: 16, dex: 0, t: "heavy" }, d: "КД 16 · тяжёлый" }, shield: { n: "Щит", cat: "armor", p: 100, a: { shield: true, t: "shield" }, d: "+2 к КД" },
  potion: { n: "Зелье лечения", cat: "potion", p: 150, heal: "2d4+2", d: "Восстанавливает 2d4+2 HP" }, potion2: { n: "Сильное зелье лечения", cat: "potion", p: 400, heal: "4d4+4", d: "Восстанавливает 4d4+4 HP" },
  antidote: { n: "Противоядие", cat: "potion", p: 50, heal: "1d4", d: "Снимает яд и боль, +1d4 HP" }, holywater: { n: "Святая вода", cat: "potion", p: 100, d: "Флакон: обжигает нежить и нечисть" },
  healkit: { n: "Набор лекаря", cat: "gear", p: 50, heal: "1d6", d: "Перевязка: +1d6 HP, одно применение" }, torch: { n: "Факел", cat: "gear", p: 1, d: "Свет на час" },
  rope: { n: "Верёвка, 15 м", cat: "gear", p: 10, d: "Пеньковая, крепкая" }, lantern: { n: "Фонарь", cat: "gear", p: 50, d: "Яркий свет, не гаснет на ветру" }, oil: { n: "Фляга масла", cat: "gear", p: 1, d: "Для фонаря или поджога" },
  thieves: { n: "Воровские инструменты", cat: "gear", p: 120, tag: "lockpick", d: "Преимущество при взломе замков" }, crowbar: { n: "Лом", cat: "gear", p: 20, tag: "crowbar", d: "Преимущество, чтобы выбить дверь" },
  bedroll: { n: "Спальник", cat: "gear", p: 10, d: "Тёплый, свёрнут в рулон" }, waterskin: { n: "Бурдюк", cat: "gear", p: 2, d: "Вода или что покрепче" }, flint: { n: "Огниво и трут", cat: "gear", p: 5, d: "Пригодится в темноте" },
  candles: { n: "Свечи, связка", cat: "gear", p: 2, d: "Пять сальных свечей" }, incense: { n: "Ладан", cat: "gear", p: 5, d: "Для обрядов и дурного воздуха" },
  map: { n: "Карта окрестностей", cat: "gear", p: 30, tag: "map", d: "Открывает места вокруг поселения на карте" }, spyglass: { n: "Подзорная труба", cat: "gear", p: 400, d: "Видно далеко и подробно" },
  bread: { n: "Хлеб", cat: "food", p: 1, heal: "1", d: "Ещё тёплый" }, pie: { n: "Пирог с рыбой", cat: "food", p: 3, heal: "1d2", d: "Сытный, с луком" }, bun: { n: "Сладкая булка", cat: "food", p: 2, heal: "1", d: "С мёдом" },
  rations: { n: "Дорожный паёк", cat: "food", p: 5, heal: "1d4", d: "Сухари, сыр, вяленое мясо" }, sausage: { n: "Кровяная колбаса", cat: "food", p: 4, heal: "1d2", d: "Жирная, с чесноком" },
  smokedfish: { n: "Копчёная рыба", cat: "food", p: 3, heal: "1d2", d: "Пахнет дымом и солью" }, wine: { n: "Бутылка вина", cat: "food", p: 20, d: "Южное, терпкое" },
  ring: { n: "Серебряное кольцо", cat: "valuable", p: 60, d: "Тонкая работа" }, medallion: { n: "Медальон с портретом", cat: "valuable", p: 40, d: "Внутри — чьё-то лицо" }, amber: { n: "Кусок янтаря", cat: "valuable", p: 50, d: "С мушкой внутри" },
  pearl: { n: "Жемчужина", cat: "valuable", p: 100, d: "Ровная, с розовым отливом" }, silvercup: { n: "Серебряный кубок", cat: "valuable", p: 150, d: "С гравировкой" }, boneknife: { n: "Нож с костяной рукоятью", cat: "valuable", p: 15, d: "Острый, с вырезанным знаком" },
  oldmap: { n: "Старая карта с пометкой", cat: "valuable", p: 20, d: "Крестик в неожиданном месте" }, herbsbundle: { n: "Свёрток с травами", cat: "valuable", p: 10, d: "Мята и полынь" }, liquor: { n: "Фляга крепкой настойки", cat: "food", p: 15, d: "Согревает и развязывает языки" },
  room: { n: "Комната на ночь", cat: "service", p: 5, svc: "rest", d: "Ночлег и полный отдых" }, meal: { n: "Горячий ужин", cat: "service", p: 3, svc: "meal", d: "Похлёбка с хлебом: +1d4 HP" },
  drink: { n: "Кружка эля на всех", cat: "service", p: 8, svc: "round", d: "Угостить зал: репутация и слухи" }, ale: { n: "Кружка эля", cat: "service", p: 1, svc: "ale", d: "Посидеть и послушать разговоры" },
  heal: { n: "Исцеление ран", cat: "service", p: 50, svc: "healfull", d: "Молитва и перевязка: все HP" }, bless: { n: "Благословение", cat: "service", p: 20, svc: "bless", d: "Преимущество на следующую проверку" },
  donate: { n: "Пожертвование", cat: "service", p: 50, svc: "donate", d: "На нужды храма: репутация растёт" }
};
const ITEM_BY_NAME = {}; Object.entries(ITEMS).forEach(([id, it]) => { [it.n, ...(it.alias || [])].forEach(n => ITEM_BY_NAME[n.toLowerCase()] = id); });
Object.assign(ITEM_BY_NAME, { "кольчуга": "chainmail", "чешуйчатый доспех": "scale", "щит": "shield", "кожаный доспех": "leather", "огниво и трут": "flint" });
const CAT_NAMES = { weapon: "Оружие", armor: "Доспехи", potion: "Зелья", gear: "Снаряжение", food: "Еда", valuable: "Ценности", service: "Услуги", misc: "Прочее" };
const CAT_COL = { weapon: "#d0814f", armor: "#72aed0", potion: "#e8735a", gear: "#a1b4b1", food: "#e3c06a", valuable: "#c59af0", service: "#7cc79c", misc: "#9a8a70" };
const CAT_ICON = { weapon: '<path d="M20 4 9.5 14.5M15 4h5v5"/><path d="M7 12.5l4.5 4.5M4 20l3.5-3.5"/>', armor: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/>', potion: '<path d="M10 3h4M10.5 3v5L5.4 16.8A3 3 0 0 0 8 21h8a3 3 0 0 0 2.6-4.2L13.5 8V3"/><path d="M7.5 14.5h9"/>',
  gear: '<rect x="5" y="7" width="14" height="14" rx="3"/><path d="M9 7V5.5a3 3 0 0 1 6 0V7M5 13h14M10 13v3h4v-3"/>', food: '<path d="M4 12a8 5.5 0 0 1 16 0v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M8.5 11v3M12 10v4M15.5 11v3"/>',
  valuable: '<path d="M6 4h12l3 5-9 11L3 9z"/><path d="M3 9h18M9.5 4 12 20l2.5-16"/>', service: '<path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7-5.1-2.8-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"/>', misc: '<path d="M7 4h11v13a3 3 0 0 1-3 3H6a2 2 0 0 1-2-2v-1h11"/><path d="M7 4a2 2 0 0 0-2 2v11"/>' };
const COIN = '<svg class="coin" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="#e0b85a" stroke="#8a6420"/><circle cx="8" cy="8" r="4" fill="none" stroke="#a87c2a" stroke-width="1"/></svg>';
function catIcon(cat, size = 20) { return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CAT_ICON[cat] || CAT_ICON.misc}</svg>`; }
/* кошелёк */
function purse(c) { return (c.gold || 0) * 10 + (c.silver || 0); }
function setPurse(c, sp) { sp = Math.max(0, Math.round(sp)); c.gold = Math.floor(sp / 10); c.silver = sp % 10; }
function fmtMoney(sp) { sp = Math.round(sp); const g = Math.floor(Math.abs(sp) / 10), s = Math.abs(sp) % 10; return (sp < 0 ? "−" : "") + (g ? `${g} зм` : "") + (g && s ? " " : "") + (s || !g ? `${s} см` : ""); }
/* предметы героя */
function itemIdOf(it) { return it.id || ITEM_BY_NAME[String(it.name || "").toLowerCase()] || null; }
function itemCat(it) { const id = itemIdOf(it); if (id) return ITEMS[id].cat; if (it.potion) return "potion"; return "misc"; }
function itemValue(it) {
  const id = itemIdOf(it); if (id) return ITEMS[id].p; const n = String(it.name || "").toLowerCase();
  if (/письм|записк|ключ|улик|дневник|печать|приказ|список|книга заклинаний|священный символ|компонент/.test(n)) return 0;
  if (/жемч|самоцвет|рубин|изумруд|сапфир|алмаз/.test(n)) return 120; if (/золот/.test(n)) return 100; if (/серебр/.test(n)) return 50; if (/кольц|серьг|браслет|медальон|амулет|брошь|подвеск/.test(n)) return 40;
  if (/меч|топор|молот|арбалет|лук/.test(n)) return 60; if (/кинжал|нож/.test(n)) return 12; if (/свиток|карта/.test(n)) return 20; if (/зелье|эликсир/.test(n)) return 80; return 5;
}
function gearOf(c) {
  if (!c.gear) { const def = { fighter: ["chainmail", true], cleric: ["scale", true], rogue: ["leather", false], wizard: [null, false] }[c.cls] || [null, false]; c.gear = { armor: def[0], shield: def[1] }; }
  return c.gear;
}
function acNow(c) { const g = gearOf(c); const dex = mod(c.scores.dex); const A = g.armor && ITEMS[g.armor]?.a; return (A ? A.base + Math.min(dex, A.dex) : 10 + dex) + (g.shield ? 2 : 0); }
function recalcAC(c) { c.ac = acNow(c); return c.ac; }
function canWear(c, id) { const A = ITEMS[id]?.a; return !!A && (APROF[c.cls] || []).includes(A.t); }
function hasTag(tag) { return C().items.some(it => { const id = itemIdOf(it); return id && ITEMS[id].tag === tag; }); }
function weaponProf(c, w) { return (WPROF[c.cls] || (() => true))(w); }
/* ---------- торговцы ---------- */
const MERCH = {
  smith: { title: "Кузница", buys: ["weapon", "armor"], rate: .5, gold: [60, 130], pick: 9, stock: [["dagger", 3], ["handaxe", 2], ["spear", 2], ["mace", 1], ["shortsword", 1], ["longsword", 1], ["warhammer", 1], ["battleaxe", 1], ["shield", 2], ["chainshirt", 1], ["scale", 1], ["chainmail", 1], ["crowbar", 2]],
    greet: ["Сталь добрая, без обмана. Что ищешь?", "Клинок, щит или что покрепче на плечи?", "Металл не врёт. Выбирай."] },
  general: { title: "Лавка", buys: ["gear", "food", "valuable", "weapon"], rate: .4, gold: [30, 70], pick: 11, stock: [["torch", 6], ["rope", 2], ["lantern", 1], ["oil", 4], ["bedroll", 2], ["waterskin", 2], ["flint", 2], ["rations", 5], ["candles", 3], ["map", 1], ["potion", 1], ["dagger", 1], ["healkit", 1], ["crowbar", 1], ["thieves", 1]],
    greet: ["Всё, что нужно в дорогу, — у меня.", "Смотри, трогай, только не ломай.", "Свежий товар, вчера привезли."] },
  apothecary: { title: "Аптекарская лавка", buys: ["potion"], buyIds: ["herbsbundle"], rate: .45, gold: [40, 90], stock: [["potion", 3], ["potion2", 1], ["antidote", 2], ["healkit", 2], ["herbsbundle", 2], ["incense", 2]],
    greet: ["От ран, от хвори, от дурного глаза. Чего желаете?", "Только не трогайте синие склянки."] },
  bakery: { title: "Пекарня", buys: ["food"], rate: .4, gold: [10, 25], stock: [["bread", 8], ["pie", 4], ["bun", 5], ["rations", 2]], greet: ["Только из печи! Берите, пока тёплое.", "Хлеб, пироги, булки — всё сегодняшнее."] },
  butcher: { title: "Лавка мясника", buys: ["food"], rate: .4, gold: [15, 30], stock: [["sausage", 5], ["smokedfish", 4], ["rations", 3]], greet: ["Мясо свежее, рыба копчёная. Сколько вешать?"] },
  junk: { title: "Лавка старьёвщика", buys: ["weapon", "armor", "gear", "valuable", "misc", "food", "potion"], rate: .3, gold: [25, 60], pick: 8,
    stock: [["dagger", 1], ["spear", 1], ["shortsword", 1], ["leather", 1], ["shield", 1], ["lantern", 1], ["rope", 1], ["spyglass", 1], ["oldmap", 1], ["thieves", 1], ["medallion", 1], ["ring", 1], ["liquor", 1], ["amber", 1], ["map", 1], ["crowbar", 1], ["bedroll", 1]],
    greet: ["Всё бывшее в деле, но крепкое. Почти всё.", "У меня есть то, чего нет ни у кого. И кое-что, чего лучше бы не было."] },
  candles: { title: "Свечная лавка", buys: ["gear"], rate: .35, gold: [15, 35], stock: [["candles", 8], ["torch", 6], ["lantern", 2], ["oil", 5], ["incense", 3], ["holywater", 1]], greet: ["Свет нужен всем. Особенно ночью."] },
  tavern: { title: "Таверна", buys: ["food"], rate: .35, gold: [30, 60], stock: [["ale", 99], ["drink", 99], ["meal", 99], ["room", 99], ["bread", 6], ["pie", 3], ["rations", 3], ["wine", 2]],
    greet: ["Эль, похлёбка, лавка у огня — что угодно?", "Садись. Сначала монета, потом разговоры.", "Комната наверху свободна, если что."] },
  merchant: { title: "Купеческий дом", buys: ["valuable", "weapon", "armor"], rate: .6, gold: [120, 220], stock: [["wine", 3], ["spyglass", 1], ["map", 1], ["potion", 1], ["ring", 1], ["amber", 1], ["silvercup", 1], ["pearl", 1]],
    greet: ["Я покупаю редкое и продаю ценное. Удивите меня.", "Время — деньги. Чем могу быть полезен?"] },
  temple: { title: "Храм", buys: [], rate: 0, gold: [20, 40], stock: [["heal", 99], ["bless", 99], ["donate", 99], ["holywater", 2], ["candles", 4], ["incense", 3], ["potion", 1]],
    greet: ["Свет примет каждого, кто пришёл с миром.", "Пожертвование угодно богам, но помощь мы даём не за монету одну."] },
  stall: { title: "Прилавок", buys: ["food", "gear", "valuable"], rate: .35, gold: [15, 35], pick: 6, stock: [["bread", 4], ["pie", 2], ["smokedfish", 3], ["torch", 4], ["rope", 1], ["candles", 2], ["bun", 3], ["waterskin", 1], ["rations", 2], ["flint", 1]],
    greet: ["Подходи, не стесняйся!", "Дёшево отдам, только для тебя."] }
};
const SHOP_PROP = { oven: "bakery", junk: "junk", herbs: "apothecary", hook: "butcher", goods: "general", candles: "candles" };
function merchantType(id) {
  const n = NPCS[id]; if (!n) return null; const r = (n.role || "").toLowerCase();
  if (n.bld) { const b = POIS[n.bld]; if (b?.bk === "shop") return SHOP_PROP[b.prop] || "general"; if (b?.bk === "smithy") return "smith"; if (b?.bk === "rich" && /купец|купчих/.test(r)) return "merchant"; }
  if (/кузнец/.test(r)) return "smith"; if (/пекар/.test(r)) return "bakery"; if (/мясник/.test(r)) return "butcher"; if (/аптекар|травни|знахар/.test(r)) return "apothecary"; if (/старьёвщ/.test(r)) return "junk"; if (/свечник/.test(r)) return "candles";
  if (/купец|купчих/.test(r)) return "merchant"; if (/лавочн|торговец|торговк|продав/.test(r)) return "general"; if (/хозя.{0,4}(таверн|трактир|постоял|корчм)|трактирщ|корчмар|кабатчик|харчевн/.test(r)) return "tavern";
  if (/жри|свящ|монах|монахин|сестра|настоятел|проповедн/.test(r)) { const p = Object.values(POIS).find(pp => pp.npcs?.includes(id)); if (p && ["chapel", "shrine"].includes(tplOfPlace(p))) return "temple"; }
  return null;
}
function merchantsHere() {
  const loc = POIS[S.world.loc]; const out = []; const asleep = loc.inner && bldAsleep(S.world.loc);
  if (!asleep) (loc.npcs || []).forEach(id => { const t = merchantType(id); if (!t) return; const n = NPCS[id]; const atHome = !n.bld || n.bld === S.world.loc || t === "tavern" || t === "temple"; if (atHome || t === "merchant") out.push({ key: n.bld && POIS[n.bld]?.bk !== "house" && POIS[n.bld]?.bk !== "poor" ? n.bld : id, type: t, npc: id, name: n.name, role: n.role }); });
  const tpl = sceneTpl(S.world.loc); if (["square", "street"].includes(tpl) && worldTime().part < 3) { const hasStall = sceneOf(S.world.loc).objs.some(o => o.k === "stall"); if (hasStall || tpl === "street") out.push({ key: S.world.loc + ":stall", type: "stall", npc: null, name: tpl === "street" ? "Торговка вразнос" : "Торговка у прилавка", role: "уличная торговка" }); }
  const seen = new Set(); return out.filter(m => !seen.has(m.key) && seen.add(m.key));
}
function shopState(m) {
  S.shops = S.shops || {}; const day = worldTime().day; const cyc = Math.floor((day - 1) / 3); let st = S.shops[m.key];
  if (!st || st.cyc !== cyc || st.type !== m.type) {
    const M = MERCH[m.type]; const R = mulberry(hash(WD.id + m.key + ":" + cyc)); let list = M.stock.slice();
    if (M.pick) { for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; } list = list.slice(0, M.pick); }
    st = { cyc, type: m.type, stock: list.map(([id, q]) => ({ id, q: q >= 99 ? 99 : Math.max(1, Math.round(q * (.6 + R() * .8))) })), gold: Math.round((M.gold[0] + R() * (M.gold[1] - M.gold[0])) * 10), hag: st?.hag || null, ok: st?.ok || null, deals: st?.deals || 0 };
    S.shops[m.key] = st;
  }
  return st;
}
function priceFactor(m) { const rep = S.world.rep || 0; const att = m.npc ? (S.world.npcs[m.npc]?.att || 0) : 0; return clamp(1 - clamp(rep, -60, 60) / 250 - clamp(att, -60, 60) / 300, .75, 1.45); }
function hagMult(st) { return st.hag && st.hag.day === worldTime().day ? st.hag.m : 1; }
function buyPrice(m, st, id) { return Math.max(1, Math.round(ITEMS[id].p * priceFactor(m) * hagMult(st))); }
function merchantBuys(m, it) { const M = MERCH[m.type]; const id = itemIdOf(it); const cat = itemCat(it); return M.rate > 0 && (M.buys.includes(cat) || (M.buyIds || []).includes(id)); }
function sellPrice(m, st, it) { const v = itemValue(it); if (!v || !merchantBuys(m, it)) return 0; return Math.max(1, Math.round(v * MERCH[m.type].rate / priceFactor(m) * (2 - hagMult(st)))); }
function refusesTrade(m) { if (!m.npc) return (S.world.rep || 0) <= -40; const att = S.world.npcs[m.npc]?.att || 0; const st = shopState(m); return (att <= -30 || (S.world.rep || 0) <= -40) && st.ok !== worldTime().day; }
const GREET_HOSTILE = ["Говори быстро, что надо, и уходи.", "Деньги вперёд. И руки держи на виду.", "Тебе здесь не рады, но монета есть монета."];
const GREET_FRIEND = ["А, это ты! Для тебя найдётся кое-что получше.", "Рад видеть! Для друга — особая цена.", "Заходи, заходи. Что сегодня?"];
function greetFor(m) { const att = m.npc ? (S.world.npcs[m.npc]?.att || 0) : 0; const rep = S.world.rep || 0; const R = mulberry(hash(m.key + worldTime().day));
  const list = att + rep / 2 <= -10 ? GREET_HOSTILE : att + rep / 2 >= 12 ? GREET_FRIEND : MERCH[m.type].greet; return list[Math.floor(R() * list.length)]; }
/* ---------- окно торговли ---------- */
let SHOP = null;
function openShop(m) {
  if (!S || busy) return; if (S.world.combat) { pushFeed({ t: "sys", html: "Во время боя не до торговли." }); return; }
  shopState(m); SHOP = { m, buy: {}, sell: [], cat: "all", msg: "" }; sfx("open");
  modal(`<div class="shop" id="shop"></div>`, root => { root.querySelector(".modal").classList.add("wide", "shop-modal"); renderShop(); });
}
function shopTotals() {
  const { m } = SHOP; const st = shopState(m); const c = C();
  const buy = Object.entries(SHOP.buy).reduce((a, [id, q]) => a + buyPrice(m, st, id) * q, 0); const sell = SHOP.sell.reduce((a, it) => a + sellPrice(m, st, it), 0);
  return { buy, sell, bal: buy - sell, after: purse(c) - buy + sell, merchAfter: st.gold + buy - sell };
}
function renderShop() {
  const box = document.getElementById("shop"); if (!box || !SHOP) return; const { m } = SHOP; const st = shopState(m); const c = C(); const M = MERCH[m.type]; const T = shopTotals();
  const att = m.npc ? (S.world.npcs[m.npc]?.att || 0) : 0; const [al, ac] = attLabel(att); const pf = priceFactor(m) * hagMult(st); const pct = Math.round((pf - 1) * 100);
  const refuse = refusesTrade(m);
  const cats = ["all", ...new Set(st.stock.map(s => ITEMS[s.id].cat))];
  const wares = st.stock.filter(s => SHOP.cat === "all" || ITEMS[s.id].cat === SHOP.cat).map(s => { const it = ITEMS[s.id]; const inDeal = SHOP.buy[s.id] || 0; const left = s.q >= 99 ? 99 : s.q - inDeal; const price = buyPrice(m, st, s.id);
    const note = it.w && !weaponProf(c, it.w) ? "нет владения" : it.a && !canWear(c, s.id) ? "нет владения" : it.a && !it.a.shield && ITEMS[gearOf(c).armor]?.a && (it.a.base + Math.min(mod(c.scores.dex), it.a.dex)) <= (acNow(c) - (gearOf(c).shield ? 2 : 0)) ? "не лучше вашего" : it.w && c.weapons.includes(it.w) ? "уже есть" : "";
    return `<button type="button" class="ware${inDeal ? " in" : ""}" data-buy="${s.id}" ${left <= 0 || refuse ? "disabled" : ""} style="--cc:${CAT_COL[it.cat]}"><span class="ware-ic">${catIcon(it.cat)}</span><span class="ware-t"><b>${esc(it.n)}</b><small>${esc(it.d || "")}</small>${note ? `<em>${note}</em>` : ""}</span><span class="ware-p">${COIN}${fmtMoney(price)}<small>${s.q >= 99 ? "" : left > 0 ? "× " + left : "нет"}</small></span>${inDeal ? `<i class="ware-n">${inDeal}</i>` : ""}</button>`; }).join("") || `<p class="empty">Ничего из этого сейчас нет.</p>`;
  const g = gearOf(c);
  const inv = c.items.map((it, i) => { const sp = sellPrice(m, st, it); const sel = SHOP.sell.includes(it); const id = itemIdOf(it); const cat = itemCat(it);
    const worn = id && ((g.armor === id) || (id === "shield" && g.shield)) ? "надето" : id && ITEMS[id].w && c.weapons.includes(ITEMS[id].w) ? "оружие" : "";
    const lastW = id && ITEMS[id].w && c.weapons.length <= 1 && c.weapons.includes(ITEMS[id].w);
    return `<button type="button" class="inv-row${sel ? " in" : ""}" data-sell="${i}" ${!sp || lastW || refuse ? "disabled" : ""} style="--cc:${CAT_COL[cat]}"><span class="ware-ic s">${catIcon(cat, 16)}</span><span class="inv-t">${esc(it.name)}${worn ? `<small>${worn}</small>` : ""}</span><span class="inv-p">${lastW ? "последнее оружие" : sp ? `${COIN}${fmtMoney(sp)}` : "не интересует"}</span></button>`; }).join("") || `<p class="empty">Сумка пуста.</p>`;
  const dealChips = [...Object.entries(SHOP.buy).map(([id, q]) => `<button type="button" class="dchip buy" data-unbuy="${id}" title="Убрать">${esc(ITEMS[id].n)}${q > 1 ? " ×" + q : ""}<span>${fmtMoney(buyPrice(m, st, id) * q)}</span></button>`),
    ...SHOP.sell.map((it, k) => `<button type="button" class="dchip sell" data-unsell="${k}" title="Убрать">${esc(it.name)}<span>+${fmtMoney(sellPrice(m, st, it))}</span></button>`)].join("");
  const hagToday = st.hag && st.hag.day === worldTime().day;
  const problems = T.after < 0 ? "Не хватает денег" : T.merchAfter < 0 ? "У торговца не хватит денег" : "";
  box.innerHTML = `<header class="shop-head">
    <div class="shop-who">${m.npc ? npcPh(m.npc) : `<div class="ph stall-ph">${catIcon("food", 30)}</div>`}<div><div class="eyebrow">${esc(M.title)} · ${esc(POIS[S.world.loc].name)}</div><h2>${esc(m.name)}</h2>
      <div class="shop-tags">${m.npc ? `<span class="tag ${ac}">${al}</span>` : ""}<span class="tag ${(S.world.rep || 0) <= -10 ? "neg" : (S.world.rep || 0) >= 10 ? "pos" : ""}">репутация: ${repLabel(S.world.rep || 0)}</span><span class="tag ${pct > 0 ? "neg" : pct < 0 ? "pos" : ""}">цены ${pct === 0 ? "обычные" : (pct > 0 ? "+" : "−") + Math.abs(pct) + "%"}</span></div></div></div>
    <q class="shop-greet">${esc(refuse ? "Нечего мне с тобой обсуждать. Ступай." : greetFor(m))}</q>
    <div class="shop-purses"><div><small>Ваш кошель</small><b>${COIN}${fmtMoney(purse(c))}</b></div><div><small>Касса</small><b>${COIN}${fmtMoney(st.gold)}</b></div></div>
    <button type="button" class="shop-x" id="shop-x" aria-label="Уйти">×</button></header>
  ${refuse ? `<div class="shop-refuse"><p>${esc(m.name)} не хочет иметь с вами дела: ${(S.world.rep || 0) <= -40 ? "о вас дурная слава в поселении" : "вы испортили отношения"}.</p><button class="btn primary" type="button" id="shop-plead">Уговорить · Убеждение КС 15</button>${SHOP.msg ? `<p class="shop-msg">${SHOP.msg}</p>` : ""}</div>` : ""}
  <div class="shop-body">
    <section class="shop-col"><div class="shop-col-h"><h3>Товар</h3><div class="shop-cats">${cats.map(k => `<button type="button" data-cat="${k}" aria-pressed="${SHOP.cat === k}">${k === "all" ? "Всё" : CAT_NAMES[k]}</button>`).join("")}</div></div><div class="shop-grid">${wares}</div></section>
    <section class="shop-col inv"><div class="shop-col-h"><h3>Ваши вещи</h3><small>${M.rate > 0 ? "Покупает: " + [...M.buys.map(k => CAT_NAMES[k].toLowerCase()), ...((M.buyIds || []).map(id => ITEMS[id].n.toLowerCase()))].join(", ") : "Здесь ничего не покупают"}</small></div><div class="shop-list">${inv}</div></section>
  </div>
  <footer class="shop-deal">
    <div class="deal-l"><span class="eyebrow">Сделка</span><div class="deal-items">${dealChips || `<span class="home-note">Нажмите на товар, чтобы купить, или на свою вещь, чтобы продать.</span>`}</div></div>
    <div class="deal-sum"><small>${T.bal > 0 ? "Вы платите" : T.bal < 0 ? "Вы получаете" : "Итог"}</small><b class="${T.bal > 0 ? "neg" : T.bal < 0 ? "pos" : ""}">${COIN}${fmtMoney(Math.abs(T.bal))}</b><small>останется: ${fmtMoney(Math.max(0, T.after))}</small></div>
    <div class="deal-r">
      <div class="haggle">${hagToday ? `<span class="hag-res ${st.hag.m < 1 ? "pos" : st.hag.m > 1 ? "neg" : ""}">${esc(st.hag.txt)}</span>` : `<span class="eyebrow">Торг</span><div class="hag-btns"><button type="button" class="btn small" data-hag="persuasion" ${refuse ? "disabled" : ""}>Уговорить</button><button type="button" class="btn small" data-hag="deception" ${refuse ? "disabled" : ""}>Схитрить</button><button type="button" class="btn small" data-hag="intimidation" ${refuse ? "disabled" : ""}>Надавить</button></div>`}</div>
      <button type="button" class="btn primary deal-go" id="deal-go" ${(!T.buy && !T.sell) || problems || refuse ? "disabled" : ""}>${problems || "Заключить сделку"}</button></div>
  </footer>${SHOP.msg && !refuse ? `<div class="shop-toast">${SHOP.msg}</div>` : ""}`;
  box.querySelector("#shop-x").onclick = closeShop;
  box.querySelectorAll("[data-cat]").forEach(b => b.onclick = () => { SHOP.cat = b.dataset.cat; SHOP.msg = ""; renderShop(); });
  box.querySelectorAll("[data-buy]").forEach(b => b.onclick = () => { const id = b.dataset.buy; SHOP.buy[id] = (SHOP.buy[id] || 0) + 1; SHOP.msg = ""; sfx("pick"); renderShop(); });
  box.querySelectorAll("[data-unbuy]").forEach(b => b.onclick = () => { const id = b.dataset.unbuy; if (--SHOP.buy[id] <= 0) delete SHOP.buy[id]; SHOP.msg = ""; renderShop(); });
  box.querySelectorAll("[data-sell]").forEach(b => b.onclick = () => { const it = c.items[+b.dataset.sell]; const k = SHOP.sell.indexOf(it); if (k >= 0) SHOP.sell.splice(k, 1); else SHOP.sell.push(it); SHOP.msg = ""; sfx("pick"); renderShop(); });
  box.querySelectorAll("[data-unsell]").forEach(b => b.onclick = () => { SHOP.sell.splice(+b.dataset.unsell, 1); renderShop(); });
  box.querySelectorAll("[data-hag]").forEach(b => b.onclick = () => haggle(b.dataset.hag));
  box.querySelector("#deal-go")?.addEventListener("click", closeDeal); box.querySelector("#shop-plead")?.addEventListener("click", plead);
}
function shopRoll(skill, dc) { sfx("dice"); const r = d20(C().bless ? 1 : 0); if (C().bless) C().bless = false; const b = skillBonus(skill); const tot = r.nat + b; return { nat: r.nat, b, tot, ok: r.nat === 20 || (r.nat !== 1 && tot >= dc), crit: r.nat === 20, fumble: r.nat === 1, dc, txt: `d20 (${r.nat}) ${fmt(b)} = ${tot} против КС ${dc}` }; }
function haggle(skill) {
  const { m } = SHOP; const st = shopState(m); const n = m.npc ? NPCS[m.npc] : null; const greedy = /жадн|торгуется/i.test(n?.persona || "");
  const att = m.npc ? (S.world.npcs[m.npc]?.att || 0) : 0; const dc = 12 + (greedy ? 3 : 0) + (att <= -8 ? 2 : 0) - (att >= 25 ? 2 : 0) + (m.type === "merchant" ? 2 : 0);
  const r = shopRoll(skill, dc); let mlt = 1, txt;
  const bump = dv => { if (m.npc && dv) { const s = S.world.npcs[m.npc] || (S.world.npcs[m.npc] = { att: 0, mem: [] }); s.att = clamp(s.att + dv, -100, 100); } };
  if (skill === "persuasion") { if (r.ok) { mlt = r.crit ? .8 : .9; txt = `Уговорили: скидка ${r.crit ? 20 : 10}%`; } else { txt = "Не уступает ни монеты"; bump(-1); } }
  else if (skill === "deception") { if (r.ok) { mlt = r.crit ? .78 : .85; txt = `Провели: скидка ${r.crit ? 22 : 15}%`; } else { mlt = 1.15; txt = "Раскусил уловку: цены +15%"; bump(-4); } }
  else { if (r.ok) { mlt = .85; txt = "Испугался: скидка 15%"; bump(-5); } else { mlt = 1.1; txt = "Не из пугливых: цены +10%"; bump(-6); } }
  st.hag = { day: worldTime().day, m: mlt, txt: `${SKILLS[skill][0]}: ${r.txt}. ${txt}` }; setTimeout(() => sfx(r.ok ? "chime" : "thud"), 450);
  if (m.npc) S.world.npcs[m.npc]?.mem?.push(`Герой торговался (${SKILLS[skill][0].toLowerCase()}): ${r.ok ? "успешно" : "неудачно"}`); save(); renderShop();
}
function plead() { const { m } = SHOP; const st = shopState(m); const r = shopRoll("persuasion", 15); if (r.ok) { st.ok = worldTime().day; SHOP.msg = `Убеждение: ${r.txt}. Ладно, но только сегодня.`; setTimeout(() => sfx("chime"), 450); } else SHOP.msg = `Убеждение: ${r.txt}. Дверь перед вами закрыта.`; save(); renderShop(); }
function applyService(id, m) {
  const c = C(); const chips = [];
  switch (ITEMS[id].svc) {
    case "rest": setTimeout(() => { longRest(); }, 50); chips.push({ c: "heal", x: "Комната на ночь" }); break;
    case "meal": { const d = rollDice("1d4"); const got = healHero(d.total); chips.push({ c: "heal", x: `Горячий ужин: +${got} HP` }); break; }
    case "ale": { const unv = outerEntries().map(([pid]) => pid).filter(pid => !S.world.visited.includes(pid) && !(S.world.rumors || []).includes(pid)); const R = mulberry(hash(m.key + tkey())); if (unv.length && R() < .5) { const pid = unv[Math.floor(R() * unv.length)]; S.world.rumors = S.world.rumors || []; S.world.rumors.push(pid); chips.push({ c: "gold", x: `За кружкой эля услышали: ${POIS[pid].name}` }); } else chips.push({ c: "npc", x: "Пиво кислое, разговоры пустые" }); break; }
    case "round": addRep(3, "угостил зал"); if (m.npc) { const s = S.world.npcs[m.npc]; if (s) s.att = clamp(s.att + 3, -100, 100); } break;
    case "healfull": c.hp = c.maxHp; S.dying = null; chips.push({ c: "heal", x: "Раны исцелены" }); break;
    case "bless": c.bless = true; chips.push({ c: "xp", x: "Благословение: преимущество на следующую проверку" }); break;
    case "donate": addRep(4, "пожертвование храму"); if (m.npc) { const s = S.world.npcs[m.npc]; if (s) s.att = clamp(s.att + 4, -100, 100); } break;
  }
  return chips;
}
function closeDeal() {
  const { m } = SHOP; const st = shopState(m); const c = C(); const T = shopTotals(); if (T.after < 0 || T.merchAfter < 0) return;
  const chips = []; const bought = [], sold = [];
  for (const [id, q] of Object.entries(SHOP.buy)) { const it = ITEMS[id]; const s = st.stock.find(x => x.id === id); if (s && s.q < 99) s.q -= q; bought.push(it.n + (q > 1 ? " ×" + q : ""));
    for (let k = 0; k < q; k++) {
      if (it.cat === "service") { chips.push(...applyService(id, m)); continue; }
      c.items.push({ name: it.n, id, desc: it.d, ...(it.heal ? { heal: it.heal } : {}), ...(id === "potion" ? { potion: true } : {}) });
      if (it.w && !c.weapons.includes(it.w)) c.weapons.push(it.w);
      if (it.a && canWear(c, id)) { const g = gearOf(c); const before = acNow(c); if (it.a.shield) { if (!g.shield && !["wizard", "rogue"].includes(c.cls)) g.shield = true; } else { const old = g.armor; g.armor = id; if (acNow(c) < before) g.armor = old; } if (acNow(c) > before) { recalcAC(c); chips.push({ c: "xp", x: `Надето: ${it.n} · КД ${c.ac}` }); } }
      if (it.tag === "map") { const h = POIS[hereOuter()]; let n = 0; outerEntries().forEach(([, p]) => { if (Math.hypot(p.x - h.x, p.y - h.y) <= 8) { reveal(p.x, p.y, 1); n++; } }); chips.push({ c: "gold", x: `Карта: отмечено мест — ${n}` }); }
    } }
  SHOP.sell.forEach(it => { const i = c.items.indexOf(it); if (i < 0) return; c.items.splice(i, 1); sold.push(it.name); const id = itemIdOf(it); const g = gearOf(c);
    if (id && ITEMS[id].w && !c.items.some(x => itemIdOf(x) === id)) { const w = ITEMS[id].w; if (c.weapons.length > 1) c.weapons = c.weapons.filter(x => x !== w); }
    if (id && g.armor === id && !c.items.some(x => itemIdOf(x) === id)) g.armor = null; if (id === "shield" && g.shield && !c.items.some(x => itemIdOf(x) === "shield")) g.shield = false; recalcAC(c); });
  setPurse(c, T.after); st.gold = T.merchAfter; st.deals++;
  if (T.bal) chips.unshift({ c: "gold", x: `${T.bal > 0 ? "−" : "+"}${fmtMoney(Math.abs(T.bal))}` });
  const line = `Сделка с ${m.name}${bought.length ? "; куплено: " + bought.join(", ") : ""}${sold.length ? "; продано: " + sold.join(", ") : ""}`;
  pushFeed({ t: "sys", html: `<b>Сделка.</b> ${esc(line.replace(/^Сделка с [^;]+; ?/, ""))}` }); if (chips.length) pushFeed({ t: "chips", items: chips });
  S.log.push({ who: "p", text: `(${line})` }); if (m.npc) { const s = S.world.npcs[m.npc] || (S.world.npcs[m.npc] = { att: 0, mem: [] }); s.mem.push(line.slice(0, 140)); if (T.buy + T.sell >= 50 && st.lastBig !== worldTime().day) { s.att = clamp(s.att + 2, -100, 100); st.lastBig = worldTime().day; } }
  sfx("gold"); SHOP.buy = {}; SHOP.sell = []; SHOP.msg = "Сделка заключена."; lastSnap = null; save(); renderSheet(); renderShop();
}
function closeShop() { SHOP = null; closeModal(); after(); }
const TRADE_RE = /^(хочу\s+|давай\s+|можно\s+)?(купить|прикупить|продать|приценить|поторговать|торговать|сторговать|посмотреть\s+(товар|что\s+прода)|показ\w*\s+товар)|что\s+(у\s+тебя\s+)?(продаёшь|продаете|продаётся|есть\s+на\s+продажу)|сколько\s+стоит/i;
function tryTradeIntent(text) { if (!S || S.world.combat || !TRADE_RE.test(text.trim())) return false; const ms = merchantsHere(); if (!ms.length) return false;
  const t = text.toLowerCase(); const m = ms.find(x => x.name && t.includes(x.name.toLowerCase().slice(0, 4))) || ms[0]; openShop(m); return true; }
/* инвентарь в листе персонажа */
function renderInventory(tb) {
  const c = C(); const g = gearOf(c);
  tb.insertAdjacentHTML("beforeend", `<div class="inv-purse"><span>${COIN}<b>${fmtMoney(purse(c))}</b></span><span class="home-note">КД ${c.ac}${g.armor ? " · " + esc(ITEMS[g.armor].n.toLowerCase()) : " · без доспеха"}${g.shield ? " + щит" : ""}</span></div>`);
  c.items.forEach((it, i) => {
    const id = itemIdOf(it); const I = id ? ITEMS[id] : null; const cat = itemCat(it); const heal = it.heal || (it.potion ? "2d4+2" : I?.heal);
    const row = document.createElement("div"); row.className = "inv-item"; row.style.setProperty("--cc", CAT_COL[cat]);
    const worn = I?.a ? (I.a.shield ? g.shield : g.armor === id) : false;
    row.innerHTML = `<span class="ware-ic s">${catIcon(cat, 15)}</span><span class="inv-t" title="${esc(it.desc || I?.d || "")}">${esc(it.name)}<small>${esc((it.desc || I?.d || "").slice(0, 60))}</small></span>`;
    const btn = (t, fn, dis) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn small"; b.textContent = t; b.disabled = !!dis; b.onclick = fn; row.append(b); };
    if (heal && (cat === "potion" || cat === "food" || id === "healkit")) btn(cat === "food" ? "Съесть" : "Применить", () => { const d = rollDice(String(heal).includes("d") ? heal : "1d1+" + (Number(heal) - 1)); const got = healHero(d.total); c.items.splice(i, 1); pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · ${it.name}` }] }); sfx(cat === "food" ? "pick" : "potion"); after(); }, busy || c.hp >= c.maxHp);
    if (I?.a) { const ok = canWear(c, id); btn(worn ? "Снять" : "Надеть", () => { if (I.a.shield) g.shield = !worn; else g.armor = worn ? null : id; recalcAC(c); pushFeed({ t: "chips", items: [{ c: "xp", x: `${worn ? "Снято" : "Надето"}: ${it.name} · КД ${c.ac}` }] }); sfx("pick"); after(); }, busy || S.world.combat || (!worn && !ok)); if (!ok && !worn) row.querySelector(".inv-t small").textContent = "нет владения этим доспехом"; }
    tb.append(row);
  });
}
