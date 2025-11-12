export default function SuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 text-center px-4">
      <h1 className="text-4xl font-bold text-green-600 mb-4">✅ Payment Successful!</h1>
      <p className="text-gray-700 max-w-md mb-6">
        Thank you for your purchase! We're processing your feed now. You will
        receive an email with your cleaned CSV once it is ready. You can
        always check the status of your past scans on the
        <a href="/scans" className="underline text-blue-600"> scans page</a>.
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
