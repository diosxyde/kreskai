const CACHE='kreskai-2026-11-27-1754';
const META='kreskai-meta';
const FILES=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-512-maskable.png','ocr/tesseract.min.js','ocr/worker.min.js','ocr/core/tesseract-core-simd-lstm.wasm.js','ocr/core/tesseract-core-lstm.wasm.js','ocr/lang/fra.js'];
const ALLOWED=new Set(FILES.map(f=>new URL(f,self.registration.scope).href));
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);if(u.origin!==self.location.origin)return;
  const key=u.origin+u.pathname;
  if(r.mode==='navigate'||u.pathname.endsWith('/index.html')){
    e.respondWith(fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(CACHE).then(c=>c.put(new URL('index.html',self.registration.scope).href,cp));}return res;}).catch(()=>caches.match(new URL('index.html',self.registration.scope).href)));return;}
  if(!ALLOWED.has(key))return;
  e.respondWith(caches.match(key).then(h=>h||fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(CACHE).then(c=>c.put(key,cp));}return res;})));
});

self.addEventListener('periodicsync',e=>{if(e.tag!=='kr-upd')return;e.waitUntil((async()=>{try{
  const r=await fetch(new URL('version.json',self.registration.scope).href+'?'+Date.now(),{cache:'no-store'});if(!r.ok)return;const v=String((await r.json()).v||'');if(!v)return;
  const c=await caches.open(META);const k=await c.match('known');const old=k?await k.text():null;await c.put('known',new Response(v));
  if(old&&old!==v)await self.registration.showNotification('Kreskaï mis à jour',{body:'Une nouvelle version est prête : ouvre l’appli.',tag:'kr-upd',icon:'icons/icon-192.png'});}catch(_){}})());});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():self.clients.openWindow('./')));});
