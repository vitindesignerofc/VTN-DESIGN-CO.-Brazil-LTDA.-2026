# VTN DESIGN CO. — Plataforma Premium de Criação de Sites

Identidade: PRETO + AZUL + BRANCO. Inspiração Linear/Vercel/Stripe/Framer/Apple (original, sem cópia).

Site **público** de captação: orçamento, agendamento, FAQ e avaliações.
Sem painel administrativo, sem contas de cliente, sem CPF e sem telefone.

## Estrutura
```
/
├── index.html          # SPA completa (zero dependências)
├── styles.css          # Design system premium
├── js/
│   ├── boot.js         # Rede de segurança da intro (sem script inline)
│   ├── i18n.js         # PT · EN · ES · FR (traduz o DOM já montado)
│   ├── pdf.js          # Geração de PDF (cabeçalho + letras destacadas)
│   ├── app.js          # Router, orçamento, agendamento, modal do funil
│   └── landing.js      # Home: hero, serviços, FAQ, avaliações, convite
├── assets/             # Logo, favicon e fotos dos serviços
├── netlify/functions/  # submit-quote, quote-step, notify-discord, subscribe
├── backend/            # API local (opcional no deploy)
├── serve.js            # Preview local sem dependências (npm run serve)
├── .prettierrc         # Padrão de formatação do código
├── netlify.toml        # Build + CSP + headers de segurança
├── .htaccess           # Equivalente Apache (hospedagem compartilhada)
├── .env.example        # Variáveis de ambiente (modelo)
└── README.md / DEPLOY.md
```

## Rodar AGORA (sem instalar nada)
1. `npm run serve` e abra http://localhost:4173 — ou clique duplo em `index.html`.
2. Funciona offline. Dados salvos em `localStorage` (demo).
3. Preview com cache desativado: toda alteração aparece no reload.
4. O preview aplica a **mesma CSP de produção** — se algo quebrar, quebra no deploy também.

## Padrão de código
- Formatação automática com Prettier: `npm run format` (ou `npm run format:check`).
- Regras em `.prettierrc`: 2 espaços, aspas simples, ponto e vírgula, 110 colunas, LF.
- Um arquivo = uma responsabilidade; blocos commenting por seção (`/* ===== SEÇÃO ===== */`).
- Nada de linha gigante: HTML de template sempre quebrado em linhas curtas.
- Código morto é removido: nada de função sem uso, CSS sem elemento ou script de painel que não existe mais.

## Publicar (cache!)
- Os assets levam **versão**: `styles.css?v=20261022`, `js/app.js?v=20261022`…
  O `.htaccess`/Netlify cacheiam CSS e JS por semanas; sem o `?v=`, quem já
  visitou antes continuaria vendo a versão antiga. **Ao publicar uma mudança,
  troque o número no `index.html`.**
- `?intro=1` na URL toca a intro de novo (para conferir a animação).

## Segurança
- **CSP estrita** (`netlify.toml` / `.htaccess`): sem `unsafe-inline` em scripts.
- **Zero script inline** e zero atributo `on*` — tudo via `addEventListener`.
- **CDN com SRI**: versão fixada + `integrity="sha384-…"`.
- **XSS**: `esc()` em todo texto, `safeUrl()` bloqueia `javascript:`/`data:`, `safeColor()` só aceita hex.
- **Sem segredo no bundle**: nenhuma senha, nenhum token e nenhum CPF no código do cliente.
- **Sem PII coletada**: o pedido de orçamento pede só nome, e-mail, Discord e o projeto.
- Headers: HSTS, nosniff, DENY, Referrer-Policy, Permissions-Policy, COOP, CORP.

## Produção (quando instalar Node)
```powershell
winget install OpenJS.NodeJS.LTS -e
node backend/server.js  # sobe em http://localhost:3001
```
Depois: `npm i fastify @fastify/cookie @fastify/csrf-protection @fastify/rate-limit @prisma/client argon2 zod` e Prisma + Postgres (ver `backend/prisma-schema.prisma`).

## Segurança
- MVP: PBKDF2/scrypt via `crypto` built-in + sessão HttpOnly SameSite=Lax + CSRF token + rate-limit em memória + validação dupla + RBAC (`role=admin` no backend, nunca CPF).
- Produção: trocar por Argon2id + Postgres + Redis rate-limit (ver `backend/package.json`).
- NUNCA commitar `.env`. CPF nunca vai para o frontend.
