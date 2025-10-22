// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Your form's id in index.html is "leadForm"
  const form = document.getElementById("leadForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // In index.html the inputs use NAMEs (not IDs). Read from names:
    const fullName = form.elements["name"]?.value?.trim();
    const email = form.elements["email"]?.value?.trim();
    const company = form.elements["company"]?.value?.trim();
    const annualRevenue = form.elements["annualRevenue"]?.value?.trim();
    const phone = form.elements["phone"]?.value?.trim();       // optional
    const message = form.elements["message"]?.value?.trim();   // optional

    if (!fullName || !email || !company || !annualRevenue) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // API expects whatsapp + notes; map from phone + message
        body: JSON.stringify({
          name: fullName,
          email,
          company,
          annualRevenue,
          whatsapp: phone || "",
          notes: message || "",
        }),
      });

      const data = await response.json();

      // Always redirect on success
      if (response.ok && data?.success) {
        window.location.href = "https://finance.hespor.com/thank-you";
      } else {
        console.error("Submit failed:", data);
        alert("Submission failed. Please try again.");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("Network error. Please try again later.");
    }
  });
});
