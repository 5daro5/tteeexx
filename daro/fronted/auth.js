class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
        this.API_BASE = 'http://localhost:3000/api';
        this.init();
    }

    init() {
        this.updateUI();
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                this.token = data.data.id;
                this.user = data.data;
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                this.updateUI();
                return { success: true, user: this.user };
            } else {
                return { success: false, error: data.error || 'Ошибка авторизации' };
            }
        } catch (error) {
            return { success: false, error: 'Ошибка сети' };
        }
    }

    async register(name, email, password) {
        try {
            const response = await fetch(`${this.API_BASE}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, message: data.data.message };
            } else {
                return { success: false, error: data.error || 'Ошибка регистрации' };
            }
        } catch (error) {
            return { success: false, error: 'Ошибка сети' };
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.updateUI();
        window.location.href = 'index.html';
    }

    updateUI() {
        const loginLink = document.getElementById('loginLink');
        const dashboardLink = document.getElementById('dashboardLink');
        const logoutBtn = document.getElementById('logoutBtn');

        if (this.isAuthenticated()) {
            if (loginLink) loginLink.style.display = 'none';
            if (dashboardLink) {
                dashboardLink.style.display = 'block';
                dashboardLink.textContent = `👤 ${this.user.name || this.user.email}`;
            }
            if (logoutBtn) logoutBtn.style.display = 'block';
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (dashboardLink) dashboardLink.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    getUserId() {
        return this.user ? this.user.id : null;
    }
}

const authManager = new AuthManager();

document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            authManager.logout();
        });
    }
});