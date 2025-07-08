document.getElementById('settings-btn').onclick = function() {
    document.getElementById('settings-modal').hidden = false;
};

document.getElementById('settings-modal').onclick = function(e) {
    if (e.target === this) this.hidden = true;
};

document.querySelector('.close-modal').onclick = function() {
    document.getElementById('settings-modal').hidden = true;
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
        // Service Workerがアクティブで利用可能になったら
        if (registration.active) {
            registration.active.postMessage({ command: 'getVersion' });
        }
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.version) {
            console.log('Service Worker Version:', event.data.version);
            document.querySelector('.version-text').textContent = event.data.version;
        }
    });
}