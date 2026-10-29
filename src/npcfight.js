/* NPCFIGHT */
/* =========================================================================
   НАПАДЕНИЕ НА ЛЮБОГО НПС: бой, оглушение, смерть, свидетели, розыск, последствия
   ========================================================================= */
const NPC_STATS = {
  commoner: { label: "житель", ac: 10, hp: 6, atk: 2, dmg: "1d4", dex: 0, xp: 10 },
  tough: { label: "крепкий работяга", ac: 11, hp: 11, atk: 3, dmg: "1d6+1", dex: 0, xp: 25 },
  guard: { label: "стражник", ac: 16, hp: 11, atk: 3, dmg: "1d6+1", dex: 1, xp: 25 },
  noble: { label: "знатный", ac: 15, hp: 9, atk: 3, dmg: "1d8+1", dex: 1, xp: 25 },
  acolyte: { label: "служитель", ac: 10, hp: 9, atk: 2, dmg: "1d4", dex: 0, xp: 25 },
  shady: { label: "лихой человек", ac: 12, hp: 11, atk: 3, dmg: "1d6+1", dex: 2, xp: 25 },
  veteran: { label: "опытный боец", ac: 17, hp: 30, atk: 5, dmg: "1d8+3", dex: 1, xp: 150, boss: true }
};
Object.assign(FOE_KIT, {
  commoner: { snd: ["fist", "human-hit", "human-die"], kind: "humanoid", morale: .95, surrender: true, flee: true, traits: ["Не воин: при первой возможности бежит или молит о пощаде"] },
  tough: { snd: ["club", "human-hit", "human-die"], kind: "humanoid", morale: .45, surrender: true, flee: true, traits: ["Бьёт тяжело, но за жизнь держится крепче, чем за честь"] },
  guard: { snd: ["spear", "human-hit", "human-die"], kind: "humanoid", morale: .2, surrender: true, traits: ["Обучен строю, сдаётся неохотно", "Может позвать подмогу"], specials: [{ id: "call", t: "Свистит, зовя стражу", warn: "не остановить сейчас — придёт ещё стражник", once: true, chance: .45 }] },
  noble: { snd: ["sword", "human-hit", "human-die"], kind: "humanoid", morale: .5, surrender: true, traits: ["Фехтует, но жизнь ценит выше чести"] },
  acolyte: { snd: ["staff", "human-hit", "human-die"], kind: "humanoid", morale: .6, surrender: true, flee: true, traits: ["Молится об исцелении"], specials: [{ id: "pray", t: "Молится об исцелении", warn: "восстановит себе хиты", chance: .4, recharge: 2 }] },
  shady: { snd: ["dagger", "human-hit", "human-die"], kind: "humanoid", morale: .35, surrender: true, flee: true, nimble: true, traits: ["Юркий: бьёт и уходит в тень"] },
  veteran: { snd: ["sword", "orc-hit", "human-die"], kind: "humanoid", multi: 2, morale: .15, surrender: true, traits: ["Две атаки за ход", "Опытный боец"] }
});
Object.assign(FOE_ICO, { commoner: "r_human", tough: "b_artisan", guard: "b_watch", noble: "b_noble", acolyte: "b_acolyte", shady: "b_criminal", veteran: "b_knight" });
function npcStatKey(n) { const r = (n?.role || "").toLowerCase();
  if (/капитан|сержант|командир|рыцарь|ветеран|десятник/.test(r)) return "veteran"; if (/страж|дозор|солдат|воин|часов|гвард/.test(r)) return "guard";
  if (/контрабанд|вор|бандит|разбойн|скупщик|главар|пират|головорез|наёмник/.test(r)) return "shady"; if (/жрец|жриц|монах|сестра|настоятел|послуш|священ|проповед|знахар|травни/.test(r)) return "acolyte";
  if (/староста|купец|купчих|лорд|граф|барон|судья|бургомистр|знат|госпож/.test(r)) return "noble"; if (/кузнец|мясник|охотник|рыбак|лесоруб|рудокоп|моряк|лодочник|батрак|пастух|мельник|грузчик|углежог/.test(r)) return "tough"; return "commoner"; }
function npcGone(id) { const w = S?.world; if (!w) return false; return !!(NPCS[id]?.dead || w.hostile?.[id] || (w.awayUntil?.[id] != null && w.awayUntil[id] >= tkey())); }
function inSettlement(loc) { const p = POIS[loc]; if (!p || p.wild) return false; if (p.inner) return true; return p.where === "village" || ["street", "square", "inn", "chapel", "pier", "farm", "gate", "house"].includes(tplOfPlace(p)) || loc === WD.start; }
function npcScenePos(nid) { try { const p = scenePeople(S.world.loc).find(q => q.type === "npc" && q.id === nid); return p ? { x: +p.x.toFixed(2), y: +p.y.toFixed(2) } : null; } catch (e) { return null; } }
function makeHostile(nid, o = {}) {
  S.world.hostile = S.world.hostile || {}; const ex = S.world.hostile[nid]; if (ex && S.world.enemies[ex]?.alive) return ex;
  const n = NPCS[nid]; if (!n || n.dead) return null; const key = npcStatKey(n); const B = NPC_STATS[key]; const eid = "npc_" + nid + "_" + rnd(9999); const pos = npcScenePos(nid);
  ENEMIES[eid] = { ...B, type: key, name: n.name, loc: S.world.loc, npc: nid }; S.world.enemies[eid] = { hp: B.hp, alive: true, asleep: false, fight: S.world.fightId, pos };
  POIS[S.world.loc].enemies = [...(POIS[S.world.loc].enemies || []), eid]; S.world.hostile[nid] = eid; const st = ensureNpcState(nid); if (st) st.att = Math.min(st.att, o.byHero ? -80 : -40);
  refreshPeople(); return eid;
}
function witnessesOf(nid) { const loc = POIS[S.world.loc]; const npcs = (loc.npcs || []).filter(x => x !== nid && NPCS[x] && !npcGone(x)); let crowd = 0; try { crowd = scenePeople(S.world.loc).filter(p => p.type === "crowd").length; } catch (e) {} return { npcs, crowd, seen: npcs.length + crowd > 0 }; }
function heroAssault(nid, o = {}) {
  const n = NPCS[nid]; const w = witnessesOf(nid); const loc = S.world.loc; const town = inSettlement(loc); const chips = [];
  const eid = makeHostile(nid, { byHero: true }); if (!eid) return null; const st = S.world.npcs[nid]; st.mem.push(`герой напал на меня в «${POIS[loc].name}»`);
  chips.push({ c: "dmg", x: `${n.name}: враждебно` });
  w.npcs.forEach(x => { const xs = ensureNpcState(x); if (!xs) return; xs.att = clamp(xs.att - 30, -100, 100); xs.mem.push(`видел(а), как герой напал на ${n.name}`);
    if (npcStatKey(NPCS[x]) === "guard" || npcStatKey(NPCS[x]) === "veteran" && /страж|капитан|сержант/.test(NPCS[x].role || "")) { makeHostile(x); chips.push({ c: "dmg", x: `${NPCS[x].name} вступается!` }); }
    else { S.world.awayUntil = S.world.awayUntil || {}; S.world.awayUntil[x] = tkey(); chips.push({ c: "npc", x: `${NPCS[x].name} в ужасе убегает` }); } });
  if (w.crowd) { S.world.crowdFled = S.world.crowdFled || {}; S.world.crowdFled[loc] = tkey(); }
  S.world.crimes = S.world.crimes || []; S.world.crimes.push({ k: "assault", npc: nid, day: worldTime().day, loc, seen: w.seen });
  if (w.seen && town) { addRep(-12, "нападение на жителя"); S.world.wanted = Math.max(S.world.wanted || 0, 1); S.world.wantedDay = worldTime().day; }
  S.world.facts.push(`Герой напал на ${n.name} (${n.role}) в «${POIS[loc].name}»${w.seen ? " на глазах у людей" : " без свидетелей"}`);
  S.world.nonLethal = !!o.nonLethal; pushFeed({ t: "chips", items: chips }); sfx("horn3");
  if (!S.world.combat) { S.world.fightId = uid(); S.world.round = 1; encStartCombat(true); }
  return eid;
}
/* смерть и оглушение */
function npcDown(eid) {
  const E = ENEMIES[eid]; const e = S.world.enemies[eid]; const nid = E?.npc; if (!nid) return;
  if (S.world.nonLethal && S._hitInfo && !S._hitInfo.ranged) { e.ko = true; S.world.ko = S.world.ko || {}; S.world.ko[nid] = tkey(); pushFeed({ t: "chips", items: [{ c: "npc", x: `${E.name} без сознания` }] }); return; }
  npcKilled(nid, eid);
}
function npcKilled(nid, eid, how) {
  const n = NPCS[nid]; if (!n || n.dead) return; const loc = S.world.loc; const w = witnessesOf(nid); const town = inSettlement(loc); n.dead = true;
  S.world.deadNpcs = S.world.deadNpcs || {}; S.world.deadNpcs[nid] = { day: worldTime().day, loc, eid, seen: w.seen || !!S.world.crimes?.some(c => c.npc === nid && c.seen), how: how || "убит(а) героем" };
  const chips = [{ c: "dmg", x: `${n.name} ${isFem(n) ? "мертва" : "мёртв"}` }];
  allQuests().forEach(q => { const st = qSt(q.id); if ((q.giver === nid || q.to === nid) && ["new", "declined", "active", "ready"].includes(st.st)) { const was = st.st; st.st = "failed"; if (was !== "new" && was !== "declined") chips.push({ c: "dmg", x: `Поручение провалено: ${q.title}` }); } });
  const seen = S.world.deadNpcs[nid].seen;
  if (seen && town) { addRep(-25, "убийство"); S.world.wanted = 2; S.world.wantedDay = worldTime().day; Object.keys(S.world.npcs).forEach(x => { if (x !== nid && NPCS[x] && !NPCS[x].dead) { S.world.npcs[x].att = clamp(S.world.npcs[x].att - 10, -100, 100); } }); }
  S.world.crimes = S.world.crimes || []; S.world.crimes.push({ k: "murder", npc: nid, day: worldTime().day, loc, seen });
  S.world.facts.push(`${n.name} (${n.role}) ${isFem(n) ? "убита" : "убит"} героем в «${POIS[loc].name}»${seen ? ", это видели люди" : ", свидетелей не было"}`);
  pushFeed({ t: "chips", items: chips }); setTimeout(() => sfx(isFem(n) ? "hero-f-die" : "human-die"), 300);
}
function npcTick() {
  if (!S) return; const w = S.world; const now = tkey();
  Object.entries(w.ko || {}).forEach(([nid, t]) => { if (now - t >= 2) { const eid = w.hostile?.[nid]; delete w.ko[nid]; if (eid) { despawnFoes([eid]); delete w.hostile[nid]; } const st = w.npcs[nid]; if (st) { st.att = Math.min(st.att, -60); st.mem.push("очнулся после побоев и помнит, кто это сделал"); } } });
  if (w.wanted && worldTime().day - (w.wantedDay || 0) >= 3) { w.wanted--; w.wantedDay = worldTime().day; }
}
/* после хода: сдавшиеся и сбежавшие НПС возвращаются в мир */
function npcAfterTurn(results) {
  const w = S.world; if (!w.hostile) return;
  Object.entries(w.hostile).forEach(([nid, eid]) => { const e = w.enemies[eid]; if (!e) { delete w.hostile[nid]; return; } if (e.alive || e.ko || NPCS[nid]?.dead) return;
    if (e.surrendered || e.fled) { despawnFoes([eid]); delete w.hostile[nid]; const st = ensureNpcState(nid); if (st) { st.att = Math.min(st.att, -70); st.mem.push(e.fled ? "сбежал(а) от героя, спасая жизнь" : "сдался(-ась) герою и молил(а) о пощаде"); }
      if (e.fled) { w.awayUntil = w.awayUntil || {}; w.awayUntil[nid] = tkey() + 3; } results.push({ kind: "note", title: `${NPCS[nid].name} ${e.fled ? "сбегает — запомнив обиду" : "сдаётся и молит о пощаде: теперь боится героя, может выдать тайну под давлением"}` }); } });
  refreshPeople();
}
/* обыск тела, оглушённые */
function searchBody(eid) {
  const E = ENEMIES[eid]; const e = S.world.enemies[eid]; if (!E || !e || busy) return; const nid = E.npc; const n = nid ? NPCS[nid] : null; const c = C(); const chips = []; let note;
  if (!e.searched && n) { e.searched = true; const R = mulberry(hash(eid)); const key = E.type; const money = { commoner: 3 + R() * 10, tough: 5 + R() * 15, guard: 10 + R() * 20, noble: 60 + R() * 120, acolyte: 4 + R() * 12, shady: 15 + R() * 40, veteran: 40 + R() * 80 }[key] || 5; const sv = Math.round(money);
    setPurse(c, purse(c) + sv); chips.push({ c: "gold", x: `+${fmtMoney(sv)}` }); const it = { name: `Личная вещь: ${n.name}`, desc: `Снято с тела. ${n.look ? "Владелец: " + n.look : ""}`.trim(), value: 0 }; c.items.push(it); chips.push({ c: "item", x: `+ ${it.name}` });
    if (merchantType(nid) && R() < .7) { const k = { name: "Связка ключей", desc: `Ключи ${n.name}: от дома и лавки`, value: 0 }; c.items.push(k); chips.push({ c: "item", x: `+ ${k.name}` }); }
    note = `Герой обыскивает тело ${n.name}: найдено ${fmtMoney(sv)} и личная вещь (уже выдано движком, не дублируй gold/items_add). ${n.secret ? `При нём есть намёк на его тайну («${n.secret}») — записка, вещь или знак. Опиши находку конкретно, это может продвинуть или изменить расследование.` : "Опиши, что при нём было."}`;
    pushFeed({ t: "chips", items: chips }); sfx("gold"); }
  else note = n ? `Герой снова осматривает тело ${n.name}: ничего нового, кроме деталей смерти` : `Герой осматривает останки: ${E.name}`;
  S.pendingQNote = note; takeTurn(n ? `Обыскиваю тело: ${n.name}` : `Осматриваю останки: ${E.name}`, { checks: [] });
}
function koAct(eid, act) {
  const E = ENEMIES[eid]; const nid = E?.npc; const w = S.world; if (!nid || busy) return; const n = NPCS[nid];
  if (act === "kill") { modal(`<div class="nf-confirm"><div class="eyebrow">Необратимо</div><h2>Добить ${esc(n.name)}?</h2><p>${esc(n.name)} лежит без сознания и не может сопротивляться. Это убийство — без шанса на оправдание.</p><div class="row"><button class="btn" type="button" id="nf-no">Нет</button><button class="btn danger" type="button" id="nf-yes">${ico("k_skull", 16)} Добить</button></div></div>`, root => {
      root.querySelector("#nf-no").onclick = closeModal; root.querySelector("#nf-yes").onclick = () => { closeModal(); delete w.ko[nid]; S.world.enemies[eid].ko = false; npcKilled(nid, eid, "добит(а) героем, лёжа без сознания"); addRep(-5, "хладнокровие"); S.pendingQNote = `Герой хладнокровно добил беспомощного ${n.name}. Опиши коротко и без смакования, отрази тяжесть поступка`; takeTurn(`Добиваю: ${n.name}`, { checks: [] }); }; }); return; }
  delete w.ko[nid]; despawnFoes([eid]); delete w.hostile[nid]; const st = ensureNpcState(nid); st.att = Math.min(st.att, -60); st.mem.push("герой избил меня, а потом привёл в чувство и допрашивал"); refreshPeople();
  S.pendingQNote = `${n.name} приходит в себя после побоев: напуган(а), зол(а) и в руках героя. Под давлением может выдать то, что знает (${n.secret || "свои мелкие тайны"}), но запомнит это навсегда`; takeTurn(`Привожу в чувство и допрашиваю: ${n.name}`, { checks: [], talk_to: nid });
}
/* подтверждение нападения */
function confirmAttack(nid) {
  const n = NPCS[nid]; if (!n || busy) return; const w = witnessesOf(nid); const guards = w.npcs.filter(x => ["guard", "veteran"].includes(npcStatKey(NPCS[x])));
  const key = npcStatKey(n); const B = NPC_STATS[key]; const danger = B.hp >= 20 ? "опасный противник" : B.ac >= 15 ? "умеет драться" : B.atk <= 2 ? "почти беззащитен" : "может дать отпор";
  modal(`<div class="nf-confirm"><div class="nf-head">${npcPh(nid)}<div><div class="eyebrow" style="color:var(--ember)">Нападение</div><h2>${esc(n.name)}</h2><small class="home-note">${esc(n.role)} · ${danger} · КД ${B.ac}</small></div></div>
    <ul class="nf-cons"><li>${ico("k_broken", 16)} ${esc(n.name)} станет вашим врагом — навсегда.</li>
      ${w.seen ? `<li>${ico("x_look", 16)} Это увидят: ${esc(w.npcs.map(x => NPCS[x].name).join(", ") || "")}${w.crowd ? `${w.npcs.length ? " и ещё " : ""}${w.crowd} чел.` : ""}. Репутация упадёт${inSettlement(S.world.loc) ? ", начнутся разговоры о розыске" : ""}.</li>` : `<li>${ico("t_hidden", 16)} Свидетелей нет. Пока.</li>`}
      ${guards.length ? `<li class="bad">${ico("b_watch", 16)} ${esc(guards.map(x => NPCS[x].name).join(", "))} вступится за жертву.</li>` : ""}
      <li>${ico("k_skull", 16)} Если ${esc(n.name)} погибнет, поручения с ${isFem(n) ? "ней" : "ним"} провалятся, а история пойдёт иначе.</li></ul>
    <div class="row nf-row"><button class="btn" type="button" id="nf-no">Передумать</button><button class="btn" type="button" id="nf-ko" title="Только оружием ближнего боя. При нуле хитов противник теряет сознание">${ico("k_stun", 16)} Оглушить</button><button class="btn danger" type="button" id="nf-kill">${ico("k_swords", 16)} Напасть</button></div></div>`, root => {
    root.querySelector(".modal").classList.add("nf-modal"); root.querySelector("#nf-no").onclick = closeModal;
    const go = nl => { closeModal(); takeTurn(nl ? `Бросаюсь на ${n.name}, чтобы оглушить` : `Нападаю на ${n.name}!`, { checks: [], npcAttack: nid, nonLethal: nl, combat: true }); };
    root.querySelector("#nf-ko").onclick = () => go(true); root.querySelector("#nf-kill").onclick = () => go(false); });
}
function confirmAttackCrowd(label) { const nid = spawnNpc({ role: label, look: "", persona: "Обычный местный житель." }, S.world.loc); refreshPeople(); confirmAttack(nid); }
/* в ходе: внезапная атака на НПС */
function npcAttackPlan(plan, preset) {
  const nid = preset?.npcAttack || plan.attack_npc; if (!nid || !NPCS[nid] || NPCS[nid].dead) return; const here = POIS[S.world.loc].npcs.includes(nid) || S.world.hostile?.[nid]; if (!here) return;
  const eid = S.world.hostile?.[nid] && S.world.enemies[S.world.hostile[nid]]?.alive ? S.world.hostile[nid] : heroAssault(nid, { nonLethal: preset ? !!preset.nonLethal : !!plan.nonlethal }); if (!eid) return;
  const melee = C().weapons.find(w => !isRangedW(w)); const wid = preset?.nonLethal ? (melee || C().weapons[0]) : C().weapons[0];
  plan.checks = [{ kind: "attack", target: eid, weapon: wid, adv: 1, reason: "Внезапное нападение" }]; plan.talk_to = null; S.world.tgt = eid;
}
function npcHudActs(btn, dis) {
  const npcFoes = aliveEnemiesHere().filter(id => ENEMIES[id].npc); if (!npcFoes.length) return;
  btn("cls", ico(S.world.nonLethal ? "k_stun" : "k_skull", 22), S.world.nonLethal ? "Оглушать" : "Бить насмерть", S.world.nonLethal ? "ближний бой не убивает" : "переключить на оглушение", () => { S.world.nonLethal = !S.world.nonLethal; sfx("tap"); renderCombatHud(); }, false);
  if (npcFoes.length === aliveEnemiesHere().length) { const sk = skillBonus("intimidation") >= skillBonus("persuasion") ? "intimidation" : "persuasion"; btn("def", ico("x_talk", 22), "Опустить оружие", `${SKILLS[sk][0]} · КС 13`, () => takeTurn(sk === "intimidation" ? "Рявкаю: «Хватит! Бросьте оружие, пока живы!»" : "Опускаю оружие: «Хватит. Никому не нужно умирать»", { checks: [], cact: "standdown", combat: true }), dis); }
}
async function npcStandDown(results) {
  const sk = skillBonus("intimidation") >= skillBonus("persuasion") ? "intimidation" : "persuasion"; await waitRoll({ kind: "skill", skill: sk, dc: 13, adv: 0, reason: "Прекратить драку" });
  const r = resolveCheck({ kind: "skill", skill: sk, dc: 13, adv: 0, reason: "Прекратить драку" }); results.push(r); pushFeed({ t: "roll", r }); setTimeout(() => rollSfx(r), 520); await pause(300);
  if (r.ok) { aliveEnemiesHere().filter(id => ENEMIES[id].npc).forEach(id => { const e = S.world.enemies[id]; e.alive = false; e.surrendered = true; }); results.push({ kind: "note", title: "Драка прекращена: противники опустили оружие, но смотрят с ненавистью и страхом (бой окончен)" }); }
  else results.push({ kind: "note", title: "Слова не подействовали — драка продолжается" });
}
/* сводка для рассказчика */
function npcBrief() {
  const w = S.world; const out = []; const dead = Object.entries(w.deadNpcs || {}).filter(([id]) => NPCS[id]);
  if (dead.length) out.push(`ПОГИБШИЕ НПС (мертвы окончательно — не оживляй и не выводи в сценах; их смерть меняет сюжет: знание, которое они хранили, теперь добывается иначе — у близких, в их доме, на теле; планы злодея могут ускориться или рухнуть; развязка должна это учитывать): ${dead.map(([id, d]) => `${NPCS[id].name} (${NPCS[id].role}) — ${d.how}, день ${d.day}${d.seen ? ", при свидетелях" : ", тайно"}`).join("; ")}.`);
  const ko = Object.keys(w.ko || {}).filter(id => NPCS[id]); if (ko.length) out.push(`БЕЗ СОЗНАНИЯ: ${ko.map(id => NPCS[id].name).join(", ")}.`);
  const hostile = Object.keys(w.hostile || {}).filter(id => NPCS[id] && !NPCS[id].dead && !w.ko?.[id]); if (hostile.length) out.push(`ВРАЖДУЮТ С ГЕРОЕМ (дерутся): ${hostile.map(id => NPCS[id].name).join(", ")}.`);
  const crimes = (w.crimes || []).slice(-4); if (crimes.length) out.push(`ПРЕСТУПЛЕНИЯ ГЕРОЯ: ${crimes.map(c => `${c.k === "murder" ? "убийство" : "нападение"} — ${NPCS[c.npc]?.name || "?"} (день ${c.day}, ${c.seen ? "видели" : "тайно"})`).join("; ")}.`);
  if (w.wanted) out.push(`РОЗЫСК (${w.wanted === 2 ? "за убийство" : "за нападение"}): местные сторонятся героя, торговцы ${w.wanted >= 2 ? "отказываются торговать" : "насторожены"}; стражники при встрече требуют сдаться и, если герой отказывается, нападают (верни их id в npc_attack). Мрачные концовки допустимы: изгнание, суд, виселица — или власть через страх.`);
  return out.length ? out.join("\n") + "\n" : "";
}
function npcAttackEffects(list) { (Array.isArray(list) ? list : []).slice(0, 3).forEach(nid => { if (!NPCS[nid] || NPCS[nid].dead || !POIS[S.world.loc].npcs.includes(nid)) return; const eid = makeHostile(nid); if (!eid) return; const st = ensureNpcState(nid); st.mem.push("напал(а) на героя"); pushFeed({ t: "chips", items: [{ c: "dmg", x: `${NPCS[nid].name} нападает!` }] }); if (!S.world.combat) { S.world.fightId = uid(); S.world.round = 1; encStartCombat(false); } }); }
/* особые приёмы НПС в бою */
function npcSpecial(id, it, out) {
  const E = ENEMIES[id]; const e = S.world.enemies[id];
  if (it.k === "call") { (e.used = e.used || {}).call = true; const nid = spawnFoes("guard_x", "Стражник", 1, S.world.loc)[0]; S.world.enemies[nid].fight = S.world.fightId; S.world.enemies[nid].pos = { x: 1, y: 6 }; out.push({ kind: "enemy", by: id, title: `${E.name} свистит — на шум прибегает стражник`, formula: "Подмога", nat: 0, ok: false, enemyRoll: true, skip: true, summon: nid }); e.intent = undefined; return true; }
  if (it.k === "pray") { e.cd = 2; const d = rollDice("1d8+2"); e.hp = Math.min(E.hp, e.hp + d.total); out.push({ kind: "enemy", by: id, title: `${E.name} молится — раны затягиваются`, formula: `исцеление ${d.text}`, nat: 0, ok: false, enemyRoll: true, skip: true, healed: d.total }); e.intent = undefined; return true; }
  return false;
}
BESTIARY.guard_x = { label: "стражник", ac: 16, hp: 11, atk: 3, dmg: "1d6+1", dex: 1, xp: 25, npcOnly: true }; FOE_KIT.guard_x = FOE_KIT.guard; FOE_ICO.guard_x = "b_watch";
{ const _hurt0 = hurtEnemy; hurtEnemy = function (id, amt) { const was = S.world.enemies[id]?.alive; _hurt0(id, amt); const e = S.world.enemies[id]; if (was && e && !e.alive && ENEMIES[id]?.npc) npcDown(id); }; }
