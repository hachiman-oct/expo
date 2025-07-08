// pwaのscripts/notify.js

window.addEventListener('load', () => {
    let newWorker;
    const updateButton = document.getElementById('update-btn');
    // ボタンがページに存在しない場合は何もしない
    if (!updateButton) return;

    // 更新ボタンを表示する共通関数
    function showUpdateButton(worker) {
        newWorker = worker;
        updateButton.style.display = 'block';
    }

    // インストール中のワーカーを追跡する関数
    function trackInstalling(worker) {
        worker.addEventListener('statechange', () => {
            // 'installed'状態は、新しいワーカーが待機中になったことを意味する
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateButton(worker);
            }
        });
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/expo/sw.js', { updateViaCache: 'all' }).then(reg => {
            // 1. PWA起動時に待機中のワーカーがいるかチェック (更新を保留した場合のケース)
            if (reg.waiting) {
                showUpdateButton(reg.waiting);
            }

            // 2. 現在インストール中のワーカーがいるかチェック
            if (reg.installing) {
                trackInstalling(reg.installing);
            }

            // 3. PWAを開いている間に新しい更新が見つかった場合を監視
            reg.addEventListener('updatefound', () => {
                trackInstalling(reg.installing);
            });
        });

        // ★★★ 自動リロードの原因となっていたグローバルなリスナーを削除 ★★★
        // navigator.serviceWorker.addEventListener('controllerchange', ...);
    }

    // ボタンのクリックイベントで、更新処理のすべてを制御する
    updateButton.addEventListener('click', () => {
        // 更新対象のワーカーが存在することを確認
        if (!newWorker) return;

        // このクリックイベント内でのみ、一時的にコントローラー変更を監視する
        // これにより、ユーザーの意図したタイミングでのみリロードが実行される
        let refreshing;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            // 新しいワーカーが有効化されたら、ページをリロードして更新を適用
            window.location.reload();
            refreshing = true;
        });

        // 新しいワーカーに「待機をスキップして有効化せよ」というメッセージを送信
        // これが上記の 'controllerchange' イベントの引き金となる
        newWorker.postMessage({ type: 'SKIP_WAITING' });
    });
});