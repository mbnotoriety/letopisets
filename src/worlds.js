Object.assign(BIOMES, BIOMES_NEW); Object.assign(MAP_PAL, BIOME_PAL); Object.assign(SEA_NAMES, BIOME_SEA);
FORGE_STAGES.push("Классы и народы мира");
BG_CATS.world = "✦ Этого мира";
function settingOf(wd) { return (wd && WSET[wd.setting]) ? wd.setting : "fantasy"; }
var MONEY = ["зм", "см", "золотых"]; function MZ() { return (MONEY || ["зм"])[0]; } function MS() { return (MONEY || ["зм", "см"])[1]; } function MZW() { return (MONEY || ["зм", "см", "золотых"])[2]; }
function settingLine(opts) { const P = WSET[opts?.setting] || WSET.fantasy; return `Сеттинг: ${P.n} — ${P.prompt}. `; }
let SKIN_KEY = null, SKIN0 = null, SKIN_LEX = null, SKIN_ADDED = [];
const SKIN_T = () => ({ CLASSES, RACES, BACKGROUNDS, WT, WV, ITEMS, SPELLS, BESTIARY, ENC_FOES, FOE_TXT, KITS, CLASS_GEAR, LOOK_M, LOOK_F, WEAPONS, OBJ, SC_CROWD, SC_NAMES });
function skinSnap() { if (SKIN0) return; SKIN0 = {}; for (const [k, T] of Object.entries(SKIN_T())) SKIN0[k] = structuredClone(T); }
function skinRestore() {
  if (!SKIN0) return; const T = SKIN_T();
  SKIN_ADDED.forEach(([t, k]) => { try { delete t[k]; } catch (e) {} }); SKIN_ADDED = [];
  for (const [name, snap] of Object.entries(SKIN0)) { const t = T[name];
    if (Array.isArray(t)) { t.length = 0; t.push(...structuredClone(snap)); continue; }
    for (const [k, v] of Object.entries(snap)) { if (Array.isArray(v) || typeof v !== "object" || v === null || !t[k] || Array.isArray(t[k])) t[k] = structuredClone(v); else Object.assign(t[k], structuredClone(v)); } }
  MONEY = ["зм", "см", "золотых"]; SKIN_LEX = null;
}
function addKey(t, k, v) { t[k] = v; SKIN_ADDED.push([t, k]); }
/* лексикон: пресет сеттинга + то, что придумал ИИ для конкретного мира */
function mergeLex(P, ai) {
  const L = { money: P.money, cls: { ...(P.cls || {}) }, race: { ...(P.race || {}) }, bg: { ...(P.bg || {}) }, w: {}, a: { ...(P.a || {}) }, sp: { ...(P.sp || {}) }, foe: { ...(P.foe || {}) }, it: { ...(P.it || {}) }, wd: { ...(P.wd || {}) }, names: P.names, looks: P.looks };
  Object.entries(P.w || {}).forEach(([grp, list]) => (WGROUP[grp] || []).forEach((t, i) => { if (list?.length) L.w[t] = list[i % list.length]; }));
  if (ai && typeof ai === "object") { if (Array.isArray(ai.money) && ai.money[0]) L.money = ai.money; ["cls", "race", "bg", "w", "a", "sp", "foe", "it", "wd"].forEach(k => Object.assign(L[k], ai[k] || {})); }
  return L;
}
function lexOf(wd) { const st = settingOf(wd); return mergeLex(WSET[st], wd?.lex); }
function applySkin(wd, force) {
  const st = settingOf(wd); const key = `${wd?.id}|${st}|${wd?.lexv || 0}|${(wd?.uniq?.classes || []).length}`; if (!force && key === SKIN_KEY) return; skinSnap(); skinRestore(); SKIN_KEY = key;
  const L = lexOf(wd); SKIN_LEX = L; if (Array.isArray(L.money) && L.money[0]) MONEY = [L.money[0], L.money[1] || L.money[0], L.money[2] || L.money[0]];
  Object.entries(L.cls).forEach(([k, v]) => { if (CLASSES[k] && v) { CLASSES[k].name = v[0] || CLASSES[k].name; if (v[1]) CLASSES[k].role = v[1]; if (v[2]) CLASSES[k].blurb = v[2]; } });
  Object.entries(L.race).forEach(([k, v]) => { if (RACES[k] && v) { RACES[k].name = v[0] || RACES[k].name; if (v[1]) RACES[k].sub = v[1]; } });
  Object.entries(L.bg).forEach(([k, v]) => { if (BACKGROUNDS[k] && v) BACKGROUNDS[k].name = v; });
  const wch = new Set(); Object.entries(L.w).forEach(([t, v]) => { if (!WT[t] || !v) return; const n = v[0] || WT[t].n, g = GI[v[1]] != null ? v[1] : WT[t].g; WT[t].n = n; WT[t].g = g; WV[t] = [{ n, g, d: v[2] || "" }]; if (WEAPONS[t]) WEAPONS[t].name = n; wch.add(t); });
  Object.values(ITEMS).forEach(it => { if (it.w && wch.has(it.w)) it.n = WT[it.w].n; });
  if (wch.size) Object.values(KITS).forEach(list => list.forEach(K => { const ns = [...new Set(K.w.map(t => WT[t]?.n).filter(Boolean))]; if (ns.length) K.n = ns.slice(0, 2).map((n, i) => i ? lc1(n) : n).join(" и "); }));
  Object.entries(L.a).forEach(([k, v]) => { if (ITEMS[k] && v) ITEMS[k].n = v; });
  Object.entries(L.it).forEach(([k, v]) => { if (ITEMS[k] && v) ITEMS[k].n = v; });
  Object.entries(L.sp).forEach(([k, v]) => { if (SPELLS[k] && v) SPELLS[k].name = v; });
  const fn = {}; Object.entries(L.foe).forEach(([k, v]) => { if (BESTIARY[k] && v) { fn[k] = v; BESTIARY[k].label = `${v.toLowerCase()}, ${SKIN0.BESTIARY[k].label}`; } });
  Object.values(ENC_FOES).forEach(list => list.forEach(e => { if (fn[e[0]]) e[1] = fn[e[0]]; }));
  if (st !== "fantasy") Object.keys(FOE_TXT).forEach(k => { const n = fn[k] || BESTIARY[k]?.label?.split(",")[0]; if (!n) return; const ic = FOE_TXT[k][2]; FOE_TXT[k] = [`Впереди — ${lc1(n)}. Тебя пока не заметили: можно подготовиться или обойти.`, `Засада! ${n} бросается на тебя из укрытия.`, ic]; });
  const W = L.wd; const rw = s => (W[s] || s);
  Object.keys(CLASS_GEAR).forEach(k => { CLASS_GEAR[k] = CLASS_GEAR[k].map(rw); }); Object.values(BACKGROUNDS).forEach(b => { if (b.item) b.item = rw(b.item); });
  if (L.looks?.m?.length) { LOOK_M.length = 0; LOOK_M.push(...L.looks.m); } if (L.looks?.f?.length) { LOOK_F.length = 0; LOOK_F.push(...L.looks.f); }
  if (typeof skinInterior === "function") skinInterior(st);
  regUnique(wd);
  if ((wd?.uniq?.backgrounds || []).length) BG_CATS.world = "✦ Этого мира"; else delete BG_CATS.world;
}
/* текстовые замены в уже построенных зданиях и жителях (кузница → мастерская имплантов) */
function skinWords(def) {
  const st = settingOf(def); if (st === "fantasy" || !def?.places) return; const key = `${st}|${def.lexv || 0}`; if (def.wsk === key) return; def.wsk = key;
  const W = lexOf(def).wd; const keys = Object.keys(W).sort((a, b) => b.length - a.length); if (!keys.length) return;
  const esc2 = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); const re = new RegExp(keys.map(esc2).join("|"), "g"); const fix = s => typeof s === "string" ? s.replace(re, m => W[m]) : s;
  Object.values(def.places).forEach(p => { if (p.inner || p.kind === "street" || p.btpl || p.auto) { p.name = fix(p.name); p.short = fix(p.short); p.desc = fix(p.desc); } });
  Object.values(def.npcs || {}).forEach(n => { if (n.minor || n.bld) n.role = fix(n.role); });
  Object.values(def.quests || {}).forEach(q => { q.title = fix(q.title); q.brief = fix(q.brief); q.goal = fix(q.goal); });
}
function foeNm(wd, type, fb) { return lexOf(wd).foe[type] || fb; }
/* ---------- особые классы, народы и предыстории мира ---------- */
const U_CLS_T = () => { const out = []; for (const f of [() => KITS, () => WP_ONLY, () => WP_MART, () => APROF, () => LEVEL_SPELLS, () => LEVEL_FEATS, () => CLASS_META, () => CLASS_GEAR, () => DLG_CLASS, () => DLG_TONE, () => ASI_LEVELS, () => EMBLEM, () => LV_FEATS2, () => LV_SPELLS2]) { try { const t = f(); if (t && typeof t === "object") out.push(t); } catch (e) {} } return out; };
const U_RACE_T = () => [RACE_ATT, RACE_COL, RACE_SOCIAL, EMBLEM];
function bcls(o) { const k = o?.cls; return CLASSES[k]?.base || k; }
function regUnique(wd) {
  const u = wd?.uniq; if (!u) return; const CT = U_CLS_T();
  (u.classes || []).forEach((c, i) => { const b = CLASSES[c.base]; if (!b) return; const k = "u_c" + (i + 1);
    addKey(CLASSES, k, { ...structuredClone(b), name: c.name, role: c.role || b.role, blurb: c.blurb || b.blurb, features: c.features?.length ? c.features : b.features, skillList: [...new Set([...(c.skills || []), ...b.skillList])],
      skillCount: b.skillCount + 1, color: c.color || b.color, base: c.base, uniq: true, baseName: b.name });
    CT.forEach(t => { if (t[c.base] !== undefined) addKey(t, k, t[c.base]); }); if (ICONS["c_" + c.base]) addKey(ICONS, "c_" + k, ICONS["c_" + c.base]); if (EXTRA_ATK.has(c.base)) { EXTRA_ATK.add(k); SKIN_ADDED.push([{ set: 1 }, k]); } });
  (u.races || []).forEach((r, i) => { const b = RACES[r.base]; if (!b) return; const k = "u_r" + (i + 1);
    addKey(RACES, k, { ...structuredClone(b), name: r.name, sub: r.sub || b.sub, traits: r.traits?.length ? r.traits : b.traits, bonus: r.bonus || b.bonus, skills: [...new Set([...(b.skills || []), ...(r.skill ? [r.skill] : [])])], base: r.base, uniq: true, look: r.look || "", baseName: b.name });
    U_RACE_T().forEach(t => { if (t[r.base] !== undefined) addKey(t, k, t[r.base]); }); if (r.social) RACE_SOCIAL[k] = r.social; if (r.att != null) RACE_ATT[k] = r.att; if (ICONS["r_" + r.base]) addKey(ICONS, "r_" + k, ICONS["r_" + r.base]); });
  (u.backgrounds || []).forEach((g, i) => { const k = "u_b" + (i + 1); const base = BACKGROUNDS[g.base] ? g.base : "sage";
    addKey(BACKGROUNDS, k, { name: g.name, skills: g.skills, hook: g.hook, gold: g.gold, item: g.item, cat: "world", feat: g.feat, uniq: true });
    addKey(BG_ATT, k, {}); addKey(BG_ATT_TXT, k, g.att_txt || "местные знают таких, как вы"); if (ICONS["b_" + base]) addKey(ICONS, "b_" + k, ICONS["b_" + base]); });
}
{ const _r = skinRestore; skinRestore = function () { SKIN_ADDED.filter(([t]) => t.set).forEach(([, k]) => EXTRA_ATK.delete(k)); SKIN_ADDED = SKIN_ADDED.filter(([t]) => !t.set); return _r.apply(this, arguments); }; }
/* ---------- ИИ: особые сущности и лексикон ---------- */
const ABILS6 = ["str", "dex", "con", "int", "wis", "cha"];
const hexCol = s => /^#[0-9a-f]{6}$/i.test(String(s || "")) ? s : null;
function uniqClean(r) {
  const out = { classes: [], races: [], backgrounds: [] }; if (!r || typeof r !== "object") return out; const sk = s => SKILLS[s] ? s : null;
  (Array.isArray(r.classes) ? r.classes : []).slice(0, 2).forEach(c => { if (!c || !CLASSES[c.base] || CLASSES[c.base].uniq || !str(c.name, 30)) return;
    out.classes.push({ name: str(c.name, 30), base: c.base, role: str(c.role, 36), blurb: str(c.blurb, 180), features: (Array.isArray(c.features) ? c.features : []).map(f => str(f, 160)).filter(Boolean).slice(0, 3), skills: [...new Set((Array.isArray(c.skills) ? c.skills : []).map(sk).filter(Boolean))].slice(0, 7), color: hexCol(c.color) }); });
  (Array.isArray(r.races) ? r.races : []).slice(0, 2).forEach(x => { if (!x || !RACES[x.base] || RACES[x.base].uniq || !str(x.name, 30)) return; let bonus = null;
    if (x.bonus && typeof x.bonus === "object") { const e = Object.entries(x.bonus).filter(([a, v]) => ABILS6.includes(a) && Number(v) > 0).map(([a, v]) => [a, clamp(Math.round(Number(v)), 1, 2)]).sort((a, b) => b[1] - a[1]).slice(0, 2); if (e.length) { e[0][1] = 2; if (e[1]) e[1][1] = 1; bonus = Object.fromEntries(e); } }
    out.races.push({ name: str(x.name, 30), base: x.base, sub: str(x.sub, 60), traits: (Array.isArray(x.traits) ? x.traits : []).map(t => str(t, 120)).filter(Boolean).slice(0, 3), bonus, skill: sk(x.skill), social: str(x.social, 70), att: clamp(Math.round(Number(x.att) || 0), -10, 5), look: str(x.look, 120) }); });
  (Array.isArray(r.backgrounds) ? r.backgrounds : []).slice(0, 2).forEach(g => { if (!g || !str(g.name, 34)) return; let skills = [...new Set((Array.isArray(g.skills) ? g.skills : []).map(sk).filter(Boolean))].slice(0, 2);
    if (skills.length < 2) skills = [...new Set([...skills, "insight", "perception"])].slice(0, 2);
    out.backgrounds.push({ name: str(g.name, 34), skills, hook: str(g.hook, 200).replace(/^вы\s+/i, "") || "пришли сюда по своим причинам", item: str(g.item, 50) || "Памятная вещь", gold: clamp(Math.round(Number(g.gold) || 10), 3, 30), feat: str(g.feat, 200), base: BACKGROUNDS[g.base] ? g.base : null, att_txt: str(g.att_txt, 60) }); });
  return out;
}
function lexClean(r) {
  if (!r || typeof r !== "object") return null; const o = { cls: {}, race: {}, bg: {}, w: {}, a: {}, sp: {}, foe: {}, it: {}, wd: {} };
  if (Array.isArray(r.money) && str(r.money[0], 5)) o.money = [str(r.money[0], 5), str(r.money[1], 5) || str(r.money[0], 5), str(r.money[2], 16) || str(r.money[0], 5)];
  const pair = (src, dst, ok) => Object.entries(src && typeof src === "object" ? src : {}).forEach(([k, v]) => { if (!ok(k)) return; const a = Array.isArray(v) ? v : [v]; const n = str(a[0], 32); if (n) dst[k] = [n, str(a[1], 40), str(a[2], 160)]; });
  pair(r.classes, o.cls, k => CLASSES[k] && !CLASSES[k].uniq); pair(r.races, o.race, k => RACES[k] && !RACES[k].uniq);
  Object.entries(r.weapons || {}).forEach(([k, v]) => { if (!WT[k]) return; const a = Array.isArray(v) ? v : [v]; const n = str(a[0], 32); if (n) o.w[k] = [n, ["m", "f", "n"].includes(a[1]) ? a[1] : WT[k].g]; });
  const one = (src, dst, ok) => Object.entries(src && typeof src === "object" ? src : {}).forEach(([k, v]) => { const n = str(Array.isArray(v) ? v[0] : v, 40); if (n && ok(k)) dst[k] = n; });
  one(r.backgrounds, o.bg, k => BACKGROUNDS[k] && !BACKGROUNDS[k].uniq); one(r.armor, o.a, k => ITEMS[k]); one(r.spells, o.sp, k => SPELLS[k]); one(r.foes, o.foe, k => BESTIARY[k]); one(r.items, o.it, k => ITEMS[k]); one(r.words, o.wd, k => k.length >= 3 && k.length <= 40);
  return o;
}
const SKIN_WORDS = ["Кузница", "кузнец", "кузнеца", "Пекарня", "пекарь", "пекаря", "Свечная лавка", "свечник", "свечника", "Лавка мясника", "Лавка старьёвщика", "Аптекарская лавка", "Лавка всякой всячины", "Амбар", "Сарай", "Сарай для снастей", "Караульня", "сержант стражи", "стражник", "Дом купца", "зажиточный купец", "купца", "Дом хуторянина", "хуторянин", "хуторянина", "батрак",
  "углежог", "углежога", "торфяник", "торфяника", "бортник", "бортника", "бондарь", "бондаря", "знахарка", "знахарки", "травница", "травницы", "резчик по кости", "резчика по кости", "лодочник", "лодочника", "Ремесленная улица", "Рыночная площадь", "Крепостные ворота",
  "Книга заклинаний", "Мешочек с компонентами", "Священный символ", "Колчан со стрелами", "Лютня", "Книга теней", "Омела", "Травяной сбор", "Молитвенник", "Набор путешественника"];
function worldCtx(w, opts) { const P = WSET[w.setting] || WSET.fantasy; return `Мир «${w.name}»: ${w.public}
Тайна (для тебя, игроку не раскрывать): ${String(w.secret || "").slice(0, 600)}
Сеттинг: ${P.n} — ${P.prompt}.${opts.wish ? ` Пожелания игрока: ${opts.wish}.` : ""} Окружение: ${BIOMES[w.biome] || ""}. Тон: ${TONES[opts.tone] || ""}.`; }
async function skinUniqAI(sample, w, opts) {
  const cls = Object.entries(CLASSES).filter(([, c]) => !c.uniq).map(([k, c]) => `${k} (${SKIN0?.CLASSES?.[k]?.name || c.name}: ${c.features.join("; ")})`).join("\n");
  const rc = Object.entries(RACES).filter(([, r]) => !r.uniq).map(([k, r]) => `${k} (${SKIN0?.RACES?.[k]?.name || r.name}: ${r.traits.join("; ")})`).join("\n");
  const r = await sample.json(`Ты — мастер настольных ролевых игр и автор сеттингов. Пиши по-русски.
${worldCtx(w, opts)}
Игра работает на правилах 5e: механика классов и рас сохраняется, меняется то, как они выглядят и называются в этом мире.
Придумай для ЭТОГО мира 2 особых класса, 2 особых народа (расы, виды или происхождения) и 2 особые предыстории, которых нет больше нигде. Они связаны с местами, культурой, конфликтом и тайной мира (но не раскрывают её) и звучат в духе сеттинга.
- Особый класс строится на механике базового класса (base). features — 2 способности: переосмысли способности базы в духе мира, СОХРАНИВ их механику в описании (например, «Удар по уязвимому узлу: +1d6 урона при преимуществе»). skills — 5–6 навыков из: ${Object.keys(SKILLS).join(", ")}. Базовые классы:
${cls}
- Особый народ строится на базовой расе (base). traits — 3 черты: две переосмысляют механику базы с сохранением сути, третья — особенность этого мира. bonus — одна характеристика +2 и одна +1 (str, dex, con, int, wis, cha). skill — один навык из списка выше. social — как к ним относятся местные, до 8 слов; att — отношение местных от −10 до 5. look — внешность по-английски для генератора портретов, 6–12 слов. Базовые расы:
${rc}
- Особая предыстория: skills — 2 навыка из списка; hook — продолжает фразу «Вы …», 1 предложение; item — памятная вещь; gold 5–25; feat — особенность, 1 предложение: чем она помогает в этом мире; att_txt — как встречают местные, до 6 слов.
Используй разные базы. Ответь только JSON:
{"classes":[{"name":"…","base":"rogue","role":"2–4 слова","blurb":"1 предложение","features":["…","…"],"skills":["…"],"color":"#hex"}],"races":[{"name":"…","base":"human","sub":"до 7 слов","traits":["…","…","…"],"bonus":{"dex":2,"int":1},"skill":"…","social":"…","att":0,"look":"…"}],"backgrounds":[{"name":"…","skills":["…","…"],"hook":"…","item":"…","gold":10,"feat":"…","att_txt":"…"}]}`, { cache: false });
  const u = uniqClean(r); return u.classes.length + u.races.length + u.backgrounds.length ? u : null;
}
async function skinLexAI(sample, w, opts) {
  const S0 = SKIN0; const list = (T, f) => Object.entries(T).filter(([, v]) => !v.uniq).map(([k, v]) => `${k}=${f(v)}`).join("; ");
  const r = await sample.json(`Ты — автор сеттингов для настольных ролевых игр. Пиши по-русски.
${worldCtx(w, opts)}
Переименуй стандартные элементы игры 5e так, чтобы они звучали в духе этого сеттинга и мира (механика не меняется, только названия). Если понятие не подходит сеттингу — замени ближайшим аналогом. Названия короткие, 1–3 слова.
Ответь только JSON с такими ключами (все id сохранить):
"money": ["сокращение крупной монеты до 4 знаков", "сокращение мелкой", "крупная в родительном падеже мн. ч."],
"classes": {"id": ["название", "роль, 2–4 слова", "1 предложение: кто это в этом мире"]} для: ${list(S0.CLASSES, v => v.name)}
"races": {"id": ["название", "описание до 6 слов"]} для: ${list(S0.RACES, v => v.name)}
"backgrounds": {"id": "название"} для: ${list(S0.BACKGROUNDS, v => v.name)}
"weapons": {"id": ["название", "род: m|f|n"]} для: ${Object.entries(S0.WT).map(([k, v]) => `${k}=${v.n}`).join("; ")}
"armor": {"id": "название"} для: ${["leather", "studded", "chainshirt", "scale", "chainmail", "shield"].filter(k => S0.ITEMS[k]).map(k => `${k}=${S0.ITEMS[k].n}`).join("; ")}
"spells": {"id": "название способности"} для: ${Object.entries(S0.SPELLS).map(([k, v]) => `${k}=${v.name}`).join("; ")}
"foes": {"id": "существо в ед. ч."} для: ${Object.entries(S0.BESTIARY).map(([k, v]) => `${k}=${v.label.split(",")[0]}`).join("; ")}
"items": {"id": "название"} для: ${["potion", "potion2", "antidote", "holywater", "healkit", "torch", "lantern", "oil", "thieves", "candles", "incense", "flint", "waterskin", "ale", "wine", "drink", "room", "bless"].filter(k => S0.ITEMS[k]).map(k => `${k}=${S0.ITEMS[k].n}`).join("; ")}
"words": {"исходное": "замена"} — замени дословно (с тем же падежом), если не подходит сеттингу: ${SKIN_WORDS.join("; ")}`, { cache: false });
  return lexClean(r);
}
{ const _fw = forgeWorld; forgeWorld = async function (opts, onStage, signal) {
  const st = WSET[opts.setting] ? opts.setting : "fantasy"; applySkin({ id: "forge-" + st, setting: st }, true);
  const w = await _fw.apply(this, arguments); w.setting = st; if (opts.wish) w.wish = str(opts.wish, 300);
  if (st !== "fantasy" && WSET[st].photo && !w.photo_style) w.photo_style = WSET[st].photo;
  onStage(6); const sample = await getSample();
  if (sample && !signal?.aborted) { const [lx, un] = await Promise.allSettled([st === "fantasy" ? Promise.resolve(null) : skinLexAI(sample, w, opts), skinUniqAI(sample, w, opts)]);
    if (lx.status === "fulfilled" && lx.value) w.lex = lx.value; if (un.status === "fulfilled" && un.value) w.uniq = un.value;
    if (lx.status === "rejected") console.warn("lex", lx.reason); if (un.status === "rejected") console.warn("uniq", un.reason); }
  if (signal?.aborted) throw { code: "cancelled" };
  w.lexv = 1; SKIN_KEY = null; return w; }; }
/* ---------- переключение облика: игра следует S.wd, создание — D.world ---------- */
function skinTarget() { return S ? S.wd : D?.world || null; }
{ const _sw = setWorld; setWorld = function (def) { const r = _sw.apply(this, arguments); try { skinWords(def); const t = skinTarget() || def; applySkin(t); } catch (e) { console.error(e); } return r; }; }
{ const _rc = renderCreate; renderCreate = function () { try { if (!S && D?.world) applySkin(D.world); } catch (e) { console.error(e); } return _rc.apply(this, arguments); }; }
{ const _ns = nameSet; nameSet = function (wd) { const P = WSET[settingOf(wd)]; if (P?.names && (!wd.culture || wd.culture === "auto")) return P.names; return _ns.apply(this, arguments); }; }
{ const _ie = indexEntry; indexEntry = function (s) { const e = _ie.apply(this, arguments); try { e.clsName = CLASSES[s.char.cls]?.name; e.raceName = RACES[s.char.race]?.name; e.clsBase = bcls(s.char); e.raceBase = RACES[s.char.race]?.base || s.char.race; e.clsColor = CLASSES[s.char.cls]?.color; e.setting = settingOf(s.wd); } catch (er) {} return e; }; }
function settingBrief() {
  if (!WD) return ""; const st = settingOf(WD); const P = WSET[st]; const out = []; const c = S?.char;
  if (st !== "fantasy") out.push(`СЕТТИНГ: ${P.n} — ${P.prompt}${st === "custom" && WD.wish ? ` (${WD.wish})` : ""}. Механика 5e, но всё описывай в духе сеттинга, без неуместных средневековых понятий. Деньги — ${MZW()}. Способности и заклинания — это проявления сеттинга (${st === "cyberpunk" ? "импланты, хаки, гаджеты" : st === "space" ? "псионика и технологии" : st === "steampunk" ? "эфирная наука и механизмы" : st === "postapoc" ? "аномалии, мутации, старые технологии" : "в духе мира"}). Классы здесь называются: ${Object.values(CLASSES).filter(x => !x.uniq).map(x => x.name).join(", ")}.`);
  if (c) { const cl = CLASSES[c.cls], rc = RACES[c.race], bg = BACKGROUNDS[c.bg];
    if (cl?.uniq) out.push(`КЛАСС ГЕРОЯ — особый для этого мира: ${cl.name} (${cl.role}). ${cl.blurb} Способности: ${cl.features.join("; ")}.`);
    if (rc?.uniq) out.push(`НАРОД ГЕРОЯ — особый для этого мира: ${rc.name} (${rc.sub}). Черты: ${rc.traits.join("; ")}. Как относятся местные: ${RACE_SOCIAL[c.race] || "по-разному"}.`);
    if (bg?.uniq) out.push(`ПРЕДЫСТОРИЯ ГЕРОЯ — особая для этого мира: ${bg.name}. Особенность: ${bg.feat || ""}.`); }
  const u = WD.uniq; if (u && (u.classes?.length || u.races?.length)) out.push(`Особые для мира классы и народы (могут встречаться среди НПС): ${[...(u.classes || []).map(x => x.name), ...(u.races || []).map(x => x.name)].join(", ")}.`);
  return out.length ? out.join("\n") + "\n" : "";
}
function uniqSummary(w) { const u = w?.uniq; if (!u) return ""; const all = [...(u.classes || []).map(x => x.name), ...(u.races || []).map(x => x.name), ...(u.backgrounds || []).map(x => x.name)]; return all.length ? `<small class="w-uniq">✦ Только здесь: ${all.map(esc).join(", ")}</small>` : ""; }
function settingGrid() {
  const g = document.createElement("div"); g.className = "set-grid"; const cur = D.forge.setting || "fantasy";
  g.innerHTML = `<span class="set-lab">Сеттинг</span><div class="set-cards">${Object.entries(WSET).map(([k, s]) => `<button type="button" class="set-card" data-set="${k}" aria-pressed="${cur === k}" style="--sc:${s.col}" ${D.forge.stage >= 0 ? "disabled" : ""}><b>${s.n}</b><small>${s.d}</small></button>`).join("")}</div>`;
  g.querySelectorAll("[data-set]").forEach(b => b.onclick = () => { const k = b.dataset.set; D.forge.setting = k; if (WSET[k].biome) D.forge.biome = WSET[k].biome; renderCreate(); }); return g;
}
{ const _rf = runForge; runForge = async function () { if (D.forge.setting === "custom" && !String(D.forge.wish || "").trim()) { D.forge.err = "Для своего мира опишите атмосферу в пожеланиях: эпоха, технологии или магия, кто там живёт."; renderCreate(); return; } return _rf.apply(this, arguments); }; }
/* ---------- карта: новые значки и дома ---------- */
function roofCol(q) { const r = WSET[settingOf(WD)]?.roof; return r ? r[q > .5 ? 0 : 1] : (q > .5 ? "#9c4a32" : "#7d5a3a"); }
function drawGlyph(g, it, ink) {
  const { X, Y, s, q } = it; const t = it.type;
  if (t === "palm") { g.strokeStyle = "rgba(30,24,14,.25)"; g.fillStyle = "rgba(30,24,14,.22)"; g.beginPath(); g.ellipse(X + s * .6, Y + s * 1.2, s * .9, s * .25, 0, 0, 7); g.fill();
    g.strokeStyle = "#6a4a2a"; g.lineWidth = s * .28; g.beginPath(); g.moveTo(X, Y + s * 1.2); g.quadraticCurveTo(X + s * .5, Y + s * .2, X + s * .2, Y - s * .7); g.stroke();
    const tx = X + s * .2, ty = Y - s * .7; g.strokeStyle = `rgb(${60 + q * 20},${110 + q * 20},${50})`; g.lineWidth = s * .32; g.lineCap = "round";
    for (let j = 0; j < 5; j++) { const a = -Math.PI * .95 + j * Math.PI * .47; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a) * s * .9, ty + Math.sin(a) * s * .9 - s * .3, tx + Math.cos(a) * s * 1.5, ty + Math.sin(a) * s * 1.2 + s * .3); g.stroke(); } return true; }
  if (t === "cactus") { g.fillStyle = `rgb(${86 + q * 20},${124 + q * 16},${70})`; g.strokeStyle = ink; g.lineWidth = .7; const w = s * .42;
    g.beginPath(); g.roundRect(X - w / 2, Y - s * 1.2, w, s * 2.2, w / 2); g.fill(); g.stroke(); g.beginPath(); g.roundRect(X - w * 1.6, Y - s * .5, w * .8, s * .9, w / 2); g.fill(); g.stroke(); g.beginPath(); g.roundRect(X + w * .8, Y - s * .8, w * .8, s * .9, w / 2); g.fill(); g.stroke(); return true; }
  if (t === "block") { const neon = WSET[settingOf(WD)]?.neon; const w = s * 1.5, h = s * (2 + q * 2.6), d = s * .55;
    g.fillStyle = "rgba(10,12,18,.35)"; g.fillRect(X - w / 2 + 2, Y - h + 2, w + d, h); g.fillStyle = `rgb(${70 + q * 20},${74 + q * 20},${88 + q * 18})`; g.fillRect(X - w / 2, Y - h, w, h);
    g.fillStyle = `rgb(${52 + q * 14},${56 + q * 14},${68 + q * 12})`; g.beginPath(); g.moveTo(X + w / 2, Y - h); g.lineTo(X + w / 2 + d, Y - h - d * .6); g.lineTo(X + w / 2 + d, Y - d * .6); g.lineTo(X + w / 2, Y); g.closePath(); g.fill();
    g.fillStyle = `rgb(${96 + q * 20},${100 + q * 20},${114 + q * 18})`; g.beginPath(); g.moveTo(X - w / 2, Y - h); g.lineTo(X - w / 2 + d, Y - h - d * .6); g.lineTo(X + w / 2 + d, Y - h - d * .6); g.lineTo(X + w / 2, Y - h); g.closePath(); g.fill();
    const wc = neon ? ["#ff5cd0", "#5ce8ff", "#ffd75c"] : ["#f2d48a", "#e8c070"]; for (let yy = Y - h + s * .45; yy < Y - s * .3; yy += s * .55) for (let xx = X - w / 2 + s * .3; xx < X + w / 2 - s * .15; xx += s * .45) { if (hash(Math.round(xx * 7) + ":" + Math.round(yy * 7)) % 3) continue; g.fillStyle = wc[hash(xx + "," + yy) % wc.length]; g.fillRect(xx, yy, s * .18, s * .2); }
    g.strokeStyle = ink; g.lineWidth = .6; g.strokeRect(X - w / 2, Y - h, w, h); return true; }
  if (t === "lamp") { const neon = WSET[settingOf(WD)]?.neon; g.strokeStyle = "rgba(30,30,36,.8)"; g.lineWidth = .7; g.beginPath(); g.moveTo(X, Y + s); g.lineTo(X, Y - s); g.stroke(); g.fillStyle = neon ? "rgba(255,92,208,.55)" : "rgba(255,214,120,.5)"; g.beginPath(); g.arc(X, Y - s, s * .6, 0, 7); g.fill(); return true; }
  if (t === "snag") { g.strokeStyle = `rgb(${84 + q * 20},${70 + q * 14},${56})`; g.lineWidth = s * .26; g.lineCap = "round"; g.beginPath(); g.moveTo(X, Y + s * 1.1); g.lineTo(X + s * .1, Y - s * 1.1); g.moveTo(X + s * .05, Y - s * .1); g.lineTo(X - s * .7, Y - s * .7); g.moveTo(X + s * .08, Y - s * .5); g.lineTo(X + s * .7, Y - s * 1); g.stroke(); return true; }
  if (t === "rubble") { g.fillStyle = "rgba(96,88,80,.75)"; g.strokeStyle = "rgba(40,32,24,.6)"; g.lineWidth = .5; [[-.6, .2, .5], [.3, .3, .6], [0, -.3, .4]].forEach(([a, b, r]) => { g.beginPath(); g.moveTo(X + a * s - r * s, Y + b * s); g.lineTo(X + a * s, Y + b * s - r * s); g.lineTo(X + a * s + r * s, Y + b * s); g.closePath(); g.fill(); g.stroke(); }); return true; }
  if (t === "crystal") { const cs = [[0, 1.9, .5], [-.55, 1.2, .35], [.55, 1.35, .38]]; cs.forEach(([o, h, w], j) => { g.beginPath(); g.moveTo(X + o * s - w * s, Y + s * .9); g.lineTo(X + o * s, Y + s * .9 - h * s); g.lineTo(X + o * s + w * s, Y + s * .9); g.closePath(); g.fillStyle = j ? `rgba(${120 + q * 60},${90},${200},.85)` : `rgba(${90},${200},${210 - q * 40},.9)`; g.fill(); g.strokeStyle = ink; g.lineWidth = .6; g.stroke(); }); return true; }
  if (t === "spore") { g.strokeStyle = "rgba(60,40,70,.7)"; g.lineWidth = .6; g.beginPath(); g.moveTo(X, Y + s); g.lineTo(X, Y - s * .2); g.stroke(); g.fillStyle = `rgba(${200 + q * 40},${110},${180},.8)`; g.beginPath(); g.arc(X, Y - s * .3, s * .55, Math.PI, 0); g.fill(); return true; }
  return false;
}
function drawHouseAlt(g, it, ink) {
  const st = WSET[settingOf(WD)]; const style = st?.house || "roof"; if (style === "roof") return false; const { X, Y, s, q } = it;
  g.fillStyle = "rgba(30,24,14,.3)"; g.fillRect(X - s + 1, Y - s * .1 + 1.2, s * 2, s * 1.2);
  if (style === "flat") { const h = s * (1.2 + q * .9); g.fillStyle = q > .5 ? "#b9bcc4" : "#9ea3ad"; g.fillRect(X - s, Y + s - h, s * 2, h); g.strokeStyle = ink; g.lineWidth = .7; g.strokeRect(X - s, Y + s - h, s * 2, h); g.fillStyle = st.neon ? (q > .5 ? "#ff5cd0" : "#5ce8ff") : "#f0d080"; g.fillRect(X - s * .6, Y + s - h * .7, s * .35, s * .3); g.fillRect(X + s * .2, Y + s - h * .7, s * .35, s * .3); return true; }
  if (style === "ruin") { g.fillStyle = "#a89a86"; g.beginPath(); g.moveTo(X - s, Y + s); g.lineTo(X - s, Y - s * .3); g.lineTo(X - s * .3, Y - s * .1); g.lineTo(X + s * .1, Y - s * .6); g.lineTo(X + s, Y - s * .2); g.lineTo(X + s, Y + s); g.closePath(); g.fill(); g.strokeStyle = ink; g.lineWidth = .7; g.stroke(); g.fillStyle = "#4a4038"; g.fillRect(X - s * .5, Y + s * .1, s * .4, s * .5); return true; }
  if (style === "dome") { g.fillStyle = q > .5 ? "#dfe4ee" : "#c4ccda"; g.beginPath(); g.arc(X, Y + s * .7, s * 1.05, Math.PI, 0); g.closePath(); g.fill(); g.strokeStyle = ink; g.lineWidth = .7; g.stroke(); g.strokeStyle = "rgba(60,80,120,.5)"; g.beginPath(); g.arc(X, Y + s * .7, s * .6, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); g.fillStyle = "#7ac8ff"; g.beginPath(); g.arc(X + s * .4, Y + s * .2, s * .16, 0, 7); g.fill(); return true; }
  if (style === "pagoda") { g.fillStyle = "#e2d4b8"; g.fillRect(X - s * .8, Y - s * .1, s * 1.6, s * 1.1); g.strokeStyle = ink; g.lineWidth = .7; g.strokeRect(X - s * .8, Y - s * .1, s * 1.6, s * 1.1); g.fillStyle = roofCol(q);
    g.beginPath(); g.moveTo(X - s * 1.4, Y - s * .05); g.quadraticCurveTo(X - s * .6, Y - s * .3, X, Y - s * 1.05); g.quadraticCurveTo(X + s * .6, Y - s * .3, X + s * 1.4, Y - s * .05); g.closePath(); g.fill(); g.stroke(); return true; }
  return false;
}
