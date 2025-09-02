// Carousel functionality
class ValuraCarousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.progressBar = document.querySelector('.progress-bar');
        this.autoPlayInterval = null;
        this.autoPlayDuration = 6000; // 6 seconds per slide
        this.isInitialized = false;
        this.isTransitioning = false;
        
        console.log('Carousel initialized with', this.slides.length, 'slides');
        this.init();
    }
    
    init() {
        if (this.slides.length === 0) {
            console.error('No slides found');
            return;
        }
        
        // Ensure first slide is active
        this.showSlide(0);
        
        this.setupEventListeners();
        this.updateBackgrounds();
        this.startAutoPlay();
        this.isInitialized = true;
        
        console.log('Carousel fully initialized');
    }
    
    showSlide(index) {
        console.log('Showing slide:', index);
        
        // Remove active class from all slides and indicators
        this.slides.forEach(slide => slide.classList.remove('active'));
        this.indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to target slide and indicator
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
        }
        if (this.indicators[index]) {
            this.indicators[index].classList.add('active');
        }
        
        this.currentSlide = index;
        
        // Reset progress bar
        this.resetProgressBar();
    }
    
    setupEventListeners() {
        // Navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Previous button clicked');
                this.pauseAutoPlay();
                this.previousSlide();
                // Restart autoplay after a delay
                setTimeout(() => {
                    this.startAutoPlay();
                }, 1000);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Next button clicked');
                this.pauseAutoPlay();
                this.nextSlide();
                // Restart autoplay after a delay
                setTimeout(() => {
                    this.startAutoPlay();
                }, 1000);
            });
        }
        
        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Indicator clicked:', index);
                this.pauseAutoPlay();
                this.goToSlide(index);
                // Restart autoplay after a delay
                setTimeout(() => {
                    this.startAutoPlay();
                }, 1000);
            });
        });
        
        // Pause autoplay on hover
        const carouselContainer = document.querySelector('.hero-carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', () => {
                console.log('Mouse entered - pausing autoplay');
                this.pauseAutoPlay();
            });
            carouselContainer.addEventListener('mouseleave', () => {
                console.log('Mouse left - resuming autoplay');
                this.startAutoPlay();
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextSlide();
            }
        });
        
        // Touch/swipe support
        this.setupTouchEvents();
    }
    
    setupTouchEvents() {
        const carousel = document.querySelector('.carousel-wrapper');
        if (!carousel) return;
        
        let startX = 0;
        let startY = 0;
        let isDragging = false;
        
        carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            this.pauseAutoPlay();
        });
        
        carousel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Only handle horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.previousSlide();
                }
            }
            
            isDragging = false;
            this.startAutoPlay();
        });
    }
    
    updateBackgrounds() {
        this.slides.forEach((slide, index) => {
            const bgImage = slide.dataset.bg;
            if (bgImage) {
                slide.style.backgroundImage = `url(${bgImage})`;
                console.log(`Slide ${index} background set to:`, bgImage);
            }
        });
    }
    
    goToSlide(index) {
        if (!this.isInitialized || index < 0 || index >= this.slides.length || this.isTransitioning) {
            console.error('Invalid slide index or transitioning:', index);
            return;
        }
        
        if (index === this.currentSlide) {
            console.log('Already on slide', index);
            return;
        }
        
        this.isTransitioning = true;
        console.log(`Going to slide ${index} from ${this.currentSlide}`);
        
        this.showSlide(index);
        
        // Allow transitions again after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000);
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        console.log('Next slide:', nextIndex);
        this.goToSlide(nextIndex);
    }
    
    previousSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        console.log('Previous slide:', prevIndex);
        this.goToSlide(prevIndex);
    }
    
    startAutoPlay() {
        this.pauseAutoPlay(); // Clear any existing interval
        
        if (this.slides.length <= 1) {
            console.log('Not enough slides for autoplay');
            return;
        }
        
        console.log('Starting autoplay');
        this.autoPlayInterval = setInterval(() => {
            if (!this.isTransitioning) {
                console.log('Auto advancing to next slide');
                this.nextSlide();
            }
        }, this.autoPlayDuration);
        
        // Start progress bar animation
        this.animateProgressBar();
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            console.log('Pausing autoplay');
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        
        // Pause progress bar
        if (this.progressBar) {
            this.progressBar.style.animationPlayState = 'paused';
        }
    }
    
    animateProgressBar() {
        if (!this.progressBar) return;
        
        this.progressBar.style.width = '0%';
        this.progressBar.style.transition = 'none';
        
        // Force reflow
        this.progressBar.offsetHeight;
        
        this.progressBar.style.transition = `width ${this.autoPlayDuration}ms linear`;
        this.progressBar.style.width = '100%';
    }
    
    resetProgressBar() {
        if (!this.progressBar) return;
        
        this.progressBar.style.width = '0%';
        this.progressBar.style.transition = 'none';
        
        // Force reflow
        this.progressBar.offsetHeight;
        
        // Restart animation after a short delay
        setTimeout(() => {
            if (this.autoPlayInterval) { // Only animate if autoplay is active
                this.animateProgressBar();
            }
        }, 50);
    }
}

// Form handling
class ValuraForm {
    constructor() {
        this.form = document.getElementById('quoteForm');
        this.fileInput = document.getElementById('fileInput');
        this.fileDropZone = document.getElementById('fileDropZone');
        this.fileList = document.getElementById('fileList');
        this.files = [];
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.setupFormValidation();
        this.setupFileUpload();
        this.setupFormSubmission();
    }
    
    setupFormValidation() {
        const inputs = this.form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearErrors(input));
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        const fieldGroup = field.closest('.form-group');
        
        // Remove existing error states
        fieldGroup.classList.remove('error', 'success');
        this.removeErrorMessage(fieldGroup);
        
        // Check if field is required and empty
        if (field.hasAttribute('required') && !value) {
            this.showError(fieldGroup, 'Este campo es obligatorio');
            return false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showError(fieldGroup, 'Ingresa un email válido');
                return false;
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                this.showError(fieldGroup, 'Ingresa un teléfono válido');
                return false;
            }
        }
        
        // If we get here, field is valid
        fieldGroup.classList.add('success');
        return true;
    }
    
    showError(fieldGroup, message) {
        fieldGroup.classList.add('error');
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        
        fieldGroup.appendChild(errorElement);
    }
    
    removeErrorMessage(fieldGroup) {
        const errorMessage = fieldGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    clearErrors(field) {
        const fieldGroup = field.closest('.form-group');
        fieldGroup.classList.remove('error');
        this.removeErrorMessage(fieldGroup);
    }
    
    setupFileUpload() {
        if (!this.fileDropZone) return;
        
        // Click to upload
        this.fileDropZone.addEventListener('click', () => {
            this.fileInput.click();
        });
        
        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
        
        // Drag and drop
        this.fileDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.fileDropZone.classList.add('dragover');
        });
        
        this.fileDropZone.addEventListener('dragleave', () => {
            this.fileDropZone.classList.remove('dragover');
        });
        
        this.fileDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.fileDropZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });
    }
    
    handleFiles(fileList) {
        Array.from(fileList).forEach(file => {
            if (this.validateFile(file)) {
                this.files.push(file);
                this.addFileToList(file);
            }
        });
    }
    
    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        if (file.size > maxSize) {
            alert(`El archivo "${file.name}" es muy grande. Máximo 10MB.`);
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            alert(`El archivo "${file.name}" no es un tipo válido.`);
            return false;
        }
        
        return true;
    }
    
    addFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">📄</div>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" class="file-remove" data-filename="${file.name}">✕</button>
        `;
        
        // Remove file handler
        const removeBtn = fileItem.querySelector('.file-remove');
        removeBtn.addEventListener('click', () => {
            this.removeFile(file.name);
            fileItem.remove();
        });
        
        this.fileList.appendChild(fileItem);
    }
    
    removeFile(filename) {
        this.files = this.files.filter(file => file.name !== filename);
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    setupFormSubmission() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });
    }
    
    async submitForm() {
        // Validate all fields
        const inputs = this.form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            alert('Por favor, corrige los errores en el formulario.');
            return;
        }
        
        // Show loading state
        const submitBtn = this.form.querySelector('.submit-btn-carousel');
        const originalText = submitBtn.querySelector('.btn-text').textContent;
        
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').textContent = 'Enviando...';
        submitBtn.innerHTML = `
            <span class="btn-text">Enviando...</span>
            <div class="loading"></div>
        `;
        
        try {
            // Simulate form submission
            await this.simulateFormSubmission();
            
            // Show success message
            this.showSuccessMessage();
            this.resetForm();
            
        } catch (error) {
            alert('Error al enviar el formulario. Por favor, intenta nuevamente.');
        } finally {
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span class="btn-text">${originalText}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
        }
    }
    
    async simulateFormSubmission() {
        // Simulate network request
        return new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });
    }
    
    showSuccessMessage() {
        alert('¡Cotización enviada exitosamente! Nos contactaremos contigo pronto.');
    }
    
    resetForm() {
        this.form.reset();
        this.files = [];
        this.fileList.innerHTML = '';
        
        // Remove validation states
        const formGroups = this.form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
            this.removeErrorMessage(group);
        });
    }
}

// Smooth scrolling for navigation links
class SmoothScroll {
    constructor() {
        this.init();
    }
    
    init() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.nav-carousel').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Navigation scroll effect
class NavigationEffects {
    constructor() {
        this.nav = document.querySelector('.nav-carousel');
        this.init();
    }
    
    init() {
        if (!this.nav) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                this.nav.classList.add('scrolled');
            } else {
                this.nav.classList.remove('scrolled');
            }
        });
    }
}

// Intersection Observer for animations
class ScrollAnimations {
    constructor() {
        this.init();
    }
    
    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll('.service-card-carousel, .timeline-item, .benefit-item');
        animateElements.forEach(el => observer.observe(el));
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing carousel...');
    
    // Simple timeout to ensure all elements are rendered
    setTimeout(() => {
        try {
            const carousel = new ValuraCarousel();
            window.valuraCarousel = carousel; // Make it globally accessible for debugging
            
            new ValuraForm();
            new SmoothScroll();
            new NavigationEffects();
            new ScrollAnimations();
            
            console.log('All components initialized successfully');
        } catch (error) {
            console.error('Error initializing components:', error);
        }
    }, 500);
});

// Debug functions for troubleshooting
window.debugCarousel = function() {
    console.log('=== CAROUSEL DEBUG ===');
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const progressBar = document.querySelector('.progress-bar');
    
    console.log('Slides found:', slides.length);
    console.log('Indicators found:', indicators.length);
    console.log('Progress bar found:', !!progressBar);
    
    slides.forEach((slide, index) => {
        console.log(`Slide ${index}:`, {
            active: slide.classList.contains('active'),
            background: slide.style.backgroundImage,
            visible: window.getComputedStyle(slide).opacity > 0
        });
    });
    
    indicators.forEach((indicator, index) => {
        console.log(`Indicator ${index}:`, {
            active: indicator.classList.contains('active')
        });
    });
    
    if (window.valuraCarousel) {
        console.log('Carousel instance:', {
            currentSlide: window.valuraCarousel.currentSlide,
            isInitialized: window.valuraCarousel.isInitialized,
            autoPlayActive: !!window.valuraCarousel.autoPlayInterval
        });
    } else {
        console.log('No carousel instance found');
    }
    console.log('=== END DEBUG ===');
};

// Add CSS for scroll animations
const style = document.createElement('style');
style.textContent = `
    .service-card-carousel,
    .timeline-item,
    .benefit-item {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .service-card-carousel.animate-in,
    .timeline-item.animate-in,
    .benefit-item.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .nav-carousel.scrolled {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: var(--shadow-md);
    }
    
    @media (prefers-reduced-motion: reduce) {
        .service-card-carousel,
        .timeline-item,
        .benefit-item {
            opacity: 1;
            transform: none;
            transition: none;
        }
    }
`;
document.head.appendChild(style);
