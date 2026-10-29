const IMG_W = 576, IMG_H = 720, IMG_STEPS = 16;
/* Модели портретов. Pollinations идёт через CPU-генераторы на Hugging Face и не тратит квоту GPU. */
const IMG_MODELS = {
  auto: { name: "Авто", sub: "FLUX Krea, пока есть квота, затем Pollinations без лимита" },
  krea: { name: "FLUX.1 Krea", sub: "Лучшее качество · бесплатная квота GPU Hugging Face, 5–8 портретов в день" },
  zimage: { name: "Z-Image Turbo", sub: "Быстрая модель · та же квота GPU Hugging Face" },
  pollinations: { name: "Pollinations", sub: "Без лимита · качество проще, генерация 5–20 секунд" }
};
const MODEL_KEY = "sh5-img-model", KREA_COOLDOWN_KEY = "sh5-krea-cooldown";
function imgModel() { const m = lsGet(MODEL_KEY); return IMG_MODELS[m] ? m : "auto"; }
function setImgModel(m) { if (IMG_MODELS[m]) { lsSet(MODEL_KEY, m); portraitPaused = false; imgNote = ""; clearTimeout(retryTimer); runPortraitJobs(); } }
const dyn = (space, tool, params) => ({ operation: "invoke", space_name: space, tool_name: tool, parameters: JSON.stringify(params) });
const ROUTE_SETS = {
  krea: [
    { server: "HF Images", tools: ["gr1_flux_1_krea_dev_infer", "gr2_flux_1_krea_dev_infer", "gr3_flux_1_krea_dev_infer"], input: (prompt, seed) => ({ prompt, seed, randomize_seed: false, width: IMG_W, height: IMG_H, guidance_scale: 4.5, num_inference_steps: IMG_STEPS }) },
    { server: "HF Images", tools: ["dynamic_space"], input: (prompt, seed) => dyn(HF.space, HF.spaceTool, { prompt, seed, randomize_seed: false, width: IMG_W, height: IMG_H, guidance_scale: 4.5, num_inference_steps: IMG_STEPS }) },
    { server: "FLUX Krea", tools: ["FLUX_1_Krea_dev_infer", "infer"], input: (prompt, seed) => ({ prompt, seed, randomize_seed: false, width: IMG_W, height: IMG_H, guidance_scale: 4.5, num_inference_steps: IMG_STEPS }) },
    { server: HF.server, tools: [HF.tool], input: (prompt, seed) => dyn(HF.space, HF.spaceTool, { prompt, seed, randomize_seed: false, width: IMG_W, height: IMG_H, guidance_scale: 4.5, num_inference_steps: IMG_STEPS }) }
  ],
  zimage: [
    { server: "HF Images", tools: ["gr1_z_image_turbo_generate", "gr2_z_image_turbo_generate", "gr3_z_image_turbo_generate"], input: (prompt, seed) => ({ prompt, seed, random_seed: false, resolution: "864x1152 ( 3:4 )", steps: 8 }) },
    { server: "HF Images", tools: ["dynamic_space"], input: (prompt, seed) => dyn("mcp-tools/Z-Image-Turbo", "Z_Image_Turbo_generate", { prompt, seed, random_seed: false, resolution: "864x1152 ( 3:4 )", steps: 8 }) }
  ],
  pollinations: [
    { server: "HF Images", tools: ["dynamic_space"], wm: true, input: (prompt, seed) => dyn("mbovy/pollinations-mcp", "pollinations_mcp_generate_image", { prompt, seed, width: IMG_W, height: IMG_H + 48, model: "flux" }) },
    { server: "HF Images", tools: ["dynamic_space"], wm: true, input: (prompt, seed) => dyn("cedpsam/pollinations_images", "pollinations_images_infer", { prompt, seed, randomize_seed: false, width: IMG_W, height: IMG_H + 48, nologo: true, private: true, nofeed: true }) },
    { server: HF.server, tools: [HF.tool], wm: true, input: (prompt, seed) => dyn("mbovy/pollinations-mcp", "pollinations_mcp_generate_image", { prompt, seed, width: IMG_W, height: IMG_H + 48, model: "flux" }) }
  ]
};
function parseImage(r) {
  const blocks = Array.isArray(r?.content) ? r.content : [];
  for (const b of blocks) {
    if (b.type === "image" && b.data) return { blob: b64ToBlob(b.data, b.mimeType) };
    if (b.type === "resource" && b.resource?.blob && /^image\//.test(b.resource.mimeType || "image/")) return { blob: b64ToBlob(b.resource.blob, b.resource.mimeType) };
  }
  const text = blocks.filter(b => b.type === "text").map(b => b.text).join("\n") + (typeof r?.payload === "string" ? r.payload : "");
  if (/gradio\s*=\s*none|invoke operation is disabled/i.test(text)) throw { code: "spaces_off" };
  if (/quota|exceeded your gpu|zerogpu/i.test(text)) throw { code: "quota" };
  if (/limite de debit|rate limit|429/i.test(text)) throw { code: "busy" };
  const dm = text.match(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/); if (dm) return { blob: b64ToBlob(dm[0], dm[0].slice(5, dm[0].indexOf(";"))) };
  const um = text.match(/https?:\/\/[^\s)"'\]<>]+?\.(?:png|jpe?g|webp)(?:\?[^\s)"'\]<>]*)?/i) || text.match(/https?:\/\/[^\s)"'\]<>]+\/file=[^\s)"'\]<>]+/i);
  if (um) return { url: um[0] };
  throw { code: "no_image" };
}
function canLoad(url) { return new Promise(res => { const i = new Image(); const t = setTimeout(() => res(false), 9000); i.onload = () => { clearTimeout(t); res(true); }; i.onerror = () => { clearTimeout(t); res(false); }; i.src = url; }); }
async function tryRoutes(mcp, routes, prompt, seed, key) {
  const saved = lsGet(ROUTE_KEY) || {}; const pref = saved[key]; let worst = { code: "no_route" };
  const order = pref != null && routes[pref] ? [routes[pref], ...routes.filter((_, i) => i !== pref)] : routes;
  for (const route of order) {
    for (const tool of route.tools) {
      let r;
      try { r = await mcp.callTool(route.server, tool, route.input(prompt, seed), { cache: false }); }
      catch (e) {
        const msg = String(e?.message || "");
        if (e?.code === "server_not_connected" || e?.code === "not_in_manifest" || e?.code === "selection_required") break;
        if (/gradio\s*=\s*none|invoke operation is disabled/i.test(msg)) { if (worst.code === "no_route") worst = { code: "spaces_off" }; break; }
        if (/quota|zerogpu/i.test(msg)) throw { code: "quota" };
        if (/limite de debit|rate limit|429|too many/i.test(msg)) { worst = { code: "busy" }; break; }
        if (/unknown tool|not found|no such tool|tool .* not/i.test(msg) || e?.code === "bad_request") continue;
        if (["needs_reauth", "not_granted", "blocked_by_policy", "consent_required"].includes(e?.code)) { worst = { code: "denied", server: route.server }; break; }
        worst = { code: "img_failed" }; break;
      }
      let out;
      try { out = parseImage(r); } catch (e) { if (e.code === "quota") throw e; if (e.code === "spaces_off" && worst.code !== "no_route") break; worst = e; break; }
      if (out.url && !(await canLoad(out.url))) { worst = { code: "url_only" }; break; }
      saved[key] = routes.indexOf(route); lsSet(ROUTE_KEY, saved); out.wm = !!route.wm;
      return out;
    }
  }
  throw worst;
}
async function hfImage(prompt, seed) {
  const mcp = await getMcp(); if (!mcp) throw { code: "no_mcp" };
  prompt = prompt.slice(0, 600); const m = imgModel();
  if (m === "pollinations") return pollinate(mcp, prompt, seed);
  if (m === "krea" || m === "zimage") return tryRoutes(mcp, ROUTE_SETS[m], prompt, seed, m);
  // авто: лучшая модель, пока у неё есть квота; иначе — без лимита
  const cool = Number(lsGet(KREA_COOLDOWN_KEY) || 0);
  if (Date.now() > cool) {
    try { return await tryRoutes(mcp, ROUTE_SETS.krea, prompt, seed, "krea"); }
    catch (e) { if (e.code === "quota") lsSet(KREA_COOLDOWN_KEY, Date.now() + 60 * 60 * 1000); else if (!["no_route", "spaces_off", "img_failed", "no_image", "url_only"].includes(e.code)) throw e; }
  }
  return pollinate(mcp, prompt, seed);
}
let lastPollen = 0;
async function pollinate(mcp, prompt, seed) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const wait = lastPollen + 4000 - Date.now(); if (wait > 0) await pause(wait);
    try { const out = await tryRoutes(mcp, ROUTE_SETS.pollinations, prompt, seed, "pollinations"); lastPollen = Date.now(); return out; }
    catch (e) { lastPollen = Date.now(); if (e.code !== "busy" && e.code !== "img_failed") throw e; await pause(12000 * (attempt + 1)); }
  }
  throw { code: "busy" };
}
/* убрать водяной знак Pollinations: срезать нижнюю полоску */
async function cropWatermark(blob) {
  try { const bmp = await createImageBitmap(blob); const cut = Math.round(bmp.height * 48 / (IMG_H + 48)); const c = document.createElement("canvas"); c.width = bmp.width; c.height = bmp.height - cut;
    c.getContext("2d").drawImage(bmp, 0, 0); return await new Promise(r => c.toBlob(b => r(b || blob), "image/jpeg", .9)); } catch (e) { return blob; }
}
