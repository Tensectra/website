// Tensectra — Environment Configuration Loader
// This file loads configuration from .env or fallback to window object

class Config {
  constructor() {
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {
    // Try to load from meta tags (we'll inject these from .env)
    this.config = {
      supabaseUrl: this.getMeta('supabase-url') || window.SUPABASE_URL || '',
      supabaseAnonKey: this.getMeta('supabase-anon-key') || window.SUPABASE_ANON_KEY || '',
      gaMeasurementId: this.getMeta('ga-measurement-id') || 'G-Y75Q7F95P4',
      paystackPublicKey: this.getMeta('paystack-public-key') || '',
      stripePublicKey: this.getMeta('stripe-public-key') || '',
      calendlyUrl: this.getMeta('calendly-url') || 'https://calendly.com/tensectra-office/30min',
      appUrl: this.getMeta('app-url') || 'https://www.tensectra.com',
      appEnv: this.getMeta('app-env') || 'production'
    };
  }

  getMeta(name) {
    const meta = document.querySelector(`meta[name="config:${name}"]`);
    return meta ? meta.getAttribute('content') : null;
  }

  get(key) {
    return this.config[key];
  }
}

// Create global config instance
window.TensectraConfig = new Config();

// Backward compatibility
window.SUPABASE_URL = window.TensectraConfig.get('supabaseUrl');
window.SUPABASE_ANON_KEY = window.TensectraConfig.get('supabaseAnonKey');
