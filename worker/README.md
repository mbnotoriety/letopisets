# Свой прокси рассказчика (Cloudflare Workers, бесплатно)

Даёт всем игрокам публичной версии рассказчика и портреты без входа и ключей. Использует встроенный Workers AI (бесплатно около 10 000 «нейронов» в день — это примерно сотня ходов и десятки портретов).

## Без командной строки (5 минут)
1. Зарегистрируйтесь на https://dash.cloudflare.com (бесплатно).
2. Workers & Pages → Create → Hello World → имя `letopisets` → Deploy.
3. Edit code → вставьте содержимое `proxy.js` → Deploy.
4. Settings → Bindings → Add → Workers AI → имя переменной `AI` → Save.
5. Адрес воркера вида `https://letopisets.<аккаунт>.workers.dev` — пришлите его, и я вшью его в игру (константа `DEFAULT_PROXY`), или впишите сами в «ИИ и портреты» → «Свой сервер» с окончанием `/v1`.

## Через wrangler
`npx wrangler deploy` в этой папке (wrangler.toml уже содержит привязку AI).

Необязательно: секреты `OPENROUTER_KEY`, `GROQ_KEY`, `GEMINI_KEY` (`npx wrangler secret put OPENROUTER_KEY`) — подстрахуют, когда дневная квота Workers AI закончится.
