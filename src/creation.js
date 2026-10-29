/* =========================================================================
   СОЗДАНИЕ ГЕРОЯ — новые шаги
   ========================================================================= */
const ARMOR_RU = { light: "лёгкие", medium: "средние", heavy: "тяжёлые", shield: "щиты" };
const FAVORED = { undead: ["Нежить", "зомби, скелеты, утопленники", UNDEAD], beasts: ["Звери", "волки, крысы, пауки", BEASTS], humanoids: ["Люди и гоблины", "бандиты, культисты, гоблины", HUMANOIDS] };
function dots(n, max = 3) { return `<span class="dots">${Array.from({ length: max }, (_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</span>`; }
function stepRace(body) {
  head(body, "Шаг 2", "Кто вы по крови?", "Раса даёт бонусы к характеристикам, врождённые черты — и то, как вас встретят люди. Отношение меняется поступками, но первое впечатление остаётся.");
  const g = document.createElement("div"); g.className = "pick-grid";
  Object.entries(RACES).forEach(([id, r]) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "choice pick-card"; b.setAttribute("aria-pressed", String(D.race === id)); b.style.setProperty("--pc", RACE_COL[id] || "#e9c99a");
    const att = RACE_ATT[id] || 0;
    b.innerHTML = `<div class="pc-top"><span class="pc-ico">${ico("r_" + id, 40)}</span><div><div class="ch-name">${r.name}</div><div class="ch-sub">${esc(r.sub)}</div></div></div>
      <div class="pc-chips">${Object.entries(r.bonus).map(([a, v]) => `<span>${ABIL_RU[a]} +${v}</span>`).join("")}<span class="dim">шаг ${r.speed} фт</span></div>
      <ul class="pc-list">${r.traits.slice(id === "human" ? 1 : 0, 3).map(t => `<li>${esc(t)}</li>`).join("")}</ul>
      <div class="pc-social ${att <= -4 ? "neg" : att >= 2 ? "pos" : ""}"><b>Люди:</b> ${esc(RACE_SOCIAL[id] || "")}${att ? ` <span>${att > 0 ? "+" : ""}${att}</span>` : ""}</div>`;
    b.onclick = () => { D.race = id; renderCreate(); }; g.append(b);
  });
  body.append(g);
}
function classProfText(cls) {
  const a = (APROF[cls] || []).map(x => ARMOR_RU[x]); const w = WP_ONLY[cls] ? WP_ONLY[cls].map(t => WT[t].n.toLowerCase()).join(", ") : ["fighter", "barbarian", "paladin", "ranger"].includes(cls) ? "простое и воинское" : "простое" + ((WP_MART[cls] || []).length ? ", а также " + WP_MART[cls].map(t => WT[t].n.toLowerCase()).join(", ") : "");
  return { armor: a.length ? a.join(", ") : "нет", weapons: w };
}
function stepClass(body) {
  const w = D.world; const rec = {}; (w.recommended || []).forEach(r => rec[r.cls] = r.why);
  head(body, "Шаг 3", "Чем вы зарабатываете на жизнь?", `Десять путей. Мир «${esc(w.name)}» подсказывает, кому здесь будет интереснее, но справится любой.`);
  const g = document.createElement("div"); g.className = "pick-grid cls";
  Object.entries(CLASSES).forEach(([id, c]) => {
    const meta = CLASS_META[id] || { diff: 2, prim: [] };
    const b = document.createElement("button"); b.type = "button"; b.className = "choice pick-card cls-card"; b.setAttribute("aria-pressed", String(D.cls === id)); b.style.setProperty("--pc", c.color);
    b.innerHTML = `<div class="pc-top"><span class="pc-ico">${ico("c_" + id, 38)}</span><div><div class="ch-name">${c.name}</div><div class="ch-sub">${esc(c.role)}</div></div></div>
      <div class="pc-chips"><span>d${c.hd}</span>${meta.prim.map(a => `<span>${ABIL_RU[a]}</span>`).join("")}${c.spells || c.half ? `<span class="mag">магия</span>` : ""}</div>
      <p class="pc-blurb">${esc(c.blurb)}</p><div class="pc-foot"><span>Сложность ${dots(meta.diff)}</span>${rec[id] ? `<span class="rec">★ ${esc(rec[id])}</span>` : ""}</div>`;
    b.onclick = () => { D.cls = id; D.skills = []; D.kit = 0; D.kitW = null; if (D.method !== "pb") autoAssign(); renderCreate(); }; g.append(b);
  });
  body.append(g);
  if (!D.cls) return; const id = D.cls, c = CLASSES[id]; const pr = classProfText(id);
  const spells = [...(c.spells || []), ...Object.values(LEVEL_SPELLS[id] || {}).flat()];
  const det = document.createElement("div"); det.className = "cls-detail"; det.style.setProperty("--pc", c.color);
  det.innerHTML = `<div class="cd-head"><span class="pc-ico big">${ico("c_" + id, 56)}</span><div><div class="eyebrow">Выбранный класс</div><h3>${c.name}</h3><p>${esc(c.blurb)}</p></div></div>
    <div class="cd-cols"><div><h4>С первого уровня</h4><ul class="cd-feats">${c.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>
      <h4>Рост до 5 уровня</h4><ol class="cd-levels">${[2, 3, 4, 5].map(l => `<li><b>${l}</b><span>${esc(LEVEL_FEATS[id]?.[l] || "")}</span></li>`).join("")}</ol></div>
      <div><h4>Владение</h4><dl class="cd-prof"><dt>Кость хитов</dt><dd>d${c.hd}</dd><dt>Спасброски</dt><dd>${c.saves.map(a => ABIL_FULL[a]).join(", ")}</dd><dt>Доспехи</dt><dd>${pr.armor}</dd><dt>Оружие</dt><dd>${esc(pr.weapons)}</dd><dt>Навыков</dt><dd>${c.skillCount} на выбор</dd></dl>
      ${spells.length ? `<h4>Заклинания</h4><ul class="cd-spells">${[...new Set(spells)].map(s => SPELLS[s] ? `<li><b>${SPELLS[s].name}</b><small>${SPELLS[s].lvl ? SPELLS[s].lvl + " круг" : "заговор"} · ${esc(SPELLS[s].desc)}</small></li>` : "").join("")}</ul>` : ""}
      ${id === "ranger" ? `<h4>Избранный враг</h4><div class="fav" id="fav">${Object.entries(FAVORED).map(([k, [n, d]]) => `<button type="button" data-f="${k}" aria-pressed="${(D.favored || "humanoids") === k}"><b>${n}</b><small>${d}</small></button>`).join("")}</div>` : ""}</div></div>`;
  det.querySelectorAll("#fav [data-f]").forEach(b => b.onclick = () => { D.favored = b.dataset.f; renderCreate(); });
  body.append(det);
}
function stepSkills(body) {
  head(body, "Шаг 5", "Прошлое и умения", "Предыстория даёт два навыка, стартовые деньги, памятную вещь и связи: одни люди примут вас как своего, другие — насторожатся.");
  const bgg = document.createElement("div"); bgg.className = "pick-grid bg";
  Object.entries(BACKGROUNDS).forEach(([id, b]) => { const btn = document.createElement("button"); btn.type = "button"; btn.className = "choice pick-card bg-card"; btn.setAttribute("aria-pressed", String(D.bg === id));
    btn.innerHTML = `<div class="ch-name">${b.name}</div><div class="pc-chips">${b.skills.map(k => `<span>${SKILLS[k][0]}</span>`).join("")}</div><p class="pc-blurb">Вы ${esc(bgHook(id))}.</p>
      <div class="pc-foot"><span>${COIN}${b.gold || 10} зм${b.item ? " · " + esc(b.item) : ""}</span></div><div class="pc-social">${esc(BG_ATT_TXT[id] || "")}</div>`;
    btn.onclick = () => { D.bg = id; const lk = lockedSkills(); D.skills = D.skills.filter(k => !lk.has(k)); renderCreate(); }; bgg.append(btn); });
  body.append(bgg);
  const cls = CLASSES[D.cls]; const lk = lockedSkills();
  body.insertAdjacentHTML("beforeend", `<div class="subhead">Навыки класса · выбрано ${D.skills.length} из ${cls.skillCount}</div>`);
  const list = document.createElement("div"); list.className = "skill-list"; const sc = draftScores(); const fx = traitFx(D);
  cls.skillList.forEach(k => { const b = document.createElement("button"); b.type = "button"; const locked = lk.has(k); const on = D.skills.includes(k) || locked;
    b.className = "skill-opt" + (locked ? " locked" : ""); b.setAttribute("aria-pressed", String(on));
    b.innerHTML = `<span>${SKILLS[k][0]} <small>${ABIL_RU[SKILLS[k][1]]}</small></span><span class="num">${fmt(mod(sc[SKILLS[k][1]]) + (on ? 2 : 0) + (fx.skills[k] || 0))}</span>`; if (locked) b.title = "Уже есть от расы или предыстории";
    b.onclick = () => { if (locked) return; if (D.skills.includes(k)) D.skills = D.skills.filter(x => x !== k); else if (D.skills.length < cls.skillCount) D.skills.push(k); renderCreate(); }; list.append(b); });
  body.append(list);
}
function draftKit() { if (!D.cls) return null; D.kit = D.kit || 0; if (!D.kitSeed) D.kitSeed = rnd(1e9); if (!D.kitW || D.kitW.cls !== D.cls || D.kitW.ki !== D.kit || D.kitW.seed !== D.kitSeed) D.kitW = { cls: D.cls, ki: D.kit, seed: D.kitSeed, list: kitWeapons(D.cls, D.kit, D.kitSeed) }; return { kit: KITS[D.cls][D.kit], list: D.kitW.list }; }
function draftAC() { if (!D.cls) return "—"; const k = draftKit().kit; return acNow({ cls: D.cls, scores: draftScores(), gear: { armor: k.armor || null, shield: !!k.shield } }); }
function stepGear(body) {
  head(body, "Шаг 6", "Снаряжение", "Выберите набор. Каждое оружие уникально: вид, качество и история. «Другой вид» подберёт иную вариацию — например, вместо боевой косы достанется коса жнеца или крестьянская.");
  const dk = draftKit(); const fake = { cls: D.cls }; const sc = draftScores();
  const wrap = document.createElement("div"); wrap.className = "kits";
  KITS[D.cls].forEach((K, i) => {
    const sel = D.kit === i; const card = document.createElement("div"); card.className = "kit" + (sel ? " sel" : "");
    const armor = [K.armor ? ITEMS[K.armor].n : (D.cls === "barbarian" ? "Без доспеха (10 + ЛОВ + ТЕЛ)" : "Без доспеха"), K.shield ? "щит" : ""].filter(Boolean).join(" + ");
    const ac = acNow({ cls: D.cls, scores: sc, gear: { armor: K.armor || null, shield: !!K.shield } });
    card.innerHTML = `<button type="button" class="kit-head" data-k="${i}" aria-pressed="${sel}"><div><b>${esc(K.n)}</b><small>${esc(K.d)}</small></div><div class="kit-meta">${K.w.map(t => `<span class="w-mini" title="${esc(WT[t].n)}">${ico(WT[t].ico, 22)}</span>`).join("")}<span class="kit-ac">КД ${ac}</span></div></button>
      ${sel ? `<div class="kit-body">${dk.list.map(d => weaponCardHTML(d, fake)).join("")}<div class="kit-armor">${ico(K.armor ? ITEM_ICO[K.armor] : "i_backpack", 20)}<span>${esc(armor)}</span></div>
        <div class="kit-foot"><button type="button" class="btn small" id="kit-reroll">↻ Другой вид оружия</button><small class="home-note">${dk.list.some(d => d.props.includes("versatile")) && !K.shield ? "Универсальное оружие без щита бьёт сильнее (кость на шаг выше)." : dk.list.some(d => d.props.includes("two")) && K.shield ? "Двуручное оружие со щитом — с помехой." : dk.list.some(d => d.props.includes("heavy")) && RACES[D.race]?.small ? "Тяжёлое оружие для маленького героя — с помехой." : "Оружие можно сменить в любой кузнице."}</small></div></div>` : ""}`;
    wrap.append(card);
  });
  body.append(wrap);
  wrap.querySelectorAll(".kit-head").forEach(b => b.onclick = () => { D.kit = +b.dataset.k; renderCreate(); });
  wrap.querySelector("#kit-reroll")?.addEventListener("click", () => { D.kitSeed = rnd(1e9); sfx("pick"); renderCreate(); });
}
function stepLook(body) {
  head(body, "Шаг 7", "Имя, облик и характер", "Рассказчик будет обращаться к вам по имени. По описанию внешности создаётся фото-портрет. Характер влияет на навыки и на то, как к вам отнесутся люди.");
  const f = document.createElement("div"); f.className = "look-grid";
  f.innerHTML = `<div><div class="field"><label for="f-name">Имя героя</label><input id="f-name" maxlength="28" placeholder="Например, Эйрин Тёрн" value="${esc(D.name)}"></div>
  <div class="field"><label>Как к вам обращаться</label><div class="seg" id="f-gender"><button type="button" data-v="m">Он</button><button type="button" data-v="f">Она</button></div></div>
  <div class="field" style="margin-top:6px"><label for="f-about">Пара фраз о себе</label><textarea id="f-about" maxlength="300" placeholder="Боится глубокой воды. Ищет брата, ушедшего в море.">${esc(D.about)}</textarea></div>
  <div class="field"><button class="btn" type="button" id="f-story">Сочинить историю героя (ИИ)</button><small id="f-story-st"></small></div></div>
  <div><div class="field"><label for="f-look">Внешность</label><textarea id="f-look" maxlength="400" placeholder="Высокая, коротко стриженные чёрные волосы, шрам через бровь, серые глаза, потёртый плащ с капюшоном" style="min-height:120px">${esc(D.lookDesc)}</textarea><small>Чем конкретнее, тем точнее портрет: возраст, волосы, лицо, одежда, приметы.</small></div>
  ${modelPickerHTML("look-model", true)}
  <div class="field"><button class="btn primary" type="button" id="f-photo">${D.img ? "Другой вариант" : "Создать фото-портрет"}</button><small id="f-photo-st">${esc(imgNote)}</small></div></div>`;
  body.append(f);
  const tr = document.createElement("div"); tr.className = "traits";
  const drawFx = () => { const fx = traitFx(D); tr.querySelector("#tr-fx").innerHTML = fx.notes.length ? fx.notes.map(n => `<li><b>${n.name}</b><span>${esc(n.txt)}</span></li>`).join("") : `<li class="dim">Сдвиньте ползунок к краю, чтобы черта заработала (≤30 или ≥70).</li>`;
    tr.querySelector("#tr-words").textContent = traitWords(D); };
  tr.innerHTML = `<div class="tr-head"><h3>Характер</h3><span class="home-note">Вас запомнят как: <b id="tr-words"></b></span></div><div class="tr-grid"><div class="tr-sliders">${TRAITS.map(t => `<div class="slider-row tr"><span>${t.l}</span><input type="range" min="0" max="100" value="${D[t.k] ?? 50}" data-k="${t.k}" aria-label="${t.l} или ${t.r}"><span>${t.r}</span></div>`).join("")}</div>
    <div class="tr-fx"><div class="eyebrow">Как это скажется</div><ul id="tr-fx"></ul></div></div>`;
  body.append(tr); drawFx();
  tr.querySelectorAll("input[type=range]").forEach(inp => inp.oninput = () => { D[inp.dataset.k] = +inp.value; drawFx(); renderHeroCard(); });
  const nm = f.querySelector("#f-name"); nm.oninput = () => { D.name = nm.value; document.getElementById("btn-next").disabled = !stepValid(6); document.getElementById("step-hint").textContent = stepValid(6) ? "Можно дальше" : STEP_HINTS[6]; renderHeroCard(); };
  f.querySelectorAll("#f-gender button").forEach(b => { b.setAttribute("aria-pressed", String(D.gender === b.dataset.v)); b.onclick = () => { D.gender = b.dataset.v; renderCreate(); }; });
  f.querySelector("#f-about").oninput = e => { D.about = e.target.value; }; f.querySelector("#f-look").oninput = e => { D.lookDesc = e.target.value; };
  f.querySelector("#f-story").onclick = () => writeBackstory(f.querySelector("#f-story"), f.querySelector("#f-story-st"));
  bindModelPicker(f, "look-model");
  const pb = f.querySelector("#f-photo"); pb.disabled = !!D.gen; pb.onclick = () => genHeroPortrait(pb, f.querySelector("#f-photo-st"));
}
function stepMode(body) {
  head(body, "Шаг 8", "Каким будет рассказчик?", "Режим меняет и тон ИИ, и правила движка: что происходит при нуле HP и насколько мир прощает ошибки.");
  choiceGrid(body, Object.entries(MODES).map(([id, m]) => ({ id, name: m.name, sub: m.sub, list: [] })), D.mode, id => { D.mode = id; renderCreate(); });
  body.insertAdjacentHTML("beforeend", `<p class="lead" style="margin-top:20px"><b>${esc(D.world.name)}.</b> ${esc(D.world.public)}</p>`);
}
function renderHeroCard() {
  const el = document.getElementById("hero-card"); const sc = draftScores(); const cls = D.cls ? CLASSES[D.cls] : null; el.style.setProperty("--cls", cls ? cls.color : "var(--lantern)");
  const hp = D.cls && D.race ? maxHP(D.cls, D.race, sc) : "—"; const ac = draftAC(); const dk = D.cls && D.step >= 5 ? draftKit() : null; const fx = traitFx(D);
  el.innerHTML = `<div class="inner"><div class="art">${heroPh({ cls: D.cls, race: D.race, name: D.name, img: D.img, gen: D.gen })}<span class="lvl">Уровень 1</span>
    <span class="hc-badges">${D.race ? `<span class="hc-b" style="--pc:${RACE_COL[D.race]}" title="${RACES[D.race].name}">${ico("r_" + D.race, 20)}</span>` : ""}${cls ? `<span class="hc-b" style="--pc:${cls.color}" title="${cls.name}">${ico("c_" + D.cls, 20)}</span>` : ""}</span></div>
  <div class="body"><div><div class="nm">${esc(D.name.trim() || "Безымянный")}</div>${D.epithet ? `<div class="ep">${esc(D.epithet)}</div>` : ""}<div class="sub">${D.race ? RACES[D.race].name : "Раса не выбрана"} · ${cls ? cls.name : "класс не выбран"}${D.bg ? " · " + BACKGROUNDS[D.bg].name : ""}</div></div>
  <div class="vitals"><div>HP <b>${hp}</b></div><div>КД <b>${ac}</b></div><div>Иниц. <b>${fmt(mod(sc.dex) + fx.init)}</b></div></div>
  <div class="mini-stats">${ABIL.map(a => `<div><b>${fmt(mod(sc[a]))}</b><small>${ABIL_RU[a]} ${sc[a]}</small></div>`).join("")}</div>
  ${dk ? `<div class="hc-weapons">${dk.list.map(d => `<div class="hc-w">${weaponTile(d, 34)}<span><b>${esc(d.name)}</b><small>${esc(d.dice)} ${esc(d.dt)}</small></span></div>`).join("")}</div>` : ""}
  ${fx.notes.length ? `<div class="hc-traits">${fx.notes.map(n => `<span title="${esc(n.txt)}">${n.name}</span>`).join("")}</div>` : ""}
  ${D.skills.length || D.bg || D.race ? `<div class="sub">Навыки: ${draftSkills().map(k => SKILLS[k][0]).join(", ") || "—"}</div>` : ""}
  <p class="story">${esc(D.story || (D.race && D.cls ? templateStory() : "Выберите расу и класс — карточка соберётся сама."))}</p></div></div>`;
}
