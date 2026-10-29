/* =========================================================================
   ГЕРОЙ: расы, классы, оружие с вариациями, черты характера, отношение людей
   ========================================================================= */
Object.assign(RACES, {
  halfelf: { name: "Полуэльф", sub: "Свой среди чужих, чужой среди своих", bonus: { cha: 2, dex: 1, con: 1 }, speed: 30, traits: ["Тёмное зрение", "Владеет Убеждением и Проницательностью", "Устойчив к очарованию"], skills: ["persuasion", "insight"] },
  gnome: { name: "Гном", sub: "Лесной гном, любопытный выдумщик", bonus: { int: 2, dex: 1 }, speed: 25, gnomish: true, traits: ["Тёмное зрение", "Гномья хитрость: преимущество на спасброски ИНТ, МДР, ХАР", "Мелкий: тяжёлое оружие с помехой"], skills: [] },
  halforc: { name: "Полуорк", sub: "Сила, шрамы и косые взгляды", bonus: { str: 2, con: 1 }, speed: 30, relentless: true, traits: ["Тёмное зрение", "Неукротимость: раз за долгий отдых остаться на 1 HP вместо 0", "Владеет Запугиванием"], skills: ["intimidation"] },
  tiefling: { name: "Тифлинг", sub: "Рога, хвост и наследие преисподней", bonus: { cha: 2, int: 1 }, speed: 30, fireRes: true, traits: ["Тёмное зрение", "Адское сопротивление: урон огнём вдвое меньше", "Многие боятся и не доверяют"], skills: [] },
  dragonborn: { name: "Драконорождённый", sub: "Чешуя, гордость и пламя в груди", bonus: { str: 2, cha: 1 }, speed: 30, breath: true, fireRes: true, traits: ["Оружие дыхания: 2d6 огнём по всем врагам, раз за короткий отдых", "Сопротивление огню"], skills: [] }
});
RACES.halfling.small = true; RACES.gnome.small = true;
RACES.halfling.traits = ["Везение: переброс натуральной 1", "Храбрость", "Мелкий: тяжёлое оружие с помехой"];
const RACE_ATT = { human: 0, elf: 2, halfelf: 0, dwarf: 1, halfling: 3, gnome: 2, halforc: -8, tiefling: -10, dragonborn: -4 };
const RACE_SOCIAL = { human: "Свой для всех", elf: "Уважают, хоть и считают надменными", halfelf: "Принимают без вопросов", dwarf: "Уважают за ремесло", halfling: "Любят: улыбчивый и безобидный", gnome: "Принимают за чудака", halforc: "Опасаются: шепчут за спиной", tiefling: "Боятся и не доверяют", dragonborn: "Глазеют с опаской" };
const RACE_COL = { human: "#e9c99a", elf: "#9fd8b4", halfelf: "#b7c8e8", dwarf: "#d49a6a", halfling: "#e3c06a", gnome: "#c59af0", halforc: "#8fb36a", tiefling: "#e8735a", dragonborn: "#d0814f" };
Object.assign(CLASSES, {
  barbarian: { name: "Варвар", role: "Ярость и стойкость", color: "#c4553d", hd: 12, saves: ["str", "con"], prio: ["str", "con", "dex", "wis", "cha", "int"], armor: { name: "Без доспеха: 10 + ЛОВ + ТЕЛ", base: 10, dex: 99 },
    weapons: ["greataxe"], skillCount: 2, skillList: ["animal", "athletics", "intimidation", "nature", "perception", "survival"], items: [], blurb: "Гнев как оружие. Держит удар, о который ломаются другие.",
    features: ["Ярость: +2 к урону в ближнем бою и вдвое меньше урона, 2 раза за долгий отдых", "Защита без доспехов: КД 10 + ЛОВ + ТЕЛ"] },
  paladin: { name: "Паладин", role: "Клятва и сталь", color: "#e6d08a", hd: 10, saves: ["wis", "cha"], prio: ["str", "cha", "con", "wis", "dex", "int"], armor: { name: "Кольчуга и щит", base: 18, dex: 0 },
    weapons: ["longsword"], skillCount: 2, skillList: ["athletics", "insight", "intimidation", "medicine", "persuasion", "religion"], items: [], cast: "cha", half: true, blurb: "Рыцарь клятвы: лечит касанием, карает светом.",
    features: ["Наложение рук: запас исцеления 5 × уровень", "Божественное чувство: чует нежить и нечисть рядом"] },
  ranger: { name: "Следопыт", role: "Охота и выслеживание", color: "#8fb36a", hd: 10, saves: ["str", "dex"], prio: ["dex", "wis", "con", "str", "int", "cha"], armor: { name: "Кожаный доспех", base: 11, dex: 99 },
    weapons: ["longbow"], skillCount: 3, skillList: ["animal", "athletics", "insight", "investigation", "nature", "perception", "stealth", "survival"], items: [], cast: "wis", half: true, blurb: "Читает следы, бьёт издалека, знает каждую тропу.",
    features: ["Избранный враг: +2 к урону по нему", "Исследователь природы: не плутает в дебрях"] },
  bard: { name: "Бард", role: "Слово, песня и обман", color: "#d47fb0", hd: 8, saves: ["dex", "cha"], prio: ["cha", "dex", "con", "wis", "int", "str"], armor: { name: "Кожаный доспех", base: 11, dex: 99 },
    weapons: ["rapier"], skillCount: 3, skillList: Object.keys(SKILLS), items: [], cast: "cha", spells: ["vicious_mockery", "healing_word", "dissonant_whispers"], blurb: "Очарует трактир, выведает тайну, высмеет врага до крови.",
    features: ["Вдохновение барда: +1d6 к следующему броску, ХАР раз за долгий отдых", "Колдовство (ХАР)"] },
  warlock: { name: "Колдун", role: "Сила в долг", color: "#9a72d0", hd: 8, saves: ["wis", "cha"], prio: ["cha", "con", "dex", "wis", "int", "str"], armor: { name: "Кожаный доспех", base: 11, dex: 99 },
    weapons: ["dagger"], skillCount: 2, skillList: ["arcana", "deception", "history", "intimidation", "investigation", "nature", "religion"], items: [], cast: "cha", pact: true, spells: ["eldritch_blast", "hex", "arms_of_hadar"], blurb: "Получил силу в долг. Платить придётся потом.",
    features: ["Мистический заряд: 1d10 силовым полем", "Магия договора: ячейки возвращаются после короткого отдыха"] },
  druid: { name: "Друид", role: "Сила природы", color: "#5fae8a", hd: 8, saves: ["int", "wis"], prio: ["wis", "con", "dex", "int", "cha", "str"], armor: { name: "Кожаный доспех и деревянный щит", base: 13, dex: 99 },
    weapons: ["staff"], skillCount: 2, skillList: ["arcana", "animal", "insight", "medicine", "nature", "perception", "religion", "survival"], items: [], cast: "wis", spells: ["produce_flame", "cure_wounds", "thunderwave"], blurb: "Говорит с ветром и зверем, зовёт гром и пламя.",
    features: ["Колдовство (МДР)", "Друидический язык: знаки природы"] }
});
const CLASS_META = { fighter: { diff: 1, prim: ["str", "con"] }, rogue: { diff: 2, prim: ["dex"] }, wizard: { diff: 3, prim: ["int"] }, cleric: { diff: 2, prim: ["wis"] }, barbarian: { diff: 1, prim: ["str", "con"] },
  paladin: { diff: 2, prim: ["str", "cha"] }, ranger: { diff: 2, prim: ["dex", "wis"] }, bard: { diff: 3, prim: ["cha"] }, warlock: { diff: 2, prim: ["cha"] }, druid: { diff: 3, prim: ["wis"] } };
const CLASS_GEAR = { fighter: ["Набор путешественника"], rogue: ["Воровские инструменты"], wizard: ["Книга заклинаний", "Мешочек с компонентами"], cleric: ["Священный символ"], barbarian: ["Набор путешественника"],
  paladin: ["Священный символ"], ranger: ["Колчан со стрелами"], bard: ["Лютня"], warlock: ["Книга теней"], druid: ["Омела", "Травяной сбор"] };
Object.assign(SPELLS, {
  vicious_mockery: { name: "Злая насмешка", lvl: 0, kind: "save", abil: "wis", dice: "1d4", type: "психической энергией", desc: "Спасбросок МДР, 1d4 психической" },
  healing_word: { name: "Лечащее слово", lvl: 1, kind: "heal", dice: "1d4", desc: "Восстанавливает 1d4 + ХАР" },
  dissonant_whispers: { name: "Диссонирующий шёпот", lvl: 1, kind: "save", abil: "wis", dice: "3d6", type: "психической энергией", desc: "Спасбросок МДР, 3d6 психической" },
  eldritch_blast: { name: "Мистический заряд", lvl: 0, kind: "attack", dice: "1d10", type: "силовым полем", desc: "Атака заклинанием, 1d10 силового поля" },
  hex: { name: "Сглаз", lvl: 1, kind: "mark", dice: "1d6", type: "некротической энергией", desc: "Ваши попадания по цели: +1d6 некротической" },
  arms_of_hadar: { name: "Руки Хадара", lvl: 1, kind: "save", abil: "str", dice: "2d6", type: "некротической энергией", desc: "Спасбросок СИЛ, 2d6 некротической" },
  produce_flame: { name: "Сотворение пламени", lvl: 0, kind: "attack", dice: "1d8", type: "огнём", desc: "Атака заклинанием, 1d8 огня" },
  thunderwave: { name: "Волна грома", lvl: 1, kind: "save", abil: "con", dice: "2d8", type: "звуком", desc: "Спасбросок ТЕЛ, 2d8 звуком" },
  moonbeam: { name: "Лунный луч", lvl: 2, kind: "save", abil: "con", dice: "2d10", type: "излучением", desc: "Спасбросок ТЕЛ, 2d10 излучения" },
  call_lightning: { name: "Призыв молнии", lvl: 3, kind: "save", abil: "dex", dice: "3d10", type: "электричеством", desc: "Спасбросок ЛОВ, 3d10 электричества" },
  hunters_mark: { name: "Метка охотника", lvl: 1, kind: "mark", dice: "1d6", type: "", desc: "Ваши попадания по цели: +1d6 урона" },
  bless: { name: "Благословение", lvl: 1, kind: "buff", desc: "Преимущество на следующую проверку или атаку" },
  divine_smite: { name: "Божественная кара", lvl: 1, kind: "smite", dice: "2d8", type: "излучением", desc: "Следующее попадание: +2d8 излучения, по нежити ещё +1d8" }
});
Object.assign(LEVEL_SPELLS, { paladin: { 2: ["divine_smite", "cure_wounds", "bless"] }, ranger: { 2: ["hunters_mark", "cure_wounds"] }, bard: { 3: "shatter" }, warlock: { 3: "shatter" }, druid: { 3: "moonbeam", 5: "call_lightning" } });
Object.assign(LEVEL_FEATS, {
  barbarian: { 2: "Безрассудная атака и чувство опасности", 3: "Путь берсерка: третья ярость за отдых", 4: "Увеличение характеристик", 5: "Дополнительная атака" },
  paladin: { 2: "Божественная кара, Благословение и Лечение ран", 3: "Священная клятва: аура против болезней", 4: "Увеличение характеристик", 5: "Дополнительная атака" },
  ranger: { 2: "Метка охотника и Лечение ран", 3: "Охотник: +1d8 по раненой цели раз за ход", 4: "Увеличение характеристик", 5: "Дополнительная атака" },
  bard: { 2: "Мастер на все руки", 3: "Коллегия знаний; заклинание Дребезги", 4: "Увеличение характеристик", 5: "Вдохновение d8, восстанавливается после короткого отдыха" },
  warlock: { 2: "Мучительный заряд: +ХАР к урону заряда", 3: "Дар договора; заклинание Дребезги", 4: "Увеличение характеристик", 5: "Ячейки 3 круга" },
  druid: { 2: "Дикий облик (в рассказе)", 3: "Заклинание: Лунный луч", 4: "Увеличение характеристик", 5: "Заклинание: Призыв молнии" }
});
const HALF_SLOTS = { 1: {}, 2: { 1: 2 }, 3: { 1: 3 }, 4: { 1: 3 }, 5: { 1: 4, 2: 2 } };
const PACT_SLOTS = { 1: { 1: 1 }, 2: { 1: 2 }, 3: { 2: 2 }, 4: { 2: 2 }, 5: { 3: 2 } };
const EXTRA_ATK = new Set(["fighter", "barbarian", "paladin", "ranger"]);
Object.assign(BACKGROUNDS, {
  folk: { name: "Народный герой", skills: ["animal", "survival"], hook: "однажды заступились за простых людей и с тех пор не можете пройти мимо беды", gold: 10, item: "Лопата" },
  noble: { name: "Знать", skills: ["history", "persuasion"], hook: "родом из обедневшей семьи с громким именем и долгами", gold: 25, item: "Перстень с печатью" },
  hermit: { name: "Отшельник", skills: ["medicine", "religion"], hook: "годы жили в уединении и вернулись к людям с откровением", gold: 5, item: "Набор лекаря" },
  sailor: { name: "Моряк", skills: ["athletics", "perception"], hook: "ходили под парусом и знаете, о чём молчат портовые", gold: 10, item: "Верёвка, 15 м" },
  outlander: { name: "Чужеземец", skills: ["athletics", "survival"], hook: "пришли издалека, и здешние обычаи вам непривычны", gold: 10, item: "Охотничий капкан" },
  entertainer: { name: "Артист", skills: ["acrobatics", "performance"], hook: "выступали на ярмарках и знаете, как увлечь толпу", gold: 15, item: "Костюм артиста" },
  artisan: { name: "Ремесленник", skills: ["insight", "persuasion"], hook: "состоите в гильдии мастеров и знаете цену хорошей работе", gold: 15, item: "Инструменты ремесленника" }
});
Object.assign(BACKGROUNDS.soldier, { gold: 10, item: "Знак различия" }); Object.assign(BACKGROUNDS.sage, { gold: 10, item: "Бутылочка чернил и перо" });
Object.assign(BACKGROUNDS.criminal, { gold: 15, item: "Воровские инструменты" }); Object.assign(BACKGROUNDS.acolyte, { gold: 15, item: "Молитвенник" });
const BG_ATT = { soldier: { guard: 6 }, sage: { priest: 2, elder: 3 }, criminal: { criminal: 6, guard: -5 }, acolyte: { priest: 8 }, folk: { common: 6, elder: -2 }, noble: { elder: 6, merchant: 3, common: -3 },
  hermit: { priest: 3, common: -2 }, sailor: { fisher: 8 }, outlander: { common: -3 }, entertainer: { merchant: 3, common: 3 }, artisan: { merchant: 6 } };
const BG_ATT_TXT = { soldier: "стража уважает", sage: "старшины и жрецы прислушиваются", criminal: "своих узнают, стража косится", acolyte: "жрецы доверяют", folk: "простой люд любит", noble: "знать и купцы приветливы, простые — холодны",
  hermit: "жрецы уважают, люди сторонятся", sailor: "рыбаки и моряки за своего", outlander: "чужака встречают настороженно", entertainer: "в тавернах и на рынке рады", artisan: "купцы и мастера ценят" };
/* ---------- черты характера ---------- */
const TRAITS = [
  { k: "sl1", l: "Честный", r: "Хитрый", lo: { skills: { persuasion: 1 }, txt: "Убеждение +1" }, hi: { skills: { deception: 1 }, txt: "Обман +1" } },
  { k: "sl2", l: "Осторожный", r: "Безрассудный", lo: { skills: { perception: 1 }, txt: "Внимательность +1" }, hi: { init: 2, skills: { stealth: -1 }, txt: "Инициатива +2, Скрытность −1" } },
  { k: "sl3", l: "Добрый", r: "Жестокий", lo: { att: { common: 4 }, skills: { intimidation: -1 }, txt: "простые люди теплее, Запугивание −1" }, hi: { att: { common: -5, criminal: 3 }, skills: { intimidation: 2 }, txt: "Запугивание +2, простые люди холоднее" } },
  { k: "sl4", l: "Набожный", r: "Скептик", lo: { att: { priest: 8 }, skills: { religion: 1 }, txt: "Религия +1, жрецы доверяют" }, hi: { att: { priest: -4 }, skills: { investigation: 1 }, txt: "Анализ +1, жрецы косятся" } },
  { k: "sl5", l: "Общительный", r: "Замкнутый", lo: { att: { merchant: 2, common: 2 }, skills: { performance: 1 }, txt: "Выступление +1, люди охотнее говорят" }, hi: { att: { common: -2 }, skills: { stealth: 1, insight: 1 }, txt: "Скрытность и Проницательность +1, сторонятся" } },
  { k: "sl6", l: "Щедрый", r: "Скупой", lo: { rep: 5, haggle: -2, txt: "репутация +5, торговаться труднее (−2)" }, hi: { rep: -3, haggle: 2, txt: "торг +2, репутация −3" } },
  { k: "sl7", l: "Законопослушный", r: "Бунтарь", lo: { att: { guard: 8, elder: 5, criminal: -5 }, txt: "стража и старшины уважают" }, hi: { att: { criminal: 6, guard: -6 }, skills: { sleight: 1 }, txt: "Ловкость рук +1, стража следит" } }
];
function traitFx(src) {
  const fx = { skills: {}, att: {}, init: 0, rep: 0, haggle: 0, notes: [] };
  TRAITS.forEach(t => { const v = src?.[t.k] ?? 50; const e = v <= 30 ? t.lo : v >= 70 ? t.hi : null; if (!e) return; fx.notes.push({ name: v <= 30 ? t.l : t.r, txt: e.txt });
    Object.entries(e.skills || {}).forEach(([k, d]) => fx.skills[k] = (fx.skills[k] || 0) + d); Object.entries(e.att || {}).forEach(([k, d]) => fx.att[k] = (fx.att[k] || 0) + d);
    fx.init += e.init || 0; fx.rep += e.rep || 0; fx.haggle += e.haggle || 0; });
  return fx;
}
function traitWords(src) { const w = TRAITS.map(t => { const v = src?.[t.k] ?? 50; return v <= 30 ? t.l.toLowerCase() : v >= 70 ? t.r.toLowerCase() : null; }).filter(Boolean); return w.length ? w.join(", ") : "уравновешенный, себе на уме"; }
function npcGroup(n) { const r = (n?.role || "").toLowerCase();
  if (/страж|сержант|капитан|десятник|дозор/.test(r)) return "guard"; if (/старост|старейш|бургомистр|судья|лорд|граф|барон|голова/.test(r)) return "elder";
  if (/жри|свящ|монах|сестра|настоятел|послуш|проповед/.test(r)) return "priest"; if (/контрабанд|вор|бандит|наёмник|пират|разбойн|скупщик|главар|культист/.test(r)) return "criminal";
  if (/рыбак|рыбач|лодочник|моряк|матрос/.test(r)) return "fisher"; if (/купец|торгов|лавоч|кузнец|пекар|мясник|аптекар|старьёвщ|свечник|хозя|трактир|корчмар|мастер/.test(r)) return "merchant"; return "common"; }
function baseAttitude(id, c) {
  c = c || (S && S.char); const n = NPCS[id]; if (!c || !n) return 0; const g = npcGroup(n); const fx = traitFx(c.traits || { sl1: c.sl1, sl2: c.sl2 });
  const bg = BG_ATT[c.bg] || {}; let v = (RACE_ATT[c.race] || 0) * (g === "criminal" ? .5 : 1) + (bg[g] || 0) + (fx.att[g] || 0) + (g === "fisher" ? (bg.common || 0) + (fx.att.common || 0) : 0);
  return clamp(Math.round(v), -25, 25);
}
function ensureNpcState(id) { if (!S || !NPCS[id]) return null; return S.world.npcs[id] || (S.world.npcs[id] = { att: baseAttitude(id), mem: [] }); }
/* ---------- ресурсы классов ---------- */
function resMax(c) { const ch = mod(c.scores.cha); return { rage: c.cls === "barbarian" ? (c.level >= 3 ? 3 : 2) : 0, lay: c.cls === "paladin" ? 5 * c.level : 0, insp: c.cls === "bard" ? Math.max(1, ch) : 0, breath: RACES[c.race]?.breath ? 1 : 0, relentless: RACES[c.race]?.relentless ? 1 : 0 }; }
function resOf(c) { if (!c.res) c.res = resMax(c); return c.res; }
function restoreRes(c, kind) { const m = resMax(c); const r = resOf(c); if (kind === "long") Object.assign(r, m); r.breath = m.breath; if (kind === "short" && c.cls === "bard" && c.level >= 5) r.insp = m.insp;
  if (c.cls === "warlock") Object.values(c.slots).forEach(s => s[1] = s[0]); c.rage = false; }
function useInsp(c) { if (!c.insp) return null; const d = rollDice(c.insp); c.insp = null; return d; }
/* ---------- оружие: типы, вариации, качество, материалы ---------- */
const WT = {
  club: { n: "Дубинка", g: "f", dice: "1d4", dt: "дробящий", props: ["light"], cat: "simple", p: 1, ico: "club" },
  dagger: { n: "Кинжал", g: "m", dice: "1d4", dt: "колющий", props: ["finesse", "light", "thrown"], cat: "simple", p: 20, ico: "dagger" },
  greatclub: { n: "Палица", g: "f", dice: "1d8", dt: "дробящий", props: ["two"], cat: "simple", p: 2, ico: "greatclub" },
  handaxe: { n: "Ручной топор", g: "m", dice: "1d6", dt: "рубящий", props: ["light", "thrown"], cat: "simple", p: 50, ico: "handaxe" },
  javelin: { n: "Метательное копьё", g: "n", dice: "1d6", dt: "колющий", props: ["thrown"], cat: "simple", p: 5, ico: "javelin" },
  lhammer: { n: "Лёгкий молот", g: "m", dice: "1d4", dt: "дробящий", props: ["light", "thrown"], cat: "simple", p: 20, ico: "lhammer" },
  mace: { n: "Булава", g: "f", dice: "1d6", dt: "дробящий", props: [], cat: "simple", p: 50, ico: "mace" },
  staff: { n: "Боевой посох", g: "m", dice: "1d6", dt: "дробящий", props: ["versatile"], cat: "simple", p: 2, ico: "staff" },
  sickle: { n: "Серп", g: "m", dice: "1d4", dt: "рубящий", props: ["light"], cat: "simple", p: 10, ico: "sickle" },
  spear: { n: "Копьё", g: "n", dice: "1d6", dt: "колющий", props: ["thrown", "versatile"], cat: "simple", p: 10, ico: "spear" },
  lcrossbow: { n: "Лёгкий арбалет", g: "m", dice: "1d8", dt: "колющий", props: ["ranged", "two"], cat: "simple", p: 250, ico: "lcrossbow" },
  sling: { n: "Праща", g: "f", dice: "1d4", dt: "дробящий", props: ["ranged"], cat: "simple", p: 1, ico: "sling" },
  shortbow: { n: "Короткий лук", g: "m", dice: "1d6", dt: "колющий", props: ["ranged", "two"], cat: "simple", p: 250, ico: "shortbow" },
  battleaxe: { n: "Боевой топор", g: "m", dice: "1d8", dt: "рубящий", props: ["versatile"], cat: "martial", p: 100, ico: "battleaxe" },
  flail: { n: "Цеп", g: "m", dice: "1d8", dt: "дробящий", props: [], cat: "martial", p: 100, ico: "flail" },
  glaive: { n: "Глефа", g: "f", dice: "1d10", dt: "рубящий", props: ["heavy", "reach", "two"], cat: "martial", p: 200, ico: "glaive" },
  greataxe: { n: "Секира", g: "f", dice: "1d12", dt: "рубящий", props: ["heavy", "two"], cat: "martial", p: 300, ico: "greataxe" },
  greatsword: { n: "Двуручный меч", g: "m", dice: "2d6", dt: "рубящий", props: ["heavy", "two"], cat: "martial", p: 500, ico: "greatsword" },
  halberd: { n: "Алебарда", g: "f", dice: "1d10", dt: "рубящий", props: ["heavy", "reach", "two"], cat: "martial", p: 200, ico: "halberd" },
  longsword: { n: "Длинный меч", g: "m", dice: "1d8", dt: "рубящий", props: ["versatile"], cat: "martial", p: 150, ico: "longsword" },
  maul: { n: "Кувалда", g: "f", dice: "2d6", dt: "дробящий", props: ["heavy", "two"], cat: "martial", p: 100, ico: "maul" },
  morningstar: { n: "Моргенштерн", g: "m", dice: "1d8", dt: "колющий", props: [], cat: "martial", p: 150, ico: "morningstar" },
  rapier: { n: "Рапира", g: "f", dice: "1d8", dt: "колющий", props: ["finesse"], cat: "martial", p: 250, ico: "rapier" },
  scimitar: { n: "Скимитар", g: "m", dice: "1d6", dt: "рубящий", props: ["finesse", "light"], cat: "martial", p: 250, ico: "scimitar" },
  shortsword: { n: "Короткий меч", g: "m", dice: "1d6", dt: "колющий", props: ["finesse", "light"], cat: "martial", p: 100, ico: "shortsword" },
  trident: { n: "Трезубец", g: "m", dice: "1d6", dt: "колющий", props: ["thrown", "versatile"], cat: "martial", p: 50, ico: "trident" },
  warpick: { n: "Боевая кирка", g: "f", dice: "1d8", dt: "колющий", props: [], cat: "martial", p: 50, ico: "warpick" },
  warhammer: { n: "Боевой молот", g: "m", dice: "1d8", dt: "дробящий", props: ["versatile"], cat: "martial", p: 150, ico: "warhammer" },
  whip: { n: "Кнут", g: "m", dice: "1d4", dt: "рубящий", props: ["finesse", "reach"], cat: "martial", p: 20, ico: "whip" },
  scythe: { n: "Боевая коса", g: "f", dice: "1d10", dt: "рубящий", props: ["heavy", "two", "reach"], cat: "martial", p: 150, ico: "scythe" },
  longbow: { n: "Длинный лук", g: "m", dice: "1d8", dt: "колющий", props: ["ranged", "two", "heavy"], cat: "martial", p: 500, ico: "longbow" },
  hcrossbow: { n: "Тяжёлый арбалет", g: "m", dice: "1d10", dt: "колющий", props: ["ranged", "two", "heavy"], cat: "martial", p: 500, ico: "lcrossbow" }
};
const WV = {
  scythe: [{ n: "Боевая коса", d: "Полотно выправлено и насажено торчком, как у ополченцев" }, { n: "Крестьянская коса", d: "Обычная коса для покоса: тяжёлая и неуклюжая", dice: "1d8", cat: "simple", props: ["two"], pm: .2 },
    { n: "Коса жнеца", d: "Чёрное изогнутое полотно, от которого веет холодом", crit: 19, pm: 2.6, ico: "reaper" }, { n: "Серповидная коса", d: "Короткое древко и широкий изгиб — бьёт быстро", dice: "1d8", props: ["finesse", "two"], pm: 1.3 }],
  longsword: [{ n: "Длинный меч", d: "Прямой обоюдоострый клинок" }, { n: "Полуторный меч", d: "Длинная рукоять: держать одной или двумя руками" }, { n: "Рыцарский меч", d: "Крестовина и герб на навершии", pm: 1.4 },
    { n: "Катана", g: "f", d: "Изогнутый клинок с восточной заточкой", props: ["finesse", "versatile"], ico: "katana", pm: 2 }, { n: "Фальшион", d: "Клинок расширяется к острию, рубит тяжело", dmg: 1, hit: -1, ico: "cleaver" }],
  greatsword: [{ n: "Двуручный меч", d: "Клинок в рост человека" }, { n: "Фламберг", d: "Волнистый клинок рвёт раны", crit: 19, hit: -1, pm: 2 }, { n: "Клеймор", d: "Северный меч с наклонёнными гардами", pm: 1.2 }],
  dagger: [{ n: "Кинжал", d: "Обоюдоострый клинок в ладонь" }, { n: "Охотничий нож", d: "Широкое лезвие с кровостоком", dt: "рубящий", props: ["finesse", "light"], ico: "knife" },
    { n: "Ритуальный кинжал", d: "Кривое лезвие, рукоять в резных знаках", crit: 19, pm: 2, ico: "ritual" }, { n: "Стилет", d: "Тонкий трёхгранный клинок пробивает кольчугу", hit: 1, props: ["finesse", "light"], pm: 1.5 }],
  shortsword: [{ n: "Короткий меч", d: "Удобен в тесноте" }, { n: "Гладиус", d: "Широкий клинок с острым концом" }, { n: "Тесак", d: "Тяжёлый клинок абордажника", dt: "рубящий", props: ["light"], dmg: 1, ico: "cleaver" }],
  scimitar: [{ n: "Скимитар", d: "Изогнутый лёгкий клинок" }, { n: "Сабля", g: "f", d: "Кавалерийский изгиб, быстрый удар", ico: "sabre" }, { n: "Ятаган", d: "Клинок с двойным изгибом" }],
  handaxe: [{ n: "Ручной топор", d: "Лёгкий, можно метнуть" }, { n: "Плотницкий топор", d: "Рабочий инструмент, сгодится и в драке", cat: "simple", pm: .5 }, { n: "Метательный топорик", d: "Сбалансирован для броска", hit: 1, pm: 1.4 }],
  battleaxe: [{ n: "Боевой топор", d: "Широкое лезвие на крепком топорище" }, { n: "Бородовидный топор", d: "Лезвие с длинной «бородой» цепляет щиты", ico: "bigaxe" }, { n: "Двусторонний топор", d: "Два лезвия — бьёт в обе стороны", dmg: 1, hit: -1, pm: 1.4 }],
  greataxe: [{ n: "Секира", d: "Огромное лезвие на длинном топорище" }, { n: "Бердыш", g: "m", d: "Полумесяц на длинном древке", props: ["heavy", "two", "reach"], dice: "1d10", ico: "pike" }, { n: "Колун", g: "m", d: "Тяжёлый, как приговор", dmg: 1, hit: -1, pm: .8 }],
  halberd: [{ n: "Алебарда", d: "Топор, крюк и наконечник на одном древке" }, { n: "Пика", d: "Длинное древко и узкий наконечник", dt: "колющий", ico: "spear" }],
  glaive: [{ n: "Глефа", d: "Клинок на древке" }, { n: "Совня", d: "Изогнутый нож на длинном древке" }],
  spear: [{ n: "Копьё", d: "Наконечник на ясеневом древке" }, { n: "Рогатина", g: "f", d: "Широкий наконечник с перекладиной — для медведя", dmg: 1, props: ["versatile"] }, { n: "Острога", g: "f", d: "Рыбацкий наконечник с зубцами", ico: "trident" }],
  mace: [{ n: "Булава", d: "Тяжёлый оголовок на рукояти" }, { n: "Шестопёр", g: "m", d: "Шесть рёбер-перьев сминают шлемы", hit: 1, pm: 1.5 }, { n: "Пернач", g: "m", d: "Знак власти и оружие" }],
  morningstar: [{ n: "Моргенштерн", d: "Шипастый шар на рукояти" }, { n: "Шипастая дубина", g: "f", d: "Гвозди в дубовой колоде", cat: "simple", pm: .2, ico: "club" }],
  warhammer: [{ n: "Боевой молот", d: "Бойком сминает, обухом пробивает" }, { n: "Клевец", d: "Острый клюв пробивает латы", dt: "колющий", ico: "warpick" }],
  maul: [{ n: "Кувалда", d: "Двуручный молот" }, { n: "Двуручный молот", g: "m", d: "Окованный железом боёк" }],
  staff: [{ n: "Боевой посох", d: "Окованный железом" }, { n: "Посох странника", d: "Отполирован ладонями за долгие дороги" }, { n: "Посох мага", d: "Навершие с тусклым камнем", ico: "wstaff" }],
  sickle: [{ n: "Серп", d: "Лёгкий изогнутый клинок" }, { n: "Серп друида", d: "Лунный изгиб, рукоять из омелы", pm: 3, hit: 1 }],
  club: [{ n: "Дубинка", d: "Крепкая палка" }, { n: "Палка с гвоздями", g: "f", d: "Злое изобретение трактирных драк", dmg: 1, hit: -1 }],
  shortbow: [{ n: "Короткий лук", d: "Простой лук" }, { n: "Охотничий лук", d: "Лёгкий, для дичи", pm: .8 }, { n: "Степной лук", d: "Составной, клееный из рога", hit: 1, pm: 2 }],
  longbow: [{ n: "Длинный лук", d: "В рост человека" }, { n: "Тисовый лук", d: "Из цельного тиса, бьёт далеко", dmg: 1, pm: 1.5 }],
  lcrossbow: [{ n: "Лёгкий арбалет", d: "Взводится рукой" }, { n: "Охотничий арбалет", d: "Короткие тяжёлые болты" }],
  flail: [{ n: "Цеп", d: "Шар на цепи" }, { n: "Боевой цеп", d: "Два шипастых шара", dmg: 1, hit: -1, pm: 1.3 }],
  trident: [{ n: "Трезубец", d: "Три зубца на древке" }], warpick: [{ n: "Боевая кирка", d: "Узкий клюв на рукояти" }], whip: [{ n: "Кнут", d: "Длинный, со свинцовым концом" }, { n: "Плеть", g: "f", d: "Узлы на ремнях" }],
  javelin: [{ n: "Метательное копьё", d: "Лёгкий дротик" }, { n: "Сулица", g: "f", d: "Короткое метательное копьё" }], lhammer: [{ n: "Лёгкий молот", d: "Молоток кузнеца" }], greatclub: [{ n: "Палица", d: "Окованная железом" }],
  sling: [{ n: "Праща", d: "Ремень и мешочек камней" }], hcrossbow: [{ n: "Тяжёлый арбалет", d: "Взводится воротом, пробивает щит" }]
};
const QUAL = [{ k: "rusty", w: 12, a: ["Ржавый", "Ржавая", "Ржавое"], hit: -1, pm: .35, col: "#a68a68", tag: "ржавое" }, { k: "common", w: 58, a: null, pm: 1, col: "#d8ccb0", tag: "обычное" },
  { k: "fine", w: 21, a: ["Добротный", "Добротная", "Добротное"], hit: 1, pm: 2.2, col: "#7cc79c", tag: "добротное" }, { k: "master", w: 7, a: ["Мастерский", "Мастерская", "Мастерское"], hit: 1, dmg: 1, pm: 5, col: "#72aed0", tag: "мастерское" },
  { k: "rare", w: 2, a: null, pm: 7, col: "#c59af0", tag: "редкое" }];
const MATS = [{ k: "silver", a: ["Серебрёный", "Серебрёная", "Серебрёное"], vs: { undead: "1d6" }, d: "посеребрённое лезвие жжёт нежить", col: "#cfdbe3" },
  { k: "black", sfx: "из чёрной стали", dmg: 1, crit: 19, d: "чёрная сталь не тупится", col: "#c59af0" }, { k: "holy", a: ["Освящённый", "Освящённая", "Освящённое"], vs: { undead: "1d4" }, hit: 1, d: "на клинке молитва, нежить его боится", col: "#e6d08a" },
  { k: "runic", a: ["Рунический", "Руническая", "Руническое"], hit: 1, dmg: 1, d: "руны светятся в темноте", col: "#9fd8ff" }];
const GI = { m: 0, f: 1, n: 2 };
const UNDEAD = new Set(["zombie", "skeleton"]); const BEASTS = new Set(["wolf", "giant_rat", "giant_spider"]); const HUMANOIDS = new Set(["bandit", "cultist", "thug", "goblin"]);
const lc1 = s => s ? s[0].toLowerCase() + s.slice(1) : s;
function rollWeighted(R, arr) { const tot = arr.reduce((a, x) => a + x.w, 0); let r = R() * tot; for (const x of arr) { if ((r -= x.w) < 0) return x; } return arr[0]; }
function makeWeapon(type, R, o = {}) {
  const T = WT[type]; const vars = WV[type] || [{ n: T.n }]; const v = o.variant != null ? vars[o.variant % vars.length] : vars[Math.floor(R() * vars.length)];
  const q = o.tier ? QUAL.find(x => x.k === o.tier) : rollWeighted(R, QUAL); const mat = q.k === "rare" || o.mat ? (MATS.find(m => m.k === o.mat) || MATS[Math.floor(R() * MATS.length)]) : null;
  const g = v.g || T.g; const gi = GI[g] ?? 0; let name = v.n;
  if (mat?.a) name = mat.a[gi] + " " + lc1(name); if (q.a) name = q.a[gi] + " " + lc1(name); if (mat?.sfx) name += " " + mat.sfx;
  const def = { k: "w" + (hash(type + name + R()) % 1e9).toString(36), type, name, g, look: [v.d, mat?.d].filter(Boolean).join("; "), dice: v.dice || T.dice, dt: v.dt || T.dt, props: v.props || T.props, cat: v.cat || T.cat,
    hit: (v.hit || 0) + (q.hit || 0) + (mat?.hit || 0), dmg: (v.dmg || 0) + (q.dmg || 0) + (mat?.dmg || 0), crit: Math.min(v.crit || 20, mat?.crit || 20), vs: mat?.vs || null,
    p: Math.max(1, Math.round(T.p * (v.pm || 1) * q.pm * (mat ? 1.6 : 1))), ico: v.ico || T.ico, col: mat?.col || q.col, tier: mat ? "rare" : q.k, tag: mat ? "редкое" : q.tag };
  return def;
}
function wDef(wid) { const w = WEAPONS[wid]; if (!w) return null; if (w.type) return w; const t = WT[wid]; return t ? { ...w, type: wid, ico: t.ico, dt: t.dt, props: t.props, cat: t.cat, col: "#d8ccb0", tier: "common", tag: "обычное", hit: 0, dmg: 0, crit: 20, look: "" } : { ...w, type: wid, ico: "longsword", col: "#d8ccb0", props: [], cat: "simple", hit: 0, dmg: 0, crit: 20 }; }
function registerWeapon(def) { WEAPONS[def.k] = { ...def, abil: def.props.includes("finesse") ? "finesse" : def.props.includes("ranged") ? "dex" : "str", ranged: def.props.includes("ranged") }; return def.k; }
function registerWeapons(c) { Object.values(c?.wdefs || {}).forEach(registerWeapon); }
function giveWeapon(c, def) { c.wdefs = c.wdefs || {}; c.wdefs[def.k] = def; registerWeapon(def); if (!c.weapons.includes(def.k)) c.weapons.push(def.k); c.items.push({ name: def.name, wk: def.k, desc: def.look }); }
const PROP_RU = { finesse: "фехтовальное", light: "лёгкое", heavy: "тяжёлое", two: "двуручное", reach: "длинное", thrown: "метательное", versatile: "универсальное", ranged: "дальнобойное" };
const WP_MART = { rogue: ["rapier", "longsword", "shortsword", "scimitar"], bard: ["rapier", "longsword", "shortsword", "scimitar"], druid: [], wizard: [], warlock: [], cleric: [] };
const WP_ONLY = { druid: ["club", "dagger", "javelin", "mace", "staff", "scimitar", "sickle", "sling", "spear"], wizard: ["dagger", "staff", "lcrossbow", "sling"] };
function weaponProf(c, wid) { const d = wDef(wid); if (!d) return true; if (WP_ONLY[c.cls]) return WP_ONLY[c.cls].includes(d.type); if (["fighter", "barbarian", "paladin", "ranger"].includes(c.cls)) return true; return d.cat === "simple" || (WP_MART[c.cls] || []).includes(d.type); }
function weaponDice(c, d) { if (d.props.includes("versatile") && !gearOf(c).shield && !d.props.includes("two")) { const m = String(d.dice).match(/^(\d+)d(\d+)$/); if (m) { const up = { 4: 6, 6: 8, 8: 10, 10: 12 }[m[2]]; if (up) return `${m[1]}d${up}`; } } return d.dice; }
function weaponLine(c, wid) { const d = wDef(wid); const a = weaponAtk(wid); return `${fmt(a.bonus)} · ${weaponDice(c, d)}${a.dmgMod ? fmt(a.dmgMod) : ""} ${d.dt || ""}`.trim(); }
function weaponTile(d, size = 40) { return `<span class="w-tile t-${d.tier || "common"}" style="--wc:${d.col || "#d8ccb0"}">${ico(d.ico || "longsword", Math.round(size * .66))}</span>`; }
function weaponCardHTML(d, c, extra = "") {
  const prof = c ? weaponProf(c, d.k || d.type) : true; const chips = [d.dt, ...(d.props || []).map(p => PROP_RU[p])].filter(Boolean);
  const mods = [d.hit ? `попадание ${fmt(d.hit)}` : "", d.dmg ? `урон ${fmt(d.dmg)}` : "", d.crit && d.crit < 20 ? `крит ${d.crit}–20` : "", d.vs?.undead ? `+${d.vs.undead} по нежити` : ""].filter(Boolean);
  return `<div class="w-card t-${d.tier || "common"}" style="--wc:${d.col || "#d8ccb0"}">${weaponTile(d, 46)}<div class="w-body"><div class="w-head"><b>${esc(d.name)}</b><span class="w-dice">${esc(d.dice)}</span></div>
    <small class="w-look">${esc(d.look || "")}</small><div class="w-chips">${d.tag && d.tag !== "обычное" ? `<span class="w-tier">${d.tag}</span>` : ""}${chips.map(x => `<span>${esc(x)}</span>`).join("")}${mods.map(x => `<span class="w-mod">${esc(x)}</span>`).join("")}${!prof ? `<span class="w-warn">нет владения</span>` : ""}</div>${extra}</div></div>`;
}
/* ---------- стартовые наборы снаряжения ---------- */
const KITS = {
  fighter: [{ n: "Меч и щит", w: ["longsword", "lcrossbow"], armor: "chainmail", shield: true, d: "Надёжная классика: защита и удар" }, { n: "Двуручник", w: ["greatsword", "javelin"], armor: "chainmail", d: "Максимальный урон, без щита" }, { n: "Древковое", w: ["halberd", "handaxe"], armor: "chainmail", d: "Длинное оружие держит врага на расстоянии" }],
  barbarian: [{ n: "Секира", w: ["greataxe", "javelin"], d: "Самый тяжёлый удар в игре" }, { n: "Топор и топорики", w: ["battleaxe", "handaxe"], d: "Удар и бросок" }, { n: "Боевая коса", w: ["scythe", "javelin"], d: "Длинный размашистый удар" }],
  paladin: [{ n: "Меч и щит", w: ["longsword", "javelin"], armor: "chainmail", shield: true, d: "Рыцарский канон" }, { n: "Моргенштерн и щит", w: ["morningstar", "javelin"], armor: "chainmail", shield: true, d: "Колющий шар против брони" }, { n: "Двуручный меч", w: ["greatsword"], armor: "chainmail", d: "Кара двумя руками" }],
  ranger: [{ n: "Длинный лук и меч", w: ["longbow", "shortsword"], armor: "leather", d: "Стреляет издалека, добивает вблизи" }, { n: "Короткий лук и копьё", w: ["shortbow", "spear"], armor: "leather", d: "Лёгкий охотник" }, { n: "Арбалет и сабля", w: ["hcrossbow", "scimitar"], armor: "leather", d: "Тяжёлый болт и быстрый клинок" }],
  rogue: [{ n: "Рапира и лук", w: ["rapier", "shortbow"], armor: "leather", d: "Укол и выстрел из тени" }, { n: "Клинки", w: ["dagger", "shortsword"], armor: "leather", d: "Два лёгких клинка" }, { n: "Кнут и арбалет", w: ["whip", "lcrossbow"], armor: "leather", d: "Держит дистанцию" }],
  bard: [{ n: "Рапира", w: ["rapier", "dagger"], armor: "leather", d: "Изящно и смертельно" }, { n: "Длинный меч", w: ["longsword", "dagger"], armor: "leather", d: "Для тех, кто поёт о битвах" }, { n: "Праща и кинжал", w: ["sling", "dagger"], armor: "leather", d: "Песня важнее стали" }],
  cleric: [{ n: "Булава и щит", w: ["mace", "lcrossbow"], armor: "scale", shield: true, d: "Оружие веры" }, { n: "Копьё и щит", w: ["spear", "sling"], armor: "scale", shield: true, d: "Строй и молитва" }, { n: "Посох паломника", w: ["staff", "sling"], armor: "scale", d: "Двумя руками бьёт сильнее" }],
  druid: [{ n: "Посох", w: ["staff", "sling"], armor: "leather", shield: true, d: "Дерево, камень и праща" }, { n: "Серп и щит", w: ["sickle", "javelin"], armor: "leather", shield: true, d: "Серп для омелы и для врага" }, { n: "Скимитар", w: ["scimitar", "sling"], armor: "leather", shield: true, d: "Быстрый изогнутый клинок" }],
  warlock: [{ n: "Кинжал и арбалет", w: ["dagger", "lcrossbow"], armor: "leather", d: "Сила — в заряде, сталь — на всякий случай" }, { n: "Посох", w: ["staff", "dagger"], armor: "leather", d: "Опора и фокус" }, { n: "Серп", w: ["sickle", "dagger"], armor: "leather", d: "Изогнутая сталь договора" }],
  wizard: [{ n: "Посох мага", w: ["staff"], v: [2], d: "Фокус и опора" }, { n: "Кинжалы", w: ["dagger", "dagger"], d: "Лёгкие, можно метнуть" }, { n: "Арбалет", w: ["lcrossbow", "dagger"], d: "Выстрел, когда кончились ячейки" }]
};
function kitWeapons(cls, ki, seed) { const K = KITS[cls][ki]; const R = mulberry(seed >>> 0); return K.w.map((t, i) => makeWeapon(t, R, { tier: R() < .12 ? "fine" : "common", variant: K.v?.[i] ?? Math.floor(R() * (WV[t] || [1]).length) })); }
