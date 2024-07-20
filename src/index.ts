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

// Manage the installation prompt
let deferredPrompt: any;
const addBtn = document.createElement('button');
addBtn.textContent = 'Install App';
addBtn.style.display = 'none';
document.body.appendChild(addBtn);

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    addBtn.style.display = 'block';

    addBtn.addEventListener('click', (e) => {
        // Hide the button
        addBtn.style.display = 'none';
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult: any) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
    });
});

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
