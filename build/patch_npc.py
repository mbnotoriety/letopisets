P='/home/claude/salt-harbor.html'; h=open(P).read()
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
R("const bestiary = Object.entries(BESTIARY).map(","const bestiary = Object.entries(BESTIARY).filter(([, b]) => !b.npcOnly).map(")
R('if (it.k === "howl") { (e.used = e.used ||','if (npcSpecial(id, it, out)) continue;\n    if (it.k === "howl") { (e.used = e.used ||')
R("fc.hidden = false; S._hitInfo = { crit }; return txt;","fc.hidden = false; S._hitInfo = { crit, ranged: !!d?.props?.includes(\"ranged\") }; return txt;")
R('  if (act === "dodge") { hc.dodge = true;','  if (act === "standdown") { await npcStandDown(results); return; }\n  if (act === "dodge") { hc.dodge = true;')
R('    if (e.fled) { fled.push(E.name); return; }','    if (e.ko) { caught.push(E.name + " (без сознания)"); return; } if (e.fled) { fled.push(E.name); return; }')
R('  btn("run", ico("t_run", 22), "Отступить"','  npcHudActs(btn, dis);\n  btn("run", ico("t_run", 22), "Отступить"')
R('el.innerHTML = `<span class="cb-fi">${ico(FOE_ICO[E.type] || "e_bandit", 34)}</span>','el.innerHTML = `<span class="cb-fi${E.npc && npcImg(E.npc) ? " ph" : ""}">${E.npc && npcImg(E.npc) ? `<img src="${esc(npcImg(E.npc))}" alt="">` : ico(FOE_ICO[E.type] || "e_bandit", 34)}</span>')
# takeTurn
R("    if (plan.move_to && !(preset && preset.fromTrip) && !S.world.combat && needsTrip(plan.move_to)) {","    npcAttackPlan(plan, preset);\n    if (plan.move_to && !(preset && preset.fromTrip) && !S.world.combat && needsTrip(plan.move_to)) {")
R("encAfterChecks(results); questAfterChecks(results);","encAfterChecks(results); questAfterChecks(results); npcAfterTurn(results);")
# people
R("function refreshPeople() {\n  if (!S) return;","function refreshPeople() {\n  if (!S) return; npcTick();")
R("p.npcs = [...new Set([...base.filter(x => !Object.prototype.hasOwnProperty.call(ov, x) || ov[x] === lid), ...(vis[lid] || [])])];","p.npcs = [...new Set([...base.filter(x => !Object.prototype.hasOwnProperty.call(ov, x) || ov[x] === lid), ...(vis[lid] || [])])].filter(x => !npcGone(x));")
R("let n = st.crowd != null ? st.crowd : (labels.length && !foesHere ? counts[t.part] : 0);","let n = S.world.crowdFled?.[id] === tkey() ? 0 : st.crowd != null ? st.crowd : (labels.length && !foesHere ? counts[t.part] : 0);")
# планировщик хода
R("  if (plan.talk_to && NPCS[plan.talk_to]) out.talk_to = plan.talk_to;","  if (plan.talk_to && NPCS[plan.talk_to]) out.talk_to = plan.talk_to;\n  if (plan.attack_npc && NPCS[plan.attack_npc]) { out.attack_npc = plan.attack_npc; out.nonlethal = !!plan.nonlethal; }")
R("- move_to: id точки на карте, если герой явно идёт в другое место, иначе null. talk_to: id НПС, к которому обращаются, иначе null.\nОтвет",
  "- move_to: id точки на карте, если герой явно идёт в другое место, иначе null. talk_to: id НПС, к которому обращаются, иначе null.\n- attack_npc: id НПС из списка людей в сцене, если герой ЯВНО нападает на него (бьёт, стреляет, режет, душит, пытается убить или избить), иначе null. nonlethal: true, если герой хочет лишь оглушить, побить или скрутить, не убивая. Угрозы и словесные ссоры — не нападение.\nОтвет")
R('{"checks":[{"kind":"skill","skill":"perception","dc":13,"adv":0,"reason":"коротко зачем"}],"move_to":null,"talk_to":null}`;','{"checks":[{"kind":"skill","skill":"perception","dc":13,"adv":0,"reason":"коротко зачем"}],"move_to":null,"talk_to":null,"attack_npc":null,"nonlethal":false}`;')
R("  const t = text.toLowerCase(); const plan = { checks: [], move_to: null, talk_to: null };","  const t = text.toLowerCase(); const plan = { checks: [], move_to: null, talk_to: null };\n  if (/(бью|ударяю|нападаю|атакую|убиваю|убить|стреляю|режу|рублю|колю|душу|пырну|бросаюсь на|избиваю|оглушаю)/.test(t)) { const nid = (POIS[S.world.loc].npcs || []).find(id => NPCS[id] && t.includes(NPCS[id].name.toLowerCase().slice(0, Math.max(3, NPCS[id].name.length - 2)))); if (nid) { plan.attack_npc = nid; plan.nonlethal = /(оглуш|скрут|побить|избива|не насмерть)/.test(t); return plan; } }")
# эффекты рассказчика
R("  sideQuestEffects(eff.side_quests);","  sideQuestEffects(eff.side_quests); npcAttackEffects(eff.npc_attack);")
R('"rep": 0, "side_quests": [], "scene":','"rep": 0, "side_quests": [], "npc_attack": [], "scene":')
R('side_quests — [{"id":"id поручения"','npc_attack — id НПС, которые САМИ нападают на героя в этом тексте (злодей раскрыт и бросается, стража хватает разыскиваемого, обиженный бьёт первым), иначе []. side_quests — [{"id":"id поручения"')
R("${sceneBrief()}\n${combatBrief()}${travelBrief()}${questBrief()}","${sceneBrief()}\n${npcBrief()}${combatBrief()}${travelBrief()}${questBrief()}",2)
R("const foes = Object.keys(ENEMIES).filter(id => ENEMIES[id].loc === L).map(id => `- [${id}] ${ENEMIES[id].name}: ${enemyStatus(id)}`)","const foes = Object.keys(ENEMIES).filter(id => ENEMIES[id].loc === L && (S.world.enemies[id]?.alive || !ENEMIES[id].npc || S.world.enemies[id]?.ko || NPCS[ENEMIES[id].npc]?.dead)).map(id => `- [${id}] ${ENEMIES[id].name}: ${S.world.enemies[id]?.ko ? \"без сознания\" : ENEMIES[id].npc && !S.world.enemies[id]?.alive ? \"мёртв(а), тело лежит здесь\" : enemyStatus(id)}${ENEMIES[id].npc ? ` (это НПС ${NPCS[ENEMIES[id].npc]?.role || \"\"}, враждует с героем)` : \"\"}`)")
# сцена
R('      { t: "Присматриваться", fn: () => turn(`Незаметно присматриваюсь: ${n.name} (${n.role})`), dis: busy }, { t: "Подойти", fn: approach(p.x, p.y), closes: false }]); return; }'.replace("Присматриваться","Присмотреться"),
  '      { t: "Присмотреться", fn: () => turn(`Незаметно присматриваюсь: ${n.name} (${n.role})`), dis: busy }, { t: "Подойти", fn: approach(p.x, p.y), closes: false }, { t: "Напасть…", fn: () => confirmAttack(ref), dis: busy || S.world.combat, danger: true }]); return; }')
R('{ t: "Подслушать", fn: () => turn(`Прислушиваюсь, о чём говорит ${ref}`), dis: busy }, { t: "Подойти", fn: approach(p.x || 9, p.y || 6), closes: false }]); return; }',
  '{ t: "Подслушать", fn: () => turn(`Прислушиваюсь, о чём говорит ${ref}`), dis: busy }, { t: "Подойти", fn: approach(p.x || 9, p.y || 6), closes: false }, { t: "Напасть…", fn: () => confirmAttackCrowd(ref), dis: busy || S.world.combat, danger: true }]); return; }')
R('    if (kind === "foe") { const E = ENEMIES[ref]; const it = intentInfo(ref);','''    if (kind === "corpse") { const E = ENEMIES[ref]; const es = S.world.enemies[ref]; if (!E || !es) return; const acts = [];
      if (es.ko) acts.push({ t: "Привести в чувство и допросить", fn: () => koAct(ref, "wake"), dis: busy || S.world.combat }, { t: "Обыскать", fn: () => searchBody(ref), dis: busy || S.world.combat }, { t: "Добить…", fn: () => koAct(ref, "kill"), dis: busy || S.world.combat, danger: true });
      else acts.push({ t: E.npc ? (es.searched ? "Осмотреть тело" : "Обыскать тело") : "Осмотреть останки", fn: () => searchBody(ref), dis: busy || S.world.combat });
      open(el, E.name, es.ko ? "без сознания" : E.npc ? (isFem(NPCS[E.npc]) ? "мертва" : "мёртв") : "повержен", acts); return; }
    if (kind === "foe") { const E = ENEMIES[ref]; const it = intentInfo(ref);''')
R('`<b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}<div class="sc-acts">${acts.map((a, i) => `<button type="button" class="btn small${i === 0 ? " primary" : ""}" data-i="${i}" ${a.dis ? "disabled" : ""}>${esc(a.t)}</button>`).join("")}</div>`',
  '`<b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}<div class="sc-acts">${acts.map((a, i) => `<button type="button" class="btn small${a.danger ? " danger" : i === 0 ? " primary" : ""}" data-i="${i}" ${a.dis ? "disabled" : ""}>${esc(a.t)}</button>`).join("")}</div>`')
R('''  else if (p.type === "corpse") { const E = ENEMIES[p.id]; return `<g data-k="corpse:${p.id}" data-sig="c" style="transform:translate(${x}px,${y}px)" opacity=".85"><title>${esc(E.name)} (повержен)</title><ellipse rx="15" ry="10" fill="#4a0f0b" opacity=".55"/><path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke="#8a2a20" stroke-width="3.4" stroke-linecap="round"/></g>`; }''',
  '''  else if (p.type === "corpse") { const E = ENEMIES[p.id]; const es = S.world.enemies[p.id] || {}; const ko = !!es.ko; const npc = !!E.npc; const t = npc ? `${E.name} (${ko ? "без сознания" : "мёртв"})` : `${E.name} (повержен)`;
    const body = npc ? `${ko ? "" : `<ellipse rx="17" ry="11" cx="3" cy="3" fill="#5a0d08" opacity=".6"/>`}<rect x="-12" y="-5" width="22" height="10" rx="5" fill="#6d6458" stroke="#1b1712" stroke-width="1.4" transform="rotate(-18)"/><circle cx="-13" cy="3" r="5.5" fill="#c9a98a" stroke="#1b1712" stroke-width="1.4"/>${ko ? `<text x="4" y="-10" font-size="10" font-weight="700" fill="#9fd8ff">z z</text>` : ""}`
      : `<ellipse rx="15" ry="10" fill="#4a0f0b" opacity=".55"/><path d="M-7 -7 L7 7 M7 -7 L-7 7" stroke="#8a2a20" stroke-width="3.4" stroke-linecap="round"/>`;
    return `<g class="sc-tok corpse" data-k="corpse:${p.id}" data-sig="c${ko ? 1 : 0}${es.searched ? 1 : 0}" data-hit="corpse:${p.id}" style="transform:translate(${x}px,${y}px)" opacity=".9" tabindex="0" role="button" aria-label="${esc(t)}"><title>${esc(t)}</title><circle r="16" fill="transparent"/>${body}</g>`; }''')
R("function refusesTrade(m) {","function refusesTrade(m) { if ((S.world.wanted || 0) >= 2 && m.type !== \"stall\") return true;")
open(P,'w').write(h); print('ok')
