document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await api.get('/api/countries');
        const countries = response;
        
        const svgIdMap = {
            1: 'FR', 2: 'DE', 3: 'IT', 4: 'ES',
            5: 'GB', 6: 'NL', 7: 'PL', 8: 'CZ'
        };
        
        countries.forEach(country => {
            const path = document.getElementById(svgIdMap[country.id]);
            if (!path) return;
            
            path.style.cursor = "pointer";
            path.style.fill = "#dbd7f5ff";
            path.style.transition = "all 0.3s ease";
            
            path.addEventListener("mouseenter", () => {
                path.style.fill = "#7C5DF9";
                path.style.transform = "scale(1.01)";
                path.style.filter = "drop-shadow(0 0 8px rgba(124,93,249,0.3))";
            });
            
            path.addEventListener("mouseleave", () => {
                path.style.fill = "#dbd7f5ff";
                path.style.transform = "scale(1)";
                path.style.filter = "none";
            });
            
            path.addEventListener("click", () => {
                showCityModal(country);
            });
        });
    } catch (err) {
        toast.error("Не вдалося завантажити країни: " + err.message);
    }
});

async function showCityModal(country) {
    const modal = document.getElementById('cityModal');
    const title = document.getElementById('modalCountryName');
    const list = document.getElementById('cityList');
    
    if (!modal || !title || !list) return;
    
    title.textContent = country.name;
    list.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">⏳ Завантаження міст...</div>';
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
    
    try {
        const cities = await api.get(`/api/cities?countryId=${country.id}`);
        list.innerHTML = "";
        
        if (!cities || cities.length === 0) {
            list.innerHTML = '<div style="text-align:center;padding:40px;color:#666;">😔 Немає міст для цієї країни</div>';
            return;
        }
        
        cities.forEach(city => {
            const div = document.createElement("div");
            div.className = "city-item";
            div.innerHTML = `
                <div>
                    <strong>${city.name}</strong>
                    ${city.is_capital ? '<span class="badge badge-primary" style="margin-left:10px;">Столиця</span>' : ''}
                </div>
                <div style="color:#7C5DF9;font-weight:bold;">→</div>
            `;
            
            div.addEventListener("click", () => {
                selectCity(country.id, city.id, city.name);
            });
            
            list.appendChild(div);
        });
    } catch (err) {
        list.innerHTML = `<div style="text-align:center;padding:40px;color:#dc3545;">⚠️ Помилка: ${err.message}</div>`;
    }
}

function selectCity(countryId, cityId, cityName) {
    storage.remove("currentPlan");
    storage.remove("currentTripId");
    storage.remove("myPlans");
    
    storage.set("selectedCountryId", countryId);
    storage.set("selectedCityId", cityId);
    storage.set("selectedCityName", cityName);
    
    closeModal('cityModal');
    const timestamp = Date.now();
    window.location.href = `map-journey.html?refresh=${timestamp}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.querySelector('.btn-close');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal('cityModal');
    }
    
    const modal = document.getElementById('cityModal');
    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) closeModal('cityModal');
        };
    }
});

window.showCityModal = showCityModal;
window.selectCity = selectCity;
