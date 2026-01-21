import { getAdminFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import Link from "next/link";

export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  const admin = await getAdminFromCookie();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-4 md:p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-56 sm:w-96 h-56 sm:h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-40 sm:w-80 h-40 sm:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/20">
          <AdminDashboard />
        </div>
      </div>
    </main>
  );
}
