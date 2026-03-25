/**
 * TENSECTRA WEBSITE - MAIN JAVASCRIPT
 * All interactive functionality for the website
 */

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  initNavbar();
  initBinaryRain();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initModals();
  initAccordions();
  initTabs();
  initCourseFilters();
  initForms();
  initRefCardLead();
});

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// ============================================
// BINARY RAIN EFFECT
// ============================================
function initBinaryRain() {
  const binaryContainers = document.querySelectorAll('.binary-rain');
  if (binaryContainers.length === 0) return;
  
  binaryContainers.forEach(container => {
    const columns = 15;
    const chars = '01';
    
    for (let i = 0; i < columns; i++) {
      const column = document.createElement('div');
      column.className = 'binary-column';
      column.style.left = `${(i / columns) * 100}%`;
      column.style.animationDuration = `${10 + Math.random() * 10}s`;
      column.style.animationDelay = `${Math.random() * 5}s`;
      
      let content = '';
      const rows = 50;
      for (let j = 0; j < rows; j++) {
        content += chars[Math.floor(Math.random() * chars.length)] + '<br>';
      }
      column.innerHTML = content;
      container.appendChild(column);
    }
  });
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navbarNav = document.querySelector('.navbar-nav');
  
  if (!menuBtn || !navbarNav) return;
  
  menuBtn.addEventListener('click', function() {
    this.classList.toggle('active');
    navbarNav.classList.toggle('active');
    document.body.style.overflow = navbarNav.classList.contains('active') ? 'hidden' : '';
  });
  
  // Close menu when clicking a link
  navbarNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('active');
      navbarNav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = targetElement.offsetTop - navbarHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in-on-scroll');
  if (animatedElements.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// MODALS
// ============================================
function initModals() {
  // Open modal buttons
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', function() {
      const modalId = this.getAttribute('data-modal');
      openModal(modalId);
    });
  });
  
  // Close modal buttons
  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', function(e) {
      if (e.target === this || this.classList.contains('modal-close')) {
        closeAllModals();
      }
    });
  });
  
  // Close on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = '';
}

// ============================================
// ACCORDIONS
// ============================================
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', function() {
      const item = this.parentElement;
      const isActive = item.classList.contains('active');
      
      // Close all items in the same accordion
      item.parentElement.querySelectorAll('.accordion-item').forEach(i => {
        i.classList.remove('active');
      });
      
      // Toggle current item
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// ============================================
// TABS
// ============================================
function initTabs() {
  document.querySelectorAll('.tabs').forEach(tabContainer => {
    const tabs = tabContainer.querySelectorAll('.tab-btn');
    const contents = tabContainer.parentElement.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const targetId = this.getAttribute('data-tab');
        
        // Deactivate all tabs
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        // Activate current tab
        this.classList.add('active');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  });
}

// ============================================
// COURSE FILTERS
// ============================================
function initCourseFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const courseCards = document.querySelectorAll('.course-card');
  
  if (filterBtns.length === 0 || courseCards.length === 0) return;
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');
      
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      // Filter cards
      courseCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          card.classList.add('fade-in');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ============================================
// FORMS
// ============================================
function initForms() {
  // form[netlify] is stripped by Netlify at deploy time — select by method="POST" instead.
  // Exclude forms with a custom onsubmit handler (e.g. the purchase modal form).
  // Exclude data-no-init ghost forms used only for Netlify field detection.
  document.querySelectorAll('form[method="POST"]:not([onsubmit]):not([data-no-init])').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var requiredFields = form.querySelectorAll('[required]');
      var isValid = true;

      requiredFields.forEach(function(field) {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
        } else {
          field.classList.remove('error');
        }
      });

      if (!isValid) {
        showNotification('Please fill in all required fields.', 'error');
        return;
      }

      var params = new URLSearchParams(new FormData(form));
      // Netlify requires form-name in AJAX submissions
      if (!params.get('form-name')) {
        params.set('form-name', form.getAttribute('name') || '');
      }

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      })
      .then(function() {
        showNotification('Thank you! Your submission has been received.', 'success');
        form.reset();
      })
      .catch(function() {
        showNotification('Something went wrong. Please try again or email hello@tensectra.com.', 'error');
      });
    });
  });
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = 'info') {
  // Remove existing notifications
  document.querySelectorAll('.notification').forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button class="notification-close">&times;</button>
  `;
  
  // Styles
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#00CCFF' : '#3B5BFF'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 1rem;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Close button
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.remove();
  });
  
  // Auto remove
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// ============================================
// ARCHITECTURE REFERENCE CARD LEAD MAGNET
// ============================================
function initRefCardLead() {

  // --- Inject styles ---
  var css = document.createElement('style');
  css.textContent = `
    .ref-card-trigger {
      position: fixed; bottom: 24px; right: 24px; z-index: 1000;
    }
    .ref-card-btn {
      display: flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #00CCFF, #3B5BFF);
      color: #fff; border: none; border-radius: 50px;
      padding: 11px 18px; font-size: 0.82rem; font-weight: 600;
      cursor: pointer; font-family: inherit;
      box-shadow: 0 4px 20px rgba(0,204,255,0.35);
      transition: transform 0.2s, box-shadow 0.2s;
      animation: rcPulse 2.8s ease-in-out infinite;
    }
    .ref-card-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(0,204,255,0.55);
      animation: none;
    }
    @keyframes rcPulse {
      0%,100% { box-shadow: 0 4px 20px rgba(0,204,255,0.35); }
      50%      { box-shadow: 0 4px 28px rgba(0,204,255,0.65); }
    }
    .ref-card-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.72); z-index: 10000;
      align-items: center; justify-content: center; padding: 20px;
    }
    .ref-card-overlay.open { display: flex; }
    .ref-card-modal {
      background: #0a1628;
      border: 1px solid rgba(0,204,255,0.18);
      border-radius: 16px; width: 100%; max-width: 460px;
      padding: 32px; position: relative;
      box-shadow: 0 24px 64px rgba(0,0,0,0.6);
    }
    .ref-card-close-btn {
      position: absolute; top: 14px; right: 16px;
      background: none; border: none; color: rgba(255,255,255,0.45);
      cursor: pointer; font-size: 1.5rem; line-height: 1; padding: 2px 6px;
    }
    .ref-card-close-btn:hover { color: #fff; }
    .rc-badge {
      display: inline-block;
      background: rgba(0,204,255,0.1); color: #00CCFF;
      border: 1px solid rgba(0,204,255,0.22);
      border-radius: 4px; font-size: 0.68rem; font-weight: 700;
      letter-spacing: 0.08em; padding: 3px 8px; margin-bottom: 12px;
    }
    .ref-card-modal h3 {
      color: #fff; font-size: 1.25rem; margin: 0 0 8px; line-height: 1.3;
    }
    .ref-card-modal .rc-sub {
      color: rgba(255,255,255,0.55); font-size: 0.88rem;
      line-height: 1.6; margin: 0 0 18px;
    }
    .rc-preview {
      background: rgba(0,204,255,0.04);
      border: 1px solid rgba(0,204,255,0.1);
      border-radius: 8px; padding: 13px 15px; margin-bottom: 18px;
    }
    .rc-preview-label {
      color: rgba(255,255,255,0.4); font-size: 0.7rem; font-weight: 700;
      letter-spacing: 0.07em; text-transform: uppercase; margin: 0 0 8px;
    }
    .rc-preview ul { list-style: none; margin: 0; padding: 0; }
    .rc-preview li {
      color: rgba(255,255,255,0.78); font-size: 0.84rem; padding: 3px 0;
    }
    .rc-preview li::before { content: "✓ "; color: #00CCFF; font-weight: 700; }
    .rc-field { margin-bottom: 10px; }
    .rc-field input {
      width: 100%; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;
      color: #fff; padding: 11px 13px; font-size: 0.9rem;
      font-family: inherit; box-sizing: border-box; outline: none;
      transition: border-color 0.2s;
    }
    .rc-field input:focus { border-color: rgba(0,204,255,0.5); }
    .rc-field input::placeholder { color: rgba(255,255,255,0.28); }
    .rc-submit {
      width: 100%; background: linear-gradient(135deg, #00CCFF, #3B5BFF);
      color: #fff; border: none; border-radius: 8px;
      padding: 13px; font-size: 0.93rem; font-weight: 600;
      cursor: pointer; font-family: inherit; margin-top: 4px;
      transition: opacity 0.2s;
    }
    .rc-submit:hover { opacity: 0.88; }
    .rc-note {
      color: rgba(255,255,255,0.3); font-size: 0.73rem;
      text-align: center; margin: 10px 0 0;
    }
  `;
  document.head.appendChild(css);

  // --- Inject floating button ---
  var trigger = document.createElement('div');
  trigger.className = 'ref-card-trigger';
  trigger.innerHTML = `
    <button class="ref-card-btn" id="rc-open-btn" aria-label="Download free architecture reference card">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
      Free Reference Card
    </button>`;
  document.body.appendChild(trigger);

  // --- Inject modal ---
  var overlay = document.createElement('div');
  overlay.className = 'ref-card-overlay';
  overlay.id = 'rc-overlay';
  overlay.innerHTML = `
    <div class="ref-card-modal" role="dialog" aria-modal="true" aria-labelledby="rc-title">
      <button class="ref-card-close-btn" id="rc-close-btn" aria-label="Close">&times;</button>
      <div class="rc-badge">FREE DOWNLOAD</div>
      <h3 id="rc-title">Enterprise Architecture Reference Card</h3>
      <p class="rc-sub">14 patterns. 5 layers. The exact blueprint behind production banking systems across Africa — condensed to one printable card.</p>
      <div class="rc-preview">
        <p class="rc-preview-label">What's inside</p>
        <ul>
          <li>5-layer architecture map (API → Domain)</li>
          <li>All 14 enterprise patterns at a glance</li>
          <li>CQRS + Repository quick-reference flow</li>
          <li>Multi-tenant factory pattern example</li>
          <li>Full technology stack decision map</li>
        </ul>
      </div>
      <form id="rc-form" novalidate>
        <div class="rc-field">
          <input type="text" name="name" placeholder="Your full name" required autocomplete="name">
        </div>
        <div class="rc-field">
          <input type="email" name="email" placeholder="Work email" required autocomplete="email">
        </div>
        <button type="submit" class="rc-submit">Download Free Reference Card &rarr;</button>
      </form>
      <p class="rc-note">No spam. We'll notify you when new reference cards drop.</p>
    </div>`;
  document.body.appendChild(overlay);

  // --- Open / close ---
  function openRc()  { overlay.classList.add('open');    document.body.style.overflow = 'hidden'; }
  function closeRc() { overlay.classList.remove('open'); document.body.style.overflow = '';       }

  document.getElementById('rc-open-btn').addEventListener('click', openRc);
  document.getElementById('rc-close-btn').addEventListener('click', closeRc);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeRc(); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeRc();
  });

  // --- Form submit ---
  document.getElementById('rc-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var name  = this.querySelector('[name="name"]').value.trim();
    var email = this.querySelector('[name="email"]').value.trim();

    if (!name || !email) {
      showNotification('Please enter your name and email.', 'error');
      return;
    }

    var params = new URLSearchParams();
    params.set('form-name',   'ref-card-download');
    params.set('name',        name);
    params.set('email',       email);
    params.set('lead_source', 'reference_card_download');

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    })
    .then(function()  { closeRc(); triggerDownload(name); showNotification('Download started!', 'success'); })
    .catch(function() { closeRc(); triggerDownload(name); showNotification('Download started!', 'success'); });
  });

  // --- Generate + download the card ---
  function triggerDownload(name) {
    var lines = buildRefCard(name);
    var blob  = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    var url   = URL.createObjectURL(blob);
    var a     = document.createElement('a');
    a.href     = url;
    a.download = 'TensectraKit-Architecture-Reference-Card.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function buildRefCard(name) {
    var line = '='.repeat(68);
    var dash = '-'.repeat(68);
    return [
      line,
      '  TENSECTRA — ENTERPRISE ARCHITECTURE REFERENCE CARD',
      '  TensectraKit · .NET 8 Clean Architecture',
      (name ? '  Prepared for: ' + name : ''),
      line,
      '',
      'THE 5 LAYERS  (top → bottom, no upward dependencies)',
      dash,
      '1. API / Presentation   Controllers · gRPC entry · Middleware · Action Filters',
      '                        EncryptResponse · DecryptRequest · CountryFilter',
      '                        Serilog · Prometheus · Swagger / OpenAPI',
      '',
      '2. Application          CQRS (MediatR) · ValidationBehavior (FluentValidation)',
      '                        CommandHandlers · QueryHandlers · AutoMapper',
      '                        CountryStrategyFactory · Sagas · Coravel Queue',
      '',
      '3. Domain               Entity<TPrimaryKey> · IAuditable · ISoftDelete · IApproval',
      '                        IRepositoryBase<T> · IRepositoryWrapper · IUnitOfWork',
      '                        DTOs · Enums (ApprovalStatus · BOOLEAN)',
      '                        ⚠  Zero external dependencies',
      '',
      '4. Infrastructure       RepositoryWrapper (lazy-init) · RepositoryBase<T>',
      '                        SqlServerDbContext · OracleDbContext · PostgresDbContext',
      '                        Soft-delete via reflection · Audit auto-fill on SaveChanges',
      '                        BulkInsertAsync · BulkUpdateAsync · BulkDeleteAsync',
      '',
      '5. Persistence (gRPC)   Users.proto · CreateUserRequest · gPayloadResponse',
      '                        CreateUsersService · gRPCMappingProfile',
      '',
      line,
      'THE 14 PATTERNS',
      dash,
      ' 1.  Clean Architecture    Layer isolation · dependency inversion',
      ' 2.  CQRS (MediatR)        Separate command / query models · MediatR.Send()',
      ' 3.  Repository + Wrapper  IRepositoryBase<T> · lazy-init RepositoryWrapper',
      ' 4.  Factory / Strategy    Country-specific logic; swap without touching core',
      ' 5.  Saga (Kafka)          ApprovalSaga · UserSyncSaga · idempotent events',
      ' 6.  Pipeline Behaviour    ValidationBehavior runs before every command/query',
      ' 7.  Soft Delete           Reflection-based; never hard-deletes data',
      ' 8.  Audit Trail           Auto-fill CreatedAt/UpdatedBy on every SaveChanges',
      ' 9.  Encryption at Edge    AES encrypt/decrypt at API boundary only',
      '10.  Background + Retry    Coravel queue · 3× RetryAsync · AuditLogInvocable',
      '11.  Multi-DB Provider     SqlServer / Oracle (BOOLEAN→NUMBER(2)) / PostgreSQL',
      '12.  Dual Entry Point      REST (Controllers) + gRPC (Protobuf) — same handlers',
      '13.  DB Seeding            Password hashing · Oracle identity-safe · first-run guard',
      '14.  Bulk Operations ★     BulkInsertAsync / BulkUpdateAsync / BulkDeleteAsync',
      '',
      line,
      'CQRS REQUEST FLOW',
      dash,
      '  HTTP / gRPC Request',
      '       ↓',
      '  Controller / gRPC Service',
      '       ↓',
      '  MediatR.Send(Command | Query)',
      '       ↓',
      '  ValidationBehavior  ←── FluentValidation rules',
      '       ↓',
      '  CommandHandler | QueryHandler',
      '       ↓',
      '  IRepositoryWrapper → RepositoryBase<T> → DbContext',
      '',
      line,
      'MULTI-TENANT FACTORY',
      dash,
      '  CountryStrategyFactory.GetStrategy(countryCode)',
      '    → NigeriaUsersStrategyFactory  (NGN rules, CBN compliance)',
      '    → GhanaUsersStrategyFactory    (GHS rules, BoG compliance)',
      '    → [add new country — zero changes to existing code]',
      '',
      '  Each strategy implements the same interface.',
      '  The handler never knows which country it is.',
      '',
      line,
      'TECHNOLOGY STACK',
      dash,
      '  .NET 8 Web API     Presentation + Application host',
      '  MediatR            CQRS dispatch pipeline',
      '  FluentValidation   ValidationBehavior (pipeline)',
      '  AutoMapper         DTO ↔ Entity ↔ Proto mapping',
      '  Redis              ICacheProvider · read-model caching',
      '  Kafka              Event streaming · Saga coordination',
      '  Serilog            Structured logs → Console / ES / Seq',
      '  Prometheus         /metrics endpoint',
      '  Swagger / OpenAPI  Auto-generated API docs',
      '  Coravel            Background queue + scheduler',
      '  Protobuf / gRPC    Internal service contracts',
      '',
      line,
      '  tensectra.com · hello@tensectra.com',
      '  Get the full scaffold: tensectra.com/pages/infrastructure',
      '  Join a cohort:         tensectra.com/pages/cohorts',
      line,
    ].join('\n');
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ============================================
// COHORT PAGE SPECIFIC
// ============================================

// Course selector on cohorts page
function initCourseSelector() {
  const courseTabs = document.querySelectorAll('[data-course]');
  const courseContents = document.querySelectorAll('.course-content');
  
  if (courseTabs.length === 0) return;
  
  courseTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const course = this.getAttribute('data-course');
      
      // Update active tab
      courseTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding content
      courseContents.forEach(content => {
        if (content.id === `course-${course}`) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
}

// Pricing toggle on cohorts page
function initPricingToggle() {
  const pricingTabs = document.querySelectorAll('[data-pricing]');
  const pricingContents = document.querySelectorAll('.pricing-content');
  
  if (pricingTabs.length === 0) return;
  
  pricingTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const pricing = this.getAttribute('data-pricing');
      
      pricingTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      pricingContents.forEach(content => {
        if (content.id === `pricing-${pricing}`) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
}

// Initialize cohort page functions if on that page
if (document.querySelector('.course-selector')) {
  initCourseSelector();
  initPricingToggle();
}

// ============================================
// ANALYTICS (Google Analytics 4)
// ============================================

// Track button clicks
document.querySelectorAll('[data-track]').forEach(btn => {
  btn.addEventListener('click', function() {
    const eventName = this.getAttribute('data-track');
    
    // Send to Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, {
        event_category: 'engagement',
        event_label: this.textContent.trim()
      });
    }
    
    console.log(`Event tracked: ${eventName}`);
  });
});

// ============================================
// LAZY LOADING IMAGES
// ============================================
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ============================================
// PRINT STYLES
// ============================================
window.addEventListener('beforeprint', () => {
  document.body.classList.add('printing');
});

window.addEventListener('afterprint', () => {
  document.body.classList.remove('printing');
});

console.log('🚀 Tensectra Website Loaded Successfully');
console.log('💻 Built with HTML + CSS + Vanilla JS');
console.log('🌐 Ready for deployment to Netlify/GitHub Pages');
