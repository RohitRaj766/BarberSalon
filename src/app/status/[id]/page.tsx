import QueueDisplay from "@/components/QueueDisplay";
import Link from "next/link";

interface StatusPageProps {
  params: Promise<{ id: string }>;
}

export default async function StatusPage({ params }: StatusPageProps): Promise<React.ReactElement> {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-2xl mx-auto py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-float">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-4xl">📊</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Queue Status</h1>
          <p className="text-blue-200 text-lg">Check your position in line</p>
        </div>

        {/* Status Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mb-6 border border-white/20">
          <QueueDisplay bookingId={id} />
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
            Back to Booking
          </Link>
        </div>
      </div>
    </main>
  );
}
