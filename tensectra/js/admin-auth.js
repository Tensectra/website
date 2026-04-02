/**
 * js/admin-auth.js
 * Include on every admin page (except index.html / login).
 * Verifies Supabase session + confirms user is in admin_users table.
 * Exposes: window.ADMIN_SESSION, window.ADMIN_USER
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://ahcfozfntvqbfgbinxwr.supabase.co';
  var ANON_KEY     = 'sb_publishable_9t2QGBpQl4yd4H73dkSdlg_9QVNarpS';

  // Wait for Supabase CDN to load, then init
  function initAuth() {
    if (typeof supabase === 'undefined') {
      return setTimeout(initAuth, 50);
    }
    window._supabase = supabase.createClient(SUPABASE_URL, ANON_KEY);
    checkSession();
  }

  async function checkSession() {
    var client = window._supabase;

    // Handle magic-link hash redirect (Supabase v2 handles this automatically)
    var { data: { session }, error: sessionErr } = await client.auth.getSession();

    if (sessionErr || !session) {
      redirectToLogin();
      return;
    }

    // Confirm user is in admin_users table
    var { data: adminUser, error: adminErr } = await client
      .from('admin_users')
      .select('email, name, role')
      .eq('email', session.user.email)
      .eq('active', true)
      .maybeSingle();

    if (adminErr || !adminUser) {
      await client.auth.signOut();
      redirectToLogin('not-admin');
      return;
    }

    // Expose to page scripts
    window.ADMIN_SESSION = session;
    window.ADMIN_USER    = adminUser;

    // Populate UI
    var emailEl = document.getElementById('admin-user-email');
    if (emailEl) emailEl.textContent = adminUser.name || adminUser.email;

    var roleEl = document.getElementById('admin-user-role');
    if (roleEl) roleEl.textContent = adminUser.role.toUpperCase();

    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async function () {
        await client.auth.signOut();
        redirectToLogin();
      });
    }

    // Fire custom event so page scripts know auth is ready
    document.dispatchEvent(new CustomEvent('adminReady', { detail: { session, adminUser } }));
  }

  function redirectToLogin(reason) {
    var url = '/admin/';
    if (reason) url += '?error=' + reason;
    window.location.href = url;
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
}());
