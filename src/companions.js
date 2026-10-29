/* =========================================================================
   СПУТНИКИ: вербовка, одобрение, бой, привал, личные истории
   ========================================================================= */
const PARTY_MAX = 2;
const COMP_TAGS = { mercy: "милосердие", cruelty: "жестокость", honesty: "честность", deceit: "хитрость", gold: "выгода", generosity: "щедрость", law: "закон и порядок", freedom: "свобода", faith: "вера", lore: "знания", bravery: "отвага", caution: "осторожность", helping: "помощь людям", violence: "сила" };
const COMP_ARCH = {
  guard: { n: "Страж", cls: "fighter", role: "tank", hp0: 14, hpl: 7, ac: 16, dmg: "1d8", skills: ["athletics", "intimidation", "perception"], likes: ["law", "bravery", "honesty"], dislikes: ["deceit", "caution", "cruelty"], ab: { id: "cover", n: "Заслон", d: "Принимает на себя удар, нацеленный в героя (раз за бой; верный — дважды)." }, kw: /страж|солдат|капитан|часовой|дозорн|рыцар|сержант|ополчен/ },
  merc: { n: "Наёмник", cls: "fighter", role: "striker", hp0: 13, hpl: 7, ac: 15, dmg: "1d10", skills: ["athletics", "survival", "intimidation"], likes: ["gold", "violence", "bravery"], dislikes: ["generosity", "mercy", "faith"], ab: { id: "cleave", n: "Сокрушительный удар", d: "Раз за бой бьёт в полную силу: +2d6 урона (верный — +3d6)." }, kw: /наём|наемн|охранник|вышибал|кулачн|боец|телохран/ },
  healer: { n: "Целитель", cls: "cleric", role: "healer", hp0: 10, hpl: 6, ac: 15, dmg: "1d6", skills: ["medicine", "religion", "insight"], likes: ["mercy", "helping", "faith"], dislikes: ["cruelty", "violence", "gold"], ab: { id: "heal", n: "Лечение ран", d: "Лечит раненого героя или поднимает спутника: 1d8 + 3 + уровень. Дважды за бой (верный — трижды)." }, kw: /жрец|жриц|сестра|брат |монах|послуш|настоят|лекар|целит|священ/ },
  herbal: { n: "Травник", cls: "druid", role: "healer", hp0: 9, hpl: 6, ac: 13, dmg: "1d8", rng: true, skills: ["nature", "medicine", "survival"], likes: ["helping", "caution", "freedom"], dislikes: ["cruelty", "gold", "law"], ab: { id: "heal", n: "Целебные травы", d: "Лечит раненого героя или поднимает спутника: 1d8 + 3 + уровень. Дважды за бой (верный — трижды)." }, kw: /знахар|травни|ведун|ведьм|друид|повитух/ },
  thief: { n: "Плут", cls: "rogue", role: "striker", hp0: 10, hpl: 6, ac: 14, dmg: "1d6", skills: ["sleight", "stealth", "deception"], likes: ["deceit", "freedom", "gold"], dislikes: ["law", "honesty", "faith"], ab: { id: "sneak", n: "Удар исподтишка", d: "Бьёт врага, которого отвлекает герой: +1d6 за каждые 2 уровня." }, kw: /вор|карман|контрабанд|плут|шулер|скупщ|бродяг|беспризор|игрок/ },
  hunter: { n: "Следопыт", cls: "ranger", role: "ranged", hp0: 11, hpl: 6, ac: 14, dmg: "1d8", rng: true, skills: ["survival", "perception", "nature"], likes: ["caution", "freedom", "helping"], dislikes: ["cruelty", "gold", "deceit"], ab: { id: "mark", n: "Метка охотника", d: "Стреляет в цель героя: +1d6 урона к каждому попаданию." }, kw: /охотн|следопыт|егер|лесни|рыбак|пастух|проводн|трапер/ },
  scholar: { n: "Книжник", cls: "wizard", role: "caster", hp0: 8, hpl: 5, ac: 12, dmg: "1d10", rng: true, skills: ["arcana", "history", "investigation"], likes: ["lore", "caution", "honesty"], dislikes: ["violence", "faith", "deceit"], ab: { id: "burst", n: "Огненная волна", d: "Раз за бой: 2d6 + уровень огнём по трём врагам (верный — дважды)." }, kw: /маг|учён|алхим|писар|книж|архив|чародей|астроло|смотрител/ },
  bard: { n: "Бард", cls: "bard", role: "support", hp0: 10, hpl: 6, ac: 13, dmg: "1d6", skills: ["performance", "persuasion", "insight"], likes: ["freedom", "generosity", "deceit"], dislikes: ["cruelty", "law", "gold"], ab: { id: "inspire", n: "Вдохновение", d: "Дарит герою преимущество на следующий бросок (раз в два раунда; верный — каждый раунд)." }, kw: /бард|музык|певец|певиц|скоморох|артист|сказит|менестр|трактирщ/ },
  zealot: { n: "Паладин", cls: "paladin", role: "tank", hp0: 13, hpl: 7, ac: 17, dmg: "1d8", skills: ["religion", "persuasion", "athletics"], likes: ["faith", "law", "mercy"], dislikes: ["deceit", "cruelty", "gold"], ab: { id: "smite", n: "Кара", d: "Раз за бой: +2d8 сияющего урона (верный — дважды)." }, kw: /паладин|храмов|инквиз|орден|клятв/ },
  brute: { n: "Громила", cls: "barbarian", role: "tank", hp0: 16, hpl: 8, ac: 14, dmg: "1d12", skills: ["athletics", "intimidation", "survival"], likes: ["violence", "bravery", "freedom"], dislikes: ["caution", "law", "lore"], ab: { id: "rage", n: "Ярость", d: "В бою получает вдвое меньше урона и бьёт сильнее (+2; верный — +4)." }, kw: /кузнец|грузчик|лесоруб|моряк|громил|дровосек|каменщ|мясник|рудокоп/ }
};
const COMP_EVENTS = {
  assault: { why: "напали на мирного", w: { cruelty: 3, violence: 2, mercy: -4, law: -3 } },
  kill: { why: "убили беззащитного", w: { cruelty: 4, mercy: -6, law: -4, helping: -2 } },
  spare: { why: "пощадили", w: { mercy: 3, cruelty: -2 } },
  quest: { why: "помогли людям", w: { helping: 4, generosity: 1 } },
  flee: { why: "отступили из боя", w: { caution: 3, bravery: -3, violence: -1 } },
  victory: { why: "выиграли бой", w: { bravery: 2, violence: 1, caution: -1 } },
  deceive: { why: "пошли на обман", w: { deceit: 3, honesty: -3 } },
  intimidate: { why: "давили угрозами", w: { violence: 2, cruelty: 1, mercy: -2 } },
  steal: { why: "запустили руку в чужое", w: { deceit: 2, gold: 2, law: -3, honesty: -2 } },
  share: { why: "поделились золотом", w: { generosity: 3, gold: -1 } }
};
const COMP_QT = {
  guard: { type: "hunt", foe: ["bandit", "Разбойник", 2], title: "Старый долг", item: null, brief: "«Те, кто вырезал мой дозор, засели у места «{p}». Я дал слово — и не сдержал. Поможешь мне его сдержать?»", past: "его дозор погиб, а он выжил — и не простил себе этого" },
  merc: { type: "fetch", title: "Отцовский клинок", item: "Отцовский клинок", brief: "«Мой клинок — отцовский — остался у места «{p}», когда меня там бросили подыхать. Без него я не я. Сходим?»", past: "его предал свой же отряд и бросил умирать" },
  healer: { type: "fetch", title: "Последняя склянка", item: "Склянка святой воды", brief: "«У места «{p}» я спрятал(а) то, что не успел(а) донести умирающим. Хочу закончить начатое.»", past: "однажды не успел(а) спасти тех, кто на него надеялся" },
  herbal: { type: "fetch", title: "Корень памяти", item: "Корень памяти", brief: "«У места «{p}» растёт корень, который помнит мою наставницу. Его надо забрать, пока не поздно.»", past: "наставницу изгнали из деревни, и он(а) не заступился(-ась)" },
  thief: { type: "fetch", title: "Чужая расписка", item: "Долговая расписка", brief: "«У места «{p}» лежит бумага с моим именем. Пока она там — я в долгу у очень злых людей.»", past: "задолжал(а) опасным людям и бежит от них" },
  hunter: { type: "hunt", foe: ["wolf", "Волк", 2], title: "Зверь, что взял след", item: null, brief: "«У места «{p}» ходит зверь, которого я когда-то не добил(а). Теперь он режет скот. Это моя вина.»", past: "когда-то пожалел(а) раненого зверя, и тот стал людоедом" },
  scholar: { type: "investigate", title: "Утерянная страница", item: null, brief: "«Моя книга обрывается на месте «{p}». Там — ответ, ради которого я ушёл(ушла) из академии.»", past: "его выгнали из академии за запретный вопрос" },
  bard: { type: "fetch", title: "Песня без конца", item: "Старая лютня", brief: "«Лютня моего учителя пропала у места «{p}». Без неё я не допою его последнюю песню.»", past: "учитель погиб, а песня осталась недопетой" },
  zealot: { type: "hunt", foe: ["skeleton", "Скелет", 2], title: "Нечестивое место", item: null, brief: "«У места «{p}» осквернена земля. Мой обет — очистить её. Встанешь рядом?»", past: "нарушил(а) обет однажды и с тех пор ищет искупления" },
  brute: { type: "hunt", foe: ["bandit", "Разбойник", 2], title: "Счёт к старым дружкам", item: null, brief: "«У места «{p}» сидят мои старые дружки. Они тогда сбежали, а я сел. Пора поговорить.»", past: "отсидел за чужое и ищет тех, кто его подставил" }
};
function compDef(id) { return S?.world?.comps && typeof S.world.comps === "object" ? S.world.comps[id] || null : null; }
function compArch(id) { return COMP_ARCH[compDef(id)?.arch] || COMP_ARCH.guard; }
function partyAll() { return S?.party || (S ? (S.party = []) : []); }
function inParty(id) { return partyAll().some(p => p.id === id); }
function compOf(id) { return partyAll().find(p => p.id === id) || null; }
function partyActive() { return partyAll().filter(p => !p.wait && NPCS[p.id] && !NPCS[p.id].dead); }
function partyHere() { const here = POIS[S.world.loc]?.npcs || []; return partyActive().filter(p => here.includes(p.id)); }
function compFighters() { return partyHere().filter(p => !p.down && p.hp > 0); }
function compMaxHp(p) { const A = COMP_ARCH[p.arch]; const L = C().level; return A.hp0 + (L - 1) * A.hpl + (p.loyal ? 6 : 0); }
function compAC(p) { const A = COMP_ARCH[p.arch]; return A.ac + (C().level >= 5 ? 1 : 0); }
function compAtk(p) { return 3 + prof(C().level) + (p.approval >= 61 ? 2 : p.approval >= 41 ? 1 : 0); }
function compTier(a) { return a <= -50 ? ["уходит", "t-x"] : a <= -20 ? ["недоволен", "t-neg"] : a <= 20 ? ["нейтрален", "t-neu"] : a <= 40 ? ["симпатизирует", "t-pos"] : a <= 60 ? ["доверяет", "t-pos2"] : a <= 80 ? ["предан", "t-hi"] : ["верен до конца", "t-max"]; }
function compTierF(p) { const [t, c] = compTier(p.approval); return [isFem(NPCS[p.id]) ? t.replace(/(недоволен|нейтрален|предан|верен)\b/, m => ({ недоволен: "недовольна", нейтрален: "нейтральна", предан: "предана", верен: "верна" })[m]) : t, c]; }
function compName(id) { return NPCS[id]?.name || "спутник"; }
function compShort(id) { const w = (NPCS[id]?.name || "спутник").split(" "); return w.length > 1 && /^(сестра|брат|отец|мать|старый|старая|дядя|тётка|мастер|матушка|батюшка|сэр|леди|госпожа|господин|бабка|дед)$/i.test(w[0]) ? w[w.length - 1] : w[0]; }
function compAbUses(p) { const id = COMP_ARCH[p.arch].ab.id; return id === "heal" ? (p.loyal ? 3 : 2) : ["burst", "smite", "cover"].includes(id) ? (p.loyal ? 2 : 1) : id === "cleave" ? 1 : 99; }
/* ---------- кандидаты ---------- */
function compPickArch(n) { const t = `${n.role || ""} ${n.persona || ""}`.toLowerCase(); for (const [k, A] of Object.entries(COMP_ARCH)) if (A.kw.test(t)) return k; const keys = Object.keys(COMP_ARCH); return keys[hash(n.name || "x") % keys.length]; }
function compSuspect(n) { return /злоде|убил|убийц|культ|предал|предат|виновн|сделк|похит|одержим|чудовищ|некромант|ведьм.*сжег|заговор|главар|стоит за/i.test(`${n.secret || ""} ${n.persona || ""}`); }
function compFallbackDefs() {
  const out = {}; const list = Object.entries(NPCS).filter(([id, n]) => !n.traveler && !n.dead && !n.bld && !compSuspect(n) && id !== WD.villainNpc);
  const pool = list.length >= 2 ? list : Object.entries(NPCS).filter(([, n]) => !n.traveler && !n.dead && !compSuspect(n));
  const used = new Set(); pool.sort((a, b) => hash(a[0]) - hash(b[0])).slice(0, 6).forEach(([id, n]) => { if (Object.keys(out).length >= 3) return; let arch = compPickArch(n); if (used.has(arch)) { const free = Object.keys(COMP_ARCH).filter(k => !used.has(k)); arch = free[hash(id) % free.length]; } used.add(arch); const A = COMP_ARCH[arch];
    out[id] = { arch, motive: isFem(n) ? "Устала от одного и того же и ищет повод уйти отсюда." : "Устал от одного и того же и ищет повод уйти отсюда.", voice: n.persona || "", likes: A.likes.slice(), dislikes: A.dislikes.slice(), past: COMP_QT[arch].past, join: arch === "merc" ? "gold" : "trust", price: 15 }; });
  return out;
}
let compGenBusy = false;
async function compGen() {
  if (compGenBusy || !S) return; const w = S.world; if (w.comps && typeof w.comps === "object") return; compGenBusy = true; const sid = S.id;
  let defs = null;
  try { if (typeof sample !== "undefined" && sample?.json) {
    const npcs = Object.entries(NPCS).filter(([, n]) => !n.traveler && !n.dead).map(([id, n]) => `- ${id}: ${n.name}, ${n.role}. ${n.persona || ""} Тайна: ${n.secret || "—"}`).join("\n");
    const r = await sample.json(`Ты — мастер настольной ролевой игры. Мир: ${WD.name}. ${WD.public || ""} Тайна мира (скрыта от игрока): ${WD.secret || WD.truth || ""}
Жители:
${npcs}
Выбери 2–3 жителей, которые могли бы стать СПУТНИКАМИ героя (как в Baldur's Gate 3): у них есть причина уйти в путь. НЕ выбирай злодея, его сообщников и тех, чья тайна делает их врагами героя.
Архетипы (arch): ${Object.entries(COMP_ARCH).map(([k, a]) => `${k} — ${a.n}`).join(", ")}. Подбери по роли и характеру, все разные.
Ценности (likes/dislikes, по 3, не пересекаются): ${Object.entries(COMP_TAGS).map(([k, v]) => `${k} (${v})`).join(", ")}.
Ответь только JSON: {"companions":[{"id":"id жителя","arch":"guard","motive":"зачем пойдёт с героем, 1 предложение","voice":"как говорит, манера, 1 предложение","likes":["law","bravery","honesty"],"dislikes":["deceit","caution","cruelty"],"past":"личная боль или тайна из прошлого, которую он раскроет, когда начнёт доверять, 1 предложение","join":"trust|gold","price":15}]}`);
    const arr = Array.isArray(r?.companions) ? r.companions : [];
    const okTag = t => Object.prototype.hasOwnProperty.call(COMP_TAGS, t);
    arr.slice(0, 3).forEach(x => { if (!x || !NPCS[x.id] || NPCS[x.id].traveler) return; const arch = COMP_ARCH[x.arch] ? x.arch : compPickArch(NPCS[x.id]); const A = COMP_ARCH[arch];
      let likes = (Array.isArray(x.likes) ? x.likes : []).filter(okTag).slice(0, 3); let dislikes = (Array.isArray(x.dislikes) ? x.dislikes : []).filter(t => okTag(t) && !likes.includes(t)).slice(0, 3);
      if (likes.length < 2) likes = A.likes.slice(); if (dislikes.length < 2) dislikes = A.dislikes.filter(t => !likes.includes(t));
      (defs = defs || {})[x.id] = { arch, motive: str(x.motive, 160), voice: str(x.voice, 160), likes, dislikes, past: str(x.past, 200) || COMP_QT[arch].past, join: x.join === "gold" ? "gold" : "trust", price: clamp(Math.round(Number(x.price) || 15), 5, 60) }; });
  } } catch (e) { console.warn("compGen", e); }
  compGenBusy = false; if (!S || S.id !== sid) return;
  S.world.comps = defs && Object.keys(defs).length ? defs : compFallbackDefs(); save(); try { renderWorld(); } catch (e) {}
}
function compCandidate(id) { const d = compDef(id); return !!(d && NPCS[id] && !NPCS[id].dead && !inParty(id) && !S.world.hostile?.[id] && !(S.world.compGone || {})[id]); }
function compRecruitReady(id) { if (!compCandidate(id)) return false; const met = (S.world.met || []).includes(id) || (S.world.npcs[id]?.mem || []).length; return !!met; }
/* ---------- одобрение ---------- */
function compApprove(id, d, why, opts = {}) {
  const p = compOf(id); if (!p || !d || p.wait) return; d = clamp(Math.round(d), -10, 10); if (!d) return; const before = p.approval; p.approval = clamp(before + d, -100, 100);
  p.log = p.log || []; p.log.push({ d, why: str(why, 60), day: worldTime().day }); if (p.log.length > 12) p.log.splice(0, p.log.length - 12);
  if (opts.tag) { p.known = p.known || {}; p.known[opts.tag] = 1; }
  const n = NPCS[id]; const f = isFem(n); pushFeed({ t: "chips", items: [{ c: d > 0 ? "appr-up" : "appr-dn", x: `${d > 0 ? "▲" : "▼"} ${n.name} ${d > 0 ? (f ? "одобряет" : "одобряет") : (f ? "не одобряет" : "не одобряет")}${why ? ": " + str(why, 50) : ""}` }] });
  setTimeout(() => sfx(d > 0 ? "chime" : "thud", .5), 120);
  const crossed = th => before > th && p.approval <= th; const floor = p.loyal ? -80 : -50;
  if (p.approval <= floor) { setTimeout(() => compLeave(id, "approval"), 50); return; }
  if (crossed(-20) || crossed(-40)) pushFeed({ t: "sys", html: `<b>${esc(n.name)}</b> ${f ? "недовольна" : "недоволен"} вами. ${p.approval <= -40 ? "Ещё немного — и уйдёт." : "Терпение не бесконечно."}` });
  const up = th => before < th && p.approval >= th; if (up(21) || up(41) || up(61) || up(81)) pushFeed({ t: "sys", html: `<b>${esc(n.name)}</b>: ${compTierF(p)[0]}. ${up(41) ? "Теперь в бою бьёт точнее и прикрывает вас." : up(21) ? "Теперь помогает вам в проверках своих навыков." : up(61) ? "Сражается на пределе сил ради вас." : "Пойдёт за вами куда угодно."}` });
}
function compReact(ev, extraWhy) {
  const E = COMP_EVENTS[ev]; if (!E || !S) return; partyHere().forEach(p => { const d0 = compDef(p.id) || COMP_ARCH[p.arch]; let d = 0, tag = null;
    for (const [t, w] of Object.entries(E.w)) { if (d0.likes?.includes(t)) { d += w; tag = tag || t; } else if (d0.dislikes?.includes(t)) { d -= w; tag = tag || t; } }
    if (d) compApprove(p.id, d, extraWhy || E.why, { tag }); });
}
function compLeave(id, why) {
  const p = compOf(id); if (!p) return; const n = NPCS[id]; const f = isFem(n); S.party = partyAll().filter(x => x.id !== id);
  S.world.npcLoc = S.world.npcLoc || {}; S.world.npcLoc[id] = S.world.loc; const st = ensureNpcState(id) || S.world.npcs[id];
  if (why === "approval") { (S.world.compGone = S.world.compGone || {})[id] = worldTime().day; if (st) { st.att = clamp((st.att || 0) - 25, -100, 100); st.mem?.push("ушёл(ушла) из отряда героя, разочаровавшись в нём"); }
    pushFeed({ t: "sys", html: `<b>${esc(n.name)} ${f ? "уходит" : "уходит"} из отряда.</b> «С меня хватит».` }); sfx("thud"); S.pendingQNote = `${n.name} разочаровал${f ? "ась" : "ся"} в герое и уходит из отряда прямо сейчас. Сыграй короткое, горькое прощание в характере: что именно ${f ? "её" : "его"} оттолкнуло (последние поступки героя). Обратно ${f ? "она" : "он"} не вернётся.`; }
  else if (why === "hostile") pushFeed({ t: "sys", html: `<b>${esc(n.name)}</b> больше не ваш${f ? "а" : ""} спутни${f ? "ца" : "к"}.` });
  else { pushFeed({ t: "sys", html: `<b>${esc(n.name)}</b> покидает отряд и остаётся здесь: «${f ? "Найдёшь меня, если понадоблюсь" : "Найдёшь меня, если понадоблюсь"}».` }); if (st) st.mem?.push("герой отпустил из отряда"); }
  refreshPeople(); renderAll(); save();
}
/* ---------- вербовка ---------- */
function compJoin(id, how) {
  if (inParty(id) || !NPCS[id]) return; const d = compDef(id) || (S.world.comps = { ...(S.world.comps || {}), [id]: compFallbackOne(id) })[id]; const n = NPCS[id]; const f = isFem(n);
  const att = S.world.npcs[id]?.att || 0; const p = { id, arch: d.arch, approval: clamp(10 + Math.round(att / 3), 0, 30), loyal: false, tactic: "free", wait: false, joined: S.turn, day: worldTime().day, log: [], known: {}, used: {}, hp: 0 };
  p.hp = compMaxHp(p); partyAll().push(p); S.world.npcLoc = S.world.npcLoc || {}; S.world.npcLoc[id] = S.world.loc; if (S.world.awayUntil) delete S.world.awayUntil[id]; refreshPeople();
  pushFeed({ t: "chips", items: [{ c: "xp", x: `${n.name} ${f ? "присоединяется" : "присоединяется"} к отряду · ${COMP_ARCH[d.arch].n}` }] }); setTimeout(() => sfx("fanfare", .6), 80);
  S.pendingQNote = `${n.name} (${n.role}) соглашается идти с героем${how === "gold" ? " за плату — деньги уже переданы движком" : ""}. Мотив: ${d.motive || "свой"}. Сыграй короткий момент: как ${f ? "она" : "он"} собирается в путь и что говорит герою, в характере (${d.voice || n.persona || ""}). Теперь ${f ? "она" : "он"} — спутни${f ? "ца" : "к"} героя и следует за ним.`;
  setTimeout(() => tipOnce("party"), 2500);
  takeTurn(`${n.name}, пойдём со мной.`, { checks: [], talk_to: id });
}
function compFallbackOne(id) { const n = NPCS[id]; const arch = compPickArch(n); const A = COMP_ARCH[arch]; return { arch, motive: isFem(n) ? "Решила, что с героем интереснее, чем здесь." : "Решил, что с героем интереснее, чем здесь.", voice: n.persona || "", likes: A.likes.slice(), dislikes: A.dislikes.slice(), past: COMP_QT[arch].past, join: "trust", price: 15 }; }
function openRecruit(id, agreed) {
  if (!compCandidate(id) && !agreed) return; if (!compDef(id)) { S.world.comps = { ...(typeof S.world.comps === "object" ? S.world.comps : {}), [id]: compFallbackOne(id) }; }
  const d = compDef(id); const A = COMP_ARCH[d.arch]; const n = NPCS[id]; const f = isFem(n); const att = S.world.npcs[id]?.att || 0; const c = C();
  const full = partyActive().length >= PARTY_MAX; const trust = agreed || att >= 8; const price = d.join === "gold" ? d.price + 5 * (c.level - 1) : 0; const today = worldTime().day; const tried = (S.world.compTry || {})[id] === today;
  const known = (d.likes || []).slice(0, 1).map(t => COMP_TAGS[t]);
  const html = `<div class="cr"><div class="cr-head">${npcPh(id, "cr-ph")}<div><div class="eyebrow">Возможный спутник · ${A.n} · ${esc(CLASSES[A.cls]?.name || "")}</div><h2>${esc(n.name)}</h2><small class="home-note">${esc(n.role)} · ${attLabel(att)[0]}</small></div></div>
    ${d.motive ? `<blockquote class="cr-q">${esc(d.motive)}</blockquote>` : ""}
    <div class="cr-grid"><div><h4>В бою</h4><p>${{ tank: "Держит удар и прикрывает героя.", striker: "Наносит много урона.", healer: "Лечит и поднимает павших.", ranged: "Стреляет издалека.", caster: "Бьёт магией по нескольким врагам.", support: "Вдохновляет и помогает." }[A.role]}</p><p class="cr-ab"><b>${esc(A.ab.n)}.</b> ${esc(A.ab.d)}</p></div>
      <div><h4>Помогает в навыках</h4><div class="cr-tags">${A.skills.map(s => `<span>${esc(SKILLS[s][0])}</span>`).join("")}</div><h4>Что ценит</h4><div class="cr-tags">${known.map(t => `<span class="lk">${esc(t)}</span>`).join("")}<span class="unk">остальное узнаете в пути</span></div></div></div>
    ${full ? `<p class="cr-warn">Отряд полон (${PARTY_MAX}). Сначала отпустите кого-то.</p>` : !trust && d.join !== "gold" ? `<p class="cr-warn">${esc(n.name)} пока недостаточно вам доверяет (нужно хотя бы «дружелюбно»). Можно попробовать убедить${tried ? " — но сегодня уже пробовали" : ""}.</p>` : ""}
    <div class="row">${`<button class="btn" type="button" id="cr-no">Не сейчас</button>`}${!full && d.join === "gold" && !agreed ? `<button class="btn primary" type="button" id="cr-pay" ${purse(c) < price * 10 ? "disabled" : ""}>${COIN} Нанять за ${price} зм</button>` : ""}${!full && !trust && d.join !== "gold" && !tried ? `<button class="btn" type="button" id="cr-talk">Уговорить <small>Убежд. ${fmt(skillBonus("persuasion"))} · КС 14</small></button>` : ""}${!full && (trust && d.join !== "gold" || agreed) ? `<button class="btn primary" type="button" id="cr-yes">Принять в отряд</button>` : ""}</div></div>`;
  modal(html, root => { root.querySelector(".modal").classList.add("cr-modal");
    root.querySelector("#cr-no").onclick = closeModal;
    root.querySelector("#cr-yes")?.addEventListener("click", () => { closeModal(); compJoin(id, "trust"); });
    root.querySelector("#cr-pay")?.addEventListener("click", () => { setPurse(c, purse(c) - price * 10); pushFeed({ t: "chips", items: [{ c: "gold", x: `−${price} зм` }] }); closeModal(); compJoin(id, "gold"); });
    root.querySelector("#cr-talk")?.addEventListener("click", () => { closeModal(); (S.world.compTry = S.world.compTry || {})[id] = today; S.pendingRecruit = id; S.dlgPending = id;
      takeTurn(`Уговариваю ${n.name} пойти со мной`, { checks: [{ kind: "skill", skill: "persuasion", dc: 14, reason: "Позвать в отряд" }], talk_to: id }); });
  });
}
/* ---------- бой ---------- */
function compRoll(adv) { const a = rnd(20), b = rnd(20); return { nat: adv > 0 ? Math.max(a, b) : adv < 0 ? Math.min(a, b) : a, pair: adv ? [a, b] : null }; }
function compFoeTarget(p) { const al = aliveEnemiesHere(); if (!al.length) return null; const t = curTarget(); if (p.tactic === "focus" && t) return t;
  if (COMP_ARCH[p.arch].role === "caster" || COMP_ARCH[p.arch].role === "ranged") return al.slice().sort((a, b) => S.world.enemies[a].hp - S.world.enemies[b].hp)[0];
  return al.find(id => S.world.enemies[id].intent?.tg === p.id) || t || al[0]; }
function compStrike(p, tgt, extra) {
  const A = COMP_ARCH[p.arch]; const E = ENEMIES[tgt]; const fc = fcond(tgt); let adv = 0; const notes = []; if (fc.prone && !A.rng) { adv++; notes.push("враг на земле"); }
  const r = compRoll(adv); const bonus = compAtk(p); const tot = r.nat + bonus; const ac = E.ac; const hit = r.nat === 20 || (r.nat !== 1 && tot >= ac); const crit = r.nat === 20; let dmg = 0, txt = "";
  if (hit) { const d = rollDice(A.dmg, crit); dmg = d.total + 3; txt = ` · урон ${d.text} +3`;
    if (A.ab.id === "rage") { const b = p.loyal ? 4 : 2; dmg += b; txt += ` +${b} ярость`; }
    if (A.ab.id === "sneak" && tgt === curTarget()) { const k = Math.max(1, Math.ceil(C().level / 2)); const s = rollDice(`${k}d6`, crit); dmg += s.total; txt += ` + ${s.text} исподтишка`; }
    if (A.ab.id === "mark" && tgt === curTarget()) { const s = rollDice("1d6", crit); dmg += s.total; txt += ` + ${s.text} метка`; }
    if (extra) { const s = rollDice(extra.dice, crit); dmg += s.total; txt += ` + ${s.text} ${extra.n.toLowerCase()}`; }
    S._hitInfo = { crit }; hurtEnemy(tgt, dmg); }
  return { kind: "comp", comp: p.id, target: tgt, ranged: !!A.rng, title: `${compName(p.id)}: ${extra ? extra.n : A.rng ? "выстрел" : "удар"} — ${E.name}`, nat: r.nat, pair: r.pair, total: tot, ok: hit, crit, cdmg: dmg,
    formula: `d20 (${r.pair ? r.pair.join(" / ") : r.nat}) +${bonus} = ${tot} против КД ${ac}${notes.length ? " · " + notes.join(", ") : ""}${hit ? txt + ` = ${dmg}` : " · промах"}`, enemyAfter: enemyStatus(tgt) };
}
function compHealAmt(p) { const r = rollDice("1d8"); const L = C().level; const bonus = 3 + L + (p.loyal ? 3 : 0); return { total: r.total + bonus, text: `${r.text} +${bonus}` }; }
function compAct(p) {
  const A = COMP_ARCH[p.arch]; const c = C(); const al = aliveEnemiesHere(); if (!al.length) return null; p.used = p.used || {}; if (p.used.fid !== S.world.fightId) p.used = { fid: S.world.fightId };
  const uses = compAbUses(p); const used = k => (p.used[k] || 0) >= uses; const use = k => { p.used[k] = (p.used[k] || 0) + 1; };
  const nm = compName(p.id);
  if (A.ab.id === "heal" && !used("heal")) {
    const pal = partyHere().find(x => x.down && x.id !== p.id);
    if (c.hp > 0 && c.hp <= c.maxHp * .45 && p.tactic !== "focus") { use("heal"); const h = compHealAmt(p); const got = healHero(h.total); return { kind: "comp", comp: p.id, heal: got, title: `${nm} лечит вас`, nat: 0, ok: true, verdict: `+${got} HP`, formula: `${A.ab.n}: ${h.text} = ${h.total}` }; }
    if (pal) { use("heal"); const h = compHealAmt(p); pal.down = false; pal.hp = Math.min(compMaxHp(pal), h.total); return { kind: "comp", comp: p.id, title: `${nm} поднимает: ${compName(pal.id)}`, nat: 0, ok: true, verdict: `+${pal.hp} HP`, formula: `${A.ab.n}: ${h.text}` }; } }
  if (A.ab.id === "inspire" && !c.bless && (p.loyal || (S.world.round || 1) % 2 === 1)) { c.bless = true; return { kind: "comp", comp: p.id, title: `${nm}: вдохновение`, nat: 0, ok: true, verdict: "Преимущество", formula: "Следующий ваш бросок — с преимуществом" }; }
  if (A.ab.id === "burst" && !used("burst") && al.length >= 2) { use("burst"); const L = C().level; const dc = 11 + prof(L); const d = rollDice("2d6"); const base = d.total + L; const parts = [];
    al.slice(0, 3).forEach(id => { const E = ENEMIES[id]; const sv = rnd(20) + (E.dex || 0); const half = sv >= dc; const dm = half ? Math.floor(base / 2) : base; hurtEnemy(id, dm); parts.push(`${E.name}: ${half ? "½ " : ""}${dm}${S.world.enemies[id].alive ? "" : " ✝"}`); });
    return { kind: "comp", comp: p.id, aoe: true, title: `${nm}: ${A.ab.n}`, nat: 0, ok: true, verdict: "Огонь!", formula: `${d.text} + ${L} = ${base} огнём, спасбросок ЛОВ КС ${dc} · ${parts.join(", ")}`, target: al[0], enemyAfter: enemyStatus(al[0]) }; }
  const tgt = compFoeTarget(p); if (!tgt) return null;
  if ((A.ab.id === "smite" || A.ab.id === "cleave") && !used(A.ab.id) && (ENEMIES[tgt].boss || S.world.enemies[tgt].hp > 8 || (S.world.round || 1) >= 2)) { const r = compStrike(p, tgt, { n: A.ab.n, dice: A.ab.id === "smite" ? "2d8" : (p.loyal ? "3d6" : "2d6") }); if (r.ok) use(A.ab.id); return r; }
  return compStrike(p, tgt);
}
function compTurn() {
  const out = []; if (!S.world.combat || C().hp <= 0) return out;
  for (const p of compFighters()) { if (!aliveEnemiesHere().length) break; const r = compAct(p); if (r) out.push(r); }
  return out;
}
function compIntercept(foe) {
  const g = compFighters().find(p => (p.tactic === "guard" || COMP_ARCH[p.arch].ab.id === "cover") && p.approval >= (COMP_ARCH[p.arch].ab.id === "cover" ? 0 : 41) && ((p.used?.fid === S.world.fightId ? p.used.cover || 0 : 0) < (COMP_ARCH[p.arch].ab.id === "cover" ? compAbUses(p) : 1)));
  if (!g || Math.random() > .55) return null; g.used = g.used?.fid === S.world.fightId ? g.used : { fid: S.world.fightId }; g.used.cover = (g.used.cover || 0) + 1; return g;
}
function compTakeHit(foe, sp, p, cover) {
  const E = ENEMIES[foe], K = kitOf(foe); const ac = compAC(p); let adv = 0; if (K.pack && aliveEnemiesHere().some(x => x !== foe && ENEMIES[x].type === E.type)) adv++; if (sp?.adv) adv++;
  const r = compRoll(clamp(adv, -1, 1)); const tot = r.nat + E.atk; const hit = r.nat === 20 || (r.nat !== 1 && tot >= ac); let dmg = 0, txt = "";
  if (hit) { const d = rollDice(sp?.dmg || E.dmg, r.nat === 20); dmg = d.total * (sp?.mul || 1); txt = ` · урон ${d.text}`; if (COMP_ARCH[p.arch].ab.id === "rage") { dmg = Math.ceil(dmg / 2); txt += " ÷2 ярость"; } p.hp = Math.max(0, p.hp - dmg); if (p.hp === 0) p.down = true; }
  const nm = compName(p.id);
  return { kind: "enemy", by: foe, vsComp: p.id, title: cover ? `${nm} заслоняет вас от удара: ${E.name}` : `${E.name} → ${nm}`, nat: r.nat, pair: r.pair, total: tot, ok: hit, crit: r.nat === 20, enemyRoll: true, dmg: 0, snd: sp?.s,
    verdict: hit ? (p.down ? `${nm}: без сознания` : `${nm}: −${dmg}`) : "Промах",
    formula: `d20 (${r.pair ? r.pair.join(" / ") : r.nat}) +${E.atk} = ${tot} против КД ${ac} (${nm})${hit ? txt + ` → ${p.hp}/${compMaxHp(p)} HP${p.down ? " — падает без сознания" : ""}` : " · промах"}` };
}
function compPickFoeTarget(id) {
  const ps = compFighters(); if (!ps.length) return "hero"; const ws = [["hero", 1.15]]; ps.forEach(p => { const A = COMP_ARCH[p.arch]; let w = A.role === "tank" ? .85 : A.rng || A.role === "caster" ? .35 : .55; if (p.tactic === "guard") w += .5; ws.push([p.id, w]); });
  const sum = ws.reduce((s, x) => s + x[1], 0); let r = Math.random() * sum; for (const [k, w] of ws) { r -= w; if (r <= 0) return k; } return "hero";
}
function compFx(r) {
  const hud = document.getElementById("combat-hud"); const src = scTok("npc:" + r.comp); const card = r.target ? hud?.querySelector(`.cb-foe[data-id="${r.target}"]`) : null; const foe = r.target ? scTok("foe:" + r.target) : null;
  const pc = hud?.querySelector(`.cbp[data-id="${r.comp}"]`); pulse(pc, "act", 700);
  if (r.heal || r.verdict === "Преимущество" || /поднимает/.test(r.title)) { floatNum(hud?.querySelector(r.heal ? ".cb-hero" : `.cbp[data-id="${r.comp}"]`) || pc, r.verdict, "heal"); return; }
  if (!r.target) return; if (r.aoe) { boltFx(src, foe, "#ff9a4a", true); } else if (r.ranged) arrowFx(src, foe); else lunge(src, foe);
  setTimeout(() => { if (r.ok) { pulse(card, r.crit ? "crit" : "hit", 650); floatNum(card, (r.cdmg ? "−" + r.cdmg : "✓") + (r.crit ? " КРИТ" : ""), r.crit ? "crit" : "dmg"); slashFx(foe, r.crit, "#9fd4ff"); } else { pulse(card, "miss", 500); floatNum(card, "промах", "miss"); }
    if (r.enemyAfter === "повержен") setTimeout(() => { pulse(card, "dying", 900); deathFx(foe); }, 260); }, 180);
}
const COMP_TACTICS = { free: ["Сам(а) решает", "по обстановке"], focus: ["Бьёт вашу цель", "вместе по одной цели"], guard: ["Охраняет вас", "чаще принимает удары на себя"] };
function partyHudHTML() {
  const ps = partyHere(); if (!ps.length) return "";
  return ps.map(p => { const mx = compMaxHp(p); const hp = p.down ? 0 : p.hp / mx; const n = NPCS[p.id]; const t = COMP_TACTICS[p.tactic || "free"];
    return `<div class="cbp${p.down ? " down" : ""}" data-id="${p.id}">${npcPh(p.id, "cbp-ph")}<div class="cbp-b"><b>${esc(n.name)}</b><span class="cb-hp sm"><i style="width:${hp * 100}%;background:${hp > .5 ? "var(--kelp)" : hp > .25 ? "var(--lantern)" : "var(--ember)"}"></i><b>${p.down ? "без сознания" : `${p.hp}/${mx}`}</b></span></div><button type="button" class="cbp-t" data-tac="${p.id}" title="Тактика: ${t[1]}. Нажмите, чтобы сменить">${t[0]}</button></div>`; }).join("");
}
/* ---------- помощь в проверках ---------- */
function compHelpFor(skill) { if (!S?.world || S.world.combat) return null; return partyHere().find(p => !p.down && p.approval >= 21 && COMP_ARCH[p.arch].skills.includes(skill)) || null; }
/* ---------- привал ---------- */
function compQuestEligible(p) { return p && !p.qid && p.approval >= 30 && (S.turn - (p.joined || 0) >= 6 || worldTime().day > (p.day || 1)); }
function compMakeQuest(p) {
  const T = COMP_QT[p.arch] || COMP_QT.guard; const n = NPCS[p.id]; const f = isFem(n); const fx = s => String(s).replace(/\(а\)/g, f ? "а" : "").replace(/\(-ась\)/g, f ? "ась" : "ся").replace(/он\(а\)/g, f ? "она" : "он").replace(/ушёл\(ушла\)/g, f ? "ушла" : "ушёл");
  const places = Object.entries(POIS).filter(([id, pl]) => !pl.inner && id !== WD.start && pl.where !== "village" && !pl.wild && id !== S.world.loc); if (!places.length) return null;
  const [tid, tp] = places[hash(p.id + "cq") % places.length]; const id = "cq_" + p.id; WD.quests = WD.quests || {};
  const q = { id, giver: p.id, comp: true, type: T.type, target: tid, reward: { gold: 0, xp: 150 + 25 * C().level }, title: T.title, brief: fx(T.brief).replace("{p}", tp.name),
    goal: (T.type === "hunt" ? `Разобраться с теми, кто засел у места «${tp.name}»` : T.type === "fetch" ? `Найти у места «${tp.name}» вещь: ${T.item.toLowerCase()}` : `Выяснить, что скрывает место «${tp.name}»`) + ` (личная история: ${n.name})` };
  if (T.type === "hunt") q.foe = { type: T.foe[0], n: T.foe[2], name: T.foe[1] }; if (T.type === "fetch") { q.item = T.item; q.objk = "chest"; } if (T.type === "investigate") q.obj = "старые записи";
  WD.quests[id] = q; p.qid = id; return id;
}
function openCamp() {
  if (!S || busy || S.world.combat || !partyHere().length) return; const ps = partyHere(); const today = worldTime().day;
  const rows = ps.map(p => { const n = NPCS[p.id]; const [tl, tc] = compTierF(p); const talked = p.talkDay === today; const eligible = compQuestEligible(p);
    return `<div class="cf-c">${npcPh(p.id, "cf-ph")}<div class="cf-b"><b>${esc(n.name)}</b><span class="tier ${tc}">${tl}</span>${compMeterHTML(p)}<div class="cf-acts"><button class="btn small" type="button" data-talk="${p.id}" ${talked ? "disabled" : ""}>${talked ? "Уже говорили сегодня" : "Поговорить по душам"}</button>${eligible ? `<button class="btn small primary" type="button" data-past="${p.id}">★ Спросить, что гложет</button>` : ""}</div></div></div>`; }).join("");
  modal(`<div class="cf"><div class="cf-fire" aria-hidden="true"><i></i><i></i><i></i><span></span></div><div class="eyebrow">${inSettlement(S.world.loc) ? "Ночлег" : "Привал"} · ночь ${today}</div><h2>${inSettlement(S.world.loc) ? "У очага" : "У костра"}</h2><p class="home-note">Огонь потрескивает. Самое время поговорить — у огня люди раскрываются.</p><div class="cf-list">${rows}</div>
    <div class="row">${ps.length >= 2 ? `<button class="btn" type="button" id="camp-banter">Послушать, о чём они спорят</button>` : ""}<button class="btn primary" type="button" id="camp-x">Спать</button></div></div>`, root => {
    root.querySelector(".modal").classList.add("cf-modal"); root.querySelector("#camp-x").onclick = closeModal;
    root.querySelectorAll("[data-talk]").forEach(b => b.onclick = () => { closeModal(); compCampTalk(b.dataset.talk); });
    root.querySelectorAll("[data-past]").forEach(b => b.onclick = () => { closeModal(); compAskPast(b.dataset.past); });
    root.querySelector("#camp-banter")?.addEventListener("click", () => { closeModal(); const [a, b2] = ps; S.pendingQNote = `Привал у костра. ${NPCS[a.id].name} и ${NPCS[b2.id].name} (спутники героя) спорят или подшучивают друг над другом — короткая живая сценка из 4–6 реплик, в их характерах и ценностях (${compValuesLine(a.id)} / ${compValuesLine(b2.id)}). Можно затронуть последние поступки героя. Герой слушает.`; takeTurn("Слушаю, о чём спорят у костра", { checks: [] }); });
  });
}
function compValuesLine(id) { const d = compDef(id) || COMP_ARCH[compOf(id)?.arch] || {}; return `ценит ${(d.likes || []).map(t => COMP_TAGS[t]).join(", ")}; не терпит ${(d.dislikes || []).map(t => COMP_TAGS[t]).join(", ")}`; }
function compCampTalk(id) {
  const p = compOf(id); if (!p || busy) return; const n = NPCS[id]; const d = compDef(id) || {}; const f = isFem(n); p.talkDay = worldTime().day; p.talks = (p.talks || 0) + 1;
  compApprove(id, 2, "разговор у костра");
  const [tl] = compTierF(p); const depth = p.approval >= 41 ? "открыто, почти исповедь" : p.approval >= 21 ? "доверительно, но кое-что недоговаривает" : "сдержанно, присматривается к герою";
  S.pendingQNote = `Привал у костра. Герой разговаривает по душам со спутни${f ? "цей" : "ком"} ${n.name}. ${f ? "Она" : "Он"} говорит ${depth} (отношение к герою: ${tl}). ${p.talks <= 1 ? "Пусть расскажет, почему на самом деле пошл" + (f ? "а" : "ёл") + " с героем" + (d.motive ? ` (${d.motive})` : "") + "." : `Тема — что-то из прошлого: ${d.past || "старая боль"}${p.approval < 30 ? " — только намёком, без подробностей" : ""}.`} Спроси героя о чём-то в ответ. Говори в характере: ${d.voice || n.persona || ""}.`;
  S.dlgPending = id; takeTurn(`Сажусь у костра рядом: ${n.name}`, { checks: [], talk_to: id });
}
function compAskPast(id) {
  const p = compOf(id); if (!p || busy) return; const qid = compMakeQuest(p); const n = NPCS[id]; const d = compDef(id) || {};
  if (!qid) { compCampTalk(id); return; }
  S.pendingQNote = `${n.name} наконец открывается герою: ${d.past || "старая боль"}. Это личная история спутника — сыграй признание (3–5 реплик), без пафоса. В конце ${isFem(n) ? "она" : "он"} просит помочь: ${WD.quests[qid].brief} Поручение оформит движок.`;
  takeTurn(`${n.name}, что тебя гложет?`, { checks: [], talk_to: id });
  const iv = setInterval(() => { if (!busy) { clearInterval(iv); if (qSt(qid).st === "new") openQuestOffer(qid); } }, 500);
}
/* ---------- карточки и окна ---------- */
function compMeterHTML(p) { const a = p.approval; const pos = (a + 100) / 2; return `<div class="appr" title="Одобрение: ${a} из 100"><i class="appr-z"></i><i class="appr-f ${a >= 0 ? "pos" : "neg"}" style="left:${a >= 0 ? 50 : pos}%;width:${Math.abs(a) / 2}%"></i><i class="appr-m" style="left:${pos}%"></i><i class="appr-t" style="left:60%"></i><i class="appr-t" style="left:70.5%"></i><i class="appr-t" style="left:80.5%"></i><i class="appr-t neg" style="left:25%"></i></div>`; }
function partyCardHTML() {
  const ps = partyAll(); const cands = Object.keys(typeof S.world.comps === "object" && S.world.comps ? S.world.comps : {}).filter(id => compRecruitReady(id));
  if (!ps.length && !cands.length) return "";
  return `<div class="party-card"><div class="section-t"><span class="eyebrow">Отряд</span><button type="button" class="party-all" id="party-open">Все спутники ›</button></div>
    ${ps.map(p => { const n = NPCS[p.id]; const [tl, tc] = compTierF(p); const mx = compMaxHp(p); const hp = p.down ? 0 : p.hp / mx;
      return `<button type="button" class="pc-row${p.wait ? " wait" : ""}" data-comp="${p.id}">${npcPh(p.id, "pc-ph")}<span class="pc-b"><span class="pc-n"><b>${esc(n.name)}</b>${p.loyal ? `<em class="pc-loyal" title="Личная история пройдена">верн${isFem(n) ? "а" : "ый"}</em>` : ""}${compQuestEligible(p) ? `<em class="pc-q" title="Хочет поговорить">!</em>` : ""}</span><small>${COMP_ARCH[p.arch].n}${p.wait ? " · ждёт: " + esc(POIS[S.world.npcLoc?.[p.id]]?.name || "") : ""}</small><span class="pc-hp"><i style="width:${hp * 100}%"></i></span>${compMeterHTML(p)}<span class="tier ${tc}">${tl}</span></span></button>`; }).join("")}
    ${!ps.length ? `<p class="home-note pc-empty">Вы путешествуете в одиночку. ${cands.length ? `С вами мог${cands.length > 1 ? "ли бы" : " бы"} пойти: ${cands.map(id => esc(NPCS[id].name)).join(", ")}.` : ""}</p>` : ""}</div>`;
}
function openComp(id) {
  const p = compOf(id); if (!p) return; const n = NPCS[id]; const d = compDef(id) || {}; const A = COMP_ARCH[p.arch]; const f = isFem(n); const [tl, tc] = compTierF(p); const mx = compMaxHp(p); const here = partyHere().some(x => x.id === id);
  const tags = (arr, cls) => (arr || []).map(t => p.known?.[t] ? `<span class="${cls}">${esc(COMP_TAGS[t])}</span>` : `<span class="unk">???</span>`).join("");
  const q = p.qid ? WD.quests?.[p.qid] : null; const qs = q ? qSt(q.id).st : null;
  const html = `<div class="cm"><div class="cr-head">${npcPh(id, "cr-ph")}<div><div class="eyebrow">Спутни${f ? "ца" : "к"} · ${A.n} · ${esc(CLASSES[A.cls]?.name || "")} ${C().level} ур.</div><h2>${esc(n.name)}${p.loyal ? ` <em class="pc-loyal">верн${f ? "а" : "ый"}</em>` : ""}</h2><small class="home-note">${esc(n.role)}${d.voice ? " · " + esc(d.voice) : ""}</small></div></div>
    <div class="cm-appr"><div class="cm-ah"><span>Одобрение</span><span class="tier ${tc}">${tl} · ${p.approval}</span></div>${compMeterHTML(p)}<div class="cm-legend"><span>−50 уйдёт</span><span>21 помогает в навыках</span><span>41 прикрывает в бою</span><span>61 +2 к атаке</span></div></div>
    <div class="cr-grid"><div><h4>Характеристики</h4><div class="cm-stats"><span><b>${p.down ? 0 : p.hp}/${mx}</b>HP</span><span><b>${compAC(p)}</b>КД</span><span><b>+${compAtk(p)}</b>атака</span><span><b>${A.dmg}+3</b>урон</span></div><p class="cr-ab"><b>${esc(A.ab.n)}.</b> ${esc(A.ab.d)}</p>
        <h4>Помогает в навыках</h4><div class="cr-tags">${A.skills.map(s => `<span>${esc(SKILLS[s][0])}</span>`).join("")}</div></div>
      <div><h4>Ценит</h4><div class="cr-tags">${tags(d.likes || A.likes, "lk")}</div><h4>Не терпит</h4><div class="cr-tags">${tags(d.dislikes || A.dislikes, "dl")}</div>
        <h4>Последние реакции</h4>${(p.log || []).length ? `<ul class="cm-log">${p.log.slice(-5).reverse().map(x => `<li class="${x.d > 0 ? "up" : "dn"}"><b>${x.d > 0 ? "▲ +" : "▼ "}${x.d}</b> ${esc(x.why || "")}</li>`).join("")}</ul>` : `<p class="home-note">Пока присматривается к вам.</p>`}</div></div>
    <div class="cm-q"><h4>Личная история</h4><p>${q ? `${esc(q.title)} — ${qs === "done" ? "пройдена: " + (f ? "она" : "он") + " вам верна до конца." : qs === "active" ? "в работе: " + esc(q.goal) : qs === "ready" ? "выполнено — поговорите, чтобы завершить." : "ждёт вашего ответа."}` : compQuestEligible(p) ? `${esc(n.name)} хочет чем-то поделиться. Поговорите у костра или спросите прямо.` : p.approval < 30 ? "Пока не доверяет настолько, чтобы рассказать о прошлом (нужно одобрение 30)." : "Ещё присматривается — побудьте вместе подольше."}</p></div>
    <div class="cm-tac"><h4>Тактика в бою</h4><div class="seg">${Object.entries(COMP_TACTICS).map(([k, t]) => `<button type="button" data-tac="${k}" aria-pressed="${(p.tactic || "free") === k}" title="${t[1]}">${t[0]}</button>`).join("")}</div></div>
    <div class="row"><button class="btn" type="button" id="cm-x">Закрыть</button>${here && !S.world.combat ? `<button class="btn" type="button" id="cm-talk">Поговорить</button>` : ""}${compQuestEligible(p) && here && !S.world.combat ? `<button class="btn primary" type="button" id="cm-past">★ Спросить, что гложет</button>` : ""}${!S.world.combat ? (p.wait ? (here ? `<button class="btn" type="button" id="cm-follow">Идём со мной</button>` : "") : `<button class="btn" type="button" id="cm-wait">Подожди здесь</button>`) : ""}${!S.world.combat ? `<button class="btn ghost danger" type="button" id="cm-leave">Отпустить</button>` : ""}</div></div>`;
  modal(html, root => { root.querySelector(".modal").classList.add("cm-modal"); const re = () => { openComp(id); renderSheet(); renderCombatHud(); save(); };
    root.querySelector("#cm-x").onclick = closeModal;
    root.querySelectorAll("[data-tac]").forEach(b => b.onclick = () => { p.tactic = b.dataset.tac; sfx("tap"); re(); });
    root.querySelector("#cm-talk")?.addEventListener("click", () => { closeModal(); dlgStart(id); });
    root.querySelector("#cm-past")?.addEventListener("click", () => { closeModal(); compAskPast(id); });
    root.querySelector("#cm-wait")?.addEventListener("click", () => { p.wait = true; S.world.npcLoc[id] = S.world.loc; pushFeed({ t: "sys", html: `<b>${esc(n.name)}</b> остаётся ждать здесь: «${esc(POIS[S.world.loc].name)}».` }); refreshPeople(); closeModal(); after(); });
    root.querySelector("#cm-follow")?.addEventListener("click", () => { p.wait = false; S.world.npcLoc[id] = S.world.loc; pushFeed({ t: "sys", html: `<b>${esc(n.name)}</b> снова идёт с вами.` }); refreshPeople(); closeModal(); after(); });
    root.querySelector("#cm-leave")?.addEventListener("click", () => { const box = root.querySelector(".cm .row"); box.innerHTML = `<span class="home-note" style="flex:1">Отпустить ${esc(n.name)}? ${f ? "Она" : "Он"} останется здесь, и позвать обратно можно будет, только если доверие сохранится.</span><button class="btn" type="button" id="cm-no">Нет</button><button class="btn primary" type="button" id="cm-yes">Отпустить</button>`;
      box.querySelector("#cm-no").onclick = () => openComp(id); box.querySelector("#cm-yes").onclick = () => { closeModal(); compApprove(id, -5, "отпустили из отряда"); compLeave(id, "dismiss"); }; });
  });
}
function openParty() {
  if (!S) return; const ps = partyAll(); const cands = Object.keys(typeof S.world.comps === "object" && S.world.comps ? S.world.comps : {}).filter(id => compCandidate(id));
  const known = cands.filter(id => compRecruitReady(id));
  modal(`<div class="pty"><div class="eyebrow">Отряд · ${ps.length} из ${PARTY_MAX}</div><h2>Спутники</h2>
    <div class="pty-list">${ps.length ? ps.map(p => `<button type="button" class="pty-row" data-comp="${p.id}">${npcPh(p.id, "pty-ph")}<span><b>${esc(NPCS[p.id].name)}</b><small>${COMP_ARCH[p.arch].n} · ${compTierF(p)[0]}${p.wait ? " · ждёт" : ""}</small>${compMeterHTML(p)}</span></button>`).join("") : `<p class="home-note">В отряде никого. Поговорите с людьми — кто-то из них может пойти с вами.</p>`}</div>
    ${known.length ? `<h4>Могли бы пойти с вами</h4><div class="pty-list">${known.map(id => `<button type="button" class="pty-row cand" data-rec="${id}">${npcPh(id, "pty-ph")}<span><b>${esc(NPCS[id].name)}</b><small>${COMP_ARCH[compDef(id).arch].n} · ${esc(POIS[npcWhere(id)]?.name || "")}</small></span></button>`).join("")}</div>` : ""}
    ${cands.length > known.length ? `<p class="home-note">Ещё ${cands.length - known.length} ${cands.length - known.length === 1 ? "человек" : "человека"} в этих краях мог${cands.length - known.length === 1 ? "" : "ли"} бы стать спутником — познакомьтесь с жителями.</p>` : ""}
    <div class="row"><button class="btn" type="button" id="pty-x">Закрыть</button></div></div>`, root => {
    root.querySelector(".modal").classList.add("pty-modal"); root.querySelector("#pty-x").onclick = closeModal;
    root.querySelectorAll("[data-comp]").forEach(b => b.onclick = () => openComp(b.dataset.comp));
    root.querySelectorAll("[data-rec]").forEach(b => b.onclick = () => { const id = b.dataset.rec; if (POIS[S.world.loc].npcs.includes(id)) openRecruit(id); else { closeModal(); const w = npcWhere(id); if (w && POIS[w]) openBigMap({ target: w }); } });
  });
}
/* ---------- память рассказчика ---------- */
function compBrief(short) {
  if (!S?.world) return ""; const ps = partyActive(); const here = partyHere();
  if (short) return here.length ? `СПУТНИКИ ГЕРОЯ РЯДОМ (к ним можно обращаться — talk_to): ${here.map(p => `${p.id} (${NPCS[p.id].name})`).join(", ")}.\n` : "";
  const cands = Object.keys(typeof S.world.comps === "object" && S.world.comps ? S.world.comps : {}).filter(id => compCandidate(id) && (POIS[S.world.loc].npcs || []).includes(id));
  let s = "";
  if (ps.length) s += `ОТРЯД ГЕРОЯ — спутники идут рядом и участвуют в сцене:
${ps.map(p => { const n = NPCS[p.id]; const d = compDef(p.id) || {}; const [tl] = compTierF(p); return `- [${p.id}] ${n.name}, ${n.role} — ${COMP_ARCH[p.arch].n}. ${p.wait ? `СЕЙЧАС НЕ С ГЕРОЕМ (ждёт в «${POIS[S.world.npcLoc?.[p.id]]?.name || "другом месте"}») — не вводи в сцену. ` : ""}Манера: ${d.voice || n.persona || ""}. ${compValuesLine(p.id)}. Отношение к герою: ${tl} (${p.approval}/100)${p.loyal ? ", верен после личной истории" : ""}. ${p.down ? "Без сознания. " : `HP ${p.hp}/${compMaxHp(p)}. `}Скрытое прошлое: ${d.past || "—"}${p.approval < 30 ? " (пока не рассказывает)" : ""}.`; }).join("\n")}
ПРАВИЛА СПУТНИКОВ: это живые люди со своим мнением. Иногда (примерно раз в 2–4 хода — после важных решений героя, в пути, в опасности) один из них вставляет 1–2 короткие реплики в характере; если спутников двое, изредка они перебрасываются фразами. Могут возразить герою или пошутить. Не заслоняй героя и не решай за него. Боевые броски спутников уже сделаны движком (см. результаты) — описывай их действия по этим результатам.
companions — реакция спутников на поступки героя В ЭТОЙ сцене по их ценностям: {"id":{"d":число от −8 до 8,"why":"до 6 слов"}}; пиши только заметные реакции. Нападения на мирных, убийства, бегство из боя, сданные поручения и выбранные реплики движок уже оценил — их не учитывай.
`;
  if (cands.length && ps.length < PARTY_MAX) s += `МОГУТ СТАТЬ СПУТНИКАМИ (если герой позовёт и они согласны — поле recruit): ${cands.map(id => `${id} (${NPCS[id].name}): ${compDef(id).motive || ""}`).join("; ")}. Не навязывай, но пусть при случае они проявят интерес к пути героя.
`;
  return s;
}
function compEffects(eff) {
  if (!S || !eff) return; const ce = eff.companions;
  if (ce && typeof ce === "object") Object.entries(ce).slice(0, 3).forEach(([id, v]) => { if (!compOf(id) || !partyHere().some(p => p.id === id)) return; const d = clamp(Math.round(Number(v?.d ?? v) || 0), -8, 8); if (d) compApprove(id, d, str(v?.why, 50) || (d > 0 ? "по душе" : "не по душе")); });
  const rid = typeof eff.recruit === "string" ? eff.recruit : null; if (rid && compCandidate(rid) && (POIS[S.world.loc].npcs || []).includes(rid) && partyActive().length < PARTY_MAX) { if (!compDef(rid)) S.world.comps = { ...(typeof S.world.comps === "object" ? S.world.comps : {}), [rid]: compFallbackOne(rid) }; setTimeout(() => { const go = () => openRecruit(rid, true); if (!busy) go(); else { const iv = setInterval(() => { if (!busy) { clearInterval(iv); go(); } }, 500); } }, 900); }
}
function compTick() {
  if (!S?.world) return; const L = C().level;
  partyAll().slice().forEach(p => { const n = NPCS[p.id]; if (!n || n.dead) { S.party = partyAll().filter(x => x.id !== p.id); if (n) pushFeed({ t: "sys", html: `<b>${esc(n.name)}</b> погиб${isFem(n) ? "ла" : ""}. Отряд стал меньше.` }); return; }
    if (S.world.hostile?.[p.id]) { compLeave(p.id, "hostile"); return; }
    const mx = compMaxHp(p); if (p.mxWas && mx > p.mxWas && !p.down) p.hp += mx - p.mxWas; p.mxWas = mx; if (p.hp > mx) p.hp = mx;
    if (!p.wait) { S.world.npcLoc = S.world.npcLoc || {}; if (S.world.npcLoc[p.id] !== S.world.loc) { S.world.npcLoc[p.id] = S.world.loc; } } });
}
function compEpilogue() { const ps = partyAll(); const gone = Object.keys(S.world.compGone || {}); if (!ps.length && !gone.length) return ""; return `СПУТНИКИ: ${ps.map(p => `${NPCS[p.id].name} — ${compTierF(p)[0]}${p.loyal ? ", прошёл(прошла) личную историю" : ""}`).join("; ")}${gone.length ? `; ушли в разочаровании: ${gone.map(id => NPCS[id]?.name).filter(Boolean).join(", ")}` : ""}. Отведи спутникам по абзацу: что с ними стало.\n`; }
/* ---------- обёртки движка ---------- */
TIPS.party = ["Спутники", "У спутника свои ценности: он одобряет или осуждает ваши поступки. Чем выше одобрение — тем больше пользы: помощь в проверках, прикрытие в бою, личная история на привале. При −50 он уйдёт. Карточка спутника — в листе героя, отряд — клавиша P."];
{ const _mv = moveTo; moveTo = function () { const r = _mv.apply(this, arguments); try { compTick(); refreshPeople(); } catch (e) { console.error(e); } return r; }; }
{ const _af = after; after = function () { try { compTick(); if (S && !S.world.comps && !compGenBusy) compGen(); } catch (e) { console.error(e); } return _af.apply(this, arguments); }; }
{ const _pi = planIntent; planIntent = function (id) { const it = _pi.apply(this, arguments); try { if (it && (it.k === "attack" || SPECIAL_DO[it.k])) it.tg = compPickFoeTarget(id); } catch (e) {} return it; }; }
{ const _ii = intentInfo; intentInfo = function (id) { const r = _ii.apply(this, arguments); try { const tg = S.world.enemies[id]?.intent?.tg; if (r && tg && tg !== "hero" && compOf(tg) && !compOf(tg).down) r.t += ` → ${compShort(tg)}`; } catch (e) {} return r; }; }
{ const _fa = foeAttack; foeAttack = function (id, sp) { try { const tg = S.world.enemies[id]?.intent?.tg; const p = tg && tg !== "hero" ? compOf(tg) : null; if (p && compFighters().includes(p)) return compTakeHit(id, sp, p, false);
    const g = compIntercept(id); if (g) return compTakeHit(id, sp, g, true); } catch (e) { console.error(e); } return _fa.apply(this, arguments); }; }
{ const _et = enemyTurn; enemyTurn = function () { let pre = []; try { pre = compTurn(); } catch (e) { console.error(e); } return [...pre, ..._et.apply(this, arguments)]; }; }
{ const _cf = combatFx; combatFx = function (r) { if (r?.kind === "comp") { try { compFx(r); } catch (e) {} return; } if (r?.vsComp) { const pc = document.querySelector(`#combat-hud .cbp[data-id="${r.vsComp}"]`); if (r.ok) { pulse(pc, "hit", 600); floatNum(pc, r.verdict.replace(/^.*: /, ""), "dmg"); } else floatNum(pc, "промах", "miss"); return; } return _cf.apply(this, arguments); }; }
{ const _oc = onCombatEnd; onCombatEnd = function (results) { const r = _oc.apply(this, arguments); try { const ps = partyHere(); ps.forEach(p => { if (p.down) { p.down = false; p.hp = Math.max(1, Math.round(compMaxHp(p) * .25)); pushFeed({ t: "sys", html: `<b>${esc(NPCS[p.id].name)}</b> приходит в себя после боя.` }); } p.used = {}; });
  if (ps.length && !(results || []).some(x => x.fled)) compReact("victory"); } catch (e) { console.error(e); } return r; }; }
{ const _rc = renderCombatHud; renderCombatHud = function () { _rc.apply(this, arguments); try { const hud = document.getElementById("combat-hud"); if (!hud || hud.hidden || !S?.world.combat) return; let box = hud.querySelector(".cb-party"); const h = partyHudHTML();
  if (!h) { box?.remove(); return; } if (!box) { box = document.createElement("div"); box.className = "cb-party"; hud.querySelector(".cb-head")?.after(box); } box.innerHTML = h;
  box.querySelectorAll("[data-tac]").forEach(b => b.onclick = e => { e.stopPropagation(); const p = compOf(b.dataset.tac); const ks = Object.keys(COMP_TACTICS); p.tactic = ks[(ks.indexOf(p.tactic || "free") + 1) % ks.length]; sfx("tap"); renderCombatHud(); save(); });
  box.querySelectorAll(".cbp").forEach(el => el.onclick = () => openComp(el.dataset.id)); } catch (e) { console.error(e); } }; }
{ const _vp = validatePlan; validatePlan = function () { const out = _vp.apply(this, arguments); try { out.checks.forEach(ch => { if (ch.kind !== "skill") return; const h = compHelpFor(ch.skill); if (h && (ch.adv || 0) < 1) { ch.adv = 1; ch.reason = (ch.reason ? ch.reason + "; " : "") + `помогает ${NPCS[h.id].name}`; } if (ch.skill === "sleight" && partyHere().length) S.compEv = "steal"; }); } catch (e) {} return out; }; }
{ const _dc = dlgChance; dlgChance = function (skill, dc) { if (compHelpFor(skill)) { const b = skillBonus(skill); const p = clamp((21 - (dc - b)) / 20, .05, 1); return 1 - (1 - p) ** 2; } return _dc.apply(this, arguments); }; }
{ const _dp = dlgPick; dlgPick = function (i) { try { const o = S?.dialogue?.opts?.[i]; if (o && !busy) { if (o.skill === "deception") S.compEv = "deceive"; else if (o.skill === "intimidation") S.compEv = "intimidate"; } } catch (e) {} return _dp.apply(this, arguments); }; }
{ const _na = npcAfterTurn; npcAfterTurn = function (results) { const r = _na.apply(this, arguments); try { if (S.compEv) { const ev = S.compEv; S.compEv = null; if (ev !== "steal" || (results || []).some(x => x.kind === "skill" && x.skill === "sleight")) compReact(ev); }
  const rid = S.pendingRecruit; S.pendingRecruit = null; if (rid) { const ck = (results || []).find(x => x.kind === "skill" && x.skill === "persuasion"); if (ck?.ok) { const st = S.world.npcs[rid]; if (st) st.att = Math.max(st.att || 0, 8); results.push({ kind: "note", title: `${NPCS[rid].name} соглашается пойти с героем. Отыграй согласие; движок предложит оформить это.` }); setTimeout(() => { const go = () => openRecruit(rid, true); if (!busy) go(); else { const iv = setInterval(() => { if (!busy) { clearInterval(iv); go(); } }, 500); } }, 600); } else if (ck) results.push({ kind: "note", title: `${NPCS[rid].name} пока не готов(а) пойти с героем — отказывает, но не захлопывает дверь.` }); } } catch (e) { console.error(e); } return r; }; }
{ const _ha = heroAssault; heroAssault = function (nid, o) { const r = _ha.apply(this, arguments); try { if (r && !inParty(nid)) compReact("assault"); } catch (e) {} return r; }; }
{ const _nk = npcKilled; npcKilled = function (nid, eid, how) { const was = NPCS[nid] && !NPCS[nid].dead; const byHeroAssault = !!S.world.crimes?.some(c => c.npc === nid && c.k !== "murder"); const r = _nk.apply(this, arguments); try { if (was && (byHeroAssault || /добит/.test(how || ""))) compReact("kill"); } catch (e) {} return r; }; }
{ const _ka = koAct; koAct = function (eid, act) { try { if (act === "wake") compReact("spare"); } catch (e) {} return _ka.apply(this, arguments); }; }
{ const _cq = completeQuest; completeQuest = function (qid) { const q = WD.quests?.[qid]; try { if (q?.comp && compOf(q.giver)) { const p = compOf(q.giver); const n = NPCS[q.giver]; p.loyal = true; p.hp = compMaxHp(p); S.compNote = `Это была ЛИЧНАЯ история спутника ${n.name}. Теперь ${isFem(n) ? "она" : "он"} верн${isFem(n) ? "а" : "ый"} герою до конца: сыграй тёплый, сдержанный момент благодарности и закрытия старой раны.`; pushFeed({ t: "chips", items: [{ c: "xp", x: `${n.name}: личная история пройдена — теперь ${isFem(n) ? "верна" : "верен"} вам` }] }); setTimeout(() => compApprove(q.giver, 10, "помогли с личным делом"), 50); } else if (q && partyHere().length) setTimeout(() => compReact("quest"), 50); } catch (e) { console.error(e); } return _cq.apply(this, arguments); }; }
{ const _qa = questAfterChecks; questAfterChecks = function (results) { if (S?.compNote) { results.push({ kind: "note", title: S.compNote }); S.compNote = null; } return _qa.apply(this, arguments); }; }
{ const _cp = combatPreAct; combatPreAct = async function (act) { const r = await _cp.apply(this, arguments); try { if (act === "escape" && !S.world.combat) compReact("flee"); } catch (e) {} return r; }; }
{ const _lr = longRest; longRest = function () { const r = _lr.apply(this, arguments); try { partyAll().forEach(p => { p.hp = compMaxHp(p); p.down = false; p.used = {}; }); if (partyHere().length) { const go = () => { if (!S.world.combat && !document.getElementById("modal-root").innerHTML.trim()) openCamp(); }; setTimeout(() => { if (!busy) go(); else { const iv = setInterval(() => { if (!busy) { clearInterval(iv); go(); } }, 600); } }, 700); } } catch (e) { console.error(e); } return r; }; }
{ const _sr = shortRest; shortRest = function () { const r = _sr.apply(this, arguments); try { partyAll().forEach(p => { if (!p.down) p.hp = Math.min(compMaxHp(p), p.hp + Math.ceil(compMaxHp(p) / 3)); }); } catch (e) {} return r; }; }
{ const _ae = applyEffects; applyEffects = function (eff) { const r = _ae.apply(this, arguments); try { compEffects(eff || {}); } catch (e) { console.error(e); } return r; }; }
{ const _rs = renderSheet; renderSheet = function () { const r = _rs.apply(this, arguments); try { const el = document.getElementById("sheet"); if (!el || !S) return r; el.querySelector(".party-card")?.remove(); const h = partyCardHTML(); if (h) { const tabs = el.querySelector(".tabs"); const box = document.createElement("div"); box.innerHTML = h; const card = box.firstElementChild; if (tabs) tabs.before(card); else el.append(card);
  card.querySelectorAll("[data-comp]").forEach(b => b.onclick = () => openComp(b.dataset.comp)); card.querySelector("#party-open").onclick = openParty; } } catch (e) { console.error(e); } return r; }; }
{ const _rd = renderDlg; renderDlg = function () { _rd.apply(this, arguments); try { const el = document.getElementById("dlg"); const d = S?.dialogue; if (!el || el.hidden || !d) return; const ol = el.querySelector(".dlg-opts"); if (!ol) return;
  if (compRecruitReady(d.npc)) { const li = document.createElement("li"); li.innerHTML = `<button type="button" class="dlg-o recruit" ${busy ? "disabled" : ""}><span class="dlg-n">★</span><span class="dlg-tx">Позвать с собой в путь</span></button>`; ol.querySelector(".dlg-o.own")?.parentElement.before(li); li.querySelector("button").onclick = () => openRecruit(d.npc); }
  const p = compOf(d.npc); if (p && compQuestEligible(p) && partyHere().includes(p)) { const li = document.createElement("li"); li.innerHTML = `<button type="button" class="dlg-o recruit" ${busy ? "disabled" : ""}><span class="dlg-n">★</span><span class="dlg-tx">Что тебя гложет? (личная история)</span></button>`; ol.querySelector(".dlg-o.own")?.parentElement.before(li); li.querySelector("button").onclick = () => compAskPast(d.npc); }
  el.querySelectorAll(".dlg-o[data-i]").forEach(b => { const o = d.opts[+b.dataset.i]; const h = o?.skill && compHelpFor(o.skill); const ck = b.querySelector(".dlg-ck"); if (h && ck && !ck.querySelector(".hlp")) ck.insertAdjacentHTML("beforeend", `<em class="hlp" title="Помогает: ${esc(NPCS[h.id].name)} — преимущество">+${esc(compShort(h.id))}</em>`); }); } catch (e) { console.error(e); } }; }
document.addEventListener("keydown", e => { if (e.ctrlKey || e.metaKey || e.altKey || !S) return; const tag = document.activeElement?.tagName; if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return; const mr = document.getElementById("modal-root"); if (mr && mr.innerHTML.trim()) return; if (document.getElementById("screen-game").hidden) return;
  const k = e.key.toLowerCase(); if (k === "p" || k === "з") { e.preventDefault(); openParty(); } });
function compQuickLine(r, L) { const pick = a => a[Math.floor(Math.random() * a.length)];
  if (r.comp) { const nm = compName(r.comp); const E = r.target ? ENEMIES[r.target]?.name : "";
    if (r.heal || /поднимает/.test(r.title)) L.push(r.heal ? `${nm} касается твоей раны — боль отступает.` : `${nm} рывком поднимает раненого товарища.`);
    else if (r.verdict === "Преимущество") L.push(`${nm} выкрикивает что-то дерзкое — и в тебе просыпается кураж.`);
    else if (r.aoe) L.push(`${nm} выбрасывает руки вперёд — волна огня накрывает врагов.`);
    else if (!r.ok) L.push(pick([`${nm} промахивается.`, `${E} уходит от удара: ${nm} бьёт в пустоту.`]));
    else L.push(r.enemyAfter === "повержен" ? `${nm} добивает: ${E} падает.` : pick([`${nm} достаёт врага — ${E} ${r.enemyAfter}.`, `Удар ${nm} находит цель: ${E} ${r.enemyAfter}.`])); return; }
  if (r.vsComp) { const nm = compName(r.vsComp); const E = ENEMIES[r.by]?.name || "враг"; const p = compOf(r.vsComp); L.push(r.ok ? (p?.down ? `${E} сбивает ${nm} с ног — ${nm} без сознания!` : `${E} бьёт ${nm}.`) : `${nm} уходит от удара: ${E} промахивается.`); }
}
{ const _rb = resultsBrief; resultsBrief = function (results) { const norm = (results || []).map(r => r?.vsComp ? { kind: "note", title: `${r.title}: ${r.ok ? (compOf(r.vsComp)?.down ? "попадание, спутник без сознания" : "попадание, спутник ранен") : "промах"}` } : r?.comp ? { kind: "note", title: `${r.title}: ${r.verdict || (r.ok ? "попадание" : "промах")}${r.enemyAfter ? `; цель теперь: ${r.enemyAfter}` : ""}` } : r); return _rb.call(this, norm); }; }
{ const _pn2 = popNPC; popNPC = function (id) { if (inParty(id)) return; return _pn2.apply(this, arguments); }; }
