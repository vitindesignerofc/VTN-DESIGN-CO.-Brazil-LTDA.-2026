/* ============================================================
   VTN — servidor local de preview (sem dependências)
   Uso: npm run serve  →  http://localhost:4173
   Serve os arquivos estáticos do site com cache desativado,
   para conferir as alterações sem instalar nada.
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

/* Espelha a CSP de produção (netlify.toml).
   A diferença: 'upgrade-insecure-requests' fica de fora no preview
   local http:// — no Netlify (https) ela é aplicada normalmente. */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' https://cdn.jsdelivr.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' blob: data:",
  "connect-src 'self' https://cdn.jsdelivr.net https://*.supabase.co wss://*.supabase.co",
  'frame-src https://www.youtube.com https://www.youtube-nocookie.com',
  "manifest-src 'self'",
].join('; ');

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = url === '/' ? 'index.html' : url.replace(/^\/+/, '');
  const file = path.join(ROOT, rel);

  /* bloqueia qualquer tentativa de sair da pasta do projeto */
  if (!file.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403');
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 — não encontrado');
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store, max-age=0',
      /* mesma política de produção (netlify.toml) — assim o preview
         valida a CSP estrita: sem script inline, sem on*= */
      'Content-Security-Policy': CSP,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy':
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('VTN preview: http://localhost:' + PORT);
});
