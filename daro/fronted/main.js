document.addEventListener('DOMContentLoaded', function() {
    console.log('Приложение инициализировано');
    
    if (!authManager.isAuthenticated() && 
        !window.location.pathname.includes('login.html') &&
        !window.location.pathname.includes('index.html') &&
        !window.location.pathname.includes('products.html')) {
        window.location.href = 'login.html';
    }
});

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ru-RU');
}

function showLoading(element) {
    element.innerHTML = '<div class="loader"></div>';
}

function hideLoading(element) {
    const loader = element.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}