
// ============================================
// COMMON JS - Scripts Reutilizáveis
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ============================================
    // Dark/Light Theme Toggle
    // ============================================
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');
    
    // Apply saved theme
    if (savedTheme === 'dark') {
        html.classList.add('dark-theme');
        if (themeToggle) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    // Theme toggle click handler
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const isDark = html.classList.toggle('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeToggle.innerHTML = isDark 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        });
    }
    
    // ============================================
    // Dropdown Menu Hover Effect
    // ============================================
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        let timeout;
        
        dropdown.addEventListener('mouseenter', function() {
            clearTimeout(timeout);
            const menu = this.querySelector('.dropdown-menu');
            if (menu) {
                menu.classList.add('show');
            }
        });
        
        dropdown.addEventListener('mouseleave', function() {
            const menu = this.querySelector('.dropdown-menu');
            if (menu) {
                timeout = setTimeout(() => {
                    menu.classList.remove('show');
                }, 300);
            }
        });
    });
    
    // ============================================
    // Mobile Navigation Toggle
    // ============================================
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', function() {
            navbarCollapse.classList.toggle('show');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navbarToggler.contains(e.target) && !navbarCollapse.contains(e.target)) {
                navbarCollapse.classList.remove('show');
            }
        });
    }
    
    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // ============================================
    // Active Link Highlighting
    // ============================================
    const currentPath = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link, .nav-item');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href === currentPath) {
            link.classList.add('active');
        }
    });
    
    // ============================================
    // Google Analytics Events (if needed)
    // ============================================
    window.trackEvent = function(category, action, label, value) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label,
                'value': value
            });
        }
    };
    
    // ============================================
    // Error Image Placeholder
    // ============================================
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            if (!this.dataset.errorHandled) {
                this.dataset.errorHandled = 'true';
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyOEM0Ny41IDI4IDQ3LjUgMzYgMzIgMzZDMTYuNSAzNiAxNi41IDI4IDMyIDI4WiIgZmlsbD0iI0Q0RDdEQSIvPgo8L3N2Zz4=';
            }
        });
    });
});

// ============================================
// Utility Functions
// ============================================

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Lazy loading for images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
if ('IntersectionObserver' in window) {
    lazyLoadImages();
}