import json,re,subprocess,urllib.parse,os,sys
from concurrent.futures import ThreadPoolExecutor
S=json.load(open('sel.json')); man={}; jobs={}
def slug(t): return 'k-'+re.sub(r'[^a-z0-9]+','-',t.lower()).strip('-')
for st,m in S.items():
  for mood,ts in m.items():
    for t,fn,sec in ts:
      s=slug(t); man.setdefault(st,{}).setdefault(mood,[]).append(s); jobs[s]=(t,fn,sec)
json.dump({'man':man,'titles':{s:v[0] for s,v in jobs.items()}},open('music_manifest.json','w'),ensure_ascii=False,indent=1)
def work(item):
  s,(t,fn,sec)=item; raw='raw/'+s+'.mp3'; out='out/'+s+'.mp4'
  if os.path.exists(out) and os.path.getsize(out)>50000: return
  if not os.path.exists(raw) or os.path.getsize(raw)<100000: subprocess.run(['curl','-s','-m','180','-o',raw,'https://incompetech.com/music/royalty-free/mp3-royaltyfree/'+urllib.parse.quote(fn)])
  dur=min(sec,140); fade=6 if sec>140 else 0
  af='afade=t=in:st=0:d=1.5'+(f',afade=t=out:st={dur-fade}:d={fade}' if fade else '')+',loudnorm=I=-18:TP=-2:LRA=11'
  subprocess.run(['ffmpeg','-y','-loglevel','error','-i',raw,'-vn','-t',str(dur),'-af',af,'-c:a','aac','-b:a','64k','-ac','2','-ar','44100','-movflags','+faststart',out+'.tmp.mp4'])
  os.replace(out+'.tmp.mp4',out); print('ok',s,flush=True)
with ThreadPoolExecutor(6) as ex: list(ex.map(work, jobs.items()))
print('DONE', len(os.listdir('out')))
