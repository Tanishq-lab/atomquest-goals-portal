import { NextResponse } from "next/server";
import { createCycle } from "@/lib/goals-service";
import { requireSession } from "@/lib/rbac";

export async function POST(request: Request) {
  const auth = await requireSession(["ADMIN"]);
  if ("error" in auth) return auth.error;
  try {
    return NextResponse.json(await createCycle(auth.session.user.id, await request.json()));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create cycle" }, { status: 400 });
  }
}
