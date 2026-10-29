/* ПОСЛЕДСТВИЯ ПОСТУПКОВ: мир помнит заметные и необычные действия героя */
function deedsBrief() {
  const d = S?.world?.deeds || []; if (!d.length) return ""; const now = d.filter(x => x.t === S.turn).map(x => x.d); const old = d.filter(x => x.t !== S.turn).slice(-8).map(x => `${x.d}${x.loc && POIS[x.loc] ? ` (${POIS[x.loc].name})` : ""}`);
  return `${old.length ? `ПОСТУПКИ ГЕРОЯ, КОТОРЫЕ ПОМНИТ МИР (слухи расходятся, люди реагируют, у поступков бывают отложенные последствия — вспоминай о них, когда к месту): ${old.join("; ")}.\n` : ""}${now.length ? `ЭТОТ ХОД герой совершает заметный поступок: ${now.join("; ")}. Обязательно покажи яркий результат и реакцию окружающих, и отрази последствие в JSON (facts, attitude, rep, scene или threat).\n` : ""}`;
}
{ const _vp = validatePlan; validatePlan = function (plan) { const out = _vp.apply(this, arguments); try { const d = str(plan?.deed, 90); if (d && !/^(null|нет|-)$/i.test(d)) { S.world.deeds = S.world.deeds || []; S.world.deeds.push({ d, t: S.turn, loc: S.world.loc }); if (S.world.deeds.length > 24) S.world.deeds.splice(0, S.world.deeds.length - 24); out.deed = d; } } catch (e) { console.error(e); } return out; }; }
