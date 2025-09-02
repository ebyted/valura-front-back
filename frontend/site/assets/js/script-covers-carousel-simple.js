// Simplified Carousel for troubleshooting
class SimpleCarousel {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.carousel-slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.autoPlayInterval = null;
        this.autoPlayDuration = 6000;
        
        console.log('Simple Carousel initialized with', this.slides.length, 'slides');
        this.init();
    }
    
    init() {
        if (this.slides.length === 0) {
            console.error('No slides found');
            return;
        }
        
        // Set first slide as active
        this.showSlide(0);
        
        // Setup navigation
        this.setupNavigation();
        
        // Start autoplay
        this.startAutoPlay();
        
        console.log('Simple carousel initialized successfully');
    }
    
    setupNavigation() {
        // Previous button
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousSlide();
            });
        }
        
        // Next button
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }
        
        // Indicators
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });
        });
        
        // Pause on hover
        const container = document.querySelector('.hero-carousel-container');
        if (container) {
            container.addEventListener('mouseenter', () => this.pauseAutoPlay());
            container.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }
    
    showSlide(index) {
        console.log('Showing slide:', index);
        
        // Hide all slides
        this.slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Remove active from all indicators
        this.indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        // Show target slide
        if (this.slides[index]) {
            this.slides[index].classList.add('active');
        }
        
        // Activate indicator
        if (this.indicators[index]) {
            this.indicators[index].classList.add('active');
        }
        
        this.currentSlide = index;
    }
    
    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }
    
    previousSlide() {
        const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.goToSlide(prevIndex);
    }
    
    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.showSlide(index);
        }
    }
    
    startAutoPlay() {
        this.pauseAutoPlay();
        
        if (this.slides.length > 1) {
            this.autoPlayInterval = setInterval(() => {
                this.nextSlide();
            }, this.autoPlayDuration);
        }
    }
    
    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing simple carousel...');
    
    setTimeout(() => {
        window.simpleCarousel = new SimpleCarousel();
    }, 500);
});

// Debug function
window.debugSimpleCarousel = function() {
    console.log('=== SIMPLE CAROUSEL DEBUG ===');
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    console.log('Slides:', slides.length);
    console.log('Indicators:', indicators.length);
    
    slides.forEach((slide, index) => {
        console.log(`Slide ${index}: active=${slide.classList.contains('active')}`);
    });
    
    if (window.simpleCarousel) {
        console.log('Current slide:', window.simpleCarousel.currentSlide);
        console.log('AutoPlay active:', !!window.simpleCarousel.autoPlayInterval);
    }
    console.log('=== END DEBUG ===');
};
