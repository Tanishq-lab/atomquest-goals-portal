import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";

export async function GET(request: Request) {
  const auth = await requireSession(["ADMIN"]);
  if ("error" in auth) return auth.error;
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const logs = await prisma.auditLog.findMany({
    where: query ? { OR: [{ action: { contains: query, mode: "insensitive" } }, { entityType: { contains: query, mode: "insensitive" } }] } : undefined,
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return NextResponse.json(logs);
}
