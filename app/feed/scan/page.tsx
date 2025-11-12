const handleCheckout = async () => {
  try {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 29900 }), // in cents
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Checkout failed to initialize.");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong starting checkout.");
  }
};
<button
  onClick={handleCheckout}
  className="inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
>
  Fix Now ($299)
</button>
