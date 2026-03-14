class RegistrationManager {
    constructor() {
        this.API_BASE = 'http://localhost:3000/api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingUser();
    }

    setupEventListeners() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        const showLogin = document.getElementById('showLogin');
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'login.html';
            });
        }

        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        const inputs = ['regName', 'regEmail', 'regPassword', 'regConfirmPassword'];
        
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.validateField(inputId));
                input.addEventListener('blur', () => this.validateField(inputId));
            }
        });
    }

    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        switch(fieldId) {
            case 'regName':
                if (value.length < 2) {
                    isValid = false;
                    message = 'Имя должно содержать минимум 2 символа';
                } else if (value.length > 50) {
                    isValid = false;
                    message = 'Имя не должно превышать 50 символов';
                }
                break;

            case 'regEmail':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    message = 'Введите корректный email адрес';
                }
                break;

            case 'regPassword':
                if (value.length < 6) {
                    isValid = false;
                    message = 'Пароль должен содержать минимум 6 символов';
                } else if (!/[A-Z]/.test(value)) {
                    isValid = false;
                    message = 'Пароль должен содержать хотя бы одну заглавную букву';
                } else if (!/\d/.test(value)) {
                    isValid = false;
                    message = 'Пароль должен содержать хотя бы одну цифру';
                }
                break;

            case 'regConfirmPassword':
                const password = document.getElementById('regPassword').value;
                if (value !== password) {
                    isValid = false;
                    message = 'Пароли не совпадают';
                }
                break;
        }

        this.updateFieldStatus(fieldId, isValid, message);
        return isValid;
    }

    updateFieldStatus(fieldId, isValid, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}Error`);
        
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('success');
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
        } else {
            field.classList.remove('success');
            field.classList.add('error');
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
        }
    }

    validateAllFields() {
        const fields = ['regName', 'regEmail', 'regPassword', 'regConfirmPassword'];
        let isValid = true;
        
        fields.forEach(fieldId => {
            if (!this.validateField(fieldId)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    async handleRegister(event) {
        event.preventDefault();
        
        this.showLoader();
        
        if (!this.validateAllFields()) {
            this.hideLoader();
            this.showMessage('Пожалуйста, исправьте ошибки в форме', 'error');
            return;
        }

        const userData = {
            name: document.getElementById('regName').value.trim(),
            email: document.getElementById('regEmail').value.trim(),
            password: document.getElementById('regPassword').value
        };

        try {
            const response = await fetch(`${this.API_BASE}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.showMessage(result.data.message || 'Регистрация успешна!', 'success');
                this.showSuccessAnimation(); 
                setTimeout(async () => {
                    await this.autoLogin(userData.email, userData.password);
                }, 1500);
                
            } else {
                this.showMessage(result.error || 'Ошибка регистрации', 'error');
                this.hideLoader();
            }
            
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            this.showMessage('Ошибка сети. Проверьте подключение к интернету', 'error');
            this.hideLoader();
        }
    }

    async autoLogin(email, password) {
        try {
            const response = await fetch(`${this.API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                localStorage.setItem('authToken', result.data.id);
                localStorage.setItem('user', JSON.stringify(result.data));
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                this.showMessage('Автоматический вход не удался. Войдите вручную', 'warning');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
            
        } catch (error) {
            console.error('Ошибка автоматического входа:', error);
            this.showMessage('Ошибка автоматического входа. Войдите вручную', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    }

    checkExistingUser() {
        const token = localStorage.getItem('authToken');
        if (token) {
            this.showMessage('Вы уже авторизованы', 'info');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }
    }

    showLoader() {
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<div class="spinner"></div> Регистрация...';
            submitBtn.disabled = true;
        }
    }

    hideLoader() {
        const submitBtn = document.querySelector('#registerForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = 'Зарегистрироваться';
            submitBtn.disabled = false;
        }
    }

    showMessage(text, type) {
        const oldMessage = document.getElementById('registerMessage');
        if (oldMessage) oldMessage.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.id = 'registerMessage';
        messageDiv.className = `register-message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-icon">${this.getMessageIcon(type)}</span>
                <span class="message-text">${text}</span>
            </div>
        `;
        
        const form = document.getElementById('registerForm');
        if (form) {
            form.parentNode.insertBefore(messageDiv, form.nextSibling);
            
            if (type !== 'success') {
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.style.opacity = '0';
                        setTimeout(() => {
                            if (messageDiv.parentNode) {
                                messageDiv.parentNode.removeChild(messageDiv);
                            }
                        }, 300);
                    }
                }, 5000);
            }
        }
    }

    getMessageIcon(type) {
        switch(type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '💬';
        }
    }

    showSuccessAnimation() {
        const form = document.getElementById('registerForm');
        if (form) {
            form.style.transform = 'scale(0.95)';
            form.style.opacity = '0.7';
            
            setTimeout(() => {
                form.style.transform = 'scale(1)';
                form.style.opacity = '1';
                form.style.transition = 'all 0.3s ease';
            }, 300);
        }
        
        const successAnimation = document.createElement('div');
        successAnimation.className = 'success-animation';
        successAnimation.innerHTML = '🎉';
        successAnimation.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 80px;
            z-index: 1000;
            animation: successPopup 0.5s ease forwards;
        `;
        
        document.body.appendChild(successAnimation);
        
        setTimeout(() => {
            if (successAnimation.parentNode) {
                successAnimation.parentNode.removeChild(successAnimation);
            }
        }, 1000);
    }
}

const registerStyles = document.createElement('style');
registerStyles.textContent = `
    .register-message {
        padding: 15px 20px;
        border-radius: 10px;
        margin: 20px 0;
        animation: slideIn 0.3s ease;
    }
    
    .register-message.success {
        background: linear-gradient(135deg, #d4ffd4 0%, #e8f5e8 100%);
        color: #2d5a2d;
        border: 2px solid #c3e6c3;
    }
    
    .register-message.error {
        background: linear-gradient(135deg, #ffd4d4 0%, #f5e8e8 100%);
        color: #5a2d2d;
        border: 2px solid #f5c6cb;
    }
    
    .register-message.warning {
        background: linear-gradient(135deg, #fff3cd 0%, #fff8e1 100%);
        color: #856404;
        border: 2px solid #ffeaa7;
    }
    
    .register-message.info {
        background: linear-gradient(135deg, #d1ecf1 0%, #e8f4f8 100%);
        color: #0c5460;
        border: 2px solid #bee5eb;
    }
    
    .message-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .message-icon {
        font-size: 20px;
    }
    
    /* Стили для полей ввода */
    .success {
        border-color: #28a745 !important;
        box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.1) !important;
    }
    
    .error {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1) !important;
    }
    
    .error-message {
        color: #dc3545;
        font-size: 12px;
        margin-top: 5px;
        display: none;
    }
    
    .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
        margin-right: 10px;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    @keyframes successPopup {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
        50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
`;

document.head.appendChild(registerStyles);

document.addEventListener('DOMContentLoaded', function() {
    new RegistrationManager();
});