import re
SP='/tmp/claude-0/-home-claude/ff38720c-3120-5f73-a61d-2b206726c719/scratchpad'
p='/home/claude/salt-harbor.html'; s=open(p).read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:110],s.count(a)); s=s.replace(a,b)
icons=open(SP+'/icons.js').read(); hero=open(SP+'/hero.js').read(); trade=open(SP+'/trade.js').read(); creat=open(SP+'/creation.js').read()
hero=hero.replace('function weaponProf(c, wid) { const d = wDef(wid);','function weaponProf(c, wid) { const d = typeof wid === "object" ? wid : wDef(wid);')
# 1 replace trade section with icons+hero+trade+creation
i=s.index('/* TRADE */\n'); j=s.index('\n/* =========================================================================\n   ЗВУК: музыка по настроению')
s=s[:i]+'/* ICONS */\n'+icons+'\n/* HERO */\n'+hero+'\n/* TRADE */\n'+trade+'\n/* CREATION2 */\n'+creat+s[j:]
# remove old creation functions (first occurrences, before CREATION2)
cut=s.index('/* CREATION2 */')
for fn in ["stepRace","stepClass","stepSkills","stepLook","stepMode","renderHeroCard"]:
    a=s.index('function %s('%fn)
    assert a<cut, fn
    b=s.index('\n}\n',a)+3
    s=s[:a]+s[b:]; cut=s.index('/* CREATION2 */')
# 2 steps
rep('const STEP_NAMES = ["Мир", "Раса", "Класс", "Характеристики", "Навыки", "Облик", "Рассказчик"];','const STEP_NAMES = ["Мир", "Раса", "Класс", "Характеристики", "Прошлое", "Снаряжение", "Облик и характер", "Рассказчик"];')
rep('"Выберите предысторию и навыки класса", "Введите имя (от 2 букв)", "Готово к приключению"];','"Выберите предысторию и навыки класса", "Выберите набор снаряжения", "Введите имя (от 2 букв)", "Готово к приключению"];')
rep('[stepWorld, stepRace, stepClass, stepAbil, stepSkills, stepLook, stepMode][D.step](body);','[stepWorld, stepRace, stepClass, stepAbil, stepSkills, stepGear, stepLook, stepMode][D.step](body);')
rep('nx.textContent = D.step === 6 ? "Начать приключение" : "Далее";','nx.textContent = D.step === 7 ? "Начать приключение" : "Далее";')
rep('(D.step === 6 ? "Мир ждёт" : "Можно дальше")','(D.step === 7 ? "Мир ждёт" : "Можно дальше")')
rep('if (D.step < 6) { D.step++;','if (D.step < 7) { D.step++;')
rep('''  if (i === 5) return D.name.trim().length >= 2;''','''  if (i === 5) return !!D.cls && !!KITS[D.cls];
  if (i === 6) return D.name.trim().length >= 2;''')
rep('rolled: null, bg: null, skills: [], name: "", gender: "m", about: "", lookDesc: "", img: "", gen: false, sl1: 50, sl2: 50, epithet: "", story: "", mode: "sandbox" };','rolled: null, bg: null, skills: [], name: "", gender: "m", about: "", lookDesc: "", img: "", gen: false, sl1: 50, sl2: 50, sl3: 50, sl4: 50, sl5: 50, sl6: 50, sl7: 50, kit: 0, kitSeed: 0, kitW: null, favored: "humanoids", epithet: "", story: "", mode: "sandbox" };')
# 3 finishCreation
rep('''    hp, maxHp: hp, ac: calcAC(D.cls, sc), hitDice: 1, slots, spells: cls.spells || [], weapons: cls.weapons.slice(), secondWind: D.cls === "fighter",
    items: [...cls.items.map(n => ({ name: n })), { name: "Зелье лечения", potion: true }, { name: "Факел" }, { name: "Верёвка, 15 м" }],
    gold: 10, epithet: D.epithet, story: D.story || templateStory(), persona: personality(D.sl1, D.sl2), about: D.about, look: D.lookDesc, img: D.img, hook: bgHook(D.bg, wd) };''','''    hp, maxHp: hp, ac: 10, hitDice: 1, slots, spells: (cls.spells || []).slice(), weapons: [], wdefs: {}, secondWind: D.cls === "fighter",
    items: [], gold: 10, silver: 0, epithet: D.epithet, story: D.story || templateStory(), persona: traitWords(D), about: D.about, look: D.lookDesc, img: D.img, hook: bgHook(D.bg, wd),
    traits: Object.fromEntries(TRAITS.map(t => [t.k, D[t.k] ?? 50])), favored: D.cls === "ranger" ? (D.favored || "humanoids") : null };
  { const dk = draftKit(); const K = dk.kit; dk.list.forEach(d => giveWeapon(char, { ...d }));
    if (K.armor) char.items.push({ name: ITEMS[K.armor].n, id: K.armor, desc: ITEMS[K.armor].d }); if (K.shield) char.items.push({ name: "Щит", id: "shield", desc: ITEMS.shield.d });
    (CLASS_GEAR[D.cls] || []).forEach(n => char.items.push({ name: n })); const bg = BACKGROUNDS[D.bg]; if (bg.item) char.items.push({ name: bg.item, ...(ITEM_BY_NAME[bg.item.toLowerCase()] ? { id: ITEM_BY_NAME[bg.item.toLowerCase()] } : {}) });
    char.items.push({ name: "Зелье лечения", id: "potion", potion: true, heal: "2d4+2" }, { name: "Факел", id: "torch" }, { name: "Верёвка, 15 м", id: "rope" });
    char.gear = { armor: K.armor || null, shield: !!K.shield }; recalcAC(char); setPurse(char, (bg.gold || 10) * 10); char.res = resMax(char); }''')
rep('''  const npcs = {}; Object.keys(NPCS).forEach(id => npcs[id] = { att: 0, mem: [] });''','''  const npcs = {}; Object.keys(NPCS).forEach(id => npcs[id] = { att: baseAttitude(id, char), mem: [] });''')
rep('''threat: 0, met: [], notes: {}, rumors: [] }, suggestions: [], settings: { len: "normal", voice: false } };''','''threat: 0, met: [], notes: {}, rumors: [], rep: traitFx(char.traits).rep }, suggestions: [], settings: { len: "normal", voice: false } };''')
# 4 weaponAtk
rep('''return { w, ab, bonus: mod(c.scores[ab]) + (weaponProf(c, wid) ? prof(c.level) : 0), dmgMod: mod(c.scores[ab]) };''','''return { w, ab, bonus: mod(c.scores[ab]) + (weaponProf(c, wid) ? prof(c.level) : 0) + (w.hit || 0), dmgMod: mod(c.scores[ab]) + (w.dmg || 0) };''')
rep('function skillBonus(key) { const c = C(); const [, ab] = SKILLS[key]; return mod(c.scores[ab]) + (c.skills.includes(key) ? prof(c.level) : 0); }','function skillBonus(key) { const c = C(); const [, ab] = SKILLS[key]; return mod(c.scores[ab]) + (c.skills.includes(key) ? prof(c.level) : 0) + (traitFx(c.traits || { sl1: c.sl1, sl2: c.sl2 }).skills[key] || 0); }')
# 5 resolveCheck: skill insp, save gnome+insp, attack rewrite, breath
rep('''    if (c.bless) { ch.adv = 1; c.bless = false; ch.reason = (ch.reason ? ch.reason + "; " : "") + "благословение"; } const r = d20(ch.adv); const b = skillBonus(ch.skill); const tot = r.nat + b; const ok = r.nat === 20 ? true : tot >= ch.dc;
    return { ...ch, nat: r.nat, pair: r.pair, bonus: b, total: tot, ok, crit: r.nat === 20, fumble: r.nat === 1,
      title: `Проверка: ${SKILLS[ch.skill][0]}`, formula: `d20 (${r.pair ? r.pair.join(" / ") : r.nat}) ${fmt(b)} = ${tot} против КС ${ch.dc}` };''','''    if (c.bless) { ch.adv = 1; c.bless = false; ch.reason = (ch.reason ? ch.reason + "; " : "") + "благословение"; } const r = d20(ch.adv); const ins = useInsp(c); const b = skillBonus(ch.skill) + (ins?.total || 0); const tot = r.nat + b; const ok = r.nat === 20 ? true : tot >= ch.dc;
    return { ...ch, nat: r.nat, pair: r.pair, bonus: b, total: tot, ok, crit: r.nat === 20, fumble: r.nat === 1,
      title: `Проверка: ${SKILLS[ch.skill][0]}`, formula: `d20 (${r.pair ? r.pair.join(" / ") : r.nat}) ${fmt(b)}${ins ? ` (вдохновение ${ins.total})` : ""} = ${tot} против КС ${ch.dc}` };''')
rep('''    const r = d20(ch.adv); const b = saveBonus(ch.ability); const tot = r.nat + b; const ok = tot >= ch.dc;''','''    const adv = ch.adv || (RACES[c.race]?.gnomish && ["int", "wis", "cha"].includes(ch.ability) ? 1 : 0); const r = d20(adv); const ins = useInsp(c); const b = saveBonus(ch.ability) + (ins?.total || 0); const tot = r.nat + b; const ok = tot >= ch.dc;''')
i=s.index('  if (ch.kind === "attack") {\n    const e = S.world.enemies[ch.target];'); j=s.index('  if (ch.kind === "spell") return castSpell(ch);',i)
s=s[:i]+'''  if (ch.kind === "attack") {
    const e = S.world.enemies[ch.target]; const E = ENEMIES[ch.target]; const { w, ab, bonus, dmgMod } = weaponAtk(ch.weapon); const d = wDef(ch.weapon) || { props: [], crit: 20 }; const g = gearOf(c); const notes = [];
    let adv = ch.adv || (e.asleep ? 1 : 0); if (c.bless) { adv = Math.max(adv, 1); c.bless = false; notes.push("благословение"); }
    if (d.props.includes("heavy") && RACES[c.race]?.small) { adv = Math.min(adv, 0) - 1; notes.push("тяжёлое для маленького: помеха"); } if (d.props.includes("two") && g.shield && !d.props.includes("ranged")) { adv = Math.min(adv, 0) - 1; notes.push("двуручное со щитом: помеха"); }
    adv = clamp(adv, -1, 1); const r = d20(adv); const ins = useInsp(c); const tot = r.nat + bonus + (ins?.total || 0);
    const critOn = Math.min(c.cls === "fighter" && c.level >= 3 ? 19 : 20, d.crit || 20); const isCrit = r.nat >= critOn; const hit = isCrit || (r.nat !== 1 && tot >= E.ac);
    let dmg = null, extra = "";
    if (hit) {
      dmg = rollDice({ ...parseDice(weaponDice(c, d)), mod: dmgMod }, isCrit); const add = (label, dice) => { const x = typeof dice === "number" ? { total: dice, text: String(dice) } : rollDice(dice, isCrit); dmg.total += x.total; extra += ` + ${label} ${x.text}`; };
      if (c.cls === "rogue" && adv > 0 && !S.turnSneak) { add("скрытая атака", Math.ceil(c.level / 2) + "d6"); S.turnSneak = true; }
      if (c.rage && !w.ranged && ab === "str") add("ярость", 2);
      if (d.vs?.undead && UNDEAD.has(E.type)) add("серебро/свет", d.vs.undead);
      if (c.mark && c.mark.target === ch.target) add(c.mark.name.toLowerCase(), c.mark.dice);
      if (c.smite) { add("кара", UNDEAD.has(E.type) ? "3d8" : "2d8"); c.smite = false; }
      if (c.favored && FAVORED[c.favored]?.[2].has(E.type)) add("избранный враг", 2);
      if (c.cls === "ranger" && c.level >= 3 && e.hp < E.hp && !S.turnColossus) { add("охотник", "1d8"); S.turnColossus = true; }
      hurtEnemy(ch.target, dmg.total);
    }
    return { ...ch, nat: r.nat, pair: r.pair, total: tot, ok: hit, crit: isCrit, fumble: r.nat === 1, dmg: dmg?.total || 0, title: `Атака: ${w.name} → ${E.name}${ch.extra ? " (вторая)" : ""}`,
      formula: `d20 (${r.pair ? r.pair.join(" / ") : r.nat}) ${fmt(bonus)}${ins ? ` + вдохновение ${ins.total}` : ""} = ${tot} против КД ${E.ac}${notes.length ? " · " + notes.join(", ") : ""}` + (hit ? ` · урон ${dmg.text}${extra}` : ""), enemyAfter: enemyStatus(ch.target) };
  }
  if (ch.kind === "breath") {
    const res = resOf(c); res.breath = 0; const dc = 8 + mod(c.scores.con) + prof(c.level); const dice = c.level >= 5 ? "3d6" : "2d6"; const dd = rollDice(dice); const parts = [];
    aliveEnemiesHere().forEach(id => { const E = ENEMIES[id]; const sv = rnd(20) + E.dex; const amt = sv >= dc ? Math.floor(dd.total / 2) : dd.total; hurtEnemy(id, amt); parts.push(`${E.name}: −${amt}${sv >= dc ? " (увернулся наполовину)" : ""}`); });
    return { ...ch, nat: 0, ok: true, dmg: 0, title: "Оружие дыхания", formula: `${dice} = ${dd.total} огнём, спасбросок ЛОВ КС ${dc} · ${parts.join("; ") || "некого задеть"}` };
  }
'''+s[j:]
# 6 validatePlan
rep('''if (C().cls === "fighter" && C().level >= 5) out.checks.push({ ...a, extra: true, reason: "Дополнительная атака" }); }''','''if (EXTRA_ATK.has(C().cls) && C().level >= 5) out.checks.push({ ...a, extra: true, reason: "Дополнительная атака" }); }''')
rep('''      const sp = SPELLS[ch.spell]; const needT = sp.kind !== "heal" && sp.kind !== "sleep";''','''      const sp = SPELLS[ch.spell]; const needT = !["heal", "sleep", "buff", "smite"].includes(sp.kind);''')
rep('''    } else if (ch.kind) out.notes.push("Движок отклонил проверку, которой нет в правилах.");''','''    } else if (ch.kind === "breath" && RACES[C().race]?.breath && resOf(C()).breath > 0 && aliveEnemiesHere().length) out.checks.push({ kind: "breath", reason: "Оружие дыхания" });
    else if (ch.kind) out.notes.push("Движок отклонил проверку, которой нет в правилах.");''')
rep('''- Атака оружием только по врагу из списка ВРАГИ: {"kind":"attack","target":"id","weapon":"${C().weapons[0]}"}. Оружие героя: ${C().weapons.join(", ")}.''','''- Атака оружием только по врагу из списка ВРАГИ: {"kind":"attack","target":"id","weapon":"${C().weapons[0]}"}. Оружие героя (id — название): ${C().weapons.map(w => w + " — " + (WEAPONS[w]?.name || w)).join(", ")}.''')
# 7 castSpell kinds & slots
rep('''function useSlot(lvl) { const s = C().slots; if (!lvl) return true; if (!s[lvl] || s[lvl][1] <= 0) return false; s[lvl][1]--; return true; }''','''function hasSlot(lvl, c) { c = c || C(); if (!lvl) return true; return Object.entries(c.slots || {}).some(([l, v]) => +l >= lvl && v[1] > 0); }
function useSlot(lvl) { const s = C().slots; if (!lvl) return true; const l = Object.keys(s).map(Number).sort((a, b) => a - b).find(x => x >= lvl && s[x][1] > 0); if (!l) return false; s[l][1]--; return true; }''')
rep('''  if (sp.kind === "auto") {''','''  if (sp.kind === "mark") { C().mark = { target: ch.target, dice: sp.dice, name: sp.name }; return { ...base, nat: 0, ok: true, formula: `${E.name}: ваши попадания наносят ещё ${sp.dice} до конца боя` }; }
  if (sp.kind === "buff") { C().bless = true; return { ...base, title: `Заклинание: ${sp.name}`, nat: 0, ok: true, formula: "Преимущество на следующую проверку или атаку" }; }
  if (sp.kind === "smite") { C().smite = true; return { ...base, title: `Заклинание: ${sp.name}`, nat: 0, ok: true, formula: "Следующее попадание оружием: +2d8 излучения" }; }
  if (sp.kind === "auto") {''')
rep('''    let d = null; if (hit) { d = rollDice(sp.dice, r.nat === 20); hurtEnemy(ch.target, d.total); }''','''    let d = null; if (hit) { d = rollDice(sp.dice, r.nat === 20); if (ch.spell === "eldritch_blast" && C().cls === "warlock" && C().level >= 2) d.total += castMod(); if (C().mark && C().mark.target === ch.target) { const x = rollDice(C().mark.dice); d.total += x.total; d.text += " + " + x.text; } hurtEnemy(ch.target, d.total); }''')
rep('function slotsFor(cls, lvl) { if (!CLASSES[cls].spells) return {}; return { ...SLOT_TABLE[clamp(lvl, 1, 5)] }; }','function slotsFor(cls, lvl) { const C0 = CLASSES[cls]; lvl = clamp(lvl, 1, 5); if (C0.half) return { ...HALF_SLOTS[lvl] }; if (C0.pact) return { ...PACT_SLOTS[lvl] }; if (!C0.spells) return {}; return { ...SLOT_TABLE[lvl] }; }')
rep('''  const feat = LEVEL_FEATS[c.cls][nl]; const newSpell = LEVEL_SPELLS[c.cls]?.[nl];''','''  const feat = LEVEL_FEATS[c.cls][nl]; const newSpells = [].concat(LEVEL_SPELLS[c.cls]?.[nl] || []); const newSpell = newSpells[0]; const ns0 = slotsFor(c.cls, nl);''')
rep('''${CLASSES[c.cls].spells ? `<li>Ячейки: ${Object.entries(SLOT_TABLE[nl]).map(([l, n]) => `${l} круг ×${n}`).join(", ")}</li>` : ""}${newSpell ? `<li>Новое заклинание: ${SPELLS[newSpell].name}</li>` : ""}</ul>''','''${Object.keys(ns0).length ? `<li>Ячейки: ${Object.entries(ns0).map(([l, n]) => `${l} круг ×${n}`).join(", ")}</li>` : ""}${newSpells.length ? `<li>Новые заклинания: ${newSpells.map(x => SPELLS[x].name).join(", ")}</li>` : ""}</ul>''')
rep('''      if (CLASSES[c.cls].spells) { const ns = slotsFor(c.cls, nl); Object.entries(ns).forEach(([l, n]) => { const old = c.slots[l] || [0, 0]; c.slots[l] = [n, old[1] + (n - old[0])]; }); }
      if (newSpell && !c.spells.includes(newSpell)) c.spells.push(newSpell);''','''      { const ns = slotsFor(c.cls, nl); if (CLASSES[c.cls].pact) c.slots = {}; Object.entries(ns).forEach(([l, n]) => { const old = c.slots[l] || [0, 0]; c.slots[l] = [n, Math.max(0, old[1] + (n - old[0]))]; }); }
      newSpells.forEach(x => { if (!c.spells.includes(x)) c.spells.push(x); }); const rm = resMax(c); const rs = resOf(c); rs.lay = Math.min(rm.lay, (rs.lay || 0) + 5); rs.rage = Math.max(rs.rage || 0, rm.rage > (resMax({ ...c, level: c.level - 1 }).rage) ? (rs.rage || 0) + 1 : rs.rage || 0);''')
# 8 enemy turn rage, hurtHero relentless, combat end
rep('''    const nat = rnd(20); const tot = nat + E.atk; const hit = nat === 20 || (nat !== 1 && tot >= C().ac); let d = null; if (hit) { d = rollDice(E.dmg, nat === 20); hurtHero(d.total); }''','''    const nat = rnd(20); const tot = nat + E.atk; const hit = nat === 20 || (nat !== 1 && tot >= C().ac); let d = null; if (hit) { d = rollDice(E.dmg, nat === 20); if (C().rage) { d.total = Math.ceil(d.total / 2); d.text += " ÷2 ярость"; } hurtHero(d.total); }''')
rep('''function hurtHero(amt) { const c = C(); c.hp = Math.max(0, c.hp - amt); return amt; }''','''function hurtHero(amt) { const c = C(); c.hp = Math.max(0, c.hp - amt); if (c.hp === 0 && RACES[c.race]?.relentless && resOf(c).relentless > 0) { c.hp = 1; resOf(c).relentless = 0; pushFeed({ t: "chips", items: [{ c: "heal", x: "Неукротимость: вы остаётесь на ногах с 1 HP" }] }); } return amt; }''')
rep('''    if (S.world.combat && !aliveEnemiesHere().length) { S.world.combat = false; combatEnded = true;''','''    if (S.world.combat && !aliveEnemiesHere().length) { S.world.combat = false; combatEnded = true; C().rage = false; C().mark = null;''')
rep('''busy = true; setBusy(true); S.turnSneak = false; S.pendingXP = 0; refreshBuildings();''','''busy = true; setBusy(true); S.turnSneak = false; S.turnColossus = false; S.pendingXP = 0; refreshBuildings();''')
rep('''const ini = rnd(20); const tot = ini + mod(c.scores.dex);''','''const ini = rnd(20); const tot = ini + mod(c.scores.dex) + traitFx(c.traits || {}).init;''')
# 9 rests
rep('''if (c.cls === "fighter") c.secondWind = true; pushFeed({ t: "sys", html: "Короткий отдых: час тишины, перевязка, глоток воды." });''','''if (c.cls === "fighter") c.secondWind = true; restoreRes(c, "short"); pushFeed({ t: "sys", html: "Короткий отдых: час тишины, перевязка, глоток воды." });''')
rep('''c.secondWind = c.cls === "fighter"; Object.values(c.slots).forEach(s => s[1] = s[0]); pushFeed({ t: "sys", html: "<b>Долгий отдых.</b>''','''c.secondWind = c.cls === "fighter"; Object.values(c.slots).forEach(s => s[1] = s[0]); restoreRes(c, "long"); pushFeed({ t: "sys", html: "<b>Долгий отдых.</b>''')
# 10 sheet actions
rep('''    c.weapons.forEach(wid => { const a = weaponAtk(wid); tb.append(actBtn(`Атака: ${a.w.name}`, `${fmt(a.bonus)} к попаданию · ${a.w.dice}${fmt(a.dmgMod)}`, tgt ? `→ ${ENEMIES[tgt].name}` : "нет цели", !tgt || busy,
      () => takeTurn(`Атакую: ${ENEMIES[tgt].name} (${a.w.name.toLowerCase()})`, { checks: [{ kind: "attack", target: tgt, weapon: wid, reason: "Атака оружием" }] }))); });''','''    c.weapons.forEach(wid => { if (!WEAPONS[wid]) return; const a = weaponAtk(wid); const d = wDef(wid); const b = actBtn(`${a.w.name}`, `${weaponLine(c, wid)}${weaponProf(c, wid) ? "" : " · нет владения"}`, tgt ? `→ ${ENEMIES[tgt].name}` : "нет цели", !tgt || busy,
      () => takeTurn(`Атакую: ${ENEMIES[tgt].name} (${a.w.name.toLowerCase()})`, { checks: [{ kind: "attack", target: tgt, weapon: wid, reason: "Атака оружием" }] })); b.classList.add("w-act"); b.style.setProperty("--wc", d.col || "#d8ccb0"); b.insertAdjacentHTML("afterbegin", weaponTile(d, 34)); tb.append(b); });''')
rep('''    (c.spells || []).forEach(sid => { const sp = SPELLS[sid]; const self = sp.kind === "heal"; const lvlOk = !sp.lvl || (c.slots[sp.lvl] && c.slots[sp.lvl][1] > 0); const needT = !self && sp.kind !== "sleep";''','''    (c.spells || []).forEach(sid => { const sp = SPELLS[sid]; if (!sp) return; const self = ["heal", "buff", "smite"].includes(sp.kind); const lvlOk = hasSlot(sp.lvl, c); const needT = !self && sp.kind !== "sleep";''')
rep('''    if (c.cls === "fighter") tb.append(actBtn("Второе дыхание",''','''    { const rs = resOf(c); const inC = !!S.world.combat;
      if (c.cls === "barbarian") tb.append(actBtn(c.rage ? "В ярости" : "Ярость", "+2 к урону силой, вдвое меньше урона до конца боя", `${rs.rage} раз`, busy || !inC || c.rage || rs.rage < 1, () => { rs.rage--; c.rage = true; pushFeed({ t: "chips", items: [{ c: "dmg", x: "Ярость! +2 к урону, урон по вам вдвое меньше" }] }); sfx("horn"); after(); }));
      if (c.cls === "paladin") tb.append(actBtn("Наложение рук", `Запас исцеления: ${rs.lay} HP`, "касание", busy || rs.lay < 1 || c.hp >= c.maxHp, () => { const amt = Math.min(rs.lay, c.maxHp - c.hp); rs.lay -= amt; const got = healHero(amt); pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · Наложение рук` }] }); sfx("heal"); after(); }));
      if (c.cls === "bard") tb.append(actBtn(c.insp ? "Вдохновлены" : "Вдохновение", `+${c.level >= 5 ? "1d8" : "1d6"} к следующему броску`, `${rs.insp} раз`, busy || !!c.insp || rs.insp < 1, () => { rs.insp--; c.insp = c.level >= 5 ? "1d8" : "1d6"; pushFeed({ t: "chips", items: [{ c: "xp", x: `Вдохновение: +${c.insp} к следующему броску` }] }); sfx("chime"); after(); }));
      if (RACES[c.race]?.breath) tb.append(actBtn("Оружие дыхания", `${c.level >= 5 ? "3d6" : "2d6"} огнём по всем врагам, спасбросок ЛОВ`, rs.breath ? "1 раз" : "потрачено", busy || !inC || !rs.breath, () => takeTurn("Выдыхаю пламя на врагов", { checks: [{ kind: "breath" }] }))); }
    if (c.cls === "fighter") tb.append(actBtn("Второе дыхание",''')
# 11 shop haggle traits
rep('''function shopRoll(skill, dc) { sfx("dice"); const r = d20(C().bless ? 1 : 0); if (C().bless) C().bless = false; const b = skillBonus(skill);''','''function shopRoll(skill, dc) { sfx("dice"); const r = d20(C().bless ? 1 : 0); if (C().bless) C().bless = false; const b = skillBonus(skill) + traitFx(C().traits || {}).haggle;''')
# 12 attitudes
rep('''    if (!loc.npcs.includes(id)) loc.npcs.push(id); if (loc.inner) (loc.extra = loc.extra || []).push(id); else { loc.base = loc.base || []; if (!loc.base.includes(id)) loc.base.push(id); } S.world.npcs[id] = { att: 0, mem: [] };''','''    if (!loc.npcs.includes(id)) loc.npcs.push(id); if (loc.inner) (loc.extra = loc.extra || []).push(id); else { loc.base = loc.base || []; if (!loc.base.includes(id)) loc.base.push(id); } S.world.npcs[id] = { att: baseAttitude(id), mem: [] };''')
rep('''    p.npcs = [...new Set([...base.filter(x => !Object.prototype.hasOwnProperty.call(ov, x) || ov[x] === lid), ...(vis[lid] || [])])];
  }''','''    p.npcs = [...new Set([...base.filter(x => !Object.prototype.hasOwnProperty.call(ov, x) || ov[x] === lid), ...(vis[lid] || [])])];
    if (lid === S.world.loc) p.npcs.forEach(ensureNpcState);
  }''')
# 13 charBrief
rep('''  const c = C(); return `${c.name} (${c.gender === "f" ? "она" : "он"}), ${RACES[c.race].name},''','''  const c = C(); return `${c.name} (${c.gender === "f" ? "она" : "он"}), ${RACES[c.race].name} (как к таким относятся: ${(RACE_SOCIAL[c.race] || "").toLowerCase()}), оружие: ${c.weapons.map(w => WEAPONS[w]?.name).filter(Boolean).join(", ")}${c.rage ? ", СЕЙЧАС В ЯРОСТИ" : ""},''')
# 14 portraits / emblems: icon
rep('''<g transform="translate(14 14) scale(.72)">${cls ? EMBLEM[cls] : ""}</g>''','''${cls && ICONS["c_" + cls] ? `<g transform="translate(22 20) scale(.109)"><path fill="currentColor" d="${ICONS["c_" + cls]}"/></g>` : ""}''')
rep('''function emblemSVG(cls, size) { const c = CLASSES[cls]; return `''','''function emblemSVG(cls, size) { const c = CLASSES[cls]; if (ICONS["c_" + cls]) return `<span style="color:${c.color};display:inline-grid">${ico("c_" + cls, size)}</span>`; return `''')
# 15 register weapons on load
rep('''function startGame(fresh) {
  showScreen("screen-game");''','''function startGame(fresh) {
  registerWeapons(S.char); gearOf(S.char); resOf(S.char);
  showScreen("screen-game");''')
# 16 fire resistance on narrator damage
rep('''(Array.isArray(eff.damage) ? eff.damage : []).slice(0, 2).forEach(d => { const p = parseDice(d.dice); if (!p) return; p.n = Math.min(p.n, 3); const r = rollDice(p); hurtHero(r.total);''','''(Array.isArray(eff.damage) ? eff.damage : []).slice(0, 2).forEach(d => { const p = parseDice(d.dice); if (!p) return; p.n = Math.min(p.n, 3); const r = rollDice(p); if (RACES[c.race]?.fireRes && /огн|плам|ожог|пожар|жар/i.test(d.reason || "")) { r.total = Math.ceil(r.total / 2); r.text += " ÷2 сопротивление"; } hurtHero(r.total);''')
css=open(SP+'/hero.css').read()
rep('.w-part { display: flex;', css+'\n.w-part { display: flex;')
open(p,'w').write(s); print('ok')
