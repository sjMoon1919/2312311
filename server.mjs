import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const allowed=new Set(['community.html','community.js','community.css','firebase-config.js','index.html','app.js','style.css','favicon.svg','background.png','documents/2026-budget-complete.pdf','documents/2026-planning-project-guide.pdf']);
const types={'.pdf':'application/pdf','.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname.slice(1))||'index.html';if(!allowed.has(name)){res.writeHead(404);res.end('Not found');return}const content=await readFile(path.join(root,name));res.writeHead(200,{'Content-Type':types[path.extname(name)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.firebaseio.com https://*.firebasedatabase.app"});res.end(content)}catch{res.writeHead(500);res.end('Server error')}});
server.on('error',err=>{console.error('실행 실패:',err.message);process.exitCode=1});
server.listen(4173,'127.0.0.1',()=>console.log('해운대구 예산서재: http://127.0.0.1:4173 · 종료: Ctrl+C'));


