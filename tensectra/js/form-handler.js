(function () {
  'use strict';

  async function _insert(table, payload) {
    const res = await fetch(window.SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'apikey':        window.SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + window.SUPABASE_ANON_KEY,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
  }

  window.initForm = function (formId, table, successMsg) {
    const form = document.getElementById(formId);
    if (!form) return;

    const btn          = form.querySelector('[type="submit"]');
    const originalLabel = btn ? btn.textContent.trim() : 'Submit';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (btn) { btn.disabled = true; btn.textContent = 'Sending\u2026'; }

      try {
        const fd      = new FormData(form);
        const payload = { submitted_at: new Date().toISOString() };

        for (const [k, v] of fd.entries()) {
          payload[k] = v || null;
        }

        // Unchecked checkboxes are absent from FormData — explicitly mark as 'no'
        form.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
          if (!(cb.name in payload)) payload[cb.name] = 'no';
        });

        await _insert(table, payload);

        form.innerHTML = [
          '<div style="text-align:center;padding:var(--space-xl) var(--space-md);">',
          '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#28C840"',
          ' stroke-width="2" style="margin-bottom:var(--space-md);">',
          '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>',
          '<polyline points="22 4 12 14.01 9 11.01"></polyline>',
          '</svg>',
          '<h3 style="color:var(--text-white);margin-bottom:var(--space-sm);">Received.</h3>',
          '<p style="color:var(--text-muted);">' + successMsg + '</p>',
          '</div>'
        ].join('');

      } catch (err) {
        console.error('[form-handler]', err);
        if (btn) { btn.disabled = false; btn.textContent = originalLabel; }

        var existing = form.querySelector('.form-error');
        if (!existing) {
          var el = document.createElement('p');
          el.className = 'form-error';
          el.style.cssText = 'color:#ff4444;font-size:0.85rem;margin-top:var(--space-sm);text-align:center;';
          btn ? btn.insertAdjacentElement('afterend', el) : form.appendChild(el);
          existing = el;
        }
        existing.textContent = 'Something went wrong. Please email hello@tensectra.com directly.';
      }
    });
  };

}());
