P='/home/claude/salt-harbor.html'; h=open(P).read(); SP='/tmp/claude-0/-home-claude/ff38720c-3120-5f73-a61d-2b206726c719/scratchpad/'
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
MK='\n/* =========================================================================\n   ЗВУК: музыка по настроению'
R(MK,'\n/* DIALOGUE */\n'+open(SP+'dialogue.js').read()+MK)
R('</style>',open(SP+'dialogue.css').read()+'</style>')
R('<div class="sugg" id="sugg"></div>','<div id="dlg" class="dlg" hidden aria-label="Варианты реплик"></div>\n            <div class="sugg" id="sugg"></div>')
R('"start_combat": [], "suggestions": ["3 коротких варианта следующего действия, до 6 слов"]}','"start_combat": [], "dialogue": [], "suggestions": ["3 коротких варианта следующего действия, до 6 слов"]}')
R('иначе 0.`;\n  ctl = new AbortController();', 'иначе 0. dialogue — ТОЛЬКО если герой сейчас разговаривает с НПС (speaker не null) и разговор может продолжиться: 3–4 варианта следующей реплики героя от первого лица, до 90 символов: [{"text":"…","skill":null,"dc":0,"tag":null}]. 1–2 простых вопроса/ответа без проверки (skill null) и 1–2 смелых хода с проверкой навыка (skill: persuasion|deception|intimidation|insight|performance|investigation|history|arcana|religion|medicine|nature|survival), которые опираются на класс, предысторию, расу, черты героя и то, что он знает; tag — название класса/предыстории/расы, если реплика на них опирается, иначе null; dc: 10 легко, 13 средне, 16 трудно, 19 очень трудно. Действие в разговоре (присмотреться, подсунуть монету) пиши в скобках. Варианты должны продвигать разговор и вести к тайне, поручениям или выгоде. Если разговора нет — [].`;\n  ctl = new AbortController();')
R('const inp = document.getElementById("act-input"); inp.value = `${n.name}, `; inp.focus(); }, closes: true }','dlgStart(id); }, closes: true }')
R('b.onclick = () => { const qa = questNpcActs(id); if (qa.length && !busy) { qa[0].fn(); return; } const inp = document.getElementById("act-input"); inp.value = `${n.name}, `; inp.focus(); showTab("story"); };','b.onclick = () => { const qa = questNpcActs(id); if (qa.length && !busy) { qa[0].fn(); return; } dlgStart(id); };')
open(P,'w').write(h); print('ok')
