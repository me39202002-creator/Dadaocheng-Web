const CACHE_NAME = 'dadaocheng-cache-v1';

// 這裡放入你希望離線時也能載入的靜態檔案清單
// 注意路徑要符合 GitHub Pages 的結構
const urlsToCache = [
  '/Dadaocheng-Web/',
  '/Dadaocheng-Web/index.html',
  '/Dadaocheng-Web/history.html',
  '/Dadaocheng-Web/apps.html',
  '/Dadaocheng-Web/emergency.html',
  '/Dadaocheng-Web/info.html',
  '/Dadaocheng-Web/images/Dadaocheng-Web.webp'
  // 如果有獨立的 CSS 或 JS 檔案，也要加進來，例如：
  // '/Dadaocheng-Web/css/style.css',
  // '/Dadaocheng-Web/js/main.js'
];

// 安裝 Service Worker 並快取檔案
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // 針對店家資料庫 (data.json) 使用「網路優先，斷線才用快取」
  if (event.request.url.includes('data.json')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 網路正常時：抓取最新資料，並更新到快取中
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // 網路斷線時：拿快取裡的舊資料出來應急
          return caches.match(event.request);
        })
    );
  } else {
    // 其他靜態檔案 (HTML, 圖片) 維持原本的「快取優先」
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});

// 更新 Service Worker 時，清除舊版快取
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});