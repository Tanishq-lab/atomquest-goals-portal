import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/goals-service";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { GoalTable } from "@/components/dashboard/goal-table";
import { AnalyticsCharts } from "@/components/dashboard/charts";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const data = await getDashboardData(session.user.id, "EMPLOYEE");
  const sheet = data.sheet;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Your performance snapshot for the current cycle.</p>
        </div>
        {sheet ? <Badge value={sheet.state} /> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Weighted Progress" value={`${data.analytics.completion}%`} hint="Across current cycle goals" />
        <StatCard label="Goals" value={data.analytics.goals} />
        <StatCard label="Active Cycle" value={data.cycle?.name ?? "No active cycle"} />
      </div>
      {sheet?.goals?.length ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Goals</h2>
            <Link href="/goals" className="flex items-center gap-1 text-sm text-primary hover:underline">
              Manage goals <ArrowRight size={14} />
            </Link>
          </div>
          <GoalTable goals={sheet.goals} />
          <AnalyticsCharts analytics={data.analytics} />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-white/40 bg-white/20 dark:bg-black/20 p-10 text-center">
          <p className="text-muted-foreground mb-4">You haven\'t set up your goals yet for this cycle.</p>
          <Link href="/goals" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
            Create My Goals <ArrowRight size={14} />
          </Link>
        </div>
      )}
      {sheet?.comments?.length ? (
        <section className="glass-card rounded-xl p-5 space-y-3">
          <h2 className="font-semibold text-lg">Manager Comments</h2>
          {sheet.comments.map((c: any) => (
            <div key={c.id} className="rounded-lg bg-white/40 dark:bg-black/20 p-3 text-sm">
              <span className="font-medium text-foreground">{(c as any).author.name}:</span>{" "}
              <span className="text-muted-foreground">{c.body}</span>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}
