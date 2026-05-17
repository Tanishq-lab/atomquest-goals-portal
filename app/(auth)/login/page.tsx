"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const demos = [
  { label: "Employee", email: "employee@test.com" },
  { label: "Manager", email: "manager@test.com" },
  { label: "Admin", email: "admin@test.com" }
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("employee@test.com");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    await login(email, password);
  }

  async function login(nextEmail: string, nextPassword: string) {
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: nextEmail,
        password: nextPassword,
        redirect: false,
        callbackUrl: "/dashboard"
      });
      if (result?.error) setError("Invalid email or password.");
      else {
        router.replace("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-indigo-600 text-white">
            <ShieldCheck size={22} />
          </div>
          <CardTitle>Sign in to GoalHub</CardTitle>
          <p className="text-sm text-slate-500">Use a demo account or your HR-provisioned credentials.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Email" />
            <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
          </form>
          <div className="mt-5 grid gap-2">
            {demos.map((demo) => (
              <Button key={demo.email} type="button" variant="outline" disabled={loading} onClick={() => {
                setEmail(demo.email);
                setPassword("Password123!");
                void login(demo.email, "Password123!");
              }}>
                Sign in as {demo.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
