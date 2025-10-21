// script.js
const form = document.getElementById('lead-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      company: document.getElementById('company').value.trim(),
      annualRevenue: document.getElementById('annualRevenue').value.trim(), // can include commas/$
      whatsapp: document.getElementById('whatsapp').value.trim(),
      notes: document.getElementById('notes').value.trim(),
    };

    const res = await fetch('https://hespor-finance-form.vercel.app/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(`Submit error: ${data.message || res.statusText}`);
      return;
    }

    // success → send user to Canva thank-you on your domain
    window.location.href = 'https://finance.hespor.com/thank-you';
  });
}
