/* CREATION3 */
/* =========================================================================
   ХАРАКТЕРИСТИКИ, ПРЕДЫСТОРИИ, РЕЖИМЫ И ТОНЫ РАССКАЗЧИКА, ДЕЙСТВИЯ С ПРЕДМЕТАМИ
   ========================================================================= */
const ABIL_DESC = { str: "Удары в ближнем бою, переноска тяжестей, Атлетика", dex: "Стрельба, уклонение и КД, инициатива, Скрытность", con: "Хиты и выносливость, концентрация",
  int: "Магия волшебника, Анализ, История, Магия", wis: "Внимательность, Проницательность, магия жреца, друида и следопыта", cha: "Убеждение, Обман, магия барда, паладина и колдуна" };
function modWord(m) { return m <= -2 ? ["слабо", "bad"] : m === -1 ? ["ниже среднего", "low"] : m === 0 ? ["обычно", "mid"] : m === 1 ? ["хорошо", "good"] : m === 2 ? ["сильно", "great"] : ["выдающееся", "top"]; }
function pbAuto() { if (!D.cls) return; const order = CLASSES[D.cls].prio; D.pb = {}; ABIL.forEach(a => D.pb[a] = 8); order.forEach((a, k) => D.pb[a] = STD[k] ?? 8); }
function abilSummary(sc) {
  if (!D.cls || !D.race) return "";
  const c = CLASSES[D.cls]; const meta = CLASS_META[D.cls] || { prim: ["str"] }; const atkA = meta.prim.find(a => a === "str" || a === "dex") || (D.cls === "rogue" || D.cls === "ranger" ? "dex" : "str");
  const items = [["Хиты", maxHP(D.cls, D.race, sc), "con"], ["КД", draftAC(), "dex"], ["Инициатива", fmt(mod(sc.dex) + traitFx(D).init), "dex"], ["Атака оружием", fmt(mod(sc[atkA]) + 2), atkA]];
  if (c.cast) items.push(["Сложность чар", 8 + 2 + mod(sc[c.cast]), c.cast]);
  return `<div class="ab-sum">${items.map(([l, v, a]) => `<div><small>${l}</small><b>${v}</b><span>${ABIL_RU[a]}</span></div>`).join("")}</div>`;
}
function stepAbil(body) {
  head(body, "Шаг 4", "Сильные и слабые стороны", "Шесть качеств героя. Главное — модификатор в круге: он прибавляется к броскам d20. Звёздочкой отмечены качества, важные для вашего класса.");
  const meth = document.createElement("div"); meth.className = "ab-meth";
  [["array", "Стандартный набор", "15, 14, 13, 12, 10, 8"], ["pb", "Покупка очков", "27 очков, точная настройка"], ["roll", "Бросок костей", "4d6, решает удача"]].forEach(([k, t, s]) => {
    const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-pressed", String(D.method === k)); b.innerHTML = `<b>${t}</b><small>${s}</small>`;
    b.onclick = () => { if (D.method === k) return; D.method = k; D.pickTok = null; if (k === "array") { D.pool = STD.slice(); autoAssign(); } if (k === "roll") { if (!D.rolled) rollStats(); else { D.pool = D.rolled.slice(); autoAssign(); } } if (k === "pb" && !D.pbTouched) pbAuto(); sfx("pick"); renderCreate(); };
    meth.append(b); });
  body.append(meth);
  const sc = draftScores(); const prim = new Set((CLASS_META[D.cls] || { prim: [] }).prim); const top = document.createElement("div"); top.className = "ab-top";
  if (D.method === "pb") {
    const spent = pbSpent(), left = 27 - spent;
    top.innerHTML = `<div class="ab-budget"><div class="ab-left"><b>${left}</b><small>${left === 1 ? "очко осталось" : left >= 2 && left <= 4 ? "очка осталось" : "очков осталось"}</small></div>
      <div class="ab-cells" aria-label="Потрачено ${spent} из 27">${Array.from({ length: 27 }, (_, i) => `<i class="${i < spent ? "on" : ""}"></i>`).join("")}</div>
      <div class="ab-tools"><button type="button" class="btn small" id="ab-auto">Под класс</button><button type="button" class="btn small" id="ab-reset">Сбросить</button></div></div>
      <small class="home-note">Значения от 8 до 15. Чем выше, тем дороже: 14 стоит 7 очков, 15 — 9.</small>`;
  } else {
    const owner = {}; ABIL.forEach(a => { if (D.assign[a] != null) owner[D.assign[a]] = a; });
    top.innerHTML = `<div class="ab-tray"><div class="ab-toks">${D.pool.map((v, i) => `<button type="button" class="ab-tok${D.method === "roll" ? " die" : ""}${D.pickTok === i ? " pick" : ""}${owner[i] ? " used" : ""}" data-t="${i}"><b>${v}</b><small>${owner[i] ? ABIL_RU[owner[i]] : "свободно"}</small></button>`).join("")}</div>
      <div class="ab-tools">${D.method === "roll" ? `<button type="button" class="btn small" id="ab-reroll">↻ Перебросить</button>` : ""}<button type="button" class="btn small" id="ab-auto">Под класс</button></div></div>
      <small class="home-note">${D.pickTok != null ? `Выбрано <b>${D.pool[D.pickTok]}</b> — нажмите на качество, куда его поставить.` : "Нажмите на число, затем на качество. Можно сразу нажать на качество — значения поменяются местами."}${D.method === "roll" ? " Бросается 4d6, худший куб отбрасывается." : ""}</small>`;
  }
  body.append(top);
  const list = document.createElement("div"); list.className = "ab-list";
  ABIL.forEach(a => {
    const rb = D.race ? (RACES[D.race].bonus[a] || 0) : 0; const m = mod(sc[a]); const [w, q] = modWord(m); const card = document.createElement("div");
    card.className = `ab-card q-${q}${prim.has(a) ? " key" : ""}${D.method !== "pb" && D.pickTok != null ? " drop" : ""}`; card.dataset.a = a;
    let ctl = "";
    if (D.method === "pb") { const v = D.pb[a]; const canUp = v < 15 && pbSpent() - PB_COST[v] + PB_COST[v + 1] <= 27;
      ctl = `<div class="ab-pb"><button type="button" class="ab-step" data-d="-1" aria-label="Уменьшить ${ABIL_FULL[a]}" ${v <= 8 ? "disabled" : ""}>−</button>
        <div class="ab-pips">${[8, 9, 10, 11, 12, 13, 14, 15].map(n => `<button type="button" data-v="${n}" class="${n <= v ? "on" : ""}" title="${n} (${PB_COST[n]} оч.)" aria-label="${ABIL_FULL[a]} ${n}"></button>`).join("")}</div>
        <button type="button" class="ab-step" data-d="1" aria-label="Увеличить ${ABIL_FULL[a]}" ${canUp ? "" : "disabled"}>+</button></div><small class="ab-base">база ${v} · ${PB_COST[v]} оч.</small>`; }
    else { const i = D.assign[a]; ctl = `<button type="button" class="ab-slot${i != null && D.pickTok === i ? " pick" : ""}" data-s="${a}" aria-label="${ABIL_FULL[a]}: базовое ${i != null ? D.pool[i] : "не выбрано"}">${i != null ? `<b>${D.pool[i]}</b>` : `<small>—</small>`}</button>`; }
    card.innerHTML = `<span class="ab-ico">${ico("a_" + a, 26)}</span>
      <div class="ab-info"><div class="ab-name"><b>${ABIL_FULL[a]}</b>${prim.has(a) ? `<span class="ab-star">★ ключевая</span>` : ""}</div><p>${ABIL_DESC[a]}</p></div><div class="ab-ctl">${ctl}</div>
      <div class="ab-res"><div class="ab-med" title="Значение ${sc[a]}, модификатор ${fmt(m)}"><b>${fmt(m)}</b><small>${sc[a]}</small>${rb ? `<em title="Бонус расы">+${rb}</em>` : ""}</div><span>${w}</span></div>`;
    list.append(card);
  });
  body.append(list);
  body.insertAdjacentHTML("beforeend", abilSummary(sc));
  /* поведение */
  top.querySelector("#ab-auto")?.addEventListener("click", () => { if (D.method === "pb") { pbAuto(); D.pbTouched = true; } else autoAssign(); D.pickTok = null; sfx("pick"); renderCreate(); });
  top.querySelector("#ab-reset")?.addEventListener("click", () => { ABIL.forEach(a => D.pb[a] = 8); D.pbTouched = true; renderCreate(); });
  top.querySelector("#ab-reroll")?.addEventListener("click", () => { rollStats(); D.pickTok = null; sfx("dagger"); renderCreate(); });
  top.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { const i = +b.dataset.t; D.pickTok = D.pickTok === i ? null : i; sfx("tap"); renderCreate(); });
  const place = a => { const i = D.pickTok; const cur = D.assign[a]; const other = ABIL.find(b => b !== a && D.assign[b] === i); if (other) D.assign[other] = cur ?? null; D.assign[a] = i; D.pickTok = null; sfx("pick"); renderCreate(); };
  list.querySelectorAll(".ab-card").forEach(card => { const a = card.dataset.a;
    if (D.method === "pb") {
      card.querySelectorAll(".ab-step").forEach(b => b.onclick = () => { D.pb[a] += +b.dataset.d; D.pbTouched = true; sfx("tap"); renderCreate(); });
      card.querySelectorAll(".ab-pips [data-v]").forEach(b => b.onclick = () => { const n = +b.dataset.v; const cost = pbSpent() - PB_COST[D.pb[a]] + PB_COST[n]; if (cost > 27) { b.closest(".ab-card").classList.add("shake"); setTimeout(() => b.closest(".ab-card")?.classList.remove("shake"), 400); return; } D.pb[a] = n; D.pbTouched = true; sfx("tap"); renderCreate(); });
    } else card.onclick = e => { if (D.pickTok != null) { place(a); return; } if (D.assign[a] != null) { D.pickTok = D.assign[a]; sfx("tap"); renderCreate(); } };
  });
}

/* ---------- предыстории ---------- */
Object.assign(BACKGROUNDS, {
  urchin: { name: "Беспризорник", skills: ["sleight", "stealth"], hook: "выросли на улице и знаете каждый лаз и каждую крышу", gold: 5, item: "Карта городских крыш" },
  charlatan: { name: "Шарлатан", skills: ["deception", "sleight"], hook: "торговали чудодейственными снадобьями, которые ничего не лечили", gold: 15, item: "Набор для грима" },
  smuggler: { name: "Контрабандист", skills: ["deception", "athletics"], hook: "возили запретный груз ночными тропами и не задавали вопросов", gold: 15, item: "Фальшивое дно для сумки" },
  merchant: { name: "Гильдейский купец", skills: ["persuasion", "investigation"], hook: "вели дела гильдии и умеете считать чужие деньги", gold: 25, item: "Рекомендательное письмо гильдии" },
  hunter: { name: "Охотник", skills: ["survival", "stealth"], hook: "кормились лесом и читаете следы лучше книг", gold: 10, item: "Охотничий рог" },
  gravedigger: { name: "Могильщик", skills: ["religion", "athletics"], hook: "копали могилы и видели, что иногда мёртвые не лежат спокойно", gold: 5, item: "Лопата" },
  pilgrim: { name: "Паломник", skills: ["religion", "survival"], hook: "идёте от святыни к святыне по обету, данному у смертного одра", gold: 5, item: "Посох паломника с лентами" },
  deserter: { name: "Дезертир", skills: ["stealth", "survival"], hook: "бросили армию после битвы, о которой не хотите вспоминать", gold: 10, item: "Сорванная нашивка полка" },
  healer: { name: "Знахарь", skills: ["medicine", "nature"], hook: "лечили травами деревни, куда лекари не доезжают", gold: 10, item: "Набор лекаря" },
  knight: { name: "Рыцарь ордена", skills: ["persuasion", "athletics"], hook: "принесли клятву ордену, которого, возможно, уже нет", gold: 20, item: "Знамя ордена" },
  cultist: { name: "Беглец из секты", skills: ["arcana", "deception"], hook: "сбежали из секты и знаете их знаки — а они знают вас", gold: 5, item: "Медальон с выцарапанным символом" },
  miner: { name: "Рудокоп", skills: ["athletics", "perception"], hook: "долбили породу в глубине и слышали, как скала дышит", gold: 10, item: "Кирка рудокопа" },
  monster: { name: "Охотник на чудовищ", skills: ["survival", "investigation"], hook: "берёте плату за головы тварей, которых другие считают сказками", gold: 15, item: "Бестиарий с пометками" },
  bounty: { name: "Охотник за головами", skills: ["investigation", "intimidation"], hook: "ловили беглых за награду и привыкли к тому, что вас не любят", gold: 15, item: "Кандалы" },
  watch: { name: "Городской стражник", skills: ["insight", "investigation"], hook: "носили значок дозора и знаете, как врут на допросе", gold: 10, item: "Значок дозора" },
  haunted: { name: "Преследуемый", skills: ["arcana", "insight"], hook: "слышите шёпот того, кого похоронили, и он ведёт вас сюда", gold: 5, item: "Письмо от умершего" },
  antiquarian: { name: "Искатель древностей", skills: ["history", "investigation"], hook: "ищете следы древних и продаёте находки тем, кто платит", gold: 15, item: "Лупа и щёточки" },
  courier: { name: "Гонец", skills: ["animal", "perception"], hook: "возили депеши по любым дорогам и в любую погоду", gold: 10, item: "Сумка гонца с печатью" },
  fisher: { name: "Рыбак", skills: ["nature", "athletics"], hook: "выходили в море до рассвета и знаете, что прячет вода", gold: 5, item: "Рыболовные снасти" },
  convict: { name: "Бывший каторжник", skills: ["athletics", "intimidation"], hook: "отбыли срок на каторге — или не совсем отбыли", gold: 5, item: "Клеймо и кусок цепи" },
  spy: { name: "Шпион", skills: ["deception", "insight"], hook: "служили тайной канцелярии, пока вас не списали — или пока не перевербовали", gold: 20, item: "Шифровальная книжица" },
  witch: { name: "Ученик ведьмы", skills: ["arcana", "nature"], hook: "жили у болотной ведьмы и знаете, о чём шепчут грибы и вороны", gold: 5, item: "Мешочек с сушёными грибами" },
  heir: { name: "Изгнанный наследник", skills: ["history", "intimidation"], hook: "лишены наследства, но не гордости — и хотите вернуть своё", gold: 20, item: "Фамильный кинжал" },
  gambler: { name: "Игрок", skills: ["insight", "deception"], hook: "живёте игрой в кости и не можете отказаться от хорошей ставки", gold: 15, item: "Кости из слоновой кости" }
});
const BG_META = {
  soldier: ["war", "Воинское звание: солдаты и стража видят в вас своего и подчиняются приказам младшие чином."],
  sage: ["lore", "Исследователь: если вы не знаете ответа, то знаете, где и у кого его искать."],
  criminal: ["street", "Связи в преступном мире: вы найдёте скупщика, проводника или посредника почти везде."],
  acolyte: ["faith", "Приют верующих: храмы вашей веры дадут кров, пищу и простое лечение."],
  folk: ["craft", "Деревенское гостеприимство: простые люди спрячут вас от стражи и накормят."],
  noble: ["high", "Привилегированное положение: вас принимают в высоком обществе, слуги выполняют просьбы."],
  hermit: ["faith", "Откровение: вы знаете тайну, связанную с этим миром, — рассказчик раскроет её в нужный момент."],
  sailor: ["road", "Корабельная служба: на любом судне найдётся место, а в порту — знакомый."],
  outlander: ["road", "Странник: вы помните дороги и всегда найдёте еду и воду в дикой местности."],
  entertainer: ["road", "По просьбе публики: за выступление в таверне вам дадут ночлег и ужин."],
  artisan: ["craft", "Членство в гильдии: мастера помогут советом, жильём и, при нужде, защитой."],
  urchin: ["street", "Городские тайны: в поселениях вы передвигаетесь вдвое быстрее и незаметнее."],
  charlatan: ["street", "Ложная личность: у вас есть второе имя с документами и знакомыми."],
  smuggler: ["street", "Тайные тропы: вы знаете обходные пути, лодочников и тех, кто закроет глаза за монету."],
  merchant: ["craft", "Торговая хватка: торговцы уступают вам в цене, а слухи о сделках доходят первыми."],
  hunter: ["road", "Чтение следов: вы понимаете, кто прошёл, когда и сколько их было."],
  gravedigger: ["faith", "Знаток кладбищ: вы знаете обряды упокоения и приметы беспокойных мертвецов."],
  pilgrim: ["faith", "Обет паломника: святые места и странноприимные дома открыты вам без платы."],
  deserter: ["war", "Солдатская смекалка: вы узнаёте армейские уловки, но бывшие сослуживцы могут вас искать."],
  healer: ["craft", "Народный лекарь: в деревнях вам доверяют больных и рассказывают то, что не скажут чужаку."],
  knight: ["war", "Рыцарская честь: знать и стража признают ваш статус, простой люд ждёт защиты."],
  cultist: ["lore", "Знаки секты: вы читаете тайные метки культов — и рискуете, что вас узнают."],
  miner: ["craft", "Подземное чутьё: вы чуете обвалы, газ и пустоты в камне, не заблудитесь под землёй."],
  monster: ["road", "Знание тварей: вы помните слабости чудовищ и признаки их логова."],
  bounty: ["war", "Розыскные листы: вы умеете находить людей по слухам, приметам и долгам."],
  watch: ["war", "Порядок: стража делится с вами сведениями, а лжецов вы различаете по мелочам."],
  haunted: ["lore", "Голос мёртвого: призрак иногда подсказывает — но цена его помощи растёт."],
  antiquarian: ["lore", "Глаз на древность: вы определяете возраст и происхождение вещей и руин."],
  courier: ["road", "Право гонца: у застав и переправ вас пропускают быстрее, конюхи дают лошадь."],
  fisher: ["craft", "Морские приметы: вы предсказываете погоду, течения и знаете, где пристать."],
  convict: ["street", "Тюремное братство: бывшие узники узнают своих и помогают, стража вас помнит."],
  spy: ["street", "Тайный связной: в любом поселении можно найти или оставить шифрованную весточку."],
  witch: ["lore", "Ведьмина наука: вы узнаёте порчу, знаете приметы и травы, звери вас не боятся."],
  heir: ["high", "Громкая фамилия: старшины и знать вас выслушают, хотя и с подозрением."],
  gambler: ["street", "Игорные дома: в любой таверне найдётся партия, а за столом развязываются языки."]
};
const BG_CATS = { all: "Все", war: "Служба и оружие", street: "Улица и тени", lore: "Знания и тайны", faith: "Вера", craft: "Труд и ремесло", road: "Дорога", high: "Знать" };
Object.entries(BG_META).forEach(([k, [cat, feat]]) => { if (BACKGROUNDS[k]) Object.assign(BACKGROUNDS[k], { cat, feat }); });
Object.assign(BG_ATT, { urchin: { common: 3, guard: -3 }, charlatan: { merchant: -3, common: 2 }, smuggler: { criminal: 6, fisher: 3, guard: -4 }, merchant: { merchant: 8, elder: 2 }, hunter: { common: 3 },
  gravedigger: { priest: 4, common: -3 }, pilgrim: { priest: 6, common: 2 }, deserter: { guard: -6, criminal: 3 }, healer: { common: 6, priest: 2 }, knight: { elder: 5, guard: 4, criminal: -4 },
  cultist: { priest: -6, criminal: 2 }, miner: { common: 3 }, monster: { common: 3, priest: 2 }, bounty: { guard: 3, criminal: -6 }, watch: { guard: 8, criminal: -6 }, haunted: { priest: 2, common: -4 },
  antiquarian: { elder: 3, priest: 2, merchant: 2 }, courier: { guard: 3, merchant: 2 }, fisher: { fisher: 10, common: 2 }, convict: { criminal: 6, guard: -6, common: -2 }, spy: { elder: 2, guard: -2 },
  witch: { common: 2, priest: -5 }, heir: { elder: 5, common: -3 }, gambler: { criminal: 4, merchant: -2 } });
const GROUP_RU = { guard: "Стража", elder: "Старшины", priest: "Жрецы", criminal: "Тёмный люд", fisher: "Рыбаки", merchant: "Торговцы", common: "Простой люд" };
Object.keys(BACKGROUNDS).forEach(k => { if (!BG_ATT_TXT[k]) { const e = Object.entries(BG_ATT[k] || {}); BG_ATT_TXT[k] = e.length ? e.map(([g, v]) => `${GROUP_RU[g].toLowerCase()} ${v > 0 ? "рады" : "насторожены"}`).join(", ") : "встречают как всех"; } });
function bgDetailHTML(id) {
  const b = BACKGROUNDS[id]; if (!b) return `<div class="bgd-empty">${ico("i_scroll", 46)}<p>Выберите прошлое из списка — здесь появится его история, умения и то, как вас встретят люди.</p></div>`;
  const att = Object.entries(BG_ATT[id] || {}).sort((x, y) => y[1] - x[1]);
  return `<div class="bgd-head"><span class="bgd-ico">${ico("b_" + id, 46)}</span><div><div class="eyebrow">${BG_CATS[b.cat] || "Прошлое"}</div><h3>${b.name}</h3></div></div>
    <p class="bgd-hook">Вы ${esc(bgHook(id))}.</p>
    ${b.feat ? `<div class="bgd-feat"><b>Особенность</b><span>${esc(b.feat)}</span></div>` : ""}
    <div class="bgd-grid"><div><h4>Навыки</h4><div class="pc-chips">${b.skills.map(k => `<span>${SKILLS[k][0]} <i>${ABIL_RU[SKILLS[k][1]]}</i></span>`).join("")}</div></div>
      <div><h4>С собой</h4><div class="bgd-gear"><span>${COIN}<b>${b.gold || 10} зм</b></span>${b.item ? `<span>${ico("i_backpack", 16)}${esc(b.item)}</span>` : ""}</div></div></div>
    <h4>Как вас встретят</h4><div class="bgd-att">${att.length ? att.map(([g, v]) => `<span class="${v > 0 ? "pos" : "neg"}">${GROUP_RU[g]}<b>${v > 0 ? "+" : ""}${v}</b></span>`).join("") : `<span class="dim">Без особого отношения</span>`}</div>`;
}
function stepSkills(body) {
  head(body, "Шаг 5", "Прошлое и умения", `${Object.keys(BACKGROUNDS).length} предысторий. Прошлое даёт два навыка, деньги, памятную вещь, особенность, которую учитывает рассказчик, — и то, как вас примут люди.`);
  const wrap = document.createElement("div"); wrap.className = "bg-wrap"; D.bgCat = D.bgCat || "all";
  wrap.innerHTML = `<div class="bg-side"><div class="bg-cats">${Object.entries(BG_CATS).map(([k, t]) => `<button type="button" data-c="${k}" aria-pressed="${D.bgCat === k}">${t}</button>`).join("")}</div>
    <div class="bg-search">${ico("x_look", 15)}<input id="bg-q" placeholder="Поиск по названию или навыку" autocomplete="off" aria-label="Поиск предыстории"></div>
    <div class="bg-list" id="bg-list">${Object.entries(BACKGROUNDS).map(([id, b]) => `<button type="button" class="choice bg-row" data-bg="${id}" data-cat="${b.cat || "all"}" data-q="${esc((b.name + " " + b.skills.map(k => SKILLS[k][0]).join(" ")).toLowerCase())}" aria-pressed="${D.bg === id}">
      <span class="bg-ri">${ico("b_" + id, 22)}</span><span class="bg-rt"><b>${b.name}</b><small>${b.skills.map(k => SKILLS[k][0]).join(" · ")}</small></span></button>`).join("")}<p class="bg-none" hidden>Ничего не нашлось.</p></div></div>
    <div class="bg-detail" id="bg-detail">${bgDetailHTML(D.bg)}</div>`;
  body.append(wrap);
  const lst = wrap.querySelector("#bg-list"); const q = wrap.querySelector("#bg-q");
  const filter = () => { const s = q.value.trim().toLowerCase(); let n = 0; lst.querySelectorAll(".bg-row").forEach(r => { const ok = s ? r.dataset.q.includes(s) : (D.bgCat === "all" || r.dataset.cat === D.bgCat); r.hidden = !ok; if (ok) n++; }); lst.querySelector(".bg-none").hidden = n > 0; };
  wrap.querySelectorAll(".bg-cats button").forEach(b => b.onclick = () => { D.bgCat = b.dataset.c; wrap.querySelectorAll(".bg-cats button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); filter(); lst.scrollTop = 0; });
  q.oninput = filter; filter();
  lst.querySelectorAll(".bg-row").forEach(r => r.onclick = () => { D.bg = r.dataset.bg; D._bgScroll = lst.scrollTop; const lk = lockedSkills(); D.skills = D.skills.filter(k => !lk.has(k)); sfx("pick"); renderCreate(); });
  if (D._bgScroll != null) { lst.scrollTop = D._bgScroll; D._bgScroll = null; } else { const sel = lst.querySelector('[aria-pressed="true"]'); if (sel) requestAnimationFrame(() => { lst.scrollTop = sel.offsetTop - lst.clientHeight / 2 + sel.offsetHeight / 2; }); }
  const cls = CLASSES[D.cls]; const lk = lockedSkills();
  body.insertAdjacentHTML("beforeend", `<div class="subhead">Навыки класса · выбрано ${D.skills.length} из ${cls.skillCount}</div>`);
  const list = document.createElement("div"); list.className = "skill-list"; const sc = draftScores(); const fx = traitFx(D);
  cls.skillList.forEach(k => { const b = document.createElement("button"); b.type = "button"; const locked = lk.has(k); const on = D.skills.includes(k) || locked;
    b.className = "skill-opt" + (locked ? " locked" : ""); b.setAttribute("aria-pressed", String(on));
    b.innerHTML = `<span>${SKILLS[k][0]} <small>${ABIL_RU[SKILLS[k][1]]}</small></span><span class="num">${fmt(mod(sc[SKILLS[k][1]]) + (on ? 2 : 0) + (fx.skills[k] || 0))}</span>`; if (locked) b.title = "Уже есть от расы или предыстории";
    b.onclick = () => { if (locked) return; if (D.skills.includes(k)) D.skills = D.skills.filter(x => x !== k); else if (D.skills.length < cls.skillCount) D.skills.push(k); renderCreate(); }; list.append(b); });
  body.append(list);
}

/* ---------- тоны рассказчика ---------- */
const NARR_TONES = {
  classic: { name: "Классика", ico: "i_lantern", sample: "Таверна гудит, пахнет дымом и жареной рыбой. Кто-то в углу явно ждёт именно тебя.", prompt: "уравновешенное приключенческое фэнтези: тайна, опасность, живые люди, немного юмора." },
  grim: { name: "Мрачный", ico: "b_gravedigger", sample: "Дождь третий день. В канаве у ворот — сапог. Хорошо, если только сапог.", prompt: "грим-дарк: грязь, холод, усталость, у каждой победы есть цена, моральные серые зоны; жестокость не смакуй, показывай последствия." },
  heroic: { name: "Героический эпос", ico: "b_knight", sample: "Ветер рвёт плащ, и сама гроза будто замирает, когда ты обнажаешь клинок.", prompt: "героический эпос: высокий слог, надежда, мгновения славы, злодеи достойны героя, подвиги замечают." },
  noir: { name: "Нуар", ico: "b_spy", sample: "Она вошла так, будто весь город был у неё в долгу. Возможно, так и было.", prompt: "детективный нуар: короткие рубленые фразы, цинизм, у каждого своя цена и своя ложь, дождь и тени, внутренний голос героя." },
  horror: { name: "Готический ужас", ico: "b_haunted", sample: "Свеча гаснет сама собой. В тишине кто-то за стеной повторяет твоё имя.", prompt: "готический ужас: медленное нарастание жути, недосказанность, звуки, запахи, тени, страх неизвестного; не показывай чудовище слишком рано." },
  humor: { name: "С юмором", ico: "b_charlatan", sample: "Стражник смотрит на тебя так, как смотрят на налоговую ведомость: с ужасом и подозрением.", prompt: "ироничный рассказчик: абсурдные детали, остроумные НПС, комичные ситуации — но ставки и опасность настоящие, мир не разваливается в фарс." },
  fairy: { name: "Сказка", ico: "b_witch", sample: "Жила на краю болота старуха, и было у неё три ключа — да все от чужих дверей.", prompt: "народная сказка: певучий слог, присказки, говорящие звери и духи, обычаи и запреты, испытания по три раза." },
  poetic: { name: "Поэтичный", ico: "b_pilgrim", sample: "Туман ложится на воду, как старое письмо, которое никто не решается открыть.", prompt: "поэтичный, образный и ритмичный слог: природа, свет, чувства, метафоры — но действие и выборы всегда ясны." },
  laconic: { name: "Сухой отчёт", ico: "x_scroll", sample: "Северная дорога. Туман. Следы двоих ведут к мельнице. Вечереет.", prompt: "лаконичный полевой журнал: кратко, по делу, только факты, детали, важные для выбора, без украшательств." }
};
function toneLine() { const t = NARR_TONES[S?.settings?.tone] || NARR_TONES.classic; return `ТОН ПОВЕСТВОВАНИЯ: ${t.name} — ${t.prompt}`; }
function modePrompt() { const m = MODES[S.mode] || MODES.sandbox; return typeof m.prompt === "function" ? m.prompt(S) : m.prompt; }

function stepMode(body) {
  head(body, "Шаг 8", "Каким будет рассказчик?", "Режим задаёт правила движка: что будет при нуле хитов, можно ли отменять ходы и как идёт сюжет. Тон — это голос рассказчика, его можно сменить и потом, в настройках.");
  const g = document.createElement("div"); g.className = "mode-grid";
  Object.entries(MODES).forEach(([id, m]) => { const b = document.createElement("button"); b.type = "button"; b.className = "choice mode-card"; b.style.setProperty("--pc", m.col || "var(--lantern)"); b.setAttribute("aria-pressed", String(D.mode === id));
    b.innerHTML = `<div class="pc-top"><span class="pc-ico">${ico(m.ico, 30)}</span><div><div class="ch-name">${m.name}</div><div class="ch-sub">${esc(m.sub)}</div></div></div><div class="pc-chips">${(m.chips || []).map(c => `<span class="${c[1] || ""}">${esc(c[0])}</span>`).join("")}</div>`;
    b.onclick = () => { D.mode = id; sfx("pick"); renderCreate(); }; g.append(b); });
  body.append(g);
  D.tone = D.tone || "classic"; D.len = D.len || "normal";
  const t = document.createElement("div"); t.className = "tone-box";
  t.innerHTML = `<div class="subhead">Тон рассказчика</div><div class="tone-grid">${Object.entries(NARR_TONES).map(([id, x]) => `<button type="button" class="tone" data-t="${id}" aria-pressed="${D.tone === id}"><span class="tone-h">${ico(x.ico, 18)}<b>${x.name}</b></span><q>${esc(x.sample)}</q></button>`).join("")}</div>
    <div class="opt-group" style="margin-top:16px"><span>Длина описаний</span><div class="opts" id="cr-len">${[["short", "Коротко"], ["normal", "Обычно"], ["long", "Подробно"]].map(([k, s]) => `<button type="button" data-v="${k}" aria-pressed="${D.len === k}">${s}</button>`).join("")}</div></div>`;
  body.append(t);
  t.querySelectorAll(".tone").forEach(b => b.onclick = () => { D.tone = b.dataset.t; t.querySelectorAll(".tone").forEach(x => x.setAttribute("aria-pressed", String(x === b))); sfx("tap"); });
  t.querySelectorAll("#cr-len button").forEach(b => b.onclick = () => { D.len = b.dataset.v; t.querySelectorAll("#cr-len button").forEach(x => x.setAttribute("aria-pressed", String(x === b))); sfx("tap"); });
  body.insertAdjacentHTML("beforeend", `<p class="lead" style="margin-top:20px"><b>${esc(D.world.name)}.</b> ${esc(D.world.public)}</p>`);
}

/* ---------- инвентарь: осмотр и действия ---------- */
const CAT_RU = { weapon: "Оружие", armor: "Доспех", potion: "Зелье", food: "Еда и питьё", gear: "Снаряжение", valuable: "Ценность", service: "Услуга", misc: "Вещь" };
function itemHeal(it) { const id = itemIdOf(it); const I = id ? ITEMS[id] : null; return it.heal || (it.potion ? "2d4+2" : I?.heal); }
function isLastWeapon(c, it) { const wkey = it.wk || (itemIdOf(it) && ITEMS[itemIdOf(it)].w); return !!wkey && c.weapons.includes(wkey) && c.weapons.length <= 1; }
function removeItem(c, it) { const i = c.items.indexOf(it); if (i < 0) return false; c.items.splice(i, 1);
  const id = itemIdOf(it); const g = gearOf(c); if (id && ITEMS[id]?.a) { if (ITEMS[id].a.shield && !c.items.some(x => itemIdOf(x) === id)) g.shield = false; else if (g.armor === id && !c.items.some(x => itemIdOf(x) === id)) g.armor = null; recalcAC(c); }
  const wkey = it.wk || (id && ITEMS[id].w); if (wkey && !c.items.some(x => (x.wk || (itemIdOf(x) && ITEMS[itemIdOf(x)].w)) === wkey)) c.weapons = c.weapons.filter(w => w !== wkey); return true; }
function dropItem(it, how) {
  const c = C(); if (isLastWeapon(c, it)) return; const loc = S.world.loc; const st = scState(loc); const ppl = scenePeople(loc); const h = ppl[0] || { x: 9, y: 6 }; const sc = sceneOf(loc);
  if (!removeItem(c, it)) return; const taken = (st.add || []).map(o => ({ x: o.x, y: o.y })); const p = scFreeNear(sc, taken, h.x + .9, h.y + .4, 2);
  let label = it.name.toLowerCase(); let n = 2; while (sceneObjects(loc).some(o => String(o.label).toLowerCase() === label)) label = `${it.name.toLowerCase()} (${n++})`;
  st.add.push({ k: "item", label, acc: it.name.toLowerCase(), x: +p.x.toFixed(2), y: +p.y.toFixed(2), w: .6, h: .6, drop: JSON.parse(JSON.stringify(it)) });
  pushFeed({ t: "chips", items: [{ c: "item", x: `${how === "throw" ? "Брошено" : "Оставлено"}: ${it.name}` }] }); sfx(how === "throw" ? "throw" : "close");
}
function pickupDropped(loc, o) {
  const st = scState(loc); const i = st.add.findIndex(a => a.label === o.label && a.drop); if (i < 0) return; const it = st.add[i].drop; st.add.splice(i, 1); const c = C(); c.items.push(it);
  const wkey = it.wk || (itemIdOf(it) && ITEMS[itemIdOf(it)].w); if (wkey && !c.weapons.includes(wkey)) c.weapons.push(wkey);
  pushFeed({ t: "chips", items: [{ c: "item", x: `Поднято: ${it.name}` }] }); sfx("pick"); after();
}
function giveTargets() { const loc = S.world.loc; return scenePeople(loc).filter(p => p.type === "npc" && NPCS[p.id] && !p.asleep).map(p => ({ id: p.id, name: NPCS[p.id].name, role: NPCS[p.id].role })); }
function openItem(it) {
  const c = C(); if (!c.items.includes(it)) return; const id = itemIdOf(it); const I = id ? ITEMS[id] : null; const cat = itemCat(it); const wd = it.wk ? c.wdefs?.[it.wk] : null;
  const g = gearOf(c); const worn = I?.a ? (I.a.shield ? g.shield : g.armor === id) : false; const heal = itemHeal(it); const last = isLastWeapon(c, it); const val = itemValue(it); const ppl = giveTargets();
  const desc = it.desc || I?.d || (wd ? wd.look : "") || "Обычная с виду вещь. Возможно, при внимательном осмотре найдётся что-то ещё.";
  const acts = [];
  if (heal && (cat === "potion" || cat === "food" || id === "healkit")) acts.push(["use", cat === "food" ? "Съесть" : cat === "potion" ? "Выпить" : "Применить", "x_use", c.hp >= c.maxHp ? "хиты и так полны" : ""]);
  if (I?.a) acts.push(["wear", worn ? "Снять" : "Надеть", I.a.shield ? "i_shield" : "i_mail", S.world.combat ? "не во время боя" : (!worn && !canWear(c, id) ? "нет владения" : "")]);
  acts.push(["look", "Осмотреть внимательно", "x_look", ""], ["useon", "Использовать…", "x_talk", ""]);
  if (ppl.length) acts.push(["give", "Отдать", "x_give", last ? "последнее оружие" : ""]);
  acts.push(["throw", "Метнуть", "x_throw", last ? "последнее оружие" : ""], ["drop", "Выбросить", "x_drop", last ? "последнее оружие" : worn ? "сначала снимите" : ""]);
  modal(`<div class="it-card" style="--cc:${wd ? wd.col : CAT_COL[cat] || "var(--lantern)"}">
    <div class="it-head"><span class="it-ico">${itemIco(it, 40)}</span><div><div class="eyebrow">${CAT_RU[cat] || "Вещь"}${worn ? " · надето" : wd && c.weapons.includes(it.wk) ? " · в снаряжении" : ""}</div><h2>${esc(it.name)}</h2>${val ? `<small class="home-note">${COIN}примерно ${fmtMoney(val)}</small>` : ""}</div></div>
    ${wd ? weaponCardHTML(wd, c) : `<p class="it-desc">${esc(desc)}</p>`}
    ${heal ? `<div class="it-stat">${ico("i_potion", 16)} Лечит ${esc(String(heal))} HP</div>` : ""}
    <div class="it-acts">${acts.map(([k, t, ic, why]) => `<button type="button" class="it-act${k === "drop" ? " warn" : ""}" data-a="${k}" ${why || busy ? "disabled" : ""} title="${esc(why)}">${ico(ic, 18)}<span>${t}${why ? `<small>${esc(why)}</small>` : ""}</span></button>`).join("")}</div>
    <div class="it-sub" id="it-sub" hidden></div>
    <div class="row"><button class="btn" type="button" id="it-close">Закрыть</button></div></div>`, root => {
    root.querySelector(".modal").classList.add("it-modal");
    root.querySelector("#it-close").onclick = closeModal; const sub = root.querySelector("#it-sub");
    const ask = (html, bind) => { sub.hidden = false; sub.innerHTML = html; bind(sub); };
    root.querySelectorAll("[data-a]").forEach(b => b.onclick = () => { const a = b.dataset.a; const nm = it.name.toLowerCase();
      if (a === "use") { const d = rollDice(String(heal).includes("d") ? heal : "1d1+" + (Number(heal) - 1)); const got = healHero(d.total); removeItem(c, it); pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · ${it.name}` }] }); sfx(cat === "food" ? "pick" : "potion"); closeModal(); after(); }
      else if (a === "wear") { if (I.a.shield) g.shield = !worn; else g.armor = worn ? null : id; recalcAC(c); pushFeed({ t: "chips", items: [{ c: "xp", x: `${worn ? "Снято" : "Надето"}: ${it.name} · КД ${c.ac}` }] }); sfx("pick"); closeModal(); after(); }
      else if (a === "look") { closeModal(); takeTurn(`Внимательно осматриваю свою вещь: ${nm}. ${desc ? "(Известно: " + desc + ")" : ""} Ищу метки, надписи, скрытые детали и что она может значить для этой истории.`, { checks: [{ kind: "skill", skill: wd || I?.a ? "investigation" : /письм|карт|книг|свит|запис/.test(nm) ? "history" : /трав|гриб|зель|настой/.test(nm) ? "nature" : "investigation", dc: 12, reason: "Заметить скрытое в вещи" }] }); }
      else if (a === "useon") ask(`<label class="it-lbl" for="it-on">Как использовать «${esc(it.name)}»?</label><div class="it-row"><input id="it-on" maxlength="120" placeholder="Например: подсветить факелом надпись на стене"><button class="btn primary small" type="button" id="it-go">Сделать</button></div>`, s => { const inp = s.querySelector("#it-on"); inp.focus(); const go = () => { const v = inp.value.trim(); if (!v) return; closeModal(); takeTurn(`Использую ${nm}: ${v}`); }; s.querySelector("#it-go").onclick = go; inp.onkeydown = e => { if (e.key === "Enter") go(); }; });
      else if (a === "give") ask(`<div class="it-lbl">Кому отдать «${esc(it.name)}»?</div><div class="it-people">${ppl.map(p => `<button type="button" class="btn small" data-p="${p.id}">${esc(p.name)}<small>${esc(p.role)}</small></button>`).join("")}</div>`, s => s.querySelectorAll("[data-p]").forEach(pb => pb.onclick = () => { const n = NPCS[pb.dataset.p]; removeItem(c, it); pushFeed({ t: "chips", items: [{ c: "item", x: `Отдано: ${it.name} → ${n.name}` }] }); sfx("pick"); closeModal(); takeTurn(`Отдаю ${n.name} свою вещь: ${nm} (она уже у ${n.name}, не возвращай её в инвентарь без причины)`); }));
      else if (a === "throw") { const foes = Object.keys(ENEMIES).filter(e => ENEMIES[e].loc === S.world.loc && S.world.enemies[e]?.alive && S.world.combat);
        ask(`<div class="it-lbl">Куда метнуть «${esc(it.name)}»?</div><div class="it-people">${foes.map(e => `<button type="button" class="btn small" data-f="${e}">${esc(ENEMIES[e].name)}<small>враг</small></button>`).join("")}<button type="button" class="btn small" data-f="">Просто бросить подальше<small>отвлечь, проверить, сбить</small></button></div>`, s => s.querySelectorAll("[data-f]").forEach(fb => fb.onclick = () => { const f = fb.dataset.f; dropItem(it, "throw"); closeModal();
          takeTurn(f ? `Швыряю ${nm} в ${ENEMIES[f].name}` : `Бросаю ${nm} подальше, чтобы отвлечь внимание или проверить, что там`, { checks: [{ kind: "skill", skill: "athletics", dc: f ? 12 : 10, reason: f ? "Попасть броском" : "Бросок" }] }); })); }
      else if (a === "drop") { dropItem(it, "drop"); closeModal(); after(); }
    });
  });
}
function renderInventory(tb) {
  const c = C(); const g = gearOf(c);
  tb.insertAdjacentHTML("beforeend", `<div class="inv-purse"><span>${COIN}<b>${fmtMoney(purse(c))}</b></span><span class="home-note">КД ${c.ac}${g.armor ? " · " + esc(ITEMS[g.armor].n.toLowerCase()) : " · без доспеха"}${g.shield ? " + щит" : ""}</span></div>`);
  if (!c.items.length) tb.insertAdjacentHTML("beforeend", `<p class="empty">Сумка пуста.</p>`);
  c.items.forEach(it => {
    const id = itemIdOf(it); const I = id ? ITEMS[id] : null; const cat = itemCat(it); const heal = itemHeal(it);
    const row = document.createElement("div"); row.className = "inv-item"; row.style.setProperty("--cc", CAT_COL[cat]);
    const worn = I?.a ? (I.a.shield ? g.shield : g.armor === id) : false;
    const wd = it.wk ? c.wdefs?.[it.wk] : null; if (wd) row.style.setProperty("--cc", wd.col);
    row.innerHTML = `<button type="button" class="inv-open" title="Осмотреть и действия"><span class="ware-ic s${wd ? " w" : ""}">${itemIco(it, 17)}</span><span class="inv-t">${esc(it.name)}${worn ? ` <em class="inv-tag">надето</em>` : ""}<small>${esc(wd ? `${weaponDice(c, wd)} ${wd.dt}${wd.hit ? " · попад. " + fmt(wd.hit) : ""}${wd.dmg ? " · урон " + fmt(wd.dmg) : ""}${wd.crit < 20 ? " · крит " + wd.crit + "+" : ""}${weaponProf(c, wd) ? "" : " · нет владения"}` : (it.desc || I?.d || "").slice(0, 60))}</small></span></button>`;
    row.querySelector(".inv-open").onclick = () => { sfx("open"); openItem(it); };
    const btn = (t, fn, dis) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn small"; b.textContent = t; b.disabled = !!dis; b.onclick = fn; row.append(b); };
    if (heal && (cat === "potion" || cat === "food" || id === "healkit")) btn(cat === "food" ? "Съесть" : "Применить", () => { const d = rollDice(String(heal).includes("d") ? heal : "1d1+" + (Number(heal) - 1)); const got = healHero(d.total); removeItem(c, it); pushFeed({ t: "chips", items: [{ c: "heal", x: `+${got} HP · ${it.name}` }] }); sfx(cat === "food" ? "pick" : "potion"); after(); }, busy || c.hp >= c.maxHp);
    if (I?.a) { const ok = canWear(c, id); btn(worn ? "Снять" : "Надеть", () => { if (I.a.shield) g.shield = !worn; else g.armor = worn ? null : id; recalcAC(c); pushFeed({ t: "chips", items: [{ c: "xp", x: `${worn ? "Снято" : "Надето"}: ${it.name} · КД ${c.ac}` }] }); sfx("pick"); after(); }, busy || S.world.combat || (!worn && !ok)); if (!ok && !worn) row.querySelector(".inv-t small").textContent = "нет владения этим доспехом"; }
    const more = document.createElement("button"); more.type = "button"; more.className = "inv-more"; more.setAttribute("aria-label", "Действия: " + it.name); more.textContent = "⋯"; more.onclick = () => { sfx("open"); openItem(it); }; row.append(more);
    tb.append(row);
  });
  tb.insertAdjacentHTML("beforeend", `<small class="home-note inv-hint">Нажмите на предмет, чтобы осмотреть его, использовать, отдать, метнуть или выбросить. Выброшенное остаётся на плане сцены — его можно поднять.</small>`);
}
