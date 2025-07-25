const CACHE_NAME = 'jiritsulog-v1';
const urlsToCache = [
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './アイコン.png'
];

// Service Worker インストール時
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

// リソース取得時
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // キャッシュにある場合はそれを返す
                if (response) {
                    return response;
                }
                
                // キャッシュにない場合はネットワークから取得
                return fetch(event.request)
                    .then(response => {
                        // レスポンスが有効でない場合はそのまま返す
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // レスポンスをクローンしてキャッシュに保存
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // ネットワークエラーの場合、基本的なHTML構造を返す
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// Service Worker 更新時
self.addEventListener('activate', event => {
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