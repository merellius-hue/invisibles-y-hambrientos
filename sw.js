// Guarda en el teléfono lo que ya se abrió, para que funcione sin conexión.
var V = 'iyh-v1';
var BASE = ['./', './index.html', './estilo.css', './img/icono.svg',
  './tetraedro/', './calendario/', './invernaculo/', './trips/', './quiz/', './frenar/', './historia/', './riesgo/', './fuentes/'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(BASE.map(function (u) { return c.add(u).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  function guardar(res) {
    if (res && (res.ok || res.type === 'opaque')) {
      var copia = res.clone();
      caches.open(V).then(function (c) { c.put(e.request, copia); });
    }
    return res;
  }
  // Páginas y estilos: primero la red, para ver siempre la última versión; sin conexión, la guardada.
  if (e.request.mode === 'navigate' || /\.(css|js)$/.test(new URL(e.request.url).pathname)) {
    e.respondWith(fetch(e.request).then(guardar).catch(function () {
      return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('./index.html'); });
    }));
    return;
  }
  // Fotos, estilos y letras: primero lo guardado.
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (r) {
    return r || fetch(e.request).then(guardar);
  }));
});
