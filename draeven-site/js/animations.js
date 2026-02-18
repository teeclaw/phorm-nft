/* animations.js — All GSAP animations and ScrollTrigger */

// Don't run animations if reduced motion is preferred
if (window.APP && window.APP.prefersReducedMotion) {
  console.log('Skipping animations: reduced motion preferred');
} else {
  initAnimations();
}

function initAnimations() {
  
  // Hero fade in on load
  gsap.from('.hero__content', {
    opacity: 0,
    y: 40,
    duration: 1.2,
    ease: 'power3.out',
    delay: 0.2
  });
  
  gsap.from('.hero__scroll', {
    opacity: 0,
    y: -20,
    duration: 0.8,
    ease: 'power2.out',
    delay: 1.4
  });
  
  // Particle animation (subtle floating)
  const particles = document.querySelectorAll('.particle');
  particles.forEach((particle, i) => {
    const duration = 8 + Math.random() * 12;
    const delay = Math.random() * -10;
    gsap.to(particle, {
      y: -window.innerHeight - 100,
      x: (Math.random() - 0.5) * 200,
      duration: duration,
      delay: delay,
      repeat: -1,
      ease: 'none'
    });
  });
  
  // Intro section reveal
  gsap.from('.intro__text', {
    scrollTrigger: {
      trigger: '.intro',
      start: 'top 80%',
      end: 'top 50%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 30,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out'
  });
  
  // Character cards stagger reveal with parallax
  const characterCards = gsap.utils.toArray('.character-card');
  
  characterCards.forEach((card, i) => {
    const image = card.querySelector('.character-card__image');
    const content = card.querySelector('.character-card__content');
    
    // Card reveal
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: 'top 85%',
        end: 'top 50%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 60,
      duration: 1,
      ease: 'power3.out'
    });
    
    // Parallax effect on image
    gsap.from(image, {
      scrollTrigger: {
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1
      },
      y: -40,
      ease: 'none'
    });
    
    // Content stagger
    const contentElements = content.querySelectorAll('.character-card__name, .character-card__title, .character-card__description');
    gsap.from(contentElements, {
      scrollTrigger: {
        trigger: card,
        start: 'top 75%',
        end: 'top 45%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 20,
      stagger: 0.08,
      duration: 0.8,
      ease: 'power2.out'
    });
  });
  
  // Section headers reveal
  const sectionHeaders = gsap.utils.toArray('.section-header');
  sectionHeaders.forEach(header => {
    gsap.from(header, {
      scrollTrigger: {
        trigger: header,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    });
  });
  
  // "What It Is" section reveal
  gsap.from('.what__text', {
    scrollTrigger: {
      trigger: '.what',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 30,
    duration: 1,
    ease: 'power3.out'
  });
  
  // Meme cards stagger
  const memeCards = gsap.utils.toArray('.meme-card');
  gsap.from(memeCards, {
    scrollTrigger: {
      trigger: '.meme__grid',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 40,
    stagger: 0.1,
    duration: 0.8,
    ease: 'power3.out'
  });
  
  // Hook section reveal
  const hookItems = gsap.utils.toArray('.hook__comparison > *');
  gsap.from(hookItems, {
    scrollTrigger: {
      trigger: '.hook__comparison',
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 40,
    stagger: 0.15,
    duration: 0.8,
    ease: 'power3.out'
  });
  
  // CTA section reveal
  const ctaElements = gsap.utils.toArray('.cta__message, .cta__contract, .cta__actions, .cta__socials');
  gsap.from(ctaElements, {
    scrollTrigger: {
      trigger: '.cta',
      start: 'top 75%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 30,
    stagger: 0.12,
    duration: 0.8,
    ease: 'power3.out'
  });
  
  console.log('Animations initialized');
}
