/**
 * TENSECTRA — Theme Toggle
 * Light-first: default is light, respects system preference, persists to localStorage
 * Load this in <head> (before CSS renders) to prevent FOUC
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'tensectra-theme';

  function getInitialTheme() {
    var stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    // Default: light (overrides system dark preference per product decision)
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    var btns = document.querySelectorAll('.theme-toggle-btn');
    btns.forEach(function (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.dataset.themeCurrent = theme;
    });

    // Update meta theme-color for mobile chrome
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F8FAFE' : '#00CCFF');
  }

  function toggle() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'light' ? 'dark' : 'light');
  }

  // Apply before render (FOUC prevention)
  applyTheme(getInitialTheme());

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', toggle);
    });
    // Re-sync UI after DOM is ready
    applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
  });

  window.TensectraTheme = { toggle: toggle, apply: applyTheme };
}());
