"use client";

import { useMemo, useState } from "react";
import { Send, CalendarPlus, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type User = { id: string; name: string; role: string; department: string };
type Cycle = { id: string; name: string; year: number; isActive: boolean };

export function AdminControls({ users, cycles, activeCycleId }: { users: User[]; cycles: Cycle[]; activeCycleId?: string }) {
  const employees = useMemo(() => users.filter((user) => user.role === "EMPLOYEE"), [users]);
  const [selected, setSelected] = useState<string[]>(employees.map((employee) => employee.id));
  const [shared, setShared] = useState({
    title: "Improve departmental KPI performance",
    thrustArea: "Strategic KPI",
    description: "Improve the shared departmental KPI with measurable quarterly progress.",
    target: 90,
    uomType: "PERCENTAGE",
    progressType: "MIN",
    cycleId: activeCycleId ?? cycles[0]?.id ?? "",
    weightage: 10,
    deadline: "2027-03-31"
  });
  const [cycle, setCycle] = useState({ name: `FY ${new Date().getFullYear() + 1} Goals`, year: new Date().getFullYear() + 1, startsAt: `${new Date().getFullYear()}-05-01`, endsAt: `${new Date().getFullYear() + 1}-04-30`, isActive: false });

  async function pushShared() {
    const response = await fetch("/api/shared-goals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...shared, employeeIds: selected }) });
    const json = await response.json();
    if (!response.ok) return toast.error(json.error ?? "Unable to push shared KPI");
    toast.success("Shared KPI pushed to selected employees");
    location.reload();
  }

  async function createCycle() {
    const response = await fetch("/api/cycles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cycle) });
    const json = await response.json();
    if (!response.ok) return toast.error(json.error ?? "Unable to create cycle");
    toast.success("Cycle created");
    location.reload();
  }

  async function exportAchievementReport() {
    try {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Failed to export report");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Achievement_Report_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Report downloaded successfully");
    } catch (err) {
      toast.error("Unable to download achievement report");
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="glass-card border-0 bg-white/60 dark:bg-slate-900/60 shadow-sm transition-all hover:shadow-md animate-in-slide">
        <CardHeader className="flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Push Shared Departmental KPI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" value={shared.title} onChange={(event) => setShared({ ...shared, title: event.target.value })} placeholder="Goal title" />
            <Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" value={shared.thrustArea} onChange={(event) => setShared({ ...shared, thrustArea: event.target.value })} placeholder="Thrust area" />
            <Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" value={shared.target} onChange={(event) => setShared({ ...shared, target: Number(event.target.value) })} type="number" placeholder="Target" />
            <Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" value={shared.weightage} onChange={(event) => setShared({ ...shared, weightage: Number(event.target.value) })} type="number" placeholder="Default weightage" />
            <Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" value={shared.deadline} onChange={(event) => setShared({ ...shared, deadline: event.target.value })} type="date" />
            <select value={shared.cycleId} onChange={(event) => setShared({ ...shared, cycleId: event.target.value })} className="h-10 rounded-md border bg-white/50 dark:bg-black/30 backdrop-blur-sm px-3 text-sm">{cycles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          </div>
          <Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" value={shared.description} onChange={(event) => setShared({ ...shared, description: event.target.value })} placeholder="Description" />
          <div className="max-h-44 space-y-2 overflow-auto rounded-lg border border-white/20 bg-white/30 dark:bg-black/20 p-4 shadow-inner">
            {employees.map((employee) => <label key={employee.id} className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors"><input type="checkbox" className="rounded text-primary focus:ring-primary" checked={selected.includes(employee.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, employee.id] : selected.filter((id) => id !== employee.id))} /><span><span className="font-medium text-foreground">{employee.name}</span> <span className="text-muted-foreground">· {employee.department}</span></span></label>)}
          </div>
          <Button onClick={pushShared} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"><Send size={16} className="mr-2" /> Push shared KPI</Button>
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card className="glass-card border-0 bg-white/60 dark:bg-slate-900/60 shadow-sm transition-all hover:shadow-md animate-in-slide" style={{ animationDelay: '0.1s' }}>
        <CardHeader className="pb-4"><CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Cycle Management</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" value={cycle.name} onChange={(event) => setCycle({ ...cycle, name: event.target.value })} />
            <Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" value={cycle.year} onChange={(event) => setCycle({ ...cycle, year: Number(event.target.value) })} type="number" />
            <Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" value={cycle.startsAt} onChange={(event) => setCycle({ ...cycle, startsAt: event.target.value })} type="date" />
            <Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" value={cycle.endsAt} onChange={(event) => setCycle({ ...cycle, endsAt: event.target.value })} type="date" />
          </div>
          <label className="flex items-center gap-3 text-sm cursor-pointer hover:text-primary transition-colors"><input type="checkbox" className="rounded text-primary focus:ring-primary" checked={cycle.isActive} onChange={(event) => setCycle({ ...cycle, isActive: event.target.checked })} /> <span className="font-medium text-foreground">Mark as active cycle</span></label>
          <Button variant="outline" onClick={createCycle} className="glass hover:bg-primary/10 hover:text-primary"><CalendarPlus size={16} className="mr-2 text-primary" /> Create cycle</Button>
          <div className="space-y-3 pt-4 border-t border-white/20">
            {cycles.map((item) => <div key={item.id} className="rounded-lg border border-white/20 bg-white/30 dark:bg-black/20 p-3 text-sm flex items-center justify-between"><span className="font-medium text-foreground">{item.name} <span className="text-muted-foreground ml-1">· {item.year}</span></span> {item.isActive ? <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Active</span> : null}</div>)}
          </div>
        </CardContent>
      </Card>
      
      <Card className="glass-card border-0 bg-white/60 dark:bg-slate-900/60 shadow-sm transition-all hover:shadow-md animate-in-slide" style={{ animationDelay: '0.2s' }}>
        <CardHeader className="pb-4"><CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Governance & Reporting</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Export the achievement report (CSV) showing planned targets vs. actual achievements for all employees.</p>
          <Button onClick={exportAchievementReport} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white shadow-lg"><Download size={16} className="mr-2" /> Download CSV Report</Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
