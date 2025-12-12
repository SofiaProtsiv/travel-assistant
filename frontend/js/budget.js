/**
 * Budget Management Module
 * Handles budget calculations, limit tracking, and notifications
 * Synchronizes with map-journey plan data
 */

let selectedPlaces = {};
let userBudgetLimit = 250;

/**
 * Initializes budget slider with event handlers
 */
function setupBudgetSlider() {
    const slider = document.getElementById("budgetLimit");
    const label = document.getElementById("budgetLimitValue");
    
    if (!slider) return;
    
    slider.value = userBudgetLimit;
    if (label) label.textContent = "€" + userBudgetLimit;
    
    slider.addEventListener('input', function(e) {
        userBudgetLimit = Number(e.target.value);
        
        if (label) {
            label.textContent = "€" + userBudgetLimit;
            label.style.transform = 'scale(1.2)';
            setTimeout(() => label.style.transform = 'scale(1)', 200);
        }
        
        recalcAndRender();
    });
    
    slider.addEventListener('dblclick', function() {
        this.value = 150;
        userBudgetLimit = 150;
        if (label) label.textContent = "€150";
        recalcAndRender();
    });
}

/**
 * Synchronizes budget data with map-journey plan
 */
function syncWithMapJourney() {
    const currentPlan = storage.get('currentPlan', []);
    selectedPlaces = {};
    
    currentPlan.forEach(item => {
        const day = item.day || 1;
        
        if (!selectedPlaces[day]) {
            selectedPlaces[day] = [];
        }
        
        const exists = selectedPlaces[day].some(p => p.id === item.id);
        if (!exists) {
            selectedPlaces[day].push({
                id: item.id,
                name: item.place || item.name || 'Unknown',
                ticket_price: item.ticket_price || 0,
                transport_cost: item.transport_cost || 0,
                avg_visit_time: item.avg_visit_time || 0
            });
        }
    });
    
    recalcAndRender();
}

/**
 * Calculates total costs for attractions, housing, and time
 */
function calculateTotals() {
    let attractionsCost = 0;
    let housingCost = 0;
    let totalTime = 0;
    const daysData = {};
    
    for (const day in selectedPlaces) {
        let dayCost = 0;
        let dayTime = 0;
        
        selectedPlaces[day].forEach(place => {
            const ticket = Number(place.ticket_price) || 0;
            const transport = Number(place.transport_cost) || 0;
            
            dayCost += ticket + transport;
            dayTime += Number(place.avg_visit_time) || 0;
        });
        
        daysData[day] = {
            cost: dayCost,
            time: dayTime,
            count: selectedPlaces[day].length
        };
        
        attractionsCost += dayCost;
        totalTime += dayTime;
    }
    
    const numberOfDays = Object.keys(selectedPlaces).length || 1;
    housingCost = numberOfDays * 40;
    
    const totalCost = attractionsCost + housingCost;
    
    return { 
        days: daysData, 
        attractionsCost, 
        housingCost, 
        totalCost, 
        totalTime 
    };
}

/**
 * Renders budget panel with breakdown and status
 */
function renderBudgetPanel(data) {
    const panel = document.getElementById("budgetPanel");
    if (!panel) return;
    
    const totalEl = document.getElementById('budgetTotal');
    const attractionsEl = document.getElementById('budgetAttractions');
    const housingEl = document.getElementById('budgetHousing');
    
    if (totalEl) totalEl.textContent = data.totalCost.toFixed(2) + ' €';
    if (attractionsEl) attractionsEl.textContent = data.attractionsCost.toFixed(2) + ' €';
    if (housingEl) housingEl.textContent = data.housingCost.toFixed(2) + ' €';
    
    let html = '';
    
    if (Object.keys(data.days).length === 0) {
        html = `
            <div style="text-align: center; padding: 20px; color: #666;">
                <p>🎯 Встановіть обмеження бюджету</p>
                <p style="font-size: 14px; margin-top: 10px;">
                    Додайте пам'ятки з карти, щоб побачити розрахунок
                </p>
                <div style="margin-top: 15px; padding: 10px; background: #f8f7ff; border-radius: 8px;">
                    <strong>Поточний ліміт: €${userBudgetLimit}</strong>
                </div>
            </div>
        `;
    } else {
        html += '<div class="budget-days-container">';
        for (const day in data.days) {
            html += `
                <div class="budget-day">
                    <h4>📅 День ${day}</h4>
                    <p>✅ Локацій: ${data.days[day].count}</p>
                    <p>💶 Вартість пам'яток: €${data.days[day].cost.toFixed(2)}</p>
                    <p>⏱ Час: ${data.days[day].time} хв</p>
                </div>
            `;
        }
        html += '</div>';
        
        html += `
            <hr>
            <div class="budget-breakdown">
                <h4>💰 Розбивка витрат:</h4>
                <p>🎫 Пам'ятки: €${data.attractionsCost.toFixed(2)}</p>
                <p>🏨 Проживання: €${data.housingCost.toFixed(2)}</p>
                <div class="budget-total">
                    <h3>📊 Всього: €${data.totalCost.toFixed(2)}</h3>
                    <p>⏳ Загальний час: ${data.totalTime} хв</p>
                </div>
            </div>
        `;
        
        const status = data.totalCost <= userBudgetLimit ? 
            "✅ Вкладаєшся в бюджет" : 
            "❌ Перевищено бюджет";
        const statusClass = data.totalCost <= userBudgetLimit ? "ok" : "bad";
        
        html += `
            <div class="budget-limit ${statusClass}">
                🎯 Твій ліміт: €${userBudgetLimit}
                <br>${status}
            </div>
        `;
    }
    
    panel.innerHTML = html;
    checkBudgetLimit(data.totalCost);
}

/**
 * Checks budget limit and shows appropriate notifications
 */
function checkBudgetLimit(totalCost) {
    if (userBudgetLimit === 0) return;
    
    removeBudgetNotifications();
    
    if (totalCost > userBudgetLimit) {
        showBudgetWarning(totalCost, userBudgetLimit);
    } else if (totalCost > userBudgetLimit * 0.9) {
        showBudgetNearLimit(totalCost, userBudgetLimit);
    } else if (totalCost > userBudgetLimit * 0.7) {
        showBudgetWarning70(totalCost, userBudgetLimit);
    }
}

/**
 * Shows warning when budget is exceeded
 */
function showBudgetWarning(total, limit) {
    const overspend = total - limit;
    
    const popup = document.createElement('div');
    popup.className = 'budget-popup budget-popup-warning';
    
    popup.innerHTML = `
        <div class="budget-popup-content">
            <strong>⚠️ ПЕРЕВИЩЕННЯ БЮДЖЕТУ!</strong>
            <p>Перевищення на: <strong>€${overspend.toFixed(2)}</strong></p>
            <p><small>Бюджет: €${total.toFixed(2)} | Ліміт: €${limit}</small></p>
            <p style="font-size: 12px; margin-top: 5px;">Розгляньте видалення декількох пам'яток</p>
        </div>
        <button class="budget-popup-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentNode) {
            popup.remove();
        }
    }, 10000);
}

/**
 * Shows notification when approaching budget limit (90%+)
 */
function showBudgetNearLimit(total, limit) {
    const percentage = Math.round((total / limit) * 100);
    
    const popup = document.createElement('div');
    popup.className = 'budget-popup budget-popup-near';
    
    popup.innerHTML = `
        <div class="budget-popup-content">
            <strong>💰 БЛИЗЬКО ДО ЛІМІТУ!</strong>
            <p>Використано: <strong>${percentage}%</strong> бюджету</p>
            <p><small>Бюджет: €${total.toFixed(2)} | Ліміт: €${limit}</small></p>
            <p style="font-size: 12px; margin-top: 5px;">Залишилось: €${(limit - total).toFixed(2)}</p>
        </div>
        <button class="budget-popup-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentNode) popup.remove();
    }, 5000);
}

/**
 * Shows warning at 70% budget usage
 */
function showBudgetWarning70(total, limit) {
    const percentage = Math.round((total / limit) * 100);
    
    const popup = document.createElement('div');
    popup.className = 'budget-popup budget-popup-near';
    
    popup.innerHTML = `
        <div class="budget-popup-content">
            <strong>💸 ${percentage}% БЮДЖЕТУ ВИКОРИСТАНО</strong>
            <p>Залишилось: <strong>€${(limit - total).toFixed(2)}</strong></p>
            <p><small>Бюджет: €${total.toFixed(2)} | Ліміт: €${limit}</small></p>
        </div>
        <button class="budget-popup-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        if (popup.parentNode) popup.remove();
    }, 3000);
}

/**
 * Removes all budget notification popups
 */
function removeBudgetNotifications() {
    const popups = document.querySelectorAll('.budget-popup');
    popups.forEach(popup => popup.remove());
}

/**
 * Fetches budget data from server API
 */
function fetchBudgetFromServer() {
    const cityId = parseInt(storage.get('selectedCityId'), 10);
    if (!cityId) return;
    
    const currentPlan = storage.get('currentPlan', []);
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
            
            syncWithMapJourney();
        })
        .catch(err => {
            syncWithMapJourney();
        });
}

/**
 * Recalculates and renders budget panel
 */
function recalcAndRender() {
    const data = calculateTotals();
    renderBudgetPanel(data);
}

/**
 * Sets up event listeners for budget synchronization
 */
function setupEventListeners() {
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentPlan') {
            fetchBudgetFromServer();
        }
    });
    
    setInterval(fetchBudgetFromServer, 3000);
}

document.addEventListener("DOMContentLoaded", function() {
    setupBudgetSlider();
    setupEventListeners();
    
    setTimeout(() => {
        fetchBudgetFromServer();
    }, 1000);
});

window.removeBudgetNotifications = removeBudgetNotifications;
window.syncWithMapJourney = syncWithMapJourney;
window.fetchBudgetFromServer = fetchBudgetFromServer;
