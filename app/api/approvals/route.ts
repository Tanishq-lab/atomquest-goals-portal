import { NextResponse } from "next/server";
import { runApproval } from "@/lib/goals-service";
import { requireSession } from "@/lib/rbac";
import { approvalSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const auth = await requireSession(["MANAGER", "ADMIN"]);
  if ("error" in auth) return auth.error;
  try {
    const input = approvalSchema.parse(await request.json());
    const result = await runApproval(auth.session.user.id, auth.session.user.role, input);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Approval failed" }, { status: 400 });
  }
}
