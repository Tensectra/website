// Tensectra — Calendly Integration
// Professional calendar booking for discovery calls and consultations

class TensectraCalendly {
  constructor() {
    this.calendlyUrl = 'https://calendly.com/tensectra-office/30min';
    this.loadCalendlyScript();
  }

  loadCalendlyScript() {
    // Load Calendly embed script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.head.appendChild(script);

    // Load Calendly styles
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    console.log('?? Calendly loaded');
  }

  // Open Calendly popup
  openPopup(options = {}) {
    const defaultOptions = {
      url: this.calendlyUrl,
      prefill: {
        name: options.name || '',
        email: options.email || '',
        customAnswers: options.customAnswers || {}
      },
      utm: {
        utmSource: 'tensectra_website',
        utmMedium: options.utmMedium || 'web',
        utmCampaign: options.utmCampaign || 'discovery_call'
      }
    };

    if (typeof Calendly !== 'undefined') {
      Calendly.initPopupWidget(defaultOptions);
      
      // Track event
      if (window.TensectraAnalytics) {
        window.TensectraAnalytics.trackCalendlyBooking(options.eventType || 'discovery_call');
      }
    } else {
      console.error('Calendly script not loaded');
    }
  }

  // Open inline embed
  initInlineWidget(elementId, options = {}) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element #${elementId} not found`);
      return;
    }

    const defaultOptions = {
      url: this.calendlyUrl,
      prefill: options.prefill || {},
      utm: options.utm || {
        utmSource: 'tensectra_website',
        utmMedium: 'web'
      }
    };

    if (typeof Calendly !== 'undefined') {
      Calendly.initInlineWidget({
        ...defaultOptions,
        parentElement: element
      });
    } else {
      console.error('Calendly script not loaded');
    }
  }

  // Create booking button
  createBookingButton(buttonId, options = {}) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      this.openPopup(options);
    });
  }

  // Set custom event type URL
  setEventUrl(url) {
    this.calendlyUrl = url;
  }

  // Different event types
  openDiscoveryCall(prefillData = {}) {
    this.openPopup({
      ...prefillData,
      eventType: 'discovery_call',
      utmCampaign: 'discovery_call'
    });
  }

  openConsultation(prefillData = {}) {
    this.setEventUrl('https://calendly.com/tensectra-office/consultation');
    this.openPopup({
      ...prefillData,
      eventType: 'consultation',
      utmCampaign: 'consultation'
    });
  }

  openWorkshop(prefillData = {}) {
    this.setEventUrl('https://calendly.com/tensectra-office/workshop');
    this.openPopup({
      ...prefillData,
      eventType: 'workshop',
      utmCampaign: 'corporate_workshop'
    });
  }
}

// Initialize Calendly
window.TensectraCalendly = new TensectraCalendly();

// Listen for Calendly events
window.addEventListener('message', function(e) {
  if (e.data.event && e.data.event.indexOf('calendly') === 0) {
    console.log('Calendly event:', e.data.event);

    // Track successful booking
    if (e.data.event === 'calendly.event_scheduled') {
      if (window.TensectraAnalytics) {
        window.TensectraAnalytics.trackCustomEvent('calendly_booking_completed', {
          event_uri: e.data.payload.event.uri,
          invitee_uri: e.data.payload.invitee.uri
        });
      }

      // Show success message
      showCalendlySuccessMessage();
    }
  }
});

// Success message function
function showCalendlySuccessMessage() {
  alert('? Meeting booked successfully! You will receive a confirmation email shortly.');
}

// Helper functions for easy button integration
function openTensectraCalendly(eventType = 'discovery') {
  switch(eventType) {
    case 'discovery':
      window.TensectraCalendly.openDiscoveryCall();
      break;
    case 'consultation':
      window.TensectraCalendly.openConsultation();
      break;
    case 'workshop':
      window.TensectraCalendly.openWorkshop();
      break;
    default:
      window.TensectraCalendly.openPopup();
  }
}
