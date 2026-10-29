P='/home/claude/salt-harbor.html'; h=open(P).read(); SP='/tmp/claude-0/-home-claude/ff38720c-3120-5f73-a61d-2b206726c719/scratchpad/'
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
MK='\n/* =========================================================================\n   ЗВУК: музыка по настроению'
R(MK,'\n/* PROVIDERS */\n'+open(SP+'providers.js').read()+MK)
R('/* MOBILE */\n',open(SP+'providers.css').read()+'/* MOBILE */\n')
R('<span class="pill" id="pill-ai"><span class="dot"></span><span id="pill-ai-t">Рассказчик: подключение…</span></span>','<button type="button" class="pill" id="pill-ai" title="Выбрать рассказчика и портреты"><span class="dot"></span><span id="pill-ai-t">Рассказчик: подключение…</span></button>')
R('    ${modelPickerHTML("set-model")}\n','    <div class="opt-group"><span>ИИ-рассказчик и портреты</span><div><button class="btn small" type="button" id="set-ai">Выбрать рассказчика и генератор портретов…</button></div><small class="home-note">Сейчас: ${esc(curProvName() || "без ИИ")}. Claude, Puter, Pollinations, свой ключ Gemini/Groq/OpenRouter или ИИ в браузере.</small></div>\n    ${modelPickerHTML("set-model")}\n')
R('    bindModelPicker(root, "set-model"); bindSoundSettings(root);\n','    bindModelPicker(root, "set-model"); bindSoundSettings(root); root.querySelector("#set-ai").onclick = () => openAISettings();\n')
open(P,'w').write(h); print('prov ok')
