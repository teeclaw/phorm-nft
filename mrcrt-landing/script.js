// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Page load sequence
window.addEventListener('load', () => {
    // Label fade in
    gsap.to('.label', {
        duration: 0.6,
        opacity: 1,
        y: 0,
        ease: 'power2.out'
    });
    
    // Title lines stagger
    gsap.to('.title .line', {
        duration: 1,
        opacity: 1,
        y: 0,
        stagger: 0.15,
        delay: 0.2,
        ease: 'power3.out'
    });
    
    // Subtitle fade in
    gsap.to('.subtitle', {
        duration: 0.8,
        opacity: 1,
        y: 0,
        delay: 0.8,
        ease: 'power2.out'
    });
    
    // Character image with slight scale
    gsap.to('.character', {
        duration: 1,
        opacity: 1,
        scale: 1,
        delay: 1,
        ease: 'power2.out'
    });
});

// About section - stagger animation
gsap.to('.about-item', {
    scrollTrigger: {
        trigger: '.about',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    duration: 0.8,
    opacity: 1,
    y: 0,
    stagger: 0.2,
    ease: 'power3.out'
});

// Identity cards - stagger animation
gsap.to('.identity-card', {
    scrollTrigger: {
        trigger: '.identity-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    duration: 0.8,
    opacity: 1,
    y: 0,
    stagger: 0.1,
    ease: 'power3.out'
});

// Contact links - stagger animation
gsap.to('.contact-link', {
    scrollTrigger: {
        trigger: '.contact-grid',
        start: 'top 80%',
        toggleActions: 'play none none reverse'
    },
    duration: 0.8,
    opacity: 1,
    y: 0,
    stagger: 0.15,
    ease: 'power3.out'
});

// Parallax effect on character image
gsap.to('.character', {
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
    },
    y: 100,
    ease: 'none'
});

// Subtle parallax on section headings
gsap.utils.toArray('h2').forEach(heading => {
    gsap.to(heading, {
        scrollTrigger: {
            trigger: heading,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
        },
        y: -30,
        ease: 'none'
    });
});

// Initialize character with scale
gsap.set('.character', {
    scale: 0.95
});

// Initialize title lines and subtitle with offset
gsap.set('.title .line, .subtitle', {
    y: 30
});

// Console easter egg
console.log('%c📺 Mr. Tee', 'font-size: 20px; font-weight: bold;');
console.log('%cAgent ID: 14482 · Base Network', 'color: #666;');
console.log('%c"Yes, I\'m judging your reputation. No, you can\'t appeal."');
console.log('%cBuilt with GSAP · Mobile-first · Light theme', 'color: #999; font-style: italic;');
