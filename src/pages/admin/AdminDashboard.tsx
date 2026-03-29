import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, Users, TrendingUp, Loader2, AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0, pending: 0, incomplete: 0, payVerify: 0, fraudWarning: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id, amount, status, fraud_status, customer_phone", { count: "exact" }),
      supabase.from("orders").select("id, customer_name, customer_phone, amount, status, payment_method, created_at, fraud_status").order("created_at", { ascending: false }).limit(8),
      supabase.from("products").select("id, name, name_bn, stock, image_url").eq("status", "active").lte("stock", 5).order("stock").limit(8),
    ]).then(([prodR, ordR, recentR, lowR]) => {
      const orders = ordR.data || [];
      const completed = orders.filter((o: any) => o.status === "completed" || o.status === "delivered");
      const pending = orders.filter((o: any) => o.status === "pending");
      const incomplete = orders.filter((o: any) => o.status === "incomplete");
      const payVerify = orders.filter((o: any) => o.status === "payment_verification");
      const fraudWarning = orders.filter((o: any) => o.fraud_status === "Warning" || o.fraud_status === "Fraud");
      const uniquePhones = new Set(orders.map((o: any) => o.customer_phone));
      setStats({
        products: prodR.count || 0,
        orders: orders.length,
        customers: uniquePhones.size,
        revenue: completed.reduce((s: number, o: any) => s + Number(o.amount), 0),
        pending: pending.length,
        incomplete: incomplete.length,
        payVerify: payVerify.length,
        fraudWarning: fraudWarning.length,
      });
      setRecentOrders(recentR.data || []);
      setLowStock(lowR.data || []);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: language === "bn" ? "পণ্য" : "Products", value: stats.products, icon: Package, color: "text-blue-600 bg-blue-500/10" },
    { label: language === "bn" ? "অর্ডার" : "Orders", value: stats.orders, icon: ShoppingCart, color: "text-green-600 bg-green-500/10", extra: stats.pending > 0 ? `${stats.pending} pending` : "" },
    { label: language === "bn" ? "কাস্টমার" : "Customers", value: stats.customers, icon: Users, color: "text-purple-600 bg-purple-500/10" },
    { label: language === "bn" ? "আয়" : "Revenue", value: `৳${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: "text-orange-600 bg-orange-500/10" },
  ];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    incomplete: "bg-orange-100 text-orange-800",
    payment_verification: "bg-cyan-100 text-cyan-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">{language === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(stat => (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">{stat.value}</p>
                  {stat.extra && <p className="text-xs text-yellow-600 mt-0.5">{stat.extra}</p>}
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Cards */}
      {(stats.incomplete > 0 || stats.payVerify > 0 || stats.fraudWarning > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {stats.incomplete > 0 && (
            <button onClick={() => navigate("/admin/orders")} className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-4 text-left border border-orange-200 dark:border-orange-800 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">{language === "bn" ? "অসম্পূর্ণ অর্ডার" : "Incomplete Orders"}</span>
              </div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.incomplete}</p>
            </button>
          )}
          {stats.payVerify > 0 && (
            <button onClick={() => navigate("/admin/orders")} className="bg-cyan-50 dark:bg-cyan-950/30 rounded-xl p-4 text-left border border-cyan-200 dark:border-cyan-800 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-cyan-600" />
                <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">{language === "bn" ? "পেমেন্ট যাচাই" : "Payment Verify"}</span>
              </div>
              <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats.payVerify}</p>
            </button>
          )}
          {stats.fraudWarning > 0 && (
            <button onClick={() => navigate("/admin/orders")} className="bg-red-50 dark:bg-red-950/30 rounded-xl p-4 text-left border border-red-200 dark:border-red-800 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="h-4 w-4 text-red-600" />
                <span className="text-sm font-semibold text-red-700 dark:text-red-300">{language === "bn" ? "ফ্রড সতর্কতা" : "Fraud Warnings"}</span>
              </div>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.fraudWarning}</p>
            </button>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              {language === "bn" ? "সাম্প্রতিক অর্ডার" : "Recent Orders"}
              <button onClick={() => navigate("/admin/orders")} className="text-xs text-accent hover:underline font-normal">
                {language === "bn" ? "সব দেখুন" : "View All"}
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">{language === "bn" ? "কোনো অর্ডার নেই" : "No orders yet"}</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-medium text-foreground">{o.customer_name}</p>
                        {(o.fraud_status === "Warning" || o.fraud_status === "Fraud") && (
                          <ShieldAlert className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{o.payment_method} • {new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-accent">৳{Number(o.amount).toLocaleString()}</p>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[o.status] || ""}`}>{o.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              {language === "bn" ? "লো স্টক সতর্কতা" : "Low Stock Alerts"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">{language === "bn" ? "সব পণ্য স্টকে আছে" : "All products well stocked"}</p>
            ) : (
              <div className="space-y-2">
                {lowStock.map(p => (
                  <div key={p.id} className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                      {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <span className="text-xs text-muted-foreground">SB</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-foreground">{language === "bn" ? (p.name_bn || p.name) : p.name}</p>
                    </div>
                    <Badge variant={p.stock === 0 ? "destructive" : "outline"} className={p.stock > 0 ? "bg-yellow-100 text-yellow-800 border-yellow-200" : ""}>
                      {p.stock === 0 ? (language === "bn" ? "স্টক আউট" : "Out") : `${p.stock} left`}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
