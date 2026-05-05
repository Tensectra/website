/**
 * layout.js — Master nav + footer injection
 * Add <script src="../js/layout.js"></script> (or "js/layout.js" from root)
 * to every page. Change nav/footer here once — all pages update.
 *
 * Usage: place <div id="site-nav"></div> and <div id="site-footer"></div>
 * in each HTML body, then this script replaces them with the canonical markup.
 * If those placeholders are absent the script does nothing (safe fallback).
 */

(function () {
  'use strict';

  /* ─── Path resolution ─────────────────────────────────────────────────── */
  // Detect if we are one level deep (pages/, forms/, payment/) or at root
  var depth = (function () {
    var p = window.location.pathname;
    // count non-empty segments after the domain
    var segs = p.replace(/^\/|\/$/g, '').split('/').filter(Boolean);
    // e.g. /pages/about → segs = ['pages','about'] → depth 2 → prefix = '../'
    // e.g. /index.html  → segs = [] or ['index.html'] → depth 0/1 → prefix = ''
    if (segs.length >= 2) return '../';
    return '';
  }());

  var r = depth; // path prefix to reach root assets

  /* ─── Active link detection ───────────────────────────────────────────── */
  function isActive(href) {
    var loc = window.location.pathname;
    // strip trailing slash and .html
    var norm = function (s) { return s.replace(/\/$/, '').replace(/\.html$/, '').replace(/\/index$/, '') || '/'; };
    var locN = norm(loc);
    var hrefN = norm(href.replace(/^\.\.\/|^\.\//,''));
    // root link '/' or './'
    if (hrefN === '' || hrefN === '/') {
      return locN === '' || locN === '/' || locN === '/index';
    }
    return locN.indexOf(hrefN) !== -1;
  }

  function navLink(href, label) {
    var cls = isActive(href) ? ' class="active"' : '';
    return '<li><a href="' + r + href + '"' + cls + '>' + label + '</a></li>';
  }

  /* ─── NAV HTML ────────────────────────────────────────────────────────── */
  var NAV = '<nav class="navbar">' +
    '<div class="container navbar-container">' +
      '<a href="' + r + './" class="navbar-logo">' +
        '<img src="' + r + 'images/logo-mark.svg" alt="Tensectra">' +
        '<span>TENSECTRA</span>' +
      '</a>' +
      '<ul class="navbar-nav">' +
        navLink('./', 'Home') +
        navLink('pages/infrastructure', 'The Kit') +
        navLink('pages/cohorts', 'Cohorts') +
        navLink('pages/courses', 'Courses') +
        navLink('pages/consultancy', 'For Teams') +
        navLink('pages/about', 'About') +
      '</ul>' +
      '<div class="navbar-cta">' +
        '<a href="' + r + 'pages/infrastructure" class="btn btn-primary btn-sm" data-track="nav_get_kit">Get the Kit &rarr;</a>' +
        '<button class="theme-toggle-btn" aria-label="Toggle theme">' +
          '<svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>' +
          '<svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>' +
        '</button>' +
      '</div>' +
      '<button class="mobile-menu-btn" aria-label="Toggle menu"><span></span><span></span><span></span></button>' +
    '</div>' +
  '</nav>';

  /* ─── FOOTER HTML ─────────────────────────────────────────────────────── */
  var FOOTER = '<footer class="footer">' +
    '<img src="' + r + 'images/favicon.svg" alt="" class="footer-watermark">' +
    '<div class="container">' +
      '<div class="footer-grid">' +
        '<div class="footer-col">' +
          '<h4>Products</h4>' +
          '<ul class="footer-links">' +
            '<li><a href="' + r + 'pages/infrastructure">The Kit</a></li>' +
            '<li><a href="' + r + 'pages/cohorts">Cohorts</a></li>' +
            '<li><a href="' + r + 'pages/courses">Courses</a></li>' +
            '<li><a href="' + r + 'pages/pro">Pro Membership</a></li>' +
          '</ul>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h4>Services</h4>' +
          '<ul class="footer-links">' +
            '<li><a href="' + r + 'pages/consultancy">For Teams</a></li>' +
            '<li><a href="' + r + 'pages/consultancy">Corporate Training</a></li>' +
            '<li><a href="' + r + 'pages/consultancy">Retainer</a></li>' +
          '</ul>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h4>Company</h4>' +
          '<ul class="footer-links">' +
            '<li><a href="' + r + 'pages/about">About</a></li>' +
            '<li><a href="#">Blog</a></li>' +
            '<li><a href="' + r + 'pages/careers">Careers</a></li>' +
            '<li><a href="' + r + 'forms/contact">Contact</a></li>' +
            '<li><a href="' + r + 'forms/affiliate-inquiry">Affiliates</a></li>' +
          '</ul>' +
        '</div>' +
        '<div class="footer-col">' +
          '<h4>Legal</h4>' +
          '<ul class="footer-links">' +
            '<li><a href="' + r + 'pages/privacy">Privacy Policy</a></li>' +
            '<li><a href="' + r + 'pages/terms">Terms of Service</a></li>' +
          '</ul>' +
          '<div class="footer-social">' +
            '<a href="https://www.linkedin.com/company/tensectra/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg></a>' +
            '<a href="https://discord.gg/tensectra" target="_blank" rel="noopener" aria-label="Discord"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg></a>' +
            '<a href="#" aria-label="YouTube"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>' +
            '<a href="#" aria-label="GitHub"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg></a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<p class="footer-tagline">AI writes the code. You design the architecture.</p>' +
        '<p style="color:var(--text-muted);font-size:0.85rem;margin-top:var(--space-sm);">&copy; 2026 Tensectra. All rights reserved.</p>' +
      '</div>' +
    '</div>' +
  '</footer>';

  /* ─── Injection ───────────────────────────────────────────────────────── */
  function inject(id, html) {
    var el = document.getElementById(id);
    if (!el) return;
    el.outerHTML = html;
  }

  /* ─── Mobile menu — self-contained, no dependency on main.js ─────────── */
  function wireMenu() {
    var btn = document.querySelector('.mobile-menu-btn');
    var nav = document.querySelector('.navbar-nav');
    if (!btn || !nav) return;

    // Prevent double-wiring (main.js DOMContentLoaded may also call initMobileMenu)
    if (btn.getAttribute('data-wired')) return;

    // Remove any stale listeners by cloning
    var fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
    fresh.setAttribute('data-wired', '1');

    fresh.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('active');
      fresh.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link tap (single-page feel on mobile)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('active');
        fresh.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close on outside tap
    document.addEventListener('click', function (e) {
      if (!fresh.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('active');
        fresh.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  /* ─── Theme toggle — self-contained ──────────────────────────────────── */
  function wireTheme() {
    var btn = document.querySelector('.theme-toggle-btn');
    if (!btn) return;
    var fresh = btn.cloneNode(true);
    btn.parentNode.replaceChild(fresh, btn);
    fresh.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('tensectra-theme', next); } catch (e) {}
    });
  }

  // Run immediately if DOM is ready, else wait
  function run() {
    inject('site-nav', NAV);
    inject('site-footer', FOOTER);
    wireMenu();
    wireTheme();
    // Also call main.js helpers if they happen to be loaded already
    if (typeof initThemeToggle === 'function') initThemeToggle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
}());
