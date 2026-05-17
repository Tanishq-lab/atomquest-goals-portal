import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/goals-service";
import { AnalyticsCharts } from "@/components/dashboard/charts";
import { StatCard } from "@/components/dashboard/stat-card";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const data = await getDashboardData(session.user.id, session.user.role);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-slate-500">Goal completion charts, quarter trends, distributions, and departmental views.</p></div>
      <div className="grid gap-4 md:grid-cols-3"><StatCard label="Completion" value={`${data.analytics.completion}%`} /><StatCard label="Sheets" value={data.analytics.sheets} /><StatCard label="Goals" value={data.analytics.goals} /></div>
      <AnalyticsCharts analytics={data.analytics} />
    </div>
  );
}
