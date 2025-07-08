let newWorker;

// 更新ボタンを表示し、クリックイベントに備える関数
function showUpdateButton(worker) {
    const updateButton = document.getElementById('update-btn');
    if (updateButton) {
        newWorker = worker; // クリックされるべきワーカーを保持
        updateButton.style.display = 'block';
    }
}

// 新しいワーカーの状態を追跡する関数
function trackInstalling(worker) {
    worker.addEventListener('statechange', () => {
        // 3. 新しいワーカーのインストールが完了したら
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New Service Worker installed and ready to activate.');
            showUpdateButton(worker);
        }
    });
}

// 1. Service Workerを登録
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/expo/sw.js').then(reg => {
        // ★【重要】ページ読み込み時に待機中のワーカーがいないかチェック
        if (reg.waiting) {
            console.log('A new Service Worker is waiting to activate.');
            showUpdateButton(reg.waiting);
            return;
        }

        // インストール中のワーカーがいる場合（通常の初回アクセス時など）
        if (reg.installing) {
            trackInstalling(reg.installing);
        }

        // 2. 新しい更新が検知された場合
        reg.addEventListener('updatefound', () => {
            console.log('New Service Worker update found.');
            trackInstalling(reg.installing);
        });
    });

    // 5. 新しいService Workerが有効化されたらページをリロード
    let refreshing;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
    });
}

// 4. ユーザーが更新ボタンをクリックしたら、メッセージを送信
document.getElementById('update-btn').addEventListener('click', () => {
    if (newWorker) {
        console.log('Update button clicked. Sending SKIP_WAITING message.');
        newWorker.postMessage({ type: 'SKIP_WAITING' });
    }
});