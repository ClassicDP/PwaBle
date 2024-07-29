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
    e.preventDefault();
    deferredPrompt = e;
    addBtn.style.display = 'block';

    addBtn.addEventListener('click', (e) => {
        addBtn.style.display = 'none';
        deferredPrompt.prompt();
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

interface Device {
    name?: string;
    id: string;
    rssi?: number;
}

function saveDevice(device: BluetoothDevice) {
    let devices: Device[] = JSON.parse(localStorage.getItem('devices') || '[]');
    const deviceIndex = devices.findIndex(d => d.id === device.id);

    if (deviceIndex !== -1) {
        devices[deviceIndex].name = device.name;
    } else {
        devices.push({
            name: device.name,
            id: device.id
        });
    }

    localStorage.setItem('devices', JSON.stringify(devices));
}

function loadDevices() {
    const storedDevices: Device[] = JSON.parse(localStorage.getItem('devices') || '[]');
    const deviceMap = new Map(storedDevices.map(device => [device.id, device]));

    const deviceList = document.getElementById('device-list');
    if (deviceList) deviceList.innerHTML = '';

    deviceMap.forEach(device => {
        displayDevice(device);
    });
}

async function connectBluetooth() {
    try {
        const options: RequestDeviceOptions = {
            acceptAllDevices: true,
            optionalServices: ['battery_service']
        };

        const device = await navigator.bluetooth.requestDevice(options);
        console.log('Device selected:', device);
        saveDevice(device);
        displayDevice({ name: device.name, id: device.id });
    } catch (error) {
        console.log('Error selecting device:', error);
    }
}

async function scanAndDisplayDevices() {
    const knownDevices: Device[] = JSON.parse(localStorage.getItem('devices') || '[]');
    const filters = knownDevices
        .filter(device => device.name)
        .map(device => ({ name: device.name }));

    if (filters.length === 0) {
        console.log('No known devices to filter.');
        return;
    }

    try {
        console.log('Scanning for devices...');
        const options: RequestDeviceOptions = { filters };

        const device = await navigator.bluetooth.requestDevice(options);

        const newDevice: Device = {
            name: device.name,
            id: device.id,
            rssi: undefined // RSSI недоступен через requestDevice
        };
        updateDeviceList(newDevice);

    } catch (error) {
        console.log('Error during Bluetooth scan:', error);
    }
}

function updateDeviceList(device: Device) {
    const devicesContainer = document.getElementById('devices');
    const deviceList = document.getElementById('device-list');
    if (devicesContainer && deviceList) {
        devicesContainer.style.display = 'block';
        let listItem = document.querySelector(`#device-${device.id}`);
        if (!listItem) {
            listItem = document.createElement('li');
            listItem.id = `device-${device.id}`;
            deviceList.appendChild(listItem);
        }
        listItem.textContent = `${device.name || 'Unknown device'} (${device.id}) - Signal Strength: ${device.rssi !== undefined ? device.rssi : 'N/A'}`;
    }
}

function displayDevice(device: Device) {
    const devicesContainer = document.getElementById('devices');
    const deviceList = document.getElementById('device-list');
    if (devicesContainer && deviceList) {
        devicesContainer.style.display = 'block';
        let listItem = document.createElement('li');
        listItem.id = `device-${device.id}`;
        listItem.textContent = `${device.name || 'Unknown device'} (${device.id})`;
        deviceList.appendChild(listItem);
    }
}

document.getElementById('connect-btn')?.addEventListener('click', connectBluetooth);
document.getElementById('scan-btn')?.addEventListener('click', async () => {
    try {
        await scanAndDisplayDevices();
    } catch (error) {
        console.error('Error during Bluetooth scan:', error);
    }
});

window.addEventListener('load', () => {
    loadDevices();
});
