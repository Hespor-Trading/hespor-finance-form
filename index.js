const handleSubmit = async (event) => {
  event.preventDefault();

  const formData = {
    name: event.target.name.value,
    email: event.target.email.value,
    company: event.target.company.value,
    annualRevenue: event.target.annualRevenue.value,
    message: event.target.message.value,
  };

  const res = await fetch("/api/submit-form", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Something went wrong. Please try again.");
    return;
  }

  // ✅ redirect to your official subdomain thank-you page
  window.location.href = "https://finance.hespor.com/thank-you";
};
