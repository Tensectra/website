// Tensectra — Dynamic Scholarship Tracking
// Fetches and displays real-time scholarship availability from Supabase

class ScholarshipTracker {
  constructor() {
    this.supabase = null;
    this.init();
  }

  async init() {
    // Wait for Supabase to be available
    if (typeof window._supabase !== 'undefined' && window._supabase) {
      this.supabase = window._supabase;
      await this.updateScholarshipCounts();
      // Refresh every 30 seconds
      setInterval(() => this.updateScholarshipCounts(), 30000);
    } else {
      console.warn('Supabase not loaded, scholarship tracking disabled');
    }
  }

  async updateScholarshipCounts() {
    try {
      // Fetch all active cohorts
      const { data: cohorts, error } = await this.supabase
        .from('cohorts')
        .select('id, course, scholarship_slots, scholarship_filled')
        .eq('status', 'open');

      if (error) throw error;

      if (cohorts && cohorts.length > 0) {
        // Update each cohort's scholarship display
        cohorts.forEach(cohort => {
          this.updateScholarshipDisplay(cohort);
        });

        // Update overall scholarship stats
        const totalSlots = cohorts.reduce((sum, c) => sum + c.scholarship_slots, 0);
        const totalFilled = cohorts.reduce((sum, c) => sum + c.scholarship_filled, 0);
        const totalRemaining = totalSlots - totalFilled;

        this.updateOverallDisplay(totalFilled, totalRemaining, totalSlots);
      }
    } catch (error) {
      console.error('Error fetching scholarship data:', error);
    }
  }

  updateScholarshipDisplay(cohort) {
    const remaining = cohort.scholarship_slots - cohort.scholarship_filled;
    const filled = cohort.scholarship_filled;
    const total = cohort.scholarship_slots;

    // Update elements with data attributes
    const selector = `[data-scholarship-course="${cohort.course}"]`;
    
    document.querySelectorAll(`${selector} [data-scholarship="filled"]`).forEach(el => {
      el.textContent = filled;
    });

    document.querySelectorAll(`${selector} [data-scholarship="remaining"]`).forEach(el => {
      el.textContent = remaining;
    });

    document.querySelectorAll(`${selector} [data-scholarship="total"]`).forEach(el => {
      el.textContent = total;
    });

    // Update progress bar if exists
    document.querySelectorAll(`${selector} [data-scholarship="progress"]`).forEach(el => {
      const percentage = (filled / total) * 100;
      el.style.width = `${percentage}%`;
      el.setAttribute('aria-valuenow', percentage);
    });

    // Show/hide availability message
    if (remaining === 0) {
      document.querySelectorAll(`${selector} [data-scholarship="available"]`).forEach(el => {
        el.style.display = 'none';
      });
      document.querySelectorAll(`${selector} [data-scholarship="unavailable"]`).forEach(el => {
        el.style.display = 'block';
      });
    } else {
      document.querySelectorAll(`${selector} [data-scholarship="available"]`).forEach(el => {
        el.style.display = 'block';
      });
      document.querySelectorAll(`${selector} [data-scholarship="unavailable"]`).forEach(el => {
        el.style.display = 'none';
      });
    }
  }

  updateOverallDisplay(filled, remaining, total) {
    // Update overall stats (for general scholarship section)
    document.querySelectorAll('[data-scholarship-overall="filled"]').forEach(el => {
      el.textContent = filled;
    });

    document.querySelectorAll('[data-scholarship-overall="remaining"]').forEach(el => {
      el.textContent = remaining;
    });

    document.querySelectorAll('[data-scholarship-overall="total"]').forEach(el => {
      el.textContent = total;
    });

    // Update progress
    document.querySelectorAll('[data-scholarship-overall="progress"]').forEach(el => {
      const percentage = (filled / total) * 100;
      el.style.width = `${percentage}%`;
    });

    // Update availability message
    const availabilityText = remaining > 0 
      ? `${filled} of ${total} slots filled — ${remaining} remaining`
      : 'All scholarship slots filled for this cohort';

    document.querySelectorAll('[data-scholarship-overall="status"]').forEach(el => {
      el.textContent = availabilityText;
    });
  }

  // Get scholarship status for a specific course
  async getScholarshipStatus(course) {
    try {
      const { data, error } = await this.supabase
        .from('cohorts')
        .select('scholarship_slots, scholarship_filled')
        .eq('course', course)
        .eq('status', 'open')
        .single();

      if (error) throw error;

      const remaining = data.scholarship_slots - data.scholarship_filled;
      return {
        total: data.scholarship_slots,
        filled: data.scholarship_filled,
        remaining: remaining,
        available: remaining > 0
      };
    } catch (error) {
      console.error('Error fetching scholarship status:', error);
      return null;
    }
  }
}

// Initialize scholarship tracker when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.ScholarshipTracker = new ScholarshipTracker();
});
