"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminRoute from "@/components/AdminRoute";
import { useLng } from "@/hooks/useLng";

function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lng = useLng();

  const navItems = [
    { href: `/${lng}/admin`, label: "Dashboard", icon: "📊" },
    { href: `/${lng}/admin/users`, label: "Users", icon: "👥" },
    { href: `/${lng}/admin/scores`, label: "Scores", icon: "🏆" },
    { href: `/${lng}/admin/games`, label: "Games", icon: "🎮" },
    { href: `/${lng}/admin/config`, label: "Config", icon: "⚙️" },
  ];

  return (
    <div className="flex gap-6 min-h-[calc(100vh-5.5rem)] px-6 py-8 max-w-6xl mx-auto w-full">
      <aside className="w-48 shrink-0">
        <div className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Admin</div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-[#c8e63d] text-foreground font-medium"
                    : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 min-w-0 min-h-0 overflow-auto">{children}</main>
    </div>
  );
}

export default function AdminLayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  );
}
