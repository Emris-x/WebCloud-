/* =========================================================
   WEBCLOUD — GLOBAL INTERACTION SYSTEM
   Version: 2.0
   Purpose:
   - Mobile navigation
   - Smooth scrolling
   - Active navigation state
   - Scroll effects
   - Accessibility
   - Glass interaction support
   - Safe multi-page behavior
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     DOM READY
     ======================================================= */

  const initWebCloud = () => {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const body = document.body;

    const menuToggle =
      document.querySelector(".menu-toggle");

    const mobileNav =
      document.querySelector(".mobile-nav");

    const mobileNavLinks =
      mobileNav
        ? mobileNav.querySelectorAll("a")
        : [];

    const header =
      document.querySelector(".site-header");

    const allLinks =
      document.querySelectorAll('a[href]');


    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    if (menuToggle && mobileNav) {

      const openMenu = () => {

        menuToggle.classList.add("is-active");

        mobileNav.classList.add("is-open");

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

        body.classList.add("menu-open");

      };


      const closeMenu = () => {

        menuToggle.classList.remove("is-active");

        mobileNav.classList.remove("is-open");

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

        body.classList.remove("menu-open");

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


      menuToggle.addEventListener(
        "click",
        toggleMenu
      );


      /* Close after clicking a navigation link */

      mobileNavLinks.forEach((link) => {

        link.addEventListener(
          "click",
          () => {

            closeMenu();

          }
        );

      });


      /* Close with Escape */

      document.addEventListener(
        "keydown",
        (event) => {

          if (
            event.key === "Escape" &&
            menuToggle.getAttribute(
              "aria-expanded"
            ) === "true"
          ) {

            closeMenu();

            menuToggle.focus();

          }

        }
      );


      /* Close when clicking outside */

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


          const clickedInsideMenu =
            mobileNav.contains(event.target);

          const clickedToggle =
            menuToggle.contains(event.target);


          if (
            !clickedInsideMenu &&
            !clickedToggle
          ) {

            closeMenu();

          }

        }
      );


      /* Close menu if screen becomes desktop */

      window.addEventListener(
        "resize",
        () => {

          if (
            window.innerWidth > 900 &&
            menuToggle.getAttribute(
              "aria-expanded"
            ) === "true"
          ) {

            closeMenu();

          }

        }
      );

    }



    /* =====================================================
       SMOOTH INTERNAL NAVIGATION
       ===================================================== */

    allLinks.forEach((link) => {

      const href =
        link.getAttribute("href");

      if (!href) {
        return;
      }


      /*
       * Only handle same-page hash links.
       * External links and other HTML pages are left
       * completely untouched.
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
              20;


            window.scrollTo({

              top: Math.max(
                0,
                targetPosition
              ),

              behavior: "smooth"

            });


            /*
             * Update URL without causing
             * an abrupt browser jump.
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

    });



    /* =====================================================
       ACTIVE SECTION DETECTION
       ===================================================== */

    const sections =
      document.querySelectorAll(
        "main section[id]"
      );

    const navLinks =
      document.querySelectorAll(
        '.main-nav a[href^="#"]'
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

                if (!entry.isIntersecting) {
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
                      href ===
                      `#${currentId}`
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
            window.scrollY;


          if (scrollY > 40) {

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
       GLASS CARD POINTER INTERACTION
       ===================================================== */

    const glassCards =
      document.querySelectorAll(
        ".portfolio-card, .glass-card, .contact-links a"
      );


    glassCards.forEach(
      (card) => {

        card.addEventListener(
          "pointermove",
          (event) => {

            const rect =
              card.getBoundingClientRect();


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


    if (
      hero &&
      skyLayers.length &&
      !window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
    ) {

      let parallaxFrame = null;


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
                        (index + 1) * 0.035;


                      layer.style.transform =
                        `translate3d(0, ${scrollY * multiplier}px, 0)`;

                    }
                  );

                }


                parallaxFrame = null;

              }
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

        const currentHost =
          window.location.hostname;


        try {

          const linkURL =
            new URL(
              link.href,
              window.location.href
            );


          /*
           * Only add a new tab for genuinely
           * external destinations.
           */

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
       REDUCED MOTION ACCESSIBILITY
       ===================================================== */

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );


    const handleMotionPreference =
      (event) => {

        if (event.matches) {

          document.documentElement.classList.add(
            "reduce-motion"
          );

        } else {

          document.documentElement.classList.remove(
            "reduce-motion"
          );

        }

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
       INITIALIZATION COMPLETE
       ===================================================== */

    document.documentElement.classList.add(
      "webcloud-ready"
    );


    console.log(
      "WebCloud interaction system initialized."
    );

  };


  /* =======================================================
     START APPLICATION
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

})()
