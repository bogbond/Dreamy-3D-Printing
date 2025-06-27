document.addEventListener('DOMContentLoaded', () => {
    // Initialize BaguetteBox
    console.log('Checking for baguetteBox...');
    if (typeof baguetteBox === 'undefined') {
        console.error('baguetteBox is not loaded. Check CDN or script inclusion.');
        return;
    }

    console.log('Initializing BaguetteBox...');
    try {
        baguetteBox.run('.gallery', {
            captions: function(element) {
                return element.closest('.portfolio-item')?.dataset?.title || '';

            },
            buttons: 'auto',
            async: true,
            noScrollbars: true,
            animation: 'fadeIn'
        });
        console.log('BaguetteBox initialized successfully');
    } catch (error) {
        console.error('BaguetteBox initialization failed:', error);
    }

    // Initialize Hamburger Menu
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('nav ul');

    if (menuToggle && menu) {
        menuToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
                menu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }

    // Form handling
    const form = document.querySelector('#contact form');
    const modal = document.querySelector('#form-modal');
    const modalMessage = document.querySelector('#modal-message');
    const closeButton = document.querySelector('.modal-close');

    if (form && modal && modalMessage && closeButton) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const action = form.getAttribute('action');

            try {
                const response = await fetch(action, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    modalMessage.textContent = 'Message sent successfully!';
                    form.reset();
                } else {
                    modalMessage.textContent = 'Error sending message. Please try again.';
                }
            } catch (error) {
                modalMessage.textContent = 'Error sending message. Please try again.';
            }

            modal.style.display = 'flex';
        });

        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Mobile touch handling for portfolio overlay
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    let touchTimeout;
    let touchStartTime;

    portfolioItems.forEach(item => {
        item.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();
            touchTimeout = setTimeout(() => {
                item.classList.add('show-overlay');
            }, 300);
        });

        item.addEventListener('touchend', (e) => {
            clearTimeout(touchTimeout);
            item.classList.remove('show-overlay');
            // Allow click if touch duration is short (<300ms)
            if (Date.now() - touchStartTime < 300) {
                // Let BaguetteBox handle the click
            }
        });

        item.addEventListener('touchmove', () => {
            clearTimeout(touchTimeout);
            item.classList.remove('show-overlay');
        });
    });
});

// Auto-caption reveal on scroll
function updateActivePortfolioItem() {
    const items = document.querySelectorAll('.portfolio-item');
    const isMobile = window.innerWidth <= 768;

    // Сброс всех caption'ов
    items.forEach(item => {
        item.classList.remove('active');
        const caption = item.querySelector('.portfolio-caption');
        caption.querySelector('h4').textContent = '';
        caption.querySelector('p').textContent = '';
    });

    if (isMobile) {
        // Мобильная логика: 2 карточки
        let candidates = [];

        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const diff = Math.abs(window.innerHeight / 2 - centerY);
            candidates.push({ item, diff });
        });

        candidates.sort((a, b) => a.diff - b.diff);
        const activeItems = candidates.slice(0, 2);

        activeItems.forEach(({ item }) => {
            const title = item.dataset.title;
            const text = item.dataset.text;
            const caption = item.querySelector('.portfolio-caption');
            caption.querySelector('h4').textContent = title;
            caption.querySelector('p').textContent = text;
            item.classList.add('active');
        });

    } else {
        // ПК логика: только те, что видны на >= 95%
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
            const visibilityRatio = visibleHeight / rect.height;

            if (visibilityRatio > 0.999) {
                const title = item.dataset.title;
                const text = item.dataset.text;
                const caption = item.querySelector('.portfolio-caption');
                caption.querySelector('h4').textContent = title;
                caption.querySelector('p').textContent = text;
                item.classList.add('active');
            }
        });
    }
}



window.addEventListener('scroll', updateActivePortfolioItem);
window.addEventListener('load', updateActivePortfolioItem);
