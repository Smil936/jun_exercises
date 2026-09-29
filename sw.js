// 선택 사항: 이 파일을 index.html 옆에 두면 인터넷이 없어도 앱 화면이 열립니다.
// 네트워크 우선, 실패하면 저장된 사본을 씁니다. Apps Script 요청은 건드리지 않습니다.
const CACHE = 'homt30-v1';

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(['./', './index.html']); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(function (r) {
        const copy = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
        return r;
      })
      .catch(function () {
        return caches.match(e.request).then(function (m) { return m || caches.match('./index.html'); });
      })
  );
});
