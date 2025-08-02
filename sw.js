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

// リソース取得時（ネットワーク優先でキャッシュ問題を解決）
self.addEventListener('fetch', event => {
    // データ同期に関連するAPIリクエストはキャッシュしない
    if (event.request.url.includes('googleapis.com') || 
        event.request.url.includes('accounts.google.com') ||
        event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        // まずネットワークから取得を試行（常に最新を取得）
        fetch(event.request)
            .then(response => {
                // レスポンスが有効な場合
                if (response && response.status === 200) {
                    // HTMLファイルとJSファイルには no-cache ヘッダーを追加
                    if (event.request.url.endsWith('.html') || 
                        event.request.url.endsWith('.js') ||
                        event.request.url.endsWith('/')) {
                        
                        const modifiedResponse = new Response(response.body, {
                            status: response.status,
                            statusText: response.statusText,
                            headers: {
                                ...response.headers,
                                'Cache-Control': 'no-cache, no-store, must-revalidate',
                                'Pragma': 'no-cache',
                                'Expires': '0'
                            }
                        });
                        
                        // レスポンスをクローンしてキャッシュに保存（緊急時用のみ）
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return modifiedResponse;
                    } else {
                        // CSS、画像などの静的リソースは通常通りキャッシュ
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                    }
                }
                return response;
            })
            .catch(() => {
                // ネットワークエラーの場合のみキャッシュを使用
                return caches.match(event.request)
                    .then(response => {
                        if (response) {
                            return response;
                        }
                        // HTML要求でキャッシュもない場合
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        // その他のリソースは404を返す
                        return new Response('Network error and no cache available', {
                            status: 404,
                            statusText: 'Not Found'
                        });
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

// メインスレッドからのメッセージを処理
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                console.log('Service Worker: すべてのキャッシュをクリアしました');
                // メインスレッドに完了を通知
                event.ports[0]?.postMessage({
                    type: 'CACHE_CLEARED'
                });
            })
        );
    }
});