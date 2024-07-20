if ('serviceWorker' in navigator) {
    const swFile = process.env.NODE_ENV === 'production' ? '/service-worker.js' : '/service-worker.js';
    navigator.serviceWorker.register(swFile)
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}
