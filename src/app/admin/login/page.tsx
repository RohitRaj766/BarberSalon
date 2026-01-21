import AdminLoginForm from "@/components/AdminLoginForm";
import Link from "next/link";

export default function AdminLoginPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-56 sm:w-96 h-56 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-md mx-auto py-8 sm:py-12 md:py-16 relative z-10">
        {/* Logo/Icon */}
        <div className="text-center mb-6 sm:mb-8 animate-float px-4">
          <div className="inline-block mb-4 sm:mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <span className="text-4xl sm:text-5xl">🔐</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">Admin Portal</h1>
          <p className="text-purple-200 text-base sm:text-lg">Manage bookings and queue</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 hover:border-white/30 transition-all duration-300 mx-4">
          <AdminLoginForm />
        </div>

        {/* Back Link */}
        <div className="text-center mt-6 sm:mt-8 px-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1 sm:gap-2 text-purple-200 hover:text-white font-medium transition-colors duration-200 group text-sm sm:text-base"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Back to Booking
          </Link>
        </div>
      </div>
    </main>
  );
}
