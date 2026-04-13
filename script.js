// ===============================================
// PREVENT SCROLL RESTORATION ON PAGE LOAD
// ===============================================

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
    window.scrollTo(0, 0);
});

// ===============================================
// ANIMATED GREETING (Apple-style)
// ===============================================

const greetings = ['Hi', 'Hola', 'こんにちは', 'Bonjour', 'Ciao', '你好', 'Olá', 'Hello', 'Привет', 'Hallo'];
let currentGreetingIndex = 0;
const greetingElement = document.querySelector('.greeting-flip');

function rotateGreeting() {
    if (!greetingElement) return;
    
    // Flip out
    greetingElement.style.animation = 'flipOut 0.4s ease-in forwards';
    
    setTimeout(() => {
        // Change text
        currentGreetingIndex = (currentGreetingIndex + 1) % greetings.length;
        greetingElement.textContent = greetings[currentGreetingIndex];
        
        // Flip in
        greetingElement.style.animation = 'flipIn 0.4s ease-out forwards';
    }, 400);
}

// Start rotation after page load
setTimeout(() => {
    setInterval(rotateGreeting, 1750);
}, 2000);

// ===============================================
// MAGNETIC CURSOR EFFECT
// ===============================================

const magneticElements = document.querySelectorAll('.magnetic, .btn, .nav-link, .project-card');

magneticElements.forEach(element => {
    element.addEventListener('mousemove', (e) => {
        if (window.matchMedia('(hover: none)').matches) return;
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = 60;
        
        if (distance < maxDistance) {
            const strength = (maxDistance - distance) / maxDistance;
            const moveX = x * strength * 0.3;
            const moveY = y * strength * 0.3;
            
            element.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
    });
    
    element.addEventListener('mouseleave', () => {
        element.style.transform = 'translate(0, 0)';
    });
});

// ===============================================
// ANIMATED STATS COUNTER
// ===============================================

const statNumbers = document.querySelectorAll('.stat-number');
let hasAnimated = false;

// Calculate rowing hours based on days since start date (Sept 1, 2019)
function getRowingHours() {
    const startDate = new Date('2019-09-01');
    const today = new Date();
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    // Base hours: 3300 (from original calculation)
    // Add 1.5 hours per day since calculation date (Dec 11, 2025)
    const calculationDate = new Date('2025-12-11');
    const daysSinceCalc = Math.max(0, Math.floor((today - calculationDate) / (1000 * 60 * 60 * 24)));
    
    return 3300 + (daysSinceCalc * 1.5);
}

// Fetch GitHub repos count
async function fetchGitHubRepos() {
    try {
        const response = await fetch('https://api.github.com/users/aaryanp35/repos?per_page=100');
        const repos = await response.json();
        // Filter out forks if you want only your original repos
        const originalRepos = repos.filter(repo => !repo.fork);
        return originalRepos.length;
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        return 15; // Fallback to default
    }
}

function animateCounter(element, target) {
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString();
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = Math.floor(target).toLocaleString();
        }
    };
    
    updateCounter();
}

async function initializeStats() {
    const projectsStat = document.querySelector('[data-stat="projects"] .stat-number');
    const rowingStat = document.querySelector('[data-stat="rowing"] .stat-number');
    
    if (projectsStat && rowingStat) {
        const repoCount = await fetchGitHubRepos();
        const rowingHours = Math.floor(getRowingHours());
        
        projectsStat.setAttribute('data-target', repoCount);
        rowingStat.setAttribute('data-target', rowingHours);
    }
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            statNumbers.forEach(stat => {
                const target = parseInt(stat.getAttribute('data-target'));
                animateCounter(stat, target);
            });
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    initializeStats();
    statsObserver.observe(statsSection);
}

// ===============================================
// SPOTIFY EMBED
// ===============================================
// Spotify playlist is embedded directly in HTML
// To customize: Create a playlist, click Share > Embed playlist, copy the iframe code

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
// PROJECT CARDS — 3D TILT + MODAL
// ===============================================

const projectCards = document.querySelectorAll('.project-card');
const modal        = document.getElementById('projectModal');
const modalIcon    = document.getElementById('modalIcon');
const modalTitle   = document.getElementById('modalTitle');
const modalDesc    = document.getElementById('modalDescription');
const modalTags    = document.getElementById('modalTags');
const modalLink    = document.getElementById('modalLink');
const modalClose   = document.getElementById('modalClose');

// --- 3D tilt (desktop only) ---
const isTouchDevice = () => window.matchMedia('(hover: none)').matches;

projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        if (isTouchDevice()) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width  / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -10;
        const rotateY = ((x - cx) / cx) *  10;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
    });

    card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease';
    });

    // --- modal open ---
    card.addEventListener('click', () => {
        const iconClass  = card.querySelector('.project-image > i').className;
        const title      = card.querySelector('h3').textContent;
        const desc       = card.querySelector('.project-content > p').textContent;
        const tags       = [...card.querySelectorAll('.tag')].map(t => t.textContent);
        const linkEl     = card.querySelector('.project-link');
        const href       = linkEl ? linkEl.getAttribute('href') : '#';

        modalIcon.className        = iconClass;
        modalTitle.textContent     = title;
        modalDesc.textContent      = desc;
        modalTags.innerHTML        = tags.map(t => `<span class="tag">${t}</span>`).join('');
        modalLink.href             = href;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});

// --- modal close ---
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

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

