/* =========================================================
   WEBCLOUD — GLOBAL JAVASCRIPT
   Mobile navigation + interactions
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =======================================================
     MOBILE NAVIGATION
     ======================================================= */

  const menuToggle = document.getElementById("mobile-menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  if (menuToggle && mobileNav) {
    const mobileLinks = mobileNav.querySelectorAll("a");

    const openMenu = () => {
      menuToggle.classList.add("is-active");
      mobileNav.classList.add("is-open");

      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close navigation menu");

      mobileNav.setAttribute("aria-hidden", "false");

      document.body.classList.add("menu-open");
    };

    const closeMenu = () => {
      menuToggle.classList.remove("is-active");
      mobileNav.classList.remove("is-open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");

      mobileNav.setAttribute("aria-hidden", "true");

      document.body.classList.remove("menu-open");
    };

    const toggleMenu = () => {
      const isOpen = mobileNav.classList.contains("is-open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    menuToggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    });

    /*
      Close the mobile menu when a navigation link is clicked.
    */
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    /*
      Close when clicking outside the navigation.
    */
    document.addEventListener("click", (event) => {
      if (!mobileNav.classList.contains("is-open")) {
        return;
      }

      const clickedInsideNav = mobileNav.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);

      if (!clickedInsideNav && !clickedToggle) {
        closeMenu();
      }
    });

    /*
      Close with Escape.
    */
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
        menuToggle.focus();
      }
    });

    /*
      If the screen becomes desktop-sized, reset the mobile menu.
    */
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    });
  }


  /* =======================================================
     HEADER SCROLL EFFECT
     ======================================================= */

  const header = document.getElementById("site-header");

  if (header) {
    const updateHeader = () => {
      if (window.scrollY > 40) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };

    updateHeader();

    window.addEventListener(
      "scroll",
      updateHeader,
      { passive: true }
    );
  }


  /* =======================================================
     SMOOTH INTERNAL NAVIGATION
     ======================================================= */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      /*
        Update the URL without causing the browser
        to jump instantly.
      */
      if (history.pushState) {
        history.pushState(null, "", targetId);
      }
    });
  });


  /* =======================================================
     REVEAL ELEMENTS
     ======================================================= */

  const revealElements = document.querySelectorAll(
    ".section-placeholder, .portfolio-section, .portfolio-card"
  );

  if ("IntersectionObserver" in window && revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }


  /* =======================================================
     REDUCED MOTION ACCESSIBILITY
     ======================================================= */

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    document.documentElement.classList.add("reduce-motion");
  }


  /* =======================================================
     IMAGE LOAD HANDLING
     ======================================================= */

  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("load", () => {
      image.classList.add("image-loaded");
    });

    /*
      Handle cached images.
    */
    if (image.complete) {
      image.classList.add("image-loaded");
    }
  });


  /* =======================================================
     CURRENT YEAR
     ======================================================= */

  const yearElements = document.querySelectorAll("[data-year]");

  yearElements.forEach((element) => {
    element.textContent = new Date().getFullYear();
  });


  /* =======================================================
     INITIAL STATE
     ======================================================= */

  if (mobileNav) {
    mobileNav.setAttribute("aria-hidden", "true");
  }

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
  }

});
