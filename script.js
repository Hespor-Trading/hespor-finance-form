window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("leadForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    const revenue = Number(String(payload.annualRevenue || "").replace(/[^0-9.]/g, ""));
    if (!revenue || revenue < 500000) {
      alert("Unfortunately, you’re not eligible at this time (revenue under $500,000 USD in the last 12 months).");
      return;
    }

    try {
      // still tries backend, but redirect happens regardless
      await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (_) {
      /* ignore network/email errors */
    }

    // always redirect to thank-you page
    window.location.href = "https://finance.hespor.com/thank-you";
  });
});
