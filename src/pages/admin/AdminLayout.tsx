import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Settings, Monitor, Tag, Home, CreditCard, Shield, FileText, MessageSquare, Gift, MessagesSquare, Truck
} from "lucide-react";

const adminNav = [
  { key: "admin.dashboard", path: "/admin", icon: LayoutDashboard },
  { key: "admin.products", path: "/admin/products", icon: Package },
  { key: "admin.orders", path: "/admin/orders", icon: ShoppingCart },
  { key: "admin.customers", path: "/admin/customers", icon: Users },
  { key: "admin.pos", path: "/admin/pos", icon: Monitor },
  { key: "admin.coupons", path: "/admin/coupons", icon: Tag },
  { key: "admin.landing_pages", path: "/admin/landing-pages", icon: FileText },
  { key: "admin.reviews", path: "/admin/reviews", icon: MessageSquare },
  { key: "admin.payment_settings", path: "/admin/payment-settings", icon: CreditCard },
  { key: "admin.delivery_zones", path: "/admin/delivery-zones", icon: Truck },
  { key: "admin.spin_wheel", path: "/admin/spin-wheel", icon: Gift },
  { key: "admin.live_chat", path: "/admin/chat", icon: MessagesSquare, hasBadge: true },
  { key: "admin.settings", path: "/admin/settings", icon: Settings },
  { key: "admin.admin_mgmt", path: "/admin/admin-management", icon: Shield },
];

const AdminSidebar: React.FC = () => {
  const { t } = useLanguage();
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [unreadChats, setUnreadChats] = useState(0);

  // Poll for unread chat conversations
  useEffect(() => {
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("chat_conversations")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");
      
      // Count conversations that have recent customer messages
      const { data: convos } = await supabase
        .from("chat_conversations")
        .select("id, updated_at")
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(50);

      if (convos) {
        // Check which convos have unread customer messages
        let unread = 0;
        for (const conv of convos) {
          const { data: lastMsg } = await supabase
            .from("chat_messages")
            .select("sender_type")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (lastMsg && lastMsg.sender_type === "customer") unread++;
        }
        setUnreadChats(unread);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);

    // Also listen for realtime changes
    const channel = supabase
      .channel("admin-chat-notify")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        fetchUnread();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="overflow-y-auto">
        {/* Brand */}
        <div className="px-3 py-2 border-b border-sidebar-border">
          <Link to="/admin" className="flex items-center gap-2" onClick={handleNavClick}>
            <div className="w-7 h-7 rounded-md bg-sidebar-primary flex items-center justify-center font-english font-bold text-xs text-sidebar-primary-foreground shrink-0">
              SB
            </div>
            {!collapsed && <span className="font-english font-bold text-sm text-sidebar-foreground">Admin</span>}
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] py-0.5">{!collapsed && (t("admin.dashboard"))}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNav.map(item => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild className="h-8 text-xs">
                    <NavLink
                      to={item.path}
                      end={item.path === "/admin"}
                      className="hover:bg-sidebar-accent/50 relative py-1.5"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      onClick={handleNavClick}
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-xs">{t(item.key)}</span>}
                      {item.hasBadge && unreadChats > 0 && (
                        <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] rounded-full bg-sidebar-primary text-sidebar-primary-foreground text-[9px] font-bold flex items-center justify-center px-0.5 animate-pulse">
                          {unreadChats >= 999 ? "999+" : unreadChats}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Back to store - positioned above bottom */}
        <div className="mt-auto px-4 py-3 border-t border-sidebar-border">
          <Link to="/" className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/70 hover:text-sidebar-primary transition-colors" onClick={handleNavClick}>
            <Home className="h-4 w-4" />
            {!collapsed && "Go to Store"}
          </Link>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

const AdminLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-11 flex items-center border-b border-border px-3 bg-card shrink-0 sticky top-0 z-10">
            <SidebarTrigger className="mr-3" />
            <h2 className="font-english font-semibold text-xs text-card-foreground">SB Mobile — Admin</h2>
          </header>
          <main className="flex-1 p-3 sm:p-4 bg-secondary/30 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
