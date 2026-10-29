import re
P='/home/claude/salt-harbor.html'; h=open(P).read()
def cut_fn(h,name):
    a=h.find('\nfunction '+name+'('); assert a>=0,name
    m=re.compile(r'\n(?=function |/\*|const |let |async function |document\.)').search(h,a+10)
    return h[:a]+h[m.start():]
for f in ['enemyTurn','rollSfx']: h=cut_fn(h,f)
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
R('        <div class="composer">','        <div id="combat-hud" class="combat-hud" hidden></div>\n        <div class="composer">')
# атака героя: преимущества, урон, особые свойства
R('let adv = ch.adv || (e.asleep ? 1 : 0); if (c.bless)','let adv = ch.adv || (e.asleep ? 1 : 0); adv += heroAttackAdv(ch.target, ch.weapon, notes); if (c.bless)')
R('      hurtEnemy(ch.target, dmg.total);\n    }\n    return { ...ch, nat: r.nat','      extra += heroDmgMods(ch.target, d, dmg, isCrit); hurtEnemy(ch.target, dmg.total); S._hitInfo = null;\n    } else fcond(ch.target).hidden = false;\n    return { ...ch, nat: r.nat')
R('function hurtEnemy(id, amt) { const e = S.world.enemies[id]; e.hp = Math.max(0, e.hp - amt); e.asleep = false;','function hurtEnemy(id, amt) { const e = S.world.enemies[id]; e.hp = Math.max(0, e.hp - amt); e.asleep = false; if (e.hp === 0 && e.alive && FOE_KIT[ENEMIES[id]?.type]?.fort && !S._hitInfo?.crit && rnd(20) + 3 >= 5 + amt) { e.hp = 1; pushFeed({ t: "chips", items: [{ c: "dmg", x: `${ENEMIES[id].name} поднимается снова — стойкость нежити` }] }); }')
# takeTurn: тактические действия, быстрые описания, итоги боя
R('    const results = [];\n    if (plan.move_to) {','    const results = [];\n    if (preset && preset.cact) await combatPreAct(preset.cact, preset, results);\n    if (plan.move_to) {')
R('results.push({ kind: "combat_end", title: "Все враги повержены" }); }','results.push({ kind: "combat_end", title: "Все враги повержены" }); onCombatEnd(results); }')
R('    const eff = await narrate(text, plan, results, intro);','    const eff = (!intro && !combatEnded && S.world.combat && fightMode() === "fast" && preset && (preset.combat || preset.checks?.some(x => x.kind === "attack"))) ? quickCombatNarr(results) : await narrate(text, plan, results, intro);')
R('function pushFeed(e) { S.feed.push(e);','function pushFeed(e) { if (e.t === "roll") setTimeout(() => { try { combatFx(e.r); } catch (er) {} }, 480); S.feed.push(e);')
R('  } else if (e.t === "chips") {','  } else if (e.t === "victory") { d.className = "e-victory"; d.innerHTML = victoryHTML(e);\n  } else if (e.t === "chips") {')
R('function renderAll() { refreshPeople(); renderTop(); renderSheet(); renderWorld(); renderSugg(); }','function renderAll() { refreshPeople(); renderTop(); renderSheet(); renderWorld(); renderSugg(); renderCombatHud(); }')
R('document.getElementById("btn-stop").hidden = !b || !ctl; renderSheet(); renderSugg();','document.getElementById("btn-stop").hidden = !b || !ctl; renderSheet(); renderSugg(); renderCombatHud();')
# план сцены: позиции врагов, побеги
R('foes.forEach((e, i) => { const es = S.world.enemies[e]; if (!es.alive) { const p = scFreeNear(sc, [], sc.foes.x + (i - foes.length / 2) * 1.6, sc.foes.y + (i % 2) * .8, 3); out.push({ type: "corpse", id: e, x: p.x, y: p.y }); return; }',
  'foes.forEach((e, i) => { const es = S.world.enemies[e]; if (!es.alive) { if (es.fled || es.surrendered) return; const p = es.pos || scFreeNear(sc, [], sc.foes.x + (i - foes.length / 2) * 1.6, sc.foes.y + (i % 2) * .8, 3); out.push({ type: "corpse", id: e, x: p.x, y: p.y }); return; }')
R('sc.foes.y + (i % 2) * 1.3, 4); taken.push(p); out.push({ type: "foe", id: e, x: p.x, y: p.y }); });','sc.foes.y + (i % 2) * 1.3, 4); if (!es.pos) es.pos = { x: +p.x.toFixed(2), y: +p.y.toFixed(2) }; taken.push(es.pos); out.push({ type: "foe", id: e, x: es.pos.x, y: es.pos.y }); });')
R("const pct = es.hp / E.hp; inner +=","if (es.intent && !['attack', 'flee', 'surrender'].includes(es.intent.k)) inner += `<circle r=\"${r + 6}\" class=\"sc-warn\" fill=\"none\" stroke=\"#f2b45c\" stroke-width=\"2\"/>`; if (S.world.tgt === p.id) inner += `<circle r=\"${r + 4}\" fill=\"none\" stroke=\"#fff\" stroke-width=\"1.4\" stroke-dasharray=\"3 3\" class=\"sc-tgt\"/>`; const pct = es.hp / E.hp; inner +=")
R('if (kind === "foe") { const E = ENEMIES[ref]; open(el, E.name, enemyStatus(ref), [{ t: "Атаковать", fn: () => turn(`Атакую: ${E.name}`), dis: busy }, { t: "Оценить врага", fn: () => turn(`Оцениваю, насколько опасен ${E.name}`), dis: busy }]); return; }',
  'if (kind === "foe") { const E = ENEMIES[ref]; const it = intentInfo(ref); const w = C().weapons[0]; open(el, E.name, `${enemyStatus(ref)}${it ? " · " + it.t : ""}`, [{ t: `Атаковать (${WEAPONS[w]?.name.toLowerCase() || "оружие"})`, fn: () => { S.world.tgt = ref; takeTurn(`Атакую: ${E.name}`, { checks: [{ kind: "attack", target: ref, weapon: w, reason: "Атака оружием" }], combat: true }); }, dis: busy || !enemyHere(ref) }, { t: "Сделать целью", fn: () => setTarget(ref), dis: !enemyHere(ref) }, { t: "Оценить врага", fn: () => { S.world.tgt = ref; takeTurn(`Присматриваюсь к врагу: ${E.name}`, { checks: [], cact: "assess", target: ref, combat: true }); }, dis: busy || !S.world.combat }]); return; }')
R('else if (old.getAttribute("data-sig") !== c.getAttribute("data-sig")) old.replaceWith(c);','else if (old.getAttribute("data-sig") !== c.getAttribute("data-sig")) { const ns = c.getAttribute("style") || ""; c.setAttribute("style", old.getAttribute("style") || ""); old.replaceWith(c); requestAnimationFrame(() => requestAnimationFrame(() => c.setAttribute("style", ns))); }')
R("S.world.loc = id; if (!p.inner) { S.world.pos","if (S.world.loc !== id) S.world.prevLoc = S.world.loc; S.world.loc = id; if (!p.inner) { S.world.pos")
# лист персонажа: текущая цель
R('const tb = el.querySelector("#tab-body"); const foes = aliveEnemiesHere(); const tgt = foes[0];','const tb = el.querySelector("#tab-body"); const foes = aliveEnemiesHere(); const tgt = S.world.combat ? curTarget() : foes[0];')
# настройки: темп боя
R('    ${HAS_TTS ? `<div class="opt-group"><span>Озвучка</span>','    <div class="opt-group"><span>Описание боя</span><div class="opts" id="set-fight">${[["full", "Подробно"], ["brief", "Коротко"], ["fast", "Быстро (без ИИ)"]].map(([k, t]) => `<button type="button" data-v="${k}" aria-pressed="${(st.fight || "brief") === k}">${t}</button>`).join("")}</div><small class="home-note">«Быстро» — ходы боя описываются движком мгновенно, рассказчик подключается в начале и в конце схватки.</small></div>\n    ${HAS_TTS ? `<div class="opt-group"><span>Озвучка</span>')
R('    root.querySelectorAll("#set-tone button").forEach(','    root.querySelectorAll("#set-fight button").forEach(b => b.onclick = () => { st.fight = b.dataset.v; root.querySelectorAll("#set-fight button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); save(); });\n    root.querySelectorAll("#set-tone button").forEach(')
# промпт рассказчика
R('- ${({ short: "50–90 слов, 1–2 абзаца", normal: "90–170 слов, 2–3 абзаца", long: "170–260 слов, 3–4 абзаца" })[S.settings?.len || "normal"]}.','- ${S.world.combat && fightMode() !== "full" ? "ИДЁТ БОЙ: 1–3 коротких динамичных предложения, 25–60 слов: удары, движение, звук, реакция врагов. Без долгих описаний" : ({ short: "50–90 слов, 1–2 абзаца", normal: "90–170 слов, 2–3 абзаца", long: "170–260 слов, 3–4 абзаца" })[S.settings?.len || "normal"]}.')
R('${sceneBrief()}\n${travelBrief()}${questBrief()}','${sceneBrief()}\n${combatBrief()}${travelBrief()}${questBrief()}',2)
# звук
R('const AMB = { campfire: "a-campfire",','const AMB = { drums: "a-wardrums", campfire: "a-campfire",')
R('function ambNow() { if (!S) return null;','function ambNow() { if (!S) return null; if (S.world.combat) return "drums";')
R('const SFX = {','''const SFX = {
  bite: ["s-bite"], bitesm: ["s-bite-small"], claws: ["s-claws"], "wolf-hit": ["s-wolf-hit-1", "s-wolf-hit-2"], "wolf-die": ["s-wolf-die-1"], growl2: ["s-wolf-growl-2"], "rat-hit": ["s-squishy-hit"], "rat-die": ["s-bite-small"],
  "goblin-hit": ["s-goblin-hit-1", "s-goblin-hit-2"], "goblin-die": ["s-goblin-die-1"], "zombie-atk": ["s-zombie-attack"], "zombie-hit": ["s-zombie-hit-1", "s-zombie-hit-2"], "zombie-die": ["s-groan"],
  "skel-hit": ["s-skeleton-hit-1", "s-skeleton-hit-2"], "skel-die": ["s-skeleton-die-1"], "spider-hit": ["s-hiss-hit"], "spider-die": ["s-hiss-die"], hiss: ["s-hiss"], pincers: ["s-pincers"], poison: ["s-poison"], net: ["s-net"],
  "human-hit": ["s-human-hit-3"], "human-die": ["s-human-die-2"], "orc-hit": ["s-orc-hit-1"], "orc-die": ["s-orc-die-1"], "hero-f-hit": ["s-human-female-hit-1"], "hero-f-die": ["s-human-female-die-1"],
  crossbow: ["s-crossbow"], "xbow-miss": ["s-crossbow-miss"], "bow-miss": ["s-bow-miss"], spear: ["s-spear"], "spear-miss": ["s-spear-miss"], flail: ["s-flail"], club: ["s-club"], "club-miss": ["s-club-miss"], knife: ["s-knife"], hatchet: ["s-hatchet"],
  "mace-miss": ["s-mace-miss"], "staff-miss": ["s-staff-miss"], boom: ["s-explosion"], flame: ["s-flame-big"], holy2: ["s-magic-holy-2"], thorns: ["s-magic-thorns-1"], faerie: ["s-magic-faeriefire"], "ltn-miss": ["s-lightning-miss"], "mm-miss": ["s-magic-missile-1-miss"], "dark-miss": ["s-magic-dark-miss"],
  horn3: ["s-horn-3"], fist: ["s-fist"], whoosh: ["s-miss-3"],''')
R('function spellSfx(sp) {','''function rollSfx(r) {
  if (!r) return;
  if (r.kind === "attack") { const s = WSND[wType(r.weapon)] || WEAPON_SFX[r.weapon] || "sword"; if (r.ok) { sfx(s); setTimeout(() => sfx(foeSnd(r.target, 1), .8), 150); if (r.crit) setTimeout(() => sfx("boom", .45), 220); } else sfx(WMISS[s] || "miss"); return; }
  if (r.kind === "spell") { const sp = SPELLS[r.spell]; if (r.noslot) return sfx("thud"); const s = spellSfx(sp); if (r.target && !r.ok) { sfx({ lightning: "ltn-miss", missile: "mm-miss", dark: "dark-miss" }[s] || "whoosh"); return; } sfx(s); if (r.target && r.ok) setTimeout(() => sfx(foeSnd(r.target, 1), .7), 300); return; }
  if (r.kind === "breath") { sfx("flame"); return; }
  if (r.kind === "enemy") { if (r.skip || r.summon) return; if (r.special === "Паутина") { sfx("net"); return; } sfx(r.snd || foeSnd(r.by, 0)); if (r.ok) setTimeout(() => { sfx(heroHurtSnd()); if (r.cond === "poisoned") sfx("poison", .7); }, 170); else setTimeout(() => sfx("whoosh", .55), 120); return; }
  if (r.kind === "skill" || r.kind === "save") { if (r.crit) sfx("fanfare", .7); else sfx(r.ok ? "chime" : "thud"); return; }
}
function spellSfx(sp) {''')
# инвентарь: яд и ценность трофеев
R('  acts.push(["look", "Осмотреть внимательно", "x_look", ""]','  if (it.venom) acts.unshift(["venom", "Смазать оружие ядом", "k_venom", c.venom > 0 ? "оружие уже смазано" : ""]);\n  acts.push(["look", "Осмотреть внимательно", "x_look", ""]')
R('      if (a === "use") {','      if (a === "venom") { c.venom = 3; removeItem(c, it); pushFeed({ t: "chips", items: [{ c: "dmg", x: "Оружие смазано ядом: 3 удара +1d4" }] }); sfx("poison"); closeModal(); after(); }\n      else if (a === "use") {')
R('function itemValue(it) {\n','function itemValue(it) {\n  if (it.value != null) return it.value;\n')
open(P,'w').write(h); print('ok')
