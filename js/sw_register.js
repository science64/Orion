if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
           // console.log('ServiceWorker registration successful');
        })
        .catch(error => {
            console.error('ServiceWorker registration failed:', error);
        });
}
