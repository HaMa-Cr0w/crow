const CACHE = "cr0w-v2";
const ASSETS = ["/","/index.html","/post.html","/404.html","/css/styles.css","/js/app.js","/js/post.js","/data/posts.json","/assets/crow-logo.svg","/manifest.webmanifest"];
self.addEventListener("install",(e)=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",(e)=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",(e)=>{
  const req=e.request;
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
    const url=new URL(req.url);
    if(url.pathname.startsWith("/media/")) caches.open(CACHE).then(c=>c.put(req,res.clone())).catch(()=>{});
    return res;
  }).catch(()=>caches.match("/404.html"))));
});
