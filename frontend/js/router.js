// router.js
/**
 * Router and navigation utilities
 */

/**
 * Simple authentication check - only checks localStorage
 */
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
}

/**
 * Gets current user ID
 */
function getCurrentUserId() {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr).id : null;
    } catch {
        return null;
    }
}

/**
 * Simple redirect check - only redirects if no token/user
 * No complex logic to avoid loops
 */
function requireAuth() {
    if (!checkAuth()) {
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/');
        
        if (!isLoginPage) {
            window.location.href = 'index.html';
            return false;
        }
    }
    return true;
}

// Експорт
window.checkAuth = checkAuth;
window.requireAuth = requireAuth;
window.getCurrentUserId = getCurrentUserId;

/**
 * Simple authentication check on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const isIndexPage = currentPath.includes('index.html') || currentPath === '/' || currentPath.endsWith('/');
    const isLandingPage = currentPath.includes('landing.html');
    const isPlanRecommendPage = currentPath.includes('plan-recommend.html');
    
    // Pages that don't require authentication
    const publicPages = ['landing.html', 'plan-recommend.html'];
    const isPublicPage = publicPages.some(page => currentPath.includes(page));
    
    if (isIndexPage) {
        // On login page - redirect to dashboard if already logged in
        if (checkAuth()) {
            window.location.href = 'dashboard.html';
        }
    } else if (!isPublicPage) {
        // On protected pages - redirect to login if not authenticated
        requireAuth();
    }
    // Public pages (landing, plan-recommend) can load without auth
});