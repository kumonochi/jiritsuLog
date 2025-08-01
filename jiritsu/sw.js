const CACHE_NAME = 'jiritsulog-v3'; // バージョンアップでキャッシュクリア
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

// リソース取得時（常に最新データを優先）
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // 重要なファイル（HTML, CSS, JS）は常にネットワークから取得
    const criticalFiles = ['index.html', 'app.js', 'styles.css'];
    const isCriticalFile = criticalFiles.some(file => url.pathname.includes(file));
    
    if (isCriticalFile) {
        // クリティカルファイルは強制的にネットワークから取得
        event.respondWith(
            fetch(event.request, {
                cache: 'no-cache',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            }).then(response => {
                if (response && response.status === 200) {
                    // 最新バージョンをキャッシュに保存（オフライン時のフォールバック用）
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            }).catch(() => {
                // ネットワークエラーの場合のみキャッシュを使用
                return caches.match(event.request);
            })
        );
    } else {
        // その他のリソース（画像等）は通常のネットワーク優先戦略
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(event.request).then(response => {
                        if (response) {
                            return response;
                        }
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        return new Response('Network error and no cache available', {
                            status: 404,
                            statusText: 'Not Found'
                        });
                    });
                })
        );
    }
});

// Service Worker 更新時（古いキャッシュを強制削除）
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            // 古いキャッシュをすべて削除
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('古いキャッシュを削除:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // 既存のクライアントを即座に制御下に置く
            self.clients.claim()
        ]).then(() => {
            console.log('Service Worker更新完了 - 新しいバージョン:', CACHE_NAME);
            // 全クライアントにリロードを通知
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_UPDATED',
                        message: 'Service Workerが更新されました。ページをリロードしてください。'
                    });
                });
            });
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