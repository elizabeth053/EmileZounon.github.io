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

// ============================================================
//  Live News Feed — Today's Top Stories
// ============================================================
(function initNewsFeed() {
  var grid    = document.getElementById('news-grid');
  var errorEl = document.getElementById('news-error');
  var dateEl  = document.getElementById('news-date');
  if (!grid) return;

  // Display today's date in the subtitle
  if (dateEl) {
    var d = new Date();
    var opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    dateEl.textContent = 'Business, economics & venture news — ' +
      d.toLocaleDateString('en-GB', opts);
  }

  // RSS sources — fetched via rss2json.com (free tier, no key needed, no count param)
  var FEEDS = [
    { name: 'NY Times',      color: '#1a1a1a', url: 'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml'          },
    { name: 'Bloomberg',     color: '#1D4ED8', url: 'https://feeds.bloomberg.com/markets/news.rss'                       },
    { name: 'TechCrunch',   color: '#4F46E5', url: 'https://techcrunch.com/category/startups/feed/'                     },
    { name: 'Hacker News',  color: '#F97316', url: 'https://news.ycombinator.com/rss'                                   },
    { name: 'VentureBeat',  color: '#7C3AED', url: 'https://venturebeat.com/feed/'                                      },
    { name: 'The Economist', color: '#059669', url: 'https://www.economist.com/finance-and-economics/rss.xml'            },
    { name: 'CNBC',         color: '#0891B2', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html'              },
    { name: 'Biz Insider',  color: '#DC2626', url: 'https://feeds.businessinsider.com/custom/all'                       }
  ];

  var API = 'https://api.rss2json.com/v1/api.json?rss_url=';

  function fetchFeed(feed) {
    return fetch(API + encodeURIComponent(feed.url))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.items) return [];
        // Fetch up to 6 per source (shown in full when that source is selected)
        return data.items.slice(0, 6).map(function (item) {
          return {
            title:  item.title,
            link:   item.link,
            date:   new Date(item.pubDate),
            source: feed.name,
            color:  feed.color
          };
        });
      })
      .catch(function () { return []; });
  }

  function fmt(date) {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function renderCard(a, hidden) {
    return '<div class="news-card' + (hidden ? ' news-card--hidden' : '') + '" data-source="' + a.source + '" style="--news-color:' + a.color + ';">' +
      '<div class="news-card__meta">' +
        '<span class="news-tag" style="background:' + a.color + ';">' + a.source + '</span>' +
        '<span class="news-card__date">' + fmt(a.date) + '</span>' +
      '</div>' +
      '<div class="news-card__title">' + a.title + '</div>' +
      '<a href="' + a.link + '" target="_blank" rel="noopener" class="news-card__link">Read story →</a>' +
    '</div>';
  }

  Promise.all(FEEDS.map(fetchFeed)).then(function (results) {
    var allArticles = [];
    results.forEach(function (r) { allArticles = allArticles.concat(r); });

    if (allArticles.length === 0) {
      grid.innerHTML = '';
      if (errorEl) errorEl.style.display = '';
      return;
    }

    // Sort all articles newest first
    allArticles.sort(function (a, b) { return b.date - a.date; });

    // Render all articles — only top 12 visible in "All" mode, rest hidden
    grid.innerHTML = allArticles.map(function (a, i) {
      return renderCard(a, i >= 12);
    }).join('');

    // ── Source filter pills ──────────────────────────────────
    var pills = document.querySelectorAll('.news-source-pill[data-source]');

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var source = pill.dataset.source;

        // Update active pill
        pills.forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');

        var cards = grid.querySelectorAll('.news-card');

        if (source === 'all') {
          // Show top 12 across all sources
          var shown = 0;
          cards.forEach(function (card) {
            if (shown < 12) {
              card.classList.remove('news-card--hidden');
              shown++;
            } else {
              card.classList.add('news-card--hidden');
            }
          });
        } else {
          // Show all fetched articles from this source
          cards.forEach(function (card) {
            if (card.dataset.source === source) {
              card.classList.remove('news-card--hidden');
            } else {
              card.classList.add('news-card--hidden');
            }
          });
        }
      });
    });
  });
}());
