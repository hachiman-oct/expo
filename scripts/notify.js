// pwaのscripts/notify.js

// ページのすべてのリソースが読み込まれた後に処理を開始
window.addEventListener('load', () => {
    let newWorker;

    // 更新ボタンを表示し、クリックイベントに備える関数
    function showUpdateButton(worker) {
        const updateButton = document.getElementById('update-btn');
        if (updateButton) {
            newWorker = worker;
            updateButton.style.display = 'block';
        }
    }

    // 新しいワーカーの状態を追跡する関数
    function trackInstalling(worker) {
        worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateButton(worker);
            }
        });
    }

    // 1. Service Workerを登録
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/expo/sw.js').then(reg => {
            // ページ読み込み時に待機中のワーカーがいないかチェック
            if (reg.waiting) {
                showUpdateButton(reg.waiting);
                return;
            }

            // インストール中のワーカーがいる場合
            if (reg.installing) {
                trackInstalling(reg.installing);
            }

            // 新しい更新が検知された場合
            reg.addEventListener('updatefound', () => {
                trackInstalling(reg.installing);
            });
        });

        // 新しいService Workerが有効化されたらページをリロード
        let refreshing;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            window.location.reload();
            refreshing = true;
        });
    }

    // ユーザーが更新ボタンをクリックしたら、メッセージを送信し、リロードする
    document.getElementById('update-btn').addEventListener('click', () => {
        if (newWorker) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    });
});