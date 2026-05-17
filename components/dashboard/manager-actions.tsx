"use client";

import { toast } from "sonner";
import { Check, Lock, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ManagerActions({ goalSheetId, admin = false }: { goalSheetId: string; admin?: boolean }) {
  async function act(action: string) {
    const comment = action === "APPROVE" ? "Approved for the active performance cycle." : "Please review the highlighted goals and resubmit.";
    const response = await fetch("/api/approvals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goalSheetId, action, comment }) });
    const json = await response.json();
    if (!response.ok) return toast.error(json.error ?? "Workflow update failed");
    toast.success("Workflow updated");
    location.reload();
  }
  return (
    <div className="flex flex-wrap gap-3 rounded-xl glass p-2 w-max shadow-sm border border-white/20">
      <Button size="sm" onClick={() => act("APPROVE")} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"><Check size={16} className="mr-1.5" /> Approve</Button>
      <Button size="sm" variant="outline" onClick={() => act("RETURN")} className="hover:bg-amber-50 hover:text-amber-700 border-amber-200 dark:hover:bg-amber-900/20"><Undo2 size={16} className="mr-1.5" /> Return for Rework</Button>
      <Button size="sm" variant="secondary" onClick={() => act("LOCK")} className="hover:bg-slate-200 dark:hover:bg-slate-700"><Lock size={16} className="mr-1.5" /> Lock Goals</Button>
      {admin ? <Button size="sm" variant="destructive" onClick={() => act("UNLOCK")} className="shadow-red-600/20"><RotateCcw size={16} className="mr-1.5" /> Admin Unlock</Button> : null}
    </div>
  );
}
