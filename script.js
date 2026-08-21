/*
 * =========================================================
 * WebCloud — Production Front-End Interaction System
 * =========================================================
 *
 * Dependency-free.
 *
 * Handles:
 * - Smart sticky header
 * - Working mobile navigation
 * - Smooth anchor navigation
 * - Scroll indicator
 * - Scroll reveal
 * - Lightweight parallax
 * - Cloud / sky movement
 * - Reduced-motion accessibility
 * - Responsive viewport state
 * - External-link safety
 * - Escape-key navigation closing
 * - Body scroll locking while mobile menu is open
 *
 * Designed for the WebCloud one-page experience.
 * =========================================================
 */

(() => {
  "use strict";

  const doc = document;
  const win = window;
  const root = doc.documentElement;
  const body = doc.body;

  const header = doc.querySelector(".site-header");
  const nav = doc.querySelector(".main-nav");
  const menuToggle = doc.querySelector(".menu-toggle");
  const scrollHint = doc.querySelector(".scroll-hint");

  const parallaxElements = Array.from(
    doc.querySelectorAll(
      "[data-parallax], .parallax, .cloud, .cloud-layer, .sky-layer"
    )
  );

  const revealElements = Array.from(
    doc.querySelectorAll(
      "[data-reveal], .reveal, .fade-in, .animate-on-scroll"
    )
  );

  const reducedMotionQuery = win.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const state = {
    scrollY: 0,
    width: win.innerWidth,
    height: win.innerHeight,
    ticking: false,
  };

  const MOBILE_BREAKPOINT = 700;

  /* =======================================================
     UTILITIES
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const prefersReducedMotion = () =>
    reducedMotionQuery.matches;

  /* =======================================================
     HEADER
     ======================================================= */

  function updateHeader() {
    if (!header) return;

    const scrolled = state.scrollY > 24;

    header.classList.toggle(
      "scrolled",
      scrolled
    );

    header.classList.toggle(
      "is-scrolled",
      scrolled
    );

    header.setAttribute(
      "data-scrolled",
      String(scrolled)
    );
  }

  /* =======================================================
     SCROLL INDICATOR
     ======================================================= */

  function updateScrollHint() {
    if (!scrollHint) return;

    const fadeDistance = Math.max(
      state.height * 0.55,
      1
    );

    const progress = clamp(
      state.scrollY / fadeDistance,
      0,
      1
    );

    scrollHint.style.opacity = String(
      1 - progress
    );

    scrollHint.style.pointerEvents =
      progress >= 0.98
        ? "none"
        : "";
  }

  /* =======================================================
     PARALLAX / CLOUD MOVEMENT
     ======================================================= */

  function updateParallax() {
    if (
      prefersReducedMotion() ||
      !parallaxElements.length
    ) {
      return;
    }

    parallaxElements.forEach(
      (element, index) => {
        const explicitSpeed =
          Number.parseFloat(
            element.dataset.parallaxSpeed ||
              element.dataset.speed ||
              ""
          );

        const speed = Number.isFinite(
          explicitSpeed
        )
          ? explicitSpeed
          : 0.018 +
            (index % 5) * 0.008;

        const direction =
          element.dataset.parallaxDirection ===
          "down"
            ? 1
            : -1;

        const offset =
          state.scrollY *
          speed *
          direction;

        const maxOffset = Math.max(
          state.height * 0.16,
          50
        );

        const safeOffset = clamp(
          offset,
          -maxOffset,
          maxOffset
        );

        element.style.setProperty(
          "--parallax-y",
          `${safeOffset.toFixed(2)}px`
        );

        /*
         * Only apply transforms to elements that
         * are explicitly part of the parallax system.
         */
        element.style.transform =
          `translate3d(0, ${safeOffset.toFixed(
            2
          )}px, 0)`;
      }
    );
  }

  /* =======================================================
     SCROLL ENGINE
     ======================================================= */

  function updateScrollEffects() {
    state.scrollY =
      win.scrollY ||
      root.scrollTop ||
      0;

    updateHeader();
    updateScrollHint();
    updateParallax();

    state.ticking = false;
  }

  function requestScrollUpdate() {
    if (state.ticking) return;

    state.ticking = true;

    if (
      typeof win.requestAnimationFrame ===
      "function"
    ) {
      win.requestAnimationFrame(
        updateScrollEffects
      );
    } else {
      updateScrollEffects();
    }
  }

  /* =======================================================
     MOBILE NAVIGATION
     ======================================================= */

  function isMobileMenuOpen() {
    return (
      menuToggle?.getAttribute(
        "aria-expanded"
      ) === "true"
    );
  }

  function openMobileMenu() {
    if (!menuToggle || !nav) return;

    nav.classList.add(
      "is-open",
      "open",
      "active"
    );

    menuToggle.classList.add(
      "is-active",
      "active"
    );

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Close navigation menu"
    );

    body.classList.add(
      "menu-open"
    );
  }

  function closeMobileMenu() {
    if (!menuToggle || !nav) return;

    nav.classList.remove(
      "is-open",
      "open",
      "active"
    );

    menuToggle.classList.remove(
      "is-active",
      "active"
    );

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Open navigation menu"
    );

    body.classList.remove(
      "menu-open"
    );
  }

  function toggleMobileMenu() {
    if (isMobileMenuOpen()) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  }

  function setupMobileNavigation() {
    if (!menuToggle || !nav) {
      return;
    }

    /*
     * The button already exists in index.html.
     * We use it directly instead of generating
     * another button or another navigation.
     */

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    menuToggle.setAttribute(
      "aria-label",
      "Open navigation menu"
    );

    menuToggle.addEventListener(
      "click",
      toggleMobileMenu
    );

    /*
     * Close the navigation after clicking
     * any navigation link.
     */

    nav.querySelectorAll(
      "a[href]"
    ).forEach((link) => {
      link.addEventListener(
        "click",
        () => {
          closeMobileMenu();
        }
      );
    });

    /*
     * Escape closes the menu.
     */

    doc.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Escape" &&
          isMobileMenuOpen()
        ) {
          closeMobileMenu();

          menuToggle.focus();
        }
      }
    );

    /*
     * Clicking outside the navigation
     * closes it on mobile.
     */

    doc.addEventListener(
      "click",
      (event) => {
        if (!isMobileMenuOpen()) {
          return;
        }

        if (
          menuToggle.contains(
            event.target
          ) ||
          nav.contains(
            event.target
          )
        ) {
          return;
        }

        closeMobileMenu();
      }
    );

    /*
     * Restore desktop state after resizing.
     */

    win.addEventListener(
      "resize",
      () => {
        if (
          win.innerWidth >
          MOBILE_BREAKPOINT
        ) {
          closeMobileMenu();
        }
      },
      { passive: true }
    );
  }

  /* =======================================================
     SMOOTH ANCHOR NAVIGATION
     ======================================================= */

  function setupSmoothNavigation() {
    const links = Array.from(
      doc.querySelectorAll(
        'a[href^="#"]:not([href="#"])'
      )
    );

    links.forEach((link) => {
      link.addEventListener(
        "click",
        (event) => {
          const href =
            link.getAttribute(
              "href"
            );

          if (!href) return;

          let target = null;

          try {
            target =
              doc.querySelector(
                href
              );
          } catch {
            return;
          }

          if (!target) return;

          event.preventDefault();

          const headerHeight =
            header
              ? header.getBoundingClientRect()
                  .height
              : 0;

          const targetTop =
            target.getBoundingClientRect()
              .top +
            win.scrollY -
            headerHeight -
            12;

          win.scrollTo({
            top: Math.max(
              0,
              targetTop
            ),
            behavior:
              prefersReducedMotion()
                ? "auto"
                : "smooth",
          });

          /*
           * Keep the URL clean but still
           * preserve the section state.
           */

          if (
            win.history &&
            typeof win.history.replaceState ===
              "function"
          ) {
            win.history.replaceState(
              null,
              "",
              href
            );
          }

          closeMobileMenu();
        }
      );
    });
  }

  /* =======================================================
     SCROLL REVEAL
     ======================================================= */

  function setupRevealAnimations() {
    if (!revealElements.length) {
      return;
    }

    /*
     * Accessibility first.
     */

    if (
      prefersReducedMotion() ||
      !(
        "IntersectionObserver" in
        win
      )
    ) {
      revealElements.forEach(
        (element) => {
          element.classList.add(
            "is-visible",
            "revealed",
            "visible"
          );

          element.style.opacity = "";
          element.style.transform = "";
        }
      );

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries, currentObserver) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              const element =
                entry.target;

              element.classList.add(
                "is-visible",
                "revealed",
                "visible"
              );

              currentObserver.unobserve(
                element
              );
            }
          );
        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -8% 0px",
        }
      );

    revealElements.forEach(
      (element) => {
        observer.observe(
          element
        );
      }
    );
  }

  /* =======================================================
     EXTERNAL LINKS
     ======================================================= */

  function setupExternalLinks() {
    const links = Array.from(
      doc.querySelectorAll(
        "a[href]"
      )
    );

    const currentHost =
      win.location.hostname;

    links.forEach((link) => {
      const rawHref =
        link.getAttribute(
          "href"
        );

      if (!rawHref) return;

      /*
       * Ignore local links and special protocols.
       */

      if (
        rawHref.startsWith("#") ||
        rawHref.startsWith("/") ||
        rawHref.startsWith("./") ||
        rawHref.startsWith("../") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:")
      ) {
        return;
      }

      let url;

      try {
        url = new URL(
          rawHref,
          win.location.href
        );
      } catch {
        return;
      }

      if (
        url.protocol !==
          "http:" &&
        url.protocol !==
          "https:"
      ) {
        return;
      }

      /*
       * External links open safely in
       * a separate tab.
       */

      if (
        url.hostname !==
        currentHost
      ) {
        link.target = "_blank";
        link.rel =
          "noopener noreferrer";
      }
    });
  }

  /* =======================================================
     RESPONSIVE VIEWPORT STATE
     ======================================================= */

  function updateViewportState() {
    state.width =
      win.innerWidth;

    state.height =
      win.innerHeight;

    root.style.setProperty(
      "--viewport-width",
      `${state.width}px`
    );

    root.style.setProperty(
      "--viewport-height",
      `${state.height}px`
    );

    root.classList.toggle(
      "is-mobile",
      state.width <=
        MOBILE_BREAKPOINT
    );

    root.classList.toggle(
      "is-desktop",
      state.width >
        MOBILE_BREAKPOINT
    );

    requestScrollUpdate();
  }

  function setupViewportState() {
    win.addEventListener(
      "resize",
      updateViewportState,
      { passive: true }
    );

    updateViewportState();
  }

  /* =======================================================
     REDUCED MOTION
     ======================================================= */

  function handleMotionPreferenceChange() {
    if (prefersReducedMotion()) {
      parallaxElements.forEach(
        (element) => {
          element.style.transform =
            "none";

          element.style.setProperty(
            "--parallax-y",
            "0px"
          );
        }
      );

      revealElements.forEach(
        (element) => {
          element.classList.add(
            "is-visible",
            "revealed",
            "visible"
          );
        }
      );
    }

    requestScrollUpdate();
  }

  function setupMotionPreference() {
    if (
      typeof reducedMotionQuery.addEventListener ===
      "function"
    ) {
      reducedMotionQuery.addEventListener(
        "change",
        handleMotionPreferenceChange
      );
    } else if (
      typeof reducedMotionQuery.addListener ===
      "function"
    ) {
      reducedMotionQuery.addListener(
        handleMotionPreferenceChange
      );
    }
  }

  /* =======================================================
     INITIALIZATION
     ======================================================= */

  function init() {
    setupViewportState();

    setupMotionPreference();

    setupMobileNavigation();

    setupSmoothNavigation();

    setupRevealAnimations();

    setupExternalLinks();

    updateScrollEffects();

    win.addEventListener(
      "scroll",
      requestScrollUpdate,
      { passive: true }
    );
  }

  if (
    doc.readyState ===
    "loading"
  ) {
    doc.addEventListener(
      "DOMContentLoaded",
      init,
      { once: true }
    );
  } else {
    init();
  }
})();
