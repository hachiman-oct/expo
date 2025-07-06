let newWorker;

// 1. Service Workerを登録
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
        // 2. 更新が検知された場合
        reg.addEventListener('updatefound', () => {
            newWorker = reg.installing;

            // 3. 新しいワーカーのインストールが完了したら
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('New Service Worker installed and ready to activate.');
                    // 更新準備完了の通知を表示する（例: ボタンを表示）
                    const updateButton = document.getElementById('update-button');
                    updateButton.style.display = 'block';
                }
            });
        });
    });

    // 5. 新しいService Workerが有効化されたらページをリロード
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}

// 4. ユーザーが更新ボタンをクリックしたら、メッセージを送信
document.getElementById('update-button').addEventListener('click', () => {
    newWorker.postMessage({ type: 'SKIP_WAITING' });
});