// Tensectra — Mailchimp Integration
// Newsletter subscription and email list management

class TensectraMailchimp {
  constructor() {
    this.apiEndpoint = '/api/mailchimp'; // Your backend endpoint
    this.lists = {
      general: 'general_newsletter',
      pro: 'pro_members',
      alumni: 'course_alumni',
      waitlist: 'infrastructure_waitlist',
      leads: 'leads'
    };
  }

  // Subscribe to newsletter
  async subscribe(email, name, listType = 'general', tags = []) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subscribe',
          email,
          name,
          list: this.lists[listType] || this.lists.general,
          tags
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('? Subscribed to Mailchimp');
        
        // Track newsletter signup
        if (window.TensectraAnalytics) {
          window.TensectraAnalytics.trackNewsletterSignup(listType);
        }

        return { success: true, message: 'Successfully subscribed!' };
      } else {
        throw new Error(data.error || 'Subscription failed');
      }
    } catch (error) {
      console.error('Mailchimp subscription error:', error);
      return { success: false, message: error.message };
    }
  }

  // Update subscriber tags
  async updateTags(email, tags) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_tags',
          email,
          tags
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Tag update error:', error);
      return { success: false };
    }
  }

  // Add to specific list after payment
  async addToListAfterPayment(email, name, productType) {
    let listType = 'general';
    let tags = [];

    switch(productType) {
      case 'cohort':
        listType = 'alumni';
        tags = ['cohort_student', 'paid'];
        break;
      case 'pro_monthly':
      case 'pro_annual':
        listType = 'pro';
        tags = ['pro_member', 'paid'];
        break;
      case 'kit':
        listType = 'general';
        tags = ['kit_owner', 'paid'];
        break;
    }

    return await this.subscribe(email, name, listType, tags);
  }

  // Show subscription form
  showSubscriptionForm(listType = 'general') {
    const formHTML = `
      <div class="mailchimp-form-overlay" id="mailchimpFormOverlay">
        <div class="mailchimp-form-container">
          <button class="mailchimp-form-close" onclick="closeMailchimpForm()">&times;</button>
          <h3>?? Subscribe to our Newsletter</h3>
          <p>Get exclusive content, course updates, and architecture insights.</p>
          <form id="mailchimpSubscribeForm">
            <input type="email" id="mcEmail" placeholder="Your email" required>
            <input type="text" id="mcName" placeholder="Your name" required>
            <button type="submit">Subscribe</button>
          </form>
          <div id="mcMessage"></div>
        </div>
      </div>
    `;

    // Inject form if not already present
    if (!document.getElementById('mailchimpFormOverlay')) {
      document.body.insertAdjacentHTML('beforeend', formHTML);
      
      // Handle form submission
      document.getElementById('mailchimpSubscribeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('mcEmail').value;
        const name = document.getElementById('mcName').value;
        
        const result = await this.subscribe(email, name, listType);
        
        const messageEl = document.getElementById('mcMessage');
        messageEl.textContent = result.message;
        messageEl.style.color = result.success ? 'green' : 'red';
        
        if (result.success) {
          setTimeout(() => closeMailchimpForm(), 2000);
        }
      });
    }

    // Show overlay
    document.getElementById('mailchimpFormOverlay').style.display = 'flex';
  }
}

// Close subscription form
function closeMailchimpForm() {
  const overlay = document.getElementById('mailchimpFormOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Initialize Mailchimp
window.TensectraMailchimp = new TensectraMailchimp();

// Inline subscription form handler
document.addEventListener('DOMContentLoaded', () => {
  const subscriptionForms = document.querySelectorAll('.newsletter-subscribe-form');
  
  subscriptionForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = form.querySelector('input[type="email"]').value;
      const name = form.querySelector('input[name="name"]')?.value || '';
      const listType = form.dataset.listType || 'general';
      
      const result = await window.TensectraMailchimp.subscribe(email, name, listType);
      
      // Show result message
      const messageEl = form.querySelector('.subscription-message');
      if (messageEl) {
        messageEl.textContent = result.message;
        messageEl.style.display = 'block';
        messageEl.style.color = result.success ? 'green' : 'red';
      } else {
        alert(result.message);
      }
      
      if (result.success) {
        form.reset();
      }
    });
  });
});

// Add CSS for overlay form
const mailchimpStyles = document.createElement('style');
mailchimpStyles.textContent = `
  .mailchimp-form-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    align-items: center;
    justify-content: center;
    z-index: 10000;
  }
  
  .mailchimp-form-container {
    background: #1a1a1a;
    padding: 2rem;
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    position: relative;
    color: white;
  }
  
  .mailchimp-form-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
  }
  
  #mailchimpSubscribeForm input {
    width: 100%;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border: 1px solid #333;
    border-radius: 4px;
    background: #2a2a2a;
    color: white;
  }
  
  #mailchimpSubscribeForm button {
    width: 100%;
    padding: 0.75rem;
    margin-top: 1rem;
    background: #00CCFF;
    color: black;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
  
  #mailchimpSubscribeForm button:hover {
    background: #00B3E6;
  }
  
  #mcMessage {
    margin-top: 1rem;
    text-align: center;
  }
`;
document.head.appendChild(mailchimpStyles);
