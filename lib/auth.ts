import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { DEMO_PASSWORD, demoUsers, isDemoMode } from "@/lib/demo-data";

type AppRole = "EMPLOYEE" | "MANAGER" | "ADMIN";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        if (isDemoMode()) {
          const demo = demoUsers.find((item) => item.email === parsed.data.email);
          if (!demo || parsed.data.password !== DEMO_PASSWORD) return null;
          return {
            id: demo.id,
            email: demo.email,
            name: demo.name,
            role: demo.role,
            department: demo.department
          } as never;
        }

        let user;
        try {
          user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        } catch (error) {
          const demo = demoUsers.find((item) => item.email === parsed.data.email);
          if (demo && parsed.data.password === DEMO_PASSWORD) {
            return {
              id: demo.id,
              email: demo.email,
              name: demo.name,
              role: demo.role,
              department: demo.department
            } as never;
          }
          throw error;
        }
        if (!user) return null;
        const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.department
        } as never;
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as unknown as { role: AppRole }).role;
        token.department = (user as unknown as { department: string }).department;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = token.role as "EMPLOYEE" | "MANAGER" | "ADMIN";
        session.user.department = String(token.department ?? "");
      }
      return session;
    }
  }
};
