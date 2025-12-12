/**
 * Account Page Module
 * Displays user profile and trip statistics with links to My Trips
 */

let myTrips = [];
let tripsStats = { current: 0, future: 0, past: 0 };

document.addEventListener("DOMContentLoaded", () => {
    // Check auth first - if no token, redirect immediately
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = 'index.html';
        return;
    }
    
    // Отримуємо email з об'єкта user в localStorage
    try {
        const userData = JSON.parse(user);
        const emailEl = document.getElementById("userEmail");
        if (emailEl && userData.email) {
            emailEl.innerText = userData.email;
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
    }
    
    loadTripsStats();
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    window.addEventListener('focus', () => {
        loadTripsStats();
    });
});

/**
 * Navigates to My Trips page with specified filter
 * @param {string} filterType - 'current', 'future', or 'past'
 */
function goToMyTrips(filterType) {
    storage.set('myTripsFilter', filterType);
    window.location.href = 'my-trips.html';
}

/**
 * Loads trip statistics from API and updates UI
 */
async function loadTripsStats() {
    try {
        const data = await api.get('/api/trips');
        
        if (data.success && data.trips) {
            myTrips = data.trips || [];
            calculateTripsStats();
            updateTripsStatsUI();
        } else {
            // API returned but no trips - use local storage
            loadTripsFromLocalStorage();
        }
    } catch (error) {
        // Check if it's an auth error
        const isAuthError = error.status === 401 || error.status === 403 || 
                           error.message.includes('401') || error.message.includes('403') ||
                           (error.response && (error.response.status === 401 || error.response.status === 403));
        
        if (isAuthError) {
            // Only redirect if we're sure it's an auth error
            // Clear auth first
            storage.clearAuth();
            // Use a flag to prevent multiple redirects
            if (!window._accountRedirecting) {
                window._accountRedirecting = true;
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 300);
            }
            return;
        }
        
        // For other errors (network, etc), use local storage
        loadTripsFromLocalStorage();
    }
}

/**
 * Calculates trip statistics by status
 */
function calculateTripsStats() {
    // Скидаємо статистику
    tripsStats = { current: 0, future: 0, past: 0 };
    
    myTrips.forEach(trip => {
        const status = (trip.status || '').toLowerCase();
        
        if (status === 'active') {
            tripsStats.current++;
        } else if (status === 'finished' || status === 'completed') {
            tripsStats.past++;
        } else if (status === 'planned') {
            tripsStats.future++;
        } else {
            // Якщо статус невідомий, категорізуємо по датах
            categorizeTripByDate(trip);
        }
    });
    
    // Якщо немає подорожей зі статусами, але є подорожі - категоризуємо всі по датах
    if (myTrips.length > 0 && tripsStats.current === 0 && tripsStats.past === 0 && tripsStats.future === 0) {
        categorizeAllTripsByDate();
    }
}

/**
 * Categorizes a single trip by dates
 */
function categorizeTripByDate(trip) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (trip.start_date && trip.end_date) {
        const startDate = new Date(trip.start_date);
        const endDate = new Date(trip.end_date);
        
        if (startDate > today) {
            tripsStats.future++;
        } else if (endDate < today) {
            tripsStats.past++;
        } else {
            tripsStats.current++;
        }
    } else if (trip.start_date) {
        const startDate = new Date(trip.start_date);
        if (startDate > today) {
            tripsStats.future++;
        } else {
            tripsStats.current++;
        }
    } else {
        // Якщо дат немає, вважаємо запланованим
        tripsStats.future++;
    }
}

/**
 * Categorizes all trips by dates
 */
function categorizeAllTripsByDate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    myTrips.forEach(trip => {
        categorizeTripByDate(trip);
    });
}

/**
 * Loads trips from localStorage as fallback
 */
function loadTripsFromLocalStorage() {
    try {
        const savedTrips = storage.get('myPlans', []);
        myTrips = savedTrips;
        calculateTripsStats();
        updateTripsStatsUI();
    } catch (error) {
        toast.error('Не вдалося завантажити статистику подорожей');
    }
}

/**
 * Updates trip statistics in the UI
 */
function updateTripsStatsUI() {
    const currentEl = document.getElementById('currentTrips');
    const futureEl = document.getElementById('futureTrips');
    const pastEl = document.getElementById('pastTrips');
    
    if (currentEl) currentEl.textContent = tripsStats.current;
    if (futureEl) futureEl.textContent = tripsStats.future;
    if (pastEl) pastEl.textContent = tripsStats.past;
    
    const currentDesc = document.getElementById('currentTripsDesc');
    const futureDesc = document.getElementById('futureTripsDesc');
    const pastDesc = document.getElementById('pastTripsDesc');
    
    // Оновлюємо описи
    updateTripDescription(currentDesc, tripsStats.current, 'Активна поїздка', 'Активні поїздки', 'Немає активних поїздок');
    updateTripDescription(futureDesc, tripsStats.future, 'Запланована поїздка', 'Заплановані поїздки', 'Немає запланованих поїздок');
    updateTripDescription(pastDesc, tripsStats.past, 'Завершена поїздка', 'Завершені поїздки', 'Немає завершених поїздок');
    
    // Оновлюємо заголовки карток
    updateTripCardsHeaders();
}

/**
 * Updates a trip description element based on count
 */
function updateTripDescription(element, count, singular, plural, zero) {
    if (!element) return;
    
    if (count === 1) {
        element.textContent = singular;
    } else if (count === 0) {
        element.textContent = zero;
    } else {
        element.textContent = plural;
    }
}

/**
 * Updates trip card headers based on count (singular/plural)
 */
function updateTripCardsHeaders() {
    const tripCards = document.querySelectorAll('.trip-card');
    
    if (tripCards.length >= 3) {
        const headers = [
            tripsStats.current === 1 ? 'Поточна подорож' : 'Поточні подорожі',
            tripsStats.future === 1 ? 'Майбутня подорож' : 'Майбутні подорожі',
            tripsStats.past === 1 ? 'Минула подорож' : 'Минулі подорожі'
        ];
        
        tripCards.forEach((card, index) => {
            const header = card.querySelector('h3');
            if (header && headers[index]) {
                header.textContent = headers[index];
            }
        });
    }
}

/**
 * Logs out user and clears session data
 */
function logout() {
    if (confirm("Ви впевнені, що хочете вийти?")) {
        storage.clearAuth();
        window.location.href = 'index.html';
    }
}

/**
 * Toggles sidebar visibility
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// Експорт функцій для глобального використання
window.goToMyTrips = goToMyTrips;
window.logout = logout;