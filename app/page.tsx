import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          SmartScore
        </h1>
        <p className="text-lg text-gray-600">
          Internal Project Scoring System
        </p>

        <div className="grid gap-4 mt-8">
          <Link
            href="/login"
            className="block w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg transition-transform hover:scale-105"
          >
            Reviewer Login
          </Link>

          <Link
            href="/display"
            className="block w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg shadow-lg transition-transform hover:scale-105"
          >
            Live Display
          </Link>

          <Link
            href="/admin"
            className="block w-full py-3 px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium shadow transition-colors mt-4"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
