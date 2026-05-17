import { NextResponse } from "next/server";
import { requireSession } from "@/lib/rbac";
import { getDashboardData, submitGoalSheet, upsertGoalSheet } from "@/lib/goals-service";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const data = await getDashboardData(auth.session.user.id, auth.session.user.role);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const auth = await requireSession(["EMPLOYEE", "ADMIN"]);
  if ("error" in auth) return auth.error;
  try {
    const body = await request.json();
    const result = body.intent === "submit" ? await submitGoalSheet(auth.session.user.id, body.cycleId) : await upsertGoalSheet(auth.session.user.id, body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save goals" }, { status: 400 });
  }
}
