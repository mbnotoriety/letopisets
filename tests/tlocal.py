import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--enable-unsafe-webgpu","--enable-features=Vulkan"]); pg = await b.new_page(); logs=[]
        pg.on("console", lambda m: logs.append(m.text[:160]))
        await pg.goto("http://localhost:8765/"); await pg.wait_for_timeout(1500)
        print("gpu adapter:", await pg.evaluate("navigator.gpu ? navigator.gpu.requestAdapter().then(a=>!!a) : 'no gpu api'"))
        print("probe wasm:", await pg.evaluate("firstOk(WASM_HOSTS, LOCAL_LIBS['Qwen3-1.7B-q4f16_1-MLC'])"))
        print("probe weights:", await pg.evaluate("firstOk(WEIGHT_HOSTS, 'Qwen3-1.7B-q4f16_1-MLC/resolve/main/mlc-chat-config.json')"))
        print("modelscope direct:", await pg.evaluate("probe('https://modelscope.cn/models/mlc-ai/Qwen3-1.7B-q4f16_1-MLC/resolve/main/mlc-chat-config.json')"))
        r = await pg.evaluate("""() => { const prog=[]; return loadLocal('Qwen3-1.7B-q4f16_1-MLC', p => prog.push(p.text)).then(()=>'LOADED', e => 'ERR '+e.code+': '+e.message).then(x => [x, prog.slice(0,4)]); }""")
        print("load:", r)
        print([l for l in logs if 'error' in l.lower()][:4])
        await b.close()
asyncio.run(main())
