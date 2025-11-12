<section id="pricing" className="py-20 bg-gray-50 text-center">
  <h2 className="text-3xl font-bold mb-8">Pricing</h2>
  <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-6">
    {[
      { name: "Starter Fix", price: 299, desc: "Up to 25 SKUs" },
      { name: "Pro Fix", price: 499, desc: "Up to 100 SKUs + priority" },
      { name: "Enterprise Audit", price: 799, desc: "Full feed audit + resubmission" },
    ].map((p) => (
      <div key={p.name} className="border rounded-2xl p-8 bg-white shadow">
        <h3 className="text-xl font-semibold mb-2">{p.name}</h3>
        <p className="text-4xl font-bold mb-4">${p.price}</p>
        <p className="mb-6">{p.desc}</p>
        <a
          href="https://buy.stripe.com/test_..." // replace with your Stripe checkout link
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Buy Now
        </a>
      </div>
    ))}
  </div>
</section>
