import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/goals-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { AnalyticsCharts } from "@/components/dashboard/charts";
import { ManagerActions } from "@/components/dashboard/manager-actions";
import { AdminControls } from "@/components/dashboard/admin-controls";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const data = await getDashboardData(session.user.id, "ADMIN");
  const users = data.users ?? [];
  const sheets = data.sheets ?? [];
  const auditLogs = data.auditLogs ?? [];
  const cycles = data.cycles ?? [];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Admin / HR dashboard</h1><p className="text-slate-500">Manage users, cycles, locks, auditability, reports, and completion insights.</p></div>
        <div className="flex gap-2"><a className="rounded-md border bg-white px-4 py-2 text-sm font-medium" href="/api/reports?format=csv">CSV export</a><a className="rounded-md border bg-white px-4 py-2 text-sm font-medium" href="/api/reports?format=excel">Excel export</a></div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Employees" value={users.length} />
        <StatCard label="Goal sheets" value={data.analytics.sheets} />
        <StatCard label="Completion" value={`${data.analytics.completion}%`} />
        <StatCard label="Audit events" value={auditLogs.length} />
      </div>
      <AnalyticsCharts analytics={data.analytics} />
      <AdminControls users={users} cycles={cycles} activeCycleId={data.cycle?.id} />
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>User management</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {users.map((user) => <div key={user.id} className="flex items-center justify-between rounded-md border p-3"><div><p className="font-medium">{user.name}</p><p className="text-xs text-slate-500">{user.email} · {user.department}</p></div><Badge value={user.role} /></div>)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Audit logs</CardTitle></CardHeader>
          <CardContent className="max-h-96 space-y-3 overflow-auto">
            {auditLogs.map((log) => <div key={log.id} className="rounded-md border p-3 text-sm"><p className="font-medium">{log.action} · {log.entityType}</p><p className="text-xs text-slate-500">{log.actor.name} · {log.createdAt.toLocaleString()}</p></div>)}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Unlock and workflow control</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {sheets.map((sheet) => <div key={sheet.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"><div><p className="font-medium">{sheet.employee.name}</p><Badge value={sheet.state} /></div><ManagerActions goalSheetId={sheet.id} admin /></div>)}
        </CardContent>
      </Card>
    </div>
  );
}
