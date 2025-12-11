// ===============================================
// NAVIGATION & MOBILE MENU
// ===============================================

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.querySelector('.navbar');

// Toggle mobile menu
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = hamburger.classList.contains('active') ? 'hidden' : 'auto';
});

// Close mobile menu when clicking on nav links
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// ===============================================
// ACTIVE NAVIGATION ON SCROLL
// ===============================================

function setActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLink?.classList.add('active');
        } else {
            navLink?.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', setActiveNav);

// ===============================================
// NAVBAR SCROLL EFFECT
// ===============================================

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===============================================
// SMOOTH SCROLLING
// ===============================================

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
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

// Smooth scroll for hero buttons
const heroButtons = document.querySelectorAll('.hero-buttons a');
heroButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const href = button.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(href);
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===============================================
// SCROLL ANIMATIONS
// ===============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for animation
const animateElements = document.querySelectorAll('.project-card, .skill-category, .about-content, .contact-content');
animateElements.forEach(el => observer.observe(el));

// ===============================================
// CONTACT FORM VALIDATION & SUBMISSION
// ===============================================

const contactForm = document.getElementById('contactForm');
const formMessage = document.querySelector('.form-message');

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Validate individual field
function validateField(input) {
    const formGroup = input.parentElement;
    const errorMessage = formGroup.querySelector('.error-message');
    
    // Remove previous error
    formGroup.classList.remove('error');
    errorMessage.textContent = '';

    // Check if field is empty
    if (!input.value.trim()) {
        formGroup.classList.add('error');
        errorMessage.textContent = 'This field is required';
        return false;
    }

    // Email-specific validation
    if (input.type === 'email' && !emailRegex.test(input.value)) {
        formGroup.classList.add('error');
        errorMessage.textContent = 'Please enter a valid email address';
        return false;
    }

    // Message length validation
    if (input.id === 'message' && input.value.trim().length < 10) {
        formGroup.classList.add('error');
        errorMessage.textContent = 'Message should be at least 10 characters';
        return false;
    }

    return true;
}

// Real-time validation
const formInputs = contactForm.querySelectorAll('input, textarea');
formInputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('error')) {
            validateField(input);
        }
    });
});

// Form submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    formInputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        return;
    }

    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    // Show loading state
    const submitBtn = contactForm.querySelector('.btn-submit');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    formMessage.style.display = 'none';

    try {
        // Simulate API call (replace with your actual API endpoint)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Success
        formMessage.className = 'form-message success';
        formMessage.textContent = 'Thank you! Your message has been sent successfully. I\'ll get back to you soon.';
        formMessage.style.display = 'block';
        
        // Reset form
        contactForm.reset();
        
        // Log form data (in production, send to your backend)
        console.log('Form submitted:', formData);

    } catch (error) {
        // Error
        formMessage.className = 'form-message error';
        formMessage.textContent = 'Oops! Something went wrong. Please try again later.';
        formMessage.style.display = 'block';
        console.error('Form submission error:', error);
    } finally {
        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
});

// ===============================================
// PROJECT CARDS INTERACTION
// ===============================================

const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// ===============================================
// TYPING EFFECT FOR HERO SUBTITLE (OPTIONAL)
// ===============================================

const heroSubtitle = document.querySelector('.hero-subtitle');
const subtitleText = heroSubtitle.textContent;
let charIndex = 0;

function typeEffect() {
    if (charIndex < subtitleText.length) {
        heroSubtitle.textContent = subtitleText.substring(0, charIndex + 1);
        charIndex++;
        setTimeout(typeEffect, 100);
    }
}

// Uncomment to enable typing effect
// heroSubtitle.textContent = '';
// setTimeout(typeEffect, 500);

// ===============================================
// SCROLL TO TOP BUTTON (OPTIONAL)
// ===============================================

function createScrollTopButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    
    // Add styles
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 1.25rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    `;

    document.body.appendChild(scrollBtn);

    // Show/hide button on scroll
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.visibility = 'visible';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.visibility = 'hidden';
        }
    });

    // Scroll to top on click
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Hover effect
    scrollBtn.addEventListener('mouseenter', () => {
        scrollBtn.style.transform = 'translateY(-5px)';
        scrollBtn.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
    });

    scrollBtn.addEventListener('mouseleave', () => {
        scrollBtn.style.transform = 'translateY(0)';
        scrollBtn.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.3)';
    });
}

// Uncomment to enable scroll to top button
// createScrollTopButton();

// ===============================================
// PERFORMANCE OPTIMIZATION
// ===============================================

// Lazy load images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ===============================================
// PREVENT DEFAULT LINK BEHAVIOR FOR PLACEHOLDER LINKS
// ===============================================

document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        if (!link.closest('.nav-menu') && !link.closest('.hero-buttons')) {
            e.preventDefault();
        }
    });
});

// ===============================================
// CONSOLE MESSAGE
// ===============================================

console.log('%c👋 Hello Developer!', 'color: #6366f1; font-size: 20px; font-weight: bold;');
console.log('%cInterested in how this was built? Check out the code!', 'color: #64748b; font-size: 14px;');
console.log('%cLooking for a developer? Let\'s connect! 🚀', 'color: #6366f1; font-size: 14px;');

// ===============================================
// INITIALIZE
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    // Set initial active nav
    setActiveNav();
    
    // Add loaded class to body for any CSS transitions
    document.body.classList.add('loaded');
    
    console.log('Portfolio website initialized successfully! ✨');
});

// ===============================================
// HANDLE PAGE VISIBILITY
// ===============================================

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.title = '👋 Come back soon!';
    } else {
        document.title = 'Aaryan Patel | Portfolio';
    }
});

// ===============================================
// KEYBOARD NAVIGATION
// ===============================================

// ESC key to close mobile menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// ===============================================
// SOCIAL LINKS ANALYTICS (OPTIONAL)
// ===============================================

const socialLinks = document.querySelectorAll('.social-links a, .social-links-contact a');
socialLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const platform = link.getAttribute('aria-label');
        console.log(`Social link clicked: ${platform}`);
        // Add your analytics tracking here
        // e.g., gtag('event', 'social_click', { platform: platform });
    });
});

// ===============================================
// FORM FIELD COUNTER (OPTIONAL)
// ===============================================

const messageField = document.getElementById('message');
if (messageField) {
    const maxLength = 500;
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.style.cssText = `
        text-align: right;
        font-size: 0.875rem;
        color: var(--text-light);
        margin-top: 0.25rem;
    `;
    
    messageField.parentElement.appendChild(counter);
    
    messageField.addEventListener('input', () => {
        const length = messageField.value.length;
        counter.textContent = `${length}/${maxLength}`;
        
        if (length > maxLength * 0.9) {
            counter.style.color = '#ef4444';
        } else {
            counter.style.color = 'var(--text-light)';
        }
    });
    
    // Initialize counter
    counter.textContent = `0/${maxLength}`;
}
