P='/home/claude/salt-harbor.html'; h=open(P).read(); SP='/tmp/claude-0/-home-claude/ff38720c-3120-5f73-a61d-2b206726c719/scratchpad/'
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
MK='\n/* =========================================================================\n   ЗВУК: музыка по настроению'
R(MK,'\n/* COMPANIONS */\n'+open(SP+'companions.js').read()+MK)
R('/* MOBILE */\n',open(SP+'companions.css').read()+'/* MOBILE */\n')
R('const v = r.skip ? "—"','const v = r.verdict ? r.verdict : r.skip ? "—"')
R('  results.forEach(r => {\n    if (r.kind === "attack") { const w = WEAPONS','  results.forEach(r => {\n    if (r.comp || r.vsComp) { compQuickLine(r, L); return; }\n    if (r.kind === "attack") { const w = WEAPONS')
R('const text = L.slice(0, 5).join(" ")','const text = L.slice(0, 7).join(" ")')
X='${npcBrief()}${combatBrief()}${travelBrief()}${questBrief()}'
assert h.count(X)==2; i=h.index(X); h=h[:i]+X+'${compBrief(true)}'+h[i+len(X):]; j=h.index(X,i+len(X)+20); h=h[:j]+X+'${compBrief()}'+h[j+len(X):]
R('"dialogue": [], "suggestions"','"dialogue": [], "companions": {}, "recruit": null, "suggestions"')
R('Если разговора нет — [].`;','Если разговора нет — []. recruit — id НПС, который В ЭТОЙ сцене ясно согласился пойти с героем спутником (только из списка «могут стать спутниками»), иначе null.`;')
R('ПОГИБШИЕ ЖИТЕЛИ: ${dead}.','${compEpilogue()}ПОГИБШИЕ ЖИТЕЛИ: ${dead}.')
R('}<span class="att ${cl}">${lab}</span>`;\n    b.onclick = () => { const qa = questNpcActs(id);','}${inParty(id) ? `<span class="att comp">спутник</span>` : compRecruitReady(id) ? `<span class="att cand" title="Может стать спутником">★ ${lab}</span>` : `<span class="att ${cl}">${lab}</span>`}`;\n    b.onclick = () => { const qa = questNpcActs(id);')
R('.att.neg { color: var(--ember); background: rgba(232, 115, 90, .1); }','.att.neg { color: var(--ember); background: rgba(232, 115, 90, .1); }\n.att.comp { color: #7fc8f0; background: rgba(114, 174, 208, .14); } .att.cand { color: var(--lantern); background: var(--lantern-soft); }')
open(P,'w').write(h); print('comp ok')
