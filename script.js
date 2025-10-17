(function(){
  const form = document.getElementById('leadForm');
  const btn  = document.getElementById('submitBtn');
  const note = document.getElementById('formNote');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const show = (msg, isError=true) => {
    note.textContent = msg;
    note.hidden = false;
    note.style.color = isError ? '#ef4444' : '#10b981';
  };

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    note.hidden = true;

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    payload.revenue = Number(payload.revenue || 0);
    payload.consent = !!payload.consent;

    // basic client validation
    if (!payload.name || !payload.email || !payload.company || !payload.revenue){
      show('Please complete all required fields.');
      return;
    }

    btn.disabled = true; btn.textContent = 'Submitting…';

    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success){
        throw new Error(data.message || 'Submission failed.');
      }

      // Fire an optional GA/Ads event on submit
      if (window.gtag) gtag('event','lead_submit',{event_category:'form',value:1});

      if (data.eligible) {
        // Redirect to clean URL (thanks to vercel.json)
        window.location.href = '/thank-you';
      } else {
        show('Thanks! For revenue under $500,000, we’ll reach out with alternatives. You will not be redirected to the thank-you page.', false);
        form.reset();
      }

    } catch (err) {
      console.error(err);
      show('Something went wrong. Please try again in a moment.');
    } finally {
      btn.disabled = false; btn.textContent = 'Submit application';
    }
  });
})();
