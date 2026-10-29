/* TRAVEL */
/* =========================================================================
   ПУТЕШЕСТВИЯ ПО КАРТЕ МИРА: маршруты, время в пути, дикие места
   ========================================================================= */
const TERR = { g: ["луга", .5], f: ["лес", .85], a: ["берег", .6], r: ["скалы и холмы", 1.15], m: ["топь", 1.1], n: ["горные кручи", 1.7] };
const PACES = { careful: { n: "Осторожно", sub: "дольше, но засады реже и вы замечаете их раньше", t: 1.35, enc: .65, notice: 3 }, normal: { n: "Обычный шаг", sub: "без спешки и без лишней осторожности", t: 1, enc: 1, notice: 0 }, fast: { n: "Форсированно", sub: "быстрее, но шумно и опаснее", t: .72, enc: 1.3, notice: -3 } };
const DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
let tripTimeDone = false;
function passHours(h) { const t = worldTime(); t.h = (t.h || 0) + h; while (t.h >= 6) { t.h -= 6; advanceTime(1); } }
function fmtH(h) { const m = Math.max(15, Math.round(h * 4) * 15); const H = Math.floor(m / 60), M = m % 60; return H ? `${H} ч${M ? " " + M + " мин" : ""}` : `${M} мин`; }
function isRoad(x, y) { return ROAD.has(x + "," + y); }
function tileCost(x, y) { const t = tileAt(x, y); if (!PASSABLE(t)) return Infinity; if (isRoad(x, y)) return .3; return (TERR[t] || TERR.g)[1]; }
function stepCost(a, b) { return (tileCost(a[0], a[1]) + tileCost(b[0], b[1])) / 2 * (a[0] !== b[0] && a[1] !== b[1] ? 1.414 : 1); }
function findPath(ax, ay, bx, by) {
  if (bx < 0 || by < 0 || bx >= MAP_W || by >= MAP_H || !PASSABLE(tileAt(bx, by))) return null; const K = (x, y) => y * MAP_W + x;
  const g = new Map([[K(ax, ay), 0]]); const prev = new Map(); const open = [[0, ax, ay]]; const done = new Set();
  while (open.length) { open.sort((p, q) => p[0] - q[0]); const [, x, y] = open.shift(); const k = K(x, y); if (done.has(k)) continue; done.add(k); if (x === bx && y === by) break;
    for (const [dx, dy] of DIRS8) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue; if (!isFinite(tileCost(nx, ny))) continue;
      if (dx && dy && (!isFinite(tileCost(x + dx, y)) || !isFinite(tileCost(x, y + dy)))) continue;
      const ng = g.get(k) + stepCost([x, y], [nx, ny]); const nk = K(nx, ny); if (ng < (g.get(nk) ?? Infinity)) { g.set(nk, ng); prev.set(nk, k); open.push([ng + Math.hypot(bx - nx, by - ny) * .3, nx, ny]); } } }
  const end = K(bx, by); if (!g.has(end)) return null; const pts = []; let k = end; while (k !== undefined) { pts.unshift([k % MAP_W, Math.floor(k / MAP_W)]); k = prev.get(k); }
  return { pts, h: g.get(end) };
}
function heroPos() { const w = S.world; const o = hereOuter(); if (!w.pos || w.posLoc !== o) { const p = POIS[o]; w.pos = { x: p.x, y: p.y }; w.posLoc = o; } return w.pos; }
function poiAt(x, y) { const e = outerEntries().find(([, p]) => p.x === x && p.y === y && (!p.wild || p.keep)); return e ? e[0] : null; }
function travelHoursTo(id) { const p = POIS[id]; const h = heroPos(); const r = findPath(h.x, h.y, p.x, p.y); return r ? r.h : Math.hypot(p.x - h.x, p.y - h.y) * .6; }
function needsTrip(id) { const p = POIS[id]; if (!p || p.inner) return false; const o = hereOuter(); if (o === id) return false; const h = heroPos(); const r = findPath(h.x, h.y, p.x, p.y); return !!r && r.pts.length > 3; }
function routeStats(path, pace) {
  const P = PACES[pace] || PACES.normal; let road = 0; const terr = {}; let pNone = 1; const t = worldTime(); let hh = (t.h || 0) + t.part * 6; let night = false;
  path.pts.forEach((pt, i) => { if (!i) return; const st = stepCost(path.pts[i - 1], pt) * P.t; hh += st; const part = Math.floor(hh / 6) % 4; if (part === 3) night = true;
    if (isRoad(pt[0], pt[1])) road++; else { const k = (TERR[tileAt(pt[0], pt[1])] || TERR.g)[0]; terr[k] = (terr[k] || 0) + 1; }
    if (i >= 3 && i < path.pts.length - 1) pNone *= 1 - encChance(pt[0], pt[1], P, part); });
  const n = path.pts.length - 1; const mix = [road ? ["дорога", road] : null, ...Object.entries(terr)].filter(Boolean).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${Math.round(v / n * 100)}%`).join(" · ");
  const arr = Math.floor(hh / 6); return { h: path.h * P.t, mix, risk: 1 - pNone, night, arrive: { day: t.day + Math.floor(arr / 4), part: arr % 4 } };
}
/* ---------- дикие места: точка на карте между поселениями ---------- */
const WILD_NAMES = { g: ["Луговая тропа", "Открытое поле", "Холм с одиноким дубом", "Заросшая пустошь", "Овраг у тропы"], f: ["Лесная тропа", "Глухая чаща", "Поляна среди елей", "Бурелом", "Тёмный ельник"], a: ["Пустынный берег", "Песчаная коса", "Камни у прибоя"], r: ["Каменистый склон", "Скалистая тропа", "Ветреный гребень"], m: ["Гнилая топь", "Гать через болото", "Камышовые заросли"], n: ["Горный уступ", "Перевал", "Осыпь под кручей"] };
const ROAD_NAMES = ["Развилка дороги", "Придорожный камень", "Старый тракт", "Поворот дороги", "Дорога у межевого столба"];
const WILD_DESC = { g: "Ветер гуляет по высокой траве, вдалеке кричит птица. Видно далеко — и тебя тоже видно издалека.", f: "Стволы смыкаются над головой, под ногами хрустит хвоя. Звуки здесь глохнут, а тени кажутся гуще, чем должны.", a: "Мокрый песок, запах соли и водорослей, шум прибоя заглушает шаги.", r: "Камни, лишайник и ветер. Тропа петляет между валунами, за каждым из которых может кто-то ждать.", m: "Под ногами чавкает, над водой стелется туман, в камышах что-то шуршит.", n: "Холодный ветер, осыпающийся щебень и далёкий вид на долину внизу." };
function wildAt(x, y) {
  const ex = poiAt(x, y); if (ex) return ex; const id = `wild_${x}_${y}`; if (POIS[id]) return id; const t = tileAt(x, y); const road = isRoad(x, y); const R = mulberry(hash(WD.id + id)); const names = road ? ROAD_NAMES : WILD_NAMES[t] || WILD_NAMES.g;
  POIS[id] = { name: names[Math.floor(R() * names.length)], kind: t === "f" ? "grove" : "camp", btpl: "wild", terrain: t, road, x, y, short: `${road ? "дорога, " : ""}${(TERR[t] || TERR.g)[0]}`, desc: WILD_DESC[t] || WILD_DESC.g, npcs: [], enemies: [], wild: true, base: [] };
  return id;
}
function siteAt(x, y, def) { const id = `site_${x}_${y}`; if (!POIS[id]) { const t = tileAt(x, y); POIS[id] = { kind: "camp", btpl: "wild", terrain: t, road: isRoad(x, y), x, y, npcs: [], enemies: [], base: [], wild: true, keep: true, short: "", desc: WILD_DESC[t] || WILD_DESC.g, ...def }; } return id; }
function findSiteTile(x0, y0, dmin, dmax, R) {
  const c = []; for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) { const d = Math.hypot(x - x0, y - y0); if (d < dmin || d > dmax || !PASSABLE(tileAt(x, y)) || isRoad(x, y)) continue; if (Object.values(POIS).some(p => !p.inner && Math.abs(p.x - x) + Math.abs(p.y - y) < 2)) continue; if (!findPath(x0, y0, x, y)) continue; c.push([x, y]); }
  return c.length ? c[Math.floor(R() * c.length)] : null;
}
SC_BUILD.wild = sc => {
  const p = POIS[sc.id] || {}; const t = p.terrain || "g"; const R = sc.R;
  sc.floor = [{ t: t === "a" ? "sand" : t === "r" || t === "n" ? "rockg" : "grass", box: [0, 0, SC_W, SC_H], dark: t === "f" || t === "m" }];
  const P = p.road ? [[-0.4, 7.4], [5, 6.4], [11, 7.3], [18.4, 6.2]] : [[8.6, 12.4], [9.6, 8.4], [7.8, 4.6], [9.4, -0.4]];
  sc.floor.push({ t: p.road ? "path" : "path", pts: P, w: p.road ? 1.7 : .9 });
  const near = (x, y) => P.some(([px, py], i) => { const q = P[i + 1]; if (!q) return false; const dx = q[0] - px, dy = q[1] - py; const L = dx * dx + dy * dy; const u = clamp(((x - px) * dx + (y - py) * dy) / L, 0, 1); return Math.hypot(px + u * dx - x, py + u * dy - y) < 1.9; }) || Math.hypot(x - 9, y - 7) < 2.4;
  const N = { tree: { f: 18, g: 5, m: 5, r: 2, a: 0, n: 1 }, rock: { r: 9, n: 10, a: 5, g: 3, f: 3, m: 1 }, bush: { g: 7, f: 9, m: 4, a: 2, r: 2, n: 1 }, reeds: { m: 11, a: 4, g: 1 }, stump: { f: 3, g: 1, m: 1 } };
  scScatter(sc, "tree", N.tree[t] || 0, [-1, -1, SC_W + 1, SC_H + 1], 2.7, 2.7, { pad: -.4, ghost: true, act: false, nofree: true, spread: 2.1, avoid: near });
  scScatter(sc, "rock", N.rock[t] || 0, [0, 0, SC_W, SC_H], 1.3, 1.1, { vary: true, rot: true, act: false, avoid: near });
  scScatter(sc, "bush", N.bush[t] || 0, [0, 0, SC_W, SC_H], 1.1, 1.1, { pad: .1, ghost: true, act: false, nofree: true, spread: 1, avoid: near });
  if (N.reeds[t]) scScatter(sc, "reeds", N.reeds[t], [0, 0, SC_W, SC_H], 1, 1, { ghost: true, act: false, pad: 0, avoid: near });
  if (N.stump[t]) scScatter(sc, "stump", N.stump[t], [1, 1, 17, 11], .8, .8, { act: false, avoid: near });
  if (t === "f") sc.g.block((x, y) => !near(x, y) && sc.objs.some(o => o.k === "tree" && Math.hypot(o.x - x, o.y - y) < .9));
  if (p.camp) { sc.floor.push({ t: "dirtc", c: [9, 7], r: 2.6 }); scAdd(sc, "campfire", 9, 7, 1.3, 1.3); scAdd(sc, "bedroll", 11.3, 8.2, .9, 1.8, { r: 20 }); scAdd(sc, "log", 7, 7.6, 1.6, .5, { r: 80, act: false }); sc.anchors.sit.push({ x: 7.3, y: 7.4 }, { x: 10.6, y: 6.2 }); }
  sc.spawn = p.road ? { x: 2.6, y: 7.2 } : { x: 8.8, y: 10.8 }; sc.foes = { x: 12.6, y: 5.2 }; sc.dark = t === "f" ? .12 : t === "m" ? .08 : 0;
  sc.anchors.stand.push({ x: 10.5, y: 6.4 }, { x: 7.5, y: 8.2 }, { x: 12, y: 8.6 });
};

/* ---------- отрисовка поверх карты: герой, маршрут, клик по местности ---------- */
function mapOverlay(box, o, layer) {
  if (!S || o.markers === false) return; const pos = (x, y) => `left:${(x / MAP_W * 100).toFixed(3)}%;top:${(y / MAP_H * 100).toFixed(3)}%`;
  if (o.route && o.route.length > 1) { const pts = o.route.map(([x, y]) => `${x + .5},${y + .5}`).join(" "); const [ex, ey] = o.route[o.route.length - 1];
    layer.insertAdjacentHTML("afterbegin", `<svg class="mk-route" viewBox="0 0 ${MAP_W} ${MAP_H}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" class="r0"/><polyline points="${pts}" class="r1"/></svg><div class="mk-dest" style="${pos(ex + .5, ey + .5)}"></div>`); }
  let hl = box.querySelector(".mk-herol"); if (!hl) { hl = document.createElement("div"); hl.className = "mk-herol"; hl.innerHTML = `<div class="mk-hero" title="Вы"><span>${ico("c_" + C().cls, 15) || "★"}</span></div>`; box.append(hl); }
  const hp = heroPos(); const hero = hl.firstElementChild; hero.style.cssText = pos(hp.x + .5, hp.y + .5); hero.classList.toggle("travel", !!o.travel);
  if (o.onTile) { box.classList.add("pickable"); box.onclick = e => { if (e.target.closest(".mk") || box._dragged) return; const r = box.getBoundingClientRect(); const x = Math.floor((e.clientX - r.left) / r.width * MAP_W), y = Math.floor((e.clientY - r.top) / r.height * MAP_H); if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) o.onTile(x, y); }; }
}
function moveHeroToken(box, x, y) { const h = box?.querySelector(".mk-hero"); if (h) { h.style.left = ((x + .5) / MAP_W * 100).toFixed(3) + "%"; h.style.top = ((y + .5) / MAP_H * 100).toFixed(3) + "%"; } }
function drawMap() { const box = document.getElementById("mapbox"); if (!box || !S) return; renderMap(box, { fog: true, pick: id => openBigMap({ target: id }), onTile: (x, y) => openBigMap({ tile: [x, y] }) }); }
function knownDestinations() {
  const h = heroPos(); const qs = new Set(activeQuests().map(q => q.target)); const out = [];
  outerEntries().forEach(([id, p]) => { if (id === hereOuter() || (p.wild && !p.keep)) return; const st = placeState(id); if (!st.visited && !st.rumor && !qs.has(id)) return; const r = findPath(h.x, h.y, p.x, p.y); if (!r) return; out.push({ id, name: p.name, h: r.h, quest: qs.has(id), kind: p.kind, visited: st.visited }); });
  return out.sort((a, b) => (b.quest - a.quest) || a.h - b.h);
}
function compassDir(dx, dy) { const a = Math.atan2(dy, dx) * 180 / Math.PI; const D = ["на востоке", "на юго-востоке", "на юге", "на юго-западе", "на западе", "на северо-западе", "на севере", "на северо-востоке"]; return D[(Math.round(a / 45) + 8) % 8]; }

/* большая карта: маршрут, темп, путешествие */
function openBigMap(opts = {}) {
  if (!S) return; let sel = null, trav = null; let pace = S.world.pace || "normal";
  modal(`<div class="bigmap"><div class="bigmap-head"><div><div class="eyebrow">Карта мира · ${DAY_PARTS[worldTime().part]}, день ${worldTime().day}</div><h2>${esc(WD.name)}</h2></div><div class="bm-tools"><button class="btn small" type="button" id="bm-out" aria-label="Отдалить">−</button><button class="btn small" type="button" id="bm-in" aria-label="Приблизить">+</button><button class="btn small" type="button" id="bm-fit">Вся карта</button><button class="btn small" type="button" id="bm-close">Закрыть</button></div></div>
    <div class="bm-view" id="bm-view"><div class="bm-stage" id="bm-stage">${mapMarkup("bigbox", "big")}</div></div>
    <div class="bigmap-foot tr-foot" id="bm-info"></div>
    <div class="legend"><span><i class="lg hero"></i>вы</span><span><i class="lg visited"></i>посещено</span><span><i class="lg danger">✕</i>опасно</span><span><i class="lg qq">!</i>поручение</span><span><i class="lg qd">?</i>сдать поручение</span><span><i class="lg clue"></i>улики</span><span><i class="lg rumor"></i>слухи</span><span><i class="lg q">?</i>неизведано</span></div></div>`, root => {
    root.querySelector(".modal").classList.add("wide");
    const view = root.querySelector("#bm-view"), stage = root.querySelector("#bm-stage"), box = root.querySelector("#bigbox"), info = root.querySelector("#bm-info");
    let z = 1, tx = 0, ty = 0; const apply = () => { const vw = view.clientWidth, vh = view.clientHeight, sw = vw * z, sh = stage.clientHeight * z;
      tx = clamp(tx, Math.min(0, vw - sw), 0); ty = clamp(ty, Math.min(0, vh - sh), 0); stage.style.transform = `translate(${tx}px, ${ty}px) scale(${z})`; box.style.setProperty("--z", z); };
    const zoomAt = (nz, cx, cy) => { nz = clamp(nz, 1, 3); tx = cx - (cx - tx) * nz / z; ty = cy - (cy - ty) * nz / z; z = nz; apply(); };
    const mw = () => Math.floor(Math.min(view.clientWidth, Math.max(320, (innerHeight - 330) * MAP_W / MAP_H))); box.style.width = mw() + "px"; box.style.margin = "0 auto";
    const draw = () => renderMap(box, { width: mw(), fog: true, hires: true, region: true, travel: !!trav, route: sel?.path ? sel.path.pts.slice(sel.at || 0) : null, pick: id => choose(POIS[id].x, POIS[id].y, id), onTile: (x, y) => choose(x, y, poiAt(x, y)) });
    function choose(x, y, id) { if (trav) return; const hp = heroPos(); if ((id && id === hereOuter()) || (x === hp.x && y === hp.y)) { sel = null; mapSel = null; draw(); panel(); return; }
      sel = { x, y, id, path: findPath(hp.x, hp.y, x, y), at: 0 }; mapSel = id || null; sfx("tap"); draw(); panel(); }
    function panel() {
      if (trav) { const done = sel.at, all = sel.path.pts.length - 1; info.innerHTML = `<div class="tr-prog"><div class="tr-now">${ico("t_boots", 22)}<div><b>В пути: ${esc(sel.id ? POIS[sel.id].name : "в неизведанные земли")}</b><small>${DAY_PARTS[worldTime().part]}, день ${worldTime().day} · ${PACES[pace].n.toLowerCase()}</small></div></div><div class="tr-bar"><i style="width:${Math.round(done / all * 100)}%"></i></div><button class="btn small" type="button" id="tr-stop">Остановиться</button></div>`; info.querySelector("#tr-stop").onclick = () => { trav.stop = true; }; return; }
      if (!sel) { const list = knownDestinations().slice(0, 8);
        info.innerHTML = `<div class="tr-idle"><div><b class="tr-h">Куда отправимся?</b><span class="home-note">Нажмите на любую точку карты — проложим путь по дорогам и тропам. Можно идти и в неизведанное.</span></div>
          ${list.length ? `<div class="tr-dests">${list.map(d => `<button type="button" class="tr-dest${d.quest ? " q" : ""}" data-go="${d.id}"><span class="mk-pin sm">${mkIcon(d.kind)}</span><span><b>${esc(d.name)}</b><small>${d.quest ? "поручение · " : ""}${fmtH(d.h * PACES[pace].t)}</small></span></button>`).join("")}</div>` : ""}</div>`;
        info.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { const p = POIS[b.dataset.go]; choose(p.x, p.y, b.dataset.go); }); return; }
      const known = !sel.id || placeState(sel.id).visited || placeState(sel.id).rumor || new Set(S.world.seen).has(sel.x + "," + sel.y);
      const name = sel.id ? (known ? POIS[sel.id].name : "Неизведанное место") : new Set(S.world.seen).has(sel.x + "," + sel.y) ? `${(TERR[tileAt(sel.x, sel.y)] || TERR.g)[0][0].toUpperCase() + (TERR[tileAt(sel.x, sel.y)] || TERR.g)[0].slice(1)}${isRoad(sel.x, sel.y) ? " у дороги" : ""}` : "Неизведанные земли";
      if (!sel.path) { info.innerHTML = `<div class="tr-sel"><div class="tr-name"><b>${esc(name)}</b><small>Туда не пройти: вода или непроходимые места.</small></div></div>`; return; }
      const rs = routeStats(sel.path, pace); const pi = sel.id ? placeInfoHTML(sel.id) : null; const rl = rs.risk < .22 ? ["низкий", "lo"] : rs.risk < .45 ? ["умеренный", "mid"] : ["высокий", "hi"]; const qh = sel.id && activeQuests().find(q => q.target === sel.id);
      const canGo = !busy && !S.world.combat && !S.dying && !S.dead && !(S.world.enc && !encDone());
      info.innerHTML = `<div class="tr-sel"><div class="tr-name"><b>${esc(name)}</b><small>${esc(pi ? pi.text : "Вне дорог. В пути может случиться что угодно.")}</small>${qh ? `<span class="tr-q">${ico("t_quest", 14)} Цель поручения «${esc(qh.title)}»</span>` : ""}</div>
        <div class="tr-stats"><div><small>В пути</small><b>${fmtH(rs.h)}</b></div><div><small>Прибытие</small><b>${DAY_PARTS[rs.arrive.part]}${rs.arrive.day > worldTime().day ? `, день ${rs.arrive.day}` : ""}</b></div><div><small>Риск встречи</small><b class="risk ${rl[1]}">${rl[0]} · ${Math.round(rs.risk * 100)}%</b></div><div class="wide"><small>Местность</small><span>${esc(rs.mix || "—")}</span></div></div>
        <div class="tr-act"><div class="seg tr-pace" role="radiogroup" aria-label="Темп">${Object.entries(PACES).map(([k, p]) => `<button type="button" data-p="${k}" aria-pressed="${pace === k}" title="${esc(p.sub)}">${p.n}</button>`).join("")}</div>
          ${rs.night ? `<small class="tr-warn">${ico("t_moon", 14)} Путь захватит ночь — встречи опаснее</small>` : `<small class="home-note">${esc(PACES[pace].sub)}</small>`}
          <button class="btn primary" type="button" id="tr-go" ${canGo ? "" : "disabled"}>${ico("t_boots", 18)} В путь</button></div></div>`;
      info.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { pace = b.dataset.p; S.world.pace = pace; sfx("tap"); panel(); });
      info.querySelector("#tr-go").onclick = go;
    }
    async function go() {
      if (!sel?.path || busy || S.world.combat || (S.world.enc && !encDone())) return; if (S.world.enc) { leaveEncounterPeople(); S.world.enc = null; } trav = { stop: false }; S.world.pace = pace; const P = PACES[pace]; const pts = sel.path.pts; let since = 0; sfx("start", .5); panel(); draw();
      const finish = (wid, text) => { trav = null; closeModal(); tripTimeDone = true; S.world.trip = null; takeTurn(text, { checks: [], move_to: wid, fromTrip: true }); };
      for (let i = 1; i < pts.length; i++) {
        const [x, y] = pts[i]; passHours(stepCost(pts[i - 1], pts[i]) * P.t); S.world.pos = { x, y }; S.world.posLoc = null; reveal(x, y, 2); sel.at = i; since++;
        moveHeroToken(box, x, y); if (i % 2 === 0 || i === pts.length - 1) draw(); panel();
        await pause(clamp(2800 / pts.length, 120, 280));
        if (!document.body.contains(box)) { trav.stop = true; }
        const last = i === pts.length - 1;
        if (!last && since >= 3 && Math.random() < encChance(x, y, P)) { const wid = wildAt(x, y); S.world.trip = { dest: sel.id || null, tile: sel.id ? null : [sel.x, sel.y] }; trav = null; closeModal(); tripTimeDone = true; moveTo(wid); startEncounter(x, y, P); return; }
        if (trav.stop && !last) { const wid = wildAt(x, y); S.world.trip = { dest: sel.id || null, tile: sel.id ? null : [sel.x, sel.y] }; finish(wid, `Останавливаюсь в пути: ${POIS[wid].name}`); return; }
      }
      if (sel.id) finish(sel.id, `Иду: ${POIS[sel.id].name}`); else { const wid = wildAt(sel.x, sel.y); finish(wid, `Добираюсь до места: ${POIS[wid].name}`); }
    }
    requestAnimationFrame(() => { draw(); apply(); panel();
      if (opts.target && POIS[opts.target]) { const p = POIS[opts.target]; choose(p.x, p.y, opts.target); } else if (opts.tile) choose(opts.tile[0], opts.tile[1], poiAt(opts.tile[0], opts.tile[1]));
      if (opts.autostart && sel?.path) setTimeout(go, 350); });
    view.addEventListener("wheel", e => { e.preventDefault(); const r = view.getBoundingClientRect(); zoomAt(z * (e.deltaY < 0 ? 1.18 : 1 / 1.18), e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    let drag = null; view.addEventListener("pointerdown", e => { if (e.target.closest(".mk")) return; drag = { x: e.clientX, y: e.clientY, tx, ty }; box._dragged = false; view.setPointerCapture(e.pointerId); view.classList.add("grab"); });
    view.addEventListener("pointermove", e => { if (!drag) return; if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) box._dragged = true; tx = drag.tx + e.clientX - drag.x; ty = drag.ty + e.clientY - drag.y; apply(); });
    const end = () => { drag = null; view.classList.remove("grab"); setTimeout(() => { box._dragged = false; }, 0); }; view.addEventListener("pointerup", end); view.addEventListener("pointercancel", end);
    root.querySelector("#bm-in").onclick = () => zoomAt(z * 1.35, view.clientWidth / 2, view.clientHeight / 2);
    root.querySelector("#bm-out").onclick = () => zoomAt(z / 1.35, view.clientWidth / 2, view.clientHeight / 2);
    root.querySelector("#bm-fit").onclick = () => { z = 1; tx = 0; ty = 0; apply(); };
    root.querySelector("#bm-close").onclick = () => { if (trav) { trav.stop = true; return; } mapSel = null; closeModal(); renderWorld(); };
    const hp = heroPos(); setTimeout(() => { if (view.clientWidth < 700) { const t = view.clientWidth / MAP_W; zoomAt(1.6, (hp.x + .5) * t, (hp.y + .5) * t); } }, 60);
  });
}
function resumeTrip() { const tr = S.world.trip; if (!tr) return; if (tr.dest && POIS[tr.dest]) openBigMap({ target: tr.dest, autostart: true }); else if (tr.tile) openBigMap({ tile: tr.tile, autostart: true }); }

/* =========================================================================
   СЛУЧАЙНЫЕ ВСТРЕЧИ В ПУТИ
   ========================================================================= */
function encChance(x, y, P, part) {
  const t = tileAt(x, y); let p = isRoad(x, y) ? .025 : ({ g: .045, a: .04, f: .075, r: .07, m: .085, n: .075 })[t] || .05;
  p *= ({ low: .6, mid: 1, high: 1.35 })[WD.danger] || 1; const pt = part ?? worldTime().part; p *= pt === 3 ? 1.6 : pt === 2 ? 1.15 : 1;
  p *= (P || PACES.normal).enc; p *= MODES[S.mode]?.enc || 1; p *= 1 + (S.world.threat || 0) * .07;
  const st = POIS[WD.start]; if (st && Math.hypot(st.x - x, st.y - y) < 2.2) p *= .25; return p;
}
const ENC_FOES = {
  f: [["wolf", "Волк", 2], ["goblin", "Гоблин", 2], ["bandit", "Разбойник", 2], ["giant_spider", "Гигантский паук", 1, 2]],
  g: [["bandit", "Разбойник", 2], ["wolf", "Волк", 2], ["goblin", "Гоблин", 2]],
  a: [["zombie", "Утопленник", 1], ["bandit", "Мародёр", 2], ["giant_rat", "Береговая крыса", 3]],
  r: [["goblin", "Гоблин", 2], ["wolf", "Горный волк", 2], ["bandit", "Разбойник", 2]],
  m: [["zombie", "Болотный мертвец", 2], ["giant_rat", "Болотная крыса", 3], ["giant_spider", "Гигантский паук", 1, 2]],
  n: [["goblin", "Гоблин", 2], ["wolf", "Горный волк", 2]],
  night: [["zombie", "Ходячий мертвец", 2], ["skeleton", "Скелет", 2], ["wolf", "Волк", 2]]
};
const FOE_TXT = {
  wolf: ["Из кустов доносится низкое рычание: волки обходят тебя полукругом, принюхиваясь к ветру.", "Серая тень бросается из-за деревьев — за ней вторая. Волки!", "e_wolf"],
  bandit: ["Впереди поперёк тропы лежит поваленное дерево, а за ним поблёскивает сталь. Тебя ждут.", "«Кошелёк или жизнь!» — из-за камней выходят вооружённые люди и отрезают путь назад.", "e_bandit"],
  goblin: ["Визгливые голоса и запах горелого мяса: у тропы гоблины делят чью-то добычу.", "Камень свистит у самого уха, и с визгом из травы выскакивают гоблины!", "e_goblin"],
  zombie: ["Впереди, покачиваясь, бредут фигуры. Слишком медленные. Слишком молчаливые.", "Из тумана прямо перед тобой поднимается раздутый мертвец и тянет руки.", "e_zombie"],
  skeleton: ["Кости у обочины начинают шевелиться и со стуком собираться в фигуры.", "Сухой треск за спиной — скелеты уже рядом, ржавые клинки подняты.", "e_skeleton"],
  giant_rat: ["Шорох и писк: из нор вылезают крысы размером с собаку и принюхиваются.", "Пол-земли под ногами вскипает — крысы бросаются со всех сторон!", "e_rat"],
  giant_spider: ["Между деревьями натянуты липкие нити, в них висят коконы. Сверху что-то шевелится.", "Липкая нить падает на плечо, и с ветки бесшумно спускается огромный паук!", "e_spider"]
};
const TRAVELERS = [
  { k: "trader", role: "бродячий торговец", look: "с навьюченным ослом и связкой котелков", ico: "e_trader", txt: "Навстречу бредёт торговец с навьюченным ослом. Завидев тебя, он приветственно поднимает руку: «Товар в дорогу, путник? Дёшево не отдам, но и не обдеру».", trade: true, w: 4 },
  { k: "pilgrim", role: "паломник", look: "в сером плаще, с посохом в лентах", ico: "e_pilgrim", txt: "У придорожного камня отдыхает паломник с посохом, увешанным лентами. Он кивает тебе как старому знакомому и подвигается, освобождая место.", rumor: true, w: 2 },
  { k: "hunter", role: "охотник", look: "с луком за спиной и связкой зайцев", ico: "e_hunter", txt: "Из-за деревьев выходит охотник со связкой добычи. Он явно знает здешние тропы лучше всех и не прочь поговорить.", rumor: true, w: 2, terr: "fgr" },
  { k: "hurt", role: "раненый стражник", look: "с перевязанной головой, хромает", ico: "e_hurt", txt: "У обочины сидит стражник с окровавленной повязкой на голове. «Не подходи… а, ты не из этих. Помоги, а? Я в долгу не останусь».", heal: true, w: 2 },
  { k: "bard", role: "бродячий музыкант", look: "с флейтой за поясом и в шляпе с пером", ico: "e_bard", txt: "Навстречу, насвистывая, шагает музыкант. «Песню за монету — или новость за так!»", rumor: true, w: 2 },
  { k: "robbed", role: "ограбленный купец", look: "в разорванном камзоле, с разбитой губой", ico: "e_ask", txt: "На обочине сидит купец в разорванном камзоле и держится за разбитую губу. «Всё забрали, мерзавцы… и сундучок. Там всё, что у меня было».", quest: "robbed", w: 2 },
  { k: "missing", role: "встревоженный крестьянин", look: "с вилами в руках, осунувшийся", ico: "e_ask", txt: "Крестьянин с вилами бросается к тебе: «Сына не видел? Мальчишка пошёл за хворостом и не вернулся. А там, в овраге, звери…»", quest: "missing", w: 2 },
  { k: "letter", role: "старик-письмоносец", look: "сгорбленный, с сумкой через плечо", ico: "e_ask", txt: "Сгорбленный старик с сумкой через плечо останавливает тебя: «Ноги уже не те, а письмо срочное. Не донесёшь до поселения? Заплатят там».", quest: "letter", w: 2 },
  { k: "healer", role: "травница", look: "с корзиной трав и острыми глазами", ico: "e_ask", gender: "f", txt: "Женщина с корзиной трав внимательно смотрит на тебя: «Ты, вижу, не робкого десятка. Мне нужна лунная трава, а растёт она там, куда я одна не пойду».", quest: "herbs", w: 2, terr: "fgm" }
];
const DISCOVERIES = [
  { k: "camp", name: "Брошенная стоянка", ico: "e_camp", camp: true, txt: "У тропы — остывшее кострище, рваная палатка и разбросанные вещи. Хозяева ушли в спешке… или не ушли вовсе.", skill: "investigation", objs: [["tent", "рваная палатка", 2.2, 1.8], ["sack", "брошенный мешок", .9, .75]] },
  { k: "cart", name: "Перевёрнутая телега", ico: "e_cart", txt: "Поперёк дороги лежит перевёрнутая телега, вокруг рассыпан груз. Лошади нет, на земле тёмные пятна.", skill: "investigation", road: true, objs: [["cart", "перевёрнутая телега", 1.4, 2.4], ["crate", "разбитый ящик", 1, 1], ["body", "тело возницы", 1.4, .7]] },
  { k: "shrine", name: "Забытое капище", ico: "e_shrine", txt: "Среди камней — круг старых идолов, покрытых мхом. На одном свежая метка углём, а у подножия чьи-то подношения.", skill: "religion", objs: [["statue", "замшелый идол", 1, 1], ["altar", "камень для подношений", 1.8, 1]] },
  { k: "ruin", name: "Заросшие руины", ico: "e_ruin", txt: "Из травы поднимаются остатки стен. Под обломками угадывается лаз в подвал, откуда тянет сыростью.", skill: "investigation", objs: [["rock", "обломки стены", 1.3, 1.1], ["chest", "сундук под обломками", 1.1, .75]] },
  { k: "grave", name: "Одинокий курган", ico: "e_grave", txt: "Невысокий курган с покосившимся камнем. Земля у подножия разрыта — недавно, и не зверем.", skill: "history", objs: [["grave", "старое надгробие", 1, 1.2]] },
  { k: "spring", name: "Чистый родник", ico: "e_spring", txt: "Из-под камня бьёт ледяной родник. Вода такая чистая, что видно каждую песчинку, а вокруг удивительно тихо.", skill: "nature", spring: true, objs: [["rock", "камень с родником", 1.2, 1]] },
  { k: "cache", name: "Тайник у тропы", ico: "e_cache", txt: "Под корнями старого дерева заметна щель, заложенная камнем. Слишком аккуратно для случайности.", skill: "perception", objs: [["chest", "тайник под корнями", 1.1, .75]] }
];
const HAZARDS = [
  { k: "storm", t: "Гроза", ico: "e_storm", txt: "Небо чернеет за минуты. Ливень хлещет стеной, молнии бьют совсем рядом, ветер сбивает с ног.", a: { s: "con", kind: "save", dc: 12, t: "Идти сквозь бурю", dmg: "1d4" }, b: { s: "survival", kind: "skill", dc: 12, t: "Найти укрытие", lose: 1 }, detour: 2 },
  { k: "ford", t: "Разлившийся ручей", ico: "e_ford", terr: "gfm", txt: "Ручей, который здесь легко перейти вброд, вздулся после дождей. Течение тащит ветки и пену.", a: { s: "athletics", kind: "skill", dc: 12, t: "Перейти вброд", dmg: "1d6" }, b: { s: "survival", kind: "skill", dc: 13, t: "Найти брод", lose: 1 }, detour: 2 },
  { k: "slide", t: "Осыпь", ico: "e_slide", terr: "rn", txt: "Над тропой шуршат камни — склон вот-вот поедет вниз.", a: { s: "acrobatics", kind: "skill", dc: 12, t: "Проскочить под осыпью", dmg: "1d8" }, b: { s: "perception", kind: "skill", dc: 12, t: "Выбрать безопасный путь", lose: 1 }, detour: 1 },
  { k: "mire", t: "Трясина", ico: "e_mire", terr: "m", txt: "Кочка уходит из-под ноги — и ты по колено в ледяной жиже, которая тянет вниз.", a: { s: "athletics", kind: "skill", dc: 13, t: "Выбраться силой", dmg: "1d4" }, b: { s: "survival", kind: "skill", dc: 12, t: "Нащупать твёрдую тропу", lose: 1 }, detour: 1 },
  { k: "fog", t: "Туман", ico: "e_fog", txt: "Белая мгла опускается так плотно, что не видно собственных сапог. Тропа исчезает.", a: { s: "survival", kind: "skill", dc: 12, t: "Держать направление", lost: true }, b: { s: "perception", kind: "skill", dc: 13, t: "Идти на звук воды", lost: true }, detour: 2 },
  { k: "tide", t: "Прилив", ico: "e_tide", terr: "a", txt: "Вода прибывает быстрее, чем ты думал: узкую полосу берега отрезает волнами.", a: { s: "athletics", kind: "skill", dc: 12, t: "Пробежать по камням", dmg: "1d6" }, b: { s: "nature", kind: "skill", dc: 12, t: "Рассчитать волну", lose: 1 }, detour: 2 }
];
function startEncounter(x, y, P) {
  const t = tileAt(x, y); const night = worldTime().part === 3; const loc = S.world.loc; const R = Math.random;
  const omenOk = (S.world.omens || 0) < 3 && plotTargets().length; const roadQ = Object.values(WD.quests || {}).filter(q => q.road && qSt(q.id).st === "active").length < 2;
  const W = [["ambush", night ? 46 : 34], ["traveler", night ? 8 : 24], ["discovery", 18], ["hazard", 14], ["omen", omenOk ? 9 : 0]];
  let r = R() * W.reduce((a, w) => a + w[1], 0); let kind = W[0][0]; for (const [k, w] of W) { if ((r -= w) < 0) { kind = k; break; } }
  const enc = { kind, loc, x, y, t, done: false, day: worldTime().day };
  if (kind === "ambush") {
    const tab = night && R() < .55 ? ENC_FOES.night : ENC_FOES[t] || ENC_FOES.g; const opts = tab.filter(f => !f[3] || C().level >= f[3]); const [type, nm, base] = opts[Math.floor(R() * opts.length)];
    const n = clamp(base + (C().level >= 3 ? 1 : 0) - (C().level === 1 && base >= 3 && R() < .5 ? 1 : 0), 1, 4); enc.foes = spawnFoes(type, nm, n, loc);
    const dc = 11 + (night ? 1 : 0); const pp = 10 + skillBonus("perception") + (P?.notice || 0); enc.noticed = pp >= dc + Math.floor(R() * 5) - 2; enc.pp = pp; enc.type = type;
    const tx = FOE_TXT[type] || FOE_TXT.bandit; enc.title = enc.noticed ? `${nm}${n > 1 ? " ×" + n : ""} впереди` : "Засада!"; enc.text = enc.noticed ? tx[0] : tx[1]; enc.ico = tx[2];
  } else if (kind === "traveler") {
    let pool = TRAVELERS.filter(v => !v.terr || v.terr.includes(t)); if (!roadQ) pool = pool.filter(v => !v.quest); let s = R() * pool.reduce((a, v) => a + v.w, 0); let v = pool[0]; for (const x2 of pool) { if ((s -= x2.w) < 0) { v = x2; break; } }
    enc.sub = v.k; enc.ico = v.ico; enc.npc = spawnTraveler(v, loc); enc.title = `${NPCS[enc.npc].name}, ${v.role}`; enc.text = v.txt.replace("{start}", POIS[WD.start]?.name || "поселение"); enc.trade = !!v.trade; enc.rumor = !!v.rumor; enc.heal = !!v.heal; enc.quest = v.quest || null;
  } else if (kind === "discovery") {
    let pool = DISCOVERIES.filter(d => !d.road || isRoad(x, y)); const d = pool[Math.floor(R() * pool.length)]; const sid = siteAt(x, y, { name: d.name, kind: d.k === "shrine" ? "shrine" : d.k === "ruin" ? "ruin" : "camp", camp: !!d.camp, short: d.name.toLowerCase(), desc: d.txt, disc: d.k });
    const st = scState(sid); if (!st.add.length) { const sc = sceneOf(sid); (d.objs || []).forEach(([k, label, w, h], i) => { const p = scFreeNear(sc, st.add.map(o => ({ x: o.x, y: o.y })), 8 + (i - 1) * 2.6, 5.6 + (i % 2) * 1.6, 4); st.add.push({ k, label, acc: label, x: +p.x.toFixed(2), y: +p.y.toFixed(2), w, h, disc: true }); }); }
    tripTimeDone = true; moveTo(sid); enc.loc = sid; enc.sub = d.k; enc.ico = d.ico; enc.title = d.name; enc.text = d.txt; enc.skill = d.skill; enc.spring = !!d.spring;
  } else if (kind === "hazard") {
    const pool = HAZARDS.filter(h => !h.terr || h.terr.includes(t)); const h = pool[Math.floor(R() * pool.length)]; enc.sub = h.k; enc.ico = h.ico; enc.title = h.t; enc.text = h.txt; enc.hz = h;
  } else {
    const tg = plotTargets(); const id = tg[Math.floor(R() * tg.length)]; const p = POIS[id]; const dir = compassDir(p.x - x, p.y - y); S.world.omens = (S.world.omens || 0) + 1;
    const sign = ({ cave: "из расщелины тянется дымок", tower: "в окне мелькает огонёк", ruin: "над камнями кружат вороны", camp: "поднимается дым костра", wreck: "у воды движутся огни" })[p.kind] || "над деревьями кружат вороны и что-то поблёскивает";
    enc.sub = "omen"; enc.ico = "e_omen"; enc.target = id; enc.title = "Знак"; enc.text = `Ты замираешь: ${dir}, там, где ${placeState(id).visited || placeState(id).rumor ? `стоит «${p.name}»` : "ты ещё не бывал"}, ${sign}. Птицы смолкли. Кто-то там есть — и, похоже, это связано с тем, что здесь творится.`;
  }
  S.world.enc = enc; sfx(kind === "ambush" ? "horn" : kind === "hazard" ? "rumble" : "bell", .7); renderAll(); save(); openEncounter();
}
function plotTargets() { return outerEntries().filter(([id, p]) => id !== WD.start && !p.wild && ((p.enemies || []).some(e => S.world.enemies[e]?.alive) || (p.clue && !S.world.flags["clue_" + id])) && !S.world.visited.includes(id)).map(([id]) => id); }
function spawnFoes(type, name, n, loc) { const B = BESTIARY[type] || BESTIARY.bandit; const ids = []; for (let i = 0; i < n; i++) { let id = `e${S.turn}_${i}_${rnd(999)}`; const E = { ...B, type, name: n > 1 ? `${name} ${["", "II", "III", "IV"][i] || i + 1}`.trim() : name, loc, enc: true };
  if (WD.danger === "high") { E.hp = Math.round(E.hp * 1.2); } if (WD.danger === "low") E.hp = Math.max(4, Math.round(E.hp * .8)); ENEMIES[id] = E; S.world.enemies[id] = { hp: E.hp, alive: true, asleep: false }; ids.push(id); POIS[loc].enemies = [...(POIS[loc].enemies || []), id]; } return ids; }
function despawnFoes(ids) { (ids || []).forEach(id => { const E = ENEMIES[id]; if (E && POIS[E.loc]) POIS[E.loc].enemies = (POIS[E.loc].enemies || []).filter(x => x !== id); delete ENEMIES[id]; delete S.world.enemies[id]; }); }
function spawnNpc(o, loc) {
  const ns = nameSet(WD); const g = o.gender || (/ница|ка$|вдова|беглянка/.test(o.role) ? "f" : "m"); const list = ns[g] || ns.m; const used = new Set(Object.values(NPCS).map(n => n.name)); let name = list[rnd(list.length) - 1]; for (let i = 0; i < 6 && used.has(name); i++) name = list[rnd(list.length) - 1];
  let id = "tr" + S.turn + "_" + rnd(9999); const h = hash(WD.id + id);
  NPCS[id] = { name, role: o.role, look: o.look || "", persona: o.persona || "Путник со своими заботами.", secret: o.secret || "", greet: "", minor: true, gender: g, age: o.age || "adult", feature: FEATURES[h % FEATURES.length], hair: Object.keys(HAIRS)[(h >>> 4) % 6], photo_prompt: "", traveler: true };
  const p = POIS[loc]; p.base = p.base || []; p.base.push(id); p.npcs.push(id); S.world.npcs[id] = { att: 5, mem: [] }; S.world.met = S.world.met || []; S.world.met.push(id); wantPortrait(WD, id, 2); return id;
}
function spawnTraveler(v, loc) { return spawnNpc({ role: v.role, look: v.look, gender: v.gender, persona: v.quest ? "Встревожен и просит о помощи, но гордость не позволяет умолять." : "Повидал дорог и любит поговорить.", secret: v.rumor ? "Знает слух о месте неподалёку." : "" }, loc); }
function encDone() { const e = S.world.enc; if (!e) return true; if (e.done) return true; if (e.kind === "ambush" && e.fought && !(e.foes || []).some(id => S.world.enemies[id]?.alive)) return true; return false; }
function finishEnc(note) { const e = S.world.enc; if (!e) return; e.done = true; if (e.npc && NPCS[e.npc] && !e.keepNpc) { S.world.npcLoc = S.world.npcLoc || {}; } if (note) pushFeed({ t: "sys", html: note }); }
function leaveEncounterPeople() { const e = S.world.enc; if (e?.npc && NPCS[e.npc] && !e.keepNpc) { S.world.npcLoc = S.world.npcLoc || {}; S.world.npcLoc[e.npc] = null; refreshPeople(); } }
function encCheckLbl(skill, dc, kind) { const name = kind === "save" ? `Спасбросок ${ABIL_RU[skill]}` : SKILLS[skill][0]; const b = kind === "save" ? saveBonus(skill) : skillBonus(skill); return `${name} ${fmt(b)} · КС ${dc}`; }
function encChoices(e) {
  const c = C(); const ch = []; const add = (k, t, sub, icon, o = {}) => ch.push({ k, t, sub, icon, ...o });
  if (e.kind === "ambush") { const E = ENEMIES[e.foes[0]]; const beast = ["wolf", "giant_rat", "giant_spider"].includes(e.type); const undead = ["zombie", "skeleton"].includes(e.type);
    if (e.noticed) { add("strike", "Напасть первым", "внезапная атака, инициатива +5", "t_clash"); add("sneak", "Обойти стороной", encCheckLbl("stealth", 12), "t_hidden"); add("hide", "Затаиться и переждать", encCheckLbl("stealth", 10) + " · −1 ч", "t_hidden");
      if (e.type === "bandit" || e.type === "goblin") { const pay = e.type === "bandit" ? 5 + c.level * 3 : 3; add("pay", `Откупиться (${pay} зм)`, "без драки, но с потерей", "i_coins", { pay, dis: purse(c) < pay * 10 }); add("talk", "Заговорить зубы", encCheckLbl(c.skills.includes("deception") ? "deception" : "persuasion", 13), "x_talk"); }
      if (beast && c.items.some(i => /факел|фонарь/i.test(i.name))) add("fire", "Отпугнуть огнём", encCheckLbl("survival", 11), "i_torch");
      if (undead && ["cleric", "paladin"].includes(c.cls)) add("turn", "Отогнать нежить молитвой", encCheckLbl("religion", 12), "i_holy"); }
    else { add("defend", "Защищаться", "бой — враги бьют первыми", "t_clash"); add("flee", "Бежать", encCheckLbl("athletics", 13) + " · провал — бой", "t_run"); }
  } else if (e.kind === "traveler") { add("talk", "Заговорить", "рассказчик отыграет встречу", "x_talk"); if (e.trade) add("trade", "Поторговать", "открыть товары", "i_coins"); if (e.heal) add("heal", "Перевязать раны", encCheckLbl("medicine", 10), "e_hurt"); if (e.quest) add("quest", "Выслушать просьбу", "может стать поручением", "t_quest"); add("pass", "Пройти мимо", "продолжить путь", "t_boots");
  } else if (e.kind === "discovery") { add("search", "Осмотреть", encCheckLbl(e.skill, 12), "x_look"); if (e.spring) add("drink", "Напиться и отдохнуть", "−1 ч, немного сил", "e_spring"); add("mark", "Отметить на карте и идти дальше", "место останется на карте", "t_sign");
  } else if (e.kind === "hazard") { const h = e.hz; add("ha", h.a.t, encCheckLbl(h.a.s, h.a.dc, h.a.kind), "t_boots"); add("hb", h.b.t, encCheckLbl(h.b.s, h.b.dc, h.b.kind), "x_look"); add("detour", "Обойти", `без риска, −${h.detour} ч`, "t_sign");
  } else { add("look", "Присмотреться", encCheckLbl("perception", 11), "x_look"); add("note", "Запомнить и идти дальше", "место появится на карте", "t_sign"); }
  return ch;
}
function openEncounter() {
  const e = S.world.enc; if (!e || encDone()) return; const P = POIS[e.loc]; const ch = encChoices(e);
  const tag = { ambush: e.noticed ? "Опасность" : "Нападение", traveler: "Встреча", discovery: "Находка", hazard: "Препятствие", omen: "Знак" }[e.kind];
  modal(`<div class="enc enc-${e.kind}${e.kind === "ambush" && !e.noticed ? " surprise" : ""}"><div class="enc-art"><span class="enc-ico">${ico(e.ico, 64)}</span><div><div class="eyebrow">${tag} в пути · ${esc(P.name)} · ${DAY_PARTS[worldTime().part]}</div><h2>${esc(e.title)}</h2></div></div>
    <p class="enc-txt">${esc(e.text)}</p>${e.kind === "ambush" ? `<p class="enc-note">${ico("x_look", 14)} Пассивная Внимательность ${e.pp}: ${e.noticed ? "вы заметили опасность первыми." : "вас застали врасплох."}</p>` : ""}
    <div class="enc-ch">${ch.map(c => `<button type="button" class="enc-btn" data-c="${c.k}" ${c.dis ? "disabled" : ""}>${ico(c.icon, 22)}<span><b>${esc(c.t)}</b><small>${esc(c.sub)}</small></span></button>`).join("")}</div></div>`, root => {
    root.querySelector(".modal").classList.add("enc-modal");
    root.querySelectorAll("[data-c]").forEach(b => b.onclick = () => { const k = b.dataset.c; const c = ch.find(x => x.k === k); closeModal(); encAct(k, c); });
  });
}
function encAct(k, c) {
  const e = S.world.enc; const ch = (skill, dc, kind = "skill", reason) => ({ kind, [kind === "save" ? "ability" : "skill"]: skill, dc, reason: reason || "Встреча в пути" });
  const foeName = e.foes?.length ? ENEMIES[e.foes[0]]?.name.replace(/ II| III| IV/, "") : "";
  S.pendingEnc = { k };
  if (e.kind === "ambush") {
    if (k === "strike") { e.fought = true; takeTurn(`Нападаю первым: ${ENEMIES[e.foes[0]].name}`, { checks: [{ kind: "attack", target: e.foes[0], weapon: C().weapons[0], reason: "Внезапная атака" }] }); return; }
    if (k === "defend") { e.fought = true; encStartCombat(false); S.pendingEnc = null; takeTurn("Выхватываю оружие и встаю в стойку!", { checks: [] }); return; }
    if (k === "pay") { const c2 = C(); setPurse(c2, purse(c2) - c.pay * 10); pushFeed({ t: "chips", items: [{ c: "gold", x: `−${c.pay} зм · откуп` }] }); despawnFoes(e.foes); e.done = true; takeTurn(`Бросаю им кошель: ${c.pay} золотых. Пропустите — и разойдёмся миром.`, { checks: [] }); return; }
    const map = { sneak: ["stealth", 12, "Прокрасться мимо"], hide: ["stealth", 10, "Затаиться"], talk: [C().skills.includes("deception") ? "deception" : "persuasion", 13, "Убедить уйти"], fire: ["survival", 11, "Отпугнуть огнём"], turn: ["religion", 12, "Изгнать нежить"], flee: ["athletics", 13, "Оторваться"] }[k];
    const txt = { sneak: `Пытаюсь незаметно обойти: ${foeName}`, hide: "Затаиваюсь и жду, пока опасность пройдёт мимо", talk: "Заговариваю с ними: никому не нужна драка", fire: "Размахиваю огнём, чтобы отпугнуть зверей", turn: "Поднимаю святой символ и читаю молитву против нежити", flee: "Бегу со всех ног!" }[k];
    if (k === "hide") passHours(1); takeTurn(txt, { checks: [ch(map[0], map[1], "skill", map[2])] }); return;
  }
  if (e.kind === "traveler") { const n = NPCS[e.npc];
    if (k === "trade") { S.pendingEnc = null; e.talked = true; const m = merchantsHere().find(x => x.npc === e.npc); if (m) openShop(m); return; }
    if (k === "pass") { S.pendingEnc = null; finishEnc(); leaveEncounterPeople(); renderAll(); save(); resumeTrip(); return; }
    if (k === "heal") { takeTurn(`Перевязываю раны: ${n.name}`, { checks: [ch("medicine", 10, "skill", "Перевязать рану")], talk_to: e.npc }); return; }
    if (k === "quest") { S.pendingEnc = null; const qid = makeRoadQuest(e); e.keepNpc = true; if (qid) openQuestOffer(qid); return; }
    if (e.rumor && !e.rumorGiven) { const r = outerEntries().filter(([id, p]) => !p.wild && !S.world.visited.includes(id) && !S.world.rumors?.includes(id)); if (r.length) { const id = r[Math.floor(Math.random() * r.length)][0]; S.world.rumors = S.world.rumors || []; S.world.rumors.push(id); e.rumorGiven = id; pushFeed({ t: "chips", items: [{ c: "gold", x: `Слух: ${POIS[id].name}` }] }); } }
    e.talked = true; e.done = true; takeTurn(`Заговариваю с путником: ${n.name} (${n.role})`, { checks: [], talk_to: e.npc }); return;
  }
  if (e.kind === "discovery") {
    if (k === "mark") { S.pendingEnc = null; finishEnc(`Место отмечено на карте: <b>${esc(POIS[e.loc].name)}</b>.`); renderAll(); save(); resumeTrip(); return; }
    if (k === "drink") { S.pendingEnc = null; passHours(1); const d = rollDice("1d6"); const got = healHero(d.total + C().level); pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · родниковая вода` }] }); e.drank = true; after(); takeTurn("Пью ледяную воду и отдыхаю у родника", { checks: [] }); return; }
    takeTurn(`Осматриваю: ${POIS[e.loc].name}`, { checks: [ch(e.skill, 12, "skill", "Осмотреть находку")] }); return;
  }
  if (e.kind === "hazard") { const h = e.hz;
    if (k === "detour") { S.pendingEnc = null; passHours(h.detour); finishEnc(`Вы обходите препятствие стороной. Потеряно ${h.detour} ч.`); renderAll(); save(); resumeTrip(); return; }
    const a = k === "ha" ? h.a : h.b; takeTurn(`${a.t}`, { checks: [ch(a.s, a.dc, a.kind, h.t)] }); return; }
  if (k === "note") { S.pendingEnc = null; S.world.rumors = S.world.rumors || []; if (!S.world.rumors.includes(e.target)) S.world.rumors.push(e.target); finishEnc(`Вы запоминаете направление: <b>${esc(POIS[e.target].name)}</b> отмечено на карте.`); renderAll(); save(); resumeTrip(); return; }
  takeTurn("Присматриваюсь к далёкому знаку", { checks: [ch("perception", 11, "skill", "Разглядеть знак")] });
}
function encStartCombat(first) {
  const c = C(); S.world.combat = true; const ini = rnd(20); const tot = ini + mod(c.scores.dex) + traitFx(c.traits || {}).init + (first ? 5 : 0);
  pushFeed({ t: "roll", r: { kind: "init", title: "Инициатива", nat: ini, total: tot, ok: true, formula: `d20 (${ini}) ${fmt(mod(c.scores.dex))}${first ? " +5 внезапность" : ""} = ${tot}`, reason: first ? "Вы бьёте первыми" : "Бой начался" } });
  pushFeed({ t: "sys", html: "<b>Бой!</b> Ваш ход: атакуйте из листа персонажа или опишите действие." }); sfx("horn");
}
function encAfterChecks(results) {
  const pe = S.pendingEnc; const e = S.world.enc; if (!pe || !e) return; S.pendingEnc = null; const r = results.find(x => x.kind === "skill" || x.kind === "save" || x.kind === "attack"); const ok = r && r.ok; const note = t => results.push({ kind: "note", title: t });
  if (e.kind === "ambush") {
    if (pe.k === "strike") { encStartCombat(true); note("Герой напал первым, бой начался (start_combat не нужен, бой уже идёт)"); return; }
    if (ok) { despawnFoes(e.foes); e.done = true; note({ sneak: "Герою удалось незаметно обойти врагов, встречи не было", hide: "Опасность прошла мимо, герой остался незамеченным", talk: "Слова сработали: враги отступили и пропустили героя", fire: "Звери шарахнулись от огня и ушли", turn: "Нежить отступила перед святым словом и рассыпалась прахом", flee: "Герою удалось оторваться и уйти" }[pe.k] + ". Теперь можно продолжить путь."); return; }
    e.fought = true; encStartCombat(false); note("Не вышло — враги нападают, бой начался (start_combat не нужен)"); return;
  }
  if (e.kind === "traveler" && pe.k === "heal") { e.done = true; if (ok) { const n = NPCS[e.npc]; const st = S.world.npcs[e.npc]; if (st) st.att += 15; const g = 2 + rnd(6); C().gold += g; pushFeed({ t: "chips", items: [{ c: "gold", x: `+${g} зм · благодарность` }, { c: "npc", x: `${n.name}: +15 к отношению` }] }); note(`Рана перевязана. ${n.name} благодарит и уже отдал ${g} зм (выдано движком, не дублируй gold). Пусть поделится полезным слухом или советом`); } else note("Перевязка не задалась: рана снова кровит, путник морщится, но благодарит за попытку"); return; }
  if (e.kind === "discovery") { e.done = true; if (!ok) { note("Осмотр ничего не дал: если здесь что-то и было, оно ускользнуло от героя"); return; }
    const c = C(); const R = Math.random(); let txt;
    if (e.spring) { const got = healHero(rollDice("1d8").total + c.level); txt = `Вода родника целебна: +${got} HP (уже применено)`; pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · родник` }] }); }
    else if (R < .35) { const g = 4 + rnd(10) + (WD.danger === "high" ? 6 : 0); c.gold += g; pushFeed({ t: "chips", items: [{ c: "gold", x: `+${g} зм` }] }); sfx("gold"); txt = `НАХОДКА: ${g} золотых (уже добавлено движком, не дублируй gold)`; }
    else if (R < .55) { c.items.push({ name: "Зелье лечения", desc: "Восстанавливает 2d4+2 HP", potion: true, heal: "2d4+2" }); pushFeed({ t: "chips", items: [{ c: "item", x: "+ Зелье лечения" }] }); txt = "НАХОДКА: зелье лечения (уже в инвентаре, не дублируй)"; }
    else if (R < .8) { const it = LOOT[Math.floor(Math.random() * LOOT.length)]; c.items.push({ ...it }); pushFeed({ t: "chips", items: [{ c: "item", x: `+ ${it.name}` }] }); sfx("chest"); txt = `НАХОДКА: ${it.name} — ${it.desc} (уже в инвентаре, не дублируй)`; }
    else { const tg = plotTargets(); if (tg.length) { const id = tg[0]; S.world.rumors = S.world.rumors || []; if (!S.world.rumors.includes(id)) S.world.rumors.push(id); pushFeed({ t: "chips", items: [{ c: "gold", x: `Слух: ${POIS[id].name}` }] }); txt = `НАХОДКА: след, ведущий к месту «${POIS[id].name}» и связанный с главной тайной — дай небольшой намёк, не раскрывая всего`; } else { c.gold += 5; txt = "НАХОДКА: 5 золотых (уже добавлено)"; } }
    note(txt); return; }
  if (e.kind === "hazard") { e.done = true; const h = e.hz; const a = pe.k === "ha" ? h.a : h.b;
    if (ok) { note(`Препятствие «${h.t}» преодолено. Можно идти дальше.`); return; }
    if (a.dmg) { const d = rollDice(a.dmg); hurtHero(d.total); pushFeed({ t: "chips", items: [{ c: "dmg", x: `−${d.total} HP · ${h.t.toLowerCase()} (${d.text})` }] }); }
    if (a.lose) passHours(a.lose); if (a.lost) { passHours(2); note("Герой заблудился и потерял около двух часов"); }
    note(`Провал: ${h.t.toLowerCase()} берёт своё${a.dmg ? " (урон уже посчитан, не дублируй damage)" : ""}${a.lose ? `, потеряно ${a.lose} ч` : ""}. Но путь можно продолжить.`); return; }
  if (e.kind === "omen") { e.done = true; S.world.rumors = S.world.rumors || []; if (!S.world.rumors.includes(e.target)) S.world.rumors.push(e.target);
    if (ok) { S.world.notes = S.world.notes || {}; S.world.notes[e.target] = S.world.notes[e.target] || "замечены признаки жизни"; pushFeed({ t: "chips", items: [{ c: "gold", x: `На карте: ${POIS[e.target].name}` }] }); note(`Герой разглядел знак у места «${POIS[e.target].name}» [${e.target}]: дай один конкретный намёк, связанный с ТАЙНОЙ (что-то увидено издали), не раскрывая её`); }
    else note(`Знак у места «${POIS[e.target].name}» не разглядеть толком, только общее направление`); }
}
function travelBrief() {
  const e = S.world.enc; const p = POIS[S.world.loc]; const out = [];
  if (p?.wild) out.push(`ГЕРОЙ В ПУТИ, вне поселений: ${p.name} (${p.short}).${S.world.trip?.dest && POIS[S.world.trip.dest] ? ` Шёл к месту «${POIS[S.world.trip.dest].name}».` : ""}`);
  if (e && e.loc === S.world.loc) out.push(`ВСТРЕЧА В ПУТИ: «${e.title}» — ${e.text}${encDone() ? " (встреча уже разрешена)" : ""}`);
  return out.length ? out.join("\n") + "\n" : "";
}

/* =========================================================================
   ПОБОЧНЫЕ ПОРУЧЕНИЯ
   ========================================================================= */
const QTYPES = { hunt: "Охота", fetch: "Найти и принести", deliver: "Доставка", investigate: "Разузнать" };
function qSt(id) { S.world.quests = S.world.quests || {}; return S.world.quests[id] || (S.world.quests[id] = { st: "new" }); }
function allQuests() { return Object.values(WD.quests || {}); }
function activeQuests() { return allQuests().filter(q => ["active", "ready"].includes(qSt(q.id).st)); }
function npcWhere(id) { const e = Object.entries(POIS).find(([, p]) => (p.npcs || []).includes(id)); if (!e) return null; return e[1].inner ? e[1].parent : e[0]; }
function questOfferFor(npc) { if ((S.world.npcs[npc]?.att || 0) < -10) return null; return allQuests().find(q => q.giver === npc && !q.road && ["new", "declined"].includes(qSt(q.id).st)) || null; }
function questTurnInFor(npc) { return allQuests().find(q => { const st = qSt(q.id); if (q.type === "deliver") return st.st === "active" && q.to === npc && C().items.some(i => i.quest === q.id); return st.st === "ready" && q.giver === npc; }) || null; }
function questMark(npc) { if (!S || S.world.combat) return ""; if (questTurnInFor(npc)) return "?"; const q = questOfferFor(npc); return q && qSt(q.id).st === "new" ? "!" : ""; }
function questBadge(id) { if (!S) return ""; const act = activeQuests(); if (act.some(q => qSt(q.id).st === "active" && q.target === id)) return `<i class="mk-b qq" title="Цель поручения">!</i>`;
  if (act.some(q => (qSt(q.id).st === "ready" && npcWhere(q.giver) === id) || (q.type === "deliver" && npcWhere(q.to) === id))) return `<i class="mk-b qd" title="Сдать поручение">?</i>`; return ""; }
function ensureQuests(wd) { if (!wd || wd.quests) return; wd.quests = genQuests(wd); }
const Q_FETCH = [["семейный медальон", "старое надгробие"], ["ящик с инструментами", "chest"], ["свёрток с письмами", "chest"], ["старая икона", "chest"], ["мешочек серебра", "sack"], ["потерянный амулет", "item"]];
const Q_INV = [["странные следы", "Узнать, кто оставляет странные следы у места «{p}»"], ["обгоревший круг на земле", "Выяснить, что за огни горят по ночам у места «{p}»"], ["брошенный фонарь", "Узнать, куда пропал человек, ушедший к месту «{p}»"]];
function genQuests(wd) {
  const R = mulberry(hash(wd.id + "#quests")); const out = {}; const places = Object.entries(wd.places).filter(([id, p]) => !p.inner && id !== wd.start && !p.wild);
  const far = places.filter(([, p]) => p.where !== "village"); const main = Object.entries(wd.npcs).filter(([, n]) => !n.bld && !n.traveler); const town = Object.entries(wd.npcs).filter(([, n]) => n.bld && /кузнец|пекар|мельник|рыбак|вдова|охотник|травни|хозяй|лавоч|староста|крестьян|пастух/.test(n.role || ""));
  const givers = [...main.slice(0, 3), ...town.sort(() => R() - .5).slice(0, 2)]; if (!givers.length || !places.length) return out;
  const pick = a => a[Math.floor(R() * a.length)]; const foeBy = { forest: "wolf", marsh: "giant_rat", mountains: "goblin", coast: "wolf" }[wd.biome] || "wolf"; const FN = { wolf: "Волк", giant_rat: "Гигантская крыса", goblin: "Гоблин", bandit: "Разбойник" };
  givers.forEach(([gid, n], i) => {
    const types = ["hunt", "fetch", "deliver", "investigate"]; const type = types[(i + Math.floor(R() * 4)) % 4]; const tgt = pick(far.length ? far : places); const [tid, tp] = tgt; const id = `q_${i}_${gid}`.slice(0, 30);
    const gold = Math.round((8 + R() * 14) * (wd.danger === "high" ? 1.4 : wd.danger === "low" ? .8 : 1)); const q = { id, giver: gid, type, target: tid, reward: { gold, xp: 75 + Math.round(R() * 3) * 25 }, secret: i < 2 && !!n.secret && !n.bld };
    if (type === "hunt") { const ft = (tp.enemies || []).length ? null : (R() < .3 ? "bandit" : foeBy); q.foe = ft ? { type: ft, n: 2, name: FN[ft] } : null; q.title = ft ? `${FN[ft]}ы у места «${tp.name}»`.replace("Волкы", "Волки").replace("Гоблины", "Гоблины") : `Очистить «${tp.name}»`;
      q.brief = ft ? `«Возле «${tp.name}» завелись ${({ wolf: "волки", giant_rat: "крысы размером с собаку", goblin: "гоблины", bandit: "лихие люди" })[ft]}. Кто туда ни пойдёт — возвращается покусанным или не возвращается вовсе. Разберёшься — заплачу.»` : `«В месте «${tp.name}» засела нечисть. Пока она там, людям туда не сунуться. Помоги — не обижу.»`;
      q.goal = `Перебить врагов у места «${tp.name}» и вернуться к ${n.name}`; }
    else if (type === "fetch") { const [item, k] = pick(Q_FETCH); q.item = item[0].toUpperCase() + item.slice(1); q.objk = k === "старое надгробие" ? "chest" : k; q.title = `${q.item}`; q.brief = `«Я потерял${n.gender === "f" ? "а" : ""} там, у места «${tp.name}», ${item}. Сам${n.gender === "f" ? "а" : ""} туда не пойду — не те времена. Принесёшь — отблагодарю.»`; q.goal = `Найти ${item} у места «${tp.name}» и принести ${n.name}`; }
    else if (type === "deliver") { const others = Object.entries(wd.npcs).filter(([k, x]) => k !== gid && !x.traveler && !x.bld); if (!others.length) { q.type = "investigate"; } else { const [to, tn] = pick(others); q.to = to; q.item = pick(["Запечатанное письмо", "Небольшой свёрток", "Склянка с лекарством", "Долговая расписка"]); q.title = `Посылка для ${tn.name}`; q.brief = `«Передай это ${tn.name}. Лично в руки, и не задавай лишних вопросов. Заплатит ${tn.name} — я уже договорился.»`; q.goal = `Отнести «${q.item.toLowerCase()}» ${tn.name} (${tn.role})`; delete q.target; q.target = npcPlaceIn(wd, to) || tid; } }
    if (q.type === "investigate") { const [obj, goal] = pick(Q_INV); q.obj = obj; q.title = `Тайна места «${tp.name}»`; q.brief = `«Неладное творится у места «${tp.name}». ${pick(["Люди видят там огни.", "Оттуда слышат крики по ночам.", "Туда ушёл человек и не вернулся."])} Сходи, погляди — я в долгу не останусь.»`; q.goal = goal.replace("{p}", tp.name); q.target = tid; }
    if (q.secret) q.helps = `${n.name} расскажет то, что до сих пор скрывал${n.gender === "f" ? "а" : ""}`;
    if (R() < .35) q.reward.item = pick([{ name: "Зелье лечения", potion: true, heal: "2d4+2", desc: "Восстанавливает 2d4+2 HP" }, { weapon: pick(["dagger", "shortsword", "spear", "handaxe", "longsword", "mace"]) }, { name: "Оберег на шнурке", desc: "Говорят, отводит дурной глаз" }]);
    out[id] = q;
  });
  return out;
}
function npcPlaceIn(wd, npc) { const e = Object.entries(wd.places).find(([, p]) => (p.npcs || []).includes(npc)); return e ? (e[1].inner ? e[1].parent : e[0]) : null; }
function makeRoadQuest(e) {
  const n = NPCS[e.npc]; const R = mulberry(hash(e.npc + S.turn)); const id = "rq_" + e.npc; WD.quests = WD.quests || {}; if (WD.quests[id]) return id; const start = POIS[WD.start];
  const q = { id, giver: e.npc, road: true, reward: { gold: 10 + Math.round(R() * 15), xp: 100 } };
  if (e.quest === "letter") { const to = (start.npcs || []).find(x => NPCS[x] && !NPCS[x].traveler) || Object.keys(NPCS).find(x => !NPCS[x].traveler && !NPCS[x].bld); q.type = "deliver"; q.to = to; q.item = "Срочное письмо"; q.target = WD.start; q.title = `Письмо для ${NPCS[to].name}`; q.brief = `«Отнеси это ${NPCS[to].name} в «${start.name}». Там и заплатят. Только не открывай — не к добру.»`; q.goal = `Отнести письмо ${NPCS[to].name} в «${start.name}»`; q.reward = { gold: 8, xp: 50 }; WD.quests[id] = q; return id; }
  const t = findSiteTile(e.x, e.y, 2.5, 6, R) || findSiteTile(e.x, e.y, 1.5, 9, R); if (!t) return null;
  if (e.quest === "robbed") { const sid = siteAt(t[0], t[1], { name: "Стоянка грабителей", camp: true, short: "лагерь лихих людей", desc: "Костёр в низине, наспех натянутый полог, награбленное свалено в кучу. Здесь не ждут гостей." }); Object.assign(q, { type: "fetch", target: sid, item: "Купеческий сундучок", objk: "chest", foe: { type: "bandit", n: 2, name: "Грабитель" }, title: "Сундучок купца", brief: `«Они ушли туда, к низине. Двое, не больше. Верни сундучок — получишь долю, клянусь. Я подожду в «${start.name}».»`, goal: "Отбить купеческий сундучок у грабителей и вернуть владельцу" }); q.reward.gold += 10; }
  else if (e.quest === "missing") { const beast = R() < .5 ? ["wolf", "Волк", "Волчье логово"] : ["goblin", "Гоблин", "Гоблинская нора"]; const sid = siteAt(t[0], t[1], { name: beast[2], short: "логово в овраге", desc: "Овраг, кости, вонь зверя. У дальнего склона слышен слабый детский плач." }); Object.assign(q, { type: "hunt", target: sid, foe: { type: beast[0], n: 2, name: beast[1] }, title: "Пропавший мальчишка", brief: `«Там, в овраге, логово. Если он жив — вытащи его. Всё отдам, что есть. Буду ждать в «${start.name}».»`, goal: `Расправиться с тварями в логове и спасти мальчика`, reward: { gold: 8, xp: 125, item: { name: "Оберег из рябины", desc: "Подарок благодарного отца" } } }); }
  else { const sid = siteAt(t[0], t[1], { name: "Поляна лунной травы", short: "тихая поляна", desc: "Серебристые стебли светятся в тени деревьев. Слишком тихо — даже птиц не слышно." }); Object.assign(q, { type: "fetch", target: sid, item: "Пучок лунной травы", objk: "item", foe: C().level >= 2 && R() < .5 ? { type: "giant_spider", n: 1, name: "Гигантский паук" } : { type: "wolf", n: 1, name: "Волк" }, title: "Лунная трава", brief: `«Принеси мне пучок лунной травы. Я сварю из неё то, что тебе самому пригодится. Найдёшь меня в «${start.name}».»`, goal: "Собрать лунную траву на дальней поляне и принести травнице", reward: { gold: 0, xp: 75, item: { name: "Зелье лечения", potion: true, heal: "2d4+2", desc: "Сварено травницей" }, item2: { name: "Зелье лечения", potion: true, heal: "2d4+2", desc: "Сварено травницей" } } }); }
  WD.quests[id] = q; return id;
}
function rewardText(q, st) { const g = Math.round((q.reward?.gold || 0) * (st?.bonus ? 1.5 : 1)); const it = q.reward?.item; const parts = []; if (g) parts.push(`${COIN}${g} зм`); if (q.reward?.xp) parts.push(`${q.reward.xp} опыта`); if (it) parts.push(it.weapon ? `добротное оружие (${(WT[it.weapon]?.n || "оружие").toLowerCase()})` : it.name); if (q.reward?.item2) parts.push(q.reward.item2.name); return parts; }
function openQuestOffer(qid) {
  const q = WD.quests[qid]; const st = qSt(qid); const n = NPCS[q.giver]; const tp = POIS[q.target]; let eta = ""; if (tp) { const h = heroPos(); const r = findPath(h.x, h.y, tp.x, tp.y); if (r) eta = fmtH(r.h); }
  const draw = () => `<div class="qo"><div class="qo-head">${npcPh(q.giver)}<div><div class="eyebrow">Просьба · ${QTYPES[q.type] || "Поручение"}</div><h2>${esc(q.title)}</h2><small class="home-note">${esc(n.name)}, ${esc(n.role)}</small></div></div>
    <blockquote class="qo-brief">${esc(q.brief)}</blockquote>
    <div class="qo-grid"><div><h4>Что сделать</h4><p>${esc(q.goal)}</p>${tp && q.type !== "deliver" ? `<p class="qo-where">${ico("t_sign", 14)} ${esc(tp.name)}${eta ? ` · ${eta} пути` : ""}${q.foe ? ` · ${ico("t_clash", 14)} опасно` : ""}</p>` : ""}</div>
      <div><h4>Награда</h4><div class="qo-rew">${rewardText(q, st).map(x => `<span>${x}</span>`).join("")}<span>+ доверие</span>${q.helps || q.secret ? `<span class="star">★ может пролить свет на главную тайну</span>` : ""}</div></div></div>
    <div class="qo-haggle" id="qo-h">${st.haggled ? esc(st.haggled) : ""}</div>
    <div class="row qo-row"><button class="btn" type="button" id="qo-no">Не сейчас</button>${!st.haggled && q.reward?.gold ? `<button class="btn" type="button" id="qo-hag">Поторговаться · ${encCheckLbl("persuasion", 13)}</button>` : ""}<button class="btn primary" type="button" id="qo-yes">${ico("t_quest", 16)} Взяться</button></div></div>`;
  modal(draw(), root => { root.querySelector(".modal").classList.add("qo-modal");
    const bind = () => { root.querySelector("#qo-no").onclick = () => { st.st = "declined"; closeModal(); if (q.road) { S.world.enc && (S.world.enc.done = true); leaveEncounterPeople(); } after(); };
      root.querySelector("#qo-yes").onclick = () => { closeModal(); acceptQuest(qid); };
      root.querySelector("#qo-hag")?.addEventListener("click", () => { const d = rnd(20); const b = skillBonus("persuasion"); const ok = d + b >= 13 || d === 20; if (ok) { st.bonus = true; st.haggled = `🎲 ${d} ${fmt(b)} = ${d + b} — ${n.name} уступает: награда ${Math.round(q.reward.gold * 1.5)} зм.`; sfx("chime"); } else { const ns = S.world.npcs[q.giver]; if (ns) ns.att -= 3; st.haggled = `🎲 ${d} ${fmt(b)} = ${d + b} — ${n.name} хмурится: «Не наглей». Отношение −3.`; sfx("thud"); } root.querySelector(".modal").innerHTML = draw(); bind(); save(); }); };
    bind(); });
}
function acceptQuest(qid) {
  const q = WD.quests[qid]; const st = qSt(qid); st.st = "active"; st.day = worldTime().day; const chips = [{ c: "xp", x: `Новое поручение: ${q.title}` }];
  if (q.foe && q.target && POIS[q.target]) st.foes = spawnFoes(q.foe.type, q.foe.name, q.foe.n || 1, q.target); else if (q.type === "hunt" && POIS[q.target]) st.foes = (POIS[q.target].enemies || []).filter(e => S.world.enemies[e]?.alive);
  if (q.type === "fetch" || q.type === "investigate") placeQuestObj(q);
  if (q.type === "deliver") C().items.push({ name: q.item, desc: `Для: ${NPCS[q.to]?.name || "адресата"}`, quest: qid });
  if (q.target && POIS[q.target] && !S.world.visited.includes(q.target)) { S.world.rumors = S.world.rumors || []; if (!S.world.rumors.includes(q.target)) S.world.rumors.push(q.target); }
  if (q.road) { S.world.npcLoc = S.world.npcLoc || {}; S.world.npcLoc[q.giver] = q.type === "deliver" ? null : WD.start; if (S.world.enc) S.world.enc.done = true; refreshPeople(); }
  pushFeed({ t: "chips", items: chips }); sfx("bell"); S.pendingQNote = `Герой принял поручение «${q.title}» от ${NPCS[q.giver].name}: ${q.goal}. Отыграй коротко: НПС уточняет детали и, может быть, предупреждает об опасности. Награду пока не выдавай.${q.road ? ` Затем НПС уходит ждать героя в «${POIS[WD.start].name}».` : ""}`;
  takeTurn(`Берусь за поручение: ${q.title}`, { checks: [], talk_to: q.giver });
}
function placeQuestObj(q) { const tp = POIS[q.target]; if (!tp) return; const st = scState(q.target); if (st.add.some(a => a.q === q.id)) return; const sc = sceneOf(q.target); const R = mulberry(hash(q.id));
  const p = scFreeNear(sc, st.add.map(o => ({ x: o.x, y: o.y })), 4 + R() * 10, 2.5 + R() * 6, 6); const label = (q.type === "fetch" ? q.item : q.obj).toLowerCase(); const k = q.type === "fetch" ? (q.objk || "chest") : "item"; const [w, h] = SC_ADD_KINDS[k] || [.7, .7];
  st.add.push({ k, label, acc: label, x: +p.x.toFixed(2), y: +p.y.toFixed(2), w, h, q: q.id }); }
function questObjActs(loc, o) { const q = WD.quests?.[o.q]; if (!q) return []; const foes = aliveEnemiesHere().length;
  if (q.type === "fetch") return [{ t: foes ? "Забрать (мешают враги)" : `Забрать: ${q.item.toLowerCase()}`, fn: () => takeQuestItem(loc, o), dis: busy || foes > 0 }];
  if (q.type === "investigate" && qSt(q.id).st === "active") return [{ t: "Изучить для поручения", fn: () => { S.pendingQObj = { q: q.id, loc, label: o.label }; takeTurn(`Внимательно изучаю: ${o.label}`, { checks: [{ kind: "skill", skill: "investigation", dc: 12, reason: "Разобраться, что здесь случилось" }] }); }, dis: busy }];
  return []; }
function takeQuestItem(loc, o) { const q = WD.quests[o.q]; const st = scState(loc); const i = st.add.findIndex(a => a.q === o.q); if (i >= 0) st.add.splice(i, 1); C().items.push({ name: q.item, desc: `Для поручения «${q.title}»`, quest: q.id }); pushFeed({ t: "chips", items: [{ c: "item", x: `+ ${q.item}` }] }); sfx("chest"); after(); }
function questAfterChecks(results) {
  if (S.pendingQNote) { results.push({ kind: "note", title: S.pendingQNote }); S.pendingQNote = null; }
  const po = S.pendingQObj; if (!po) return; S.pendingQObj = null; const q = WD.quests[po.q]; const r = results.find(x => x.kind === "skill");
  if (r && r.ok) { const st = qSt(q.id); st.st = "ready"; const i = scState(po.loc).add.findIndex(a => a.q === q.id); if (i >= 0) scState(po.loc).add.splice(i, 1); results.push({ kind: "note", title: `Поручение «${q.title}»: герой разобрался — расскажи, что он понял (конкретная, правдоподобная разгадка; если уместно, свяжи её с главной тайной). Теперь можно вернуться к ${NPCS[q.giver].name}` }); pushFeed({ t: "chips", items: [{ c: "xp", x: `Поручение выполнено: вернитесь к ${NPCS[q.giver].name}` }] }); }
  else results.push({ kind: "note", title: `Поручение «${q.title}»: пока не удалось понять, что здесь произошло. Можно попробовать снова` });
}
function questTick() {
  if (!S || !WD.quests) return; const c = C();
  allQuests().forEach(q => { const st = qSt(q.id); if (st.st !== "active") return; let ready = false;
    if (q.type === "hunt") ready = (st.foes || []).length > 0 && st.foes.every(id => !S.world.enemies[id]?.alive);
    else if (q.type === "fetch") ready = c.items.some(i => i.quest === q.id) && !(st.foes || []).some(id => S.world.enemies[id]?.alive && ENEMIES[id]?.loc === S.world.loc);
    if (ready) { st.st = "ready"; pushFeed({ t: "chips", items: [{ c: "xp", x: `Поручение «${q.title}» выполнено — вернитесь к ${NPCS[q.giver]?.name || "заказчику"}` }] }); sfx("chime"); } });
  if (S.world.enc && encDone() && S.world.enc.kind === "ambush" && !S.world.enc.done) { S.world.enc.done = true; }
}
function completeQuest(qid) {
  const q = WD.quests[qid]; const st = qSt(qid); const c = C(); const payer = q.type === "deliver" ? q.to : q.giver; const chips = []; st.st = "done"; st.done = worldTime().day;
  c.items = c.items.filter(i => i.quest !== qid);
  const g = Math.round((q.reward?.gold || 0) * (st.bonus ? 1.5 : 1)); if (g) { c.gold += g; chips.push({ c: "gold", x: `+${g} зм` }); }
  const xp = Math.round((q.reward?.xp || 0) * (MODES[S.mode]?.xp || 1)); if (xp) { c.xp += xp; chips.push({ c: "xp", x: `+${xp} опыта` }); }
  [q.reward?.item, q.reward?.item2].filter(Boolean).forEach(it => { if (it.weapon) { const d = makeWeapon(it.weapon, mulberry(hash(qid)), { tier: "fine" }); giveWeapon(c, d); chips.push({ c: "item", x: `+ ${d.name}` }); } else { c.items.push({ name: it.name, desc: it.desc || "", ...(it.potion ? { potion: true, heal: it.heal || "2d4+2" } : {}) }); chips.push({ c: "item", x: `+ ${it.name}` }); } });
  [q.giver, payer].filter((v, i, a) => a.indexOf(v) === i).forEach(id => { const ns = S.world.npcs[id] || (S.world.npcs[id] = { att: 0, mem: [] }); ns.att = clamp(ns.att + 12, -100, 100); ns.mem.push(`герой выполнил поручение «${q.title}»`); chips.push({ c: "npc", x: `${NPCS[id].name}: +12 к отношению` }); });
  if (!q.road) addRep(3, "помог жителю");
  let help = ""; if (q.secret && NPCS[q.giver]?.secret) { help = ` В благодарность ${NPCS[q.giver].name} раскрывает то, что скрывал(а): ${NPCS[q.giver].secret} — отыграй это признание в реплике.`; S.world.facts.push(`${NPCS[q.giver].name} признался(-ась): ${str(NPCS[q.giver].secret, 140)}`); }
  else if (q.helps) { help = ` В благодарность НПС делится важным для главной тайны: ${q.helps}.`; S.world.facts.push(`От ${NPCS[q.giver].name}: ${str(q.helps, 140)}`); }
  if (q.reveal && POIS[q.reveal]) { S.world.rumors = S.world.rumors || []; if (!S.world.rumors.includes(q.reveal)) S.world.rumors.push(q.reveal); chips.push({ c: "gold", x: `Слух: ${POIS[q.reveal].name}` }); }
  if (q.road) { S.world.npcLoc = S.world.npcLoc || {}; }
  pushFeed({ t: "chips", items: chips }); setTimeout(() => sfx("fanfare", .7), 100); setTimeout(() => sfx("gold"), 500);
  S.pendingQNote = `Поручение «${q.title}» сдано ${NPCS[payer].name}. Награда УЖЕ выдана движком (${rewardText(q, st).join(", ").replace(/<[^>]+>/g, "")}) — не дублируй gold, items_add и xp.${help}`;
  takeTurn(q.type === "deliver" ? `Передаю ${NPCS[payer].name}: ${q.item.toLowerCase()}` : `${NPCS[payer].name}, твоё поручение выполнено: ${q.title.toLowerCase()}`, { checks: [], talk_to: payer });
}
function questNpcActs(npc) { const acts = []; const tin = questTurnInFor(npc); if (tin) acts.push({ t: tin.type === "deliver" ? `Передать: ${tin.item.toLowerCase()}` : `Сдать поручение`, fn: () => completeQuest(tin.id), dis: busy || S.world.combat });
  const of = questOfferFor(npc); if (of) acts.push({ t: qSt(of.id).st === "declined" ? "Вернуться к просьбе" : "Есть работа?", fn: () => openQuestOffer(of.id), dis: busy || S.world.combat }); return acts; }
function questBrief() {
  if (!WD.quests) return ""; const act = activeQuests(); const here = (POIS[S.world.loc].npcs || []).map(id => questOfferFor(id)).filter(Boolean); if (!act.length && !here.length) return "";
  return `ПОБОЧНЫЕ ПОРУЧЕНИЯ (их выдаёт и засчитывает движок; не выдавай за них gold/items_add/xp и не придумывай им итог сам):
${act.map(q => `- [${q.id}] «${q.title}» от ${NPCS[q.giver]?.name}: ${qSt(q.id).st === "ready" ? "ВЫПОЛНЕНО, ждёт сдачи" : "в работе — " + q.goal}${q.target && POIS[q.target] ? ` (место: ${POIS[q.target].name})` : ""}`).join("\n")}${here.length ? `\nУ НПС здесь есть просьба к герою (если разговор заходит о работе, помощи или заботах — пусть НПС сам намекнёт на неё; оформить поручение игрок может кнопкой «Есть работа?»): ${here.map(q => `${NPCS[q.giver].name} — ${q.title}`).join("; ")}` : ""}
`;
}
function sideQuestEffects(list) { (Array.isArray(list) ? list : []).slice(0, 3).forEach(x => { const q = WD.quests?.[x?.id]; if (!q) return; const st = qSt(q.id); if (st.st !== "active") return;
  if (x.status === "ready") { st.st = "ready"; pushFeed({ t: "chips", items: [{ c: "xp", x: `Поручение «${q.title}» выполнено — вернитесь к ${NPCS[q.giver]?.name}` }] }); } if (x.status === "failed") { st.st = "failed"; pushFeed({ t: "chips", items: [{ c: "dmg", x: `Поручение провалено: ${q.title}` }] }); } }); }
function questCardHTML() {
  const act = activeQuests().slice(0, 3);
  return `<div class="card q-card" style="background:transparent"><div class="eyebrow">Задание</div><p style="color:var(--foam);margin-top:4px">${esc(S.world.quest)}</p>
    ${act.length ? `<div class="q-mini">${act.map(q => { const st = qSt(q.id); const tgt = st.st === "ready" ? npcWhere(q.giver) : q.type === "deliver" ? npcWhere(q.to) : q.target; return `<button type="button" class="q-row${st.st === "ready" ? " ready" : ""}" data-qt="${tgt || ""}"><i>${st.st === "ready" ? "?" : "!"}</i><span><b>${esc(q.title)}</b><small>${st.st === "ready" ? `вернуться к ${esc(NPCS[q.giver]?.name || "")}` : esc(q.goal)}</small></span>${tgt && tgt !== hereOuter() ? ico("t_boots", 16) : ""}</button>`; }).join("")}</div>` : ""}</div>`;
}
function questJournalHTML() {
  const qs = allQuests().filter(q => qSt(q.id).st !== "new"); if (!qs.length) return `<p class="empty">Поручений пока нет. Поговорите с людьми — у многих есть заботы, а в пути встречаются те, кому нужна помощь.</p>`;
  const order = { ready: 0, active: 1, declined: 2, done: 3, failed: 4 }; const lab = { ready: ["выполнено — сдать", "ready"], active: ["в работе", "act"], declined: ["отложено", "dim"], done: ["завершено", "done"], failed: ["провалено", "fail"] };
  return `<div class="j-quests">${qs.sort((a, b) => order[qSt(a.id).st] - order[qSt(b.id).st]).map(q => { const st = qSt(q.id); const [l, cl] = lab[st.st]; const tgt = st.st === "ready" ? npcWhere(q.giver) : q.type === "deliver" ? npcWhere(q.to) : q.target;
    return `<article class="j-q ${cl}">${npcPh(q.giver)}<div><div class="j-qh"><b>${esc(q.title)}</b><span class="j-qs ${cl}">${l}</span></div><small>${esc(NPCS[q.giver]?.name || "")} · ${QTYPES[q.type] || ""}${q.road ? " · встреча в пути" : ""}</small><p>${esc(q.goal)}</p><div class="qo-rew sm">${rewardText(q, st).map(x => `<span>${x}</span>`).join("")}</div>${["active", "ready"].includes(st.st) && tgt && tgt !== hereOuter() ? `<button class="btn small" type="button" data-route="${tgt}">${ico("t_boots", 14)} Проложить путь</button>` : ""}</div></article>`; }).join("")}</div>`;
}
/* ---------- привал в дикой местности ---------- */
function campRest() {
  if (busy || S.world.combat) return; const p = POIS[S.world.loc]; const chance = .3 * (({ low: .6, mid: 1, high: 1.35 })[WD.danger] || 1) * (MODES[S.mode]?.enc || 1);
  if (Math.random() < chance) { passHours(3 + rnd(3)); pushFeed({ t: "sys", html: "<b>Ночь у костра прерывается.</b> Что-то приближается в темноте…" }); const t = worldTime(); t.part = 3; startEncounter(p.x, p.y, PACES.careful); return; }
  longRest(); pushFeed({ t: "sys", html: "Вы разбили лагерь вдали от людей. Ночь прошла спокойно." });
}
function encCardHTML() {
  const e = S.world.enc; if (e && !encDone() && e.loc === S.world.loc) return `<div class="card enc-mini"><span class="enc-mi">${ico(e.ico, 26)}</span><div><div class="eyebrow">Встреча в пути</div><b>${esc(e.title)}</b></div><button class="btn small primary" type="button" id="enc-open">Решить</button></div>`;
  const tr = S.world.trip; if (tr && !S.world.combat && (tr.dest ? POIS[tr.dest] : tr.tile)) return `<div class="card enc-mini trip"><span class="enc-mi">${ico("t_boots", 24)}</span><div><div class="eyebrow">Путь прерван</div><b>${tr.dest ? esc(POIS[tr.dest].name) : "к отмеченной точке"}</b></div><button class="btn small primary" type="button" id="trip-go">Продолжить</button></div>`;
  return "";
}
