// Validación del formulario y funcionalidades interactivas para Valura Bold

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar todas las funcionalidades
    initNavigation();
    initFormValidation();
    initFileUpload();
    initAnimations();
    initScrollEffects();
});

// Navegación suave y efectos del navbar
function initNavigation() {
    const nav = document.querySelector('.nav-bold');
    const navLinks = document.querySelectorAll('.nav-link');

    // Efecto de scroll en el navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(255, 255, 255, 0.98)';
            nav.style.backdropFilter = 'blur(20px)';
            nav.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
            nav.style.backdropFilter = 'blur(20px)';
            nav.style.boxShadow = 'none';
        }
    });

    // Navegación suave
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Validación avanzada del formulario
function initFormValidation() {
    const form = document.getElementById('quoteForm');
    const submitBtn = document.querySelector('.submit-btn-bold');
    
    if (!form) return;

    // Configuración de validación para cada campo
    const validationRules = {
        nombre: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            message: 'Por favor ingresa un nombre válido'
        },
        telefono: {
            required: true,
            pattern: /^[\+]?[1-9][\d]{0,15}$/,
            message: 'Por favor ingresa un teléfono válido'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Por favor ingresa un email válido'
        },
        servicio: {
            required: true,
            message: 'Por favor selecciona un tipo de servicio'
        },
        direccion: {
            required: true,
            minLength: 10,
            message: 'Por favor ingresa la dirección completa de la propiedad'
        }
    };

    // Agregar eventos de validación en tiempo real
    Object.keys(validationRules).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('blur', () => validateField(field, validationRules[fieldName]));
            field.addEventListener('input', () => clearFieldError(field));
            
            // Formateo especial para teléfono
            if (fieldName === 'telefono') {
                field.addEventListener('input', formatPhoneNumber);
            }
        }
    });

    // Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        
        // Validar todos los campos
        Object.keys(validationRules).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field && !validateField(field, validationRules[fieldName])) {
                isValid = false;
            }
        });

        if (isValid) {
            submitForm(form, submitBtn);
        } else {
            showFormError('Por favor corrige los errores en el formulario');
        }
    });
}

// Validar campo individual
function validateField(field, rules) {
    const value = field.value.trim();
    const formGroup = field.closest('.form-group');
    
    // Limpiar errores previos
    clearFieldError(field);
    
    // Validar requerido
    if (rules.required && !value) {
        showFieldError(field, rules.message || 'Este campo es requerido');
        return false;
    }
    
    // Validar longitud mínima
    if (rules.minLength && value.length < rules.minLength) {
        showFieldError(field, `Debe tener al menos ${rules.minLength} caracteres`);
        return false;
    }
    
    // Validar patrón
    if (rules.pattern && value && !rules.pattern.test(value)) {
        showFieldError(field, rules.message);
        return false;
    }
    
    // Mostrar éxito
    formGroup.classList.add('success');
    return true;
}

// Mostrar error en campo
function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('success');
    formGroup.classList.add('error');
    
    let errorDiv = formGroup.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.classList.add('error-message');
        formGroup.appendChild(errorDiv);
    }
    errorDiv.textContent = message;
}

// Limpiar error en campo
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error', 'success');
    
    const errorDiv = formGroup.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// Formatear número de teléfono
function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 10) {
        // Formato nacional: (55) 1234-5678
        if (value.length > 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
    } else {
        // Formato internacional: +52 (55) 1234-5678
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

// Mostrar error general del formulario
function showFormError(message) {
    const form = document.getElementById('quoteForm');
    let errorDiv = form.querySelector('.form-error');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.classList.add('form-error');
        errorDiv.style.cssText = `
            background: #FEE2E2;
            color: #DC2626;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            border: 1px solid #FECACA;
        `;
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    errorDiv.textContent = message;
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Enviar formulario
async function submitForm(form, submitBtn) {
    const originalText = submitBtn.innerHTML;
    
    // Mostrar estado de carga
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <div class="loading"></div>
        <span>Enviando...</span>
    `;
    
    try {
        // Simular envío del formulario
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mostrar mensaje de éxito
        showSuccessMessage();
        form.reset();
        clearAllFieldStates();
        
    } catch (error) {
        showFormError('Error al enviar el formulario. Por favor intenta nuevamente.');
    } finally {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Mostrar mensaje de éxito
function showSuccessMessage() {
    const form = document.getElementById('quoteForm');
    
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        background: #D1FAE5;
        color: #059669;
        padding: 24px;
        border-radius: 12px;
        text-align: center;
        margin-bottom: 24px;
        border: 1px solid #A7F3D0;
        animation: slideIn 0.3s ease-out;
    `;
    
    successDiv.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <h3 style="margin-bottom: 8px; font-weight: 600;">¡Cotización enviada exitosamente!</h3>
        <p>Te contactaremos en menos de 2 horas con una propuesta personalizada.</p>
    `;
    
    form.insertBefore(successDiv, form.firstChild);
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Remover mensaje después de 5 segundos
    setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => successDiv.remove(), 300);
    }, 5000);
}

// Limpiar estados de todos los campos
function clearAllFieldStates() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
        group.classList.remove('error', 'success');
        const errorDiv = group.querySelector('.error-message');
        if (errorDiv) errorDiv.remove();
    });
    
    const formError = document.querySelector('.form-error');
    if (formError) formError.remove();
}

// Funcionalidad de carga de archivos
function initFileUpload() {
    const fileDropZone = document.getElementById('fileDropZone');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    
    if (!fileDropZone || !fileInput || !fileList) return;
    
    let uploadedFiles = [];
    
    // Eventos del drop zone
    fileDropZone.addEventListener('click', () => fileInput.click());
    
    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.classList.add('dragover');
    });
    
    fileDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('dragover');
    });
    
    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (validateFile(file)) {
                uploadedFiles.push(file);
                addFileToList(file);
            }
        });
    }
    
    function validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        
        if (file.size > maxSize) {
            alert(`El archivo ${file.name} es demasiado grande. Máximo 10MB.`);
            return false;
        }
        
        if (!allowedTypes.includes(file.type)) {
            alert(`El archivo ${file.name} no es válido. Solo se permiten PDF, JPG y PNG.`);
            return false;
        }
        
        return true;
    }
    
    function addFileToList(file) {
        const fileItem = document.createElement('div');
        fileItem.classList.add('file-item');
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">📄</div>
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" class="file-remove" onclick="removeFile('${file.name}', this)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        `;
        fileList.appendChild(fileItem);
    }
    
    // Función global para remover archivos
    window.removeFile = function(fileName, button) {
        uploadedFiles = uploadedFiles.filter(file => file.name !== fileName);
        button.closest('.file-item').remove();
    };
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Animaciones de entrada
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Elementos a animar
    const animatedElements = document.querySelectorAll(`
        .service-card-bold,
        .timeline-item,
        .benefit-item,
        .info-card
    `);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Efectos de scroll adicionales
function initScrollEffects() {
    const heroShapes = document.querySelectorAll('.shape');
    const floatingCards = document.querySelectorAll('.info-card');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax en las formas del hero
        heroShapes.forEach((shape, index) => {
            const speed = 0.2 + (index * 0.1);
            shape.style.transform = `translate3d(0, ${scrolled * speed}px, 0)`;
        });
        
        // Animación sutil en las cards flotantes
        floatingCards.forEach((card, index) => {
            const speed = 0.1 + (index * 0.05);
            card.style.transform = `translateY(${Math.sin(scrolled * 0.01 + index) * 10}px)`;
        });
    });
}

// Añadir estilos de animación CSS
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
    
    .file-item {
        animation: slideIn 0.3s ease-out;
    }
    
    /* Smooth transitions para todos los elementos interactivos */
    .service-card-bold,
    .timeline-item,
    .benefit-item,
    .btn-primary-bold,
    .btn-secondary-bold,
    .service-btn {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Hover effects mejorados */
    .service-card-bold:hover {
        transform: translateY(-12px);
    }
    
    .timeline-item:hover .timeline-number {
        transform: scale(1.1);
    }
`;

document.head.appendChild(animationStyles);
