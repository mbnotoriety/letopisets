"use strict";
/* =========================================================================
   RULES — SRD 5e, упрощённо. Числа живут только здесь.
   ========================================================================= */
const ABIL = ["str", "dex", "con", "int", "wis", "cha"];
const ABIL_RU = { str: "СИЛ", dex: "ЛОВ", con: "ТЕЛ", int: "ИНТ", wis: "МДР", cha: "ХАР" };
const ABIL_FULL = { str: "Сила", dex: "Ловкость", con: "Телосложение", int: "Интеллект", wis: "Мудрость", cha: "Харизма" };
const SKILLS = {
  acrobatics: ["Акробатика", "dex"], investigation: ["Анализ", "int"], athletics: ["Атлетика", "str"],
  perception: ["Внимательность", "wis"], survival: ["Выживание", "wis"], performance: ["Выступление", "cha"],
  intimidation: ["Запугивание", "cha"], history: ["История", "int"], sleight: ["Ловкость рук", "dex"],
  arcana: ["Магия", "int"], medicine: ["Медицина", "wis"], deception: ["Обман", "cha"],
  nature: ["Природа", "int"], insight: ["Проницательность", "wis"], religion: ["Религия", "int"],
  stealth: ["Скрытность", "dex"], persuasion: ["Убеждение", "cha"], animal: ["Уход за животными", "wis"]
};
const RACES = {
  human: { name: "Человек", sub: "Упрямые, разные, вездесущие", bonus: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 }, speed: 30,
    traits: ["+1 ко всем характеристикам", "Лишний язык"], skills: [] },
  elf: { name: "Эльф", sub: "Высокий эльф, видит в темноте", bonus: { dex: 2, int: 1 }, speed: 30,
    traits: ["Тёмное зрение", "Владеет Внимательностью", "Устойчив к очарованию"], skills: ["perception"] },
  dwarf: { name: "Дварф", sub: "Холмовой дварф, крепкий как скала", bonus: { con: 2, wis: 1 }, speed: 25, hpBonus: 1,
    traits: ["Тёмное зрение", "Сопротивление яду", "+1 HP за уровень"], skills: [] },
  halfling: { name: "Полурослик", sub: "Легконогий, удачливый", bonus: { dex: 2, cha: 1 }, speed: 25, lucky: true,
    traits: ["Везение: переброс натуральной 1", "Храбрость", "Проворство"], skills: [] }
};
const WEAPONS = {
  longsword: { name: "Длинный меч", dice: "1d8", abil: "str" },
  rapier: { name: "Рапира", dice: "1d8", abil: "finesse" },
  shortbow: { name: "Короткий лук", dice: "1d6", abil: "dex", ranged: true },
  staff: { name: "Боевой посох", dice: "1d6", abil: "str" },
  mace: { name: "Булава", dice: "1d6", abil: "str" }
};
const SPELLS = {
  firebolt: { name: "Огненный снаряд", lvl: 0, kind: "attack", dice: "1d10", type: "огнём", desc: "Атака заклинанием, 1d10 огня" },
  magic_missile: { name: "Волшебная стрела", lvl: 1, kind: "auto", dice: "3d4+3", type: "силовым полем", desc: "Три дротика, всегда попадают" },
  sleep: { name: "Усыпление", lvl: 1, kind: "sleep", dice: "5d8", desc: "Усыпляет врагов с HP не выше 5d8" },
  sacred_flame: { name: "Священное пламя", lvl: 0, kind: "save", abil: "dex", dice: "1d8", type: "излучением", desc: "Спасбросок ЛОВ, 1d8 излучения" },
  cure_wounds: { name: "Лечение ран", lvl: 1, kind: "heal", dice: "1d8", desc: "Восстанавливает 1d8 + МДР" },
  guiding_bolt: { name: "Направляющий снаряд", lvl: 1, kind: "attack", dice: "4d6", type: "излучением", desc: "Атака заклинанием, 4d6 излучения" }
};
const CLASSES = {
  fighter: { name: "Воин", role: "Передняя линия", color: "#d0814f", hd: 10, saves: ["str", "con"],
    prio: ["str", "con", "dex", "wis", "cha", "int"], armor: { name: "Кольчуга и щит", base: 18, dex: 0 },
    weapons: ["longsword"], skillCount: 2,
    skillList: ["acrobatics", "animal", "athletics", "history", "insight", "intimidation", "perception", "survival"],
    features: ["Второе дыхание: 1d10 + уровень HP раз за короткий отдых", "Боевой стиль: Защита"],
    items: ["Кольчуга", "Щит", "Длинный меч", "Набор путешественника"], blurb: "Сталь, щит и выдержка. Держит удар лучше всех." },
  rogue: { name: "Плут", role: "Ловкость и хитрость", color: "#7cc79c", hd: 8, saves: ["dex", "int"],
    prio: ["dex", "con", "wis", "cha", "int", "str"], armor: { name: "Кожаный доспех", base: 11, dex: 99 },
    weapons: ["rapier", "shortbow"], skillCount: 4,
    skillList: ["acrobatics", "athletics", "deception", "insight", "intimidation", "investigation", "perception", "performance", "persuasion", "sleight", "stealth"],
    features: ["Скрытая атака: +1d6 урона при преимуществе", "Воровской жаргон"],
    items: ["Кожаный доспех", "Рапира", "Короткий лук и 20 стрел", "Воровские инструменты"], blurb: "Тень у двери, нож в рукаве, нужное слово вовремя." },
  wizard: { name: "Волшебник", role: "Магия и знание", color: "#72aed0", hd: 6, saves: ["int", "wis"],
    prio: ["int", "con", "dex", "wis", "cha", "str"], armor: { name: "Без доспеха", base: 10, dex: 99 },
    weapons: ["staff"], skillCount: 2, cast: "int", spells: ["firebolt", "magic_missile", "sleep"],
    skillList: ["arcana", "history", "insight", "investigation", "medicine", "religion"],
    features: ["Колдовство (ИНТ)", "Магическое восстановление"],
    items: ["Боевой посох", "Книга заклинаний", "Мешочек с компонентами"], blurb: "Хрупкий, но знает слова, которые меняют исход боя." },
  cleric: { name: "Жрец", role: "Свет и исцеление", color: "#e3c06a", hd: 8, saves: ["wis", "cha"],
    prio: ["wis", "con", "str", "dex", "cha", "int"], armor: { name: "Чешуйчатый доспех и щит", base: 16, dex: 2 },
    weapons: ["mace"], skillCount: 2, cast: "wis", spells: ["sacred_flame", "cure_wounds", "guiding_bolt"],
    skillList: ["history", "insight", "medicine", "persuasion", "religion"],
    features: ["Колдовство (МДР)", "Божественный домен: Жизнь"],
    items: ["Чешуйчатый доспех", "Щит", "Булава", "Священный символ"], blurb: "Лечит, изгоняет нежить, держит строй." }
};
const BACKGROUNDS = {
  soldier: { name: "Солдат", skills: ["athletics", "intimidation"], hook: "отслужили своё и ищете место, где оружие ещё нужно" },
  sage: { name: "Мудрец", skills: ["arcana", "history"], hook: "приехали за старой тайной, о которой пишут в забытых книгах" },
  criminal: { name: "Преступник", skills: ["deception", "stealth"], hook: "скрываетесь от прошлого и знаете, как говорить с тёмными людьми" },
  acolyte: { name: "Прислужник", skills: ["insight", "religion"], hook: "пришли по зову храма, которому служили с детства" }
};
const MODES = {
  chronicle: { name: "Хроника", sub: "Строгий сюжет, честные броски, перманентная смерть", prompt: "Режим ХРОНИКА: серьёзный тон, сюжет ведёт к тайне, мир жёсткий, ошибки имеют цену. Смерть героя окончательна." },
  sandbox: { name: "Песочница", sub: "Свободный мир, один второй шанс при смерти", prompt: "Режим ПЕСОЧНИЦА: мир свободен, следуй за интересами игрока, сюжет подстраивается." },
  novice: { name: "Новичок", sub: "Дружелюбно, с подсказками по правилам, без смерти", prompt: "Режим НОВИЧОК: дружелюбный тон, в конце коротко подскажи, какие действия возможны и как работают проверки. Герой не умирает, а теряет сознание." }
};
/* Бестиарий: ИИ выбирает только тип и имя, статы берутся отсюда (SRD) */
const BESTIARY = {
  zombie: { label: "зомби, утопленник, ожившие мертвецы", ac: 8, hp: 22, atk: 3, dmg: "1d6+1", dex: -2, xp: 50 },
  skeleton: { label: "скелет", ac: 13, hp: 13, atk: 4, dmg: "1d6+2", dex: 2, xp: 50 },
  bandit: { label: "бандит, контрабандист, наёмник", ac: 12, hp: 11, atk: 3, dmg: "1d6+1", dex: 1, xp: 25 },
  cultist: { label: "культист, фанатик", ac: 12, hp: 9, atk: 3, dmg: "1d6+1", dex: 1, xp: 25 },
  thug: { label: "громила, главарь банды (босс)", ac: 11, hp: 32, atk: 4, dmg: "1d6+2", dex: 0, xp: 100, boss: true },
  wolf: { label: "волк, дикий пёс", ac: 13, hp: 11, atk: 4, dmg: "2d4+2", dex: 2, xp: 50 },
  giant_rat: { label: "гигантская крыса", ac: 12, hp: 7, atk: 4, dmg: "1d4+2", dex: 2, xp: 25 },
  goblin: { label: "гоблин", ac: 15, hp: 7, atk: 4, dmg: "1d6+2", dex: 2, xp: 50 },
  giant_spider: { label: "гигантский паук, логово чудовища (босс)", ac: 14, hp: 26, atk: 5, dmg: "1d8+3", dex: 3, xp: 200, boss: true }
};
const KINDS = { inn: "⌂", house: "⌂", hut: "⌂", chapel: "✝", shrine: "✧", tower: "♜", cave: "◖", ruin: "∏", camp: "▲", mine: "◆", farm: "≡", pier: "≈", wreck: "✕", grove: "♣", bridge: "∩", well: "○", gate: "∏" };
const WHERES = ["village", "shore", "forest", "hills", "water_edge", "wild"];
const FEATURES = ["beard", "hood", "scarf", "scar", "jewel", "braid", "bald", "hat"];
const HAIRS = { black: "hsl(220, 10%, 14%)", brown: "hsl(28, 35%, 24%)", red: "hsl(14, 70%, 42%)", grey: "hsl(210, 6%, 66%)", white: "hsl(40, 12%, 86%)", blond: "hsl(44, 60%, 62%)" };
const BIOMES = { coast: "Побережье", marsh: "Болота", mountains: "Горы", forest: "Лес" };
const TONES = { grim: "Мрачный", heroic: "Героический", fairy: "Сказочный" };
const MAGICS = { rare: "Магия редка", common: "Магия обычна" };
const MAP_W = 20, MAP_H = 14;

/* =========================================================================
   RNG & DICE
   ========================================================================= */
function rnd(n) { const a = new Uint32Array(1); crypto.getRandomValues(a); return (a[0] % n) + 1; }
const DICE_RE = /^(\d{1,2})d(4|6|8|10|12|20)(?:([+-])(\d{1,2}))?$/;
function parseDice(s) {
  const m = DICE_RE.exec(String(s || "").replace(/\s+/g, "").toLowerCase());
  if (!m) return null;
  return { n: Math.min(+m[1], 8), d: +m[2], mod: m[3] ? (m[3] === "-" ? -1 : 1) * +m[4] : 0 };
}
function rollDice(s, crit) {
  const p = typeof s === "string" ? parseDice(s) : s;
  if (!p) return { total: 0, rolls: [], text: "—" };
  const n = crit ? p.n * 2 : p.n;
  const rolls = []; for (let i = 0; i < n; i++) rolls.push(rnd(p.d));
  const total = Math.max(0, rolls.reduce((a, b) => a + b, 0) + p.mod);
  return { total, rolls, text: `${n}d${p.d}${p.mod ? (p.mod > 0 ? "+" : "") + p.mod : ""} [${rolls.join(", ")}] = ${total}` };
}
const fmt = n => (n >= 0 ? "+" : "") + n;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function mulberry(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function uid() { return Date.now().toString(36) + rnd(1e6).toString(36); }
function str(v, n) { return String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n); }

/* =========================================================================
   WORLD — активный мир. Всё, что ниже читает POIS/NPCS/ENEMIES, берёт их отсюда.
   ========================================================================= */
let WD = null, POIS = {}, NPCS = {}, ENEMIES = {}, ROAD = new Set();
function setWorld(def) {
  WD = def; POIS = def.places; NPCS = def.npcs; ENEMIES = def.enemies; ROAD = new Set(def.roads || []);
}
function tileAt(x, y) { const r = WD.tiles[y]; return r ? r[x] : "S"; }
const PASSABLE = t => t !== "S" && t !== "W";

/* ---------- готовый мир: Солёная Гавань ---------- */
function makeDefaultWorld() {
  const coast = y => 2 + Math.round(Math.sin(y * .55 + 1));
  const T = (x, y) => {
    if (y === 13 && x < 12) return "S"; if (y === 12 && x < 4) return "S"; if (x < coast(y)) return "S";
    if (x === coast(y) || (y === 12 && x < 9) || (y === 13 && x < 14)) return "a";
    if ((x >= 15 && y <= 3) || (x >= 16 && y >= 10) || (x >= 18 && y >= 9)) return "r";
    if (y <= 3 && x >= 6 && x <= 13) return "f"; if (x === 19 && y >= 4 && y <= 9) return "S"; return "g";
  };
  const tiles = []; for (let y = 0; y < MAP_H; y++) { let r = ""; for (let x = 0; x < MAP_W; x++) r += T(x, y); tiles.push(r); }
  const places = {
    tavern: { name: "Таверна «Кривой якорь»", kind: "inn", x: 9, y: 7, short: "Сердце деревни, пахнет рыбой и смолой", rest: true, npcs: ["marta"], enemies: [],
      desc: "Низкий зал с чадящим очагом. Рыбаки шепчутся о ночном крушении. Здесь можно снять комнату и отдохнуть.", clue: "Из разговоров ясно: в ночь крушения кто-то видел лодку без фонаря." },
    pier: { name: "Пристань", kind: "pier", x: 3, y: 9, short: "Мокрые доски, сети, лодки", npcs: ["ost"], enemies: [],
      desc: "Скрипучие мостки уходят в серую воду. Рыбак чинит сеть и упорно не смотрит в сторону маяка.", clue: "Ост дёргается при слове «маяк» и бросает взгляд на скалы к востоку." },
    elder: { name: "Дом старосты", kind: "house", x: 12, y: 5, short: "Единственный дом из камня", npcs: ["brenn"], enemies: [],
      desc: "Добротный дом с новой черепицей, слишком новой для деревни, где всё рассыпается.", clue: "На столе старосты дорогой подсвечник, похожий на груз «Чайки»." },
    chapel: { name: "Часовня Приливов", kind: "chapel", x: 14, y: 8, short: "Старая часовня с пустой звонницей", rest: true, npcs: ["ilva"], enemies: [],
      desc: "В звоннице нет колокола: на балке лишь светлый след от крепления. Внутри тихо и сыро.", clue: "На балке звонницы свежие царапины: колокол сняли недавно и грубо." },
    wreck: { name: "Место крушения", kind: "wreck", x: 5, y: 12, short: "Обломки «Серебряной чайки»", npcs: [], enemies: [],
      desc: "На отмели лежит разбитый когг. Ящики вскрыты, но не волнами: на досках следы ломов.", clue: "Среди ящиков медная пуговица с якорем — такие носят люди Рэйфа." },
    grove: { name: "Сосновая роща", kind: "grove", x: 9, y: 2, short: "Тропа к маяку через сосны", npcs: [], enemies: [],
      desc: "Узловатые сосны, ветер с моря. На тропе свежие следы нескольких пар сапог, ведущие к маяку.", clue: "Следы сапог ведут к маяку и обратно, их не меньше четырёх пар." },
    lighthouse: { name: "Старый маяк", kind: "tower", x: 17, y: 2, short: "Заброшен, но ночью в нём горит свет", npcs: [], enemies: ["drowned_a", "drowned_b"],
      desc: "Башня на скале, дверь сорвана с петель. Внутри пахнет водорослями, на ступенях мокрые следы босых ног.", clue: "В нише размокшая записка: «…огонь зажигают не мертвецы. Грот под скалой. — Х.»" },
    cave: { name: "Грот под скалой", kind: "cave", x: 17, y: 11, short: "Видно только в отлив", npcs: [], enemies: ["smug_a", "smug_b", "rafe"],
      desc: "Низкий вход у самой воды. Внутри отблеск фонаря и голоса.", clue: "У дальней стены под мешковиной темнеет силуэт колокола." }
  };
  const npcs = {
    marta: { name: "Марта", role: "хозяйка таверны", look: "полная, рыжая, с ожогом на руке", persona: "Громкая, добрая, любит сплетни. Боится, что деревня вымрет.",
      secret: "Видела, как Ост ночью выходил в море без фонаря в ночь крушения.", greet: "«Садись, путник. Ты ведь слышал про «Чайку»?»", hair: "red", feature: "braid", age: "adult",
      photo_prompt: "portrait of a stout red-haired tavern keeper woman in her forties, thick braid, old burn scar on her forearm, flour on apron, warm worried smile, inside a smoky low-ceilinged fishermen tavern, hearth glow" },
    ost: { name: "Ост", role: "рыбак", look: "жилистый, седая щетина, взгляд в пол", persona: "Молчаливый, нервный, защищает семью любой ценой.",
      secret: "Его брат Рэйф — главарь контрабандистов. Ост знает про грот, но боится за брата.", greet: "«Я рыбак. Я ничего не видел», — бормочет он.", hair: "grey", feature: "beard", age: "old",
      photo_prompt: "portrait of a wiry old fisherman, grey stubble beard, nervous downcast eyes, salt-stained wool sweater, mending a net on a wet wooden pier" },
    brenn: { name: "Бренн", role: "староста", look: "холёный, перстни, дорогой плащ", persona: "Вежлив, уклончив, хочет замять историю с крушением.",
      secret: "Берёт долю с добычи контрабандистов. Сам никого не убивал.", greet: "«Крушение? Печально. Но лишний шум деревне не нужен».", hair: "brown", feature: "jewel", age: "adult",
      photo_prompt: "portrait of a well-groomed village elder man in his fifties, neat brown hair, rings on his fingers, expensive dark wool cloak with silver clasp, polite evasive smile, stone house interior with candlelight" },
    ilva: { name: "Сестра Илва", role: "жрица Часовни Приливов", look: "худая, в сером, с выцветшей синей лентой", persona: "Тихая, упорная, верит в старые обряды.",
      secret: "Знает, что Колокол Приливов украден месяц назад, и подозревает, что мертвецы поднялись из-за этого.", greet: "«С тех пор как пропал колокол, море неспокойно».", hair: "white", feature: "hood", age: "adult",
      photo_prompt: "portrait of a thin pale priestess in a grey hooded robe, faded blue ribbon tied at her wrist, calm stubborn gaze, inside a damp old stone chapel, candle light" }
  };
  const B = BESTIARY;
  const enemies = {
    drowned_a: { ...B.zombie, type: "zombie", name: "Утопленник", loc: "lighthouse" },
    drowned_b: { ...B.zombie, type: "zombie", name: "Хальвард-утопленник", loc: "lighthouse" },
    smug_a: { ...B.bandit, type: "bandit", name: "Контрабандист", loc: "cave" },
    smug_b: { ...B.bandit, type: "bandit", name: "Контрабандист с багром", loc: "cave" },
    rafe: { ...B.thug, type: "thug", name: "Рэйф", loc: "cave", ac: 14, hp: 30, dmg: "1d8+2" }
  };
  const roads = []; const hub = [10, 7];
  const L = (a, b) => { let [x, y] = a; while (x !== b[0]) { roads.push(x + "," + y); x += Math.sign(b[0] - x); } while (y !== b[1]) { roads.push(x + "," + y); y += Math.sign(b[1] - y); } roads.push(x + "," + y); };
  Object.values(places).forEach(p => L(hub, [p.x, p.y]));
  return { id: "salt-harbor", photo_style: "cinematic photograph, medieval northern fishing village, cold overcast sea light, muted teal and grey palette, wool and weathered wood textures, 85mm lens, shallow depth of field, subtle film grain, realistic skin", name: "Солёная Гавань", tagline: "Маяк горит, хотя смотритель мёртв", biome: "coast", tone: "grim", start: "tavern",
    public: "Солёная Гавань — бедная рыбацкая деревня на холодном северном побережье. Прошлой ночью на рифах у старого маяка разбился торговый когг «Серебряная чайка». Маяк заброшен с тех пор, как месяц назад пропал смотритель Хальвард, но в ночь крушения в нём горел свет. Магия в мире редка и пугает простых людей.",
    secret: "Рэйф, брат рыбака Оста, главарь контрабандистов из грота под скалой. Он зажигает ложный огонь на маяке, чтобы корабли разбивались о рифы, и грабит обломки. Смотритель Хальвард узнал об этом и был утоплен людьми Рэйфа. Месяц назад Рэйф украл из часовни Колокол Приливов (он у него в гроте) — без колокола благословение моря ослабло, и утонувшие, включая Хальварда, по ночам встают у маяка. Староста Бренн берёт долю с добычи. Ост всё знает, но покрывает брата.",
    beats: ["Улики на месте крушения: следы ломов", "Признание Оста или слова Марты", "Маяк с утопленниками и записка Хальварда о гроте", "Грот, Рэйф и Колокол Приливов"],
    endings: ["Вернуть колокол в часовню — мертвецы упокоятся", "Разоблачить Рэйфа и Бренна перед деревней"],
    quest: "Узнать, почему горел маяк в ночь крушения «Серебряной чайки».",
    recommended: [{ cls: "cleric", why: "Нежить у маяка" }, { cls: "rogue", why: "Тайны и контрабанда" }],
    bg_hooks: { soldier: "служили в береговой страже и помните, как горел маяк в лучшие годы", sage: "приехали изучать старые приливные обряды здешней часовни",
      criminal: "когда-то возили контрабанду вдоль этого берега и знаете, кто здесь платит за молчание", acolyte: "получили письмо от сестры Илвы с просьбой о помощи" },
    intro: "Утро пахнет мокрой золой и солью. В «Кривом якоре» тесно: рыбаки говорят вполголоса, и каждый второй косится в окно, туда, где на скале чернеет старый маяк.\n\nМарта ставит перед тобой миску ухи и наклоняется ближе: «Ночью «Серебряная чайка» налетела на рифы. А маяк горел, понимаешь? Горел, хотя Хальвард пропал ещё в прошлом месяце».",
    intro_speaker: "marta", places, npcs, enemies, tiles, roads: [...new Set(roads)],
    houses: [[7, 6], [8, 9], [11, 8], [6, 8], [12, 7], [10, 5], [13, 6], [7, 10]], labels: [{ t: "Холодное море", x: .3, y: 4.2 }] };
}

/* ---------- процедурная карта ---------- */
function noiseField(rand, cell) {
  const gw = Math.ceil(MAP_W / cell) + 2, gh = Math.ceil(MAP_H / cell) + 2; const g = [];
  for (let i = 0; i < gw * gh; i++) g.push(rand());
  const sm = t => t * t * (3 - 2 * t);
  return (x, y) => { const fx = x / cell, fy = y / cell; const x0 = Math.floor(fx), y0 = Math.floor(fy); const tx = sm(fx - x0), ty = sm(fy - y0);
    const v = (i, j) => g[(j) * gw + i]; const a = v(x0, y0) * (1 - tx) + v(x0 + 1, y0) * tx; const b = v(x0, y0 + 1) * (1 - tx) + v(x0 + 1, y0 + 1) * tx; return a * (1 - ty) + b * ty; };
}
function buildMap(biome, seed, placeList) {
  const rand = mulberry(seed);
  const n1a = noiseField(rand, 5), n1b = noiseField(rand, 2.5), n2a = noiseField(rand, 4), n2b = noiseField(rand, 2);
  const N1 = (x, y) => n1a(x, y) * .7 + n1b(x, y) * .3, N2 = (x, y) => n2a(x, y) * .65 + n2b(x, y) * .35;
  const side = Math.floor(rand() * 4); // where the sea is for coast
  const grid = [];
  for (let y = 0; y < MAP_H; y++) { grid.push([]); for (let x = 0; x < MAP_W; x++) {
    const e = N1(x, y), m = N2(x, y); let t = "g";
    if (biome === "coast") {
      const d = [x / MAP_W, 1 - x / MAP_W, y / MAP_H, 1 - y / MAP_H][side] + (e - .5) * .28;
      t = d < .17 ? "S" : d < .22 ? "a" : e > .74 ? "r" : m > .6 ? "f" : "g";
    } else if (biome === "marsh") t = e < .3 ? "W" : m > .7 ? "f" : m > .4 ? "m" : "g";
    else if (biome === "mountains") t = e > .76 ? "n" : e > .58 ? "r" : e < .16 ? "W" : m > .6 ? "f" : "g";
    else t = e < .2 ? "W" : m > .38 ? "f" : "g";
    grid[y].push(t);
  } }
  // hub — ближайшая к центру проходимая клетка; расчищаем поляну под поселение
  let hub = [10, 7], best = 1e9;
  for (let y = 2; y < MAP_H - 2; y++) for (let x = 3; x < MAP_W - 3; x++) { const d = Math.hypot(x - 10, y - 7) + (PASSABLE(grid[y][x]) ? 0 : 50) + (grid[y][x] === "g" ? 0 : 2); if (d < best) { best = d; hub = [x, y]; } }
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = hub[0] + dx, y = hub[1] + dy; if (grid[y] && grid[y][x]) grid[y][x] = "g"; }
  const adjWater = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const t = grid[y + b]?.[x + a]; return t === "S" || t === "W"; });
  const pos = {}; const taken = [];
  placeList.forEach((p, i) => {
    if (i === 0) { pos[p.id] = hub; taken.push(hub); return; }
    let bestP = null, bestS = -1e9;
    for (let pass = 0; pass < 2 && !bestP; pass++) {
      const minD = pass ? 2 : 2.9;
      for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
        const t = grid[y][x]; if (!PASSABLE(t)) continue; if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) continue;
        if (taken.some(([a, b]) => Math.hypot(a - x, b - y) < minD)) continue;
        const dh = Math.hypot(x - hub[0], y - hub[1]); let s = rand() * 1.5;
        const w = p.where;
        if (w === "village") s += dh >= 2 && dh <= 4.2 ? 6 : -dh;
        else if (w === "shore" || w === "water_edge") s += adjWater(x, y) ? 6 : -3;
        else if (w === "forest") s += t === "f" ? 6 : -2;
        else if (w === "hills") s += t === "r" || t === "n" ? 6 : e2(x, y) * 4;
        else s += dh >= 6 ? 4 + dh * .2 : -4;
        if (w !== "village" && dh < 3) s -= 4;
        if (s > bestS) { bestS = s; bestP = [x, y]; }
      }
    }
    pos[p.id] = bestP || [clamp(hub[0] + i, 1, MAP_W - 2), hub[1]]; taken.push(pos[p.id]);
    function e2(x, y) { return N1(x, y); }
  });
  // дороги: BFS от поселения
  const roads = new Set();
  placeList.slice(1).forEach(p => {
    const [tx, ty] = pos[p.id]; const prev = new Map(); const q = [hub]; prev.set(hub.join(","), null);
    while (q.length) { const [x, y] = q.shift(); if (x === tx && y === ty) break;
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + a, ny = y + b, k = nx + "," + ny;
        if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H || prev.has(k) || !PASSABLE(grid[ny][nx])) continue; prev.set(k, x + "," + y); q.push([nx, ny]); } }
    let k = tx + "," + ty; if (!prev.has(k)) return; while (k) { roads.add(k); k = prev.get(k); }
  });
  const houses = [];
  for (let r = 1; r <= 3 && houses.length < 7; r++) for (let y = hub[1] - r; y <= hub[1] + r; y++) for (let x = hub[0] - r; x <= hub[0] + r; x++) {
    if (houses.length >= 7 || grid[y]?.[x] !== "g" || roads.has(x + "," + y) || taken.some(([a, b]) => a === x && b === y) || houses.some(([a, b]) => a === x && b === y)) continue;
    if (Math.hypot(x - hub[0], y - hub[1]) <= r && rand() < .45) houses.push([x, y]);
  }
  return { tiles: grid.map(r => r.join("")), roads: [...roads], houses, pos };
}

/* ---------- генерация мира ИИ ---------- */
const FORGE_STAGES = ["Семя мира", "Конфликт и тайна", "Места и люди", "География и карта", "Враги из бестиария", "Завязка"];
function slug(s, i) { const t = String(s || "").toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 24); return t || "p" + i; }
async function forgeWorld(opts, onStage, signal) {
  const sample = await getSample(); if (!sample) throw { code: "no_ai" };
  onStage(0);
  const seedLine = `Окружение: ${BIOMES[opts.biome]}. Тон: ${TONES[opts.tone]}. ${MAGICS[opts.magic]}. Пожелания игрока: ${opts.wish || "нет"}.`;
  onStage(1);
  const core = await sample.json(`Ты — мастер настольных ролевых игр. Создай оригинальную местность для короткой кампании 5e (2–4 сессии) для одного героя 1 уровня. Пиши по-русски, конкретно, без клише про «тёмного властелина» и «избранного».
${seedLine}
Нужна одна небольшая местность (поселение и окрестности на день пути), а не целый континент. В центре — тайна, которую герой раскрывает через улики, и злодей с понятным мотивом.
Ответь только JSON:
{"name":"название местности, 2–3 слова","tagline":"подзаголовок до 8 слов","public":"3–4 предложения: что знает любой житель и что случилось недавно (завязка)","secret":"полная правда для мастера: кто злодей, чего хочет, что произошло, кто ему помогает, 5–7 предложений","beats":["4 опорные точки расследования, по фразе"],"endings":["2 хорошие концовки"],"quest":"первое задание героя, одна фраза","recommended":[{"cls":"fighter|rogue|wizard|cleric","why":"до 6 слов"},{"cls":"…","why":"…"}],"photo_style":"ENGLISH, one line: visual style for realistic photo portraits of this world — era, setting, light, colour palette, lens, e.g. cinematic photograph, misty medieval marsh village, cold dawn light, muted olive palette, 85mm lens, film grain","bg_hooks":{"soldier":"продолжение фразы «Вы …», связь с местом, до 18 слов","sage":"…","criminal":"…","acolyte":"…"}}`, { modelTier: "default", cache: false, signal });
  if (!core || typeof core !== "object" || !core.name) throw { code: "bad_world" };
  onStage(2);
  const bestiary = Object.entries(BESTIARY).map(([k, b]) => `${k} — ${b.label}`).join("; ");
  const people = await sample.json(`Ты продолжаешь создавать мир для кампании 5e. Вот основа мира:
Название: ${core.name}. ${core.public}
ТАЙНА: ${core.secret}
Опорные точки: ${Array.isArray(core.beats) ? core.beats.join(" | ") : ""}
${seedLine}

Создай места и людей. Требования:
- 7 мест. Первое — безопасное стартовое место в поселении (таверна, постоялый двор, общий дом) с rest:true. Ещё одно безопасное место может иметь rest:true.
- Ровно 2 места с врагами (foes), оба не в поселении, одно из них — логово злодея. Враги — только типы из бестиария: ${bestiary}. В группе 1–3 врага, не больше одного босса на группу.
- kind — один из: ${Object.keys(KINDS).join(", ")}. where — один из: ${WHERES.join(", ")} (village = в поселении).
- clue — улика, которую герой найдёт при успешном поиске в этом месте, ведёт к тайне.
- 4–5 НПС, у каждого своё место (поле npcs у места). Каждый что-то знает или скрывает о тайне. Злодей может быть НПС, если он притворяется честным.
- feature — одно из: ${FEATURES.join(", ")}; hair — одно из: ${Object.keys(HAIRS).join(", ")}; age — young, adult или old.
- intro — 2 коротких абзаца начала кампании от второго лица в стартовом месте, где НПС заговаривает с героем. Не раскрывай тайну.
Ответь только JSON:
{"places":[{"id":"latin_snake_case","name":"…","kind":"inn","where":"village","short":"до 8 слов","desc":"2 предложения, что видит герой","clue":"1 предложение","rest":true,"npcs":["npc_id"],"foes":[{"type":"bandit","name":"имя или прозвище"}]}],"npcs":[{"id":"latin_snake_case","name":"…","role":"…","look":"внешность, 6–10 слов","persona":"характер, 1 предложение","secret":"что скрывает, 1–2 предложения","greet":"первая реплика в «ёлочках»","feature":"beard","hair":"brown","age":"adult","photo_prompt":"ENGLISH, 25–40 words: realistic head-and-shoulders portrait of this person — age, gender, face, hair, clothing, expression, a hint of their place"}],"intro":"…","intro_speaker":"npc_id"}`, { modelTier: "default", cache: false, signal });
  if (!people || !Array.isArray(people.places) || people.places.filter(p => p && typeof p === "object").length < 3) throw { code: "bad_world" };
  onStage(3);
  // нормализация: id, ссылки, ограничения
  const npcs = {}; const npcIdMap = {};
  (Array.isArray(people.npcs) ? people.npcs : []).filter(n => n && typeof n === "object").slice(0, 6).forEach((n, i) => {
    let id = slug(n.id, i); while (npcs[id]) id += "_" + i; npcIdMap[n.id] = id;
    npcs[id] = { name: str(n.name, 32) || "Незнакомец", role: str(n.role, 40), look: str(n.look, 90), persona: str(n.persona, 200), secret: str(n.secret, 300),
      greet: str(n.greet, 200), photo_prompt: str(n.photo_prompt, 320), feature: FEATURES.includes(n.feature) ? n.feature : FEATURES[hash(id) % FEATURES.length],
      hair: HAIRS[n.hair] ? n.hair : Object.keys(HAIRS)[hash(id) % 6], age: ["young", "adult", "old"].includes(n.age) ? n.age : "adult" };
  });
  const placeList = []; const usedIds = new Set();
  people.places.filter(p => p && typeof p === "object").slice(0, 8).forEach((p, i) => {
    let id = slug(p.id, i); while (usedIds.has(id)) id += "_" + i; usedIds.add(id);
    placeList.push({ id, name: str(p.name, 40) || "Безымянное место", kind: KINDS[p.kind] ? p.kind : "ruin", where: WHERES.includes(p.where) ? p.where : (i === 0 ? "village" : "wild"),
      short: str(p.short, 60), desc: str(p.desc, 320), clue: str(p.clue, 220), rest: !!p.rest || i === 0,
      npcs: (Array.isArray(p.npcs) ? p.npcs : []).map(x => npcIdMap[x]).filter(x => x && npcs[x]), foes: i === 0 ? [] : (Array.isArray(p.foes) ? p.foes : []) });
  });
  placeList[0].where = "village";
  const placedNpc = new Set(); placeList.forEach(p => { p.npcs = p.npcs.filter(n => !placedNpc.has(n) && placedNpc.add(n)); });
  Object.keys(npcs).forEach(id => { if (!placedNpc.has(id)) placeList[0].npcs.push(id); });
  const seed = hash(core.name + Date.now());
  const map = buildMap(opts.biome, seed, placeList);
  onStage(4);
  const enemies = {}; const places = {};
  let groups = 0;
  placeList.forEach(p => {
    const ids = [];
    if (p.foes.length && groups < 3) {
      groups++; let boss = 0;
      p.foes.slice(0, 3).forEach((f, k) => {
        let type = BESTIARY[f.type] ? f.type : "bandit"; if (BESTIARY[type].boss) { if (boss) type = "bandit"; else boss++; }
        const id = `${p.id}_${k}`; enemies[id] = { ...BESTIARY[type], type, name: str(f.name, 32) || BESTIARY[type].label.split(",")[0], loc: p.id }; ids.push(id);
      });
    }
    places[p.id] = { name: p.name, kind: p.kind, where: p.where, x: map.pos[p.id][0], y: map.pos[p.id][1], short: p.short, desc: p.desc, clue: p.clue, rest: p.rest, npcs: p.npcs, enemies: ids };
  });
  onStage(5);
  const start = placeList[0].id;
  const recommended = (Array.isArray(core.recommended) ? core.recommended : []).filter(r => CLASSES[r.cls]).slice(0, 2).map(r => ({ cls: r.cls, why: str(r.why, 40) }));
  const bg = {}; Object.keys(BACKGROUNDS).forEach(k => { const v = str(core.bg_hooks?.[k], 160); if (v) bg[k] = v.replace(/^вы\s+/i, ""); });
  const sp = npcIdMap[people.intro_speaker];
  return { id: uid(), photo_style: str(core.photo_style, 300) || `cinematic photograph, realistic fantasy ${({ coast: "coastal", marsh: "marsh", mountains: "mountain", forest: "forest" })[opts.biome]} village, natural light, 85mm lens, film grain`, name: str(core.name, 40), tagline: str(core.tagline, 70), biome: opts.biome, tone: opts.tone, start,
    public: str(core.public, 700), secret: str(core.secret, 1400), beats: (Array.isArray(core.beats) ? core.beats : []).slice(0, 5).map(b => str(b, 160)), endings: (Array.isArray(core.endings) ? core.endings : []).slice(0, 3).map(b => str(b, 160)),
    quest: str(core.quest, 200) || "Разобраться, что здесь происходит.", recommended, bg_hooks: bg,
    intro: String(people.intro || "").slice(0, 1200), intro_speaker: sp && places[start].npcs.includes(sp) ? sp : places[start].npcs[0] || null,
    places, npcs, enemies, tiles: map.tiles, roads: map.roads, houses: map.houses, labels: [] };
}

/* =========================================================================
   STORAGE — несколько кампаний в браузере, экспорт и импорт
   ========================================================================= */
const IDX_KEY = "sh2-index", C_KEY = id => "sh2-c-" + id, OLD_KEY = "salt-harbor-v1";
let S = null, D = null;
function lsGet(k) { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
function campIndex() { const i = lsGet(IDX_KEY); return Array.isArray(i) ? i : []; }
function indexEntry(s) { return { id: s.id, world: s.wd.name, img: s.char.img && !String(s.char.img).startsWith("data:") ? s.char.img : "", hero: s.char.name, cls: s.char.cls, race: s.char.race, gender: s.char.gender, level: s.char.level, mode: s.mode, updated: Date.now(), dead: !!s.dead, loc: s.wd.places[s.world.loc]?.name || "" }; }
function save() {
  if (!S) return; lsSet(C_KEY(S.id), S);
  const idx = campIndex().filter(e => e.id !== S.id); idx.unshift(indexEntry(S)); lsSet(IDX_KEY, idx.slice(0, 30));
}
function loadCamp(id) { const s = lsGet(C_KEY(id)); return s && s.v === 2 && s.char && s.wd ? s : null; }
function deleteCamp(id) { lsDel(C_KEY(id)); lsSet(IDX_KEY, campIndex().filter(e => e.id !== id)); }
function migrateV1() {
  const old = lsGet(OLD_KEY); if (!old || !old.char) return;
  const s = { ...old, v: 2, id: uid(), wd: makeDefaultWorld(), summary: "" };
  s.feed = (s.feed || []).map(e => ({ ...e, streaming: false }));
  S = s; save(); S = null; lsDel(OLD_KEY);
}
function adoptCampaign(obj) {
  if (!obj || obj.v !== 2 || !obj.char || !obj.wd || !obj.world) throw new Error("bad");
  obj.id = uid(); S = obj; save(); S = null;
}

/* =========================================================================
   ENGINE
   ========================================================================= */
const mod = v => Math.floor((v - 10) / 2);
const prof = lvl => 2 + Math.floor((lvl - 1) / 4);
function finalScores(base, race) { const out = {}; const b = RACES[race]?.bonus || {}; for (const a of ABIL) out[a] = (base[a] || 8) + (b[a] || 0); return out; }
function calcAC(cls, scores) { const ar = CLASSES[cls].armor; return ar.base + Math.min(mod(scores.dex), ar.dex); }
function maxHP(cls, race, scores) { return Math.max(1, CLASSES[cls].hd + mod(scores.con) + (RACES[race].hpBonus || 0)); }
function slotsFor(cls, lvl) { if (!CLASSES[cls].spells) return {}; return { 1: lvl >= 2 ? 3 : 2 }; }
function C() { return S.char; }
function skillBonus(key) { const c = C(); const [, ab] = SKILLS[key]; return mod(c.scores[ab]) + (c.skills.includes(key) ? prof(c.level) : 0); }
function saveBonus(ab) { const c = C(); return mod(c.scores[ab]) + (CLASSES[c.cls].saves.includes(ab) ? prof(c.level) : 0); }
function d20(adv) {
  const lucky = RACES[C().race].lucky; const one = () => { let r = rnd(20); if (r === 1 && lucky) r = rnd(20); return r; };
  const a = one(); if (!adv) return { nat: a, pair: null }; const b = one(); return { nat: adv > 0 ? Math.max(a, b) : Math.min(a, b), pair: [a, b] };
}
function weaponAtk(wid) {
  const w = WEAPONS[wid]; const c = C(); const ab = w.abil === "finesse" ? (mod(c.scores.dex) >= mod(c.scores.str) ? "dex" : "str") : w.abil;
  return { w, ab, bonus: mod(c.scores[ab]) + prof(c.level), dmgMod: mod(c.scores[ab]) };
}
function castMod() { const c = C(); const ab = CLASSES[c.cls].cast; return ab ? mod(c.scores[ab]) : 0; }
function spellAtk() { return castMod() + prof(C().level); }
function spellDC() { return 8 + castMod() + prof(C().level); }
function enemyHere(id) { const e = S.world.enemies[id]; return e && e.alive && ENEMIES[id] && ENEMIES[id].loc === S.world.loc ? e : null; }
function aliveEnemiesHere() { return Object.keys(S.world.enemies).filter(id => enemyHere(id)); }
function resolveCheck(ch) {
  const c = C();
  if (ch.kind === "skill") {
    const r = d20(ch.adv); const b = skillBonus(ch.skill); const tot = r.nat + b; const ok = r.nat === 20 ? true : tot >= ch.dc;
    return { ...ch, nat: r.nat, pair: r.pair, bonus: b, total: tot, ok, crit: r.nat === 20, fumble: r.nat === 1,
      title: `Проверка: ${SKILLS[ch.skill][0]}`, formula: `d20 (${r.pair ? r.pair.join(" / ") : r.nat}) ${fmt(b)} = ${tot} против КС ${ch.dc}` };
  }
  if (ch.kind === "save") {
    const r = d20(ch.adv); const b = saveBonus(ch.ability); const tot = r.nat + b; const ok = tot >= ch.dc;
    return { ...ch, nat: r.nat, pair: r.pair, bonus: b, total: tot, ok, crit: r.nat === 20, fumble: r.nat === 1,
      title: `Спасбросок: ${ABIL_FULL[ch.ability]}`, formula: `d20 (${r.nat}) ${fmt(b)} = ${tot} против КС ${ch.dc}` };
  }
  if (ch.kind === "attack") {
    const e = S.world.enemies[ch.target]; const E = ENEMIES[ch.target]; const { w, bonus, dmgMod } = weaponAtk(ch.weapon);
    const adv = ch.adv || (e.asleep ? 1 : 0); const r = d20(adv); const tot = r.nat + bonus; const hit = r.nat === 20 || (r.nat !== 1 && tot >= E.ac);
    let dmg = null, extra = "";
    if (hit) {
      dmg = rollDice({ ...parseDice(w.dice), mod: dmgMod }, r.nat === 20);
      if (c.cls === "rogue" && adv > 0 && !S.turnSneak) { const sn = rollDice("1d6", r.nat === 20); dmg.total += sn.total; extra = ` + скрытая атака ${sn.text}`; S.turnSneak = true; }
      hurtEnemy(ch.target, dmg.total);
    }
    return { ...ch, nat: r.nat, pair: r.pair, total: tot, ok: hit, crit: r.nat === 20, fumble: r.nat === 1, dmg: dmg?.total || 0, title: `Атака: ${w.name} → ${E.name}`,
      formula: `d20 (${r.pair ? r.pair.join(" / ") : r.nat}) ${fmt(bonus)} = ${tot} против КД ${E.ac}` + (hit ? ` · урон ${dmg.text}${extra}` : ""), enemyAfter: enemyStatus(ch.target) };
  }
  if (ch.kind === "spell") return castSpell(ch);
  return null;
}
function useSlot(lvl) { const s = C().slots; if (!lvl) return true; if (!s[lvl] || s[lvl][1] <= 0) return false; s[lvl][1]--; return true; }
function castSpell(ch) {
  const sp = SPELLS[ch.spell];
  if (!useSlot(sp.lvl)) return { ...ch, ok: false, title: sp.name, formula: "Нет свободных ячеек заклинаний", noslot: true, nat: 0 };
  const E = ENEMIES[ch.target]; const e = S.world.enemies[ch.target]; const base = { ...ch, title: `Заклинание: ${sp.name}${E ? " → " + E.name : ""}` };
  if (sp.kind === "attack") {
    const r = d20(e?.asleep ? 1 : 0); const b = spellAtk(); const tot = r.nat + b; const hit = r.nat === 20 || (r.nat !== 1 && tot >= E.ac);
    let d = null; if (hit) { d = rollDice(sp.dice, r.nat === 20); hurtEnemy(ch.target, d.total); }
    return { ...base, nat: r.nat, total: tot, ok: hit, crit: r.nat === 20, dmg: d?.total || 0, formula: `d20 (${r.nat}) ${fmt(b)} = ${tot} против КД ${E.ac}` + (hit ? ` · урон ${d.text} ${sp.type}` : ""), enemyAfter: enemyStatus(ch.target) };
  }
  if (sp.kind === "auto") { const d = rollDice(sp.dice); hurtEnemy(ch.target, d.total); return { ...base, nat: 0, ok: true, dmg: d.total, formula: `Попадание без броска · урон ${d.text}`, enemyAfter: enemyStatus(ch.target) }; }
  if (sp.kind === "save") {
    const sv = rnd(20); const tot = sv + E.dex; const dc = spellDC(); const failed = tot < dc; let d = null; if (failed) { d = rollDice(sp.dice); hurtEnemy(ch.target, d.total); }
    return { ...base, nat: sv, ok: failed, dmg: d?.total || 0, enemyRoll: true, formula: `Спасбросок цели d20 (${sv}) ${fmt(E.dex)} = ${tot} против КС ${dc}` + (failed ? ` · урон ${d.text} ${sp.type}` : " · увернулась"), enemyAfter: enemyStatus(ch.target) };
  }
  if (sp.kind === "sleep") {
    const pool = rollDice(sp.dice); let left = pool.total; const slept = [];
    aliveEnemiesHere().map(id => [id, S.world.enemies[id].hp]).sort((a, b) => a[1] - b[1]).forEach(([id, hp]) => { if (hp <= left) { left -= hp; S.world.enemies[id].asleep = true; slept.push(ENEMIES[id].name); } });
    return { ...base, nat: 0, ok: slept.length > 0, formula: `Пул ${pool.text} · уснули: ${slept.join(", ") || "никто"}` };
  }
  if (sp.kind === "heal") { const d = rollDice(sp.dice); const amt = d.total + castMod(); const got = healHero(amt); return { ...base, title: `Заклинание: ${sp.name}`, nat: 0, ok: true, heal: got, formula: `${d.text} ${fmt(castMod())} = ${amt} HP` }; }
  return base;
}
function hurtEnemy(id, amt) { const e = S.world.enemies[id]; e.hp = Math.max(0, e.hp - amt); e.asleep = false; if (e.hp === 0 && e.alive) { e.alive = false; S.pendingXP = (S.pendingXP || 0) + ENEMIES[id].xp; } }
function enemyStatus(id) { const e = S.world.enemies[id]; const E = ENEMIES[id]; if (!e.alive) return "повержен"; const p = e.hp / E.hp; return e.asleep ? "спит" : p > .7 ? "почти невредим" : p > .35 ? "ранен" : "тяжело ранен"; }
function healHero(amt) { const c = C(); const before = c.hp; c.hp = Math.min(c.maxHp, c.hp + amt); if (c.hp > 0) S.dying = null; return c.hp - before; }
function hurtHero(amt) { const c = C(); c.hp = Math.max(0, c.hp - amt); return amt; }
function enemyTurn() {
  const out = []; if (!S.world.combat) return out;
  for (const id of aliveEnemiesHere()) {
    const e = S.world.enemies[id]; const E = ENEMIES[id];
    if (e.asleep) { out.push({ kind: "enemy", title: `${E.name} спит`, formula: "Пропускает ход", nat: 0, ok: false, enemyRoll: true, skip: true }); continue; }
    if (C().hp <= 0) break;
    const nat = rnd(20); const tot = nat + E.atk; const hit = nat === 20 || (nat !== 1 && tot >= C().ac); let d = null; if (hit) { d = rollDice(E.dmg, nat === 20); hurtHero(d.total); }
    out.push({ kind: "enemy", by: id, title: `${E.name} атакует`, nat, total: tot, ok: hit, crit: nat === 20, enemyRoll: true, dmg: d?.total || 0, formula: `d20 (${nat}) +${E.atk} = ${tot} против вашего КД ${C().ac}` + (hit ? ` · урон ${d.text}` : " · промах") });
  }
  return out;
}

/* =========================================================================
   SVG ART
   ========================================================================= */
const EMBLEM = {
  fighter: '<path d="M50 14 L56 20 L56 62 L50 70 L44 62 L44 20 Z" fill="currentColor"/><rect x="32" y="62" width="36" height="6" rx="2" fill="currentColor"/><rect x="47" y="68" width="6" height="16" rx="2" fill="currentColor"/><circle cx="50" cy="88" r="4" fill="currentColor"/>',
  rogue: '<path d="M30 24 L58 68 L54 72 L26 28 Z" fill="currentColor"/><path d="M70 24 L42 68 L46 72 L74 28 Z" fill="currentColor" opacity=".75"/><rect x="47" y="70" width="6" height="12" rx="2" transform="rotate(-33 50 76)" fill="currentColor"/><circle cx="50" cy="48" r="5" fill="none" stroke="currentColor" stroke-width="3"/>',
  wizard: '<path d="M50 14 L57 38 L82 38 L62 53 L70 78 L50 63 L30 78 L38 53 L18 38 L43 38 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="48" r="7" fill="currentColor"/>',
  cleric: '<circle cx="50" cy="50" r="14" fill="currentColor"/><g stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M50 18v10M50 72v10M18 50h10M72 50h10M27 27l7 7M66 66l7 7M73 27l-7 7M34 66l-7 7"/></g>'
};
function emblemSVG(cls, size) { const c = CLASSES[cls]; return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="color:${c.color}" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="2" opacity=".5"/>${EMBLEM[cls]}</svg>`; }
function portraitSVG(cls, race, name) {
  const col = cls ? CLASSES[cls].color : "#f0b35a"; const h = hash((name || "") + race + cls); const ini = (String(name || "").trim()[0] || "?").toUpperCase();
  const stars = Array.from({ length: 18 }, (_, i) => { const x = ((h >> (i % 24)) % 400 + (i * 37) % 400) % 400; const y = (i * 53 + (h % 97)) % 160; return `<circle cx="${x}" cy="${y}" r="${1 + (i % 3) * .5}" fill="#e7ede8" opacity="${.2 + (i % 4) * .12}"/>`; }).join("");
  const raceMark = { elf: '<path d="M160 150 l-26 -40 l16 42 Z M240 150 l26 -40 l-16 42 Z" fill="#e7ede8" opacity=".55"/>', dwarf: '<path d="M170 250 q30 60 60 0 q-30 25 -60 0Z" fill="#e7ede8" opacity=".35"/>', halfling: '<circle cx="200" cy="300" r="70" fill="none" stroke="#e7ede8" stroke-opacity=".2" stroke-width="2"/>' }[race] || "";
  return `<svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Герб героя"><defs><radialGradient id="pg${h}" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="${col}" stop-opacity=".55"/><stop offset=".55" stop-color="#122126"/><stop offset="1" stop-color="#0c1619"/></radialGradient><linearGradient id="sea${h}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b3139"/><stop offset="1" stop-color="#0c1619"/></linearGradient></defs>
  <rect width="400" height="320" fill="url(#pg${h})"/>${stars}<path d="M0 250 Q60 236 120 248 T240 246 T400 244 V320 H0Z" fill="url(#sea${h})"/><path d="M0 262 Q80 252 160 262 T320 258 T400 260" stroke="${col}" stroke-opacity=".35" fill="none"/>${raceMark}
  <g transform="translate(140 70) scale(1.2)" style="color:${col}"><path d="M50 4 L92 20 V52 C92 78 72 94 50 100 C28 94 8 78 8 52 V20 Z" fill="#0c1619" fill-opacity=".72" stroke="currentColor" stroke-width="2.5"/><g transform="translate(14 14) scale(.72)">${cls ? EMBLEM[cls] : ""}</g></g>
  <text x="200" y="300" text-anchor="middle" font-family="Cormorant, Georgia, serif" font-size="30" font-weight="700" fill="#e7ede8" opacity=".9">${esc(ini)}</text></svg>`;
}
/* Портрет НПС: собирается один раз из параметров, которые мир хранит константой */
function npcSVG(id, big) {
  const n = NPCS[id] || { name: "?", hair: "brown", feature: "hood", age: "adult" }; const h = hash((WD?.id || "") + id); const hue = h % 360; const H = big ? 230 : 200;
  const sk = `hsl(${22 + (h % 14)}, ${28 + (h >> 4) % 14}%, ${n.age === "old" ? 56 : 46 + (h >> 8) % 14}%)`;
  const hairC = HAIRS[n.hair] || HAIRS.brown; const coat = `hsl(${hue}, 30%, 28%)`; const f = n.feature;
  let top = "", front = "";
  if (f !== "bald" && f !== "hood") top = `<path d="M66 90 q34 -42 68 0 q-2 -24 -34 -30 q-32 6 -34 30z" fill="${hairC}"/>`;
  if (f === "braid") top += `<path d="M132 92 q14 30 4 64" stroke="${hairC}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  if (f === "hood") top = `<path d="M58 134 q-6 -84 42 -92 q48 8 42 92 q-8 -40 -42 -46 q-34 6 -42 46z" fill="hsl(${hue}, 18%, 34%)"/>`;
  if (f === "hat") top += `<ellipse cx="100" cy="66" rx="52" ry="10" fill="hsl(${hue}, 20%, 20%)"/><path d="M74 66 q4 -30 26 -30 q22 0 26 30z" fill="hsl(${hue}, 20%, 22%)"/>`;
  if (f === "beard") front = `<path d="M70 106 q30 54 60 0 q-6 22 -30 26 q-24 -4 -30 -26z" fill="${hairC}"/>`;
  if (f === "scarf") front = `<path d="M66 132 q34 18 68 0 v14 q-34 16 -68 0z" fill="hsl(${(hue + 160) % 360}, 45%, 42%)"/>`;
  if (f === "scar") front = `<path d="M112 84 l10 30" stroke="hsl(0, 40%, 35%)" stroke-width="3" stroke-linecap="round"/>`;
  if (f === "jewel") front = `<circle cx="100" cy="182" r="5" fill="#f0b35a"/><path d="M72 160 l28 22 l28 -22" stroke="#f0b35a" stroke-width="3" fill="none"/>`;
  const wr = n.age === "old" ? `<path d="M80 88 q8 -4 14 0 M106 88 q8 -4 14 0" stroke="#3a2a20" stroke-width="1.5" fill="none" opacity=".6"/>` : "";
  return `<svg viewBox="0 0 200 ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Портрет: ${esc(n.name)}"><defs><radialGradient id="nb${h}" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="hsl(${hue},38%,30%)"/><stop offset="1" stop-color="#0c1619"/></radialGradient></defs>
  <rect width="200" height="${H}" fill="url(#nb${h})"/><path d="M28 ${H} q8 -60 72 -66 q64 6 72 66z" fill="${coat}"/><rect x="88" y="120" width="24" height="22" fill="${sk}"/>
  <ellipse cx="100" cy="98" rx="34" ry="40" fill="${sk}"/>${top}${wr}<ellipse cx="87" cy="100" rx="3.5" ry="2.5" fill="#1a1a1a"/><ellipse cx="113" cy="100" rx="3.5" ry="2.5" fill="#1a1a1a"/>
  <path d="M90 120 q10 ${(h % 3) * 3 - 2} 20 0" stroke="#3a1f18" stroke-width="2.5" fill="none" stroke-linecap="round"/>${front}</svg>`;
}

/* =========================================================================
   PORTRAITS — фото через Hugging Face (FLUX.1 Krea), хранятся в assets
   ========================================================================= */
const HF = { server: "Hugging Face", tool: "dynamic_space", space: "mcp-tools/FLUX.1-Krea-dev", spaceTool: "FLUX_1_Krea_dev_infer" };
const IMG_KEY = "sh3-imgs";
const imgCache = lsGet(IMG_KEY) || {};
const imgPending = new Set();
let imgNote = "", mcpP = null, assetsP = null, imgQueue = Promise.resolve();
function getMcp() { if (!mcpP) mcpP = window.claude?.use ? window.claude.use("mcp").catch(() => null) : Promise.resolve(null); return mcpP; }
function getAssets() { if (!assetsP) assetsP = window.claude?.use ? window.claude.use("assets").catch(() => null) : Promise.resolve(null); return assetsP; }
function npcImg(id, wd) { const w = wd || WD; return w ? (w.npcs?.[id]?.img || imgCache[w.id + ":" + id] || "") : ""; }
function photoTag(url) { return url ? `<img class="photo" src="${esc(url)}" alt="" loading="lazy" style="position:absolute;inset:0">` : ""; }
function npcPh(id, cls, wd) {
  const w = wd || WD; const key = w ? w.id + ":" + id : "";
  const prev = WD; if (w && w !== WD) setWorld(w); const svg = npcSVG(id, true); if (prev && w !== prev) setWorld(prev);
  return `<div class="ph ${cls || ""}">${svg}${photoTag(npcImg(id, w))}${imgPending.has(key) ? '<span class="gen">Портрет пишется…</span>' : ""}</div>`;
}
function heroPh(o, cls) { return `<div class="ph ${cls || ""}">${portraitSVG(o.cls, o.race, o.name)}${photoTag(o.img)}${o.gen ? '<span class="gen">Портрет пишется…</span>' : ""}</div>`; }
document.addEventListener("error", e => { const t = e.target; if (t && t.classList && t.classList.contains("photo")) t.remove(); }, true);
function b64ToBlob(b64, type) { const bin = atob(String(b64).replace(/^data:[^,]+,/, "")); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Blob([u], { type: type || "image/png" }); }
function hfErr(e, text) {
  const m = String(e?.message || "") + " " + String(text || "");
  if (/gradio\s*=\s*none|invoke operation is disabled/i.test(m)) return { code: "spaces_off" };
  if (/quota|zerogpu|exceeded|GPU/i.test(m)) return { code: "quota" };
  if (["server_not_connected", "needs_reauth", "not_granted", "blocked_by_policy"].includes(e?.code)) return { code: "no_hf" };
  return { code: e?.code || "img_failed" };
}
const IMG_NOTES = {
  spaces_off: "Hugging Face не разрешает запуск генераторов. Включите Spaces в настройках MCP на huggingface.co/settings/mcp и добавьте mcp-tools/FLUX.1-Krea-dev.",
  quota: "Закончилась бесплатная квота GPU на Hugging Face. Портреты допишутся позже, пока показаны рисованные.",
  no_hf: "Подключите Hugging Face в настройках claude.ai, чтобы получать фото-портреты.",
  no_mcp: "Генерация фото недоступна в этом просмотре. Показаны рисованные портреты.",
  no_image: "Генератор ответил без картинки. Попробуйте ещё раз позже.",
  img_failed: "Портрет не получился. Попробуйте ещё раз позже."
};
async function hfImage(prompt, seed) {
  const mcp = await getMcp(); if (!mcp) throw { code: "no_mcp" };
  let r;
  try {
    r = await mcp.callTool(HF.server, HF.tool, { operation: "invoke", space_name: HF.space, tool_name: HF.spaceTool,
      parameters: JSON.stringify({ prompt: prompt.slice(0, 600), width: 640, height: 800, num_inference_steps: 22, guidance_scale: 4.5, randomize_seed: false, seed }) }, { cache: false });
  } catch (e) { throw hfErr(e); }
  const blocks = Array.isArray(r?.content) ? r.content : [];
  for (const b of blocks) {
    if (b.type === "image" && b.data) return { blob: b64ToBlob(b.data, b.mimeType) };
    if (b.type === "resource" && b.resource?.blob) return { blob: b64ToBlob(b.resource.blob, b.resource.mimeType) };
  }
  const text = blocks.filter(b => b.type === "text").map(b => b.text).join("\n") + (typeof r?.payload === "string" ? r.payload : "");
  const dm = text.match(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/); if (dm) return { blob: b64ToBlob(dm[0], dm[0].slice(5, dm[0].indexOf(";"))) };
  const um = text.match(/https?:\/\/[^\s)"'\]<>]+?\.(?:png|jpe?g|webp)(?:\?[^\s)"'\]<>]*)?/i) || text.match(/https?:\/\/[^\s)"'\]<>]+\/file=[^\s)"'\]<>]+/i);
  if (um) return { url: um[0] };
  throw hfErr(null, text) .code === "img_failed" ? { code: "no_image" } : hfErr(null, text);
}
async function shrinkToDataURL(blob) {
  const bmp = await createImageBitmap(blob); const s = Math.min(1, 420 / bmp.width); const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s); c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", .82);
}
async function storeImage(res) {
  if (res.url) return res.url;
  const assets = await getAssets();
  if (assets) { try { const a = await assets.upload(res.blob); return a.url || ("/_blob/" + a.id); } catch (e) {} }
  return shrinkToDataURL(res.blob);
}
async function makePortrait(prompt, seed) { return storeImage(await hfImage(prompt, seed)); }
function onImgError(e) { imgNote = IMG_NOTES[e?.code] || IMG_NOTES.img_failed; return e?.code; }
async function ensurePrompts(wd) {
  const miss = Object.entries(wd.npcs).filter(([, n]) => !n.photo_prompt); if (!miss.length) return;
  const sample = await getSample();
  if (sample) { try {
    const r = await sample.json(`Write realistic photo portrait prompts in ENGLISH for image generation. World style: ${wd.photo_style}. For each person give 25–40 words: age, gender, face, hair, clothing, expression, a hint of setting. Reply only JSON object {"id":"prompt"}.\n${miss.map(([id, n]) => `${id}: ${n.name}, ${n.role}; ${n.look}; ${n.persona}`).join("\n")}`, { modelTier: "quick", cache: false });
    miss.forEach(([id, n]) => { if (r && typeof r[id] === "string") n.photo_prompt = str(r[id], 320); });
  } catch (e) {} }
  miss.forEach(([id, n]) => { if (!n.photo_prompt) n.photo_prompt = `portrait of ${n.age === "old" ? "an elderly" : n.age === "young" ? "a young" : "an adult"} villager, ${n.hair} hair, simple medieval clothes`; });
}
function portraitPrompt(wd, n) { return `${n.photo_prompt}. ${wd.photo_style}. Head and shoulders, looking at camera, photorealistic, highly detailed face, no text`; }
function queueWorldPortraits(wd) {
  if (!wd || wd._queued) return; Object.defineProperty(wd, "_queued", { value: true, enumerable: false, writable: true });
  imgQueue = imgQueue.then(async () => {
    await ensurePrompts(wd);
    for (const [id, n] of Object.entries(wd.npcs)) {
      const key = wd.id + ":" + id; if (imgCache[key]) { n.img = imgCache[key]; continue; }
      imgPending.add(key); refreshPortraitViews();
      try { const url = await makePortrait(portraitPrompt(wd, n), hash(key) % 100000); imgCache[key] = url; lsSet(IMG_KEY, imgCache); setNpcImg(wd.id, id, url); }
      catch (e) { imgPending.delete(key); const c = onImgError(e); refreshPortraitViews(); if (["spaces_off", "no_hf", "no_mcp", "quota"].includes(c)) { wd._queued = false; break; } continue; }
      imgPending.delete(key); refreshPortraitViews();
    }
  });
}
function setNpcImg(wid, id, url) {
  [D?.world, ...(D?.worlds || []), S?.wd].forEach(w => { if (w && w.id === wid && w.npcs[id]) w.npcs[id].img = url; });
  if (S && S.wd.id === wid) save();
}
let portraitTimer = null;
function refreshPortraitViews() {
  clearTimeout(portraitTimer); portraitTimer = setTimeout(() => {
    if (!document.getElementById("screen-create").hidden && D) { if (D.step === 0) renderCreate(); }
    else if (!document.getElementById("screen-game").hidden && S) { renderScene(); renderWorld(); }
    else if (!document.getElementById("screen-home").hidden) renderHome();
  }, 120);
}
async function genHeroPortrait(btn, st) {
  btn.disabled = true; D.gen = true; imgNote = ""; st.textContent = "Пишу промпт и портрет. Обычно 20–60 секунд…"; renderHeroCard();
  try {
    let prompt = "";
    const sample = await getSample();
    const desc = `${D.gender === "f" ? "woman" : "man"}, race ${RACES[D.race]?.name}, class ${CLASSES[D.cls]?.name}, background ${BACKGROUNDS[D.bg]?.name}. Appearance from player: ${D.lookDesc || "—"}. Character: ${personality(D.sl1, D.sl2)}.`;
    if (sample) { try { const r = await sample.json(`Write ONE realistic photo portrait prompt in ENGLISH (35–55 words) for a fantasy tabletop hero. Keep every detail the player gave about appearance. Translate fantasy race into realistic features (elf: tall, slender, pointed ears; dwarf: short, stocky, braided beard; halfling: small, youthful round face). Show class gear: ${({ fighter: "chainmail and shield", rogue: "dark leather armour, hood, dagger", wizard: "worn robes, staff, spellbook", cleric: "scale armour, holy symbol" })[D.cls]}. Hero: ${desc} World style: ${D.world.photo_style}. Reply only JSON {"prompt":"…"}`, { modelTier: "quick", cache: false }); prompt = str(r?.prompt, 600); } catch (e) {} }
    if (!prompt) prompt = `portrait of a ${D.gender === "f" ? "woman" : "man"} adventurer, ${({ elf: "elf with pointed ears, slender", dwarf: "stocky dwarf with braided beard", halfling: "small halfling with round youthful face", human: "human" })[D.race]}, ${({ fighter: "chainmail and shield", rogue: "dark leather armour and hood", wizard: "worn robes and staff", cleric: "scale armour and holy symbol" })[D.cls]}`;
    D.imgPrompt = prompt;
    D.img = await makePortrait(`${prompt}. ${D.world.photo_style}. Head and shoulders, photorealistic, highly detailed face, no text`, rnd(99999));
    st.textContent = "Готово. Не нравится — создайте другой вариант.";
  } catch (e) { onImgError(e); st.textContent = imgNote; }
  D.gen = false; btn.disabled = false; btn.textContent = D.img ? "Другой вариант" : "Создать фото-портрет"; renderHeroCard();
}

const D20SVG = '<svg viewBox="0 0 52 52" aria-hidden="true"><path d="M26 2 L48 14 L48 38 L26 50 L4 38 L4 14 Z" fill="var(--shoal)" stroke="currentColor" stroke-width="2"/><path d="M26 2 L14 32 L38 32 Z M14 32 L4 14 M38 32 L48 14 M14 32 L26 50 L38 32 M4 38 L14 32 M48 38 L38 32" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/></svg>';

/* =========================================================================
   MAP RENDER
   ========================================================================= */
const PAL = { S: ["#123547", "#14394c"], W: ["#1a4157", "#1c4560"], a: ["#8b7a55", "#94825c"], g: ["#2f4a35", "#33503a"], f: ["#1d3a2a", "#21402e"], r: ["#4a4f50", "#545a5b"], n: ["#a9b4b6", "#b3bdbf"], m: ["#2c3d2c", "#314330"] };
function reveal(cx, cy, r) { const seen = new Set(S.world.seen); for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) seen.add(x + "," + y); S.world.seen = [...seen]; }
let mapSel = null;
function paintMap(cv, opts) {
  const o = opts || {}; const W = o.width; const t = W / MAP_W; const H = t * MAP_H; const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + "px";
  const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    const tt = tileAt(x, y); const h = hash(x * 31 + "," + y); const p = PAL[tt] || PAL.g;
    g.fillStyle = p[h % 2]; g.fillRect(x * t, y * t, t + .5, t + .5);
    if (tt === "S" || tt === "W") { g.strokeStyle = "rgba(160,210,230,.13)"; g.lineWidth = 1; g.beginPath(); const yy = y * t + t * (.35 + (h % 5) * .08); g.moveTo(x * t + t * .15, yy); g.quadraticCurveTo(x * t + t * .5, yy - t * .12, x * t + t * .85, yy); g.stroke(); }
    if (tt === "f") { g.fillStyle = "#16301f"; for (let k = 0; k < 2; k++) { const px = x * t + t * (.3 + k * .4), py = y * t + t * (.35 + ((h >> k) % 3) * .15); g.beginPath(); g.moveTo(px, py - t * .28); g.lineTo(px + t * .2, py + t * .18); g.lineTo(px - t * .2, py + t * .18); g.closePath(); g.fill(); } }
    if (tt === "r") { g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.arc(x * t + t * .4, y * t + t * .55, t * .22, 0, 7); g.fill(); }
    if (tt === "n") { g.fillStyle = "rgba(255,255,255,.35)"; g.beginPath(); g.moveTo(x * t + t * .2, y * t + t * .75); g.lineTo(x * t + t * .5, y * t + t * .25); g.lineTo(x * t + t * .8, y * t + t * .75); g.fill(); }
    if (tt === "m" && h % 3 === 0) { g.strokeStyle = "rgba(124,199,156,.3)"; g.beginPath(); g.moveTo(x * t + t * .4, y * t + t * .7); g.lineTo(x * t + t * .4, y * t + t * .35); g.moveTo(x * t + t * .55, y * t + t * .7); g.lineTo(x * t + t * .6, y * t + t * .4); g.stroke(); }
    if (tt === "g" && h % 7 === 0) { g.fillStyle = "rgba(124,199,156,.12)"; g.fillRect(x * t + t * .3, y * t + t * .4, 2, 4); }
  }
  g.strokeStyle = "rgba(196,170,120,.55)"; g.lineWidth = Math.max(2, t * .16); g.lineCap = "round";
  ROAD.forEach(k => { const [x, y] = k.split(",").map(Number); if (!PASSABLE(tileAt(x, y))) return; g.beginPath();
    [[1, 0], [0, 1]].forEach(([dx, dy]) => { if (ROAD.has((x + dx) + "," + (y + dy))) { g.moveTo(x * t + t / 2, y * t + t / 2); g.lineTo((x + dx) * t + t / 2, (y + dy) * t + t / 2); } }); g.stroke(); });
  (WD.houses || []).forEach(([x, y]) => { g.fillStyle = "#6b5a46"; g.fillRect(x * t + t * .2, y * t + t * .35, t * .6, t * .45); g.fillStyle = "#8a3e2c"; g.beginPath(); g.moveTo(x * t + t * .1, y * t + t * .4); g.lineTo(x * t + t * .5, y * t + t * .1); g.lineTo(x * t + t * .9, y * t + t * .4); g.fill(); });
  const seen = o.fog ? new Set(S.world.seen) : null;
  if (seen) for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    if (seen.has(x + "," + y)) continue; let edge = 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { if (seen.has((x + a) + "," + (y + b))) edge++; });
    g.fillStyle = edge ? "rgba(9,16,19,.62)" : "rgba(9,16,19,.86)"; g.fillRect(x * t, y * t, t + .5, t + .5);
  }
  Object.entries(POIS).forEach(([id, p]) => {
    const cx = p.x * t + t / 2, cy = p.y * t + t / 2; const here = o.here === id; const known = !seen || seen.has(p.x + "," + p.y);
    if (p.kind === "tower") { const grd = g.createRadialGradient(cx, cy - t * .3, 0, cx, cy - t * .3, t * 2.4); grd.addColorStop(0, "rgba(240,179,90,.4)"); grd.addColorStop(1, "rgba(240,179,90,0)"); g.fillStyle = grd; g.beginPath(); g.arc(cx, cy - t * .3, t * 2.4, 0, 7); g.fill(); }
    g.beginPath(); g.arc(cx, cy, t * .42, 0, 7); g.fillStyle = known ? "#0c1619" : "rgba(12,22,25,.7)"; g.fill();
    g.lineWidth = here ? 2.5 : 1.5; g.strokeStyle = here ? "#f0b35a" : mapSel === id ? "#e7ede8" : known ? "#9db2b0" : "#4d6463"; g.stroke();
    g.fillStyle = known ? "#e7ede8" : "#6f8886"; g.font = `700 ${Math.max(9, t * .42)}px Manrope, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(known || S?.world.visited.includes(id) ? (KINDS[p.kind] || "•") : "?", cx, cy + 1);
    if (here) { g.beginPath(); g.arc(cx, cy, t * .7, 0, 7); g.strokeStyle = "rgba(240,179,90,.5)"; g.lineWidth = 1.5; g.setLineDash([3, 3]); g.stroke(); g.setLineDash([]); }
  });
  g.font = `600 ${Math.max(9, t * .36)}px Manrope, sans-serif`; g.textAlign = "left"; g.fillStyle = "rgba(231,237,232,.55)";
  (WD.labels || []).forEach(l => g.fillText(l.t, t * l.x, t * l.y));
}
function drawMap() { const cv = document.getElementById("map"); if (!cv || !S) return; paintMap(cv, { width: cv.parentElement.clientWidth || 320, fog: true, here: S.world.loc }); }
function mapClick(ev) {
  const cv = ev.currentTarget; const r = cv.getBoundingClientRect(); const t = r.width / MAP_W; const x = (ev.clientX - r.left) / t, y = (ev.clientY - r.top) / t;
  let best = null, bd = 1.3; Object.entries(POIS).forEach(([id, p]) => { const d = Math.hypot(p.x + .5 - x, p.y + .5 - y); if (d < bd) { bd = d; best = id; } });
  mapSel = best; renderWorld();
}

/* =========================================================================
   HOME
   ========================================================================= */
function showScreen(id) {
  ["screen-home", "screen-create", "screen-game"].forEach(s => document.getElementById(s).hidden = s !== id);
  const inGame = id === "screen-game";
  document.getElementById("btn-home").hidden = !inGame; document.getElementById("pill-mode").hidden = !inGame;
  document.querySelector(".nav-links").style.visibility = inGame ? "hidden" : "";
  document.querySelectorAll(".nav-links button").forEach(b => b.removeAttribute("aria-current"));
  document.querySelector(`.nav-links [data-go=${id === "screen-create" ? "new" : "home"}]`)?.setAttribute("aria-current", "page");
}
function ago(ts) { const m = Math.round((Date.now() - ts) / 60000); if (m < 1) return "только что"; if (m < 60) return m + " мин назад"; const h = Math.round(m / 60); if (h < 24) return h + " ч назад"; return Math.round(h / 24) + " дн назад"; }
function renderHome() {
  showScreen("screen-home"); const idx = campIndex(); const el = document.getElementById("home");
  const sh = makeDefaultWorld(); Object.keys(sh.npcs).forEach(id => { const u = imgCache[sh.id + ":" + id]; if (u) sh.npcs[id].img = u; });
  const card = (id, cls) => { const n = sh.npcs[id]; return `<figure class="card-f ${cls}" style="margin:0">${npcPh(id, "", sh)}<figcaption class="cap"><b>${esc(n.name)}</b><small>${esc(n.role)}</small></figcaption></figure>`; };
  el.innerHTML = `<section class="hero"><div class="wrap">
    <div><div class="eyebrow">ИИ-мастер · правила 5e</div>
      <h1>Мир, который <em>помнит</em> каждое ваше решение</h1>
      <p class="lead">Рассказчик создаёт новую местность, тайну и людей для каждой кампании. Вы пишете что угодно, а броски, хиты и ячейки заклинаний честно считает движок правил.</p>
      <div class="ctas"><button class="btn primary big" type="button" id="h-new">Начать кампанию</button>${idx.length ? `<button class="btn big" type="button" id="h-cont">Продолжить: ${esc(idx[0].hero)}</button>` : `<button class="btn ghost big" type="button" id="h-how">Как это устроено</button>`}</div>
      <div class="meta"><span><b>4</b>класса</span><span><b>4</b>биома</span><span><b>d20</b>на сервере, не у ИИ</span></div></div>
    <div class="stage" aria-hidden="true"><canvas id="hero-map"></canvas>${card("marta", "f1")}${card("ilva", "f2")}${card("ost", "f3")}
      <div class="roll-badge"><div class="d20">${D20SVG}<span>17</span></div><div><b>Проницательность: успех</b><small>d20 (14) +3 = 17 против КС 13</small></div></div></div>
  </div></section>
  <section class="band" id="how"><div class="wrap">
    <div class="band-head"><div><div class="eyebrow">Как это устроено</div><h2>Три шага до первого броска</h2></div><p>Каждая часть делает своё дело: ИИ рассказывает и играет за людей, код отвечает за правила и память.</p></div>
    <div class="how">
      <article><span class="n">1</span><h3>Мир</h3><p>Выберите окружение и тон или опишите своё. ИИ придумает злодея, тайну, 7 мест с уликами и жителей с секретами. Карту строит процедурный генератор, портреты пишутся фотографиями.</p><span class="formula">побережье · болота · горы · лес</span></article>
      <article><span class="n">2</span><h3>Герой</h3><p>Раса, класс, характеристики тремя способами, навыки и предыстория, которая привязывает вас к этому месту. По вашему описанию создаётся фото-портрет героя.</p><span class="formula">4d6, худший отбрасывается</span></article>
      <article><span class="n">3</span><h3>Игра</h3><p>Пишите действия и реплики своими словами. Рассказчик решает, нужна ли проверка, а исход определяет кубик. Архивариус ведёт летопись, чтобы история не забывалась.</p><span class="formula">d20 + модификатор + мастерство ≥ КС</span></article>
    </div></div></section>
  <section class="band" id="camps-band"><div class="wrap">
    <div class="band-head"><div><div class="eyebrow">Ваши кампании</div><h2>${idx.length ? "Летопись героев" : "Здесь появятся ваши герои"}</h2></div><p class="home-note">Кампании хранятся в этом браузере. Экспорт сохраняет кампанию в файл, чтобы перенести её на другое устройство. <button class="btn small" type="button" id="h-import" style="margin-left:6px">Импорт из файла</button></p></div>
    <div class="camp-grid" id="camps"></div><p class="home-note" id="h-msg"></p></div></section>
  <footer class="foot"><div class="wrap"><span>Летописец · прототип ИИ-мастера</span><span>Механика по System Reference Document 5.1 © Wizards of the Coast, лицензия CC-BY-4.0</span></div></footer>`;
  const grid = el.querySelector("#camps");
  idx.forEach(e => {
    const d = document.createElement("article"); d.className = "camp" + (e.dead ? " dead" : ""); d.style.setProperty("--cls", CLASSES[e.cls]?.color || "var(--lantern)");
    d.innerHTML = `${heroPh({ cls: e.cls, race: e.race, name: e.hero, img: e.img })}<div class="body"><div class="nm">${esc(e.hero)}</div><div class="sub">${esc(RACES[e.race]?.name || "")} · ${esc(CLASSES[e.cls]?.name || "")} · ур. ${e.level}</div><div class="sub">${esc(e.world)}${e.loc ? " · " + esc(e.loc) : ""}</div><div class="meta">${MODES[e.mode]?.name || ""} · ${ago(e.updated)}</div>${e.dead ? '<div class="fallen">Пал в бою</div>' : ""}
      <div class="row">${e.dead ? "" : `<button class="btn small primary" type="button" data-a="play">Продолжить</button>`}<button class="btn small" type="button" data-a="export">Экспорт</button><button class="btn small ghost" type="button" data-a="del">Удалить</button></div></div>`;
    d.querySelector("[data-a=play]")?.addEventListener("click", () => openCampaign(e.id));
    d.querySelector("[data-a=export]").onclick = () => exportCampaign(e.id);
    d.querySelector("[data-a=del]").onclick = () => modal(`<h2>Удалить кампанию?</h2><p>«${esc(e.hero)}» в мире «${esc(e.world)}» будет удалена из этого браузера. Отменить нельзя.</p><div class="row"><button class="btn" type="button" id="m-no">Оставить</button><button class="btn primary" type="button" id="m-yes">Удалить</button></div>`,
      r => { r.querySelector("#m-no").onclick = closeModal; r.querySelector("#m-yes").onclick = () => { deleteCamp(e.id); closeModal(); renderHome(); }; });
    grid.append(d);
  });
  const nw = document.createElement("button"); nw.type = "button"; nw.className = "camp new"; nw.innerHTML = `<b>Новая кампания</b><span>Новый мир, новая тайна, новый герой</span>`; nw.onclick = newCampaign; grid.append(nw);
  el.querySelector("#h-new").onclick = newCampaign;
  el.querySelector("#h-cont")?.addEventListener("click", () => openCampaign(idx[0].id));
  el.querySelector("#h-how")?.addEventListener("click", () => document.getElementById("how").scrollIntoView({ behavior: "smooth" }));
  el.querySelector("#h-import").onclick = () => document.getElementById("import-file").click();
  requestAnimationFrame(() => { const cv = document.getElementById("hero-map"); if (!cv) return; const prev = WD; setWorld(sh); paintMap(cv, { width: cv.clientWidth || 500, fog: false }); if (prev) setWorld(prev); else WD = null; });
}
function newCampaign() { D = newDraft(); showScreen("screen-create"); renderCreate(); document.getElementById("create-scroll").scrollTop = 0; }
async function exportCampaign(id) {
  const s = loadCamp(id); const msg = document.getElementById("h-msg"); if (!s) return;
  let dl = null; try { dl = window.claude?.use ? await window.claude.use("downloads") : null; } catch (e) {}
  if (!dl) { msg.textContent = "Экспорт файлов недоступен в этом просмотре."; return; }
  try { await dl.save({ filename: `${s.char.name}-${s.wd.name}.json`.replace(/[\\/:*?"<>|]/g, ""), data: JSON.stringify(s) }); msg.textContent = "Файл кампании сохранён."; }
  catch (e) { msg.textContent = e.code === "declined" ? "Сохранение отменено." : "Не удалось сохранить файл."; }
}
document.getElementById("import-file").addEventListener("change", ev => {
  const f = ev.target.files?.[0]; if (!f) return; const rd = new FileReader();
  rd.onload = () => { try { adoptCampaign(JSON.parse(rd.result)); renderHome(); document.getElementById("h-msg").textContent = "Кампания импортирована."; } catch (e) { renderHome(); document.getElementById("h-msg").textContent = "Это не файл кампании Летописца."; } };
  rd.readAsText(f); ev.target.value = "";
});
function openCampaign(id) { const s = loadCamp(id); if (!s) return; S = s; S.feed = (S.feed || []).filter(e => !(e.t === "narr" && !e.text)).map(e => ({ ...e, streaming: false })); setWorld(S.wd); startGame(false); }

/* =========================================================================
   CREATION
   ========================================================================= */
const STEP_NAMES = ["Мир", "Раса", "Класс", "Характеристики", "Навыки", "Облик", "Рассказчик"];
const STD = [15, 14, 13, 12, 10, 8];
const PB_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
let forgeCtl = null;
function newDraft() {
  return { step: 0, world: null, worlds: [makeDefaultWorld()], forge: { biome: "coast", tone: "grim", magic: "rare", wish: "", stage: -1, err: "" },
    race: null, cls: null, method: "array", pool: STD.slice(), assign: {}, pb: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
    rolled: null, bg: null, skills: [], name: "", gender: "m", about: "", lookDesc: "", img: "", gen: false, sl1: 50, sl2: 50, epithet: "", story: "", mode: "sandbox" };
}
function autoAssign() { if (!D.cls) return; const order = CLASSES[D.cls].prio; const vals = D.pool.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]); D.assign = {}; order.forEach((ab, k) => { D.assign[ab] = vals[k][1]; }); }
function draftBase() { if (D.method === "pb") return { ...D.pb }; const o = {}; for (const a of ABIL) o[a] = D.assign[a] != null ? D.pool[D.assign[a]] : 8; return o; }
function draftScores() { return finalScores(draftBase(), D.race || "none"); }
function lockedSkills() { const s = new Set(); if (D.race) RACES[D.race].skills.forEach(k => s.add(k)); if (D.bg) BACKGROUNDS[D.bg].skills.forEach(k => s.add(k)); return s; }
function draftSkills() { const s = lockedSkills(); D.skills.forEach(k => s.add(k)); return [...s]; }
function pbSpent() { return ABIL.reduce((s, a) => s + PB_COST[D.pb[a]], 0); }
function bgHook(id, wd) { return (wd || D?.world || WD)?.bg_hooks?.[id] || BACKGROUNDS[id].hook; }
function stepValid(i) {
  if (i === 0) return !!D.world && D.forge.stage < 0;
  if (i === 1) return !!D.race;
  if (i === 2) return !!D.cls;
  if (i === 3) { if (D.method === "pb") return pbSpent() <= 27; return ABIL.every(a => D.assign[a] != null) && new Set(Object.values(D.assign)).size === 6; }
  if (i === 4) return !!D.bg && D.skills.length === CLASSES[D.cls].skillCount;
  if (i === 5) return D.name.trim().length >= 2;
  return true;
}
const STEP_HINTS = ["Выберите или сотворите мир", "Выберите расу", "Выберите класс", "Распределите все шесть значений", "Выберите предысторию и навыки класса", "Введите имя (от 2 букв)", "Готово к приключению"];
function renderCreate() {
  const st = document.getElementById("steps"); st.innerHTML = "";
  STEP_NAMES.forEach((n, i) => {
    const li = document.createElement("li"); const b = document.createElement("button"); b.type = "button";
    const reach = i <= D.step || STEP_NAMES.slice(0, i).every((_, k) => stepValid(k));
    b.className = i === D.step ? "cur" : i < D.step ? "done" : ""; b.disabled = !reach || D.forge.stage >= 0;
    b.innerHTML = `<span class="n">${i < D.step ? "✓" : i + 1}</span><span class="lab">${n}</span>`; b.onclick = () => { D.step = i; renderCreate(); }; li.append(b); st.append(li);
  });
  const body = document.getElementById("step-body"); body.innerHTML = "";
  [stepWorld, stepRace, stepClass, stepAbil, stepSkills, stepLook, stepMode][D.step](body);
  const back = document.getElementById("btn-back"); back.disabled = D.forge.stage >= 0; back.textContent = D.step === 0 ? "К кампаниям" : "Назад";
  const nx = document.getElementById("btn-next"); nx.disabled = !stepValid(D.step); nx.textContent = D.step === 6 ? "Начать приключение" : "Далее";
  document.getElementById("step-hint").textContent = stepValid(D.step) ? (D.step === 6 ? "Мир ждёт" : "Можно дальше") : STEP_HINTS[D.step];
  document.getElementById("hero-card").hidden = D.step === 0;
  document.querySelector(".c-grid").style.gridTemplateColumns = D.step === 0 && innerWidth > 980 ? (innerWidth > 1240 ? "220px minmax(0, 1fr)" : "200px minmax(0, 1fr)") : "";
  if (D.step > 0) renderHeroCard();
}
function head(body, eb, h, lead) { body.insertAdjacentHTML("beforeend", `<div class="eyebrow">${eb}</div><h2>${h}</h2><p class="lead">${lead}</p>`); }
function choiceGrid(body, items, sel, onPick) {
  const g = document.createElement("div"); g.className = "choices" + (items.length === 4 ? " two" : "");
  items.forEach(it => { const b = document.createElement("button"); b.type = "button"; b.className = "choice"; b.setAttribute("aria-pressed", String(sel === it.id));
    b.innerHTML = `<div class="ch-head">${it.icon || ""}<div><div class="ch-name">${it.name}</div><div class="ch-sub">${it.sub}</div></div></div>${it.rec ? `<span class="rec">${esc(it.rec)}</span>` : ""}${it.list.length ? `<ul>${it.list.map(x => `<li>${x}</li>`).join("")}</ul>` : ""}`;
    b.onclick = () => onPick(it.id); g.append(b); });
  body.append(g);
}
function optRow(label, dict, key) {
  const wrap = document.createElement("div"); wrap.className = "opt-group"; wrap.innerHTML = `<span>${label}</span><div class="opts"></div>`;
  Object.entries(dict).forEach(([k, v]) => { const b = document.createElement("button"); b.type = "button"; b.textContent = v; b.setAttribute("aria-pressed", String(D.forge[key] === k)); b.disabled = D.forge.stage >= 0;
    b.onclick = () => { D.forge[key] = k; renderCreate(); }; wrap.querySelector(".opts").append(b); });
  return wrap;
}
function stepWorld(body) {
  head(body, "Шаг 1", "Где начнётся история?", "Готовый мир доступен всегда. Новый мир сочиняет ИИ: тайну, злодея, места, людей и улики. Карту и врагов строит движок, чтобы числа оставались честными.");
  const forge = document.createElement("div"); forge.className = "forge";
  const left = document.createElement("div"); left.className = "forge-box";
  left.innerHTML = `<h3>Сотворить новый мир</h3><p>Займёт около минуты. Каждый раз получается другая история.</p>`;
  left.append(optRow("Окружение", BIOMES, "biome"), optRow("Тон", TONES, "tone"), optRow("Магия", MAGICS, "magic"));
  left.insertAdjacentHTML("beforeend", `<div class="field" style="margin-bottom:12px"><label for="f-wish">Пожелания (необязательно)</label><textarea id="f-wish" maxlength="300" placeholder="Например: ведьма на болотах, пропавшие дети, никаких драконов" ${D.forge.stage >= 0 ? "disabled" : ""}>${esc(D.forge.wish)}</textarea></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" type="button" id="f-forge" ${D.forge.stage >= 0 ? "disabled" : ""}>Сотворить мир</button>${D.forge.stage >= 0 ? `<button class="btn" type="button" id="f-cancel">Отменить</button>` : ""}</div>
    ${D.forge.err ? `<p class="err">${esc(D.forge.err)}</p>` : ""}${imgNote ? `<p class="err" style="color:var(--mist)">${esc(imgNote)}</p>` : ""}
    ${D.forge.stage >= 0 ? `<ol class="stages">${FORGE_STAGES.map((s, i) => `<li class="${i < D.forge.stage ? "ok" : i === D.forge.stage ? "run" : ""}"><i>${i < D.forge.stage ? "✓" : ""}</i>${s}</li>`).join("")}</ol>` : ""}`);
  left.querySelector("#f-wish").oninput = e => { D.forge.wish = e.target.value; };
  left.querySelector("#f-forge").onclick = runForge; left.querySelector("#f-cancel")?.addEventListener("click", () => forgeCtl?.abort());
  const right = document.createElement("div"); right.className = "forge-box";
  right.innerHTML = `<h3>Выбрать мир</h3><p>Ваши сотворённые миры и готовый мир для быстрого старта.</p><div class="world-list" id="wlist"></div>`;
  const list = right.querySelector("#wlist");
  D.worlds.forEach((w, i) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "world-pick"; b.setAttribute("aria-pressed", String(D.world === w)); b.disabled = D.forge.stage >= 0;
    b.innerHTML = `<span class="eyebrow">${i === D.worlds.length - 1 ? "Готовый мир" : "Сотворён ИИ"} · ${BIOMES[w.biome] || ""}</span><b>${esc(w.name)}</b>${w.tagline ? `<span class="tagline">${esc(w.tagline)}</span>` : ""}<small>${esc(w.public)}</small>
      ${D.world === w ? `<canvas class="mini-map" aria-label="Карта мира"></canvas><small><b style="font-family:var(--ui);font-size:12.5px">Задание:</b> ${esc(w.quest)}</small>` : ""}`;
    b.onclick = () => { D.world = w; D.bg = null; queueWorldPortraits(w); renderCreate(); };
    list.append(b);
    if (D.world === w) { const cast = document.createElement("div"); cast.className = "cast"; cast.innerHTML = Object.entries(w.npcs).map(([id, n]) => `<figure>${npcPh(id, "", w)}<figcaption>${esc(n.name)}<br><span style="color:var(--dim)">${esc(n.role)}</span></figcaption></figure>`).join(""); b.append(cast); }
    if (D.world === w) requestAnimationFrame(() => { const cv = b.querySelector("canvas"); if (!cv) return; const prev = WD; setWorld(w); paintMap(cv, { width: cv.clientWidth || 300, fog: false }); if (prev) setWorld(prev); });
  });
  forge.append(left, right); body.append(forge);
}
async function runForge() {
  D.forge.err = ""; D.forge.stage = 0; renderCreate(); forgeCtl = new AbortController();
  try {
    const w = await forgeWorld(D.forge, s => { D.forge.stage = s; renderCreate(); }, forgeCtl.signal);
    D.worlds.unshift(w); D.world = w; D.bg = null; D.forge.stage = -1; queueWorldPortraits(w);
  } catch (e) {
    D.forge.stage = -1;
    D.forge.err = e?.code === "no_ai" || e?.code === "not_granted" ? "ИИ недоступен в этом просмотре. Выберите готовый мир справа." : e?.code === "cancelled" ? "" : e?.code === "rate_limited" ? "ИИ сейчас перегружен. Попробуйте через минуту." : "Мир не сложился. Попробуйте ещё раз или измените пожелания.";
    if (e?.code === "not_granted") { aiOff = true; }
  }
  forgeCtl = null; renderCreate();
}
function stepRace(body) {
  head(body, "Шаг 2", "Кто вы по крови?", "Раса даёт бонусы к характеристикам и врождённые черты.");
  choiceGrid(body, Object.entries(RACES).map(([id, r]) => ({ id, name: r.name, sub: r.sub, list: [Object.entries(r.bonus).map(([a, v]) => `${ABIL_RU[a]} +${v}`).join(", "), ...r.traits.slice(id === "human" ? 1 : 0), `Скорость ${r.speed} фт`] })),
    D.race, id => { D.race = id; renderCreate(); });
}
function stepClass(body) {
  const w = D.world; const rec = {}; (w.recommended || []).forEach(r => rec[r.cls] = r.why);
  head(body, "Шаг 3", "Чем вы зарабатываете на жизнь?", `Мир «${esc(w.name)}» подсказывает, кому здесь будет интереснее всего, но справится любой класс.`);
  choiceGrid(body, Object.entries(CLASSES).map(([id, c]) => ({ id, name: c.name, sub: `${c.role} · кость хитов d${c.hd}`, rec: rec[id] ? "Для этого мира: " + rec[id] : "", icon: emblemSVG(id, 40), list: [c.blurb, c.features[0], "Спасброски: " + c.saves.map(a => ABIL_RU[a]).join(", ")] })),
    D.cls, id => { D.cls = id; D.skills = []; if (D.method !== "pb") autoAssign(); renderCreate(); });
}
function stepAbil(body) {
  head(body, "Шаг 4", "Сильные и слабые стороны", "Модификатор = (значение − 10) / 2, с округлением вниз. Он прибавляется к броскам d20. Расовые бонусы уже учтены.");
  const m = document.createElement("div"); m.className = "method";
  [["array", "Стандартный набор"], ["pb", "Покупка очков"], ["roll", "Бросить 4d6"]].forEach(([k, t]) => { const b = document.createElement("button"); b.type = "button"; b.textContent = t; b.setAttribute("aria-pressed", String(D.method === k));
    b.onclick = () => { D.method = k; if (k === "array") { D.pool = STD.slice(); autoAssign(); } if (k === "roll") { if (!D.rolled) rollStats(); else { D.pool = D.rolled.slice(); autoAssign(); } } renderCreate(); }; m.append(b); });
  body.append(m);
  if (D.method === "roll") { const r = document.createElement("div"); r.className = "rolled"; r.innerHTML = D.pool.map(v => `<div class="die">${v}</div>`).join("") + `<button class="btn small" type="button" id="reroll">Перебросить</button><small style="color:var(--dim)">4d6, худший куб отбрасывается</small>`; body.append(r); r.querySelector("#reroll").onclick = () => { rollStats(); renderCreate(); }; }
  if (D.method === "pb") body.insertAdjacentHTML("beforeend", `<div class="budget">Потрачено <b>${pbSpent()}</b> из <b>27</b> очков · значения 8–15</div>`);
  const g = document.createElement("div"); g.className = "abil-grid"; const sc = draftScores();
  ABIL.forEach(a => {
    const cell = document.createElement("div"); cell.className = "abil-cell"; const rb = D.race ? (RACES[D.race].bonus[a] || 0) : 0;
    cell.innerHTML = `<div class="lbl"><b>${ABIL_RU[a]}</b><small>${ABIL_FULL[a]}</small></div><div class="val"><span class="total">${sc[a]}</span><span class="mod">${fmt(mod(sc[a]))}</span>${rb ? `<span class="race">раса +${rb}</span>` : ""}</div>`;
    if (D.method === "pb") {
      const s = document.createElement("div"); s.className = "stepper"; const v = D.pb[a];
      const minus = document.createElement("button"); minus.type = "button"; minus.textContent = "−"; minus.setAttribute("aria-label", `Уменьшить ${ABIL_FULL[a]}`); minus.disabled = v <= 8; minus.onclick = () => { D.pb[a]--; renderCreate(); };
      const plus = document.createElement("button"); plus.type = "button"; plus.textContent = "+"; plus.setAttribute("aria-label", `Увеличить ${ABIL_FULL[a]}`); plus.disabled = v >= 15 || pbSpent() - PB_COST[v] + PB_COST[v + 1] > 27; plus.onclick = () => { D.pb[a]++; renderCreate(); };
      s.append(minus, Object.assign(document.createElement("span"), { className: "num", textContent: `база ${v} · ${PB_COST[v]} оч.` }), plus); cell.append(s);
    } else {
      const sel = document.createElement("select"); sel.id = "as-" + a; sel.setAttribute("aria-label", ABIL_FULL[a]);
      sel.innerHTML = `<option value="">—</option>` + D.pool.map((v, i) => `<option value="${i}" ${D.assign[a] === i ? "selected" : ""}>${v}</option>`).join("");
      sel.onchange = () => { const i = sel.value === "" ? null : +sel.value; const other = ABIL.find(b => b !== a && D.assign[b] === i); if (other && i != null) D.assign[other] = D.assign[a] ?? null; D.assign[a] = i; renderCreate(); };
      cell.append(sel);
    }
    g.append(cell);
  });
  body.append(g);
}
function rollStats() { D.rolled = Array.from({ length: 6 }, () => { const r = [rnd(6), rnd(6), rnd(6), rnd(6)].sort((a, b) => b - a); return r[0] + r[1] + r[2]; }).sort((a, b) => b - a); D.pool = D.rolled.slice(); autoAssign(); }
function stepSkills(body) {
  head(body, "Шаг 5", "Прошлое и умения", "Предыстория даёт два навыка и связь с этим миром. Владение навыком добавляет бонус мастерства +2.");
  const bgg = document.createElement("div"); bgg.className = "choices two";
  Object.entries(BACKGROUNDS).forEach(([id, b]) => { const btn = document.createElement("button"); btn.type = "button"; btn.className = "choice"; btn.setAttribute("aria-pressed", String(D.bg === id));
    btn.innerHTML = `<div class="ch-name">${b.name}</div><div class="ch-sub">${b.skills.map(k => SKILLS[k][0]).join(", ")}</div><ul><li>Вы ${esc(bgHook(id))}.</li></ul>`;
    btn.onclick = () => { D.bg = id; const lk = lockedSkills(); D.skills = D.skills.filter(k => !lk.has(k)); renderCreate(); }; bgg.append(btn); });
  body.append(bgg);
  const cls = CLASSES[D.cls]; const lk = lockedSkills();
  body.insertAdjacentHTML("beforeend", `<div class="subhead">Навыки класса · выбрано ${D.skills.length} из ${cls.skillCount}</div>`);
  const list = document.createElement("div"); list.className = "skill-list"; const sc = draftScores();
  cls.skillList.forEach(k => { const b = document.createElement("button"); b.type = "button"; const locked = lk.has(k); const on = D.skills.includes(k) || locked;
    b.className = "skill-opt" + (locked ? " locked" : ""); b.setAttribute("aria-pressed", String(on));
    b.innerHTML = `<span>${SKILLS[k][0]} <small>${ABIL_RU[SKILLS[k][1]]}</small></span><span class="num">${fmt(mod(sc[SKILLS[k][1]]) + (on ? 2 : 0))}</span>`; if (locked) b.title = "Уже есть от расы или предыстории";
    b.onclick = () => { if (locked) return; if (D.skills.includes(k)) D.skills = D.skills.filter(x => x !== k); else if (D.skills.length < cls.skillCount) D.skills.push(k); renderCreate(); }; list.append(b); });
  body.append(list);
}
function stepLook(body) {
  head(body, "Шаг 6", "Имя, облик и характер", "Рассказчик будет обращаться к вам по имени и учитывать характер. По описанию внешности создаётся фото-портрет в стиле этого мира.");
  const f = document.createElement("div"); f.className = "look-grid";
  f.innerHTML = `<div><div class="field"><label for="f-name">Имя героя</label><input id="f-name" maxlength="28" placeholder="Например, Эйрин Тёрн" value="${esc(D.name)}"></div>
  <div class="field"><label>Как к вам обращаться</label><div class="seg" id="f-gender"><button type="button" data-v="m">Он</button><button type="button" data-v="f">Она</button></div></div>
  <div class="slider-row"><span>Честный</span><input type="range" id="f-sl1" min="0" max="100" value="${D.sl1}" aria-label="Честный или хитрый"><span>Хитрый</span></div>
  <div class="slider-row"><span>Осторожный</span><input type="range" id="f-sl2" min="0" max="100" value="${D.sl2}" aria-label="Осторожный или безрассудный"><span>Безрассудный</span></div>
  <div class="field" style="margin-top:14px"><label for="f-about">Пара фраз о себе</label><textarea id="f-about" maxlength="300" placeholder="Боится глубокой воды. Ищет брата, ушедшего в море.">${esc(D.about)}</textarea></div>
  <div class="field"><button class="btn" type="button" id="f-story">Сочинить историю героя (ИИ)</button><small id="f-story-st"></small></div></div>
  <div><div class="field"><label for="f-look">Внешность</label><textarea id="f-look" maxlength="400" placeholder="Высокая, коротко стриженные чёрные волосы, шрам через бровь, серые глаза, потёртый плащ с капюшоном" style="min-height:120px">${esc(D.lookDesc)}</textarea><small>Чем конкретнее, тем точнее портрет: возраст, волосы, лицо, одежда, приметы.</small></div>
  <div class="field"><button class="btn primary" type="button" id="f-photo">${D.img ? "Другой вариант" : "Создать фото-портрет"}</button><small id="f-photo-st">${esc(imgNote)}</small></div></div>`;
  body.append(f);
  const nm = f.querySelector("#f-name"); nm.oninput = () => { D.name = nm.value; document.getElementById("btn-next").disabled = !stepValid(5); document.getElementById("step-hint").textContent = stepValid(5) ? "Можно дальше" : STEP_HINTS[5]; renderHeroCard(); };
  f.querySelectorAll("#f-gender button").forEach(b => { b.setAttribute("aria-pressed", String(D.gender === b.dataset.v)); b.onclick = () => { D.gender = b.dataset.v; renderCreate(); }; });
  f.querySelector("#f-sl1").oninput = e => { D.sl1 = +e.target.value; }; f.querySelector("#f-sl2").oninput = e => { D.sl2 = +e.target.value; };
  f.querySelector("#f-about").oninput = e => { D.about = e.target.value; };
  f.querySelector("#f-look").oninput = e => { D.lookDesc = e.target.value; };
  f.querySelector("#f-story").onclick = () => writeBackstory(f.querySelector("#f-story"), f.querySelector("#f-story-st"));
  const pb = f.querySelector("#f-photo"); pb.disabled = !!D.gen; pb.onclick = () => genHeroPortrait(pb, f.querySelector("#f-photo-st"));
}
function stepMode(body) {
  head(body, "Шаг 7", "Каким будет рассказчик?", "Режим меняет и тон ИИ, и правила движка: что происходит при нуле HP и насколько мир прощает ошибки.");
  choiceGrid(body, Object.entries(MODES).map(([id, m]) => ({ id, name: m.name, sub: m.sub, list: [] })), D.mode, id => { D.mode = id; renderCreate(); });
  body.insertAdjacentHTML("beforeend", `<p class="lead" style="margin-top:20px"><b>${esc(D.world.name)}.</b> ${esc(D.world.public)}</p>`);
}
function personality(sl1, sl2) { const a = sl1 < 35 ? "честный" : sl1 > 65 ? "хитрый" : "себе на уме"; const b = sl2 < 35 ? "осторожный" : sl2 > 65 ? "безрассудный" : "рассудительный"; return `${a}, ${b}`; }
function templateStory() {
  const r = RACES[D.race]?.name || "Путник"; const c = CLASSES[D.cls]?.name?.toLowerCase() || "искатель"; const b = BACKGROUNDS[D.bg];
  return `${r}-${c}${b ? `, в прошлом ${b.name.toLowerCase()}` : ""}. ${b ? "Вы " + bgHook(D.bg) + "." : ""} Люди говорят, что вы ${personality(D.sl1, D.sl2)}. ${D.about ? D.about.trim() : "О прошлом вы рассказываете неохотно."}`;
}
async function writeBackstory(btn, st) {
  const sample = await getSample();
  if (!sample) { D.story = templateStory(); D.epithet = ""; st.textContent = "ИИ недоступен — история собрана по шаблону."; renderHeroCard(); return; }
  btn.disabled = true; st.textContent = "Рассказчик пишет…";
  try {
    const r = await sample.json(`Ты пишешь короткую предысторию героя для настольной ролевой игры. Пиши по-русски, 3 предложения, от второго лица («ты»), без клише про «избранного». Добавь прозвище из 2–3 слов.
Герой: ${D.name || "без имени"} (${D.gender === "f" ? "женщина" : "мужчина"}), раса ${RACES[D.race]?.name}, класс ${CLASSES[D.cls]?.name}, предыстория ${BACKGROUNDS[D.bg]?.name}: вы ${bgHook(D.bg)}. Характер: ${personality(D.sl1, D.sl2)}. От игрока: ${D.about || "—"}.
Мир «${D.world.name}»: ${D.world.public}
Свяжи историю с этим местом одним намёком. Ответь только JSON: {"epithet": "…", "story": "…"}`, { modelTier: "quick", cache: false });
    D.story = str(r.story, 600); D.epithet = str(r.epithet, 40); st.textContent = "Готово. Можно сочинить заново.";
  } catch (e) { D.story = templateStory(); st.textContent = e.code === "not_granted" ? "Доступ к ИИ не разрешён — история по шаблону." : "Не получилось — история собрана по шаблону."; }
  btn.disabled = false; renderHeroCard();
}
function renderHeroCard() {
  const el = document.getElementById("hero-card"); const sc = draftScores(); const cls = D.cls ? CLASSES[D.cls] : null; el.style.setProperty("--cls", cls ? cls.color : "var(--lantern)");
  const hp = D.cls && D.race ? maxHP(D.cls, D.race, sc) : "—"; const ac = D.cls ? calcAC(D.cls, sc) : "—";
  el.innerHTML = `<div class="inner"><div class="art">${heroPh({ cls: D.cls, race: D.race, name: D.name, img: D.img, gen: D.gen })}<span class="lvl">Уровень 1</span></div>
  <div class="body"><div><div class="nm">${esc(D.name.trim() || "Безымянный")}</div>${D.epithet ? `<div class="ep">${esc(D.epithet)}</div>` : ""}<div class="sub">${D.race ? RACES[D.race].name : "Раса не выбрана"} · ${cls ? cls.name : "класс не выбран"}${D.bg ? " · " + BACKGROUNDS[D.bg].name : ""}</div></div>
  <div class="vitals"><div>HP <b>${hp}</b></div><div>КД <b>${ac}</b></div><div>Иниц. <b>${fmt(mod(sc.dex))}</b></div></div>
  <div class="mini-stats">${ABIL.map(a => `<div><b>${fmt(mod(sc[a]))}</b><small>${ABIL_RU[a]} ${sc[a]}</small></div>`).join("")}</div>
  ${D.skills.length || D.bg || D.race ? `<div class="sub">Навыки: ${draftSkills().map(k => SKILLS[k][0]).join(", ") || "—"}</div>` : ""}
  <p class="story">${esc(D.story || (D.race && D.cls ? templateStory() : "Выберите расу и класс — карточка соберётся сама."))}</p></div></div>`;
}
function finishCreation() {
  const sc = draftScores(); const cls = CLASSES[D.cls]; const hp = maxHP(D.cls, D.race, sc);
  const slots = {}; Object.entries(slotsFor(D.cls, 1)).forEach(([l, n]) => slots[l] = [n, n]);
  const wd = JSON.parse(JSON.stringify(D.world)); setWorld(wd);
  const char = { name: D.name.trim(), gender: D.gender, race: D.race, cls: D.cls, bg: D.bg, level: 1, xp: 0, scores: sc, skills: draftSkills(),
    hp, maxHp: hp, ac: calcAC(D.cls, sc), hitDice: 1, slots, spells: cls.spells || [], weapons: cls.weapons.slice(), secondWind: D.cls === "fighter",
    items: [...cls.items.map(n => ({ name: n })), { name: "Зелье лечения", potion: true }, { name: "Факел" }, { name: "Верёвка, 15 м" }],
    gold: 10, epithet: D.epithet, story: D.story || templateStory(), persona: personality(D.sl1, D.sl2), about: D.about, look: D.lookDesc, img: D.img, hook: bgHook(D.bg, wd) };
  Object.keys(wd.npcs).forEach(id => { const u = imgCache[wd.id + ":" + id]; if (u) wd.npcs[id].img = u; });
  const enemies = {}; Object.entries(ENEMIES).forEach(([id, E]) => enemies[id] = { hp: E.hp, alive: true, asleep: false });
  const npcs = {}; Object.keys(NPCS).forEach(id => npcs[id] = { att: 0, mem: [] });
  S = { v: 2, id: uid(), wd, char, mode: D.mode, secondChance: D.mode === "sandbox", dying: null, dead: false, log: [], feed: [], turn: 0, summary: "",
    world: { loc: wd.start, visited: [wd.start], seen: [], enemies, npcs, combat: false, facts: [], quest: wd.quest, flags: {} }, suggestions: [] };
  reveal(POIS[wd.start].x, POIS[wd.start].y, 3);
  save(); startGame(true);
}

/* =========================================================================
   GAME UI
   ========================================================================= */
let sheetTab = "act";
function startGame(fresh) {
  showScreen("screen-game"); renderAll(); renderFeed(); queueWorldPortraits(S.wd);
  if (fresh) takeTurn("[НАЧАЛО КАМПАНИИ]", { checks: [], intro: true });
  else { scrollFeed(); if (S.dying) renderDeath(); }
  initSample();
}
function renderAll() { renderTop(); renderSheet(); renderWorld(); renderSugg(); }
function renderTop() { renderScene(); document.getElementById("pill-mode").textContent = "Режим: " + MODES[S.mode].name; }
function renderScene() {
  if (!S) return; const loc = POIS[S.world.loc]; const el = document.getElementById("scene");
  el.innerHTML = `<div class="scene-inner"><div style="min-width:0;flex:1"><div class="eyebrow">${esc(WD.name)}${S.world.combat ? " · бой" : ""}</div><h2>${esc(loc.name)}</h2><p>${esc(loc.short || "")}</p></div><div class="people" id="scene-people"></div></div>`;
  const pp = el.querySelector("#scene-people");
  loc.npcs.filter(id => NPCS[id]).forEach(id => { const b = document.createElement("button"); b.type = "button"; b.className = "person"; b.title = `Обратиться: ${NPCS[id].name}`;
    b.innerHTML = `${npcPh(id)}<small>${esc(NPCS[id].name)}</small>`; b.onclick = () => { const inp = document.getElementById("act-input"); inp.value = `${NPCS[id].name}, `; inp.focus(); }; pp.append(b); });
}
function renderSheet() {
  const c = C(); const cls = CLASSES[c.cls]; const el = document.getElementById("sheet"); el.style.setProperty("--cls", cls.color);
  const hpP = c.hp / c.maxHp; const hpCol = hpP > .5 ? "var(--kelp)" : hpP > .25 ? "var(--lantern)" : "var(--ember)"; const canLevel = c.level === 1 && c.xp >= 300;
  let html = `<div class="who">${heroPh(c)}<div><div class="nm">${esc(c.name)}</div>${c.epithet ? `<div class="sub" style="color:var(--lantern);font-style:italic">${esc(c.epithet)}</div>` : ""}<div class="sub">${RACES[c.race].name} · ${cls.name} · ур. ${c.level}</div></div></div>
  ${canLevel ? `<button class="levelup" type="button" id="btn-lvl">Новый уровень! Повысить до 2-го</button>` : ""}
  <div class="hp-block"><div class="row"><span class="eyebrow">Хиты</span><span class="hpn">${c.hp}<small> / ${c.maxHp}</small></span></div><div class="bar hp-bar"><i style="width:${hpP * 100}%;background:${hpCol}"></i></div>
  <div class="bar" style="height:4px;margin-top:4px"><i style="width:${Math.min(100, c.xp / (c.level === 1 ? 3 : 9))}%;background:var(--lantern)"></i></div><div class="xp-row"><span>Опыт ${c.xp} / ${c.level === 1 ? 300 : 900}</span><span>${c.gold} зм</span></div></div>
  <div class="vit"><div><b>${c.ac}</b><small>КД</small></div><div><b>${fmt(mod(c.scores.dex))}</b><small>ИНИЦ.</small></div><div><b>${RACES[c.race].speed}</b><small>СКОР.</small></div><div><b>${fmt(prof(c.level))}</b><small>МАСТ.</small></div></div>
  <div class="abil6">${ABIL.map(a => `<div title="${ABIL_FULL[a]}${cls.saves.includes(a) ? " · владение спасброском" : ""}">${cls.saves.includes(a) ? '<span class="sv"></span>' : ""}<b>${fmt(mod(c.scores[a]))}</b><small>${ABIL_RU[a]}</small><span class="sc" style="display:block">${c.scores[a]}</span></div>`).join("")}</div>`;
  if (cls.spells) html += `<div class="slots"><span class="eyebrow">Ячейки заклинаний</span>${Object.entries(c.slots).map(([l, [mx, cur]]) => `<div class="slot-row"><span>${l} круг</span><span class="pips">${Array.from({ length: mx }, (_, i) => `<span class="pip ${i < cur ? "full" : ""}"></span>`).join("")}</span><span class="num">${cur}/${mx}</span></div>`).join("")}<div class="slot-row"><span>Заговоры</span><span>без ограничений</span></div></div>`;
  html += `<div class="tabs" role="tablist">${[["act", "Действия"], ["skills", "Навыки"], ["inv", "Инвентарь"]].map(([k, t]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${sheetTab === k}">${t}</button>`).join("")}</div><div class="tab-body" id="tab-body"></div>`;
  el.innerHTML = html;
  el.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { sheetTab = b.dataset.tab; renderSheet(); });
  if (canLevel) el.querySelector("#btn-lvl").onclick = levelUp;
  const tb = el.querySelector("#tab-body"); const foes = aliveEnemiesHere(); const tgt = foes[0];
  if (sheetTab === "act") {
    c.weapons.forEach(wid => { const a = weaponAtk(wid); tb.append(actBtn(`Атака: ${a.w.name}`, `${fmt(a.bonus)} к попаданию · ${a.w.dice}${fmt(a.dmgMod)}`, tgt ? `→ ${ENEMIES[tgt].name}` : "нет цели", !tgt || busy,
      () => takeTurn(`Атакую: ${ENEMIES[tgt].name} (${a.w.name.toLowerCase()})`, { checks: [{ kind: "attack", target: tgt, weapon: wid, reason: "Атака оружием" }] }))); });
    (c.spells || []).forEach(sid => { const sp = SPELLS[sid]; const self = sp.kind === "heal"; const lvlOk = !sp.lvl || (c.slots[sp.lvl] && c.slots[sp.lvl][1] > 0); const needT = !self && sp.kind !== "sleep";
      tb.append(actBtn(sp.name, sp.desc, sp.lvl ? `${sp.lvl} круг` : "заговор", busy || !lvlOk || (needT && !tgt) || (sp.kind === "sleep" && !foes.length),
        () => takeTurn(`Применяю «${sp.name}»${needT ? ": " + ENEMIES[tgt].name : self ? " на себя" : ""}`, { checks: [{ kind: "spell", spell: sid, target: needT ? tgt : null, reason: sp.desc }] }))); });
    if (c.cls === "fighter") tb.append(actBtn("Второе дыхание", "Восстановить 1d10 + уровень HP", c.secondWind ? "1 раз" : "потрачено", busy || !c.secondWind || c.hp >= c.maxHp, () => {
      const d = rollDice("1d10"); const got = healHero(d.total + c.level); c.secondWind = false; pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · Второе дыхание (${d.text} +${c.level})` }] }); after(); }));
    tb.append(actBtn("Короткий отдых", "Потратить кость хитов: 1d" + cls.hd + fmt(mod(c.scores.con)), `костей: ${c.hitDice}`, busy || S.world.combat || c.hitDice < 1 || c.hp >= c.maxHp, shortRest));
    tb.append(actBtn("Долгий отдых", POIS[S.world.loc].rest ? "Полное восстановление" : "Только в безопасном месте для ночлега", "8 часов", busy || S.world.combat || !POIS[S.world.loc].rest, longRest));
  } else if (sheetTab === "skills") {
    Object.keys(SKILLS).sort((a, b) => SKILLS[a][0].localeCompare(SKILLS[b][0], "ru")).forEach(k => tb.insertAdjacentHTML("beforeend", `<div class="sk ${c.skills.includes(k) ? "pro" : ""}"><span>${SKILLS[k][0]} <small style="color:var(--dim)">${ABIL_RU[SKILLS[k][1]]}</small></span><span class="b">${fmt(skillBonus(k))}</span></div>`));
    tb.insertAdjacentHTML("beforeend", `<div class="sk"><span>Пассивная Внимательность</span><span class="b">${10 + skillBonus("perception")}</span></div>`);
  } else {
    c.items.forEach((it, i) => {
      if (it.potion) tb.append(actBtn(it.name, "Восстанавливает 2d4+2 HP", "выпить", busy || c.hp >= c.maxHp, () => { const d = rollDice("2d4+2"); const got = healHero(d.total); c.items.splice(i, 1); pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · ${it.name} (${d.text})` }] }); after(); }));
      else tb.insertAdjacentHTML("beforeend", `<div class="sk" title="${esc(it.desc || "")}"><span>${esc(it.name)}</span><span class="b" style="color:var(--dim)">${it.desc ? esc(it.desc).slice(0, 26) : ""}</span></div>`);
    });
    tb.insertAdjacentHTML("beforeend", `<p class="empty" style="margin-top:8px">${esc(c.story)}</p>`);
  }
}
function actBtn(t, d, k, dis, fn) { const b = document.createElement("button"); b.type = "button"; b.className = "act"; b.disabled = !!dis; b.innerHTML = `<span><span class="t">${esc(t)}</span><span class="d">${esc(d)}</span></span><span class="k">${esc(k)}</span>`; b.onclick = fn; return b; }
function attLabel(v) { return v >= 25 ? ["доверяет", "pos"] : v >= 8 ? ["дружелюбно", "pos"] : v <= -25 ? ["враждебно", "neg"] : v <= -8 ? ["настороженно", "neg"] : ["нейтрально", "neu"]; }
function renderWorld() {
  const el = document.getElementById("world"); const loc = POIS[S.world.loc]; const sel = mapSel && mapSel !== S.world.loc ? POIS[mapSel] : null;
  el.innerHTML = `<div class="mapwrap"><canvas id="map" aria-label="Карта: ${esc(WD.name)}"></canvas>${sel ? `<div class="map-tip"><div class="t"><b>${esc(sel.name)}</b><small>${esc(sel.short)}</small></div><button class="btn small primary" type="button" id="go-sel" ${busy || S.world.combat ? "disabled" : ""}>Идти</button></div>` : ""}</div>
  <div class="card"><div class="eyebrow">Вы здесь</div><h3>${esc(loc.name)}</h3><p>${esc(loc.desc)}</p></div>
  ${S.world.combat ? `<div><div class="section-t"><span class="eyebrow" style="color:var(--ember)">Бой</span></div><div style="display:flex;flex-direction:column;gap:6px">${Object.keys(ENEMIES).filter(id => ENEMIES[id].loc === S.world.loc).map(id => { const e = S.world.enemies[id]; const E = ENEMIES[id]; return `<div class="foe ${e.alive ? "" : "dead"}"><div class="row"><b>${esc(E.name)}</b><span>КД ${E.ac} · ${enemyStatus(id)}</span></div><div class="bar" style="height:5px"><i style="width:${e.hp / E.hp * 100}%;background:var(--ember)"></i></div></div>`; }).join("")}</div></div>` : ""}
  <div><div class="section-t"><span class="eyebrow">Здесь</span></div><div id="npc-list"></div></div>
  <div class="card" style="background:transparent"><div class="eyebrow">Задание</div><p style="color:var(--foam);margin-top:4px">${esc(S.world.quest)}</p></div>
  <div><div class="section-t"><span class="eyebrow">Летопись · память рассказчика</span><span class="num" style="color:var(--dim);font-size:11px">${S.world.facts.length} фактов</span></div>
  ${imgNote ? `<p class="archiving" style="color:var(--mist)">${esc(imgNote)}</p>` : ""}${S.summary ? `<p class="summary-box">${esc(S.summary)}</p>` : ""}${archiving ? `<p class="archiving">Архивариус сжимает старые записи…</p>` : ""}
  ${S.world.facts.length ? `<ol class="chron" style="margin-top:8px">${S.world.facts.slice(-8).map(f => `<li>${esc(f)}</li>`).join("")}</ol>` : (S.summary ? "" : `<p class="empty">Здесь появятся важные факты, которые рассказчик запомнит.</p>`)}</div>`;
  const list = el.querySelector("#npc-list");
  if (!loc.npcs.length) list.innerHTML = `<p class="empty">Ни души. Только ветер.</p>`;
  loc.npcs.forEach(id => { const n = NPCS[id]; if (!n) return; const [lab, cl] = attLabel(S.world.npcs[id]?.att || 0);
    const b = document.createElement("button"); b.type = "button"; b.className = "npc-row";
    b.innerHTML = `${npcPh(id)}<span class="t"><b>${esc(n.name)}</b><small>${esc(n.role)}</small></span><span class="att ${cl}">${lab}</span>`;
    b.onclick = () => { const inp = document.getElementById("act-input"); inp.value = `${n.name}, `; inp.focus(); showTab("story"); };
    list.append(b); });
  el.querySelector("#map").onclick = mapClick;
  const go = el.querySelector("#go-sel"); if (go) go.onclick = () => { const p = mapSel; mapSel = null; takeTurn(`Иду: ${POIS[p].name}`, { checks: [], move_to: p }); };
  requestAnimationFrame(drawMap);
}
function renderSugg() { const s = document.getElementById("sugg"); s.innerHTML = ""; (S.suggestions || []).slice(0, 3).forEach(t => { const b = document.createElement("button"); b.type = "button"; b.textContent = t; b.disabled = busy; b.onclick = () => { if (!busy) takeTurn(t); }; s.append(b); }); }

/* ---------- feed ---------- */
function pushFeed(e) { S.feed.push(e); if (S.feed.length > 160) S.feed.splice(0, S.feed.length - 160); renderEntry(e, true); scrollFeed(); return e; }
function scrollFeed() { const f = document.getElementById("feed"); requestAnimationFrame(() => { f.scrollTop = f.scrollHeight; }); }
function renderFeed() { document.getElementById("feed-inner").innerHTML = ""; S.feed.forEach(e => renderEntry(e, false)); }
function narrHTML(text) { const t = esc(text).replace(/«([^»]{1,400})»/g, "<q>$1</q>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\*([^*]+)\*/g, "<i>$1</i>"); return t.split(/\n+/).filter(p => p.trim()).map(p => `<p>${p}</p>`).join(""); }
function speakerHTML(id) { const n = NPCS[id]; return n ? `<div class="speaker">${npcPh(id)}<span><b>${esc(n.name)}</b><small>${esc(n.role)}</small></span></div>` : ""; }
function renderEntry(e, fresh) {
  const fi = document.getElementById("feed-inner"); const d = document.createElement("div"); Object.defineProperty(e, "_el", { value: d, writable: true, configurable: true, enumerable: false });
  if (e.t === "narr") { d.className = "e-narr"; d.innerHTML = (e.speaker ? speakerHTML(e.speaker) : "") + `<div class="tx ${e.first ? "e-first" : ""}">${narrHTML(e.text)}${e.streaming ? '<span class="caret"></span>' : ""}</div>`; }
  else if (e.t === "player") { d.className = "e-player"; d.innerHTML = `<div class="who-s">${esc(C().name)}</div>${esc(e.text)}`; }
  else if (e.t === "sys") { d.className = "e-sys"; d.innerHTML = e.html; }
  else if (e.t === "roll") {
    const r = e.r; const cls = r.enemyRoll ? "enemy " + (r.ok ? "fail" : "ok") : r.crit ? "crit" : r.ok ? "ok" : "fail";
    const v = r.skip ? "—" : r.enemyRoll ? (r.kind === "enemy" ? (r.crit ? "Крит по вам" : r.ok ? "Попадание" : "Промах") : (r.ok ? "Провал цели" : "Цель устояла")) : r.noslot ? "Нет ячеек" : r.crit ? "Критический успех" : r.fumble ? "Провал (1)" : r.ok ? (r.kind === "attack" || r.kind === "spell" ? "Попадание" : "Успех") : (r.kind === "attack" || r.kind === "spell" ? "Промах" : "Провал");
    d.className = "e-roll " + cls;
    d.innerHTML = `<div class="d20 ${fresh ? "spin" : ""}" style="color:${r.crit ? "var(--lantern)" : r.enemyRoll ? "var(--ember)" : "var(--mist)"}">${D20SVG}<span>${r.nat || "✦"}</span></div><div class="info"><div class="ttl">${esc(r.title)}</div>${r.reason ? `<div class="why">${esc(r.reason)}</div>` : ""}<div class="formula">${esc(r.formula || "")}</div></div><div class="verdict">${v}</div>`;
  } else if (e.t === "chips") { d.className = "chips"; d.innerHTML = e.items.map(i => `<span class="chip ${i.c}">${esc(i.x)}</span>`).join(""); }
  fi.append(d);
}
function updateNarr(e) {
  if (!e._el) return; const tx = e._el.querySelector(".tx");
  if (e.speaker && NPCS[e.speaker] && !e._el.querySelector(".speaker")) e._el.insertAdjacentHTML("afterbegin", speakerHTML(e.speaker));
  tx.innerHTML = narrHTML(e.text) + (e.streaming ? '<span class="caret"></span>' : "");
  const f = document.getElementById("feed"); if (f.scrollHeight - f.scrollTop - f.clientHeight < 220) f.scrollTop = f.scrollHeight;
}

/* =========================================================================
   NARRATOR
   ========================================================================= */
let samplePromise = null, aiOff = false, busy = false, ctl = null, archiving = false;
function getSample() {
  if (aiOff) return Promise.resolve(null);
  if (!samplePromise) samplePromise = window.claude && typeof window.claude.use === "function" ? window.claude.use("sample").catch(() => null) : Promise.resolve(null);
  return samplePromise;
}
async function initSample() { const s = await getSample(); setAIPill(!!s && !aiOff); }
function setAIPill(on) { const p = document.getElementById("pill-ai"); p.classList.toggle("on", on); p.classList.toggle("off", !on); document.getElementById("pill-ai-t").textContent = on ? "Рассказчик: ИИ" : "Рассказчик: офлайн"; }
function aiFail(e) {
  const hard = ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"];
  if (hard.includes(e?.code)) { aiOff = true; setAIPill(false); return "ИИ-рассказчик недоступен в этом просмотре, дальше работает простой офлайн-рассказчик."; }
  if (e?.code === "rate_limited") return "ИИ временно перегружен. Этот ход рассказан офлайн, попробуйте следующий чуть позже.";
  return "Связь с ИИ прервалась. Этот ход рассказан офлайн.";
}
function charBrief() {
  const c = C(); return `${c.name} (${c.gender === "f" ? "она" : "он"}), ${RACES[c.race].name}, ${CLASSES[c.cls].name} ${c.level} ур., предыстория: ${BACKGROUNDS[c.bg].name} — вы ${c.hook || bgHook(c.bg)}. Характер: ${c.persona}. ${c.about ? "О себе: " + c.about : ""} ${c.look ? "Внешность: " + c.look + "." : ""} HP ${c.hp}/${c.maxHp}, КД ${c.ac}. Навыки: ${c.skills.map(k => SKILLS[k][0]).join(", ")}. Предметы: ${c.items.map(i => i.name).join(", ")}, ${c.gold} зм.${c.spells.length ? " Заклинания: " + c.spells.map(s => SPELLS[s].name).join(", ") + ". Ячейки 1 круга: " + (c.slots[1] ? c.slots[1][1] : 0) + "." : ""}`;
}
function sceneBrief() {
  const loc = POIS[S.world.loc]; const L = S.world.loc;
  const npcs = loc.npcs.filter(id => NPCS[id]).map(id => { const n = NPCS[id]; const st = S.world.npcs[id] || { att: 0, mem: [] }; return `- [${id}] ${n.name}, ${n.role}; внешность: ${n.look}; характер: ${n.persona}; тайна (не выдавать сразу): ${n.secret}; отношение к герою: ${st.att} (${attLabel(st.att)[0]}); помнит: ${st.mem.slice(-4).join("; ") || "ничего"}`; }).join("\n");
  const foes = Object.keys(ENEMIES).filter(id => ENEMIES[id].loc === L).map(id => `- [${id}] ${ENEMIES[id].name}: ${enemyStatus(id)}`).join("\n");
  const pois = Object.entries(POIS).map(([id, p]) => `${id} = ${p.name}`).join("; ");
  return `ЛОКАЦИЯ: ${loc.name} [${L}] — ${loc.desc}
Улика здесь (выдать при успешном поиске): ${loc.clue || "—"}
НПС здесь:
${npcs || "- никого"}
${foes ? "ВРАГИ в этой локации (нападают, когда герой их обнаружил или пришёл в логово):\n" + foes : ""}
БОЙ: ${S.world.combat ? "идёт" : "нет"}
ТОЧКИ НА КАРТЕ: ${pois}`;
}
function recentLog(n) { return S.log.slice(-n).map(l => l.who === "p" ? `Игрок: ${l.text}` : `Рассказчик: ${l.text.slice(0, 500)}`).join("\n"); }
async function adjudicate(text) {
  const sample = await getSample(); if (!sample) return offlineAdjudicate(text);
  const prompt = `Ты — арбитр правил 5e в текстовой ролевой игре. Ты НЕ пишешь историю, только решаешь, какие броски нужны для действия игрока. Броски сделает программа.
${sceneBrief()}
ГЕРОЙ: ${charBrief()}
Недавнее:
${recentLog(6)}

ДЕЙСТВИЕ ИГРОКА: «${text}»

Правила:
- Простые и безопасные действия (поговорить, войти, оглядеться без спешки, купить) — без бросков.
- Проверка нужна, если исход неочевиден и у провала есть последствия. КС: 10 легко, 13 средне, 15 трудно, 18 очень трудно.
- Не больше 2 проверок. Ключи навыков: ${Object.keys(SKILLS).join(", ")}. Характеристики: str, dex, con, int, wis, cha.
- Атака оружием только по врагу из списка ВРАГИ: {"kind":"attack","target":"id","weapon":"${C().weapons[0]}"}. Оружие героя: ${C().weapons.join(", ")}.
- Заклинание: {"kind":"spell","spell":"id","target":"id врага или null"}. Заклинания героя: ${C().spells.join(", ") || "нет"}.
- adv: 1 если есть явное преимущество (враг спит, засада, отличная подготовка), -1 если помеха, иначе 0.
- move_to: id точки на карте, если герой явно идёт в другое место, иначе null. talk_to: id НПС, к которому обращаются, иначе null.
Ответь только JSON: {"checks":[{"kind":"skill","skill":"perception","dc":13,"adv":0,"reason":"коротко зачем"}],"move_to":null,"talk_to":null}`;
  try { return await sample.json(prompt, { modelTier: "quick", cache: false }); }
  catch (e) { pushFeed({ t: "sys", html: esc(aiFail(e)) }); return offlineAdjudicate(text); }
}
function validatePlan(plan) {
  const out = { checks: [], move_to: null, talk_to: null, notes: [] }; if (!plan || typeof plan !== "object") return out;
  if (plan.move_to && POIS[plan.move_to] && plan.move_to !== S.world.loc) out.move_to = plan.move_to;
  if (plan.talk_to && NPCS[plan.talk_to]) out.talk_to = plan.talk_to;
  (Array.isArray(plan.checks) ? plan.checks : []).slice(0, 2).forEach(ch => {
    const adv = clamp(Number(ch.adv) || 0, -1, 1); const reason = str(ch.reason, 120);
    if (ch.kind === "skill" && SKILLS[ch.skill]) out.checks.push({ kind: "skill", skill: ch.skill, dc: clamp(Math.round(Number(ch.dc) || 12), 5, 30), adv, reason });
    else if (ch.kind === "save" && ABIL.includes(ch.ability)) out.checks.push({ kind: "save", ability: ch.ability, dc: clamp(Math.round(Number(ch.dc) || 12), 5, 30), adv, reason });
    else if (ch.kind === "attack" && enemyHere(ch.target)) out.checks.push({ kind: "attack", target: ch.target, weapon: C().weapons.includes(ch.weapon) ? ch.weapon : C().weapons[0], adv, reason });
    else if (ch.kind === "spell" && C().spells.includes(ch.spell)) {
      const sp = SPELLS[ch.spell]; const needT = sp.kind !== "heal" && sp.kind !== "sleep";
      if (needT && !enemyHere(ch.target)) { out.notes.push(`Для «${sp.name}» нет подходящей цели.`); return; }
      if (sp.kind === "sleep" && !aliveEnemiesHere().length) { out.notes.push("Усыплять некого."); return; }
      out.checks.push({ kind: "spell", spell: ch.spell, target: needT ? ch.target : null, reason });
    } else if (ch.kind) out.notes.push("Движок отклонил проверку, которой нет в правилах.");
  });
  return out;
}
function offlineAdjudicate(text) {
  const t = text.toLowerCase(); const plan = { checks: [], move_to: null, talk_to: null };
  if (/(ид[уё]|пойти|отправ|направля|бегу|возвращ)/.test(t)) {
    for (const [id, p] of Object.entries(POIS)) { const words = p.name.toLowerCase().replace(/[«»"]/g, "").split(/\s+/).filter(w => w.length > 3); if (words.some(w => t.includes(w.slice(0, Math.max(4, w.length - 2))))) { plan.move_to = id; break; } }
  }
  const foe = aliveEnemiesHere()[0];
  if (/(атаку|бью|удар|руб|стрел|напада)/.test(t) && foe) plan.checks.push({ kind: "attack", target: foe, weapon: C().weapons[0], reason: "Атака" });
  else if (/(осматр|ищу|обыск|исслед|изуча|улик)/.test(t)) plan.checks.push({ kind: "skill", skill: "investigation", dc: 12, reason: "Поиск улик" });
  else if (/(прислуш|огляд|высматр|замеча)/.test(t)) plan.checks.push({ kind: "skill", skill: "perception", dc: 12, reason: "Внимательность" });
  else if (/(крад|тихо|скрыт|прячу|незамет)/.test(t)) plan.checks.push({ kind: "skill", skill: "stealth", dc: 13, reason: "Скрытность" });
  else if (/(убежд|уговар|прошу|договор)/.test(t)) plan.checks.push({ kind: "skill", skill: "persuasion", dc: 13, reason: "Убеждение" });
  else if (/(вру|обман|лгу)/.test(t)) plan.checks.push({ kind: "skill", skill: "deception", dc: 13, reason: "Обман" });
  else if (/(угрож|запуг)/.test(t)) plan.checks.push({ kind: "skill", skill: "intimidation", dc: 13, reason: "Запугивание" });
  for (const id of POIS[S.world.loc].npcs) if (NPCS[id] && t.includes(NPCS[id].name.toLowerCase().split(" ").pop().slice(0, 4))) plan.talk_to = id;
  return plan;
}
function waitRoll(ch) {
  return new Promise(res => {
    const slot = document.getElementById("roll-slot");
    const label = ch.kind === "skill" ? `${SKILLS[ch.skill][0]} · КС ${ch.dc}` : ch.kind === "save" ? `Спасбросок ${ABIL_FULL[ch.ability]} · КС ${ch.dc}` : ch.kind === "attack" ? `Атака: ${WEAPONS[ch.weapon].name} → ${ENEMIES[ch.target].name}` : `Заклинание: ${SPELLS[ch.spell].name}`;
    const bonus = ch.kind === "skill" ? skillBonus(ch.skill) : ch.kind === "save" ? saveBonus(ch.ability) : ch.kind === "attack" ? weaponAtk(ch.weapon).bonus : spellAtk();
    slot.innerHTML = `<div class="roll-cta"><div class="d20" style="color:var(--lantern)">${D20SVG}<span>20</span></div><div class="txt"><b>${esc(label)}</b><small>${esc(ch.reason || "Нужна проверка")} · ваш бонус ${fmt(bonus)}${ch.adv > 0 ? " · с преимуществом" : ch.adv < 0 ? " · с помехой" : ""}</small></div><button class="btn primary" type="button" id="btn-roll">Бросить <span class="kbd">R</span></button></div>`;
    const go = () => { document.removeEventListener("keydown", key); slot.innerHTML = ""; res(); };
    const key = ev => { if (["r", "R", "к", "К"].includes(ev.key) && document.activeElement?.id !== "act-input") { ev.preventDefault(); go(); } };
    document.addEventListener("keydown", key); slot.querySelector("#btn-roll").onclick = go; slot.querySelector("#btn-roll").focus();
  });
}
async function takeTurn(text, preset) {
  if (busy || S.dead) return; if (S.dying) { pushFeed({ t: "sys", html: "Сначала спасброски от смерти." }); return; }
  busy = true; setBusy(true); S.turnSneak = false; S.pendingXP = 0;
  const intro = preset && preset.intro; if (!intro) { pushFeed({ t: "player", text }); S.log.push({ who: "p", text }); }
  let thinking = null;
  try {
    let plan;
    if (preset) plan = validatePlan(preset);
    else { thinking = showThinking("Рассказчик обдумывает последствия"); plan = validatePlan(await adjudicate(text)); thinking.remove(); thinking = null; }
    plan.notes.forEach(n => pushFeed({ t: "sys", html: esc(n) }));
    const results = [];
    if (plan.move_to) {
      if (S.world.combat) { pushFeed({ t: "sys", html: "В бою не уйти просто так: сначала разберитесь с врагами." }); plan.move_to = null; }
      else { moveTo(plan.move_to); results.push({ kind: "move", title: `Перемещение: ${POIS[plan.move_to].name}` }); }
    }
    for (const ch of plan.checks) {
      if (ch.kind === "skill" || ch.kind === "save" || ch.kind === "attack" || (ch.kind === "spell" && SPELLS[ch.spell].kind === "attack")) await waitRoll(ch);
      const r = resolveCheck(ch); if (!r) continue; results.push(r); pushFeed({ t: "roll", r });
      if (r.heal) pushFeed({ t: "chips", items: [{ c: "heal", x: `+${r.heal} HP` }] });
      if (r.dmg) pushFeed({ t: "chips", items: [{ c: "dmg", x: `−${r.dmg} HP · ${ENEMIES[r.target]?.name || "цель"} (${r.enemyAfter})` }] });
      await pause(250);
    }
    if (S.world.combat && !intro) { for (const r of enemyTurn()) { results.push(r); pushFeed({ t: "roll", r }); if (r.dmg) pushFeed({ t: "chips", items: [{ c: "dmg", x: `−${r.dmg} HP вам` }] }); await pause(200); } }
    let combatEnded = false;
    if (S.world.combat && !aliveEnemiesHere().length) { S.world.combat = false; combatEnded = true; results.push({ kind: "combat_end", title: "Все враги повержены" }); }
    renderSheet(); renderWorld(); renderTop();
    const eff = await narrate(text, plan, results, intro);
    applyEffects(eff, combatEnded);
  } catch (err) { thinking?.remove(); pushFeed({ t: "sys", html: "Что-то пошло не так в этом ходе. Попробуйте сформулировать действие иначе." }); console.error(err); }
  S.turn++; busy = false; setBusy(false); checkDeath(); after(); maybeArchive();
}
function after() { renderAll(); save(); }
function pause(ms) { return new Promise(r => setTimeout(r, ms)); }
function setBusy(b) { document.getElementById("btn-send").disabled = b; document.getElementById("btn-home").disabled = b; document.getElementById("btn-stop").hidden = !b || !ctl; renderSheet(); renderSugg(); const go = document.getElementById("go-sel"); if (go) go.disabled = b || S.world.combat; }
function showThinking(t) { const fi = document.getElementById("feed-inner"); const d = document.createElement("div"); d.className = "thinking"; d.innerHTML = `<span class="dots"><i></i><i></i><i></i></span><span>${esc(t)}…</span>`; fi.append(d); scrollFeed(); return d; }
function moveTo(id) { mapSel = null; S.world.loc = id; if (!S.world.visited.includes(id)) S.world.visited.push(id); const p = POIS[id]; reveal(p.x, p.y, (p.enemies || []).length ? 2 : 3); pushFeed({ t: "sys", html: `Вы приходите: <b>${esc(p.name)}</b>` }); renderWorld(); renderTop(); }
function resultsBrief(results) {
  if (!results.length) return "Бросков не было.";
  return results.map(r => {
    if (r.kind === "move") return `• ${r.title}.`; if (r.kind === "combat_end") return "• Все враги в локации повержены, бой окончен.";
    if (r.kind === "enemy") return `• ${r.title}: ${r.skip ? "спит" : r.ok ? (r.crit ? "критическое попадание" : "попадание") + ", герой ранен" : "промах"}.`;
    const what = r.ok ? (r.crit ? "КРИТИЧЕСКИЙ УСПЕХ" : "УСПЕХ") : (r.fumble ? "ПРОВАЛ (выпала 1)" : "ПРОВАЛ");
    return `• ${r.title}${r.reason ? " (" + r.reason + ")" : ""}: ${r.noslot ? "не хватило ячеек" : what}${r.enemyAfter ? `; цель теперь: ${r.enemyAfter}` : ""}${r.heal ? "; герой исцелён" : ""}.`;
  }).join("\n");
}
async function narrate(text, plan, results, intro) {
  const e = pushFeed({ t: "narr", text: "", streaming: true, speaker: plan.talk_to && POIS[S.world.loc].npcs.includes(plan.talk_to) ? plan.talk_to : null, first: intro });
  const sample = await getSample();
  if (!sample) { const r = offlineNarrate(text, plan, results, intro); e.text = r.text; e.streaming = false; if (r.eff.speaker) e.speaker = r.eff.speaker; updateNarr(e); S.log.push({ who: "n", text: r.text }); return r.eff; }
  const th = showThinking(intro ? "Рассказчик открывает книгу" : "Рассказчик пишет"); e._el.hidden = true;
  const prompt = `Ты — мастер (рассказчик) настольной ролевой игры по правилам 5e. Пиши по-русски, живо и конкретно, от второго лица («ты»), обращаясь к герою. ${MODES[S.mode].prompt}

МИР «${WD.name}»: ${WD.public}
ТАЙНА (знает только мастер, раскрывать постепенно через заслуженные улики): ${WD.secret}
Опорные точки: ${(WD.beats || []).join(" | ")}. Хорошие концовки: ${(WD.endings || []).join(" | ")}.
ГЕРОЙ: ${charBrief()}
${sceneBrief()}
ЗАДАНИЕ: ${S.world.quest}
КРАТКО О ПРОШЛОМ (летопись архивариуса): ${S.summary || "кампания только началась"}
УСТАНОВЛЕННЫЕ ФАКТЫ (не противоречь): ${S.world.facts.slice(-14).join(" | ") || "пока ничего"}
НЕДАВНИЕ СОБЫТИЯ:
${recentLog(10) || "—"}

${intro ? `НАЧАЛО КАМПАНИИ. Герой в стартовом месте «${POIS[S.world.loc].name}». Опиши атмосферу, дай местному НПС заговорить с героем, свяжи завязку с предысторией героя и дай 2–3 зацепки. Не раскрывай тайну. Можно опереться на набросок: ${WD.intro || "—"}` : `ДЕЙСТВИЕ ИГРОКА: «${text}»
РЕЗУЛЬТАТЫ ДВИЖКА (это истина, опиши именно их):
${resultsBrief(results)}`}

Правила письма:
- 90–180 слов, 2–3 абзаца. Реплики НПС в «ёлочках», у каждого свой голос.
- Не называй числа урона, HP и результаты кубиков — их покажет интерфейс. Не придумывай новых бросков.
- Провалы имеют последствия, успехи дают продвижение и улики. Раскрывай тайну только через заслуженные улики.
- Если герой пришёл в место, где есть ВРАГИ, они нападают или готовы напасть — начни бой через start_combat (если герой не прокрался незаметно).
- Не решай за героя, что он делает дальше. Закончи на моменте выбора.

После текста поставь строку @@@ и затем ОДНУ строку JSON с последствиями (только то, что реально произошло в тексте):
{"speaker": "id НПС, который говорит больше всех, или null", "damage": [{"dice":"1d4","reason":"почему"}], "heal": null, "items_add": [{"name":"…","desc":"…"}], "items_remove": [], "gold": 0, "xp": 0, "attitude": {"id_нпс": 0}, "facts": ["1–2 важных новых факта для памяти, коротко"], "quest": null, "start_combat": [], "suggestions": ["3 коротких варианта следующего действия, до 6 слов"]}
damage — только если герой получил вред от окружения или ловушки (не от врагов, их урон уже посчитан). xp — 25–75 за важное открытие или решённую проблему, иначе 0. attitude — изменения от −15 до +15. quest — новая формулировка задания, если оно изменилось.`;
  ctl = new AbortController(); document.getElementById("btn-stop").hidden = false;
  let full = "";
  try {
    const r = await sample(prompt, { modelTier: "default", effort: "low", cache: false, signal: ctl.signal, onText: ({ text: t }) => { if (th.isConnected) { th.remove(); e._el.hidden = false; } full = t; e.text = t.split("@@@")[0].trim(); updateNarr(e); } });
    full = r.text;
  } catch (err) {
    th.remove(); e._el.hidden = false;
    if (err.code === "cancelled") full = err.text || "…"; else if (err.text) full = err.text;
    else { pushFeed({ t: "sys", html: esc(aiFail(err)) }); const o = offlineNarrate(text, plan, results, intro); e.text = o.text; e.streaming = false; if (o.eff.speaker) e.speaker = o.eff.speaker; updateNarr(e); S.log.push({ who: "n", text: o.text }); ctl = null; return o.eff; }
  }
  th.remove(); e._el.hidden = false; ctl = null; document.getElementById("btn-stop").hidden = true;
  const [body, tail] = full.split("@@@"); e.text = (body || "").trim() || "…"; e.streaming = false;
  let eff = {}; if (tail) { const m = tail.match(/\{[\s\S]*\}/); if (m) { try { eff = JSON.parse(m[0]); } catch (x) { eff = {}; } } }
  if (eff.speaker && NPCS[eff.speaker] && POIS[S.world.loc].npcs.includes(eff.speaker)) e.speaker = eff.speaker;
  updateNarr(e); S.log.push({ who: "n", text: e.text }); if (e.speaker) popNPC(e.speaker);
  return eff;
}
function applyEffects(eff, combatEnded) {
  const c = C(); const chips = [];
  (Array.isArray(eff.damage) ? eff.damage : []).slice(0, 2).forEach(d => { const p = parseDice(d.dice); if (!p) return; p.n = Math.min(p.n, 3); const r = rollDice(p); hurtHero(r.total); chips.push({ c: "dmg", x: `−${r.total} HP · ${str(d.reason || "урон", 40)} (${r.text})` }); });
  if (eff.heal) { const p = parseDice(eff.heal.dice || eff.heal); if (p) { const r = rollDice(p); const got = healHero(r.total); chips.push({ c: "heal", x: `+${got} HP` }); } }
  (Array.isArray(eff.items_add) ? eff.items_add : []).slice(0, 3).forEach(it => { const name = str(typeof it === "string" ? it : it?.name, 40); if (!name) return; c.items.push({ name, desc: str(it.desc, 120), potion: /зелье лечения/i.test(name) }); chips.push({ c: "item", x: `+ ${name}` }); });
  (Array.isArray(eff.items_remove) ? eff.items_remove : []).slice(0, 3).forEach(n => { const i = c.items.findIndex(x => x.name.toLowerCase() === String(n).toLowerCase()); if (i >= 0) { chips.push({ c: "item", x: `− ${c.items[i].name}` }); c.items.splice(i, 1); } });
  const gold = clamp(Math.round(Number(eff.gold) || 0), -50, 100); if (gold && c.gold + gold >= 0) { c.gold += gold; chips.push({ c: "gold", x: `${gold > 0 ? "+" : ""}${gold} зм` }); }
  const xp = clamp(Math.round(Number(eff.xp) || 0), 0, 100) + (S.pendingXP || 0); if (xp) { c.xp += xp; chips.push({ c: "xp", x: `+${xp} опыта` }); }
  if (eff.attitude && typeof eff.attitude === "object") Object.entries(eff.attitude).forEach(([id, v]) => { if (!NPCS[id]) return; const dv = clamp(Math.round(Number(v) || 0), -15, 15); if (!dv) return; const st = S.world.npcs[id] || (S.world.npcs[id] = { att: 0, mem: [] }); st.att = clamp(st.att + dv, -100, 100); chips.push({ c: "npc", x: `${NPCS[id].name}: ${dv > 0 ? "+" : ""}${dv} к отношению` }); });
  const loc = POIS[S.world.loc];
  (Array.isArray(eff.facts) ? eff.facts : []).slice(0, 3).forEach(f => { const s = str(f, 160); if (s && !S.world.facts.includes(s)) { S.world.facts.push(s); loc.npcs.forEach(id => S.world.npcs[id]?.mem.push(s)); } });
  if (S.world.facts.length > 40) S.world.facts.splice(0, S.world.facts.length - 40);
  loc.npcs.forEach(id => { const m = S.world.npcs[id]?.mem; if (m && m.length > 8) m.splice(0, m.length - 8); });
  if (eff.quest && typeof eff.quest === "string") { S.world.quest = str(eff.quest, 200); chips.push({ c: "xp", x: "Задание обновлено" }); }
  const sc = (Array.isArray(eff.start_combat) ? eff.start_combat : []).filter(id => enemyHere(id));
  if (sc.length && !S.world.combat) { S.world.combat = true; const ini = rnd(20); const tot = ini + mod(c.scores.dex);
    pushFeed({ t: "roll", r: { kind: "init", title: "Инициатива", nat: ini, total: tot, ok: true, formula: `d20 (${ini}) ${fmt(mod(c.scores.dex))} = ${tot}`, reason: "Бой начался" } });
    pushFeed({ t: "sys", html: "<b>Бой!</b> Ваш ход: атакуйте из листа персонажа или опишите действие." }); }
  if (combatEnded) pushFeed({ t: "sys", html: "<b>Бой окончен.</b>" });
  if (chips.length) pushFeed({ t: "chips", items: chips });
  S.suggestions = (Array.isArray(eff.suggestions) ? eff.suggestions : []).map(s => str(s, 48)).filter(Boolean).slice(0, 3);
  if (!S.suggestions.length) S.suggestions = defaultSuggestions();
}
function defaultSuggestions() {
  if (S.world.combat) return ["Атакую ближайшего врага", "Отступаю и ищу укрытие", "Осматриваю поле боя"];
  const loc = POIS[S.world.loc]; const s = ["Осматриваюсь внимательно"]; const n = loc.npcs.find(id => NPCS[id]); if (n) s.push(`${NPCS[n].name}, что здесь происходит?`);
  const unvisited = Object.keys(POIS).find(id => !S.world.visited.includes(id)); if (unvisited) s.push(`Иду: ${POIS[unvisited].name}`);
  return s;
}
/* офлайн-рассказчик: собирает ответ из данных мира, чтобы игра шла без ИИ */
function offlineNarrate(text, plan, results, intro) {
  const loc = POIS[S.world.loc]; const eff = { facts: [], suggestions: [] }; const out = [];
  if (intro) {
    out.push(WD.intro || `${loc.desc}`); const sp = WD.intro_speaker && loc.npcs.includes(WD.intro_speaker) ? WD.intro_speaker : null;
    if (sp) eff.speaker = sp; out.push(`Ты ${C().hook || bgHook(C().bg)}, и эта история цепляет тебя сильнее, чем хотелось бы.`);
    eff.facts = [str(WD.public, 150)]; return { text: out.join("\n\n"), eff };
  }
  const mv = results.find(r => r.kind === "move"); if (mv) out.push(loc.desc);
  results.filter(r => r.kind === "skill" || r.kind === "save").forEach(r => {
    if (r.ok) { if (loc.clue && !S.world.flags["clue_" + S.world.loc]) { out.push(loc.clue); eff.facts.push(str(loc.clue, 150)); S.world.flags["clue_" + S.world.loc] = true; eff.xp = 25; } else out.push("Тебе удаётся задуманное, хотя ничего нового здесь не найти."); }
    else out.push("Ничего не выходит: детали ускользают, а время уходит.");
  });
  results.filter(r => r.kind === "attack" || r.kind === "spell").forEach(r => out.push(r.ok ? `Удар достигает цели. Враг ${r.enemyAfter || "шатается"}.` : "Удар уходит в пустоту."));
  results.filter(r => r.kind === "enemy" && !r.skip).forEach(r => { const nm = r.title.replace(" атакует", ""); out.push(r.ok ? `${nm} достаёт тебя.` : `${nm} промахивается.`); });
  if (results.some(r => r.kind === "combat_end")) out.push("Последний враг падает. Становится тихо.");
  if (!out.length && plan.talk_to && NPCS[plan.talk_to]) { const n = NPCS[plan.talk_to]; out.push(`${n.name} (${n.look}) смотрит на тебя. ${n.greet}`); eff.speaker = plan.talk_to; eff.attitude = { [plan.talk_to]: 3 }; }
  if (!out.length) out.push(`Ты делаешь задуманное. ${loc.short}. Вокруг тихо, но в этой тишине что-то ждёт.`);
  if (mv && aliveEnemiesHere().length) { out.push(`Тебя замечают: ${aliveEnemiesHere().map(id => ENEMIES[id].name).join(", ")}. Оружие уже в их руках.`); eff.start_combat = aliveEnemiesHere(); }
  return { text: out.join("\n\n"), eff };
}

/* ---------- архивариус: сжимает старые записи в летопись ---------- */
async function maybeArchive() {
  if (archiving || !S || S.log.length <= 18) return;
  const chunk = S.log.slice(0, 10); const sample = await getSample();
  if (!sample) { S.log.splice(0, 10); save(); return; }
  archiving = true; renderWorld(); const camp = S;
  try {
    const { text } = await sample(`Ты — архивариус настольной ролевой кампании. Обнови краткую летопись: объедини прежнюю летопись и новые события в один связный пересказ по-русски, не длиннее 150 слов. Сохрани имена, обещания, долги, найденные улики, кто к герою враждебен или дружен. Без воды и без оценок. Ответь только текстом летописи.
ПРЕЖНЯЯ ЛЕТОПИСЬ: ${camp.summary || "пусто"}
НОВЫЕ СОБЫТИЯ:
${chunk.map(l => (l.who === "p" ? "Игрок: " : "Рассказчик: ") + l.text.slice(0, 600)).join("\n")}`, { modelTier: "quick", cache: false });
    if (S === camp) { camp.summary = str(text, 1200); camp.log.splice(0, chunk.length); save(); }
  } catch (e) { if (S === camp && S.log.length > 40) S.log.splice(0, 10); }
  archiving = false; if (S === camp) renderWorld();
}

/* ---------- портрет НПС ---------- */
let popT = null;
function popNPC(id) { const p = document.getElementById("npc-pop"); const n = NPCS[id]; if (!n) return; p.innerHTML = `${npcPh(id)}<div class="cap"><b>${esc(n.name)}</b><small>${esc(n.role)} · ${attLabel(S.world.npcs[id]?.att || 0)[0]}</small></div>`; p.classList.add("show"); clearTimeout(popT); popT = setTimeout(() => p.classList.remove("show"), 4200); }
function shortRest() { const c = C(); const r = rollDice({ n: 1, d: CLASSES[c.cls].hd, mod: mod(c.scores.con) }); c.hitDice--; const got = healHero(Math.max(1, r.total)); if (c.cls === "fighter") c.secondWind = true; pushFeed({ t: "sys", html: "Короткий отдых: час тишины, перевязка, глоток воды." }); pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP (${r.text})` }] }); after(); }
function longRest() { const c = C(); c.hp = c.maxHp; c.hitDice = c.level; c.secondWind = c.cls === "fighter"; Object.values(c.slots).forEach(s => s[1] = s[0]); pushFeed({ t: "sys", html: "<b>Долгий отдых.</b> Ночь проходит. Хиты, ячейки и силы восстановлены." }); pushFeed({ t: "chips", items: [{ c: "heal", x: "HP полностью" }] }); after(); }
function levelUp() {
  const c = C(); const hd = CLASSES[c.cls].hd; const avg = Math.floor(hd / 2) + 1; const cm = mod(c.scores.con) + (RACES[c.race].hpBonus || 0);
  modal(`<h2>Уровень 2</h2><p>${esc(c.name)} становится опытнее. Хиты: бросьте кость d${hd} или возьмите среднее (${avg}), плюс ${fmt(cm)}.</p><p>Новое: ${CLASSES[c.cls].spells ? "третья ячейка заклинаний 1 круга" : c.cls === "fighter" ? "«Всплеск действий»" : "«Хитрое действие»"}.</p>
    <div class="row"><button class="btn" type="button" id="lv-avg">Среднее: ${avg}</button><button class="btn primary" type="button" id="lv-roll">Бросить d${hd}</button></div>`, root => {
    const apply = v => { const add = Math.max(1, v + cm); c.level = 2; c.maxHp += add; c.hp += add; c.hitDice++; Object.entries(slotsFor(c.cls, 2)).forEach(([l, n]) => { const s = c.slots[l] || [0, 0]; c.slots[l] = [n, s[1] + (n - s[0])]; });
      closeModal(); pushFeed({ t: "sys", html: `<b>Новый уровень!</b> Максимум хитов +${add}.` }); after(); };
    root.querySelector("#lv-avg").onclick = () => apply(avg); root.querySelector("#lv-roll").onclick = () => apply(rnd(hd));
  });
}
function checkDeath() {
  const c = C(); if (c.hp > 0 || S.dead) return;
  if (S.mode === "novice") { c.hp = 1; S.world.combat = false; pushFeed({ t: "sys", html: "<b>Вы теряете сознание…</b> и приходите в себя в безопасном месте. Враги ушли. 1 HP." }); after(); return; }
  if (!S.dying) S.dying = { s: 0, f: 0 }; renderDeath();
}
function renderDeath() {
  const st = S.dying; document.getElementById("death-box")?.remove();
  const d = document.createElement("div"); d.className = "death"; d.id = "death-box"; const m = n => Array.from({ length: 3 }, (_, i) => `<i class="${i < n ? "f" : ""}"></i>`).join("");
  d.innerHTML = `<b>Вы при смерти.</b><span style="color:var(--mist);font-size:13px">Спасбросок от смерти: d20, 10 и выше — успех. Три успеха — вы стабилизируетесь, три провала — смерть.</span><div class="marks"><span class="s">Успехи ${m(st.s)}</span><span class="x">Провалы ${m(st.f)}</span></div><div><button class="btn primary" type="button" id="btn-ds">Спасбросок от смерти</button></div>`;
  document.getElementById("feed-inner").append(d); scrollFeed();
  d.querySelector("#btn-ds").onclick = () => {
    const n = rnd(20); let txt;
    if (n === 20) { S.dying = null; C().hp = 1; txt = "20! Вы приходите в сознание с 1 HP."; S.world.combat = false; }
    else { if (n >= 10) st.s++; else st.f += n === 1 ? 2 : 1; txt = `d20 = ${n}: ${n >= 10 ? "успех" : n === 1 ? "два провала" : "провал"}`; }
    d.remove(); pushFeed({ t: "roll", r: { kind: "death", title: "Спасбросок от смерти", nat: n, ok: n >= 10, crit: n === 20, fumble: n === 1, formula: txt } });
    if (S.dying && st.s >= 3) { S.dying = null; C().hp = 1; S.world.combat = false; pushFeed({ t: "sys", html: "<b>Вы стабилизировались.</b> Враги, сочтя вас мёртвым, ушли. 1 HP." }); }
    else if (S.dying && st.f >= 3) { die(); return; }
    if (S.dying) renderDeath(); after();
  };
}
function die() {
  S.dying = null;
  if (S.mode === "sandbox" && S.secondChance) { S.secondChance = false; C().hp = Math.ceil(C().maxHp / 2); S.world.combat = false; const safe = Object.keys(POIS).find(id => POIS[id].rest) || WD.start; moveTo(safe); pushFeed({ t: "sys", html: "<b>Второй шанс.</b> Вас нашли и выходили. Больше такое не повторится." }); after(); return; }
  S.dead = true; save();
  modal(`<h2>Конец пути</h2><p>${esc(C().name)} погибает в мире «${esc(WD.name)}». В режиме «${MODES[S.mode].name}» смерть окончательна.</p><p>Летопись: ${S.world.facts.length} фактов, ${C().xp} опыта.</p><div class="row"><button class="btn primary" type="button" id="dead-home">К кампаниям</button></div>`,
    root => { root.querySelector("#dead-home").onclick = () => { closeModal(); S = null; renderHome(); }; });
}
function modal(html, bind) { const r = document.getElementById("modal-root"); r.innerHTML = `<div class="modal-back"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`; bind(r); r.querySelector("button")?.focus(); }
function closeModal() { document.getElementById("modal-root").innerHTML = ""; }

/* =========================================================================
   BOOT
   ========================================================================= */
function showTab(t) { document.querySelectorAll("#mtabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.t === t))); ["sheet", "story", "world"].forEach(id => document.getElementById(id).classList.toggle("active", id === t)); if (t === "world") requestAnimationFrame(drawMap); }
document.getElementById("mtabs").addEventListener("click", e => { const b = e.target.closest("button"); if (b) showTab(b.dataset.t); });
document.getElementById("btn-back").onclick = () => { if (D.step > 0) { D.step--; renderCreate(); document.getElementById("create-scroll").scrollTop = 0; } else renderHome(); };
document.getElementById("btn-next").onclick = () => { if (!stepValid(D.step)) return; if (D.step < 6) { D.step++; renderCreate(); document.getElementById("create-scroll").scrollTop = 0; } else finishCreation(); };
document.getElementById("btn-home").onclick = () => { if (busy) return; if (S) save(); S = null; renderHome(); };
document.getElementById("btn-stop").onclick = () => ctl?.abort();
const inp = document.getElementById("act-input");
inp.addEventListener("input", () => { inp.style.height = "auto"; inp.style.height = Math.min(160, inp.scrollHeight) + "px"; });
inp.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); document.getElementById("act-form").requestSubmit(); } });
document.getElementById("act-form").addEventListener("submit", e => { e.preventDefault(); const t = inp.value.trim(); if (!t || busy || !S) return; inp.value = ""; inp.style.height = "auto"; takeTurn(t.slice(0, 500)); });
window.addEventListener("resize", () => { if (S) drawMap(); });
document.querySelectorAll(".nav-links [data-go]").forEach(b => b.onclick = () => { const g = b.dataset.go; if (g === "new") newCampaign(); else { renderHome(); if (g === "how") requestAnimationFrame(() => document.getElementById(g === "how" ? "how" : "camps-band")?.scrollIntoView({ behavior: "smooth" })); } });
document.getElementById("logo").onclick = () => { if (busy) return; if (S) save(); S = null; renderHome(); };
window.addEventListener("resize", () => { if (!document.getElementById("screen-create").hidden && D) document.querySelector(".c-grid").style.gridTemplateColumns = D.step === 0 && innerWidth > 980 ? (innerWidth > 1240 ? "220px minmax(0, 1fr)" : "200px minmax(0, 1fr)") : ""; });
(function boot() { migrateV1(); D = newDraft(); renderHome(); initSample(); })();
