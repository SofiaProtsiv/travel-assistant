/**
 * My Trips Module
 * Manages trip display, categorization, status updates, and history tracking
 */

// Спочатку визначимо storage, якщо він не визначений в utils.js
if (typeof storage === 'undefined') {
    window.storage = {
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        },
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (err) {
                console.error('Error saving to localStorage:', err);
            }
        },
        remove: (key) => {
            localStorage.removeItem(key);
        },
        clear: () => {
            localStorage.clear();
        },
        clearAuth: () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
        saveAuth: (token, user) => {
            try {
                localStorage.setItem('authToken', token);
                localStorage.setItem('user', JSON.stringify(user));
            } catch (err) {
                console.error('Error saving auth data:', err);
            }
        }
    };
}

let myTrips = [];
let myFutureTrips = [];
let myHistory = window.storage.get('travelHistory', []);

/**
 * Returns correct plural form for Ukrainian language
 */
function getPluralForm(number, forms) {
    if (!Array.isArray(forms) || forms.length < 3) return '';
    
    if (number % 10 === 1 && number % 100 !== 11) return forms[0];
    if (number % 10 >= 2 && number % 10 <= 4 && (number % 100 < 10 || number % 100 >= 20)) return forms[1];
    return forms[2];
}

/**
 * Returns status information with colors and text
 */
function getStatusInfo(status) {
    switch(status) {
        case 'finished':
        case 'completed':
            return {
                text: 'Минула',
                color: '#2ed573',
                gradient: 'background: linear-gradient(135deg, #2ed573 0%, #1dd1a1 100%);'
            };
        case 'active':
            return {
                text: 'Поточна',
                color: '#ffa502',
                gradient: 'background: linear-gradient(135deg, #ffa502 0%, #ff7f00 100%);'
            };
        case 'planned':
        default:
            return {
                text: 'Заплановано',
                color: '#7C5DF9',
                gradient: 'background: linear-gradient(135deg, #7C5DF9 0%, #5a3fd9 100%);'
            };
    }
}

/**
 * Returns localized status text
 */
function getStatusText(status) {
    const statusMap = {
        'finished': 'Минула',
        'completed': 'Минула',
        'active': 'Поточна',
        'planned': 'Заплановано'
    };
    return statusMap[status] || status;
}

/**
 * Formats date string to Ukrainian locale
 */
function formatDate(dateString) {
    try {
        if (!dateString) return 'Не вказано';
        return new Date(dateString).toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return dateString;
    }
}

/**
 * Formats date range for display
 */
function formatDateRange(startDate, endDate) {
    try {
        const start = startDate ? formatDate(startDate) : 'Не вказано';
        const end = endDate ? formatDate(endDate) : 'Не вказано';
        return `${start} - ${end}`;
    } catch {
        return 'Не вказано';
    }
}

/**
 * Returns month name abbreviation
 */
function getMonthName(monthIndex) {
    const months = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Груд'];
    return months[monthIndex] || 'Невідомо';
}

/**
 * Maps country name to code
 */
function getCountryCode(countryName) {
    const countryMap = {
        'Франція': 'france',
        'Італія': 'italy',
        'Іспанія': 'spain',
        'Німеччина': 'germany',
        'Україна': 'ukraine',
        'Польща': 'poland'
    };
    return countryMap[countryName] || countryName?.toLowerCase() || 'other';
}

/**
 * Maps country code to name
 */
function getCountryName(countryCode) {
    const countryMap = {
        'france': 'Франція',
        'italy': 'Італія',
        'spain': 'Іспанія',
        'germany': 'Німеччина',
        'ukraine': 'Україна',
        'poland': 'Польща'
    };
    return countryMap[countryCode] || countryCode;
}

/**
 * Returns city icon emoji
 */
function getCityIcon(cityName) {
    const icons = {
        'Париж': '🗼',
        'Берлін': '🏛️',
        'Рим': '🏛️',
        'Лондон': '🏰',
        'Мадрид': '👑',
        'Барселона': '🏖️',
        'Марсель': '⛵',
        'Мюнхен': '🍺',
        'Ліон': '🍷',
        'default': '📍'
    };
    
    const emoji = icons[cityName] || icons['default'];
    return `<div style="font-size: 40px; margin-bottom: 10px;">${emoji}</div>`;
}

/**
 * Simple authentication check
 */
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

/**
 * Loads trips from API with localStorage fallback
 */
async function loadTrips() {
    try {
        const data = await api.get('/api/trips');
        
        if (data.success && data.trips) {
            myTrips = data.trips;
            categorizeTrips();
        } else {
            myTrips = window.storage.get('myPlans', []);
            categorizeTrips();
        }
        
        myHistory = window.storage.get('travelHistory', []);
        const activeTab = getActiveTab();
        renderTripsByTab(activeTab);
        
    } catch (error) {
        // Check if it's an auth error
        const isAuthError = error.status === 401 || error.status === 403 || 
                           error.message.includes('401') || error.message.includes('403') ||
                           error.message.includes('Токен') || error.message.includes('Unauthorized');
        
        if (isAuthError) {
            // Clear all auth data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('isAuthenticated');
            
            // Prevent multiple redirects
            if (!window._myTripsRedirecting) {
                window._myTripsRedirecting = true;
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 300);
            }
            return;
        }
        
        // При інших помилках - використовуємо локальні дані
        myTrips = window.storage.get('myPlans', []);
        myHistory = window.storage.get('travelHistory', []);
        categorizeTrips();
        renderTripsByTab(getActiveTab());
    }
}

/**
 * Categorizes trips by status
 */
function categorizeTrips() {
    myFutureTrips = myTrips.filter(trip => {
        const status = trip.status?.toLowerCase() || '';
        return status === 'planned';
    });
}

/**
 * Gets currently active tab
 * Checks localStorage filter first, then falls back to active button
 */
function getActiveTab() {
    const filter = window.storage.get('myTripsFilter');
    if (filter) {
        const validTabs = ['current', 'future', 'history'];
        if (validTabs.includes(filter)) {
            return filter;
        }
    }
    const activeBtn = document.querySelector('.tab-btn.active');
    return activeBtn ? activeBtn.dataset.tab : 'current';
}

/**
 * Renders trips based on active tab
 */
function renderTripsByTab(tab) {
    switch(tab) {
        case 'current':
            renderCurrentTrips();
            break;
        case 'future':
            renderFutureTrips();
            break;
        case 'history':
            renderHistory();
            break;
    }
}

/**
 * Renders current (active) trips
 */
function renderCurrentTrips() {
    const plansGrid = document.getElementById('currentGrid');
    const plansCount = document.getElementById('currentCount');

    if (!plansGrid) return;

    const currentTrips = myTrips.filter(trip => trip.status === 'active');

    if (plansCount) {
        plansCount.textContent = `У вас ${currentTrips.length} ${getPluralForm(currentTrips.length, ['поточна подорож', 'поточні подорожі', 'поточних подорожей'])}`;
    }

    plansGrid.innerHTML = '';

    if (currentTrips.length === 0) {
        plansGrid.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: #ccc; margin-bottom: 20px;">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                    <path d="M2 2l7.586 7.586"/>
                    <circle cx="11" cy="11" r="2"/>
                </svg>
                <h3>Немає поточних подорожей</h3>
                <p>У вас немає поїздок зі статусом "Поточна"</p>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <a href="map-journey.html" class="btn btn-primary">Створити поїздку</a>
                    <button class="btn btn-outline" onclick="activatePlannedTrip()">Активувати заплановану</button>
                </div>
            </div>
        `;
        return;
    }

    currentTrips.forEach(trip => {
        createTripCard(trip, plansGrid, true);
    });
    
    initTripCardEvents();
}

/**
 * Renders future (planned) trips
 */
function renderFutureTrips() {
    const plansGrid = document.getElementById('futureGrid');
    const plansCount = document.getElementById('futureCount');

    if (!plansGrid) return;

    if (plansCount) {
        plansCount.textContent = `У вас ${myFutureTrips.length} ${getPluralForm(myFutureTrips.length, ['запланована подорож', 'заплановані подорожі', 'запланованих подорожей'])}`;
    }

    plansGrid.innerHTML = '';

    if (myFutureTrips.length === 0) {
        plansGrid.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: #ccc; margin-bottom: 20px;">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <h3>Немає запланованих подорожей</h3>
                <p>У вас немає поїздок зі статусом "Заплановано"</p>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                    <a href="map-journey.html" class="btn btn-primary">Запланувати подорож</a>
                </div>
            </div>
        `;
        return;
    }

    myFutureTrips.sort((a, b) => {
        const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
        const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
        return dateA - dateB;
    });

    myFutureTrips.forEach(trip => {
        createTripCard(trip, plansGrid, false);
    });
    
    initTripCardEvents();
}

/**
 * Renders travel history timeline
 */
function renderHistory() {
    const historyCount = document.getElementById('historyCount');
    const timeline = document.getElementById('historyTimeline');
    
    if (!timeline) return;
    
    if (historyCount) {
        historyCount.textContent = `${myHistory.length} ${getPluralForm(myHistory.length, ['минула подорож', 'минулі подорожі', 'минулих подорожей'])}`;
    }
    
    if (myHistory.length === 0) {
        timeline.innerHTML = `
            <div class="empty-history">
                <svg class="icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <h3>Історія порожня</h3>
                <p>Тут будуть відображатися ваші минулі подорожі</p>
            </div>
        `;
        return;
    }
    
    const groupedByYear = {};
    myHistory.forEach(entry => {
        const year = entry.year || 'Невідомий рік';
        if (!groupedByYear[year]) {
            groupedByYear[year] = [];
        }
        groupedByYear[year].push(entry);
    });
    
    const years = Object.keys(groupedByYear).sort((a, b) => b - a);
    
    timeline.innerHTML = '';
    
    years.forEach(year => {
        const yearSection = document.createElement('div');
        yearSection.className = 'history-year-section';
        
        const yearHeader = document.createElement('h3');
        yearHeader.className = 'history-year-header';
        yearHeader.textContent = year;
        
        yearSection.appendChild(yearHeader);
        
        groupedByYear[year].forEach(entry => {
            const trip = myTrips.find(t => t.id == entry.tripId);
            const status = trip ? trip.status : 'finished';
            
            yearSection.innerHTML += `
                <div class="history-item" data-trip-id="${entry.tripId}">
                    <div class="history-date">
                        <div class="history-month">${entry.month}</div>
                        <div class="history-year-small">${entry.year}</div>
                    </div>
                    <div class="history-card">
                        <div class="history-header">
                            <h3 class="history-title">${entry.title}</h3>
                            <span class="history-country">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 2a8 8 0 0 0-8 8c0 4.42 7 12 8 12s8-7.58 8-12a8 8 0 0 0-8-8z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                </svg>
                                ${getCountryName(entry.country) || entry.country}
                            </span>
                        </div>
                        <div class="history-details">
                            <div class="history-detail">
                                <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                ${entry.duration} днів
                            </div>
                            <div class="history-detail">
                                <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <polyline points="12 6 12 12 16 14"/>
                                </svg>
                                ${entry.period}
                            </div>
                            ${entry.notes ? `
                                <div class="history-detail">
                                    <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 20h9"/>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                    </svg>
                                    ${entry.notes.length > 50 ? entry.notes.substring(0, 50) + '...' : entry.notes}
                                </div>
                            ` : ''}
                        </div>
                        ${entry.places && entry.places.length > 0 ? `
                            <div class="history-places">
                                <div class="places-label">Відвідано:</div>
                                <div class="places-list">
                                    ${entry.places.map(place => `
                                        <span class="place-tag">${place}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        <div class="history-actions">
                            ${entry.tripId ? `
                                <button class="btn btn-outline btn-sm" onclick="viewHistoryTrip(${entry.tripId})">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                    Деталі
                                </button>
                                <button class="btn btn-outline btn-sm" onclick="createSimilarTrip(${entry.tripId})">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <line x1="16" y1="13" x2="8" y2="13"/>
                                        <line x1="16" y1="17" x2="8" y2="17"/>
                                        <polyline points="10 9 9 9 8 9"/>
                                    </svg>
                                    Повторити
                                </button>
                            ` : `
                                <button class="btn btn-outline btn-sm" onclick="showHistoryDetails('${entry.id}')">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                    Деталі
                                </button>
                            `}
                            <button class="btn btn-outline btn-sm btn-danger" onclick="removeFromHistory('${entry.id}')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                                Видалити
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        timeline.appendChild(yearSection);
    });
}

/**
 * Views trip details from history
 */
async function viewHistoryTrip(tripId) {
    try {
        const data = await api.get(`/api/trips/${tripId}`);
        
        if (data.success) {
            window.storage.set('selectedTrip', data.trip);
            window.location.href = `map-journey.html?tripId=${tripId}&view=history`;
        }
    } catch (error) {
        toast.error('Не вдалося завантажити деталі');
    }
}

/**
 * Creates trip card element
 */
function createTripCard(trip, container, isCurrent = false) {
    const tripCard = document.createElement('div');
    tripCard.className = 'card trip-card';
    tripCard.dataset.tripId = trip.id;
    tripCard.dataset.status = trip.status;

    const statusInfo = getStatusInfo(trip.status);
    const startDate = trip.start_date ? formatDate(trip.start_date) : 'Не вказано';
    const endDate = trip.end_date ? formatDate(trip.end_date) : 'Не вказано';
    
    // ОНОВЛЕНО: Беремо visited_count з trip об'єкта
    const attractionsCount = trip.attractions_count || 0;
    const visitedCount = trip.visited_count || 0; // <-- ЦЕ ОНОВЛЕНО
    const visitedPercent = attractionsCount > 0 
        ? Math.round((visitedCount / attractionsCount) * 100) 
        : 0;

    const cityIcon = getCityIcon(trip.city_name);

    tripCard.innerHTML = `
        <div class="trip-image" style="${statusInfo.gradient}">
            ${cityIcon}
            <div class="trip-status">
                <span class="badge" style="background: ${statusInfo.color}; color: white;">
                    ${isCurrent ? '🚗 Поточна' : statusInfo.text}
                </span>
            </div>
        </div>
        <div class="trip-content">
            <div>
                <h3>${trip.city_name || 'Місто'}</h3>
                <p>${trip.country_name || 'Країна'}</p>
            </div>
            <div class="trip-stats">
                <div class="trip-stat">
                    <p class="text-muted">Пам'яток</p>
                    <p class="trip-stat-value">${attractionsCount}</p>
                </div>
                <div class="trip-stat">
                    <p class="text-muted">Відвідано</p>
                    <p class="trip-stat-value">${visitedPercent}%</p>
                </div>
            </div>
            <div class="trip-date">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>${startDate} - ${endDate}</span>
            </div>
            <div class="trip-places">
                <p><strong>${attractionsCount}</strong> пам'яток у плані</p>
                <p><strong>${visitedCount}</strong> вже відвідано</p> <!-- ОНОВЛЕНО -->
                ${attractionsCount === 0 ? '<p class="text-muted"><small>Додайте пам\'ятки з карти</small></p>' : ''}
            </div>
            <div class="trip-actions">
                <div class="status-select-container">
                    <select class="status-select" data-trip-id="${trip.id}">
                        <option value="planned" ${trip.status === 'planned' ? 'selected' : ''}>📅 Заплановано</option>
                        <option value="active" ${trip.status === 'active' ? 'selected' : ''}>🚗 Поточна</option>
                        <option value="finished" ${trip.status === 'finished' ? 'selected' : ''}>✅ Минула</option>
                    </select>
                </div>
                <div style="display: flex; gap: 8px; flex: 1;">
                    <button class="btn btn-outline" style="flex: 1;" onclick="viewTripDetails(${trip.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 5px;">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Переглянути
                    </button>
                    ${isCurrent ? `
                        <button class="btn btn-outline btn-icon" onclick="startNavigation(${trip.id})" style="color: #1dd1a1; border-color: #1dd1a1;" title="Навігація">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="12 2 19 21 12 17 5 21 12 2"/>
                            </svg>
                        </button>
                    ` : ''}
                    <button class="btn btn-outline btn-icon" onclick="deleteTrip(${trip.id})" style="color: #ff4757; border-color: #ff4757;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    container.appendChild(tripCard);
}

/**
 * Initializes event listeners for trip cards
 */
function initTripCardEvents() {
    setTimeout(() => {
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', handleStatusChange);
        });
    }, 100);
}

/**
 * Handles trip status change
 */
async function handleStatusChange(event) {
    const select = event.target;
    const tripId = select.dataset.tripId;
    const newStatus = select.value;
    
    if (!tripId) return;
    
    try {
        const data = await api.patch(`/api/trips/${tripId}/status`, {
            status: newStatus
        });
        
        if (!data.success) {
            throw new Error(data.error || 'Помилка оновлення статусу');
        }
        
        const tripIndex = myTrips.findIndex(t => t.id == tripId);
        if (tripIndex !== -1) {
            if (data.trip) {
                myTrips[tripIndex] = data.trip;
            } else {
                myTrips[tripIndex].status = newStatus;
            }
        }
        
        if (newStatus === 'finished' || newStatus === 'completed') {
            await addTripToHistory(tripId);
        }
        
        await loadTrips();
        toast.success(`Статус змінено на "${getStatusText(newStatus)}"`);
        
    } catch (error) {
        toast.error('Не вдалося змінити статус');
    }
}

/**
 * Adds trip to history when finished
 */
async function addTripToHistory(tripId) {
    try {
        const existingTrip = myTrips.find(t => t.id == tripId);
        
        if (!existingTrip) return;
        
        const status = existingTrip.status?.toLowerCase();
        if (status !== 'finished' && status !== 'completed') return;
        
        const existingIndex = myHistory.findIndex(h => h.tripId == tripId);
        if (existingIndex !== -1) {
            const existingEntry = myHistory[existingIndex];
            const updatedEntry = {
                ...existingEntry,
                title: `${existingTrip.city_name || 'Подорож'}`,
                country: getCountryCode(existingTrip.country_name),
                city: existingTrip.city_name,
                year: new Date(existingTrip.start_date || Date.now()).getFullYear(),
                month: getMonthName(new Date(existingTrip.start_date || Date.now()).getMonth()),
                duration: existingTrip.duration_days || existingTrip.days || '7',
                period: formatDateRange(existingTrip.start_date, existingTrip.end_date),
                places: existingTrip.attractions_count ? [`${existingTrip.attractions_count} пам'яток`] : [],
                notes: existingTrip.description || existingTrip.trip_summary || '',
                lastUpdated: new Date().toISOString()
            };
            
            myHistory[existingIndex] = updatedEntry;
            window.storage.set('travelHistory', myHistory);
            return;
        }
        
        const historyEntry = {
            id: Date.now().toString() + '_' + tripId,
            tripId: tripId,
            title: `${existingTrip.city_name || 'Подорож'}`,
            country: getCountryCode(existingTrip.country_name),
            city: existingTrip.city_name,
            year: new Date(existingTrip.start_date || Date.now()).getFullYear(),
            month: getMonthName(new Date(existingTrip.start_date || Date.now()).getMonth()),
            duration: existingTrip.duration_days || existingTrip.days || '7',
            period: formatDateRange(existingTrip.start_date, existingTrip.end_date),
            places: existingTrip.attractions_count ? [`${existingTrip.attractions_count} пам'яток`] : [],
            notes: existingTrip.description || existingTrip.trip_summary || '',
            dateAdded: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
        
        myHistory.unshift(historyEntry);
        window.storage.set('travelHistory', myHistory);
        
        const activeTab = getActiveTab();
        if (activeTab === 'history') {
            renderHistory();
        }
        
    } catch (error) {
        // Silently fail history addition
    }
}

/**
 * Activates a planned trip
 */
async function activatePlannedTrip() {
    if (myFutureTrips.length === 0) {
        toast.error('Немає запланованих поїздок для активації');
        return;
    }
    
    const trip = myFutureTrips[0];
    
    try {
        const data = await api.patch(`/api/trips/${trip.id}/status`, {
            status: 'active'
        });
        
        if (data.success) {
            await loadTrips();
            toast.success(`Поїздку "${trip.city_name}" активовано!`);
        }
    } catch (error) {
        toast.error('Не вдалося активувати поїздку');
    }
}

/**
 * Views trip details
 */
async function viewTripDetails(tripId) {
    try {
        const data = await api.get(`/api/trips/${tripId}`);
        
        if (data.success) {
            window.storage.set('selectedTrip', data.trip);
            window.location.href = `map-journey.html?tripId=${tripId}`;
        }
    } catch (error) {
        toast.error('Не вдалося завантажити деталі');
    }
}

/**
 * Starts navigation mode for trip
 */
async function startNavigation(tripId) {
    try {
        const data = await api.get(`/api/trips/${tripId}`);
        
        if (data.success && data.trip) {
            window.storage.set('navigationTrip', data.trip);
            window.location.href = `map-journey.html?tripId=${tripId}&mode=navigation`;
        }
    } catch (error) {
        toast.error('Не вдалося розпочати навігацію');
    }
}

/**
 * Deletes trip from database
 */
async function deleteTrip(tripId) {
    if (!confirm("Видалити цю поїздку? Запис також буде видалено з історії.")) return;
    
    try {
        const data = await api.delete(`/api/trips/${tripId}`);
        
        if (data.success) {
            myHistory = myHistory.filter(entry => entry.tripId !== tripId.toString());
            window.storage.set('travelHistory', myHistory);
            
            myTrips = myTrips.filter(t => t.id != tripId);
            myFutureTrips = myFutureTrips.filter(t => t.id != tripId);
            
            const activeTab = getActiveTab();
            renderTripsByTab(activeTab);
            
            toast.success('Поїздку видалено');
        } else {
            toast.error('Помилка: ' + (data.error || 'Невідома помилка'));
        }
    } catch (error) {
        toast.error('Помилка видалення');
    }
}

/**
 * Removes entry from history
 */
function removeFromHistory(historyId) {
    if (!confirm("Видалити цей запис з історії?")) return;
    
    myHistory = myHistory.filter(entry => entry.id !== historyId);
    window.storage.set('travelHistory', myHistory);
    renderHistory();
    toast.success('Запис видалено з історії');
}

/**
 * Creates similar trip based on history entry
 */
async function createSimilarTrip(tripId) {
    try {
        const data = await api.get(`/api/trips/${tripId}`);
        
        if (data.success && data.trip) {
            window.storage.set('similarTripTemplate', data.trip);
            window.location.href = 'map-journey.html?duplicate=true';
        }
    } catch (error) {
        toast.error('Не вдалося створити подібну поїздку');
    }
}

/**
 * Shows history entry details in modal
 */
function showHistoryDetails(historyId) {
    const entry = myHistory.find(h => h.id === historyId);
    if (!entry) return;
    
    const modalContent = `
        <div class="modal-header">
            <h2>${entry.title}</h2>
            <button class="modal-close" onclick="closeModal()">&times;</button>
        </div>
        <div class="modal-body">
            <div class="history-detail-full">
                <div class="detail-row">
                    <strong>Країна:</strong> ${getCountryName(entry.country)}
                </div>
                <div class="detail-row">
                    <strong>Місто:</strong> ${entry.city || 'Не вказано'}
                </div>
                <div class="detail-row">
                    <strong>Тривалість:</strong> ${entry.duration} днів
                </div>
                <div class="detail-row">
                    <strong>Період:</strong> ${entry.period}
                </div>
                ${entry.notes ? `
                    <div class="detail-row">
                        <strong>Нотатки:</strong> ${entry.notes}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    if (window.showModal) {
        window.showModal(modalContent);
    }
}

/**
 * Initializes tab functionality
 * Automatically switches to tab based on filter from account page
 */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const filter = window.storage.get('myTripsFilter');
    if (filter) {
        const targetTab = filter === 'past' ? 'history' : filter;
        const targetBtn = document.querySelector(`.tab-btn[data-tab="${targetTab}"]`);
        const targetContent = document.querySelector(`.tab-content[data-content="${targetTab}"]`);
        
        if (targetBtn && targetContent) {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            targetBtn.classList.add('active');
            targetContent.classList.add('active');
            
            window.storage.remove('myTripsFilter');
        }
    }
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.dataset.content === tab) {
                    content.classList.add('active');
                    renderTripsByTab(tab);
                }
            });
        });
    });
}

// Основна ініціалізація
document.addEventListener('DOMContentLoaded', async () => {
    // Проста перевірка - чи є токен
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        console.log('No auth data, redirecting to login');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // Завантажуємо дані - сервер сам поверне помилку якщо токен невалідний
        await loadTrips();
        initTabs();
        
    } catch (error) {
        console.error('Failed to load trips:', error);
        
        // Тільки при 401/403 очищаємо
        if (error.message.includes('401') || error.message.includes('403')) {
            localStorage.clear();
            window.location.href = 'index.html';
        }
        // При інших помилках - не очищаємо токен
    }
});

// Експорт функцій для глобального використання
window.deleteTrip = deleteTrip;
window.viewTripDetails = viewTripDetails;
window.handleStatusChange = handleStatusChange;
window.removeFromHistory = removeFromHistory;
window.showHistoryDetails = showHistoryDetails;
window.createSimilarTrip = createSimilarTrip;
window.startNavigation = startNavigation;
window.activatePlannedTrip = activatePlannedTrip;
window.viewHistoryTrip = viewHistoryTrip;