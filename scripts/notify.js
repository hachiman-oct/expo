// pwaのscripts/notify.js

window.addEventListener('load', () => {
    // Service Workerが利用可能かチェック
    if ('serviceWorker' in navigator) {
        // Service Workerを登録する
        // updateViaCache: 'all' は、sw.jsのHTTPキャッシュを無視するために引き続き重要
        navigator.serviceWorker.register('/expo/sw.js', { updateViaCache: 'all' });

        let refreshing;
        // Service Workerのコントローラーが変更されたことを検知する
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // 多重リロードを防止
            if (refreshing) return;

            // ページをリロードして、新しいService Workerが提供する最新のコンテンツを反映させる
            window.location.reload();
            refreshing = true;
        });
    }
});