import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { toCsv } from "@/lib/utils";
import { isDemoMode, demoSheets } from "@/lib/demo-data";

export async function GET(request: Request) {
  const auth = await requireSession(["MANAGER", "ADMIN"]);
  if ("error" in auth) return auth.error;
  const format = new URL(request.url).searchParams.get("format") ?? "csv";
  let sheets;
  if (isDemoMode()) {
    sheets = auth.session.user.role === "MANAGER" 
      ? demoSheets.filter(sheet => sheet.employee.managerId === auth.session.user.id)
      : demoSheets;
  } else {
    sheets = await prisma.goalSheet.findMany({
      where: auth.session.user.role === "MANAGER" ? { employee: { managerId: auth.session.user.id } } : undefined,
      include: { employee: true, cycle: true, goals: true },
      orderBy: { updatedAt: "desc" }
    });
  }
  const rows = sheets.flatMap((sheet) =>
    sheet.goals.map((goal) => ({
      employee: sheet.employee.name,
      department: sheet.employee.department,
      cycle: sheet.cycle.name,
      workflow: sheet.state,
      goal: goal.title,
      thrustArea: goal.thrustArea,
      planned: goal.target,
      actual: goal.actualValue ?? "",
      weightage: goal.weightage,
      progress: Math.round(goal.progress),
      status: goal.status
    }))
  );
  const csv = toCsv(rows);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": format === "excel" ? "application/vnd.ms-excel" : "text/csv",
      "Content-Disposition": `attachment; filename="goals-report.${format === "excel" ? "xls" : "csv"}"`
    }
  });
}
