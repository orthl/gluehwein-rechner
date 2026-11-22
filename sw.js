// Offline-Cache: App startet immer sofort aus dem Cache (auch bei schlechtem Netz)
// und holt im Hintergrund Updates, die beim nächsten Start aktiv sind.
const CACHE = "gluehwein-v3";
const FILES = ["./", "index.html", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, {ignoreSearch: true});
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (await c.match("index.html")) || Response.error();
  }));
});
