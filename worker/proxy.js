// Летописец — бесплатный прокси рассказчика и портретов на Cloudflare Workers.
// Без ключей: использует встроенный Workers AI (бесплатно ~10 000 «нейронов» в день).
// Если добавить секреты OPENROUTER_KEY / GROQ_KEY / GEMINI_KEY — они пойдут в ход, когда квота Workers AI кончится.
//   POST /v1/chat/completions — OpenAI-совместимый чат (стриминг SSE)
//   GET  /image?prompt=…&seed=…&w=…&h=… — портрет (FLUX.1 schnell), отдаёт image/jpeg
// В игре: «ИИ и портреты» → «Свой сервер» → https://<имя>.<аккаунт>.workers.dev/v1
const TEXT_MODELS = ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/mistralai/mistral-small-3.1-24b-instruct", "@cf/meta/llama-3.1-8b-instruct-fast"];
const UP = [
  { key: "OPENROUTER_KEY", base: "https://openrouter.ai/api/v1", model: "openrouter/free" },
  { key: "GROQ_KEY", base: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile" },
  { key: "GEMINI_KEY", base: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-flash-latest" }
];
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };
const hits = new Map();
function limited(req, max) { const ip = req.headers.get("cf-connecting-ip") || "?"; const now = Date.now(); const h = (hits.get(ip) || []).filter(t => now - t < 600e3); if (h.length >= max) return true; h.push(now); hits.set(ip, h); return false; }
function sseFromWorkersAI(stream) { // {"response":"…"} → формат OpenAI
  const enc = new TextEncoder(), dec = new TextDecoder(); let buf = "";
  return stream.pipeThrough(new TransformStream({
    transform(chunk, ctl) { buf += dec.decode(chunk, { stream: true }); let i; while ((i = buf.indexOf("\n")) >= 0) { const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!line.startsWith("data:")) continue; const d = line.slice(5).trim(); if (d === "[DONE]") { ctl.enqueue(enc.encode("data: [DONE]\n\n")); continue; } try { const j = JSON.parse(d); const t = j.response ?? j.choices?.[0]?.delta?.content ?? ""; if (t) ctl.enqueue(enc.encode("data: " + JSON.stringify({ choices: [{ delta: { content: t } }] }) + "\n\n")); } catch (e) {} } }
  }));
}
export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname.endsWith("/image")) {
      if (limited(req, 30)) return new Response("rate", { status: 429, headers: CORS });
      if (!env.AI) return new Response("no AI binding", { status: 501, headers: CORS });
      const r = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", { prompt: (url.searchParams.get("prompt") || "portrait").slice(0, 2000), steps: 4, seed: Number(url.searchParams.get("seed")) || undefined }).catch(e => null);
      if (!r?.image) return new Response("image failed", { status: 502, headers: CORS });
      const bin = Uint8Array.from(atob(r.image), c => c.charCodeAt(0));
      return new Response(bin, { headers: { ...CORS, "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400" } });
    }
    if (req.method !== "POST" || !url.pathname.endsWith("/chat/completions")) return new Response("Летописец: прокси рассказчика", { headers: CORS });
    if (limited(req, 60)) return new Response("rate", { status: 429, headers: CORS });
    const body = await req.json(); const stream = !!body.stream;
    if (env.AI) for (const m of TEXT_MODELS) {
      try { const r = await env.AI.run(m, { messages: body.messages, stream, max_tokens: Math.min(body.max_tokens || 1800, 4000), temperature: body.temperature ?? .8 });
        if (stream) return new Response(sseFromWorkersAI(r), { headers: { ...CORS, "Content-Type": "text/event-stream" } });
        return new Response(JSON.stringify({ choices: [{ message: { content: r.response ?? "" } }] }), { headers: { ...CORS, "Content-Type": "application/json" } }); }
      catch (e) { /* квота или модель недоступна — пробуем дальше */ }
    }
    let last = null;
    for (const u of UP) { const k = env[u.key]; if (!k) continue; const b = { ...body, model: u.model }; if (u.key === "OPENROUTER_KEY") delete b.response_format;
      const r = await fetch(u.base + "/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + k }, body: JSON.stringify(b) }).catch(() => null);
      if (r && r.ok) return new Response(r.body, { status: 200, headers: { ...CORS, "Content-Type": r.headers.get("content-type") || "application/json" } }); last = r; }
    return new Response(last ? await last.text() : "no upstream", { status: last?.status || 502, headers: CORS });
  }
};
