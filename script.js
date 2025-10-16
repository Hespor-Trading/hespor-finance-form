// Footer year
document.getElementById('y').textContent = new Date().getFullYear();

// Eligibility gate: block if last fiscal revenue < 500k
const form = document.getElementById('leadForm');
const revenueInput = document.getElementById('revenue');
const msg = document.getElementById('eligibilityMessage');

form.addEventListener('submit', (e) => {
  const rev = Number(revenueInput.value || 0);
  if (rev < 500000) {
    e.preventDefault();
    msg.hidden = false;
    msg.textContent = "Unfortunately, you’re not eligible yet. Current program requires at least $500,000 in revenue in the last fiscal year. Please check back as we expand eligibility.";
    msg.scrollIntoView({behavior:'smooth', block:'center'});
  }
});
