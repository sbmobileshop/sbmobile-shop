import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, CheckCircle2, Clock, Download, Home, ShoppingBag,
  Phone, Mail, MapPin, CreditCard, Hash, Package, Printer,
  AlertTriangle, Truck
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
  discount: number | null;
  status: string;
  notes: string | null;
  created_at: string;
  coupon_code: string | null;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bgClass: string; label: Record<string, string> }> = {
  pending: {
    icon: <Clock className="h-8 w-8" />,
    color: "text-amber-600",
    bgClass: "bg-amber-50 border-amber-200",
    label: { en: "Payment Pending Verification", bn: "পেমেন্ট যাচাই অপেক্ষমাণ" },
  },
  confirmed: {
    icon: <CheckCircle2 className="h-8 w-8" />,
    color: "text-green-600",
    bgClass: "bg-green-50 border-green-200",
    label: { en: "Order Confirmed", bn: "অর্ডার নিশ্চিত" },
  },
  processing: {
    icon: <Package className="h-8 w-8" />,
    color: "text-blue-600",
    bgClass: "bg-blue-50 border-blue-200",
    label: { en: "Processing", bn: "প্রসেসিং চলছে" },
  },
  shipped: {
    icon: <Truck className="h-8 w-8" />,
    color: "text-indigo-600",
    bgClass: "bg-indigo-50 border-indigo-200",
    label: { en: "Shipped", bn: "শিপ করা হয়েছে" },
  },
  delivered: {
    icon: <CheckCircle2 className="h-8 w-8" />,
    color: "text-green-700",
    bgClass: "bg-green-50 border-green-200",
    label: { en: "Delivered", bn: "ডেলিভারি হয়েছে" },
  },
  cancelled: {
    icon: <AlertTriangle className="h-8 w-8" />,
    color: "text-red-600",
    bgClass: "bg-red-50 border-red-200",
    label: { en: "Cancelled", bn: "বাতিল হয়েছে" },
  },
};

const OrderSuccessPage: React.FC = () => {
  const [params] = useSearchParams();
  const orderId = params.get("id");
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase.from("orders").select("*").eq("id", orderId).single();
      if (data) setOrder(data as unknown as OrderData);
      setLoading(false);
    };
    fetch();

    // Realtime status updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` }, (payload) => {
        setOrder(prev => prev ? { ...prev, ...payload.new } as OrderData : null);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  const parsedItems = (() => {
    try {
      if (!order?.notes) return [];
      const parsed = JSON.parse(order.notes);
      return parsed?.items || [];
    } catch { return []; }
  })();

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>SB Mobile Shop - Receipt #${order?.id?.slice(0, 8)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #1a1a1a; max-width: 600px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #e2136e; padding-bottom: 16px; margin-bottom: 16px; }
          .logo { font-size: 24px; font-weight: 800; color: #e2136e; }
          .subtitle { font-size: 11px; color: #666; margin-top: 4px; }
          .status-box { text-align: center; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-weight: 600; }
          .pending { background: #fff7ed; color: #d97706; border: 1px solid #fed7aa; }
          .confirmed { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
          .section { margin-bottom: 16px; }
          .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #888; margin-bottom: 8px; letter-spacing: 0.5px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .info-item { font-size: 13px; }
          .info-label { color: #888; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { padding: 8px 12px; text-align: left; font-size: 13px; border-bottom: 1px solid #eee; }
          th { background: #f8f8f8; font-weight: 600; color: #555; }
          .total-row td { font-weight: 700; font-size: 15px; border-top: 2px solid #e2136e; color: #e2136e; }
          .footer { text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; }
          @media print { body { padding: 12px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">SB Mobile Shop</div>
          <div class="subtitle">Payment Receipt</div>
        </div>
        <div class="status-box ${order?.status === 'pending' ? 'pending' : 'confirmed'}">
          ${order?.status === 'pending' ? 'Payment Pending Verification' : (statusConfig[order?.status || 'pending']?.label.en || order?.status)}
        </div>
        <div class="section">
          <div class="section-title">Order Information</div>
          <div class="info-grid">
            <div class="info-item"><div class="info-label">Order ID</div>#${order?.id?.slice(0, 8).toUpperCase()}</div>
            <div class="info-item"><div class="info-label">Date</div>${order?.created_at ? new Date(order.created_at).toLocaleString() : ''}</div>
            <div class="info-item"><div class="info-label">Payment</div>${order?.payment_method?.toUpperCase()}</div>
            <div class="info-item"><div class="info-label">TrxID</div>${order?.transaction_id}</div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Customer</div>
          <div class="info-grid">
            <div class="info-item"><div class="info-label">Name</div>${order?.customer_name}</div>
            <div class="info-item"><div class="info-label">Phone</div>${order?.customer_phone}</div>
            ${order?.customer_email ? `<div class="info-item"><div class="info-label">Email</div>${order.customer_email}</div>` : ''}
            ${order?.address ? `<div class="info-item"><div class="info-label">Address</div>${order.address}</div>` : ''}
          </div>
        </div>
        <div class="section">
          <div class="section-title">Items</div>
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
            <tbody>
              ${parsedItems.map((item: any) => `<tr><td>${item.name}</td><td>${item.qty}</td><td>৳${item.price?.toLocaleString()}</td><td>৳${(item.qty * item.price)?.toLocaleString()}</td></tr>`).join('')}
              <tr class="total-row"><td colspan="3">Total</td><td>৳${order?.amount?.toLocaleString()}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="footer">
          <p>Thank you for shopping with SB Mobile Shop</p>
          <p>01773243748 | sbmobile.shop</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-[69px]" />
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </main>
      <Footer />
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-[69px]" />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-semibold mb-2">{language === "bn" ? "অর্ডার পাওয়া যায়নি" : "Order not found"}</h2>
          <Button onClick={() => navigate("/")} className="mt-4 btn-gradient">
            <Home className="h-4 w-4 mr-2" /> {language === "bn" ? "হোমে যান" : "Go Home"}
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );

  const sc = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-[69px]" />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border-2 p-6 mb-6 text-center ${sc.bgClass}`}
          >
            <div className={`inline-flex ${sc.color} mb-3`}>{sc.icon}</div>
            <h1 className={`text-xl font-bold ${sc.color}`}>
              {sc.label[language] || sc.label.en}
            </h1>
            {order.status === "pending" && (
              <p className="text-sm text-amber-700 mt-2 max-w-md mx-auto">
                {language === "bn"
                  ? "আপনার পেমেন্ট যাচাই করা হচ্ছে। যাচাই সম্পন্ন হলে আপনাকে জানানো হবে। সাধারণত ৫-১৫ মিনিট সময় লাগে।"
                  : "Your payment is being verified. You will be notified once verified. Usually takes 5-15 minutes."}
              </p>
            )}
          </motion.div>

          {/* Receipt Card */}
          <motion.div
            ref={receiptRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg"
          >
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-[#1d3557] to-[#264673] p-5 text-white text-center">
              <h2 className="text-lg font-bold">SB Mobile Shop</h2>
              <p className="text-xs opacity-80 mt-1">
                {language === "bn" ? "পেমেন্ট রিসিট" : "Payment Receipt"}
              </p>
            </div>

            <div className="p-5 space-y-5">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">{language === "bn" ? "অর্ডার আইডি" : "Order ID"}</span>
                    <span className="font-semibold font-english text-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">{language === "bn" ? "তারিখ" : "Date"}</span>
                    <span className="font-medium text-foreground">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">{language === "bn" ? "পেমেন্ট" : "Payment"}</span>
                    <span className="font-semibold text-foreground uppercase">{order.payment_method}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Hash className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">TrxID</span>
                    <span className="font-semibold font-english text-foreground">{order.transaction_id}</span>
                  </div>
                </div>
              </div>

              <hr className="border-border" />

              {/* Customer Info */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  {language === "bn" ? "গ্রাহকের তথ্য" : "Customer Details"}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-foreground">{order.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-foreground font-english">{order.customer_phone}</span>
                  </div>
                  {order.customer_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-accent shrink-0" />
                      <span className="text-foreground font-english">{order.customer_email}</span>
                    </div>
                  )}
                  {order.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent shrink-0" />
                      <span className="text-foreground">{order.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-border" />

              {/* Items */}
              <div>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  {language === "bn" ? "পণ্য তালিকা" : "Order Items"}
                </h3>
                <div className="space-y-2">
                  {parsedItems.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-foreground">
                        {item.name} <span className="text-muted-foreground">×{item.qty}</span>
                      </span>
                      <span className="font-semibold text-foreground">৳{(item.qty * item.price)?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {order.discount && order.discount > 0 && (
                  <div className="flex justify-between text-sm mt-2 text-green-600">
                    <span>{language === "bn" ? "ডিসকাউন্ট" : "Discount"}</span>
                    <span>-৳{order.discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between mt-3 pt-3 border-t-2 border-accent/30">
                  <span className="font-bold text-base text-foreground">{language === "bn" ? "মোট" : "Total"}</span>
                  <span className="font-bold text-xl text-accent">৳{order.amount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Courier Tracking Info */}
          {(() => {
            try {
              const parsed = order.notes ? JSON.parse(order.notes) : {};
              if (parsed?.tracking_code) {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-purple-800 dark:text-purple-300">
                        {language === "bn" ? "কুরিয়ার ট্র্যাকিং" : "Courier Tracking"}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">Tracking Code:</span> <strong className="font-english">{parsed.tracking_code}</strong></p>
                      {parsed.courier_status && <p><span className="text-muted-foreground">Status:</span> <strong className="capitalize">{parsed.courier_status}</strong></p>}
                    </div>
                  </motion.div>
                );
              }
              return null;
            } catch { return null; }
          })()}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <Button onClick={handlePrint} variant="outline" className="flex-1 gap-2 py-5 rounded-xl border-accent text-accent hover:bg-accent hover:text-accent-foreground">
              <Printer className="h-4 w-4" />
              {language === "bn" ? "রিসিট প্রিন্ট / ডাউনলোড" : "Print / Download Receipt"}
            </Button>
            <Button onClick={() => navigate(`/order-tracking?id=${order.id}`)} variant="outline" className="flex-1 gap-2 py-5 rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Package className="h-4 w-4" />
              {language === "bn" ? "অর্ডার ট্র্যাক করুন" : "Track This Order"}
            </Button>
            <Button onClick={() => navigate("/")} className="flex-1 gap-2 py-5 rounded-xl btn-gradient">
              <Home className="h-4 w-4" />
              {language === "bn" ? "হোমে যান" : "Go Home"}
            </Button>
          </motion.div>

          {/* Pending Info Banner */}
          {order.status === "pending" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800 text-sm"
            >
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-400">
                    {language === "bn" ? "পেমেন্ট যাচাইয়ের প্রক্রিয়া" : "Payment Verification Process"}
                  </p>
                  <ul className="mt-2 space-y-1 text-amber-700 dark:text-amber-300">
                    <li>
                      {language === "bn"
                        ? "১. আমরা আপনার ট্রানজেকশন যাচাই করছি"
                        : "1. We are verifying your transaction"}
                    </li>
                    <li>
                      {language === "bn"
                        ? "২. যাচাই সম্পন্ন হলে স্ট্যাটাস আপডেট হবে"
                        : "2. Status will update once verified"}
                    </li>
                    <li>
                      {language === "bn"
                        ? "৩. কোন সমস্যা হলে 01773243748 নম্বরে কল করুন"
                        : "3. Call 01773243748 if you face any issue"}
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
