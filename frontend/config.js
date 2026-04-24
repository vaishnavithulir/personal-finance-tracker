const CONFIG = {
    // Unified Architecture: All requests now go to the internal Next.js API
    API_BASE_URL: (() => {
        if (window.location.origin.includes('netlify.app')) return '';
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return `${window.location.protocol}//${window.location.hostname}:3001`;
        }
        // Native environment (Capacitor/Android Emulator)
        return 'http://10.0.2.2:3001';
    })(),
    APP_NAME: 'Dumbo Finance',
    VERSION: '1.0.0'
};

// If using in browser directly without modules
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
