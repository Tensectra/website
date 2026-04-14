/**
 * TENSECTRA - Theme Toggle
 * The inline <head> script handles FOUC prevention by setting data-theme before render.
 * This file only wires up click handlers and syncs aria-labels.
 * Default theme: dark
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'tensectra-theme';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F8FAFE' : '#00CCFF');
  }

  function toggle() {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
      btn.addEventListener('click', toggle);
    });
    // Sync aria-label with the theme the inline script already applied
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(current);
  });

  window.TensectraTheme = { toggle: toggle, apply: applyTheme };

}());
