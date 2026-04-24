const CONFIG = {
    // Unified Architecture: All requests now go to the internal Next.js API
    API_BASE_URL: window.location.origin.includes('netlify.app') 
        ? '' 
        : `${window.location.protocol}//${window.location.hostname}:3001`,
    APP_NAME: 'Dumbo Finance',
    VERSION: '1.0.0'
};

// If using in browser directly without modules
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
