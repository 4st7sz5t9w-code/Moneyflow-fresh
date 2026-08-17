const V='moneyflow-safe-v20';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('fetch',e=>{
  if(e.request.mode==='navigate'){
    e.respondWith((async()=>{
      try{
        const r=await fetch(e.request,{cache:'no-store'});
        let h=await r.text();
        if(!h.includes('/addon-v9.js')) h=h.replace('</body>','<script src="/addon-v9.js?v=20"></script><script src="/chat-enhance-v1.js?v=20"></script><script src="/safe-ui-v20.js?v=20"></script></body>');
        else if(!h.includes('/safe-ui-v20.js')) h=h.replace('</body>','<script src="/safe-ui-v20.js?v=20"></script></body>');
        return new Response(h,{status:r.status,statusText:r.statusText,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
      }catch(err){return fetch(e.request)}
    })());
    return;
  }
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));
});