// Offline cache. Bump VERSION whenever index.html changes so phones pick up the new version.
const VERSION = "v3";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
const SHELL_CACHE = "shell-" + VERSION;
const FONT_CACHE = "fonts-v1";

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== SHELL_CACHE && k !== FONT_CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Google Fonts: cache on first online visit, then serve offline.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.open(FONT_CACHE).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // App pages: network first when online (to get updates), cache when offline.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then(r => {
      caches.open(SHELL_CACHE).then(c => c.put("./index.html", r.clone()));
      return r;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
