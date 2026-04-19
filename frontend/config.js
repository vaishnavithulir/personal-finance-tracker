const CONFIG = {
    // Unified Architecture: All requests now go to the internal Next.js API
    API_BASE_URL: window.location.hostname.includes('netlify.app') 
        ? '' 
        : `http://localhost:3001`,
    APP_NAME: 'Dumbo Finance',
    VERSION: '1.0.0'
};

// If using in browser directly without modules
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
