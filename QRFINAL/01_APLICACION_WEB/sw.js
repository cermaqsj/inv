const CACHE_NAME = 'cermaq-bodega-v5.5-ultra';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './products.js',
    './Cermaq_logo2.png',
    './Q.png',
    './manifest.json',
    'https://unpkg.com/html5-qrcode',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap',
    'https://fonts.googleapis.com/icon?family=Material+Icons+Round'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request).catch(() => {
                // Fallback for offline handled by app logic, but assets must be cached
                return caches.match('./index.html');
            });
        })
    );
});
