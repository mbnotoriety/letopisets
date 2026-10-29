import asyncio, sys
from playwright.async_api import async_playwright
SP=sys.argv[1]
SCEN = {
 "blocked": """window.__mode='blocked';""",
 "custom": """window.__mode='custom';""",
}
OVERRIDE = """
(() => { const orig = window.claude.use; const IM = window.__IMG0;
  window.__calls = [];
  window.claude = { use: async (n) => {
    if (n !== 'mcp') return orig(n);
    return { callTool: async (server, tool, input) => {
      window.__calls.push(server + '/' + tool);
      if (server === 'Hugging Face' || (server === 'HF Images' && window.__mode !== 'hf')) return { content: [{ type: 'text', text: 'The invoke operation is disabled because gradio=none is set.' }] };
      if (window.__mode === 'blocked') throw { code: 'server_not_connected', message: 'no' };
      if (tool === 'FLUX_1_Krea_dev_infer') throw { code: 'bad_request', message: 'Unknown tool' };
      return { content: [{ type: 'image', data: IM, mimeType: 'image/jpeg' }, { type: 'text', text: 'Seed used for generation: 1' }] };
    } };
  } };
})();
"""
async def run(mode):
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1440,"height":900})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script(path=SP+"/mock.js")
        await pg.add_init_script(script=f"window.__mode='{mode}';" + OVERRIDE.replace("window.__IMG0", "(window.__IMG0 || 'x')"))
        await pg.goto("file:///home/claude/salt-harbor.html"); await pg.wait_for_timeout(400)
        await pg.click("#h-new"); await pg.click(".world-pick:has-text('Солёная Гавань')"); await pg.wait_for_timeout(2500)
        note = await pg.evaluate("imgNote"); calls = await pg.evaluate("window.__calls"); imgs = await pg.evaluate("Object.keys(imgCache).length")
        print(mode, "| note:", note[:70], "| calls:", calls[:5], "| cached:", imgs, "| retry btn:", bool(await pg.query_selector("[data-retry-img]")), "| errs:", errs)
        if mode == "blocked": await pg.screenshot(path=SP+"/v3_blocked.png")
        await b.close()
async def main():
    await run("blocked"); await run("custom")
asyncio.run(main())
