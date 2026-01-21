import QueueDisplay from "@/components/QueueDisplay";
import Link from "next/link";

interface StatusPageProps {
  params: Promise<{ id: string }>;
}

export default async function StatusPage({ params }: StatusPageProps): Promise<React.ReactElement> {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Queue Status</h1>
          <p className="text-gray-600 mt-2">Check your position in line</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <QueueDisplay bookingId={id} />
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Booking
          </Link>
        </div>
      </div>
    </main>
  );
}
