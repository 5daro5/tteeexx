document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const registerSwitch = document.getElementById('registerSwitch');
    const authMessage = document.getElementById('authMessage');

    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'flex';
        showRegister.parentElement.style.display = 'none';
        registerSwitch.style.display = 'block';
        clearMessage();
    });

    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'flex';
        registerSwitch.style.display = 'none';
        showRegister.parentElement.style.display = 'block';
        clearMessage();
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const result = await authManager.login(email, password);
        
        if (result.success) {
            showMessage('Успешный вход!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showMessage(result.error, 'error');
        }
    });

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        const result = await authManager.register(name, email, password);
        
        if (result.success) {
            showMessage('Регистрация успешна! Теперь войдите в систему.', 'success');
            showLogin.click();
        } else {
            showMessage(result.error, 'error');
        }
    });

    function showMessage(message, type) {
        authMessage.textContent = message;
        authMessage.className = `auth-message ${type}`;
        authMessage.style.display = 'block';
    }

    function clearMessage() {
        authMessage.style.display = 'none';
        authMessage.textContent = '';
    }

    if (authManager.isAuthenticated()) {
        window.location.href = 'dashboard.html';
    }
});