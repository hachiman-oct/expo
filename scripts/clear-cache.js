// HTML要素を取得
const clearCacheButton = document.getElementById('clear-cache-btn');
const statusMessage = document.getElementById('cache-status-msg');

// ボタンにクリックイベントを追加
clearCacheButton.addEventListener('click', async () => {
  // 処理中はボタンを無効化する
  clearCacheButton.disabled = true;
  statusMessage.textContent = 'クリア中...'; // 処理中メッセージ
  statusMessage.style.color = 'gray';


  // キャッシュAPIがブラウザで利用可能か確認
  if ('caches' in window) {
    const cacheNamePrefix = 'expo-pwa-v'; // 対象のキャッシュ名の接頭辞

    try {
      const keys = await caches.keys();
      const deletePromises = keys
        .filter(key => key.startsWith(cacheNamePrefix))
        .map(key => caches.delete(key));

      await Promise.all(deletePromises);

      // 成功メッセージを表示
      statusMessage.textContent = '✅ キャッシュをクリアしました。';
      statusMessage.style.color = 'green';

    } catch (error) {
      console.error('キャッシュのクリア中にエラーが発生しました:', error);
      // 失敗メッセージを表示
      statusMessage.textContent = '❌ クリアに失敗しました。';
      statusMessage.style.color = 'red';
    }
  } else {
    // 非対応ブラウザ向けのメッセージ
    statusMessage.textContent = '❌ このブラウザは対応していません。';
    statusMessage.style.color = 'red';
  }

  // 3秒後にメッセージを消去し、ボタンを再度有効化する
  setTimeout(() => {
    statusMessage.textContent = '';
    clearCacheButton.disabled = false;
  }, 3000); // 3000ミリ秒 = 3秒
});