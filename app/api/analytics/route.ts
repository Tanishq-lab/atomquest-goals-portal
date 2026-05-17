import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/goals-service";
import { requireSession } from "@/lib/rbac";

export async function GET() {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  const data = await getDashboardData(auth.session.user.id, auth.session.user.role);
  return NextResponse.json(data.analytics);
}
