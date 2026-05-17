"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DataTable } from "@/components/dashboard/data-table";

type GoalRow = {
  title: string;
  thrustArea: string;
  target: number;
  actualValue?: number | null;
  weightage: number;
  progress: number;
  status: string;
};

export function GoalTable({ goals }: { goals: GoalRow[] }) {
  const columns: ColumnDef<GoalRow>[] = [
    { header: "Goal", cell: ({ row }) => <div><p className="font-medium">{row.original.title}</p><p className="text-xs text-slate-500">{row.original.thrustArea}</p></div> },
    { header: "Planned", accessorKey: "target" },
    { header: "Actual", cell: ({ row }) => row.original.actualValue ?? "Pending" },
    { header: "Weight", cell: ({ row }) => `${row.original.weightage}%` },
    { header: "Progress", cell: ({ row }) => <div className="min-w-36"><Progress value={row.original.progress} /><p className="mt-1 text-xs text-slate-500">{Math.round(row.original.progress)}%</p></div> },
    { header: "Status", cell: ({ row }) => <Badge value={row.original.status} /> }
  ];
  return <DataTable data={goals} columns={columns} />;
}
