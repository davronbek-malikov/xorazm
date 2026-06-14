"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useHydratedStore } from "@/lib/use-hydrated-store";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hydrated = useHydratedStore();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!hydrated) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">Yuklanmoqda...</div>;
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
