"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", department: "", role: "EMPLOYEE" });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/auth/signup", { method: "POST", body: JSON.stringify(form) });
    if (!response.ok) return toast.error("Unable to create account");
    toast.success("Account created. Please sign in.");
    router.push("/login");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create employee account</CardTitle>
          <p className="text-sm text-slate-500">HR can adjust reporting lines and permissions after signup.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            {(["name", "email", "password", "department"] as const).map((key) => (
              <Input key={key} value={form[key]} type={key === "password" ? "password" : "text"} placeholder={key} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            ))}
            <Button className="w-full">Create account</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
