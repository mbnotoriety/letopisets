P='/home/claude/salt-harbor.html'; h=open(P).read()
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
R('if (!S) return; S.updated = Date.now(); lsSet(C_KEY(S.id), S);','if (!S) return; S.updated = Date.now(); if (!lsSet(C_KEY(S.id), S)) saveRescue();')
R("updated: Date.now(), dead: !!s.dead,","updated: Date.now(), dead: !!s.dead, ended: !!s.ended,")
R("${e.dead ? '<div class=\"fallen\">Пал в бою</div>' : \"\"}","${e.dead ? '<div class=\"fallen\">Пал в бою</div>' : e.ended ? '<div class=\"fallen ended\">История завершена</div>' : \"\"}")
# журнал
R('        <p class="home-note">Часы угрозы растут, когда противник получает преимущество. На 3 и 6 он делает заметный ход.</p></div>`; }',
  '        <p class="home-note">Часы угрозы растут, когда противник получает преимущество. На 3 и 6 он делает заметный ход.</p>\n        <div class="j-end">${S.ended ? `<button class="btn small" type="button" id="j-epi">Перечитать эпилог</button>` : `<button class="btn small" type="button" id="j-end">Завершить историю…</button><small class="home-note">Когда главная история решена — летописец напишет эпилог по вашим поступкам.</small>`}</div></div>`; }')
R('    return `${S.summary ? `<p class="summary-box j-sum">${esc(S.summary)}</p>` : ""}${S.world.facts.length ? `<ol class="chron">${S.world.facts.map(f => `<li>${esc(f)}</li>`).join("")}</ol>` : `<p class="empty">Летопись пока пуста.</p>`}`;',
  '    return chronHTML();')
R('const bindJ = () => root.querySelectorAll("[data-route]").forEach(b => b.onclick = () => { closeModal(); openBigMap({ target: b.dataset.route }); }); bindJ();',
  'const bindJ = () => { root.querySelectorAll("[data-route]").forEach(b => b.onclick = () => { closeModal(); openBigMap({ target: b.dataset.route }); }); bindChron(root, () => { root.querySelector("#j-body").innerHTML = body(); bindJ(); }); root.querySelector("#j-end")?.addEventListener("click", () => { closeModal(); confirmEnding(); }); root.querySelector("#j-epi")?.addEventListener("click", () => { closeModal(); showEpilogueText(); }); }; bindJ();')
R('const tabs = [["quest", "Задание"], ["side",','const tabs = [["quest", "Задание"], ["side",')
# поправка в ленте
R("""(HAS_TTS ? `<button class="narr-voice" type="button" title="Озвучить" aria-label="Озвучить фрагмент">▶ Озвучить</button>` : ""); }""",
  """`<div class="narr-tools">${HAS_TTS ? `<button class="narr-voice" type="button" title="Озвучить" aria-label="Озвучить фрагмент">▶ Озвучить</button>` : ""}${e.first || e.quick ? "" : `<button class="narr-fix" type="button" title="Рассказчик ошибся — записать поправку">✎ Поправить</button>`}</div>`; }""")
# промпты
R("УСТАНОВЛЕННЫЕ ФАКТЫ (не противоречь):","${pinsBrief()}УСТАНОВЛЕННЫЕ ФАКТЫ (не противоречь):")
R('"rep": 0, "side_quests": [], "npc_attack": [],','"rep": 0, "side_quests": [], "npc_attack": [], "ending": null,')
R('npc_attack — id НПС, которые САМИ нападают','ending — короткое название концовки (3–6 слов), ТОЛЬКО если главная история окончательно завершилась в этой сцене (тайна раскрыта и разрешена, злодей побеждён или ушёл навсегда, либо всё безвозвратно проиграно), иначе null. npc_attack — id НПС, которые САМИ нападают')
R("  sideQuestEffects(eff.side_quests); npcAttackEffects(eff.npc_attack);","  sideQuestEffects(eff.side_quests); npcAttackEffects(eff.npc_attack);\n  if (eff.ending && typeof eff.ending === \"string\" && !S.ended) { S.endingName = str(eff.ending, 60); pushFeed({ t: \"chips\", items: [{ c: \"xp\", x: `Финал: ${S.endingName}` }] }); setTimeout(() => { if (!busy) openEpilogue(); else { const iv = setInterval(() => { if (!busy) { clearInterval(iv); openEpilogue(); } }, 600); } }, 1800); }")
# бой: подсказка
R('S.world.hudSeen = S.world.fightId; combatBanner("Бой!");','S.world.hudSeen = S.world.fightId; combatBanner("Бой!"); setTimeout(() => tipOnce("combat"), 2200);')
# создание: случайный герой
R("  [stepWorld, stepRace, stepClass, stepAbil, stepSkills, stepGear, stepLook, stepMode][D.step](body);","  [stepWorld, stepRace, stepClass, stepAbil, stepSkills, stepGear, stepLook, stepMode][D.step](body);\n  if (D.step >= 1 && D.step <= 5 && D.world) { const rb = document.createElement(\"button\"); rb.type = \"button\"; rb.className = \"btn small rnd-hero\"; rb.innerHTML = `${ico(\"i_gems\", 16)} Случайный герой`; rb.title = \"Собрать героя случайно и перейти к имени и облику\"; rb.onclick = randomHero; body.prepend(rb); }")
# настройки: размер текста и клавиши
R('    <div class="opt-group"><span>Описание боя</span>','    <div class="opt-group"><span>Размер текста</span><div class="opts" id="set-fs">${Object.entries(FS).map(([k, t]) => `<button type="button" data-v="${k}" aria-pressed="${(lsGet(FS_KEY) || "m") === k}">${t}</button>`).join("")}</div></div>\n    <div class="opt-group"><span>Описание боя</span>')
R('    root.querySelectorAll("#set-fight button").forEach(','    root.querySelectorAll("#set-fs button").forEach(b => b.onclick = () => { lsSet(FS_KEY, b.dataset.v); applyFs(); root.querySelectorAll("#set-fs button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); });\n    root.querySelectorAll("#set-fight button").forEach(')
R('    <div class="row"><button class="btn primary" type="button" id="set-ok">Готово</button></div>`, root => {','    <div class="opt-group"><span>Горячие клавиши</span><small class="home-note hk"><kbd>M</kbd> карта · <kbd>J</kbd> журнал · <kbd>/</kbd> к строке ввода · <kbd>R</kbd> бросить кубик · <kbd>1</kbd>–<kbd>9</kbd> действия в бою · <kbd>Tab</kbd> сменить цель · <kbd>Esc</kbd> закрыть окно</small></div>\n    <div class="row"><button class="btn" type="button" id="set-tips">Показать подсказки заново</button><button class="btn primary" type="button" id="set-ok">Готово</button></div>`, root => {\n    root.querySelector("#set-tips").onclick = e => { lsSet(TIPS_KEY, {}); e.target.textContent = "Подсказки включены"; e.target.disabled = true; };')
open(P,'w').write(h); print('ok')
