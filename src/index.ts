if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swFile = process.env.NODE_ENV === 'production' ? '/service-worker.js' : '/service-worker-dev.js';
        navigator.serviceWorker.register(swFile)
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

async function connectBluetooth() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true
        });
        console.log('Device selected:', device);
    } catch (error) {
        console.log('Error selecting device:', error);
    }
}

document.getElementById('connect-btn')?.addEventListener('click', connectBluetooth);
