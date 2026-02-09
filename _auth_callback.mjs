import { createServer } from 'node:http';
import { writeFileSync } from 'node:fs';

const STATE = process.argv[2];
if (!STATE) { console.error('Usage: node _auth_callback.mjs <state>'); process.exit(1); }

const CALLBACK_HTML = `<!doctype html>
<html lang="en">
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ClawHub CLI Login</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; padding: 24px; }
    .card { max-width: 560px; margin: 40px auto; padding: 18px 16px; border: 1px solid rgba(127,127,127,.35); border-radius: 12px; }
  </style>
  <body>
    <div class="card">
      <h1 style="margin: 0 0 10px; font-size: 18px;">Completing login…</h1>
      <p id="status" style="margin: 0; opacity: .8;">Waiting for token.</p>
    </div>
    <script>
      const statusEl = document.getElementById('status')
      const params = new URLSearchParams(location.hash.replace(/^#/, ''))
      const token = params.get('token')
      const registry = params.get('registry')
      const state = params.get('state')
      if (!token) {
        statusEl.textContent = 'Missing token in URL. You can close this tab and try again.'
      } else if (!state) {
        statusEl.textContent = 'Missing state in URL. You can close this tab and try again.'
      } else {
        fetch('/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, registry, state }),
        }).then(() => {
          statusEl.textContent = 'Logged in! You can close this tab.'
          setTimeout(() => window.close(), 250)
        }).catch(() => {
          statusEl.textContent = 'Failed to send token. Close and try again.'
        })
      }
    </script>
  </body>
</html>`;

const server = createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url?.startsWith('/callback'))) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(CALLBACK_HTML);
    return;
  }
  if (req.method === 'POST' && req.url === '/token') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (body.state !== STATE) { res.writeHead(400); res.end('state mismatch'); return; }
        if (!body.token) { res.writeHead(400); res.end('no token'); return; }
        // Write token to disk so we can read it
        writeFileSync('/home/phan_harry/.openclaw/workspace/_auth_token.json', JSON.stringify({
          token: body.token.trim(),
          registry: body.registry || 'https://clawhub.ai'
        }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        console.log('TOKEN_RECEIVED');
        server.close();
      } catch (e) {
        res.writeHead(400); res.end(e.message);
      }
    });
    return;
  }
  res.writeHead(404); res.end('not found');
});

server.listen(3000, '0.0.0.0', () => {
  console.log('LISTENING on 0.0.0.0:3000');
});
