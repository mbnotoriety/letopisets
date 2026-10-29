/* =========================================================================
   ЖИЗНЬ МИРА: распорядок жителей, погода, тайники, репутация, ожидание
   ========================================================================= */
const GENRES = { mystery: "Расследование", horror: "Ужас", adventure: "Приключение", intrigue: "Интриги", survival: "Выживание" };
const SEASONS = { spring: "Весна", summer: "Лето", autumn: "Осень", winter: "Зима" };
const CULTURES = { auto: "По окружению", north: "Северная", slavic: "Славянская", south: "Южная", east: "Восточная" };
const SETTLES = { village: "Деревня", town: "Городок", fort: "Крепость" };
const SIZES = { small: "Маленький", normal: "Обычный", large: "Большой" };
const DANGERS = { low: "Мирный", mid: "Опасный", high: "Смертельный" };
const CULTURE_PROMPT = { north: "северная, скандинавского духа (имена вроде Ингрид, Торвальд)", slavic: "славянская (имена вроде Злата, Мирон, Горислав)", south: "южная, средиземноморского духа (имена вроде Лючия, Ренцо)", east: "восточная, степная (имена вроде Айгуль, Тимур)", auto: "на усмотрение мастера под окружение" };
const NAMES_SOUTH = { m: ["Лоренцо", "Марко", "Бенедетто", "Альвизе", "Тео", "Сальво", "Ренцо", "Джано", "Пьетро", "Амадео", "Франко", "Ludo".replace("Ludo", "Лудо"), "Орсо", "Нино"], f: ["Лючия", "Беатриче", "Кьяра", "Нера", "Фьора", "Изотта", "Мирелла", "Агата", "Бьянка", "Сильвия", "Донна", "Розалия"] };
const NAMES_EAST = { m: ["Тимур", "Арслан", "Карим", "Бахтияр", "Ильдар", "Рустам", "Самир", "Азат", "Ерлан", "Дамир", "Марат", "Нурлан"], f: ["Айгуль", "Зарина", "Лейла", "Динара", "Камила", "Ясмин", "Гульнара", "Алия", "Сауле", "Мадина", "Асель", "Жанна"] };
function nameSet(wd) { const c = wd.culture; if (c === "south") return NAMES_SOUTH; if (c === "east") return NAMES_EAST; if (c === "slavic") return NAMES_S; if (c === "north") return NAMES_N; return ["forest", "marsh"].includes(wd.biome) ? NAMES_S : NAMES_N; }

/* ---------- распорядок дня ---------- */
const SCHED = [
  [/рыбак|лодочник/, ["pier", "pier", "inn|home", "home"]], [/пастух|батрак|хуторянин/, ["farm|street", "farm|street", "inn|home", "home"]],
  [/охотник|углежог|бортник|торфяник|рудокоп/, ["forest|away", "forest|away", "inn|home", "home"]], [/кузнец/, ["work", "work", "inn|street", "away"]],
  [/пекар|старьёвщик|аптекар|мясник|лавочниц|свечник|помощниц|подмастерье/, ["work", "work", "work|inn", "away"]], [/стражник|сержант/, ["work|gate", "street|gate|square", "inn|street", "work"]],
  [/купец/, ["home", "square|street|inn", "inn|home", "home"]], [/служанка/, ["home", "street|square", "home", "home"]], [/^(сын|дочь)/, ["home|street", "street|pier|farm", "home|street", "home"]],
  [/^(отец|мать)|старый солдат/, ["chapel|home", "home|street", "inn|home", "home"]], [/жена|вдова|прачка|ткачиха|травница|знахарка/, ["home", "street|chapel|square", "home|chapel", "home"]]
];
const SPOT_TPL = { pier: ["pier"], inn: ["inn"], chapel: ["chapel", "shrine"], street: ["street", "square"], square: ["square", "street"], farm: ["farm"], forest: ["forest", "camp"], gate: ["gate"] };
function npcSpotNow(id) {
  const ov = S.world.npcLoc; if (ov && Object.prototype.hasOwnProperty.call(ov, id)) return ov[id];
  const n = NPCS[id]; if (!n?.bld) return null; const t = worldTime();
  const sched = (SCHED.find(([re]) => re.test(n.role || "")) || [0, ["home", "street|home", "inn|home", "home"]])[1];
  const opts = sched[t.part].split("|"); const r = hash(id + ":" + t.day + ":" + t.part); const pick = opts[r % opts.length];
  if (pick === "away") return null; if (pick === "home" || pick === "work") return n.bld;
  if ((r >>> 9) % 10 < 3) return n.bld; // иногда просто остаются дома
  const tpls = SPOT_TPL[pick] || []; const cands = outerEntries().filter(([, p]) => tpls.includes(tplOfPlace(p))).map(([pid]) => pid);
  return cands.length ? cands[(r >>> 4) % cands.length] : n.bld;
}
function refreshPeople() {
  if (!S) return; const ov = S.world.npcLoc || {}; const vis = {};
  for (const [id, n] of Object.entries(NPCS)) { let spot; if (Object.prototype.hasOwnProperty.call(ov, id)) spot = ov[id]; else if (n.bld) spot = npcSpotNow(id); else continue; if (spot && POIS[spot]) (vis[spot] = vis[spot] || []).push(id); }
  for (const [lid, p] of Object.entries(POIS)) {
    if (!p.inner && !p.base) p.base = (p.npcs || []).filter(x => !NPCS[x]?.bld);
    const base = p.inner ? (p.extra || []) : p.base;
    p.npcs = [...new Set([...base.filter(x => !Object.prototype.hasOwnProperty.call(ov, x) || ov[x] === lid), ...(vis[lid] || [])])];
  }
}
function npcMoves(list) {
  if (!Array.isArray(list)) return; S.world.npcLoc = S.world.npcLoc || {};
  list.slice(0, 3).forEach(m => { const id = m?.id; if (!NPCS[id]) return; const to = m.to === null || m.to === "home" ? null : m.to; if (to !== null && !POIS[to]) return;
    const was = S.world.loc; const n = NPCS[id];
    if (to === null && !n.bld) delete S.world.npcLoc[id]; else S.world.npcLoc[id] = to === null ? n.bld : to;
    refreshPeople(); const here = POIS[was].npcs.includes(id);
    if (!here && (POIS[was].base || []).concat(Object.keys(S.world.npcLoc)).includes(id)) pushFeed({ t: "chips", items: [{ c: "npc", x: `${n.name} уходит${to && POIS[to] && S.world.visited.includes(to) ? " · " + POIS[to].name : ""}` }] });
    else if (here && to === was) pushFeed({ t: "chips", items: [{ c: "npc", x: `Здесь появляется: ${n.name}` }] }); });
}
function peopleWhereBrief() {
  const lines = []; for (const [id, n] of Object.entries(NPCS)) { if (n.bld && !S.world.met?.includes(id)) continue; const where = Object.entries(POIS).find(([, p]) => p.npcs?.includes(id)); lines.push(`${n.name} — ${where ? where[1].name : "нет на виду"}`); if (lines.length >= 14) break; }
  return lines.join("; ");
}
function waitTime() {
  if (!S || busy || S.dead || S.world.combat) return; const before = new Set(POIS[S.world.loc].npcs);
  advanceTime(1); refreshPeople(); const t = worldTime(); const now = POIS[S.world.loc].npcs;
  const came = now.filter(id => !before.has(id) && NPCS[id]).map(id => NPCS[id].name), left = [...before].filter(id => !now.includes(id) && NPCS[id]).map(id => NPCS[id].name);
  pushFeed({ t: "sys", html: `Время идёт… Наступает <b>${DAY_PARTS[t.part]}</b>, день ${t.day}. ${weatherNow().name}.${came.length ? " Приходят: " + esc(came.join(", ")) + "." : ""}${left.length ? " Уходят: " + esc(left.join(", ")) + "." : ""}` });
  S.log.push({ who: "p", text: `(ждёт; наступает ${DAY_PARTS[t.part]})` }); lastSnap = null; sfx("step"); after();
}

/* ---------- погода ---------- */
const WX = { clear: "Ясно", cloudy: "Облачно", rain: "Дождь", storm: "Гроза", fog: "Туман", snow: "Снег", blizzard: "Метель" };
const WX_TABLE = { spring: [["clear", .35], ["cloudy", .3], ["rain", .25], ["fog", .1]], summer: [["clear", .55], ["cloudy", .2], ["storm", .1], ["rain", .1], ["fog", .05]],
  autumn: [["cloudy", .3], ["rain", .3], ["fog", .25], ["clear", .15]], winter: [["snow", .35], ["cloudy", .25], ["clear", .2], ["blizzard", .1], ["fog", .1]] };
function weatherNow() {
  if (!WD || !S) return { k: "clear", name: "Ясно" }; const t = worldTime(); const slot = t.day * 2 + (t.part >= 2 ? 1 : 0); let r = (hash(WD.id + ":wx:" + slot) % 1000) / 1000;
  const tab = WX_TABLE[WD.season || "autumn"]; let k = tab[0][0]; for (const [kk, p] of tab) { if (r < p) { k = kk; break; } r -= p; }
  if (S.world.wx && S.world.wx.slot === slot) k = S.world.wx.k; return { k, name: WX[k] };
}
function seasonTint(box) { const s = WD?.season; if (s === "winter") return `<rect x="${box[0] * CS}" y="${box[1] * CS}" width="${(box[2] - box[0]) * CS}" height="${(box[3] - box[1]) * CS}" fill="#e3eaee" opacity=".34"/>`; if (s === "autumn") return `<rect x="${box[0] * CS}" y="${box[1] * CS}" width="${(box[2] - box[0]) * CS}" height="${(box[3] - box[1]) * CS}" fill="#8a5a1c" opacity=".14"/>`; return ""; }
function weatherSVG(sc, P) {
  const w = weatherNow(); const indoor = sc.rooms.length && sc.tpl !== "house" && sc.tpl !== "hut" && sc.tpl !== "chapel" ? true : !!(sc.round || sc.cave) || /^b_/.test(sc.tpl) || sc.tpl === "inn"; if (indoor) return "";
  const W = SC_W * CS, H = SC_H * CS; const R = mulberry(hash(sc.id + w.k)); let s = "";
  const loop = (cls, body) => `<g class="${cls}"><g>${body}</g><g transform="translate(0,-${H})">${body}</g></g>`;
  if (w.k === "rain" || w.k === "storm") { let L = ""; for (let i = 0; i < 95; i++) { const x = R() * (W + 60) - 30, y = R() * H; L += `<line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x - 5)}" y2="${f1(y + 15)}"/>`; }
    s += `<rect width="${W}" height="${H}" fill="#0a1a26" opacity="${w.k === "storm" ? .3 : .18}"/><g stroke="#c6dcea" stroke-width="1.2" opacity="${w.k === "storm" ? .5 : .34}">${loop("wx-rain", L)}</g>`;
    if (w.k === "storm") s += `<rect class="wx-flash" width="${W}" height="${H}" fill="#eaf2ff"/>`; }
  if (w.k === "snow" || w.k === "blizzard") { let L = ""; for (let i = 0; i < (w.k === "blizzard" ? 140 : 80); i++) L += `<circle cx="${f1(R() * W)}" cy="${f1(R() * H)}" r="${f1(1 + R() * 2)}"/>`;
    s += `<g fill="#f4f8fb" opacity=".8">${loop(w.k === "blizzard" ? "wx-snow fast" : "wx-snow", L)}</g>`; }
  if (w.k === "fog" || w.k === "blizzard") { s += `<filter id="${P}-fb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter><g class="wx-fog" filter="url(#${P}-fb)" fill="#dfe6ea">${[...Array(7)].map(() => `<ellipse cx="${f1(R() * W)}" cy="${f1(R() * H)}" rx="${f1(90 + R() * 120)}" ry="${f1(40 + R() * 50)}" opacity="${(.1 + R() * .12).toFixed(2)}"/>`).join("")}</g>`; }
  if (w.k === "cloudy") s += `<rect width="${W}" height="${H}" fill="#203038" opacity=".1"/>`;
  return s;
}
/* шум дождя и ветра: синтез, без файлов */
function auWeather() {
  const want = AU.cfg.on && AU.unlocked && AU.cfg.amb > 0 && S ? weatherNow().k : null; const kind = want === "rain" || want === "storm" ? "rain" : want === "snow" || want === "blizzard" ? "wind" : null;
  const sc = S ? sceneOf(S.world.loc) : null; const inside = !!sc && (/^b_/.test(sc.tpl) || ["inn", "tower", "cave", "mine"].includes(sc.tpl));
  const sig = kind ? kind + (inside ? "-in" : "") + (want === "storm" || want === "blizzard" ? "+" : "") : null; if (AU.wxSig === sig) return; AU.wxSig = sig;
  if (AU.wxNode) { const n = AU.wxNode; AU.wxNode = null; try { n.g.gain.setTargetAtTime(0, AU.ctx.currentTime, .6); setTimeout(() => { try { n.src.stop(); clearInterval(n.timer); } catch (e) {} }, 2500); } catch (e) {} }
  if (!kind) return; const ctx = auCtx(); if (!ctx) return;
  const len = ctx.sampleRate * 2; const buf = ctx.createBuffer(1, len, ctx.sampleRate); const d = buf.getChannelData(0); let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = kind === "wind" ? (last + .02 * w) / 1.02 : w; d[i] = kind === "wind" ? last * 3.5 : w; }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true; const f = ctx.createBiquadFilter(); f.type = kind === "rain" ? "lowpass" : "bandpass"; f.frequency.value = kind === "rain" ? (inside ? 900 : 4200) : 420; f.Q.value = kind === "rain" ? .4 : .8;
  const g = ctx.createGain(); g.gain.value = 0; src.connect(f); f.connect(g); g.connect(ctx.destination); src.start();
  const vol = AU.cfg.amb * (kind === "rain" ? (inside ? .16 : .3) : .45) * (sig.endsWith("+") ? 1.4 : 1); g.gain.setTargetAtTime(vol, ctx.currentTime, 1.2);
  let timer = null; if (kind === "wind") timer = setInterval(() => { try { f.frequency.setTargetAtTime(300 + Math.random() * 400, ctx.currentTime, 1.5); g.gain.setTargetAtTime(vol * (.6 + Math.random() * .7), ctx.currentTime, 1.5); } catch (e) {} }, 2200);
  if (want === "storm") timer = setInterval(() => { if (Math.random() < .35) auThunder(); }, 7000);
  AU.wxNode = { src, g, timer };
}
function auThunder() { const ctx = auCtx(); if (!ctx || !AU.cfg.on) return; const len = ctx.sampleRate * 3; const b = ctx.createBuffer(1, len, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const s = ctx.createBufferSource(); s.buffer = b; const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 160; const g = ctx.createGain(); g.gain.value = AU.cfg.amb * 1.4; s.connect(f); f.connect(g); g.connect(ctx.destination); s.start(); }

/* ---------- тайники ---------- */
const LOOT = [{ name: "Отмычки", desc: "Набор тонких крючков: помогает вскрывать замки" }, { name: "Серебряное кольцо", desc: "Можно продать или узнать, чьё оно" }, { name: "Нож с костяной рукоятью", desc: "Острый, с вырезанным знаком" },
  { name: "Старая карта с пометкой", desc: "Крестик в неожиданном месте" }, { name: "Свёрток с травами", desc: "Пахнет мятой и полынью" }, { name: "Письмо без подписи", desc: "Несколько строк, которые лучше бы никто не читал" },
  { name: "Ключ без бирки", desc: "Железный, от неизвестного замка" }, { name: "Фляга крепкой настойки", desc: "Согревает и развязывает языки" }, { name: "Огниво и трут", desc: "Пригодится в темноте" }, { name: "Медальон с портретом", desc: "Внутри — чьё-то лицо" }];
function sceneStash(id) {
  const sc = sceneOf(id); if (sc.stash !== undefined) return sc.stash; const R = mulberry(hash(WD.id + id + "#stash")); const p = POIS[id];
  const cands = sc.objs.filter(o => o.search && o.act && !o.bld && o.k !== "door" && !o.hidden);
  sc.stash = cands.length && R() < (p.inner ? .55 : .35) ? { obj: cands[Math.floor(R() * cands.length)].id, loot: R() < .4 ? { gold: 2 + Math.floor(R() * 8) + (p.bk === "rich" ? 12 : 0) } : R() < .3 ? { item: { name: "Зелье лечения", desc: "Восстанавливает 2d4+2 HP", potion: true } } : { item: LOOT[Math.floor(R() * LOOT.length)] } } : null;
  return sc.stash;
}
function searchObj(id, o) {
  if (busy || S.dead) return; S.pendingSearch = { loc: id, obj: o.id, label: o.label };
  takeTurn(`Обыскиваю ${o.acc}`, { checks: [{ kind: "skill", skill: "investigation", dc: o.k === "chest" ? 13 : 11, reason: "Тщательно обыскать" }] });
}
function searchAfterChecks(results) {
  const ps = S.pendingSearch; if (!ps) return; const r = results.find(x => x.kind === "skill"); const note = t => { results.push({ kind: "note", title: t }); };
  const p = POIS[ps.loc]; const st = p.inner ? bstate(ps.loc) : {}; const awake = p.inner && p.npcs.some(n => NPCS[n]) && !bldAsleep(ps.loc); const intruder = p.inner && st.how && !/впустили|открыто/.test(st.how);
  if (awake && intruder) { addRep(-4, "рылся в чужом доме"); note("Хозяева видят, как герой роется в их вещах"); }
  S.world.taken = S.world.taken || {}; const key = ps.loc + ":" + ps.obj; const stash = sceneStash(ps.loc);
  if (!r || !r.ok) { note(`Поиски (${ps.label}) ничего не дали`); return; }
  if (stash && stash.obj === ps.obj && !S.world.taken[key]) {
    S.world.taken[key] = true; const c = C(); const chips = [];
    if (stash.loot.gold) { c.gold += stash.loot.gold; chips.push({ c: "gold", x: `+${stash.loot.gold} зм` }); sfx("gold"); note(`НАХОДКА в «${ps.label}»: ${stash.loot.gold} золотых (уже добавлено движком, не дублируй в gold)`); }
    else { const it = stash.loot.item; c.items.push({ ...it }); chips.push({ c: "item", x: `+ ${it.name}` }); sfx("chest"); note(`НАХОДКА в «${ps.label}»: ${it.name} — ${it.desc} (уже в инвентаре, не дублируй в items_add; если уместно, свяжи находку с тайной)`); }
    pushFeed({ t: "chips", items: chips });
  } else note(`В «${ps.label}» нет ничего ценного (не выдавай предметов и золота, только детали обстановки)`);
}

/* ---------- репутация в поселении ---------- */
function repLabel(v) { return v >= 30 ? "уважают" : v >= 10 ? "приветливы" : v > -10 ? "нейтрально" : v > -30 ? "косо смотрят" : "враждебны"; }
function addRep(dv, why) { if (!dv || !S) return; const before = S.world.rep || 0; S.world.rep = clamp(before + dv, -100, 100); pushFeed({ t: "chips", items: [{ c: dv > 0 ? "heal" : "dmg", x: `Репутация ${dv > 0 ? "+" : ""}${dv}${why ? " · " + why : ""}` }] }); }

/* ---------- контекстное меню плана: поверх всего, внутри экрана ---------- */
let scPopEl = null, scPopView = null;
function scPop() {
  if (scPopEl) return scPopEl; scPopEl = document.createElement("div"); scPopEl.className = "sc-pop g"; scPopEl.hidden = true; document.body.append(scPopEl);
  document.addEventListener("pointerdown", e => { if (!scPopEl.hidden && !scPopEl.contains(e.target) && !e.target.closest(".scene-view")) scHidePop(); }, true);
  document.addEventListener("keydown", e => { if (e.key === "Escape") scHidePop(); }); window.addEventListener("resize", scHidePop);
  document.addEventListener("scroll", e => { if (!scPopEl.hidden && scPopView && e.target.contains && e.target.contains(scPopView)) scHidePop(); }, true);
  return scPopEl;
}
function scHidePop() { if (scPopEl) scPopEl.hidden = true; document.querySelectorAll(".scene-view .sel").forEach(e => e.classList.remove("sel")); }
function scShowPop(view, el, html) {
  const pop = scPop(); scPopView = view; pop.innerHTML = html; pop.hidden = false; pop.style.left = "0px"; pop.style.top = "0px";
  const r = el.getBoundingClientRect(); const pw = pop.offsetWidth, ph = pop.offsetHeight; const cx = r.left + r.width / 2;
  pop.style.left = clamp(cx - pw / 2, 8, innerWidth - pw - 8) + "px";
  pop.style.top = (r.top - ph - 10 >= 8 ? r.top - ph - 10 : Math.min(r.bottom + 10, innerHeight - ph - 8)) + "px";
  return pop;
}

/* ---------- план: неизменная часть + подвижные фишки ---------- */
const SVGNS = "http://www.w3.org/2000/svg";
function sceneKey(id, big) {
  const sc = sceneOf(id), st = scState(id), t = worldTime();
  const roofs = sc.objs.filter(o => o.k === "bldroof").map(o => { const bs = bstate(o.bld); return `${bldLit(o.bld) ? 1 : 0}${bldHome(o.bld).length ? 1 : 0}${bs.broken ? 1 : 0}${bs.known === tkey() && bldLocked(o.bld) ? 1 : 0}`; }).join("");
  return [WD.id, id, big ? 1 : 0, t.part, weatherNow().k, JSON.stringify(st.add || []), (st.removed || []).join(","), roofs].join("|");
}
function sceneDyn(id, big, P) {
  const ppl = scenePeople(id); const objs = sceneObjects(id).filter(o => o.act);
  const hits = objs.map(o => `<rect class="sc-hit" data-hit="obj:${o.id}" x="${f1((o.x - Math.max(o.w, .8) / 2) * CS)}" y="${f1((o.y - Math.max(o.h, .8) / 2) * CS)}" width="${f1(Math.max(o.w, .8) * CS)}" height="${f1(Math.max(o.h, .8) * CS)}" transform="${o.r ? `rotate(${o.r} ${f1(o.x * CS)} ${f1(o.y * CS)})` : ""}" rx="4"><title>${esc(o.label)}</title></rect>`).join("");
  const seenL = new Set(); const labels = big ? objs.filter(o => { const k = o.label.toLowerCase(); if (seenL.has(k)) return false; seenL.add(k); return true; }).map(o => `<text class="sc-olab" x="${f1(o.x * CS)}" y="${f1((o.y + Math.min(o.h, 2.4) / 2) * CS + 11)}" text-anchor="middle">${esc(o.label)}</text>`).join("") : "";
  const toks = ppl.filter(p => p.type === "corpse").map(p => scTokenSVG(p, P, big)).join("") + ppl.filter(p => p.type !== "corpse").sort((a, b) => (a.type === "hero") - (b.type === "hero")).map(p => scTokenSVG(p, P, big)).join("");
  return { hits, labels, toks };
}
function sceneSVG(id, big) {
  const sc = sceneOf(id); const P = "sc" + (++scSeq); const d = sceneDyn(id, big, P);
  return `<svg class="sc-svg" data-key="${esc(sceneKey(id, big))}" data-p="${P}" viewBox="0 0 ${SC_W * CS} ${SC_H * CS}" xmlns="${SVGNS}"><clipPath id="${P}-tc"><circle r="11.5"/></clipPath>${sceneStaticSVG(sc, P)}${weatherSVG(sc, P)}<g class="sc-hits">${d.hits}</g><g class="sc-labs">${d.labels}</g><g class="sc-toks">${d.toks}</g></svg>`;
}
function paintScene(view, id, big) {
  const svg = view.querySelector("svg.sc-svg"); const key = sceneKey(id, big);
  if (!svg || svg.getAttribute("data-key") !== key) { if (svg) svg.remove(); view.insertAdjacentHTML("afterbegin", sceneSVG(id, big)); return; }
  const d = sceneDyn(id, big, svg.getAttribute("data-p")); svg.querySelector(".sc-hits").innerHTML = d.hits; svg.querySelector(".sc-labs").innerHTML = d.labels;
  const box = svg.querySelector(".sc-toks"); const tmp = document.createElementNS(SVGNS, "g"); tmp.innerHTML = d.toks; const keep = new Set();
  [...tmp.children].forEach(c => { const k = c.getAttribute("data-k"); keep.add(k); const old = [...box.children].find(x => x.getAttribute("data-k") === k);
    if (!old) box.appendChild(c); else if (old.getAttribute("data-sig") !== c.getAttribute("data-sig")) old.replaceWith(c); else { old.setAttribute("style", c.getAttribute("style") || ""); old.classList.remove("sel"); } });
  [...box.children].forEach(x => { if (!keep.has(x.getAttribute("data-k"))) x.remove(); });
}
function sceneHeadHTML() { const sc = sceneOf(S.world.loc); const t = worldTime(); const w = weatherNow();
  return `<span class="eyebrow">План · ${SC_NAMES[sc.tpl] || "место"}</span><span class="scene-time">${DAY_PARTS[t.part]} · ${w.name.toLowerCase()}<button type="button" class="sc-wait" id="sc-wait" title="Подождать: пройдёт часть дня" ${busy || S.world.combat ? "disabled" : ""}>Ждать</button></span>`; }
function scenePanelHTML() {
  return `<div class="scene-card${S.world.combat ? " combat" : ""}" id="scene-card"><div class="scene-head">${sceneHeadHTML()}</div><div class="scene-view" id="scene-view">${sceneSVG(S.world.loc, false)}<button class="map-expand" type="button" id="scene-big" aria-label="Развернуть план" title="Развернуть план"><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button></div></div>`;
}
function updateScenePanel(slot) {
  const id = S.world.loc; const k = WD.id + ":" + id; let card = slot.querySelector("#scene-card");
  if (!card || card.getAttribute("data-loc") !== k) { slot.innerHTML = scenePanelHTML(); card = slot.querySelector("#scene-card"); card.setAttribute("data-loc", k); }
  else { card.classList.toggle("combat", !!S.world.combat); card.querySelector(".scene-head").innerHTML = sceneHeadHTML(); paintScene(card.querySelector("#scene-view"), id, false); }
  bindScene(slot, false);
}
function bindScene(root, big) {
  const view = root.querySelector(big ? "#scene-view-big" : "#scene-view"); if (!view) return;
  const id = S.world.loc; const sc = sceneOf(id);
  const rerender = () => { if (big) { paintScene(view, id, true); } renderWorld(); };
  const walkTo = (x, y) => { const taken = scenePeople(id).filter(p => p.type !== "hero"); const p = scFreeNear(sc, taken, x, y, 2.5); scState(id).player = { x: +p.x.toFixed(2), y: +p.y.toFixed(2) }; sfx("step"); save(); rerender(); };
  const open = (el, title, sub, acts) => {
    scHidePop(); el.classList?.add("sel");
    const pop = scShowPop(view, el, `<b>${esc(title)}</b>${sub ? `<small>${esc(sub)}</small>` : ""}<div class="sc-acts">${acts.map((a, i) => `<button type="button" class="btn small${i === 0 ? " primary" : ""}" data-i="${i}" ${a.dis ? "disabled" : ""}>${esc(a.t)}</button>`).join("")}</div>`);
    pop.querySelectorAll("button").forEach(b => b.onclick = ev => { ev.stopPropagation(); const a = acts[+b.dataset.i]; scHidePop(); if (big && a.closes !== false) closeModal(); a.fn(); });
  };
  const turn = t => { if (busy || S.dead) return; takeTurn(t); };
  const approach = (x, y) => () => walkTo(x, y + .9);
  view.onclick = ev => {
    if (ev.target.closest(".map-expand")) return; const el = ev.target.closest("[data-hit]"); const svg = view.querySelector("svg.sc-svg"); sfx("tap");
    if (!el || !el.dataset.hit) { if (scPopEl && !scPopEl.hidden) { scHidePop(); return; } const r = svg.getBoundingClientRect(); const x = (ev.clientX - r.left) / r.width * SC_W, y = (ev.clientY - r.top) / r.height * SC_H; if (busy) return; walkTo(x, y); return; }
    const [kind, ref] = el.dataset.hit.split(/:(.*)/s); const ppl = scenePeople(id);
    if (kind === "obj") { const o = sceneObjects(id).find(q => q.id === ref); if (!o) return;
      if (o.bld) { const bid = o.bld, b = POIS[bid], st = bstate(bid); const dp = sc.doors[bid] || { x: o.x, y: o.y }; const knownLocked = st.known === tkey() && bldLocked(bid); const acts = [];
        acts.push({ t: (b.bk === "shop" || b.bk === "smithy") && !bldLocked(bid) ? "Войти" : "Открыть дверь", dis: busy, fn: () => { if (!bldLocked(bid)) bldAction(bid, "enter"); else { st.known = tkey(); scState(id).player = { x: dp.x, y: dp.y }; pushFeed({ t: "sys", html: `Дверь заперта: ${esc(b.name)}.` }); sfx("thud"); save(); rerender(); } } });
        if (!st.broken) acts.push({ t: "Постучать", fn: () => bldAction(bid, "knock"), dis: busy });
        acts.push({ t: "Подслушать", fn: () => bldAction(bid, "listen"), dis: busy }, { t: "Заглянуть в окно", fn: () => bldAction(bid, "peek"), dis: busy });
        if (knownLocked) acts.push({ t: "Взломать замок", fn: () => bldAction(bid, "pick"), dis: busy }, { t: "Выбить дверь", fn: () => bldAction(bid, "force"), dis: busy });
        acts.push({ t: "Подойти", fn: () => walkTo(dp.x, dp.y), closes: false });
        open(el, b.name, bldStatus(bid), acts); return; }
      if (o.k === "door" && POIS[id].inner) { open(el, "Дверь", `выход: ${POIS[POIS[id].parent].name}`, [{ t: "Выйти наружу", fn: exitBuilding, dis: busy }, { t: "Подойти", fn: approach(o.x, o.y - 1.6), closes: false }]); return; }
      const acts = [{ t: "Осмотреть", fn: () => turn(`Осматриваю ${o.acc}`), dis: busy }]; if (o.search) acts.push({ t: "Обыскать", fn: () => searchObj(id, o), dis: busy });
      const sp = { hearth: "Погреться у огня", bar: "Заказать выпивку", altar: "Помолиться", well: "Заглянуть в колодец", boat: "Сесть в лодку", stairs: "Подняться наверх", campfire: "Сесть у костра", bed: "Прилечь", font: "Окропить себя водой", stall: "Прицениться к товару" }[o.k];
      if (sp) acts.push({ t: sp, fn: () => turn(sp), dis: busy }); acts.push({ t: "Подойти", fn: approach(o.x, o.y), closes: false });
      open(el, o.label[0].toUpperCase() + o.label.slice(1), S.world.taken?.[id + ":" + o.id] ? "уже обыскано" : "", acts); return; }
    if (kind === "npc") { const n = NPCS[ref]; const p = ppl.find(q => q.id === ref); const zz = p?.asleep; open(el, n.name, `${n.role} · ${zz ? "спит" : attLabel(S.world.npcs[ref]?.att || 0)[0]}`, [
      { t: zz ? "Разбудить" : "Заговорить", fn: () => { if (zz) { bstate(id).alarm = tkey(); turn(`Бужу: ${n.name}`); return; } walkTo(p.x, p.y + .9); showTab("story"); const inp = document.getElementById("act-input"); inp.value = `${n.name}, `; inp.focus(); }, closes: true },
      { t: "Присмотреться", fn: () => turn(`Незаметно присматриваюсь: ${n.name} (${n.role})`), dis: busy }, { t: "Подойти", fn: approach(p.x, p.y), closes: false }]); return; }
    if (kind === "crowd") { const p = ppl.find(q => q.type === "crowd" && q.label === ref) || {};
      open(el, ref[0].toUpperCase() + ref.slice(1), "безымянный местный житель", [{ t: "Заговорить", fn: () => turn(`Подхожу к человеку (${ref}) и заговариваю с ним`), dis: busy }, { t: "Подслушать", fn: () => turn(`Прислушиваюсь, о чём говорит ${ref}`), dis: busy }, { t: "Подойти", fn: approach(p.x || 9, p.y || 6), closes: false }]); return; }
    if (kind === "foe") { const E = ENEMIES[ref]; open(el, E.name, enemyStatus(ref), [{ t: "Атаковать", fn: () => turn(`Атакую: ${E.name}`), dis: busy }, { t: "Оценить врага", fn: () => turn(`Оцениваю, насколько опасен ${E.name}`), dis: busy }]); return; }
    if (kind === "hero") open(el, C().name, "это вы · клик по полу — переместиться", [{ t: "Осмотреться", fn: () => turn("Осматриваюсь внимательно"), dis: busy }, { t: "Подождать", fn: waitTime, dis: busy || S.world.combat }]);
  };
  view.onkeydown = ev => { if ((ev.key === "Enter" || ev.key === " ") && ev.target.closest("[data-hit]")) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); } };
  if (!big) { const b = root.querySelector("#scene-big"); if (b) b.onclick = ev => { ev.stopPropagation(); openBigScene(); }; const w = root.querySelector("#sc-wait"); if (w) w.onclick = ev => { ev.stopPropagation(); waitTime(); }; }
}
function openBigScene() {
  if (!S) return; const id = S.world.loc;
  modal(`<div class="bigmap"><div class="bigmap-head"><div><div class="eyebrow">План локации · ${SC_NAMES[sceneOf(id).tpl] || ""} · ${DAY_PARTS[worldTime().part]} · ${weatherNow().name.toLowerCase()}</div><h2>${esc(POIS[id].name)}</h2></div><div class="bm-tools"><button class="btn small" type="button" id="sb-close">Закрыть</button></div></div>
  <div class="scene-view big" id="scene-view-big">${sceneSVG(id, true)}</div>
  <div class="legend"><span><i class="lg here"></i>вы</span><span><i class="lg tk-npc"></i>персонажи</span><span><i class="lg tk-crowd"></i>местные</span><span><i class="lg tk-foe"></i>враги</span><span class="home-note">Нажмите на человека или предмет, чтобы действовать. Клик по полу — подойти.</span></div></div>`, root => {
    root.querySelector(".modal").classList.add("wide"); root.querySelector("#sb-close").onclick = () => { scHidePop(); closeModal(); renderWorld(); }; bindScene(root, true);
  });
}
