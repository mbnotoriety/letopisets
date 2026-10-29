"use strict";
/* =========================================================================
   DATA — правила (SRD 5e, упрощённо) и мир прототипа
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
    traits: ["+1 ко всем характеристикам", "Знает любой язык побережья"], skills: [] },
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
    items: ["Боевой посох", "Книга заклинаний", "Мешочек с компонентами"], blurb: "Хрупкий, но знает слова, от которых гаснет море." },
  cleric: { name: "Жрец", role: "Свет и исцеление", color: "#e3c06a", hd: 8, saves: ["wis", "cha"],
    prio: ["wis", "con", "str", "dex", "cha", "int"], armor: { name: "Чешуйчатый доспех и щит", base: 16, dex: 2 },
    weapons: ["mace"], skillCount: 2, cast: "wis", spells: ["sacred_flame", "cure_wounds", "guiding_bolt"],
    skillList: ["history", "insight", "medicine", "persuasion", "religion"],
    features: ["Колдовство (МДР)", "Божественный домен: Жизнь"],
    items: ["Чешуйчатый доспех", "Щит", "Булава", "Священный символ"], blurb: "Голос прилива. Лечит, изгоняет нежить, держит строй." }
};
const BACKGROUNDS = {
  soldier: { name: "Солдат", skills: ["athletics", "intimidation"], hook: "служил в береговой страже и помнит, как горел маяк в лучшие годы" },
  sage: { name: "Мудрец", skills: ["arcana", "history"], hook: "приехал изучать старые приливные обряды здешней часовни" },
  criminal: { name: "Преступник", skills: ["deception", "stealth"], hook: "когда-то возил контрабанду вдоль этого берега и знает, кто здесь платит за молчание" },
  acolyte: { name: "Прислужник", skills: ["insight", "religion"], hook: "получил письмо от сестры Илвы с просьбой о помощи" }
};
const MODES = {
  chronicle: { name: "Хроника", sub: "Строгий сюжет, честные броски, перманентная смерть", prompt: "Режим ХРОНИКА: серьёзный тон, сюжет ведёт к тайне, мир жёсткий, ошибки имеют цену. Смерть героя окончательна." },
  sandbox: { name: "Песочница", sub: "Свободный мир, один второй шанс при смерти", prompt: "Режим ПЕСОЧНИЦА: мир свободен, следуй за интересами игрока, сюжет подстраивается." },
  novice: { name: "Новичок", sub: "Дружелюбно, с подсказками по правилам, без смерти", prompt: "Режим НОВИЧОК: дружелюбный тон, в конце коротко подскажи, какие действия возможны и как работают проверки. Герой не умирает, а теряет сознание." }
};
const MAP_W = 20, MAP_H = 14;
const POIS = {
  tavern: { name: "Таверна «Кривой якорь»", x: 9, y: 7, kind: "house", short: "Сердце деревни, пахнет рыбой и смолой",
    desc: "Низкий зал с чадящим очагом. Рыбаки шепчутся о ночном крушении. Здесь можно снять комнату и отдохнуть.", npcs: ["marta"], rest: true },
  pier: { name: "Пристань", x: 3, y: 9, kind: "pier", short: "Мокрые доски, сети, лодки",
    desc: "Скрипучие мостки уходят в серую воду. Рыбак чинит сеть и упорно не смотрит в сторону маяка.", npcs: ["ost"] },
  elder: { name: "Дом старосты", x: 12, y: 5, kind: "house", short: "Единственный дом из камня",
    desc: "Добротный дом с новой черепицей, слишком новой для деревни, где всё рассыпается.", npcs: ["brenn"] },
  chapel: { name: "Часовня Приливов", x: 14, y: 8, kind: "chapel", short: "Старая часовня с пустой звонницей",
    desc: "В звоннице нет колокола: на балке лишь светлый след от крепления. Внутри тихо и сыро.", npcs: ["ilva"], rest: true },
  wreck: { name: "Место крушения", x: 5, y: 12, kind: "wreck", short: "Обломки «Серебряной чайки»",
    desc: "На отмели лежит разбитый когг. Ящики вскрыты, но не волнами: на досках следы ломов.", npcs: [] },
  grove: { name: "Сосновая роща", x: 9, y: 2, kind: "forest", short: "Тропа к маяку через сосны",
    desc: "Узловатые сосны, ветер с моря. На тропе свежие следы нескольких пар сапог, ведущие к маяку.", npcs: [] },
  lighthouse: { name: "Старый маяк", x: 17, y: 2, kind: "tower", short: "Заброшен, но ночью в нём горит свет",
    desc: "Башня на скале, дверь сорвана с петель. Внутри пахнет водорослями, на ступенях мокрые следы босых ног.", npcs: [], enemies: ["drowned_a", "drowned_b"] },
  cave: { name: "Грот под скалой", x: 17, y: 11, kind: "cave", short: "Видно только в отлив",
    desc: "Низкий вход у самой воды. Внутри отблеск фонаря и голоса.", npcs: [], enemies: ["smug_a", "smug_b", "rafe"] }
};
const NPCS = {
  marta: { name: "Марта", role: "хозяйка таверны", hue: 18, look: "полная, рыжая, с ожогом на руке",
    persona: "Громкая, добрая, любит сплетни. Боится, что деревня вымрет.",
    secret: "Видела, как Ост ночью выходил в море без фонаря в ночь крушения." },
  ost: { name: "Ост", role: "рыбак", hue: 200, look: "жилистый, седая щетина, взгляд в пол",
    persona: "Молчаливый, нервный, защищает семью любой ценой.",
    secret: "Его брат Рэйф — главарь контрабандистов. Ост знает про грот, но боится за брата." },
  brenn: { name: "Бренн", role: "староста", hue: 280, look: "холёный, перстни, дорогой плащ",
    persona: "Вежлив, уклончив, хочет замять историю с крушением.",
    secret: "Берёт долю с добычи контрабандистов. Сам никого не убивал." },
  ilva: { name: "Сестра Илва", role: "жрица Часовни Приливов", hue: 160, look: "худая, в сером, с выцветшей синей лентой",
    persona: "Тихая, упорная, верит в старые обряды.",
    secret: "Знает, что Колокол Приливов украден месяц назад, и подозревает, что мертвецы поднялись из-за этого." }
};
const ENEMIES = {
  drowned_a: { name: "Утопленник", ac: 8, hp: 22, atk: 3, dmg: "1d6+1", dex: -2, xp: 50, loc: "lighthouse" },
  drowned_b: { name: "Хальвард-утопленник", ac: 8, hp: 22, atk: 3, dmg: "1d6+1", dex: -2, xp: 50, loc: "lighthouse" },
  smug_a: { name: "Контрабандист", ac: 12, hp: 11, atk: 3, dmg: "1d6+1", dex: 1, xp: 25, loc: "cave" },
  smug_b: { name: "Контрабандист с багром", ac: 12, hp: 11, atk: 3, dmg: "1d6+1", dex: 1, xp: 25, loc: "cave" },
  rafe: { name: "Рэйф", ac: 14, hp: 30, atk: 4, dmg: "1d8+2", dex: 2, xp: 100, loc: "cave" }
};
const WORLD_PUBLIC = "Солёная Гавань — бедная рыбацкая деревня на холодном северном побережье. Прошлой ночью на рифах у старого маяка разбился торговый когг «Серебряная чайка». Маяк заброшен с тех пор, как месяц назад пропал смотритель Хальвард, но в ночь крушения в нём горел свет. Магия в мире редка и пугает простых людей.";
const PLOT_SECRET = "СЕКРЕТ (знает только хранитель сюжета, раскрывать постепенно, через улики): Рэйф, брат рыбака Оста, главарь контрабандистов из грота под скалой. Он зажигает ложный огонь на маяке, чтобы корабли разбивались о рифы, и грабит обломки. Смотритель Хальвард узнал об этом и был утоплен людьми Рэйфа. Месяц назад Рэйф украл из часовни Колокол Приливов (он у него в гроте) — без колокола благословение моря ослабло, и утонувшие, включая Хальварда, по ночам встают у маяка. Староста Бренн берёт долю с добычи. Ост всё знает, но покрывает брата. Хорошие концовки: вернуть колокол в часовню (мертвецы упокоятся) и/или разоблачить Рэйфа и Бренна. Опорные точки: 1) улики на месте крушения (следы ломов), 2) признание Оста или слова Марты, 3) маяк с утопленниками (там можно найти записку Хальварда о гроте), 4) грот и колокол.";

/* =========================================================================
   RNG & DICE — броски делает только код
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

/* =========================================================================
   STATE
   ========================================================================= */
let S = null;          // игра
let D = null;          // черновик создания
const SAVE_KEY = "salt-harbor-v1";
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
function load() { try { const r = localStorage.getItem(SAVE_KEY); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function wipe() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

/* =========================================================================
   ENGINE — характеристики, проверки, атаки, заклинания
   ========================================================================= */
const mod = v => Math.floor((v - 10) / 2);
const prof = lvl => 2 + Math.floor((lvl - 1) / 4);
function finalScores(base, race) {
  const out = {}; const b = RACES[race]?.bonus || {};
  for (const a of ABIL) out[a] = (base[a] || 8) + (b[a] || 0);
  return out;
}
function calcAC(cls, scores) {
  const ar = CLASSES[cls].armor; return ar.base + Math.min(mod(scores.dex), ar.dex);
}
function maxHP(cls, race, scores, lvl, extra) {
  const c = CLASSES[cls]; let hp = c.hd + mod(scores.con) + (RACES[race].hpBonus || 0);
  return Math.max(1, hp + (extra || 0));
}
function slotsFor(cls, lvl) { if (!CLASSES[cls].spells) return {}; return { 1: lvl >= 2 ? 3 : 2 }; }
function C() { return S.char; }
function skillBonus(key) {
  const c = C(); const [, ab] = SKILLS[key];
  return mod(c.scores[ab]) + (c.skills.includes(key) ? prof(c.level) : 0);
}
function saveBonus(ab) { const c = C(); return mod(c.scores[ab]) + (CLASSES[c.cls].saves.includes(ab) ? prof(c.level) : 0); }
function d20(adv) {
  const lucky = RACES[C().race].lucky;
  const one = () => { let r = rnd(20); if (r === 1 && lucky) r = rnd(20); return r; };
  const a = one(); if (!adv) return { nat: a, pair: null };
  const b = one(); return { nat: adv > 0 ? Math.max(a, b) : Math.min(a, b), pair: [a, b] };
}
function weaponAtk(wid) {
  const w = WEAPONS[wid]; const c = C();
  const ab = w.abil === "finesse" ? (mod(c.scores.dex) >= mod(c.scores.str) ? "dex" : "str") : w.abil;
  return { w, ab, bonus: mod(c.scores[ab]) + prof(c.level), dmgMod: mod(c.scores[ab]) };
}
function castMod() { const c = C(); const ab = CLASSES[c.cls].cast; return ab ? mod(c.scores[ab]) : 0; }
function spellAtk() { return castMod() + prof(C().level); }
function spellDC() { return 8 + castMod() + prof(C().level); }
function enemyHere(id) {
  const e = S.world.enemies[id]; return e && e.alive && ENEMIES[id].loc === S.world.loc ? e : null;
}
function aliveEnemiesHere() { return Object.keys(S.world.enemies).filter(id => enemyHere(id)); }

/* Resolve one validated check → result object for the feed and the narrator */
function resolveCheck(ch) {
  const c = C();
  if (ch.kind === "skill") {
    const r = d20(ch.adv); const b = skillBonus(ch.skill); const tot = r.nat + b;
    const ok = r.nat === 20 ? true : tot >= ch.dc;
    return { ...ch, nat: r.nat, pair: r.pair, bonus: b, total: tot, ok, crit: r.nat === 20, fumble: r.nat === 1,
      title: `Проверка: ${SKILLS[ch.skill][0]}`, formula: `d20 (${r.pair ? r.pair.join(" / ") : r.nat}) ${fmt(b)} = ${tot} против КС ${ch.dc}` };
  }
  if (ch.kind === "save") {
    const r = d20(ch.adv); const b = saveBonus(ch.ability); const tot = r.nat + b; const ok = tot >= ch.dc;
    return { ...ch, nat: r.nat, pair: r.pair, bonus: b, total: tot, ok, crit: r.nat === 20, fumble: r.nat === 1,
      title: `Спасбросок: ${ABIL_FULL[ch.ability]}`, formula: `d20 (${r.nat}) ${fmt(b)} = ${tot} против КС ${ch.dc}` };
  }
  if (ch.kind === "attack") {
    const e = S.world.enemies[ch.target]; const E = ENEMIES[ch.target];
    const { w, bonus, dmgMod } = weaponAtk(ch.weapon);
    const adv = ch.adv || (e.asleep ? 1 : 0);
    const r = d20(adv); const tot = r.nat + bonus;
    const hit = r.nat === 20 || (r.nat !== 1 && tot >= E.ac);
    let dmg = null, extra = "";
    if (hit) {
      dmg = rollDice({ ...parseDice(w.dice), mod: dmgMod }, r.nat === 20);
      if (c.cls === "rogue" && adv > 0 && !S.turnSneak) { const sn = rollDice("1d6", r.nat === 20); dmg.total += sn.total; extra = ` + скрытая атака ${sn.text}`; S.turnSneak = true; }
      hurtEnemy(ch.target, dmg.total);
    }
    return { ...ch, nat: r.nat, pair: r.pair, total: tot, ok: hit, crit: r.nat === 20, fumble: r.nat === 1, dmg: dmg?.total || 0,
      title: `Атака: ${w.name} → ${E.name}`,
      formula: `d20 (${r.pair ? r.pair.join(" / ") : r.nat}) ${fmt(bonus)} = ${tot} против КД ${E.ac}` + (hit ? ` · урон ${dmg.text}${extra}` : ""),
      enemyAfter: enemyStatus(ch.target) };
  }
  if (ch.kind === "spell") return castSpell(ch);
  return null;
}
function useSlot(lvl) { const s = C().slots; if (!lvl) return true; if (!s[lvl] || s[lvl][1] <= 0) return false; s[lvl][1]--; return true; }
function castSpell(ch) {
  const sp = SPELLS[ch.spell]; const c = C();
  if (!useSlot(sp.lvl)) return { ...ch, ok: false, title: `${sp.name}`, formula: "Нет свободных ячеек заклинаний", noslot: true, nat: 0 };
  const E = ENEMIES[ch.target]; const e = S.world.enemies[ch.target];
  const base = { ...ch, title: `Заклинание: ${sp.name}${E ? " → " + E.name : ""}` };
  if (sp.kind === "attack") {
    const r = d20(e?.asleep ? 1 : 0); const b = spellAtk(); const tot = r.nat + b; const hit = r.nat === 20 || (r.nat !== 1 && tot >= E.ac);
    let d = null; if (hit) { d = rollDice(sp.dice, r.nat === 20); hurtEnemy(ch.target, d.total); }
    return { ...base, nat: r.nat, total: tot, ok: hit, crit: r.nat === 20, dmg: d?.total || 0,
      formula: `d20 (${r.nat}) ${fmt(b)} = ${tot} против КД ${E.ac}` + (hit ? ` · урон ${d.text} ${sp.type}` : ""), enemyAfter: enemyStatus(ch.target) };
  }
  if (sp.kind === "auto") {
    const d = rollDice(sp.dice); hurtEnemy(ch.target, d.total);
    return { ...base, nat: 0, ok: true, dmg: d.total, formula: `Попадание без броска · урон ${d.text}`, enemyAfter: enemyStatus(ch.target) };
  }
  if (sp.kind === "save") {
    const sv = rnd(20); const tot = sv + ENEMIES[ch.target].dex; const dc = spellDC(); const failed = tot < dc;
    let d = null; if (failed) { d = rollDice(sp.dice); hurtEnemy(ch.target, d.total); }
    return { ...base, nat: sv, ok: failed, dmg: d?.total || 0, enemyRoll: true,
      formula: `Спасбросок цели d20 (${sv}) ${fmt(ENEMIES[ch.target].dex)} = ${tot} против КС ${dc}` + (failed ? ` · урон ${d.text} ${sp.type}` : " · увернулась"), enemyAfter: enemyStatus(ch.target) };
  }
  if (sp.kind === "sleep") {
    const pool = rollDice(sp.dice); let left = pool.total; const slept = [];
    aliveEnemiesHere().map(id => [id, S.world.enemies[id].hp]).sort((a, b) => a[1] - b[1]).forEach(([id, hp]) => {
      if (hp <= left) { left -= hp; S.world.enemies[id].asleep = true; slept.push(ENEMIES[id].name); }
    });
    return { ...base, nat: 0, ok: slept.length > 0, formula: `Пул ${pool.text} · уснули: ${slept.join(", ") || "никто"}` };
  }
  if (sp.kind === "heal") {
    const d = rollDice(sp.dice); const amt = d.total + castMod(); const got = healHero(amt);
    return { ...base, title: `Заклинание: ${sp.name}`, nat: 0, ok: true, heal: got, formula: `${d.text} ${fmt(castMod())} = ${amt} HP` };
  }
  return base;
}
function hurtEnemy(id, amt) {
  const e = S.world.enemies[id]; e.hp = Math.max(0, e.hp - amt); e.asleep = false;
  if (e.hp === 0 && e.alive) { e.alive = false; S.pendingXP = (S.pendingXP || 0) + ENEMIES[id].xp; }
}
function enemyStatus(id) {
  const e = S.world.enemies[id]; const E = ENEMIES[id];
  if (!e.alive) return "повержен"; const p = e.hp / E.hp;
  return e.asleep ? "спит" : p > .7 ? "почти невредим" : p > .35 ? "ранен" : "тяжело ранен";
}
function healHero(amt) { const c = C(); const before = c.hp; c.hp = Math.min(c.maxHp, c.hp + amt); if (c.hp > 0) { S.dying = null; } return c.hp - before; }
function hurtHero(amt) { const c = C(); c.hp = Math.max(0, c.hp - amt); return amt; }
function enemyTurn() {
  const out = [];
  if (!S.world.combat) return out;
  for (const id of aliveEnemiesHere()) {
    const e = S.world.enemies[id]; const E = ENEMIES[id];
    if (e.asleep) { out.push({ kind: "enemy", title: `${E.name} спит`, formula: "Пропускает ход", nat: 0, ok: false, enemyRoll: true, skip: true }); continue; }
    if (C().hp <= 0) break;
    const nat = rnd(20); const tot = nat + E.atk; const hit = nat === 20 || (nat !== 1 && tot >= C().ac);
    let d = null; if (hit) { d = rollDice(E.dmg, nat === 20); hurtHero(d.total); }
    out.push({ kind: "enemy", by: id, title: `${E.name} атакует`, nat, total: tot, ok: hit, crit: nat === 20, enemyRoll: true, dmg: d?.total || 0,
      formula: `d20 (${nat}) +${E.atk} = ${tot} против вашего КД ${C().ac}` + (hit ? ` · урон ${d.text}` : " · промах") });
  }
  return out;
}

/* =========================================================================
   CHARACTER CREATION
   ========================================================================= */
const STEP_NAMES = ["Раса", "Класс", "Характеристики", "Навыки", "Облик", "Рассказчик"];
const STD = [15, 14, 13, 12, 10, 8];
const PB_COST = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
function newDraft() {
  return { step: 0, race: null, cls: null, method: "array", pool: STD.slice(), assign: {}, pb: { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 },
    rolled: null, bg: null, skills: [], name: "", gender: "m", about: "", sl1: 50, sl2: 50, epithet: "", story: "", mode: "sandbox" };
}
function autoAssign() {
  if (!D.cls) return; const order = CLASSES[D.cls].prio; const vals = D.pool.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]);
  D.assign = {}; order.forEach((ab, k) => { D.assign[ab] = vals[k][1]; });
}
function draftBase() {
  if (D.method === "pb") return { ...D.pb };
  const o = {}; for (const a of ABIL) o[a] = D.assign[a] != null ? D.pool[D.assign[a]] : 8; return o;
}
function draftScores() { return finalScores(draftBase(), D.race || "none"); }
function draftSkills() {
  const s = new Set(D.skills); if (D.race) RACES[D.race].skills.forEach(k => s.add(k)); if (D.bg) BACKGROUNDS[D.bg].skills.forEach(k => s.add(k)); return [...s];
}
function lockedSkills() { const s = new Set(); if (D.race) RACES[D.race].skills.forEach(k => s.add(k)); if (D.bg) BACKGROUNDS[D.bg].skills.forEach(k => s.add(k)); return s; }
function stepValid(i) {
  if (i === 0) return !!D.race;
  if (i === 1) return !!D.cls;
  if (i === 2) { if (D.method === "pb") return pbSpent() <= 27; return ABIL.every(a => D.assign[a] != null) && new Set(Object.values(D.assign)).size === 6; }
  if (i === 3) return !!D.bg && D.skills.length === CLASSES[D.cls].skillCount;
  if (i === 4) return D.name.trim().length >= 2;
  return true;
}
function pbSpent() { return ABIL.reduce((s, a) => s + PB_COST[D.pb[a]], 0); }
const STEP_HINTS = ["Выберите расу", "Выберите класс", "Распределите все шесть значений", "Выберите предысторию и навыки класса", "Введите имя (от 2 букв)", "Готово к приключению"];

function renderCreate() {
  const st = document.getElementById("steps"); st.innerHTML = "";
  STEP_NAMES.forEach((n, i) => {
    const li = document.createElement("li"); const b = document.createElement("button"); b.type = "button";
    const reach = i <= D.step || STEP_NAMES.slice(0, i).every((_, k) => stepValid(k));
    b.className = i === D.step ? "cur" : i < D.step ? "done" : ""; b.disabled = !reach;
    b.innerHTML = `<span class="n">${i < D.step ? "✓" : i + 1}</span><span class="lab">${n}</span>`;
    b.onclick = () => { D.step = i; renderCreate(); }; li.append(b); st.append(li);
  });
  const body = document.getElementById("step-body"); body.innerHTML = "";
  [stepRace, stepClass, stepAbil, stepSkills, stepLook, stepMode][D.step](body);
  document.getElementById("btn-back").disabled = D.step === 0;
  const nx = document.getElementById("btn-next"); nx.disabled = !stepValid(D.step);
  nx.textContent = D.step === 5 ? "Начать приключение" : "Далее";
  document.getElementById("step-hint").textContent = stepValid(D.step) ? (D.step === 5 ? "Мир ждёт" : "Можно дальше") : STEP_HINTS[D.step];
  renderHeroCard();
}
function head(body, eb, h, lead) { body.insertAdjacentHTML("beforeend", `<div class="eyebrow">${eb}</div><h2>${h}</h2><p class="lead">${lead}</p>`); }
function choiceGrid(body, items, sel, onPick) {
  const g = document.createElement("div"); g.className = "choices";
  items.forEach(it => {
    const b = document.createElement("button"); b.type = "button"; b.className = "choice"; b.setAttribute("aria-pressed", String(sel === it.id));
    b.innerHTML = `<div class="ch-head">${it.icon || ""}<div><div class="ch-name">${it.name}</div><div class="ch-sub">${it.sub}</div></div></div>${it.rec ? `<span class="rec">${it.rec}</span>` : ""}<ul>${it.list.map(x => `<li>${x}</li>`).join("")}</ul>`;
    b.onclick = () => onPick(it.id); g.append(b);
  });
  body.append(g);
}
function stepRace(body) {
  head(body, "Шаг 1", "Кто вы по крови?", "Раса даёт бонусы к характеристикам и врождённые черты. В Солёной Гавани чужаков встречают настороженно, но всех одинаково.");
  choiceGrid(body, Object.entries(RACES).map(([id, r]) => ({ id, name: r.name, sub: r.sub,
    list: [Object.entries(r.bonus).map(([a, v]) => `${ABIL_RU[a]} +${v}`).join(", "), ...r.traits.slice(id === "human" ? 1 : 0), `Скорость ${r.speed} фт`] })),
    D.race, id => { D.race = id; renderCreate(); });
}
function stepClass(body) {
  head(body, "Шаг 2", "Чем вы зарабатываете на жизнь?", "Мир прототипа — мрачное побережье с нежитью и контрабандистами. Жрец и плут здесь особенно к месту, но справится любой.");
  const rec = { cleric: "Нежить у маяка", rogue: "Тайны и контрабанда" };
  choiceGrid(body, Object.entries(CLASSES).map(([id, c]) => ({ id, name: c.name, sub: `${c.role} · кость хитов d${c.hd}`, rec: rec[id],
    icon: emblemSVG(id, 40), list: [c.blurb, ...c.features.slice(0, 1), "Спасброски: " + c.saves.map(a => ABIL_RU[a]).join(", ")] })),
    D.cls, id => { D.cls = id; D.skills = []; if (D.method !== "pb") autoAssign(); renderCreate(); });
}
function stepAbil(body) {
  head(body, "Шаг 3", "Сильные и слабые стороны", "Модификатор = (значение − 10) / 2, с округлением вниз. Он прибавляется к броскам d20. Расовые бонусы уже учтены справа.");
  const m = document.createElement("div"); m.className = "method";
  [["array", "Стандартный набор"], ["pb", "Покупка очков"], ["roll", "Бросить 4d6"]].forEach(([k, t]) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = t; b.setAttribute("aria-pressed", String(D.method === k));
    b.onclick = () => { D.method = k; if (k === "array") { D.pool = STD.slice(); autoAssign(); } if (k === "roll") { if (!D.rolled) rollStats(); else { D.pool = D.rolled.slice(); autoAssign(); } } renderCreate(); };
    m.append(b);
  });
  body.append(m);
  if (D.method === "roll") {
    const r = document.createElement("div"); r.className = "rolled";
    r.innerHTML = D.pool.map(v => `<div class="die">${v}</div>`).join("") + `<button class="btn small" type="button" id="reroll">Перебросить</button><small style="color:var(--dim)">4d6, худший куб отбрасывается</small>`;
    body.append(r); r.querySelector("#reroll").onclick = () => { rollStats(); renderCreate(); };
  }
  if (D.method === "pb") body.insertAdjacentHTML("beforeend", `<div class="budget">Потрачено <b>${pbSpent()}</b> из <b>27</b> очков · значения 8–15</div>`);
  const g = document.createElement("div"); g.className = "abil-grid"; const sc = draftScores();
  ABIL.forEach(a => {
    const cell = document.createElement("div"); cell.className = "abil-cell";
    const rb = D.race ? (RACES[D.race].bonus[a] || 0) : 0;
    cell.innerHTML = `<div class="lbl"><b>${ABIL_RU[a]}</b><small>${ABIL_FULL[a]}</small></div><div class="val"><span class="total">${sc[a]}</span><span class="mod">${fmt(mod(sc[a]))}</span>${rb ? `<span class="race">раса +${rb}</span>` : ""}</div>`;
    if (D.method === "pb") {
      const s = document.createElement("div"); s.className = "stepper";
      const minus = document.createElement("button"); minus.type = "button"; minus.textContent = "−"; minus.setAttribute("aria-label", `Уменьшить ${ABIL_FULL[a]}`);
      const plus = document.createElement("button"); plus.type = "button"; plus.textContent = "+"; plus.setAttribute("aria-label", `Увеличить ${ABIL_FULL[a]}`);
      const v = D.pb[a]; minus.disabled = v <= 8; plus.disabled = v >= 15 || pbSpent() - PB_COST[v] + PB_COST[v + 1] > 27;
      minus.onclick = () => { D.pb[a]--; renderCreate(); }; plus.onclick = () => { D.pb[a]++; renderCreate(); };
      s.append(minus, Object.assign(document.createElement("span"), { className: "num", textContent: `база ${v} · ${PB_COST[v]} оч.` }), plus); cell.append(s);
    } else {
      const sel = document.createElement("select"); sel.id = "as-" + a; sel.setAttribute("aria-label", ABIL_FULL[a]);
      sel.innerHTML = `<option value="">—</option>` + D.pool.map((v, i) => `<option value="${i}" ${D.assign[a] === i ? "selected" : ""}>${v}</option>`).join("");
      sel.onchange = () => {
        const i = sel.value === "" ? null : +sel.value;
        const other = ABIL.find(b => b !== a && D.assign[b] === i); if (other && i != null) D.assign[other] = D.assign[a] ?? null;
        D.assign[a] = i; renderCreate();
      };
      cell.append(sel);
    }
    g.append(cell);
  });
  body.append(g);
}
function rollStats() {
  D.rolled = Array.from({ length: 6 }, () => { const r = [rnd(6), rnd(6), rnd(6), rnd(6)].sort((a, b) => b - a); return r[0] + r[1] + r[2]; }).sort((a, b) => b - a);
  D.pool = D.rolled.slice(); autoAssign();
}
function stepSkills(body) {
  head(body, "Шаг 4", "Прошлое и умения", "Предыстория даёт два навыка и связь с деревней. Затем выберите навыки класса. Владение добавляет бонус мастерства +2 к проверке.");
  const bgg = document.createElement("div"); bgg.className = "choices";
  Object.entries(BACKGROUNDS).forEach(([id, b]) => {
    const btn = document.createElement("button"); btn.type = "button"; btn.className = "choice"; btn.setAttribute("aria-pressed", String(D.bg === id));
    btn.innerHTML = `<div class="ch-name">${b.name}</div><div class="ch-sub">${b.skills.map(k => SKILLS[k][0]).join(", ")}</div><ul><li>Вы ${b.hook}.</li></ul>`;
    btn.onclick = () => { D.bg = id; const lk = lockedSkills(); D.skills = D.skills.filter(k => !lk.has(k)); renderCreate(); };
    bgg.append(btn);
  });
  body.append(bgg);
  const cls = CLASSES[D.cls]; const lk = lockedSkills();
  body.insertAdjacentHTML("beforeend", `<div class="subhead">Навыки класса · выбрано ${D.skills.length} из ${cls.skillCount}</div>`);
  const list = document.createElement("div"); list.className = "skill-list"; const sc = draftScores();
  cls.skillList.forEach(k => {
    const b = document.createElement("button"); b.type = "button"; const locked = lk.has(k); const on = D.skills.includes(k) || locked;
    b.className = "skill-opt" + (locked ? " locked" : ""); b.setAttribute("aria-pressed", String(on));
    b.innerHTML = `<span>${SKILLS[k][0]} <small>${ABIL_RU[SKILLS[k][1]]}</small></span><span class="num">${fmt(mod(sc[SKILLS[k][1]]) + (on ? 2 : 0))}</span>`;
    if (locked) b.title = "Уже есть от расы или предыстории";
    b.onclick = () => {
      if (locked) return;
      if (D.skills.includes(k)) D.skills = D.skills.filter(x => x !== k); else if (D.skills.length < cls.skillCount) D.skills.push(k);
      renderCreate();
    };
    list.append(b);
  });
  body.append(list);
}
function stepLook(body) {
  head(body, "Шаг 5", "Имя и характер", "Рассказчик будет обращаться к вам по имени и учитывать характер. Портрет-герб собирается из класса и расы.");
  const f = document.createElement("div");
  f.innerHTML = `<div class="field"><label for="f-name">Имя героя</label><input id="f-name" maxlength="28" placeholder="Например, Эйрин Тёрн" value="${esc(D.name)}"></div>
  <div class="field"><label>Как к вам обращаться</label><div class="seg" id="f-gender"><button type="button" data-v="m">Он</button><button type="button" data-v="f">Она</button></div></div>
  <div class="slider-row"><span>Честный</span><input type="range" id="f-sl1" min="0" max="100" value="${D.sl1}" aria-label="Честный или хитрый"><span>Хитрый</span></div>
  <div class="slider-row"><span>Осторожный</span><input type="range" id="f-sl2" min="0" max="100" value="${D.sl2}" aria-label="Осторожный или безрассудный"><span>Безрассудный</span></div>
  <div class="field" style="margin-top:12px"><label for="f-about">Пара фраз о себе (необязательно)</label><textarea id="f-about" maxlength="300" placeholder="Боится глубокой воды. Ищет брата, ушедшего в море.">${esc(D.about)}</textarea></div>
  <div class="field"><button class="btn" type="button" id="f-story">Сочинить историю героя (ИИ)</button><small id="f-story-st" style="color:var(--dim)"></small></div>`;
  body.append(f);
  const nm = f.querySelector("#f-name"); nm.oninput = () => { D.name = nm.value; document.getElementById("btn-next").disabled = !stepValid(4); document.getElementById("step-hint").textContent = stepValid(4) ? "Можно дальше" : STEP_HINTS[4]; renderHeroCard(); };
  f.querySelectorAll("#f-gender button").forEach(b => { b.setAttribute("aria-pressed", String(D.gender === b.dataset.v)); b.onclick = () => { D.gender = b.dataset.v; renderCreate(); }; });
  f.querySelector("#f-sl1").oninput = e => { D.sl1 = +e.target.value; };
  f.querySelector("#f-sl2").oninput = e => { D.sl2 = +e.target.value; };
  f.querySelector("#f-about").oninput = e => { D.about = e.target.value; };
  f.querySelector("#f-story").onclick = () => writeBackstory(f.querySelector("#f-story"), f.querySelector("#f-story-st"));
}
function stepMode(body) {
  head(body, "Шаг 6", "Каким будет рассказчик?", "Режим меняет и тон ИИ, и правила движка: что происходит при нуле HP и насколько мир прощает ошибки.");
  choiceGrid(body, Object.entries(MODES).map(([id, m]) => ({ id, name: m.name, sub: m.sub, list: [] })), D.mode, id => { D.mode = id; renderCreate(); });
  body.insertAdjacentHTML("beforeend", `<p class="lead" style="margin-top:20px">Сеттинг: <b>${"Солёная Гавань"}</b>. ${WORLD_PUBLIC}</p>`);
}
function personality(sl1, sl2) {
  const a = sl1 < 35 ? "честный" : sl1 > 65 ? "хитрый" : "себе на уме"; const b = sl2 < 35 ? "осторожный" : sl2 > 65 ? "безрассудный" : "рассудительный";
  return `${a}, ${b}`;
}
function templateStory() {
  const r = RACES[D.race]?.name || "Путник"; const c = CLASSES[D.cls]?.name?.toLowerCase() || "искатель"; const b = BACKGROUNDS[D.bg];
  return `${r}-${c}${b ? `, в прошлом ${b.name.toLowerCase()}` : ""}. ${b ? "Вы " + b.hook + "." : ""} Люди говорят, что вы ${personality(D.sl1, D.sl2)}. ${D.about ? D.about.trim() : "О прошлом вы рассказываете неохотно."}`;
}
async function writeBackstory(btn, st) {
  const sample = await getSample();
  if (!sample) { D.story = templateStory(); D.epithet = ""; st.textContent = "ИИ недоступен — история собрана по шаблону."; renderHeroCard(); return; }
  btn.disabled = true; st.textContent = "Рассказчик пишет…";
  try {
    const r = await sample.json(`Ты пишешь короткую предысторию героя для настольной ролевой игры в мрачном прибрежном фэнтези. Пиши по-русски, 3 предложения, от второго лица («ты»), без клише про «избранного». Добавь прозвище из 2–3 слов.
Герой: ${D.name || "без имени"} (${D.gender === "f" ? "женщина" : "мужчина"}), раса ${RACES[D.race]?.name}, класс ${CLASSES[D.cls]?.name}, предыстория ${BACKGROUNDS[D.bg]?.name}: ${BACKGROUNDS[D.bg]?.hook}. Характер: ${personality(D.sl1, D.sl2)}. От игрока: ${D.about || "—"}.
Мир: ${WORLD_PUBLIC}
Свяжи историю с деревней Солёная Гавань одним намёком.
Ответь только JSON: {"epithet": "…", "story": "…"}`, { modelTier: "quick", cache: false });
    D.story = String(r.story || "").slice(0, 600); D.epithet = String(r.epithet || "").slice(0, 40); st.textContent = "Готово. Можно сочинить заново.";
  } catch (e) { D.story = templateStory(); st.textContent = e.code === "not_granted" ? "Доступ к ИИ не разрешён — история по шаблону." : "Не получилось — история собрана по шаблону."; }
  btn.disabled = false; renderHeroCard();
}
function renderHeroCard() {
  const el = document.getElementById("hero-card"); const sc = draftScores();
  const cls = D.cls ? CLASSES[D.cls] : null; el.style.setProperty("--cls", cls ? cls.color : "var(--lantern)");
  const hp = D.cls && D.race ? maxHP(D.cls, D.race, sc, 1) : "—"; const ac = D.cls ? calcAC(D.cls, sc) : "—";
  el.innerHTML = `<div class="inner"><div class="art">${portraitSVG(D.cls, D.race, D.name, D.gender)}<span class="lvl">Уровень 1</span></div>
  <div class="body"><div><div class="nm">${esc(D.name.trim() || "Безымянный")}</div>${D.epithet ? `<div class="ep">${esc(D.epithet)}</div>` : ""}<div class="sub">${D.race ? RACES[D.race].name : "Раса не выбрана"} · ${cls ? cls.name : "класс не выбран"}${D.bg ? " · " + BACKGROUNDS[D.bg].name : ""}</div></div>
  <div class="vitals"><div>HP <b>${hp}</b></div><div>КД <b>${ac}</b></div><div>Иниц. <b>${fmt(mod(sc.dex))}</b></div></div>
  <div class="mini-stats">${ABIL.map(a => `<div><b>${fmt(mod(sc[a]))}</b><small>${ABIL_RU[a]} ${sc[a]}</small></div>`).join("")}</div>
  ${D.skills.length || D.bg || D.race ? `<div class="sub">Навыки: ${draftSkills().map(k => SKILLS[k][0]).join(", ") || "—"}</div>` : ""}
  <p class="story">${esc(D.story || (D.race && D.cls ? templateStory() : "Выберите расу и класс — карточка соберётся сама."))}</p></div></div>`;
}
function finishCreation() {
  const sc = draftScores(); const cls = CLASSES[D.cls]; const hp = maxHP(D.cls, D.race, sc, 1);
  const slots = {}; Object.entries(slotsFor(D.cls, 1)).forEach(([l, n]) => slots[l] = [n, n]);
  const char = { name: D.name.trim(), gender: D.gender, race: D.race, cls: D.cls, bg: D.bg, level: 1, xp: 0, scores: sc, skills: draftSkills(),
    hp, maxHp: hp, ac: calcAC(D.cls, sc), hitDice: 1, slots, spells: cls.spells || [], weapons: cls.weapons.slice(), secondWind: D.cls === "fighter",
    items: [...cls.items.map(n => ({ name: n })), { name: "Зелье лечения", potion: true }, { name: "Факел" }, { name: "Верёвка, 15 м" }],
    gold: 10, epithet: D.epithet, story: D.story || templateStory(), persona: personality(D.sl1, D.sl2), about: D.about };
  const enemies = {}; Object.entries(ENEMIES).forEach(([id, E]) => enemies[id] = { hp: E.hp, alive: true, asleep: false });
  const npcs = {}; Object.keys(NPCS).forEach(id => npcs[id] = { att: 0, mem: [] });
  S = { v: 1, char, mode: D.mode, secondChance: D.mode === "sandbox", dying: null, dead: false, log: [], feed: [], turn: 0,
    world: { loc: "tavern", visited: ["tavern"], seen: [], enemies, npcs, combat: false, facts: [], quest: "Узнать, почему горел маяк в ночь крушения «Серебряной чайки».", flags: {} },
    suggestions: [] };
  reveal(POIS.tavern.x, POIS.tavern.y, 3);
  startGame(true);
}

/* =========================================================================
   SVG ART — гербы, портреты НПС, кубик
   ========================================================================= */
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const EMBLEM = {
  fighter: '<path d="M50 14 L56 20 L56 62 L50 70 L44 62 L44 20 Z" fill="currentColor"/><rect x="32" y="62" width="36" height="6" rx="2" fill="currentColor"/><rect x="47" y="68" width="6" height="16" rx="2" fill="currentColor"/><circle cx="50" cy="88" r="4" fill="currentColor"/>',
  rogue: '<path d="M30 24 L58 68 L54 72 L26 28 Z" fill="currentColor"/><path d="M70 24 L42 68 L46 72 L74 28 Z" fill="currentColor" opacity=".75"/><rect x="47" y="70" width="6" height="12" rx="2" transform="rotate(-33 50 76)" fill="currentColor"/><circle cx="50" cy="48" r="5" fill="none" stroke="currentColor" stroke-width="3"/>',
  wizard: '<path d="M50 14 L57 38 L82 38 L62 53 L70 78 L50 63 L30 78 L38 53 L18 38 L43 38 Z" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="48" r="7" fill="currentColor"/>',
  cleric: '<circle cx="50" cy="50" r="14" fill="currentColor"/><g stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M50 18v10M50 72v10M18 50h10M72 50h10M27 27l7 7M66 66l7 7M73 27l-7 7M34 66l-7 7"/></g>'
};
function emblemSVG(cls, size) {
  const c = CLASSES[cls]; return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" style="color:${c.color}" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="2" opacity=".5"/>${EMBLEM[cls]}</svg>`;
}
function portraitSVG(cls, race, name, gender) {
  const col = cls ? CLASSES[cls].color : "#f0b35a"; const h = hash((name || "") + race + cls);
  const ini = (String(name || "").trim()[0] || "?").toUpperCase();
  const stars = Array.from({ length: 18 }, (_, i) => { const x = (h >> (i % 24)) % 400 + (i * 37) % 400; const y = (i * 53 + (h % 97)) % 160; return `<circle cx="${x % 400}" cy="${y}" r="${1 + (i % 3) * .5}" fill="#e7ede8" opacity="${.2 + (i % 4) * .12}"/>`; }).join("");
  const raceMark = { elf: '<path d="M160 150 l-26 -40 l16 42 Z M240 150 l26 -40 l-16 42 Z" fill="#e7ede8" opacity=".55"/>', dwarf: '<path d="M170 250 q30 60 60 0 q-30 25 -60 0Z" fill="#e7ede8" opacity=".35"/>', halfling: '<circle cx="200" cy="300" r="70" fill="none" stroke="#e7ede8" stroke-opacity=".2" stroke-width="2"/>', human: "" }[race] || "";
  return `<svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Герб героя">
  <defs><radialGradient id="pg${h}" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="${col}" stop-opacity=".55"/><stop offset=".55" stop-color="#122126"/><stop offset="1" stop-color="#0c1619"/></radialGradient>
  <linearGradient id="sea${h}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b3139"/><stop offset="1" stop-color="#0c1619"/></linearGradient></defs>
  <rect width="400" height="320" fill="url(#pg${h})"/>${stars}
  <path d="M0 250 Q60 236 120 248 T240 246 T400 244 V320 H0Z" fill="url(#sea${h})"/>
  <path d="M0 262 Q80 252 160 262 T320 258 T400 260" stroke="${col}" stroke-opacity=".35" fill="none"/>
  ${raceMark}
  <g transform="translate(140 70) scale(1.2)" style="color:${col}">
    <path d="M50 4 L92 20 V52 C92 78 72 94 50 100 C28 94 8 78 8 52 V20 Z" fill="#0c1619" fill-opacity=".72" stroke="currentColor" stroke-width="2.5"/>
    <g transform="translate(14 14) scale(.72)">${cls ? EMBLEM[cls] : ""}</g>
  </g>
  <text x="200" y="300" text-anchor="middle" font-family="Cormorant, Georgia, serif" font-size="30" font-weight="700" fill="#e7ede8" opacity=".9">${esc(ini)}</text>
  </svg>`;
}
function npcSVG(id, big) {
  const n = NPCS[id]; const h = hash(id); const hue = n.hue; const sk = `hsl(${25 + (h % 10)}, 35%, ${48 + (h % 12)}%)`;
  const hair = id === "marta" ? "hsl(16, 70%, 45%)" : id === "ost" ? "hsl(210, 6%, 70%)" : id === "brenn" ? "hsl(30, 30%, 22%)" : "hsl(40, 10%, 82%)";
  const coat = `hsl(${hue}, 32%, 30%)`;
  const extra = id === "ilva" ? `<path d="M64 76 q36 -26 72 0 v20 q-36 -14 -72 0z" fill="hsl(200,8%,62%)"/><path d="M70 150 l60 0" stroke="hsl(205,55%,55%)" stroke-width="6"/>`
    : id === "brenn" ? `<circle cx="100" cy="182" r="5" fill="#f0b35a"/><path d="M72 160 l28 22 l28 -22" stroke="#f0b35a" stroke-width="3" fill="none"/>`
    : id === "ost" ? `<path d="M74 118 q26 18 52 0" stroke="hsl(210,6%,60%)" stroke-width="7" fill="none" opacity=".7"/>`
    : `<path d="M62 92 q38 -46 76 0 q0 18 -6 28 q-32 -30 -64 0 q-6 -10 -6 -28z" fill="${hair}"/>`;
  return `<svg viewBox="0 0 200 ${big ? 230 : 200}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Портрет: ${n.name}">
  <defs><radialGradient id="nb${id}" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="hsl(${hue},40%,32%)"/><stop offset="1" stop-color="#0c1619"/></radialGradient></defs>
  <rect width="200" height="${big ? 230 : 200}" fill="url(#nb${id})"/>
  <path d="M28 ${big ? 230 : 200} q8 -60 72 -66 q64 6 72 66z" fill="${coat}"/>
  <rect x="88" y="120" width="24" height="22" fill="${sk}"/>
  <ellipse cx="100" cy="98" rx="34" ry="40" fill="${sk}"/>
  ${id !== "marta" && id !== "ilva" ? `<path d="M66 90 q34 -40 68 0 q-2 -22 -34 -28 q-32 6 -34 28z" fill="${hair}"/>` : ""}
  ${extra}
  <ellipse cx="87" cy="100" rx="3.5" ry="2.5" fill="#1a1a1a"/><ellipse cx="113" cy="100" rx="3.5" ry="2.5" fill="#1a1a1a"/>
  <path d="M90 120 q10 ${id === "marta" ? 7 : id === "brenn" ? 4 : -2} 20 0" stroke="#3a1f18" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}
const D20SVG = '<svg viewBox="0 0 52 52" aria-hidden="true"><path d="M26 2 L48 14 L48 38 L26 50 L4 38 L4 14 Z" fill="var(--shoal)" stroke="currentColor" stroke-width="2"/><path d="M26 2 L14 32 L38 32 Z M14 32 L4 14 M38 32 L48 14 M14 32 L26 50 L38 32 M4 38 L14 32 M48 38 L38 32" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/></svg>';

/* =========================================================================
   MAP — процедурный рельеф, туман войны, точки интереса
   ========================================================================= */
function coast(y) { return 2 + Math.round(Math.sin(y * .55 + 1)); }
function terrain(x, y) {
  if (y === 13 && x < 12) return "sea";
  if (y === 12 && x < 4) return "sea";
  if (x < coast(y)) return "sea";
  if (x === coast(y) || (y === 12 && x < 9) || (y === 13 && x < 14)) return "sand";
  if ((x >= 15 && y <= 3) || (x >= 16 && y >= 10)) return "rock";
  if (x >= 18 && y >= 9) return "rock";
  if (y <= 3 && x >= 6 && x <= 13) return "forest";
  if (x === 19 && y >= 4 && y <= 9) return "sea";
  return "grass";
}
const ROAD = new Set();
(function buildRoads() {
  const hub = [10, 7];
  const L = (a, b) => { let [x, y] = a; while (x !== b[0]) { ROAD.add(x + "," + y); x += Math.sign(b[0] - x); } while (y !== b[1]) { ROAD.add(x + "," + y); y += Math.sign(b[1] - y); } ROAD.add(x + "," + y); };
  Object.values(POIS).forEach(p => L(hub, [p.x, p.y]));
})();
const HOUSES = [[7, 6], [8, 9], [11, 8], [6, 8], [12, 7], [10, 5], [13, 6], [7, 10]];
function reveal(cx, cy, r) {
  const seen = new Set(S.world.seen);
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) seen.add(x + "," + y);
  S.world.seen = [...seen];
}
let mapSel = null;
function drawMap() {
  const cv = document.getElementById("map"); if (!cv) return;
  const wrap = cv.parentElement; const W = wrap.clientWidth || 320; const t = W / MAP_W; const H = t * MAP_H;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + "px";
  const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const seen = new Set(S.world.seen);
  const pal = { sea: ["#123547", "#14394c"], sand: ["#8b7a55", "#94825c"], grass: ["#2f4a35", "#33503a"], forest: ["#1d3a2a", "#21402e"], rock: ["#4a4f50", "#545a5b"] };
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    const tt = terrain(x, y); const h = hash(x * 31 + "," + y);
    g.fillStyle = pal[tt][h % 2]; g.fillRect(x * t, y * t, t + .5, t + .5);
    if (tt === "sea") { g.strokeStyle = "rgba(160,210,230,.13)"; g.lineWidth = 1; g.beginPath(); const yy = y * t + t * (.35 + (h % 5) * .08); g.moveTo(x * t + t * .15, yy); g.quadraticCurveTo(x * t + t * .5, yy - t * .12, x * t + t * .85, yy); g.stroke(); }
    if (tt === "forest") { g.fillStyle = "#16301f"; for (let k = 0; k < 2; k++) { const px = x * t + t * (.3 + k * .4), py = y * t + t * (.35 + ((h >> k) % 3) * .15); g.beginPath(); g.moveTo(px, py - t * .28); g.lineTo(px + t * .2, py + t * .18); g.lineTo(px - t * .2, py + t * .18); g.closePath(); g.fill(); } }
    if (tt === "rock") { g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.arc(x * t + t * .4, y * t + t * .55, t * .22, 0, 7); g.fill(); }
    if (tt === "grass" && h % 7 === 0) { g.fillStyle = "rgba(124,199,156,.12)"; g.fillRect(x * t + t * .3, y * t + t * .4, 2, 4); }
  }
  g.strokeStyle = "rgba(196,170,120,.55)"; g.lineWidth = Math.max(2, t * .16); g.lineCap = "round";
  ROAD.forEach(k => { const [x, y] = k.split(",").map(Number); if (terrain(x, y) === "sea") return; g.beginPath(); g.moveTo(x * t + t / 2, y * t + t / 2);
    [[1, 0], [0, 1]].forEach(([dx, dy]) => { if (ROAD.has((x + dx) + "," + (y + dy))) { g.moveTo(x * t + t / 2, y * t + t / 2); g.lineTo((x + dx) * t + t / 2, (y + dy) * t + t / 2); } }); g.stroke(); });
  g.fillStyle = "#5a4630"; g.fillRect(0, POIS.pier.y * t + t * .38, (POIS.pier.x) * t, t * .24);
  HOUSES.forEach(([x, y]) => { g.fillStyle = "#6b5a46"; g.fillRect(x * t + t * .2, y * t + t * .35, t * .6, t * .45); g.fillStyle = "#8a3e2c"; g.beginPath(); g.moveTo(x * t + t * .1, y * t + t * .4); g.lineTo(x * t + t * .5, y * t + t * .1); g.lineTo(x * t + t * .9, y * t + t * .4); g.fill(); });
  // fog
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    if (seen.has(x + "," + y)) continue;
    let edge = 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { if (seen.has((x + a) + "," + (y + b))) edge++; });
    g.fillStyle = edge ? "rgba(9,16,19,.62)" : "rgba(9,16,19,.86)"; g.fillRect(x * t, y * t, t + .5, t + .5);
  }
  // POIs
  Object.entries(POIS).forEach(([id, p]) => {
    const cx = p.x * t + t / 2, cy = p.y * t + t / 2; const here = S.world.loc === id; const known = seen.has(p.x + "," + p.y);
    if (id === "lighthouse") { const grd = g.createRadialGradient(cx, cy - t * .3, 0, cx, cy - t * .3, t * 2.4); grd.addColorStop(0, "rgba(240,179,90,.45)"); grd.addColorStop(1, "rgba(240,179,90,0)"); g.fillStyle = grd; g.beginPath(); g.arc(cx, cy - t * .3, t * 2.4, 0, 7); g.fill(); }
    g.beginPath(); g.arc(cx, cy, t * .42, 0, 7); g.fillStyle = known ? "#0c1619" : "rgba(12,22,25,.7)"; g.fill();
    g.lineWidth = here ? 2.5 : 1.5; g.strokeStyle = here ? "#f0b35a" : mapSel === id ? "#e7ede8" : known ? "#9db2b0" : "#4d6463"; g.stroke();
    g.fillStyle = known ? "#e7ede8" : "#6f8886"; g.font = `700 ${Math.max(9, t * .42)}px Manrope, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(known || S.world.visited.includes(id) ? ({ house: "⌂", pier: "≈", chapel: "✝", wreck: "✕", forest: "♣", tower: "♜", cave: "◖" }[p.kind] || "•") : "?", cx, cy + 1);
    if (here) { g.beginPath(); g.arc(cx, cy, t * .7, 0, 7); g.strokeStyle = "rgba(240,179,90,.5)"; g.lineWidth = 1.5; g.setLineDash([3, 3]); g.stroke(); g.setLineDash([]); }
  });
  g.font = `600 ${Math.max(9, t * .36)}px Manrope, sans-serif`; g.textAlign = "left"; g.fillStyle = "rgba(231,237,232,.55)";
  g.fillText("Холодное море", t * .3, t * 4.2);
}
function mapClick(ev) {
  const cv = ev.currentTarget; const r = cv.getBoundingClientRect(); const t = r.width / MAP_W;
  const x = (ev.clientX - r.left) / t, y = (ev.clientY - r.top) / t;
  let best = null, bd = 1.3;
  Object.entries(POIS).forEach(([id, p]) => { const d = Math.hypot(p.x + .5 - x, p.y + .5 - y); if (d < bd) { bd = d; best = id; } });
  mapSel = best; renderWorld();
}

/* =========================================================================
   GAME UI
   ========================================================================= */
let sheetTab = "act";
function startGame(fresh) {
  document.getElementById("screen-create").hidden = true; document.getElementById("screen-game").hidden = false;
  renderAll(); if (fresh) { S.feed = []; renderFeed(); takeTurn("[НАЧАЛО КАМПАНИИ]", { checks: [], intro: true }); }
  else { renderFeed(); scrollFeed(); if (S.dying) renderDeath(); }
  initSample();
}
function renderAll() { renderTop(); renderSheet(); renderWorld(); renderSugg(); }
function renderTop() {
  document.getElementById("top-loc").textContent = POIS[S.world.loc].name + (S.world.combat ? " · бой" : "");
  document.getElementById("pill-mode").textContent = "Режим: " + MODES[S.mode].name;
}
function renderSheet() {
  const c = C(); const cls = CLASSES[c.cls]; const el = document.getElementById("sheet"); el.style.setProperty("--cls", cls.color);
  const hpP = c.hp / c.maxHp; const hpCol = hpP > .5 ? "var(--kelp)" : hpP > .25 ? "var(--lantern)" : "var(--ember)";
  const canLevel = c.level === 1 && c.xp >= 300;
  let html = `<div class="who"><div class="pt">${portraitSVG(c.cls, c.race, c.name, c.gender)}</div><div><div class="nm">${esc(c.name)}</div>${c.epithet ? `<div class="sub" style="color:var(--lantern);font-style:italic">${esc(c.epithet)}</div>` : ""}<div class="sub">${RACES[c.race].name} · ${cls.name} · ур. ${c.level}</div></div></div>
  ${canLevel ? `<button class="levelup" type="button" id="btn-lvl">Новый уровень! Повысить до 2-го</button>` : ""}
  <div class="hp-block"><div class="row"><span class="eyebrow">Хиты</span><span class="hpn">${c.hp}<small> / ${c.maxHp}</small></span></div><div class="bar hp-bar"><i style="width:${hpP * 100}%;background:${hpCol}"></i></div>
  <div class="bar" style="height:4px;margin-top:4px"><i style="width:${Math.min(100, c.xp / 3)}%;background:var(--lantern)"></i></div><div class="xp-row"><span>Опыт ${c.xp} / ${c.level === 1 ? 300 : 900}</span><span>${c.gold} зм</span></div></div>
  <div class="vit"><div><b>${c.ac}</b><small>КД</small></div><div><b>${fmt(mod(c.scores.dex))}</b><small>ИНИЦ.</small></div><div><b>${RACES[c.race].speed}</b><small>СКОР.</small></div><div><b>${fmt(prof(c.level))}</b><small>МАСТ.</small></div></div>
  <div class="abil6">${ABIL.map(a => `<div title="${ABIL_FULL[a]}${cls.saves.includes(a) ? " · владение спасброском" : ""}">${cls.saves.includes(a) ? '<span class="sv"></span>' : ""}<b>${fmt(mod(c.scores[a]))}</b><small>${ABIL_RU[a]}</small><div class="sc">${c.scores[a]}</div></div>`).join("")}</div>`;
  if (cls.spells) html += `<div class="slots"><span class="eyebrow">Ячейки заклинаний</span>${Object.entries(c.slots).map(([l, [mx, cur]]) => `<div class="slot-row"><span>${l} круг</span><span class="pips">${Array.from({ length: mx }, (_, i) => `<span class="pip ${i < cur ? "full" : ""}"></span>`).join("")}</span><span class="num">${cur}/${mx}</span></div>`).join("")}<div class="slot-row"><span>Заговоры</span><span>без ограничений</span></div></div>`;
  html += `<div class="tabs" role="tablist">${[["act", "Действия"], ["skills", "Навыки"], ["inv", "Инвентарь"]].map(([k, t]) => `<button type="button" role="tab" data-tab="${k}" aria-selected="${sheetTab === k}">${t}</button>`).join("")}</div><div class="tab-body" id="tab-body"></div>`;
  el.innerHTML = html;
  el.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { sheetTab = b.dataset.tab; renderSheet(); });
  if (canLevel) el.querySelector("#btn-lvl").onclick = levelUp;
  const tb = el.querySelector("#tab-body"); const foes = aliveEnemiesHere(); const tgt = foes[0];
  if (sheetTab === "act") {
    c.weapons.forEach(wid => { const a = weaponAtk(wid); tb.append(actBtn(`Атака: ${a.w.name}`, `${fmt(a.bonus)} к попаданию · ${a.w.dice}${fmt(a.dmgMod)}`, tgt ? `→ ${ENEMIES[tgt].name}` : "нет цели", !tgt || busy,
      () => takeTurn(`Атакую ${ENEMIES[tgt].name.toLowerCase()} (${a.w.name.toLowerCase()})`, { checks: [{ kind: "attack", target: tgt, weapon: wid, reason: "Атака оружием" }] }))); });
    (c.spells || []).forEach(sid => { const sp = SPELLS[sid]; const self = sp.kind === "heal"; const lvlOk = !sp.lvl || (c.slots[sp.lvl] && c.slots[sp.lvl][1] > 0);
      const needT = !self && sp.kind !== "sleep";
      tb.append(actBtn(sp.name, sp.desc, sp.lvl ? `${sp.lvl} круг` : "заговор", busy || !lvlOk || (needT && !tgt) || (sp.kind === "sleep" && !foes.length),
        () => takeTurn(`Применяю «${sp.name}»${needT ? " на " + ENEMIES[tgt].name.toLowerCase() : self ? " на себя" : ""}`, { checks: [{ kind: "spell", spell: sid, target: needT ? tgt : null, reason: sp.desc }] }))); });
    if (c.cls === "fighter") tb.append(actBtn("Второе дыхание", "Восстановить 1d10 + уровень HP", c.secondWind ? "1 раз" : "потрачено", busy || !c.secondWind || c.hp >= c.maxHp, () => {
      const d = rollDice("1d10"); const got = healHero(d.total + c.level); c.secondWind = false; pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · Второе дыхание (${d.text} +${c.level})` }] }); after(); }));
    tb.append(actBtn("Короткий отдых", "Потратить кость хитов: 1d" + cls.hd + fmt(mod(c.scores.con)), `костей: ${c.hitDice}`, busy || S.world.combat || c.hitDice < 1 || c.hp >= c.maxHp, shortRest));
    tb.append(actBtn("Долгий отдых", POIS[S.world.loc].rest ? "Полное восстановление" : "Только в таверне или часовне", "8 часов", busy || S.world.combat || !POIS[S.world.loc].rest, longRest));
  } else if (sheetTab === "skills") {
    Object.keys(SKILLS).sort((a, b) => SKILLS[a][0].localeCompare(SKILLS[b][0], "ru")).forEach(k => {
      tb.insertAdjacentHTML("beforeend", `<div class="sk ${c.skills.includes(k) ? "pro" : ""}"><span>${SKILLS[k][0]} <small style="color:var(--dim)">${ABIL_RU[SKILLS[k][1]]}</small></span><span class="b">${fmt(skillBonus(k))}</span></div>`);
    });
    tb.insertAdjacentHTML("beforeend", `<div class="sk"><span>Пассивная Внимательность</span><span class="b">${10 + skillBonus("perception")}</span></div>`);
  } else {
    c.items.forEach((it, i) => {
      if (it.potion) tb.append(actBtn(it.name, "Восстанавливает 2d4+2 HP", "выпить", busy || c.hp >= c.maxHp, () => {
        const d = rollDice("2d4+2"); const got = healHero(d.total); c.items.splice(i, 1); pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · ${it.name} (${d.text})` }] }); after(); }));
      else tb.insertAdjacentHTML("beforeend", `<div class="sk"><span>${esc(it.name)}</span><span class="b" style="color:var(--dim)">${it.desc ? esc(it.desc).slice(0, 26) : ""}</span></div>`);
    });
    tb.insertAdjacentHTML("beforeend", `<p class="empty" style="margin-top:8px">${esc(c.story)}</p>`);
  }
}
function actBtn(t, d, k, dis, fn) {
  const b = document.createElement("button"); b.type = "button"; b.className = "act"; b.disabled = !!dis;
  b.innerHTML = `<span><span class="t">${esc(t)}</span><span class="d">${esc(d)}</span></span><span class="k">${esc(k)}</span>`; b.onclick = fn; return b;
}
function attLabel(v) { return v >= 25 ? ["доверяет", "pos"] : v >= 8 ? ["дружелюбно", "pos"] : v <= -25 ? ["враждебно", "neg"] : v <= -8 ? ["настороженно", "neg"] : ["нейтрально", "neu"]; }
function renderWorld() {
  const el = document.getElementById("world"); const loc = POIS[S.world.loc];
  const sel = mapSel && mapSel !== S.world.loc ? POIS[mapSel] : null;
  el.innerHTML = `<div class="mapwrap"><canvas id="map" aria-label="Карта Солёной Гавани"></canvas>${sel ? `<div class="map-tip"><div class="t"><b>${sel.name}</b><small>${sel.short}</small></div><button class="btn small primary" type="button" id="go-sel" ${busy || S.world.combat ? "disabled" : ""}>Идти</button></div>` : ""}</div>
  <div class="card"><div class="eyebrow">Вы здесь</div><h3>${loc.name}</h3><p>${loc.desc}</p></div>
  ${S.world.combat ? `<div><div class="section-t"><span class="eyebrow" style="color:var(--ember)">Бой</span></div><div style="display:flex;flex-direction:column;gap:6px">${Object.keys(ENEMIES).filter(id => ENEMIES[id].loc === S.world.loc).map(id => { const e = S.world.enemies[id]; const E = ENEMIES[id]; return `<div class="foe ${e.alive ? "" : "dead"}"><div class="row"><b>${E.name}</b><span>КД ${E.ac} · ${enemyStatus(id)}</span></div><div class="bar" style="height:5px"><i style="width:${e.hp / E.hp * 100}%;background:var(--ember)"></i></div></div>`; }).join("")}</div></div>` : ""}
  <div><div class="section-t"><span class="eyebrow">Здесь</span></div><div id="npc-list"></div></div>
  <div class="card" style="background:transparent"><div class="eyebrow">Задание</div><p style="color:var(--foam);margin-top:4px">${esc(S.world.quest)}</p></div>
  <div><div class="section-t"><span class="eyebrow">Летопись · память рассказчика</span><span class="num" style="color:var(--dim);font-size:11px">${S.world.facts.length}</span></div>${S.world.facts.length ? `<ol class="chron">${S.world.facts.slice(-8).map(f => `<li>${esc(f)}</li>`).join("")}</ol>` : `<p class="empty">Здесь появятся важные факты, которые рассказчик запомнит.</p>`}</div>`;
  const list = el.querySelector("#npc-list");
  if (!loc.npcs.length) list.innerHTML = `<p class="empty">Ни души. Только ветер.</p>`;
  loc.npcs.forEach(id => {
    const n = NPCS[id]; const [lab, cl] = attLabel(S.world.npcs[id].att);
    const b = document.createElement("button"); b.type = "button"; b.className = "npc-row";
    b.innerHTML = `<span class="pt">${npcSVG(id)}</span><span class="t"><b>${n.name}</b><small>${n.role}</small></span><span class="att ${cl}">${lab}</span>`;
    b.onclick = () => { const inp = document.getElementById("act-input"); inp.value = `Говорю с ${n.name === "Сестра Илва" ? "сестрой Илвой" : n.name.replace(/а$/, "ой").replace(/([^ой])$/, "$1ом")}: «»`; inp.focus(); inp.setSelectionRange(inp.value.length - 1, inp.value.length - 1); showTab("story"); };
    list.append(b);
  });
  const cv = el.querySelector("#map"); cv.onclick = mapClick;
  const go = el.querySelector("#go-sel"); if (go) go.onclick = () => { const p = mapSel; mapSel = null; takeTurn(`Иду: ${POIS[p].name}`, { checks: [], move_to: p }); };
  requestAnimationFrame(drawMap);
}
function renderSugg() {
  const s = document.getElementById("sugg"); s.innerHTML = "";
  const list = (S.suggestions || []).slice(0, 3);
  list.forEach(t => { const b = document.createElement("button"); b.type = "button"; b.textContent = t; b.disabled = busy; b.onclick = () => { if (!busy) takeTurn(t); }; s.append(b); });
}

/* ---------- feed ---------- */
function pushFeed(e) { S.feed.push(e); if (S.feed.length > 160) S.feed.splice(0, S.feed.length - 160); renderEntry(e, true); scrollFeed(); return e; }
function scrollFeed() { const f = document.getElementById("feed"); requestAnimationFrame(() => { f.scrollTop = f.scrollHeight; }); }
function renderFeed() { const fi = document.getElementById("feed-inner"); fi.innerHTML = ""; S.feed.forEach(e => renderEntry(e, false)); }
function narrHTML(text) {
  const t = esc(text).replace(/«([^»]{1,400})»/g, "<q>$1</q>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\*([^*]+)\*/g, "<i>$1</i>");
  return t.split(/\n{1,}/).filter(p => p.trim()).map(p => `<p>${p}</p>`).join("");
}
function renderEntry(e, fresh) {
  const fi = document.getElementById("feed-inner"); const d = document.createElement("div"); Object.defineProperty(e, "_el", { value: d, writable: true, configurable: true, enumerable: false });
  if (e.t === "narr") {
    d.className = "e-narr";
    const sp = e.speaker && NPCS[e.speaker] ? `<div class="speaker"><span class="pt">${npcSVG(e.speaker)}</span><span><b>${NPCS[e.speaker].name}</b><small>${NPCS[e.speaker].role}</small></span></div>` : "";
    d.innerHTML = sp + `<div class="tx ${e.first ? "e-first" : ""}">${narrHTML(e.text)}${e.streaming ? '<span class="caret"></span>' : ""}</div>`;
  } else if (e.t === "player") {
    d.className = "e-player"; d.innerHTML = `<div class="who-s">${esc(C().name)}</div>${esc(e.text)}`;
  } else if (e.t === "sys") {
    d.className = "e-sys"; d.innerHTML = e.html;
  } else if (e.t === "roll") {
    const r = e.r; const cls = r.enemyRoll ? "enemy " + (r.ok ? "fail" : "ok") : r.crit ? "crit" : r.ok ? "ok" : "fail";
    const v = r.skip ? "—" : r.enemyRoll ? (r.kind === "enemy" ? (r.crit ? "Крит по вам" : r.ok ? "Попадание" : "Промах") : (r.ok ? "Провал цели" : "Цель устояла")) : r.noslot ? "Нет ячеек" : r.crit ? "Критический успех" : r.fumble ? "Провал (1)" : r.ok ? (r.kind === "attack" || r.kind === "spell" ? "Попадание" : "Успех") : (r.kind === "attack" || r.kind === "spell" ? "Промах" : "Провал");
    d.className = "e-roll " + cls;
    d.innerHTML = `<div class="d20 ${fresh ? "spin" : ""}" style="color:${r.crit ? "var(--lantern)" : r.enemyRoll ? "var(--ember)" : "var(--mist)"}">${D20SVG}<span>${r.nat || "✦"}</span></div>
      <div class="info"><div class="ttl">${esc(r.title)}</div>${r.reason ? `<div class="why">${esc(r.reason)}</div>` : ""}<div class="formula">${esc(r.formula || "")}</div></div><div class="verdict">${v}</div>`;
  } else if (e.t === "chips") {
    d.className = "chips"; d.innerHTML = e.items.map(i => `<span class="chip ${i.c}">${esc(i.x)}</span>`).join("");
  } else if (e.t === "death") {
    d.className = "death"; d.innerHTML = e.html;
  }
  fi.append(d);
}
function updateNarr(e) {
  if (!e._el) return; const tx = e._el.querySelector(".tx");
  const sp = e.speaker && NPCS[e.speaker] && !e._el.querySelector(".speaker");
  if (sp) e._el.insertAdjacentHTML("afterbegin", `<div class="speaker"><span class="pt">${npcSVG(e.speaker)}</span><span><b>${NPCS[e.speaker].name}</b><small>${NPCS[e.speaker].role}</small></span></div>`);
  tx.innerHTML = narrHTML(e.text) + (e.streaming ? '<span class="caret"></span>' : "");
  const f = document.getElementById("feed"); if (f.scrollHeight - f.scrollTop - f.clientHeight < 220) f.scrollTop = f.scrollHeight;
}

/* =========================================================================
   NARRATOR — ИИ (через sample) + офлайн-запасной
   ========================================================================= */
let samplePromise = null, sampleFn = null, aiOff = false, busy = false, ctl = null;
function getSample() {
  if (aiOff) return Promise.resolve(null);
  if (!samplePromise) samplePromise = (window.claude && typeof window.claude.use === "function" ? window.claude.use("sample").catch(() => null) : Promise.resolve(null)).then(s => { sampleFn = s; return s; });
  return samplePromise;
}
async function initSample() {
  const s = await getSample(); setAIPill(!!s && !aiOff);
}
function setAIPill(on) {
  const p = document.getElementById("pill-ai"); p.classList.toggle("on", on); p.classList.toggle("off", !on);
  document.getElementById("pill-ai-t").textContent = on ? "Рассказчик: ИИ" : "Рассказчик: офлайн";
}
function aiFail(e) {
  const hard = ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"];
  if (hard.includes(e?.code)) { aiOff = true; setAIPill(false); return "ИИ-рассказчик недоступен в этом просмотре, дальше работает простой офлайн-рассказчик."; }
  if (e?.code === "rate_limited") return "ИИ временно перегружен. Этот ход рассказан офлайн, попробуйте следующий чуть позже.";
  return "Связь с ИИ прервалась. Этот ход рассказан офлайн.";
}
function charBrief() {
  const c = C(); return `${c.name} (${c.gender === "f" ? "она" : "он"}), ${RACES[c.race].name}, ${CLASSES[c.cls].name} ${c.level} ур., предыстория: ${BACKGROUNDS[c.bg].name} — ${BACKGROUNDS[c.bg].hook}. Характер: ${c.persona}. ${c.about ? "О себе: " + c.about : ""} HP ${c.hp}/${c.maxHp}, КД ${c.ac}. Навыки: ${c.skills.map(k => SKILLS[k][0]).join(", ")}. Предметы: ${c.items.map(i => i.name).join(", ")}, ${c.gold} зм.${c.spells.length ? " Заклинания: " + c.spells.map(s => SPELLS[s].name).join(", ") + ". Ячейки 1 круга: " + (c.slots[1] ? c.slots[1][1] : 0) + "." : ""}`;
}
function sceneBrief() {
  const loc = POIS[S.world.loc]; const L = S.world.loc;
  const npcs = loc.npcs.map(id => { const n = NPCS[id]; const st = S.world.npcs[id]; return `- [${id}] ${n.name}, ${n.role}; внешность: ${n.look}; характер: ${n.persona}; тайна (не выдавать сразу): ${n.secret}; отношение к герою: ${st.att} (${attLabel(st.att)[0]}); помнит: ${st.mem.slice(-4).join("; ") || "ничего"}`; }).join("\n");
  const foes = Object.keys(ENEMIES).filter(id => ENEMIES[id].loc === L).map(id => `- [${id}] ${ENEMIES[id].name}: ${enemyStatus(id)}`).join("\n");
  const pois = Object.entries(POIS).map(([id, p]) => `${id} = ${p.name}`).join("; ");
  return `ЛОКАЦИЯ: ${loc.name} [${L}] — ${loc.desc}
НПС здесь:
${npcs || "- никого"}
${foes ? "ВРАГИ в этой локации (появляются, только если герой их обнаружил или начался бой):\n" + foes : ""}
БОЙ: ${S.world.combat ? "идёт" : "нет"}
ТОЧКИ НА КАРТЕ: ${pois}`;
}
function recentLog(n) {
  return S.log.slice(-n).map(l => l.who === "p" ? `Игрок: ${l.text}` : `Рассказчик: ${l.text.slice(0, 500)}`).join("\n");
}
async function adjudicate(text) {
  const sample = await getSample();
  if (!sample) return offlineAdjudicate(text);
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
  catch (e) { const m = aiFail(e); pushFeed({ t: "sys", html: esc(m) }); return offlineAdjudicate(text); }
}
function validatePlan(plan) {
  const out = { checks: [], move_to: null, talk_to: null, notes: [] };
  if (!plan || typeof plan !== "object") return out;
  if (plan.move_to && POIS[plan.move_to] && plan.move_to !== S.world.loc) out.move_to = plan.move_to;
  if (plan.talk_to && NPCS[plan.talk_to]) out.talk_to = plan.talk_to;
  (Array.isArray(plan.checks) ? plan.checks : []).slice(0, 2).forEach(ch => {
    const adv = clamp(Number(ch.adv) || 0, -1, 1); const reason = String(ch.reason || "").slice(0, 120);
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
  if (/(ид[уё]|пойти|иду|отправ|направля|бегу|возвращ)/.test(t)) {
    const keys = { tavern: /таверн|якор/, pier: /пристан|причал|лодк/, elder: /старост|бренн/, chapel: /часовн|илв/, wreck: /крушен|обломк|чайк|отмел/, grove: /рощ|лес|сосн/, lighthouse: /маяк/, cave: /грот|пещер/ };
    for (const [id, re] of Object.entries(keys)) if (re.test(t)) { plan.move_to = id; break; }
  }
  const foe = aliveEnemiesHere()[0];
  if (/(атаку|бью|удар|руб|стрел|напада)/.test(t) && foe) plan.checks.push({ kind: "attack", target: foe, weapon: C().weapons[0], reason: "Атака" });
  else if (/(осматр|ищу|обыск|исслед|изуча|улик)/.test(t)) plan.checks.push({ kind: "skill", skill: "investigation", dc: 12, reason: "Поиск улик" });
  else if (/(прислуш|огляд|высматр|замеча)/.test(t)) plan.checks.push({ kind: "skill", skill: "perception", dc: 12, reason: "Внимательность" });
  else if (/(крад|тихо|скрыт|прячу|незамет)/.test(t)) plan.checks.push({ kind: "skill", skill: "stealth", dc: 13, reason: "Скрытность" });
  else if (/(убежд|уговар|прошу|договор)/.test(t)) plan.checks.push({ kind: "skill", skill: "persuasion", dc: 13, reason: "Убеждение" });
  else if (/(вру|обман|лгу)/.test(t)) plan.checks.push({ kind: "skill", skill: "deception", dc: 13, reason: "Обман" });
  else if (/(угрож|запуг)/.test(t)) plan.checks.push({ kind: "skill", skill: "intimidation", dc: 13, reason: "Запугивание" });
  for (const id of POIS[S.world.loc].npcs) if (t.includes(NPCS[id].name.toLowerCase().slice(0, 4))) plan.talk_to = id;
  return plan;
}

function waitRoll(ch) {
  return new Promise(res => {
    const slot = document.getElementById("roll-slot");
    const label = ch.kind === "skill" ? `${SKILLS[ch.skill][0]} · КС ${ch.dc}` : ch.kind === "save" ? `Спасбросок ${ABIL_FULL[ch.ability]} · КС ${ch.dc}` : ch.kind === "attack" ? `Атака: ${WEAPONS[ch.weapon].name} → ${ENEMIES[ch.target].name}` : `Заклинание: ${SPELLS[ch.spell].name}`;
    const bonus = ch.kind === "skill" ? skillBonus(ch.skill) : ch.kind === "save" ? saveBonus(ch.ability) : ch.kind === "attack" ? weaponAtk(ch.weapon).bonus : null;
    slot.innerHTML = `<div class="roll-cta"><div class="d20" style="color:var(--lantern)">${D20SVG}<span>20</span></div><div class="txt"><b>${esc(label)}</b><small>${esc(ch.reason || "Нужна проверка")}${bonus != null ? ` · ваш бонус ${fmt(bonus)}` : ""}${ch.adv > 0 ? " · с преимуществом" : ch.adv < 0 ? " · с помехой" : ""}</small></div><button class="btn primary" type="button" id="btn-roll">Бросить <span class="kbd">R</span></button></div>`;
    const go = () => { document.removeEventListener("keydown", key); slot.innerHTML = ""; res(); };
    const key = ev => { if ((ev.key === "r" || ev.key === "R" || ev.key === "к" || ev.key === "К") && document.activeElement?.id !== "act-input") { ev.preventDefault(); go(); } };
    document.addEventListener("keydown", key); slot.querySelector("#btn-roll").onclick = go; slot.querySelector("#btn-roll").focus();
  });
}

async function takeTurn(text, preset) {
  if (busy || S.dead) return; if (S.dying) { pushFeed({ t: "sys", html: "Сначала спасброски от смерти." }); return; }
  busy = true; setBusy(true); S.turnSneak = false; S.pendingXP = 0;
  const intro = preset && preset.intro;
  if (!intro) { pushFeed({ t: "player", text }); S.log.push({ who: "p", text }); }
  let thinking = null;
  try {
    let plan;
    if (preset) plan = validatePlan(preset);
    else { thinking = showThinking("Рассказчик обдумывает последствия"); plan = validatePlan(await adjudicate(text)); hideThinking(thinking); thinking = null; }
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
    if (S.world.combat && !intro) {
      const et = enemyTurn();
      for (const r of et) { results.push(r); pushFeed({ t: "roll", r }); if (r.dmg) pushFeed({ t: "chips", items: [{ c: "dmg", x: `−${r.dmg} HP вам` }] }); await pause(200); }
    }
    let combatEnded = false;
    if (S.world.combat && !aliveEnemiesHere().length) { S.world.combat = false; combatEnded = true; results.push({ kind: "combat_end", title: "Все враги повержены" }); }
    renderSheet(); renderWorld(); renderTop();
    // narrate
    const eff = await narrate(text, plan, results, intro);
    applyEffects(eff, combatEnded);
  } catch (err) {
    if (thinking) hideThinking(thinking);
    pushFeed({ t: "sys", html: "Что-то пошло не так в этом ходе. Попробуйте сформулировать действие иначе." });
    console.error(err);
  }
  S.turn++; busy = false; setBusy(false); checkDeath(); after();
}
function after() { renderAll(); save(); }
function pause(ms) { return new Promise(r => setTimeout(r, ms)); }
function setBusy(b) {
  document.getElementById("btn-send").disabled = b; document.getElementById("btn-stop").hidden = !b || !ctl;
  renderSheet(); renderSugg(); const go = document.getElementById("go-sel"); if (go) go.disabled = b || S.world.combat;
}
function showThinking(t) {
  const fi = document.getElementById("feed-inner"); const d = document.createElement("div"); d.className = "thinking";
  d.innerHTML = `<span class="dots"><i></i><i></i><i></i></span><span>${esc(t)}…</span>`; fi.append(d); scrollFeed(); return d;
}
function hideThinking(d) { d?.remove(); }
function moveTo(id) {
  S.world.loc = id; if (!S.world.visited.includes(id)) S.world.visited.push(id);
  const p = POIS[id]; reveal(p.x, p.y, id === "lighthouse" || id === "cave" ? 2 : 3);
  pushFeed({ t: "sys", html: `Вы приходите: <b>${esc(p.name)}</b>` }); renderWorld(); renderTop();
}

function resultsBrief(results) {
  if (!results.length) return "Бросков не было.";
  return results.map(r => {
    if (r.kind === "move") return `• ${r.title}.`;
    if (r.kind === "combat_end") return "• Все враги в локации повержены, бой окончен.";
    if (r.kind === "enemy") return `• ${r.title}: ${r.skip ? "спит" : r.ok ? (r.crit ? "критическое попадание" : "попадание") + ", герой ранен" : "промах"}.`;
    const what = r.ok ? (r.crit ? "КРИТИЧЕСКИЙ УСПЕХ" : "УСПЕХ") : (r.fumble ? "ПРОВАЛ (выпала 1)" : "ПРОВАЛ");
    return `• ${r.title}${r.reason ? " (" + r.reason + ")" : ""}: ${r.noslot ? "не хватило ячеек" : what}${r.enemyAfter ? `; цель теперь: ${r.enemyAfter}` : ""}${r.heal ? "; герой исцелён" : ""}.`;
  }).join("\n");
}
async function narrate(text, plan, results, intro) {
  const e = pushFeed({ t: "narr", text: "", streaming: true, speaker: plan.talk_to && POIS[S.world.loc].npcs.includes(plan.talk_to) ? plan.talk_to : null, first: intro });
  const sample = await getSample();
  if (!sample) { const r = offlineNarrate(text, plan, results, intro); e.text = r.text; e.streaming = false; e.speaker = r.speaker || e.speaker; updateNarr(e); S.log.push({ who: "n", text: r.text }); return r.eff; }
  const th = showThinking(intro ? "Рассказчик открывает книгу" : "Рассказчик пишет");
  e._el.hidden = true;
  const c = C();
  const prompt = `Ты — мастер (рассказчик) настольной ролевой игры по правилам 5e. Пиши по-русски, живо и конкретно, от второго лица («ты»), обращаясь к герою. ${MODES[S.mode].prompt}

МИР: ${WORLD_PUBLIC}
${PLOT_SECRET}
ГЕРОЙ: ${charBrief()}
${sceneBrief()}
ЗАДАНИЕ: ${S.world.quest}
ЛЕТОПИСЬ (что уже установлено, не противоречь): ${S.world.facts.slice(-14).join(" | ") || "пока ничего"}
НЕДАВНИЕ СОБЫТИЯ:
${recentLog(10) || "—"}

${intro ? `НАЧАЛО КАМПАНИИ. Утро после крушения. Герой в таверне «Кривой якорь». Опиши атмосферу, дай Марте заговорить с героем, свяжи завязку с предысторией героя и дай 2–3 зацепки (крушение, маяк, часовня). Не раскрывай секрет.` : `ДЕЙСТВИЕ ИГРОКА: «${text}»
РЕЗУЛЬТАТЫ ДВИЖКА (это истина, опиши именно их):
${resultsBrief(results)}`}

Правила письма:
- 90–180 слов, 2–3 абзаца. Реплики НПС в «ёлочках», у каждого свой голос.
- Не называй числа урона, HP и результаты кубиков — их покажет интерфейс. Не придумывай новых бросков.
- Провалы имеют последствия, успехи дают продвижение и улики. Раскрывай секрет только через заслуженные улики.
- Враги появляются только если герой пришёл туда, где они есть (маяк — ночью и днём там бродят утопленники; грот — контрабандисты), и тогда начинай бой через start_combat.
- Не решай за героя, что он делает дальше. Закончи на моменте выбора.

После текста поставь строку @@@ и затем ОДНУ строку JSON с последствиями (только то, что реально произошло в тексте):
{"speaker": "id НПС, который говорит больше всех, или null", "damage": [{"dice":"1d4","reason":"почему"}], "heal": null, "items_add": [{"name":"…","desc":"…"}], "items_remove": [], "gold": 0, "xp": 0, "attitude": {"id_нпс": 0}, "facts": ["1–2 важных новых факта для памяти, коротко"], "quest": null, "start_combat": [], "suggestions": ["3 коротких варианта следующего действия, до 6 слов"]}
damage — только если герой получил вред от окружения или ловушки (не от врагов, их урон уже посчитан). xp — 25–75 за важное открытие или решённую проблему, иначе 0. attitude — изменения от −15 до +15.`;
  ctl = new AbortController(); document.getElementById("btn-stop").hidden = false;
  let full = "";
  try {
    const r = await sample(prompt, { modelTier: "default", effort: "low", cache: false, signal: ctl.signal, onText: ({ text: t }) => {
      if (th.isConnected) { hideThinking(th); e._el.hidden = false; }
      full = t; e.text = t.split("@@@")[0].trim(); updateNarr(e);
    } });
    full = r.text;
  } catch (err) {
    hideThinking(th); e._el.hidden = false;
    if (err.code === "cancelled") { full = err.text || "…"; }
    else if (err.text) { full = err.text; }
    else { const m = aiFail(err); pushFeed({ t: "sys", html: esc(m) }); const o = offlineNarrate(text, plan, results, intro); e.text = o.text; e.streaming = false; updateNarr(e); S.log.push({ who: "n", text: o.text }); ctl = null; return o.eff; }
  }
  hideThinking(th); e._el.hidden = false; ctl = null; document.getElementById("btn-stop").hidden = true;
  const [body, tail] = full.split("@@@"); e.text = (body || "").trim() || "…"; e.streaming = false;
  let eff = {}; if (tail) { const m = tail.match(/\{[\s\S]*\}/); if (m) { try { eff = JSON.parse(m[0]); } catch (x) { eff = {}; } } }
  if (eff.speaker && NPCS[eff.speaker] && POIS[S.world.loc].npcs.includes(eff.speaker)) e.speaker = eff.speaker;
  updateNarr(e); S.log.push({ who: "n", text: e.text }); if (S.log.length > 80) S.log.splice(0, S.log.length - 80);
  if (e.speaker) popNPC(e.speaker);
  return eff;
}
function applyEffects(eff, combatEnded) {
  const c = C(); const chips = [];
  (Array.isArray(eff.damage) ? eff.damage : []).slice(0, 2).forEach(d => { const p = parseDice(d.dice); if (!p) return; p.n = Math.min(p.n, 3); const r = rollDice(p); hurtHero(r.total); chips.push({ c: "dmg", x: `−${r.total} HP · ${String(d.reason || "урон").slice(0, 40)} (${r.text})` }); });
  if (eff.heal) { const p = parseDice(eff.heal.dice || eff.heal); if (p) { const r = rollDice(p); const got = healHero(r.total); chips.push({ c: "heal", x: `+${got} HP` }); } }
  (Array.isArray(eff.items_add) ? eff.items_add : []).slice(0, 3).forEach(it => { const name = String(it.name || it).slice(0, 40); if (!name) return; c.items.push({ name, desc: String(it.desc || "").slice(0, 120), potion: /зелье лечения/i.test(name) }); chips.push({ c: "item", x: `+ ${name}` }); });
  (Array.isArray(eff.items_remove) ? eff.items_remove : []).slice(0, 3).forEach(n => { const i = c.items.findIndex(x => x.name.toLowerCase() === String(n).toLowerCase()); if (i >= 0) { chips.push({ c: "item", x: `− ${c.items[i].name}` }); c.items.splice(i, 1); } });
  const gold = clamp(Math.round(Number(eff.gold) || 0), -50, 100); if (gold && c.gold + gold >= 0) { c.gold += gold; chips.push({ c: "gold", x: `${gold > 0 ? "+" : ""}${gold} зм` }); }
  const xp = clamp(Math.round(Number(eff.xp) || 0), 0, 100) + (S.pendingXP || 0); if (xp) { c.xp += xp; chips.push({ c: "xp", x: `+${xp} опыта` }); }
  if (eff.attitude && typeof eff.attitude === "object") Object.entries(eff.attitude).forEach(([id, v]) => { if (!NPCS[id]) return; const dv = clamp(Math.round(Number(v) || 0), -15, 15); if (!dv) return; const st = S.world.npcs[id]; st.att = clamp(st.att + dv, -100, 100); chips.push({ c: "npc", x: `${NPCS[id].name}: ${dv > 0 ? "+" : ""}${dv} к отношению` }); });
  const loc = POIS[S.world.loc];
  (Array.isArray(eff.facts) ? eff.facts : []).slice(0, 3).forEach(f => { const s = String(f).trim().slice(0, 160); if (s && !S.world.facts.includes(s)) { S.world.facts.push(s); loc.npcs.forEach(id => S.world.npcs[id].mem.push(s)); } });
  if (S.world.facts.length > 40) S.world.facts.splice(0, S.world.facts.length - 40);
  loc.npcs.forEach(id => { const m = S.world.npcs[id].mem; if (m.length > 8) m.splice(0, m.length - 8); });
  if (eff.quest && typeof eff.quest === "string") { S.world.quest = eff.quest.slice(0, 200); chips.push({ c: "xp", x: "Задание обновлено" }); }
  const sc = (Array.isArray(eff.start_combat) ? eff.start_combat : []).filter(id => enemyHere(id));
  if (sc.length && !S.world.combat) {
    S.world.combat = true; const ini = rnd(20); const tot = ini + mod(c.scores.dex);
    pushFeed({ t: "roll", r: { kind: "init", title: "Инициатива", nat: ini, total: tot, ok: true, formula: `d20 (${ini}) ${fmt(mod(c.scores.dex))} = ${tot}`, reason: "Бой начался" } });
    pushFeed({ t: "sys", html: "<b>Бой!</b> Ваш ход: атакуйте из листа персонажа слева или опишите действие." });
  }
  if (combatEnded) pushFeed({ t: "sys", html: "<b>Бой окончен.</b>" });
  if (chips.length) pushFeed({ t: "chips", items: chips });
  S.suggestions = (Array.isArray(eff.suggestions) ? eff.suggestions : []).map(s => String(s).slice(0, 48)).filter(Boolean).slice(0, 3);
  if (!S.suggestions.length) S.suggestions = defaultSuggestions();
}
function defaultSuggestions() {
  if (S.world.combat) return ["Атакую ближайшего врага", "Отступаю к двери", "Осматриваюсь в поисках укрытия"];
  const loc = POIS[S.world.loc]; const s = ["Осматриваюсь внимательно"];
  if (loc.npcs[0]) s.push(`Расспрашиваю: ${NPCS[loc.npcs[0]].name}`);
  const unvisited = Object.keys(POIS).find(id => !S.world.visited.includes(id)); if (unvisited) s.push(`Иду: ${POIS[unvisited].name}`);
  return s;
}

/* offline narrator — template-based so the prototype always plays */
function offlineNarrate(text, plan, results, intro) {
  const loc = POIS[S.world.loc]; const c = C(); const eff = { facts: [], suggestions: [] };
  let out = [];
  if (intro) {
    out.push(`Утро пахнет мокрой золой и солью. В «Кривом якоре» тесно: рыбаки говорят вполголоса, и каждый второй косится в окно, туда, где на скале чернеет старый маяк.`);
    out.push(`Марта ставит перед тобой миску ухи и наклоняется ближе: «Ночью «Серебряная чайка» налетела на рифы. А маяк горел, понимаешь? Горел, хотя Хальвард пропал ещё в прошлом месяце». Ты ${BACKGROUNDS[c.bg].hook}, и эта история цепляет тебя сильнее, чем хотелось бы.`);
    eff.speaker = "marta"; eff.suggestions = ["Расспрашиваю Марту о маяке", "Иду к месту крушения", "Иду в часовню"]; eff.facts = ["Маяк горел в ночь крушения, хотя смотритель Хальвард пропал месяц назад"];
    return { text: out.join("\n\n"), eff, speaker: "marta" };
  }
  const mv = results.find(r => r.kind === "move"); if (mv) out.push(loc.desc);
  const sk = results.filter(r => r.kind === "skill" || r.kind === "save");
  sk.forEach(r => {
    if (r.ok) {
      const clue = { wreck: "На досках следы ломов, а среди ящиков кто-то обронил медную пуговицу с якорем, такие носят люди Рэйфа.", lighthouse: "В нише у лестницы ты находишь размокшую записку: «…огонь зажигают не мертвецы. Грот под скалой. — Х.»", pier: "Ост дёргается, когда ты упоминаешь маяк, и бросает взгляд на скалы к востоку.", chapel: "На балке звонницы свежие царапины: колокол сняли недавно и грубо.", elder: "На столе старосты лежит дорогой подсвечник, похожий на те, что везла «Чайка».", tavern: "Из разговоров ты понимаешь: в ночь крушения кто-то видел лодку без фонаря.", grove: "Следы сапог ведут к маяку и обратно, их не меньше четырёх пар.", cave: "Ты замечаешь у дальней стены тёмный силуэт колокола под мешковиной." }[S.world.loc];
      out.push(clue || "Тебе удаётся задуманное."); eff.facts.push(clue ? clue.slice(0, 150) : "");
      eff.xp = 25;
    } else out.push("Ничего не выходит: детали ускользают, а время уходит.");
  });
  results.filter(r => r.kind === "attack" || r.kind === "spell").forEach(r => out.push(r.ok ? `Удар достигает цели. Враг ${r.enemyAfter || "шатается"}.` : "Удар уходит в пустоту."));
  results.filter(r => r.kind === "enemy" && !r.skip).forEach(r => out.push(r.ok ? `${r.title.replace(" атакует", "")} достаёт тебя.` : `${r.title.replace(" атакует", "")} промахивается.`));
  if (results.some(r => r.kind === "combat_end")) out.push("Последний враг падает. Становится тихо, только море шумит внизу.");
  if (!out.length && plan.talk_to) {
    const lines = { marta: "«Спроси у Оста, где он был той ночью. Только мягко, он пугливый».", ost: "«Я рыбак. Я ничего не видел», — бормочет он, не поднимая глаз.", brenn: "«Крушение? Печально. Но лишний шум деревне не нужен», — улыбается он слишком широко.", ilva: "«Месяц назад из звонницы пропал Колокол Приливов. С тех пор море неспокойно», — шепчет она." };
    out.push(lines[plan.talk_to]); eff.speaker = plan.talk_to; eff.attitude = { [plan.talk_to]: 3 };
  }
  if (!out.length) out.push(`Ты делаешь задуманное. ${loc.short}. Вокруг тихо, но в этой тишине что-то ждёт.`);
  if ((S.world.loc === "lighthouse" || S.world.loc === "cave") && mv && aliveEnemiesHere().length) {
    out.push(S.world.loc === "lighthouse" ? "Из темноты лестницы поднимаются две фигуры, с них стекает вода. Одна в истлевшей куртке смотрителя." : "Голоса смолкают. «Гости», — тянет высокий человек с серьгой. Это Рэйф. Его люди уже тянутся к оружию.");
    eff.start_combat = aliveEnemiesHere();
  }
  eff.facts = eff.facts.filter(Boolean);
  return { text: out.join("\n\n"), eff, speaker: eff.speaker };
}

/* ---------- NPC portrait pop ---------- */
let popT = null;
function popNPC(id) {
  const p = document.getElementById("npc-pop"); const n = NPCS[id];
  p.innerHTML = `${npcSVG(id, true)}<div class="cap"><b>${n.name}</b><small>${n.role} · ${attLabel(S.world.npcs[id].att)[0]}</small></div>`;
  p.classList.add("show"); clearTimeout(popT); popT = setTimeout(() => p.classList.remove("show"), 4200);
}

/* ---------- rests, level, death ---------- */
function shortRest() {
  const c = C(); const r = rollDice({ n: 1, d: CLASSES[c.cls].hd, mod: mod(c.scores.con) }); c.hitDice--; const got = healHero(Math.max(1, r.total));
  if (c.cls === "fighter") c.secondWind = true;
  pushFeed({ t: "sys", html: "Короткий отдых: час тишины, перевязка, глоток воды." }); pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP (${r.text})` }] }); after();
}
function longRest() {
  const c = C(); c.hp = c.maxHp; c.hitDice = c.level; c.secondWind = c.cls === "fighter"; Object.values(c.slots).forEach(s => s[1] = s[0]);
  pushFeed({ t: "sys", html: "<b>Долгий отдых.</b> Ночь проходит. Хиты, ячейки и силы восстановлены." }); pushFeed({ t: "chips", items: [{ c: "heal", x: "HP полностью" }] }); after();
}
function levelUp() {
  const c = C(); const hd = CLASSES[c.cls].hd; const avg = Math.floor(hd / 2) + 1; const cm = mod(c.scores.con) + (RACES[c.race].hpBonus || 0);
  modal(`<h2>Уровень 2</h2><p>${esc(c.name)} становится опытнее. Хиты: бросьте кость d${hd} или возьмите среднее (${avg}), плюс ${fmt(cm)}.</p>
    <p>Новое: бонус мастерства пока +2${CLASSES[c.cls].spells ? ", третья ячейка заклинаний 1 круга" : ""}${c.cls === "fighter" ? ", «Всплеск действий»" : c.cls === "rogue" ? ", «Хитрое действие»" : ""}.</p>
    <div class="row"><button class="btn" type="button" id="lv-avg">Среднее: ${avg}</button><button class="btn primary" type="button" id="lv-roll">Бросить d${hd}</button></div>`, root => {
    const apply = v => { const add = Math.max(1, v + cm); c.level = 2; c.maxHp += add; c.hp += add; c.hitDice++;
      Object.entries(slotsFor(c.cls, 2)).forEach(([l, n]) => { const s = c.slots[l] || [0, 0]; c.slots[l] = [n, s[1] + (n - s[0])]; });
      closeModal(); pushFeed({ t: "sys", html: `<b>Новый уровень!</b> Максимум хитов +${add}.` }); after(); };
    root.querySelector("#lv-avg").onclick = () => apply(avg); root.querySelector("#lv-roll").onclick = () => apply(rnd(hd));
  });
}
function checkDeath() {
  const c = C(); if (c.hp > 0 || S.dead) return;
  if (S.mode === "novice") { c.hp = 1; S.world.combat = false; pushFeed({ t: "sys", html: "<b>Вы теряете сознание…</b> и приходите в себя на берегу. Враги ушли. 1 HP." }); after(); return; }
  if (!S.dying) S.dying = { s: 0, f: 0 }; renderDeath();
}
function renderDeath() {
  const st = S.dying; const old = document.getElementById("death-box"); old?.remove();
  const fi = document.getElementById("feed-inner"); const d = document.createElement("div"); d.className = "death"; d.id = "death-box";
  const m = (n, k) => Array.from({ length: 3 }, (_, i) => `<i class="${i < n ? "f" : ""}"></i>`).join("");
  d.innerHTML = `<b>Вы при смерти.</b><span style="color:var(--mist);font-size:13px">Спасбросок от смерти: d20, 10 и выше — успех. Три успеха — вы стабилизируетесь, три провала — смерть.</span>
  <div class="marks"><span class="s">Успехи ${m(st.s)}</span><span class="x">Провалы ${m(st.f)}</span></div><div><button class="btn primary" type="button" id="btn-ds">Спасбросок от смерти</button></div>`;
  fi.append(d); scrollFeed();
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
  if (S.mode === "sandbox" && S.secondChance) {
    S.secondChance = false; C().hp = Math.ceil(C().maxHp / 2); S.world.combat = false; moveTo("chapel");
    pushFeed({ t: "sys", html: "<b>Второй шанс.</b> Сестра Илва нашла вас на берегу и выходила. Больше такое не повторится." }); after(); return;
  }
  S.dead = true; save();
  modal(`<h2>Конец пути</h2><p>${esc(C().name)} погибает в Солёной Гавани. В режиме «${MODES[S.mode].name}» смерть окончательна.</p><p>Летопись: ${S.world.facts.length} записанных фактов, ${C().xp} опыта.</p><div class="row"><button class="btn primary" type="button" id="dead-new">Новый герой</button></div>`,
    root => { root.querySelector("#dead-new").onclick = () => { closeModal(); newGame(); }; });
}
function modal(html, bind) {
  const r = document.getElementById("modal-root"); r.innerHTML = `<div class="modal-back"><div class="modal" role="dialog" aria-modal="true">${html}</div></div>`; bind(r);
  r.querySelector("button")?.focus();
}
function closeModal() { document.getElementById("modal-root").innerHTML = ""; }
function newGame() { wipe(); S = null; D = newDraft(); document.getElementById("screen-game").hidden = true; document.getElementById("screen-create").hidden = false; renderCreate(); }

/* =========================================================================
   BOOT
   ========================================================================= */
function showTab(t) {
  document.querySelectorAll("#mtabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.t === t)));
  ["sheet", "story", "world"].forEach(id => document.getElementById(id).classList.toggle("active", id === t));
  if (t === "world") requestAnimationFrame(drawMap);
}
document.getElementById("mtabs").addEventListener("click", e => { const b = e.target.closest("button"); if (b) showTab(b.dataset.t); });
document.getElementById("btn-back").onclick = () => { if (D.step > 0) { D.step--; renderCreate(); } };
document.getElementById("btn-next").onclick = () => { if (!stepValid(D.step)) return; if (D.step < 5) { D.step++; renderCreate(); document.querySelector(".c-body").scrollTop = 0; } else finishCreation(); };
document.getElementById("btn-new").onclick = () => modal(`<h2>Новый герой?</h2><p>Текущая игра будет удалена из этого браузера.</p><div class="row"><button class="btn" type="button" id="m-no">Остаться</button><button class="btn primary" type="button" id="m-yes">Начать заново</button></div>`,
  r => { r.querySelector("#m-no").onclick = closeModal; r.querySelector("#m-yes").onclick = () => { closeModal(); if (ctl) ctl.abort(); newGame(); }; });
document.getElementById("btn-stop").onclick = () => ctl?.abort();
const inp = document.getElementById("act-input");
inp.addEventListener("input", () => { inp.style.height = "auto"; inp.style.height = Math.min(160, inp.scrollHeight) + "px"; });
inp.addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); document.getElementById("act-form").requestSubmit(); } });
document.getElementById("act-form").addEventListener("submit", e => {
  e.preventDefault(); const t = inp.value.trim(); if (!t || busy) return; inp.value = ""; inp.style.height = "auto"; takeTurn(t.slice(0, 500));
});
window.addEventListener("resize", () => { if (S) drawMap(); });

(function boot() {
  D = newDraft();
  const saved = load();
  if (saved && saved.v === 1 && saved.char && !saved.dead) {
    S = saved; S.feed = (S.feed || []).filter(e => !(e.t === "narr" && !e.text)).map(e => { e.streaming = false; return e; }); startGame(false);
  } else {
    renderCreate();
  }
})();
