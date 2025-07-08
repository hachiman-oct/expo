// share.js
export async function shareLink({ title = '', text = '', url }) {
  if (!navigator.share) {
    alert('このブラウザはWeb Share APIに対応していません。');
    return;
  }

  try {
    await navigator.share({ title, text, url });
    console.log('共有に成功');
  } catch (error) {
    console.error('共有に失敗:', error);
  }
}