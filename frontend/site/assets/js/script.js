// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
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

// Enhanced drag and drop functionality
document.addEventListener('DOMContentLoaded', function() {
  const uploadAreas = document.querySelectorAll('.upload-area');
  
  uploadAreas.forEach(area => {
    const fileInput = area.querySelector('.file-input');
    const uploadText = area.querySelector('.upload-text');
    const originalText = uploadText.textContent;
    
    // Drag events
    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      area.classList.add('dragover');
      uploadText.textContent = 'Suelta el archivo aquí';
    });
    
    area.addEventListener('dragleave', () => {
      area.classList.remove('dragover');
      uploadText.textContent = originalText;
    });
    
    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.classList.remove('dragover');
      
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        fileInput.files = files;
        handleFileUpload(files[0], area);
      }
    });
    
    // Click to upload
    area.addEventListener('click', () => {
      fileInput.click();
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0], area);
      }
    });
  });
  
  function handleFileUpload(file, area) {
    const uploadText = area.querySelector('.upload-text');
    const uploadIcon = area.querySelector('.upload-icon');
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      showError(area, 'Formato no válido. Solo se permiten PDF, JPG y PNG');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showError(area, 'El archivo es demasiado grande. Máximo 10MB');
      return;
    }
    
    // Show success state
    uploadText.textContent = `✓ ${file.name}`;
    uploadIcon.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12l2 2 4-4" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="9" stroke="#10b981" stroke-width="2"/>
      </svg>
    `;
    
    area.style.borderColor = '#10b981';
    area.style.backgroundColor = '#f0fdf4';
  }
  
  function showError(area, message) {
    const uploadText = area.querySelector('.upload-text');
    const uploadIcon = area.querySelector('.upload-icon');
    
    uploadText.textContent = `❌ ${message}`;
    uploadIcon.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#ef4444" stroke-width="2"/>
        <line x1="12" y1="8" x2="12" y2="12" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
        <line x1="12" y1="16" x2="12.01" y2="16" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    
    area.style.borderColor = '#ef4444';
    area.style.backgroundColor = '#fef2f2';
    
    // Reset after 4 seconds
    setTimeout(() => {
      uploadText.textContent = 'Arrastra tu archivo aquí o haz clic para seleccionar';
      uploadIcon.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#17afa7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="14,2 14,8 20,8" stroke="#17afa7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="#17afa7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="#17afa7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="10,9 9,9 8,9" stroke="#17afa7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      area.style.borderColor = '#cbd5e1';
      area.style.backgroundColor = '#f8fafc';
    }, 4000);
  }
});

// Form Validation and Submission
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('cotizacion-form');
  const inputs = form.querySelectorAll('.form-input, .custom-select, .form-textarea');
  
  // Real-time validation
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => clearFieldError(input));
  });
  
  // Phone number formatting
  const phoneInput = document.getElementById('telefono');
  if (phoneInput) {
    phoneInput.addEventListener('input', formatPhoneNumber);
  }
  
  // Form submission
  form.addEventListener('submit', handleFormSubmission);
  
  function validateField(field) {
    const value = field.value.trim();
    const fieldId = field.id;
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous states
    clearFieldError(field);
    
    switch (fieldId) {
      case 'nombre':
        if (!value) {
          errorMessage = 'El nombre es obligatorio';
          isValid = false;
        } else if (value.length < 2) {
          errorMessage = 'El nombre debe tener al menos 2 caracteres';
          isValid = false;
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          errorMessage = 'El nombre solo puede contener letras';
          isValid = false;
        }
        break;
        
      case 'telefono':
        if (!value) {
          errorMessage = 'El teléfono es obligatorio';
          isValid = false;
        } else if (!/^\(\d{3}\)\s\d{3}-\d{4}$/.test(value)) {
          errorMessage = 'Formato: (555) 123-4567';
          isValid = false;
        }
        break;
        
      case 'email':
        if (!value) {
          errorMessage = 'El correo es obligatorio';
          isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = 'Ingresa un correo válido';
          isValid = false;
        }
        break;
        
      case 'servicio':
        if (!value) {
          errorMessage = 'Selecciona un tipo de servicio';
          isValid = false;
        }
        break;
    }
    
    if (!isValid) {
      showFieldError(field, errorMessage);
    } else {
      showFieldSuccess(field);
    }
    
    return isValid;
  }
  
  function clearFieldError(field) {
    field.classList.remove('error', 'success');
    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
      errorElement.classList.remove('show');
    }
  }
  
  function showFieldError(field, message) {
    field.classList.add('error');
    field.classList.remove('success');
    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  }
  
  function showFieldSuccess(field) {
    field.classList.add('success');
    field.classList.remove('error');
    const errorElement = document.getElementById(`${field.id}-error`);
    if (errorElement) {
      errorElement.classList.remove('show');
    }
  }
  
  function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 6) {
      value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
      value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }
    e.target.value = value;
  }
  
  function handleFormSubmission(e) {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isFormValid = true;
    
    requiredFields.forEach(field => {
      if (!validateField(field)) {
        isFormValid = false;
      }
    });
    
    if (!isFormValid) {
      // Scroll to first error
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('.cotizar-button');
    const buttonText = submitButton.querySelector('.button-text');
    const buttonLoader = submitButton.querySelector('.button-loader');
    
    submitButton.disabled = true;
    buttonText.style.display = 'none';
    buttonLoader.style.display = 'flex';
    
    // Simulate API call
    setTimeout(() => {
      // Collect form data
      const formData = new FormData(form);
      const data = {
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        email: document.getElementById('email').value,
        servicio: document.getElementById('servicio').value,
        direccion: document.getElementById('direccion').value,
        predial: document.getElementById('predial-file').files[0],
        escrituras: document.getElementById('escrituras-file').files[0]
      };
      
      console.log('Datos del formulario:', data);
      
      // Show success message
      showSuccessMessage();
      
      // Reset form
      form.reset();
      resetUploadAreas();
      clearAllFieldStates();
      
      // Reset button
      submitButton.disabled = false;
      buttonText.style.display = 'inline';
      buttonLoader.style.display = 'none';
      
    }, 2000);
  }
  
  function showSuccessMessage() {
    // Remove existing success message
    const existingMessage = document.querySelector('.success-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message show';
    successMessage.innerHTML = `
      <h3>¡Cotización Enviada Exitosamente!</h3>
      <p>Nos pondremos en contacto contigo en las próximas 24 horas.</p>
    `;
    
    form.appendChild(successMessage);
    
    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Remove after 5 seconds
    setTimeout(() => {
      successMessage.classList.remove('show');
      setTimeout(() => successMessage.remove(), 300);
    }, 5000);
  }
  
  function resetUploadAreas() {
    const uploadAreas = document.querySelectorAll('.upload-area');
    uploadAreas.forEach(area => {
      const uploadText = area.querySelector('.upload-text');
      const uploadIcon = area.querySelector('.upload-icon');
      
      uploadText.textContent = 'Arrastra tu archivo aquí o haz clic para seleccionar';
      uploadIcon.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#17afa7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="14,2 14,8 20,8" stroke="#17afa7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="#17afa7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="#17afa7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="10,9 9,9 8,9" stroke="#17afa7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      area.style.borderColor = '#cbd5e1';
      area.style.backgroundColor = '#f8fafc';
    });
  }
  
  function clearAllFieldStates() {
    inputs.forEach(input => {
      input.classList.remove('error', 'success');
      const errorElement = document.getElementById(`${input.id}-error`);
      if (errorElement) {
        errorElement.classList.remove('show');
      }
    });
  }
});

// Floating animation for hero images
document.addEventListener('DOMContentLoaded', function() {
  const floatingImages = document.querySelectorAll('.floating-img, .floating-image');
  
  floatingImages.forEach((img, index) => {
    img.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
  });
});

// Add CSS animation for floating effect
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(var(--rotation, 0deg)); }
    50% { transform: translateY(-10px) rotate(var(--rotation, 0deg)); }
  }
  
  .floating-img.img-1 { --rotation: -5deg; }
  .floating-img.img-2 { --rotation: 8deg; }
  
  .floating-img:hover { 
    animation-play-state: paused;
  }
`;
document.head.appendChild(style);

// Navbar scroll effect
window.addEventListener('scroll', function() {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 100) {
    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
    navbar.style.borderBottom = '1px solid rgba(226, 232, 240, 0.8)';
  } else {
    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
    navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
  }
});

// Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', function() {
  const animatedElements = document.querySelectorAll('.service-card, .process-step, .stat-item');
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});
