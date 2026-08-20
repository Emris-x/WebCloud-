/*
 * =========================================================
 * WebCloud — Production Front-End
 * =========================================================
 *
 * Dependency-free interaction system.
 *
 * Features:
 * - Smart sticky header
 * - Scroll indicator
 * - Smooth anchor navigation
 * - Scroll reveal animations
 * - Lightweight parallax
 * - Accessible mobile navigation
 * - Reduced-motion support
 * - Responsive viewport state
 * - External-link safety
 * - Passive event listeners
 * - requestAnimationFrame scroll handling
 * =========================================================
 */

(() => {
  "use strict";

  const doc = document;
  const win = window;
  const root = doc.documentElement;
  const body = doc.body;

  const reducedMotionQuery = win.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const state = {
    scrollY: 0,
    width: win.innerWidth,
    height: win.innerHeight,
    ticking: false,
  };

  const selectors = {
    header: ".site-header, [data-header]",
    scrollHint: ".scroll-hint, .scroll-indicator, .scroll-down, [data-scroll-indicator]",
    parallax:
      "[data-parallax], .parallax, .cloud, .cloud-layer, .sky-layer",
    reveal:
      "[data-reveal], .reveal, .fade-in, .animate-on-scroll",
    menuToggle:
      "[data-menu-toggle], .menu-toggle, .nav-toggle, .hamburger",
    menu:
      ".main-nav, [data-menu], [data-mobile-menu]",
  };

  const header = doc.querySelector(selectors.header);
  const scrollHint = doc.querySelector(selectors.scrollHint);
  const parallaxElements = Array.from(
    doc.querySelectorAll(selectors.parallax)
  );

  /* =======================================================
     UTILITIES
     ======================================================= */

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const isReducedMotion = () => reducedMotionQuery.matches;

  /* =======================================================
     HEADER
     ======================================================= */

  function updateHeader() {
    if (!header) return;

    const scrolled = state.scrollY > 24;

    header.classList.toggle("scrolled", scrolled);
    header.classList.toggle("is-scrolled", scrolled);
    header.setAttribute("data-scrolled", String(scrolled));
  }

  /* =======================================================
     SCROLL INDICATOR
     ======================================================= */

  function updateScrollHint() {
    if (!scrollHint) return;

    const fadeDistance = Math.max(state.height * 0.55, 1);

    const progress = clamp(
      state.scrollY / fadeDistance,
      0,
      1
    );

    const opacity = 1 - progress;

    scrollHint.style.opacity = String(opacity);

    scrollHint.style.pointerEvents =
      progress >= 0.98 ? "none" : "";
  }

  /* =======================================================
     PARALLAX
     ======================================================= */

  function updateParallax() {
    if (isReducedMotion()) return;

    if (!parallaxElements.length) return;

    parallaxElements.forEach((element, index) => {
      const explicitSpeed = Number.parseFloat(
        element.dataset.parallaxSpeed ||
          element.dataset.speed ||
          ""
      );

      const speed = Number.isFinite(explicitSpeed)
        ? explicitSpeed
        : 0.025 + (index % 5) * 0.012;

      const direction =
        element.dataset.parallaxDirection === "down"
          ? 1
          : -1;

      const offset =
        state.scrollY * speed * direction;

      const maxOffset = Math.max(
        state.height * 0.18,
        60
      );

      const safeOffset = clamp(
        offset,
        -maxOffset,
        maxOffset
      );

      const transform =
        `translate3d(0, ${safeOffset.toFixed(2)}px, 0)`;

      element.style.setProperty(
        "--parallax-y",
        `${safeOffset.toFixed(2)}px`
      );

      element.style.transform = transform;
    });
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

    win.requestAnimationFrame(
      updateScrollEffects
    );
  }

  /* =======================================================
     REVEAL ANIMATIONS
     ======================================================= */

  function setupRevealAnimations() {
    const elements = Array.from(
      doc.querySelectorAll(selectors.reveal)
    );

    if (!elements.length) return;

    if (
      isReducedMotion() ||
      !("IntersectionObserver" in win)
    ) {
      elements.forEach((element) => {
        element.classList.add(
          "is-visible",
          "revealed",
          "visible"
        );

        element.style.opacity = "";
        element.style.transform = "";
      });

      return;
    }

    const observer =
      new IntersectionObserver(
        (entries, currentObserver) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const element = entry.target;

            element.classList.add(
              "is-visible",
              "revealed",
              "visible"
            );

            currentObserver.unobserve(element);
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -8% 0px",
        }
      );

    elements.forEach((element) => {
      observer.observe(element);
    });
  }

  /* =======================================================
     SMOOTH NAVIGATION
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
            link.getAttribute("href");

          if (!href) return;

          let target;

          try {
            target = doc.querySelector(href);
          } catch {
            return;
          }

          if (!target) return;

          event.preventDefault();

          const headerHeight = header
            ? header.getBoundingClientRect().height
            : 0;

          const targetTop =
            target.getBoundingClientRect().top +
            win.scrollY -
            headerHeight;

          win.scrollTo({
            top: Math.max(0, targetTop),
            behavior: isReducedMotion()
              ? "auto"
              : "smooth",
          });

          if (
            window.history &&
            history.replaceState
          ) {
            history.replaceState(
              null,
              "",
              href
            );
          }

          closeMobileMenu();
        },
        { passive: false }
      );
    });
  }

  /* =======================================================
     EXTERNAL LINKS
     ======================================================= */

  function setupExternalLinks() {
    const links = Array.from(
      doc.querySelectorAll("a[href]")
    );

    const currentHost =
      win.location.hostname;

    links.forEach((link) => {
      const rawHref =
        link.getAttribute("href");

      if (!rawHref) return;

      if (
        rawHref.startsWith("#") ||
        rawHref.startsWith("/") ||
        rawHref.startsWith(".") ||
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
        url.protocol !== "http:" &&
        url.protocol !== "https:"
      ) {
        return;
      }

      if (url.hostname === currentHost) {
        return;
      }

      link.target = "_blank";
      link.rel =
        "noopener noreferrer";

      if (
        !link.getAttribute(
          "aria-label"
        ) &&
        link.textContent.trim()
      ) {
        link.setAttribute(
          "aria-label",
          `${link.textContent.trim()} (opens in a new tab)`
        );
      }
    });
  }

  /* =======================================================
     MOBILE MENU
     ======================================================= */

  let mobileMenu = null;
  let mobileToggle = null;

  function getMobileMenu() {
    if (mobileMenu) return mobileMenu;

    mobileMenu =
      doc.querySelector(
        "#mobile-menu, [data-mobile-menu]"
      ) ||
      doc.querySelector(
        ".main-nav"
      );

    return mobileMenu;
  }

  function createMobileMenu() {
    const existingNav =
      doc.querySelector(".main-nav");

    if (!existingNav) return;

    if (
      doc.querySelector(
        ".mobile-menu-toggle"
      )
    ) {
      return;
    }

    const headerElement =
      doc.querySelector(".site-header");

    if (!headerElement) return;

    /*
     * Clone the existing navigation so the
     * desktop structure remains untouched.
     */

    const mobileNav =
      existingNav.cloneNode(true);

    mobileNav.classList.add(
      "mobile-nav"
    );

    mobileNav.id = "mobile-menu";

    mobileNav.setAttribute(
      "aria-label",
      "Mobile navigation"
    );

    mobileNav.removeAttribute(
      "aria-hidden"
    );

    mobileNav
      .querySelectorAll(
        ".nav-cta"
      )
      .forEach((button) => {
        button.classList.add(
          "mobile-nav-cta"
        );
      });

    const toggle =
      doc.createElement("button");

    toggle.type = "button";

    toggle.className =
      "mobile-menu-toggle";

    toggle.setAttribute(
      "aria-label",
      "Open navigation"
    );

    toggle.setAttribute(
      "aria-controls",
      "mobile-menu"
    );

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );

    toggle.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;

    headerElement.appendChild(toggle);

    doc.body.appendChild(
      mobileNav
    );

    mobileToggle = toggle;
    mobileMenu = mobileNav;

    toggle.addEventListener(
      "click",
      () => {
        const open =
          toggle.getAttribute(
            "aria-expanded"
          ) === "true";

        if (open) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      }
    );

    mobileNav
      .querySelectorAll("a[href]")
      .forEach((link) => {
        link.addEventListener(
          "click",
          () => {
            closeMobileMenu();
          }
        );
      });
  }

  function openMobileMenu() {
    if (
      !mobileMenu ||
      !mobileToggle
    ) {
      return;
    }

    mobileMenu.classList.add(
      "is-open",
      "open",
      "active"
    );

    mobileToggle.classList.add(
      "is-active"
    );

    mobileToggle.setAttribute(
      "aria-expanded",
      "true"
    );

    mobileToggle.setAttribute(
      "aria-label",
      "Close navigation"
    );

    body.classList.add(
      "menu-open"
    );
  }

  function closeMobileMenu() {
    if (
      !mobileMenu ||
      !mobileToggle
    ) {
      return;
    }

    mobileMenu.classList.remove(
      "is-open",
      "open",
      "active"
    );

    mobileToggle.classList.remove(
      "is-active"
    );

    mobileToggle.setAttribute(
      "aria-expanded",
      "false"
    );

    mobileToggle.setAttribute(
      "aria-label",
      "Open navigation"
    );

    body.classList.remove(
      "menu-open"
    );
  }

  function setupMobileMenu() {
    createMobileMenu();

    if (!mobileMenu) return;

    win.addEventListener(
      "resize",
      () => {
        if (win.innerWidth > 700) {
          closeMobileMenu();
        }
      },
      { passive: true }
    );

    doc.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "Escape") {
          closeMobileMenu();
        }
      }
    );
  }

  /* =======================================================
     VIEWPORT STATE
     ======================================================= */

  function setupResizeState() {
    const update = () => {
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

      requestScrollUpdate();
    };

    win.addEventListener(
      "resize",
      update,
      { passive: true }
    );

    update();
  }

  /* =======================================================
     REDUCED MOTION CHANGE
     ======================================================= */

  function setupMotionPreference() {
    const handleChange = () => {
      requestScrollUpdate();

      if (isReducedMotion()) {
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
      }
    };

    if (
      typeof reducedMotionQuery.addEventListener ===
      "function"
    ) {
      reducedMotionQuery.addEventListener(
        "change",
        handleChange
      );
    } else if (
      typeof reducedMotionQuery.addListener ===
      "function"
    ) {
      reducedMotionQuery.addListener(
        handleChange
      );
    }
  }

  /* =======================================================
     INITIALIZATION
     ======================================================= */

  function init() {
    setupResizeState();

    setupMotionPreference();

    setupRevealAnimations();

    setupSmoothNavigation();

    setupExternalLinks();

    setupMobileMenu();

    updateScrollEffects();

    win.addEventListener(
      "scroll",
      requestScrollUpdate,
      { passive: true }
    );
  }

  if (
    doc.readyState === "loading"
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
