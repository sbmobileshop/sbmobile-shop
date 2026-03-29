import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Search, Package, Clock, CheckCircle2, Truck,
  AlertTriangle, Phone, Hash, CreditCard, MapPin, ShoppingBag
} from "lucide-react";
import { motion } from "framer-motion";

interface OrderData {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string | null;
  payment_method: string;
  transaction_id: string;
  amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  delivery_zone: string | null;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bgClass: string; label: Record<string, string> }> = {
  pending: {
    icon: <Clock className="h-5 w-5" />,
    color: "text-amber-600",
    bgClass: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    label: { en: "Payment Pending", bn: "পেমেন্ট অপেক্ষমাণ" },
  },
  confirmed: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: "text-green-600",
    bgClass: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    label: { en: "Confirmed", bn: "নিশ্চিত" },
  },
  processing: {
    icon: <Package className="h-5 w-5" />,
    color: "text-blue-600",
    bgClass: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    label: { en: "Processing", bn: "প্রসেসিং" },
  },
  shipped: {
    icon: <Truck className="h-5 w-5" />,
    color: "text-indigo-600",
    bgClass: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800",
    label: { en: "Shipped", bn: "শিপ হয়েছে" },
  },
  delivered: {
    icon: <CheckCircle2 className="h-5 w-5" />,
    color: "text-green-700",
    bgClass: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    label: { en: "Delivered", bn: "ডেলিভারি হয়েছে" },
  },
  cancelled: {
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "text-red-600",
    bgClass: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    label: { en: "Cancelled", bn: "বাতিল" },
  },
};

const OrderTrackingPage: React.FC = () => {
  const { language } = useLanguage();
  const [searchInput, setSearchInput] = useState("");
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Auto-load if order ID comes from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oid = params.get("id");
    const ph = params.get("phone");
    if (oid) {
      setSearchInput(oid);
      searchByOrderId(oid);
    } else if (ph) {
      setSearchInput(ph);
      searchByPhone(ph);
    }
  }, []);

  const searchByOrderId = async (id: string) => {
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("orders").select("*").eq("id", id).limit(1);
    setOrders((data || []) as unknown as OrderData[]);
    setLoading(false);
  };

  const searchByPhone = async (phone: string) => {
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("orders").select("*")
      .eq("customer_phone", phone)
      .order("created_at", { ascending: false }).limit(10);
    setOrders((data || []) as unknown as OrderData[]);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = searchInput.trim();
    if (!input) return;
    // Detect if input looks like a UUID (order ID) or phone number
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input);
    const isShortId = /^[0-9a-f]{8}$/i.test(input);
    const cleanPhone = input.replace(/\D/g, "");

    if (isUUID) {
      await searchByOrderId(input);
    } else if (isShortId) {
      // Search by partial order ID
      setLoading(true);
      setSearched(true);
      const { data } = await supabase
        .from("orders").select("*").ilike("id", `${input}%`).order("created_at", { ascending: false }).limit(10);
      setOrders((data || []) as unknown as OrderData[]);
      setLoading(false);
    } else if (cleanPhone.length >= 11) {
      await searchByPhone(cleanPhone);
    } else {
      // Try as partial phone
      setLoading(true);
      setSearched(true);
      const { data } = await supabase
        .from("orders").select("*").ilike("customer_phone", `%${cleanPhone}%`).order("created_at", { ascending: false }).limit(10);
      setOrders((data || []) as unknown as OrderData[]);
      setLoading(false);
    }
  };

  const parseItems = (notes: string | null) => {
    try {
      if (!notes) return [];
      const parsed = JSON.parse(notes);
      return parsed?.items || [];
    } catch { return []; }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-[69px]" />
      <main className="flex-1 bg-muted/30">
        {/* Hero */}
        <div className="relative py-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 100%)' }}>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <Package className="h-10 w-10 text-white/80 mx-auto mb-3" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {language === "bn" ? "অর্ডার ট্র্যাক করুন" : "Track Your Order"}
            </h1>
            <p className="text-white/70 mt-1.5 text-sm">
              {language === "bn" ? "ফোন নম্বর বা অর্ডার আইডি দিয়ে খুঁজুন" : "Search by phone number or order ID"}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={language === "bn" ? "ফোন নম্বর বা অর্ডার আইডি" : "Phone or Order ID"}
                className="pl-10 h-12 text-base font-english"
              />
            </div>
            <Button type="submit" disabled={!searchInput.trim() || loading} className="h-12 px-6 btn-gradient gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {language === "bn" ? "খুঁজুন" : "Search"}
            </Button>
          </form>

          {/* Results */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && searched && orders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {language === "bn" ? "কোনো অর্ডার পাওয়া যায়নি" : "No orders found"}
              </p>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {orders.length} {language === "bn" ? "টি অর্ডার পাওয়া গেছে" : "orders found"}
              </p>
              {orders.map((order, idx) => {
                const sc = statusConfig[order.status] || statusConfig.pending;
                const items = parseItems(order.notes);
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-card rounded-2xl border border-border overflow-hidden"
                  >
                    {/* Status Header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${sc.bgClass}`}>
                      <div className={`flex items-center gap-2 ${sc.color}`}>
                        {sc.icon}
                        <span className="font-semibold text-sm">{sc.label[language] || sc.label.en}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-english">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Order Info */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-muted-foreground text-xs">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-xs uppercase font-medium">{order.payment_method}</span>
                        </div>
                        {order.address && (
                          <div className="flex items-center gap-1.5 col-span-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground line-clamp-1">{order.address}</span>
                          </div>
                        )}
                      </div>

                      {/* Items */}
                      {items.length > 0 && (
                        <div className="border-t border-border pt-2 space-y-1">
                          {items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-foreground">{item.name} <span className="text-muted-foreground">×{item.qty}</span></span>
                              <span className="font-english font-medium">৳{(item.qty * item.price)?.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Total */}
                      <div className="flex justify-between items-center pt-2 border-t border-border">
                        <span className="font-semibold text-sm">{language === "bn" ? "মোট" : "Total"}</span>
                        <span className="font-bold text-lg text-accent font-english">৳{order.amount.toLocaleString()}</span>
                      </div>

                      {/* Tracking Code */}
                      {(() => {
                        try {
                          const parsed = order.notes ? JSON.parse(order.notes) : {};
                          if (parsed?.tracking_code) {
                            return (
                              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2 text-sm">
                                  <Truck className="h-4 w-4 text-purple-600" />
                                  <span className="font-medium text-purple-800 dark:text-purple-300">
                                    {language === "bn" ? "ট্র্যাকিং কোড" : "Tracking Code"}: <strong className="font-english">{parsed.tracking_code}</strong>
                                  </span>
                                </div>
                              </div>
                            );
                          }
                        } catch {}
                        return null;
                      })()}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
