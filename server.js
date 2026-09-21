const http = require('http');
const fs = require('fs');
const path = require('path');
const port = Number(process.env.PORT || 3000);
const root = __dirname;
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4' };
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/api/health') { response.writeHead(200, { 'Content-Type': 'application/json' }); response.end(JSON.stringify({ ok: true, service: 'aboutme-wd' })); return; }
  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.resolve(root, '.' + requested);
  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) { response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); response.end('Not found'); return; }
  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, { 'Content-Type': mime[extension] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(response);
});
server.listen(port, '0.0.0.0', () => console.log('aboutme-wd running on port ' + port));
