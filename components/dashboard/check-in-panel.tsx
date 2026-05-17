"use client";

import { useState } from "react";
import { MessageSquare, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Quarter = "GOAL_SETTING" | "Q1" | "Q2" | "Q3" | "Q4";
type Goal = {
  id: string;
  title: string;
  target: number;
  actualValue?: number | null;
  status: string;
  progress: number;
  updates?: { quarter: Quarter; achievement?: number | null; narrative?: string | null; progress: number }[];
};

export function CheckInPanel({
  goals,
  activeQuarter,
  windowMessage,
  managerMode = false
}: {
  goals: Goal[];
  activeQuarter?: Quarter;
  windowMessage: string;
  managerMode?: boolean;
}) {
  return (
    <Card className="glass-card border-0 bg-white/60 dark:bg-slate-900/60">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          {managerMode ? "Manager Quarterly Check-ins" : "Quarterly Achievement Updates"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{windowMessage}</p>
        
        {/* Timeline visualization snippet */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
          {["GOAL_SETTING", "Q1", "Q2", "Q3", "Q4"].map((q, idx) => (
            <div key={q} className="flex items-center">
              <div className={cn("px-3 py-1 rounded-full text-xs font-semibold border", activeQuarter === q ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white/50 dark:bg-slate-800/50 text-muted-foreground border-white/20")}>
                {q.replace("_", " ")}
              </div>
              {idx < 4 && <div className={cn("w-8 h-0.5", activeQuarter === q ? "bg-primary" : "bg-white/20")}></div>}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!activeQuarter ? <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm animate-pulse-slow">Achievement capture is closed this month.</p> : null}
        {goals.map((goal) => <CheckInRow key={goal.id} goal={goal} quarter={activeQuarter} managerMode={managerMode} />)}
      </CardContent>
    </Card>
  );
}

function CheckInRow({ goal, quarter, managerMode }: { goal: Goal; quarter?: Quarter; managerMode: boolean }) {
  const current = goal.updates?.find((update) => update.quarter === quarter);
  const [achievement, setAchievement] = useState(String(current?.achievement ?? goal.actualValue ?? ""));
  const [status, setStatus] = useState(goal.status);
  const [narrative, setNarrative] = useState(current?.narrative ?? "");
  const [managerComment, setManagerComment] = useState("");

  async function save() {
    if (!quarter) return toast.error("No check-in window is currently open.");
    const response = await fetch("/api/check-ins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId: goal.id, quarter, achievement: Number(achievement), status, narrative, managerComment })
    });
    const json = await response.json();
    if (!response.ok) return toast.error(json.error ?? "Unable to save check-in");
    toast.success(managerMode ? "Check-in review saved" : "Achievement update saved");
    location.reload();
  }

  return (
    <div className="rounded-xl border border-white/20 bg-white/40 dark:bg-black/20 p-5 shadow-sm transition-all hover:shadow-md animate-in-slide">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <p className="font-semibold text-lg">{goal.title}</p>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-xs text-muted-foreground">Planned target: <span className="font-bold text-foreground">{goal.target}</span></p>
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min(goal.progress * 100, 100)}%` }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{Math.round(goal.progress * 100)}%</span>
            </div>
          </div>
        </div>
        <Badge value={status} />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4 bg-white/30 dark:bg-black/30 p-4 rounded-lg border border-white/10 backdrop-blur-sm">
        <label className="text-sm"><span className="mb-1 block font-medium text-foreground">Actual achievement</span><Input className="bg-white/50 dark:bg-black/50" disabled={!quarter || managerMode} value={achievement} onChange={(event) => setAchievement(event.target.value)} type="number" /></label>
        <label className="text-sm"><span className="mb-1 block font-medium text-foreground">Status</span><select disabled={!quarter || managerMode} value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 w-full rounded-md border bg-white/50 dark:bg-black/50 px-3 text-sm"><option value="NOT_STARTED">Not Started</option><option value="ON_TRACK">On Track</option><option value="COMPLETED">Completed</option></select></label>
        <label className="text-sm md:col-span-2"><span className="mb-1 block font-medium text-foreground">Employee note</span><Input className="bg-white/50 dark:bg-black/50" disabled={!quarter || managerMode} value={narrative} onChange={(event) => setNarrative(event.target.value)} /></label>
      </div>
      {managerMode ? (
        <label className="mt-4 block text-sm bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
          <span className="mb-2 flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300"><MessageSquare size={16} /> Structured check-in comment</span>
          <Input className="bg-white/80 dark:bg-black/50" disabled={!quarter} value={managerComment} onChange={(event) => setManagerComment(event.target.value)} placeholder="Document the discussion, blockers, and next action." />
        </label>
      ) : null}
      <div className="mt-4 flex justify-end">
        <Button size="sm" disabled={!quarter} onClick={save} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"><Save size={16} className="mr-2" /> {managerMode ? "Save Review" : "Save Update"}</Button>
      </div>
    </div>
  );
}
