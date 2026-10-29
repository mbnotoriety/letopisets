import re
P='/home/claude/salt-harbor.html'; h=open(P).read(); SP='/tmp/claude-0/-home-claude/ff38720c-3120-5f73-a61d-2b206726c719/scratchpad/'
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
MK='\n/* =========================================================================\n   ЗВУК: музыка по настроению'
R(MK,'\n/* UI29 */\n'+open(SP+'ui29.js').read()+MK)
i=h.rindex('</style>'); h=h[:i]+open(SP+'theme29.css').read()+h[i:]
# золото → нейтральный светлый
cnt={}
for a,b in [('#f2b45c','#e4e6eb'),('#F2B45C','#e4e6eb'),('242, 180, 92','228, 230, 235'),('242,180,92','228,230,235'),('#c98a35','#b9bcc4'),('#e9b45c','#cfd2d8'),('#ffd98a','#e8eaee')]:
    cnt[a]=h.count(a); h=h.replace(a,b)
print('gold', cnt)
h=h.replace('&family=Unbounded:wght@500;600;700','')
open(P,'w').write(h); print('v29 ok')
