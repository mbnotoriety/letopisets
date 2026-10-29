/* =========================================================================
   ЛЕНТА ИСТОРИИ: реплики с портретами, живые имена, заставки сцен, настроение
   ========================================================================= */
function feedNames() {
  const out = []; Object.entries(NPCS || {}).forEach(([id, n]) => { if (!n?.name) return; const full = n.name.trim(); const first = full.split(/\s+/).filter(w => w.length > 2 && !/^(сестра|брат|отец|мать|старый|старая|матушка|тётка|дядька|мастер)$/i.test(w))[0];
    out.push([full, id, "npc"]); if (first && first !== full) out.push([first, id, "npc"]); });
  Object.entries(POIS || {}).forEach(([id, p]) => { if (p?.name && p.name.length > 3 && !p.inner) out.push([p.name.replace(/[«»"]/g, ""), id, "place"]); });
  return out.sort((a, b) => b[0].length - a[0].length);
}
const RU_END = "(?:[а-яё]{0,3})";
function feedMark(html, seen) {
  const names = feedNames(); if (!names.length) return html;
  return html.split(/(<[^>]+>)/).map(part => { if (part.startsWith("<")) return part; let s = part;
    for (const [nm, id, kind] of names) { const key = kind + id; if (seen.has(key)) continue; const re = new RegExp(`(^|[^а-яёА-ЯЁa-z])(${nm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${RU_END})(?![а-яёА-ЯЁ])`, ""); const m = s.match(re); if (!m) continue;
      seen.add(key); const i = m.index + m[1].length; s = s.slice(0, i) + `\u0001${kind}\u0002${id}\u0003${m[2]}\u0004` + s.slice(i + m[2].length); }
    return s.replace(/\u0001(npc|place)\u0002([^\u0003]+)\u0003([^\u0004]+)\u0004/g, (_, k, id, t) => k === "npc" ? `<button type="button" class="ent npc" data-npc="${id}">${t}</button>` : `<span class="ent place" data-place="${id}">${t}</span>`); }).join("");
}
/* кто говорит в абзаце: ближайшее к реплике имя, иначе говорящий записи */
function paraSpeaker(p, fallback) {
  const q = p.indexOf("«"); if (q < 0) return null; let best = null, bd = 1e9;
  for (const [nm, id, kind] of feedNames()) { if (kind !== "npc") continue; const re = new RegExp(`(^|[^а-яёА-ЯЁ])${nm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${RU_END}(?![а-яёА-ЯЁ])`, "g"); let m; while ((m = re.exec(p))) { const d = Math.abs(m.index - q); if (d < bd) { bd = d; best = id; } } }
  return best || (fallback && NPCS[fallback] ? fallback : null);
}
function attCol(id) { const a = S?.world?.npcs?.[id]?.att || 0; return a >= 8 ? "#7cc79c" : a <= -8 ? "#e8735a" : "#72aed0"; }
narrHTML = function (text, e) {
  const seen = new Set(); const paras = String(text || "").split(/\n+/).map(p => p.trim()).filter(Boolean);
  return paras.map((raw, i) => { const sp = /«/.test(raw) && !/^[—–-]?\s*$/.test(raw) ? paraSpeaker(raw, e?.speaker) : null;
    let t = esc(raw).replace(/«([^»]{1,600})»/g, "<q>$1</q>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\*([^*]+)\*/g, "<i>$1</i>"); t = feedMark(t, seen);
    if (sp) { const n = NPCS[sp]; return `<div class="sp-line" style="--ac:${attCol(sp)}"><span class="sp-ava">${npcPh(sp)}</span><div class="sp-body"><span class="sp-name">${esc(n.name)}<small>${esc(n.role || "")}</small></span><p>${t}</p></div></div>`; }
    return `<p${i === 0 && e?.first ? ' class="lead-p"' : ""}>${t}</p>`; }).join("");
};
{ const _re = renderEntry; renderEntry = function (e, fresh) { const r = _re.apply(this, arguments); try { decorEntry(e); } catch (er) { console.error(er); } return r; }; }
{ const _un = updateNarr; updateNarr = function (e) { if (!e._el) return; const tx = e._el.querySelector(".tx"); if (e.speaker && NPCS[e.speaker] && !e._el.querySelector(".speaker")) e._el.insertAdjacentHTML("afterbegin", speakerHTML(e.speaker));
  tx.innerHTML = narrHTML(e.text, e) + (e.streaming ? '<span class="caret"></span>' : ""); decorEntry(e); const f = document.getElementById("feed"); if (f.scrollHeight - f.scrollTop - f.clientHeight < 220) f.scrollTop = f.scrollHeight; }; }
function decorEntry(e) {
  const d = e._el; if (!d) return;
  if (e.t === "narr") { const tx = d.querySelector(".tx"); if (tx && !tx.dataset.v2) { tx.dataset.v2 = 1; tx.innerHTML = narrHTML(e.text, e) + (e.streaming ? '<span class="caret"></span>' : ""); }
    d.classList.add("v2", "mood-" + (e.mood || "calm")); d.classList.toggle("has-lines", !!d.querySelector(".sp-line"));
    if (e.banner && !d.querySelector(".scene-banner")) d.insertAdjacentHTML("afterbegin", `<div class="scene-banner"><span class="sb-l"></span><b>${esc(e.banner.name)}</b><small>${esc(e.banner.sub)}</small><span class="sb-r"></span></div>`); }
  if (e.t === "player" && !d.dataset.v2) { d.dataset.v2 = 1; const speech = /[«"“]|^(говорю|спрашиваю|кричу|шепчу|отвечаю|прошу|предлагаю|говорит)/i.test(e.text); d.classList.add(speech ? "say" : "act");
    const c = C(); d.innerHTML = `<div class="who-s">${speech ? "Вы говорите" : "Вы действуете"}</div><div class="pl-tx">${esc(e.text)}</div><span class="pl-ava">${heroPh({ cls: c.cls, race: c.race, name: c.name, img: c.img })}</span>`; }
}
/* настроение и заставка сцены записываются в момент рассказа */
{ const _pf = pushFeed; pushFeed = function (e) {
  try { if (e?.t === "narr" && S) { const w = S.world; e.mood = w.combat ? "fight" : (w.threat || 0) >= 4 ? "dread" : worldTime().part === 3 ? "night" : "calm";
    const loc = w.loc, part = worldTime().part; const last = [...S.feed].reverse().find(x => x.t === "narr" && x.loc); e.loc = loc; e.part = part;
    if (!last || last.loc !== loc || last.part !== part) { const p = POIS[loc]; let wn = ""; try { wn = weatherNow().name.toLowerCase(); } catch (er) {} e.banner = { name: p?.name || "", sub: `${DAY_PARTS[part]} · день ${worldTime().day}${wn ? " · " + wn : ""}` }; } } } catch (er) { console.error(er); }
  return _pf.apply(this, arguments); }; }
document.addEventListener("click", ev => { const b = ev.target.closest?.(".ent.npc"); if (b && b.dataset.npc && typeof popNPC === "function") { ev.preventDefault(); popNPC(b.dataset.npc); } });
