import { NextResponse } from "next/server";
import { pushSharedGoal } from "@/lib/goals-service";
import { requireSession } from "@/lib/rbac";

export async function POST(request: Request) {
  const auth = await requireSession(["MANAGER", "ADMIN"]);
  if ("error" in auth) return auth.error;
  try {
    return NextResponse.json(await pushSharedGoal(auth.session.user.id, auth.session.user.role, await request.json()));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to push shared KPI" }, { status: 400 });
  }
}
