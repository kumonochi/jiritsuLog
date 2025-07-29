const CACHE_NAME = 'jiritsulog-v0.11';
const urlsToCache = [
    './index.html?v=0.11',
    './styles.css?v=0.11',
    './app.js?v=0.11',
    './manifest.json',
    './アイコン.png'
];

// Service Worker インストール時
self.addEventListener('install', event => {
    // 即座に新しいService Workerを有効化
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// リソース取得時 - Network First戦略
self.addEventListener('fetch', event => {
    event.respondWith(
        // 最初にネットワークから取得を試行
        fetch(event.request)
            .then(response => {
                // レスポンスが有効な場合
                if (response && response.status === 200 && response.type === 'basic') {
                    // レスポンスをクローンしてキャッシュに保存
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                // ネットワークエラーの場合はキャッシュから取得
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                        // HTMLドキュメントの場合はindex.htmlを返す
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        // その他の場合はエラーを投げる
                        throw new Error('No cache available');
                    });
            })
    );
});

// Service Worker 更新時
self.addEventListener('activate', event => {
    // 即座にクライアントを制御
    self.clients.claim();
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// プッシュ通知受信時（基本実装）
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : '自律訓練の時間です！',
        icon: './アイコン.png',
        badge: './アイコン.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: '記録する',
                icon: './アイコン.png'
            },
            {
                action: 'close',
                title: '閉じる'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('じりつログ', options)
    );
});

// 通知クリック時
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        // アプリを開く
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

// バックグラウンド同期（オフライン時のデータ同期用）
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // ここでオフライン時に蓄積されたデータの同期処理を行う
            console.log('バックグラウンド同期実行')
        );
    }
});