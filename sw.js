// カンミルーペ（漢字よみカメラ）：オフラインでも画面が開くように、アプリ本体だけを保存する
// （写真やAIへの通信は保存しない）
// 新しい版を上げたら、下の名前の数字を1つ上げる（kanji-yomi-v1 → v2）
const CACHE = "kanji-yomi-v2";
const FILES = ["./", "index.html", "privacy.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "maskable-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  // 新しい版を先に取りに行き、つながらない時だけ保存した版を出す
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
