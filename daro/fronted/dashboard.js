class DashboardManager {
    constructor() {
        this.API_BASE = 'http://localhost:3000/api';
        this.userId = authManager.getUserId();
        this.init();
    }

    async init() {
        if (!this.userId) {
            window.location.href = 'login.html';
            return;
        }

        this.updateUserWelcome();
        await this.loadUserReviews();
        await this.loadDashboardStats();
    }

    updateUserWelcome() {
        const user = authManager.getUser();
        const welcomeElement = document.getElementById('userWelcome');
        if (welcomeElement && user) {
            welcomeElement.textContent = `Добро пожаловать, ${user.name || user.email}!`;
        }
    }

    async loadUserReviews() {
        try {
            const response = await fetch(`${this.API_BASE}/users/${this.userId}/reviews`);
            const data = await response.json();

            if (data.success && data.data) {
                this.displayUserReviews(data.data);
                this.updateReviewsChart(data.data);
            } else {
                this.showNoReviews();
            }
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
            this.showNoReviews();
        }
    }

    displayUserReviews(reviews) {
        const reviewsList = document.getElementById('myReviewsList');
        
        if (!reviews || reviews.length === 0) {
            this.showNoReviews();
            return;
        }

        document.getElementById('reviewsCount').textContent = reviews.length;

        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-product">${review.product_name || 'Товар #' + review.product_id}</div>
                    <div class="review-stars">${'⭐'.repeat(review.stars)}</div>
                </div>
                <p>${review.review}</p>
                <div><small>${new Date(review.created_at).toLocaleDateString()}</small></div>
            </div>
        `).join('');
    }

    updateReviewsChart(reviews) {
        const ratingCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
        let totalRating = 0;

        reviews.forEach(review => {
            ratingCounts[review.stars]++;
            totalRating += review.stars;
        });

        const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : '-';
        document.getElementById('avgRating').textContent = avgRating;
        const ctx = document.getElementById('reviewsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1 звезда', '2 звезды', '3 звезды', '4 звезды', '5 звезд'],
                datasets: [{
                    label: 'Количество отзывов',
                    data: [ratingCounts[1], ratingCounts[2], ratingCounts[3], ratingCounts[4], ratingCounts[5]],
                    backgroundColor: [
                        '#ff6b6b',
                        '#ffa726',
                        '#ffee58',
                        '#9ccc65',
                        '#66bb6a'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    async loadDashboardStats() {
        const user = authManager.getUser();
        if (user && user.created_at) {
            document.getElementById('memberSince').textContent = new Date(user.created_at).toLocaleDateString();
        }
    }

    showNoReviews() {
        const reviewsList = document.getElementById('myReviewsList');
        reviewsList.innerHTML = `
            <div style="text-align: center; color: #6c757d; padding: 2rem;">
                <p>У вас пока нет отзывов</p>
                <a href="products.html" class="btn-primary" style="margin-top: 1rem;">Оставить первый отзыв</a>
            </div>
        `;
        document.getElementById('reviewsCount').textContent = '0';
    }
}
document.addEventListener('DOMContentLoaded', function() {
    if (!authManager.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    new DashboardManager();
});