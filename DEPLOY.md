# VTN DESIGN CO. — Deploy (Netlify)

Site público de captação: **orçamento**, **agendamento**, **FAQ** e **avaliações**.
Sem painel administrativo, sem contas de cliente, sem CPF e sem telefone.

## 0. Estrutura final (publique TUDO abaixo)
```
index.html styles.css serve.js
js/{boot.js,i18n.js,pdf.js,app.js,landing.js}
assets/ (logo.svg, favicon.svg, discord.png, download.png, tema-fundo.jpg, portifolio*.png)
netlify.toml .env.example DEPLOY.md README.md .prettierrc .htaccess .gitignore
netlify/functions/{package.json,submit-quote.js,quote-step.js,notify-discord.js,subscribe.js}
backend/ (legado local, opcional no deploy)
```

## 1. Netlify
1. Site settings → Environment variables (ver `.env.example`):
   - `INTERNAL_HOOK_SECRET` — `openssl rand -hex 32` (assina a chamada entre functions);
   - `DISCORD_WEBHOOK_URL` — opcional, notifica o orçamento novo;
   - `RESEND_API_KEY` / `FROM_EMAIL` — opcionais, só para a newsletter.
2. Deploy: `netlify deploy --prod` (ou arraste a pasta no Netlify Drop).
3. Teste: `https://SEU-SITE/.netlify/functions/submit-quote` deve responder 400 em GET.

## 2. Segurança já embutida
| Item | Como está feito |
|------|-----------------|
| CSP | `script-src 'self' https://cdn.jsdelivr.net` — **sem** `unsafe-inline` (não há script inline nem atributo `on*`) |
| CDNs | Versão fixada + `integrity="sha384-..."` (Subresource Integrity) |
| XSS | `esc()` em todo texto; `safeUrl()` bloqueia `javascript:`/`data:`; `safeColor()` só aceita hex |
| Links externos | `rel="noopener noreferrer"` + `referrerpolicy="no-referrer"` |
| Senhas | Nenhuma senha no bundle; nenhuma senha guardada |
| PII | Nenhum CPF/telefone coletado, guardado ou exibido |
| Headers | HSTS, nosniff, DENY, Referrer-Policy, Permissions-Policy, COOP, CORP |
| Funções | Rate-limit por IP, validação no servidor, idempotência por `client_request_id` |
| Dados | Orçamentos no store interno (Netlify Blobs); o Discord só notifica (3s, falha silenciosa) |

## 3. Backups
- Os orçamentos ficam no store `vtn` (Netlify Blobs). Para extrair, use a
  Netlify CLI (`netlify blobs:download`) ou o banco do console.
- Newsletter: a lista de inscritos fica no store `subs`.

## 4. Checklist de testes (pós-deploy)
| # | Cenário | Como testar | Esperado |
|---|---------|-------------|----------|
| 1 | Envio normal | Preencha orçamento → enviar | Modal ⚡ em ≤9s + registro no store |
| 2 | Offline | DevTools → Offline → enviar | Toast "guardado", reenvio automático ao voltar |
| 3 | Duplicidade | Reenviar mesmo `client_request_id` | 1 registro só (idempotência) |
| 4 | Discord fora | Webhook inválido | 200 normal, só log na function |
| 5 | PDF | Modal → Baixar PDF | `orcamento-{proto}-{nome}.pdf`, A4 com cabeçalho, campos em destaque e total destacado |
| 6 | Funil pós-orçamento | Modal: baixe PDF → Discord → Já enviei | `AGUARDANDO ENVIO NO DISCORD` → `AGUARDANDO ATENDIMENTO` |
| 7 | Agendamento | Preencha data/horário → confirmar | Protocolo + PDF do agendamento |
| 8 | Avaliações | "mostrar todas as avaliações..." | Painel branco estilo Google com as 25 avaliações |
| 9 | Nav | Clique em AVALIAÇÕES | Rola até a seção de avaliações |
| 10 | CSP | Console do DevTools | Nenhum aviso de Content-Security-Policy |
