import re
P='/home/claude/salt-harbor.html'; h=open(P).read(); SP='/tmp/claude-0/-home-claude/ff38720c-3120-5f73-a61d-2b206726c719/scratchpad/'
def R(x,y,cnt=1):
    global h
    assert h.count(x)==cnt,(h.count(x),x[:90]); h=h.replace(x,y)
MK='\n/* =========================================================================\n   ЗВУК: музыка по настроению'
R(MK,'\n/* WORLDS */\n'+open(SP+'worlds_data.js').read()+'\n'+open(SP+'worlds.js').read()+MK)
R('/* MOBILE */\n',open(SP+'worlds.css').read()+'/* MOBILE */\n')
# карта: новые биомы
R('    else t = e < .2 ? "W" : m > .38 ? "f" : "g";','''    else if (biome === "desert") t = e < .12 ? "W" : e > .72 ? "r" : m > .78 ? "f" : "g";
    else if (biome === "tundra") t = e > .72 ? "n" : e > .58 ? "r" : e < .16 ? "W" : m > .62 ? "f" : "g";
    else if (biome === "jungle") t = e < .17 ? "W" : e > .82 ? "r" : m > .3 ? "f" : m < .12 ? "m" : "g";
    else if (biome === "islands") { const dc = Math.hypot((x - MAP_W / 2) / (MAP_W / 2), (y - MAP_H / 2) / (MAP_H / 2)); const isl = e * .62 + (1 - dc) * .55 + (m - .5) * .12; t = isl < .46 ? "S" : isl < .51 ? "a" : e > .8 ? "r" : m > .6 ? "f" : "g"; }
    else if (biome === "steppe") t = e < .1 ? "W" : e > .84 ? "r" : m > .8 ? "f" : "g";
    else if (biome === "wasteland") t = e < .1 ? "W" : e > .68 ? "r" : m > .72 ? "m" : m > .6 ? "f" : "g";
    else if (biome === "city") t = e < .13 ? "W" : e > .8 ? "r" : m > .46 ? "f" : "g";
    else if (biome === "alien") t = e < .16 ? "W" : e > .74 ? "r" : m > .55 ? "f" : m < .12 ? "m" : "g";
    else t = e < .2 ? "W" : m > .38 ? "f" : "g";''')
R('  items.sort((a, b) => a.Y - b.Y);\n','  items.sort((a, b) => a.Y - b.Y);\n  { const gm = BIOME_GLYPH[WD.biome]; if (gm) items.forEach(it => { if (gm[it.type]) it.type = gm[it.type]; }); }\n')
R('  for (const it of items) {\n    const { X, Y, s, q } = it;\n','  for (const it of items) {\n    const { X, Y, s, q } = it; if (drawGlyph(g, it, ink)) continue;\n')
R('    } else if (it.type === "house") {\n','    } else if (it.type === "house") { if (drawHouseAlt(g, it, ink)) continue;\n')
R('g.fillStyle = q > .5 ? "#9c4a32" : "#7d5a3a"; g.fill(); g.stroke();','g.fillStyle = roofCol(q); g.fill(); g.stroke();')
# механика особых классов: сравнения с id класса идут по базе
C='fighter|rogue|wizard|cleric|barbarian|paladin|ranger|bard|warlock|druid'
n0=len(re.findall(r'\b([A-Za-z_$][\w$]*(?:\(\))?)\.cls (===|!==) "('+C+')"',h))
h=re.sub(r'\b([A-Za-z_$][\w$]*(?:\(\))?)\.cls (===|!==) "('+C+')"',lambda m:f'bcls({m.group(1)}) {m.group(2)} "{m.group(3)}"',h)
n1=len(re.findall(r'\]\.includes\(c\.cls\)',h)); h=h.replace('].includes(c.cls)','].includes(bcls(c))')
R('EXTRA_ATK.has(c.cls)','EXTRA_ATK.has(bcls(c))'); R('EXTRA_ATK.has(C().cls)','EXTRA_ATK.has(bcls(C()))')
print('cls cmp',n0,'includes',n1)
R('${id === "ranger" ? `<h4>Избранный враг','${bcls({ cls: id }) === "ranger" ? `<h4>Избранный враг')
# деньги сеттинга
n2=len(re.findall(r'(\$\{[^{}]*\}) зм(?![а-яё])',h)); h=re.sub(r'(\$\{[^{}]*\}) зм(?![а-яё])',lambda m:m.group(1)+' ${MZ()}',h)
R('`${s} см`','`${s} ${MS()}`')
n3=len(re.findall(r'(\$\{[^{}]*\}) золотых',h)); h=re.sub(r'(\$\{[^{}]*\}) золотых',lambda m:m.group(1)+' ${MZW()}',h)
print('money',n2,n3)
# мастерская миров
R('left.append(optRow("Окружение", BIOMES, "biome"),','left.append(settingGrid(), optRow("Окружение", BIOMES, "biome"),')
R('placeholder="Например: ведьма на болотах, пропавшие дети, никаких драконов"','placeholder="${D.forge.setting === "custom" ? "Опишите свой мир: эпоха, технологии или магия, кто там живёт, какая атмосфера" : "Например: ведьма на болотах, пропавшие дети, никаких драконов"}"')
R('forge: { biome: "coast", tone: "grim",','forge: { setting: "fantasy", biome: "coast", tone: "grim",')
R('· ${BIOMES[w.biome] || ""}</span><b>${esc(w.name)}</b>','· ${w.setting && w.setting !== "fantasy" && WSET[w.setting] ? WSET[w.setting].n + " · " : ""}${BIOMES[w.biome] || ""}</span><b>${esc(w.name)}</b>')
R('<small>${esc(w.public)}</small>\n','<small>${esc(w.public)}</small>${uniqSummary(w)}\n')
R('const seedLine = `Окружение:','const seedLine = `${settingLine(opts)}Окружение:')
R('str(core.photo_style, 300) || `cinematic photograph, realistic fantasy ${({ coast: "coastal", marsh: "marsh", mountains: "mountain", forest: "forest" })[opts.biome]} village, natural light, 85mm lens, film grain`',
  'str(core.photo_style, 300) || (WSET[opts.setting]?.photo || `cinematic photograph, realistic fantasy ${BIOME_EN[opts.biome] || "rural"} village, natural light, 85mm lens, film grain`)')
R('ГЕРОЙ: ${charBrief()}','${settingBrief()}ГЕРОЙ: ${charBrief()}',3)
# отметки особого
R('b.className = "choice pick-card cls-card";','b.className = "choice pick-card cls-card" + (c.uniq ? " uniq" : "");')
R('<div class="ch-name">${c.name}</div><div class="ch-sub">${esc(c.role)}</div>','<div class="ch-name">${c.name}${c.uniq ? `<em class="u-badge">✦ мир</em>` : ""}</div><div class="ch-sub">${esc(c.role)}${c.uniq ? ` · основа: ${esc(c.baseName || "")}` : ""}</div>')
R('b.className = "choice pick-card";','b.className = "choice pick-card" + (r.uniq ? " uniq" : "");')
R('<div class="ch-name">${r.name}</div><div class="ch-sub">${esc(r.sub)}</div>','<div class="ch-name">${r.name}${r.uniq ? `<em class="u-badge">✦ мир</em>` : ""}</div><div class="ch-sub">${esc(r.sub)}${r.uniq ? ` · основа: ${esc(r.baseName || "")}` : ""}</div>')
R('class="choice bg-row" data-bg="${id}"','class="choice bg-row${b.uniq ? " uniq" : ""}" data-bg="${id}"')
R('`Десять путей. Мир','`${Object.values(CLASSES).some(c => c.uniq) ? `${Object.keys(CLASSES).length} путей, из них ✦ — особые для этого мира.` : "Десять путей."} Мир')
R('${esc(RACES[e.race]?.name || "")} · ${esc(CLASSES[e.cls]?.name || "")}','${esc(e.raceName || RACES[e.race]?.name || "")} · ${esc(e.clsName || CLASSES[e.cls]?.name || "")}')
R('const foeBy = { forest: "wolf", marsh: "giant_rat", mountains: "goblin", coast: "wolf" }[wd.biome] || "wolf"; const FN = { wolf: "Волк", giant_rat: "Гигантская крыса", goblin: "Гоблин", bandit: "Разбойник" };',
  'const foeBy = { forest: "wolf", marsh: "giant_rat", mountains: "goblin", coast: "wolf", desert: "bandit", tundra: "wolf", jungle: "giant_spider", islands: "bandit", steppe: "wolf", wasteland: "giant_rat", city: "bandit", alien: "wolf" }[wd.biome] || "wolf"; const FN = { wolf: foeNm(wd, "wolf", "Волк"), giant_rat: foeNm(wd, "giant_rat", "Гигантская крыса"), goblin: foeNm(wd, "goblin", "Гоблин"), bandit: foeNm(wd, "bandit", "Разбойник"), giant_spider: foeNm(wd, "giant_spider", "Гигантский паук") };')
R('race ${RACES[D.race]?.name}, class','race ${RACES[D.race]?.name}${RACES[D.race]?.look ? ` (${RACES[D.race].look})` : ""}, class')
R('${heroPh({ cls: e.cls, race: e.race, name: e.hero, img: e.img })}','${heroPh({ cls: CLASSES[e.cls] ? e.cls : (e.clsBase || "fighter"), race: RACES[e.race] ? e.race : (e.raceBase || "human"), name: e.hero, img: e.img })}')
R('d.style.setProperty("--cls", CLASSES[e.cls]?.color || "var(--lantern)");','d.style.setProperty("--cls", CLASSES[e.cls]?.color || e.clsColor || "var(--lantern)");')
open(P,'w').write(h); print('worlds ok')
