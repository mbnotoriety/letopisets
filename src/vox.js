/* =========================================================================
   ГОЛОСА ПЕРСОНАЖЕЙ: короткие эмоции без слов (вздох, «хм», смешок, ах…)
   как в BG3/Zelda/Pillars — реакция на начало разговора, исход проверки и тон сцены
   ========================================================================= */
const VOX = /*VOX_MANIFEST*/{};
const VOX_FALLBACK = { huh: ["hmm", "pleased"], hmm: ["huh", "sigh"], pleased: ["laugh", "huh"], laugh: ["pleased"], fear: ["gasp", "sigh"], gasp: ["fear", "huh"], angry: ["sigh", "hmm"], sigh: ["hmm"] };
const VOX_RU = { hmm: "задумчиво хмыкает", huh: "отзывается", sigh: "вздыхает", laugh: "смеётся", pleased: "оживляется", gasp: "ахает", angry: "раздражённо фыркает", fear: "испуганно вздрагивает" };
let voxLast = 0; const voxNpcLast = {};
function voxOf(id) {
  const n = NPCS?.[id]; if (!n) return null; const g = isFem(n) ? "f" : "m"; const h = hash(id + "#vox");
  let rate = 1 + ((h % 9) - 4) * .012; if (n.age === "old") rate -= .07; else if (n.age === "young") rate += .05;
  if (/дитя|ребён|мальчиш|девочк|юнг|подмастер/i.test(n.role || "")) rate += .1;
  return { g, rate: clamp(rate, .84, 1.18), h };
}
function voxFile(g, emo, h) {
  const tried = [emo, ...(VOX_FALLBACK[emo] || [])];
  for (const e of tried) { const list = VOX[g]?.[e]; if (list?.length) return list[(h + e.length) % list.length]; }
  return null;
}
function voxOn() { return AU.cfg.on && (AU.cfg.vox ?? .8) > 0 && AU.unlocked; }
function vox(id, emo, opts = {}) {
  if (!S || !voxOn() || !emo) return false; const v = voxOf(id); if (!v) return false; const now = Date.now();
  if (!opts.force && (now - voxLast < 1600 || now - (voxNpcLast[id] || 0) < 3500)) return false;
  const f = voxFile(v.g, emo, v.h + (opts.alt ? 1 : 0)); if (!f) return false; voxLast = now; voxNpcLast[id] = now;
  const play = () => { try { let base = AU.pool.get(f); if (!base) { base = new Audio(auSrc(f)); base.preload = "auto"; AU.pool.set(f, base); }
    const el = base.paused && base.currentTime === 0 ? base : base.cloneNode(); el.preservesPitch = false; el.mozPreservesPitch = false; el.webkitPreservesPitch = false; el.playbackRate = v.rate;
    el.volume = clamp((AU.cfg.vox ?? .8) * (opts.vol || 1), 0, 1); el.currentTime = 0; el.play().catch(() => {}); voxPulse(id); } catch (e) {} };
  opts.delay ? setTimeout(play, opts.delay) : play(); return true;
}
function voxPulse(id) { document.querySelectorAll(`#dlg .dlg-ph, .e-narr[data-speaker="${id}"] .speaker .ph`).forEach(el => { el.classList.remove("vox-speak"); void el.offsetWidth; el.classList.add("vox-speak"); setTimeout(() => el.classList.remove("vox-speak"), 900); }); }
/* эмоция при начале разговора — по отношению к герою */
function voxGreet(id) { const a = S.world.npcs[id]?.att || 0; const st = S.world.npcs[id] || {}; if (S.world.hostile?.[id]) return "angry"; if (st.scared || (S.world.ko && S.world.ko[id])) return "fear";
  return a <= -25 ? "angry" : a <= -8 ? "hmm" : a < 8 ? "huh" : a < 25 ? "pleased" : "laugh"; }
/* эмоция из текста рассказчика: первая по порядку описанная реакция */
const VOX_CUES = [
  ["laugh", /(смеётся|смеется|рассмеял|засмеял|хохоч|хохот|хихик|прыснул|смешок|усмехается|усмехнул|хмыкает весело)/i],
  ["sigh", /(вздыха|вздохнул|вздох|устало|тяжело опуска|сокрушённо|печально|грустно|с горечью)/i],
  ["gasp", /(ахает|ахнул|охает|охнул|вскрикивает|вскрикнул|изумлённо|удивлённо|ошеломл|округлил глаза|отшатнул)/i],
  ["fear", /(дрожит|дрожащим|задрожал|побледнел|испуган|в страхе|боязливо|запинаясь|заикаясь|съёжил|сжался)/i],
  ["angry", /(фыркает|фыркнул|рявкает|рявкнул|злобно|зло |сердито|раздражённо|раздраженно|нахмурил|хмурится|сплёвывает|сплевывает|скрипит зубами|сжимает кулак|гневно|огрызается|огрызнул|цедит)/i],
  ["hmm", /(задумчиво|задумывается|задумался|прищурил|щурится|почёсывает|почесал|колеблется|сомневается|недоверчиво|медлит с ответом|хм[,.…!?\s])/i],
  ["pleased", /(просиял|оживляется|оживился|улыбается|улыбнул|тепло|радостно|довольно|с облегчением|кивает)/i]
];
function voxFromText(t) { const s = String(t || ""); let best = null, pos = 1e9; for (const [emo, re] of VOX_CUES) { const m = s.match(re); if (m && m.index < pos) { pos = m.index; best = emo; } } return best; }
function voxFromResults(results, npc) {
  const ck = (results || []).find(r => r.kind === "skill" && ["persuasion", "deception", "intimidation", "performance", "insight"].includes(r.skill)); if (!ck) return null;
  if (ck.skill === "intimidation") return ck.ok ? "fear" : "laugh"; if (ck.skill === "deception") return ck.ok ? "huh" : "angry"; if (ck.skill === "performance") return ck.ok ? "laugh" : "sigh";
  if (ck.skill === "insight") return null; return ck.ok ? "pleased" : (ck.fumble ? "angry" : "sigh");
}
let voxTurn = null;
/* ---------- обёртки ---------- */
{ const _ds = dlgStart; dlgStart = function (id) { try { if (NPCS[id] && !busy && S?.dialogue?.npc !== id) vox(id, voxGreet(id), { delay: 120 }); } catch (e) {} return _ds.apply(this, arguments); }; }
{ const _na = npcAfterTurn; npcAfterTurn = function (results) { try { voxTurn = results || null; } catch (e) {} return _na.apply(this, arguments); }; }
const VOX_EMOS = ["hmm", "huh", "sigh", "laugh", "pleased", "gasp", "angry", "fear"];
function voxPick(eff, sp) { const v = String(eff?.voice || "").toLowerCase().trim(); if (VOX_EMOS.includes(v)) return v;
  const last = S.feed.filter(e => e.t === "narr").slice(-1)[0]; const att = Number(eff?.attitude?.[sp]) || 0;
  return voxFromText(last?.text) || voxFromResults(voxTurn, sp) || (att >= 5 ? "pleased" : att <= -5 ? "angry" : null) || voxGreet(sp); }
/* реакция говорящего на каждую реплику: эмоцию выбирает рассказчик (поле voice), иначе — по тексту, проверке, отношению */
{ const _ae = applyEffects; applyEffects = function (eff) { const r = _ae.apply(this, arguments); try { const sp = eff?.speaker; if (sp && NPCS[sp] && (POIS[S.world.loc]?.npcs || []).includes(sp)) vox(sp, voxPick(eff, sp), { delay: 250 }); voxTurn = null; } catch (e) { console.error(e); } return r; }; }
/* начало любого разговора (клик, поручение, свой текст) — сразу приветственный звук, если NPC давно молчал */
{ const _pf = pushFeed; pushFeed = function (e) { const r = _pf.apply(this, arguments); try { const sp = e?.t === "narr" && e.streaming && e.speaker; if (sp && NPCS[sp] && S.dialogue?.npc !== sp && Date.now() - (voxNpcLast[sp] || 0) > 20000) vox(sp, voxGreet(sp), { delay: 80 }); } catch (er) {} return r; }; }
{ const _ca = compApprove; compApprove = function (id, d) { const r = _ca.apply(this, arguments); try { if (d) vox(id, d >= 4 ? "laugh" : d > 0 ? "pleased" : d <= -4 ? "angry" : "sigh", { delay: 200 }); } catch (e) {} return r; }; }
{ const _ha = heroAssault; heroAssault = function (nid) { try { vox(nid, "gasp", { force: true }); } catch (e) {} return _ha.apply(this, arguments); }; }
{ const _cj = compJoin; compJoin = function (id) { try { vox(id, "pleased", { force: true, delay: 300 }); } catch (e) {} return _cj.apply(this, arguments); }; }
function voxPreview() { const all = [...(VOX.f?.laugh || []), ...(VOX.m?.huh || []), ...(VOX.f?.pleased || [])]; if (!all.length || !AU.cfg.on) return; const f = all[Math.floor(Math.random() * all.length)]; const el = new Audio(auSrc(f)); el.volume = clamp(AU.cfg.vox ?? .8, 0, 1); el.play().catch(() => {}); }
