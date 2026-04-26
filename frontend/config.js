const CONFIG = {
    // Current Local Development or Production URL
    API_BASE_URL: 'https://dumbo-finance-app.onrender.com',
    APP_NAME: 'Dumbo Finance',
    VERSION: '1.0.0'
};

// If using in browser directly without modules
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
