/* init.js — GSAP initialization and setup */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Disable GSAP animations if user prefers reduced motion
if (prefersReducedMotion) {
  gsap.globalTimeline.pause();
  ScrollTrigger.config({ ignoreMobileResize: true });
  console.log('Animations disabled: prefers-reduced-motion detected');
}

// Breakpoint detection
const breakpoints = {
  small: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1440
};

function getBreakpoint() {
  const width = window.innerWidth;
  if (width >= breakpoints.wide) return 'wide';
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  if (width >= breakpoints.small) return 'small';
  return 'mobile';
}

// ScrollTrigger refresh on resize (debounced)
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 250);
});

// Export for use in other scripts
window.APP = {
  prefersReducedMotion,
  breakpoints,
  getBreakpoint
};

console.log('$DRAEVEN initialized');
