// Premium Valura JavaScript - Enhanced functionality with elegant animations

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all premium features
    initSmoothNavigation();
    initPremiumFormValidation();
    initPremiumFileUpload();
    initScrollAnimations();
    initPremiumAnimations();
    initNavbarEffects();
});

// Smooth navigation with premium transitions
function initSmoothNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    // Smooth scroll to sections
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 120; // Account for fixed header
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                updateActiveNavLink(this);
            }
        });
    });

    // Update active nav link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

function updateActiveNavLink(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

// Premium form validation with enhanced UX
function initPremiumFormValidation() {
    const form = document.getElementById('premiumQuoteForm');
    const submitBtn = document.querySelector('.btn-submit-premium');
    
    if (!form) return;

    // Advanced validation rules
    const validationConfig = {
        nombrePremium: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            message: 'Por favor ingresa un nombre válido (solo letras y espacios)'
        },
        telefonoPremium: {
            required: true,
            pattern: /^[\+]?[1-9][\d]{0,15}$/,
            message: 'Por favor ingresa un número de teléfono válido'
        },
        emailPremium: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Por favor ingresa un email válido'
        },
        servicioPremium: {
            required: true,
            message: 'Por favor selecciona el tipo de avalúo requerido'
        },
        direccionPremium: {
            required: true,
            minLength: 15,
            message: 'Por favor ingresa la dirección completa de la propiedad'
        }
    };

    // Real-time validation setup
    Object.keys(validationConfig).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            // Validation on blur
            field.addEventListener('blur', () => {
                validatePremiumField(field, validationConfig[fieldName]);
            });
            
            // Clear errors on input
            field.addEventListener('input', () => {
                clearPremiumFieldError(field);
            });
            
            // Special formatting for phone
            if (fieldName === 'telefonoPremium') {
                field.addEventListener('input', formatPremiumPhone);
            }
        }
    });

    // Form submission with premium loading states
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isFormValid = true;
        
        // Validate all required fields
        Object.keys(validationConfig).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field && !validatePremiumField(field, validationConfig[fieldName])) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            submitPremiumForm(form, submitBtn);
        } else {
            showPremiumFormError('Por favor corrige los errores destacados en el formulario');
            // Scroll to first error
            const firstError = form.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
}

function validatePremiumField(field, rules) {
    const value = field.value.trim();
    const formGroup = field.closest('.form-group');
    
    // Clear previous states
    clearPremiumFieldError(field);
    
    // Required validation
    if (rules.required && !value) {
        showPremiumFieldError(field, rules.message || 'Este campo es requerido');
        return false;
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !rules.required) {
        return true;
    }
    
    // Minimum length validation
    if (rules.minLength && value.length < rules.minLength) {
        showPremiumFieldError(field, `Debe contener al menos ${rules.minLength} caracteres`);
        return false;
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
        showPremiumFieldError(field, rules.message);
        return false;
    }
    
    // Show success state
    formGroup.classList.add('success');
    return true;
}

function showPremiumFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('success');
    formGroup.classList.add('error');
    
    // Remove existing error message
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('error-message');
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
    
    // Add subtle shake animation
    field.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
        field.style.animation = '';
    }, 500);
}

function clearPremiumFieldError(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error', 'success');
    
    const errorDiv = formGroup.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function formatPremiumPhone(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 10) {
        // Nacional: (55) 1234-5678
        if (value.length > 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
    } else {
        // Internacional: +52 (55) 1234-5678
        if (value.length > 8) {
            value = `+${value.slice(0, 2)} (${value.slice(2, 4)}) ${value.slice(4, 8)}-${value.slice(8, 12)}`;
        } else if (value.length > 4) {
            value = `+${value.slice(0, 2)} (${value.slice(2, 4)}) ${value.slice(4)}`;
        } else if (value.length > 2) {
            value = `+${value.slice(0, 2)} ${value.slice(2)}`;
        }
    }
    
    e.target.value = value;
}

function showPremiumFormError(message) {
    const form = document.getElementById('premiumQuoteForm');
    let errorDiv = form.querySelector('.form-error-premium');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.classList.add('form-error-premium');
        errorDiv.style.cssText = `
            background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
            color: #DC2626;
            padding: 16px 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            border: 1px solid #F87171;
            box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1);
            animation: slideDown 0.3s ease-out;
        `;
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    errorDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 20px;">⚠️</span>
            <span>${message}</span>
        </div>
    `;
}

async function submitPremiumForm(form, submitBtn) {
    const originalContent = submitBtn.innerHTML;
    
    // Show premium loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <div class="loading"></div>
        <span>Enviando cotización...</span>
    `;
    
    try {
        // Simulate form submission with premium delay
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Show premium success message
        showPremiumSuccess();
        
        // Reset form with animation
        resetPremiumForm(form);
        
    } catch (error) {
        showPremiumFormError('Error al procesar la cotización. Por favor intenta nuevamente.');
    } finally {
        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalContent;
    }
}

function showPremiumSuccess() {
    const form = document.getElementById('premiumQuoteForm');
    
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
        color: #059669;
        padding: 32px;
        border-radius: 16px;
        text-align: center;
        margin-bottom: 32px;
        border: 1px solid #34D399;
        box-shadow: 0 10px 15px -3px rgba(5, 150, 105, 0.1);
        animation: premiumSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    successDiv.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 20px; animation: bounce 1s ease-out;">✨</div>
        <h3 style="font-family: var(--font-display); font-size: 28px; font-weight: 600; margin-bottom: 12px; color: #059669;">
            ¡Cotización enviada con éxito!
        </h3>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            Hemos recibido tu solicitud y nuestro equipo de especialistas la está revisando.
        </p>
        <p style="font-size: 14px; opacity: 0.8;">
            Te contactaremos en menos de 2 horas con una propuesta personalizada.
        </p>
    `;
    
    form.insertBefore(successDiv, form.firstChild);
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Remove success message after 6 seconds
    setTimeout(() => {
        successDiv.style.animation = 'premiumSlideOut 0.4s ease-in-out';
        setTimeout(() => successDiv.remove(), 400);
    }, 6000);
}

function resetPremiumForm(form) {
    // Clear all form fields
    form.reset();
    
    // Clear all validation states
    const formGroups = form.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        const errorMsg = group.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    });
    
    // Clear file uploads
    const fileList = document.getElementById('fileListPremium');
    if (fileList) {
        fileList.innerHTML = '';
    }
    
    // Clear form errors
    const formError = form.querySelector('.form-error-premium');
    if (formError) {
        formError.remove();
    }
}

// Premium file upload with drag & drop
function initPremiumFileUpload() {
    const uploadArea = document.querySelector('.file-upload-premium');
    const fileInput = document.getElementById('fileInputPremium');
    const fileList = document.getElementById('fileListPremium');
    const uploadBtn = document.querySelector('.upload-btn');
    
    if (!uploadArea || !fileInput || !fileList) return;
    
    let uploadedFiles = [];
    
    // Click to upload
    uploadBtn.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('click', (e) => {
        if (e.target === uploadArea || e.target.closest('.upload-area')) {
            fileInput.click();
        }
    });
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handlePremiumFiles(e.target.files);
    });
    
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-teal)';
        uploadArea.style.background = 'var(--gray-50)';
        uploadArea.style.transform = 'scale(1.02)';
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--gray-300)';
        uploadArea.style.background = 'transparent';
        uploadArea.style.transform = 'scale(1)';
    }
    
    function handleDrop(e) {
        e.preventDefault();
        handleDragLeave(e);
        handlePremiumFiles(e.dataTransfer.files);
    }
    
    function handlePremiumFiles(files) {
        Array.from(files).forEach(file => {
            if (validatePremiumFile(file)) {
                uploadedFiles.push(file);
                addPremiumFileToList(file);
            }
        });
    }
    
    function validatePremiumFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        
        if (file.size > maxSize) {
            showFileError(`El archivo "${file.name}" es demasiado grande. Máximo 10MB permitido.`);
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            showFileError(`El archivo "${file.name}" no es válido. Solo se permiten archivos PDF, JPG y PNG.`);
            return false;
        }
        
        // Check for duplicates
        if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
            showFileError(`El archivo "${file.name}" ya ha sido seleccionado.`);
            return false;
        }
        
        return true;
    }
    
    function addPremiumFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item-premium');
        fileItem.style.animation = 'premiumSlideIn 0.3s ease-out';
        
        fileItem.innerHTML = `
            <div class="file-info-premium">
                <div style="font-size: 20px; color: var(--primary-teal);">
                    ${file.type.includes('pdf') ? '📄' : '🖼️'}
                </div>
                <div>
                    <div class="file-name-premium">${file.name}</div>
                    <div class="file-size-premium">${formatPremiumFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" class="file-remove-premium" onclick="removePremiumFile('${file.name}', this)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        `;
        
        fileList.appendChild(fileItem);
    }
    
    function showFileError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            background: #FEE2E2;
            color: #DC2626;
            padding: 12px 16px;
            border-radius: 8px;
            margin-top: 16px;
            border: 1px solid #FECACA;
            animation: premiumSlideIn 0.3s ease-out;
        `;
        errorDiv.textContent = message;
        
        uploadArea.appendChild(errorDiv);
        
        // Remove error after 4 seconds
        setTimeout(() => {
            errorDiv.style.animation = 'premiumSlideOut 0.3s ease-out';
            setTimeout(() => errorDiv.remove(), 300);
        }, 4000);
    }
    
    // Global function for removing files
    window.removePremiumFile = function(fileName, button) {
        uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
        const fileItem = button.closest('.file-item-premium');
        fileItem.style.animation = 'premiumSlideOut 0.3s ease-out';
        setTimeout(() => fileItem.remove(), 300);
    };
    
    function formatPremiumFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Premium scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Elements to animate
    const elementsToAnimate = document.querySelectorAll(`
        .service-premium,
        .achievement-item,
        .cert-item,
        .process-step,
        .collage-item
    `);
    
    elementsToAnimate.forEach((el, index) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Premium floating animations
function initPremiumAnimations() {
    const floatingElements = document.querySelectorAll(`
        .cert-badge,
        .stats-card,
        .trust-badge,
        .floating-elements > *
    `);
    
    floatingElements.forEach((element, index) => {
        element.style.animation = `premiumFloat 4s ease-in-out infinite ${index * 0.5}s`;
    });
    
    // Parallax effect for hero elements
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroPattern = document.querySelector('.hero-pattern');
        const floatingElements = document.querySelectorAll('.floating-elements > *');
        
        if (heroPattern) {
            heroPattern.style.transform = `translate(${scrolled * 0.1}px, ${scrolled * 0.1}px)`;
        }
        
        floatingElements.forEach((element, index) => {
            const speed = 0.05 + (index * 0.02);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Enhanced navbar effects
function initNavbarEffects() {
    const header = document.querySelector('.header-premium');
    const nav = document.querySelector('.nav-premium');
    
    let lastScrollTop = 0;
    const scrollThreshold = 100;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Enhanced navbar background
        if (scrollTop > scrollThreshold) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.backdropFilter = 'blur(20px)';
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.boxShadow = 'none';
        }
        
        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Add premium CSS animations
const premiumStyles = document.createElement('style');
premiumStyles.textContent = `
    @keyframes premiumSlideIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes premiumSlideOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
    
    @keyframes premiumFloat {
        0%, 100% {
            transform: translateY(0px);
        }
        50% {
            transform: translateY(-10px);
        }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
            animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
            transform: translate3d(0,0,0);
        }
        40%, 43% {
            animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
            transform: translate3d(0, -15px, 0);
        }
        70% {
            animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
            transform: translate3d(0, -7px, 0);
        }
        90% {
            transform: translate3d(0, -2px, 0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Enhanced transitions */
    .header-premium {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .service-premium,
    .achievement-item,
    .cert-item {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .btn-primary-premium,
    .btn-secondary-premium,
    .btn-service,
    .btn-submit-premium {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Hover enhancements */
    .service-premium:hover {
        transform: translateY(-12px);
    }
    
    .achievement-item:hover {
        transform: translateY(-5px);
    }
    
    .cert-item:hover {
        transform: translateX(5px);
    }
`;

document.head.appendChild(premiumStyles);
