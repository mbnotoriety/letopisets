/* LEVELS */
/* =========================================================================
   УРОВНИ 6–10: умения классов, ячейки, заклинания 4–5 круга, развитие навыков,
   черты, сильные враги, торжественное повышение уровня
   ========================================================================= */
Object.assign(SLOT_TABLE, { 6: { 1: 4, 2: 3, 3: 3 }, 7: { 1: 4, 2: 3, 3: 3, 4: 1 }, 8: { 1: 4, 2: 3, 3: 3, 4: 2 }, 9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 }, 10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 } });
Object.assign(HALF_SLOTS, { 6: { 1: 4, 2: 2 }, 7: { 1: 4, 2: 3 }, 8: { 1: 4, 2: 3 }, 9: { 1: 4, 2: 3, 3: 2 }, 10: { 1: 4, 2: 3, 3: 2 } });
Object.assign(PACT_SLOTS, { 6: { 3: 2 }, 7: { 4: 2 }, 8: { 4: 2 }, 9: { 5: 2 }, 10: { 5: 2 } });
Object.assign(SPELLS, {
  ice_storm: { name: "Ледяная буря", lvl: 4, kind: "save", abil: "dex", dice: "4d10", type: "холодом", desc: "Спасбросок ЛОВ, 4d10 холода и дробящего", aoe: true },
  cone_of_cold: { name: "Конус холода", lvl: 5, kind: "save", abil: "con", dice: "8d8", type: "холодом", desc: "Спасбросок ТЕЛ, 8d8 холода по всем врагам", aoe: true },
  guardian_of_faith: { name: "Страж веры", lvl: 4, kind: "save", abil: "dex", dice: "4d10", type: "излучением", desc: "Спасбросок ЛОВ, 4d10 излучения" },
  flame_strike: { name: "Небесный огонь", lvl: 5, kind: "save", abil: "dex", dice: "8d6", type: "огнём", desc: "Спасбросок ЛОВ, 8d6 огня и излучения по всем врагам", aoe: true },
  mass_cure: { name: "Массовое лечение ран", lvl: 5, kind: "heal", dice: "3d8+5", desc: "Восстанавливает 3d8 + 5 + МДР" },
  blight: { name: "Увядание", lvl: 4, kind: "save", abil: "con", dice: "8d8", type: "некротической энергией", desc: "Спасбросок ТЕЛ, 8d8 некротического урона" },
  insect_plague: { name: "Нашествие насекомых", lvl: 5, kind: "save", abil: "con", dice: "4d10", type: "колющим", desc: "Спасбросок ТЕЛ, 4d10 по всем врагам", aoe: true },
  phantasmal_killer: { name: "Смертельный морок", lvl: 4, kind: "save", abil: "wis", dice: "4d10", type: "психической энергией", desc: "Спасбросок МДР, 4d10 психического урона" },
  synaptic_static: { name: "Синаптический разряд", lvl: 5, kind: "save", abil: "int", dice: "8d6", type: "психической энергией", desc: "Спасбросок ИНТ, 8d6 по всем врагам", aoe: true },
  lightning_arrow: { name: "Стрела-молния", lvl: 3, kind: "attack", dice: "4d8", type: "электричеством", desc: "Атака заклинанием, 4d8 электричества" },
  blinding_smite: { name: "Ослепляющая кара", lvl: 3, kind: "smite", dice: "3d8", type: "излучением", desc: "Следующее попадание: +3d8 излучения" }
});
const LV_SPELLS2 = { wizard: { 7: "ice_storm", 9: "cone_of_cold" }, cleric: { 7: "guardian_of_faith", 9: ["flame_strike", "mass_cure"] }, druid: { 7: "blight", 9: "insect_plague" }, bard: { 6: "fireball", 7: "phantasmal_killer", 9: "synaptic_static" }, warlock: { 7: "blight", 9: "synaptic_static" }, ranger: { 9: "lightning_arrow" }, paladin: { 9: "blinding_smite" } };
Object.entries(LV_SPELLS2).forEach(([c, m]) => { LEVEL_SPELLS[c] = Object.assign(LEVEL_SPELLS[c] || {}, m); });
const LV_FEATS2 = {
  fighter: { 6: "Увеличение характеристик или черта", 7: "Выдающийся атлет: +половина мастерства к Атлетике, Акробатике и Скрытности без владения", 8: "Увеличение характеристик или черта", 9: "Несгибаемость: раз за отдых проваленный спасбросок перебрасывается сам", 10: "Второй боевой стиль: +2 к урону в ближнем бою" },
  rogue: { 6: "Экспертиза: ещё два навыка с двойным мастерством", 7: "Увёртливость: спасброски Ловкости с преимуществом; скрытая атака 4d6", 8: "Увеличение характеристик или черта", 9: "Мастер тени: Скрытность с преимуществом; скрытая атака 5d6", 10: "Увеличение характеристик или черта" },
  wizard: { 6: "Мощный заговор: +ИНТ к урону заговоров", 7: "Заклинания 4 круга: Ледяная буря", 8: "Увеличение характеристик или черта", 9: "Заклинания 5 круга: Конус холода", 10: "Усиленное воплощение: +ИНТ к урону всех боевых заклинаний" },
  cleric: { 6: "Божественный канал дважды за отдых", 7: "Заклинания 4 круга: Страж веры", 8: "Божественный удар: +1d8 излучения к попаданиям оружием", 9: "Заклинания 5 круга: Небесный огонь, Массовое лечение ран", 10: "Божественное вмешательство: молитва о чуде (в рассказе)" },
  barbarian: { 6: "Бездумная ярость: в ярости вас нельзя опутать или сбить с ног; четвёртая ярость", 7: "Дикий инстинкт: инициатива с преимуществом", 8: "Увеличение характеристик или черта", 9: "Сокрушительный крит: +1 кость урона при критическом попадании", 10: "Пугающее присутствие (в рассказе)" },
  paladin: { 6: "Аура защиты: +ХАР к спасброскам", 7: "Аура преданности: вас нельзя очаровать (в рассказе)", 8: "Увеличение характеристик или черта", 9: "Ячейки 3 круга: Ослепляющая кара", 10: "Аура отваги: вас не запугать (в рассказе)" },
  ranger: { 6: "Опытный охотник: избранный враг даёт +4 к урону", 7: "Уход от орды: отступление из боя с преимуществом", 8: "Увеличение характеристик или черта", 9: "Ячейки 3 круга: Стрела-молния", 10: "Скрытность в глуши: Скрытность и Выживание с преимуществом" },
  bard: { 6: "Магические секреты: Огненный шар", 7: "Заклинания 4 круга: Смертельный морок", 8: "Увеличение характеристик или черта", 9: "Заклинания 5 круга: Синаптический разряд", 10: "Вдохновение d10 и экспертиза в двух навыках" },
  warlock: { 6: "Дар покровителя: +ХАР к урону заклинаний", 7: "Ячейки 4 круга: Увядание", 8: "Увеличение характеристик или черта", 9: "Ячейки 5 круга: Синаптический разряд", 10: "Тёмная стойкость: +2 КД" },
  druid: { 6: "Дух стаи: звери в рассказе слушаются охотнее", 7: "Заклинания 4 круга: Увядание", 8: "Увеличение характеристик или черта", 9: "Заклинания 5 круга: Нашествие насекомых", 10: "Хранитель природы: +МДР к урону заклинаний" }
};
Object.entries(LV_FEATS2).forEach(([c, m]) => { LEVEL_FEATS[c] = Object.assign(LEVEL_FEATS[c] || {}, m); });
Object.values(LEVEL_FEATS).forEach(m => { if (m[4] === "Увеличение характеристик") m[4] = "Увеличение характеристик или черта"; });
const ASI_LEVELS = { fighter: [4, 6, 8], rogue: [4, 8, 10] }; function isAsiLevel(cls, l) { return (ASI_LEVELS[cls] || [4, 8]).includes(l); }
/* ---------- черты ---------- */
const FEATS = {
  tough: { n: "Крепкий", d: "+2 к максимуму хитов за каждый уровень — сейчас и впредь", ico: "k_heart" },
  alert: { n: "Бдительный", d: "+5 к инициативе, засады не застают вас врасплох", ico: "x_look" },
  observant: { n: "Наблюдательный", d: "+3 к Внимательности и Анализу; замечаете больше", ico: "t_hidden" },
  weapon_master: { n: "Мастер оружия", d: "+1 к попаданию и урону любым оружием", ico: "k_swords" },
  war_caster: { n: "Боевой маг", d: "+1 к атакам и сложности заклинаний", ico: "k_book" },
  sentinel: { n: "Страж", d: "+1 КД; враги, бьющие стаей, теряют преимущество", ico: "i_shield" }
};
function hasFeat(c, f) { return (c.feats || []).includes(f); }
/* ---------- пассивные умения в механике ---------- */
function heroSkillExtra(c, key) { let b = 0; const p = prof(c.level);
  if ((c.expert || []).includes(key) && c.skills.includes(key)) b += p;
  if (c.cls === "fighter" && c.level >= 7 && !c.skills.includes(key) && ["athletics", "acrobatics", "stealth"].includes(key)) b += Math.ceil(p / 2);
  if (hasFeat(c, "observant") && (key === "perception" || key === "investigation")) b += 3; return b; }
function heroSaveExtra(c, ab) { return c.cls === "paladin" && c.level >= 6 ? Math.max(1, mod(c.scores.cha)) : 0; }
function skillAdv(key) { const c = C(); if (c.cls === "rogue" && c.level >= 9 && key === "stealth") return 1; if (c.cls === "ranger" && c.level >= 10 && (key === "stealth" || key === "survival") && !inSettlement(S.world.loc)) return 1; return 0; }
function condImmune(cond) { const c = C(); return c.cls === "barbarian" && c.level >= 6 && c.rage && (cond === "prone" || cond === "restrained"); }
function heroInitRoll(first) { const c = C(); const a = rnd(20), b = rnd(20); const adv = c.cls === "barbarian" && c.level >= 7; const nat = adv ? Math.max(a, b) : a; const bonus = mod(c.scores.dex) + traitFx(c.traits || {}).init + (hasFeat(c, "alert") ? 5 : 0) + (first ? 5 : 0); return { nat, tot: nat + bonus, txt: `d20 (${adv ? a + " / " + b : nat}) ${fmt(bonus)}${first ? " · внезапность" : ""}${hasFeat(c, "alert") ? " · бдительность" : ""}` }; }
function heroLevelDmg(target, d, dmg, crit) {
  const c = C(); let txt = ""; const melee = !(d?.props || []).includes("ranged"); const E = ENEMIES[target];
  if (crit && c.cls === "barbarian" && c.level >= 9) { const m = /(\d+)?d(\d+)/.exec(String(d?.dice || "1d8")); if (m) { const x = rollDice("1d" + m[2]); dmg.total += x.total; txt += ` + сокрушительный крит ${x.text}`; } }
  if (c.cls === "cleric" && c.level >= 8) { const x = rollDice("1d8", crit); dmg.total += x.total; txt += ` + божественный удар ${x.text}`; }
  if (c.cls === "fighter" && c.level >= 10 && melee) { dmg.total += 2; txt += " + стиль 2"; }
  if (c.cls === "ranger" && c.level >= 6 && c.favored && FAVORED[c.favored]?.[2].has(E?.type)) { dmg.total += 2; txt += " + опытный охотник 2"; }
  return txt;
}
function spellDiceFor(sp) { const c = C(); if (sp.lvl === 0 && c.level >= 5) { const m = /^(\d+)d(\d+)(.*)$/.exec(sp.dice); if (m) return `${+m[1] * 2}d${m[2]}${m[3]}`; } return sp.dice; }
function spellDmgBonus(sp) { const c = C(); let b = 0; const cm = castMod();
  if (c.cls === "wizard" && ((c.level >= 6 && sp.lvl === 0) || c.level >= 10)) b += Math.max(0, cm); if (c.cls === "warlock" && c.level >= 6 && sp.lvl > 0) b += Math.max(0, cm); if (c.cls === "druid" && c.level >= 10) b += Math.max(0, cm);
  return b; }
function bardDie(c) { return c.level >= 10 ? "1d10" : c.level >= 5 ? "1d8" : "1d6"; }
/* ---------- сильные враги для высоких уровней ---------- */
Object.assign(BESTIARY, {
  dire_wolf: { label: "лютый волк", ac: 14, hp: 37, atk: 5, dmg: "2d6+3", dex: 2, xp: 200, hi: true },
  ogre: { label: "огр", ac: 11, hp: 59, atk: 6, dmg: "2d8+4", dex: -1, xp: 450, boss: true, hi: true },
  owlbear: { label: "совомедведь", ac: 13, hp: 59, atk: 7, dmg: "2d8+5", dex: 1, xp: 700, boss: true, hi: true },
  wight: { label: "умертвие", ac: 14, hp: 45, atk: 4, dmg: "1d8+2", dex: 2, xp: 700, boss: true, hi: true },
  ghost: { label: "призрак", ac: 11, hp: 45, atk: 5, dmg: "4d6+3", dex: 1, xp: 1100, boss: true, hi: true }
});
Object.assign(FOE_KIT, {
  dire_wolf: { snd: ["bite", "wolf-hit", "wolf-die"], kind: "beast", pack: true, onHit: { save: "str", dc: 13, cond: "prone", txt: "валит с ног" }, traits: ["Стая", "Укус валит с ног (Сила КС 13)"], specials: [{ id: "howl", t: "Воет, созывая стаю", warn: "придёт ещё волк", once: true, chance: .3, minRound: 2 }] },
  ogre: { snd: ["club", "orc-hit", "orc-die"], kind: "humanoid", traits: ["Огромная дубина: страшный урон", "Медленный"], specials: [{ id: "crush", t: "Заносит дубину над головой", warn: "двойной урон — уклоняйтесь", every: 3 }] },
  owlbear: { snd: ["claws", "wolf-hit", "wolf-die"], kind: "beast", multi: 2, onHit: { save: "str", dc: 13, cond: "restrained", txt: "сграбастал" }, traits: ["Клюв и когти: две атаки", "Сграбастать: опутывает (Сила КС 13)"] },
  wight: { snd: ["dark", "skel-hit", "skel-die"], kind: "undead", multi: 2, resist: "кол", traits: ["Два удара", "Сопротивление колющему"], specials: [{ id: "curse", t: "Тянет жизнь из воздуха", warn: "следующий удар +1d8 некротическим", chance: .35, recharge: 2 }] },
  ghost: { snd: ["dark", "zombie-hit", "zombie-die"], kind: "undead", resist: "дроб", traits: ["Бестелесный: дробящее вдвое слабее", "Ужасающий облик"], specials: [{ id: "curse", t: "Являет ужасающий облик", warn: "следующий удар +1d8 некротическим", chance: .4, recharge: 2 }] }
});
Object.assign(FOE_ICO, { dire_wolf: "e_howl", ogre: "e_ogre", owlbear: "e_bear", wight: "e_skeleton", ghost: "e_ghost" });
ENC_FOES.f.push(["dire_wolf", "Лютый волк", 2, 5], ["owlbear", "Совомедведь", 1, 6]); ENC_FOES.g.push(["ogre", "Огр", 1, 6]); ENC_FOES.r.push(["ogre", "Огр", 1, 6], ["dire_wolf", "Лютый волк", 2, 5]); ENC_FOES.n.push(["ogre", "Огр", 1, 6]); ENC_FOES.m.push(["wight", "Умертвие", 1, 7]); ENC_FOES.night.push(["wight", "Умертвие", 1, 7], ["ghost", "Призрак", 1, 8]);
Object.assign(FOE_TXT, { dire_wolf: ["Огромные серые тени скользят меж деревьев — лютые волки, каждый ростом с телёнка.", "Из чащи вылетает зверь размером с пони — лютый волк!", "e_howl"], ogre: ["Земля дрожит от тяжёлых шагов: огр с дубиной из целого ствола ищет, кого бы съесть.", "Ветви трещат — огр вываливается на тропу прямо перед тобой!", "e_ogre"], owlbear: ["Ухающий рёв и треск сучьев: совомедведь разрывает трухлявый пень.", "Перья и мех, клюв и когти — совомедведь бросается из кустов!", "e_bear"], wight: ["Холод ползёт по земле. Высокая фигура в истлевшей броне медленно поворачивает к тебе голову.", "Ледяная рука хватает тебя за плечо — умертвие!", "e_skeleton"], ghost: ["Воздух звенит, свеча гаснет сама собой: полупрозрачная фигура смотрит прямо на тебя.", "Призрак проходит сквозь дерево и тянется к твоему сердцу!", "e_ghost"] });
/* усиление случайных врагов под уровень героя */
{ const _sf = spawnFoes; spawnFoes = function (type, name, n, loc) { const ids = _sf(type, name, n, loc); const L = C()?.level || 1; if (L > 3) ids.forEach(id => { const E = ENEMIES[id]; if (!E || E.npc || E.hi) return; const k = 1 + (L - 3) * .16; E.hp = Math.round(E.hp * k); E.atk += Math.floor((L - 3) / 2); E.xp = Math.round(E.xp * k); if (S.world.enemies[id]) S.world.enemies[id].hp = E.hp; }); return ids; }; }
/* =========================================================================
   ПОВЫШЕНИЕ УРОВНЯ: торжество, хиты, навыки, характеристики или черта, новые силы
   ========================================================================= */
function lvlChord() { try { if (!AU.cfg.on || !AU.unlocked) return; const ctx = AU.ctx || (AU.ctx = new (window.AudioContext || window.webkitAudioContext)()); const t0 = ctx.currentTime + .05; const vol = AU.cfg.sfx * .22;
  [[523.25, 0], [659.25, .11], [783.99, .22], [1046.5, .33], [1318.5, .5], [1567.98, .62]].forEach(([f, dt], i) => { const o = ctx.createOscillator(), g = ctx.createGain(), o2 = ctx.createOscillator(); o.type = "triangle"; o2.type = "sine"; o.frequency.value = f; o2.frequency.value = f * 2.001; const t = t0 + dt;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * (i > 3 ? .7 : 1), t + .02); g.gain.exponentialRampToValueAtTime(.0008, t + 1.8 - i * .1); o.connect(g); o2.connect(g); g.connect(ctx.destination); o.start(t); o2.start(t); o.stop(t + 2); o2.stop(t + 2); }); } catch (e) {} }
function levelFanfare() { sfx("holy3"); setTimeout(() => sfx("fanfare"), 380); setTimeout(lvlChord, 500); setTimeout(() => sfx("horn1", .55), 1300); }
function levelBurst(nl, c) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve(); return new Promise(res => {
    const el = document.createElement("div"); el.className = "lvl-burst"; el.style.setProperty("--cls", CLASSES[c.cls].color);
    const sparks = Array.from({ length: 34 }, (_, i) => `<i style="--a:${(i / 34 * 360 + Math.random() * 8).toFixed(1)}deg;--d:${(160 + Math.random() * 260).toFixed(0)}px;--t:${(0.9 + Math.random() * .9).toFixed(2)}s;--s:${(3 + Math.random() * 5).toFixed(1)}px;--dl:${(Math.random() * .35).toFixed(2)}s"></i>`).join("");
    el.innerHTML = `<div class="lb-rays"></div><div class="lb-ring"></div><div class="lb-ring r2"></div><div class="lb-sparks">${sparks}</div><div class="lb-core"><span class="lb-ico">${ico("c_" + c.cls, 64)}</span><small>Новый уровень</small><b>${nl}</b><em>${esc(c.name)} · ${esc(CLASSES[c.cls].name)}</em></div>`;
    document.body.append(el); el.onclick = () => { el.classList.add("out"); setTimeout(() => { el.remove(); res(); }, 350); }; setTimeout(() => { if (el.isConnected) el.click(); }, 2900); });
}
let lvlFlow = null;
function levelUp() {
  const c = C(); if (c.level >= MAX_LEVEL || c.xp < XP_LEVELS[c.level] || lvlFlow) return; const nl = c.level + 1;
  levelFanfare(); levelBurst(nl, c).then(() => { lvlFlow = { nl, step: 0, hp: null, skills: [], asi: null, feat: null }; renderLevelFlow(); });
}
function lvlSkillPicks(c, nl) { return c.cls === "rogue" && nl === 6 ? 2 : c.cls === "bard" && nl === 10 ? 2 : 1; }
function canExpert(c, nl) { return nl >= 6 || ["rogue", "bard"].includes(c.cls); }
function renderLevelFlow() {
  const c = C(); const F = lvlFlow; const nl = F.nl; const cls = CLASSES[c.cls]; const hd = cls.hd; const cm = mod(c.scores.con) + (RACES[c.race].hpBonus || 0) + (hasFeat(c, "tough") ? 2 : 0);
  const steps = ["hp", "skill", ...(isAsiLevel(c.cls, nl) ? ["asi"] : []), "powers"]; const st = steps[F.step];
  const dots = `<div class="lv-dots">${steps.map((s, i) => `<i class="${i < F.step ? "done" : i === F.step ? "cur" : ""}"></i>`).join("")}</div>`;
  const head = `<div class="lv-head" style="--cls:${cls.color}"><span class="lv-badge">${ico("c_" + c.cls, 30)}<b>${nl}</b></span><div><div class="eyebrow">Новый уровень · ${esc(cls.name)}</div><h2>${esc(c.name)}</h2></div>${dots}</div>`;
  let body = "";
  if (st === "hp") body = `<div class="lv-hp"><p>Кость хитов вашего класса — d${hd}. Бросьте её или возьмите среднее (${Math.floor(hd / 2) + 1}). Добавится ${fmt(cm)} за Телосложение${hasFeat(c, "tough") ? " и черту «Крепкий»" : ""}.</p>
    <div class="lv-die-wrap"><div class="lv-die" id="lv-die"><svg viewBox="0 0 100 100" aria-hidden="true"><polygon points="50,4 93,28 93,72 50,96 7,72 7,28" fill="none" stroke="currentColor" stroke-width="4"/><polygon points="50,4 93,72 7,72" fill="none" stroke="currentColor" stroke-width="2" opacity=".45"/></svg><span id="lv-num">${F.hp ? F.hp.roll : "d" + hd}</span></div>
    <div class="lv-hpres" id="lv-hpres">${F.hp ? `<b>+${F.hp.add}</b><small>максимум хитов: ${c.maxHp - F.hp.add} → ${c.maxHp}</small>` : ""}</div></div>
    <div class="row">${F.hp ? `<button class="btn primary" type="button" id="lv-next">Дальше</button>` : `<button class="btn" type="button" id="lv-avg">Среднее: ${Math.floor(hd / 2) + 1}</button><button class="btn primary" type="button" id="lv-roll">${ico("i_gems", 16)} Бросить d${hd}</button>`}</div></div>`;
  if (st === "skill") { const picks = lvlSkillPicks(c, nl); const ce = canExpert(c, nl);
    body = `<p>Опыт делает вас лучше в деле. Выберите ${picks === 2 ? "два навыка" : "навык"}: новый — станет владением (+${prof(nl)}), уже освоенный${ce ? "" : " (с 6 уровня)"} — экспертизой (мастерство вдвойне).</p>
    <div class="lv-skills">${Object.keys(SKILLS).sort((a, b) => SKILLS[a][0].localeCompare(SKILLS[b][0], "ru")).map(k => { const has = c.skills.includes(k); const ex = (c.expert || []).includes(k); const cur = skillBonus(k); const p2 = prof(nl);
      const kind = ex ? "max" : has ? (ce ? "exp" : "lock") : "new"; const nb = kind === "new" ? cur + p2 + (prof(nl) - prof(c.level)) * 0 : kind === "exp" ? cur + p2 : cur; const sel = F.skills.includes(k);
      return `<button type="button" class="lv-sk ${kind}${sel ? " sel" : ""}" data-sk="${k}" ${kind === "max" || kind === "lock" ? "disabled" : ""}><span><b>${SKILLS[k][0]}</b><small>${ABIL_RU[SKILLS[k][1]]} · ${kind === "new" ? "новый" : kind === "exp" ? "экспертиза" : kind === "max" ? "эксперт" : "владеете"}</small></span><span class="lv-sv">${fmt(cur)}${kind === "new" || kind === "exp" ? `<i>→</i><b>${fmt(nb)}</b>` : ""}</span></button>`; }).join("")}</div>
    <div class="row"><small class="home-note">Выбрано ${F.skills.length} из ${picks}</small><button class="btn primary" type="button" id="lv-next" ${F.skills.length < picks ? "disabled" : ""}>Дальше</button></div>`; }
  if (st === "asi") { F.tab = F.tab || "abil"; const pts = F.asi ? Object.values(F.asi).reduce((a, b) => a + b, 0) : 0;
    body = `<div class="seg lv-tabs"><button type="button" data-tab="abil" aria-pressed="${F.tab === "abil"}">Характеристики</button><button type="button" data-tab="feat" aria-pressed="${F.tab === "feat"}">Черта</button></div>
    ${F.tab === "abil" ? `<p>Распределите 2 очка: +2 к одной характеристике или +1 к двум. Максимум 20.</p><div class="lv-abil">${ABIL.map(a => { const add = F.asi?.[a] || 0; const v = c.scores[a]; return `<div class="lv-ab${add ? " on" : ""}"><span class="ab-ico">${ico("a_" + a, 22)}</span><span><b>${ABIL_FULL[a]}</b><small>${v}${add ? ` → ${v + add}` : ""} · мод. ${fmt(mod(v))}${add && mod(v + add) !== mod(v) ? ` → ${fmt(mod(v + add))}` : ""}</small></span><span class="lv-ab-btn"><button type="button" data-ad="${a}" data-v="-1" ${add ? "" : "disabled"} aria-label="Убрать">−</button><b>${add ? "+" + add : "0"}</b><button type="button" data-ad="${a}" data-v="1" ${pts >= 2 || v + add >= 20 ? "disabled" : ""} aria-label="Добавить">+</button></span></div>`; }).join("")}</div>`
      : `<p>Вместо характеристик — особый талант на всю жизнь.</p><div class="lv-feats">${Object.entries(FEATS).filter(([k]) => !hasFeat(c, k) && (k !== "war_caster" || cls.spells || cls.half || cls.pact)).map(([k, f]) => `<button type="button" class="lv-ft${F.feat === k ? " sel" : ""}" data-ft="${k}">${ico(f.ico, 24)}<span><b>${f.n}</b><small>${esc(f.d)}</small></span></button>`).join("")}</div>`}
    <div class="row"><button class="btn primary" type="button" id="lv-next" ${(F.tab === "abil" ? pts === 2 : !!F.feat) ? "" : "disabled"}>Дальше</button></div>`; }
  if (st === "powers") { const feat = LEVEL_FEATS[c.cls]?.[nl] || ""; const spells = [].concat(LEVEL_SPELLS[c.cls]?.[nl] || []).filter(x => SPELLS[x]); const ns = slotsFor(c.cls, nl); const os = slotsFor(c.cls, nl - 1); const cards = [];
    cards.push(["l_up", "Умение уровня", feat]); if (prof(nl) > prof(nl - 1)) cards.push(["l_stars", "Бонус мастерства", `${fmt(prof(nl - 1))} → ${fmt(prof(nl))}: все владения, атаки и заклинания точнее`]);
    if (nl === 5 && EXTRA_ATK.has(c.cls)) cards.push(["k_swords", "Дополнительная атака", "Два удара за ход"]); if (c.cls === "rogue" && Math.ceil(nl / 2) > Math.ceil((nl - 1) / 2)) cards.push(["k_venom", "Скрытая атака", `${Math.ceil(nl / 2)}d6`]);
    if (nl === 5 && (cls.spells || cls.pact)) cards.push(["l_spark", "Заговоры сильнее", "Урон заговоров удваивается"]);
    spells.forEach(x => cards.push(["k_book", "Новое заклинание", `${SPELLS[x].name} — ${SPELLS[x].desc}`])); const sl = Object.entries(ns).filter(([l, n]) => (os[l] || 0) < n); if (sl.length) cards.push(["k_aura", "Ячейки заклинаний", sl.map(([l, n]) => `${l} круг: ${os[l] || 0} → ${n}`).join(", ")]);
    if (F.skills.length) cards.push(["l_muscle", "Навыки", F.skills.map(k => `${SKILLS[k][0]}${c.skills.includes(k) ? " (экспертиза)" : ""}`).join(", ")]); if (F.feat) cards.push([FEATS[F.feat].ico, "Черта: " + FEATS[F.feat].n, FEATS[F.feat].d]); if (F.asi) cards.push(["a_str", "Характеристики", Object.entries(F.asi).filter(([, v]) => v).map(([a, v]) => `${ABIL_FULL[a]} +${v}`).join(", ")]);
    body = `<div class="lv-powers">${cards.map(([i, t, d], k) => `<div class="lv-pw" style="animation-delay:${k * .12}s">${ico(i, 26)}<span><b>${esc(t)}</b><small>${esc(d)}</small></span></div>`).join("")}</div><div class="row"><button class="btn primary" type="button" id="lv-done">${ico("t_boots", 16)} К приключениям</button></div>`; }
  modal(`<div class="lv">${head}<div class="lv-body">${body}</div></div>`, root => {
    root.querySelector(".modal").classList.add("lv-modal");
    const next = () => { F.step++; sfx("pick"); renderLevelFlow(); };
    root.querySelector("#lv-next")?.addEventListener("click", next);
    const rollHp = (v, anim) => { const add = Math.max(1, v + cm); F.hp = { roll: v, add }; const oldRM = resMax(c); c.level = nl; c.maxHp += add; c.hp += add; c.hitDice++; if (hasFeat(c, "tough")) {}
      { const s2 = slotsFor(c.cls, nl); if (CLASSES[c.cls].pact) c.slots = {}; Object.entries(s2).forEach(([l, n]) => { const old = c.slots[l] || [0, 0]; c.slots[l] = [n, Math.max(0, old[1] + (n - old[0]))]; }); }
      [].concat(LEVEL_SPELLS[c.cls]?.[nl] || []).forEach(x => { if (SPELLS[x] && !c.spells.includes(x)) c.spells.push(x); }); const rm = resMax(c); const rs = resOf(c); rs.lay = Math.min(rm.lay, (rs.lay || 0) + 5); if (rm.rage > oldRM.rage) rs.rage = (rs.rage || 0) + (rm.rage - oldRM.rage); if (rm.indom) rs.indom = 1; recalcAC(c); save(); };
    root.querySelector("#lv-avg")?.addEventListener("click", () => { rollHp(Math.floor(hd / 2) + 1); sfx("chime"); renderLevelFlow(); });
    root.querySelector("#lv-roll")?.addEventListener("click", e => { e.target.disabled = true; const die = root.querySelector("#lv-die"); const num = root.querySelector("#lv-num"); die.classList.add("rolling"); sfx("dice"); let k = 0; const v = rnd(hd);
      const iv = setInterval(() => { num.textContent = 1 + Math.floor(Math.random() * hd); if (++k > 12) { clearInterval(iv); num.textContent = v; die.classList.remove("rolling"); die.classList.add(v === hd ? "max" : "land"); sfx(v === hd ? "fanfare" : "chime", .7); setTimeout(() => { rollHp(v); renderLevelFlow(); }, 700); } }, 70); });
    root.querySelectorAll("[data-sk]").forEach(b => b.onclick = () => { const k = b.dataset.sk; const picks = lvlSkillPicks(c, nl); if (F.skills.includes(k)) F.skills = F.skills.filter(x => x !== k); else if (F.skills.length < picks) F.skills.push(k); else F.skills = [...F.skills.slice(1), k]; sfx("tap"); renderLevelFlow(); });
    root.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { F.tab = b.dataset.tab; renderLevelFlow(); });
    root.querySelectorAll("[data-ad]").forEach(b => b.onclick = () => { F.asi = F.asi || {}; const a = b.dataset.ad; F.asi[a] = clamp((F.asi[a] || 0) + +b.dataset.v, 0, 2); sfx("tap"); F.feat = null; renderLevelFlow(); });
    root.querySelectorAll("[data-ft]").forEach(b => b.onclick = () => { F.feat = b.dataset.ft; F.asi = null; sfx("tap"); renderLevelFlow(); });
    const curStep = steps[F.step];
    if (curStep === "powers" && !F.applied) { F.applied = true;
      F.skills.forEach(k => { if (c.skills.includes(k)) { c.expert = c.expert || []; if (!c.expert.includes(k)) c.expert.push(k); } else c.skills.push(k); });
      if (F.asi) { const oldCon = mod(c.scores.con); Object.entries(F.asi).forEach(([a, v]) => { c.scores[a] = Math.min(20, c.scores[a] + v); }); if (mod(c.scores.con) !== oldCon) { const d = (mod(c.scores.con) - oldCon) * c.level; c.maxHp += d; c.hp += d; } }
      if (F.feat) { c.feats = c.feats || []; c.feats.push(F.feat); if (F.feat === "tough") { c.maxHp += 2 * c.level; c.hp += 2 * c.level; } }
      recalcAC(c); save(); setTimeout(() => sfx("holy2", .6), 150); }
    root.querySelector("#lv-done")?.addEventListener("click", () => { closeModal(); lvlFlow = null; pushFeed({ t: "levelup", lvl: nl, cls: c.cls, feat: LEVEL_FEATS[c.cls]?.[nl] || "", hp: F.hp?.add || 0 }); sfx("bell"); after(); });
  });
}
function levelupHTML(e) { const cls = CLASSES[e.cls]; return `<div class="lu-in" style="--cls:${cls?.color || "var(--lantern)"}"><span class="lu-ico">${ico("c_" + e.cls, 30)}</span><div><small>Новый уровень</small><b>Уровень ${e.lvl}</b><span>${esc(e.feat)}${e.hp ? ` · +${e.hp} к максимуму хитов` : ""}</span></div></div>`; }
/* уведомление, когда опыта хватает на уровень */
let lvlNotified = 0;
function checkLevelReady() { if (!S) return; const c = C(); const nx = nextXP(c); if (nx != null && c.xp >= nx && lvlNotified !== c.level) { lvlNotified = c.level; setTimeout(() => { sfx("holy3", .7); pushFeed({ t: "chips", items: [{ c: "xp", x: `Доступен ${c.level + 1} уровень! Нажмите «Новый уровень» в листе героя` }] }); }, 900); } }

{ const _ac = acNow; acNow = function (c) { return _ac(c) + (hasFeat(c, "sentinel") ? 1 : 0) + (c.cls === "warlock" && c.level >= 10 ? 2 : 0); }; }
function aoeHit(sp, main) { const others = aliveEnemiesHere().filter(id => id !== main); if (!others.length) return ""; const dc = spellDC(); const parts = [];
  others.forEach(id => { const E = ENEMIES[id]; const sv = rnd(20) + (E.dex || 0); const d = rollDice(spellDiceFor(sp)); const dmg = Math.max(0, (sv >= dc ? Math.floor(d.total / 2) : d.total) + spellDmgBonus(sp)); hurtEnemy(id, dmg); parts.push(`${E.name} −${dmg}${S.world.enemies[id].alive ? "" : " (повержен)"}`); });
  return ` · задеты: ${parts.join(", ")}`; }
["fireball", "shatter", "thunderwave", "spirit_guardians"].forEach(k => { if (SPELLS[k]) SPELLS[k].aoe = true; });
