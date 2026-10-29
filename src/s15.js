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
  guiding_bolt: { name: "Направляющий снаряд", lvl: 1, kind: "attack", dice: "4d6", type: "излучением", desc: "Атака заклинанием, 4d6 излучения" },
  shatter: { name: "Дребезги", lvl: 2, kind: "save", abil: "con", dice: "3d8", type: "звуком", desc: "Спасбросок ТЕЛ, 3d8 звуком" },
  fireball: { name: "Огненный шар", lvl: 3, kind: "save", abil: "dex", dice: "8d6", type: "огнём", desc: "Спасбросок ЛОВ, 8d6 огня" },
  spiritual_weapon: { name: "Божественное оружие", lvl: 2, kind: "attack", dice: "1d8+3", type: "силовым полем", desc: "Атака заклинанием, 1d8 + МДР" },
  spirit_guardians: { name: "Духовные стражи", lvl: 3, kind: "save", abil: "wis", dice: "3d8", type: "излучением", desc: "Спасбросок МДР, 3d8 излучения" }
};
const XP_LEVELS = [0, 300, 900, 2700, 6500];
const MAX_LEVEL = 5;
const SLOT_TABLE = { 1: { 1: 2 }, 2: { 1: 3 }, 3: { 1: 4, 2: 2 }, 4: { 1: 4, 2: 3 }, 5: { 1: 4, 2: 3, 3: 2 } };
const LEVEL_SPELLS = { wizard: { 3: "shatter", 5: "fireball" }, cleric: { 3: "spiritual_weapon", 5: "spirit_guardians" } };
const LEVEL_FEATS = {
  fighter: { 2: "Всплеск действий: раз за отдых — ещё одно действие", 3: "Боевой архетип: Чемпион — крит на 19–20", 4: "Увеличение характеристик", 5: "Дополнительная атака: две атаки за действие" },
  rogue: { 2: "Хитрое действие: рывок, отход или засада бонусом", 3: "Скрытая атака 2d6", 4: "Увеличение характеристик", 5: "Скрытая атака 3d6, Невероятное уклонение" },
  wizard: { 2: "Школа воплощения", 3: "Заклинания 2 круга: Дребезги", 4: "Увеличение характеристик", 5: "Заклинания 3 круга: Огненный шар" },
  cleric: { 2: "Божественный канал: изгнание нежити", 3: "Заклинания 2 круга: Божественное оружие", 4: "Увеличение характеристик", 5: "Заклинания 3 круга: Духовные стражи, Уничтожение нежити" }
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
  ensureBuildings(def); WD = def; POIS = def.places; NPCS = def.npcs; ENEMIES = def.enemies; ROAD = new Set(def.roads || []);
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
  return { id: "salt-harbor", season: "autumn", culture: "north", settle: "village", danger: "mid", genre: "mystery", photo_style: "cinematic photograph, medieval northern fishing village, cold overcast sea light, muted teal and grey palette, wool and weathered wood textures, 85mm lens, shallow depth of field, subtle film grain, realistic skin", name: "Солёная Гавань", tagline: "Маяк горит, хотя смотритель мёртв", biome: "coast", tone: "grim", start: "tavern",
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
  const nPl = { small: 5, normal: 7, large: 9 }[opts.size] || 7; const nFoe = { small: "1–2 места", normal: "Ровно 2 места", large: "Ровно 3 места" }[opts.size] || "Ровно 2 места";
  const seedLine = `Окружение: ${BIOMES[opts.biome]}. Жанр: ${GENRES[opts.genre] || "Расследование"}. Тон: ${TONES[opts.tone]}. Время года: ${SEASONS[opts.season] || "Осень"}. Культура: ${CULTURE_PROMPT[opts.culture] || CULTURE_PROMPT.auto}. Поселение: ${SETTLES[opts.settle] || "Деревня"}. Опасность: ${DANGERS[opts.danger] || "Опасный"}. ${MAGICS[opts.magic]}. Пожелания игрока: ${opts.wish || "нет"}.`;
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
- ${nPl} мест. Первое — безопасное стартовое место в поселении (таверна, постоялый двор, общий дом) с rest:true. Ещё одно безопасное место может иметь rest:true.
- ${nFoe} с врагами (foes), не в поселении, одно из них — логово злодея. Враги — только типы из бестиария: ${bestiary}. В группе 1–3 врага, не больше одного босса на группу.
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
  people.places.filter(p => p && typeof p === "object").slice(0, nPl + 1).forEach((p, i) => {
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
    if (p.foes.length && groups < ({ small: 2, normal: 3, large: 4 }[opts.size] || 3)) {
      groups++; let boss = 0;
      p.foes.slice(0, 3).forEach((f, k) => {
        let type = BESTIARY[f.type] ? f.type : "bandit"; if (BESTIARY[type].boss) { if (boss) type = "bandit"; else boss++; }
        if (opts.danger === "low" && k >= 2) return; const id = `${p.id}_${k}`; const E = { ...BESTIARY[type], type, name: str(f.name, 32) || BESTIARY[type].label.split(",")[0], loc: p.id };
        if (opts.danger === "high") { E.hp = Math.round(E.hp * 1.3); E.atk += 1; } if (opts.danger === "low") E.hp = Math.max(4, Math.round(E.hp * .8)); enemies[id] = E; ids.push(id);
      });
    }
    places[p.id] = { name: p.name, kind: p.kind, where: p.where, x: map.pos[p.id][0], y: map.pos[p.id][1], short: p.short, desc: p.desc, clue: p.clue, rest: p.rest, npcs: p.npcs, enemies: ids };
  });
  onStage(5);
  const start = placeList[0].id;
  const recommended = (Array.isArray(core.recommended) ? core.recommended : []).filter(r => CLASSES[r.cls]).slice(0, 2).map(r => ({ cls: r.cls, why: str(r.why, 40) }));
  const bg = {}; Object.keys(BACKGROUNDS).forEach(k => { const v = str(core.bg_hooks?.[k], 160); if (v) bg[k] = v.replace(/^вы\s+/i, ""); });
  const sp = npcIdMap[people.intro_speaker];
  return { id: uid(), photo_style: str(core.photo_style, 300) || `cinematic photograph, realistic fantasy ${({ coast: "coastal", marsh: "marsh", mountains: "mountain", forest: "forest" })[opts.biome]} village, natural light, 85mm lens, film grain`, name: str(core.name, 40), tagline: str(core.tagline, 70), biome: opts.biome, tone: opts.tone, genre: opts.genre, season: opts.season, culture: opts.culture, settle: opts.settle, danger: opts.danger, start,
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
  if (!S) return; S.updated = Date.now(); lsSet(C_KEY(S.id), S);
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
function slotsFor(cls, lvl) { if (!CLASSES[cls].spells) return {}; return { ...SLOT_TABLE[clamp(lvl, 1, 5)] }; }
function C() { return S.char; }
function skillBonus(key) { const c = C(); const [, ab] = SKILLS[key]; return mod(c.scores[ab]) + (c.skills.includes(key) ? prof(c.level) : 0); }
function saveBonus(ab) { const c = C(); return mod(c.scores[ab]) + (CLASSES[c.cls].saves.includes(ab) ? prof(c.level) : 0); }
function d20(adv) {
  const lucky = RACES[C().race].lucky; const one = () => { let r = rnd(20); if (r === 1 && lucky) r = rnd(20); return r; };
  const a = one(); if (!adv) return { nat: a, pair: null }; const b = one(); return { nat: adv > 0 ? Math.max(a, b) : Math.min(a, b), pair: [a, b] };
}
function weaponAtk(wid) {
  const w = WEAPONS[wid]; const c = C(); const ab = w.abil === "finesse" ? (mod(c.scores.dex) >= mod(c.scores.str) ? "dex" : "str") : w.abil;
  return { w, ab, bonus: mod(c.scores[ab]) + (weaponProf(c, wid) ? prof(c.level) : 0), dmgMod: mod(c.scores[ab]) };
}
function castMod() { const c = C(); const ab = CLASSES[c.cls].cast; return ab ? mod(c.scores[ab]) : 0; }
function spellAtk() { return castMod() + prof(C().level); }
function spellDC() { return 8 + castMod() + prof(C().level); }
function enemyHere(id) { const e = S.world.enemies[id]; return e && e.alive && ENEMIES[id] && ENEMIES[id].loc === S.world.loc ? e : null; }
function aliveEnemiesHere() { return Object.keys(S.world.enemies).filter(id => enemyHere(id)); }
function resolveCheck(ch) {
  const c = C();
  if (ch.kind === "skill") {
    if (c.bless) { ch.adv = 1; c.bless = false; ch.reason = (ch.reason ? ch.reason + "; " : "") + "благословение"; } const r = d20(ch.adv); const b = skillBonus(ch.skill); const tot = r.nat + b; const ok = r.nat === 20 ? true : tot >= ch.dc;
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
    const adv = ch.adv || (e.asleep ? 1 : 0); const r = d20(adv); const tot = r.nat + bonus; const critOn = c.cls === "fighter" && c.level >= 3 ? 19 : 20; const isCrit = r.nat >= critOn; const hit = isCrit || (r.nat !== 1 && tot >= E.ac);
    let dmg = null, extra = "";
    if (hit) {
      dmg = rollDice({ ...parseDice(w.dice), mod: dmgMod }, isCrit);
      if (c.cls === "rogue" && adv > 0 && !S.turnSneak) { const sn = rollDice(Math.ceil(c.level / 2) + "d6", r.nat === 20); dmg.total += sn.total; extra = ` + скрытая атака ${sn.text}`; S.turnSneak = true; }
      hurtEnemy(ch.target, dmg.total);
    }
    return { ...ch, nat: r.nat, pair: r.pair, total: tot, ok: hit, crit: isCrit, fumble: r.nat === 1, dmg: dmg?.total || 0, title: `Атака: ${w.name} → ${E.name}${ch.extra ? " (вторая)" : ""}`,
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
function archKey(wd, n) { return `${wd.id}:type:${n.gender === "f" ? "f" : "m"}-${n.age || "adult"}`; }
function imgKeyFor(wd, id) { const n = wd?.npcs?.[id]; return n && n.minor ? archKey(wd, n) : (wd ? wd.id + ":" + id : ""); }
function npcImg(id, wd) { const w = wd || WD; if (!w) return ""; const n = w.npcs?.[id]; if (!n) return ""; return n.img || imgCache[imgKeyFor(w, id)] || ""; }
function photoTag(url) { return url ? `<img class="photo" src="${esc(url)}" alt="" loading="lazy" style="position:absolute;inset:0">` : ""; }
function npcPh(id, cls, wd) {
  const w = wd || WD; const key = imgKeyFor(w, id);
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
  spaces_off: "Коннектор Hugging Face из каталога claude.ai не запускает генераторы. Добавьте свой коннектор: имя «HF Images», адрес https://huggingface.co/mcp?login, войдите в Hugging Face и включите Dynamic Spaces на huggingface.co/settings/mcp. Затем нажмите «Повторить портреты».",
  no_route: "Генератор портретов не подключён. Добавьте свой коннектор «HF Images» с адресом https://huggingface.co/mcp?login и включите Dynamic Spaces на huggingface.co/settings/mcp, затем нажмите «Повторить портреты».",
  denied: "Доступ к генератору не разрешён. Разрешите коннектор для этой страницы и нажмите «Повторить портреты».",
  quota: "Квота GPU Hugging Face для выбранной модели закончилась. Переключите модель портретов на «Авто» или «Pollinations» в настройках — они работают без лимита. Иначе очередь продолжится сама, когда квота восстановится.",
  busy: "Генератор Pollinations сейчас перегружен. Портреты допишутся через минуту.",
  url_only: "Генератор вернул ссылку вместо картинки, а внешние ссылки страница загрузить не может.",
  no_mcp: "Генерация фото недоступна в этом просмотре. Показаны рисованные портреты.",
  no_image: "Генератор ответил без картинки. Попробуйте ещё раз позже.",
  img_failed: "Портрет не получился. Попробуйте ещё раз позже."
};
function retryPortraits() { portraitPaused = false; imgNote = ""; clearTimeout(retryTimer); runPortraitJobs(); refreshPortraitViews(); }
function retryBtnHTML() { const q = portraitJobs.length; return imgNote ? `<div style="display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap"><p class="err" style="color:var(--mist);margin:0;flex:1;min-width:220px;overflow-wrap:anywhere">${esc(imgNote)}${q ? ` Ожидают портрета: ${q}.` : ""}</p><button class="btn small" type="button" data-retry-img>Повторить портреты</button></div>` : ""; }
document.addEventListener("click", e => { if (e.target.closest?.("[data-retry-img]")) retryPortraits(); });
const ROUTE_KEY = "sh5-img-route";
const IMG_W = 576, IMG_H = 720, IMG_STEPS = 16;
/* Модели портретов. Pollinations идёт через CPU-генераторы на Hugging Face и не тратит квоту GPU. */
const IMG_MODELS = {
  auto: { name: "Авто", sub: "FLUX Krea, пока есть квота, затем Pollinations без лимита" },
  krea: { name: "FLUX.1 Krea", sub: "Лучшее качество · бесплатная квота GPU Hugging Face, 5–8 портретов в день" },
  zimage: { name: "Z-Image Turbo", sub: "Быстрая модель · та же квота GPU Hugging Face" },
  pollinations: { name: "Pollinations", sub: "Без лимита · качество проще, генерация 5–20 секунд" }
};
const MODEL_KEY = "sh5-img-model", KREA_COOLDOWN_KEY = "sh5-krea-cooldown";
function imgModel() { const m = lsGet(MODEL_KEY); return IMG_MODELS[m] ? m : "auto"; }
function setImgModel(m) { if (IMG_MODELS[m]) { lsSet(MODEL_KEY, m); portraitPaused = false; imgNote = ""; clearTimeout(retryTimer); runPortraitJobs(); } }
const dyn = (space, tool, params) => ({ operation: "invoke", space_name: space, tool_name: tool, parameters: JSON.stringify(params) });
const ROUTE_SETS = {
  krea: [
    { server: "HF Images", tools: ["gr1_flux_1_krea_dev_infer", "gr2_flux_1_krea_dev_infer", "gr3_flux_1_krea_dev_infer"], input: (prompt, seed) => ({ prompt, seed, randomize_seed: false, width: IMG_W, height: IMG_H, guidance_scale: 4.5, num_inference_steps: IMG_STEPS }) },
    { server: "HF Images", tools: ["dynamic_space"], input: (prompt, seed) => dyn(HF.space, HF.spaceTool, { prompt, seed, randomize_seed: false, width: IMG_W, height: IMG_H, guidance_scale: 4.5, num_inference_steps: IMG_STEPS }) },
    { server: "FLUX Krea", tools: ["FLUX_1_Krea_dev_infer", "infer"], input: (prompt, seed) => ({ prompt, seed, randomize_seed: false, width: IMG_W, height: IMG_H, guidance_scale: 4.5, num_inference_steps: IMG_STEPS }) },
    { server: HF.server, tools: [HF.tool], input: (prompt, seed) => dyn(HF.space, HF.spaceTool, { prompt, seed, randomize_seed: false, width: IMG_W, height: IMG_H, guidance_scale: 4.5, num_inference_steps: IMG_STEPS }) }
  ],
  zimage: [
    { server: "HF Images", tools: ["gr1_z_image_turbo_generate", "gr2_z_image_turbo_generate", "gr3_z_image_turbo_generate"], input: (prompt, seed) => ({ prompt, seed, random_seed: false, resolution: "864x1152 ( 3:4 )", steps: 8 }) },
    { server: "HF Images", tools: ["dynamic_space"], input: (prompt, seed) => dyn("mcp-tools/Z-Image-Turbo", "Z_Image_Turbo_generate", { prompt, seed, random_seed: false, resolution: "864x1152 ( 3:4 )", steps: 8 }) }
  ],
  pollinations: [
    { server: "HF Images", tools: ["dynamic_space"], wm: true, input: (prompt, seed) => dyn("mbovy/pollinations-mcp", "pollinations_mcp_generate_image", { prompt, seed, width: IMG_W, height: IMG_H + 48, model: "flux" }) },
    { server: "HF Images", tools: ["dynamic_space"], wm: true, input: (prompt, seed) => dyn("cedpsam/pollinations_images", "pollinations_images_infer", { prompt, seed, randomize_seed: false, width: IMG_W, height: IMG_H + 48, nologo: true, private: true, nofeed: true }) },
    { server: HF.server, tools: [HF.tool], wm: true, input: (prompt, seed) => dyn("mbovy/pollinations-mcp", "pollinations_mcp_generate_image", { prompt, seed, width: IMG_W, height: IMG_H + 48, model: "flux" }) }
  ]
};
function parseImage(r) {
  const blocks = Array.isArray(r?.content) ? r.content : [];
  for (const b of blocks) {
    if (b.type === "image" && b.data) return { blob: b64ToBlob(b.data, b.mimeType) };
    if (b.type === "resource" && b.resource?.blob && /^image\//.test(b.resource.mimeType || "image/")) return { blob: b64ToBlob(b.resource.blob, b.resource.mimeType) };
  }
  const text = blocks.filter(b => b.type === "text").map(b => b.text).join("\n") + (typeof r?.payload === "string" ? r.payload : "");
  if (/gradio\s*=\s*none|invoke operation is disabled/i.test(text)) throw { code: "spaces_off" };
  if (/quota|exceeded your gpu|zerogpu/i.test(text)) throw { code: "quota" };
  if (/limite de debit|rate limit|429/i.test(text)) throw { code: "busy" };
  const dm = text.match(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/); if (dm) return { blob: b64ToBlob(dm[0], dm[0].slice(5, dm[0].indexOf(";"))) };
  const um = text.match(/https?:\/\/[^\s)"'\]<>]+?\.(?:png|jpe?g|webp)(?:\?[^\s)"'\]<>]*)?/i) || text.match(/https?:\/\/[^\s)"'\]<>]+\/file=[^\s)"'\]<>]+/i);
  if (um) return { url: um[0] };
  throw { code: "no_image" };
}
function canLoad(url) { return new Promise(res => { const i = new Image(); const t = setTimeout(() => res(false), 9000); i.onload = () => { clearTimeout(t); res(true); }; i.onerror = () => { clearTimeout(t); res(false); }; i.src = url; }); }
async function tryRoutes(mcp, routes, prompt, seed, key) {
  const saved = lsGet(ROUTE_KEY) || {}; const pref = saved[key]; let worst = { code: "no_route" };
  const order = pref != null && routes[pref] ? [routes[pref], ...routes.filter((_, i) => i !== pref)] : routes;
  for (const route of order) {
    for (const tool of route.tools) {
      let r;
      try { r = await mcp.callTool(route.server, tool, route.input(prompt, seed), { cache: false }); }
      catch (e) {
        const msg = String(e?.message || "");
        if (e?.code === "server_not_connected" || e?.code === "not_in_manifest" || e?.code === "selection_required") break;
        if (/gradio\s*=\s*none|invoke operation is disabled/i.test(msg)) { if (worst.code === "no_route") worst = { code: "spaces_off" }; break; }
        if (/quota|zerogpu/i.test(msg)) throw { code: "quota" };
        if (/limite de debit|rate limit|429|too many/i.test(msg)) { worst = { code: "busy" }; break; }
        if (/unknown tool|not found|no such tool|tool .* not/i.test(msg) || e?.code === "bad_request") continue;
        if (["needs_reauth", "not_granted", "blocked_by_policy", "consent_required"].includes(e?.code)) { worst = { code: "denied", server: route.server }; break; }
        worst = { code: "img_failed" }; break;
      }
      let out;
      try { out = parseImage(r); } catch (e) { if (e.code === "quota") throw e; if (e.code === "spaces_off" && worst.code !== "no_route") break; worst = e; break; }
      if (out.url && !(await canLoad(out.url))) { worst = { code: "url_only" }; break; }
      saved[key] = routes.indexOf(route); lsSet(ROUTE_KEY, saved); out.wm = !!route.wm;
      return out;
    }
  }
  throw worst;
}
async function hfImage(prompt, seed) {
  const mcp = await getMcp(); if (!mcp) throw { code: "no_mcp" };
  prompt = prompt.slice(0, 600); const m = imgModel();
  if (m === "pollinations") return pollinate(mcp, prompt, seed);
  if (m === "krea" || m === "zimage") return tryRoutes(mcp, ROUTE_SETS[m], prompt, seed, m);
  // авто: лучшая модель, пока у неё есть квота; иначе — без лимита
  const cool = Number(lsGet(KREA_COOLDOWN_KEY) || 0);
  if (Date.now() > cool) {
    try { return await tryRoutes(mcp, ROUTE_SETS.krea, prompt, seed, "krea"); }
    catch (e) { if (e.code === "quota") lsSet(KREA_COOLDOWN_KEY, Date.now() + 60 * 60 * 1000); else if (!["no_route", "spaces_off", "img_failed", "no_image", "url_only"].includes(e.code)) throw e; }
  }
  return pollinate(mcp, prompt, seed);
}
let lastPollen = 0;
async function pollinate(mcp, prompt, seed) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const wait = lastPollen + 4000 - Date.now(); if (wait > 0) await pause(wait);
    try { const out = await tryRoutes(mcp, ROUTE_SETS.pollinations, prompt, seed, "pollinations"); lastPollen = Date.now(); return out; }
    catch (e) { lastPollen = Date.now(); if (e.code !== "busy" && e.code !== "img_failed") throw e; await pause(12000 * (attempt + 1)); }
  }
  throw { code: "busy" };
}
/* убрать водяной знак Pollinations: срезать нижнюю полоску */
async function cropWatermark(blob) {
  try { const bmp = await createImageBitmap(blob); const cut = Math.round(bmp.height * 48 / (IMG_H + 48)); const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height - cut;
    c.getContext("2d").drawImage(bmp, 0, 0); return await new Promise(r => c.toBlob(b => r(b || blob), "image/jpeg", .9)); } catch (e) { return blob; }
}
async function shrinkToDataURL(blob) {
  const bmp = await createImageBitmap(blob); const s = Math.min(1, 420 / bmp.width); const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s); c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", .82);
}
async function storeImage(res) {
  if (res.url) return res.url;
  if (res.wm) res.blob = await cropWatermark(res.blob);
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
/* Очередь портретов: сначала то, что игрок видит сейчас. Второстепенные НПС делят типажи (пол × возраст) — максимум 6 картинок на мир. */
const portraitJobs = [], jobKeys = new Set(); let portraitPaused = false, jobRunning = false, retryTimer = null;
function archPrompt(wd, n) { return `portrait of ${n.age === "old" ? "an elderly" : n.age === "young" ? "a young" : "a middle-aged"} ${n.gender === "f" ? "woman" : "man"}, an ordinary local commoner in simple worn clothes, weathered face, natural expression. ${wd.photo_style}. Head and shoulders, looking at camera, photorealistic, highly detailed face, no text`; }
function wantPortrait(wd, id, prio) {
  if (!wd || !wd.npcs?.[id]) return; const key = imgKeyFor(wd, id); prio = prio ?? 1;
  if (imgCache[key]) { if (!wd.npcs[id].img) wd.npcs[id].img = imgCache[key]; return; }
  if (jobKeys.has(key)) { const jb = portraitJobs.find(x => x.key === key); if (jb && prio < jb.prio) { jb.prio = prio; portraitJobs.sort((a, b) => a.prio - b.prio); } return; }
  jobKeys.add(key); portraitJobs.push({ key, wd, id, prio }); portraitJobs.sort((a, b) => a.prio - b.prio); runPortraitJobs();
}
async function runPortraitJobs() {
  if (jobRunning || portraitPaused) return; jobRunning = true;
  while (portraitJobs.length && !portraitPaused) {
    const jb = portraitJobs.shift(); const n = jb.wd.npcs[jb.id]; if (!n || imgCache[jb.key]) { jobKeys.delete(jb.key); continue; }
    imgPending.add(jb.key); refreshPortraitViews();
    try {
      let prompt; if (n.minor) prompt = archPrompt(jb.wd, n); else { await ensurePrompts(jb.wd); prompt = portraitPrompt(jb.wd, n); }
      const url = await makePortrait(prompt, hash(jb.key) % 100000); imgCache[jb.key] = url; lsSet(IMG_KEY, imgCache); setNpcImg(jb.wd.id, jb.id, url); imgNote = ""; jobKeys.delete(jb.key);
    } catch (e) {
      const c = onImgError(e);
      if (["spaces_off", "no_route", "denied", "no_mcp", "quota", "url_only", "busy"].includes(c)) { portraitJobs.unshift(jb); portraitPaused = true; if (c === "quota" || c === "busy") { clearTimeout(retryTimer); retryTimer = setTimeout(() => { portraitPaused = false; imgNote = ""; runPortraitJobs(); }, c === "busy" ? 60 * 1000 : 10 * 60 * 1000); } }
      else jobKeys.delete(jb.key);
    }
    imgPending.delete(jb.key); refreshPortraitViews();
  }
  jobRunning = false;
}
function queueWorldPortraits(wd) { if (!wd) return; if (wd.intro_speaker) wantPortrait(wd, wd.intro_speaker, 0); (wd.places?.[wd.start]?.npcs || []).forEach(id => wantPortrait(wd, id, 1)); }
function setNpcImg(wid, id, url) {
  [D?.world, ...(D?.worlds || []), S?.wd].forEach(w => { if (!w || w.id !== wid) return; const key = imgKeyFor(w, id); Object.entries(w.npcs).forEach(([nid, n]) => { if (nid === id || imgKeyFor(w, nid) === key) n.img = url; }); });
  if (S && S.wd.id === wid) save();
}
let portraitTimer = null;
function refreshPortraitViews() {
  clearTimeout(portraitTimer); portraitTimer = setTimeout(() => {
    if (!document.getElementById("screen-create").hidden && D) { if (D.step === 0) renderCreate(); }
    else if (!document.getElementById("screen-game").hidden && S) { if (document.querySelector(".sc-pop:not([hidden])") || busy) { refreshPortraitViews(); return; } renderScene(); renderWorld(); }
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
  F.pois = Object.values(POIS).filter(isOuter).map(p => [p.x + .5, p.y + .5]); return F;
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
  { const lab = new Int32Array(W * H); const minA = Math.pow(t * Q, 2) * .9; const st = []; let id = 0;
    for (let i0 = 0; i0 < W * H; i0++) { if (!water[i0] || lab[i0]) continue; id++; const comp = []; st.push(i0); lab[i0] = id;
      while (st.length) { const i = st.pop(); comp.push(i); const x = i % W, y = (i / W) | 0;
        if (x > 0 && water[i - 1] && !lab[i - 1]) { lab[i - 1] = id; st.push(i - 1); } if (x < W - 1 && water[i + 1] && !lab[i + 1]) { lab[i + 1] = id; st.push(i + 1); }
        if (y > 0 && water[i - W] && !lab[i - W]) { lab[i - W] = id; st.push(i - W); } if (y < H - 1 && water[i + W] && !lab[i + W]) { lab[i + W] = id; st.push(i + W); } }
      if (comp.length < minA) for (const i of comp) { water[i] = 0; land[i] = 1; } } }
  const dW = chamfer(land, W, H), dL = chamfer(water, W, H); // dW — до суши (для воды), dL — до воды (для суши)
  // 2. пиксели
  const grain = makeNoise(hash(WD.id + "grain")); const img = g.createImageData(W, H); const D = img.data; const HS = (WD.houses || []).map(([a, b]) => [a + .5, b + .5]);
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
      const patch = grain(x / (70 * px1) + 11, y / (70 * px1) - 7, 3);
      c = [mix(P.grass[0], P.grass2[0], patch), mix(P.grass[1], P.grass2[1], patch), mix(P.grass[2], P.grass2[2], patch)];
      c = c.map((v, k) => mix(v, P.paper[k], clamp(.22 + (e - .5) * .5 + (gr2 - .5) * .3, 0, .7)));
      if (HS.length) { const X = x / Q / t, Y = y / Q / t; let hd = 9; for (const [hx, hy] of HS) { const dd = Math.hypot(X - hx, Y - hy); if (dd < hd) hd = dd; }
        if (hd < 1.7 && bil(ff, fx, fy, FW, FH) < .45 && bil(fr, fx, fy, FW, FH) < .45) { const cw = 22 * px1, ch = 15 * px1; const cxk = Math.floor((x + y * .35) / cw), cyk = Math.floor((y - x * .2) / ch); const hh = hash(cxk + ":" + cyk);
          if (hh % 5 < 2) { const fade = 1 - smooth(1.0, 1.7, hd); const ang = (hh % 2) ? x * .9 + y * .3 : x * .25 - y; const stripe = (Math.floor(ang / (2.6 * px1)) & 1) ? 1 : 0; const tone = (hh >>> 3) % 4;
            const fc = [[186, 170, 98], [160, 156, 88], [142, 150, 84], [196, 182, 118]][tone]; c = c.map((v, k) => mix(v, fc[k] - stripe * 12, fade * .6));
            const ex = ((x + y * .35) % cw), ey = ((y - x * .2) % ch); if (ex < .8 * px1 || ey < .8 * px1) c = c.map((v, k) => mix(v, P.ink[k], fade * .18)); } } }
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
  const ms = 21 * k;
  for (let y = 0; y < Hc + ms; y += ms * .62) for (let x = 0; x < width + ms; x += ms * .9) {
    const X = x + (rr() - .5) * ms * .7, Y = y + (rr() - .5) * ms * .5; if (isWater(X, Y) || distLand(X, Y) < 5 * k) continue; const a = at(X, Y);
    if (a.r > .68 && rr() > .3 && !nearPoi(X, Y, t * .8)) items.push({ type: "m", X, Y, s: (8.5 + rr() * 5 + (a.r - .6) * 6) * k, snow: a.n > .35 || (a.r > .9 && rr() > .5), q: rr() });
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
    else if (a.f < .3 && a.r < .4 && a.m < .3) { const z = rr(); if (z > .988) items.push({ type: "t", X, Y, s: (2.8 + rr()) * k, q: rr() }); else if (z > .95) items.push({ type: "tuft", X, Y, s: (2.2 + rr()) * k, q: rr() }); }
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
    } else if (it.type === "tuft") {
      g.strokeStyle = "rgba(70,62,30,.55)"; g.lineWidth = .7; g.beginPath(); g.moveTo(X - s * .7, Y); g.lineTo(X - s * .9, Y - s * .7); g.moveTo(X, Y); g.lineTo(X, Y - s); g.moveTo(X + s * .7, Y); g.lineTo(X + s * .9, Y - s * .7); g.stroke();
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
    let best = null, bd = -1; for (let j = 0; j < 900; j++) { const X = Math.floor(sp() * W), Y = Math.floor(sp() * H); const i = Y * W + X; if (water[i] && dW[i] > bd && X > W * .2 && X < W * .8 && Y > H * .1 && Y < H * .9 && !F.pois.some(([px, py]) => Math.hypot(px - X / Q / t, py - Y / Q / t) < 2.6)) { bd = dW[i]; best = [X / Q / t, Y / Q / t]; } }
    if (best && bd > 30 * px1) out.sea = [clamp(best[0], MAP_W * .22, MAP_W * .78), best[1]]; else out.sea = null;
  }
  mapCache.set(key, out); if (mapCache.size > 8) mapCache.delete(mapCache.keys().next().value);
  return out;
}
function roadPaths(t) {
  const start = POIS[WD.start] || Object.values(POIS)[0]; const s0 = [start.x, start.y]; const out = {};
  outerEntries().forEach(([id, p]) => {
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
  return { visited: vis || (S.world.visited || []).some(v => POIS[v]?.parent === id), here: hereOuter() === id, danger: vis && alive > 0, cleared: vis && foes.length > 0 && alive === 0, clue: !!S.world.flags["clue_" + id], note: S.world.notes?.[id] || "", rumor: !!S.world.rumors?.includes(id) };
}
/* холст: рельеф + дороги + туман */
function paintMap(cv, opts) {
  const o = opts || {}; const width = Math.max(200, o.width); const t = width / MAP_W; const H = t * MAP_H;
  const Q = Math.min(o.hires ? 2 : 2, Math.max(1, window.devicePixelRatio || 1) * (o.hires ? 1.25 : 1), 2000 / width);
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
      fd.data[o4] = 14 + tone * 16; fd.data[o4 + 1] = 22 + tone * 18; fd.data[o4 + 2] = 28 + tone * 20; fd.data[o4 + 3] = a * 236;
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
  if (o.region && base.land && !seen) { const r = document.createElement("div"); r.className = "map-region"; r.style.cssText = pos(base.land[0], Math.max(1.4, base.land[1] - 2.2)); r.textContent = WD.name; layer.append(r); }
  if (o.markers === false) return;
  outerEntries().forEach(([id, p]) => {
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
    const mw = () => Math.floor(Math.min(view.clientWidth, Math.max(320, (innerHeight - 290) * MAP_W / MAP_H))); box.style.width = mw() + "px"; box.style.margin = "0 auto";
    const draw = () => renderMap(box, { width: mw(), fog: true, hires: true, region: true, pick });
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

/* =========================================================================
   HOME
   ========================================================================= */
function showScreen(id) {
  ["screen-home", "screen-create", "screen-game"].forEach(s => document.getElementById(s).hidden = s !== id);
  const inGame = id === "screen-game";
  document.getElementById("btn-home").hidden = !inGame; document.getElementById("pill-mode").hidden = !inGame; document.getElementById("btn-journal").hidden = !inGame; document.getElementById("btn-settings").hidden = !inGame;
  document.querySelector(".nav-links").style.visibility = inGame ? "hidden" : "";
  document.querySelectorAll(".nav-links button").forEach(b => b.removeAttribute("aria-current"));
  document.querySelector(`.nav-links [data-go=${id === "screen-create" ? "new" : "home"}]`)?.setAttribute("aria-current", "page");
}
function ago(ts) { const m = Math.round((Date.now() - ts) / 60000); if (m < 1) return "только что"; if (m < 60) return m + " мин назад"; const h = Math.round(m / 60); if (h < 24) return h + " ч назад"; return Math.round(h / 24) + " дн назад"; }
function renderHome() {
  setMood("menu"); setAmbience(null);
  showScreen("screen-home"); const idx = campIndex(); const el = document.getElementById("home");
  const sh = makeDefaultWorld(); Object.keys(sh.npcs).forEach(id => { const u = imgCache[sh.id + ":" + id]; if (u) sh.npcs[id].img = u; });
  const card = (id, cls) => { const n = sh.npcs[id]; return `<figure class="card-f ${cls}" style="margin:0">${npcPh(id, "", sh)}<figcaption class="cap"><b>${esc(n.name)}</b><small>${esc(n.role)}</small></figcaption></figure>`; };
  el.innerHTML = `<section class="hero"><div class="wrap">
    <div><div class="eyebrow">ИИ-мастер · правила 5e</div>
      <h1>Мир, который <em>помнит</em> каждое ваше решение</h1>
      <p class="lead">Рассказчик создаёт новую местность, тайну и людей для каждой кампании. Вы пишете что угодно, а броски, хиты и ячейки заклинаний честно считает движок правил.</p>
      <div class="ctas"><button class="btn primary big" type="button" id="h-new">Начать кампанию</button>${idx.length ? `<button class="btn big" type="button" id="h-cont">Продолжить: ${esc(idx[0].hero)}</button>` : `<button class="btn ghost big" type="button" id="h-how">Как это устроено</button>`}</div>
      <div class="meta"><span><b>4</b>класса</span><span><b>4</b>биома</span><span><b>d20</b>на сервере, не у ИИ</span></div></div>
    <div class="stage" aria-hidden="true"><div class="stage-map">${mapMarkup("hero-map", "")}</div>${card("marta", "f1")}${card("ilva", "f2")}${card("ost", "f3")}
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
  requestAnimationFrame(() => { const box = document.getElementById("hero-map"); if (!box) return; const prev = WD; setWorld(sh); renderMap(box, { width: box.clientWidth || 500, fog: false, markers: false }); if (prev) setWorld(prev); else WD = null; });
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
function openCampaign(id) { const s = loadCamp(id); if (!s) return; S = s; S.feed = (S.feed || []).filter(e => !(e.t === "narr" && !e.text)).map(e => ({ ...e, streaming: false })); setWorld(S.wd); const wasAway = Date.now() - (S.updated || 0) > 20 * 60 * 1000; startGame(false); if (wasAway) addRecap(); }

/* =========================================================================
   CREATION
   ========================================================================= */
const STEP_NAMES = ["Мир", "Раса", "Класс", "Характеристики", "Навыки", "Облик", "Рассказчик"];
const STD = [15, 14, 13, 12, 10, 8];
const PB_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
let forgeCtl = null;
function newDraft() {
  return { step: 0, world: null, worlds: [makeDefaultWorld()], forge: { biome: "coast", tone: "grim", magic: "rare", genre: "mystery", season: "autumn", culture: "auto", settle: "village", size: "normal", danger: "mid", wish: "", stage: -1, err: "" },
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
  left.append(optRow("Окружение", BIOMES, "biome"), optRow("Жанр", GENRES, "genre"), optRow("Тон", TONES, "tone"));
  const more = document.createElement("div"); more.className = "forge-more";
  more.innerHTML = [["Время года", SEASONS, "season"], ["Культура и имена", CULTURES, "culture"], ["Поселение", SETTLES, "settle"], ["Размер мира", SIZES, "size"], ["Опасность", DANGERS, "danger"], ["Магия", MAGICS, "magic"]]
    .map(([l, dict, k]) => `<label class="fm"><span>${l}</span><select data-k="${k}" ${D.forge.stage >= 0 ? "disabled" : ""}>${Object.entries(dict).map(([v, t]) => `<option value="${v}" ${D.forge[k] === v ? "selected" : ""}>${t}</option>`).join("")}</select></label>`).join("");
  more.querySelectorAll("select").forEach(sel => sel.onchange = () => { D.forge[sel.dataset.k] = sel.value; }); left.append(more);
  left.insertAdjacentHTML("beforeend", `<div class="field" style="margin-bottom:12px"><label for="f-wish">Пожелания (необязательно)</label><textarea id="f-wish" maxlength="300" placeholder="Например: ведьма на болотах, пропавшие дети, никаких драконов" ${D.forge.stage >= 0 ? "disabled" : ""}>${esc(D.forge.wish)}</textarea></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" type="button" id="f-forge" ${D.forge.stage >= 0 ? "disabled" : ""}>Сотворить мир</button>${D.forge.stage >= 0 ? `<button class="btn" type="button" id="f-cancel">Отменить</button>` : ""}</div>
    ${D.forge.err ? `<p class="err">${esc(D.forge.err)}</p>` : ""}${retryBtnHTML()}
    ${D.forge.stage >= 0 ? `<ol class="stages">${FORGE_STAGES.map((s, i) => `<li class="${i < D.forge.stage ? "ok" : i === D.forge.stage ? "run" : ""}"><i>${i < D.forge.stage ? "✓" : ""}</i>${s}</li>`).join("")}</ol>` : ""}`);
  left.querySelector("#f-wish").oninput = e => { D.forge.wish = e.target.value; };
  left.querySelector("#f-forge").onclick = runForge; left.querySelector("#f-cancel")?.addEventListener("click", () => forgeCtl?.abort());
  const right = document.createElement("div"); right.className = "forge-box";
  right.innerHTML = `<h3>Выбрать мир</h3><p>Ваши сотворённые миры и готовый мир для быстрого старта.</p><div class="world-list" id="wlist"></div>`;
  const list = right.querySelector("#wlist");
  D.worlds.forEach((w, i) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "world-pick"; b.setAttribute("aria-pressed", String(D.world === w)); b.disabled = D.forge.stage >= 0;
    b.innerHTML = `<span class="eyebrow">${i === D.worlds.length - 1 ? "Готовый мир" : "Сотворён ИИ"} · ${BIOMES[w.biome] || ""}</span><b>${esc(w.name)}</b>${w.tagline ? `<span class="tagline">${esc(w.tagline)}</span>` : ""}<small>${esc(w.public)}</small>
      ${D.world === w ? `${mapMarkup("mini-map", "mini")}<small><b style="font-family:var(--ui);font-size:12.5px">Задание:</b> ${esc(w.quest)}</small>` : ""}`;
    b.onclick = () => { D.world = w; D.bg = null; queueWorldPortraits(w); renderCreate(); };
    list.append(b);
    if (D.world === w) { const cast = document.createElement("div"); cast.className = "cast"; cast.innerHTML = Object.entries(w.npcs).map(([id, n]) => `<figure>${npcPh(id, "", w)}<figcaption>${esc(n.name)}<br><span style="color:var(--dim)">${esc(n.role)}</span></figcaption></figure>`).join(""); b.append(cast); }
    if (D.world === w) requestAnimationFrame(() => { const box = b.querySelector(".map"); if (!box) return; const prev = WD; setWorld(w); renderMap(box, { fog: false }); if (prev) setWorld(prev); });
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
  ${modelPickerHTML("look-model", true)}
  <div class="field"><button class="btn primary" type="button" id="f-photo">${D.img ? "Другой вариант" : "Создать фото-портрет"}</button><small id="f-photo-st">${esc(imgNote)}</small></div></div>`;
  body.append(f);
  const nm = f.querySelector("#f-name"); nm.oninput = () => { D.name = nm.value; document.getElementById("btn-next").disabled = !stepValid(5); document.getElementById("step-hint").textContent = stepValid(5) ? "Можно дальше" : STEP_HINTS[5]; renderHeroCard(); };
  f.querySelectorAll("#f-gender button").forEach(b => { b.setAttribute("aria-pressed", String(D.gender === b.dataset.v)); b.onclick = () => { D.gender = b.dataset.v; renderCreate(); }; });
  f.querySelector("#f-sl1").oninput = e => { D.sl1 = +e.target.value; }; f.querySelector("#f-sl2").oninput = e => { D.sl2 = +e.target.value; };
  f.querySelector("#f-about").oninput = e => { D.about = e.target.value; };
  f.querySelector("#f-look").oninput = e => { D.lookDesc = e.target.value; };
  f.querySelector("#f-story").onclick = () => writeBackstory(f.querySelector("#f-story"), f.querySelector("#f-story-st"));
  bindModelPicker(f, "look-model");
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
    world: { loc: wd.start, visited: [wd.start], seen: [], enemies, npcs, combat: false, facts: [], quest: wd.quest, flags: {}, time: { day: 1, part: 0 }, threat: 0, met: [], notes: {}, rumors: [] }, suggestions: [], settings: { len: "normal", voice: false } };
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
function renderAll() { refreshPeople(); renderTop(); renderSheet(); renderWorld(); renderSugg(); }
function renderTop() { renderScene(); document.getElementById("pill-mode").textContent = "Режим: " + MODES[S.mode].name; }
function renderScene() {
  if (!S) return; const loc = POIS[S.world.loc]; const el = document.getElementById("scene");
  el.innerHTML = `<div class="scene-inner"><div style="min-width:0;flex:1"><div class="eyebrow">${esc(WD.name)}${S.world.combat ? " · бой" : ""}</div><h2>${esc(loc.name)}</h2><p>${esc(loc.short || "")}</p></div><div class="people" id="scene-people"></div></div>`;
  const tm = worldTime(); const th = S.world.threat || 0; S.world.met = S.world.met || [];
  el.querySelector(".scene-inner").insertAdjacentHTML("beforeend", `<div class="clockbox" title="Время и часы угрозы"><span class="eyebrow">День ${tm.day} · ${DAY_PARTS[tm.part]}</span><span class="threat ${th >= 5 ? "hot" : ""}" aria-label="Угроза ${th} из 6">${Array.from({ length: 6 }, (_, i) => `<i class="${i < th ? "on" : ""}"></i>`).join("")}</span><small>угроза</small></div>`);
  { const cb = el.querySelector(".clockbox"); const rv = S.world.rep || 0; if (cb) cb.insertAdjacentHTML("beforeend", `<span class="rep-l ${rv <= -10 ? "bad" : rv >= 10 ? "good" : ""}" title="Репутация в поселении: ${rv}">${weatherNow().name} · ${repLabel(rv)}</span>`); }
  loc.npcs.forEach(id => { if (NPCS[id]) { wantPortrait(WD, id, 1); if (!S.world.met.includes(id) && S.world.visited.includes(S.world.loc) && (!NPCS[id].bld || POIS[S.world.loc].inner)) S.world.met.push(id); } });
  const pp = el.querySelector("#scene-people");
  loc.npcs.filter(id => NPCS[id]).forEach(id => { const b = document.createElement("button"); b.type = "button"; b.className = "person"; b.title = `Обратиться: ${NPCS[id].name}`;
    b.innerHTML = `${npcPh(id)}<small>${esc(NPCS[id].name)}</small>`; b.onclick = () => { const inp = document.getElementById("act-input"); inp.value = `${NPCS[id].name}, `; inp.focus(); }; pp.append(b); });
}
function renderSheet() {
  const c = C(); const cls = CLASSES[c.cls]; const el = document.getElementById("sheet"); el.style.setProperty("--cls", cls.color);
  const hpP = c.hp / c.maxHp; const hpCol = hpP > .5 ? "var(--kelp)" : hpP > .25 ? "var(--lantern)" : "var(--ember)"; const nx = nextXP(c); const canLevel = nx != null && c.xp >= nx; const prevX = XP_LEVELS[c.level - 1] || 0;
  let html = `<div class="who">${heroPh(c)}<div><div class="nm">${esc(c.name)}</div>${c.epithet ? `<div class="sub" style="color:var(--lantern);font-style:italic">${esc(c.epithet)}</div>` : ""}<div class="sub">${RACES[c.race].name} · ${cls.name} · ур. ${c.level}</div></div></div>
  ${canLevel ? `<button class="levelup" type="button" id="btn-lvl">Новый уровень! Повысить до ${c.level + 1}-го</button>` : ""}
  <div class="hp-block"><div class="row"><span class="eyebrow">Хиты</span><span class="hpn">${c.hp}<small> / ${c.maxHp}</small></span></div><div class="bar hp-bar"><i style="width:${hpP * 100}%;background:${hpCol}"></i></div>
  <div class="bar" style="height:4px;margin-top:4px"><i style="width:${nx ? Math.min(100, (c.xp - prevX) / (nx - prevX) * 100) : 100}%;background:var(--lantern)"></i></div><div class="xp-row"><span>${nx ? `Опыт ${c.xp} / ${nx}` : `Опыт ${c.xp} · максимум прототипа`}</span><span>${fmtMoney(purse(c))}</span></div></div>
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
    merchantsHere().slice(0, 2).forEach(m => tb.prepend(actBtn(`Торговать: ${m.name}`, `${MERCH[m.type].title} · товар, цены, торг`, "лавка", busy || S.world.combat, () => openShop(m))));
    if (c.cls === "fighter") tb.append(actBtn("Второе дыхание", "Восстановить 1d10 + уровень HP", c.secondWind ? "1 раз" : "потрачено", busy || !c.secondWind || c.hp >= c.maxHp, () => {
      const d = rollDice("1d10"); const got = healHero(d.total + c.level); c.secondWind = false; pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · Второе дыхание (${d.text} +${c.level})` }] }); after(); }));
    tb.append(actBtn("Короткий отдых", "Потратить кость хитов: 1d" + cls.hd + fmt(mod(c.scores.con)), `костей: ${c.hitDice}`, busy || S.world.combat || c.hitDice < 1 || c.hp >= c.maxHp, shortRest));
    tb.append(actBtn("Долгий отдых", POIS[S.world.loc].rest ? "Полное восстановление" : "Только в безопасном месте для ночлега", "8 часов", busy || S.world.combat || !POIS[S.world.loc].rest, longRest));
  } else if (sheetTab === "skills") {
    Object.keys(SKILLS).sort((a, b) => SKILLS[a][0].localeCompare(SKILLS[b][0], "ru")).forEach(k => tb.insertAdjacentHTML("beforeend", `<div class="sk ${c.skills.includes(k) ? "pro" : ""}"><span>${SKILLS[k][0]} <small style="color:var(--dim)">${ABIL_RU[SKILLS[k][1]]}</small></span><span class="b">${fmt(skillBonus(k))}</span></div>`));
    tb.insertAdjacentHTML("beforeend", `<div class="sk"><span>Пассивная Внимательность</span><span class="b">${10 + skillBonus("perception")}</span></div>`);
  } else {
    renderInventory(tb);
    tb.insertAdjacentHTML("beforeend", `<p class="empty" style="margin-top:8px">${esc(c.story)}</p>`);
  }
}
function actBtn(t, d, k, dis, fn) { const b = document.createElement("button"); b.type = "button"; b.className = "act"; b.disabled = !!dis; b.innerHTML = `<span><span class="t">${esc(t)}</span><span class="d">${esc(d)}</span></span><span class="k">${esc(k)}</span>`; b.onclick = fn; return b; }
function attLabel(v) { return v >= 25 ? ["доверяет", "pos"] : v >= 8 ? ["дружелюбно", "pos"] : v <= -25 ? ["враждебно", "neg"] : v <= -8 ? ["настороженно", "neg"] : ["нейтрально", "neu"]; }
/* =========================================================================
   ПЛАН ЛОКАЦИИ — вид сверху: мебель, люди, враги, предметы
   ========================================================================= */
const SC_W = 18, SC_H = 12, CS = 32;
const SC_BY_KIND = { street: "street", inn: "inn", house: "house", hut: "hut", chapel: "chapel", shrine: "shrine", tower: "tower", cave: "cave", mine: "mine", ruin: "ruin", camp: "camp", farm: "farm", pier: "pier", wreck: "wreck", grove: "forest", bridge: "bridge", well: "square", gate: "gate" };
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
function sceneTpl(id) { return tplOfPlace(POIS[id]); }
class ScGrid {
  constructor() { this.c = new Uint8Array(SC_W * 2 * SC_H * 2); }
  cells(x, y, w, h, f) { const x0 = Math.max(0, Math.floor((x - w / 2) * 2)), x1 = Math.min(SC_W * 2 - 1, Math.ceil((x + w / 2) * 2) - 1), y0 = Math.max(0, Math.floor((y - h / 2) * 2)), y1 = Math.min(SC_H * 2 - 1, Math.ceil((y + h / 2) * 2) - 1);
    for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) if (f(j * SC_W * 2 + i) === false) return false; return true; }
  mark(x, y, w, h) { this.cells(x, y, w, h, k => { this.c[k] = 1; }); }
  free(x, y, w, h) { if (x - w / 2 < 0 || y - h / 2 < 0 || x + w / 2 > SC_W || y + h / 2 > SC_H) return false; return this.cells(x, y, w, h, k => !this.c[k]); }
  block(fn) { for (let j = 0; j < SC_H * 2; j++) for (let i = 0; i < SC_W * 2; i++) if (fn((i + .5) / 2, (j + .5) / 2)) this.c[j * SC_W * 2 + i] = 1; }
}
function scAdd(sc, k, x, y, w, h, o = {}) {
  const d = OBJ[k]; const ob = { k, x, y, w, h, r: o.r || 0, v: o.v ?? sc.R(), label: o.label || d?.[0] || "", acc: o.acc || d?.[1] || o.label || "", search: o.search ?? !!d?.[2], act: o.act ?? (!!d || !!o.label), id: "o" + sc.objs.length, under: !!o.under, bld: o.bld, d: o.d };
  sc.objs.push(ob); if (!o.ghost) sc.g.mark(x, y, o.bw ?? w, o.bh ?? h); const L = OBJ_LIGHT[k]; if (L && !o.nolight) sc.lights.push({ x, y, r: L[0], c: L[1] }); return ob;
}
function scScatter(sc, k, n, box, w, h, o = {}) {
  const out = []; const R = sc.R; const pad = o.pad ?? .5;
  for (let t = 0; out.length < n && t < n * 40; t++) {
    const ww = o.vary ? w * (.75 + R() * .5) : w, hh = o.vary ? h * (.75 + R() * .5) : h;
    const x = box[0] + ww / 2 + R() * (box[2] - box[0] - ww), y = box[1] + hh / 2 + R() * (box[3] - box[1] - hh);
    if (o.avoid && o.avoid(x, y)) continue;
    if (o.spread && sc.objs.some(q => q.k === k && Math.hypot(q.x - x, q.y - y) < o.spread)) continue;
    if (o.nofree ? (x - ww / 2 > -1.5 && y - hh / 2 > -1.5 && x + ww / 2 < SC_W + 1.5 && y + hh / 2 < SC_H + 1.5) : sc.g.free(x, y, ww + pad, hh + pad)) out.push(scAdd(sc, k, x, y, ww, hh, { ...o, r: o.rot ? Math.round(R() * 360) : (o.r || 0) }));
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
    scScatter(sc, "tree", 4, [0, 0, SC_W, SC_H], 2.4, 2.4, { pad: 0, ghost: true, act: false, nofree: true, spread: 2, avoid: (x, y) => x > 1.6 && x < 16.4 && y > .7 && y < 11.5 || (x > 7 && x < 11 && y > 10) });
    sc.spawn = { x: 9, y: 9.6 }; sc.foes = { x: 9, y: 4 }; sc.outdoorTrim = true;
  },
  hut(sc) {
    const R = sc.R; sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H], dark: true }, { t: "dirt", box: [4.5, 2.5, 13.5, 9.5] }];
    scRoom(sc, 4.5, 2.5, 13.5, 9.5, { door: 9, mat: "log", windows: [{ s: "t", p: 7 }] });
    sc.g.block((x, y) => !(x > 4.85 && x < 13.15 && y > 2.85 && y < 9.15) && !(y > 9.4));
    scAdd(sc, "campfire", 9, 6, 1.3, 1.3, { label: "очаг", acc: "очаг" }); scAdd(sc, "cauldron", 10.3, 6.9, .9, .9); scAdd(sc, "bedroll", 12, 4.1, 1.2, 2, { label: "лежанка", acc: "лежанку" });
    scAdd(sc, "table", 6.3, 4, 1.8, 1, { label: "стол с травами", acc: "стол с травами" }); scAdd(sc, "herbs", 6.3, 3.05, 2.4, .35, { ghost: true }); scAdd(sc, "sack", 5.6, 8.4, 1, .9); scAdd(sc, "shelf", 11.5, 2.95, 2.2, .45);
    sc.anchors.stand.push({ x: 8, y: 5.2 }, { x: 10, y: 5.1 });
    scScatter(sc, "tree", 7, [0, 0, SC_W, SC_H], 2.6, 2.6, { pad: 0, ghost: true, act: false, nofree: true, spread: 2, avoid: (x, y) => x > 3.4 && x < 14.6 && y > 1.6 && y < 10.8 });
    scScatter(sc, "bush", 6, [0, 0, SC_W, SC_H], 1.2, 1.2, { pad: 0, ghost: true, act: false, nofree: true, spread: 2, avoid: (x, y) => x > 3.8 && x < 14.2 && y > 1.9 && y < 10.6 });
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
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 - Math.PI / 2 + .45; scAdd(sc, "stone", 9 + Math.cos(a) * 3.4, 6 + Math.sin(a) * 2.9, 1.15, .85, { r: Math.round(a * 57 + 90) }); }
    scAdd(sc, "altar", 9, 6, 1.6, 1.1, { label: "жертвенник", acc: "жертвенник" }); scAdd(sc, "candle", 8.4, 5.6, .25, .25, { ghost: true, act: false }); scAdd(sc, "candle", 9.6, 5.6, .25, .25, { ghost: true, act: false });
    scScatter(sc, "tree", 11, [0, 0, SC_W, SC_H], 2.6, 2.6, { pad: 0, ghost: true, act: false, nofree: true, spread: 2, avoid: (x, y) => ((x - 9) / 6.2) ** 2 + ((y - 6) / 4.8) ** 2 < 1 || (x > 7.5 && x < 11 && y > 8) });
    scScatter(sc, "bush", 6, [0, 0, SC_W, SC_H], 1.1, 1.1, { pad: .1, ghost: true, act: false, nofree: true, spread: 1, avoid: (x, y) => ((x - 9) / 4.8) ** 2 + ((y - 6) / 3.9) ** 2 < 1 });
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
    sc.spawn = { x: 9, y: 10.4 }; sc.foes = { x: 9.5, y: 3.4 }; sc.dark = .36;
  },
  mine(sc) { SC_BUILD.cave(sc, true); },
  ruin(sc) {
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H] }, { t: "flag", box: [3, 2, 15, 10], broken: true }];
    const W = [[3, 2, 7, 2.5], [3, 2, 3.5, 6], [11, 2, 15, 2.5], [14.5, 2, 15, 7.5], [3, 8.5, 3.5, 10], [12, 9.5, 15, 10]];
    W.forEach(([x0, y0, x1, y1]) => scAdd(sc, "wallseg", (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0, { act: false }));
    for (const [x, y, f] of [[6, 4.5], [12, 4.5], [6, 7.6, 1], [12, 7.6]]) f ? scAdd(sc, "colfall", x + .9, y, 2.6, .7, { r: 25, label: "упавшая колонна", acc: "упавшую колонну" }) : scAdd(sc, "pillar", x, y, .9, .9, { act: false });
    scAdd(sc, "statue", 9, 3.6, 1.1, 1.1, { label: "разбитая статуя", acc: "разбитую статую" }); scScatter(sc, "rubble", 4, [3, 2, 15, 10], 1.3, 1.1, { vary: true, rot: true });
    scScatter(sc, "tree", 5, [0, 0, SC_W, SC_H], 2.5, 2.5, { pad: 0, ghost: true, act: false, nofree: true, spread: 2, avoid: (x, y) => x > 2 && x < 16 && y > 1 && y < 11 });
    scScatter(sc, "bush", 6, [0, 0, SC_W, SC_H], 1.1, 1.1, { pad: .1, ghost: true, act: false, nofree: true, spread: 1, avoid: (x, y) => x > 4 && x < 14 && y > 3 && y < 9 });
    sc.spawn = { x: 9, y: 10.8 }; sc.foes = { x: 9, y: 5.2 };
  },
  camp(sc) {
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H] }, { t: "dirtc", c: [9, 6.2], r: 4 }];
    scAdd(sc, "campfire", 9, 6.2, 1.4, 1.4); for (const a of [0.3, 2.3, 4.2]) scAdd(sc, "log", 9 + Math.cos(a) * 1.75, 6.2 + Math.sin(a) * 1.5, 1.6, .5, { r: Math.round(a * 57 + 90), act: false });
    for (const a of [3.6, 5.3, 1.3]) scAdd(sc, "tent", 9 + Math.cos(a) * 4.1, 6.2 + Math.sin(a) * 3.3, 2.2, 1.8, { r: Math.round(a * 57 + 90) });
    scAdd(sc, "bedroll", 12.4, 8.6, .9, 1.8, { r: 15 }); scAdd(sc, "crate", 5.4, 8.8, 1, 1); scAdd(sc, "sack", 6.3, 9.3, .9, .7);
    sc.anchors.sit.push({ x: 9 + Math.cos(.3) * 1.75, y: 6.2 + Math.sin(.3) * 1.5 }, { x: 9 + Math.cos(2.3) * 1.75, y: 6.2 + Math.sin(2.3) * 1.5 }, { x: 9 + Math.cos(4.2) * 1.75, y: 6.2 + Math.sin(4.2) * 1.5 });
    scScatter(sc, "tree", 9, [0, 0, SC_W, SC_H], 2.6, 2.6, { pad: 0, ghost: true, act: false, nofree: true, spread: 2, avoid: (x, y) => ((x - 9) / 6.6) ** 2 + ((y - 6.2) / 5) ** 2 < 1 });
    sc.spawn = { x: 9, y: 10.6 }; sc.foes = { x: 9, y: 2.6 };
  },
  farm(sc) {
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H] }, { t: "field", box: [.6, .6, 7.8, 11.4] }, { t: "path", pts: [[10, 12.4], [10.4, 8], [12, 5.5]] }];
    sc.g.block((x, y) => x < 7.9); for (let y = 1; y < 11.5; y += 1.4) scAdd(sc, "fencep", 8.4, y, .25, .25, { ghost: true, act: false });
    sc.objs.push({ k: "fence", x: 8.4, y: 6, w: .2, h: 10.8, act: false, id: "ofence" });
    scBlds(sc); scAdd(sc, "hay", 10.4, 2.4, 1.6, 1.1); scAdd(sc, "hay", 10.6, 3.8, 1.3, .9, { r: 10 });
    scAdd(sc, "well", 13.2, 7.8, 1.3, 1.3); scAdd(sc, "cart", 15.8, 10.2, 1.4, 2.4, { r: 80 }); scAdd(sc, "barrel", 11.8, 9.8, .9, .9);
    sc.anchors.work.push({ x: 7, y: 4 }, { x: 6, y: 8 }); sc.spawn = { x: 10.4, y: 10.8 }; sc.foes = { x: 13, y: 5.5 };
    scScatter(sc, "tree", 2, [9, 5, 18, 12], 2.4, 2.4, { pad: 0, ghost: true, act: false, nofree: true, spread: 2, avoid: (x, y) => Math.abs(x - 10.4) < 2 || Math.hypot(x - 13.6, y - 7.8) < 2 });
  },
  pier(sc) {
    const shore = y => 6.6 + Math.sin(y * .55 + 1.2) * .7;
    sc.floor = [{ t: "dirt", box: [0, 0, SC_W, SC_H] }, { t: "sand", shore: y => shore(y) + 3.2 }, { t: "water", shore }, { t: "deck", box: [.6, 4.1, 9.4, 6.3] }, { t: "deck", box: [2.2, 8.4, 6.8, 9.5] }];
    sc.g.block((x, y) => x < shore(y) + .2 && !(x > .6 && x < 9.4 && y > 4.1 && y < 6.3) && !(x > 2.2 && x < 6.8 && y > 8.4 && y < 9.5));
    for (let x = 1; x < 9.4; x += 2) { scAdd(sc, "post", x, 4, .3, .3, { ghost: true, act: false }); scAdd(sc, "post", x, 6.4, .3, .3, { ghost: true, act: false }); }
    scAdd(sc, "boat", 3.4, 3.05, 3, 1.2, { ghost: true }); scAdd(sc, "boat", 4.6, 7.35, 2.7, 1.1, { ghost: true, r: 180, v: .3 }); scAdd(sc, "boat", 1.6, 10.6, 2.6, 1.1, { ghost: true, r: -20, v: .7 });
    scAdd(sc, "net", 6.4, 5.2, 1.6, 1.2, { r: 12 }); scAdd(sc, "lamppost", 1.1, 4.4, .4, .4, { act: false }); scAdd(sc, "barrel", 10.4, 3.4, .9, .9); scAdd(sc, "barrel", 11.2, 2.7, .9, .9); scAdd(sc, "crate", 10.6, 7.7, 1.05, 1.05, { r: 8 });
    scAdd(sc, "net", 12.4, 9.6, 1.8, 1.3, { label: "сохнущие сети", acc: "сохнущие сети", r: -8 }); scBlds(sc);
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
    scScatter(sc, "tree", 17, [-1, -1, SC_W + 1, SC_H + 1], 2.8, 2.8, { pad: -.4, ghost: true, act: false, nofree: true, spread: 2.1, avoid: near });
    scScatter(sc, "rock", 3, [1, 1, 17, 11], 1.3, 1.1, { vary: true, rot: true, act: false, avoid: near }); scScatter(sc, "stump", 2, [1, 1, 17, 11], .8, .8, { act: false, avoid: near });
    scScatter(sc, "bush", 9, [0, 0, SC_W, SC_H], 1.1, 1.1, { pad: .1, ghost: true, act: false, nofree: true, spread: 1, avoid: near }); sc.g.block((x, y) => !near(x, y) && sc.objs.some(o => o.k === "tree" && Math.hypot(o.x - x, o.y - y) < .9));
    sc.spawn = { x: 8.8, y: 10.8 }; sc.foes = { x: 8.2, y: 4.4 }; sc.dark = .12;
  },
  bridge(sc) {
    sc.floor = [{ t: "grass", box: [0, 0, SC_W, SC_H] }, { t: "river", x0: 7.2, x1: 10.8 }, { t: "path", pts: [[-0.4, 6], [6.8, 6.1]] }, { t: "path", pts: [[11.2, 6.1], [18.4, 6.3]] }, { t: "deck", box: [6.5, 5.1, 11.5, 7.1], vert: true }];
    sc.g.block((x, y) => x > 7 && x < 11 && !(y > 5.1 && y < 7.1));
    for (const x of [6.7, 8.4, 10, 11.3]) { scAdd(sc, "post", x, 5.05, .3, .3, { ghost: true, act: false }); scAdd(sc, "post", x, 7.15, .3, .3, { ghost: true, act: false }); }
    scScatter(sc, "tree", 7, [0, 0, SC_W, SC_H], 2.6, 2.6, { pad: 0, ghost: true, act: false, nofree: true, spread: 2, avoid: (x, y) => (x > 6 && x < 12) || Math.abs(y - 6.1) < 2 });
    scScatter(sc, "rock", 5, [6.4, 0, 11.6, SC_H], .9, .8, { vary: true, rot: true, act: false, ghost: true, pad: 0, avoid: (x, y) => Math.abs(y - 6.1) < 1.6 });
    scScatter(sc, "reeds", 6, [6, 0, 12, SC_H], 1, 1, { ghost: true, act: false, pad: 0, avoid: (x, y) => Math.abs(y - 6.1) < 1.8 || (x > 7.6 && x < 10.4) });
    sc.spawn = { x: 2.4, y: 6.6 }; sc.foes = { x: 14.6, y: 6.1 };
  },
  square(sc) {
    sc.floor = [{ t: "cobble", box: [0, 0, SC_W, SC_H] }];
    scBlds(sc).forEach(sl => scAdd(sc, "roof", sl.x, sl.y, sl.w, sl.h, { label: "дом", acc: "дом", act: false, v: sl.x / 18 }));
    scAdd(sc, "well", 9, 6.6, 1.5, 1.5); scAdd(sc, "stall", 4.4, 8.4, 2.6, 1.4, { v: .2 }); scAdd(sc, "stall", 13.8, 8.6, 2.6, 1.4, { v: .7 }); scAdd(sc, "cart", 15.8, 5.6, 1.4, 2.4, { r: 80 });
    scAdd(sc, "barrel", 6.2, 9.6, .85, .85); scAdd(sc, "crate", 12, 9.7, 1, 1); scAdd(sc, "lamppost", 6.6, 4.4, .4, .4, { act: false }); scAdd(sc, "lamppost", 11.6, 4.4, .4, .4, { act: false });
    scAdd(sc, "tree", 1.6, 10.2, 2.6, 2.6, { ghost: true, act: false }); sc.anchors.work.push({ x: 4.4, y: 7.25 }, { x: 13.8, y: 7.45 }); sc.anchors.stand.push({ x: 8, y: 8.2 }, { x: 10.6, y: 5.6 }, { x: 3.4, y: 5.4 }, { x: 12.6, y: 4.6 }); sc.spawn = { x: 9, y: 10.8 }; sc.foes = { x: 9, y: 4.6 };
  },
  gate(sc) {
    sc.floor = [{ t: "dirt", box: [0, 0, SC_W, SC_H] }, { t: "cobble", box: [0, 3, SC_W, SC_H] }, { t: "path", pts: [[9, -0.4], [9, 3.6]], w: 2 }];
    scAdd(sc, "citywall", 4, 2.4, 8, 1.1, { act: false }); scAdd(sc, "citywall", 14, 2.4, 8, 1.1, { act: false }); scAdd(sc, "towerb", 7.4, 2.4, 1.9, 1.9, { act: false }); scAdd(sc, "towerb", 10.6, 2.4, 1.9, 1.9, { act: false });
    sc.g.block((x, y) => y < 2.95 && !(x > 8.4 && x < 9.6)); scAdd(sc, "torch", 8.15, 3.2, .3, .3, { ghost: true, act: false }); scAdd(sc, "torch", 9.85, 3.2, .3, .3, { ghost: true, act: false });
    scAdd(sc, "table", 4.2, 5.4, 1.8, 1, { label: "стол стражи", acc: "стол стражи" }); scAdd(sc, "barrel", 3, 6.4, .9, .9); scAdd(sc, "brazier", 5.8, 6.2, .9, .9); scAdd(sc, "cart", 12.4, 8.6, 1.4, 2.4, { r: 95 }); scBlds(sc);
    scAdd(sc, "crate", 14.8, 9.4, 1, 1); sc.anchors.work.push({ x: 8.2, y: 4 }, { x: 9.8, y: 4 }); sc.spawn = { x: 9, y: 10.6 }; sc.foes = { x: 9, y: .9 };
  }
};
const sceneCache = new Map();
function sceneOf(id) {
  const key = WD.id + ":" + id; let sc = sceneCache.get(key); if (sc) return sc;
  sc = { id, tpl: sceneTpl(id), objs: [], rooms: [], lights: [], floor: [], anchors: { work: [], sit: [], stand: [], sleep: [] }, doors: {}, g: new ScGrid(), R: mulberry(hash(key)), spawn: { x: 9, y: 10.5 }, foes: { x: 9, y: 4 }, dark: 0 };
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
  const pools = { work: [...sc.anchors.work], sit: [...sc.anchors.sit], stand: [...sc.anchors.stand], sleep: [...sc.anchors.sleep] };
  const pick = kind => { const p = pools[kind] || []; while (p.length) { const i = Math.floor(R() * p.length); const a = p.splice(i, 1)[0]; if (!taken.some(q => Math.hypot(q.x - a.x, q.y - a.y) < .9)) return a; } return null; };
  const asleep = loc.inner && bldAsleep(id);
  (loc.npcs || []).filter(nid => NPCS[nid]).forEach(nid => { const n = NPCS[nid]; const zz = asleep ? pick("sleep") : null; if (zz) { taken.push(zz); out.push({ type: "npc", id: nid, x: zz.x, y: zz.y, asleep: true }); return; } const worker = /хозя|трактир|корчм|бармен|торгов|продав|кузнец|лавоч|жри|свящ|монах|сестр|отец|староста|страж|смотрит/i.test(n.role || "");
    const a = (worker && pick("work")) || pick("stand") || pick("sit") || null; const p = a || scFreeNear(sc, taken, sc.spawn.x + (R() - .5) * 8, sc.spawn.y - 2 - R() * 5, 5);
    taken.push(p); out.push({ type: "npc", id: nid, x: p.x, y: p.y }); });
  const [labels, counts] = SC_CROWD[sc.tpl] || [[], [0, 0, 0, 0]]; const foesHere = Object.keys(ENEMIES).some(e => ENEMIES[e].loc === id && S.world.enemies[e]?.alive);
  let n = st.crowd != null ? st.crowd : (labels.length && !foesHere ? counts[t.part] : 0); n = clamp(n - (loc.npcs || []).filter(x => NPCS[x]?.bld).length, 0, 8);
  for (let i = 0; i < n; i++) { const a = pick("sit") || pick("stand") || pick("work"); const p = a && !taken.some(q => Math.hypot(q.x - a.x, q.y - a.y) < .9) ? a : scFreeNear(sc, taken, 2 + R() * 14, 2 + R() * 8);
    taken.push(p); out.push({ type: "crowd", id: "c" + i, label: labels.length ? labels[Math.floor(R() * labels.length)] : "местный", x: p.x, y: p.y }); }
  const foes = Object.keys(ENEMIES).filter(e => ENEMIES[e].loc === id && S.world.enemies[e]);
  foes.forEach((e, i) => { const es = S.world.enemies[e]; if (!es.alive) { const p = scFreeNear(sc, [], sc.foes.x + (i - foes.length / 2) * 1.6, sc.foes.y + (i % 2) * .8, 3); out.push({ type: "corpse", id: e, x: p.x, y: p.y }); return; }
    if (!S.world.combat) return; const p = scFreeNear(sc, taken.concat(out.filter(q => q.type === "foe")), sc.foes.x + (i - (foes.length - 1) / 2) * 2.4, sc.foes.y + (i % 2) * 1.3, 4); taken.push(p); out.push({ type: "foe", id: e, x: p.x, y: p.y }); });
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
  const id = S.world.loc; const objs = sceneObjects(id).filter(o => o.act && !o.hidden && o.k !== "bldroof" && o.k !== "door"); const ppl = scenePeople(id); const hero = ppl[0];
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
    if (f.t === "shade") s += `<rect width="${W}" height="${H}" fill="#05080a" opacity=".55"/>`;
    else if (f.t === "planks") s += planks(f.box);
    else if (f.t === "deck") s += `<rect x="${f.box[0] * CS - 3}" y="${f.box[1] * CS + 5}" width="${(f.box[2] - f.box[0]) * CS + 6}" height="${(f.box[3] - f.box[1]) * CS}" fill="#000" opacity=".35"/>` + planks(f.box, true);
    else if (f.t === "flag") s += flags(f.box, f.broken);
    else if (f.t === "flagc") s += flags([f.c[0] - f.r, f.c[1] - f.r, f.c[0] + f.r, f.c[1] + f.r], false, [f.c[0], f.c[1], f.r]);
    else if (f.t === "grass" || f.t === "rockg") { const dark = f.dark || f.t === "rockg"; s += `<rect width="${W}" height="${H}" fill="${f.t === "rockg" ? "#2d3a2c" : dark ? "#283d25" : "#334d2c"}"/>` + blobs(f.box, f.t === "rockg" ? ["#3b4637", "#24301f", "#4a5148"] : ["#3d5a33", "#2a4224", "#466839", "#22361d"], 120, 12, 46, .35);
      s += seasonTint(f.box); for (let i = 0; i < 160; i++) { const x = R() * W, y = R() * H; s += `<path d="M${f1(x)} ${f1(y)} l-2 -6 M${f1(x)} ${f1(y)} l2 -7 M${f1(x)} ${f1(y)} l5 -5" stroke="${R() < .5 ? "#5c8247" : "#3f6334"}" stroke-width="1.1" opacity=".55"/>`; } }
    else if (f.t === "dirt") s += `<rect x="${f.box[0] * CS}" y="${f.box[1] * CS}" width="${(f.box[2] - f.box[0]) * CS}" height="${(f.box[3] - f.box[1]) * CS}" fill="#4a3a29"/>` + blobs(f.box, ["#5a4632", "#3c2f21", "#64503a"], 70, 8, 30, .45) + blobs(f.box, ["#7a6a55"], 60, 1, 2.4, .7) + (f.box[2] - f.box[0] >= SC_W - .1 ? seasonTint(f.box) : "");
    else if (f.t === "dirtc") s += `<ellipse cx="${f.c[0] * CS}" cy="${f.c[1] * CS}" rx="${f.r * CS * 1.15}" ry="${f.r * CS * .9}" fill="#4d3d2a" opacity=".85"/>` + blobs([f.c[0] - f.r, f.c[1] - f.r * .7, f.c[0] + f.r, f.c[1] + f.r * .7], ["#5d4a35", "#3c2f21"], 30, 8, 22, .4);
    else if (f.t === "cave") { s += `<rect width="${W}" height="${H}" fill="#3b352c"/>` + blobs(f.box, ["#463f34", "#2c2822", "#504839", "#35302a"], 110, 10, 44, .55) + blobs(f.box, ["#6e6656", "#24201b"], 120, 1, 2.8, .6); }
    else if (f.t === "cobble") { s += `<rect width="${W}" height="${H}" fill="#2c2a27"/>`; for (let y = 0; y < H; y += 13) for (let x = -(y % 26 ? 7 : 0); x < W; x += 15) s += `<rect x="${f1(x + 1 + R() * 2)}" y="${f1(y + 1 + R() * 2)}" width="${f1(11 + R() * 2)}" height="${f1(9 + R() * 2)}" rx="4" fill="hsl(${25 + R() * 20 | 0},${5 + R() * 6 | 0}%,${30 + R() * 12 | 0}%)"/>`; s += WD?.season === "winter" ? seasonTint([0, 0, SC_W, SC_H]) : ""; }
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
  if (sc.round) { const { cx, cy, r } = sc.round; s += `<g filter="url(#SCP-wsh)"><circle cx="${cx * CS}" cy="${cy * CS}" r="${r * CS}" fill="none" stroke="#585c58" stroke-width="18" stroke-dasharray="${(2 * Math.PI * r * CS) - 50} 50" stroke-dashoffset="${.75 * 2 * Math.PI * r * CS - 25}"/><circle cx="${cx * CS}" cy="${cy * CS}" r="${r * CS - 8}" fill="none" stroke="#8a8e88" stroke-width="2" opacity=".5" stroke-dasharray="${(2 * Math.PI * (r * CS - 8)) - 50} 50" stroke-dashoffset="${.75 * 2 * Math.PI * (r * CS - 8) - 25}"/></g>`; }
  if (sc.cave) { const { cx, cy, rx, ry, rad } = sc.cave; const pts = []; for (let a = 0; a < Math.PI * 2; a += .08) { let rr = rad(a); const bottom = Math.abs(a - Math.PI / 2) < .18; pts.push(`${f1((cx + Math.cos(a) * rx * rr) * CS)},${f1((cy + Math.sin(a) * ry * rr * (bottom ? 1.35 : 1)) * CS)}`); }
    s += `<path d="M0 0 H${SC_W * CS} V${SC_H * CS} H0 Z M${pts.join(" L")} Z" fill-rule="evenodd" fill="url(#${"SCP"}-rock)" stroke="#7a7262" stroke-width="3.5" stroke-linejoin="round" filter="url(#SCP-rim)"/><path d="M${pts.join(" L")} Z" fill="none" stroke="#000" stroke-opacity=".45" stroke-width="16" transform="translate(0,0)" style="mix-blend-mode:multiply"/>`; }
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
    case "bldroof": { const b = POIS[o.bld] || {}; const col = { house: "#5a3f2c", poor: "#77653f", rich: "#5c2a26", fisher: "#4c3a2a", farmhouse: "#5a3f2c", shop: "#7a4a24", smithy: "#3e3b38", barn: "#6b2f22", shed: "#4c3a2a", guard: "#4a4f55" }[b.bk] || "#5a3f2c";
      const thatch = b.bk === "poor"; const horiz = w >= h; const st = S ? bstate(o.bld) : {};
      s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="${thatch ? 8 : 1.5}" fill="${col}" stroke="#1d1510" stroke-width="3"/>`;
      s += horiz ? [...Array(Math.floor(h / 8))].map((_, i) => `<line x1="${-hw + 2}" y1="${f1(-hh + 4 + i * 8)}" x2="${hw - 2}" y2="${f1(-hh + 4 + i * 8)}" stroke="#1d1510" stroke-opacity="${thatch ? .25 : .4}" ${thatch ? 'stroke-dasharray="3 2"' : ""}/>`).join("") + `<line x1="${-hw}" y1="0" x2="${hw}" y2="0" stroke="#2a1d14" stroke-width="5"/><rect x="${-hw}" y="${-hh}" width="${w}" height="${hh}" fill="#fff" opacity=".07"/>`
        : [...Array(Math.floor(w / 8))].map((_, i) => `<line y1="${-hh + 2}" x1="${f1(-hw + 4 + i * 8)}" y2="${hh - 2}" x2="${f1(-hw + 4 + i * 8)}" stroke="#1d1510" stroke-opacity=".4"/>`).join("") + `<line y1="${-hh}" x1="0" y2="${hh}" x2="0" stroke="#2a1d14" stroke-width="5"/><rect x="${-hw}" y="${-hh}" width="${hw}" height="${h}" fill="#fff" opacity=".07"/>`;
      if (!["barn", "shed"].includes(b.bk)) { const cx = horiz ? hw * .5 : -hw * .45, cy = horiz ? -hh * .5 : -hh * .5; s += `<rect x="${f1(cx - 5)}" y="${f1(cy - 5)}" width="10" height="10" fill="#3a3a38" stroke="#1d1510"/>`;
        if (S && bldHome(o.bld).length) s += [0, 1].map(i => `<circle class="sc-smoke" style="animation-delay:-${i * 1.7}s" cx="${f1(cx)}" cy="${f1(cy - 4)}" r="5" fill="#c9c4b8" opacity=".3"/>`).join(""); }
      const dp = { b: [0, hh], t: [0, -hh], l: [-hw, 0], r: [hw, 0] }[o.d || "b"]; const vert = o.d === "l" || o.d === "r";
      s += `<rect x="${f1(dp[0] - (vert ? 4 : 10))}" y="${f1(dp[1] - (vert ? 10 : 4))}" width="${vert ? 8 : 20}" height="${vert ? 20 : 8}" fill="${st.broken ? "#24120a" : "#7a5434"}" stroke="#2a1a0e" stroke-width="1.5"/>`;
      if (st.broken) s += `<path d="M${f1(dp[0] - 8)} ${f1(dp[1] - 3)} l5 4 l4 -5 l5 6" stroke="#a07a4a" stroke-width="2" fill="none"/>`;
      if (S && st.known === tkey() && bldLocked(o.bld)) s += `<g transform="translate(${f1(dp[0] + (vert ? 0 : 16))},${f1(dp[1] + (vert ? 16 : 0))})"><rect x="-4" y="-2" width="8" height="7" rx="1" fill="#e0bf63" stroke="#5a4320"/><path d="M-2.5 -2 v-2.5 a2.5 2.5 0 0 1 5 0 v2.5" stroke="#e0bf63" stroke-width="1.6" fill="none"/></g>`;
      if (b.bk === "shop" || b.bk === "smithy") s += `<rect x="${f1(dp[0] + (vert ? -14 : 14))}" y="${f1(dp[1] + (vert ? 12 : -14))}" width="12" height="9" rx="1.5" fill="#c9a45a" stroke="#4a3418"/>`;
      break; }
    case "workbench": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2" fill="#7a5434" stroke="#2f1f12" stroke-width="2"/><path d="M${-hw * .7} ${-hh * .3} h${hw * .8} M${-hw * .6} ${hh * .3} l6 -6" stroke="#b9b2a2" stroke-width="2"/><rect x="${hw * .2}" y="${-3}" width="10" height="5" fill="#5a5f63"/><circle cx="${hw * .6}" cy="${hh * .35}" r="2.4" fill="#d9c9a0"/>`; break;
    case "loom": s = `<rect x="${-hw}" y="${-hh}" width="${w * .6}" height="${h}" fill="none" stroke="#5a3d26" stroke-width="3"/>${[...Array(6)].map((_, i) => `<line x1="${f1(-hw + 3 + i * w * .1)}" y1="${-hh + 2}" x2="${f1(-hw + 3 + i * w * .1)}" y2="${hh - 2}" stroke="#d8cdb0" stroke-width="1"/>`).join("")}<circle cx="${hw * .55}" cy="0" r="${hh * .7}" fill="none" stroke="#5a3d26" stroke-width="2.5"/><circle cx="${hw * .55}" r="2" fill="#5a3d26"/>`; break;
    case "potwheel": s = `<circle r="${hw}" fill="#5d5650" stroke="#2c2824" stroke-width="2"/><circle r="${hw * .55}" fill="#a0603a"/><circle r="${hw * .3}" fill="#6e3e24"/>`; break;
    case "pelt": s = `<path d="M${-hw} ${-hh * .3} q${hw * .3} ${-hh * .9} ${hw} ${-hh * .7} q${hw * .7} ${-hh * .2} ${hw} ${hh * .5} q${-hw * .2} ${hh * .8} ${-hw} ${hh * .5} q${-hw * .8} ${hh * .2} ${-hw} ${-hh * .3}z" fill="#6a4a30" stroke="#3a2818" stroke-width="1.5"/><ellipse rx="${hw * .5}" ry="${hh * .4}" fill="#8a6a48" opacity=".6"/>`; break;
    case "rack": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" fill="#3a271a" stroke="#1d130b"/>${[...Array(Math.max(2, Math.floor(w / 12)))].map((_, i) => `<line x1="${f1(-hw + 6 + i * 12)}" y1="${f1(hh + 2)}" x2="${f1(-hw + 10 + i * 12)}" y2="${f1(-hh - 6)}" stroke="#b9bcc0" stroke-width="2"/>`).join("")}`; break;
    case "animal": { const c = v < .33 ? ["#e8e2d6", "#2a2622"] : v < .66 ? ["#7a4a2a", "#3a2214"] : ["#a8a49a", "#4a4640"]; s = `<ellipse rx="${hw * .8}" ry="${hh * .8}" fill="${c[0]}" stroke="${c[1]}" stroke-width="1.5"/><circle cx="${hw * .88}" r="${hh * .45}" fill="${c[0]}" stroke="${c[1]}" stroke-width="1.5"/>${v < .33 ? `<ellipse cx="${-hw * .2}" cy="${-hh * .2}" rx="${hw * .25}" ry="${hh * .3}" fill="${c[1]}"/>` : ""}<line x1="${-hw * .8}" y1="0" x2="${-hw}" y2="${hh * .3}" stroke="${c[1]}" stroke-width="2"/>`; break; }
    case "hook": s = `<line x1="0" y1="${-hh}" x2="0" y2="${hh}" stroke="#4a4a46" stroke-width="3"/>${[-.5, .2].map(f => `<ellipse cx="5" cy="${f1(hh * f)}" rx="${hw * .55}" ry="${hh * .22}" fill="#8a3a2e" stroke="#4a1a14"/>`).join("")}`; break;
    case "oars": s = `<rect x="-6" y="${-hh}" width="3" height="${h}" fill="#8a6a40"/><rect x="2" y="${-hh}" width="3" height="${h}" fill="#8a6a40"/><ellipse cx="-4.5" cy="${hh - 5}" rx="4" ry="7" fill="#7a5a34"/><ellipse cx="3.5" cy="${hh - 5}" rx="4" ry="7" fill="#7a5a34"/>`; break;
    case "door": s = `<rect x="${-hw}" y="${-hh}" width="${w}" height="${h}" rx="2" fill="#6b5a3d" opacity=".55"/>`; break;
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
  <pattern id="${P}-rock" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="#191815"/><path d="M0 22 L16 12 L34 20 L52 8 L64 14 M4 64 L20 44 L38 52 L56 38 L64 44 M30 0 L26 12 M10 40 L0 34" stroke="#2c2a25" stroke-width="3" fill="none"/><path d="M16 12 L22 30 L34 20 M38 52 L44 34 L56 38" stroke="#24221e" stroke-width="2" fill="none"/><circle cx="46" cy="24" r="6" fill="#22201c"/></pattern>
  <filter id="${P}-rim" x="-5%" y="-5%" width="110%" height="110%"><feMorphology in="SourceAlpha" operator="dilate" radius="2" result="d"/><feGaussianBlur in="d" stdDeviation="6" result="b"/><feFlood flood-color="#000" flood-opacity=".75"/><feComposite in2="b" operator="in" result="sh"/><feMerge><feMergeNode in="sh"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <pattern id="${P}-grid" width="${CS}" height="${CS}" patternUnits="userSpaceOnUse"><path d="M${CS} 0 H0 V${CS}" fill="none" stroke="#fff" stroke-opacity=".05"/></pattern></defs>`;
}
const SC_DARK = { indoor: [.18, .1, .32, .5], outdoor: [.1, 0, .26, .5] };
function sceneStaticSVG(sc, P) {
  const R = mulberry(hash(sc.id + "#draw" + WD.id)); const indoor = sc.rooms.length || sc.round || sc.cave; const t = worldTime().part;
  const objs = sceneObjects(sc.id); const under = objs.filter(o => o.under), over = objs.filter(o => !o.under && !o.hidden);
  const lit = [...sc.lights, ...objs.filter(o => o.k === "item" && o.id[0] === "a").map(o => ({ x: o.x, y: o.y, r: 36, c: "gold" })), ...objs.filter(o => o.k === "bldroof" && S && bldLit(o.bld)).map(o => ({ x: o.x + ({ l: -1, r: 1 }[o.d] || 0) * o.w / 2, y: o.y + ({ b: 1, t: -1 }[o.d] || 0) * o.h / 2, r: 85, c: "warm" }))];
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
    inner = img ? `<image href="${esc(img)}" x="-11.5" y="-11.5" width="23" height="23" preserveAspectRatio="xMidYMin slice" clip-path="url(#${P}-tc)"/>` : `<text y="5" text-anchor="middle" font-size="13" font-weight="700" fill="#e9eee9" font-family="Cormorant, Georgia, serif">${esc(n.name[0])}</text>`;
    if (p.asleep) { inner += `<circle r="12" fill="#06101f" opacity=".45"/><text x="10" y="-9" font-size="10" font-weight="700" fill="#9fd8ff">z</text>`; title += " (спит)"; } }
  else if (p.type === "crowd") { r = 10; ring = "#7d8a87"; fill = "#2a3337"; hit = "crowd:" + p.label; title = p.label; label = big ? p.label : ""; inner = `<circle cy="-3" r="3.6" fill="#b9c3c0" opacity=".75"/><path d="M-6.5 6.5 q6.5 -9 13 0" fill="#b9c3c0" opacity=".75"/>`; }
  else if (p.type === "foe") { const E = ENEMIES[p.id]; const es = S.world.enemies[p.id]; r = E.boss ? 15 : 13; ring = "#e8735a"; fill = "#2a1210"; hit = "foe:" + p.id; label = E.name; title = `${E.name} — ${enemyStatus(p.id)}`; const g = FOE_GLYPH[E.type] || "blade";
    inner = (g === "skull" ? `<circle cy="-1.5" r="6.5" fill="#d8cfc0"/><rect x="-3.5" y="3" width="7" height="4" fill="#d8cfc0"/><circle cx="-2.4" cy="-1.6" r="1.7" fill="#2a1210"/><circle cx="2.4" cy="-1.6" r="1.7" fill="#2a1210"/>` : g === "beast" ? `<path d="M-7 5 L-5 -6 L-1 -1 L1 -1 L5 -6 L7 5 Z" fill="#d8cfc0"/><circle cx="-2.5" cy="1" r="1.3" fill="#e8735a"/><circle cx="2.5" cy="1" r="1.3" fill="#e8735a"/>` : `<path d="M-6 6 L5 -5 M2 -6 L6 -6 L6 -2" stroke="#d8cfc0" stroke-width="2.4" fill="none"/><path d="M-4 2 L-2 4" stroke="#d8cfc0" stroke-width="3"/>`) + (es.asleep ? `<text x="9" y="-8" font-size="9" fill="#9fd8ff">z</text>` : "");
    const pct = es.hp / E.hp; inner += `<rect x="-12" y="${r + 3}" width="24" height="3.5" rx="1.5" fill="#000" opacity=".6"/><rect x="-12" y="${r + 3}" width="${f1(24 * pct)}" height="3.5" rx="1.5" fill="${pct > .5 ? "#e8735a" : "#c9402a"}"/>`; }
  else if (p.type === "corpse") { const E = ENEMIES[p.id]; return `<g data-k="corpse:${p.id}" data-sig="c" style="transform:translate(${x}px,${y}px)" opacity=".85"><title>${esc(E.name)} (повержен)</title><ellipse rx="15" ry="10" fill="#4a0f0b" opacity=".55"/><path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke="#8a2a20" stroke-width="3.4" stroke-linecap="round"/></g>`; }
  const lab = label && (big || p.type === "hero") ? `<text class="sc-lab" y="${r + (p.type === "foe" ? 17 : 13)}" text-anchor="middle">${esc(label)}</text>` : "";
  const tk = p.type + ":" + (p.type === "crowd" ? p.id + p.label : p.id || ""); const body = `${inner}${lab}${ring}${r}${fill}${title}`;
  return `<g class="sc-tok ${p.type}" data-k="${esc(tk)}" data-sig="${hash(body)}" data-hit="${esc(hit)}" style="transform:translate(${x}px,${y}px)" tabindex="0" role="button" aria-label="${esc(title)}"><title>${esc(title)}</title><circle r="${r + 1}" cy="3" fill="#000" opacity=".5"/>${p.type === "hero" ? `<circle r="${r + 5}" fill="none" stroke="#f2b45c" stroke-opacity=".5" class="sc-pulse"/>` : ""}<circle r="${r}" fill="${fill}" stroke="${ring}" stroke-width="2.6"/>${inner}${lab}</g>`;
}
/* BLD */
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
  if (settled.length && wd.settle === "town" && !outer().some(([, p]) => tplOfPlace(p) === "square")) addStreet(wd, settled.map(([, p]) => p), R, { id: "market", name: "Рыночная площадь", kind: "well", short: "Лавки, торговцы и сплетни", desc: "Мощёная площадь с колодцем посередине. Торговцы перекрикивают друг друга, стража лениво поглядывает по сторонам." });
  if (settled.length && wd.settle === "fort" && !outer().some(([, p]) => tplOfPlace(p) === "gate")) addStreet(wd, settled.map(([, p]) => p), R, { id: "fort_gate", name: "Крепостные ворота", kind: "gate", short: "Стража, стены и досмотр", desc: "Тяжёлые ворота в каменной стене. Стража досматривает телеги и запоминает чужие лица." });
  const used = new Set(Object.values(wd.npcs).map(n => n.name));
  for (const [id, p] of outer()) { const t = tplOfPlace(p); if (BLD_SLOTS[t] && !p.blds) genBuildingsFor(wd, id, p, t, R, used); }
  try { mapCache.clear(); } catch (e) {}
}
function addStreet(wd, settled, R, spec) {
  const cx = settled.reduce((a, p) => a + p.x, 0) / settled.length, cy = settled.reduce((a, p) => a + p.y, 0) / settled.length;
  const tile = (x, y) => (wd.tiles[y] || "")[x] || "S"; const pass = (x, y) => { const t = tile(x, y); return t !== "S" && t !== "W"; };
  const all = Object.values(wd.places); let best = null;
  for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) { if (!pass(x, y)) continue; const md = Math.min(...all.map(p => Math.hypot(p.x - x, p.y - y))); if (md < 2.6) continue;
    const sc = Math.hypot(x - cx, y - cy) + (md > 3.5 ? 2 : 0) + R() * .3; if (!best || sc < best.s) best = { x, y, s: sc }; }
  if (!best) return;
  const id = spec?.id || "street"; const bio = wd.biome || "coast";
  const desc = { coast: "Кривая улочка из почерневших от соли домов. Из труб тянется дым, за заборами сушатся сети.", marsh: "Дома на сваях вдоль раскисшей улицы, мостки через лужи, пахнет торфом и дымом.",
    mountains: "Каменные дома лепятся к склону, по мостовой гуляет холодный ветер.", forest: "Бревенчатые избы вдоль утоптанной улицы, за плетнями огороды, над крышами шумит лес." }[bio] || "Улица с жилыми домами, лавками и дворами.";
  wd.places[id] = spec ? { name: spec.name, kind: spec.kind, x: best.x, y: best.y, short: spec.short, desc: spec.desc, npcs: [], enemies: [], clue: "" } : { name: wd.settle === "town" ? "Ремесленная улица" : wd.settle === "fort" ? "Улица за стенами" : "Деревенская улица", kind: "street", x: best.x, y: best.y, short: "Жилые дома, лавки и дворы местных", desc, npcs: [], enemies: [], clue: "" };
  const roads = new Set(wd.roads || []); const key = (x, y) => x + "," + y; const q = [[best.x, best.y]]; const prev = new Map([[key(best.x, best.y), null]]); let hit = null;
  while (q.length) { const [x, y] = q.shift(); if ((roads.has(key(x, y)) || all.some(p => p.x === x && p.y === y)) && !(x === best.x && y === best.y)) { hit = key(x, y); break; }
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + a, ny = y + b, k = key(nx, ny); if (prev.has(k) || !pass(nx, ny)) continue; prev.set(k, key(x, y)); q.push([nx, ny]); } }
  for (let k = hit; k; k = prev.get(k)) roads.add(k); wd.roads = [...roads];
  wd.houses = wd.houses || []; [[1, 0], [-1, 1], [0, -1], [1, 1], [-1, -1]].forEach(([a, b]) => { const x = best.x + a, y = best.y + b; if (pass(x, y) && !roads.has(key(x, y)) && !all.some(p => p.x === x && p.y === y) && !wd.houses.some(h => h[0] === x && h[1] === y)) wd.houses.push([x, y]); });
}
function bldPick(R, arr) { return arr[Math.floor(R() * arr.length)]; }
function makeOcc(wd, bid, spec, R, used) {
  const names = nameSet(wd); let name = ""; for (let t = 0; t < 30; t++) { name = bldPick(R, names[spec.g]); if (!used.has(name)) break; } used.add(name);
  const id = `${bid}_${spec.i}`; const h = hash(wd.id + id); const age = spec.age || "adult";
  const noun = spec.g === "f" ? (age === "young" ? "девушка" : age === "old" ? "пожилая женщина" : "женщина") : (age === "young" ? "парень" : age === "old" ? "старик" : "мужчина");
  wd.npcs[id] = { name, role: spec.role, look: `${noun} ${bldPick(R, spec.g === "f" ? LOOK_F : LOOK_M)}`, persona: bldPick(R, PERSONAS), secret: bldPick(R, SECRETS), greet: "", minor: true, gender: spec.g, age,
    feature: FEATURES[h % FEATURES.length], hair: age === "old" ? (R() < .5 ? "grey" : "white") : Object.keys(HAIRS)[(h >>> 4) % 4], photo_prompt: "", bld: bid, away: spec.away || [] };
  return id;
}
function genBuildingsFor(wd, pid, p, t, R, used) {
  const slots = BLD_SLOTS[t]; let kinds;
  if (t === "street") { kinds = ["shop"]; if (R() < .75) kinds.push("smithy"); kinds.push(R() < .5 ? "barn" : "shed"); if (R() < .5) kinds.push("rich"); const want = wd.settle === "town" ? 7 : wd.settle === "fort" ? 5 : 5 + (R() < .5 ? 1 : 0); if (wd.settle === "fort") kinds.push("guard"); while (kinds.length < want) kinds.push(R() < .3 ? "poor" : "house"); }
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
function bldHome(bid) { const b = POIS[bid]; return (b?.occ || []).filter(n => NPCS[n] && npcSpotNow(n) === bid); }
function bldAsleep(bid) { const b = POIS[bid]; return !!b && worldTime().part === 3 && BLD_SLEEPS.has(b.bk) && bstate(bid).alarm !== tkey(); }
function bldLocked(bid) {
  const b = POIS[bid], st = bstate(bid), k = tkey(); if (!b || st.broken) return false; if (st.unlocked === k || st.open === k) return false;
  const part = worldTime().part; const h = hash(bid + ":" + worldTime().day);
  if (b.bk === "shop" || b.bk === "smithy") return part === 3; if (b.bk === "guard") return false; if (b.bk === "barn" || b.bk === "shed") return h % 4 === 0;
  return part === 3 || !bldHome(bid).length || h % 3 === 0;
}
function bldLit(bid) { return worldTime().part >= 2 && bldHome(bid).length > 0 && !bldAsleep(bid); }
function refreshBuildings() { refreshPeople(); }
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
    pick: [{ kind: "skill", skill: "sleight", dc: b.lock, adv: C().cls === "rogue" || hasTag("lockpick") ? 1 : 0, reason: hasTag("lockpick") ? "Вскрыть замок отмычками" : "Вскрыть замок" }], force: [{ kind: "skill", skill: "athletics", dc: b.lock + 1, adv: hasTag("crowbar") ? 1 : 0, reason: hasTag("crowbar") ? "Выломать дверь ломом" : "Выбить дверь" }] }[act];
  if (act === "enter") { st.how = st.broken ? "выбил дверь" : st.unlocked === tkey() ? "вскрыл замок" : st.open === tkey() ? "впустили хозяева" : (b.bk === "shop" || b.bk === "smithy") ? "заведение открыто" : "дверь была не заперта";
    return takeTurn(`Вхожу: ${b.name}`, { checks: [], move_to: bid }); }
  takeTurn(`${BLD_ACTS[act]}: ${b.name}`, { checks });
}
/* после бросков: что стало с дверью */
function bldAfterChecks(results) {
  const pb = S.pendingBld; if (!pb || !POIS[pb.bid]) return; const st = bstate(pb.bid); const k = tkey(); const r = results.find(x => x.kind === "skill"); const note = t => { results.push({ kind: "note", title: t }); pushFeed({ t: "sys", html: esc(t) }); };
  const home = bldHome(pb.bid).length;
  if (pb.act === "knock") { st.knocked = k; if (!home) note("На стук никто не отзывается"); else if (bldAsleep(pb.bid)) { st.alarm = k; note("Стук разбудил тех, кто внутри"); } }
  if (pb.act === "pick" && r) { if (r.ok) { st.unlocked = k; note("Замок поддался: дверь открыта"); sfx("chest"); } else { if (r.fumble || r.total <= r.dc - 5) { st.alarm = k; note("Отмычка сорвалась со скрежетом: внутри могли услышать"); if (home) addRep(-3, "попался на взломе"); } else note("Замок не поддаётся"); } }
  if (pb.act === "force" && r) { st.alarm = k; if (r.ok) { st.broken = true; note("Дверь с треском распахивается: шум слышен на всю улицу"); sfx("mace"); } else note("Дверь выдержала удар, но грохот был сильный"); addRep(-6, "ломился в чужой дом"); }
  if (pb.act === "peek" && r && !r.ok && home && !bldAsleep(pb.bid)) { st.alarm = k; note("Кто-то внутри заметил лицо в окне"); addRep(-2, "подглядывал в окна"); }
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
    scScatter(sc, "bush", 6, [0, 0, SC_W, SC_H], 1, 1, { pad: .1, ghost: true, act: false, nofree: true, spread: 1, avoid: (x, y) => Math.abs(y - road(x)) < 1.7 || sc.floor.some(f => f.t === "field" && x > f.box[0] - .4 && x < f.box[2] + .4 && y > f.box[1] - .4 && y < f.box[3] + .4) || sc.objs.some(o => o.k === "bldroof" && Math.abs(o.x - x) < o.w / 2 + .5 && Math.abs(o.y - y) < o.h / 2 + .5) });
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

/* LIFE */
/* =========================================================================
   ЖИЗНЬ МИРА: распорядок жителей, погода, тайники, репутация, ожидание
   ========================================================================= */
const GENRES = { mystery: "Расследование", horror: "Ужас", adventure: "Приключение", intrigue: "Интриги", survival: "Выживание" };
const SEASONS = { spring: "Весна", summer: "Лето", autumn: "Осень", winter: "Зима" };
const CULTURES = { auto: "По окружению", north: "Северная", slavic: "Славянская", south: "Южная", east: "Восточная" };
const SETTLES = { village: "Деревня", town: "Городок", fort: "Крепость" };
const SIZES = { small: "Маленький", normal: "Обычный", large: "Большой" };
const DANGERS = { low: "Мирный", mid: "Опасный", high: "Смертельный" };
const CULTURE_PROMPT = { north: "северная, скандинавского духа (имена вроде Ингрид, Торвальд)", slavic: "славянская (имена вроде Злата, Мирон, Горислав)", south: "южная, средиземноморского духа (имена вроде Лючия, Ренцо)", east: "восточная, степная (имена вроде Айгуль, Тимур)", auto: "на усмотрение мастера под окружение" };
const NAMES_SOUTH = { m: ["Лоренцо", "Марко", "Бенедетто", "Альвизе", "Тео", "Сальво", "Ренцо", "Джано", "Пьетро", "Амадео", "Франко", "Лудо", "Орсо", "Нино"], f: ["Лючия", "Беатриче", "Кьяра", "Нера", "Фьора", "Изотта", "Мирелла", "Агата", "Бьянка", "Сильвия", "Донна", "Розалия"] };
const NAMES_EAST = { m: ["Тимур", "Арслан", "Карим", "Бахтияр", "Ильдар", "Рустам", "Самир", "Азат", "Ерлан", "Дамир", "Марат", "Нурлан"], f: ["Айгуль", "Зарина", "Лейла", "Динара", "Камила", "Ясмин", "Гульнара", "Алия", "Сауле", "Мадина", "Асель", "Жанна"] };
function nameSet(wd) { const c = wd.culture; if (c === "south") return NAMES_SOUTH; if (c === "east") return NAMES_EAST; if (c === "slavic") return NAMES_S; if (c === "north") return NAMES_N; return ["forest", "marsh"].includes(wd.biome) ? NAMES_S : NAMES_N; }

/* ---------- распорядок дня ---------- */
const SCHED = [
  [/рыбак|лодочник/, ["pier", "pier", "inn|home", "home"]], [/пастух|батрак|хуторянин/, ["farm|street", "farm|street", "inn|home", "home"]],
  [/охотник|углежог|бортник|торфяник|рудокоп/, ["forest|away", "forest|away", "inn|home", "home"]], [/кузнец/, ["work", "work", "inn|street", "away"]],
  [/пекар|старьёвщик|аптекар|мясник|лавочниц|свечник|помощниц|подмастерье/, ["work", "work", "work|inn", "away"]], [/стражник|сержант/, ["work|gate", "street|gate|square", "inn|street", "work"]],
  [/купец/, ["home", "square|street|inn", "inn|home", "home"]], [/служанка/, ["home", "street|square", "home", "home"]], [/^(сын|дочь)/, ["home|street", "street|pier|farm", "home|street", "home"]],
  [/^(отец|мать)|старый солдат/, ["chapel|home", "home|street", "inn|home", "home"]], [/жена|вдова|прачка|ткачиха|травница|знахарка/, ["home", "street|chapel|square", "home|chapel", "home"]]
];
const SPOT_TPL = { pier: ["pier"], inn: ["inn"], chapel: ["chapel", "shrine"], street: ["street", "square"], square: ["square", "street"], farm: ["farm"], forest: ["forest", "camp"], gate: ["gate"] };
function npcSpotNow(id) {
  const ov = S.world.npcLoc; if (ov && Object.prototype.hasOwnProperty.call(ov, id)) return ov[id];
  const n = NPCS[id]; if (!n?.bld) return null; const t = worldTime();
  const sched = (SCHED.find(([re]) => re.test(n.role || "")) || [0, ["home", "street|home", "inn|home", "home"]])[1];
  const opts = sched[t.part].split("|"); const r = hash(id + ":" + t.day + ":" + t.part); const pick = opts[r % opts.length];
  if (pick === "away") return null; if (pick === "home" || pick === "work") return n.bld;
  if ((r >>> 9) % 10 < 3) return n.bld; // иногда просто остаются дома
  const tpls = SPOT_TPL[pick] || []; const cands = outerEntries().filter(([, p]) => tpls.includes(tplOfPlace(p))).map(([pid]) => pid);
  return cands.length ? cands[(r >>> 4) % cands.length] : n.bld;
}
function refreshPeople() {
  if (!S) return; const ov = S.world.npcLoc || {}; const vis = {};
  for (const [id, n] of Object.entries(NPCS)) { let spot; if (Object.prototype.hasOwnProperty.call(ov, id)) spot = ov[id]; else if (n.bld) spot = npcSpotNow(id); else continue; if (spot && POIS[spot]) (vis[spot] = vis[spot] || []).push(id); }
  for (const [lid, p] of Object.entries(POIS)) {
    if (!p.inner && !p.base) p.base = (p.npcs || []).filter(x => !NPCS[x]?.bld);
    const base = p.inner ? (p.extra || []) : p.base;
    p.npcs = [...new Set([...base.filter(x => !Object.prototype.hasOwnProperty.call(ov, x) || ov[x] === lid), ...(vis[lid] || [])])];
  }
}
function npcMoves(list) {
  if (!Array.isArray(list)) return; S.world.npcLoc = S.world.npcLoc || {};
  list.slice(0, 3).forEach(m => { const id = m?.id; if (!NPCS[id]) return; const to = m.to === null || m.to === "home" ? null : m.to; if (to !== null && !POIS[to]) return;
    const was = S.world.loc; const n = NPCS[id];
    if (to === null && !n.bld) delete S.world.npcLoc[id]; else S.world.npcLoc[id] = to === null ? n.bld : to;
    refreshPeople(); const here = POIS[was].npcs.includes(id);
    if (!here && (POIS[was].base || []).concat(Object.keys(S.world.npcLoc)).includes(id)) pushFeed({ t: "chips", items: [{ c: "npc", x: `${n.name} уходит${to && POIS[to] && S.world.visited.includes(to) ? " · " + POIS[to].name : ""}` }] });
    else if (here && to === was) pushFeed({ t: "chips", items: [{ c: "npc", x: `Здесь появляется: ${n.name}` }] }); });
}
function peopleWhereBrief() {
  const lines = []; for (const [id, n] of Object.entries(NPCS)) { if (n.bld && !S.world.met?.includes(id)) continue; const where = Object.entries(POIS).find(([, p]) => p.npcs?.includes(id)); lines.push(`${n.name} — ${where ? where[1].name : "нет на виду"}`); if (lines.length >= 14) break; }
  return lines.join("; ");
}
function waitTime() {
  if (!S || busy || S.dead || S.world.combat) return; const before = new Set(POIS[S.world.loc].npcs);
  advanceTime(1); refreshPeople(); const t = worldTime(); const now = POIS[S.world.loc].npcs;
  const came = now.filter(id => !before.has(id) && NPCS[id]).map(id => NPCS[id].name), left = [...before].filter(id => !now.includes(id) && NPCS[id]).map(id => NPCS[id].name);
  pushFeed({ t: "sys", html: `Время идёт… Наступает <b>${DAY_PARTS[t.part]}</b>, день ${t.day}. ${weatherNow().name}.${came.length ? " Приходят: " + esc(came.join(", ")) + "." : ""}${left.length ? " Уходят: " + esc(left.join(", ")) + "." : ""}` });
  S.log.push({ who: "p", text: `(ждёт; наступает ${DAY_PARTS[t.part]})` }); lastSnap = null; sfx("step"); after();
}

/* ---------- погода ---------- */
const WX = { clear: "Ясно", cloudy: "Облачно", rain: "Дождь", storm: "Гроза", fog: "Туман", snow: "Снег", blizzard: "Метель" };
const WX_TABLE = { spring: [["clear", .35], ["cloudy", .3], ["rain", .25], ["fog", .1]], summer: [["clear", .55], ["cloudy", .2], ["storm", .1], ["rain", .1], ["fog", .05]],
  autumn: [["cloudy", .3], ["rain", .3], ["fog", .25], ["clear", .15]], winter: [["snow", .35], ["cloudy", .25], ["clear", .2], ["blizzard", .1], ["fog", .1]] };
function weatherNow() {
  if (!WD || !S) return { k: "clear", name: "Ясно" }; const t = worldTime(); const slot = t.day * 2 + (t.part >= 2 ? 1 : 0); let r = (hash(WD.id + ":wx:" + slot) % 1000) / 1000;
  const tab = WX_TABLE[WD.season || "autumn"]; let k = tab[0][0]; for (const [kk, p] of tab) { if (r < p) { k = kk; break; } r -= p; }
  if (S.world.wx && S.world.wx.slot === slot) k = S.world.wx.k; return { k, name: WX[k] };
}
function seasonTint(box) { const s = WD?.season; if (s === "winter") return `<rect x="${box[0] * CS}" y="${box[1] * CS}" width="${(box[2] - box[0]) * CS}" height="${(box[3] - box[1]) * CS}" fill="#e3eaee" opacity=".34"/>`; if (s === "autumn") return `<rect x="${box[0] * CS}" y="${box[1] * CS}" width="${(box[2] - box[0]) * CS}" height="${(box[3] - box[1]) * CS}" fill="#8a5a1c" opacity=".14"/>`; return ""; }
function weatherSVG(sc, P) {
  const w = weatherNow(); if (sc.rooms.length || sc.round || sc.cave) return "";
  const W = SC_W * CS, H = SC_H * CS; const R = mulberry(hash(sc.id + w.k)); let s = "";
  const loop = (cls, body) => `<g class="${cls}"><g>${body}</g><g transform="translate(0,-${H})">${body}</g></g>`;
  if (w.k === "rain" || w.k === "storm") { let L = ""; for (let i = 0; i < 95; i++) { const x = R() * (W + 60) - 30, y = R() * H; L += `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x - 5)}" y2="${f1(y + 15)}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="#0a1a26" opacity="${w.k === "storm" ? .3 : .18}"/><g stroke="#c6dcea" stroke-width="1.2" opacity="${w.k === "storm" ? .5 : .34}">${loop("wx-rain", L)}</g>`;
    if (w.k === "storm") s += `<rect class="wx-flash" width="${W}" height="${H}" fill="#eaf2ff"/>`; }
  if (w.k === "snow" || w.k === "blizzard") { let L = ""; for (let i = 0; i < (w.k === "blizzard" ? 140 : 80); i++) L += `<circle cx="${f1(R() * W)}" cy="${f1(R() * H)}" r="${f1(1 + R() * 2)}"/>`;
    s += `<g fill="#f4f8fb" opacity=".8">${loop(w.k === "blizzard" ? "wx-snow fast" : "wx-snow", L)}</g>`; }
  if (w.k === "fog" || w.k === "blizzard") { s += `<filter id="${P}-fb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter><g class="wx-fog" filter="url(#${P}-fb)" fill="#dfe6ea">${[...Array(7)].map(() => `<ellipse cx="${f1(R() * W)}" cy="${f1(R() * H)}" rx="${f1(90 + R() * 120)}" ry="${f1(40 + R() * 50)}" opacity="${(.1 + R() * .12).toFixed(2)}"/>`).join("")}</g>`; }
  if (w.k === "cloudy") s += `<rect width="${W}" height="${H}" fill="#203038" opacity=".1"/>`;
  return s;
}
/* шум дождя и ветра: синтез, без файлов */
function auWeather() {
  const want = AU.cfg.on && AU.unlocked && AU.cfg.amb > 0 && S ? weatherNow().k : null; const kind = want === "rain" || want === "storm" ? "rain" : want === "snow" || want === "blizzard" ? "wind" : null;
  const sc = S ? sceneOf(S.world.loc) : null; const inside = !!sc && (/^b_/.test(sc.tpl) || ["inn", "tower", "cave", "mine"].includes(sc.tpl));
  const sig = kind ? kind + (inside ? "-in" : "") + (want === "storm" || want === "blizzard" ? "+" : "") : null; if (AU.wxSig === sig) return; AU.wxSig = sig;
  if (AU.wxNode) { const n = AU.wxNode; AU.wxNode = null; try { n.g.gain.setTargetAtTime(0, AU.ctx.currentTime, .6); setTimeout(() => { try { n.src.stop(); clearInterval(n.timer); } catch (e) {} }, 2500); } catch (e) {} }
  if (!kind) return; const ctx = auCtx(); if (!ctx) return;
  const len = ctx.sampleRate * 2; const buf = ctx.createBuffer(1, len, ctx.sampleRate); const d = buf.getChannelData(0); let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = kind === "wind" ? (last + .02 * w) / 1.02 : w; d[i] = kind === "wind" ? last * 3.5 : w; }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const f = ctx.createBiquadFilter(); f.type = kind === "rain" ? "lowpass" : "bandpass"; f.frequency.value = kind === "rain" ? (inside ? 900 : 4200) : 420; f.Q.value = kind === "rain" ? .4 : .8;
  const g = ctx.createGain(); g.gain.value = 0; src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
  const vol = AU.cfg.amb * (kind === "rain" ? (inside ? .16 : .3) : .45) * (sig.endsWith("+") ? 1.4 : 1); g.gain.setTargetAtTime(vol, ctx.currentTime, 1.2);
  let timer = null; if (kind === "wind") timer = setInterval(() => { try { f.frequency.setTargetAtTime(300 + Math.random() * 400, ctx.currentTime, 1.5); g.gain.setTargetAtTime(vol * (.6 + Math.random() * .7), ctx.currentTime, 1.5); } catch (e) {} }, 2200);
  if (want === "storm") timer = setInterval(() => { if (Math.random() < .35) auThunder(); }, 7000);
  AU.wxNode = { src, g, timer };
}
function auThunder() { const ctx = auCtx(); if (!ctx || !AU.cfg.on) return; const len = ctx.sampleRate * 3; const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const s = ctx.createBufferSource(); s.buffer = b; const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 160; const g = ctx.createGain(); g.gain.value = AU.cfg.amb * 1.4; s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(); }

/* ---------- тайники ---------- */
const LOOT = [{ name: "Отмычки", desc: "Набор тонких крючков: помогает вскрывать замки" }, { name: "Серебряное кольцо", desc: "Можно продать или узнать, чьё оно" }, { name: "Нож с костяной рукоятью", desc: "Острый, с вырезанным знаком" },
  { name: "Старая карта с пометкой", desc: "Крестик в неожиданном месте" }, { name: "Свёрток с травами", desc: "Пахнет мятой и полынью" }, { name: "Письмо без подписи", desc: "Несколько строк, которые лучше бы никто не читал" },
  { name: "Ключ без бирки", desc: "Железный, от неизвестного замка" }, { name: "Фляга крепкой настойки", desc: "Согревает и развязывает языки" }, { name: "Огниво и трут", desc: "Пригодится в темноте" }, { name: "Медальон с портретом", desc: "Внутри — чьё-то лицо" }];
function sceneStash(id) {
  const sc = sceneOf(id); if (sc.stash !== undefined) return sc.stash; const R = mulberry(hash(WD.id + id + "#stash")); const p = POIS[id];
  const cands = sc.objs.filter(o => o.search && o.act && !o.bld && o.k !== "door" && !o.hidden);
  sc.stash = cands.length && R() < (p.inner ? .55 : .35) ? { obj: cands[Math.floor(R() * cands.length)].id, loot: R() < .4 ? { gold: 2 + Math.floor(R() * 8) + (p.bk === "rich" ? 12 : 0) } : R() < .3 ? { item: { name: "Зелье лечения", desc: "Восстанавливает 2d4+2 HP", potion: true } } : { item: LOOT[Math.floor(R() * LOOT.length)] } } : null;
  return sc.stash;
}
function searchObj(id, o) {
  if (busy || S.dead) return; S.pendingSearch = { loc: id, obj: o.id, label: o.label };
  takeTurn(`Обыскиваю ${o.acc}`, { checks: [{ kind: "skill", skill: "investigation", dc: o.k === "chest" ? 13 : 11, reason: "Тщательно обыскать" }] });
}
function searchAfterChecks(results) {
  const ps = S.pendingSearch; if (!ps) return; const r = results.find(x => x.kind === "skill"); const note = t => { results.push({ kind: "note", title: t }); };
  const p = POIS[ps.loc]; const st = p.inner ? bstate(ps.loc) : {}; const awake = p.inner && p.npcs.some(n => NPCS[n]) && !bldAsleep(ps.loc); const intruder = p.inner && st.how && !/впустили|открыто/.test(st.how);
  if (awake && intruder) { addRep(-4, "рылся в чужом доме"); note("Хозяева видят, как герой роется в их вещах"); }
  S.world.taken = S.world.taken || {}; const key = ps.loc + ":" + ps.obj; const stash = sceneStash(ps.loc);
  if (!r || !r.ok) { note(`Поиски (${ps.label}) ничего не дали`); return; }
  if (stash && stash.obj === ps.obj && !S.world.taken[key]) {
    S.world.taken[key] = true; const c = C(); const chips = [];
    if (stash.loot.gold) { c.gold += stash.loot.gold; chips.push({ c: "gold", x: `+${stash.loot.gold} зм` }); sfx("gold"); note(`НАХОДКА в «${ps.label}»: ${stash.loot.gold} золотых (уже добавлено движком, не дублируй в gold)`); }
    else { const it = stash.loot.item; c.items.push({ ...it }); chips.push({ c: "item", x: `+ ${it.name}` }); sfx("chest"); note(`НАХОДКА в «${ps.label}»: ${it.name} — ${it.desc} (уже в инвентаре, не дублируй в items_add; если уместно, свяжи находку с тайной)`); }
    pushFeed({ t: "chips", items: chips });
  } else note(`В «${ps.label}» нет ничего ценного (не выдавай предметов и золота, только детали обстановки)`);
}

/* ---------- репутация в поселении ---------- */
function repLabel(v) { return v >= 30 ? "уважают" : v >= 10 ? "приветливы" : v > -10 ? "нейтрально" : v > -30 ? "косо смотрят" : "враждебны"; }
function addRep(dv, why) { if (!dv || !S) return; const before = S.world.rep || 0; S.world.rep = clamp(before + dv, -100, 100); pushFeed({ t: "chips", items: [{ c: dv > 0 ? "heal" : "dmg", x: `Репутация ${dv > 0 ? "+" : ""}${dv}${why ? " · " + why : ""}` }] }); }

/* ---------- контекстное меню плана: поверх всего, внутри экрана ---------- */
let scPopEl = null, scPopView = null;
function scPop() {
  if (scPopEl) return scPopEl; scPopEl = document.createElement("div"); scPopEl.className = "sc-pop g"; scPopEl.hidden = true; document.body.append(scPopEl);
  document.addEventListener("pointerdown", e => { if (!scPopEl.hidden && !scPopEl.contains(e.target) && !e.target.closest(".scene-view")) scHidePop(); }, true);
  document.addEventListener("keydown", e => { if (e.key === "Escape") scHidePop(); }); window.addEventListener("resize", scHidePop);
  document.addEventListener("scroll", e => { if (!scPopEl.hidden && scPopView && e.target.contains && e.target.contains(scPopView)) scHidePop(); }, true);
  return scPopEl;
}
function scHidePop() { if (scPopEl) scPopEl.hidden = true; document.querySelectorAll(".scene-view .sel").forEach(e => e.classList.remove("sel")); }
function scShowPop(view, el, html) {
  const pop = scPop(); scPopView = view; pop.innerHTML = html; pop.hidden = false; pop.style.left = "0px"; pop.style.top = "0px";
  const r = el.getBoundingClientRect(); const pw = pop.offsetWidth, ph = pop.offsetHeight; const cx = r.left + r.width / 2;
  pop.style.left = clamp(cx - pw / 2, 8, innerWidth - pw - 8) + "px";
  pop.style.top = (r.top - ph - 10 >= 8 ? r.top - ph - 10 : Math.min(r.bottom + 10, innerHeight - ph - 8)) + "px";
  return pop;
}

/* ---------- план: неизменная часть + подвижные фишки ---------- */
const SVGNS = "http://www.w3.org/2000/svg";
function sceneKey(id, big) {
  const sc = sceneOf(id), st = scState(id), t = worldTime();
  const roofs = sc.objs.filter(o => o.k === "bldroof").map(o => { const bs = bstate(o.bld); return `${bldLit(o.bld) ? 1 : 0}${bldHome(o.bld).length ? 1 : 0}${bs.broken ? 1 : 0}${bs.known === tkey() && bldLocked(o.bld) ? 1 : 0}`; }).join("");
  return [WD.id, id, big ? 1 : 0, t.part, weatherNow().k, JSON.stringify(st.add || []), (st.removed || []).join(","), roofs].join("|");
}
function sceneDyn(id, big, P) {
  const ppl = scenePeople(id); const objs = sceneObjects(id).filter(o => o.act);
  const hits = objs.map(o => `<rect class="sc-hit" data-hit="obj:${o.id}" x="${f1((o.x - Math.max(o.w, .8) / 2) * CS)}" y="${f1((o.y - Math.max(o.h, .8) / 2) * CS)}" width="${f1(Math.max(o.w, .8) * CS)}" height="${f1(Math.max(o.h, .8) * CS)}" transform="${o.r ? `rotate(${o.r} ${f1(o.x * CS)} ${f1(o.y * CS)})` : ""}" rx="4"><title>${esc(o.label)}</title></rect>`).join("");
  const seenL = new Set(); const labels = big ? objs.filter(o => { const k = o.label.toLowerCase(); if (seenL.has(k)) return false; seenL.add(k); return true; }).map(o => `<text class="sc-olab" x="${f1(o.x * CS)}" y="${f1((o.y + Math.min(o.h, 2.4) / 2) * CS + 11)}" text-anchor="middle">${esc(o.label)}</text>`).join("") : "";
  const toks = ppl.filter(p => p.type === "corpse").map(p => scTokenSVG(p, P, big)).join("") + ppl.filter(p => p.type !== "corpse").sort((a, b) => (a.type === "hero") - (b.type === "hero")).map(p => scTokenSVG(p, P, big)).join("");
  return { hits, labels, toks };
}
function sceneSVG(id, big) {
  const sc = sceneOf(id); const P = "sc" + (++scSeq); const d = sceneDyn(id, big, P);
  return `<svg class="sc-svg" data-key="${esc(sceneKey(id, big))}" data-p="${P}" viewBox="0 0 ${SC_W * CS} ${SC_H * CS}" xmlns="${SVGNS}"><clipPath id="${P}-tc"><circle r="11.5"/></clipPath>${sceneStaticSVG(sc, P)}${weatherSVG(sc, P)}<g class="sc-hits">${d.hits}</g><g class="sc-labs">${d.labels}</g><g class="sc-toks">${d.toks}</g></svg>`;
}
function paintScene(view, id, big) {
  const svg = view.querySelector("svg.sc-svg"); const key = sceneKey(id, big);
  if (!svg || svg.getAttribute("data-key") !== key) { if (svg) svg.remove(); view.insertAdjacentHTML("afterbegin", sceneSVG(id, big)); return; }
  const d = sceneDyn(id, big, svg.getAttribute("data-p")); svg.querySelector(".sc-hits").innerHTML = d.hits; svg.querySelector(".sc-labs").innerHTML = d.labels;
  const box = svg.querySelector(".sc-toks"); const tmp = document.createElementNS(SVGNS, "g"); tmp.innerHTML = d.toks; const keep = new Set();
  [...tmp.children].forEach(c => { const k = c.getAttribute("data-k"); keep.add(k); const old = [...box.children].find(x => x.getAttribute("data-k") === k);
    if (!old) box.appendChild(c); else if (old.getAttribute("data-sig") !== c.getAttribute("data-sig")) old.replaceWith(c); else { old.setAttribute("style", c.getAttribute("style") || ""); old.classList.remove("sel"); } });
  [...box.children].forEach(x => { if (!keep.has(x.getAttribute("data-k"))) x.remove(); });
}
function sceneHeadHTML() { const sc = sceneOf(S.world.loc); const t = worldTime(); const w = weatherNow();
  return `<span class="eyebrow">План · ${SC_NAMES[sc.tpl] || "место"}</span><span class="scene-time">${DAY_PARTS[t.part]} · ${w.name.toLowerCase()}<button type="button" class="sc-wait" id="sc-wait" title="Подождать: пройдёт часть дня" ${busy || S.world.combat ? "disabled" : ""}>Ждать</button></span>`; }
function scenePanelHTML() {
  return `<div class="scene-card${S.world.combat ? " combat" : ""}" id="scene-card"><div class="scene-head">${sceneHeadHTML()}</div><div class="scene-view" id="scene-view">${sceneSVG(S.world.loc, false)}<button class="map-expand" type="button" id="scene-big" aria-label="Развернуть план" title="Развернуть план"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button></div></div>`;
}
function updateScenePanel(slot) {
  const id = S.world.loc; const k = WD.id + ":" + id; let card = slot.querySelector("#scene-card");
  if (!card || card.getAttribute("data-loc") !== k) { slot.innerHTML = scenePanelHTML(); card = slot.querySelector("#scene-card"); card.setAttribute("data-loc", k); }
  else { card.classList.toggle("combat", !!S.world.combat); card.querySelector(".scene-head").innerHTML = sceneHeadHTML(); paintScene(card.querySelector("#scene-view"), id, false); }
  bindScene(slot, false);
}
function bindScene(root, big) {
  const view = root.querySelector(big ? "#scene-view-big" : "#scene-view"); if (!view) return;
  const id = S.world.loc; const sc = sceneOf(id);
  const rerender = () => { if (big) { paintScene(view, id, true); } renderWorld(); };
  const walkTo = (x, y) => { const taken = scenePeople(id).filter(p => p.type !== "hero"); const p = scFreeNear(sc, taken, x, y, 2.5); scState(id).player = { x: +p.x.toFixed(2), y: +p.y.toFixed(2) }; sfx("step"); save(); rerender(); };
  const open = (el, title, sub, acts) => {
    scHidePop(); el.classList?.add("sel");
    const pop = scShowPop(view, el, `<b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}<div class="sc-acts">${acts.map((a, i) => `<button type="button" class="btn small${i === 0 ? " primary" : ""}" data-i="${i}" ${a.dis ? "disabled" : ""}>${esc(a.t)}</button>`).join("")}</div>`);
    pop.querySelectorAll("button").forEach(b => b.onclick = ev => { ev.stopPropagation(); const a = acts[+b.dataset.i]; scHidePop(); if (big && a.closes !== false) closeModal(); a.fn(); });
  };
  const turn = t => { if (busy || S.dead) return; takeTurn(t); };
  const approach = (x, y) => () => walkTo(x, y + .9);
  view.onclick = ev => {
    if (ev.target.closest(".map-expand")) return; const el = ev.target.closest("[data-hit]"); const svg = view.querySelector("svg.sc-svg"); sfx("tap");
    if (!el || !el.dataset.hit) { if (scPopEl && !scPopEl.hidden) { scHidePop(); return; } const r = svg.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width * SC_W, y = (ev.clientY - r.top) / r.height * SC_H; if (busy) return; walkTo(x, y); return; }
    const [kind, ref] = el.dataset.hit.split(/:(.*)/s); const ppl = scenePeople(id);
    if (kind === "obj") { const o = sceneObjects(id).find(q => q.id === ref); if (!o) return;
      if (o.bld) { const bid = o.bld, b = POIS[bid], st = bstate(bid); const dp = sc.doors[bid] || { x: o.x, y: o.y }; const knownLocked = st.known === tkey() && bldLocked(bid); const acts = [];
        acts.push({ t: (b.bk === "shop" || b.bk === "smithy") && !bldLocked(bid) ? "Войти" : "Открыть дверь", dis: busy, fn: () => { if (!bldLocked(bid)) bldAction(bid, "enter"); else { st.known = tkey(); scState(id).player = { x: dp.x, y: dp.y }; pushFeed({ t: "sys", html: `Дверь заперта: ${esc(b.name)}.` }); sfx("thud"); save(); rerender(); } } });
        if (!st.broken) acts.push({ t: "Постучать", fn: () => bldAction(bid, "knock"), dis: busy });
        acts.push({ t: "Подслушать", fn: () => bldAction(bid, "listen"), dis: busy }, { t: "Заглянуть в окно", fn: () => bldAction(bid, "peek"), dis: busy });
        if (knownLocked) acts.push({ t: "Взломать замок", fn: () => bldAction(bid, "pick"), dis: busy }, { t: "Выбить дверь", fn: () => bldAction(bid, "force"), dis: busy });
        acts.push({ t: "Подойти", fn: () => walkTo(dp.x, dp.y), closes: false });
        open(el, b.name, bldStatus(bid), acts); return; }
      if (o.k === "door" && POIS[id].inner) { open(el, "Дверь", `выход: ${POIS[POIS[id].parent].name}`, [{ t: "Выйти наружу", fn: exitBuilding, dis: busy }, { t: "Подойти", fn: approach(o.x, o.y - 1.6), closes: false }]); return; }
      const acts = [{ t: "Осмотреть", fn: () => turn(`Осматриваю ${o.acc}`), dis: busy }]; if (o.search) acts.push({ t: "Обыскать", fn: () => searchObj(id, o), dis: busy });
      if (["bar", "stall", "anvil", "altar"].includes(o.k)) { const ms = merchantsHere(); const mm = (o.k === "stall" ? ms.find(x => x.type === "stall") : ms.find(x => x.type !== "stall")) ; if (mm) acts.unshift({ t: "Торговать", fn: () => openShop(mm), dis: busy }); }
      const sp = { hearth: "Погреться у огня", bar: "Заказать выпивку", altar: "Помолиться", well: "Заглянуть в колодец", boat: "Сесть в лодку", stairs: "Подняться наверх", campfire: "Сесть у костра", bed: "Прилечь", font: "Окропить себя водой", stall: "Прицениться к товару" }[o.k];
      if (sp) acts.push({ t: sp, fn: () => turn(sp), dis: busy }); acts.push({ t: "Подойти", fn: approach(o.x, o.y), closes: false });
      open(el, o.label[0].toUpperCase() + o.label.slice(1), S.world.taken?.[id + ":" + o.id] ? "уже обыскано" : "", acts); return; }
    if (kind === "npc") { const n = NPCS[ref]; const p = ppl.find(q => q.id === ref); const zz = p?.asleep; const mer = !zz && merchantsHere().find(mm => mm.npc === ref); open(el, n.name, `${n.role} · ${zz ? "спит" : attLabel(S.world.npcs[ref]?.att || 0)[0]}`, [
      ...(mer ? [{ t: "Торговать", fn: () => openShop(mer), dis: busy }] : []),
      { t: zz ? "Разбудить" : "Заговорить", fn: () => { if (zz) { bstate(id).alarm = tkey(); turn(`Бужу: ${n.name}`); return; } walkTo(p.x, p.y + .9); showTab("story"); const inp = document.getElementById("act-input"); inp.value = `${n.name}, `; inp.focus(); }, closes: true },
      { t: "Присмотреться", fn: () => turn(`Незаметно присматриваюсь: ${n.name} (${n.role})`), dis: busy }, { t: "Подойти", fn: approach(p.x, p.y), closes: false }]); return; }
    if (kind === "crowd") { const p = ppl.find(q => q.type === "crowd" && q.label === ref) || {}; const stall = /торгов/.test(ref) && merchantsHere().find(x => x.type === "stall");
      open(el, ref[0].toUpperCase() + ref.slice(1), "безымянный местный житель", [...(stall ? [{ t: "Торговать", fn: () => openShop(stall), dis: busy }] : []),{ t: "Заговорить", fn: () => turn(`Подхожу к человеку (${ref}) и заговариваю с ним`), dis: busy }, { t: "Подслушать", fn: () => turn(`Прислушиваюсь, о чём говорит ${ref}`), dis: busy }, { t: "Подойти", fn: approach(p.x || 9, p.y || 6), closes: false }]); return; }
    if (kind === "foe") { const E = ENEMIES[ref]; open(el, E.name, enemyStatus(ref), [{ t: "Атаковать", fn: () => turn(`Атакую: ${E.name}`), dis: busy }, { t: "Оценить врага", fn: () => turn(`Оцениваю, насколько опасен ${E.name}`), dis: busy }]); return; }
    if (kind === "hero") open(el, C().name, "это вы · клик по полу — переместиться", [{ t: "Осмотреться", fn: () => turn("Осматриваюсь внимательно"), dis: busy }, { t: "Подождать", fn: waitTime, dis: busy || S.world.combat }]);
  };
  view.onkeydown = ev => { if ((ev.key === "Enter" || ev.key === " ") && ev.target.closest("[data-hit]")) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); } };
  if (!big) { const b = root.querySelector("#scene-big"); if (b) b.onclick = ev => { ev.stopPropagation(); openBigScene(); }; const w = root.querySelector("#sc-wait"); if (w) w.onclick = ev => { ev.stopPropagation(); waitTime(); }; }
}
function openBigScene() {
  if (!S) return; const id = S.world.loc;
  modal(`<div class="bigmap"><div class="bigmap-head"><div><div class="eyebrow">План локации · ${SC_NAMES[sceneOf(id).tpl] || ""} · ${DAY_PARTS[worldTime().part]} · ${weatherNow().name.toLowerCase()}</div><h2>${esc(POIS[id].name)}</h2></div><div class="bm-tools"><button class="btn small" type="button" id="sb-close">Закрыть</button></div></div>
  <div class="scene-view big" id="scene-view-big">${sceneSVG(id, true)}</div>
  <div class="legend"><span><i class="lg here"></i>вы</span><span><i class="lg tk-npc"></i>персонажи</span><span><i class="lg tk-crowd"></i>местные</span><span><i class="lg tk-foe"></i>враги</span><span class="home-note">Нажмите на человека или предмет, чтобы действовать. Клик по полу — подойти.</span></div></div>`, root => {
    root.querySelector(".modal").classList.add("wide"); root.querySelector("#sb-close").onclick = () => { scHidePop(); closeModal(); renderWorld(); }; bindScene(root, true);
  });
}

/* TRADE */
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
    return `<button type="button" class="ware${inDeal ? " in" : ""}" data-buy="${s.id}" ${left <= 0 || refuse ? "disabled" : ""} style="--cc:${CAT_COL[it.cat]}"><span class="ware-ic">${catIcon(it.cat)}</span><span class="ware-t"><b>${esc(it.n)}</b><small>${esc(it.d || "")}</small>${note ? `<em>${note}</em>` : ""}</span><span class="ware-p"><span class="pr">${COIN}${fmtMoney(price)}</span><small>${s.q >= 99 ? "" : left > 0 ? "× " + left : "нет"}</small></span>${inDeal ? `<i class="ware-n">${inDeal}</i>` : ""}</button>`; }).join("") || `<p class="empty">Ничего из этого сейчас нет.</p>`;
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

/* =========================================================================
   ЗВУК: музыка по настроению, фон, эффекты
   Музыка и звуки — Battle for Wesnoth (GPL v2+); «Three Sheets» — Scott Buckley (CC BY-SA 4.0)
   ========================================================================= */
const AU_KEY = "sh6-audio";
const MUSIC = {
  menu: ["legends_of_the_north", "wanderer"], explore: ["wanderer", "knolls", "legends_of_the_north"], forest: ["silvan_sanctuary", "wanderer"], tavern: ["three-sheets", "traveling_minstrels"],
  sacred: ["nunc_dimittis"], deep: ["underground", "the_deep_path", "into_the_shadows"], night: ["into_the_shadows", "the_deep_path", "silvan_sanctuary"], tension: ["suspense", "into_the_shadows"],
  battle: ["battle-epic", "frantic", "heroes_rite"], defeat: ["sad"]
};
const AMB = { campfire: "a-campfire", ship: "a-ship", birds: "a-birds1", night: "a-night" };
const SFX = {
  tap: ["s-button"], pick: ["s-select"], open: ["s-expand"], close: ["s-contract"], step: ["s-checkbox"], arrive: ["s-arrive"], bell: ["s-bell"], start: ["s-gamestart"],
  sword: ["s-sword-1"], mace: ["s-mace"], staff: ["s-staff"], bow: ["s-bow"], dagger: ["s-dagger-swish"], axe: ["s-axe"], miss: ["s-miss-1", "s-miss-2"],
  hurt: ["s-human-hit-1", "s-human-hit-2"], die: ["s-human-die-1"], heal: ["s-heal"], potion: ["s-potion"], gold: ["s-gold"], chest: ["s-open-chest"], throw: ["s-throw-1"],
  fire: ["s-fire"], lightning: ["s-lightning"], holy: ["s-magic-holy-1"], dark: ["s-magic-dark"], missile: ["s-magic-missile-1"], fanfare: ["s-fanfare-short"],
  horn: ["s-horn-2"], growl: ["s-wolf-growl-1"], rumble: ["s-rumble"], victory: ["m-victory2"], defeat: ["m-sad"]
};
const AU = { cfg: Object.assign({ on: true, music: .45, sfx: .7, amb: .4 }, lsGet(AU_KEY) || {}), unlocked: false, mood: null, track: null, a: null, b: null, cur: null, amb: null, ambKey: null, pool: new Map(), ctx: null, fades: new Set(), duck: 1 };
const auSrc = n => `snd/${n}.mp3`;
function auSave() { lsSet(AU_KEY, AU.cfg); }
function auFade(el, to, ms, done) {
  if (!el) return; const from = el.volume; const t0 = performance.now(); const tok = {}; el._fade = tok;
  const step = () => { if (el._fade !== tok) return; const k = Math.min(1, (performance.now() - t0) / ms); el.volume = clamp(from + (to - from) * k, 0, 1); if (k < 1) requestAnimationFrame(step); else done?.(); };
  requestAnimationFrame(step);
}
function auMusicVol() { return AU.cfg.on ? AU.cfg.music * AU.duck : 0; }
function auPlayTrack(name) {
  const el = new Audio(auSrc("m-" + name)); el.preload = "auto"; el.volume = 0; AU.track = name;
  el.addEventListener("ended", () => { if (AU.cur === el) auNext(); }); el.addEventListener("error", () => { if (AU.cur === el) AU.cur = null; });
  const old = AU.cur; AU.cur = el; el.play().then(() => auFade(el, auMusicVol(), 2200)).catch(() => {});
  if (old) auFade(old, 0, 1800, () => { old.pause(); old.src = ""; });
}
function auNext() { const list = MUSIC[AU.mood] || MUSIC.explore; const opts = list.filter(t => t !== AU.track); auPlayTrack((opts.length ? opts : list)[Math.floor(Math.random() * (opts.length || list.length))]); }
function setMood(m) {
  if (!m || !MUSIC[m]) return; if (AU.mood === m && AU.cur) return; AU.mood = m;
  if (!AU.unlocked || !AU.cfg.on || AU.cfg.music <= 0) return; if (AU.cur && MUSIC[m].includes(AU.track)) return; auNext();
}
function setAmbience(k) {
  const key = AMB[k] ? k : null; if (AU.ambKey === key && (AU.amb || !key)) return; AU.ambKey = key;
  const old = AU.amb; AU.amb = null; if (old) auFade(old, 0, 1500, () => { old.pause(); old.src = ""; });
  if (!key || !AU.unlocked || !AU.cfg.on || AU.cfg.amb <= 0) return;
  const el = new Audio(auSrc(AMB[key])); el.loop = true; el.volume = 0; AU.amb = el; el.play().then(() => auFade(el, AU.cfg.amb * .6, 2000)).catch(() => {});
}
function sfx(name, vol = 1) {
  if (!AU.cfg.on || AU.cfg.sfx <= 0 || !AU.unlocked) return; if (name === "dice") return auDice(); if (name === "chime") return auChime(true); if (name === "thud") return auChime(false);
  const list = SFX[name]; if (!list) return; const f = list[Math.floor(Math.random() * list.length)];
  let base = AU.pool.get(f); if (!base) { base = new Audio(auSrc(f)); base.preload = "auto"; AU.pool.set(f, base); }
  const el = base.paused && base.currentTime === 0 ? base : base.cloneNode(); const quiet = { tap: .25, pick: .35, step: .3, open: .35, close: .3 }[name] ?? 1;
  el.volume = clamp(AU.cfg.sfx * vol * quiet, 0, 1); el.currentTime = 0; el.play().catch(() => {});
  if (name === "victory" || name === "defeat" || name === "fanfare" || name === "horn") { AU.duck = .35; if (AU.cur) auFade(AU.cur, auMusicVol(), 300); setTimeout(() => { AU.duck = 1; if (AU.cur) auFade(AU.cur, auMusicVol(), 1600); }, name === "victory" ? 6000 : 2600); }
}
function auCtx() { if (!AU.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AU.ctx = new C(); } if (AU.ctx.state === "suspended") AU.ctx.resume(); return AU.ctx; }
/* кубики: несколько коротких ударов о дерево с затуханием */
function auDice() {
  const ctx = auCtx(); if (!ctx) return; const t0 = ctx.currentTime + .02; const out = ctx.createGain(); out.gain.value = AU.cfg.sfx * .9; out.connect(ctx.destination);
  const buf = ctx.createBuffer(1, ctx.sampleRate * .05, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  let t = t0; const hits = 7 + Math.floor(Math.random() * 4);
  for (let i = 0; i < hits; i++) {
    const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = .7 + Math.random() * .8;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800 + Math.random() * 2600; bp.Q.value = 3 + Math.random() * 4;
    const g = ctx.createGain(); g.gain.value = (1 - i / hits) * (.6 + Math.random() * .5); src.connect(bp); bp.connect(g); g.connect(out); src.start(t);
    const body = ctx.createOscillator(); body.type = "triangle"; body.frequency.value = 180 + Math.random() * 120; const bg = ctx.createGain(); bg.gain.setValueAtTime(.18 * (1 - i / hits), t); bg.gain.exponentialRampToValueAtTime(.001, t + .06);
    body.connect(bg); bg.connect(out); body.start(t); body.stop(t + .07);
    t += .035 + Math.pow(i / hits, 1.6) * .14 + Math.random() * .03;
  }
}
function auChime(good) {
  const ctx = auCtx(); if (!ctx) return; const t = ctx.currentTime + .02; const out = ctx.createGain(); out.gain.value = AU.cfg.sfx * .5; out.connect(ctx.destination);
  const notes = good ? [659.3, 987.8] : [196, 146.8];
  notes.forEach((f, i) => { const o = ctx.createOscillator(); o.type = good ? "sine" : "triangle"; o.frequency.value = f; const g = ctx.createGain(); const s = t + i * (good ? .09 : .12);
    g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(good ? .5 : .55, s + .01); g.gain.exponentialRampToValueAtTime(.001, s + (good ? .9 : .5)); o.connect(g); g.connect(out); o.start(s); o.stop(s + 1); });
}
function auUnlock() {
  if (AU.unlocked) return; AU.unlocked = true; auCtx(); const m = AU.mood; AU.mood = null; setMood(m || "menu"); const a = AU.ambKey; AU.ambKey = undefined; setAmbience(a);
  ["s-button", "s-select", "s-sword-1", "s-miss-1"].forEach(f => { if (!AU.pool.has(f)) { const e = new Audio(auSrc(f)); e.preload = "auto"; AU.pool.set(f, e); } });
}
function auApply() {
  auSave(); if (!AU.cfg.on) { [AU.cur, AU.amb].forEach(el => el && auFade(el, 0, 600, () => el.pause())); return; }
  if (AU.cur) { if (AU.cur.paused) AU.cur.play().catch(() => {}); auFade(AU.cur, auMusicVol(), 400); } else if (AU.unlocked && AU.cfg.music > 0) { const m = AU.mood; AU.mood = null; setMood(m || "menu"); }
  if (AU.amb) { if (AU.amb.paused) AU.amb.play().catch(() => {}); auFade(AU.amb, AU.cfg.amb * .6, 400); } else { const a = AU.ambKey; AU.ambKey = undefined; setAmbience(a); }
  AU.wxSig = undefined; try { auWeather(); } catch (e) {}
  renderSoundBtn();
}
function renderSoundBtn() { const b = document.getElementById("btn-sound"); if (!b) return; b.setAttribute("aria-pressed", String(AU.cfg.on)); b.title = AU.cfg.on ? "Выключить звук" : "Включить звук"; b.querySelector(".snd-on").style.display = AU.cfg.on ? "" : "none"; b.querySelector(".snd-off").style.display = AU.cfg.on ? "none" : ""; }
/* настроение сцены по месту, времени, бою и угрозе */
function moodNow() {
  if (!S) return "menu"; if (S.dead) return "defeat"; if (S.world.combat) return "battle";
  const tpl = sceneTpl(S.world.loc); const part = worldTime().part;
  if (tpl === "inn") return "tavern"; if (tpl === "chapel" || tpl === "shrine") return "sacred"; if (tpl === "cave" || tpl === "mine") return "deep";
  if ((S.world.threat || 0) >= 4) return "tension"; if (part === 3) return "night"; if (tpl === "forest" || tpl === "camp") return "forest"; return "explore";
}
function ambNow() { if (!S) return null; const tpl = sceneTpl(S.world.loc); const k = SC_AMB[tpl]; if (k === "birds" && worldTime().part >= 2) return "night"; if (!k && !["inn", "house", "hut", "chapel", "cave", "mine", "tower"].includes(tpl) && worldTime().part === 3) return "night"; return k || null; }
function syncAudio() { setMood(moodNow()); setAmbience(ambNow()); try { auWeather(); } catch (e) {} }
/* звук результата броска */
const WEAPON_SFX = { longsword: "sword", rapier: "dagger", shortbow: "bow", staff: "staff", mace: "mace" };
function spellSfx(sp) { const t = sp?.type || ""; if (sp?.kind === "heal") return "heal"; if (/огн/.test(t)) return "fire"; if (/звук|молни|гром/.test(t)) return "lightning"; if (/излуч/.test(t)) return "holy"; if (/некро|яд/.test(t)) return "dark"; return "missile"; }
function rollSfx(r) {
  if (!r) return;
  if (r.kind === "attack") { if (r.ok) { sfx(WEAPON_SFX[r.weapon] || "sword"); if (r.crit) setTimeout(() => sfx("fanfare", .6), 250); } else sfx("miss"); return; }
  if (r.kind === "spell") { const sp = SPELLS[r.spell]; if (r.noslot) return sfx("thud"); sfx(spellSfx(sp)); return; }
  if (r.kind === "enemy") { if (r.skip) return; if (r.ok) { sfx(ENEMIES[r.by]?.type === "wolf" ? "growl" : "hurt"); } else sfx("miss", .7); return; }
  if (r.kind === "skill" || r.kind === "save") { if (r.crit) sfx("fanfare", .7); else sfx(r.ok ? "chime" : "thud"); return; }
}
document.addEventListener("pointerdown", auUnlock, { capture: true }); document.addEventListener("keydown", auUnlock, { capture: true });
document.addEventListener("click", e => { const b = e.target.closest("button"); if (!b || b.disabled || b.closest(".scene-view") || b.id === "btn-roll") return; sfx(b.matches(".choice, .skill-opt, .world-pick, [aria-pressed]") ? "pick" : "tap"); }, { capture: true });
document.addEventListener("visibilitychange", () => { const hid = document.hidden; [AU.cur, AU.amb].forEach(el => { if (!el) return; if (hid) el.pause(); else if (AU.cfg.on) el.play().catch(() => {}); }); });
function soundSettingsHTML() {
  const row = (k, l) => `<label class="au-row"><span>${l}</span><input type="range" min="0" max="100" step="5" value="${Math.round(AU.cfg[k] * 100)}" data-au="${k}" aria-label="${l}"><b class="num">${Math.round(AU.cfg[k] * 100)}</b></label>`;
  return `<div class="opt-group"><span>Звук</span><div class="opts"><button type="button" data-auon="1" aria-pressed="${AU.cfg.on}">Включён</button><button type="button" data-auon="0" aria-pressed="${!AU.cfg.on}">Выключен</button></div>
  <div class="au-rows">${row("music", "Музыка")}${row("amb", "Фон")}${row("sfx", "Эффекты")}</div>
  <small class="home-note">Музыка меняется сама: таверна, бой, ночь, святилище, подземелье. Музыка и звуки — из открытой игры <a href="https://github.com/wesnoth/wesnoth" target="_blank" rel="noopener">Battle for Wesnoth</a> (GPL v2+), «Three Sheets» — Scott Buckley (CC BY-SA 4.0).</small></div>`;
}
function bindSoundSettings(root) {
  root.querySelectorAll("[data-au]").forEach(inp => inp.oninput = () => { AU.cfg[inp.dataset.au] = inp.value / 100; inp.nextElementSibling.textContent = inp.value; auApply(); });
  root.querySelectorAll("[data-au]").forEach(inp => inp.onchange = () => { if (inp.dataset.au === "sfx") sfx("chime"); });
  root.querySelectorAll("[data-auon]").forEach(b => b.onclick = () => { AU.cfg.on = b.dataset.auon === "1"; root.querySelectorAll("[data-auon]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); auApply(); });
}

function renderWorld() {
  refreshBuildings(); const el = document.getElementById("world"); const loc = POIS[S.world.loc]; const sel = mapSel && mapSel !== S.world.loc ? POIS[mapSel] : null;
  const si = sel ? placeInfoHTML(mapSel) : null;
  if (!el.querySelector("#w-scene")) el.innerHTML = `<div id="w-top" class="w-part"></div><div id="w-scene" class="w-part"></div><div id="w-rest" class="w-part"></div>`;
  el.querySelector("#w-top").innerHTML = `<div class="mapwrap">${mapMarkup("mapbox", "small")}<button class="map-expand" type="button" id="map-big" aria-label="Развернуть карту" title="Развернуть карту"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button>${sel ? `<div class="map-tip" style="right:52px"><div class="t"><b>${esc(si.name)}</b><small>${esc(si.text)}</small></div><button class="btn small primary" type="button" id="go-sel" ${busy || S.world.combat ? "disabled" : ""}>Идти</button></div>` : ""}</div>
`;
  updateScenePanel(el.querySelector("#w-scene"));
  el.querySelector("#w-rest").innerHTML = `<div class="card"><div class="eyebrow">Вы здесь</div><h3>${esc(loc.name)}</h3><p>${esc(loc.desc)}</p></div>
  ${S.world.combat ? `<div><div class="section-t"><span class="eyebrow" style="color:var(--ember)">Бой</span></div><div style="display:flex;flex-direction:column;gap:6px">${Object.keys(ENEMIES).filter(id => ENEMIES[id].loc === S.world.loc).map(id => { const e = S.world.enemies[id]; const E = ENEMIES[id]; return `<div class="foe ${e.alive ? "" : "dead"}"><div class="row"><b>${esc(E.name)}</b><span>КД ${E.ac} · ${enemyStatus(id)}</span></div><div class="bar" style="height:5px"><i style="width:${e.hp / E.hp * 100}%;background:var(--ember)"></i></div></div>`; }).join("")}</div></div>` : ""}
  <div><div class="section-t"><span class="eyebrow">Здесь</span></div><div id="npc-list"></div></div>
  <div class="card" style="background:transparent"><div class="eyebrow">Задание</div><p style="color:var(--foam);margin-top:4px">${esc(S.world.quest)}</p></div>
  <div><div class="section-t"><span class="eyebrow">Летопись · память рассказчика</span><span class="num" style="color:var(--dim);font-size:11px">${S.world.facts.length} фактов</span></div>
  ${retryBtnHTML()}${S.summary ? `<p class="summary-box">${esc(S.summary)}</p>` : ""}${archiving ? `<p class="archiving">Архивариус сжимает старые записи…</p>` : ""}
  ${S.world.facts.length ? `<ol class="chron" style="margin-top:8px">${S.world.facts.slice(-8).map(f => `<li>${esc(f)}</li>`).join("")}</ol>` : (S.summary ? "" : `<p class="empty">Здесь появятся важные факты, которые рассказчик запомнит.</p>`)}</div>`;
  const list = el.querySelector("#npc-list");
  if (!loc.npcs.length) list.innerHTML = `<p class="empty">Ни души. Только ветер.</p>`;
  loc.npcs.forEach(id => { const n = NPCS[id]; if (!n) return; const [lab, cl] = attLabel(S.world.npcs[id]?.att || 0);
    const b = document.createElement("button"); b.type = "button"; b.className = "npc-row";
    b.innerHTML = `${npcPh(id)}<span class="t"><b>${esc(n.name)}</b><small>${esc(n.role)}</small></span><span class="att ${cl}">${lab}</span>`;
    b.onclick = () => { const inp = document.getElementById("act-input"); inp.value = `${n.name}, `; inp.focus(); showTab("story"); };
    list.append(b); });
  const ms = merchantsHere(); if (ms.length && !S.world.combat) { const tw = document.createElement("div"); tw.className = "trade-row"; ms.forEach(m => { const b = document.createElement("button"); b.type = "button"; b.className = "trade-chip"; b.innerHTML = `${COIN}<span>Торговать · ${esc(m.name)}</span>`; b.disabled = busy; b.onclick = () => openShop(m); tw.append(b); }); list.append(tw); }
  el.querySelector("#map-big").onclick = openBigMap; syncAudio();
  const go = el.querySelector("#go-sel"); if (go) go.onclick = () => { const p = mapSel; mapSel = null; takeTurn(`Иду: ${POIS[p].name}`, { checks: [], move_to: p }); };
  requestAnimationFrame(drawMap);
}
function renderSugg() {
  const s = document.getElementById("sugg"); s.innerHTML = "";
  if (!S.dead && !S.dying) { const cb = document.createElement("button"); cb.type = "button"; cb.className = "cont"; cb.textContent = "Продолжить ▸"; cb.title = "Пусть рассказчик продвинет сцену"; cb.disabled = busy; cb.onclick = () => { if (!busy) takeTurn(CONTINUE); }; s.append(cb); }
  (S.suggestions || []).slice(0, 3).forEach(t => { const b = document.createElement("button"); b.type = "button"; b.textContent = t; b.disabled = busy; b.onclick = () => { if (!busy) takeTurn(t); }; s.append(b); });
  if (lastSnap && S.mode !== "chronicle" && !busy) { const u = document.createElement("button"); u.type = "button"; u.className = "undo"; u.textContent = "↶ Отменить ход"; u.title = "Вернуть всё как было до последнего действия"; u.onclick = undoTurn; s.append(u); }
}
function undoTurn() {
  if (!lastSnap || busy) return; try { speechSynthesis?.cancel(); } catch (e) {}
  const snap = JSON.parse(lastSnap); lastSnap = null; S = snap; setWorld(S.wd); renderFeed(); renderAll(); save(); scrollFeed(); pushFeed({ t: "sys", html: "Ход отменён." }); S.feed.pop();
}

/* ---------- feed ---------- */
function pushFeed(e) { S.feed.push(e); if (S.feed.length > 160) S.feed.splice(0, S.feed.length - 160); renderEntry(e, true); scrollFeed(); return e; }
function scrollFeed() { const f = document.getElementById("feed"); requestAnimationFrame(() => { f.scrollTop = f.scrollHeight; }); }
function renderFeed() { document.getElementById("feed-inner").innerHTML = ""; S.feed.forEach(e => renderEntry(e, false)); }
function narrHTML(text) { const t = esc(text).replace(/«([^»]{1,400})»/g, "<q>$1</q>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\*([^*]+)\*/g, "<i>$1</i>"); return t.split(/\n+/).filter(p => p.trim()).map(p => `<p>${p}</p>`).join(""); }
function speakerHTML(id) { const n = NPCS[id]; return n ? `<div class="speaker">${npcPh(id)}<span><b>${esc(n.name)}</b><small>${esc(n.role)}</small></span></div>` : ""; }
function renderEntry(e, fresh) {
  const fi = document.getElementById("feed-inner"); const d = document.createElement("div"); Object.defineProperty(e, "_el", { value: d, writable: true, configurable: true, enumerable: false });
  if (e.t === "narr") { d.className = "e-narr"; d.innerHTML = (e.speaker ? speakerHTML(e.speaker) : "") + `<div class="tx ${e.first ? "e-first" : ""}">${narrHTML(e.text)}${e.streaming ? '<span class="caret"></span>' : ""}</div>` + (HAS_TTS ? `<button class="narr-voice" type="button" title="Озвучить" aria-label="Озвучить фрагмент">▶ Озвучить</button>` : ""); }
  else if (e.t === "recap") { d.className = "e-recap"; d.innerHTML = `<div class="eyebrow">Ранее в «${esc(WD.name)}»</div>${narrHTML(e.text)}`; }
  else if (e.t === "player") { d.className = "e-player"; d.innerHTML = `<div class="who-s">${esc(C().name)}</div>${esc(e.text)}`; }
  else if (e.t === "sys") { d.className = "e-sys"; d.innerHTML = e.html; }
  else if (e.t === "roll") {
    const r = e.r; const cls = r.enemyRoll ? "enemy " + (r.ok ? "fail" : "ok") : r.crit ? "crit" : r.ok ? "ok" : "fail";
    const v = r.skip ? "—" : r.enemyRoll ? (r.kind === "enemy" ? (r.crit ? "Крит по вам" : r.ok ? "Попадание" : "Промах") : (r.ok ? "Провал цели" : "Цель устояла")) : r.noslot ? "Нет ячеек" : r.crit ? "Критический успех" : r.fumble ? "Провал (1)" : r.ok ? (r.kind === "attack" || r.kind === "spell" ? "Попадание" : "Успех") : (r.kind === "attack" || r.kind === "spell" ? "Промах" : "Провал");
    d.className = "e-roll " + cls;
    if (fresh && r.nat && !matchMedia("(prefers-reduced-motion: reduce)").matches) setTimeout(() => { const sp = d.querySelector(".d20 span"); if (!sp) return; let k = 0; const iv = setInterval(() => { sp.textContent = k++ < 8 ? 1 + Math.floor(Math.random() * 20) : r.nat; if (k > 8) clearInterval(iv); }, 70); }, 0);
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
  const c = C(); return `${c.name} (${c.gender === "f" ? "она" : "он"}), ${RACES[c.race].name}, ${CLASSES[c.cls].name} ${c.level} ур. (бонус мастерства ${fmt(prof(c.level))}), предыстория: ${BACKGROUNDS[c.bg].name} — вы ${c.hook || bgHook(c.bg)}. Характер: ${c.persona}. ${c.about ? "О себе: " + c.about : ""} ${c.look ? "Внешность: " + c.look + "." : ""} HP ${c.hp}/${c.maxHp}, КД ${c.ac}. Навыки: ${c.skills.map(k => SKILLS[k][0]).join(", ")}. Предметы: ${c.items.map(i => i.name).join(", ")}, ${fmtMoney(purse(c))}.${c.spells.length ? " Заклинания: " + c.spells.map(s => SPELLS[s].name).join(", ") + ". Свободные ячейки: " + (Object.entries(c.slots).map(([l, [, cur]]) => `${l} круг — ${cur}`).join(", ") || "нет") + "." : ""}`;
}
function sceneBrief() {
  const loc = POIS[S.world.loc]; const L = S.world.loc;
  const npcs = loc.npcs.filter(id => NPCS[id]).map(id => { const n = NPCS[id]; const st = S.world.npcs[id] || { att: 0, mem: [] }; return `- [${id}] ${n.name}, ${n.role}; внешность: ${n.look}; характер: ${n.persona}; тайна (не выдавать сразу): ${n.secret}; отношение к герою: ${st.att} (${attLabel(st.att)[0]}); помнит: ${st.mem.slice(-4).join("; ") || "ничего"}`; }).join("\n");
  const foes = Object.keys(ENEMIES).filter(id => ENEMIES[id].loc === L).map(id => `- [${id}] ${ENEMIES[id].name}: ${enemyStatus(id)}`).join("\n");
  const pois = outerEntries().map(([id, p]) => `${id} = ${p.name}`).join("; ");
  return `ЛОКАЦИЯ: ${loc.name} [${L}] — ${loc.desc}
Улика здесь (выдать при успешном поиске): ${loc.clue || "—"}
НПС здесь:
${npcs || "- никого"}
${foes ? "ВРАГИ в этой локации (нападают, когда герой их обнаружил или пришёл в логово):\n" + foes : ""}
БОЙ: ${S.world.combat ? "идёт" : "нет"}
ТОЧКИ НА КАРТЕ: ${pois}
ВРЕМЯ: день ${worldTime().day}, ${DAY_PARTS[worldTime().part]}. ПОГОДА: ${weatherNow().name}, ${(SEASONS[WD.season] || "осень").toLowerCase()}. РЕПУТАЦИЯ ГЕРОЯ В ПОСЕЛЕНИИ: ${S.world.rep || 0} (${repLabel(S.world.rep || 0)}).
ГДЕ СЕЙЧАС ЛЮДИ: ${peopleWhereBrief()}. ЧАСЫ УГРОЗЫ: ${S.world.threat || 0} из 6 (чем выше, тем ближе злодей к цели).
${sceneBriefLine()}
${bldBrief()}
ПОМЕТКИ НА КАРТЕ ГЕРОЯ: ${Object.entries(S.world.notes || {}).map(([id, n]) => `${id}: ${n}`).join("; ") || "нет"}`;
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
  if (plan.move_to && POIS[plan.move_to] && plan.move_to !== S.world.loc) { const t = POIS[plan.move_to];
    if (!t.inner) out.move_to = plan.move_to; else if (t.parent !== hereOuter()) out.notes.push("Это здание в другом месте."); else if (bldLocked(plan.move_to)) { bstate(plan.move_to).known = tkey(); out.notes.push(`Дверь заперта: ${t.name}.`); } else { out.move_to = plan.move_to; const st = bstate(plan.move_to); st.how = st.how || "вошёл"; } }
  if (plan.talk_to && NPCS[plan.talk_to]) out.talk_to = plan.talk_to;
  (Array.isArray(plan.checks) ? plan.checks : []).slice(0, 2).forEach(ch => {
    const adv = clamp(Number(ch.adv) || 0, -1, 1); const reason = str(ch.reason, 120);
    if (ch.kind === "skill" && SKILLS[ch.skill]) out.checks.push({ kind: "skill", skill: ch.skill, dc: clamp(Math.round(Number(ch.dc) || 12), 5, 30), adv, reason });
    else if (ch.kind === "save" && ABIL.includes(ch.ability)) out.checks.push({ kind: "save", ability: ch.ability, dc: clamp(Math.round(Number(ch.dc) || 12), 5, 30), adv, reason });
    else if (ch.kind === "attack" && enemyHere(ch.target)) { const a = { kind: "attack", target: ch.target, weapon: C().weapons.includes(ch.weapon) ? ch.weapon : C().weapons[0], adv, reason }; out.checks.push(a); if (C().cls === "fighter" && C().level >= 5) out.checks.push({ ...a, extra: true, reason: "Дополнительная атака" }); }
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
    for (const [id, p] of outerEntries()) { const words = p.name.toLowerCase().replace(/[«»"]/g, "").split(/\s+/).filter(w => w.length > 3); if (words.some(w => t.includes(w.slice(0, Math.max(4, w.length - 2))))) { plan.move_to = id; break; } }
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
    const go = () => { document.removeEventListener("keydown", key); slot.innerHTML = ""; sfx("dice"); res(); };
    const key = ev => { if (["r", "R", "к", "К"].includes(ev.key) && document.activeElement?.id !== "act-input") { ev.preventDefault(); go(); } };
    document.addEventListener("keydown", key); slot.querySelector("#btn-roll").onclick = go; slot.querySelector("#btn-roll").focus();
  });
}
const CONTINUE = "[ПРОДОЛЖАЙ]"; let lastSnap = null;
async function takeTurn(text, preset) {
  if (busy || S.dead) return; if (S.dying) { pushFeed({ t: "sys", html: "Сначала спасброски от смерти." }); return; }
  if (!preset && text !== CONTINUE && tryTradeIntent(text)) return;
  const intro = preset && preset.intro; if (!intro) { try { lastSnap = JSON.stringify(S); } catch (e) { lastSnap = null; } }
  busy = true; setBusy(true); S.turnSneak = false; S.pendingXP = 0; refreshBuildings();
  if (text === CONTINUE) { pushFeed({ t: "sys", html: "Вы ждёте и наблюдаете…" }); S.log.push({ who: "p", text: "(ждёт и наблюдает)" }); preset = { checks: [] }; }
  else if (!intro) { pushFeed({ t: "player", text }); S.log.push({ who: "p", text }); }
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
        if (ch.extra && !enemyHere(ch.target)) { const nxt = aliveEnemiesHere()[0]; if (!nxt) continue; ch.target = nxt; }
      if (ch.kind === "skill" || ch.kind === "save" || ch.kind === "attack" || (ch.kind === "spell" && SPELLS[ch.spell].kind === "attack")) await waitRoll(ch);
      const r = resolveCheck(ch); if (!r) continue; results.push(r); pushFeed({ t: "roll", r }); setTimeout(() => rollSfx(r), ch.kind === "spell" && SPELLS[ch.spell].kind !== "attack" ? 0 : 520);
      if (r.heal) pushFeed({ t: "chips", items: [{ c: "heal", x: `+${r.heal} HP` }] });
      if (r.dmg) pushFeed({ t: "chips", items: [{ c: "dmg", x: `−${r.dmg} HP · ${ENEMIES[r.target]?.name || "цель"} (${r.enemyAfter})` }] });
      await pause(250);
    }
    if (S.world.combat && !intro) { for (const r of enemyTurn()) { results.push(r); pushFeed({ t: "roll", r }); if (!r.skip) { sfx("dice"); setTimeout(() => rollSfx(r), 480); await pause(300); } if (r.dmg) pushFeed({ t: "chips", items: [{ c: "dmg", x: `−${r.dmg} HP вам` }] }); await pause(200); } }
    bldAfterChecks(results); searchAfterChecks(results);
    let combatEnded = false;
    if (S.world.combat && !aliveEnemiesHere().length) { S.world.combat = false; combatEnded = true; results.push({ kind: "combat_end", title: "Все враги повержены" }); }
    renderSheet(); renderWorld(); renderTop();
    const eff = await narrate(text, plan, results, intro);
    applyEffects(eff, combatEnded);
    if (results.some(r => r.kind === "skill" && r.ok) && (Array.isArray(eff.facts) && eff.facts.length || S.world.flags["clue_" + S.world.loc])) S.world.flags["clue_" + S.world.loc] = true;
  } catch (err) { thinking?.remove(); pushFeed({ t: "sys", html: "Что-то пошло не так в этом ходе. Попробуйте сформулировать действие иначе." }); console.error(err); }
  S.pendingBld = null; S.pendingSearch = null; S.turn++; busy = false; setBusy(false); checkDeath(); after(); maybeArchive();
}
function after() { renderAll(); save(); }
function pause(ms) { return new Promise(r => setTimeout(r, ms)); }
function setBusy(b) { document.getElementById("btn-send").disabled = b; document.getElementById("btn-home").disabled = b; document.getElementById("btn-stop").hidden = !b || !ctl; renderSheet(); renderSugg(); const go = document.getElementById("go-sel"); if (go) go.disabled = b || S.world.combat; }
function showThinking(t) { const fi = document.getElementById("feed-inner"); const d = document.createElement("div"); d.className = "thinking"; d.innerHTML = `<span class="dots"><i></i><i></i><i></i></span><span>${esc(t)}…</span>`; fi.append(d); scrollFeed(); return d; }
const DAY_PARTS = ["утро", "день", "вечер", "ночь"];
function worldTime() { return S.world.time || (S.world.time = { day: 1, part: 0 }); }
function advanceTime(n) { const t = worldTime(); t.part += n; while (t.part > 3) { t.part -= 4; t.day++; } }
function moveTo(id) { mapSel = null; const from = POIS[S.world.loc], p = POIS[id]; const near = (p.inner && p.parent === (from?.inner ? from.parent : S.world.loc)) || (from?.inner && from.parent === id);
  if (S.world.loc !== id && !near) advanceTime(1); if (from?.inner && !near) { const dpS = bldSlot(S.world.loc); if (dpS) scState(from.parent).player = doorPt(dpS); }
  S.world.loc = id; if (!S.world.visited.includes(id)) S.world.visited.push(id); if (!p.inner) reveal(p.x, p.y, (p.enemies || []).length ? 2 : 3); refreshBuildings(); pushFeed({ t: "sys", html: `${p.inner ? "Вы входите" : "Вы приходите"}: <b>${esc(p.name)}</b>` }); renderWorld(); renderTop(); }
function resultsBrief(results) {
  if (!results.length) return "Бросков не было.";
  return results.map(r => {
    if (r.kind === "move" || r.kind === "note") return `• ${r.title}.`; if (r.kind === "combat_end") return "• Все враги в локации повержены, бой окончен.";
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

МИР «${WD.name}» (${GENRES[WD.genre] || "Расследование"}; опасность: ${(DANGERS[WD.danger] || "Опасный").toLowerCase()}): ${WD.public}
ТАЙНА (знает только мастер, раскрывать постепенно через заслуженные улики): ${WD.secret}
Опорные точки: ${(WD.beats || []).join(" | ")}. Хорошие концовки: ${(WD.endings || []).join(" | ")}.
ГЕРОЙ: ${charBrief()}
${sceneBrief()}
ЗАДАНИЕ: ${S.world.quest}
КРАТКО О ПРОШЛОМ (летопись архивариуса): ${S.summary || "кампания только началась"}
УСТАНОВЛЕННЫЕ ФАКТЫ (не противоречь): ${S.world.facts.slice(-14).join(" | ") || "пока ничего"}
НЕДАВНИЕ СОБЫТИЯ:
${recentLog(10) || "—"}

${S.world.villainMove ? "ПРОТИВНИК ДЕЛАЕТ ХОД: в этой сцене опиши заметное последствие его действий (новая жертва, улика уничтожена, союзник напуган, слух о беде) — так, чтобы герой это увидел или услышал.\n" : ""}${intro ? `НАЧАЛО КАМПАНИИ. Герой в стартовом месте «${POIS[S.world.loc].name}». Опиши атмосферу, дай местному НПС заговорить с героем, свяжи завязку с предысторией героя и дай 2–3 зацепки. Не раскрывай тайну. Можно опереться на набросок: ${WD.intro || "—"}` : text === CONTINUE ? `ИГРОК ЖДЁТ И НАБЛЮДАЕТ. Продвинь сцену сам: пусть НПС проявят инициативу, что-то случится или мир напомнит о себе. Не действуй за героя.` : `ДЕЙСТВИЕ ИГРОКА: «${text}»
РЕЗУЛЬТАТЫ ДВИЖКА (это истина, опиши именно их):
${resultsBrief(results)}`}

Правила письма:
- ${({ short: "50–90 слов, 1–2 абзаца", normal: "90–170 слов, 2–3 абзаца", long: "170–260 слов, 3–4 абзаца" })[S.settings?.len || "normal"]}. Реплики НПС в «ёлочках», у каждого свой голос и манера речи.
- НПС живые: у каждого свои цели и страхи, они могут отказать, солгать, торговаться, требовать плату, первыми заводить разговор. Не будь услужливым: герой получает только то, что заслужил словами, броском или ценой.
- Мир не ждёт героя: учитывай время суток и часы угрозы. Если герой медлит или шумно проваливается, угроза растёт.
- Покупки и продажи проходят через окно торговли движка: не выдавай купленное через items_add и не списывай gold за покупки; если герой хочет купить или продать, предложи ему поторговать. Последние сделки видны в недавних событиях.
- Не называй числа урона, HP и результаты кубиков — их покажет интерфейс. Не придумывай новых бросков.
- Провалы имеют последствия, успехи дают продвижение и улики. Раскрывай тайну только через заслуженные улики.
- Если герой пришёл в место, где есть ВРАГИ, они нападают или готовы напасть — начни бой через start_combat (если герой не прокрался незаметно).
- Не решай за героя, что он делает дальше. Закончи на моменте выбора.

После текста поставь строку @@@ и затем ОДНУ строку JSON с последствиями (только то, что реально произошло в тексте):
{"speaker": "id НПС, который говорит больше всех, или null", "damage": [{"dice":"1d4","reason":"почему"}], "heal": null, "items_add": [{"name":"…","desc":"…"}], "items_remove": [], "gold": 0, "xp": 0, "attitude": {"id_нпс": 0}, "facts": ["1–2 важных новых факта для памяти, коротко"], "quest": null, "map_notes": [{"place":"id места","note":"что герой узнал об этом месте, до 8 слов"}], "rumors": ["id места, о котором герой услышал, но ещё не был"], "building": null, "npc_moves": [], "rep": 0, "scene": {"add": [{"label":"предмет, 1–3 слова","acc":"он же в винительном падеже","kind":"chest|crate|barrel|table|bed|altar|statue|body|item|fire|lantern|boat|rock|bell|cart|cauldron|sack"}], "remove": ["label исчезнувшего предмета"], "crowd": null}, "new_npcs": [{"id":"latin_snake_case","name":"…","role":"…","look":"внешность 6–10 слов","persona":"характер, 1 предложение","gender":"m|f","age":"young|adult|old","important":false}], "threat": 0, "start_combat": [], "suggestions": ["3 коротких варианта следующего действия, до 6 слов"]}
damage — только если герой получил вред от окружения или ловушки (не от врагов, их урон уже посчитан). xp — 25–75 за важное открытие или решённую проблему, иначе 0. attitude — изменения от −15 до +15. quest — новая формулировка задания, если оно изменилось. npc_moves — если по сюжету НПС ушёл, сбежал, его увели или он пришёл в другое место: [{"id":"id НПС","to":"id места из списка или null — вернуться домой"}]. rep — изменение репутации героя в поселении от −10 до +10, если поступок стал известен местным (помощь, щедрость, драка, кража, хамство), иначе 0. scene — только если в сцене появился заметный предмет, с которым герой может взаимодействовать (тело, сундук, записка, следы), или предмет исчез/унесён; crowd — сколько безымянных людей сейчас фоном в локации (0–8), только если это заметно изменилось, иначе null. new_npcs — только если в сцене впервые появился новый человек с именем, которого нет в списке НПС (important: true — если он важен для тайны). threat: +1, если противник получил преимущество или герой потратил время впустую, −1 при серьёзном успехе против противника, иначе 0.`;
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
  addNewNpcs(eff); S.world.villainMove = false;
  if (eff.speaker && NPCS[eff.speaker] && (POIS[S.world.loc].npcs.includes(eff.speaker) || (S.pendingBld && POIS[S.pendingBld.bid]?.npcs.includes(eff.speaker)))) { e.speaker = eff.speaker; S.world.met = S.world.met || []; if (!S.world.met.includes(eff.speaker)) S.world.met.push(eff.speaker); }
  updateNarr(e); S.log.push({ who: "n", text: e.text }); if (e.speaker) { popNPC(e.speaker); wantPortrait(WD, e.speaker, 0); }
  if (S.settings?.voice) speak(e.text);
  return eff;
}
function applyEffects(eff, combatEnded) {
  const c = C(); const chips = []; sceneEffects(eff.scene); bldEffects(eff.building); npcMoves(eff.npc_moves); { const dr = clamp(Math.round(Number(eff.rep) || 0), -10, 10); if (dr) addRep(dr); }
  (Array.isArray(eff.damage) ? eff.damage : []).slice(0, 2).forEach(d => { const p = parseDice(d.dice); if (!p) return; p.n = Math.min(p.n, 3); const r = rollDice(p); hurtHero(r.total); chips.push({ c: "dmg", x: `−${r.total} HP · ${str(d.reason || "урон", 40)} (${r.text})` }); });
  if (eff.heal) { const p = parseDice(eff.heal.dice || eff.heal); if (p) { const r = rollDice(p); const got = healHero(r.total); chips.push({ c: "heal", x: `+${got} HP` }); } }
  (Array.isArray(eff.items_add) ? eff.items_add : []).slice(0, 3).forEach(it => { const name = str(typeof it === "string" ? it : it?.name, 40); if (!name) return; c.items.push({ name, desc: str(it.desc, 120), potion: /зелье лечения/i.test(name) }); chips.push({ c: "item", x: `+ ${name}` }); });
  (Array.isArray(eff.items_remove) ? eff.items_remove : []).slice(0, 3).forEach(n => { const i = c.items.findIndex(x => x.name.toLowerCase() === String(n).toLowerCase()); if (i >= 0) { chips.push({ c: "item", x: `− ${c.items[i].name}` }); c.items.splice(i, 1); } });
  const gold = clamp(Math.round(Number(eff.gold) || 0), -50, 100); if (gold && c.gold + gold >= 0) { c.gold += gold; chips.push({ c: "gold", x: `${gold > 0 ? "+" : ""}${gold} зм` }); }
  const xp = clamp(Math.round(Number(eff.xp) || 0), 0, 100 + 50 * C().level) + (S.pendingXP || 0); if (xp) { c.xp += xp; chips.push({ c: "xp", x: `+${xp} опыта` }); }
  if (eff.attitude && typeof eff.attitude === "object") Object.entries(eff.attitude).forEach(([id, v]) => { if (!NPCS[id]) return; const dv = clamp(Math.round(Number(v) || 0), -15, 15); if (!dv) return; const st = S.world.npcs[id] || (S.world.npcs[id] = { att: 0, mem: [] }); st.att = clamp(st.att + dv, -100, 100); chips.push({ c: "npc", x: `${NPCS[id].name}: ${dv > 0 ? "+" : ""}${dv} к отношению` }); });
  const loc = POIS[S.world.loc];
  (Array.isArray(eff.facts) ? eff.facts : []).slice(0, 3).forEach(f => { const s = str(f, 160); if (s && !S.world.facts.includes(s)) { S.world.facts.push(s); loc.npcs.forEach(id => S.world.npcs[id]?.mem.push(s)); } });
  if (S.world.facts.length > 40) S.world.facts.splice(0, S.world.facts.length - 40);
  loc.npcs.forEach(id => { const m = S.world.npcs[id]?.mem; if (m && m.length > 8) m.splice(0, m.length - 8); });
  S.world.notes = S.world.notes || {}; S.world.rumors = S.world.rumors || [];
  const dt = clamp(Math.round(Number(eff.threat) || 0), -1, 2);
  if (dt) { const before = S.world.threat || 0; S.world.threat = clamp(before + dt, 0, 6); const now = S.world.threat;
    chips.push({ c: dt > 0 ? "dmg" : "heal", x: dt > 0 ? `Угроза растёт: ${now}/6` : `Угроза отступает: ${now}/6` });
    if ((before < 3 && now >= 3) || (before < 6 && now >= 6)) { S.world.villainMove = true; pushFeed({ t: "sys", html: now >= 6 ? "<b>Часы угрозы пробили.</b> Противник добился своего, и мир меняется." : "<b>Угроза нарастает.</b> Противник делает свой ход." }); } }
  (Array.isArray(eff.map_notes) ? eff.map_notes : []).slice(0, 2).forEach(m => { const id = m?.place; const n = str(m?.note, 80); if (POIS[id] && n) { const isNew = !S.world.notes[id]; S.world.notes[id] = n; if (isNew) chips.push({ c: "gold", x: `На карте: ${POIS[id].name}` }); } });
  (Array.isArray(eff.rumors) ? eff.rumors : []).slice(0, 2).forEach(id => { if (POIS[id] && !S.world.visited.includes(id) && !S.world.rumors.includes(id)) { S.world.rumors.push(id); chips.push({ c: "gold", x: `Слух: ${POIS[id].name}` }); } });
  if (eff.quest && typeof eff.quest === "string") { S.world.quest = str(eff.quest, 200); chips.push({ c: "xp", x: "Задание обновлено" }); }
  const sc = (Array.isArray(eff.start_combat) ? eff.start_combat : []).filter(id => enemyHere(id));
  if (sc.length && !S.world.combat) { S.world.combat = true; const ini = rnd(20); const tot = ini + mod(c.scores.dex);
    sfx("dice"); pushFeed({ t: "roll", r: { kind: "init", title: "Инициатива", nat: ini, total: tot, ok: true, formula: `d20 (${ini}) ${fmt(mod(c.scores.dex))} = ${tot}`, reason: "Бой начался" } });
    pushFeed({ t: "sys", html: "<b>Бой!</b> Ваш ход: атакуйте из листа персонажа или опишите действие." }); }
  if (combatEnded) pushFeed({ t: "sys", html: "<b>Бой окончен.</b>" });
  if (chips.length) pushFeed({ t: "chips", items: chips });
  { const has = c2 => chips.some(x => x.c === c2); let d = 0; const q = n => { setTimeout(() => sfx(n), d); d += 380; };
    if (sc.length && S.world.combat) q("horn"); if (combatEnded) q("victory"); if (has("dmg") && chips.some(x => x.c === "dmg" && /HP/.test(x.x))) q("hurt"); if (has("heal")) q("heal");
    if (has("item")) q("chest"); if (gold > 0) q("gold"); if (dt > 0) q("rumble"); if (eff.quest) q("bell"); }
  S.suggestions = (Array.isArray(eff.suggestions) ? eff.suggestions : []).map(s => str(s, 48)).filter(Boolean).slice(0, 3);
  if (!S.suggestions.length) S.suggestions = defaultSuggestions();
}
function defaultSuggestions() {
  if (S.world.combat) return ["Атакую ближайшего врага", "Отступаю и ищу укрытие", "Осматриваю поле боя"];
  const loc = POIS[S.world.loc]; const s = ["Осматриваюсь внимательно"]; const n = loc.npcs.find(id => NPCS[id]); if (n) s.push(`${NPCS[n].name}, что здесь происходит?`);
  if (loc.inner) s.push("Выхожу на улицу"); const unvisited = outerEntries().map(([id]) => id).find(id => !S.world.visited.includes(id)); if (unvisited) s.push(`Иду: ${POIS[unvisited].name}`);
  return s;
}
function addNewNpcs(eff) {
  const list = Array.isArray(eff.new_npcs) ? eff.new_npcs : []; if (!list.length) return; const loc = POIS[S.world.loc]; S.world.met = S.world.met || [];
  list.slice(0, 2).forEach((n, i) => {
    if (!n || typeof n !== "object" || Object.values(NPCS).filter(x => !x.bld).length >= 48) return; const name = str(n.name, 32); if (!name) return;
    const dup = Object.entries(NPCS).find(([, x]) => x.name.toLowerCase() === name.toLowerCase()); if (dup) { if (!loc.npcs.includes(dup[0])) { S.world.npcLoc = S.world.npcLoc || {}; S.world.npcLoc[dup[0]] = S.world.loc; refreshPeople(); } return; }
    let id = slug(n.id, "n" + S.turn + i); while (NPCS[id]) id += "_" + i; const h = hash(WD.id + id);
    NPCS[id] = { name, role: str(n.role, 40), look: str(n.look, 90), persona: str(n.persona, 200), secret: str(n.secret, 200), greet: "", minor: !n.important, gender: n.gender === "f" ? "f" : "m", age: ["young", "adult", "old"].includes(n.age) ? n.age : "adult",
      feature: FEATURES[h % FEATURES.length], hair: Object.keys(HAIRS)[(h >>> 4) % 6], photo_prompt: "" };
    if (!loc.npcs.includes(id)) loc.npcs.push(id); if (loc.inner) (loc.extra = loc.extra || []).push(id); else { loc.base = loc.base || []; if (!loc.base.includes(id)) loc.base.push(id); } S.world.npcs[id] = { att: 0, mem: [] }; if (!S.world.met.includes(id)) S.world.met.push(id);
    sfx("arrive"); pushFeed({ t: "chips", items: [{ c: "npc", x: `Новое знакомство: ${name}${n.role ? ", " + str(n.role, 30) : ""}` }] });
    wantPortrait(WD, id, n.important ? 0 : 2);
  });
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
    if (r.ok) { if (loc.clue && !S.world.flags["clue_" + S.world.loc]) { out.push(loc.clue); eff.facts.push(str(loc.clue, 150)); S.world.flags["clue_" + S.world.loc] = true; eff.map_notes = [{ place: S.world.loc, note: str(loc.clue, 80) }]; eff.xp = 25; } else out.push("Тебе удаётся задуманное, хотя ничего нового здесь не найти."); }
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

/* ---------- озвучка ---------- */
const HAS_TTS = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
function speak(text) {
  if (!HAS_TTS) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(text).replace(/[«»*]/g, "").slice(0, 1800)); u.lang = "ru-RU"; u.rate = 1;
    const v = speechSynthesis.getVoices().find(x => /^ru/i.test(x.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {}
}
document.addEventListener("click", e => { const b = e.target.closest?.(".narr-voice"); if (!b) return; const t = b.parentElement.querySelector(".tx")?.innerText || ""; if (speechSynthesis.speaking) { speechSynthesis.cancel(); return; } speak(t); });
/* ---------- «Ранее в…» при возвращении ---------- */
async function addRecap() {
  if (!S || (S.turn || 0) < 3 || Date.now() - (S.updated || 0) < 20 * 60 * 1000) return;
  const camp = S; let text = "";
  const sample = await getSample();
  if (sample) { try { const r = await sample(`Напиши по-русски короткое вступление «Ранее в…» для продолжения настольной ролевой кампании: 3–4 предложения, второе лицо («ты»), как в начале серии сериала. Напомни, где герой, что он узнал, кто ему помог или навредил и какой вопрос висит в воздухе. Без новых фактов.
Герой: ${camp.char.name}. Где: ${camp.wd.places[camp.world.loc]?.name}. Задание: ${camp.world.quest}.
Летопись: ${camp.summary || "—"}
Последние факты: ${camp.world.facts.slice(-6).join(" | ") || "—"}
Последние события: ${camp.log.slice(-4).map(l => (l.who === "p" ? "Игрок: " : "Рассказчик: ") + l.text.slice(0, 300)).join("\n")}`, { modelTier: "quick", cache: false }); text = str(String(r.text).split("@@@")[0], 900); } catch (e) {} }
  if (!text) text = [camp.summary, camp.world.facts.slice(-3).join(". ")].filter(Boolean).join(" ") || `Ты всё ещё здесь: ${camp.wd.places[camp.world.loc]?.name}. Задание: ${camp.world.quest}`;
  if (S === camp) { pushFeed({ t: "recap", text }); save(); }
}
/* ---------- журнал ---------- */
let journalTab = "quest";
function openJournal() {
  if (!S) return; const met = (S.world.met || []).filter(id => NPCS[id]);
  const tabs = [["quest", "Задание"], ["people", `Люди · ${met.length}`], ["places", `Места · ${S.world.visited.length}`], ["chron", "Летопись"]];
  const body = () => {
    if (journalTab === "quest") { const th = S.world.threat || 0; const tm = worldTime();
      return `<div class="j-quest"><div class="eyebrow">Текущее задание</div><p class="j-big">${esc(S.world.quest)}</p>
        <div class="j-row"><div><div class="eyebrow">Время</div><b>День ${tm.day} · ${DAY_PARTS[tm.part]}</b></div><div><div class="eyebrow">Часы угрозы</div><span class="threat big ${th >= 5 ? "hot" : ""}">${Array.from({ length: 6 }, (_, i) => `<i class="${i < th ? "on" : ""}"></i>`).join("")}</span></div><div><div class="eyebrow">Найдено улик</div><b>${Object.keys(S.world.flags || {}).filter(k => k.startsWith("clue_")).length}</b></div></div>
        <p class="home-note">Часы угрозы растут, когда противник получает преимущество. На 3 и 6 он делает заметный ход.</p></div>`; }
    if (journalTab === "people") return met.length ? `<div class="j-people">${met.map(id => { const n = NPCS[id]; const st = S.world.npcs[id] || { att: 0, mem: [] }; const [lab, cl] = attLabel(st.att);
      const where = Object.values(POIS).find(p => p.npcs.includes(id)); return `<article class="j-person">${npcPh(id)}<div><b>${esc(n.name)}</b><small>${esc(n.role)}${where ? " · " + esc(where.name) : ""}</small><span class="att ${cl}">${lab}</span>${st.mem.length ? `<ul>${st.mem.slice(-3).map(m => `<li>${esc(m)}</li>`).join("")}</ul>` : `<p class="empty">Пока ничего особенного.</p>`}</div></article>`; }).join("")}</div>` : `<p class="empty">Вы ещё ни с кем не познакомились.</p>`;
    if (journalTab === "places") return `<div class="j-places">${outerEntries().filter(([id]) => S.world.visited.includes(id) || S.world.rumors?.includes(id)).map(([id, p]) => { const st = placeState(id); return `<article class="j-place"><span class="mk-pin sm">${mkIcon(p.kind)}</span><div><b>${esc(p.name)}</b><small>${st.visited ? "посещено" : "по слухам"}${st.danger ? " · опасно" : ""}${st.cleared ? " · зачищено" : ""}${st.clue ? " · найдены улики" : ""}</small><p>${esc(st.note || p.short)}</p></div></article>`; }).join("")}</div>`;
    return `${S.summary ? `<p class="summary-box j-sum">${esc(S.summary)}</p>` : ""}${S.world.facts.length ? `<ol class="chron">${S.world.facts.map(f => `<li>${esc(f)}</li>`).join("")}</ol>` : `<p class="empty">Летопись пока пуста.</p>`}`;
  };
  modal(`<div class="journal"><div class="bigmap-head"><div><div class="eyebrow">Журнал героя</div><h2>${esc(C().name)}</h2></div><button class="btn small" type="button" id="j-close">Закрыть</button></div>
    <div class="tabs j-tabs" role="tablist">${tabs.map(([k, t]) => `<button type="button" role="tab" data-j="${k}" aria-selected="${journalTab === k}">${t}</button>`).join("")}</div><div class="j-body" id="j-body">${body()}</div></div>`, root => {
    root.querySelector(".modal").classList.add("wide");
    root.querySelector("#j-close").onclick = closeModal;
    root.querySelectorAll("[data-j]").forEach(b => b.onclick = () => { journalTab = b.dataset.j; root.querySelectorAll("[data-j]").forEach(x => x.setAttribute("aria-selected", String(x === b))); root.querySelector("#j-body").innerHTML = body(); });
  });
}
/* ---------- выбор модели портретов ---------- */
function modelPickerHTML(id, compact) { const m = imgModel(); return `<div class="opt-group model-pick${compact ? " compact" : ""}" id="${id}"><span>Модель портретов</span><div class="model-list">${Object.entries(IMG_MODELS).map(([k, v]) => `<button type="button" data-m="${k}" aria-pressed="${m === k}"><b>${v.name}</b><small>${v.sub}</small></button>`).join("")}</div></div>`; }
function bindModelPicker(root, id, onChange) { root.querySelectorAll(`#${id} [data-m]`).forEach(b => b.onclick = () => { setImgModel(b.dataset.m); root.querySelectorAll(`#${id} [data-m]`).forEach(x => x.setAttribute("aria-pressed", String(x === b))); onChange?.(); }); }
function redrawWorldPortraits(wd) {
  if (!wd) return; Object.keys(imgCache).forEach(k => { if (k.startsWith(wd.id + ":")) delete imgCache[k]; }); lsSet(IMG_KEY, imgCache);
  Object.values(wd.npcs).forEach(n => { delete n.img; }); portraitJobs.length = 0; jobKeys.clear(); portraitPaused = false; imgNote = "";
  if (S && S.wd === wd) { (S.world.met || []).forEach(id => wantPortrait(wd, id, 2)); (POIS[S.world.loc]?.npcs || []).forEach(id => wantPortrait(wd, id, 1)); save(); } else queueWorldPortraits(wd);
  refreshPortraitViews();
}
/* ---------- настройки ---------- */
function openSettings() {
  if (!S) return; S.settings = S.settings || { len: "normal", voice: false };
  const st = S.settings;
  modal(`<div class="eyebrow">Настройки кампании</div><h2>Рассказчик</h2>
    <div class="opt-group"><span>Длина описаний</span><div class="opts" id="set-len">${[["short", "Коротко"], ["normal", "Обычно"], ["long", "Подробно"]].map(([k, t]) => `<button type="button" data-v="${k}" aria-pressed="${st.len === k}">${t}</button>`).join("")}</div></div>
    ${HAS_TTS ? `<div class="opt-group"><span>Озвучка</span><div class="opts" id="set-voice"><button type="button" data-v="0" aria-pressed="${!st.voice}">Только по кнопке</button><button type="button" data-v="1" aria-pressed="${!!st.voice}">Читать вслух сразу</button></div><small class="home-note">Используется голос вашего браузера.</small></div>` : ""}
    ${soundSettingsHTML()}
    ${modelPickerHTML("set-model")}
    <div class="opt-group"><span>Портреты этого мира</span><div><button class="btn small" type="button" id="set-redraw">Перерисовать выбранной моделью</button></div><small class="home-note">Пригодится, когда у FLUX Krea восстановится квота. Перерисуются встреченные люди и типажи.</small></div>
    <div class="opt-group"><span>Отмена хода</span><small class="home-note">${S.mode === "chronicle" ? "В режиме «Хроника» ходы не отменяются." : "Последний ход можно отменить кнопкой «↶ Отменить ход» под строкой ввода."}</small></div>
    <div class="row"><button class="btn primary" type="button" id="set-ok">Готово</button></div>`, root => {
    root.querySelectorAll("#set-len button").forEach(b => b.onclick = () => { st.len = b.dataset.v; root.querySelectorAll("#set-len button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); save(); });
    root.querySelectorAll("#set-voice button").forEach(b => b.onclick = () => { st.voice = b.dataset.v === "1"; root.querySelectorAll("#set-voice button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); if (!st.voice) try { speechSynthesis.cancel(); } catch (e) {} save(); });
    bindModelPicker(root, "set-model"); bindSoundSettings(root);
    root.querySelector("#set-redraw").onclick = e => { redrawWorldPortraits(S.wd); e.target.textContent = "Портреты поставлены в очередь"; e.target.disabled = true; };
    root.querySelector("#set-ok").onclick = closeModal;
  });
}
/* ---------- портрет НПС ---------- */
let popT = null;
function popNPC(id) { const p = document.getElementById("npc-pop"); const n = NPCS[id]; if (!n) return; p.innerHTML = `${npcPh(id)}<div class="cap"><b>${esc(n.name)}</b><small>${esc(n.role)} · ${attLabel(S.world.npcs[id]?.att || 0)[0]}</small></div>`; p.classList.add("show"); clearTimeout(popT); popT = setTimeout(() => p.classList.remove("show"), 4200); }
function shortRest() { advanceTime(1); const c = C(); const r = rollDice({ n: 1, d: CLASSES[c.cls].hd, mod: mod(c.scores.con) }); c.hitDice--; const got = healHero(Math.max(1, r.total)); if (c.cls === "fighter") c.secondWind = true; pushFeed({ t: "sys", html: "Короткий отдых: час тишины, перевязка, глоток воды." }); pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP (${r.text})` }] }); after(); }
function longRest() { const c = C(); const t = worldTime(); t.day++; t.part = 0; c.hp = c.maxHp; c.hitDice = c.level; c.secondWind = c.cls === "fighter"; Object.values(c.slots).forEach(s => s[1] = s[0]); pushFeed({ t: "sys", html: "<b>Долгий отдых.</b> Ночь проходит. Хиты, ячейки и силы восстановлены." }); pushFeed({ t: "chips", items: [{ c: "heal", x: "HP полностью" }] }); after(); }
function nextXP(c) { return c.level >= MAX_LEVEL ? null : XP_LEVELS[c.level]; }
function levelUp() {
  sfx("start");
  const c = C(); if (c.level >= MAX_LEVEL || c.xp < XP_LEVELS[c.level]) return; const nl = c.level + 1;
  const hd = CLASSES[c.cls].hd; const avg = Math.floor(hd / 2) + 1; const cm = mod(c.scores.con) + (RACES[c.race].hpBonus || 0);
  const feat = LEVEL_FEATS[c.cls][nl]; const newSpell = LEVEL_SPELLS[c.cls]?.[nl];
  modal(`<div class="eyebrow">Новый уровень</div><h2>${esc(c.name)} · уровень ${nl}</h2><p>Хиты: бросьте кость d${hd} или возьмите среднее (${avg}), плюс ${fmt(cm)}.</p>
    <ul class="lv-list"><li>${esc(feat)}</li>${nl === 5 ? "<li>Бонус мастерства растёт до +3</li>" : ""}${CLASSES[c.cls].spells ? `<li>Ячейки: ${Object.entries(SLOT_TABLE[nl]).map(([l, n]) => `${l} круг ×${n}`).join(", ")}</li>` : ""}${newSpell ? `<li>Новое заклинание: ${SPELLS[newSpell].name}</li>` : ""}</ul>
    <div class="row"><button class="btn" type="button" id="lv-avg">Среднее: ${avg}</button><button class="btn primary" type="button" id="lv-roll">Бросить d${hd}</button></div>`, root => {
    const apply = v => {
      const add = Math.max(1, v + cm); c.level = nl; c.maxHp += add; c.hp += add; c.hitDice++;
      if (CLASSES[c.cls].spells) { const ns = slotsFor(c.cls, nl); Object.entries(ns).forEach(([l, n]) => { const old = c.slots[l] || [0, 0]; c.slots[l] = [n, old[1] + (n - old[0])]; }); }
      if (newSpell && !c.spells.includes(newSpell)) c.spells.push(newSpell);
      closeModal(); pushFeed({ t: "sys", html: `<b>Уровень ${nl}!</b> Максимум хитов +${add}. ${esc(feat)}.` });
      if (nl === 4) chooseASI(); else after();
    };
    root.querySelector("#lv-avg").onclick = () => apply(avg); root.querySelector("#lv-roll").onclick = () => apply(rnd(hd));
  });
}
function chooseASI() {
  const c = C();
  modal(`<div class="eyebrow">Увеличение характеристик</div><h2>+2 к одной характеристике</h2><p>Максимум 20. Модификатор растёт на каждые два очка.</p><div class="asi-grid">${ABIL.map(a => `<button class="btn" type="button" data-a="${a}" ${c.scores[a] >= 20 ? "disabled" : ""}>${ABIL_FULL[a]} ${c.scores[a]} → ${Math.min(20, c.scores[a] + 2)}</button>`).join("")}</div>`, root => {
    root.querySelectorAll("[data-a]").forEach(b => b.onclick = () => { const a = b.dataset.a; const oldCon = mod(c.scores.con); c.scores[a] = Math.min(20, c.scores[a] + 2);
      if (a === "con") { const d = (mod(c.scores.con) - oldCon) * c.level; c.maxHp += d; c.hp += d; } recalcAC(c);
      closeModal(); pushFeed({ t: "sys", html: `${ABIL_FULL[a]} теперь ${c.scores[a]}.` }); after(); });
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
  sfx("die"); setTimeout(() => syncAudio(), 50);
  S.dying = null;
  if (S.mode === "sandbox" && S.secondChance) { S.secondChance = false; C().hp = Math.ceil(C().maxHp / 2); S.world.combat = false; const safe = Object.keys(POIS).find(id => POIS[id].rest) || WD.start; moveTo(safe); pushFeed({ t: "sys", html: "<b>Второй шанс.</b> Вас нашли и выходили. Больше такое не повторится." }); after(); return; }
  S.dead = true; save();
  modal(`<h2>Конец пути</h2><p>${esc(C().name)} погибает в мире «${esc(WD.name)}». В режиме «${MODES[S.mode].name}» смерть окончательна.</p><p>Летопись: ${S.world.facts.length} фактов, ${C().xp} опыта.</p><div class="row"><button class="btn primary" type="button" id="dead-home">К кампаниям</button></div>`,
    root => { root.querySelector("#dead-home").onclick = () => { closeModal(); S = null; renderHome(); }; });
}
function modal(html, bind) { sfx("open"); const r = document.getElementById("modal-root"); r.innerHTML = `<div class="modal-back"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`; bind(r); r.querySelector("button")?.focus(); }
function closeModal() { document.getElementById("modal-root").innerHTML = ""; }

/* =========================================================================
   BOOT
   ========================================================================= */
function showTab(t) { document.querySelectorAll("#mtabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.t === t))); ["sheet", "story", "world"].forEach(id => document.getElementById(id).classList.toggle("active", id === t)); if (t === "world") requestAnimationFrame(drawMap); }
document.getElementById("mtabs").addEventListener("click", e => { const b = e.target.closest("button"); if (b) showTab(b.dataset.t); });
document.getElementById("btn-back").onclick = () => { if (D.step > 0) { D.step--; renderCreate(); document.getElementById("create-scroll").scrollTop = 0; } else renderHome(); };
document.getElementById("btn-next").onclick = () => { if (!stepValid(D.step)) return; if (D.step < 6) { D.step++; renderCreate(); document.getElementById("create-scroll").scrollTop = 0; } else finishCreation(); };
document.getElementById("btn-home").onclick = () => { if (busy) return; try { speechSynthesis?.cancel(); } catch (e) {} lastSnap = null; if (S) save(); S = null; renderHome(); };
document.getElementById("btn-stop").onclick = () => ctl?.abort();
document.getElementById("btn-journal").onclick = openJournal;
document.getElementById("btn-settings").onclick = openSettings;
document.getElementById("btn-sound").onclick = () => { AU.cfg.on = !AU.cfg.on; auUnlock(); auApply(); };
const inp = document.getElementById("act-input");
inp.addEventListener("input", () => { inp.style.height = "auto"; inp.style.height = Math.min(160, inp.scrollHeight) + "px"; });
inp.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); document.getElementById("act-form").requestSubmit(); } });
document.getElementById("act-form").addEventListener("submit", e => { e.preventDefault(); const t = inp.value.trim(); if (!t || busy || !S) return; inp.value = ""; inp.style.height = "auto"; takeTurn(t.slice(0, 500)); });
window.addEventListener("resize", () => { if (S) drawMap(); });
document.querySelectorAll(".nav-links [data-go]").forEach(b => b.onclick = () => { const g = b.dataset.go; if (g === "new") newCampaign(); else { renderHome(); if (g === "how") requestAnimationFrame(() => document.getElementById(g === "how" ? "how" : "camps-band")?.scrollIntoView({ behavior: "smooth" })); } });
document.getElementById("logo").onclick = () => { if (busy) return; if (S) save(); S = null; renderHome(); };
window.addEventListener("resize", () => { if (!document.getElementById("screen-create").hidden && D) document.querySelector(".c-grid").style.gridTemplateColumns = D.step === 0 && innerWidth > 980 ? (innerWidth > 1240 ? "220px minmax(0, 1fr)" : "200px minmax(0, 1fr)") : ""; });
(function boot() { migrateV1(); D = newDraft(); renderHome(); initSample(); renderSoundBtn(); })();
