import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "EMPLOYEE" | "MANAGER" | "ADMIN";
      department: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "EMPLOYEE" | "MANAGER" | "ADMIN";
    department: string;
  }
}
