export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4">
          404
        </h1>

        <p className="text-gray-400 mb-6">
          The page you are looking for does not exist.
        </p>

        <a
          href="/"
          className="bg-[#95BF47] text-black px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
        >
          Go Back Home
        </a>
      </div>
    </main>
  );
}