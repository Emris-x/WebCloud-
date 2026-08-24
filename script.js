/* =========================================================
   WEBCLOUD — GLOBAL INTERACTION SYSTEM
   Version: 3.0
   Purpose:
   - Universal mobile navigation
   - Cross-page navigation support
   - Smooth same-page scrolling
   - Active navigation state
   - Header scroll effects
   - Glass pointer interaction
   - Hero parallax
   - Image loading states
   - Accessibility
   - Reduced-motion support
   - Dynamic footer year
   - Safe multi-page behavior
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     INITIALIZATION
     ======================================================= */

  const initWebCloud = () => {

    /* =====================================================
       CORE ELEMENTS
       ===================================================== */

    const body = document.body;
    const html = document.documentElement;

    const header =
      document.querySelector(".site-header");

    const menuToggle =
      document.querySelector(
        ".mobile-menu-toggle"
      );

    const mobileNav =
      document.querySelector(".mobile-nav");

    const mobileNavLinks =
      mobileNav
        ? mobileNav.querySelectorAll("a")
        : [];

    const allLinks =
      document.querySelectorAll("a[href]");


    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    if (menuToggle && mobileNav) {

      /*
       * Keep the initial accessibility state
       * synchronized with the DOM.
       */

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle.setAttribute(
        "aria-label",
        "Open navigation menu"
      );

      mobileNav.setAttribute(
        "aria-hidden",
        "true"
      );


      const openMenu = () => {

        menuToggle.classList.add(
          "is-active"
        );

        mobileNav.classList.add(
          "is-open"
        );

        body.classList.add(
          "menu-open"
        );

        menuToggle.setAttribute(
          "aria-expanded",
          "true"
        );

        menuToggle.setAttribute(
          "aria-label",
          "Close navigation menu"
        );

        mobileNav.setAttribute(
          "aria-hidden",
          "false"
        );

      };


      const closeMenu = ({
        returnFocus = false
      } = {}) => {

        menuToggle.classList.remove(
          "is-active"
        );

        mobileNav.classList.remove(
          "is-open"
        );

        body.classList.remove(
          "menu-open"
        );

        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

        menuToggle.setAttribute(
          "aria-label",
          "Open navigation menu"
        );

        mobileNav.setAttribute(
          "aria-hidden",
          "true"
        );


        if (returnFocus) {
          menuToggle.focus();
        }

      };


      const toggleMenu = () => {

        const isOpen =
          menuToggle.getAttribute(
            "aria-expanded"
          ) === "true";

        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }

      };


      /* Toggle menu */

      menuToggle.addEventListener(
        "click",
        toggleMenu
      );


      /* Close after navigation */

      mobileNavLinks.forEach(
        (link) => {

          link.addEventListener(
            "click",
            () => {

              closeMenu();

            }
          );

        }
      );


      /* Escape closes menu */

      document.addEventListener(
        "keydown",
        (event) => {

          if (
            event.key === "Escape" &&
            menuToggle.getAttribute(
              "aria-expanded"
            ) === "true"
          ) {

            closeMenu({
              returnFocus: true
            });

          }

        }
      );


      /* Click outside closes menu */

      document.addEventListener(
        "click",
        (event) => {

          const isOpen =
            menuToggle.getAttribute(
              "aria-expanded"
            ) === "true";

          if (!isOpen) {
            return;
          }


          const clickedInsideNav =
            mobileNav.contains(
              event.target
            );

          const clickedToggle =
            menuToggle.contains(
              event.target
            );


          if (
            !clickedInsideNav &&
            !clickedToggle
          ) {

            closeMenu();

          }

        }
      );


      /*
       * Prevent the mobile menu from remaining open
       * after switching into desktop width.
       */

      let resizeTimer = null;

      window.addEventListener(
        "resize",
        () => {

          clearTimeout(
            resizeTimer
          );

          resizeTimer =
            setTimeout(
              () => {

                if (
                  window.innerWidth > 900
                ) {

                  closeMenu();

                }

              },
              100
            );

        }
      );

    }



    /* =====================================================
       CROSS-PAGE + SAME-PAGE NAVIGATION
       ===================================================== */

    allLinks.forEach(
      (link) => {

        const href =
          link.getAttribute("href");

        if (!href) {
          return;
        }


        /*
         * Only intercept local hash navigation.
         *
         * Examples:
         * #services
         * #contact
         * index.html#services
         *
         * External websites and actual HTML pages
         * remain normal browser navigation.
         */

        let url;

        try {

          url = new URL(
            href,
            window.location.href
          );

        } catch {
          return;
        }


        const isSameOrigin =
          url.origin ===
          window.location.origin;


        const hasHash =
          Boolean(url.hash);


        if (
          !isSameOrigin ||
          !hasHash
        ) {
          return;
        }


        /*
         * Only handle hashes that actually point
         * to an element on the current document.
         */

        const targetId =
          decodeURIComponent(
            url.hash.substring(1)
          );

        const target =
          document.getElementById(
            targetId
          );


        if (!target) {
          return;
        }


        /*
         * Determine whether the destination
         * is the current page.
         */

        const currentPath =
          window.location.pathname
            .replace(/\/+$/, "");

        const destinationPath =
          url.pathname
            .replace(/\/+$/, "");


        const samePage =
          currentPath ===
          destinationPath ||
          (
            destinationPath.endsWith(
              "/index.html"
            ) &&
            (
              currentPath === "" ||
              currentPath.endsWith("/")
            )
          );


        if (!samePage) {
          return;
        }


        link.addEventListener(
          "click",
          (event) => {

            event.preventDefault();


            /*
             * Close mobile navigation
             * before scrolling.
             */

            if (
              menuToggle &&
              menuToggle.getAttribute(
                "aria-expanded"
              ) === "true"
            ) {

              menuToggle.click();

            }


            const headerHeight =
              header
                ? header.offsetHeight
                : 0;


            const targetPosition =
              target.getBoundingClientRect()
                .top +
              window.scrollY -
              headerHeight -
              20;


            const reduceMotion =
              window.matchMedia(
                "(prefers-reduced-motion: reduce)"
              ).matches;


            window.scrollTo({

              top: Math.max(
                0,
                targetPosition
              ),

              behavior:
                reduceMotion
                  ? "auto"
                  : "smooth"

            });


            /*
             * Update URL without
             * causing browser jump.
             */

            if (
              window.history &&
              window.history.pushState
            ) {

              window.history.pushState(
                null,
                "",
                url.hash
              );

            }

          }
        );

      }
    );



    /* =====================================================
       HANDLE HASH WHEN PAGE LOADS
       ===================================================== */

    const initialHash =
      window.location.hash;


    if (initialHash) {

      const initialId =
        decodeURIComponent(
          initialHash.substring(1)
        );

      const initialTarget =
        document.getElementById(
          initialId
        );


      if (initialTarget) {

        /*
         * Give the browser a moment to finish
         * layout before correcting the position.
         */

        window.requestAnimationFrame(
          () => {

            window.setTimeout(
              () => {

                const headerHeight =
                  header
                    ? header.offsetHeight
                    : 0;


                const position =
                  initialTarget
                    .getBoundingClientRect()
                    .top +
                  window.scrollY -
                  headerHeight -
                  20;


                window.scrollTo({

                  top: Math.max(
                    0,
                    position
                  ),

                  behavior: "auto"

                });

              },
              50
            );

          }
        );

      }

    }



    /* =====================================================
       ACTIVE SECTION DETECTION
       ===================================================== */

    const sections =
      document.querySelectorAll(
        "main section[id]"
      );


    const navLinks =
      document.querySelectorAll(
        ".main-nav a[href*='#']"
      );


    if (
      sections.length &&
      navLinks.length &&
      "IntersectionObserver" in window
    ) {

      const sectionObserver =
        new IntersectionObserver(
          (entries) => {

            entries.forEach(
              (entry) => {

                if (
                  !entry.isIntersecting
                ) {
                  return;
                }


                const currentId =
                  entry.target.id;


                navLinks.forEach(
                  (link) => {

                    const href =
                      link.getAttribute(
                        "href"
                      );


                    if (
                      href &&
                      href.endsWith(
                        `#${currentId}`
                      )
                    ) {

                      link.classList.add(
                        "is-active"
                      );

                    } else {

                      link.classList.remove(
                        "is-active"
                      );

                    }

                  }
                );

              }
            );

          },
          {
            root: null,

            rootMargin:
              "-25% 0px -60% 0px",

            threshold: 0
          }
        );


      sections.forEach(
        (section) => {

          sectionObserver.observe(
            section
          );

        }
      );

    }



    /* =====================================================
       HEADER SCROLL STATE
       ===================================================== */

    if (header) {

      let ticking = false;


      const updateHeader =
        () => {

          const scrollY =
            window.scrollY ||
            window.pageYOffset ||
            0;


          if (
            scrollY > 40
          ) {

            header.classList.add(
              "is-scrolled"
            );

          } else {

            header.classList.remove(
              "is-scrolled"
            );

          }


          ticking = false;

        };


      window.addEventListener(
        "scroll",
        () => {

          if (!ticking) {

            window.requestAnimationFrame(
              updateHeader
            );

            ticking = true;

          }

        },
        {
          passive: true
        }
      );


      updateHeader();

    }



    /* =====================================================
       GLASS / CARD POINTER INTERACTION
       ===================================================== */

    const glassCards =
      document.querySelectorAll(
        [
          ".portfolio-card",
          ".glass-card",
          ".contact-links a"
        ].join(", ")
      );


    glassCards.forEach(
      (card) => {

        card.addEventListener(
          "pointermove",
          (event) => {

            const rect =
              card.getBoundingClientRect();


            if (
              rect.width === 0 ||
              rect.height === 0
            ) {
              return;
            }


            const x =
              event.clientX -
              rect.left;


            const y =
              event.clientY -
              rect.top;


            const percentX =
              (x / rect.width) * 100;


            const percentY =
              (y / rect.height) * 100;


            card.style.setProperty(
              "--pointer-x",
              `${percentX}%`
            );


            card.style.setProperty(
              "--pointer-y",
              `${percentY}%`
            );

          }
        );


        card.addEventListener(
          "pointerleave",
          () => {

            card.style.removeProperty(
              "--pointer-x"
            );

            card.style.removeProperty(
              "--pointer-y"
            );

          }
        );

      }
    );



    /* =====================================================
       HERO PARALLAX
       ===================================================== */

    const hero =
      document.querySelector(".hero");


    const skyLayers =
      document.querySelectorAll(
        ".sky-layer"
      );


    const reducedMotionQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );


    if (
      hero &&
      skyLayers.length &&
      !reducedMotionQuery.matches
    ) {

      let parallaxFrame = null;


      const updateParallax =
        () => {

          const scrollY =
            window.scrollY;


          if (
            scrollY <
            window.innerHeight * 1.2
          ) {

            skyLayers.forEach(
              (layer, index) => {

                const multiplier =
                  (index + 1) * 0.035;


                layer.style.transform =
                  `translate3d(0, ${scrollY * multiplier}px, 0)`;

              }
            );

          }


          parallaxFrame = null;

        };


      window.addEventListener(
        "scroll",
        () => {

          if (parallaxFrame) {
            return;
          }


          parallaxFrame =
            window.requestAnimationFrame(
              updateParallax
            );

        },
        {
          passive: true
        }
      );

    }



    /* =====================================================
       IMAGE LOAD ENHANCEMENT
       ===================================================== */

    const images =
      document.querySelectorAll(
        "img"
      );


    images.forEach(
      (image) => {

        if (
          image.complete &&
          image.naturalWidth > 0
        ) {

          image.classList.add(
            "is-loaded"
          );

          return;

        }


        image.addEventListener(
          "load",
          () => {

            image.classList.add(
              "is-loaded"
            );

          },
          {
            once: true
          }
        );


        image.addEventListener(
          "error",
          () => {

            image.classList.add(
              "is-error"
            );


            console.warn(
              "WebCloud: Image failed to load:",
              image.src
            );

          },
          {
            once: true
          }
        );

      }
    );



    /* =====================================================
       EXTERNAL LINKS
       ===================================================== */

    const externalLinks =
      document.querySelectorAll(
        'a[href^="http://"], a[href^="https://"]'
      );


    externalLinks.forEach(
      (link) => {

        try {

          const linkURL =
            new URL(
              link.href,
              window.location.href
            );


          const currentHost =
            window.location.hostname;


          if (
            linkURL.hostname &&
            linkURL.hostname !== currentHost
          ) {

            link.setAttribute(
              "target",
              "_blank"
            );


            link.setAttribute(
              "rel",
              "noopener noreferrer"
            );

          }

        } catch (error) {

          console.warn(
            "WebCloud: Invalid link:",
            link.href
          );

        }

      }
    );



    /* =====================================================
       REDUCED MOTION
       ===================================================== */

    const handleMotionPreference =
      (event) => {

        if (
          event.matches
        ) {

          html.classList.add(
            "reduce-motion"
          );

        } else {

          html.classList.remove(
            "reduce-motion"
          );

        }

      };


    handleMotionPreference(
      reducedMotionQuery
    );


    if (
      reducedMotionQuery.addEventListener
    ) {

      reducedMotionQuery.addEventListener(
        "change",
        handleMotionPreference
      );

    }



    /* =====================================================
       CURRENT YEAR
       ===================================================== */

    const yearElements =
      document.querySelectorAll(
        "[data-current-year]"
      );


    yearElements.forEach(
      (element) => {

        element.textContent =
          new Date()
            .getFullYear();

      }
    );



    /* =====================================================
       PAGE READY STATE
       ===================================================== */

    html.classList.add(
      "webcloud-ready"
    );


    /*
     * Small accessibility enhancement:
     * expose the navigation only after JS
     * has initialized.
     */

    if (mobileNav) {

      mobileNav.setAttribute(
        "aria-hidden",
        "true"
      );

    }


    console.log(
      "WebCloud interaction system initialized — v3.0"
    );

  };


  /* =======================================================
     START
     ======================================================= */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initWebCloud,
      {
        once: true
      }
    );

  } else {

    initWebCloud();

  }

})();
