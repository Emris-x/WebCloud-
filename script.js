/*
 * WebCloud — Production Front-End Script
 *
 * Lightweight, dependency-free interactions for the WebCloud landing page.
 * Features:
 * - Scroll-driven cloud/parallax layers
 * - Lightweight particle motion
 * - Scroll indicator fade
 * - Header state on scroll
 * - Smooth in-page navigation
 * - IntersectionObserver reveal animations
 * - prefers-reduced-motion support
 * - requestAnimationFrame-based scroll handling
 * - Accessible external links
 * - Mobile-safe behavior
 */

(() => {
  'use strict';

  const doc = document;
  const win = window;
  const root = doc.documentElement;
  const body = doc.body;
  const prefersReducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)');

  const state = {
    scrollY: 0,
    ticking: false,
    width: win.innerWidth,
    height: win.innerHeight,
  };

  const selectors = {
    header: 'header, .header, .site-header, [data-header]',
    scrollIndicator: '.scroll-indicator, .scroll-down, [data-scroll-indicator]',
    parallax: '[data-parallax], .parallax, .cloud, .cloud-layer',
    reveal: '[data-reveal], .reveal, .fade-in, .animate-on-scroll',
  };

  const header = doc.querySelector(selectors.header);
  const scrollIndicator = doc.querySelector(selectors.scrollIndicator);
  const parallaxElements = Array.from(doc.querySelectorAll(selectors.parallax));

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function updateHeader() {
    if (!header) return;

    const scrolled = state.scrollY > 24;
    header.classList.toggle('scrolled', scrolled);
    header.classList.toggle('is-scrolled', scrolled);
    header.setAttribute('data-scrolled', String(scrolled));
  }

  function updateScrollIndicator() {
    if (!scrollIndicator) return;

    const progress = clamp(state.scrollY / Math.max(state.height * 0.55, 1), 0, 1);
    scrollIndicator.style.opacity = String(1 - progress);
    scrollIndicator.style.pointerEvents = progress >= 0.98 ? 'none' : '';
  }

  function updateParallax() {
    if (prefersReducedMotion.matches || !parallaxElements.length) return;

    parallaxElements.forEach((element, index) => {
      const speedValue = Number.parseFloat(
        element.dataset.parallaxSpeed || element.dataset.speed || ''
      );
      const speed = Number.isFinite(speedValue)
        ? speedValue
        : 0.08 + (index % 5) * 0.025;

      const direction = element.dataset.parallaxDirection === 'down' ? 1 : -1;
      const offset = state.scrollY * speed * direction;
      const maxOffset = Math.max(state.height * 0.35, 80);
      const safeOffset = clamp(offset, -maxOffset, maxOffset);

      element.style.setProperty('--parallax-y', `${safeOffset.toFixed(2)}px`);
      element.style.transform = `translate3d(0, ${safeOffset.toFixed(2)}px, 0)`;
    });
  }

  function updateScrollEffects() {
    state.scrollY = win.scrollY || root.scrollTop || 0;
    updateHeader();
    updateScrollIndicator();
    updateParallax();
    state.ticking = false;
  }

  function requestScrollUpdate() {
    if (state.ticking) return;
    state.ticking = true;
    win.requestAnimationFrame(updateScrollEffects);
  }

  function setupRevealAnimations() {
    const revealElements = Array.from(doc.querySelectorAll(selectors.reveal));
    if (!revealElements.length) return;

    if (prefersReducedMotion.matches || !('IntersectionObserver' in win)) {
      revealElements.forEach((element) => {
        element.classList.add('is-visible', 'revealed', 'visible');
        element.style.opacity = '';
        element.style.transform = '';
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target;
          element.classList.add('is-visible', 'revealed', 'visible');
          currentObserver.unobserve(element);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  function setupSmoothNavigation() {
    const links = Array.from(doc.querySelectorAll('a[href^="#"]'));

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (!href || href === '#') return;

        const target = doc.querySelector(href);
        if (!target) return;

        event.preventDefault();

        const reduceMotion = prefersReducedMotion.matches;
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const targetTop = target.getBoundingClientRect().top + win.scrollY - headerHeight;

        win.scrollTo({
          top: Math.max(0, targetTop),
          behavior: reduceMotion ? 'auto' : 'smooth',
        });

        if (history.replaceState) {
          history.replaceState(null, '', href);
        }
      });
    });
  }

  function setupExternalLinks() {
    const links = Array.from(doc.querySelectorAll('a[href]'));
    const currentHost = win.location.hostname;

    links.forEach((link) => {
      const rawHref = link.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('/') || rawHref.startsWith('.')) {
        return;
      }

      let url;
      try {
        url = new URL(rawHref, win.location.href);
      } catch {
        return;
      }

      if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
      if (url.hostname === currentHost) return;

      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      if (!link.getAttribute('aria-label') && link.textContent.trim()) {
        link.setAttribute('aria-label', `${link.textContent.trim()} (opens in a new tab)`);
      }
    });
  }

  function setupMobileMenu() {
    const toggles = Array.from(
      doc.querySelectorAll('[data-menu-toggle], .menu-toggle, .nav-toggle, .hamburger')
    );

    if (!toggles.length) return;

    toggles.forEach((toggle) => {
      const targetSelector = toggle.dataset.menuTarget || toggle.getAttribute('aria-controls');
      const menu = targetSelector ? doc.querySelector(`#${CSS.escape(targetSelector)}`) : null;

      if (!menu) return;

      toggle.setAttribute('aria-expanded', 'false');

      const closeMenu = () => {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open', 'open', 'active');
        body.classList.remove('menu-open');
      };

      toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isOpen));
        menu.classList.toggle('is-open', !isOpen);
        menu.classList.toggle('open', !isOpen);
        menu.classList.toggle('active', !isOpen);
        body.classList.toggle('menu-open', !isOpen);
      });

      menu.querySelectorAll('a[href]').forEach((link) => {
        link.addEventListener('click', closeMenu);
      });

      win.addEventListener('resize', () => {
        if (win.innerWidth > 900) closeMenu();
      }, { passive: true });
    });
  }

  function setupParticles() {
    const canvas = doc.querySelector('[data-particles], #particles, canvas.particles');
    if (!canvas || prefersReducedMotion.matches) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const particles = [];
    const maxParticles = () => (win.innerWidth < 700 ? 28 : 55);

    const resize = () => {
      const dpr = Math.min(win.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(win.innerWidth * dpr);
      canvas.height = Math.floor(win.innerHeight * dpr);
      canvas.style.width = `${win.innerWidth}px`;
      canvas.style.height = `${win.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = maxParticles();
      while (particles.length < count) {
        particles.push({
          x: Math.random() * win.innerWidth,
          y: Math.random() * win.innerHeight,
          radius: Math.random() * 1.5 + 0.35,
          speed: Math.random() * 0.25 + 0.08,
          drift: (Math.random() - 0.5) * 0.18,
          alpha: Math.random() * 0.45 + 0.1,
        });
      }
      particles.length = count;
    };

    const draw = () => {
      context.clearRect(0, 0, win.innerWidth, win.innerHeight);

      particles.forEach((particle) => {
        particle.y -= particle.speed;
        particle.x += particle.drift;

        if (particle.y < -10) particle.y = win.innerHeight + 10;
        if (particle.x < -10) particle.x = win.innerWidth + 10;
        if (particle.x > win.innerWidth + 10) particle.x = -10;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.globalAlpha = particle.alpha;
        context.fillStyle = getComputedStyle(root).getPropertyValue('--particle-color').trim() || '#ffffff';
        context.fill();
      });

      context.globalAlpha = 1;
      win.requestAnimationFrame(draw);
    };

    resize();
    win.addEventListener('resize', resize, { passive: true });
    draw();
  }

  function setupResizeState() {
    const update = () => {
      state.width = win.innerWidth;
      state.height = win.innerHeight;
      root.style.setProperty('--viewport-width', `${state.width}px`);
      root.style.setProperty('--viewport-height', `${state.height}px`);
      requestScrollUpdate();
    };

    win.addEventListener('resize', update, { passive: true });
    update();
  }

  function setupMotionPreference() {
    const handleChange = () => {
      if (prefersReducedMotion.matches) {
        parallaxElements.forEach((element) => {
          element.style.transform = '';
          element.style.setProperty('--parallax-y', '0px');
        });
      }
      setupRevealAnimations();
      requestScrollUpdate();
    };

    if (typeof prefersReducedMotion.addEventListener === 'function') {
      prefersReducedMotion.addEventListener('change', handleChange);
    } else if (typeof prefersReducedMotion.addListener === 'function') {
      prefersReducedMotion.addListener(handleChange);
    }
  }

  function init() {
    setupResizeState();
    setupSmoothNavigation();
    setupExternalLinks();
    setupMobileMenu();
    setupRevealAnimations();
    setupParticles();
    setupMotionPreference();

    win.addEventListener('scroll', requestScrollUpdate, { passive: true });
    updateScrollEffects();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
