"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Goal = { id: string; title: string; target: number; weightage: number; sharedGoalId?: string | null };

export function ManagerInlineEditor({ goalSheetId, goals, disabled }: { goalSheetId: string; goals: Goal[]; disabled: boolean }) {
  const [rows, setRows] = useState(goals.map((goal) => ({ ...goal })));
  const total = rows.reduce((sum, row) => sum + Number(row.weightage || 0), 0);

  async function save() {
    const response = await fetch("/api/manager-goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalSheetId, goals: rows.map(({ id, target, weightage }) => ({ id, target, weightage })) })
    });
    const json = await response.json();
    if (!response.ok) return toast.error(json.error ?? "Unable to save manager edits");
    toast.success("Manager inline edits saved");
    location.reload();
  }

  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">Inline approval edits</p>
        <p className={total === 100 ? "text-sm text-emerald-700" : "text-sm text-red-600"}>Weightage total: {total}%</p>
      </div>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={row.id} className="grid gap-2 md:grid-cols-[1fr_120px_120px]">
            <div className="rounded-md border bg-white px-3 py-2 text-sm">
              {row.title}
              {row.sharedGoalId ? <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">Shared KPI</span> : null}
            </div>
            <Input disabled={disabled || Boolean(row.sharedGoalId)} value={row.target} type="number" onChange={(event) => setRows(rows.map((item, i) => i === index ? { ...item, target: Number(event.target.value) } : item))} />
            <Input disabled={disabled} value={row.weightage} type="number" onChange={(event) => setRows(rows.map((item, i) => i === index ? { ...item, weightage: Number(event.target.value) } : item))} />
          </div>
        ))}
      </div>
      <Button className="mt-3" size="sm" disabled={disabled} onClick={save}><Save size={15} /> Save inline edits</Button>
    </div>
  );
}
