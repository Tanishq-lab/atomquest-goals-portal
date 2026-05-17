import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REWORK_REQUESTED: "bg-amber-100 text-amber-800",
  LOCKED: "bg-slate-900 text-white",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  ON_TRACK: "bg-blue-100 text-blue-700",
  NOT_STARTED: "bg-slate-100 text-slate-700"
};

export function Badge({ value, className }: { value: string; className?: string }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", tones[value] ?? "bg-indigo-100 text-indigo-700", className)}>{value.replaceAll("_", " ")}</span>;
}
