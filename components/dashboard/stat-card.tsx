import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
