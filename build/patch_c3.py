import re
P='/home/claude/salt-harbor.html'; h=open(P).read()
def cut_fn(h,name):
    a=h.find('\nfunction '+name+'(')
    assert a>=0,name
    b=a+1
    # end: next line starting with 'function ' or '/*' or 'const ' at col 0
    m=re.compile(r'\n(?=function |/\*|const |let |async function )').search(h,a+10)
    return h[:a]+h[m.start():]
for f in ['stepAbil','stepSkills','stepMode','renderInventory']: h=cut_fn(h,f)
# MODES
a=h.find('const MODES = {'); b=h.find('\n};',a)+3
h=h[:a]+open('modes.js').read().rstrip()+h[b:]
# module before audio section
mark='/* =========================================================================\n   ЗВУК: музыка по настроению'
assert mark in h
h=h.replace(mark, open('creation3.js').read()+'\n'+mark,1)
# css
i=h.rfind('</style>'); h=h[:i]+open('creation3.css').read()+h[i:]
rep=[
 ('secondChance: D.mode === "sandbox"','secondChance: MODES[D.mode]?.death === "second"'),
 ('suggestions: [], settings: { len: "normal", voice: false } };','suggestions: [], settings: { len: D.len || "normal", voice: false, tone: D.tone || "classic" } };'),
 ('if (lastSnap && S.mode !== "chronicle" && !busy)','if (lastSnap && MODES[S.mode]?.undo !== false && !busy)'),
 ('${S.mode === "chronicle" ? "В режиме «Хроника» ходы не отменяются."','${MODES[S.mode]?.undo === false ? `В режиме «${MODES[S.mode].name}» ходы не отменяются.`'),
 ('if (S.mode === "novice") { c.hp = 1;','if (MODES[S.mode]?.death === "captured") { capturedDefeat(); return; }\n  if (MODES[S.mode]?.death === "faint") { c.hp = 1;'),
 ('if (S.mode === "sandbox" && S.secondChance)','if (MODES[S.mode]?.death === "second" && S.secondChance)'),
 ('${MODES[S.mode].prompt}','${modePrompt()}\n${toneLine()}'),
 ('+ (S.pendingXP || 0); if (xp)','+ (S.pendingXP || 0); const xpm = MODES[S.mode]?.xp || 1; if (xp && xpm !== 1) { /* множитель режима */ } if (xp)'),
 ('— вы ${c.hook || bgHook(c.bg)}.','— вы ${c.hook || bgHook(c.bg)}${BACKGROUNDS[c.bg].feat ? " (особенность: " + BACKGROUNDS[c.bg].feat + ")" : ""}.'),
 ('const acts = [{ t: "Осмотреть", fn: () => turn(`Осматриваю ${o.acc}`), dis: busy }]; if (o.search)','const acts = [{ t: "Осмотреть", fn: () => turn(`Осматриваю ${o.acc}`), dis: busy }]; if (o.drop) acts.unshift({ t: "Поднять", fn: () => pickupDropped(id, o), dis: busy }); if (o.search)'),
 ('.map((a, i) => ({ ...a, id: "a" + i, act: true, search: true,','.map((a, i) => ({ ...a, id: "a" + i, act: true, search: !a.drop,'),
]
for x,y in rep:
    assert h.count(x)==1,(h.count(x),x[:60]); h=h.replace(x,y)
open(P,'w').write(h); print('patched')
