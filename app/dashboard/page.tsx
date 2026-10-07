import StatsGrid from "@/components/dashboard/StatsGrid";
import RecentTasks from "@/components/dashboard/RecentTasks";
import RecentActivity from "@/components/dashboard/RecentActivity";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import QuickActions from "@/components/dashboard/QuickActions";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
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
