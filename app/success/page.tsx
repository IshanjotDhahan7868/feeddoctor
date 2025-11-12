export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 text-center px-4">
      <h1 className="text-4xl font-bold text-green-600 mb-4">
        ✅ Payment Successful!
      </h1>
      <p className="text-gray-700 max-w-md mb-6">
        Your feed is now being fixed. You’ll receive an email with your cleaned
        CSV file within 24 hours. Thank you for using <b>FeedDoctor</b>!
      </p>
      <a
        href="/"
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl transition"
      >
        Back to Home
      </a>
    </div>
  );
}
