/* КОМПАКТНЫЙ ДИАЛОГ: служебные кнопки в одну строку, поле ввода — только по «Сказать своё» */
{ const _rd = renderDlg; renderDlg = function () { _rd.apply(this, arguments); try { const el = document.getElementById("dlg"); const on = !!el && !el.hidden; document.body.classList.toggle("dlg-open", on); if (!on) { document.body.classList.remove("dlg-typing"); return; }
  const ol = el.querySelector(".dlg-opts"); if (!ol) return; el.querySelector(".dlg-foot")?.remove(); const foot = document.createElement("div"); foot.className = "dlg-foot";
  ol.querySelectorAll(".dlg-o.own, .dlg-o.recruit, .dlg-o.end").forEach(b => { const li = b.closest("li"); foot.append(b); if (li && !li.children.length) li.remove(); }); el.append(foot);
  foot.querySelectorAll(".dlg-tx").forEach(t => { t.textContent = t.textContent.replace("Позвать с собой в путь", "Позвать в путь").replace("Закончить разговор", "Закончить").replace(/^Позвать с собой$/, "Позвать в путь"); });
  if (matchMedia("(max-width: 600px)").matches) ol.querySelectorAll(".dlg-o").forEach(b => { const ck = b.querySelector(":scope > .dlg-ck"), tx = b.querySelector(".dlg-tx"); if (ck && tx) { ck.classList.add("inl"); tx.append(" ", ck); } });
  document.getElementById("npc-pop")?.classList.remove("show", "on", "open"); } catch (e) { console.error(e); } }; }
{ const _o = dlgOwn; dlgOwn = function () { document.body.classList.add("dlg-typing"); const r = _o.apply(this, arguments); document.getElementById("act-input")?.focus(); return r; }; }
document.addEventListener("submit", ev => { if (ev.target?.id === "act-form") document.body.classList.remove("dlg-typing"); }, true);
