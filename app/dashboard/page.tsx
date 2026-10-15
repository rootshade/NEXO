import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentTasks from "@/components/dashboard/RecentTasks";
import RecentActivity from "@/components/dashboard/RecentActivity";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import QuickActions from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-6 shadow-xl shadow-indigo-950/20 sm:p-7">
        <div className="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">NEXO WORKSPACE</div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">Your workspace at a glance. Track progress, tasks, and recent activity.</p>
        </div>
      </section>
      <WelcomeSection />

      <StatsGrid />

      <QuickActions />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentTasks />

        <RecentActivity />
      </div>
    </div>
  );
}
