/* =========================================================================
   ПОМЕТКИ НА ПОЛЯХ: опыт, предметы, угроза, отношение — рядом с ходом, а не в ленте
   ========================================================================= */
const NOTE_KIND = { xp: "Опыт", item: "Вещи", heal: "Здоровье", dmg: "Урон", gold: "Деньги", npc: "Люди", "appr-up": "Спутник", "appr-dn": "Спутник" };
function noteHost(chipsEl) {
  let p = chipsEl.previousElementSibling;
  while (p) { if (p.classList.contains("e-narr")) return p; if (p.classList.contains("e-player") || p.classList.contains("e-levelup") || p.classList.contains("e-victory")) return null; p = p.previousElementSibling; }
  return null;
}
function noteItemHTML(i) { return `<li class="nt ${esc(i.c || "")}"><span>${esc(String(i.x).replace(/^(?:[▲▼]\s*|\+\s+)/, ""))}</span></li>`; }
{ const _re = renderEntry; renderEntry = function (e, fresh) { const r = _re.apply(this, arguments);
  try { if (e.t === "chips" && e._el) { const d = e._el; const host = noteHost(d);
      if (host) { let box = host.querySelector(":scope > .e-notes"); if (!box) { box = document.createElement("ul"); box.className = "e-notes"; box.setAttribute("aria-label", "Что изменилось"); host.append(box); }
        box.insertAdjacentHTML("beforeend", e.items.map(noteItemHTML).join("")); if (fresh) box.lastElementChild?.classList.add("new"); d.classList.add("moved"); }
      else d.classList.add("chips-inline"); } } catch (er) { console.error(er); }
  return r; }; }
/* заставка сцены человеческим языком: «Утро первого дня, ясно» */
const DAY_ORD = ["первого", "второго", "третьего", "четвёртого", "пятого", "шестого", "седьмого", "восьмого", "девятого", "десятого"];
function bannerWhen(sub) { const parts = String(sub || "").split(" · "); const part = parts[0] || ""; const m = /день (\d+)/.exec(parts[1] || ""); const day = m ? +m[1] : 0; const w = parts[2] || "";
  const d = day ? (DAY_ORD[day - 1] ? `${DAY_ORD[day - 1]} дня` : `дня ${day}`) : ""; return `${part ? part[0].toUpperCase() + part.slice(1) : ""}${d ? " " + d : ""}${w ? ", " + w : ""}`; }
{ const _de = decorEntry; decorEntry = function (e) { const r = _de.apply(this, arguments); try { const d = e._el; if (e.t === "narr" && d && e.banner) { d.classList.add("has-banner"); const sm = d.querySelector(".scene-banner small"); if (sm && !sm.dataset.h) { sm.dataset.h = 1; sm.textContent = bannerWhen(e.banner.sub); } } } catch (er) { console.error(er); } return r; }; }
