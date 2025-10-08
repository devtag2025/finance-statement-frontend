'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-[60vh] grid place-items-center p-6">
      <div className="w-full max-w-xl text-center">
        <p className="text-sm font-medium tracking-widest text-gray-500">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-gray-600">
          The page you’re looking for doesn’t exist or may have moved.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Go back
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-transparent bg-black px-4 py-2 text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Go home
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/search"
            className="rounded-xl border border-gray-200 p-4 text-left transition hover:bg-gray-50"
          >
            <div className="font-semibold">Search the site</div>
            <div className="text-sm text-gray-600">Try finding what you need</div>
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-gray-200 p-4 text-left transition hover:bg-gray-50"
          >
            <div className="font-semibold">Contact support</div>
            <div className="text-sm text-gray-600">We’re happy to help</div>
          </Link>
        </div>
      </div>
    </main>
  );
}
