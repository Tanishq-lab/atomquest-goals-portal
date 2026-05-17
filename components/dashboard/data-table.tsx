"use client";

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";

export function DataTable<T>({ data, columns }: { data: T[]; columns: ColumnDef<T>[] }) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>{group.headers.map((header) => <th key={header.id} className="px-4 py-3">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t">
              {row.getVisibleCells().map((cell) => <td key={cell.id} className="px-4 py-3 align-top">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
