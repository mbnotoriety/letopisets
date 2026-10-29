import sys
from PIL import Image
out=sys.argv[1]; files=sys.argv[2:]
ims=[Image.open(f) for f in files]; ims=[i.crop((0,0,i.width,min(i.height,760))) for i in ims]
W=sum(i.width for i in ims)+8*(len(ims)-1); H=max(i.height for i in ims)
c=Image.new('RGB',(W,H),(255,0,255)); x=0
for i in ims: c.paste(i,(x,0)); x+=i.width+8
c.save(out)
