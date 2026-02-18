/* components.js — Interactive components */

// Navigation scroll behavior
const nav = document.querySelector('.nav');
let lastScrollY = window.scrollY;
let ticking = false;

function updateNav() {
  const currentScrollY = window.scrollY;
  
  if (currentScrollY > 100) {
    if (currentScrollY > lastScrollY) {
      // Scrolling down - hide nav
      nav.classList.add('nav--hidden');
    } else {
      // Scrolling up - show nav
      nav.classList.remove('nav--hidden');
    }
  } else {
    // At top - always show
    nav.classList.remove('nav--hidden');
  }
  
  lastScrollY = currentScrollY;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateNav);
    ticking = true;
  }
});

// Mobile nav toggle
const navToggle = document.querySelector('.nav__toggle');
const navOverlay = document.querySelector('.nav__overlay');
const navLinks = document.querySelectorAll('.nav__overlay .nav__link');

if (navToggle && navOverlay) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('is-active');
    navOverlay.classList.toggle('is-active');
    
    // Prevent body scroll when menu is open
    if (navOverlay.classList.contains('is-active')) {
      document.body.style.overflow = 'hidden';
      
      // Stagger animate links (only if animations enabled)
      if (!window.APP?.prefersReducedMotion) {
        gsap.from('.nav__overlay .nav__link', {
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    } else {
      document.body.style.overflow = '';
    }
  });
  
  // Close menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('is-active');
      navOverlay.classList.remove('is-active');
      document.body.style.overflow = '';
    });
  });
}

// Smooth scroll to sections
const scrollLinks = document.querySelectorAll('a[href^="#"]');

scrollLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    
    if (targetId === '#') {
      // Scroll to top
      if (window.APP?.prefersReducedMotion) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      } else {
        gsap.to(window, {
          scrollTo: { y: 0, autoKill: false },
          duration: 1,
          ease: 'power2.inOut'
        });
      }
    } else {
      const target = document.querySelector(targetId);
      if (target) {
        if (window.APP?.prefersReducedMotion) {
          target.scrollIntoView({ behavior: 'auto' });
        } else {
          gsap.to(window, {
            scrollTo: { y: target, offsetY: 80, autoKill: false },
            duration: 1,
            ease: 'power2.inOut'
          });
        }
      }
    }
  });
});

// Hero scroll indicator
const heroScroll = document.querySelector('.hero__scroll');
if (heroScroll) {
  heroScroll.addEventListener('click', () => {
    const intro = document.querySelector('.intro');
    if (intro) {
      if (window.APP?.prefersReducedMotion) {
        intro.scrollIntoView({ behavior: 'auto' });
      } else {
        gsap.to(window, {
          scrollTo: { y: intro, offsetY: 80, autoKill: false },
          duration: 1.2,
          ease: 'power2.inOut'
        });
      }
    }
  });
}

// Create floating particles (only if animations enabled)
if (!window.APP?.prefersReducedMotion) {
  const particlesContainer = document.querySelector('.hero__particles');
  if (particlesContainer) {
    const particleCount = window.innerWidth > 768 ? 30 : 15;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random position
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${8 + Math.random() * 12}s`;
      particle.style.animationDelay = `${Math.random() * -20}s`;
      particle.style.opacity = Math.random() * 0.3 + 0.1;
      
      particlesContainer.appendChild(particle);
    }
  }
}

// Copy contract address on click (if implemented)
const contractAddress = document.querySelector('.cta__contract-address');
if (contractAddress) {
  contractAddress.style.cursor = 'pointer';
  contractAddress.title = 'Click to copy';
  
  contractAddress.addEventListener('click', async () => {
    const text = contractAddress.textContent;
    try {
      await navigator.clipboard.writeText(text);
      
      // Visual feedback
      const originalText = contractAddress.textContent;
      contractAddress.textContent = 'Copied!';
      contractAddress.style.color = 'var(--color-accent-crimson)';
      
      setTimeout(() => {
        contractAddress.textContent = originalText;
        contractAddress.style.color = '';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  });
}

console.log('Components initialized');
