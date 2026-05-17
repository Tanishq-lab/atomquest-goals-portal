import { NextResponse } from "next/server";
import { saveCheckIn } from "@/lib/goals-service";
import { requireSession } from "@/lib/rbac";

export async function POST(request: Request) {
  const auth = await requireSession();
  if ("error" in auth) return auth.error;
  try {
    return NextResponse.json(await saveCheckIn(auth.session.user.id, auth.session.user.role, await request.json()));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Check-in failed" }, { status: 400 });
  }
}
