<!-- keep your existing HTML; just make sure your form has id="leadForm" and the inputs have the ids below -->
<script>
  (function () {
    const form = document.getElementById('leadForm');
    if (!form) return;

    const API_URL = '/api/submit-form'; // works on finance.hespor.com because API is in same project

    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // read fields by id – keep your same IDs
      const fullName      = document.getElementById('fullName')?.value?.trim();
      const email         = document.getElementById('email')?.value?.trim();
      const company       = document.getElementById('company')?.value?.trim();
      const annualRevenue = document.getElementById('annualRevenue')?.value?.trim();
      const whatsapp      = document.getElementById('whatsapp')?.value?.trim();
      const notes         = document.getElementById('notes')?.value?.trim();

      try {
        const r = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, email, company, annualRevenue, whatsapp, notes })
        });

        const data = await r.json().catch(() => ({}));

        if (r.ok && data?.success) {
          window.location.href = '/thank-you';
        } else {
          alert(data?.message || 'Submission failed. Please try again.');
        }
      } catch (err) {
        alert('Network error. Please try again.');
      }
    });
  })();
</script>
