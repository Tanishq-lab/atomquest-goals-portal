"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { goalSheetSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FormValues = z.infer<typeof goalSheetSchema>;

const blankGoal = {
  thrustArea: "",
  title: "",
  description: "",
  uomType: "NUMERIC" as const,
  progressType: "MIN" as const,
  target: 1,
  weightage: 10,
  deadline: new Date().toISOString().slice(0, 10),
  status: "NOT_STARTED" as const
};

export function GoalForm({ cycleId, goals, locked }: { cycleId: string; locked: boolean; goals: Array<Partial<FormValues["goals"][number]>> }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(goalSheetSchema),
    defaultValues: {
      cycleId,
      goals: goals.length ? goals.map((goal) => ({ ...blankGoal, ...goal, deadline: String(goal.deadline ?? blankGoal.deadline).slice(0, 10) as never })) as FormValues["goals"] : [{ ...blankGoal } as never]
    }
  });
  const fields = useFieldArray({ control: form.control, name: "goals" });
  const total = form.watch("goals").reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);

  async function save(intent?: "submit") {
    const valid = await form.trigger();
    if (!valid) return toast.error("Please fix validation errors before continuing.");
    const response = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(intent === "submit" ? { intent, cycleId } : form.getValues())
    });
    const json = await response.json();
    if (!response.ok) return toast.error(json.error ?? "Unable to save goals");
    toast.success(intent === "submit" ? "Submitted for manager approval" : "Draft saved");
    location.reload();
  }

  async function suggest() {
    const response = await fetch("/api/ai", { method: "POST", body: JSON.stringify({ department: "your department", intent: "SMART_GOALS" }) });
    const json = await response.json();
    toast.message("AI suggestions", { description: json.text });
  }

  return (
    <Card className="glass-card border-0 bg-white/60 dark:bg-slate-900/60">
      <CardHeader className="flex-row items-center justify-between pb-4">
        <div className="space-y-1.5 w-full max-w-md">
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Goal Sheet</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className={cn("h-full transition-all duration-500", total === 100 ? "bg-emerald-500" : total > 100 ? "bg-red-500" : "bg-primary")} style={{ width: `${Math.min(total, 100)}%` }} />
            </div>
            <span className={cn("text-sm font-semibold whitespace-nowrap", total === 100 ? "text-emerald-600 dark:text-emerald-400" : total > 100 ? "text-red-600 dark:text-red-400" : "text-muted-foreground")}>{total}% / 100%</span>
          </div>
          {total !== 100 && <p className="text-xs text-red-500 animate-pulse-slow">Total weightage must equal exactly 100%.</p>}
        </div>
        <Button type="button" variant="outline" onClick={suggest} className="glass hover:bg-primary/10 hover:text-primary"><Sparkles size={16} className="mr-2 text-primary" /> Suggest Goals</Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.fields.map((field, index) => (
          <div key={field.id} className="rounded-xl border border-white/20 bg-white/40 dark:bg-black/20 p-5 shadow-sm transition-all hover:shadow-md animate-in-slide">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold text-lg flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs text-primary">{index + 1}</span>
                {field.sharedGoalId ? <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">Shared KPI - weightage only</span> : "Goal Details"}
              </p>
              <Button disabled={locked || Boolean(field.sharedGoalId) || fields.fields.length === 1} type="button" variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => fields.remove(index)}><Trash2 size={16} /></Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Thrust Area" error={form.formState.errors.goals?.[index]?.thrustArea?.message}><Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" disabled={locked || Boolean(field.sharedGoalId)} {...form.register(`goals.${index}.thrustArea`)} /></Field>
              <Field label="Goal Title" error={form.formState.errors.goals?.[index]?.title?.message}><Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" disabled={locked || Boolean(field.sharedGoalId)} {...form.register(`goals.${index}.title`)} /></Field>
              <Field label="Target" error={form.formState.errors.goals?.[index]?.target?.message}><Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" disabled={locked || Boolean(field.sharedGoalId)} type="number" {...form.register(`goals.${index}.target`)} /></Field>
              <Field label="Weightage (%)" error={form.formState.errors.goals?.[index]?.weightage?.message}><Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" disabled={locked} type="number" {...form.register(`goals.${index}.weightage`)} /></Field>
              <Field label="UoM Type"><select disabled={locked || Boolean(field.sharedGoalId)} className="h-10 w-full rounded-md border bg-white/50 dark:bg-black/30 backdrop-blur-sm px-3 text-sm" {...form.register(`goals.${index}.uomType`)}><option value="NUMERIC">Numeric</option><option value="PERCENTAGE">Percentage</option><option value="TIMELINE">Timeline</option><option value="ZERO_BASED">Zero-based</option></select></Field>
              <Field label="Formula"><select disabled={locked || Boolean(field.sharedGoalId)} className="h-10 w-full rounded-md border bg-white/50 dark:bg-black/30 backdrop-blur-sm px-3 text-sm" {...form.register(`goals.${index}.progressType`)}><option value="MIN">Min target</option><option value="MAX">Max threshold</option><option value="TIMELINE">Timeline</option><option value="ZERO">Zero based</option></select></Field>
              <Field label="Deadline"><Input className="bg-white/50 dark:bg-black/30 backdrop-blur-sm" disabled={locked || Boolean(field.sharedGoalId)} type="date" {...form.register(`goals.${index}.deadline`)} /></Field>
              <Field label="Status"><select disabled={locked} className="h-10 w-full rounded-md border bg-white/50 dark:bg-black/30 backdrop-blur-sm px-3 text-sm" {...form.register(`goals.${index}.status`)}><option value="NOT_STARTED">Not Started</option><option value="ON_TRACK">On Track</option><option value="COMPLETED">Completed</option></select></Field>
            </div>
            <Field label="Description" error={form.formState.errors.goals?.[index]?.description?.message}><textarea disabled={locked || Boolean(field.sharedGoalId)} className="mt-2 min-h-20 w-full rounded-md border bg-white/50 dark:bg-black/30 backdrop-blur-sm px-3 py-2 text-sm" {...form.register(`goals.${index}.description`)} /></Field>
          </div>
        ))}
        {form.formState.errors.goals?.message ? <p className="text-sm text-red-600">{form.formState.errors.goals.message}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button disabled={locked || fields.fields.length >= 8} type="button" variant="outline" onClick={() => fields.append({ ...blankGoal } as never)}><Plus size={16} /> Add goal</Button>
          <Button disabled={locked} type="button" variant="secondary" onClick={() => save()}><Save size={16} /> Save draft</Button>
          <Button disabled={locked} type="button" onClick={() => save("submit")}><Send size={16} /> Submit</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-foreground">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-500">{error}</span> : null}
    </label>
  );
}
