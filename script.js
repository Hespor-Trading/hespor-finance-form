// year stamp
document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('eligibilityForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = form.querySelector('button[type="submit"]');

  // Eligibility check: minimum $500,000 last fiscal year
  const revenue = parseFloat((form.annual_revenue.value || '0').replace(/,/g, ''));
  if (isFinite(revenue) && revenue < 500000) {
    alert('Unfortunately, you are not eligible at this time (minimum revenue: $500,000 USD).');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';

  try {
    const payload = Object.fromEntries(new FormData(form).entries());

    const resp = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (resp.ok) {
      window.location.href = '/thank-you.html';
    } else {
      const t = await resp.text();
      alert('Submission failed: ' + t);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  } catch (err) {
    alert('Submission failed. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
});
