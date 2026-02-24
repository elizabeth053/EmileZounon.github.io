/* ============================================================
   Venture Lens — main.js
   ============================================================ */

(function () {
  'use strict';

  // ── Sticky nav shadow ──────────────────────────────────────
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  // ── Mobile hamburger toggle ────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile nav when a link is clicked
    mobileNav.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Fade-in on scroll (Intersection Observer) ─────────────
  const fadeEls = document.querySelectorAll('.fade-in, .fade-in-children');

  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    fadeEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: show all immediately
    fadeEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ── Industry page tabs ────────────────────────────────────
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  if (tabBtns.length > 0) {
    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const target = btn.dataset.tab;

        // Update button states
        tabBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        // Update panel visibility
        tabPanels.forEach(function (panel) {
          panel.classList.remove('active');
        });

        const targetPanel = document.getElementById('tab-' + target);
        if (targetPanel) {
          targetPanel.classList.add('active');

          // Re-trigger fade-in for newly visible elements
          const newFadeEls = targetPanel.querySelectorAll('.fade-in, .fade-in-children');
          newFadeEls.forEach(function (el) {
            if (!el.classList.contains('visible')) {
              el.classList.add('visible');
            }
          });
        }
      });
    });

    // Support direct tab linking via URL hash (e.g. #deals)
    function activateTabFromHash() {
      const hash = window.location.hash.replace('#', '');
      const matchingBtn = document.querySelector('.tab-btn[data-tab="' + hash + '"]');
      if (matchingBtn) {
        matchingBtn.click();
      }
    }

    activateTabFromHash();
    window.addEventListener('hashchange', activateTabFromHash);
  }

  // ── Smooth scroll for anchor links ───────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height buffer
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

})();
