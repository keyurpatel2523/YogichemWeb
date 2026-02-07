import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-bold text-[#003DA5]">404</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or no longer exists.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#003DA5] text-white font-medium rounded-lg hover:bg-[#002d7a] transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center px-6 py-3 border border-[#003DA5] text-[#003DA5] font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            Search Products
          </Link>
        </div>
      </div>
    </div>
  );
}
