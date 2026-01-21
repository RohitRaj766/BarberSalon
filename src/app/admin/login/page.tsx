import AdminLoginForm from "@/components/AdminLoginForm";
import Link from "next/link";

export default function AdminLoginPage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-600 mt-2">Manage bookings and queue</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <AdminLoginForm />
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Booking
          </Link>
        </div>
      </div>
    </main>
  );
}
