document.getElementById('y').textContent = new Date().getFullYear();

const form = document.getElementById('leadForm');
const revenue = document.getElementById('revenue');
const notice = document.getElementById('eligibility');

form.addEventListener('submit', (e) => {
  const rev = Number(revenue.value || 0);
  if (rev < 500000) {
    e.preventDefault();
    notice.hidden = false;
    notice.className = 'notice warn';
    notice.textContent = 'Unfortunately your last fiscal year revenue is below USD 500,000, so this program is not available right now.';
    // Optional: fire an Ads/GA event if you added gtag
    // if (typeof gtag === 'function') gtag('event','lead_ineligible',{value:rev});
    return;
  }
  notice.hidden = false;
  notice.className = 'notice ok';
  notice.textContent = 'Looks eligible. Submitting securely…';
  // if (typeof gtag === 'function') gtag('event','lead_submit',{value:rev});
});
