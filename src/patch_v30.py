P='/home/claude/salt-harbor.html'; h=open(P).read(); SP='/tmp/claude-0/-home-claude/ff38720c-3120-5f73-a61d-2b206726c719/scratchpad/'
MK='\n/* =========================================================================\n   ЗВУК: музыка по настроению'
assert h.count(MK)==1; h=h.replace(MK,'\n/* NOTES30 */\n'+open(SP+'notes30.js').read()+MK)
i=h.rindex('</style>'); h=h[:i]+open(SP+'theme30.css').read()+h[i:]
import re
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
st=h.index('<style>'); en=h.rindex('</style>'); css=h[st:en]
def fixrule(m):
    b=m.group(0)
    if not re.search(r'text-transform: ?uppercase',b): return b
    b=re.sub(r'text-transform: ?uppercase','text-transform: none',b); b=re.sub(r'letter-spacing: ?[.\d]+em','letter-spacing: 0',b); return b
css=re.sub(r'[^{}]*\{[^{}]*\}',fixrule,css); h=h[:st]+css+h[en:]
R('<span class="eyebrow">День ${tm.day} · ${DAY_PARTS[tm.part]}</span>','<span class="eyebrow">${DAY_PARTS[tm.part][0].toUpperCase() + DAY_PARTS[tm.part].slice(1)}, день ${tm.day}</span>')
R('<span class="eyebrow">План · ${SC_NAMES[sc.tpl] || "место"}','<span class="eyebrow">План: ${(SC_NAMES[sc.tpl] || "место").toLowerCase()}')
R('class="scene-time">${DAY_PARTS[t.part]} · ${w.name.toLowerCase()}','class="scene-time">${DAY_PARTS[t.part][0].toUpperCase() + DAY_PARTS[t.part].slice(1)}, ${w.name.toLowerCase()}')
R('${weatherNow().name} · ${repLabel(rv)}</span>','${weatherNow().name}, ${repLabel(rv).toLowerCase()}</span>')
open(P,'w').write(h); print('v30 ok')
