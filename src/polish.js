/* POLISH */
/* =========================================================================
   ПАМЯТЬ ИГРОКА, ПОПРАВКИ, ЭПИЛОГ, СЛУЧАЙНЫЙ ГЕРОЙ, ПОДСКАЗКИ, ГОРЯЧИЕ КЛАВИШИ,
   РАЗМЕР ТЕКСТА, ЗАЩИТА СОХРАНЕНИЙ
   ========================================================================= */
/* ---------- защита сохранений ---------- */
let storageWarned = false;
function lsUsage() { let n = 0; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); n += (k.length + (localStorage.getItem(k) || "").length) * 2; } } catch (e) {} return n; }
function saveRescue() {
  const key = C_KEY(S.id);
  if (S.feed.length > 70) S.feed.splice(0, S.feed.length - 70); if (S.log.length > 24) S.log.splice(0, S.log.length - 24);
  Object.values(S.wd.npcs || {}).forEach(n => { if (n.img && String(n.img).startsWith("data:")) delete n.img; }); if (lsSet(key, S)) return true;
  const cur = new Set([S.wd.id]); Object.keys(imgCache).forEach(k => { if (!cur.has(k.split(":")[0]) && String(imgCache[k]).startsWith("data:")) delete imgCache[k]; }); lsSet(IMG_KEY, imgCache); if (lsSet(key, S)) return true;
  Object.keys(imgCache).forEach(k => { if (String(imgCache[k]).startsWith("data:")) delete imgCache[k]; }); lsSet(IMG_KEY, imgCache); if (lsSet(key, S)) return true;
  if (!storageWarned) { storageWarned = true; modal(`<div class="eyebrow" style="color:var(--ember)">Сохранение не удалось</div><h2>Память браузера заполнена</h2><p>Игра не смогла записать прогресс: место в хранилище браузера закончилось. Освободите место — удалите старые кампании на главной или экспортируйте их в файл.</p><div class="row"><button class="btn" type="button" id="sw-ok">Понятно</button><button class="btn primary" type="button" id="sw-home">К кампаниям</button></div>`, root => { root.querySelector("#sw-ok").onclick = closeModal; root.querySelector("#sw-home").onclick = () => { closeModal(); document.getElementById("btn-home")?.click(); }; }); }
  return false;
}
function addStorageNote() { const head = document.querySelector("#screen-home .band-head"); if (!head || head.querySelector(".storage-note")) return; const used = lsUsage() / 1048576; const pct = Math.min(100, used / 5 * 100);
  head.insertAdjacentHTML("beforeend", `<div class="storage-note" title="Кампании, миры и портреты хранятся в вашем браузере"><span>Память браузера: ${used.toFixed(1)} из ~5 МБ</span><i><b style="width:${pct}%;background:${pct > 85 ? "var(--ember)" : pct > 65 ? "var(--lantern)" : "var(--kelp)"}"></b></i></div>`); }
/* ---------- записи и поправки игрока ---------- */
function pinsOf() { return S.world.pins || (S.world.pins = []); }
function pinsBrief() { const p = pinsOf(); return p.length ? `ЗАПИСИ И ПОПРАВКИ ИГРОКА (это канон — важнее всего остального, соблюдай строго):\n${p.map((x, i) => `${i + 1}) ${x.k === "fix" ? "Поправка: " : ""}${x.t}`).join("\n")}\n` : ""; }
function addPin(t, k) { t = str(t, 200); if (!t) return; pinsOf().push({ t, k: k || "note", day: worldTime().day }); if (pinsOf().length > 20) pinsOf().shift(); save(); }
function chronHTML() {
  const p = pinsOf();
  return `<div class="mem-pins"><div class="eyebrow">Записи героя · канон для рассказчика</div>
    ${p.length ? `<ul class="pin-list">${p.map((x, i) => `<li class="${x.k}"><span>${x.k === "fix" ? "<b>Поправка:</b> " : ""}${esc(x.t)}</span><button type="button" class="pin-x" data-pin="${i}" aria-label="Удалить запись">✕</button></li>`).join("")}</ul>` : `<p class="empty">Запишите то, что рассказчик не должен забыть: обещания, долги, договорённости, важные детали. Он будет строго соблюдать эти записи.</p>`}
    <form class="pin-add" id="pin-add"><input id="pin-t" maxlength="200" placeholder="Например: я пообещал Осту не выдавать его брата" autocomplete="off"><button class="btn small primary" type="submit">Записать</button></form></div>
    <div class="mem-sum"><div class="row" style="justify-content:space-between;align-items:center"><div class="eyebrow">Краткая летопись</div><button class="btn small ghost" type="button" id="sum-edit">${S.summary ? "Править" : "Написать"}</button></div>
      <div id="sum-box">${S.summary ? `<p class="summary-box j-sum">${esc(S.summary)}</p>` : `<p class="empty">Появится, когда история станет длиннее.</p>`}</div></div>
    <div class="eyebrow" style="margin-top:14px">Факты, которые помнит рассказчик</div>
    ${S.world.facts.length ? `<ol class="chron edit">${S.world.facts.map((f, i) => `<li><span>${esc(f)}</span><button type="button" class="pin-x" data-fact="${i}" title="Это неверно — забыть" aria-label="Удалить факт">✕</button></li>`).join("")}</ol>` : `<p class="empty">Летопись пока пуста.</p>`}`;
}
function bindChron(root, redraw) {
  root.querySelector("#pin-add")?.addEventListener("submit", e => { e.preventDefault(); const v = root.querySelector("#pin-t").value; if (!v.trim()) return; addPin(v, "note"); sfx("pick"); redraw(); });
  root.querySelectorAll("[data-pin]").forEach(b => b.onclick = () => { pinsOf().splice(+b.dataset.pin, 1); save(); redraw(); });
  root.querySelectorAll("[data-fact]").forEach(b => b.onclick = () => { S.world.facts.splice(+b.dataset.fact, 1); save(); redraw(); });
  root.querySelector("#sum-edit")?.addEventListener("click", () => { const box = root.querySelector("#sum-box"); box.innerHTML = `<textarea id="sum-t" maxlength="1200" style="width:100%;min-height:110px">${esc(S.summary || "")}</textarea><div class="row" style="justify-content:flex-end;margin-top:6px"><button class="btn small primary" type="button" id="sum-save">Сохранить</button></div>`;
    box.querySelector("#sum-save").onclick = () => { S.summary = str(box.querySelector("#sum-t").value, 1200); save(); redraw(); }; });
}
function openFix(text) {
  modal(`<div class="eyebrow">Поправить рассказчика</div><h2>Что не так?</h2><p class="home-note">Рассказчик ошибся — перепутал имя, забыл событие, нарушил правила мира? Опишите, как на самом деле. Поправка станет каноном и будет учитываться во всех следующих ходах.</p>
    ${text ? `<blockquote class="fix-q">${esc(text.slice(0, 260))}${text.length > 260 ? "…" : ""}</blockquote>` : ""}
    <textarea id="fix-t" maxlength="200" placeholder="Например: Марта рыжая, а не седая. Я не брал денег у старосты." style="width:100%;min-height:90px"></textarea>
    <div class="row"><button class="btn" type="button" id="fix-no">Отмена</button><button class="btn primary" type="button" id="fix-ok">Записать поправку</button></div>`, root => {
    const t = root.querySelector("#fix-t"); t.focus(); root.querySelector("#fix-no").onclick = closeModal;
    root.querySelector("#fix-ok").onclick = () => { if (!t.value.trim()) return; addPin(t.value, "fix"); closeModal(); pushFeed({ t: "chips", items: [{ c: "xp", x: "Поправка записана — рассказчик её учтёт" }] }); sfx("chime"); };
  });
}
document.addEventListener("click", e => { const b = e.target.closest?.(".narr-fix"); if (!b || !S) return; openFix(b.parentElement.querySelector(".tx")?.innerText || ""); });
/* ---------- эпилог ---------- */
function campaignStats() {
  const w = S.world; const c = C(); const killed = Object.keys(w.enemies).filter(id => !w.enemies[id].alive && !w.enemies[id].fled && !w.enemies[id].surrendered && !w.enemies[id].ko && !ENEMIES[id]?.npc).length;
  const npcDead = Object.keys(w.deadNpcs || {}); const qs = allQuests().map(q => qSt(q.id).st); const done = qs.filter(s => s === "done").length, failed = qs.filter(s => s === "failed").length;
  const spared = Object.keys(w.enemies).filter(id => w.enemies[id].surrendered || w.enemies[id].ko).length; const secretMurders = (w.crimes || []).filter(x => x.k === "murder" && !x.seen).length;
  return { day: worldTime().day, turns: S.turn, killed, npcDead, done, failed, rep: w.rep || 0, money: purse(c), level: c.level, clues: Object.keys(w.flags || {}).filter(k => k.startsWith("clue_")).length, spared, secretMurders, crimes: (w.crimes || []).length, places: w.visited.length };
}
function endingBadges(st) {
  const b = []; if (st.npcDead.length >= 2) b.push(["k_skull", "Мясник", "убито жителей: " + st.npcDead.length]); else if (st.npcDead.length) b.push(["k_skull", "Убийца", "на руках кровь жителя"]);
  if (st.secretMurders) b.push(["t_hidden", "Тень", "тайные убийства"]); if (!st.npcDead.length && !st.crimes && st.spared) b.push(["k_heart", "Милосердный", "пощадил побеждённых"]);
  if (st.done >= 3) b.push(["t_quest", "Добрый сосед", `поручений выполнено: ${st.done}`]); if (st.rep >= 30) b.push(["k_trophy", "Любимец народа", "репутация " + st.rep]); if (st.rep <= -30) b.push(["k_broken", "Изгой", "репутация " + st.rep]);
  if (st.killed >= 10) b.push(["k_swords", "Гроза чудовищ", `повержено врагов: ${st.killed}`]); if (st.clues >= 4) b.push(["x_look", "Сыщик", `улик найдено: ${st.clues}`]); if (st.places >= 10) b.push(["t_boots", "Странник", `мест посещено: ${st.places}`]); if (st.money >= 1000) b.push(["i_coins", "Богач", fmtMoney(st.money)]);
  if (!b.length) b.push(["i_scroll", "Летописец", "история рассказана"]); return b;
}
function showEpilogueText() { openEpilogue(true, true); }
async function openEpilogue(manual, reuse) {
  if (!S) return; const st = campaignStats(); const badges = endingBadges(st); const c = C();
  modal(`<div class="epi"><div class="epi-head"><div class="eyebrow">Эпилог${S.endingName ? " · " + esc(S.endingName) : ""}</div><h2>${esc(WD.name)}</h2><small class="home-note">${esc(c.name)}, ${esc(CLASSES[c.cls].name.toLowerCase())} ${c.level} уровня · день ${st.day} · ходов: ${st.turns}</small></div>
    <div class="epi-text" id="epi-text"><p class="thinking-l"><span class="dots"><i></i><i></i><i></i></span> Летописец дописывает последнюю страницу…</p></div>
    <div class="epi-badges">${badges.map(([i, t, s]) => `<div class="epi-b">${ico(i, 26)}<span><b>${t}</b><small>${esc(s)}</small></span></div>`).join("")}</div>
    <div class="epi-stats"><span>Повержено врагов <b>${st.killed}</b></span><span>Поручения <b>${st.done}</b>${st.failed ? ` / провалено ${st.failed}` : ""}</span><span>Улики <b>${st.clues}</b></span><span>Репутация <b>${st.rep}</b></span><span>Кошель <b>${fmtMoney(st.money)}</b></span>${st.npcDead.length ? `<span class="bad">Погибли жители <b>${st.npcDead.length}</b></span>` : ""}</div>
    <div class="row epi-row"><button class="btn" type="button" id="epi-txt">Скачать летопись</button><button class="btn" type="button" id="epi-home">К кампаниям</button><button class="btn primary" type="button" id="epi-go">Продолжить играть</button></div></div>`, async root => {
    root.querySelector(".modal").classList.add("wide", "epi-modal");
    root.querySelector("#epi-go").onclick = closeModal; root.querySelector("#epi-home").onclick = () => { closeModal(); save(); S = null; renderHome(); };
    root.querySelector("#epi-txt").onclick = () => downloadChronicle(root.querySelector("#epi-text").innerText);
    if (!reuse) sfx("victory"); S.ended = true; S.endedDay = S.endedDay || st.day; save();
    const text = reuse && S.epilogue ? S.epilogue : await writeEpilogue(st); S.epilogue = text; save(); const box = root.querySelector("#epi-text"); if (box) box.innerHTML = narrHTML(text);
  });
}
async function writeEpilogue(st) {
  const sample = await getSample(); const dead = st.npcDead.map(id => `${NPCS[id].name} (${NPCS[id].role}) — ${S.world.deadNpcs[id].how}`).join("; ") || "никто";
  const npcs = Object.keys(NPCS).filter(id => !NPCS[id].bld && !NPCS[id].traveler && !NPCS[id].dead).map(id => `${NPCS[id].name} (${NPCS[id].role}): отношение ${S.world.npcs[id]?.att || 0}`).join("; ");
  const fallback = () => `${C().name} покидает ${WD.name}. ${st.npcDead.length ? `Здесь ещё долго будут вспоминать тех, кто погиб от его руки: ${dead}.` : "Люди провожают героя кто благодарным словом, кто настороженным взглядом."} ${st.done ? `Выполнено поручений: ${st.done}.` : ""}\n\n${S.world.quest}\n\nЛетопись закрыта — но дороги остаются открытыми.`;
  if (!sample) return fallback();
  try { const r = await sample(`Ты — летописец. Напиши эпилог завершённой кампании настольной ролевой игры. По-русски, 3–4 коротких абзаца, во втором лице («ты»), в тоне: ${(NARR_TONES[S.settings?.tone] || NARR_TONES.classic).prompt}
Абзацы: 1) чем закончилась главная история и что стало с тайной; 2) судьбы ключевых жителей; 3) что изменилось в этих местах из-за поступков героя; 4) куда ведёт дорога героя дальше. Честно отрази и добрые, и тёмные поступки, без морализаторства. Не используй списки и заголовки.
МИР «${WD.name}»: ${WD.public}
ТАЙНА: ${WD.secret}
ВОЗМОЖНЫЕ КОНЦОВКИ: ${(WD.endings || []).join(" | ")}${S.endingName ? `\nНАСТУПИВШАЯ КОНЦОВКА: ${S.endingName}` : ""}
ГЕРОЙ: ${charBrief()}
ТЕКУЩЕЕ ЗАДАНИЕ НА МОМЕНТ ФИНАЛА: ${S.world.quest}
ЛЕТОПИСЬ: ${S.summary || ""} ${S.world.facts.slice(-16).join(" | ")}
${pinsBrief()}ПОГИБШИЕ ЖИТЕЛИ: ${dead}. ЖИВЫЕ ЖИТЕЛИ: ${npcs}.
Поручения выполнены: ${st.done}, провалены: ${st.failed}. Репутация: ${st.rep}. Повержено врагов: ${st.killed}. Преступлений: ${st.crimes}.`, { modelTier: "default", cache: false });
    return str(r.text, 3000).replace(/@@@[\s\S]*$/, "").trim() || fallback(); } catch (e) { return fallback(); }
}
async function downloadChronicle(epi) {
  let dl = null; try { dl = window.claude?.use ? await window.claude.use("downloads") : null; } catch (e) {}
  const story = S.feed.filter(e => e.t === "narr" || e.t === "player").map(e => e.t === "player" ? `— ${e.text}` : e.text).join("\n\n");
  const txt = `${WD.name}\n${C().name} · ${RACES[C().race].name} · ${CLASSES[C().cls].name}\n\nЭПИЛОГ\n${epi || S.epilogue || ""}\n\nЛЕТОПИСЬ\n${S.summary || ""}\n\n${S.world.facts.map(f => "• " + f).join("\n")}\n\nПОСЛЕДНИЕ СТРАНИЦЫ\n${story}`;
  if (!dl) { pushFeed({ t: "sys", html: "Сохранение файлов недоступно в этом просмотре." }); return; }
  try { await dl.save({ filename: `${C().name}-${WD.name}-летопись.txt`.replace(/[\\/:*?"<>|]/g, ""), data: txt }); } catch (e) {}
}
function confirmEnding() {
  modal(`<div class="eyebrow">Финал</div><h2>Завершить историю?</h2><p>Летописец напишет эпилог по вашим поступкам: тайна, судьбы жителей, цена решений. После эпилога можно продолжить играть в этом мире.</p><div class="row"><button class="btn" type="button" id="ce-no">Ещё не время</button><button class="btn primary" type="button" id="ce-yes">Написать эпилог</button></div>`, root => {
    root.querySelector("#ce-no").onclick = closeModal; root.querySelector("#ce-yes").onclick = () => { closeModal(); openEpilogue(true); }; });
}
/* ---------- случайный герой ---------- */
function shuffleArr(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const LOOK_BITS = { hair: ["коротко стриженные тёмные волосы", "рыжая коса", "седые виски", "светлые растрёпанные волосы", "бритая голова", "чёрные волосы, собранные в хвост"], face: ["шрам через бровь", "веснушки", "тяжёлый взгляд", "сломанный нос", "добрые морщинки у глаз", "татуировка на шее"], wear: ["потёртый дорожный плащ", "кожаная куртка с заплатами", "плащ с капюшоном", "простая льняная рубаха и пояс с ножом", "выцветший мундир", "шерстяной плащ с меховым воротником"] };
function randomHero() {
  const R = Math.random, pick = a => a[Math.floor(R() * a.length)];
  D.race = pick(Object.keys(RACES)); D.cls = pick(Object.keys(CLASSES)); D.method = "array"; D.pool = STD.slice(); D.pickTok = null; autoAssign();
  D.bg = pick(Object.keys(BACKGROUNDS)); const lk = lockedSkills(); const cl = CLASSES[D.cls]; D.skills = shuffleArr(cl.skillList.filter(k => !lk.has(k))).slice(0, cl.skillCount);
  D.kit = Math.floor(R() * (KITS[D.cls]?.length || 1)); D.kitSeed = rnd(1e9); D.kitW = null; if (D.cls === "ranger") D.favored = pick(Object.keys(FAVORED));
  D.gender = R() < .5 ? "m" : "f"; const ns = nameSet(D.world); D.name = pick(ns[D.gender] || ns.m); D.lookDesc = `${pick(LOOK_BITS.hair)}, ${pick(LOOK_BITS.face)}, ${pick(LOOK_BITS.wear)}`;
  TRAITS.forEach(t => { D[t.k] = R() < .45 ? (R() < .5 ? 12 + Math.round(R() * 14) : 74 + Math.round(R() * 14)) : 40 + Math.round(R() * 20); });
  D.story = ""; D.epithet = ""; D.about = ""; D.step = 6; sfx("dice"); renderCreate();
}
/* ---------- подсказки при первом знакомстве ---------- */
const TIPS_KEY = "sh-tips";
const TIPS = {
  welcome: ["Как играть", "Пишите что угодно: действие, реплику, план — рассказчик поймёт. Кнопки над полем ввода — готовые идеи. Справа карта мира и план места: по ним можно ходить и нажимать на людей и предметы. Журнал хранит поручения и записи, которые рассказчик никогда не забудет."],
  combat: ["Бой", "Выберите цель на карточке врага. Под ней видно, что враг задумал, — успейте ответить: уклониться, сбить с ног, оценить врага. На кнопке атаки показан шанс попасть. Темп боя меняется в настройках."],
  map: ["Путешествия", "Нажмите на любую точку карты — путь проложится сам. Выберите темп: осторожно — дольше, но безопаснее. В дороге случаются встречи."],
  enc: ["Встреча в пути", "Выберите, как поступить. Подписи под вариантами — какая проверка нужна и насколько это трудно."],
  quest: ["Поручения", "Жители со знаком «!» просят о помощи. Поручения отмечаются на карте, а выполненные сдаются тому, кто просил (знак «?»). Некоторые помогают раскрыть главную тайну."]
};
function tipOnce(k) {
  let seen = lsGet(TIPS_KEY) || {}; if (seen.off || seen[k] || !TIPS[k]) return; seen[k] = 1; lsSet(TIPS_KEY, seen);
  document.querySelector(".tip-toast")?.remove(); const t = document.createElement("div"); t.className = "tip-toast"; t.setAttribute("role", "status");
  t.innerHTML = `<b>${TIPS[k][0]}</b><p>${TIPS[k][1]}</p><div class="row"><button type="button" class="btn small ghost" data-t="off">Больше не показывать</button><button type="button" class="btn small primary" data-t="ok">Понятно</button></div>`;
  document.body.append(t); t.querySelector("[data-t=ok]").onclick = () => t.remove(); t.querySelector("[data-t=off]").onclick = () => { seen = lsGet(TIPS_KEY) || {}; seen.off = 1; lsSet(TIPS_KEY, seen); t.remove(); };
  setTimeout(() => t.classList.add("in"), 30);
}
/* ---------- размер текста ---------- */
const FS_KEY = "sh-fs"; const FS = { s: "Мелкий", m: "Обычный", l: "Крупный", xl: "Очень крупный" };
function applyFs() { const v = lsGet(FS_KEY) || "m"; Object.keys(FS).forEach(k => document.body.classList.toggle("fs-" + k, k === v)); }
applyFs();
/* ---------- горячие клавиши ---------- */
document.addEventListener("keydown", e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return; const tag = document.activeElement?.tagName; if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  const mr = document.getElementById("modal-root"); const open = mr && mr.innerHTML.trim();
  if (e.key === "Escape" && open) { const b = [...mr.querySelectorAll("button")].find(x => /close|-x$|-ok$|-no$/.test(x.id || "") || /^(Закрыть|Готово|Отмена|Передумать|Не сейчас|Ещё не время)$/.test(x.textContent.trim())); if (b && !mr.querySelector(".enc")) { e.preventDefault(); b.click(); } return; }
  if (open || !S || document.getElementById("screen-game").hidden) return;
  const k = e.key.toLowerCase();
  if (k === "m" || k === "ь") { e.preventDefault(); openBigMap(); return; } if (k === "j" || k === "о") { e.preventDefault(); openJournal(); return; }
  if (k === "/" ) { e.preventDefault(); document.getElementById("act-input")?.focus(); return; }
  if (/^[1-9]$/.test(k) && S.world.combat) { const btns = [...document.querySelectorAll("#combat-hud .cb-act")]; const b = btns[+k - 1]; if (b && !b.disabled) { e.preventDefault(); b.click(); } return; }
  if (k === "tab" && S.world.combat) { const al = aliveEnemiesHere(); if (al.length > 1) { e.preventDefault(); const i = al.indexOf(curTarget()); setTarget(al[(i + 1) % al.length]); } }
});
/* обёртки: подсказки и заметка о памяти */
{ const _rh = renderHome; renderHome = function () { _rh.apply(this, arguments); try { addStorageNote(); } catch (e) {} }; }
{ const _ob = openBigMap; openBigMap = function (o) { _ob(o); setTimeout(() => tipOnce("map"), 600); }; }
{ const _oe = openEncounter; openEncounter = function () { _oe(); setTimeout(() => tipOnce("enc"), 500); }; }
{ const _oq = openQuestOffer; openQuestOffer = function (q) { _oq(q); setTimeout(() => tipOnce("quest"), 500); }; }
{ const _sg = startGame; startGame = function (f) { _sg(f); setTimeout(() => tipOnce("welcome"), 1600); }; }
