const os = require('os');

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '0.0.0.0';
}

const ip = getLocalIp();
console.log(`Detected LAN IP: ${ip}`);
console.log(`Target Student URL: http://${ip}:6050`);

if (ip !== '0.0.0.0') {
    console.log('✅ IP Detection Logic is WORKING');
} else {
    console.log('❌ IP Detection Logic FAILED (might be in a restricted environment)');
}
