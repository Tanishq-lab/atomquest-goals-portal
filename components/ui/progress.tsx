export function Progress({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${width}%` }} />
    </div>
  );
}
