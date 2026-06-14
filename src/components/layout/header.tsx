"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { getSession, logout, Session } from "@/lib/auth";
import { useAppStore } from "@/lib/store";
import { BUSINESS_TYPE_NAMES } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const businessType = useAppStore((state) => state.businessType);

  useEffect(() => {
    setSession(getSession());
  }, []);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-6">
      <Badge tone="blue">{BUSINESS_TYPE_NAMES[businessType]}</Badge>
      <div className="flex items-center gap-3">
        {session && (
          <span className="text-sm text-gray-600">
            {session.fullName} <span className="text-gray-400">({session.role})</span>
          </span>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut size={16} />
          Chiqish
        </Button>
      </div>
    </header>
  );
}
