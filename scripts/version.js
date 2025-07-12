// pwaのscripts/version.js

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

/**
 * Service Workerにバージョンを問い合わせて、HTMLに表示する関数
 */
function displayVersion() {
    // Service Workerがページを制御しているか確認
    if (navigator.serviceWorker.controller) {
        // 'getVersion'コマンドをService Workerに送信
        navigator.serviceWorker.controller.postMessage({ command: 'getVersion' });
    }
}

// Service Workerからのメッセージを受信するリスナー
navigator.serviceWorker.addEventListener('message', event => {
    // メッセージにバージョン情報が含まれているか確認
    if (event.data && event.data.version) {
        // class="version-text" を持つすべてのp要素を取得
        const versionElements = document.querySelectorAll('.version-text');
        // 取得したすべての要素にバージョン番号を設定
        versionElements.forEach(element => {
            element.textContent = `v${event.data.version}`;
        });
    }
});

// Service Workerの準備が完了したら、バージョンを問い合わせる
// .ready は、有効なService Workerが制御を開始したときに解決されるPromise
navigator.serviceWorker.ready.then(() => {
    displayVersion();
});