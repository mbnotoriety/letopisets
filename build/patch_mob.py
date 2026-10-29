P='/home/claude/salt-harbor.html'; h=open(P).read(); SP='/tmp/claude-0/-home-claude/ff38720c-3120-5f73-a61d-2b206726c719/scratchpad/'
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
R('<title>Летописец</title>\n','<meta charset="utf-8">\n<title>Летописец</title>\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n')
R('</style>','/* MOBILE */\n'+open(SP+'mobile.css').read()+'</style>')
R('<span><b>4</b>класса</span>','<span><b>10</b>классов</span>')
open(P,'w').write(h); print('mob ok')
