/**
 * js/admin.js
 * Shared admin panel logic: data loading, table rendering,
 * modals, toasts, payment link dispatch, status updates.
 * Requires: Supabase CDN, admin-auth.js (window.ADMIN_SESSION, window._supabase)
 */
(function () {
  'use strict';

  // ?? Toast ?????????????????????????????????????????????????????????????????
  var toastContainer;
  function getToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  window.showToast = function (message, type) {
    type = type || 'info';
    var icons = { success: '?', error: '?', info: '??' };
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML = '<span class="toast-icon">' + (icons[type] || '??') + '</span>'
      + '<span class="toast-message">' + message + '</span>';
    getToastContainer().appendChild(el);
    setTimeout(function () {
      el.style.opacity = '0';
      el.style.transition = 'opacity .3s';
      setTimeout(function () { el.remove(); }, 300);
    }, 4000);
  };

  // ?? Modal ?????????????????????????????????????????????????????????????????
  var modalOverlay;
  function ensureModal() {
    if (modalOverlay) return;
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.innerHTML = '<div class="modal"><div class="modal-header">'
      + '<h2 class="modal-title" id="modal-title">Detail</h2>'
      + '<button class="modal-close" id="modal-close-btn">&times;</button>'
      + '</div><div class="modal-body" id="modal-body"></div>'
      + '<div class="modal-footer" id="modal-footer"></div></div>';
    document.body.appendChild(modalOverlay);

    document.getElementById('modal-close-btn').addEventListener('click', window.closeModal);
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) window.closeModal();
    });
  }

  window.openModal = function (title, bodyHtml, footerHtml) {
    ensureModal();
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    var footer = document.getElementById('modal-footer');
    footer.innerHTML = footerHtml || '';
    modalOverlay.classList.add('open');
  };

  window.closeModal = function () {
    if (modalOverlay) modalOverlay.classList.remove('open');
  };

  // ?? Helpers ???????????????????????????????????????????????????????????????
  window.statusBadge = function (status) {
    return '<span class="status status-' + (status || 'unknown') + '">' + (status || '—') + '</span>';
  };

  window.fmtDate = function (iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  window.fmtAmt = function (amount, currency) {
    if (!amount) return '—';
    var n = (amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 0 });
    var sym = { NGN: '?', USD: '$', GHS: 'GH?', KES: 'KSh', ZAR: 'R' };
    return (sym[currency] || (currency || '') + ' ') + n;
  };

  function detail(label, value) {
    if (!value && value !== 0) return '';
    return '<div class="detail-label">' + label + '</div><div class="detail-value">' + value + '</div>';
  }
  function section(label) {
    return '<div class="detail-section">' + label + '</div>';
  }

  // ?? Update record status ???????????????????????????????????????????????????
  window.updateStatus = async function (table, id, status, callback) {
    var client = window._supabase;
    var { error } = await client.from(table).update({ status: status }).eq('id', id);
    if (error) {
      showToast('Failed to update status: ' + error.message, 'error');
    } else {
      showToast('Status updated to ' + status, 'success');
      if (callback) callback();
    }
  };

  // ?? Send payment link ??????????????????????????????????????????????????????
  window.sendPaymentLink = async function (opts) {
    // opts: { record_id, record_type, email, name, amount, currency, product_name, note, cohort_details?, onSuccess }
    var session = window.ADMIN_SESSION;
    if (!session) return showToast('Not authenticated', 'error');

    var btn = document.getElementById('send-link-btn');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    try {
      var res = await fetch('/api/send-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + session.access_token,
        },
        body: JSON.stringify(opts),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');

      showToast('Payment link sent to ' + opts.email, 'success');
      window.closeModal();
      if (opts.onSuccess) opts.onSuccess(data);
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Send Payment Link'; }
    }
  };

  // ?? Payment Link Modal ?????????????????????????????????????????????????????
  window.openPaymentLinkModal = function (record, recordType, defaultPricing) {
    // defaultPricing: { amount, currency } from consultancy_pricing or cohort
    var amount   = defaultPricing ? defaultPricing.amount   : 0;
    var currency = defaultPricing ? defaultPricing.currency : 'NGN';
    var tierNames = { '1':'Corporate Cohort','2':'Architecture Workshop','3':'Architecture Consultation',retainer:'Architecture Retainer',unsure:'Consultation' };
    var courseNames = { backend:'AI-Powered Backend Engineer (6 Weeks)', frontend:'AI-Powered Frontend Engineer (6 Weeks)', mobile:'AI-Powered Mobile Builder (6 Weeks)' };
    var productName = recordType === 'consultancy'
      ? (tierNames[record.tier] || record.tier || 'Tensectra Service')
      : (courseNames[record.course] || record.course || 'Tensectra Cohort');

    var body = '<div class="form-group">'
      + '<label class="form-label">Recipient</label>'
      + '<div class="detail-value" style="color:#E6EDF3">' + record.name + ' &lt;' + record.email + '&gt;</div>'
      + '</div>'
      + '<div class="form-row">'
      + '<div class="form-group"><label class="form-label">Amount (smallest unit)*</label>'
      + '<input class="form-input mono" id="pl-amount" type="number" value="' + amount + '" min="1" placeholder="e.g. 15000000">'
      + '<div class="form-hint">NGN: enter kobo (×100) · USD: enter cents (×100)</div></div>'
      + '<div class="form-group"><label class="form-label">Currency</label>'
      + '<select class="form-select" id="pl-currency">'
      + ['NGN','USD','GHS','KES','ZAR'].map(function (c) { return '<option value="' + c + '"' + (c === currency ? ' selected' : '') + '>' + c + '</option>'; }).join('')
      + '</select></div>'
      + '</div>'
      + '<div class="form-group"><label class="form-label">Product name*</label>'
      + '<input class="form-input" id="pl-product" type="text" value="' + productName + '"></div>'
      + '<div class="form-group"><label class="form-label">Note to client (optional)</label>'
      + '<textarea class="form-textarea" id="pl-note" rows="2" placeholder="e.g. Includes 1 year support"></textarea></div>'
      + '<div class="amount-display">'
      + '<div class="amount-num" id="pl-preview">—</div>'
      + '<div class="amount-sub">Preview — updates as you type</div></div>';

    var footer = '<button class="btn btn-secondary btn-sm" onclick="closeModal()">Cancel</button>'
      + '<button class="btn btn-primary btn-sm" id="send-link-btn">Send Payment Link</button>';

    openModal('Send Payment Link', body, footer);

    // Live preview
    function updatePreview() {
      var amt = parseInt(document.getElementById('pl-amount').value) || 0;
      var cur = document.getElementById('pl-currency').value;
      document.getElementById('pl-preview').textContent = fmtAmt(amt, cur);
    }
    document.getElementById('pl-amount').addEventListener('input', updatePreview);
    document.getElementById('pl-currency').addEventListener('change', updatePreview);
    updatePreview();

    document.getElementById('send-link-btn').addEventListener('click', function () {
      sendPaymentLink({
        record_id:    record.id,
        record_type:  recordType,
        email:        record.email,
        name:         record.name,
        amount:       parseInt(document.getElementById('pl-amount').value),
        currency:     document.getElementById('pl-currency').value,
        product_name: document.getElementById('pl-product').value,
        note:         document.getElementById('pl-note').value,
        onSuccess: function () { if (window.reloadTable) window.reloadTable(); },
      });
    });
  };

  // ?? Consultancy detail modal ???????????????????????????????????????????????
  window.openConsultancyDetail = function (r) {
    var tierNames = { '1':'Corporate Cohort','2':'Architecture Workshop','3':'Architecture Consultation',retainer:'Architecture Retainer',unsure:'TBD' };
    var body = '<div class="detail-grid">'
      + section('Contact')
      + detail('Name', r.name)
      + detail('Email', '<a href="mailto:' + r.email + '" style="color:#00CCFF">' + r.email + '</a>')
      + detail('Company', r.company)
      + detail('Role', r.role)
      + section('Enquiry')
      + detail('Service', tierNames[r.tier] || r.tier)
      + detail('Team Size', r.team_size)
      + detail('Stack', r.stack)
      + detail('Timeline', r.timeline)
      + detail('Status', statusBadge(r.status))
      + section('Location & Date')
      + detail('Location', [r.city, r.country_name].filter(Boolean).join(', '))
      + detail('Submitted', fmtDate(r.submitted_at))
      + '</div>'
      + (r.challenges ? '<hr style="border-color:#0D2040;margin:14px 0"><p style="font-size:.78rem;color:#4A5A6A;margin:0 0 4px">Challenges:</p><p style="font-size:.85rem;color:#E6EDF3;background:#070D1A;padding:10px 12px;border-radius:6px">' + r.challenges + '</p>' : '')
      + (r.notes ? '<p style="font-size:.78rem;color:#4A5A6A;margin:12px 0 4px">Admin notes:</p><p style="font-size:.85rem;color:#6E7D9A">' + r.notes + '</p>' : '');

    var selects = ['new','contacted','proposal_sent','won','lost'].map(function (s) {
      return '<option value="' + s + '"' + (s === r.status ? ' selected' : '') + '>' + s + '</option>';
    }).join('');

    var footer = '<select id="detail-status-select" class="form-select" style="width:auto;font-size:.8rem">' + selects + '</select>'
      + '<button class="btn btn-secondary btn-sm" onclick="(function(){'
      + 'var s=document.getElementById(\'detail-status-select\').value;'
      + 'updateStatus(\'consultancy_enquiries\',\'' + r.id + '\',s,function(){closeModal();if(window.reloadTable)window.reloadTable();})'
      + '})()">Update Status</button>'
      + '<button class="btn btn-primary btn-sm" onclick="closeModal()">Close</button>';

    openModal('Enquiry — ' + r.name, body, footer);
  };

  // ?? Application detail modal ???????????????????????????????????????????????
  window.openApplicationDetail = function (r) {
    var courseNames = { backend:'AI-Powered Backend Engineer', frontend:'AI-Powered Frontend Engineer', mobile:'AI-Powered Mobile Builder' };
    var body = '<div class="detail-grid">'
      + section('Applicant')
      + detail('Name', r.name)
      + detail('Email', '<a href="mailto:' + r.email + '" style="color:#00CCFF">' + r.email + '</a>')
      + detail('Role', r.role)
      + detail('Portfolio', r.portfolio ? '<a href="' + r.portfolio + '" target="_blank" style="color:#00CCFF">' + r.portfolio + '</a>' : null)
      + section('Application')
      + detail('Course', courseNames[r.course] || r.course)
      + detail('Experience', r.experience)
      + detail('Scholarship', r.is_scholarship ? '<span class="chip-scholarship">? Requested</span>' : 'No')
      + detail('Status', statusBadge(r.status))
      + section('Location & Date')
      + detail('Location', [r.city, r.country_name].filter(Boolean).join(', '))
      + detail('Submitted', fmtDate(r.submitted_at))
      + '</div>'
      + (r.goals ? '<hr style="border-color:#0D2040;margin:14px 0"><p style="font-size:.78rem;color:#4A5A6A;margin:0 0 4px">Goals:</p><p style="font-size:.85rem;color:#E6EDF3;background:#070D1A;padding:10px 12px;border-radius:6px">' + r.goals + '</p>' : '')
      + (r.gap  ? '<p style="font-size:.78rem;color:#4A5A6A;margin:10px 0 4px">Gap:</p><p style="font-size:.85rem;color:#E6EDF3;background:#070D1A;padding:10px 12px;border-radius:6px">' + r.gap + '</p>' : '')
      + (r.scholarship_reason ? '<p style="font-size:.78rem;color:#F59E0B;margin:10px 0 4px">Scholarship reason:</p><p style="font-size:.85rem;color:#E6EDF3;background:#070D1A;padding:10px 12px;border-radius:6px">' + r.scholarship_reason + '</p>' : '')
      + (r.notes ? '<p style="font-size:.78rem;color:#4A5A6A;margin:10px 0 4px">Admin notes:</p><p style="font-size:.85rem;color:#6E7D9A">' + r.notes + '</p>' : '');

    var footer = '<button class="btn btn-danger btn-sm" onclick="updateStatus(\'cohort_applications\',\'' + r.id + '\',\'rejected\',function(){closeModal();if(window.reloadTable)window.reloadTable();})">Reject</button>'
      + '<button class="btn btn-secondary btn-sm" onclick="updateStatus(\'cohort_applications\',\'' + r.id + '\',\'accepted\',function(){closeModal();if(window.reloadTable)window.reloadTable();})">Approve</button>'
      + '<button class="btn btn-primary btn-sm" onclick="closeModal()">Close</button>';

    openModal('Application — ' + r.name, body, footer);
  };

}());
