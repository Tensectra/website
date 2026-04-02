// Tensectra — Location-Based Pricing & Payment Integration
// Supports Paystack (African markets) and Stripe (International)

class TensectraPricing {
  constructor() {
    this.userLocation = null;
    this.pricing = null;
    this.init();
  }

  async init() {
    await this.detectLocation();
    await this.loadPricing();
  }

  // Detect user location
  async detectLocation() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      this.userLocation = {
        countryCode: data.country_code,
        countryName: data.country_name,
        city: data.city,
        currency: data.currency,
        currencySymbol: this.getCurrencySymbol(data.currency)
      };

      console.log('?? Location detected:', this.userLocation);
    } catch (error) {
      console.error('Location detection failed:', error);
      // Fallback to default (USD)
      this.userLocation = {
        countryCode: 'DEFAULT',
        countryName: 'International',
        city: '',
        currency: 'USD',
        currencySymbol: '$'
      };
    }
  }

  // Load pricing for user's location
  // Amounts are display units (not smallest unit — Paystack ×100 happens at payment time)
  // kit = TensectraKit Starter | materials = self-paced materials only
  async loadPricing() {
    const pricingMap = {
      'NG': { currency: 'NGN', symbol: '\u20a6',    cohort: 150000, proMonthly: 7500,  proAnnual: 60000,  kit: 150000, materials: 75000  },
      'GH': { currency: 'GHS', symbol: 'GH\u20b5',  cohort: 1800,   proMonthly: 90,    proAnnual: 720,    kit: 1800,   materials: 900    },
      'KE': { currency: 'KES', symbol: 'KSh\u00a0', cohort: 38000,  proMonthly: 1900,  proAnnual: 15200,  kit: 38000,  materials: 19000  },
      'ZA': { currency: 'ZAR', symbol: 'R',         cohort: 5400,   proMonthly: 270,   proAnnual: 2160,   kit: 5400,   materials: 2700   },
      'US': { currency: 'USD', symbol: '$',         cohort: 299,    proMonthly: 15,    proAnnual: 120,    kit: 299,    materials: 149    },
      'GB': { currency: 'GBP', symbol: '\u00a3',   cohort: 239,    proMonthly: 12,    proAnnual: 96,     kit: 239,    materials: 119    },
      'CA': { currency: 'CAD', symbol: 'CA$',       cohort: 399,    proMonthly: 20,    proAnnual: 160,    kit: 399,    materials: 199    },
      'AE': { currency: 'AED', symbol: 'AED\u00a0', cohort: 1099,   proMonthly: 55,    proAnnual: 440,    kit: 1099,   materials: 549    },
      'DE': { currency: 'EUR', symbol: '\u20ac',   cohort: 279,    proMonthly: 14,    proAnnual: 112,    kit: 279,    materials: 139    },
      'NL': { currency: 'EUR', symbol: '\u20ac',   cohort: 279,    proMonthly: 14,    proAnnual: 112,    kit: 279,    materials: 139    },
      'DEFAULT': { currency: 'USD', symbol: '$',   cohort: 299,    proMonthly: 15,    proAnnual: 120,    kit: 299,    materials: 149    }
    };

    const countryCode = this.userLocation?.countryCode || 'DEFAULT';
    this.pricing = pricingMap[countryCode] || pricingMap['DEFAULT'];

    console.log('Tensectra pricing:', this.pricing);
    this.updatePricesOnPage();
  }

  // Update all prices on the page
  updatePricesOnPage() {
    const { symbol, cohort, proMonthly, proAnnual, kit, materials } = this.pricing;
    const fmt = (n) => symbol + n.toLocaleString();

    // Cohort (live)
    document.querySelectorAll('[data-price="cohort"]').forEach(el => { el.textContent = fmt(cohort); });

    // Materials-only (self-paced)
    document.querySelectorAll('[data-price="materials"]').forEach(el => { el.textContent = fmt(materials); });

    // TensectraKit
    document.querySelectorAll('[data-price="kit"]').forEach(el => { el.textContent = fmt(kit); });

    // Pro membership
    document.querySelectorAll('[data-price="pro-monthly"]').forEach(el => { el.textContent = fmt(proMonthly); });
    document.querySelectorAll('[data-price="pro-annual"]').forEach(el => { el.textContent = fmt(proAnnual); });

    // Pro annual savings note (e.g. "Save ?15,000 — two months free")
    document.querySelectorAll('[data-price-save="pro-annual"]').forEach(el => {
      el.textContent = `Save ${fmt(proMonthly * 2)} \u2014 two months free`;
    });

    // Currency code labels (e.g. span showing "NGN")
    document.querySelectorAll('[data-currency]').forEach(el => { el.textContent = this.pricing.currency; });
  }

  // Get appropriate payment gateway
  getPaymentGateway() {
    const africanCountries = ['NG', 'GH', 'KE', 'ZA'];
    return africanCountries.includes(this.userLocation.countryCode) ? 'paystack' : 'stripe';
  }

  // Initialize payment
  initiatePayment(product, productType, email, name) {
    const gateway = this.getPaymentGateway();
    const amount = this.getProductPrice(productType);

    // Track payment initiation
    if (window.TensectraAnalytics) {
      window.TensectraAnalytics.trackPaymentInitiated(product, amount, this.pricing.currency);
    }

    if (gateway === 'paystack') {
      this.paystackPayment(product, productType, email, name, amount);
    } else {
      this.stripePayment(product, productType, email, name, amount);
    }
  }

  // Paystack payment handler
  paystackPayment(product, productType, email, name, amount) {
    const handler = PaystackPop.setup({
      key: window.TensectraConfig.get('paystackPublicKey') || 'pk_test_xxxxx',
      email: email,
      amount: amount * 100, // Convert to kobo/cents
      currency: this.pricing.currency,
      ref: 'TEN-' + Math.floor((Math.random() * 1000000000) + 1),
      metadata: {
        custom_fields: [
          {
            display_name: "Product",
            variable_name: "product",
            value: product
          },
          {
            display_name: "Product Type",
            variable_name: "product_type",
            value: productType
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: name
          }
        ]
      },
      callback: (response) => {
        this.handlePaymentSuccess(response.reference, product, amount, 'paystack');
      },
      onClose: () => {
        console.log('Payment cancelled');
      }
    });

    handler.openIframe();
  }

  // Stripe payment handler
  stripePayment(product, productType, email, name, amount) {
    // For Stripe, redirect to payment link or use Stripe.js
    // Placeholder - implement based on your Stripe setup
    alert(`Stripe payment for ${product}: ${this.pricing.symbol}${amount}`);
    
    // Example: Redirect to Stripe Payment Link
    // window.location.href = `https://buy.stripe.com/xxxxx`;
  }

  // Get product price based on type (display unit — multiply by 100 for Paystack)
  getProductPrice(productType) {
    const priceMap = {
      'cohort':      this.pricing.cohort,
      'pro_monthly': this.pricing.proMonthly,
      'pro_annual':  this.pricing.proAnnual,
      'kit':         this.pricing.kit,
      'materials':   this.pricing.materials
    };
    return priceMap[productType] || 0;
  }

  // Handle successful payment
  async handlePaymentSuccess(reference, product, amount, gateway) {
    console.log('? Payment successful:', reference);

    // Track conversion
    if (window.TensectraAnalytics) {
      window.TensectraAnalytics.trackPaymentSuccess(product, amount, reference, this.pricing.currency);
    }

    // Verify payment on backend
    await this.verifyPayment(reference, gateway);

    // Show success message
    this.showSuccessMessage(product);
  }

  // Verify payment with backend
  async verifyPayment(reference, gateway) {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, gateway })
      });

      const data = await response.json();
      console.log('Payment verification:', data);
      return data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return null;
    }
  }

  // Show success message
  showSuccessMessage(product) {
    alert(`Thank you! Your payment for ${product} was successful. You will receive an email shortly with next steps.`);
    
    // Redirect to thank you page
    setTimeout(() => {
      window.location.href = '/pages/thank-you.html';
    }, 2000);
  }

  // Get currency symbol
  getCurrencySymbol(currency) {
    const symbols = {
      'USD': '$', 'EUR': '\u20ac', 'GBP': '\u00a3', 'NGN': '\u20a6',
      'GHS': 'GH\u20b5', 'KES': 'KSh\u00a0', 'ZAR': 'R', 'CAD': 'CA$', 'AED': 'AED\u00a0'
    };
    return symbols[currency] || currency;
  }
}

// Initialize pricing system
window.TensectraPricing = new TensectraPricing();

// Helper function for payment buttons
function initiateTensectraPayment(product, productType, requiresEmail = true) {
  if (requiresEmail) {
    const email = prompt('Please enter your email:');
    const name = prompt('Please enter your name:');
    
    if (!email || !name) {
      alert('Email and name are required to proceed.');
      return;
    }

    window.TensectraPricing.initiatePayment(product, productType, email, name);
  } else {
    window.TensectraPricing.initiatePayment(product, productType, '', '');
  }
}
