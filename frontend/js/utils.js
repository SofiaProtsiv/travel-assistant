/**
 * Utility Functions Module
 * Provides centralized API communication, local storage management, formatting, and URL utilities
 */

const API_BASE = 'http://localhost:3000';

/**
 * Gets authentication token from localStorage
 * Handles both direct storage and JSON stringified storage (for backwards compatibility)
 */
const getAuthToken = () => {
    let token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    // If token is JSON stringified (starts with quotes), parse it
    if (token && token.startsWith('"') && token.endsWith('"')) {
        try {
            token = JSON.parse(token);
            // Fix it by saving it correctly
            localStorage.setItem('authToken', token);
        } catch {
            // If parsing fails, use as is
        }
    }
    
    return token;
};

/**
 * API communication wrapper with error handling
 */
const api = {
    /**
     * Performs GET request
     */
    get: async (path) => {
        const token = getAuthToken();
        const headers = { 'Content-Type': 'application/json' };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(`${API_BASE}${path}`, { headers });
        const data = await res.json();
        
        // Handle errors - don't clear auth automatically, let pages handle it
        if (!res.ok) {
            const error = new Error(data.message || `API error: ${res.status}`);
            error.status = res.status;
            error.response = data;
            throw error;
        }
        
        return data;
    },
    
    /**
     * Performs POST request
     */
    post: async (path, data) => {
        const token = getAuthToken();
        const headers = { 'Content-Type': 'application/json' };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        
        const responseData = await res.json();
        
        if (!res.ok) {
            const error = new Error(responseData.message || `API error: ${res.status}`);
            error.response = responseData;
            throw error;
        }
        
        return responseData;
    },
    
    /**
     * Performs PATCH request
     */
    patch: async (path, data) => {
        const token = getAuthToken();
        const headers = { 'Content-Type': 'application/json' };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    },
    
    /**
     * Performs DELETE request
     */
    delete: async (path) => {
        const token = getAuthToken();
        const headers = { 'Content-Type': 'application/json' };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'DELETE',
            headers: headers
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    }
};

/**
 * Local storage wrapper with JSON serialization
 */
const storage = {
    /**
     * Retrieves value from localStorage with JSON parsing
     */
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    
    /**
     * Stores value in localStorage with JSON serialization
     */
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (err) {
            console.error('Error saving to localStorage:', err);
        }
    },
    
    /**
     * Saves authentication data
     */
    saveAuth: (token, user) => {
        try {
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(user));
        } catch (err) {
            console.error('Error saving auth data:', err);
        }
    },
    
    /**
     * Removes key from localStorage
     */
    remove: (key) => {
        localStorage.removeItem(key);
    },
    
    /**
     * Clears all localStorage data
     */
    clear: () => {
        localStorage.clear();
    },
    
    /**
     * Clears authentication data
     */
    clearAuth: () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }
};

/**
 * Formatting utilities for dates, currency, and pluralization
 */
const format = {
    /**
     * Formats date string to Ukrainian locale
     */
    date: (dateString) => {
        if (!dateString) return 'Не вказано';
        try {
            return new Date(dateString).toLocaleDateString('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    },
    
    /**
     * Formats number as Euro currency
     */
    currency: (amount) => {
        return `€${parseFloat(amount || 0).toFixed(2)}`;
    },
    
    /**
     * Returns correct plural form for Ukrainian language
     */
    plural: (number, forms) => {
        if (!Array.isArray(forms) || forms.length < 3) return '';
        if (number % 10 === 1 && number % 100 !== 11) return forms[0];
        if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) return forms[1];
        return forms[2];
    }
};

/**
 * URL parameter utilities
 */
const url = {
    /**
     * Gets query parameter value by name
     */
    getParam: (name) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    },
    
    /**
     * Sets query parameter value
     */
    setParam: (name, value) => {
        const params = new URLSearchParams(window.location.search);
        params.set(name, value);
        window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    }
};

/**
 * Authentication utilities
 */
const auth = {
    /**
     * Checks if user is authenticated
     */
    isAuthenticated: () => {
        return !!getAuthToken();
    },
    
    /**
     * Gets current user
     */
    getCurrentUser: () => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return null;
        }
    },
    
    /**
     * Gets user ID
     */
    getUserId: () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            return user.id || null;
        } catch {
            return null;
        }
    }
};

/**
 * Simple token check - just verifies token exists in localStorage
 * No API validation needed for non-commercial project
 */
const validateToken = () => {
    const token = getAuthToken();
    const user = localStorage.getItem('user');
    return !!(token && user);
};

window.validateToken = validateToken;

// Експорт у глобальну область видимості
window.api = api;
window.storage = storage;
window.format = format;
window.url = url;
window.auth = auth;