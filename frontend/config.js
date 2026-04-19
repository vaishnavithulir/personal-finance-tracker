const CONFIG = {
    API_BASE_URL: `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5005`,
    APP_NAME: 'Dumbo Finance',
    VERSION: '1.0.0'
};

// If using in browser directly without modules
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
