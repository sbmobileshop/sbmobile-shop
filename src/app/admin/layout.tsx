"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Wrench,
  GraduationCap,
  CreditCard,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", labelBn: "ড্যাশবোর্ড", path: "/admin", icon: LayoutDashboard },
  { label: "Products", labelBn: "পণ্য", path: "/admin/products", icon: Package },
  { label: "Orders", labelBn: "অর্ডার", path: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", labelBn: "গ্রাহক", path: "/admin/customers", icon: Users },
  { label: "Tools", labelBn: "টুলস", path: "/admin/tools", icon: Wrench },
  { label: "Courses", labelBn: "কোর্স", path: "/admin/courses", icon: GraduationCap },
  { label: "Payment", labelBn: "পেমেন্ট", path: "/admin/payment", icon: CreditCard },
  { label: "Analytics", labelBn: "অ্যানালিটিক্স", path: "/admin/analytics", icon: BarChart3 },
  { label: "Settings", labelBn: "সেটিংস", path: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground fixed left-0 top-0 bottom-0 z-40 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <Link href="/admin" className="font-bold text-lg">
              Admin Panel
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-sm"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Back to Site</span>}
          </Link>
        </div>
      </aside>

      <main className={cn("flex-1 transition-all duration-300", collapsed ? "ml-16" : "ml-64")}>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
