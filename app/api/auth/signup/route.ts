import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  department: z.string().min(2),
  role: z.enum(["EMPLOYEE", "MANAGER"]).default("EMPLOYEE")
});

export async function POST(request: Request) {
  try {
    const data = signupSchema.parse(await request.json());
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({ data: { ...data, passwordHash } });
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Signup failed" }, { status: 400 });
  }
}
