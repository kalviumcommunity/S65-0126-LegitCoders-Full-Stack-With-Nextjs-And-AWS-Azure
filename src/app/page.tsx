export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 font-sans">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-16 px-8">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-blue-900 dark:text-blue-100">
              🌊 Flood Early Warning System
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Real-time flood risk monitoring and alerts for flood-prone districts using open meteorological data
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-left space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              System Status
            </h2>
            <div className="space-y-2">
              <StatusItem label="Frontend" status="Ready" />
              <StatusItem label="Backend API" status="Ready" />
              <StatusItem label="Database (PostgreSQL)" status="Awaiting Setup" />
              <StatusItem label="Cache (Redis)" status="Awaiting Setup" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <FeatureCard
              icon="📊"
              title="Data Visualization"
              description="Real-time rainfall and weather data visualization"
            />
            <FeatureCard
              icon="⚠️"
              title="Smart Alerts"
              description="Automated alerts based on risk assessment"
            />
            <FeatureCard
              icon="🗺️"
              title="District Monitoring"
              description="Track multiple flood-prone districts"
            />
          </div>

          <div className="pt-8 text-sm text-gray-600 dark:text-gray-400">
            <p>Built with Next.js, PostgreSQL, Prisma, Redis, and Docker</p>
            <p className="mt-2">Team LegitCoders | Kalvium S65</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: string }) {
  const isReady = status === "Ready";
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <span className={`font-medium ${isReady ? 'text-green-600' : 'text-yellow-600'}`}>
        {isReady ? '✓' : '○'} {status}
      </span>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center space-y-2">
      <div className="text-4xl">{icon}</div>
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
