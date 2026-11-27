/* VPF Manito Manita: service worker. It keeps the small "shell" page and icons so the installed app opens at once.
   The Manito Manita app itself (the Google Apps Script page) always loads live from the internet, so picks are never out of date.
   Change VERSION whenever you replace index.html, the manifest or the icons, so phones pick up the new files. */
const VERSION = 'mm-v1';
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;     // Google's pages are never touched
  if (req.mode === 'navigate') {                                                              // the shell page: newest first, saved copy when offline
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('/index.html', copy)); return r; })
      .catch(() => caches.match('/index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
