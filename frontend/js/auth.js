/**
 * Authentication Module
 * Handles user login and registration
 */

let isLoginMode = true;

/**
 * Updates form UI based on login/register mode
 */
function updateFormUI() {
    const formTitle = document.getElementById('formTitle');
    const formDescription = document.getElementById('formDescription');
    const submitText = document.getElementById('submitText');
    const toggleAuth = document.getElementById('toggleAuth');

    if (!formTitle || !formDescription || !submitText || !toggleAuth) return;

    if (isLoginMode) {
        formTitle.textContent = 'Вітаємо знову!';
        formDescription.textContent = 'Увійдіть, щоб продовжити подорож';
        submitText.textContent = 'Увійти';
        toggleAuth.textContent = 'Немає акаунту? Зареєструватися';
    } else {
        formTitle.textContent = 'Створити акаунт';
        formDescription.textContent = 'Почніть свою пригоду в Європі';
        submitText.textContent = 'Зареєструватися';
        toggleAuth.textContent = 'Вже є акаунт? Увійти';
    }
}

/**
 * Handles form submission for login/register
 */
async function handleSubmit(e) {
    e.preventDefault();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        toast.error('Заповніть усі поля');
        return;
    }
    
    if (password.length < 6) {
        toast.error('Пароль має бути не менше 6 символів');
        return;
    }

    try {
        if (isLoginMode) {
            await loginUser(email, password);
        } else {
            await registerUser(email, password);
        }
    } catch (error) {
        toast.error(error.message || 'Помилка авторизації');
    }
}

/**
 * Toggles between login and register modes
 */
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    updateFormUI();
    
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

/**
 * Logs in user with email and password
 */
async function loginUser(email, password) {
    try {
        const response = await api.post('/api/auth/login', {
            email: email,
            password: password
        });
        
        if (response.success) {
            // Save token directly (it's already a string, don't JSON.stringify it)
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('userEmail', response.user.email);
            localStorage.setItem('isAuthenticated', 'true');
            
            toast.success('Успішний вхід!');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        } else {
            throw new Error(response.message || 'Помилка входу');
        }
    } catch (error) {
        const errorMessage = error.message || 'Помилка входу';
        toast.error(errorMessage);
        throw error;
    }
}

/**
 * Registers new user
 */
async function registerUser(email, password) {
    try {
        const name = email.split('@')[0];
        
        const response = await api.post('/api/auth/register', {
            email: email,
            password: password,
            name: name
        });
        
        if (response.success) {
            // Save token directly (it's already a string, don't JSON.stringify it)
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('userEmail', response.user.email);
            localStorage.setItem('isAuthenticated', 'true');
            
            toast.success('Акаунт створено успішно!');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 500);
        } else {
            throw new Error(response.message || 'Помилка реєстрації');
        }
    } catch (error) {
        const errorMessage = error.message || 'Помилка реєстрації';
        toast.error(errorMessage);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const authForm = document.getElementById('authForm');
    const toggleAuth = document.getElementById('toggleAuth');

    if (authForm) {
        authForm.addEventListener('submit', handleSubmit);
    }
    
    if (toggleAuth) {
        toggleAuth.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthMode();
        });
    }
    
    updateFormUI();
    
    
});
