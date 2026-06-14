"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  Users,
  Warehouse,
  ShoppingCart,
  Wallet,
  Handshake,
  UserCircle,
  BarChart3,
  Settings,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { LABELS } from "@/lib/labels";

export function Sidebar() {
  const pathname = usePathname();
  const businessType = useAppStore((state) => state.businessType);
  const labels = LABELS[businessType];

  const items = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/hr", label: "Ishchilar", icon: Users },
    { href: "/ombor", label: labels.warehouseName, icon: Warehouse },
    { href: "/pos", label: labels.posTitle, icon: ShoppingCart },
    { href: "/moliya", label: "Moliya", icon: Wallet },
    { href: "/hamkorlar", label: "Hamkorlar", icon: Handshake },
    { href: "/mijozlar", label: "Mijozlar", icon: UserCircle },
    { href: "/hisobotlar", label: "Hisobotlar", icon: BarChart3 },
    { href: "/sozlamalar", label: "Sozlamalar", icon: Settings },
  ];

  return (
    <aside className="hidden w-60 flex-col bg-gray-900 text-gray-100 md:flex">
      <div className="px-4 py-5 text-lg font-bold tracking-wide">Xorazm ERP</div>
      <nav className="flex-1 space-y-1 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-brand-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
