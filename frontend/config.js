const CONFIG = {
    // Dynamically switch between Local and Production Backend
    API_BASE_URL: window.location.hostname.includes('netlify.app') 
        ? 'https://personal-finance-tracker-1.onrender.com' 
        : `http://localhost:5005`,
    APP_NAME: 'Dumbo Finance',
    VERSION: '1.0.0'
};

// If using in browser directly without modules
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
