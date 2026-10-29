/* =========================================================================
   ДИАЛОГИ: варианты реплик с проверками навыков (в духе BG3)
   ========================================================================= */
const DLG_SKILLS = ["persuasion", "deception", "intimidation", "insight", "performance", "investigation", "history", "arcana", "religion", "medicine", "nature", "survival", "perception", "sleight", "athletics"];
const DLG_TONE = { persuasion: "soc", performance: "soc", deception: "trick", sleight: "trick", intimidation: "threat", athletics: "threat", insight: "mind", perception: "mind", investigation: "lore", history: "lore", arcana: "lore", religion: "lore", nature: "lore", medicine: "lore", survival: "lore" };
const DLG_SOCIAL = new Set(["persuasion", "deception", "performance"]);
function dlgNpcOk(id) { return !!(id && NPCS[id] && S?.world && POIS[S.world.loc]?.npcs.includes(id) && !npcGone(id)); }
function dlgDC(o, npc) {
  let dc = o.dc; const notes = [];
  if (DLG_SOCIAL.has(o.skill)) { const a = S.world.npcs[npc]?.att || 0; const d = a >= 25 ? -3 : a >= 8 ? -2 : a <= -25 ? 4 : a <= -8 ? 2 : 0; if (d) { dc += d; notes.push(`${d > 0 ? "+" : "−"}${Math.abs(d)} к КС: ${attLabel(a)[0]}`); } }
  const f = S.world.npcs[npc]?.dlgFail?.[o.skill] || 0; if (f) { dc += 2 * f; notes.push(`+${2 * f} к КС: уже не вышло`); }
  return { dc: clamp(dc, 5, 25), notes };
}
function dlgChance(skill, dc) { const b = skillBonus(skill); const adv = skillAdv(skill); const p = clamp((21 - (dc - b)) / 20, .05, 1); return adv > 0 ? 1 - (1 - p) ** 2 : p; }
const DLG_CLASS = {
  wizard: ["arcana", "Здесь пахнет чарами. Что ты об этом знаешь?", 13], sorcerer: ["arcana", "Магия во мне чует неладное. Кто здесь колдует?", 13],
  warlock: ["intimidation", "Мой покровитель не любит, когда ему лгут.", 14], cleric: ["religion", "Боги видят всё. Облегчи душу — скажи правду.", 13],
  paladin: ["persuasion", "Клянусь честью: твоя тайна не обернётся против тебя.", 13], rogue: ["deception", "Меня прислали проверить, всё ли тут в порядке.", 14],
  bard: ["performance", "Давай так: я спою тебе, а ты расскажешь мне.", 12], barbarian: ["intimidation", "Говори. Второй раз спрашивать не буду.", 13],
  fighter: ["intimidation", "Я видел(а) войну. Не заставляй меня злиться.", 13], ranger: ["survival", "Я видел(а) следы у дороги. Чьи они?", 12],
  druid: ["nature", "Звери здесь притихли. Ты знаешь почему?", 12], monk: ["insight", "Твои руки дрожат. Чего ты боишься?", 13]
};
const DLG_SOC_LINE = { persuasion: ["Мне можно доверять. Помоги — и я помогу тебе.", 13], deception: ["Я здесь по поручению властей. Отвечай.", 14], intimidation: ["Лучше скажи сразу, пока я прошу по-хорошему.", 13], performance: ["Расскажу тебе историю — а ты мне свою.", 12] };
function dlgFallback(npc) {
  const c = C(); const n = NPCS[npc]; const out = []; const used = new Set();
  out.push({ text: n?.secret && (S.world.npcs[npc]?.att || 0) >= 8 ? "Ты ведь что-то знаешь. Поделишься?" : "Что здесь происходит? Расскажи.", skill: null, dc: 0, tag: null });
  const soc = ["persuasion", "deception", "intimidation", "performance"].sort((a, b) => skillBonus(b) - skillBonus(a))[0];
  const cl = DLG_CLASS[c.cls]; const fem = c.gender === "f"; const fx = t => t.replace(/\(а\)/g, fem ? "а" : "");
  if (cl && SKILLS[cl[0]]) { out.push({ text: fx(cl[1]), skill: cl[0], dc: cl[2], tag: CLASSES[c.cls].name }); used.add(cl[0]); }
  if (!used.has(soc)) { out.push({ text: DLG_SOC_LINE[soc][0], skill: soc, dc: DLG_SOC_LINE[soc][1], tag: c.skills.includes(soc) ? (BACKGROUNDS[c.bg]?.skills?.includes(soc) ? BACKGROUNDS[c.bg].name : null) : null }); used.add(soc); }
  if (!used.has("insight")) out.push({ text: "(Присмотреться: говорит ли он(а) правду?)".replace("он(а)", isFem(n) ? "она" : "он"), skill: "insight", dc: 13, tag: null });
  if (out.length < 4) out.splice(1, 0, { text: "Расскажи о себе. Давно ты здесь?", skill: null, dc: 0, tag: null });
  return out.slice(0, 4);
}
function dlgParse(list) {
  return (Array.isArray(list) ? list : []).map(o => { const text = str(typeof o === "string" ? o : o?.text, 120).replace(/^[«"“]|[»"”]$/g, ""); const sk = typeof o === "object" && DLG_SKILLS.includes(o?.skill) && SKILLS[o.skill] ? o.skill : null; let tag = str(o?.tag, 24); if (/^(null|нет|-)$/i.test(tag)) tag = "";
    return { text, skill: sk, dc: clamp(Math.round(Number(o?.dc) || 13), 8, 22), tag: sk || tag ? (tag || null) : null }; }).filter(o => o.text).slice(0, 4);
}
function dlgEffects(eff) {
  const sp = eff?.speaker; const want = S.dlgPending; S.dlgPending = null;
  if (S.world.combat || S.dead || S.dying || !dlgNpcOk(sp)) { S.dialogue = null; return; }
  let opts = dlgParse(eff.dialogue);
  if (!opts.length && (want === sp || S.dialogue?.npc === sp)) opts = dlgFallback(sp);
  if (!opts.length) { S.dialogue = null; return; }
  S.dialogue = { npc: sp, opts, n: S.dialogue?.npc === sp ? (S.dialogue.n || 0) + 1 : 1 };
}
function dlgStart(id) {
  const n = NPCS[id]; if (!n || busy || S.dead) return; showTab("story");
  if (S.dialogue?.npc === id) { renderDlg(); document.querySelector("#dlg .dlg-o")?.focus(); return; }
  S.dlgPending = id; takeTurn(`Подхожу и заговариваю: ${n.name}`, { checks: [], talk_to: id });
}
function dlgEnd(silent) { if (!S?.dialogue) return; const n = NPCS[S.dialogue.npc]; S.dialogue = null; if (!silent && n) pushFeed({ t: "sys", html: `Вы заканчиваете разговор: <b>${esc(n.name)}</b>.` }); renderSugg(); save(); }
function dlgPick(i) {
  const d = S?.dialogue; const o = d?.opts?.[i]; if (!o || busy || S.dead) return; const n = NPCS[d.npc]; if (!dlgNpcOk(d.npc)) { dlgEnd(true); return; }
  S.dlgPending = d.npc; S.dlgLast = o.skill ? { npc: d.npc, skill: o.skill } : null;
  const isAct = /^\(.*\)$/.test(o.text); const line = isAct ? o.text.slice(1, -1) : `«${o.text}»`;
  S.pendingQNote = `Герой ${isAct ? "делает это в разговоре" : "говорит это"} — собеседник: ${n.name} (id ${d.npc}). Сыграй ответ ${n.name} живой репликой с учётом ${o.skill ? "результата проверки (" + SKILLS[o.skill][0] + ")" : "характера и отношения к герою"}; ${o.skill ? "при успехе дай ощутимую пользу (сведения, уступку, доверие), при провале — последствие (раздражение, подозрение, ложный след)" : "продвинь разговор"}.`;
  const ch = o.skill ? [{ kind: "skill", skill: o.skill, dc: dlgDC(o, d.npc).dc, reason: `Реплика${o.tag ? " · " + o.tag : ""}` }] : [];
  takeTurn(line, { checks: ch, talk_to: d.npc });
}
function dlgOwn() { const d = S?.dialogue; if (!d) return; const inp = document.getElementById("act-input"); inp.value = `${NPCS[d.npc].name}, `; inp.focus(); S.dlgPending = d.npc; }
function renderDlg() {
  const el = document.getElementById("dlg"); if (!el || !S) return; const d = S.dialogue;
  const on = !!d && !S.world.combat && !S.dead && !S.dying && dlgNpcOk(d.npc);
  document.getElementById("sugg")?.classList.toggle("dlg-on", on);
  if (!on) { if (d && (S.world.combat || !dlgNpcOk(d.npc))) S.dialogue = null; el.hidden = true; el.innerHTML = ""; return; }
  const n = NPCS[d.npc]; const [lab, cl] = attLabel(S.world.npcs[d.npc]?.att || 0);
  const opts = d.opts.map((o, i) => {
    let ck = ""; if (o.skill) { const { dc, notes } = dlgDC(o, d.npc); const p = Math.round(dlgChance(o.skill, dc) * 100); const pc = p >= 70 ? "hi" : p >= 40 ? "mid" : "lo";
      ck = `<span class="dlg-ck" title="${esc(["Бросок d20 " + fmt(skillBonus(o.skill)) + " против КС " + dc, ...notes].join(" · "))}"><i>${esc(SKILLS[o.skill][0])}</i><span>КС ${dc}</span><b class="${pc}">${p}%</b></span>`; }
    const act = /^\(.*\)$/.test(o.text);
    return `<li><button type="button" class="dlg-o t-${o.skill ? DLG_TONE[o.skill] || "soc" : "plain"}" data-i="${i}" ${busy ? "disabled" : ""}><span class="dlg-n">${i + 1}</span><span class="dlg-tx">${o.tag ? `<em class="dlg-tag">${esc(o.tag)}</em>` : ""}${act ? `<span class="dlg-act">${esc(o.text.slice(1, -1))}</span>` : esc(o.text)}</span>${ck}</button></li>`;
  }).join("");
  el.innerHTML = `<div class="dlg-head">${npcPh(d.npc, "dlg-ph")}<div class="dlg-who"><b>${esc(n.name)}</b><small>${esc(n.role || "")} · <span class="att ${cl}">${lab}</span></small></div><button type="button" class="dlg-x" title="Закончить разговор (Esc)" aria-label="Закончить разговор">✕</button></div>
  <ol class="dlg-opts">${opts}<li><button type="button" class="dlg-o own" ${busy ? "disabled" : ""}><span class="dlg-n">✎</span><span class="dlg-tx">Сказать своё…</span></button></li><li><button type="button" class="dlg-o end" ${busy ? "disabled" : ""}><span class="dlg-n">0</span><span class="dlg-tx">Закончить разговор</span></button></li></ol>`;
  el.hidden = false;
  el.querySelectorAll(".dlg-o[data-i]").forEach(b => b.onclick = () => dlgPick(+b.dataset.i));
  el.querySelector(".dlg-o.own").onclick = dlgOwn; el.querySelector(".dlg-o.end").onclick = () => dlgEnd(); el.querySelector(".dlg-x").onclick = () => dlgEnd();
}
function dlgBrief() { const d = S?.dialogue; if (!d || !NPCS[d.npc]) return ""; return `\nИдёт разговор с ${NPCS[d.npc].name} (реплика ${d.n || 1}).`; }
/* обёртки */
{ const _ae = applyEffects; applyEffects = function (eff) { _ae.apply(this, arguments); try { dlgEffects(eff || {}); } catch (e) { console.error(e); } }; }
{ const _rs = renderSugg; renderSugg = function () { _rs.apply(this, arguments); try { renderDlg(); } catch (e) { console.error(e); } }; }
{ const _na = npcAfterTurn; npcAfterTurn = function (results) { const r = _na.apply(this, arguments); try { const L = S.dlgLast; S.dlgLast = null;
  if (L) { const ck = (results || []).find(x => x.kind === "skill" && x.skill === L.skill); if (ck && !ck.ok) { const st = S.world.npcs[L.npc] || (S.world.npcs[L.npc] = { att: 0, mem: [] }); st.dlgFail = st.dlgFail || {}; st.dlgFail[L.skill] = Math.min(3, (st.dlgFail[L.skill] || 0) + 1); } } } catch (e) {} return r; }; }
{ const _pn = popNPC; popNPC = function (id) { if (S?.dlgPending === id || S?.dialogue?.npc === id) return; return _pn.apply(this, arguments); }; }
{ const _mt = moveTo; moveTo = function () { if (S) S.dialogue = null; return _mt.apply(this, arguments); }; }
document.addEventListener("keydown", e => {
  if (e.ctrlKey || e.metaKey || e.altKey || !S?.dialogue || S.world.combat) return; const tag = document.activeElement?.tagName; if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
  const mr = document.getElementById("modal-root"); if (mr && mr.innerHTML.trim()) return; if (document.getElementById("screen-game").hidden || document.getElementById("dlg")?.hidden) return;
  if (/^[1-9]$/.test(e.key)) { const b = document.querySelectorAll("#dlg .dlg-o[data-i]")[+e.key - 1]; if (b && !b.disabled) { e.preventDefault(); b.click(); } }
  else if (e.key === "0" || e.key === "Escape") { e.preventDefault(); dlgEnd(); }
});
{ const _rd = renderDlg; renderDlg = function () { _rd.apply(this, arguments); const on = !document.getElementById("dlg")?.hidden; document.body.classList.toggle("dlg-on", on); if (!on) document.body.classList.remove("dlg-typing"); }; }
{ const _ow = dlgOwn; dlgOwn = function () { document.body.classList.add("dlg-typing"); _ow.apply(this, arguments); }; }
{ const mq = matchMedia("(max-width: 600px)"); const ph = () => { const i = document.getElementById("act-input"); if (i) i.placeholder = mq.matches ? "Что вы делаете?" : "Что вы делаете? Можно всё: действие, реплику, план…"; }; ph(); mq.addEventListener?.("change", ph); }
