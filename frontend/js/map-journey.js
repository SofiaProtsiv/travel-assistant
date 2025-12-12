/**
 * Map Journey Module
 * Interactive map-based trip planning with Leaflet integration
 * Handles attraction selection, route visualization, and trip persistence
 */

let currentPlan = storage.get('currentPlan', []);
let selectedDay = 1;
let map;
let cityMarkers = [];
let attractionMarkers = [];
let routeControls = [];
let planMarkers = [];
let currentTripId = null;

/**
 * API helper functions using centralized API utility
 */
async function loadCities() { 
    return await api.get('/api/cities'); 
}

async function loadCity(cityId) { 
    return await api.get(`/api/cities/${cityId}`); 
}

async function loadAttractions(cityId) { 
    return await api.get(`/api/cities/${cityId}/attractions`); 
}

async function loadTrip(tripId) { 
    return await api.get(`/api/trips/${tripId}`); 
}

/**
 * Extracts trip ID from URL query parameters
 */
function getTripIdFromURL() {
    const tripId = url.getParam('tripId');
    return tripId ? parseInt(tripId) : null;
}

/**
 * Restores trip data from database and populates the map
 */
async function restoreTrip(tripId) {
    try {
        const response = await loadTrip(tripId);
        
        if (!response.success || !response.trip) {
            throw new Error('Поїздку не знайдено');
        }
        
        const trip = response.trip;
        currentTripId = tripId;
        storage.set('currentTripId', tripId);
        
        const cityId = trip.city_id;
        storage.set('selectedCityId', cityId);
        
        const city = await loadCity(cityId);
        const cities = await loadCities();
        
        currentPlan = [];
        if (trip.attractions && typeof trip.attractions === 'object') {
            Object.keys(trip.attractions).forEach(day => {
                const dayAttractions = trip.attractions[day];
                dayAttractions.forEach(att => {
                    // ОНОВЛЕНО: Додаємо is_visited з сервера
                    currentPlan.push({
                        id: att.attraction_id,
                        place: att.name,
                        lat: parseFloat(att.lat),
                        lng: parseFloat(att.lng),
                        description: att.description || '',
                        day: parseInt(day),
                        ticket_price: parseFloat(att.ticket_price || 0),
                        transport_cost: parseFloat(att.transport_cost || 0),
                        avg_visit_time: parseInt(att.avg_visit_time || 0),
                        // ОНОВЛЕНО: Беремо is_visited з серверних даних
                        is_visited: att.is_visited === 1 || att.is_visited === true || false
                    });
                });
            });
            
            currentPlan.sort((a, b) => {
                if (a.day !== b.day) return a.day - b.day;
                return 0;
            });
            
            if (currentPlan.length > 0) {
                selectedDay = currentPlan[0].day || 1;
            }
        }
        
        storage.set('currentPlan', currentPlan);
        
        const attractions = await loadAttractions(cityId);
        
        renderCityList(cities);
        setupMap(city);
        renderAttractions(attractions);
        
        const cityNameEl = document.getElementById('cityName');
        const planCityEl = document.getElementById('planCity');
        const countryNameEl = document.getElementById('countryName');
        
        if (cityNameEl) cityNameEl.textContent = city.name;
        if (planCityEl) planCityEl.textContent = city.name;
        if (countryNameEl && trip.country_name) {
            countryNameEl.textContent = trip.country_name;
        }
        
        if (trip.status) {
            updateTripStatusBadge(trip.status);
        }
        
        // ОНОВЛЕНО: Передаємо visited_count для відображення
        if (trip.visited_count !== undefined) {
            const statsPlaces = document.getElementById('statsPlaces');
            if (statsPlaces) {
                statsPlaces.textContent = `${currentPlan.length} пам'яток (${trip.visited_count} відвідано)`;
            }
        }
        
        renderPlanItems();
        renderTripSummary(trip);
        setupUI();
        updateBudget();
        
        setTimeout(() => {
            if (window.syncWithMapJourney) window.syncWithMapJourney();
            if (window.fetchBudgetFromServer) window.fetchBudgetFromServer();
            renderPlanRoute();
        }, 1500);
        
        toast.success('Поїздку відновлено');
        return true;
    } catch (error) {
        toast.error('Не вдалося відновити поїздку: ' + error.message);
        return false;
    }
}

/**
 * Initializes the map journey page
 * Handles trip restoration, city selection, and data loading
 */
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const refreshParam = urlParams.get('refresh');
    const storedCityId = storage.get('selectedCityId');
    const storedTripId = storage.get('currentTripId');
    const tripId = getTripIdFromURL();
    
    if (!tripId && refreshParam) {
        const currentPlanData = storage.get('currentPlan', []);
        if (currentPlanData.length > 0 && currentPlanData[0].city_id) {
            const planCityId = currentPlanData[0].city_id;
            if (planCityId.toString() !== storedCityId) {
                storage.remove("currentPlan");
                storage.remove("currentTripId");
            }
        }
    }
    
    if (tripId) {
        const restored = await restoreTrip(tripId);
        if (restored) return;
    }
    
    if (storedTripId && !tripId) {
        storage.remove('currentTripId');
        currentTripId = null;
    }
    
    try {
        const cities = await loadCities();
        let cityId = parseInt(storedCityId);
        
        const cityExists = cities.some(city => city.id === cityId);
        
        if (!cityId || isNaN(cityId) || !cityExists) {
            cityId = cities[0]?.id;
            storage.set('selectedCityId', cityId);
        }
        
        try {
            const city = await loadCity(cityId);
            const attractions = await loadAttractions(cityId);
            
            renderCityList(cities);
            setupMap(city);
            renderAttractions(attractions);
            
            const cityNameEl = document.getElementById('cityName');
            const planCityEl = document.getElementById('planCity');
            
            if (cityNameEl) cityNameEl.textContent = city.name;
            if (planCityEl) planCityEl.textContent = city.name;
            
            setupUI();
            renderPlanItems();
            updateBudget();

            setTimeout(() => {
                if (window.syncWithMapJourney) window.syncWithMapJourney();
            }, 1000);
            
        } catch (cityError) {
            if (cityId !== cities[0]?.id) {
                const firstCityId = cities[0]?.id;
                if (firstCityId) {
                    storage.set('selectedCityId', firstCityId);
                    location.reload();
                    return;
                }
            }
            throw cityError;
        }
        
    } catch (err) {
        const errorHtml = `
            <div style="padding:30px; text-align:center; background:#fff3cd; border:1px solid #ffeaa7; border-radius:8px; margin:20px;">
                <h3 style="color:#856404;">⚠️ Помилка завантаження</h3>
                <p style="color:#856404;">Не вдалося завантажити мапу. Перевірте підключення до сервера.</p>
                <p><small>${err.message}</small></p>
                <button onclick="location.reload()" class="btn btn-primary" style="margin-top:10px;">
                    Спробувати знову
                </button>
                <button onclick="window.location.href='dashboard.html'" class="btn btn-outline" style="margin-top:10px; margin-left:10px;">
                    Повернутися на дашборд
                </button>
            </div>
        `;
        
        const mainContent = document.querySelector('.journey-main');
        if (mainContent) {
            mainContent.innerHTML = errorHtml;
        }
    }
}

/**
 * Initializes Leaflet map with city center and tile layer
 */
function setupMap(city) {
    if (map) {
        map.remove();
        map = null;
    }

    const center = [parseFloat(city.lat), parseFloat(city.lng)];
    map = L.map('cityMap').setView(center, 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        maxZoom: 19
    }).addTo(map);

    const cityIcon = L.circleMarker(center, {
        radius: 8,
        fillColor: '#7C5DF9',
        color: '#7C5DF9',
        fillOpacity: 0.9
    }).addTo(map);
    
    cityIcon.bindPopup(`<b>${city.name}</b>`);

    cityMarkers.forEach(m => map.removeLayer(m));
    attractionMarkers.forEach(m => map.removeLayer(m));
    routeControls.forEach(r => map.removeControl(r));

    cityMarkers = [];
    attractionMarkers = [];
    routeControls = [];
}

/**
 * Renders city list in sidebar
 */
function renderCityList(cities) {
    const container = document.getElementById('placesList');
    if (!container) return;
    
    container.innerHTML = '';

    cities.forEach(c => {
        const el = document.createElement('div');
        el.className = 'place-row';
        el.innerHTML = `<strong>${c.name}</strong> <span class="text-muted">(${c.is_capital ? 'Столиця' : 'Місто'})</span>`;
        el.style.cursor = 'pointer';
        
        el.addEventListener('click', async () => {
            const currentCityId = storage.get('selectedCityId');
            if (currentCityId && currentCityId !== c.id.toString()) {
                storage.remove("currentPlan");
                storage.remove("currentTripId");
            }
            
            storage.set('selectedCityId', c.id);
            const city = await loadCity(c.id);
            setupMap(city);
            const attractions = await loadAttractions(c.id);
            renderAttractions(attractions);
            
            const cityNameEl = document.getElementById('cityName');
            const planCityEl = document.getElementById('planCity');
            
            if (cityNameEl) cityNameEl.textContent = city.name;
            if (planCityEl) planCityEl.textContent = city.name;
            updateBudget();
        });
        
        container.appendChild(el);
    });
}

/**
 * Renders attractions on map and in sidebar list
 */
function renderAttractions(attractions) {
    attractionMarkers.forEach(m => map.removeLayer(m));
    attractionMarkers = [];

    const placesList = document.getElementById('placesList');
    if (placesList) placesList.innerHTML = '';

    attractions.forEach(item => {
        if (!item.lat || !item.lng) return;

        const marker = L.marker([parseFloat(item.lat), parseFloat(item.lng)]).addTo(map);

        const popupHtml = `
            <b>${escapeHtml(item.name)}</b><br>
            ${escapeHtml(item.description || '')}<br>
            <button class="btn-add-plan"
                onclick='handleAddPlace({
                    id:${item.id},
                    name:"${escapeHtml(item.name)}",
                    ticket_price:${item.ticket_price},
                    transport_cost:${item.transport_cost},
                    avg_visit_time:${item.avg_visit_time},
                    lat:${item.lat},
                    lng:${item.lng}
                })'>
                Додати в план
            </button>
        `;

        marker.bindPopup(popupHtml);
        attractionMarkers.push(marker);

        if (placesList) {
            const div = document.createElement('div');
            div.className = 'place-row';
            div.innerHTML = `<strong>${item.name}</strong><div class="text-muted">${item.description || ''}</div>`;
            div.addEventListener('click', () => {
                map.setView([parseFloat(item.lat), parseFloat(item.lng)], 15);
                marker.openPopup();
            });
            placesList.appendChild(div);
        }
    });
}

/**
 * Escapes HTML to prevent XSS attacks
 */
function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, s => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[s]));
}

/**
 * Updates budget display by fetching from API
 */
function updateBudget() {
    const cityId = parseInt(storage.get('selectedCityId'), 10);
    if (!cityId) return;

    const placeIds = currentPlan.map(p => p.id).filter(id => id != null);
    const days = new Set(currentPlan.map(p => p.day || 1)).size || 1;

    if (placeIds.length === 0) {
        const budgetAttractions = document.getElementById('budgetAttractions');
        const budgetHousing = document.getElementById('budgetHousing');
        const budgetTotal = document.getElementById('budgetTotal');
        
        if (budgetAttractions) budgetAttractions.textContent = '0 €';
        if (budgetHousing) budgetHousing.textContent = '0 €';
        if (budgetTotal) budgetTotal.textContent = '0 €';
        return;
    }

    const query = new URLSearchParams({
        cityId: cityId.toString(),
        places: placeIds.join(','),
        days: days.toString()
    });

    api.get(`/api/plan-budget?${query.toString()}`)
        .then(data => {
            const budgetAttractions = document.getElementById('budgetAttractions');
            const budgetHousing = document.getElementById('budgetHousing');
            const budgetTotal = document.getElementById('budgetTotal');
            
            if (budgetAttractions) budgetAttractions.textContent = Number(data.attractions || 0).toFixed(2) + ' €';
            if (budgetHousing) budgetHousing.textContent = Number(data.housing || 0).toFixed(2) + ' €';
            if (budgetTotal) budgetTotal.textContent = Number(data.total || 0).toFixed(2) + ' €';
            
            if (window.syncWithMapJourney) {
                window.syncWithMapJourney();
            }
        })
        .catch(err => {
            toast.error('Помилка розрахунку бюджету');
        });
}

/**
 * Adds attraction to current plan
 */
function addToPlan(item) {
    if (currentPlan.some(p => p.place === item.place && p.day === item.day)) {
        toast.info('Вже в плані');
        return;
    }
    
    currentPlan.push(item);
    storage.set('currentPlan', currentPlan);
    toast.success('Додано');
    renderPlanItems();
    updateBudget();

    if (window.syncWithMapJourney) {
        window.syncWithMapJourney();
    }
}

/**
 * Handler for adding place from map popup
 */
function handleAddPlace(item) {
    addToPlan({
        id: item.id,
        place: item.name,
        lat: item.lat,
        lng: item.lng,
        description: item.description || "",
        day: selectedDay,
        ticket_price: item.ticket_price || 0,
        transport_cost: item.transport_cost || 0,
        avg_visit_time: item.avg_visit_time || 0
    });
}

/**
 * Removes attraction from plan
 */
function removeFromPlan(placeName, day) {
    currentPlan = currentPlan.filter(p => !(p.place === placeName && p.day === day));
    storage.set('currentPlan', currentPlan);
    renderPlanItems();
    updateBudget();

    if (window.syncWithMapJourney) {
        window.syncWithMapJourney();
    }
}

/**
 * Returns color for day visualization
 */
function getColorForDay(day) {
    const colors = ['#FF5A5F', '#7C5DF9', '#00BFA5', '#FFB400', '#FF6F61', '#6A1B9A'];
    return colors[(day - 1) % colors.length];
}

/**
 * Renders route visualization on map with day-based coloring
 */
function renderPlanRoute() {
    if (!map) return;

    routeControls.forEach(r => map.removeControl(r));
    routeControls = [];
    planMarkers.forEach(m => map.removeLayer(m));
    planMarkers = [];

    let dayCounters = {};

    currentPlan.forEach(p => {
        const lat = parseFloat(p.lat);
        const lng = parseFloat(p.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const day = p.day || 1;
        dayCounters[day] = (dayCounters[day] || 0) + 1;
        const num = dayCounters[day];
        
        const isVisited = p.is_visited === true || p.is_visited === 1;
        const baseColor = getColorForDay(day);
        const markerColor = isVisited ? '#10b981' : baseColor;
        const markerStyle = isVisited 
            ? `background-color: ${markerColor}; border: 2px solid #059669; opacity: 0.9;`
            : `background-color: ${markerColor};`;

        const icon = L.divIcon({
            className: 'numbered-marker',
            html: `<div class="marker-badge" style="${markerStyle}">${isVisited ? '✓' : num}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        const visitedText = isVisited ? '<br><span style="color: #10b981; font-weight: bold;">✅ Відвідано</span>' : '';
        marker.bindPopup(`<b>${escapeHtml(p.place)}</b>${visitedText}<br>${escapeHtml(p.description || '')}<br><i>День ${day}</i>`);
        planMarkers.push(marker);
    });

    const allDays = [...new Set(currentPlan.map(p => p.day || 1))].sort((a, b) => a - b);
    
    allDays.forEach(day => {
        const placesForDay = currentPlan.filter(p => (p.day || 1) === day);
        if (placesForDay.length > 1) {
            const waypoints = placesForDay.map(p => L.latLng(parseFloat(p.lat), parseFloat(p.lng)));
            const isSelectedDay = day === selectedDay;
            
            const routeControl = L.Routing.control({
                waypoints,
                router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
                lineOptions: { 
                    styles: [{
                        color: getColorForDay(day), 
                        weight: isSelectedDay ? 6 : 4, 
                        opacity: isSelectedDay ? 0.9 : 0.5
                    }] 
                },
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: false,
                show: false
            }).addTo(map);
            
            routeControls.push(routeControl);
        }
    });

    const allMarkers = attractionMarkers.concat(planMarkers);
    if (allMarkers.length > 0) {
        const group = new L.featureGroup(allMarkers);
        map.fitBounds(group.getBounds().pad(0.2));
    }
}

/**
 * Renders plan items in sidebar with visit tracking
 */
function renderPlanItems() {
    const planItems = document.getElementById('planItems');
    if (!planItems) return;

    planItems.innerHTML = '';
    
    const statsPlaces = document.getElementById('statsPlaces');
    const planCount = document.getElementById('planCount');
    const visitedCount = currentPlan.filter(p => p.is_visited).length;
    const notVisitedCount = currentPlan.length - visitedCount;
    
    if (statsPlaces) {
        statsPlaces.textContent = `${currentPlan.length} пам'яток (${visitedCount} відвідано)`;
    }
    
    if (planCount) {
        planCount.textContent = `${notVisitedCount} місць для відвідування`;
    }
    
    const planDaysEl = document.getElementById('planDays');
    if (planDaysEl) {
        const uniqueDays = new Set(currentPlan.map(p => p.day || 1));
        planDaysEl.textContent = uniqueDays.size || 0;
    }

    currentPlan.forEach((place, index) => {
        const div = document.createElement('div');
        div.className = 'plan-item';
        
        if (place.is_visited) {
            div.classList.add('plan-item-visited');
        }

        const numberDiv = document.createElement('div');
        numberDiv.className = 'plan-item-number';
        numberDiv.textContent = `${index + 1} (День ${place.day || 1})`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'plan-item-content';
        contentDiv.innerHTML = `
            <h4>${escapeHtml(place.place)} ${place.is_visited ? '✅' : ''}</h4>
            <p class="text-muted">${escapeHtml(place.description || '')}</p>
        `;

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'plan-item-actions';
        actionsDiv.style.cssText = 'display: flex; gap: 8px; align-items: center;';

        if (currentTripId) {
            const visitedCheckbox = document.createElement('input');
            visitedCheckbox.type = 'checkbox';
            visitedCheckbox.checked = place.is_visited || false;
            visitedCheckbox.className = 'visited-checkbox';
            visitedCheckbox.title = place.is_visited ? 'Позначено як відвідану' : 'Позначити як відвідану';
            visitedCheckbox.addEventListener('change', async (e) => {
                await markAttractionVisited(place.id, e.target.checked);
            });
            actionsDiv.appendChild(visitedCheckbox);
            
            const visitedLabel = document.createElement('label');
            visitedLabel.textContent = 'Відвідано';
            visitedLabel.style.cssText = 'font-size: 12px; cursor: pointer;';
            visitedLabel.addEventListener('click', () => visitedCheckbox.click());
            actionsDiv.appendChild(visitedLabel);
        }

        const btn = document.createElement('button');
        btn.className = 'btn-remove-plan';
        btn.textContent = 'Видалити';
        btn.addEventListener('click', () => {
            removeFromPlan(place.place, place.day);
            renderPlanRoute();
        });
        actionsDiv.appendChild(btn);

        div.appendChild(numberDiv);
        div.appendChild(contentDiv);
        div.appendChild(actionsDiv);
        planItems.appendChild(div);
    });

    renderPlanRoute();
}

/**
 * Renders trip summary in sidebar
 */
function renderTripSummary(trip) {
    if (!trip) return;
    const sidebar = document.querySelector('.journey-sidebar .card.card-gradient');
    if (!sidebar) return;
    
    let summaryBlock = sidebar.querySelector('#tripSummaryBlock');
    if (!summaryBlock) {
        summaryBlock = document.createElement('div');
        summaryBlock.id = 'tripSummaryBlock';
        summaryBlock.style.marginTop = '10px';
        sidebar.insertBefore(summaryBlock, sidebar.firstChild.nextSibling);
    }
}

/**
 * Saves trip to database with all attractions
 */
async function saveTripToDatabase() {
    const cityId = parseInt(storage.get('selectedCityId'), 10);
    
    if (!cityId) {
        toast.error('Оберіть місто на карті');
        return;
    }
    
    if (currentPlan.length === 0) {
        toast.error('Додайте хоча б одну пам\'ятку до плану');
        return;
    }
    
    try {
        const city = await loadCity(cityId);
        const existingTripId = currentTripId || storage.get('currentTripId');
        
        // Створюємо об'єкт для відправки на сервер
        const tripData = {
            city_id: cityId,
            country_id: city.country_id,
            start_date: null,
            end_date: null,
            status: 'planned',
            // Додаємо інформацію про відвідування
            attractions: currentPlan.map((place, index) => ({
                id: place.id,
                name: place.place,
                lat: place.lat,
                lng: place.lng,
                day: place.day || 1,
                order: index + 1,
                is_visited: place.is_visited || false, // ЦЕ НОВЕ
                ticket_price: place.ticket_price || 0,
                transport_cost: place.transport_cost || 0,
                avg_visit_time: place.avg_visit_time || 0
            }))
        };
        
        if (existingTripId) {
            // Оновлюємо існуючу поїздку
            const updateResult = await api.patch(`/api/trips/${existingTripId}`, {
                attractions: tripData.attractions // Відправляємо всі дані про пам'ятки
            });
            
            if (!updateResult.success) {
                throw new Error(updateResult.error || 'Невідома помилка оновлення');
            }
            
            // Оновлюємо visited_count на сервері
            const visitedCount = currentPlan.filter(p => p.is_visited).length;
            await api.patch(`/api/trips/${existingTripId}/visited-count`, {
                visited_count: visitedCount
            });
            
            toast.success(`Поїздку оновлено! Відвідано: ${visitedCount} з ${currentPlan.length}`);
            
            setTimeout(() => {
                window.location.href = 'my-trips.html';
            }, 1500);
            
            return;
            
        } else {
            // Створюємо нову поїздку
            const result = await api.post('/api/trips', tripData);
            
            if (!result.success) {
                throw new Error(result.error || 'Невідома помилка сервера');
            }
            
            if (result.tripId) {
                currentTripId = result.tripId;
                storage.set('currentTripId', result.tripId);
            }
            
            toast.success(`Поїздку збережено! ID: ${result.tripId}`);
            
            renderPlanItems();
            updateBudget();
            
            setTimeout(() => {
                window.location.href = 'my-trips.html';
            }, 1500);
        }
        
    } catch (error) {
        console.error('Save trip error:', error);
        
        // Локальне збереження як запасний варіант
        const saved = storage.get('myPlans', []);
        saved.push({
            id: Date.now(),
            city: document.getElementById('cityName')?.textContent || 'Unknown',
            places: currentPlan.slice(),
            date: new Date().toISOString().split('T')[0],
            status: 'planned'
        });
        storage.set('myPlans', saved);
        
        toast.success('Поїздку збережено локально (офлайн)');
        
        renderPlanItems();
        updateBudget();
        
        setTimeout(() => {
            window.location.href = 'my-trips.html';
        }, 1500);
    }
}

/**
 * Marks attraction as visited/unvisited
 */
async function markAttractionVisited(attractionId, isVisited) {
    if (!currentTripId) {
        toast.error('Спочатку збережіть поїздку');
        return;
    }
    
    try {
        const data = await api.patch(`/api/trips/${currentTripId}/attractions/${attractionId}/visited`, {
            is_visited: isVisited
        });
        
        if (!data.success) {
            throw new Error(data.error || 'Помилка оновлення статусу');
        }
        
        const place = currentPlan.find(p => p.id === attractionId);
        if (place) {
            place.is_visited = isVisited;
            storage.set('currentPlan', currentPlan);
            renderPlanItems();
        }
        
        toast.success(isVisited ? 'Пам\'ятку позначено як відвідану' : 'Пам\'ятку позначено як невідвідану');
    } catch (error) {
        toast.error('Не вдалося оновити статус: ' + error.message);
    }
}

/**
 * Updates trip status (planned/active/finished)
 */
async function updateTripStatus(newStatus) {
    if (!currentTripId) {
        toast.error('Спочатку збережіть поїздку');
        return;
    }
    
    try {
        const data = await api.patch(`/api/trips/${currentTripId}/status`, {
            status: newStatus
        });
        
        if (!data.success) {
            throw new Error(data.error || 'Помилка оновлення статусу');
        }
        
        toast.success(`Статус поїздки оновлено на "${getStatusText(newStatus)}"`);
        updateTripStatusBadge(newStatus);
        
        if (newStatus === 'finished') {
            setTimeout(() => {
                if (confirm('Поїздку завершено! Перейти до списку поїздок?')) {
                    window.location.href = 'my-trips.html';
                }
            }, 1000);
        }
    } catch (error) {
        toast.error('Не вдалося оновити статус: ' + error.message);
    }
}

/**
 * Returns localized status text
 */
function getStatusText(status) {
    const statusMap = {
        'planned': 'Заплановано',
        'active': 'В процесі',
        'finished': 'Завершено'
    };
    return statusMap[status] || status;
}

/**
 * Updates status badge in UI
 */
function updateTripStatusBadge(status) {
    const badge = document.getElementById('tripStatusBadge') || document.querySelector('.section-header-row .badge');
    if (badge) {
        badge.textContent = getStatusText(status);
        badge.className = `badge badge-${status === 'finished' ? 'success' : status === 'active' ? 'warning' : 'primary'}`;
        badge.id = 'tripStatusBadge';
    }
}

/**
 * Sets up UI controls and event listeners
 */
function setupUI() {
    const daySelect = document.querySelector('#daySelect') || document.getElementById('planDaySelector');
    
    if (daySelect) {
        daySelect.value = selectedDay;
        
        const maxDay = Math.max(...currentPlan.map(p => p.day || 1), 1);
        const currentOptions = daySelect.querySelectorAll('option');
        const currentMax = currentOptions.length;
        
        if (maxDay > currentMax) {
            for (let i = currentMax + 1; i <= maxDay; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                daySelect.appendChild(option);
            }
        }
        
        daySelect.addEventListener('change', (e) => {
            selectedDay = parseInt(e.target.value, 10);
            renderPlanRoute();
        });
    }

    const confirmBtn = document.getElementById('confirmPlanBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            if (currentPlan.length === 0) {
                toast.error('Додайте хоча б одну пам\'ятку');
                return;
            }
            await saveTripToDatabase();
        });
    }
    
    if (currentTripId) {
        setupTripStatusControls();
    }
}

/**
 * Sets up trip status control buttons
 */
function setupTripStatusControls() {
    const planCard = document.querySelector('.card.card-gradient');
    if (!planCard || document.getElementById('tripStatusControls')) return;
    
    const statusControls = document.createElement('div');
    statusControls.id = 'tripStatusControls';
    statusControls.style.cssText = 'margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);';
    
    statusControls.innerHTML = `
        <h4 style="margin-bottom: 10px; font-size: 14px; color: rgba(255,255,255,0.9);">Статус поїздки:</h4>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-outline btn-sm" id="markActiveBtn" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.3);">
                В процесі
            </button>
            <button class="btn btn-outline btn-sm" id="markFinishedBtn" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.3);">
                Завершити
            </button>
            <button class="btn btn-outline btn-sm" id="markPlannedBtn" style="background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.3);">
                Відкласти
            </button>
        </div>
    `;
    
    planCard.appendChild(statusControls);
    
    const markActiveBtn = document.getElementById('markActiveBtn');
    const markFinishedBtn = document.getElementById('markFinishedBtn');
    const markPlannedBtn = document.getElementById('markPlannedBtn');
    
    if (markActiveBtn) markActiveBtn.addEventListener('click', () => updateTripStatus('active'));
    if (markFinishedBtn) {
        markFinishedBtn.addEventListener('click', async () => {
            if (confirm('Завершити поїздку? Всі пам\'ятки будуть позначені як відвідані.')) {
                const promises = currentPlan
                    .filter(place => !place.is_visited)
                    .map(place => markAttractionVisited(place.id, true));
                
                await Promise.all(promises);
                await updateTripStatus('finished');
            }
        });
    }
    if (markPlannedBtn) markPlannedBtn.addEventListener('click', () => updateTripStatus('planned'));
}

document.addEventListener('DOMContentLoaded', init);
