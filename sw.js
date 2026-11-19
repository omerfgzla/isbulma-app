// Uygulama kabuğunu önbellekler: internet yokken de açılır (veri son kaydedilenden gelir).
const SURUM = "istakip-v2";
const KABUK = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SURUM).then((c) => c.addAll(KABUK)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== SURUM).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // veri isteklerine dokunma
  // Önce ağ (yeni sürüm hemen gelsin), olmazsa önbellek
  e.respondWith(
    fetch(e.request).then((r) => {
      const kopya = r.clone();
      caches.open(SURUM).then((c) => c.put(e.request, kopya));
      return r;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});
