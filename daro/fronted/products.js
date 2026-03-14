class ProductsManager {
    constructor() {
        this.API_BASE = 'http://localhost:3000/api';
        this.products = [];
        this.init();
    }

    async init() {
        await this.loadProducts();
    }

    async loadProducts() {
        try {
            const response = await fetch(`${this.API_BASE}/products`);
            const data = await response.json();

            if (data.success && data.data) {
                this.products = data.data;
                this.displayProducts(this.products);
            } else {
                this.showError('Ошибка загрузки товаров');
            }
        } catch (error) {
            this.showError('Ошибка сети');
        }
    }

    displayProducts(products) {
        const productsList = document.getElementById('productsList');
        
        if (!products || products.length === 0) {
            productsList.innerHTML = '<p style="text-align: center; color: #6c757d;">Товары не найдены</p>';
            return;
        }

        productsList.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                ${product.image_url ? `
                    <img src="${product.image_url}" alt="${product.name}" class="product-image"
                         onerror="this.style.display='none'">
                ` : `
                    <div class="product-image" style="background: #f8f9fa; display: flex; align-items: center; justify-content: center; color: #6c757d;">
                         Нет изображения
                    </div>
                `}
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
                    <p class="product-description">${product.description || 'Описание отсутствует'}</p>
                    ${product.category ? `<span class="product-category">${product.category}</span>` : ''}
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn-primary" onclick="showProductReviews(${product.id})">
                             Отзывы
                        </button>
                        ${authManager.isAuthenticated() ? `
                            <button class="btn-secondary" onclick="showAddReviewModal(${product.id})">
                                ✍️ Оставить отзыв
                            </button>
                        ` : ''}
                    </div>
                    <div><small>ID: ${product.id} | Добавлен: ${new Date(product.created_at).toLocaleDateString()}</small></div>
                </div>
            </div>
        `).join('');
    }

    showError(message) {
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = `<p style="color: red; text-align: center;">${message}</p>`;
    }
}

let productsManager;

async function showProductReviews(productId) {
    try {
        const response = await fetch(`${productsManager.API_BASE}/products/${productId}/reviews`);
        const data = await response.json();

        const reviewsList = document.getElementById('reviewsList');
        const noReviews = document.getElementById('noReviews');

        if (data.success && data.data && data.data.length > 0) {
            reviewsList.innerHTML = data.data.map(review => `
                <div class="review-card">
                    <div class="review-header">
                        <div class="review-author">${review.user_name || 'Аноним'}</div>
                    </div>
                    <p>${review.review}</p>
                    <div><small>${new Date(review.created_at).toLocaleDateString()}</small></div>
                </div>
            `).join('');
            noReviews.style.display = 'none';
            reviewsList.style.display = 'block';
        } else {
            reviewsList.style.display = 'none';
            noReviews.style.display = 'block';
        }

        document.getElementById('reviewsModal').style.display = 'block';
    } catch (error) {
        alert('Ошибка загрузки отзывов');
    }
}

function closeReviewsModal() {
    document.getElementById('reviewsModal').style.display = 'none';
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredProducts = productsManager.products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.category && product.category.toLowerCase().includes(searchTerm))
    );
    productsManager.displayProducts(filteredProducts);
}
document.addEventListener('DOMContentLoaded', function() {
    productsManager = new ProductsManager();
});