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
  initSourceDownload();
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
  // Attach AJAX submit handler to all Netlify forms.
  // Skip forms that declare their own onsubmit handler (e.g. the purchase form).
  document.querySelectorAll('form[netlify]:not([onsubmit]), form[data-netlify]:not([onsubmit])').forEach(function(form) {
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
// SOURCE CODE DOWNLOAD
// ============================================
function initSourceDownload() {
  const downloadBtn = document.getElementById('source-download-btn');
  if (!downloadBtn) return;
  
  downloadBtn.addEventListener('click', function() {
    // Create a README file content
    const readmeContent = `# Tensectra Website Source Code

## Overview
This is the complete source code for the Tensectra website - an enterprise engineering education platform.

## Structure
- \`index.html\` - Homepage
- \`pages/\` - All other pages (courses, pro, cohorts, etc.)
- \`css/\` - Stylesheets
- \`js/\` - JavaScript files
- \`images/\` - Image assets
- \`forms/\` - Form templates

## Tech Stack
- HTML5
- CSS3 (Custom properties, Grid, Flexbox)
- Vanilla JavaScript (ES6+)
- Netlify Forms for form handling

## Setup
1. Upload all files to your web server or Netlify
2. Configure forms in Netlify dashboard
3. Update links and contact information

## License
MIT License - Feel free to use and modify.

---
Built with ❤️ by Tensectra Engineering Team
`;

    // Create and download the README
    const blob = new Blob([readmeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TENSECTRA_SOURCE_README.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Source code README downloaded!', 'success');
  });
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
