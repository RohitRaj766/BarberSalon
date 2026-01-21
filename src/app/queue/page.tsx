import PublicQueueDisplay from "@/components/PublicQueueDisplay";
import Link from "next/link";

export default function QueuePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Live Queue
          </h1>
          <p className="text-gray-600 mt-2">See who's being served and your position</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 mb-6 border border-white/20">
          <PublicQueueDisplay />
        </div>

        <div className="text-center space-y-3">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            📅 Book an Appointment
          </Link>
          <p className="text-sm text-gray-600">
            <Link href="/admin/login" className="text-purple-600 hover:text-purple-700 font-medium">
              🔐 Admin Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
