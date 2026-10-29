import re
P='/home/claude/salt-harbor.html'; h=open(P).read(); SP='/tmp/claude-0/-home-claude/ff38720c-3120-5f73-a61d-2b206726c719/scratchpad/'
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
# ---- шрифты: современные, мягкие, с кириллицей
R('family=Cormorant:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;1,7..72,400&family=Onest:wght@400;500;600;700','family=Geologica:wght@400;500;600;700&family=Golos+Text:wght@400;500;600;700&family=Unbounded:wght@500;600;700&family=Onest:wght@400;500;600;700')
R('--display: "Cormorant", "Cormorant Garamond", Georgia, serif;','--display: "Geologica", "Golos Text", "Onest", system-ui, sans-serif; --logo: "Unbounded", "Geologica", system-ui, sans-serif;')
R('--story: "Literata", Georgia, "Times New Roman", serif;','--story: "Golos Text", "Onest", system-ui, -apple-system, "Segoe UI", sans-serif;')
h=h.replace('Cormorant, Georgia, serif','Geologica, Onest, sans-serif')
R('.logo b { font-family: var(--display); font-size: 26px; font-weight: 700; letter-spacing: .01em; line-height: 1; }','.logo b { font-family: var(--logo); font-size: 21px; font-weight: 600; letter-spacing: -.01em; line-height: 1; }')
R('  .logo b { font-size: 22px; }','  .logo b { font-size: 18px; }')
# заголовки на Geologica крупнее Cormorant — уменьшаем кегль в правилах с display-шрифтом
st=h.index('<style>'); en=h.index('</style>'); css=h[st:en]; n=0
def fix(m):
    global n
    body=m.group(0)
    if 'var(--display)' not in body: return body
    def sc(mm):
        global n; n+=1; v=float(mm.group(1)); return f'font-size: {round(v*0.8,1)}{mm.group(2)}'
    return re.sub(r'font-size: ?([\d.]+)(px|em|rem)', sc, body)
css=re.sub(r'[^{}]*\{[^{}]*\}', fix, css); h=h[:st]+css+h[en:]
print('scaled', n)
# ---- лента истории
MK='\n/* =========================================================================\n   ЗВУК: музыка по настроению'
R(MK,'\n/* FEED */\n'+open(SP+'feed.js').read()+'\n'+open(SP+'deeds.js').read()+MK)
R('/* MOBILE */\n',open(SP+'feed.css').read()+'/* MOBILE */\n')
# ---- необычные действия: арбитр и рассказчик
R('Ответь только JSON: {"checks":[{"kind":"skill","skill":"perception","dc":13,"adv":0,"reason":"коротко зачем"}],"move_to":null,"talk_to":null,"attack_npc":null,"nonlethal":false}`;',
  '''- Необычные, творческие и рискованные действия (поджечь, спрятаться, переодеться, устроить представление, подкупить, украсть, приручить зверя, сломать, залезть, обмануть, соблазнить) НЕ считай простыми и не игнорируй: если исход неочевиден — назначь проверку подходящего навыка или характеристики.
- deed — если поступок героя заметный и люди его запомнят (необычный, дерзкий, щедрый, жестокий, смешной, разрушительный, важный для сюжета), опиши его коротко от третьего лица, до 12 слов («поджёг сарай старосты», «спел на столе в таверне»), иначе null. Обычные разговоры, осмотр и ходьба — null.
Ответь только JSON: {"checks":[{"kind":"skill","skill":"perception","dc":13,"adv":0,"reason":"коротко зачем"}],"move_to":null,"talk_to":null,"attack_npc":null,"nonlethal":false,"deed":null}`;''')
R('- Провалы имеют последствия, успехи дают продвижение и улики. Раскрывай тайну только через заслуженные улики.',
  '- Провалы имеют последствия, успехи дают продвижение и улики. Раскрывай тайну только через заслуженные улики.\n- Каждое действие героя меняет мир. Необычные, творческие и странные поступки никогда не проходят бесследно: покажи яркий результат и реакцию людей сейчас, а значимое отрази в JSON (facts — что сделал герой и чем это обернулось; attitude; rep; scene; threat; npc_moves). Никогда не отвечай «ничего не происходит» и не отменяй действие героя без причины: если оно невозможно — покажи попытку, что пошло не так и какой ценой. Неожиданные решения игрока могут менять ход истории — подстраивай сюжет под них.')
c=h.count('УСТАНОВЛЕННЫЕ ФАКТЫ (не противоречь):'); print('facts lines',c)
h=h.replace('${pinsBrief()}УСТАНОВЛЕННЫЕ ФАКТЫ (не противоречь):','${pinsBrief()}${deedsBrief()}УСТАНОВЛЕННЫЕ ФАКТЫ (не противоречь):')
R('<span><b>10</b>классов</span><span><b>4</b>биома</span>','<span><b>11</b>сеттингов</span><span><b>12</b>биомов</span>')
R('/* MOBILE */\n','@media (max-width: 440px) { .logo b { font-family: var(--display) !important; font-size: 17px !important; letter-spacing: 0 !important; font-weight: 700 !important; } }\n/* MOBILE */\n')
open(P,'w').write(h); print('v28 ok', h.count('deedsBrief()'))
