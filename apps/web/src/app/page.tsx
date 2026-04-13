import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <h1 className="text-4xl font-bold mb-4">Simple SaaS Template</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        A simple, secure, and scalable template for building SaaS applications.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
