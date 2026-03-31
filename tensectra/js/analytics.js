// Tensectra — Google Analytics 4 Integration
// Tracks user interactions, form submissions, payments, and conversions

class TensectraAnalytics {
  constructor() {
    this.initialized = false;
    this.measurementId = 'G-Y75Q7F95P4';
    this.init();
  }

  init() {
    if (this.initialized) return;

    // Load GA4 script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script1);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', this.measurementId, {
      'send_page_view': true,
      'anonymize_ip': true
    });

    this.initialized = true;
    console.log('?? Google Analytics initialized');
  }

  // Track page view
  trackPageView(page) {
    if (!this.initialized) return;
    gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: page || window.location.pathname,
      page_title: document.title
    });
  }

  // Track button clicks
  trackButtonClick(buttonName, category = 'engagement') {
    if (!this.initialized) return;
    gtag('event', 'button_click', {
      event_category: category,
      event_label: buttonName,
      page_path: window.location.pathname
    });
  }

  // Track form submissions
  trackFormSubmit(formName, formType = 'lead') {
    if (!this.initialized) return;
    gtag('event', 'form_submit', {
      event_category: 'forms',
      form_name: formName,
      form_type: formType,
      page_path: window.location.pathname
    });
  }

  // Track enroll clicks
  trackEnrollClick(course, price) {
    if (!this.initialized) return;
    gtag('event', 'enroll_click', {
      event_category: 'conversion',
      course: course,
      value: price,
      currency: 'USD'
    });
  }

  // Track payment initiation
  trackPaymentInitiated(product, amount, currency = 'USD') {
    if (!this.initialized) return;
    gtag('event', 'begin_checkout', {
      event_category: 'ecommerce',
      product: product,
      value: amount,
      currency: currency,
      items: [{
        item_name: product,
        price: amount,
        quantity: 1
      }]
    });
  }

  // Track payment success (CONVERSION)
  trackPaymentSuccess(product, amount, reference, currency = 'USD') {
    if (!this.initialized) return;
    gtag('event', 'purchase', {
      event_category: 'ecommerce',
      transaction_id: reference,
      value: amount,
      currency: currency,
      items: [{
        item_name: product,
        price: amount,
        quantity: 1
      }]
    });
  }

  // Track scroll depth
  trackScrollDepth(percentage) {
    if (!this.initialized) return;
    gtag('event', `scroll_${percentage}`, {
      event_category: 'engagement',
      page_path: window.location.pathname
    });
  }

  // Track outbound links
  trackOutboundLink(url, label) {
    if (!this.initialized) return;
    gtag('event', 'click', {
      event_category: 'outbound',
      event_label: label || url,
      transport_type: 'beacon',
      target_url: url
    });
  }

  // Track video plays
  trackVideoPlay(videoName) {
    if (!this.initialized) return;
    gtag('event', 'video_play', {
      event_category: 'engagement',
      video_name: videoName
    });
  }

  // Track Calendly booking
  trackCalendlyBooking(eventType = 'discovery_call') {
    if (!this.initialized) return;
    gtag('event', 'calendly_booking', {
      event_category: 'conversion',
      event_type: eventType
    });
  }

  // Track newsletter signup
  trackNewsletterSignup(list = 'general') {
    if (!this.initialized) return;
    gtag('event', 'newsletter_signup', {
      event_category: 'conversion',
      list: list
    });
  }

  // Track scholarship application
  trackScholarshipApplication(course) {
    if (!this.initialized) return;
    gtag('event', 'scholarship_application', {
      event_category: 'conversion',
      course: course
    });
  }

  // Track download
  trackDownload(fileName, fileType) {
    if (!this.initialized) return;
    gtag('event', 'file_download', {
      event_category: 'engagement',
      file_name: fileName,
      file_type: fileType
    });
  }

  // Custom event
  trackCustomEvent(eventName, parameters = {}) {
    if (!this.initialized) return;
    gtag('event', eventName, parameters);
  }
}

// Initialize analytics
window.TensectraAnalytics = new TensectraAnalytics();

// Auto-track scroll depth
let scrollTracked = {
  25: false,
  50: false,
  75: false,
  100: false
};

window.addEventListener('scroll', function() {
  const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  
  for (let threshold in scrollTracked) {
    if (scrollPercent >= threshold && !scrollTracked[threshold]) {
      scrollTracked[threshold] = true;
      window.TensectraAnalytics.trackScrollDepth(threshold);
    }
  }
});

// Auto-track outbound links
document.addEventListener('click', function(e) {
  const link = e.target.closest('a');
  if (link && link.hostname !== window.location.hostname) {
    window.TensectraAnalytics.trackOutboundLink(link.href, link.textContent);
  }
});
