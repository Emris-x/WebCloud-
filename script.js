/**
 * WebCloud — Production Front-End
 * Version: 1.0.0
 *
 * Handles:
 * - Fixed header state
 * - Hero atmosphere / parallax
 * - Smooth internal navigation
 * - Mobile navigation drawer
 * - Escape/backdrop menu closing
 * - Scroll reveal
 * - Reduced-motion support
 * - External-link accessibility
 * - Visibility-aware animation
 */

(() => {
  "use strict";

  const doc = document;
  const win = window;
  const root = doc.documentElement;
  const body = doc.body;

  const reducedMotion = win.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const coarsePointer = win.matchMedia(
    "(hover: none), (pointer: coarse)"
  );

  const header = doc.querySelector(".site-header");
  const hero = doc.querySelector(".hero");
  const scrollHint = doc.querySelector(".scroll-hint");

  const layers = [
    ...doc.querySelectorAll(".sky-layer")
  ];

  const particleField =
    doc.querySelector(".particle-field");

  const menuToggle =
    doc.querySelector("#mobile-menu-toggle");

  const mobileNav =
    doc.querySelector("#mobile-nav");

  const menuClose =
    doc.querySelector("#mobile-nav-close");

  const menuBackdrop =
    doc.querySelector("#menu-backdrop");

  let rafId = 0;
  let pointerRaf = 0;
  let pageVisible = !doc.hidden;
  let lastFocusedElement = null;

  const clamp = (value, min, max) =>
    Math.min(Math.max(value, min), max);

  const isReducedMotion = () =>
    reducedMotion.matches;

  /* =========================================================
     HEADER
     ========================================================= */

  function updateHeader(scrollY) {
    if (!header) return;

    const scrolled = scrollY > 24;

    header.classList.toggle(
      "is-scrolled",
      scrolled
    );

    header.setAttribute(
      "data-scrolled",
      String(scrolled)
    );
  }

  /* =========================================================
     HERO ATMOSPHERE
     ========================================================= */

  function updateHero(scrollY) {
    if (!hero || !layers.length) return;

    if (isReducedMotion()) {
      layers.forEach((layer) => {
        layer.style.transform = "";
        layer.style.removeProperty("--pointer-x");
        layer.style.removeProperty("--pointer-y");
      });

      if (particleField) {
        particleField.style.transform = "";
        particleField.style.opacity = "";
      }

      return;
    }

    const heroHeight = Math.max(
      hero.offsetHeight,
      win.innerHeight,
      1
    );

    const progress = clamp(
      scrollY / heroHeight,
      0,
      1.15
    );

    const depths = [
      0.10,
      0.18,
      0.28
    ];

    layers.forEach((layer, index) => {
      const depth =
        depths[index] ?? 0.16;

      const y =
        progress * 150 * depth;

      const x =
        Math.sin(
          progress * Math.PI * 1.6 + index
        ) * 12;

      const scale =
        1 +
        progress *
          depth *
          0.035;

      layer.style.transform =
        `translate3d(
          ${x.toFixed(2)}px,
          ${y.toFixed(2)}px,
          0
        ) scale(${scale.toFixed(4)})`;
    });

    if (particleField) {
      particleField.style.transform =
        `translate3d(
          0,
          ${(progress * 42).toFixed(2)}px,
          0
        )`;

      particleField.style.opacity =
        String(
          clamp(
            0.65 - progress * 0.18,
            0.2,
            0.65
          )
        );
    }
  }

  /* =========================================================
     SCROLL HINT
     ========================================================= */

  function updateScrollHint(scrollY) {
    if (!scrollHint) return;

    const opacity =
      clamp(
        1 - scrollY / 180,
        0,
        1
      );

    scrollHint.style.opacity =
      opacity.toFixed(3);

    scrollHint.style.pointerEvents =
      opacity <= 0
        ? "none"
        : "";
  }

  /* =========================================================
     RENDER LOOP
     ========================================================= */

  function render() {
    rafId = 0;

    if (!pageVisible) return;

    const scrollY =
      win.scrollY ||
      root.scrollTop ||
      0;

    updateHeader(scrollY);
    updateHero(scrollY);
    updateScrollHint(scrollY);
  }

  function requestRender() {
    if (
      rafId ||
      !pageVisible
    ) {
      return;
    }

    rafId =
      win.requestAnimationFrame(
        render
      );
  }

  win.addEventListener(
    "scroll",
    requestRender,
    {
      passive: true
    }
  );

  /* =========================================================
     SMOOTH INTERNAL NAVIGATION
     ========================================================= */

  function setupSmoothNavigation() {
    doc
      .querySelectorAll(
        'a[href^="#"]'
      )
      .forEach((link) => {
        link.addEventListener(
          "click",
          (event) => {
            const href =
              link.getAttribute(
                "href"
              );

            if (
              !href ||
              href === "#"
            ) {
              return;
            }

            let target;

            try {
              target =
                doc.querySelector(
                  href
                );
            } catch {
              return;
            }

            if (!target) {
              return;
            }

            event.preventDefault();

            const headerHeight =
              header
                ? header.getBoundingClientRect()
                    .height
                : 0;

            const extraOffset = 18;

            const targetTop =
              target.getBoundingClientRect()
                .top +
              win.scrollY -
              headerHeight -
              extraOffset;

            win.scrollTo({
              top: Math.max(
                0,
                targetTop
              ),
              behavior:
                isReducedMotion()
                  ? "auto"
                  : "smooth"
            });

            if (
              history.replaceState
            ) {
              history.replaceState(
                null,
                "",
                href
              );
            }

            closeMobileMenu();

            if (
              !target.hasAttribute(
                "tabindex"
              )
            ) {
              target.setAttribute(
                "tabindex",
                "-1"
              );
            }

            try {
              target.focus({
                preventScroll: true
              });
            } catch {
              target.focus();
            }
          }
        );
      });
  }

  /* =========================================================
     MOBILE NAVIGATION
     ========================================================= */

  function setMenuState(open) {
    if (
      !mobileNav ||
      !menuToggle
    ) {
      return;
    }

    mobileNav.classList.toggle(
      "is-open",
      open
    );

    mobileNav.setAttribute(
      "aria-hidden",
      String(!open)
    );

    menuToggle.setAttribute(
      "aria-expanded",
      String(open)
    );

    menuToggle.setAttribute(
      "aria-label",
      open
        ? "Close navigation menu"
        : "Open navigation menu"
    );

    if (menuBackdrop) {
      menuBackdrop.classList.toggle(
        "is-visible",
        open
      );

      menuBackdrop.setAttribute(
        "aria-hidden",
        String(!open)
      );
    }

    body.classList.toggle(
      "menu-open",
      open
    );

    if (open) {
      lastFocusedElement =
        doc.activeElement;

      const firstLink =
        mobileNav.querySelector(
          "a[href], button:not([disabled])"
        );

      if (firstLink) {
        win.setTimeout(
          () => firstLink.focus(),
          30
        );
      }
    } else if (
      lastFocusedElement instanceof
      HTMLElement
    ) {
      try {
        lastFocusedElement.focus({
          preventScroll: true
        });
      } catch {
        lastFocusedElement.focus();
      }

      lastFocusedElement = null;
    }
  }

  function openMobileMenu() {
    setMenuState(true);
  }

  function closeMobileMenu() {
    setMenuState(false);
  }

  function setupMobileMenu() {
    if (
      !menuToggle ||
      !mobileNav
    ) {
      return;
    }

    menuToggle.addEventListener(
      "click",
      () => {
        const isOpen =
          menuToggle.getAttribute(
            "aria-expanded"
          ) === "true";

        if (isOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      }
    );

    if (menuClose) {
      menuClose.addEventListener(
        "click",
        closeMobileMenu
      );
    }

    if (menuBackdrop) {
      menuBackdrop.addEventListener(
        "click",
        closeMobileMenu
      );
    }

    mobileNav
      .querySelectorAll(
        "a[href]"
      )
      .forEach((link) => {
        link.addEventListener(
          "click",
          () => {
            closeMobileMenu();
          }
        );
      });

    doc.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key === "Escape"
        ) {
          closeMobileMenu();
          return;
        }

        if (
          event.key !== "Tab"
        ) {
          return;
        }

        if (
          mobileNav.getAttribute(
            "aria-hidden"
          ) !== "false"
        ) {
          return;
        }

        const focusable = [
          ...mobileNav.querySelectorAll(
            `
            a[href],
            button:not([disabled]),
            [tabindex]:not([tabindex="-1"])
            `
          )
        ].filter(
          (element) =>
            element.offsetParent !== null
        );

        if (!focusable.length) {
          return;
        }

        const first =
          focusable[0];

        const last =
          focusable[
            focusable.length - 1
          ];

        if (
          event.shiftKey &&
          doc.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          doc.activeElement === last
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    );

    win.addEventListener(
      "resize",
      () => {
        if (
          win.innerWidth > 860
        ) {
          closeMobileMenu();
        }

        requestRender();
      },
      {
        passive: true
      }
    );
  }

  /* =========================================================
     SCROLL REVEALS
     ========================================================= */

  function setupRevealAnimations() {
    const revealTargets = [
      ...doc.querySelectorAll(
        `
        .section-placeholder,
        .portfolio-section,
        .site-footer
        `
      )
    ];

    if (
      !revealTargets.length
    ) {
      return;
    }

    const canAnimate =
      !isReducedMotion() &&
      "IntersectionObserver" in win;

    if (!canAnimate) {
      revealTargets.forEach(
        (element) => {
          element.classList.add(
            "is-visible"
          );
        }
      );

      return;
    }

    revealTargets.forEach(
      (element) => {
        element.classList.add(
          "reveal-on-scroll"
        );
      }
    );

    const observer =
      new IntersectionObserver(
        (
          entries,
          currentObserver
        ) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }

              entry.target.classList.add(
                "is-visible"
              );

              currentObserver.unobserve(
                entry.target
              );
            }
          );
        },
        {
          threshold: 0.10,
          rootMargin:
            "0px 0px -7% 0px"
        }
      );

    revealTargets.forEach(
      (element) =>
        observer.observe(element)
    );
  }

  /* =========================================================
     EXTERNAL LINKS
     ========================================================= */

  function setupExternalLinks() {
    const currentHost =
      win.location.hostname;

    doc
      .querySelectorAll(
        "a[href]"
      )
      .forEach((link) => {
        const rawHref =
          link.getAttribute(
            "href"
          );

        if (
          !rawHref ||
          rawHref.startsWith("#")
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
          ![
            "http:",
            "https:"
          ].includes(
            url.protocol
          )
        ) {
          return;
        }

        if (
          url.hostname !==
          currentHost
        ) {
          link.target =
            "_blank";

          const rel =
            new Set(
              (
                link.getAttribute(
                  "rel"
                ) || ""
              )
                .split(/\s+/)
                .filter(Boolean)
            );

          rel.add(
            "noopener"
          );

          rel.add(
            "noreferrer"
          );

          link.setAttribute(
            "rel",
            [...rel].join(" ")
          );
        }
      });
  }

  /* =========================================================
     POINTER ATMOSPHERE
     ========================================================= */

  function setupPointerAtmosphere() {
    if (
      !layers.length ||
      coarsePointer.matches ||
      isReducedMotion()
    ) {
      return;
    }

    let pointerX = 0;
    let pointerY = 0;

    win.addEventListener(
      "pointermove",
      (event) => {
        pointerX =
          (
            event.clientX /
              Math.max(
                win.innerWidth,
                1
              ) -
            0.5
          ) * 2;

        pointerY =
          (
            event.clientY /
              Math.max(
                win.innerHeight,
                1
              ) -
            0.5
          ) * 2;

        if (pointerRaf) {
          return;
        }

        pointerRaf =
          win.requestAnimationFrame(
            () => {
              pointerRaf = 0;

              layers.forEach(
                (
                  layer,
                  index
                ) => {
                  const strength =
                    (index + 1) *
                    2.5;

                  layer.style.setProperty(
                    "--pointer-x",
                    `${(
                      pointerX *
                      strength
                    ).toFixed(2)}px`
                  );

                  layer.style.setProperty(
                    "--pointer-y",
                    `${(
                      pointerY *
                      strength
                    ).toFixed(2)}px`
                  );
                }
              );
            }
          );
      },
      {
        passive: true
      }
    );
  }

  /* =========================================================
     PAGE VISIBILITY
     ========================================================= */

  function setupVisibilityHandling() {
    doc.addEventListener(
      "visibilitychange",
      () => {
        pageVisible =
          !doc.hidden;

        if (pageVisible) {
          requestRender();
        }
      }
    );
  }

  /* =========================================================
     REDUCED MOTION
     ========================================================= */

  function setupMotionPreference() {
    const handleMotionChange =
      () => {
        if (
          isReducedMotion()
        ) {
          layers.forEach(
            (layer) => {
              layer.style.transform =
                "";

              layer.style.removeProperty(
                "--pointer-x"
              );

              layer.style.removeProperty(
                "--pointer-y"
              );
            }
          );

          if (particleField) {
            particleField.style.transform =
              "";

            particleField.style.opacity =
              "";
          }
        }

        requestRender();
      };

    if (
      typeof reducedMotion.addEventListener ===
      "function"
    ) {
      reducedMotion.addEventListener(
        "change",
        handleMotionChange
      );
    } else if (
      typeof reducedMotion.addListener ===
      "function"
    ) {
      reducedMotion.addListener(
        handleMotionChange
      );
    }
  }

  /* =========================================================
     INITIALIZATION
     ========================================================= */

  function init() {
    root.classList.add(
      "js-ready"
    );

    setupSmoothNavigation();
    setupMobileMenu();
    setupRevealAnimations();
    setupExternalLinks();
    setupPointerAtmosphere();
    setupVisibilityHandling();
    setupMotionPreference();

    win.addEventListener(
      "resize",
      requestRender,
      {
        passive: true
      }
    );

    /*
     * Handle direct URLs such as:
     * index.html#services
     */

    if (
      win.location.hash
    ) {
      win.setTimeout(
        () => {
          let target;

          try {
            target =
              doc.querySelector(
                win.location.hash
              );
          } catch {
            return;
          }

          if (!target) {
            return;
          }

          const headerHeight =
            header
              ? header.getBoundingClientRect()
                  .height
              : 0;

          win.scrollTo({
            top:
              target.getBoundingClientRect()
                .top +
              win.scrollY -
              headerHeight -
              18,
            behavior: "auto"
          });
        },
        0
      );
    }

    requestRender();
  }

  /* =========================================================
     START
     ========================================================= */

  if (
    doc.readyState ===
    "loading"
  ) {
    doc.addEventListener(
      "DOMContentLoaded",
      init,
      {
        once: true
      }
    );
  } else {
    init();
  }

  /* =========================================================
     PUBLIC DEBUG API
     ========================================================= */

  win.WebCloud =
    Object.freeze({
      version: "1.0.0",

      refresh:
        requestRender,

      closeMenu:
        closeMobileMenu,

      reducedMotion:
        isReducedMotion
    });

})();
