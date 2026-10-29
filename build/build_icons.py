import re, json
M = {
 "club":"delapouite/wood-club","dagger":"lorc/plain-dagger","greatclub":"delapouite/bone-mace","handaxe":"lorc/wood-axe","javelin":"lorc/spears","lhammer":"lorc/flat-hammer",
 "mace":"delapouite/flanged-mace","staff":"delapouite/crescent-staff","wstaff":"lorc/wizard-staff","sickle":"delapouite/sickle","spear":"delapouite/spear-feather","lcrossbow":"carl-olsen/crossbow",
 "sling":"delapouite/sling","shortbow":"lorc/pocket-bow","longbow":"delapouite/bow-arrow","battleaxe":"lorc/battle-axe","flail":"delapouite/flail","glaive":"delapouite/glaive","greataxe":"delapouite/war-axe",
 "greatsword":"lorc/rune-sword","halberd":"lorc/halberd","longsword":"lorc/broadsword","maul":"delapouite/thor-hammer","morningstar":"lorc/spiked-mace","rapier":"delapouite/two-handed-sword",
 "scimitar":"lorc/machete","shortsword":"lorc/broad-dagger","trident":"lorc/trident","warpick":"delapouite/war-pick","warhammer":"delapouite/warhammer","whip":"lorc/whip","scythe":"lorc/scythe",
 "reaper":"lorc/reaper-scythe","katana":"delapouite/katana","bigaxe":"delapouite/sharp-axe","pike":"delapouite/sharp-halberd","knife":"lorc/bowie-knife","ritual":"lorc/sacrificial-dagger","cleaver":"lorc/meat-cleaver","sabre":"lorc/sparkling-sabre",
 "c_fighter":"delapouite/black-knight-helm","c_rogue":"darkzaitzev/hooded-assassin","c_wizard":"delapouite/wizard-face","c_cleric":"delapouite/sun-priest","c_barbarian":"delapouite/barbarian","c_paladin":"delapouite/templar-shield",
 "c_ranger":"delapouite/archer","c_bard":"lorc/lyre","c_warlock":"delapouite/warlock-eye","c_druid":"cathelineau/holy-oak",
 "r_human":"delapouite/person","r_elf":"delapouite/woman-elf-face","r_halfelf":"delapouite/elf-ear","r_dwarf":"delapouite/dwarf-face","r_halfling":"lorc/footprint","r_gnome":"cathelineau/bad-gnome",
 "r_halforc":"delapouite/orc-head","r_tiefling":"delapouite/devil-mask","r_dragonborn":"delapouite/spiked-dragon-head",
 "i_leather":"delapouite/leather-armor","i_mail":"lorc/armor-vest","i_plate":"delapouite/chest-armor","i_shield":"delapouite/roman-shield","i_potion":"delapouite/health-potion","i_flask":"lorc/standing-potion",
 "i_backpack":"delapouite/backpack","i_bread":"delapouite/bread","i_gem":"delapouite/fire-gem","i_gems":"lorc/gems","i_bed":"delapouite/person-in-bed","i_torch":"delapouite/torch","i_rope":"delapouite/rope-coil",
 "i_lantern":"delapouite/old-lantern","i_holy":"delapouite/holy-water","i_lockpicks":"delapouite/lockpicks","i_scroll":"lorc/scroll-unfurled","i_spyglass":"lorc/spyglass","i_coins":"delapouite/two-coins",
 "i_chest":"delapouite/chest","i_ale":"delapouite/beer-horn","i_ring":"delapouite/ring","i_meat":"lorc/meat","i_cheese":"lorc/cheese-wedge","i_candles":"delapouite/candles","i_incense":"lorc/incense",
 "i_kit":"delapouite/first-aid-kit","i_key":"lorc/skeleton-key","i_fish":"delapouite/fish-smoking"
}
TOK=re.compile(r'([A-Za-z])|(-?(?:\d+\.?\d*|\.\d+)(?:[eE]-?\d+)?)')
def fmt(v):
    s=('%.1f'%round(v,1)).rstrip('0').rstrip('.')
    if s in ('-0',''): s='0'
    if s.startswith('0.'): s=s[1:]
    if s.startswith('-0.'): s='-'+s[2:]
    return s
def compress(d):
    out=''
    for m in TOK.finditer(d):
        if m.group(1): out+=m.group(1); continue
        n=fmt(float(m.group(2)))
        if out and not out[-1].isalpha() and not n.startswith('-'): out+=' '
        out+=n
    return out
exec(open('../icons_extra.py').read()); M.update(X)
out={}
for k,f in M.items():
    s=open(f+'.svg').read()
    ds=[d for d in re.findall(r'<path[^>]*\sd="([^"]+)"',s) if d!='M0 0h512v512H0z']
    out[k]=compress(' '.join(ds))
js='/* Иконки: game-icons.net (CC BY 3.0) — авторы Lorc, Delapouite, Carl Olsen, DarkZaitzev, Cathelineau, Skoll */\nconst ICONS = '+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n'
js+='function ico(k, size = 20, cls = "") { const d = ICONS[k]; if (!d) return ""; return `<svg class="gi ${cls}" viewBox="0 0 512 512" width="${size}" height="${size}" aria-hidden="true"><path fill="currentColor" d="${d}"/></svg>`; }\n'
open('../icons.js','w').write(js); print(len(js))
