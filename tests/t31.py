import asyncio, sys, json
from playwright.async_api import async_playwright
SP=sys.argv[1]; W=int(sys.argv[2]) if len(sys.argv)>2 else 1300
exec(open(SP+"/t7.py").read().split("async def main")[0].split("SP=sys.argv[1]")[1])
IMG=open(SP+"/fake_portrait.jpg","rb").read()
hits=[]
PUTER = """window.puter = { _signed:false, auth:{ isSignedIn(){ return window.puter._signed; }, async signIn(){ window.puter._signed=true; return {}; } },
  ai:{ async chat(msgs, tm, o){ const s = await window.__fake.use('sample'); const last = msgs[msgs.length-1].content; window.__puterCalls=(window.__puterCalls||0)+1;
     const json = /JSON/.test(msgs[0].content); const text = json ? JSON.stringify(await s.json(last)) : (await s(last)).text;
     if (o && o.stream) { return (async function*(){ for (const ch of text.match(/[\\s\\S]{1,40}/g)) yield {type:'text', text:ch}; })(); } return {message:{content:text}}; },
     async txt2img(p){ window.__puterImg=(window.__puterImg||0)+1; return {src:'data:image/svg+xml;base64,'+btoa('<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"10\\" height=\\"10\\"/>')}; } } };"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":W,"height":880}); pg.set_default_timeout(15000)
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js"); await pg.add_init_script("window.__fake = window.claude; delete window.claude;")
        state={"groq429":False}
        async def chat(route, req, name):
            hits.append(name)
            if name=="groq" and state["groq429"]: return await route.fulfill(status=429, body="rate")
            body=json.loads(req.post_data or "{}"); msgs=body.get("messages",[]); state.setdefault("maxlen",0); state["maxlen"]=max(state["maxlen"], sum(len(m["content"]) for m in msgs)); last=msgs[-1]["content"] if msgs else ""; js = "JSON" in msgs[0]["content"]
            try: text = await pg.evaluate("async ([p,j]) => { const s = await window.__fake.use('sample'); return j ? JSON.stringify(await s.json(p)) : (await s(p)).text; }", [last, js])
            except Exception as e: text = "{}"
            if body.get("stream"):
                chunks="".join("data: "+json.dumps({"choices":[{"delta":{"content":text[i:i+50]}}]})+"\n\n" for i in range(0,len(text),50))+"data: [DONE]\n\n"
                await route.fulfill(status=200, headers={"content-type":"text/event-stream","access-control-allow-origin":"*"}, body=chunks)
            else: await route.fulfill(status=200, headers={"content-type":"application/json","access-control-allow-origin":"*"}, body=json.dumps({"choices":[{"message":{"content":text}}]}))
        await pg.route("https://api.groq.com/**", lambda r, q: chat(r, q, "groq"))
        await pg.route("https://openrouter.ai/**", lambda r, q: chat(r, q, "openrouter"))
        await pg.route("https://gen.pollinations.ai/v1/**", lambda r, q: chat(r, q, "polltext"))
        async def img(route, req): hits.append("img"); await route.fulfill(status=200, headers={"content-type":"image/jpeg","access-control-allow-origin":"*"}, body=IMG)
        await pg.route("https://gen.pollinations.ai/image/**", img); await pg.route("https://image.pollinations.ai/**", img)
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_selector(".ai-modal", timeout=6000); await pg.wait_for_timeout(300)
        print("onboarding shown; pill:", await pg.inner_text("#pill-ai-t"))
        await pg.screenshot(path=SP+f"/p{W}_onboard.png")
        await pg.click("[data-prov=groq]"); await pg.wait_for_selector("[data-key=groq]"); await pg.fill("[data-key=groq]", "gsk_test"); await pg.dispatch_event("[data-key=groq]", "change")
        await pg.click("[data-test=groq]"); await pg.wait_for_selector('[data-test-out="groq"].ok', timeout=10000); print("test:", await pg.inner_text('[data-test-out="groq"]'))
        await pg.screenshot(path=SP+f"/p{W}_groq.png")
        await pg.click("#ai-ok"); await pg.wait_for_timeout(300); print("pill:", await pg.inner_text("#pill-ai-t"))
        await make(pg, "forge", "Плут"); await pg.wait_for_timeout(2500)
        print("world:", await pg.evaluate("S && S.wd && S.wd.name"), "hits", hits.count("groq"))
        await pg.evaluate("C().hp=C().maxHp=80"); await pg.fill("#act-input", "Осматриваю таверну"); await pg.click("#btn-send")
        try: await pg.wait_for_selector("#btn-roll", timeout=6000); await pg.click("#btn-roll")
        except Exception: pass
        await pg.wait_for_function("!busy", timeout=20000); await pg.wait_for_timeout(400)
        print("narr:", await pg.evaluate("S.feed.filter(e=>e.t==='narr').slice(-1)[0]?.text.slice(0,60)"), "hits", hits.count("groq"))
        # fallback to openrouter
        state["groq429"]=True; await pg.evaluate("() => { const c = aiCfg(); c.keys.openrouter='sk-or'; aiSave(c); initSample(); }")
        await pg.fill("#act-input", "Иду к стойке"); await pg.click("#btn-send")
        try: await pg.wait_for_selector("#btn-roll", timeout=6000); await pg.click("#btn-roll")
        except Exception: pass
        await pg.wait_for_function("!busy", timeout=20000); await pg.wait_for_timeout(400)
        print("after 429: openrouter hits", hits.count("openrouter"), "pill", await pg.inner_text("#pill-ai-t"))
        # puter
        await pg.evaluate(PUTER); await pg.evaluate("() => { const c = aiCfg(); c.prov='puter'; aiSave(c); }")
        await pg.click("#pill-ai"); await pg.wait_for_selector("[data-puter-in]"); await pg.click("[data-puter-in]"); await pg.wait_for_timeout(500)
        await pg.click("#ai-ok"); print("puter pill:", await pg.inner_text("#pill-ai-t"))
        await pg.fill("#act-input", "Спрашиваю хозяйку о маяке"); await pg.click("#btn-send")
        try: await pg.wait_for_selector("#btn-roll", timeout=6000); await pg.click("#btn-roll")
        except Exception: pass
        await pg.wait_for_function("!busy", timeout=20000); print("puter calls", await pg.evaluate("window.__puterCalls||0"))
        # portraits via pollinations key
        await pg.evaluate("() => { const c = aiCfg(); c.keys.pollinations='sk_test'; c.img='pollinations'; c.puter=false; aiSave(c); retryPortraits(); }")
        await pg.wait_for_timeout(6000); print("img hits", hits.count("img"), "cache", await pg.evaluate("Object.keys(imgCache).length"), "note", await pg.evaluate("imgNote"))
        # oauth return
        await pg.goto("file:///home/claude/salt-harbor.html#api_key=sk_fromgithub"); await pg.wait_for_timeout(800)
        print("oauth key:", await pg.evaluate("aiCfg().keys.pollinations"), "hash:", await pg.evaluate("location.hash"))
        await pg.click("#pill-ai"); await pg.wait_for_selector(".ai-modal"); await pg.screenshot(path=SP+f"/p{W}_modal2.png", full_page=False)
        print("max prompt chars", state.get("maxlen")); print("ERRS", errs); await b.close()
asyncio.run(main())
