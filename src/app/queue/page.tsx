import PublicQueueDisplay from "@/components/PublicQueueDisplay";
import Link from "next/link";

export default function QueuePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-56 sm:w-96 h-56 sm:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-40 sm:w-80 h-40 sm:h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto py-6 sm:py-8 md:py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10 animate-float px-4">
          <div className="inline-block mb-3 sm:mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <span className="text-3xl sm:text-4xl md:text-5xl">👥</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
            Live Queue
          </h1>
          <p className="text-purple-200 text-sm sm:text-base md:text-xl">See who's being served and your position</p>
        </div>

        {/* Queue Display Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 border border-white/20">
          <PublicQueueDisplay />
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-3 sm:space-y-4 px-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl sm:rounded-2xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95"
          >
            <span className="text-lg sm:text-xl">📅</span>
            <span>Book slot</span>
            <span>→</span>
          </Link>
          <p className="text-xs sm:text-sm text-purple-200">
            <Link 
              href="/admin/login" 
              className="text-white hover:text-purple-200 font-medium inline-flex items-center gap-1 sm:gap-2 transition-colors duration-200 group"
            >
              <span>🔐</span>
              Admin Login
              <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
