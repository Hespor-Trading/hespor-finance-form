// footer year
document.getElementById('y').textContent = new Date().getFullYear();

const form = document.getElementById('lead-form');
const revenueInput = document.getElementById('revenue');
const msg = document.getElementById('eligibility-msg');

form.addEventListener('submit', (e) => {
  const revenue = Number(revenueInput.value || 0);
  if (revenue < 500000) {
    e.preventDefault();
    msg.hidden = false;
    msg.style.color = '#b91c1c';
    msg.textContent = 'Unfortunately, applicants with less than USD 500,000 in last fiscal-year revenue are not yet eligible. Please reach out to info@hespor.com and we’ll notify you when criteria expand.';
    revenueInput.focus();
    revenueInput.scrollIntoView({behavior:'smooth', block:'center'});
  } else {
    msg.hidden = true; // allow submit
  }
});
