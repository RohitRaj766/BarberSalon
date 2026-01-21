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
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-white/20">
          <AdminDashboard />
        </div>
      </div>
    </main>
  );
}
