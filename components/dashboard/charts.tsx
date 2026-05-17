"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const colors = ["#8b5cf6", "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

export function AnalyticsCharts({ analytics }: { analytics: { byStatus: { name: string; value: number }[]; byUom: { name: string; value: number }[]; byDepartment: { name: string; value: number }[]; workflow: { name: string; value: number }[] } }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ChartCard title="Status Distribution" data={analytics.byStatus} />
      <PieCard title="UoM Breakdown" data={analytics.byUom} />
      <ChartCard title="Department Heatmap" data={analytics.byDepartment} />
      <PieCard title="Workflow States" data={analytics.workflow} />
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-3 rounded-lg border border-white/20 shadow-lg">
        <p className="text-sm font-semibold">{label || payload[0].name}</p>
        <p className="text-sm text-primary font-bold">{payload[0].value} goals</p>
      </div>
    );
  }
  return null;
};

function ChartCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <Card className="glass-card border-0 bg-white/60 dark:bg-slate-900/60 shadow-sm hover:shadow-md transition-all animate-in-slide">
      <CardHeader><CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">{title}</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" strokeOpacity={0.2} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#888" }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
            <Bar dataKey="value" fill="url(#colorValue)" radius={[6, 6, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function PieCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  return (
    <Card className="glass-card border-0 bg-white/60 dark:bg-slate-900/60 shadow-sm hover:shadow-md transition-all animate-in-slide">
      <CardHeader><CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">{title}</CardTitle></CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={5} animationDuration={1500}>
              {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
