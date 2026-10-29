/* COMBAT */
/* =========================================================================
   БОЙ: повадки врагов, намерения, состояния, тактические действия,
   боевая панель, анимации, трофеи
   ========================================================================= */
const FOE_ICO = { wolf: "e_wolf", bandit: "e_bandit", thug: "b_criminal", goblin: "e_goblin", zombie: "e_zombie", skeleton: "e_skeleton", giant_rat: "e_rat", giant_spider: "e_spider", cultist: "b_cultist" };
const FOE_KIT = {
  wolf: { snd: ["bite", "wolf-hit", "wolf-die"], kind: "beast", pack: true, onHit: { save: "str", dc: 11, cond: "prone", txt: "валит с ног" }, traits: ["Стая: преимущество, пока рядом сородич", "Укус валит с ног (Сила КС 11)"],
    specials: [{ id: "howl", t: "Воет, созывая стаю", warn: "не убьёте сейчас — придёт ещё один волк", once: true, chance: .3, minRound: 2 }] },
  giant_rat: { snd: ["bitesm", "rat-hit", "rat-die"], kind: "beast", pack: true, morale: .3, flee: true, onHit: { save: "con", dc: 10, cond: "poisoned", rounds: 2, txt: "заразный укус" }, traits: ["Стая: преимущество, пока рядом сородич", "Заразный укус: отравление (Телосложение КС 10)"] },
  giant_spider: { snd: ["pincers", "spider-hit", "spider-die"], kind: "beast", onHit: { save: "con", dc: 11, dice: "2d6", txt: "яд" }, traits: ["Ядовитый укус: +2d6 (Телосложение КС 11 — вдвое меньше)", "Паутина опутывает (Ловкость КС 12)"],
    specials: [{ id: "web", t: "Плетёт паутину", warn: "Спасбросок Ловкости КС 12, иначе опутает. Уклонение помогает", chance: .4, recharge: 2 }] },
  bandit: { snd: ["sword", "human-hit", "human-die"], kind: "humanoid", morale: .35, surrender: true, traits: ["Может сдаться, если дело плохо", "Иногда берёт арбалет и целится"],
    specials: [{ id: "aim", t: "Целится из арбалета", warn: "следующий выстрел — с преимуществом и больнее. Уклонение помогает", chance: .25, recharge: 2 }] },
  thug: { snd: ["mace", "orc-hit", "orc-die"], kind: "humanoid", multi: 2, morale: .2, surrender: true, traits: ["Две атаки за ход", "Сокрушительный удар каждый третий раунд"],
    specials: [{ id: "crush", t: "Заносит сокрушительный удар", warn: "двойной урон. Уклонитесь — или собейте замах толчком", every: 3 }] },
  goblin: { snd: ["dagger", "goblin-hit", "goblin-die"], kind: "humanoid", nimble: true, morale: .5, flee: true, traits: ["Юркий: после удара прячется (помеха по нему)", "Трусоват: бежит, когда ранен"] },
  cultist: { snd: ["dark", "human-hit", "human-die"], kind: "humanoid", morale: .3, surrender: true, traits: ["Тёмная молитва: +1d8 некротическим к удару", "Может сдаться"],
    specials: [{ id: "curse", t: "Шепчет тёмную молитву", warn: "следующий удар +1d8 некротическим", chance: .35, recharge: 2 }] },
  zombie: { snd: ["zombie-atk", "zombie-hit", "zombie-die"], kind: "undead", fort: true, traits: ["Стойкость нежити: может подняться с 1 HP", "Крит или свет добивают наверняка"] },
  skeleton: { snd: ["sword", "skel-hit", "skel-die"], kind: "undead", vuln: "дроб", resist: "кол", traits: ["Уязвим к дробящему (×2)", "Колющее — вдвое меньше"] }
};
const SPECIAL_DO = { aim: { label: "Выстрел из арбалета", adv: 1, dmg: "1d8+2", ranged: true, s: "crossbow" }, crush: { label: "Сокрушительный удар", mul: 2, s: "boom" }, curse: { label: "Тёмная кара", extra: "1d8", extraT: "некротическим", s: "dark" } };
const COND_RU = { prone: "сбит с ног", poisoned: "отравлен", restrained: "опутан", dodge: "в обороне", hidden: "скрыт", bleed: "кровоточит", marked: "брешь найдена" };
const COND_ICO = { prone: "k_stun", poisoned: "k_poison", restrained: "k_web", dodge: "k_dodge", hidden: "t_hidden", bleed: "k_bleed", marked: "k_target" };
function hcond() { return S.world.hc || (S.world.hc = {}); }
function fcond(id) { const e = S.world.enemies[id]; return e ? e.cond || (e.cond = {}) : {}; }
function kitOf(id) { return FOE_KIT[ENEMIES[id]?.type] || {}; }
function fightMode() { return S?.settings?.fight || "brief"; }
function wType(wid) { return wDef(wid)?.type || wid; }
function isRangedW(wid) { const d = wDef(wid); return !!(WEAPONS[wid]?.ranged || d?.props?.includes("ranged")); }
/* преимущество/помеха для атаки героя */
function heroAttackAdv(target, wid, notes, peek) {
  let a = 0; const hc = hcond(), fc = fcond(target); const ranged = wid ? isRangedW(wid) : false; const n = t => notes && notes.push(t);
  if (hc.prone) { a--; n("вы на земле: помеха"); } if (hc.restrained) { a--; n("опутаны: помеха"); } if (hc.poisoned) { a--; n("отравлены: помеха"); }
  if (fc.prone) { if (ranged) { a--; n("цель лежит: помеха стрелку"); } else { a++; n("цель лежит: преимущество"); } }
  if (fc.hidden) { a--; n("цель скрылась: помеха"); } if (fc.marked) { a++; n("найдена брешь: преимущество"); if (!peek) fc.marked = false; }
  return a;
}
function heroDmgMods(target, d, dmg, crit) {
  const K = kitOf(target); const fc = fcond(target); const dt = String(d?.dt || ""); let txt = ""; const c = C();
  if (c.venom > 0) { const v = rollDice("1d4", crit); dmg.total += v.total; txt += ` + яд ${v.text}`; c.venom--; }
  if (crit) { if (/дроб/.test(dt)) { fc.prone = true; txt += " · сбит с ног"; } else if (/руб/.test(dt)) { fc.bleed = 2; txt += " · кровотечение"; } else if (/кол/.test(dt)) { const x = rollDice("1d6"); dmg.total += x.total; txt += ` + пронзает ${x.text}`; } }
  if (K.vuln && dt.startsWith(K.vuln)) { dmg.total *= 2; txt += " · уязвим ×2"; } else if (K.resist && dt.startsWith(K.resist)) { dmg.total = Math.ceil(dmg.total / 2); txt += " · сопротивление ÷2"; }
  fc.hidden = false; S._hitInfo = { crit }; return txt;
}
function hitChance(bonus, ac, adv) { const p = clamp((21 - (ac - bonus)) / 20, .05, .95); return adv > 0 ? 1 - (1 - p) ** 2 : adv < 0 ? p * p : p; }
function heroSave(ab, dc) { const hc = hcond(); let adv = 0; if (ab === "dex") { if (hc.dodge) adv++; if (hc.restrained) adv--; } const r = d20(clamp(adv, -1, 1)); const b = saveBonus(ab); const tot = r.nat + b; return { ok: tot >= dc, nat: r.nat, tot, txt: `${ABIL_RU[ab]} d20 (${r.pair ? r.pair.join("/") : r.nat}) ${fmt(b)} = ${tot} против КС ${dc}` }; }
/* ---------- намерения врагов ---------- */
function planIntent(id) {
  const e = S.world.enemies[id], E = ENEMIES[id], K = kitOf(id); if (!e || !e.alive || e.surrendered) return null; const R = Math.random; const round = S.world.round || 1;
  const hpP = e.hp / E.hp; const bossHere = aliveEnemiesHere().some(x => x !== id && ENEMIES[x].boss); const bossDown = Object.keys(S.world.enemies).some(x => ENEMIES[x]?.loc === S.world.loc && ENEMIES[x].boss && !S.world.enemies[x].alive);
  if (K.morale && !E.boss && !bossHere && (hpP <= K.morale || (bossDown && hpP < .8)) && R() < .55) return { k: K.surrender && (!K.flee || R() < .5) ? "surrender" : "flee" };
  if (e.cd > 0) e.cd--;
  for (const sp of K.specials || []) { if (sp.once && e.used?.[sp.id]) continue; if (e.cd > 0) continue; if (sp.minRound && round < sp.minRound) continue; if (sp.id === "howl" && aliveEnemiesHere().length >= 4) continue; if (sp.every ? round % sp.every === 0 : R() < (sp.chance || 0)) return { k: sp.id, t: sp.t, warn: sp.warn }; }
  return { k: "attack" };
}
function ensureIntents() { if (!S?.world.combat) return; S.world.round = S.world.round || 1; if (!S.world.fightId) S.world.fightId = uid(); aliveEnemiesHere().forEach(id => { const e = S.world.enemies[id]; e.fight = S.world.fightId; if (e.intent === undefined) e.intent = planIntent(id); }); }
function intentInfo(id) { const e = S.world.enemies[id]; const it = e?.intent; if (!e?.alive) return null; if (e.asleep) return { t: "Спит", c: "sleep", ico: "t_moon" };
  if (fcond(id).prone) return { t: "Встаёт с земли", c: "weak", ico: "k_stun" }; if (!it || it.k === "attack") return { t: kitOf(id).multi ? "Атакует дважды" : "Атакует", c: "atk", ico: "k_swords" };
  if (it.k === "flee") return { t: "Готов бежать", c: "weak", ico: "t_run" }; if (it.k === "surrender") return { t: "Опускает оружие…", c: "weak", ico: "k_broken" }; return { t: it.t, c: "spec", ico: "k_aura", warn: it.warn }; }
/* ---------- ход врагов ---------- */
function foeAttack(id, sp) {
  const E = ENEMIES[id], K = kitOf(id), hc = hcond(), c = C(); const notes = []; let adv = 0;
  if (K.pack && aliveEnemiesHere().some(x => x !== id && ENEMIES[x].type === E.type)) { adv++; notes.push("стая"); }
  if (hc.prone && !sp?.ranged) { adv++; notes.push("вы на земле"); } if (hc.restrained) { adv++; notes.push("вы опутаны"); }
  if (hc.dodge) { adv--; notes.push("вы уклоняетесь"); } if (sp?.adv) { adv++; notes.push("прицельно"); }
  adv = clamp(adv, -1, 1); const a = rnd(20), b = rnd(20); const nat = adv > 0 ? Math.max(a, b) : adv < 0 ? Math.min(a, b) : a;
  const atk = E.atk; const tot = nat + atk; const hit = nat === 20 || (nat !== 1 && tot >= c.ac); let dmg = 0, txt = "", cond = null;
  if (hit) { const d = rollDice(sp?.dmg || E.dmg, nat === 20); let total = d.total * (sp?.mul || 1); txt = ` · урон ${d.text}${sp?.mul ? " ×" + sp.mul : ""}`;
    if (sp?.extra) { const x = rollDice(sp.extra, nat === 20); total += x.total; txt += ` + ${x.text} ${sp.extraT || ""}`; }
    if (c.rage) { total = Math.ceil(total / 2); txt += " ÷2 ярость"; }
    if (K.onHit) { const oh = K.onHit; const s = heroSave(oh.save, oh.dc); txt += ` · ${oh.txt}: ${s.txt} — ${s.ok ? "устояли" : "провал"}`;
      if (oh.dice) { const p = rollDice(oh.dice); const add = s.ok ? Math.floor(p.total / 2) : p.total; total += add; txt += ` (+${add})`; }
      if (!s.ok && oh.cond) { hc[oh.cond] = oh.rounds || 1; cond = oh.cond; } }
    hurtHero(total); dmg = total; }
  return { kind: "enemy", by: id, title: `${E.name}: ${sp?.label || (K.multi ? "удар" : "атака")}`, nat, pair: adv ? [a, b] : null, total: tot, ok: hit, crit: nat === 20, enemyRoll: true, dmg, cond, special: sp?.label || "", snd: sp?.s,
    formula: `d20 (${adv ? a + " / " + b : nat}) +${atk} = ${tot} против вашего КД ${c.ac}${notes.length ? " · " + notes.join(", ") : ""}` + (hit ? txt : " · промах") };
}
function enemyTurn() {
  const out = []; if (!S.world.combat) return out; const hc = hcond(); ensureIntents();
  if (hc.prone) delete hc.prone; if (hc.poisoned && --hc.poisoned <= 0) delete hc.poisoned; if (hc.restrained && ++hc.rTurns > 3) { delete hc.restrained; delete hc.rTurns; }
  for (const id of aliveEnemiesHere()) {
    const e = S.world.enemies[id]; const E = ENEMIES[id]; const K = kitOf(id); const fc = fcond(id);
    if (fc.bleed) { const d = rollDice("1d4"); hurtEnemy(id, d.total); fc.bleed--; out.push({ kind: "enemy", by: id, title: `${E.name} истекает кровью`, formula: `кровотечение ${d.text}`, nat: 0, ok: false, enemyRoll: true, skip: true, bleed: d.total, enemyAfter: enemyStatus(id) }); if (!e.alive) continue; }
    if (e.asleep) { out.push({ kind: "enemy", by: id, title: `${E.name} спит`, formula: "Пропускает ход", nat: 0, ok: false, enemyRoll: true, skip: true }); continue; }
    if (C().hp <= 0) break;
    if (fc.prone) { fc.prone = false; out.push({ kind: "enemy", by: id, title: `${E.name} поднимается`, formula: e.intent && !["attack", "flee", "surrender"].includes(e.intent.k) ? "Тратит ход, чтобы встать — замысел сорван" : "Тратит ход, чтобы встать", nat: 0, ok: false, enemyRoll: true, skip: true }); e.intent = undefined; continue; }
    const it = e.intent || { k: "attack" };
    if (it.k === "flee") { e.alive = false; e.fled = true; S.pendingXP = (S.pendingXP || 0) + Math.round(E.xp / 2); out.push({ kind: "enemy", by: id, title: `${E.name} бежит с поля боя`, formula: "Скрывается — половина опыта", nat: 0, ok: false, enemyRoll: true, skip: true, fled: true }); continue; }
    if (it.k === "surrender") { e.alive = false; e.surrendered = true; S.pendingXP = (S.pendingXP || 0) + E.xp; out.push({ kind: "enemy", by: id, title: `${E.name} бросает оружие и сдаётся`, formula: "Пленника можно допросить", nat: 0, ok: false, enemyRoll: true, skip: true, surrendered: true }); continue; }
    if (it.k === "howl") { (e.used = e.used || {}).howl = true; const pos = fcPos(id); const nid = spawnFoes("wolf", "Волк из стаи", 1, S.world.loc)[0]; S.world.enemies[nid].fight = S.world.fightId; S.world.enemies[nid].pos = { x: clamp((pos?.x || 9) + 4, 1, SC_W - 1), y: 1.2 }; S.world.enemies[nid].intent = { k: "attack" };
      out.push({ kind: "enemy", by: id, title: `${E.name} воет — из темноты выходит ещё один волк`, formula: "Подмога", nat: 0, ok: false, enemyRoll: true, skip: true, summon: nid }); e.intent = undefined; continue; }
    if (it.k === "web") { e.cd = 2; const s = heroSave("dex", 12); const fail = !s.ok; if (fail) { hcond().restrained = true; hcond().rTurns = 0; }
      out.push({ kind: "enemy", by: id, title: `${E.name}: паутина`, nat: s.nat, total: s.tot, ok: fail, enemyRoll: true, cond: fail ? "restrained" : null, special: "Паутина", snd: "net", formula: `спасбросок ${s.txt} — ${fail ? "вы опутаны" : "увернулись"}` }); e.intent = undefined; continue; }
    const sp = SPECIAL_DO[it.k] || null; if (sp) { const spec = K.specials?.find(x => x.id === it.k); if (spec?.recharge) e.cd = spec.recharge; }
    const n = sp ? 1 : (K.multi || 1); for (let k = 0; k < n; k++) { if (C().hp <= 0) break; out.push(foeAttack(id, sp)); }
    if (K.nimble && Math.random() < .4) { fc.hidden = true; out[out.length - 1].hide = true; }
    e.intent = undefined;
  }
  hc.dodge = false; S.world.round = (S.world.round || 1) + 1;
  advanceFoes(); aliveEnemiesHere().forEach(id => { S.world.enemies[id].intent = planIntent(id); });
  return out;
}
/* ---------- позиции врагов на плане сцены ---------- */
function fcPos(id) { return S.world.enemies[id]?.pos || null; }
function advanceFoes() {
  const st = scState(S.world.loc); const sc = sceneOf(S.world.loc); const h = st.player || sc.spawn; const foes = aliveEnemiesHere();
  foes.forEach((id, i) => { const e = S.world.enemies[id]; if (!e.pos) return; const ranged = e.intent?.k === "aim"; const want = ranged ? 4.5 : 1.25 + (i % 3) * .35;
    const dx = h.x - e.pos.x, dy = h.y - e.pos.y; const dist = Math.hypot(dx, dy); if (dist <= want + .1) return; const step = Math.min(3.2, dist - want); const ang = Math.atan2(dy, dx) + (i - (foes.length - 1) / 2) * .35;
    e.pos = { x: +clamp(e.pos.x + Math.cos(ang) * step, .6, SC_W - .6).toFixed(2), y: +clamp(e.pos.y + Math.sin(ang) * step, .6, SC_H - .6).toFixed(2) }; });
}
/* ---------- тактические действия героя ---------- */
function curTarget() { const al = aliveEnemiesHere(); if (!al.length) return null; if (!al.includes(S.world.tgt)) S.world.tgt = al[0]; return S.world.tgt; }
function setTarget(id) { if (!enemyHere(id)) return; S.world.tgt = id; sfx("tap"); renderCombatHud(); renderSheet(); }
async function combatPreAct(act, preset, results) {
  const c = C(); const hc = hcond(); const tgt = preset.target || curTarget(); const E = ENEMIES[tgt];
  const roll = async ch => { await waitRoll(ch); const r = resolveCheck(ch); results.push(r); pushFeed({ t: "roll", r }); setTimeout(() => rollSfx(r), 520); await pause(300); return r; };
  if (act === "dodge") { hc.dodge = true; results.push({ kind: "note", title: "Герой ушёл в глухую оборону: атаки по нему с помехой, спасброски Ловкости с преимуществом" }); pushFeed({ t: "chips", items: [{ c: "xp", x: "Оборона: враги бьют с помехой" }] }); sfx("whoosh"); return; }
  if (act === "potion") { const it = c.items.find(i => i.potion || itemIdOf(i) === "potion" || itemIdOf(i) === "potion2"); if (!it) return; const d = rollDice(itemHeal(it) || "2d4+2"); const got = healHero(d.total); removeItem(c, it); pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · ${it.name}` }] }); sfx("potion"); results.push({ kind: "note", title: `Герой выпил зелье в бою (+${got} HP, уже учтено)` }); return; }
  if (act === "shove" && E) { const dc = 10 + Math.max(0, E.atk - 2); const r = await roll({ kind: "skill", skill: "athletics", dc, adv: 0, reason: `Сбить с ног: ${E.name}` });
    if (r.ok) { fcond(tgt).prone = true; const sp = S.world.enemies[tgt].intent; results.push({ kind: "note", title: `${E.name} сбит с ног${sp && !["attack", "flee", "surrender"].includes(sp.k) ? " — его замысел сорван" : ""}: следующая атака ближнего боя по нему с преимуществом` }); sfx("fist"); } else results.push({ kind: "note", title: `${E.name} устоял на ногах` }); return; }
  if (act === "assess" && E) { const K = kitOf(tgt); const sk = K.kind === "beast" ? "nature" : K.kind === "undead" ? "religion" : "insight"; const r = await roll({ kind: "skill", skill: sk, dc: 11, adv: 0, reason: `Оценить: ${E.name}` });
    if (r.ok) { const e = S.world.enemies[tgt]; e.known = true; fcond(tgt).marked = true; results.push({ kind: "note", title: `Герой раскусил ${E.name}: ${(K.traits || []).join("; ") || "обычный противник"}. Следующая атака по нему с преимуществом` }); } else results.push({ kind: "note", title: `Герою не удалось понять повадки врага` }); return; }
  if (act === "breakfree") { const r = await roll({ kind: "skill", skill: c.skills.includes("acrobatics") && mod(c.scores.dex) > mod(c.scores.str) ? "acrobatics" : "athletics", dc: 12, adv: 0, reason: "Вырваться из пут" });
    if (r.ok) { delete hc.restrained; delete hc.rTurns; results.push({ kind: "note", title: "Герой вырвался из паутины" }); } else results.push({ kind: "note", title: "Паутина держит крепко" }); return; }
  if (act === "escape") { const n = aliveEnemiesHere().length; const r = await roll({ kind: "skill", skill: mod(c.scores.dex) >= mod(c.scores.str) ? "acrobatics" : "athletics", dc: 9 + n * 2 + (hc.restrained ? 4 : 0), adv: 0, reason: "Вырваться из боя и уйти" });
    if (r.ok) { const here = S.world.loc; endCombatState(); S.world.combat = false; aliveEnemiesHere().forEach(id => { S.world.enemies[id].intent = undefined; S.world.enemies[id].pos = null; }); const back = S.world.prevLoc && POIS[S.world.prevLoc] && S.world.prevLoc !== here ? S.world.prevLoc : null;
      if (back) { tripTimeDone = true; moveTo(back); } results.push({ kind: "note", title: `Герою удалось вырваться из боя и уйти${back ? " в «" + POIS[back].name + "»" : ""}. Враги остались позади (бой окончен, start_combat не нужен)` }); sfx("whoosh"); combatBanner("Вы ушли", "escape"); }
    else results.push({ kind: "note", title: "Уйти не удалось — враги не отпускают" }); return; }
}
/* ---------- конец боя и трофеи ---------- */
const FOE_LOOT = {
  bandit: R => ({ silver: 2 + Math.floor(R() * 12), items: R() < .3 ? [{ weapon: ["dagger", "shortsword", "club", "handaxe", "lcrossbow"][Math.floor(R() * 5)] }] : [] }),
  thug: R => ({ gold: 3 + Math.floor(R() * 10), items: [R() < .5 ? { weapon: ["warhammer", "maul", "battleaxe", "morningstar"][Math.floor(R() * 4)], tier: "fine" } : { name: "Тяжёлый кошель", desc: "Награбленное серебро", value: 25 }] }),
  goblin: R => ({ silver: Math.floor(R() * 6), items: R() < .5 ? [{ name: "Гоблинские безделушки", desc: "Блестящий хлам: пуговицы, кольцо, зуб в оправе", value: 6 }] : [] }),
  cultist: R => ({ silver: 3 + Math.floor(R() * 8), items: R() < .4 ? [{ name: "Знак культа", desc: "Медальон с выцарапанным символом — улика", value: 0 }] : [] }),
  wolf: R => ({ items: R() < .7 ? [{ name: "Волчья шкура", desc: "Можно продать торговцу или скорняку", value: 8 }] : [] }),
  giant_rat: R => ({}),
  giant_spider: R => ({ items: [{ name: "Ядовитая железа паука", desc: "Смажьте оружие: следующие 3 удара +1d4 ядом", venom: true, value: 20 }] }),
  zombie: R => (R() < .25 ? { items: [{ name: "Потемневший медальон", desc: "Снят с утопленника. Внутри — чей-то портрет", value: 15 }] } : {}),
  skeleton: R => ({ gold: R() < .5 ? 1 + Math.floor(R() * 4) : 0, items: R() < .25 ? [{ weapon: ["shortsword", "scimitar", "spear"][Math.floor(R() * 3)], tier: "rusty" }] : [] })
};
function endCombatState() { S.world.hc = {}; S.world.round = 0; S.world.tgt = null; const fid = S.world.fightId; S.world.fightId = null; C().rage = false; return fid; }
function onCombatEnd(results) {
  const fid = S.world.fightId; const loc = S.world.loc; const c = C(); const R = Math.random; const loot = []; let gold = 0, silver = 0; const killed = [], fled = [], caught = [];
  Object.keys(S.world.enemies).forEach(id => { const e = S.world.enemies[id]; const E = ENEMIES[id]; if (!E || E.loc !== loc || e.looted || e.alive) return; if (fid && e.fight && e.fight !== fid) return; e.looted = true;
    if (e.fled) { fled.push(E.name); return; } if (e.surrendered) caught.push(E.name); else killed.push(E.name);
    const L = (FOE_LOOT[E.type] || (() => ({})))(R); gold += L.gold || 0; silver += L.silver || 0;
    (L.items || []).forEach(it => { if (it.weapon) { const d = makeWeapon(it.weapon, mulberry(hash(id + "loot")), { tier: it.tier || (R() < .6 ? "rusty" : "common") }); giveWeapon(c, d); loot.push({ name: d.name, ico: d.ico, col: d.col }); } else { c.items.push({ name: it.name, desc: it.desc, ...(it.venom ? { venom: true } : {}), ...(it.value != null ? { value: it.value } : {}) }); loot.push({ name: it.name, ico: it.venom ? "k_venom" : "i_gem" }); } }); });
  if (gold) c.gold += gold; if (silver) setPurse(c, purse(c) + silver);
  const xp = Math.round((S.pendingXP || 0) * (MODES[S.mode]?.xp || 1)); endCombatState();
  const parts = []; if (gold || silver) parts.push(fmtMoney(gold * 10 + silver)); loot.forEach(l => parts.push(l.name));
  results.push({ kind: "note", title: `ИТОГ БОЯ: повержены — ${killed.join(", ") || "никто"}${caught.length ? `; сдались — ${caught.join(", ")} (стоят на коленях, их можно допросить)` : ""}${fled.length ? `; сбежали — ${fled.join(", ")}` : ""}. Трофеи УЖЕ выданы движком (${parts.join(", ") || "ничего"}) — не дублируй gold и items_add` });
  pushFeed({ t: "victory", killed, caught, fled, xp, money: gold * 10 + silver, loot, hp: c.hp, max: c.maxHp });
  setTimeout(() => sfx("victory"), 300); combatBanner(caught.length && !killed.length ? "Они сдались" : "Победа", "win");
}
function victoryHTML(e) {
  return `<div class="vic-head">${ico("k_trophy", 34)}<div><b>${e.killed.length || e.caught.length ? "Победа" : "Бой окончен"}</b><small>${[e.killed.length ? `повержено: ${e.killed.length}` : "", e.caught.length ? `сдались: ${e.caught.length}` : "", e.fled.length ? `сбежали: ${e.fled.length}` : ""].filter(Boolean).join(" · ")}</small></div><span class="vic-hp">${ico("k_heart", 16)} ${e.hp}/${e.max}</span></div>
    <div class="vic-loot">${e.xp ? `<span class="xp">+${e.xp} опыта</span>` : ""}${e.money ? `<span class="gold">${COIN}${fmtMoney(e.money)}</span>` : ""}${e.loot.map(l => `<span style="${l.col ? "--wc:" + l.col : ""}">${ico(l.ico || "i_gem", 15)}${esc(l.name)}</span>`).join("")}${!e.xp && !e.money && !e.loot.length ? `<span class="dim">без трофеев</span>` : ""}</div>`;
}
/* ---------- быстрые описания хода без ИИ ---------- */
function pickR(a) { return a[Math.floor(Math.random() * a.length)]; }
function quickCombatNarr(results) {
  const L = []; const nm = id => ENEMIES[id]?.name || "враг";
  results.forEach(r => {
    if (r.kind === "attack") { const w = WEAPONS[r.weapon]?.name?.toLowerCase() || "оружие"; if (!r.ok) L.push(pickR([`${nm(r.target)} уходит от удара — ${w} рассекает воздух.`, `Промах: ${nm(r.target)} успевает отпрянуть.`, `Удар скользит мимо, ${nm(r.target)} скалится.`]));
      else if (r.enemyAfter === "повержен") L.push(pickR([`${r.crit ? "Страшный удар! " : ""}${nm(r.target)} падает и больше не встаёт.`, `${w[0].toUpperCase() + w.slice(1)} находит цель — ${nm(r.target)} рушится наземь.`]));
      else L.push(r.crit ? `Сокрушительный удар! ${nm(r.target)} шатается, ${r.enemyAfter}.` : pickR([`Удар достигает цели: ${nm(r.target)} ${r.enemyAfter}.`, `Сталь находит брешь — ${nm(r.target)} ${r.enemyAfter}.`])); }
    else if (r.kind === "spell") L.push(r.ok ? `Чары срываются с пальцев: ${r.title.replace(/^Заклинание: /, "")} — в цель.` : `Чары рассеиваются, не причинив вреда.`);
    else if (r.kind === "enemy") { if (r.fled) L.push(`${nm(r.by)} разворачивается и бежит прочь.`); else if (r.surrendered) L.push(`${nm(r.by)} бросает оружие: «Хватит! Сдаюсь!»`); else if (r.summon) L.push("Протяжный вой — и из темноты выходит ещё один волк."); else if (r.bleed) L.push(`${nm(r.by)} истекает кровью.`); else if (r.skip) { if (/поднимается/.test(r.title)) L.push(`${nm(r.by)} поднимается с земли.`); }
      else if (r.special === "Паутина") L.push(r.ok ? "Липкая сеть падает сверху и опутывает тебя." : "Ты успеваешь отпрыгнуть от летящей паутины.");
      else if (r.ok) L.push(r.crit ? `${nm(r.by)} бьёт со страшной силой!` : r.special ? `${r.special}: ${nm(r.by)} достаёт тебя.` : pickR([`${nm(r.by)} достаёт тебя.`, `Удар ${nm(r.by)} проходит — больно.`, `${nm(r.by)} не промахивается.`]));
      else L.push(pickR([`${nm(r.by)} промахивается.`, `Ты уходишь от удара (${nm(r.by)}).`, `Удар ${nm(r.by)} проходит мимо.`])); }
    else if (r.kind === "skill" && /Сбить с ног/.test(r.reason || "")) L.push(r.ok ? "Ты врезаешься плечом — противник летит на землю." : "Противник устоял.");
  });
  const text = L.slice(0, 5).join(" ") || "Бой продолжается."; pushFeed({ t: "narr", text, quick: true }); S.log.push({ who: "n", text });
  return { suggestions: [] };
}
function combatBrief() {
  if (!S.world.combat) return ""; const hc = hcond(); const hs = Object.keys(hc).filter(k => COND_RU[k] && hc[k]).map(k => COND_RU[k]);
  return `БОЙ, раунд ${S.world.round || 1}.${hs.length ? " Герой: " + hs.join(", ") + "." : ""} Намерения врагов: ${aliveEnemiesHere().map(id => { const i = intentInfo(id); const fc = fcond(id); const cs = Object.keys(fc).filter(k => fc[k] && COND_RU[k]).map(k => COND_RU[k]); return `${ENEMIES[id].name} — ${i?.t || "атакует"}${cs.length ? " (" + cs.join(", ") + ")" : ""}`; }).join("; ")}.\n`;
}
/* =========================================================================
   БОЕВАЯ ПАНЕЛЬ
   ========================================================================= */
let hudWas = false;
function combatBanner(text, kind) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; const b = document.createElement("div"); b.className = "cb-banner " + (kind || "start");
  b.innerHTML = `<div class="cb-ban-in">${ico(kind === "win" ? "k_trophy" : kind === "escape" ? "t_run" : "k_swords", 54)}<b>${esc(text)}</b></div>`; document.body.append(b); setTimeout(() => b.remove(), 2100);
}
function foeCardsList() { const fid = S.world.fightId; return Object.keys(S.world.enemies).filter(id => ENEMIES[id]?.loc === S.world.loc && (S.world.enemies[id].alive || (fid && S.world.enemies[id].fight === fid))); }
function renderCombatHud() {
  const hud = document.getElementById("combat-hud"); if (!hud || !S) return; const on = !!S.world.combat && !S.dead && !!aliveEnemiesHere().length;
  document.body.classList.toggle("in-combat", on); const c = C(); document.body.classList.toggle("low-hp", on && c.hp > 0 && c.hp <= c.maxHp * .3); lowHpBeat(on && c.hp > 0 && c.hp <= c.maxHp * .3);
  if (!on) { if (hudWas) { hudWas = false; hud.classList.add("out"); setTimeout(() => { if (!S?.world.combat) { hud.hidden = true; hud.innerHTML = ""; hud.classList.remove("out"); } }, 380); } return; }
  ensureIntents(); const tgt = curTarget();
  if (!hudWas || !hud.querySelector(".cb-foes")) { hudWas = true; hud.hidden = false; hud.classList.remove("out"); hud.innerHTML = `<div class="cb-head"><span class="cb-round"></span><div class="cb-hero"></div><button type="button" class="cb-min" title="Свернуть панель" aria-label="Свернуть боевую панель">▾</button></div><div class="cb-foes"></div><div class="cb-acts"></div>`;
    hud.querySelector(".cb-min").onclick = () => { hud.classList.toggle("mini"); }; if (!S.world.hudSeen || S.world.hudSeen !== S.world.fightId) { S.world.hudSeen = S.world.fightId; combatBanner("Бой!"); sfx("horn3"); } }
  const hc = hcond(); hud.querySelector(".cb-round").innerHTML = `${ico("k_swords", 16)}<span>Раунд ${S.world.round || 1}</span><b>${busy ? "ход врагов…" : "ваш ход"}</b>`;
  const hp = c.hp / c.maxHp; hud.querySelector(".cb-hero").innerHTML = `<span class="cb-hp"><i style="width:${hp * 100}%;background:${hp > .5 ? "var(--kelp)" : hp > .25 ? "var(--lantern)" : "var(--ember)"}"></i><b>${c.hp} / ${c.maxHp}</b></span><span class="cb-ac" title="Класс доспеха">${ico("i_shield", 13)} ${c.ac}</span>${Object.keys(hc).filter(k => COND_RU[k] && hc[k]).map(k => `<span class="cb-cond ${k}" title="${COND_RU[k]}">${ico(COND_ICO[k], 13)}${COND_RU[k]}</span>`).join("")}`;
  const box = hud.querySelector(".cb-foes"); const ids = foeCardsList(); const keep = new Set(ids);
  [...box.children].forEach(el => { if (!keep.has(el.dataset.id)) el.remove(); });
  ids.forEach(id => { const e = S.world.enemies[id], E = ENEMIES[id]; let el = box.querySelector(`[data-id="${id}"]`);
    if (!el) { el = document.createElement("button"); el.type = "button"; el.className = "cb-foe enter"; el.dataset.id = id; el.innerHTML = `<span class="cb-fi">${ico(FOE_ICO[E.type] || "e_bandit", 34)}</span><span class="cb-fb"><b class="cb-fn"></b><span class="cb-fhp"><i></i></span><span class="cb-fst"></span><span class="cb-fint"></span><span class="cb-fcs"></span></span><span class="cb-stamp"></span>`; box.append(el); el.onclick = () => setTarget(id); setTimeout(() => el.classList.remove("enter"), 500); }
    const dead = !e.alive; const fc = fcond(id); const it = intentInfo(id); el.classList.toggle("dead", dead && !e.fled && !e.surrendered); el.classList.toggle("gone", !!(e.fled || e.surrendered)); el.classList.toggle("tgt", id === tgt && !dead); el.classList.toggle("boss", !!E.boss); el.disabled = dead;
    el.querySelector(".cb-fn").textContent = E.name; const p = e.hp / E.hp; const bar = el.querySelector(".cb-fhp i"); bar.style.width = (p * 100) + "%"; bar.style.background = p > .6 ? "#c9573f" : p > .3 ? "#d87a2f" : "#e8a33a";
    el.querySelector(".cb-fst").textContent = dead ? (e.fled ? "сбежал" : e.surrendered ? "сдался" : "повержен") : e.known ? `${e.hp}/${E.hp} HP · КД ${E.ac}` : `${enemyStatus(id)}${e.acKnown ? " · КД " + E.ac : ""}`;
    el.querySelector(".cb-fint").innerHTML = it && !dead ? `${ico(it.ico, 13)}<span>${esc(it.t)}</span>` : ""; el.querySelector(".cb-fint").className = "cb-fint " + (it?.c || ""); el.title = it?.warn ? `${it.t}: ${it.warn}` : "Выбрать целью";
    el.querySelector(".cb-fcs").innerHTML = dead ? "" : Object.keys(fc).filter(k => fc[k] && COND_RU[k]).map(k => `<i class="cb-cond ${k}" title="${COND_RU[k]}">${ico(COND_ICO[k], 12)}</i>`).join("");
    el.querySelector(".cb-stamp").textContent = dead ? (e.fled ? "СБЕЖАЛ" : e.surrendered ? "СДАЛСЯ" : "ПОВЕРЖЕН") : ""; });
  /* действия */
  const acts = hud.querySelector(".cb-acts"); acts.innerHTML = ""; const T = tgt ? ENEMIES[tgt] : null; const dis = busy || !!S.dying || c.hp <= 0;
  const btn = (cls, iconHTML, t, sub, fn, d, title) => { const b = document.createElement("button"); b.type = "button"; b.className = "cb-act " + cls; b.disabled = !!d; b.innerHTML = `${iconHTML}<span><b>${esc(t)}</b><small>${sub}</small></span>`; if (title) b.title = title; b.onclick = fn; acts.append(b); return b; };
  if (hc.restrained) btn("warn", ico("k_web", 22), "Вырваться", `${SKILLS.athletics[0]} · КС 12`, () => takeTurn("Рву липкую паутину и пытаюсь вырваться", { checks: [], cact: "breakfree" }), dis);
  c.weapons.forEach(wid => { if (!WEAPONS[wid] || !T) return; const a = weaponAtk(wid); const d = wDef(wid); const adv = heroAttackAdv(tgt, wid, null, true); const ch = Math.round(hitChance(a.bonus, S.world.enemies[tgt].acKnown || S.world.enemies[tgt].known ? T.ac : T.ac, adv) * 100);
    const b = btn("atk", weaponTile(d, 30), a.w.name, `${ch}% · ${weaponDice(c, d)}${a.dmgMod ? fmt(a.dmgMod) : ""}${adv > 0 ? " · ⬆" : adv < 0 ? " · ⬇" : ""}`, () => takeTurn(`Атакую: ${T.name} (${a.w.name.toLowerCase()})`, { checks: [{ kind: "attack", target: tgt, weapon: wid, reason: "Атака оружием" }], combat: true }), dis, `Шанс попасть по цели: ${ch}%`); b.style.setProperty("--wc", d.col || "#d8ccb0"); });
  (c.spells || []).forEach(sid => { const sp = SPELLS[sid]; if (!sp) return; const self = ["heal", "buff", "smite"].includes(sp.kind); const needT = !self && sp.kind !== "sleep"; if (!hasSlot(sp.lvl, c) && sp.lvl) return; if (sp.kind === "heal" && c.hp >= c.maxHp) return;
    const sub = sp.kind === "attack" && T ? `${Math.round(hitChance(spellAtk(), T.ac, heroAttackAdv(tgt, null, null, true)) * 100)}% · ${sp.lvl ? sp.lvl + " круг" : "заговор"}` : sp.lvl ? `${sp.lvl} круг` : "заговор";
    btn("spell", ico("k_book", 22), sp.name, sub, () => takeTurn(`Применяю «${sp.name}»${needT && T ? ": " + T.name : self ? " на себя" : ""}`, { checks: [{ kind: "spell", spell: sid, target: needT ? tgt : null, reason: sp.desc }], combat: true }), dis || (needT && !T), sp.desc); });
  { const rs = resOf(c); if (c.cls === "barbarian" && !c.rage && rs.rage > 0) btn("cls", ico("c_barbarian", 22), "Ярость", "+2 урона, урон по вам ÷2", () => { rs.rage--; c.rage = true; pushFeed({ t: "chips", items: [{ c: "dmg", x: "Ярость! +2 к урону, урон по вам вдвое меньше" }] }); sfx("horn"); after(); }, dis);
    if (c.cls === "fighter" && c.secondWind && c.hp < c.maxHp) btn("cls", ico("k_heart", 22), "Второе дыхание", `1d10+${c.level} HP · бонусное`, () => { const d = rollDice("1d10"); const got = healHero(d.total + c.level); c.secondWind = false; pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · Второе дыхание` }] }); sfx("heal"); fxHeroHeal(got); after(); }, dis);
    if (RACES[c.race]?.breath && rs.breath) btn("cls", ico("e_storm", 22), "Оружие дыхания", "по всем врагам", () => takeTurn("Выдыхаю пламя на врагов", { checks: [{ kind: "breath" }], combat: true }), dis); }
  btn("def", ico("k_dodge", 22), "Уклонение", "враги бьют с помехой", () => takeTurn("Ухожу в глухую оборону, уклоняюсь от ударов", { checks: [], cact: "dodge", combat: true }), dis);
  if (T) btn("def", ico("k_push", 22), "Толкнуть", `${SKILLS.athletics[0]} ${fmt(skillBonus("athletics"))} · КС ${10 + Math.max(0, T.atk - 2)}`, () => takeTurn(`Толкаю ${T.name}, пытаюсь сбить с ног`, { checks: [], cact: "shove", target: tgt, combat: true }), dis, "Сбитый с ног враг тратит ход, чтобы встать — и теряет свой замысел");
  if (T && !S.world.enemies[tgt].known) btn("def", ico("x_look", 22), "Оценить врага", "повадки и брешь", () => takeTurn(`Присматриваюсь к врагу: ${T.name}`, { checks: [], cact: "assess", target: tgt, combat: true }), dis);
  const pot = c.items.find(i => i.potion || ["potion", "potion2"].includes(itemIdOf(i))); if (pot && c.hp < c.maxHp) btn("heal", ico("i_potion", 22), "Выпить зелье", esc(pot.name), () => takeTurn(`Выпиваю ${pot.name.toLowerCase()}`, { checks: [], cact: "potion", combat: true }), dis);
  const ven = c.items.find(i => i.venom); if (ven && !(c.venom > 0)) btn("cls", ico("k_venom", 22), "Смазать ядом", "3 удара +1d4", () => { c.venom = 3; removeItem(c, ven); pushFeed({ t: "chips", items: [{ c: "dmg", x: "Клинок смазан ядом: 3 удара +1d4" }] }); sfx("poison"); after(); }, dis);
  btn("run", ico("t_run", 22), "Отступить", `${mod(c.scores.dex) >= mod(c.scores.str) ? SKILLS.acrobatics[0] : SKILLS.athletics[0]} · КС ${9 + aliveEnemiesHere().length * 2 + (hc.restrained ? 4 : 0)}`, () => takeTurn("Пытаюсь вырваться из боя и отступить", { checks: [], cact: "escape", combat: true }), dis);
}
/* ---------- анимации и эффекты ---------- */
function floatNum(host, text, cls) { if (!host) return; const s = document.createElement("span"); s.className = "fnum " + (cls || ""); s.textContent = text; s.style.left = (30 + Math.random() * 40) + "%"; host.append(s); setTimeout(() => s.remove(), 1300); }
function pulse(el, cls, ms = 600) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); }
function shakeScreen(big) { const m = document.getElementById("story"); pulse(m, big ? "shake-big" : "shake", 520); }
function hurtFlash(big) { const f = document.createElement("div"); f.className = "hurt-flash" + (big ? " big" : ""); document.body.append(f); setTimeout(() => f.remove(), 700); }
function fxHeroHeal(n) { const h = document.querySelector("#combat-hud .cb-hero"); floatNum(h, "+" + n, "heal"); pulse(h, "healed", 900); }
/* эффекты на плане сцены */
function scTok(key) { const svg = document.querySelector("#scene-view svg.sc-svg"); if (!svg) return null; const g = [...svg.querySelectorAll(".sc-tok")].find(x => x.getAttribute("data-k") === key); if (!g) return null; const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(g.getAttribute("style") || ""); return m ? { g, x: +m[1], y: +m[2], svg } : null; }
function scFx(svg, x, y, html, ms = 900) { const NS = "http://www.w3.org/2000/svg"; const g = document.createElementNS(NS, "g"); g.setAttribute("class", "sc-fx"); g.setAttribute("transform", `translate(${x} ${y})`); g.innerHTML = html; svg.append(g); setTimeout(() => g.remove(), ms); return g; }
function lunge(a, b) { if (!a || !b) return; const dx = (b.x - a.x) * .35, dy = (b.y - a.y) * .35; const base = a.g.getAttribute("style"); a.g.style.transition = "transform .14s ease-out"; a.g.style.transform = `translate(${a.x + dx}px, ${a.y + dy}px)`; setTimeout(() => { a.g.style.transform = `translate(${a.x}px, ${a.y}px)`; setTimeout(() => { a.g.style.transition = ""; }, 200); }, 150); }
function slashFx(t, crit, color) { if (!t) return; const c = color || (crit ? "#ffd27a" : "#f4e6c8"); scFx(t.svg, t.x, t.y, `<path class="fx-slash" d="M-18 -14 Q 2 -2 18 16" stroke="${c}" stroke-width="${crit ? 5 : 3.4}" fill="none" stroke-linecap="round"/>${crit ? `<path class="fx-slash d2" d="M16 -16 Q 0 0 -16 16" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>` : ""}<circle class="fx-burst" r="10" fill="none" stroke="${c}" stroke-width="2.4"/>`); }
function boltFx(a, b, color, ok) { if (!a || !b) return; const dx = b.x - a.x, dy = b.y - a.y; const g = scFx(a.svg, a.x, a.y, `<g class="fx-bolt" style="--dx:${dx}px;--dy:${dy}px"><circle r="5.5" fill="${color}"/><circle r="10" fill="${color}" opacity=".35"/></g>`, 700); if (ok) setTimeout(() => scFx(a.svg, b.x, b.y, `<circle class="fx-burst big" r="12" fill="${color}" opacity=".55"/>`, 700), 330); }
function arrowFx(a, b) { if (!a || !b) return; const dx = b.x - a.x, dy = b.y - a.y; const ang = Math.atan2(dy, dx) * 180 / Math.PI; scFx(a.svg, a.x, a.y, `<g class="fx-arrow" style="--dx:${dx}px;--dy:${dy}px"><g transform="rotate(${ang})"><path d="M-12 0 L10 0 M10 0 L4 -4 M10 0 L4 4" stroke="#e9dcb8" stroke-width="2.2" fill="none" stroke-linecap="round"/></g></g>`, 600); }
function deathFx(t) { if (!t) return; scFx(t.svg, t.x, t.y, `<circle class="fx-burst big" r="16" fill="none" stroke="#e8735a" stroke-width="3"/><circle class="fx-smoke" r="12" fill="#2a1210"/>`, 1000); }
const SPELL_COL = { fire: "#ff8a3d", lightning: "#9fd8ff", holy: "#ffe28a", dark: "#b07ae0", missile: "#c59af0" };
function combatFx(r) {
  if (!r || !S?.world) return; const hud = document.getElementById("combat-hud"); const hero = scTok("hero:");
  if (r.kind === "attack" || (r.kind === "spell" && r.target)) {
    const card = hud?.querySelector(`.cb-foe[data-id="${r.target}"]`); const foe = scTok("foe:" + r.target); if (S.world.enemies[r.target]) S.world.enemies[r.target].acKnown = true;
    if (r.kind === "attack") { if (isRangedW(r.weapon)) arrowFx(hero, foe); else lunge(hero, foe); } else boltFx(hero, foe, SPELL_COL[spellSfx(SPELLS[r.spell])] || "#c59af0", r.ok);
    setTimeout(() => { if (r.ok) { pulse(card, r.crit ? "crit" : "hit", 650); floatNum(card, (r.dmg ? "−" + r.dmg : "✓") + (r.crit ? " КРИТ" : ""), r.crit ? "crit" : "dmg"); if (r.kind === "attack") slashFx(foe, r.crit); if (r.crit) shakeScreen(true); }
      else { pulse(card, "miss", 500); floatNum(card, "промах", "miss"); }
      if (r.enemyAfter === "повержен") { setTimeout(() => { pulse(card, "dying", 900); deathFx(foe); sfx(foeSnd(r.target, 2)); }, 260); } }, r.kind === "spell" ? 340 : 160);
    return; }
  if (r.kind === "breath") { aliveEnemiesHere().forEach(id => { const t = scTok("foe:" + id); boltFx(hero, t, "#ff8a3d", true); }); shakeScreen(); return; }
  if (r.kind === "enemy") {
    const card = hud?.querySelector(`.cb-foe[data-id="${r.by}"]`); const foe = scTok("foe:" + r.by); const hh = hud?.querySelector(".cb-hero");
    if (r.summon) { setTimeout(() => sfx("growl2"), 100); return; } if (r.fled || r.surrendered) { pulse(card, "leave", 800); return; }
    if (r.bleed) { floatNum(card, "−" + r.bleed, "bleed"); pulse(card, "hit", 500); return; } if (r.skip) return;
    pulse(card, "lunge", 450); if (r.special === "Паутина") { boltFx(foe, hero, "#e8e0d0", r.ok); } else if (r.snd === "crossbow") arrowFx(foe, hero); else lunge(foe, hero);
    setTimeout(() => { if (r.ok) { floatNum(hh, r.dmg ? "−" + r.dmg : (r.cond ? COND_RU[r.cond] : "!"), r.crit ? "crit" : "hurt"); pulse(hh, "hurt", 600); hurtFlash(r.crit || r.dmg >= C().maxHp * .3); if (r.crit || r.special) shakeScreen(r.crit); slashFx(hero, r.crit, "#e8735a"); }
      else { floatNum(hh, "мимо", "miss"); pulse(hh, "evade", 500); } }, 200); }
}
/* ---------- звуки боя ---------- */
const WSND = { club: "club", greatclub: "club", dagger: "knife", knife: "knife", ritual: "knife", sickle: "knife", handaxe: "hatchet", cleaver: "hatchet", javelin: "spear", spear: "spear", trident: "spear", pike: "spear",
  lhammer: "mace", mace: "mace", warhammer: "mace", maul: "mace", morningstar: "mace", warpick: "mace", staff: "staff", wstaff: "staff", lcrossbow: "crossbow", sling: "throw", shortbow: "bow", longbow: "bow",
  battleaxe: "axe", greataxe: "axe", bigaxe: "axe", glaive: "axe", halberd: "axe", scythe: "axe", reaper: "axe", flail: "flail", whip: "flail", rapier: "dagger", longsword: "sword", greatsword: "sword", shortsword: "sword", scimitar: "sword", katana: "sword", sabre: "sword" };
const WMISS = { bow: "bow-miss", crossbow: "xbow-miss", club: "club-miss", mace: "mace-miss", staff: "staff-miss", spear: "spear-miss" };
function foeSnd(id, i) { const K = kitOf(id); return K.snd?.[i] || ["sword", "hurt", "die"][i]; }
function heroHurtSnd() { return C().gender === "f" ? "hero-f-hit" : "hurt"; }
let beatT = null;
function lowHpBeat(on) { if (!on) { clearInterval(beatT); beatT = null; return; } if (beatT || !AU.cfg.on || !AU.unlocked) return; const beat = () => { try { const ctx = AU.ctx || (AU.ctx = new (window.AudioContext || window.webkitAudioContext)()); [0, .23].forEach((t0, k) => { const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = "sine"; o.frequency.value = k ? 48 : 58; const t = ctx.currentTime + t0; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(AU.cfg.sfx * .55, t + .02); g.gain.exponentialRampToValueAtTime(.001, t + .22); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + .25); }); } catch (e) {} }; beat(); beatT = setInterval(() => { if (!document.body.classList.contains("low-hp")) { clearInterval(beatT); beatT = null; return; } beat(); }, 1150); }
