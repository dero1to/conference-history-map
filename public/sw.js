// 最小限のService Worker
// 404エラーを回避するための基本実装

const CACHE_NAME = 'conference-map-v1';

// インストール時
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // すぐにアクティベート
  self.skipWaiting();
});

// アクティベート時
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // 即座にクライアントを制御
  event.waitUntil(
    clients.claim()
  );
});

// フェッチイベント（現在はパススルー）
self.addEventListener('fetch', (event) => {
  // 現在は何もしない（将来のキャッシュ機能のために準備）
  event.respondWith(fetch(event.request));
});