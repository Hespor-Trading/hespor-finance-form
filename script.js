document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("leadForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    // ✅ Eligibility check
    const revenue = Number((payload.annualRevenue || "").toString().replace(/[^0-9.]/g, ""));
    if (!revenue || revenue < 500000) {
      alert("Unfortunately, you’re not eligible at this time (revenue under $500,000 USD in the last 12 months).");
      return false;
    }

    try {
      const res = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // ✅ Redirect to finance.hespor.com/thank-you after success
        window.location.href = "https://finance.hespor.com/thank-you";
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    }

    return false; // Prevent default form reload
  });
});
