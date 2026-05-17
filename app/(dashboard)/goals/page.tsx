import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getActiveQuarterWindow, getDashboardData } from "@/lib/goals-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalForm } from "@/components/dashboard/goal-form";
import { GoalTable } from "@/components/dashboard/goal-table";
import { ManagerActions } from "@/components/dashboard/manager-actions";
import { ManagerInlineEditor } from "@/components/dashboard/manager-inline-editor";
import { CheckInPanel } from "@/components/dashboard/check-in-panel";

export default async function GoalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session.user.role;
  const data = await getDashboardData(session.user.id, role);
  const activeWindow = getActiveQuarterWindow();

  // EMPLOYEE — show their own goal sheet editor
  if (role === "EMPLOYEE") {
    const sheet = (data as any).sheet;
    const locked = sheet ? ["APPROVED", "LOCKED"].includes(sheet.state) : false;
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">My Goals</h1>
            <p className="text-muted-foreground">Manage your goal sheet for the current cycle.</p>
          </div>
          {sheet ? <Badge value={sheet.state} /> : null}
        </div>
        {sheet?.goals?.length ? <GoalTable goals={sheet.goals} /> : null}
        {(data as any).cycle ? (
          <GoalForm cycleId={(data as any).cycle.id} goals={sheet?.goals ?? []} locked={locked} />
        ) : (
          <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">No active performance cycle. Check back later.</p>
        )}
        {sheet?.goals?.length ? (
          <CheckInPanel
            goals={sheet.goals}
            activeQuarter={activeWindow?.quarter}
            windowMessage={activeWindow?.message ?? "No quarterly achievement window is open this month."}
          />
        ) : null}
        {sheet?.comments?.length ? (
          <section className="glass-card rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-lg">Manager Comments</h2>
            {sheet.comments.map((c: any) => (
              <div key={c.id} className="rounded-lg bg-white/40 dark:bg-black/20 p-3 text-sm">
                <span className="font-medium text-foreground">{c.author.name}:</span>{" "}
                <span className="text-muted-foreground">{c.body}</span>
              </div>
            ))}
          </section>
        ) : null}
      </div>
    );
  }

  // MANAGER — show team goal sheets for review
  if (role === "MANAGER") {
    const sheets = (data as any).sheets ?? [];
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Team Goals</h1>
          <p className="text-muted-foreground">Review, edit, and approve your team's goal sheets.</p>
        </div>
        {sheets.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">No goal sheets submitted yet.</p>
        ) : (
          sheets.map((sheet: any) => (
            <Card key={sheet.id} className="glass-card border-0 bg-white/60 dark:bg-slate-900/60">
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>{sheet.employee.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{sheet.employee.department} · {sheet.employee.designation}</p>
                </div>
                <Badge value={sheet.state} />
              </CardHeader>
              <CardContent className="space-y-4">
                <GoalTable goals={sheet.goals} />
                <ManagerInlineEditor goalSheetId={sheet.id} goals={sheet.goals} disabled={!["SUBMITTED", "REWORK_REQUESTED"].includes(sheet.state)} />
                <CheckInPanel goals={sheet.goals} activeQuarter={activeWindow?.quarter} windowMessage={activeWindow?.message ?? "No quarterly achievement window is open this month."} managerMode />
                <ManagerActions goalSheetId={sheet.id} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  // ADMIN — show all goal sheets
  const sheets = (data as any).sheets ?? [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Goal Sheets</h1>
        <p className="text-muted-foreground">Organisation-wide view of all employee goal sheets.</p>
      </div>
      {sheets.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">No goal sheets found.</p>
      ) : (
        sheets.map((sheet: any) => (
          <Card key={sheet.id} className="glass-card border-0 bg-white/60 dark:bg-slate-900/60">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>{sheet.employee.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{sheet.employee.department} · {sheet.employee.designation}</p>
              </div>
              <Badge value={sheet.state} />
            </CardHeader>
            <CardContent className="space-y-4">
              <GoalTable goals={sheet.goals} />
              <ManagerActions goalSheetId={sheet.id} admin />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
