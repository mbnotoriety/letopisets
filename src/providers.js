/* =========================================================================
   ИИ-ПРОВАЙДЕРЫ: рассказчик и портреты для любого способа открыть игру
   Claude (claude.ai) → Puter → Pollinations → свой ключ → ИИ в браузере → без ИИ
   ========================================================================= */
const AI_KEY = "sh-ai";
const IS_ARTIFACT = /claudeusercontent\.com$|\.claude\.ai$|^claude\.ai$/.test(location.hostname);
const PUBLIC_URL = "https://mbnotoriety.github.io/letopisets/";
/* адрес своего прокси (worker/proxy.js на Cloudflare): если задан, гости получают рассказчика и портреты без настройки */
const DEFAULT_PROXY = "";
const NARR_PROV = {
  claude: { n: "Claude", sub: "Лучшее качество. Работает, когда игра открыта в claude.ai и у вас есть аккаунт Claude.", where: "artifact" },
  puter: { n: "Puter — Claude, GPT, Gemini", sub: "Бесплатно для вас: вход в бесплатный аккаунт Puter (можно без регистрации — временный). Сильные модели.", where: "public", login: true },
  pollinations: { n: "Pollinations", sub: "Вход через GitHub (бесплатная ежедневная «пыльца») или свой ключ sk_…", where: "public", base: "https://gen.pollinations.ai/v1", model: "openai/gpt-5.4-nano", key: true, keyUrl: "https://enter.pollinations.ai", login: true, json: true },
  gemini: { n: "Google Gemini — свой ключ", sub: "Бесплатный ключ в Google AI Studio, отлично пишет по-русски. Из России не работает: Google не пускает ни на сайт, ни в API.", where: "public", base: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-flash-latest", key: true, keyUrl: "https://aistudio.google.com/apikey", json: true },
  groq: { n: "Groq — свой ключ", sub: "Бесплатный ключ, очень быстрый, но небольшой лимит в минуту. Из России может не пустить при регистрации.", where: "public", base: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile", key: true, keyUrl: "https://console.groq.com/keys", json: true },
  openrouter: { n: "OpenRouter — свой ключ", sub: "Работает из России. Вход через Google, GitHub или почту, ключ бесплатный: около 50 ходов в день на бесплатных моделях. «openrouter/free» сам выберет свободную.", where: "public", base: "https://openrouter.ai/api/v1", model: "openrouter/free", key: true, keyUrl: "https://openrouter.ai/keys", json: false },
  custom: { n: "Свой сервер", sub: DEFAULT_PROXY ? "Сервер автора игры — работает без входа и ключей." : "Любой OpenAI-совместимый адрес: свой прокси на Cloudflare (worker/proxy.js), Ollama, LM Studio.", where: "public", base: "", model: "", key: true, url: true, json: false },
  local: { n: "ИИ прямо в браузере", sub: "Работает из любой страны, без регистрации и ключей: модель скачивается один раз (2–5 ГБ) и работает на вашей видеокарте. Пишет проще облачных моделей.", where: "public" },
  anon: { n: "Pollinations без входа", sub: "Совсем без регистрации, но сервис часто перегружен — запасной вариант.", where: "public", base: "https://text.pollinations.ai/openai", model: "openai", json: false }
};
const AUTO_ORDER = ["claude", "puter", "custom", "openrouter", "pollinations", "gemini", "groq", "local", "anon"];
const IMG_PROV = {
  auto: { n: "Авто", sub: "Лучший доступный генератор" },
  claude: { n: "Подключения Claude (Hugging Face)", sub: "FLUX через ваши коннекторы claude.ai", where: "artifact" },
  proxy: { n: "Свой сервер", sub: "FLUX через свой прокси на Cloudflare (Workers AI)", where: "public" },
  puter: { n: "Puter", sub: "FLUX schnell через бесплатный аккаунт Puter", where: "public" },
  pollinations: { n: "Pollinations", sub: "Без входа — 1 портрет в 45 секунд; со входом или ключом — быстрее и лучше", where: "public" },
  hf: { n: "Hugging Face — свой токен", sub: "FLUX.1 schnell, бесплатные ежемесячные кредиты", where: "public" },
  off: { n: "Рисованные портреты", sub: "Без генерации фото" }
};
const LOCAL_MODELS = { "Qwen3-4B-q4f16_1-MLC": "Qwen3 4B · ~3 ГБ — лучший выбор для большинства видеокарт", "Qwen3-8B-q4f16_1-MLC": "Qwen3 8B · ~5 ГБ — пишет лучше, нужна видеокарта с 6+ ГБ", "Qwen2.5-3B-Instruct-q4f16_1-MLC": "Qwen 2.5 3B · ~2 ГБ — для слабых видеокарт", "Qwen3-1.7B-q4f16_1-MLC": "Qwen3 1.7B · ~1,3 ГБ — для ноутбуков и телефонов" };
function aiCfg() { const d = lsGet(AI_KEY) || {}; return { prov: NARR_PROV[d.prov] || d.prov === "auto" || d.prov === "offline" ? d.prov || "auto" : "auto", img: IMG_PROV[d.img] ? d.img : "auto", keys: d.keys || {}, models: d.models || {}, url: d.url || DEFAULT_PROXY, puter: !!d.puter, local: d.local || "", seen: !!d.seen }; }
function aiSave(c) { lsSet(AI_KEY, c); }
function aiErr(code, message, extra) { return Object.assign({ code, message: message || code }, extra || {}); }
/* ---------- разбор JSON из ответа слабых моделей ---------- */
function parseJSONLoose(t) {
  let s = String(t || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  try { return JSON.parse(s); } catch (e) {}
  const i = s.search(/[\[{]/); if (i < 0) throw aiErr("bad_json"); const open = s[i], close = open === "{" ? "}" : "]"; let depth = 0, inStr = false, esc2 = false, end = -1;
  for (let k = i; k < s.length; k++) { const ch = s[k]; if (inStr) { if (esc2) esc2 = false; else if (ch === "\\") esc2 = true; else if (ch === '"') inStr = false; continue; } if (ch === '"') inStr = true; else if (ch === open) depth++; else if (ch === close) { depth--; if (!depth) { end = k; break; } } }
  let body = end > 0 ? s.slice(i, end + 1) : s.slice(i);
  const tries = [body, body.replace(/,\s*([}\]])/g, "$1"), body.replace(/,\s*([}\]])/g, "$1").replace(/[“”]/g, '"')];
  for (const x of tries) { try { return JSON.parse(x); } catch (e) {} }
  throw aiErr("bad_json");
}
function toMsgs(input, json) {
  const msgs = Array.isArray(input) ? input.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content ?? "") })) : [{ role: "user", content: String(input ?? "") }];
  msgs.unshift({ role: "system", content: json ? "Ты помогаешь вести настольную ролевую игру. Отвечай ТОЛЬКО валидным JSON без пояснений, без markdown и без ```." : "Ты — мастер настольной ролевой игры D&D 5e. Пиши по-русски, живо и образно, строго следуя формату, который задан в запросе." });
  return msgs;
}
function httpErr(status, body) { const t = String(body || "").slice(0, 300); if (/location is not supported|unsupported_country|not available in your (country|region)|region.*not supported/i.test(t)) return aiErr("region", "сервис не работает из вашей страны — выберите OpenRouter или ИИ в браузере"); if (status === 401 || status === 403) return aiErr("auth", "ключ не подошёл или нет доступа"); if (status === 402) return aiErr("rate_limited", "закончился бесплатный лимит"); if (status === 429 || status === 503) return aiErr("rate_limited", "сервис перегружен или исчерпан лимит"); if (status === 413 || /context|too long|maximum.*token/i.test(t)) return aiErr("too_long", "запрос слишком длинный для этой модели"); return aiErr("http_" + status, t || "ошибка " + status); }
/* ---------- OpenAI-совместимые сервисы ---------- */
async function oaCall(id, input, opts, json) {
  const P = NARR_PROV[id]; const cfg = aiCfg(); const key = id === "anon" ? "" : (cfg.keys[id] || ""); const base = (id === "custom" ? cfg.url : P.base).replace(/\/+$/, ""); const model = cfg.models[id] || P.model || "";
  if (!base) throw aiErr("no_url"); if (P.key && id !== "custom" && !key) throw aiErr("no_key");
  const url = id === "anon" ? base : base + "/chat/completions"; const stream = !!opts?.onText && !json;
  const body = { messages: toMsgs(input, json), temperature: json ? .5 : .85, max_tokens: json ? 6000 : 2200, stream }; if (model) body.model = model; if (json && P.json) body.response_format = { type: "json_object" };
  let r; try { r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...(key ? { Authorization: "Bearer " + key } : {}), ...(id === "openrouter" ? { "X-Title": "Letopisets" } : {}) }, body: JSON.stringify(body), signal: opts?.signal }); }
  catch (e) { if (e?.name === "AbortError") throw aiErr("cancelled", "", { text: "" }); throw aiErr("network", "нет связи с сервисом"); }
  if (!r.ok) throw httpErr(r.status, await r.text().catch(() => ""));
  if (!stream || !r.body || !(r.headers.get("content-type") || "").includes("event-stream")) { const raw = await r.text(); let text = raw; try { const j = JSON.parse(raw); text = j.choices?.[0]?.message?.content ?? j.choices?.[0]?.text ?? j.content ?? raw; } catch (e) {} if (Array.isArray(text)) text = text.map(x => x.text || "").join(""); text = String(text || ""); if (opts?.onText && text) opts.onText({ text, delta: text }); return { text, truncated: false }; }
  const rd = r.body.getReader(); const dec = new TextDecoder(); let buf = "", full = "";
  try { for (;;) { const { value, done } = await rd.read(); if (done) break; buf += dec.decode(value, { stream: true }); let nl; while ((nl = buf.indexOf("\n")) >= 0) { const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1); if (!line.startsWith("data:")) continue; const d = line.slice(5).trim(); if (d === "[DONE]") continue; try { const j = JSON.parse(d); const delta = j.choices?.[0]?.delta?.content || ""; if (delta) { full += delta; opts.onText({ text: full, delta }); } } catch (e) {} } } }
  catch (e) { if (e?.name === "AbortError") throw aiErr("cancelled", "", { text: full }); if (!full) throw aiErr("network"); }
  return { text: full, truncated: false };
}
/* ---------- Puter ---------- */
let puterP = null;
function loadPuter() { if (window.puter?.ai) return Promise.resolve(window.puter); if (!puterP) puterP = new Promise((res, rej) => { const s = document.createElement("script"); s.src = "https://js.puter.com/v2/"; const t = setTimeout(() => { puterP = null; rej(aiErr("load", "Puter не загрузился")); }, 20000); s.onload = () => { clearTimeout(t); window.puter ? res(window.puter) : rej(aiErr("load")); }; s.onerror = () => { clearTimeout(t); puterP = null; rej(aiErr("load", "Puter не загрузился")); }; document.head.append(s); }); return puterP; }
async function puterSigned() { try { const p = window.puter; if (!p?.auth) return false; const v = p.auth.isSignedIn(); return !!(v && typeof v.then === "function" ? await v : v); } catch (e) { return false; } }
async function puterSignIn(temp) { const p = await loadPuter(); await p.auth.signIn(temp ? { attempt_temp_user_creation: true } : {}); const c = aiCfg(); c.puter = true; aiSave(c); return true; }
async function puterCall(input, opts, json) {
  const p = await loadPuter(); if (!(await puterSigned())) throw aiErr("no_login", "нужен вход в Puter"); const model = aiCfg().models.puter || undefined; const msgs = toMsgs(input, json);
  const o = { stream: !!opts?.onText && !json, temperature: json ? .5 : .85, max_tokens: json ? 6000 : 2200, ...(model ? { model } : {}), ...(opts?.signal ? { signal: opts.signal } : {}) };
  let full = "";
  try { const resp = await p.ai.chat(msgs, false, o);
    if (o.stream && resp && typeof resp[Symbol.asyncIterator] === "function") { for await (const part of resp) { if (part?.type === "error") throw aiErr("provider", part.message); const d = part?.text || ""; if (d) { full += d; opts.onText({ text: full, delta: d }); } } }
    else { const c = resp?.message?.content; full = Array.isArray(c) ? c.map(x => x.text || "").join("") : String(c ?? resp ?? ""); if (opts?.onText && full) opts.onText({ text: full, delta: full }); } }
  catch (e) { if (e?.name === "AbortError") throw aiErr("cancelled", "", { text: full }); if (e?.code && typeof e.code === "string" && !/^\d/.test(e.code)) { if (/insufficient|funds|limit/i.test(e.code + (e.message || ""))) throw aiErr("rate_limited", "закончился бесплатный лимит Puter"); throw e.code === "cancelled" ? e : aiErr("provider", e.message || e.code); } throw aiErr("provider", e?.message || String(e)); }
  return { text: full, truncated: false };
}
/* ---------- ИИ в браузере (WebLLM) ---------- */
let webEngine = null, webLoading = null;
const HAS_WEBGPU = typeof navigator !== "undefined" && !!navigator.gpu;
const LOCAL_LIBS = { "Qwen3-4B-q4f16_1-MLC": "Qwen3-4B-q4f16_1-ctx4k_cs1k-webgpu.wasm", "Qwen3-8B-q4f16_1-MLC": "Qwen3-8B-q4f16_1-ctx4k_cs1k-webgpu.wasm", "Qwen2.5-3B-Instruct-q4f16_1-MLC": "Qwen2.5-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm", "Qwen3-1.7B-q4f16_1-MLC": "Qwen3-1.7B-q4f16_1-ctx4k_cs1k-webgpu.wasm" };
const LOCAL_VRAM = { "Qwen3-4B-q4f16_1-MLC": 3432, "Qwen3-8B-q4f16_1-MLC": 5696, "Qwen2.5-3B-Instruct-q4f16_1-MLC": 2505, "Qwen3-1.7B-q4f16_1-MLC": 2037 };
const WEBLLM_LIB = ["https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.79/+esm", "https://esm.sh/@mlc-ai/web-llm@0.2.79"];
const WASM_HOSTS = ["https://cdn.jsdelivr.net/gh/mlc-ai/binary-mlc-llm-libs@main/web-llm-models/v0_2_48/", "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_48/"];
const WEIGHT_HOSTS = ["https://huggingface.co/mlc-ai/", "https://modelscope.cn/models/mlc-ai/"];
async function probe(url, ms) { const ac = new AbortController(); const t = setTimeout(() => ac.abort(), ms || 9000); try { const r = await fetch(url, { method: "GET", headers: { Range: "bytes=0-63" }, signal: ac.signal, cache: "no-store" }); return r.ok || r.status === 206; } catch (e) { return false; } finally { clearTimeout(t); } }
async function firstOk(cands, path) { for (const c of cands) if (await probe(c + path)) return c; return null; }
async function loadLocal(model, onProg) {
  if (!HAS_WEBGPU) throw aiErr("no_webgpu", "браузер не поддерживает WebGPU"); if (webEngine && webEngine.__model === model) return webEngine;
  if (!webLoading) webLoading = (async () => {
    onProg?.({ progress: 0, text: "Проверяю, откуда можно скачать…" });
    let lib = null, libErr = null; for (const u of WEBLLM_LIB) { try { lib = await import(u); break; } catch (e) { libErr = e; } }
    if (!lib) throw aiErr("lib", "не удалось скачать библиотеку ИИ (jsDelivr и esm.sh недоступны)");
    const wasmFile = LOCAL_LIBS[model]; const wasmHost = await firstOk(WASM_HOSTS, wasmFile); if (!wasmHost) throw aiErr("wasm", "не удалось скачать движок модели — ни jsDelivr, ни GitHub не отвечают");
    const hosts = []; for (const h of WEIGHT_HOSTS) if (await probe(h + model + "/resolve/main/mlc-chat-config.json") && await probe(h + model + "/resolve/main/params_shard_0.bin", 15000)) hosts.push(h);
    if (!hosts.length) throw aiErr("weights", "веса модели недоступны ни с Hugging Face, ни с ModelScope");
    let lastErr = null;
    for (const wHost of hosts) {
      onProg?.({ progress: 0, text: `Качаю с ${new URL(wHost).hostname}…` });
      const appConfig = { model_list: [{ model: wHost + model, model_id: model, model_lib: wasmHost + wasmFile, vram_required_MB: LOCAL_VRAM[model], low_resource_required: true, overrides: { context_window_size: 8192 } }] };
      try { const e = await lib.CreateMLCEngine(model, { appConfig, initProgressCallback: p => onProg?.(p) }); e.__model = model; webEngine = e; return e; }
      catch (er) { const m = String(er?.message || er);
        if (/quota/i.test(m)) throw aiErr("space", "браузеру не хватает места для модели — освободите место на диске, закройте режим инкогнито или выберите модель поменьше");
        if (/memory|OOM|allocate|device lost|adapter/i.test(m)) throw aiErr("vram", "видеокарта не справилась (мало видеопамяти или нет WebGPU) — выберите модель поменьше");
        lastErr = /fetch|network|load|abort/i.test(m) ? aiErr("download", `загрузка с ${new URL(wHost).hostname} прервалась`) : aiErr("local", m.slice(0, 160)); }
    }
    throw lastErr || aiErr("download", "загрузка прервалась — попробуйте ещё раз, скачанное сохранится"); })().finally(() => { webLoading = null; });
  return webLoading;
}
function stripThink(t) { return String(t || "").replace(/<think>[\s\S]*?(<\/think>|$)/g, "").trimStart(); }
async function localCall(input, opts, json) {
  const cfg = aiCfg(); if (!cfg.local) throw aiErr("no_model", "модель не скачана"); const e = await loadLocal(cfg.local); const stream = !!opts?.onText && !json; let full = "";
  const q3 = /qwen3/i.test(cfg.local); const msgs = toMsgs(input, json); if (q3) msgs[0].content += " /no_think"; const req = { messages: msgs, temperature: json ? .4 : .8, max_tokens: json ? 2500 : 900, stream, ...(q3 ? { extra_body: { enable_thinking: false } } : {}), ...(json && !q3 ? { response_format: { type: "json_object" } } : {}) };
  if (stream) { const it = await e.chat.completions.create(req); for await (const ch of it) { if (opts?.signal?.aborted) { try { e.interruptGenerate(); } catch (x) {} throw aiErr("cancelled", "", { text: full }); } const d = ch.choices?.[0]?.delta?.content || ""; if (d) { full += d; const shown = stripThink(full); if (shown) opts.onText({ text: shown, delta: d }); } } }
  else { const r = await e.chat.completions.create(req); full = r.choices?.[0]?.message?.content || ""; }
  return { text: stripThink(full), truncated: false };
}
/* ---------- доступность и цепочка ---------- */
let claudeOrig = null, claudeDead = false, lastProv = null; const provCool = {};
function provReady(id, cfg) {
  cfg = cfg || aiCfg(); const P = NARR_PROV[id]; if (!P) return false;
  if (id === "claude") return !claudeDead && !!window.claude?.use;
  if (IS_ARTIFACT) return false;
  if (id === "puter") return cfg.puter; if (id === "local") return !!cfg.local && HAS_WEBGPU; if (id === "anon") return true;
  if (id === "custom") return !!cfg.url; return !!cfg.keys[id];
}
function provState(id) { const cfg = aiCfg(); const P = NARR_PROV[id]; if (id === "claude") return window.claude?.use && !claudeDead ? ["готов", "ok"] : ["нет доступа", "off"]; if (IS_ARTIFACT) return ["в публичной версии", "off"];
  if (id === "local" && !HAS_WEBGPU) return ["нет WebGPU", "off"]; if (provReady(id, cfg)) return ["готов", "ok"]; if (id === "puter") return ["нужен вход", "need"]; if (id === "local") return ["нужна загрузка", "need"]; if (id === "custom") return ["нужен адрес", "need"]; if (id === "pollinations") return ["вход или ключ", "need"]; return P.key ? ["нужен ключ", "need"] : ["готов", "ok"]; }
async function claudeSample() { if (claudeDead || !window.claude?.use) return null; if (!claudeOrig) claudeOrig = window.claude.use("sample").catch(() => null); const s = await claudeOrig; if (!s) claudeDead = true; return s; }
async function callProv(id, input, opts, json) {
  if (id === "claude") { const s = await claudeSample(); if (!s) throw aiErr("not_granted"); try { return json ? { value: await s.json(input, opts) } : await s(input, opts); } catch (e) { if (["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"].includes(e?.code)) claudeDead = true; throw e; } }
  const run = id === "puter" ? puterCall : id === "local" ? localCall : (a, b, c) => oaCall(id, a, b, c);
  if (!json) return run(input, opts, false);
  const r = await run(input, opts, true); try { return { value: parseJSONLoose(r.text) }; } catch (e) {
    const again = await run([...(Array.isArray(input) ? input : [{ role: "user", content: String(input) }]), { role: "assistant", content: r.text.slice(0, 4000) }, { role: "user", content: "Это не валидный JSON. Повтори ответ строго одним JSON-объектом, без текста вокруг." }], opts, true);
    return { value: parseJSONLoose(again.text) }; }
}
function provChain() { const cfg = aiCfg(); if (cfg.prov === "offline") return []; const want = cfg.prov === "auto" ? AUTO_ORDER : [cfg.prov, ...AUTO_ORDER.filter(x => x !== cfg.prov)]; return want.filter(id => provReady(id, cfg)); }
function cleanAIText(t) { return String(t || "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/?(em|i|b|strong|u|span|p|div|q)(\s[^>]*)?>/gi, "").replace(/\*\*([^*\n]+)\*\*/g, "$1"); }
async function chainRun(input, opts, json) {
  const list = provChain(); let last = aiErr("no_ai");
  for (const id of list) { if ((provCool[id] || 0) > Date.now()) continue;
    try { const o2 = id !== "claude" && !json && opts?.onText ? { ...opts, onText: x => opts.onText({ text: cleanAIText(x.text), delta: x.delta }) } : opts; const r = await callProv(id, input, o2, json); if (id !== "claude" && !json && r) r.text = cleanAIText(r.text); if (lastProv !== id) { lastProv = id; setAIPill(true); } return r; }
    catch (e) { if (e?.code === "cancelled" || e?.name === "AbortError") throw e.code ? e : aiErr("cancelled", "", { text: "" }); last = e; provCool[id] = Date.now() + (e?.code === "auth" || e?.code === "no_key" || e?.code === "no_login" || e?.code === "region" ? 10 * 60e3 : e?.code === "too_long" ? 5 * 60e3 : 45e3); console.warn("ИИ-провайдер", id, e); } }
  throw last;
}
function makeSampleFn() { const f = (input, opts) => chainRun(input, opts, false); f.json = async (input, opts) => (await chainRun(input, opts, true)).value; f.limits = async () => ({ images: false }); f.__chain = true; return f; }
const SAMPLE_FN = makeSampleFn();
getSample = function () { if (aiOff) return Promise.resolve(null); return Promise.resolve(provChain().length ? SAMPLE_FN : null); };
{ const _af = aiFail; aiFail = function (e) { const wasOff = aiOff; const msg = _af.apply(this, arguments); if (aiOff && !wasOff) { claudeDead = true; if (provChain().length) { aiOff = false; setAIPill(true); return "Claude недоступен в этом просмотре — переключаюсь на другого рассказчика."; } } if (e?.code === "auth") return "Ключ ИИ не подошёл. Проверьте его в «ИИ и портреты». Этот ход рассказан офлайн."; if (e?.code === "too_long") return "Запрос оказался слишком длинным для выбранной модели. Этот ход рассказан офлайн — лучше выбрать Gemini или Puter."; return msg; }; }
function curProvName() { const id = lastProv && provReady(lastProv) ? lastProv : provChain()[0]; if (!id) return null; return { claude: "Claude", puter: "Puter", pollinations: "Pollinations", gemini: "Gemini", groq: "Groq", openrouter: "OpenRouter", custom: "свой сервер", local: "в браузере", anon: "Pollinations (без входа)" }[id]; }
setAIPill = function (on) { const p = document.getElementById("pill-ai"); if (!p) return; const ch = provChain(); const onlyAnon = ch.length === 1 && ch[0] === "anon" && lastProv !== "anon"; const nm = on && !onlyAnon ? curProvName() : null; on = on && !!nm; if (onlyAnon) { p.classList.remove("on", "off"); const t0 = document.getElementById("pill-ai-t"); if (t0) t0.textContent = "Рассказчик: выбрать ИИ"; p.title = "Сейчас работает только запасной Pollinations без входа — он часто перегружен. Нажмите, чтобы выбрать рассказчика"; return; } p.classList.toggle("on", on); p.classList.toggle("off", !on); const t = document.getElementById("pill-ai-t"); if (t) t.textContent = on ? `Рассказчик: ${nm}` : "Рассказчик: офлайн"; p.title = on ? `ИИ-рассказчик: ${nm}. Нажмите, чтобы сменить` : "ИИ не подключён. Нажмите, чтобы выбрать рассказчика"; };
/* ---------- портреты ---------- */
let lastAnonImg = 0;
async function blobFromUrl(u) { const r = await fetch(u); if (!r.ok) throw httpErr(r.status, ""); return r.blob(); }
async function pollImage(prompt, seed) {
  const key = aiCfg().keys.pollinations; const enc = encodeURIComponent(prompt.slice(0, 900));
  for (let a = 0; a < 3; a++) {
    if (!key) { const wait = lastAnonImg + 46000 - Date.now(); if (wait > 0) await pause(wait); }
    const url = key ? `https://gen.pollinations.ai/image/${enc}?model=${encodeURIComponent(aiCfg().models.pollImg || "flux")}&width=${IMG_W}&height=${IMG_H}&seed=${seed}&nologo=true` : `https://image.pollinations.ai/prompt/${enc}?width=${IMG_W}&height=${IMG_H + 48}&seed=${seed}&nologo=true`;
    let r; try { r = await fetch(url, key ? { headers: { Authorization: "Bearer " + key } } : {}); } catch (e) { throw aiErr("img_failed"); } if (!key) lastAnonImg = Date.now();
    if (r.ok && /^image\//.test(r.headers.get("content-type") || "")) return { blob: await r.blob(), wm: !key };
    if (r.status === 402 || r.status === 429 || r.status === 503) { const ra = Number(r.headers.get("retry-after")) || 0; await pause(Math.max(ra * 1000, key ? 4000 : 46000)); continue; }
    if (r.status === 401 || r.status === 403) throw aiErr("img_auth"); throw aiErr("img_failed");
  }
  throw aiErr("busy");
}
async function puterImage(prompt) { const p = await loadPuter(); if (!(await puterSigned())) throw aiErr("no_img_prov"); let img; try { img = await p.ai.txt2img(prompt.slice(0, 900), { model: aiCfg().models.puterImg || "@cf/black-forest-labs/flux-1-schnell", width: IMG_W, height: IMG_H }); } catch (e) { throw aiErr(/funds|limit/i.test(e?.code || e?.message || "") ? "quota" : "img_failed"); } const src = img?.src || String(img || ""); if (!src) throw aiErr("no_image"); try { return { blob: await blobFromUrl(src) }; } catch (e) { return { url: src }; } }
async function proxyImage(prompt, seed) { const base = aiCfg().url.replace(/\/+$/, "").replace(/\/v1$/, ""); if (!base) throw aiErr("no_img_prov"); const r = await fetch(`${base}/image?${new URLSearchParams({ prompt: prompt.slice(0, 900), seed: String(seed), w: String(IMG_W), h: String(IMG_H) })}`).catch(() => null); if (!r) throw aiErr("img_failed"); if (r.status === 429) throw aiErr("busy"); if (!r.ok || !/^image\//.test(r.headers.get("content-type") || "")) throw aiErr("img_failed"); return { blob: await r.blob() }; }
async function hfTokenImage(prompt, seed) { const tok = aiCfg().keys.hf; if (!tok) throw aiErr("no_img_prov"); const r = await fetch("https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell", { method: "POST", headers: { Authorization: "Bearer " + tok, "Content-Type": "application/json" }, body: JSON.stringify({ inputs: prompt.slice(0, 900), parameters: { width: IMG_W, height: IMG_H, num_inference_steps: 4, seed } }) }).catch(() => null); if (!r) throw aiErr("img_failed"); if (r.status === 402 || r.status === 429) throw aiErr("quota"); if (!r.ok) throw aiErr(r.status === 401 ? "img_auth" : "img_failed"); return { blob: await r.blob() }; }
function imgChain() { const cfg = aiCfg(); if (cfg.img === "off") return []; const ok = { claude: !!window.claude?.use, proxy: !IS_ARTIFACT && !!cfg.url, puter: !IS_ARTIFACT && cfg.puter, pollinations: !IS_ARTIFACT, hf: !IS_ARTIFACT && !!cfg.keys.hf };
  const ALL = ["claude", "proxy", "puter", "hf", "pollinations"]; const order = cfg.img === "auto" ? ALL : [cfg.img, ...ALL.filter(x => x !== cfg.img)]; return order.filter(x => ok[x]); }
{ const _hf = hfImage; hfImage = async function (prompt, seed) { if (IS_ARTIFACT && aiCfg().img !== "off") return _hf.call(this, prompt, seed); const list = imgChain(); if (!list.length) throw aiErr(aiCfg().img === "off" ? "img_off" : "no_img_prov"); let last = null;
  for (const id of list) { try { if (id === "claude") { const mcp = await getMcp(); if (!mcp) continue; return await _hf.call(this, prompt, seed); } if (id === "proxy") return await proxyImage(prompt, seed); if (id === "puter") return await puterImage(prompt); if (id === "hf") return await hfTokenImage(prompt, seed); if (id === "pollinations") return await pollImage(prompt, seed); }
    catch (e) { last = e; if (list.length === 1) throw e; } } throw last || aiErr("no_img_prov"); }; }
Object.assign(IMG_NOTES, { no_img_prov: "Генератор портретов не выбран. Откройте «ИИ и портреты» (кнопка «Рассказчик» вверху) и включите Pollinations или Puter.", img_off: "Генерация фото выключена — показаны рисованные портреты.", img_auth: "Ключ генератора портретов не подошёл. Проверьте его в «ИИ и портреты»." });
/* ---------- вход в Pollinations: ключ возвращается в адресе страницы ---------- */
function pollLogin() { const back = location.href.split("#")[0]; location.href = `https://enter.pollinations.ai/authorize?${new URLSearchParams({ redirect_uri: back, scope: "usage", models: "text,image" })}`; }
function aiToast(msg) { const t = document.createElement("div"); t.className = "tip-toast"; t.setAttribute("role", "status"); t.innerHTML = `<b>ИИ</b><p>${esc(msg)}</p>`; document.body.append(t); requestAnimationFrame(() => t.classList.add("in")); setTimeout(() => t.remove(), 4500); }
function pollReturn() { try { const h = new URLSearchParams(location.hash.slice(1)); const k = h.get("api_key"); if (k && /^sk_/.test(k)) { const c = aiCfg(); c.keys.pollinations = k; if (c.prov === "auto" || !provReady(c.prov, c)) c.prov = "auto"; c.seen = true; aiSave(c); history.replaceState(null, "", location.href.split("#")[0]); lastProv = null; setTimeout(() => { try { aiToast("Pollinations подключён — рассказчик и портреты работают через ваш аккаунт."); initSample(); retryPortraits(); } catch (e) {} }, 500); } } catch (e) {} }
pollReturn(); window.addEventListener("hashchange", pollReturn);
/* ---------- окно «ИИ и портреты» ---------- */
function aiTestLine(id) { return `<span class="ai-test" data-test-out="${id}"></span>`; }
function openAISettings(first) {
  const cfg = aiCfg(); const sel = cfg.prov; const chain = provChain();
  const card = (id, P) => { const [st, sc] = provState(id); const on = sel === id; const dis = sc === "off";
    const extra = !on ? "" : id === "puter" ? `<div class="ai-x"><button class="btn small primary" type="button" data-puter-in>${cfg.puter ? "Войти заново" : "Войти или создать аккаунт"}</button><button class="btn small" type="button" data-puter-in="temp">Временный аккаунт</button><span class="home-note ai-hint">Если окно пишет «account could not be created» — Puter не пустил временный аккаунт (часто так бывает из России или через VPN). Создайте обычный бесплатный аккаунт на <a href="https://puter.com" target="_blank" rel="noopener">puter.com</a> и войдите им.</span><label>Модель (необязательно)<input data-model="puter" value="${esc(cfg.models.puter || "")}" placeholder="по умолчанию — выберет Puter" list="puter-models"></label><datalist id="puter-models"><option value="claude-sonnet-4-5"><option value="gpt-5-mini"><option value="gemini-2.5-flash"><option value="deepseek-chat"></datalist><button class="btn small" type="button" data-test="puter">Проверить</button>${aiTestLine("puter")}</div>`
      : id === "local" ? `<div class="ai-x"><label>Модель<select data-local>${Object.entries(LOCAL_MODELS).map(([k, v]) => `<option value="${k}" ${cfg.local === k ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label><button class="btn small primary" type="button" data-local-dl ${HAS_WEBGPU ? "" : "disabled"}>${cfg.local ? "Загрузить заново" : "Скачать и включить"}</button><span class="ai-test" id="local-prog"></span></div>`
      : P.key || P.url ? `<div class="ai-x">${id === "pollinations" ? `<button class="btn small primary" type="button" data-poll-in>Войти через GitHub</button><span class="home-note ai-hint">Если вход не проходит («couldn’t sign you in») — это сбой на стороне Pollinations. Можно создать ключ вручную на <a href="https://enter.pollinations.ai/keys" target="_blank" rel="noopener">enter.pollinations.ai</a> и вставить его сюда.</span>` : ""}${P.url ? `<label>Адрес (до /chat/completions)<input data-url value="${esc(cfg.url)}" placeholder="https://my-proxy.workers.dev/v1"></label>` : ""}<label>Ключ${P.keyUrl ? ` · <a href="${P.keyUrl}" target="_blank" rel="noopener">получить бесплатно</a>` : ""}<input type="password" data-key="${id}" value="${esc(cfg.keys[id] || "")}" placeholder="${id === "pollinations" ? "sk_…" : id === "custom" ? "если нужен" : "вставьте ключ"}" autocomplete="off"></label><label>Модель<input data-model="${id}" value="${esc(cfg.models[id] || "")}" placeholder="${esc(P.model || "")}"></label><button class="btn small" type="button" data-test="${id}">Проверить</button>${aiTestLine(id)}</div>`
      : id === "anon" ? `<div class="ai-x"><button class="btn small" type="button" data-test="anon">Проверить</button>${aiTestLine("anon")}</div>` : "";
    return `<div class="ai-card${on ? " on" : ""}${dis ? " dis" : ""}"><button type="button" class="ai-pick" data-prov="${id}" aria-pressed="${on}" ${dis && id !== "claude" ? "disabled" : ""}><span class="ai-n">${esc(P.n)}${id === "puter" ? ` <em class="ai-best">Лучший</em>` : ""}</span><span class="ai-st ${sc}">${st}</span><small>${esc(P.sub)}</small></button>${extra}</div>`; };
  const imgCard = (id, P) => { const on = cfg.img === id; const dis = (P.where === "public" && IS_ARTIFACT) || (P.where === "artifact" && !window.claude?.use);
    return `<button type="button" class="ai-chip${on ? " on" : ""}" data-img="${id}" aria-pressed="${on}" ${dis ? "disabled" : ""} title="${esc(P.sub)}">${esc(P.n)}</button>`; };
  const html = `<div class="ai-set"><div class="eyebrow">ИИ и портреты</div><h2>Кто ведёт историю</h2>
    ${first ? `<p class="ai-lead">Без ИИ игра идёт на коротких шаблонных ответах. Выберите рассказчика — все варианты бесплатны. Лучший выбор — <b>Puter</b>: быстрый и пишет почти как Claude, нужен только вход в бесплатный аккаунт. Запасной — <b>OpenRouter</b> (бесплатный ключ за пару минут). Gemini из России недоступен.</p>` : ""}
    ${IS_ARTIFACT ? `<p class="ai-lead">Игра открыта внутри claude.ai: здесь доступен только Claude. Остальные рассказчики работают в публичной версии игры${PUBLIC_URL ? ` — <a href="${PUBLIC_URL}" target="_blank" rel="noopener">открыть её</a>` : ""}.</p>` : ""}
    <div class="ai-card${sel === "auto" ? " on" : ""}"><button type="button" class="ai-pick" data-prov="auto" aria-pressed="${sel === "auto"}"><span class="ai-n">Авто</span><span class="ai-st ${chain.length && !(chain.length === 1 && chain[0] === "anon") ? "ok" : "need"}">${chain.length === 1 && chain[0] === "anon" ? "только запасной вариант" : chain.length ? "сейчас: " + esc(curProvName() || "—") : "нет доступных"}</span><small>Лучший доступный по порядку: ${AUTO_ORDER.map(x => ({ claude: "Claude", puter: "Puter", pollinations: "Pollinations", gemini: "Gemini", groq: "Groq", openrouter: "OpenRouter", custom: "свой сервер", local: "в браузере", anon: "без входа" })[x]).join(" → ")}. Если один недоступен или упёрся в лимит — берётся следующий.</small></button></div>
    ${["claude", "puter", "openrouter", "pollinations", "custom", "local", "gemini", "groq", "anon"].map(id => card(id, NARR_PROV[id])).join("")}
    <div class="ai-card${sel === "offline" ? " on" : ""}"><button type="button" class="ai-pick" data-prov="offline" aria-pressed="${sel === "offline"}"><span class="ai-n">Без ИИ</span><span class="ai-st ok">всегда</span><small>Простой шаблонный рассказчик: правила работают, но повествования почти нет.</small></button></div>
    <h3 class="ai-h3">Портреты</h3><div class="ai-chips">${Object.entries(IMG_PROV).map(([id, P]) => imgCard(id, P)).join("")}</div><small class="home-note" id="ai-img-sub">${esc(IMG_PROV[cfg.img].sub)}${cfg.img === "auto" ? ` · сейчас: ${esc(imgChain().map(x => IMG_PROV[x].n).join(" → ") || "рисованные")}` : ""}</small>
    ${cfg.img === "hf" ? `<label class="ai-l">Токен Hugging Face · <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener">получить</a><input type="password" data-key="hf" value="${esc(cfg.keys.hf || "")}" placeholder="hf_…" autocomplete="off"></label>` : ""}
    <p class="home-note ai-priv">Ключи хранятся только в этом браузере и уходят напрямую выбранному сервису.</p>
    <div class="row"><button class="btn" type="button" id="ai-redraw">Перерисовать портреты</button><button class="btn primary" type="button" id="ai-ok">Готово</button></div></div>`;
  modal(html, root => { root.querySelector(".modal").classList.add("ai-modal"); const c2 = () => aiCfg(); const re = () => { const y = root.querySelector(".modal").scrollTop; openAISettings(first); const m = document.querySelector(".ai-modal"); if (m) m.scrollTop = y; };
    root.querySelectorAll("[data-prov]").forEach(b => b.onclick = () => { const c = c2(); c.prov = b.dataset.prov; c.seen = true; aiSave(c); aiOff = false; lastProv = null; claudeDead = b.dataset.prov === "claude" ? false : claudeDead; Object.keys(provCool).forEach(k => delete provCool[k]); initSample(); re(); });
    root.querySelectorAll("[data-img]").forEach(b => b.onclick = () => { const c = c2(); c.img = b.dataset.img; aiSave(c); retryPortraits(); re(); });
    root.querySelectorAll("[data-key]").forEach(i => i.onchange = () => { const c = c2(); c.keys[i.dataset.key] = i.value.trim(); aiSave(c); delete provCool[i.dataset.key]; initSample(); if (i.dataset.key === "hf") retryPortraits(); });
    root.querySelectorAll("[data-model]").forEach(i => i.onchange = () => { const c = c2(); c.models[i.dataset.model] = i.value.trim(); aiSave(c); });
    root.querySelector("[data-url]")?.addEventListener("change", e => { const c = c2(); c.url = e.target.value.trim(); aiSave(c); initSample(); });
    root.querySelector("[data-poll-in]")?.addEventListener("click", () => { const c = c2(); c.prov = "pollinations"; c.seen = true; aiSave(c); try { save(); } catch (e) {} pollLogin(); });
    root.querySelectorAll("[data-puter-in]").forEach(btn => btn.addEventListener("click", async e => { const b = e.currentTarget; const temp = b.dataset.puterIn === "temp"; const was = b.textContent; b.disabled = true; b.textContent = "Открываю вход…"; try { await puterSignIn(temp); delete provCool.puter; lastProv = null; initSample(); retryPortraits(); re(); } catch (er) { b.disabled = false; b.textContent = was; const o = root.querySelector('[data-test-out="puter"]'); if (o) o.textContent = er?.code === "popup_blocked" ? "Браузер заблокировал окно входа — разрешите всплывающие окна." : "Не удалось войти: " + (er?.message || er?.code || "окно закрыто"); } }));
    root.querySelector("[data-local]")?.addEventListener("change", e => { root.querySelector("[data-local-dl]").dataset.model = e.target.value; });
    root.querySelector("[data-local-dl]")?.addEventListener("click", async e => { const b = e.target; const model = root.querySelector("[data-local]").value; const out = root.querySelector("#local-prog"); b.disabled = true;
      try { await loadLocal(model, p => { out.textContent = `${Math.round((p.progress || 0) * 100)}% · ${p.text || ""}`.slice(0, 90); }); const c = c2(); c.local = model; if (c.prov === "auto" || c.prov === "offline") c.prov = "local"; aiSave(c); out.textContent = "Готово — модель работает в браузере."; initSample(); } catch (er) { out.textContent = "Не вышло: " + (er?.message || er?.code || "ошибка"); b.disabled = false; } });
    root.querySelectorAll("[data-test]").forEach(b => b.onclick = async () => { const id = b.dataset.test; const out = root.querySelector(`[data-test-out="${id}"]`); out.className = "ai-test"; out.textContent = "Спрашиваю…"; const t0 = performance.now();
      try { const r = await callProv(id, "Одним предложением по-русски: что видит путник, входя в портовую таверну?", {}, false); out.textContent = `✓ ${Math.round((performance.now() - t0) / 100) / 10} с: «${str(r.text, 120)}»`; out.classList.add("ok"); delete provCool[id]; }
      catch (er) { out.textContent = "✗ " + (er?.message || er?.code || "ошибка"); out.classList.add("bad"); } });
    root.querySelector("#ai-redraw").onclick = e => { if (S?.wd) redrawWorldPortraits(S.wd); else retryPortraits(); e.target.textContent = "Портреты в очереди"; e.target.disabled = true; };
    root.querySelector("#ai-ok").onclick = () => { const c = c2(); c.seen = true; aiSave(c); closeModal(); initSample(); };
  });
}
/* первое открытие публичной версии без рассказчика — предложить выбор */
setTimeout(() => { try { const c = aiCfg(); if (!IS_ARTIFACT && !c.seen && !window.claude?.use && !document.getElementById("modal-root").innerHTML.trim()) openAISettings(true); } catch (e) {} }, 1400);
document.addEventListener("click", e => { if (e.target.closest?.("#pill-ai")) openAISettings(); });
