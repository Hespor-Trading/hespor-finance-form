// script.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("financeForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName")?.value?.trim();
    const email = document.getElementById("email")?.value?.trim();
    const company = document.getElementById("company")?.value?.trim();
    const annualRevenue = document.getElementById("annualRevenue")?.value?.trim();
    const whatsapp = document.getElementById("whatsapp")?.value?.trim();
    const notes = document.getElementById("notes")?.value?.trim();

    if (!fullName || !email || !company || !annualRevenue) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch("https://hespor-finance-form.vercel.app/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          company,
          annualRevenue,
          whatsapp,
          notes,
        }),
      });

      const data = await response.json();

      // ✅ Always redirect after successful submission
      if (response.ok && data.success) {
        window.location.href = "https://finance.hespor.com/thank-you";
      } else {
        alert("Submission failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again later.");
    }
  });
});
