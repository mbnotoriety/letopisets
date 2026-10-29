/* =========================================================================
   ИНТЕРФЕЙС 2026: спокойная главная, лист героя — выдвижная панель слева
   ========================================================================= */
/* ---------- главная без лозунгов ---------- */
{ const _rh = renderHome; renderHome = function () { const r = _rh.apply(this, arguments); try { homeV29(); } catch (e) { console.error(e); } return r; }; }
function homeV29() {
  const el = document.getElementById("home"); if (!el) return; const idx = campIndex(); const hero = el.querySelector("section.hero");
  if (hero) { const top = document.createElement("section"); top.className = "h2-top";
    top.innerHTML = `<div class="wrap"><div class="h2-brand"><h1>Летописец</h1><p>Текстовая ролевая игра с ИИ-рассказчиком. Механика D&amp;D 5e, любой сеттинг — от тёмного фэнтези до киберпанка. Пишите, что делает герой, а броски и правила считает движок.</p></div>
      <div class="h2-actions"><button class="btn primary" type="button" id="h-new">Новая кампания</button>${idx.length ? `<button class="btn" type="button" id="h-cont">Продолжить: ${esc(idx[0].hero)}</button>` : ""}</div></div>`;
    hero.replaceWith(top); top.querySelector("#h-new").onclick = newCampaign; top.querySelector("#h-cont")?.addEventListener("click", () => openCampaign(idx[0].id)); }
  const camps = el.querySelector("#camps-band"), how = el.querySelector("#how");
  if (camps) { const hd = camps.querySelector(".band-head"); const h2 = hd?.querySelector("h2"); hd?.querySelector(".eyebrow")?.remove(); if (h2) h2.textContent = "Кампании"; if (how && camps.compareDocumentPosition(how) & Node.DOCUMENT_POSITION_PRECEDING) how.before(camps); }
  if (how) how.innerHTML = `<div class="wrap"><div class="band-head"><div><h2>Как это работает</h2></div></div><div class="how">
    <article><h3>Мир</h3><p>Выберите сеттинг и окружение или опишите свой. Рассказчик придумает местность, тайну, жителей с секретами и особые классы этого мира. Карту и врагов строит движок.</p></article>
    <article><h3>Герой</h3><p>Раса, класс, характеристики, навыки и предыстория по правилам 5e. Портрет создаётся по вашему описанию.</p></article>
    <article><h3>Игра</h3><p>Пишите действия и реплики своими словами или выбирайте ответы в диалоге. Исход решает бросок кубика, мир запоминает ваши поступки.</p></article></div></div>`;
}
/* ---------- лист героя: выдвижная панель ---------- */
function sheetOpen(v) { const b = document.body; const on = v ?? !b.classList.contains("sheet-open"); b.classList.toggle("sheet-open", on); document.getElementById("btn-hero")?.setAttribute("aria-expanded", String(on)); }
function heroBtnHTML() { const c = S?.char; if (!c) return ""; const pct = Math.round(clamp(c.hp / Math.max(1, c.maxHp), 0, 1) * 100);
  return `<span class="hb-ava">${heroPh({ cls: c.cls, race: c.race, name: c.name, img: c.img })}</span><span class="hb-t"><b>${esc(c.name)}</b><small>${c.hp}/${c.maxHp} HP</small></span><span class="hb-bar"><i style="width:${pct}%" class="${pct <= 30 ? "lo" : pct <= 60 ? "mid" : ""}"></i></span>`; }
function heroBtnUpdate() { const b = document.getElementById("btn-hero"); if (b && S?.char) b.innerHTML = heroBtnHTML(); }
(function initUi29() {
  const nav = document.querySelector(".nav .wrap"); const sp = nav?.querySelector(".spacer");
  if (nav && sp && !document.getElementById("btn-hero")) { const b = document.createElement("button"); b.type = "button"; b.id = "btn-hero"; b.className = "hero-btn"; b.hidden = true; b.setAttribute("aria-controls", "sheet"); b.setAttribute("aria-expanded", "false"); b.title = "Лист героя, инвентарь и действия"; b.onclick = () => sheetOpen(); nav.insertBefore(b, nav.querySelector(".logo")?.nextSibling || sp); }
  const grid = document.querySelector("#screen-game .g-grid");
  if (grid && !document.getElementById("sheet-handle")) { const h = document.createElement("button"); h.type = "button"; h.id = "sheet-handle"; h.className = "sheet-handle"; h.setAttribute("aria-label", "Открыть лист героя"); h.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>`; h.onclick = () => sheetOpen(true); grid.append(h);
    const sc = document.createElement("div"); sc.className = "sheet-scrim"; sc.id = "sheet-scrim"; sc.onclick = () => sheetOpen(false); grid.append(sc);
    const x = document.createElement("button"); x.type = "button"; x.className = "sheet-close"; x.id = "sheet-close"; x.setAttribute("aria-label", "Закрыть лист героя"); x.innerHTML = "✕"; x.onclick = () => sheetOpen(false); document.getElementById("sheet")?.before(x); }
  document.addEventListener("keydown", e => { if (e.key === "Escape" && document.body.classList.contains("sheet-open")) { sheetOpen(false); e.stopPropagation(); } }, true);
})();
{ const _ss = showScreen; showScreen = function (id) { const r = _ss.apply(this, arguments); try { const g = id === "screen-game"; const b = document.getElementById("btn-hero"); if (b) b.hidden = !g; if (!g) sheetOpen(false); document.body.dataset.screen = id; } catch (e) {} return r; }; }
{ const _rs = renderSheet; renderSheet = function () { const r = _rs.apply(this, arguments); try { heroBtnUpdate(); } catch (e) {} return r; }; }
