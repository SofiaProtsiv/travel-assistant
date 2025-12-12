const toast = {
    show: (message, type = 'info') => {
        const toastEl = document.getElementById('toast');
        if (!toastEl) return;
        
        toastEl.textContent = message;
        toastEl.className = `toast show ${type}`;
        
        setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3000);
    },
    
    success: (message) => toast.show(message, 'success'),
    error: (message) => toast.show(message, 'error'),
    info: (message) => toast.show(message, 'info')
};

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!sidebar.contains(e.target) && e.target !== sidebarToggle && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });
    }
}

function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            storage.remove('isAuthenticated');
            storage.remove('selectedCity');
            storage.remove('selectedCountry');
            toast.success('Ви вийшли з акаунту');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        });
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function initModals() {
    const closeButtons = document.querySelectorAll('.btn-close, [data-close-modal]');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            if (modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    });
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const content = document.querySelector(`[data-content="${tabName}"]`);
            if (content) {
                content.classList.add('active');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initLogout();
    initModals();
    initTabs();
});

window.toast = toast;
window.openModal = openModal;
window.closeModal = closeModal;
