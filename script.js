<script>
  const API_URL = 'https://hespor-finance-form.vercel.app/api/submit-form';
  const THANK_YOU_URL = 'https://finance.hespor.com/thank-you';

  const form = document.getElementById('financeForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName')?.value?.trim();
      const email = document.getElementById('email')?.value?.trim();
      const company = document.getElementById('company')?.value?.trim();
      const annualRevenue = Number(
        document.getElementById('annualRevenue')?.value?.replace(/[^0-9.]/g, '')
      );
      const whatsapp = document.getElementById('whatsapp')?.value?.trim() || '';
      const notes = document.getElementById('notes')?.value?.trim() || '';

      if (!fullName || !email || !company || !annualRevenue) {
        alert('Please complete Full Name, Email, Company, and Annual Revenue.');
        return;
      }

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, company, annualRevenue, whatsapp, notes }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        window.location.href = THANK_YOU_URL;
      } else {
        alert(data?.message || 'Submission failed. Please try again.');
      }
    });
  }
</script>
