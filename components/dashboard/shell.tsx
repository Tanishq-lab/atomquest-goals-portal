"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BarChart3, ClipboardList, LayoutDashboard, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: ClipboardList },
  { href: "/analytics", label: "Analytics", icon: BarChart3 }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data } = useSession();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOut({ redirect: false, callbackUrl: "/login" });
    } finally {
      router.replace("/login");
      router.refresh();
      setIsSigningOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

      <aside className="fixed inset-y-0 left-0 hidden w-64 glass border-r-0 lg:block m-4 rounded-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 text-xl font-bold">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-lg shadow-primary/30 text-white"><Users size={20} /></div>
            <span className="text-gradient">AtomQuest</span>
          </div>
        </div>
        <nav className="mt-6 px-4 grid gap-2">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:translate-x-1")}>
              <item.icon size={18} /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-[18rem]">
        <header className="sticky top-4 z-10 flex h-16 items-center justify-between glass-card mx-4 md:mx-8 rounded-2xl px-6">
          <div>
            <p className="text-sm font-semibold text-foreground">{data?.user?.name}</p>
            <p className="text-xs text-muted-foreground">{data?.user?.role?.replace("_", " ")} · {data?.user?.department}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={handleSignOut} disabled={isSigningOut} className="hover:bg-destructive/10 hover:text-destructive">
            <LogOut size={16} className="mr-2" /> {isSigningOut ? "Signing out..." : "Sign out"}
          </Button>
        </header>
        <main className="p-4 md:p-8 animate-in-fade">{children}</main>
      </div>
    </div>
  );
}
