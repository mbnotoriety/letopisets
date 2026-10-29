import json,os
P='/home/claude/salt-harbor.html'; h=open(P).read(); SP='/tmp/claude-0/-home-claude/ff38720c-3120-5f73-a61d-2b206726c719/scratchpad/'
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
MK='\n/* =========================================================================\n   ЗВУК: музыка по настроению'
man=json.load(open(SP+'mus/music_manifest.json'))['man'] if os.path.exists(SP+'mus/music_manifest.json') else {}
have=set(f[:-4] for f in os.listdir(SP+'mus/out')) if os.path.exists(SP+'mus/out') else set()
man={st:{m:[t for t in ts if t in have] for m,ts in md.items()} for st,md in man.items()}
js=open(SP+'interiors_data.js').read()+'\n'+open(SP+'interiors.js').read().replace('/*MUSIC_MANIFEST*/{}',json.dumps(man,ensure_ascii=False))
# музыку и интерьеры вставляем ПОСЛЕ звукового модуля (нужны auNext/setMood/MUSIC) — в конец скрипта, перед последним </script>
B='(function boot() {'; assert h.count(B)==1; i=h.index(B); h=h[:i]+'/* INTERIORS */\n'+js+'\n'+h[i:]
R('${under.map(o => scObjSVG(o, R)).join("")}${scRoomSVG(sc)}${over.map(o => scObjSVG(o, R)).join("")}','${scSkinOpen()}${under.map(o => scObjSVG(o, R)).join("")}${scRoomSVG(sc)}${over.map(o => scObjSVG(o, R)).join("")}${scSkinClose()}')
R('const col = r.mat === "stone" ? "#5b605d" : r.mat === "log" ? "#4a3220" : "#3b2a1c"; const hi = r.mat === "stone" ? "#878c86" : "#6b4c31";','let col = r.mat === "stone" ? "#5b605d" : r.mat === "log" ? "#4a3220" : "#3b2a1c"; let hi = r.mat === "stone" ? "#878c86" : "#6b4c31"; { const ws = typeof intStyle === "function" ? intStyle()?.wall : null; if (ws && r.mat !== "log") { col = ws[0]; hi = ws[1]; } }')
R('const el = new Audio(auSrc("m-" + name));','const el = new Audio(String(name).startsWith("k-") ? `snd/${name}.mp4` : auSrc("m-" + name));')
R('— Scott Buckley (CC BY-SA 4.0).','— Scott Buckley (CC BY-SA 4.0). Музыка сеттингов и таверн — Kevin MacLeod (<a href="https://incompetech.com" target="_blank" rel="noopener">incompetech.com</a>), CC BY 4.0.')
open(P,'w').write(h); print('interiors ok', sum(len(v) for m in man.values() for v in m.values()))
