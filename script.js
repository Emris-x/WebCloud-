/* =========================================================
   WEBCLOUD — GLOBAL INTERACTION SYSTEM
   Version: 3.0
   Purpose:
   - Mobile navigation
   - Multi-page navigation
   - Smooth same-page scrolling
   - Active navigation state
   - Header scroll effects
   - Glass interaction
   - Hero parallax
   - Image loading states
   - Accessibility
   - Reduced-motion support
   - Safe behavior across all WebCloud pages
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     INITIALIZATION
     ======================================================= */

  const initWebCloud = () => {

    /* =====================================================
       DOM ELEMENTS
       ===================================================== */

    const body = document.body;

    const header =
      document.querySelector(".site-header");

    /*
     * IMPORTANT:
     * Your CSS uses .mobile-menu-toggle.
     * We support both names for compatibility.
     */

    const menuToggle =
      document.querySelector(
        ".mobile-menu-toggle, .menu-toggle"
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

      const setMenuState = (open) => {

        menuToggle.classList.toggle(
          "active",
          open
        );

        menuToggle.classList.toggle(
          "is-active",
          open
        );

        mobileNav.classList.toggle(
          "open",
          open
        );

        mobileNav.classList.toggle(
          "is-open",
          open
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

        mobileNav.setAttribute(
          "aria-hidden",
          String(!open)
        );

        body.classList.toggle(
          "menu-open",
          open
        );

      };


      const isMenuOpen = () => {

        return (
          menuToggle.getAttribute(
            "aria-expanded"
          ) === "true"
        );

      };


      /* Initial accessibility state */

      if (
        !menuToggle.hasAttribute(
          "aria-expanded"
        )
      ) {

        menuToggle.setAttribute(
          "aria-expanded",
          "false"
        );

      }


      if (
        !menuToggle.hasAttribute(
          "aria-label"
        )
      ) {

        menuToggle.setAttribute(
          "aria-label",
          "Open navigation menu"
        );

      }


      mobileNav.setAttribute(
        "aria-hidden",
        "true"
      );


      /* Toggle */

      menuToggle.addEventListener(
        "click",
        (event) => {

          event.preventDefault();
          event.stopPropagation();

          setMenuState(
            !isMenuOpen()
          );

        }
      );


      /* Close after selecting a link */

      mobileNavLinks.forEach(
        (link) => {

          link.addEventListener(
            "click",
            () => {

              setMenuState(false);

            }
          );

        }
      );


      /* Escape key */

      document.addEventListener(
        "keydown",
        (event) => {

          if (
            event.key === "Escape" &&
            isMenuOpen()
          ) {

            setMenuState(false);

            menuToggle.focus();

          }

        }
      );


      /* Click outside */

      document.addEventListener(
        "click",
        (event) => {

          if (!isMenuOpen()) {
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

            setMenuState(false);

          }

        }
      );


      /* Close when returning to desktop */

      window.addEventListener(
        "resize",
        () => {

          if (
            window.innerWidth > 720 &&
            isMenuOpen()
          ) {

            setMenuState(false);

          }

        }
      );

    }



    /* =====================================================
       SMOOTH SAME-PAGE NAVIGATION
       ===================================================== */

    allLinks.forEach(
      (link) => {

        const href =
          link.getAttribute("href");


        if (!href) {
          return;
        }


        /*
         * Only intercept pure hash links.
         *
         * Examples:
         * #services
         * #work
         * #contact
         *
         * We DO NOT interfere with:
         * products.html
         * founder.html
         * terms.html
         * https://...
         */

        if (
          href.startsWith("#") &&
          href.length > 1
        ) {

          link.addEventListener(
            "click",
            (event) => {

              const targetId =
                href.substring(1);

              const target =
                document.getElementById(
                  targetId
                );


              if (!target) {
                return;
              }


              event.preventDefault();


              const headerHeight =
                header
                  ? header.offsetHeight
                  : 0;


              const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                16;


              window.scrollTo({

                top: Math.max(
                  0,
                  targetPosition
                ),

                behavior:
                  window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                  ).matches
                    ? "auto"
                    : "smooth"

              });


              /*
               * Update the URL without
               * causing the browser to jump.
               */

              if (
                window.history &&
                window.history.pushState
              ) {

                window.history.pushState(
                  null,
                  "",
                  href
                );

              }

            }
          );

        }

      }
    );



    /* =====================================================
       ACTIVE NAVIGATION
       ===================================================== */

    const sections =
      document.querySelectorAll(
        "main section[id]"
      );

    const desktopNavLinks =
      document.querySelectorAll(
        '.main-nav a[href^="#"]'
      );

    const mobileLinks =
      document.querySelectorAll(
        '.mobile-nav a[href^="#"]'
      );

    const updateActiveLinks =
      (currentId) => {

        [
          ...desktopNavLinks,
          ...mobileLinks
        ].forEach(
          (link) => {

            const href =
              link.getAttribute(
                "href"
              );


            const active =
              href ===
              `#${currentId}`;


            link.classList.toggle(
              "is-active",
              active
            );

          }
        );

      };


    if (
      sections.length &&
      "IntersectionObserver" in window
    ) {

      const sectionObserver =
        new IntersectionObserver(
          (entries) => {

            const visibleSections =
              [...entries]
                .filter(
                  (entry) =>
                    entry.isIntersecting
                )
                .sort(
                  (a, b) =>
                    b.intersectionRatio -
                    a.intersectionRatio
                );


            if (
              visibleSections.length
            ) {

              updateActiveLinks(
                visibleSections[0]
                  .target
                  .id
              );

            }

          },
          {
            root: null,

            rootMargin:
              "-25% 0px -60% 0px",

            threshold: [
              0,
              0.1,
              0.25,
              0.5
            ]

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
       HEADER SCROLL EFFECT
       ===================================================== */

    if (header) {

      let ticking = false;


      const updateHeader =
        () => {

          const scrolled =
            window.scrollY > 40;


          header.classList.toggle(
            "scrolled",
            scrolled
          );

          header.classList.toggle(
            "is-scrolled",
            scrolled
          );

          header.dataset.scrolled =
            String(scrolled);


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
       GLASS CARD POINTER EFFECT
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

        /*
         * Don't run pointer effects on touch-only devices.
         */

        if (
          window.matchMedia(
            "(hover: none)"
          ).matches
        ) {

          return;

        }


        card.addEventListener(
          "pointermove",
          (event) => {

            const rect =
              card.getBoundingClientRect();


            if (
              !rect.width ||
              !rect.height
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

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );


    if (
      hero &&
      skyLayers.length &&
      !reducedMotion.matches &&
      !window.matchMedia(
        "(hover: none)"
      ).matches
    ) {

      let parallaxFrame =
        null;


      window.addEventListener(
        "scroll",
        () => {

          if (parallaxFrame) {
            return;
          }


          parallaxFrame =
            window.requestAnimationFrame(
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
                        (index + 1) *
                        0.035;


                      layer.style.transform =
                        `translate3d(0, ${scrollY * multiplier}px, 0)`;

                    }
                  );

                }


                parallaxFrame =
                  null;

              }
            );

        },
        {
          passive: true
        }
      );

    }



    /* =====================================================
       IMAGE LOADING STATES
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

        document.documentElement.classList.toggle(
          "reduce-motion",
          event.matches
        );

      };


    handleMotionPreference(
      reducedMotion
    );


    if (
      reducedMotion.addEventListener
    ) {

      reducedMotion.addEventListener(
        "change",
        handleMotionPreference
      );

    }



    /* =====================================================
       FOOTER YEAR
       ===================================================== */

    const yearElements =
      document.querySelectorAll(
        "[data-current-year]"
      );


    yearElements.forEach(
      (element) => {

        element.textContent =
          new Date().getFullYear();

      }
    );



    /* =====================================================
       PAGE LOAD STATE
       ===================================================== */

    document.documentElement.classList.add(
      "webcloud-ready"
    );


    /*
     * Prevent accidental flash of an open
     * mobile menu when the page loads.
     */

    if (
      mobileNav &&
      menuToggle
    ) {

      mobileNav.classList.remove(
        "open",
        "is-open"
      );

      menuToggle.classList.remove(
        "active",
        "is-active"
      );

    }


    /* =====================================================
       DEBUG
       ===================================================== */

    console.log(
      "WebCloud 3.0 interaction system initialized."
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
