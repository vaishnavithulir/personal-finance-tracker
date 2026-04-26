const CONFIG = {
    // Current Local Development or Production URL
    API_BASE_URL: 'http://192.168.1.5:5005',
    APP_NAME: 'Dumbo Finance',
    VERSION: '1.0.0'
};

// If using in browser directly without modules
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
