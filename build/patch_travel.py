import re
P='/home/claude/salt-harbor.html'; h=open(P).read()
def cut_fn(h,name):
    a=h.find('\nfunction '+name+'('); assert a>=0,name
    m=re.compile(r'\n(?=function |/\*|const |let |async function )').search(h,a+10)
    return h[:a]+h[m.start():]
for f in ['drawMap','openBigMap']: h=cut_fn(h,f)
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:80]); h=h.replace(x,y)
# world setup
R('ensureBuildings(def); WD = def;','ensureBuildings(def); ensureQuests(def); WD = def;')
R('function outerEntries() { return Object.entries(POIS).filter(([, p]) => !p.inner); }',
  'function outerEntries() { return Object.entries(POIS).filter(([id, p]) => !p.inner && (!p.wild || p.keep || (S && S.world && S.world.loc === id))); }')
# moveTo: время по маршруту и позиция героя
R('if (S.world.loc !== id && !near) advanceTime(1);','if (S.world.loc !== id && !near) { if (!tripTimeDone) passHours(p.inner ? .25 : travelHoursTo(id)); } tripTimeDone = false;')
R("S.world.loc = id; if (!S.world.visited.includes(id)) S.world.visited.push(id);","S.world.loc = id; if (!p.inner) { S.world.pos = { x: p.x, y: p.y }; S.world.posLoc = id; } if (!S.world.visited.includes(id)) S.world.visited.push(id);")
# карта: значки поручений и слой героя
R('+ (st.clue || st.note ? `<i class="mk-b clue" title="${esc(st.note || "Найдены улики")}"></i>` : "");','+ (st.clue || st.note ? `<i class="mk-b clue" title="${esc(st.note || "Найдены улики")}"></i>` : "") + questBadge(id);')
R('    layer.append(b);\n  });\n}\n','    layer.append(b);\n  });\n  mapOverlay(box, o, layer);\n}\n')
# renderWorld: задание + поручения, кнопка перехода
R('<div class="card" style="background:transparent"><div class="eyebrow">Задание</div><p style="color:var(--foam);margin-top:4px">${esc(S.world.quest)}</p></div>','${encCardHTML()}${questCardHTML()}')
R('const go = el.querySelector("#go-sel"); if (go) go.onclick = () => { const p = mapSel; mapSel = null; takeTurn(`Иду: ${POIS[p].name}`, { checks: [], move_to: p }); };',
  'const go = el.querySelector("#go-sel"); if (go) go.onclick = () => { const p = mapSel; mapSel = null; openBigMap({ target: p }); };\n  el.querySelectorAll("[data-qt]").forEach(b => b.onclick = () => { const t = b.dataset.qt; if (t && t !== hereOuter() && POIS[t]) openBigMap({ target: t }); });\n  el.querySelector("#enc-open")?.addEventListener("click", openEncounter); el.querySelector("#trip-go")?.addEventListener("click", resumeTrip);')
# NPC в списке «Здесь»: значок поручения
R('b.innerHTML = `${npcPh(id)}<span class="t"><b>${esc(n.name)}</b><small>${esc(n.role)}</small></span><span class="att ${cl}">${lab}</span>`;\n    b.onclick = () => { const inp = document.getElementById("act-input"); inp.value = `${n.name}, `; inp.focus(); showTab("story"); };\n    list.append(b); });',
  'const qm = questMark(id); b.innerHTML = `${npcPh(id)}<span class="t"><b>${esc(n.name)}</b><small>${esc(n.role)}</small></span>${qm ? `<span class="q-mark${qm === "?" ? " d" : ""}" title="${qm === "?" ? "Можно сдать поручение" : "Есть просьба"}">${qm}</span>` : ""}<span class="att ${cl}">${lab}</span>`;\n    b.onclick = () => { const qa = questNpcActs(id); if (qa.length && !busy) { qa[0].fn(); return; } const inp = document.getElementById("act-input"); inp.value = `${n.name}, `; inp.focus(); showTab("story"); };\n    list.append(b); });')
# подсказки: продолжить путь / встреча
R('  (S.suggestions || []).slice(0, 3).forEach(t => {','  if (!S.dead && !S.dying && !S.world.combat) { if (S.world.enc && !encDone()) { const eb = document.createElement("button"); eb.type = "button"; eb.className = "cont trip"; eb.textContent = "⚑ " + S.world.enc.title; eb.disabled = busy; eb.onclick = openEncounter; s.append(eb); } else if (S.world.trip && (S.world.trip.dest ? POIS[S.world.trip.dest] : S.world.trip.tile)) { const tb = document.createElement("button"); tb.type = "button"; tb.className = "cont trip"; tb.textContent = "Продолжить путь" + (S.world.trip.dest ? ": " + POIS[S.world.trip.dest].name : " ▸"); tb.disabled = busy; tb.onclick = resumeTrip; s.append(tb); } }\n  (S.suggestions || []).slice(0, 3).forEach(t => {')
# takeTurn: перехват дальних переходов и хуки
R('    plan.notes.forEach(n => pushFeed({ t: "sys", html: esc(n) }));\n    const results = [];',
  '    plan.notes.forEach(n => pushFeed({ t: "sys", html: esc(n) }));\n    if (plan.move_to && !(preset && preset.fromTrip) && !S.world.combat && needsTrip(plan.move_to)) { thinking?.remove(); busy = false; setBusy(false); const dest = plan.move_to; setTimeout(() => openBigMap({ target: dest, autostart: true }), 60); return; }\n    const results = [];')
R('bldAfterChecks(results); searchAfterChecks(results);','bldAfterChecks(results); searchAfterChecks(results); encAfterChecks(results); questAfterChecks(results);')
R('function after() { renderAll(); save(); }','function after() { questTick(); renderAll(); save(); }')
# эффекты рассказчика
R('  if (eff.quest && typeof eff.quest === "string") {','  sideQuestEffects(eff.side_quests);\n  if (eff.quest && typeof eff.quest === "string") {')
R('${sceneBrief()}','${sceneBrief()}\n${travelBrief()}${questBrief()}',2)
R('"rep": 0, "scene":','"rep": 0, "side_quests": [], "scene":')
R('rep — изменение репутации','side_quests — [{"id":"id поручения","status":"ready|failed"}] только если поручение явно выполнено или провалено НЕ через механику движка (например, договорился словами), иначе []. rep — изменение репутации')
# сцена: предметы поручений и действия НПС
R('.map((a, i) => ({ ...a, id: "a" + i, act: true, search: !a.drop,','.map((a, i) => ({ ...a, id: "a" + i, act: true, search: !a.drop && !a.q && !a.disc,')
R('if (o.drop) acts.unshift({ t: "Поднять", fn: () => pickupDropped(id, o), dis: busy });','if (o.drop) acts.unshift({ t: "Поднять", fn: () => pickupDropped(id, o), dis: busy }); if (o.q) acts.unshift(...questObjActs(id, o)); if (o.disc && S.world.enc?.loc === id && !encDone()) acts.unshift({ t: "Решить, что делать", fn: openEncounter, dis: busy });')
R('      ...(mer ? [{ t: "Торговать", fn: () => openShop(mer), dis: busy }] : []),','      ...(zz ? [] : questNpcActs(ref)), ...(mer ? [{ t: "Торговать", fn: () => openShop(mer), dis: busy }] : []),')
R('if (p.asleep) { inner += `<circle r="12" fill="#06101f" opacity=".45"/><text x="10" y="-9" font-size="10" font-weight="700" fill="#9fd8ff">z</text>`; title += " (спит)"; } }',
  'if (p.asleep) { inner += `<circle r="12" fill="#06101f" opacity=".45"/><text x="10" y="-9" font-size="10" font-weight="700" fill="#9fd8ff">z</text>`; title += " (спит)"; } else { const qm = questMark(p.id); if (qm) { inner += `<g class="sc-q"><circle cx="11" cy="-11" r="7" fill="${qm === "?" ? "#7cc79c" : "#f2b45c"}" stroke="#0b1417" stroke-width="1.6"/><text x="11" y="-7.6" text-anchor="middle" font-size="10" font-weight="800" fill="#0b1417">${qm}</text></g>`; title += qm === "?" ? " — можно сдать поручение" : " — есть просьба"; } } }')
# отдых в дикой местности
R('tb.append(actBtn("Долгий отдых", POIS[S.world.loc].rest ? "Полное восстановление" : "Только в безопасном месте для ночлега", "8 часов", busy || S.world.combat || !POIS[S.world.loc].rest, longRest));',
  'tb.append(POIS[S.world.loc].wild && !POIS[S.world.loc].rest ? actBtn("Разбить лагерь", "Долгий отдых под открытым небом — ночью могут потревожить", "8 часов", busy || S.world.combat || (S.world.enc && !encDone()), campRest) : actBtn("Долгий отдых", POIS[S.world.loc].rest ? "Полное восстановление" : "Только в безопасном месте для ночлега", "8 часов", busy || S.world.combat || !POIS[S.world.loc].rest, longRest));')
# журнал
R('const tabs = [["quest", "Задание"], ["people",','const tabs = [["quest", "Задание"], ["side", `Поручения · ${allQuests().filter(q => ["active", "ready"].includes(qSt(q.id).st)).length}`], ["people",')
R("    if (journalTab === \"people\") return met.length","    if (journalTab === \"side\") return questJournalHTML();\n    if (journalTab === \"people\") return met.length")
R('root.querySelector("#j-body").innerHTML = body(); });','root.querySelector("#j-body").innerHTML = body(); bindJ(); });\n    const bindJ = () => root.querySelectorAll("[data-route]").forEach(b => b.onclick = () => { closeModal(); openBigMap({ target: b.dataset.route }); }); bindJ();')
# режимы: частота встреч
for k,v in [('xp: 1.5, prompt: "Режим ИСПЫТАНИЕ','enc: 1.6, xp: 1.5, prompt: "Режим ИСПЫТАНИЕ'),('death: "faint",\n','death: "faint", enc: .6,\n'),('death: "captured",\n','death: "captured", enc: .8,\n'),('deathDC: 12,','deathDC: 12, enc: 1.2,')]:
    R(k,v)
# генерация мира ИИ: побочные поручения
R("- intro — 2 коротких абзаца начала кампании","- side_quests — 3–4 побочных поручения от РАЗНЫХ НПС (giver — id НПС). type: hunt (перебить зверей/бандитов в месте; foe — тип из бестиария, не босс, n 1–3), fetch (найти и принести вещь из места; item), deliver (отнести вещь другому НПС; item и to — id НПС), investigate (разузнать, что творится в месте). target — id места (не стартового). helps — у 1–2 поручений: что герой узнает о главной тайне в награду, одна фраза; у остальных пустая строка. Поручения жизненные: у НПС свои заботы, не всё связано с тайной.\n- intro — 2 коротких абзаца начала кампании")
R('"intro":"…","intro_speaker":"npc_id"}','"side_quests":[{"giver":"npc_id","title":"до 5 слов","type":"hunt|fetch|deliver|investigate","target":"place_id","foe":{"type":"wolf","n":2,"name":"…"},"item":"","to":"","brief":"просьба НПС в «ёлочках», 1–2 предложения","goal":"что сделать, 1 фраза","helps":"","reward_gold":15}],"intro":"…","intro_speaker":"npc_id"}')
R('let id = slug(p.id, i); while (usedIds.has(id)) id += "_" + i; usedIds.add(id);','let id = slug(p.id, i); while (usedIds.has(id)) id += "_" + i; usedIds.add(id); placeIdMap[p.id] = id;')
R('const placeList = []; const usedIds = new Set();','const placeList = []; const usedIds = new Set(); const placeIdMap = {};')
R('  const sp = npcIdMap[people.intro_speaker];','''  const quests = {}; (Array.isArray(people.side_quests) ? people.side_quests : []).filter(q => q && typeof q === "object").slice(0, 5).forEach((q, i) => {
    const giver = npcIdMap[q.giver]; if (!giver || !npcs[giver]) return; const type = QTYPES[q.type] ? q.type : "investigate"; let target = placeIdMap[q.target]; if (!places[target] || target === start) target = null;
    const id = ("q" + i + "_" + giver).slice(0, 30); const d = { id, giver, type, target, title: str(q.title, 50) || "Просьба", brief: str(q.brief, 300), goal: str(q.goal, 160), helps: str(q.helps, 200), reward: { gold: clamp(Math.round(Number(q.reward_gold) || 12), 3, 40), xp: 100 } };
    if (type === "hunt") { if (!target) return; const ft = BESTIARY[q.foe?.type] && !BESTIARY[q.foe.type].boss ? q.foe.type : null; if (ft) d.foe = { type: ft, n: clamp(Math.round(Number(q.foe.n) || 2), 1, 3), name: str(q.foe.name, 30) || BESTIARY[ft].label.split(",")[0] }; else if (!places[target].enemies.length) d.foe = { type: "wolf", n: 2, name: "Волк" }; }
    if (type === "fetch") { if (!target) return; d.item = str(q.item, 40) || "Пропажа"; d.objk = "chest"; }
    if (type === "investigate") { if (!target) return; d.obj = str(q.obj || q.item, 30) || "странные следы"; }
    if (type === "deliver") { const to = npcIdMap[q.to]; if (!to || to === giver || !npcs[to]) return; d.to = to; d.item = str(q.item, 40) || "Письмо"; d.target = placeList.find(p => p.npcs.includes(to))?.id || start; }
    quests[id] = d; });
  const sp = npcIdMap[people.intro_speaker];''')
R('    places, npcs, enemies, tiles: map.tiles, roads: map.roads, houses: map.houses, labels: [] };','    places, npcs, enemies, tiles: map.tiles, roads: map.roads, houses: map.houses, labels: [], quests: Object.keys(quests).length >= 2 ? quests : undefined };')
# готовый мир: поручения
R('intro_speaker: "marta", places, npcs, enemies, tiles,','''intro_speaker: "marta", quests: {
      q_wolves: { id: "q_wolves", giver: "marta", type: "hunt", target: "grove", foe: { type: "wolf", n: 2, name: "Волк" }, title: "Волки в Сосновой роще", brief: "«Мой охотник боится соваться в рощу: по ночам там воют волки, а на прошлой неделе они задрали козу у самой околицы. Разгонишь стаю — накормлю до отвала и заплачу».", goal: "Перебить волков в Сосновой роще и вернуться к Марте", reward: { gold: 12, xp: 100, item: { name: "Зелье лечения", potion: true, heal: "2d4+2", desc: "Марта хранила его на чёрный день" } }, helps: "в ночь крушения она видела, как трое с баграми шли от рощи к скалам, где в отлив открывается грот", reveal: "cave" },
      q_rosary: { id: "q_rosary", giver: "ilva", type: "fetch", target: "lighthouse", item: "Чётки смотрителя Хальварда", objk: "item", title: "Чётки смотрителя", brief: "«Хальвард никогда не расставался с чётками. Если он мёртв, пусть хотя бы они вернутся в часовню — я отслужу по нему. Но на маяке… будь осторожен».", goal: "Найти на маяке чётки Хальварда и принести сестре Илве", reward: { gold: 8, xp: 125, item: { name: "Флакон святой воды", desc: "Освящена в Часовне Приливов" } }, secret: true },
      q_letter: { id: "q_letter", giver: "brenn", type: "deliver", to: "ost", target: "pier", item: "Запечатанное письмо", title: "Письмо для Оста", brief: "«Передай это рыбаку Осту, на пристани. Дело частное, деревенское — не открывай. Ост тебе заплатит, а я в долгу не останусь».", goal: "Отнести запечатанное письмо старосты рыбаку Осту", reward: { gold: 15, xp: 75 }, helps: "Ост, прочтя письмо, бледнеет и проговаривается: староста предупреждает кого-то, кто прячется у скал" },
      q_tackle: { id: "q_tackle", giver: "ost", type: "fetch", target: "wreck", item: "Ящик со снастями Оста", objk: "crate", title: "Снасти у обломков", brief: "«Мой ящик со снастями остался там, у обломков «Чайки». Не спрашивай, как он туда попал. Принеси — и я, может, вспомню кое-что про ту ночь».", goal: "Найти ящик Оста среди обломков и вернуть ему", reward: { gold: 6, xp: 100 }, secret: true }
    }, places, npcs, enemies, tiles,''')
open(P,'w').write(h); print("ok")
