/**
 * Plan Recommendation Module
 * Generates intelligent travel plans based on city data, attractions, and budget preferences
 */

let selectedCountry = '';
let selectedCity = '';
let generatedPlan = [];
let cityData = null;
let attractionsData = [];
let estimatedBudget = {
    total: 0,
    breakdown: {
        accommodation: 0,
        food: 0,
        transport: 0,
        attractions: 0,
        shopping: 0
    }
};

/**
 * Loads countries and cities from API with fallback to hardcoded data
 */
async function loadCountriesAndCities() {
    try {
        const countries = await api.get('/api/countries');
        populateCountries(countries);
    } catch (error) {
        loadHardcodedCountries();
    }
}

/**
 * Fallback: Loads hardcoded country/city data when API is unavailable
 */
function loadHardcodedCountries() {
    const hardcodedCountries = {
        "Франція": ["Париж", "Ліон", "Марсель", "Ніцца"],
        "Німеччина": ["Берлін", "Мюнхен", "Гамбург", "Франкфурт"],
        "Італія": ["Рим", "Мілан", "Венеція", "Флоренція"],
        "Іспанія": ["Мадрид", "Барселона", "Севілья", "Валенсія"],
        "Велика Британія": ["Лондон", "Единбург", "Манчестер", "Ліверпуль"],
        "Нідерланди": ["Амстердам", "Роттердам", "Гаага", "Утрехт"],
        "Польща": ["Варшава", "Краків", "Гданськ", "Вроцлав"],
        "Чехія": ["Прага", "Брно", "Острава"]
    };
    
    const countriesArray = Object.keys(hardcodedCountries).map(countryName => ({
        id: Math.random(),
        name: countryName,
        cities: hardcodedCountries[countryName].map(cityName => ({
            id: Math.random(),
            name: cityName,
            is_capital: cityName === 'Париж' || cityName === 'Лондон' || cityName === 'Рим'
        }))
    }));
    
    populateCountries(countriesArray);
}

/**
 * Populates country dropdown with available countries
 */
function populateCountries(countries) {
    const countrySelect = document.getElementById('countrySelect');
    if (!countrySelect) return;
    
    countrySelect.innerHTML = '<option value="">Оберіть країну</option>';
    
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.id;
        option.textContent = country.name;
        option.dataset.cities = JSON.stringify(country.cities || []);
        countrySelect.appendChild(option);
    });
}

/**
 * Updates city dropdown based on selected country
 */
function updateCities(countryId) {
    const citySelect = document.getElementById('citySelect');
    const countrySelect = document.getElementById('countrySelect');
    
    if (!citySelect || !countrySelect || !countryId) return;
    
    citySelect.innerHTML = '<option value="">Оберіть місто</option>';
    citySelect.disabled = true;
    
    const selectedOption = countrySelect.options[countrySelect.selectedIndex];
    if (!selectedOption) return;
    
    const cities = JSON.parse(selectedOption.dataset.cities || '[]');
    
    if (cities.length > 0) {
        citySelect.disabled = false;
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.id;
            option.textContent = city.name;
            citySelect.appendChild(option);
        });
    } else {
        loadCitiesFromAPI(countryId);
    }
}

/**
 * Loads cities from API when not available in dropdown data
 */
async function loadCitiesFromAPI(countryId) {
    try {
        const cities = await api.get(`/api/cities?countryId=${countryId}`);
        const citySelect = document.getElementById('citySelect');
        
        if (cities.length > 0 && citySelect) {
            citySelect.disabled = false;
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        }
    } catch (error) {
        toast.error('Не вдалося завантажити міста');
    }
}

/**
 * Fetches comprehensive city details including budget data, ratings, and attractions
 */
async function getCityDetails(cityId) {
    try {
        const data = await api.get(`/api/cities/${cityId}/full-details`);
        if (!data.success) {
            throw new Error(data.error || 'Помилка отримання даних');
        }
        return data;
    } catch (error) {
        try {
            const city = await api.get(`/api/cities/${cityId}`);
            const attractions = await api.get(`/api/cities/${cityId}/attractions`);
            
            return {
                success: true,
                city: {
                    ...city,
                    budget_data: {
                        tier: 'medium',
                        accommodation_per_day: city.avg_hotel_price || 60,
                        food_per_day: 30,
                        transport_per_day: 10,
                        attraction_avg_cost: 15,
                        shopping_per_trip: 40
                    },
                    ratings: {
                        safety: 70,
                        food_quality: 60,
                        transport: 65,
                        popularity: 50,
                        nightlife: 55,
                        family_friendly: 60
                    }
                },
                attractions: attractions.map(att => ({
                    ...att,
                    costs: {
                        ticket: att.ticket_price || 0,
                        transport: att.transport_cost || 0,
                        total: (att.ticket_price || 0) + (att.transport_cost || 0)
                    },
                    category: 'landmark'
                }))
            };
        } catch (fallbackError) {
            throw error;
        }
    }
}

/**
 * Generates travel plan based on city data, days, and budget type
 */
async function generatePlan(cityId, countryId, days, budgetType = 'medium') {
    const generateBtn = document.getElementById('generateBtn');
    const generateBtnText = document.getElementById('generateBtnText');

    if (!generateBtn || !generateBtnText) return;
    
    generateBtn.disabled = true;
    generateBtnText.textContent = 'Генерується...';

    try {
        const cityDetails = await getCityDetails(cityId);
        
        if (!cityDetails.success) {
            throw new Error(cityDetails.error || 'Не вдалося отримати дані міста');
        }
        
        cityData = cityDetails.city;
        attractionsData = cityDetails.attractions || [];
        
        calculateBudget(days, budgetType);
        generatedPlan = createDailySchedule(days);
        renderPlan();
        
        toast.success(`План для ${cityData.name} створено! Бюджет: €${estimatedBudget.total}`);

    } catch (error) {
        toast.error('Не вдалося згенерувати план: ' + error.message);
    } finally {
        generateBtn.disabled = false;
        generateBtnText.textContent = 'Згенерувати план';
    }
}

/**
 * Calculates budget breakdown based on city data and budget tier
 */
function calculateBudget(days, budgetType) {
    if (!cityData || !cityData.budget_data) {
        cityData = {
            budget_data: {
                accommodation_per_day: 60,
                food_per_day: 30,
                transport_per_day: 10,
                attraction_avg_cost: 15,
                shopping_per_trip: 40
            }
        };
    }
    
    const baseCosts = cityData.budget_data;
    const budgetMultipliers = { 'budget': 0.7, 'medium': 1.0, 'luxury': 1.5 };
    const multiplier = budgetMultipliers[budgetType] || 1.0;
    
    const baseBudget = {
        accommodation: baseCosts.accommodation_per_day * days,
        food: baseCosts.food_per_day * days,
        transport: baseCosts.transport_per_day * days,
        shopping: baseCosts.shopping_per_trip
    };
    
    const attractionsPerDay = 2;
    const totalAttractions = attractionsPerDay * days;
    baseBudget.attractions = baseCosts.attraction_avg_cost * totalAttractions;
    
    estimatedBudget = {
        total: Math.round(
            (baseBudget.accommodation + baseBudget.food + 
             baseBudget.transport + baseBudget.attractions + 
             baseBudget.shopping) * multiplier
        ),
        breakdown: {
            accommodation: Math.round(baseBudget.accommodation * multiplier),
            food: Math.round(baseBudget.food * multiplier),
            transport: Math.round(baseBudget.transport * multiplier),
            attractions: Math.round(baseBudget.attractions * multiplier),
            shopping: Math.round(baseBudget.shopping * multiplier)
        }
    };
}

/**
 * Creates daily schedule with time-based activity distribution
 */
function createDailySchedule(days) {
    if (!attractionsData || attractionsData.length === 0) {
        return [];
    }
    
    const schedule = [];
    const shuffledAttractions = [...attractionsData].sort(() => Math.random() - 0.5);
    const attractionsPerDay = Math.max(2, Math.ceil(shuffledAttractions.length / days));
    
    for (let day = 1; day <= days; day++) {
        const dayAttractions = shuffledAttractions.slice(
            (day - 1) * attractionsPerDay,
            day * attractionsPerDay
        );
        
        const dailyActivities = [];
        let currentTime = 9 * 60;
        
        dayAttractions.forEach((attraction, index) => {
            const duration = attraction.avg_visit_time || 120;
            
            dailyActivities.push({
                time: formatTime(currentTime),
                place: attraction.name,
                description: attraction.description || 'Без опису',
                duration: `${Math.floor(duration / 60)} год ${duration % 60} хв`,
                category: attraction.category || 'landmark',
                cost: attraction.costs?.total || 0
            });
            
            currentTime += duration + 30;
            
            if (index === Math.floor(dayAttractions.length / 2) - 1) {
                dailyActivities.push({
                    time: formatTime(currentTime),
                    place: 'Обід',
                    description: 'Вільний час для обіду',
                    duration: '60 хв',
                    category: 'food',
                    cost: 0
                });
                currentTime += 60;
            }
        });
        
        dailyActivities.push({
            time: formatTime(currentTime),
            place: 'Вільний час',
            description: 'Відпочинок, вечеря, прогулянка',
            duration: '120 хв',
            category: 'free',
            cost: 0
        });
        
        schedule.push({
            day: day,
            activities: dailyActivities
        });
    }
    
    return schedule;
}

/**
 * Renders the complete plan with budget and daily activities
 */
function renderPlan() {
    const generatedPlanEl = document.getElementById('generatedPlan');
    const planDays = document.getElementById('planDays');
    const planSummary = document.getElementById('planSummary');
    const planInfoDetails = document.getElementById('planInfoDetails');
    const budgetSection = document.querySelector('.budget-section');
    
    if (!generatedPlanEl || !planDays) return;
    
    updateCityInfo();
    renderBudget();
    renderPlanDays(planDays);
    
    if (planSummary) {
        planSummary.textContent = generateTripSummary();
    }
    
    if (planInfoDetails) {
        planInfoDetails.innerHTML = `
            <div><strong>Загальний бюджет:</strong> €${estimatedBudget.total}</div>
            <div><strong>Кількість днів:</strong> ${generatedPlan.length}</div>
        `;
    }
    
    if (budgetSection) {
        budgetSection.style.display = 'block';
    }
    
    generatedPlanEl.style.display = 'block';
}

/**
 * Updates city information display
 */
function updateCityInfo() {
    if (!cityData) return;
    
    const previewCity = document.getElementById('previewCity');
    const detailCity = document.getElementById('detailCity');
    const detailCountry = document.getElementById('detailCountry');
    
    if (previewCity) previewCity.textContent = cityData.name;
    if (detailCity) detailCity.textContent = cityData.name;
    if (detailCountry) detailCountry.textContent = cityData.country_name || selectedCountry;
    
    const cityStatus = cityData.status?.overall || 'Середній';
    let statusElement = document.getElementById('cityStatus');
    
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.id = 'cityStatus';
        statusElement.className = 'city-status-section';
        document.querySelector('.plan-details')?.appendChild(statusElement);
    }
    
    statusElement.innerHTML = `
        <div class="city-status-badge">
            📍 Статус: ${cityStatus}
        </div>
        ${cityData.status?.description ? `
            <div class="city-status-desc">
                ${cityData.status.description}
            </div>
        ` : ''}
    `;
}

/**
 * Renders budget breakdown in UI
 */
function renderBudget() {
    const elements = {
        budgetTotal: document.getElementById('budgetTotal'),
        budgetAccommodation: document.getElementById('budgetAccommodation'),
        budgetFood: document.getElementById('budgetFood'),
        budgetTransport: document.getElementById('budgetTransport'),
        budgetAttractions: document.getElementById('budgetAttractions'),
        budgetShopping: document.getElementById('budgetShopping')
    };
    
    if (elements.budgetTotal) elements.budgetTotal.textContent = `€${estimatedBudget.total}`;
    if (elements.budgetAccommodation) elements.budgetAccommodation.textContent = `€${estimatedBudget.breakdown.accommodation}`;
    if (elements.budgetFood) elements.budgetFood.textContent = `€${estimatedBudget.breakdown.food}`;
    if (elements.budgetTransport) elements.budgetTransport.textContent = `€${estimatedBudget.breakdown.transport}`;
    if (elements.budgetAttractions) elements.budgetAttractions.textContent = `€${estimatedBudget.breakdown.attractions}`;
    if (elements.budgetShopping) elements.budgetShopping.textContent = `€${estimatedBudget.breakdown.shopping}`;
}

/**
 * Renders daily plan cards with activities
 */
function renderPlanDays(planDaysElement) {
    planDaysElement.innerHTML = '';
    
    generatedPlan.forEach(dayPlan => {
        const dayCard = document.createElement('div');
        dayCard.className = 'card day-card';

        const activitiesHTML = dayPlan.activities.map(activity => {
            const icon = getIconForCategory(activity.category);
            
            return `
            <div class="activity-item">
                <div class="activity-time">
                    <div class="activity-time-icon">⏰</div>
                    <span>${activity.time}</span>
                    <span class="activity-duration">${activity.duration}</span>
                </div>
                <div class="activity-content">
                    <div class="activity-content-header">
                        <div class="activity-icon">${icon}</div>
                        <h4>${activity.place}</h4>
                        ${activity.cost > 0 ? `<span class="activity-cost">€${activity.cost}</span>` : ''}
                    </div>
                    <p>${activity.description}</p>
                </div>
            </div>
            `;
        }).join('');

        dayCard.innerHTML = `
            <div class="day-header">
                <div class="day-icon">📅</div>
                <div>
                    <h3>День ${dayPlan.day}</h3>
                    <p>${dayPlan.activities.filter(a => a.category !== 'food' && a.category !== 'free').length} пам'яток</p>
                </div>
            </div>
            <div class="day-activities">
                ${activitiesHTML}
            </div>
        `;

        planDaysElement.appendChild(dayCard);
    });
}

/**
 * Formats minutes into HH:MM time string
 */
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Returns emoji icon based on attraction category
 */
function getIconForCategory(category) {
    const icons = {
        'museum': '🏛️',
        'religious': '⛪',
        'park': '🌳',
        'castle': '🏰',
        'square': '🏙️',
        'monument': '🗽',
        'landmark': '📍',
        'food': '🍽️',
        'free': '⏰'
    };
    return icons[category] || '📍';
}

/**
 * Generates trip summary text
 */
function generateTripSummary() {
    if (!generatedPlan || !cityData) return '';
    
    const days = generatedPlan.length;
    let allAttractions = [];
    
    generatedPlan.forEach(day => {
        day.activities.forEach(a => {
            if (a.category !== 'food' && a.category !== 'free') {
                allAttractions.push(a.place);
            }
        });
    });
    
    allAttractions = [...new Set(allAttractions)];
    const topAttractions = allAttractions.slice(0, 3).join(', ');
    
    return `Подорож до ${cityData.name} на ${days} дні(в) включає ${allAttractions.length} пам'ятки. У плані: ${topAttractions}${allAttractions.length > 3 ? ', ...' : ''}`;
}

/**
 * Saves generated plan to trips database
 */
async function savePlanToMyTrips() {
    try {
        const cityId = document.getElementById('citySelect').value;
        const countryId = document.getElementById('countrySelect').value;
        const days = parseInt(document.getElementById('daysInput').value);
        const userId = (window.auth && window.auth.getUserId) ? window.auth.getUserId() : null;
        
        if (!cityId || !countryId || !days) {
            toast.error('Спочатку згенеруйте план!');
            return;
        }
        
        if (!userId) {
            toast.error('Потрібна авторизація для збереження плану');
            setTimeout(() => window.location.href = 'index.html', 1200);
            return;
        }

        const planToSave = {
            user_id: userId,
            city_id: parseInt(cityId),
            country_id: parseInt(countryId),
            start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            end_date: new Date(Date.now() + (7 + days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            total_budget: estimatedBudget.total,
            budget_details: estimatedBudget.breakdown,
            recommended_plan: generatedPlan,
            attractions_count: generatedPlan.reduce((sum, day) => 
                sum + day.activities.filter(a => a.category !== 'food' && a.category !== 'free').length, 0),
            trip_summary: generateTripSummary()
        };
        
        const data = await api.post('/api/trips/with-budget', planToSave);
        
        if (data.success) {
            toast.success('План збережено в My Trips!');
            setTimeout(() => {
                window.location.href = 'my-trips.html';
            }, 1500);
        } else {
            throw new Error(data.error || 'Помилка збереження');
        }
        
    } catch (error) {
        // Handle auth errors gracefully
        if (error.message.includes('401') || error.message.includes('403') || error.status === 401 || error.status === 403) {
            toast.error('Потрібна авторизація для збереження плану. Будь ласка, увійдіть знову.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            toast.error('Не вдалося зберегти план: ' + error.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadCountriesAndCities();
    
    const countrySelect = document.getElementById('countrySelect');
    const citySelect = document.getElementById('citySelect');
    const planForm = document.getElementById('planForm');
    const budgetTypeSelect = document.getElementById('budgetType');
    const daysInput = document.getElementById('daysInput');
    const savePlanBtn = document.getElementById('savePlanBtn');

    if (!countrySelect || !citySelect || !planForm || !daysInput) return;

    countrySelect.addEventListener('change', e => {
        selectedCountry = e.target.options[e.target.selectedIndex]?.textContent || '';
        updateCities(e.target.value);
    });

    citySelect.addEventListener('change', e => {
        selectedCity = e.target.options[e.target.selectedIndex]?.textContent || '';
    });

    planForm.addEventListener('submit', e => {
        e.preventDefault();

        const cityId = citySelect.value;
        const countryId = countrySelect.value;
        const daysValue = daysInput.value;
        const budgetType = budgetTypeSelect?.value || 'medium';

        if (!cityId || !countryId || !daysValue) {
            toast.error('Будь ласка, заповніть всі поля');
            return;
        }

        const days = parseInt(daysValue);
        
        if (isNaN(days) || days < 1 || days > 30) {
            toast.error('Виберіть від 1 до 30 днів');
            return;
        }

        generatePlan(cityId, countryId, days, budgetType);
    });

    if (savePlanBtn) {
        savePlanBtn.addEventListener('click', savePlanToMyTrips);
    }
});
