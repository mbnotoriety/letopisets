import os,subprocess,json,re
exec(open('vox_spec.py').read())
OUT='vox_out'; os.makedirs(OUT,exist_ok=True)
for f in os.listdir(OUT): os.remove(os.path.join(OUT,f))
man={}; cnt={}; info=[]
for g,e,sid,a,b in SPEC:
    src=sid if isinstance(sid,str) else f'vox_raw/{sid}.mp3'
    if not (os.path.exists(src) and os.path.getsize(src)>2000): continue
    k=cnt.get((g,e),0)+1; cnt[(g,e)]=k; name=f'v-{g}-{e}-{k}'; dst=f'{OUT}/{name}.mp3'
    cut=(['-ss',str(a),'-to',str(b)] if a is not None else [])
    mx = 2.4 if e=='sigh' else 2.0
    th='-55dB' if e=='sigh' else '-42dB'
    flt=f"highpass=f=70,silenceremove=start_periods=1:start_threshold={th}:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold={th}:start_silence=0.05,areverse,atrim=0:{mx},afade=t=in:d=0.01"
    tmp=f'{OUT}/_t.wav'; subprocess.run(['ffmpeg','-v','error','-y',*cut,'-i',src,'-ac','1','-ar','24000','-af',flt,tmp],check=True)
    d=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',tmp],capture_output=True,text=True).stdout or 0)
    if d<0.15: os.remove(tmp); cnt[(g,e)]=k-1; continue
    vd=subprocess.run(['ffmpeg','-v','info','-i',tmp,'-af','volumedetect','-f','null','-'],capture_output=True,text=True).stderr
    mxv=float(re.search(r'max_volume: (-?[\d.]+) dB',vd).group(1)); mean=float(re.search(r'mean_volume: (-?[\d.]+) dB',vd).group(1))
    gain=min(-2.0-mxv, -19.0-mean)  # пик не выше −2 дБ, средняя громкость около −19 дБ
    subprocess.run(['ffmpeg','-v','error','-y','-i',tmp,'-af',f'volume={gain:.1f}dB,afade=t=out:st={max(0,d-0.08):.2f}:d=0.08','-c:a','libmp3lame','-b:a','56k',dst],check=True); os.remove(tmp)
    man.setdefault(g,{}).setdefault(e,[]).append(name); info.append((name,sid,round(d,2),round(gain,1),os.path.getsize(dst)))
json.dump(man,open('vox_manifest.json','w'),ensure_ascii=False)
for x in info: print(*x)
print({g:{e:len(v) for e,v in d.items()} for g,d in man.items()}); print('total KB', sum(x[4] for x in info)//1024)
