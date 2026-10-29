import json
P='/home/claude/salt-harbor.html'; h=open(P).read(); SP='/tmp/claude-0/-home-claude/ff38720c-3120-5f73-a61d-2b206726c719/scratchpad/'
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
MK='\n/* =========================================================================\n   ЗВУК: музыка по настроению'
js=open(SP+'vox.js').read().replace('/*VOX_MANIFEST*/{}', json.dumps(json.load(open(SP+'vox_manifest.json')),ensure_ascii=False))
R(MK,'\n/* VOX */\n'+js+MK)
R('/* MOBILE */\n',open(SP+'vox.css').read()+'/* MOBILE */\n')
R('cfg: Object.assign({ on: true, music: .45, sfx: .7, amb: .4 }','cfg: Object.assign({ on: true, music: .45, sfx: .7, amb: .4, vox: .8 }')
R('${row("music", "Музыка")}${row("amb", "Фон")}${row("sfx", "Эффекты")}</div>','${row("music", "Музыка")}${row("amb", "Фон")}${row("sfx", "Эффекты")}${row("vox", "Голоса")}</div>')
R('— Scott Buckley (CC BY-SA 4.0).','— Scott Buckley (CC BY-SA 4.0). Голоса персонажей — записи с <a href="https://freesound.org" target="_blank" rel="noopener">Freesound</a> (CC0: Reitanna, dodrio, morganveilleux, daalvinz, Sadiquecat, moxobna и другие); мужские усилия — VoiceBosch / SoundBiter, OpenGameArt (CC BY-SA 4.0).')
R('if (inp.dataset.au === "sfx") sfx("chime"); });','if (inp.dataset.au === "sfx") sfx("chime"); if (inp.dataset.au === "vox") voxPreview(); });')
R('{"speaker": "id НПС, который говорит больше всех, или null", ','{"speaker": "id НПС, который говорит больше всех, или null", "voice": "hmm|huh|sigh|laugh|pleased|gasp|angry|fear|null", ')
R('damage — только если герой получил вред','voice — короткий звук-эмоция, который издаёт speaker в этой сцене, выбери по его настроению и действиям: hmm — раздумье, сомнение; huh — отзывается, лёгкое удивление; sigh — усталость, грусть, досада; laugh — смех; pleased — радость, довольство; gasp — изумление, испуг; angry — злость, раздражение; fear — страх. Когда speaker не null, всегда коротко опиши в тексте его реакцию (вздох, усмешка, фырканье, дрожь в голосе) в согласии с voice; если speaker null — null. damage — только если герой получил вред')
open(P,'w').write(h); print('vox ok')
