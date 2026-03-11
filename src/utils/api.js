import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
});

// Automatically add Token to headers if exists and prevent caching
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Prevent browser caching for all typical REST endpoints (especially GET)
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    
    // specifically for get requests, add cache busting param if not already present
    if (config.method === 'get') {
        config.params = {
            ...config.params,
            _t: new Date().getTime() // cache buster
        };
    }

    return config;
});

export default API;

