import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/goals-service";
import { StatCard } from "@/components/dashboard/stat-card";
import { AnalyticsCharts } from "@/components/dashboard/charts";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const data = await getDashboardData(session.user.id, "MANAGER");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">Team performance overview for the current cycle.</p>
        </div>
        <Link href="/goals" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
          Review Team Goals <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Team Completion" value={`${data.analytics.completion}%`} />
        <StatCard label="Goal Sheets" value={data.analytics.sheets} />
        <StatCard label="Tracked Goals" value={data.analytics.goals} />
      </div>
      <AnalyticsCharts analytics={data.analytics} />
    </div>
  );
}

