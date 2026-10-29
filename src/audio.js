/* =========================================================================
   ЗВУК: музыка по настроению, фон, эффекты
   Музыка и звуки — Battle for Wesnoth (GPL v2+); «Three Sheets» — Scott Buckley (CC BY-SA 4.0)
   ========================================================================= */
const AU_KEY = "sh6-audio";
const MUSIC = {
  menu: ["legends_of_the_north", "wanderer"], explore: ["wanderer", "knolls", "legends_of_the_north"], forest: ["silvan_sanctuary", "wanderer"], tavern: ["three-sheets", "traveling_minstrels"],
  sacred: ["nunc_dimittis"], deep: ["underground", "the_deep_path", "into_the_shadows"], night: ["into_the_shadows", "the_deep_path", "silvan_sanctuary"], tension: ["suspense", "into_the_shadows"],
  battle: ["battle-epic", "frantic", "heroes_rite"], defeat: ["sad"]
};
const AMB = { campfire: "a-campfire", ship: "a-ship", birds: "a-birds1", night: "a-night" };
const SFX = {
  tap: ["s-button"], pick: ["s-select"], open: ["s-expand"], close: ["s-contract"], step: ["s-checkbox"], arrive: ["s-arrive"], bell: ["s-bell"], start: ["s-gamestart"],
  sword: ["s-sword-1"], mace: ["s-mace"], staff: ["s-staff"], bow: ["s-bow"], dagger: ["s-dagger-swish"], axe: ["s-axe"], miss: ["s-miss-1", "s-miss-2"],
  hurt: ["s-human-hit-1", "s-human-hit-2"], die: ["s-human-die-1"], heal: ["s-heal"], potion: ["s-potion"], gold: ["s-gold"], chest: ["s-open-chest"], throw: ["s-throw-1"],
  fire: ["s-fire"], lightning: ["s-lightning"], holy: ["s-magic-holy-1"], dark: ["s-magic-dark"], missile: ["s-magic-missile-1"], fanfare: ["s-fanfare-short"],
  horn: ["s-horn-2"], growl: ["s-wolf-growl-1"], rumble: ["s-rumble"], victory: ["m-victory2"], defeat: ["m-sad"]
};
const AU = { cfg: Object.assign({ on: true, music: .45, sfx: .7, amb: .4 }, lsGet(AU_KEY) || {}), unlocked: false, mood: null, track: null, a: null, b: null, cur: null, amb: null, ambKey: null, pool: new Map(), ctx: null, fades: new Set(), duck: 1 };
const auSrc = n => `audio/${n}.mp3`;
function auSave() { lsSet(AU_KEY, AU.cfg); }
function auFade(el, to, ms, done) {
  if (!el) return; const from = el.volume; const t0 = performance.now(); const tok = {}; el._fade = tok;
  const step = () => { if (el._fade !== tok) return; const k = Math.min(1, (performance.now() - t0) / ms); el.volume = clamp(from + (to - from) * k, 0, 1); if (k < 1) requestAnimationFrame(step); else done?.(); };
  requestAnimationFrame(step);
}
function auMusicVol() { return AU.cfg.on ? AU.cfg.music * AU.duck : 0; }
function auPlayTrack(name) {
  const el = new Audio(auSrc("m-" + name)); el.preload = "auto"; el.volume = 0; AU.track = name;
  el.addEventListener("ended", () => { if (AU.cur === el) auNext(); }); el.addEventListener("error", () => { if (AU.cur === el) AU.cur = null; });
  const old = AU.cur; AU.cur = el; el.play().then(() => auFade(el, auMusicVol(), 2200)).catch(() => {});
  if (old) auFade(old, 0, 1800, () => { old.pause(); old.src = ""; });
}
function auNext() { const list = MUSIC[AU.mood] || MUSIC.explore; const opts = list.filter(t => t !== AU.track); auPlayTrack((opts.length ? opts : list)[Math.floor(Math.random() * (opts.length || list.length))]); }
function setMood(m) {
  if (!m || !MUSIC[m]) return; if (AU.mood === m && AU.cur) return; AU.mood = m;
  if (!AU.unlocked || !AU.cfg.on || AU.cfg.music <= 0) return; if (AU.cur && MUSIC[m].includes(AU.track)) return; auNext();
}
function setAmbience(k) {
  const key = AMB[k] ? k : null; if (AU.ambKey === key && (AU.amb || !key)) return; AU.ambKey = key;
  const old = AU.amb; AU.amb = null; if (old) auFade(old, 0, 1500, () => { old.pause(); old.src = ""; });
  if (!key || !AU.unlocked || !AU.cfg.on || AU.cfg.amb <= 0) return;
  const el = new Audio(auSrc(AMB[key])); el.loop = true; el.volume = 0; AU.amb = el; el.play().then(() => auFade(el, AU.cfg.amb * .6, 2000)).catch(() => {});
}
function sfx(name, vol = 1) {
  if (!AU.cfg.on || AU.cfg.sfx <= 0 || !AU.unlocked) return; if (name === "dice") return auDice(); if (name === "chime") return auChime(true); if (name === "thud") return auChime(false);
  const list = SFX[name]; if (!list) return; const f = list[Math.floor(Math.random() * list.length)];
  let base = AU.pool.get(f); if (!base) { base = new Audio(auSrc(f)); base.preload = "auto"; AU.pool.set(f, base); }
  const el = base.paused && base.currentTime === 0 ? base : base.cloneNode(); const quiet = { tap: .25, pick: .35, step: .3, open: .35, close: .3 }[name] ?? 1;
  el.volume = clamp(AU.cfg.sfx * vol * quiet, 0, 1); el.currentTime = 0; el.play().catch(() => {});
  if (name === "victory" || name === "defeat" || name === "fanfare" || name === "horn") { AU.duck = .35; if (AU.cur) auFade(AU.cur, auMusicVol(), 300); setTimeout(() => { AU.duck = 1; if (AU.cur) auFade(AU.cur, auMusicVol(), 1600); }, name === "victory" ? 6000 : 2600); }
}
function auCtx() { if (!AU.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AU.ctx = new C(); } if (AU.ctx.state === "suspended") AU.ctx.resume(); return AU.ctx; }
/* кубики: несколько коротких ударов о дерево с затуханием */
function auDice() {
  const ctx = auCtx(); if (!ctx) return; const t0 = ctx.currentTime + .02; const out = ctx.createGain(); out.gain.value = AU.cfg.sfx * .9; out.connect(ctx.destination);
  const buf = ctx.createBuffer(1, ctx.sampleRate * .05, ctx.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  let t = t0; const hits = 7 + Math.floor(Math.random() * 4);
  for (let i = 0; i < hits; i++) {
    const src = ctx.createBufferSource(); src.buffer = buf; src.playbackRate.value = .7 + Math.random() * .8;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1800 + Math.random() * 2600; bp.Q.value = 3 + Math.random() * 4;
    const g = ctx.createGain(); g.gain.value = (1 - i / hits) * (.6 + Math.random() * .5); src.connect(bp); bp.connect(g); g.connect(out); src.start(t);
    const body = ctx.createOscillator(); body.type = "triangle"; body.frequency.value = 180 + Math.random() * 120; const bg = ctx.createGain(); bg.gain.setValueAtTime(.18 * (1 - i / hits), t); bg.gain.exponentialRampToValueAtTime(.001, t + .06);
    body.connect(bg); bg.connect(out); body.start(t); body.stop(t + .07);
    t += .035 + Math.pow(i / hits, 1.6) * .14 + Math.random() * .03;
  }
}
function auChime(good) {
  const ctx = auCtx(); if (!ctx) return; const t = ctx.currentTime + .02; const out = ctx.createGain(); out.gain.value = AU.cfg.sfx * .5; out.connect(ctx.destination);
  const notes = good ? [659.3, 987.8] : [196, 146.8];
  notes.forEach((f, i) => { const o = ctx.createOscillator(); o.type = good ? "sine" : "triangle"; o.frequency.value = f; const g = ctx.createGain(); const s = t + i * (good ? .09 : .12);
    g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(good ? .5 : .55, s + .01); g.gain.exponentialRampToValueAtTime(.001, s + (good ? .9 : .5)); o.connect(g); g.connect(out); o.start(s); o.stop(s + 1); });
}
function auUnlock() {
  if (AU.unlocked) return; AU.unlocked = true; auCtx(); const m = AU.mood; AU.mood = null; setMood(m || "menu"); const a = AU.ambKey; AU.ambKey = undefined; setAmbience(a);
  ["s-button", "s-select", "s-sword-1", "s-miss-1"].forEach(f => { if (!AU.pool.has(f)) { const e = new Audio(auSrc(f)); e.preload = "auto"; AU.pool.set(f, e); } });
}
function auApply() {
  auSave(); if (!AU.cfg.on) { [AU.cur, AU.amb].forEach(el => el && auFade(el, 0, 600, () => el.pause())); return; }
  if (AU.cur) { if (AU.cur.paused) AU.cur.play().catch(() => {}); auFade(AU.cur, auMusicVol(), 400); } else if (AU.unlocked && AU.cfg.music > 0) { const m = AU.mood; AU.mood = null; setMood(m || "menu"); }
  if (AU.amb) { if (AU.amb.paused) AU.amb.play().catch(() => {}); auFade(AU.amb, AU.cfg.amb * .6, 400); } else { const a = AU.ambKey; AU.ambKey = undefined; setAmbience(a); }
  renderSoundBtn();
}
function renderSoundBtn() { const b = document.getElementById("btn-sound"); if (!b) return; b.setAttribute("aria-pressed", String(AU.cfg.on)); b.title = AU.cfg.on ? "Выключить звук" : "Включить звук"; b.querySelector(".snd-on").style.display = AU.cfg.on ? "" : "none"; b.querySelector(".snd-off").style.display = AU.cfg.on ? "none" : ""; }
/* настроение сцены по месту, времени, бою и угрозе */
function moodNow() {
  if (!S) return "menu"; if (S.dead) return "defeat"; if (S.world.combat) return "battle";
  const tpl = sceneTpl(S.world.loc); const part = worldTime().part;
  if (tpl === "inn") return "tavern"; if (tpl === "chapel" || tpl === "shrine") return "sacred"; if (tpl === "cave" || tpl === "mine") return "deep";
  if ((S.world.threat || 0) >= 4) return "tension"; if (part === 3) return "night"; if (tpl === "forest" || tpl === "camp") return "forest"; return "explore";
}
function ambNow() { if (!S) return null; const tpl = sceneTpl(S.world.loc); const k = SC_AMB[tpl]; if (k === "birds" && worldTime().part >= 2) return "night"; if (!k && !["inn", "house", "hut", "chapel", "cave", "mine", "tower"].includes(tpl) && worldTime().part === 3) return "night"; return k || null; }
function syncAudio() { setMood(moodNow()); setAmbience(ambNow()); }
/* звук результата броска */
const WEAPON_SFX = { longsword: "sword", rapier: "dagger", shortbow: "bow", staff: "staff", mace: "mace" };
function spellSfx(sp) { const t = sp?.type || ""; if (sp?.kind === "heal") return "heal"; if (/огн/.test(t)) return "fire"; if (/звук|молни|гром/.test(t)) return "lightning"; if (/излуч/.test(t)) return "holy"; if (/некро|яд/.test(t)) return "dark"; return "missile"; }
function rollSfx(r) {
  if (!r) return;
  if (r.kind === "attack") { if (r.ok) { sfx(WEAPON_SFX[r.weapon] || "sword"); if (r.crit) setTimeout(() => sfx("fanfare", .6), 250); } else sfx("miss"); return; }
  if (r.kind === "spell") { const sp = SPELLS[r.spell]; if (r.noslot) return sfx("thud"); sfx(spellSfx(sp)); return; }
  if (r.kind === "enemy") { if (r.skip) return; if (r.ok) { sfx(ENEMIES[r.by]?.type === "wolf" ? "growl" : "hurt"); } else sfx("miss", .7); return; }
  if (r.kind === "skill" || r.kind === "save") { if (r.crit) sfx("fanfare", .7); else sfx(r.ok ? "chime" : "thud"); return; }
}
document.addEventListener("pointerdown", auUnlock, { capture: true }); document.addEventListener("keydown", auUnlock, { capture: true });
document.addEventListener("click", e => { const b = e.target.closest("button"); if (!b || b.disabled || b.closest(".scene-view") || b.id === "btn-roll") return; sfx(b.matches(".choice, .skill-opt, .world-pick, [aria-pressed]") ? "pick" : "tap"); }, { capture: true });
document.addEventListener("visibilitychange", () => { const hid = document.hidden; [AU.cur, AU.amb].forEach(el => { if (!el) return; if (hid) el.pause(); else if (AU.cfg.on) el.play().catch(() => {}); }); });
function soundSettingsHTML() {
  const row = (k, l) => `<label class="au-row"><span>${l}</span><input type="range" min="0" max="100" step="5" value="${Math.round(AU.cfg[k] * 100)}" data-au="${k}" aria-label="${l}"><b class="num">${Math.round(AU.cfg[k] * 100)}</b></label>`;
  return `<div class="opt-group"><span>Звук</span><div class="seg"><button type="button" data-auon="1" aria-pressed="${AU.cfg.on}">Включён</button><button type="button" data-auon="0" aria-pressed="${!AU.cfg.on}">Выключен</button></div>
  <div class="au-rows">${row("music", "Музыка")}${row("amb", "Фон")}${row("sfx", "Эффекты")}</div>
  <small class="home-note">Музыка меняется сама: таверна, бой, ночь, святилище, подземелье. Музыка и звуки — из открытой игры <a href="https://github.com/wesnoth/wesnoth" target="_blank" rel="noopener">Battle for Wesnoth</a> (GPL v2+), «Three Sheets» — Scott Buckley (CC BY-SA 4.0).</small></div>`;
}
function bindSoundSettings(root) {
  root.querySelectorAll("[data-au]").forEach(inp => inp.oninput = () => { AU.cfg[inp.dataset.au] = inp.value / 100; inp.nextElementSibling.textContent = inp.value; auApply(); });
  root.querySelectorAll("[data-au]").forEach(inp => inp.onchange = () => { if (inp.dataset.au === "sfx") sfx("chime"); });
  root.querySelectorAll("[data-auon]").forEach(b => b.onclick = () => { AU.cfg.on = b.dataset.auon === "1"; root.querySelectorAll("[data-auon]").forEach(x => x.setAttribute("aria-pressed", String(x === b))); auApply(); });
}
