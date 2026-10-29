// Летописец — бесплатный прокси рассказчика на Cloudflare Workers.
// Ключи хранятся в секретах воркера (не в браузере игроков). Перебирает провайдеров,
// пока один не ответит: Gemini → Groq → Cerebras → OpenRouter (бесплатные тарифы).
// Деплой: wrangler secret put GEMINI_KEY (и другие), затем wrangler deploy.
// В игре: «ИИ и портреты» → «Свой сервер» → адрес https://<имя>.workers.dev/v1
const UP = [
  { key: "GEMINI_KEY", base: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-flash-latest" },
  { key: "GROQ_KEY", base: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile" },
  { key: "CEREBRAS_KEY", base: "https://api.cerebras.ai/v1", model: "llama-3.3-70b" },
  { key: "OPENROUTER_KEY", base: "https://openrouter.ai/api/v1", model: "openrouter/free" }
];
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
const hits = new Map(); // простой лимит: 40 запросов в 10 минут с одного IP
export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(req.url); if (req.method !== "POST" || !url.pathname.endsWith("/chat/completions")) return new Response("Летописец: прокси рассказчика", { headers: CORS });
    const ip = req.headers.get("cf-connecting-ip") || "?"; const now = Date.now(); const h = (hits.get(ip) || []).filter(t => now - t < 600e3); if (h.length >= 40) return new Response("rate", { status: 429, headers: CORS }); h.push(now); hits.set(ip, h);
    const body = await req.json(); let last = null;
    for (const u of UP) { const k = env[u.key]; if (!k) continue; const b = { ...body, model: u.model }; if (u.key === "OPENROUTER_KEY" || u.key === "CEREBRAS_KEY") delete b.response_format;
      const r = await fetch(u.base + "/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + k }, body: JSON.stringify(b) }).catch(() => null);
      if (r && r.ok) return new Response(r.body, { status: 200, headers: { ...CORS, "Content-Type": r.headers.get("content-type") || "application/json" } }); last = r; }
    return new Response(last ? await last.text() : "no upstream", { status: last?.status || 502, headers: CORS });
  }
};
