import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2, Clock, XCircle, Loader2, RefreshCcw, Eye,
  Truck, Package, MapPin, Phone, Send, AlertTriangle, Wallet, Download,
  ShieldCheck, ShieldAlert, Search, Edit3, Save, X, MessageSquare, Trash2, Mail
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface Order {
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
  fraud_score: number | null;
  fraud_status: string | null;
  delivery_zone: string | null;
  delivery_charge: number | null;
  discount: number | null;
  coupon_code: string | null;
}

interface CourierInfo {
  courier?: string;
  consignment_id?: number;
  tracking_code?: string;
  courier_status?: string;
}

interface FraudResult {
  phone: string;
  status: string;
  score: number;
  total_parcel: number;
  success_parcel: number;
  cancel_parcel: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  incomplete: "bg-orange-100 text-orange-800 border-orange-200",
  payment_verification: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

const allStatuses = [
  "pending", "confirmed", "processing", "shipped", "delivered", "completed", "cancelled", "incomplete", "payment_verification"
];

const statusLabels: Record<string, { bn: string; en: string }> = {
  pending: { bn: "পেন্ডিং", en: "Pending" },
  confirmed: { bn: "কনফার্মড", en: "Confirmed" },
  processing: { bn: "প্রসেসিং", en: "Processing" },
  shipped: { bn: "শিপড", en: "Shipped" },
  delivered: { bn: "ডেলিভারড", en: "Delivered" },
  completed: { bn: "সম্পন্ন", en: "Completed" },
  cancelled: { bn: "বাতিল", en: "Cancelled" },
  incomplete: { bn: "অসম্পূর্ণ", en: "Incomplete" },
  payment_verification: { bn: "পেমেন্ট যাচাই", en: "Payment Verify" },
};

const AdminOrders: React.FC = () => {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [shipDialog, setShipDialog] = useState<Order | null>(null);
  const [shipping, setShipping] = useState(false);
  const [courierEnabled, setCourierEnabled] = useState(true);
  const [courierBalance, setCourierBalance] = useState<number | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkShipping, setBulkShipping] = useState(false);
  const [fraudResult, setFraudResult] = useState<FraudResult | null>(null);
  const [checkingFraud, setCheckingFraud] = useState(false);
  const [fraudDialog, setFraudDialog] = useState(false);
  const [fraudPhone, setFraudPhone] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Order>>({});
  const [saving, setSaving] = useState(false);
  const [autoFraud, setAutoFraud] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("setting_value").eq("setting_key", "courier_settings").single()
      .then(({ data }) => {
        if (data?.setting_value) {
          const val = data.setting_value as any;
          setCourierEnabled(val.enabled !== false);
          setAutoFraud(val.auto_fraud !== false);
        }
      });
  }, []);

  const saveAutoFraud = async (enabled: boolean) => {
    setAutoFraud(enabled);
    const { data } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "courier_settings").single();
    const existing = (data?.setting_value as any) || {};
    await supabase.from("site_settings").upsert({
      setting_key: "courier_settings",
      setting_value: { ...existing, auto_fraud: enabled } as any,
    }, { onConflict: "setting_key" });
    toast.success(enabled ? "Auto fraud check enabled" : "Auto fraud check disabled");
  };

  const saveCourierEnabled = async (enabled: boolean) => {
    setCourierEnabled(enabled);
    const { data } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "courier_settings").single();
    const existing = (data?.setting_value as any) || {};
    await supabase.from("site_settings").upsert({
      setting_key: "courier_settings",
      setting_value: { ...existing, enabled, provider: "steadfast" } as any,
    }, { onConflict: "setting_key" });
    toast.success(enabled ? "Courier enabled" : "Courier disabled");
  };

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data, error } = await query;
    if (error) toast.error("Failed to load orders");
    else {
      const fetched = (data as Order[]) || [];
      setOrders(fetched);
      if (autoFraud) {
        const unchecked = fetched.filter(o => o.status === "pending" && o.fraud_score === null);
        unchecked.forEach(o => autoCheckFraud(o));
      }
    }
    setLoading(false);
    setSelectedIds(new Set());
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const autoCheckFraud = async (order: Order) => {
    try {
      const phone = order.customer_phone.replace(/\D/g, "").slice(-11);
      if (phone.length !== 11) return;
      const res = await supabase.functions.invoke("fraud-checker", { body: { phone } });
      if (res.error) return;
      const result = res.data;
      if (result?.score !== undefined) {
        await supabase.from("orders").update({
          fraud_score: result.score,
          fraud_status: result.status || (result.score > 50 ? "Warning" : "Safe"),
        }).eq("id", order.id);
        setOrders(prev => prev.map(o => o.id === order.id ? { ...o, fraud_score: result.score, fraud_status: result.status || (result.score > 50 ? "Warning" : "Safe") } : o));
      }
    } catch { }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (error) { toast.error("Update failed"); return; }
    toast.success(language === "bn" ? "স্ট্যাটাস আপডেট হয়েছে!" : "Status updated!");
    
    // Check if order has digital products and auto-deliver on confirmed/completed
    if (newStatus === "confirmed" || newStatus === "completed" || newStatus === "delivered") {
      const order = orders.find(o => o.id === id);
      if (order) {
        // Check items for digital products
        const orderItems = getOrderItems(order);
        const hasDigital = orderItems.some((i: any) => i.product_type === "digital" || i.is_digital);
        
        // Also check notes for digital flag
        let notesData: any = {};
        try { notesData = order.notes ? JSON.parse(order.notes) : {}; } catch {}
        const isDigitalOrder = hasDigital || notesData.has_digital;
        
        if (isDigitalOrder && order.customer_email) {
          supabase.functions.invoke("order-email", {
            body: { action: "digital_delivery", orderId: id, siteUrl: window.location.origin },
          }).then(() => toast.success(language === "bn" ? "ডিজিটাল প্রোডাক্ট ইমেইলে ডেলিভারি হয়েছে!" : "Digital product delivered via email!"))
            .catch(console.error);
        }
      }
    }
    
    fetchOrders();
  };

  const getCourierInfo = (order: Order): CourierInfo | null => {
    try {
      if (!order.notes) return null;
      const parsed = JSON.parse(order.notes);
      if (parsed?.courier) return parsed;
      return null;
    } catch { return null; }
  };

  const getOrderItems = (order: Order) => {
    try {
      if (!order.notes) return [];
      const parsed = JSON.parse(order.notes);
      return parsed?.items || [];
    } catch { return []; }
  };

  // Delete order + cancel from Steadfast if shipped
  const handleDeleteOrder = async (order: Order) => {
    setDeleting(true);
    try {
      const courier = getCourierInfo(order);
      
      // Cancel from Steadfast if has consignment
      if (courier?.consignment_id) {
        try {
          await supabase.functions.invoke("steadfast-courier", {
            body: { action: "cancel_order", consignment_id: courier.consignment_id },
          });
        } catch {
          // Continue with delete even if Steadfast cancel fails
        }
      }

      // Delete order items first
      await supabase.from("order_items").delete().eq("order_id", order.id);
      
      // Delete the order
      const { error } = await supabase.from("orders").delete().eq("id", order.id);
      if (error) throw error;

      toast.success(language === "bn" ? "অর্ডার ডিলিট হয়েছে!" : "Order deleted successfully!");
      setDeleteDialog(null);
      setSelectedOrder(null);
      fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleShipOrder = async (order: Order) => {
    // Check if digital order - skip Steadfast
    let notesData: any = {};
    try { notesData = order.notes ? JSON.parse(order.notes) : {}; } catch {}
    if (notesData.has_digital) {
      toast.error(language === "bn" ? "ডিজিটাল প্রোডাক্ট কুরিয়ারে পাঠানো যায় না। ইমেইলে ডেলিভারি হবে।" : "Digital products cannot be shipped via courier. Deliver via email.");
      return;
    }
    if (!courierEnabled) {
      toast.error("Courier disabled, enable in settings");
      return;
    }
    setShipping(true);
    try {
      const items = getOrderItems(order);
      const itemDesc = items.map((i: any) => `${i.name} x${i.qty}`).join(", ");
      const res = await supabase.functions.invoke("steadfast-courier", {
        body: {
          action: "create_order",
          invoice: order.id.slice(0, 8).toUpperCase(),
          recipient_name: order.customer_name,
          recipient_phone: order.customer_phone,
          recipient_address: order.address || "N/A",
          cod_amount: order.amount,
          note: `Order from SB Mobile Shop`,
          item_description: itemDesc,
          order_id: order.id,
          original_notes: order.notes,
        },
      });
      if (res.error) throw new Error(res.error.message);
      const result = res.data;
      if (result.status === 200) {
        toast.success(`Shipped! Tracking: ${result.consignment?.tracking_code}`);
        // Auto-send tracking email if customer has email
        if (order.customer_email) {
          supabase.functions.invoke("order-email", {
            body: { action: "tracking_update", orderId: order.id, siteUrl: window.location.origin },
          }).then(() => toast.success("Tracking email sent!")).catch(console.error);
        }
        setShipDialog(null);
        fetchOrders();
      } else {
        toast.error(result.message || "Courier API error");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to ship order");
    } finally {
      setShipping(false);
    }
  };

  const handleBulkShip = async () => {
    if (selectedIds.size === 0) return;
    setBulkShipping(true);
    let success = 0, failed = 0;
    for (const orderId of selectedIds) {
      const order = orders.find(o => o.id === orderId);
      if (!order) continue;
      const courier = getCourierInfo(order);
      if (courier?.tracking_code) continue;
      try {
        const items = getOrderItems(order);
        const itemDesc = items.map((i: any) => `${i.name} x${i.qty}`).join(", ");
        const res = await supabase.functions.invoke("steadfast-courier", {
          body: {
            action: "create_order",
            invoice: order.id.slice(0, 8).toUpperCase(),
            recipient_name: order.customer_name,
            recipient_phone: order.customer_phone,
            recipient_address: order.address || "N/A",
            cod_amount: order.amount,
            note: `Order from SB Mobile Shop`,
            item_description: itemDesc,
            order_id: order.id,
            original_notes: order.notes,
          },
        });
        if (!res.error && res.data?.status === 200) success++;
        else failed++;
      } catch { failed++; }
    }
    setBulkShipping(false);
    toast.success(`${success} orders shipped, ${failed} failed`);
    fetchOrders();
  };

  const checkCourierStatus = async (order: Order) => {
    setCheckingStatus(true);
    try {
      const courier = getCourierInfo(order);
      if (!courier?.consignment_id && !courier?.tracking_code) {
        toast.error("No courier info found");
        return;
      }
      const res = await supabase.functions.invoke("steadfast-courier", {
        body: { action: "check_status", consignment_id: courier.consignment_id, tracking_code: courier.tracking_code },
      });
      if (res.error) throw new Error(res.error.message);
      setTrackingStatus(res.data?.delivery_status || "unknown");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCheckingStatus(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const res = await supabase.functions.invoke("steadfast-courier", { body: { action: "get_balance" } });
      if (res.data?.current_balance !== undefined) setCourierBalance(res.data.current_balance);
    } catch { }
  };

  const checkFraud = async (phone: string) => {
    if (!phone || phone.length !== 11) { toast.error("Enter a valid 11-digit phone number"); return; }
    setCheckingFraud(true);
    setFraudResult(null);
    try {
      const res = await supabase.functions.invoke("fraud-checker", { body: { phone } });
      if (res.error) throw new Error(res.error.message);
      setFraudResult(res.data);
    } catch (err: any) {
      toast.error(err.message || "Fraud check failed");
    } finally {
      setCheckingFraud(false);
    }
  };

  const startEdit = (order: Order) => {
    setEditMode(true);
    setEditForm({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_email: order.customer_email,
      address: order.address,
      amount: order.amount,
      payment_method: order.payment_method,
      transaction_id: order.transaction_id,
      status: order.status,
      delivery_zone: order.delivery_zone,
      delivery_charge: order.delivery_charge,
      discount: order.discount,
      coupon_code: order.coupon_code,
      notes: order.notes,
    });
  };

  const saveEdit = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    const { error } = await supabase.from("orders").update({
      customer_name: editForm.customer_name,
      customer_phone: editForm.customer_phone,
      customer_email: editForm.customer_email || null,
      address: editForm.address,
      amount: Number(editForm.amount),
      payment_method: editForm.payment_method,
      transaction_id: editForm.transaction_id,
      status: editForm.status,
      delivery_zone: editForm.delivery_zone || null,
      delivery_charge: editForm.delivery_charge ? Number(editForm.delivery_charge) : null,
      discount: editForm.discount ? Number(editForm.discount) : null,
      coupon_code: editForm.coupon_code || null,
    }).eq("id", selectedOrder.id);
    setSaving(false);
    if (error) { toast.error("Update failed"); return; }
    toast.success(language === "bn" ? "অর্ডার আপডেট হয়েছে!" : "Order updated!");
    setEditMode(false);
    setSelectedOrder(null);
    fetchOrders();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (selectedIds.size === filteredOrders.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredOrders.map(o => o.id)));
  };

  const filteredOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return o.customer_name.toLowerCase().includes(q) || o.customer_phone.includes(q) || o.id.includes(q) || o.transaction_id.toLowerCase().includes(q);
  });

  const pendingCount = orders.filter(o => o.status === "pending").length;
  const incompleteCount = orders.filter(o => o.status === "incomplete").length;
  const payVerifyCount = orders.filter(o => o.status === "payment_verification").length;
  const fraudWarningCount = orders.filter(o => o.fraud_status === "Warning" || o.fraud_status === "Fraud").length;

  const getFraudBadge = (order: Order) => {
    if (order.fraud_score === null) return null;
    const isRisky = order.fraud_status === "Warning" || order.fraud_status === "Fraud" || (order.fraud_score > 50);
    return (
      <Badge variant="outline" className={`text-[10px] ${isRisky ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>
        {isRisky ? <ShieldAlert className="h-2.5 w-2.5 mr-0.5" /> : <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />}
        {order.fraud_score}%
      </Badge>
    );
  };

  const sendWhatsApp = (order: Order) => {
    const msg = encodeURIComponent(
      `Hi ${order.customer_name}, your order #${order.id.slice(0, 8).toUpperCase()} (৳${order.amount.toLocaleString()}) is ${order.status}. Thank you for shopping with SB Mobile Shop!`
    );
    window.open(`https://wa.me/88${order.customer_phone}?text=${msg}`, "_blank");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {language === "bn" ? "অর্ডার ব্যবস্থাপনা" : "Order Management"}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => { setFraudDialog(true); setFraudResult(null); setFraudPhone(""); }}>
            <ShieldCheck className="h-3.5 w-3.5" />
            {language === "bn" ? "ফ্রড চেক" : "Fraud Check"}
          </Button>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === "bn" ? "সব অর্ডার" : "All Orders"}</SelectItem>
              {allStatuses.map(s => (
                <SelectItem key={s} value={s}>{language === "bn" ? statusLabels[s].bn : statusLabels[s].en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchOrders}><RefreshCcw className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => {
            if (orders.length === 0) return;
            const headers = ["Order ID","Name","Phone","Email","Address","Method","TrxID","Amount","Status","Fraud","Date"];
            const rows = orders.map(o => [
              o.id.slice(0,8).toUpperCase(), o.customer_name, o.customer_phone, o.customer_email || "",
              (o.address || "").replace(/,/g, " "), o.payment_method, o.transaction_id, o.amount, o.status,
              o.fraud_score !== null ? `${o.fraud_status}(${o.fraud_score}%)` : "N/A",
              new Date(o.created_at).toLocaleDateString()
            ]);
            const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`; a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-3 text-center border border-amber-200 dark:border-amber-800">
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{pendingCount}</p>
          <p className="text-xs text-amber-600">{language === "bn" ? "পেন্ডিং" : "Pending"}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-3 text-center border border-orange-200 dark:border-orange-800">
          <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{incompleteCount}</p>
          <p className="text-xs text-orange-600">{language === "bn" ? "অসম্পূর্ণ" : "Incomplete"}</p>
        </div>
        <div className="bg-cyan-50 dark:bg-cyan-950/30 rounded-xl p-3 text-center border border-cyan-200 dark:border-cyan-800">
          <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{payVerifyCount}</p>
          <p className="text-xs text-cyan-600">{language === "bn" ? "পেমেন্ট যাচাই" : "Pay Verify"}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-3 text-center border border-red-200 dark:border-red-800">
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{fraudWarningCount}</p>
          <p className="text-xs text-red-600">{language === "bn" ? "ফ্রড সতর্কতা" : "Fraud Warning"}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={language === "bn" ? "নাম, ফোন, TrxID দিয়ে খুঁজুন..." : "Search by name, phone, TrxID..."}
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {/* Courier & Auto Fraud Control */}
      <Card className="border-border mb-4">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-accent" />
              <span className="text-xs font-semibold">{language === "bn" ? "কুরিয়ার" : "Courier"}</span>
              <Switch checked={courierEnabled} onCheckedChange={saveCourierEnabled} />
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold">{language === "bn" ? "অটো ফ্রড চেক" : "Auto Fraud"}</span>
              <Switch checked={autoFraud} onCheckedChange={saveAutoFraud} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && courierEnabled && (
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5 text-xs" onClick={handleBulkShip} disabled={bulkShipping}>
                {bulkShipping ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {`Ship ${selectedIds.size} Orders`}
              </Button>
            )}
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={fetchBalance}>
              <Wallet className="h-3.5 w-3.5" />
              {courierBalance !== null ? `৳${courierBalance}` : "Balance"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-border"><CardContent className="p-8 text-center"><p className="text-muted-foreground">{language === "bn" ? "কোনো অর্ডার নেই" : "No orders found"}</p></CardContent></Card>
      ) : (
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><Checkbox checked={selectedIds.size === filteredOrders.length && filteredOrders.length > 0} onCheckedChange={toggleAll} /></TableHead>
                  <TableHead>{language === "bn" ? "নাম" : "Name"}</TableHead>
                  <TableHead>{language === "bn" ? "ফোন" : "Phone"}</TableHead>
                  <TableHead>{language === "bn" ? "মেথড" : "Method"}</TableHead>
                  <TableHead>TrxID</TableHead>
                  <TableHead>{language === "bn" ? "পরিমাণ" : "Amount"}</TableHead>
                  <TableHead>{language === "bn" ? "স্ট্যাটাস" : "Status"}</TableHead>
                  <TableHead>{language === "bn" ? "ফ্রড" : "Fraud"}</TableHead>
                  <TableHead>{language === "bn" ? "তারিখ" : "Date"}</TableHead>
                  <TableHead>{language === "bn" ? "অ্যাকশন" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => {
                  const courier = getCourierInfo(order);
                  return (
                    <TableRow key={order.id} className={selectedIds.has(order.id) ? "bg-accent/5" : ""}>
                      <TableCell><Checkbox checked={selectedIds.has(order.id)} onCheckedChange={() => toggleSelect(order.id)} /></TableCell>
                      <TableCell className="font-medium text-xs">{order.customer_name}</TableCell>
                      <TableCell className="font-english text-xs">{order.customer_phone}</TableCell>
                      <TableCell className="capitalize text-xs">{order.payment_method}</TableCell>
                      <TableCell className="font-english text-xs max-w-[80px] truncate">{order.transaction_id}</TableCell>
                      <TableCell className="font-bold text-accent text-xs">৳{order.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[order.status] || ""}`}>
                          {statusLabels[order.status]?.[language] || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{getFraudBadge(order)}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-0.5">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setSelectedOrder(order); setTrackingStatus(null); setEditMode(false); }}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600" title="Fraud Check"
                            onClick={() => { setFraudPhone(order.customer_phone); setFraudDialog(true); setFraudResult(null); checkFraud(order.customer_phone); }}>
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" title="WhatsApp" onClick={() => sendWhatsApp(order)}>
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" title="Delete" onClick={() => setDeleteDialog(order)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          {order.status === "pending" && (
                            <>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => updateStatus(order.id, "confirmed")}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-cyan-600" onClick={() => updateStatus(order.id, "payment_verification")} title="Move to Payment Verify"><Clock className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => updateStatus(order.id, "cancelled")}><XCircle className="h-3.5 w-3.5" /></Button>
                            </>
                          )}
                          {order.status === "payment_verification" && (
                            <>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => updateStatus(order.id, "confirmed")}><CheckCircle2 className="h-3.5 w-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-600" onClick={() => updateStatus(order.id, "cancelled")}><XCircle className="h-3.5 w-3.5" /></Button>
                            </>
                          )}
                          {(order.status === "confirmed" || order.status === "processing") && courierEnabled && !courier?.tracking_code && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-purple-600" onClick={() => setShipDialog(order)}><Truck className="h-3.5 w-3.5" /></Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              {language === "bn" ? "অর্ডার ডিলিট করুন" : "Delete Order"}
            </DialogTitle>
          </DialogHeader>
          {deleteDialog && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                {language === "bn" 
                  ? `আপনি কি নিশ্চিত #${deleteDialog.id.slice(0,8).toUpperCase()} অর্ডারটি ডিলিট করতে চান? এটি Steadfast থেকেও বাতিল হবে।`
                  : `Are you sure you want to delete order #${deleteDialog.id.slice(0,8).toUpperCase()}? This will also cancel the Steadfast entry if exists.`
                }
              </p>
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Customer:</span><strong>{deleteDialog.customer_name}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span><strong className="text-accent">৳{deleteDialog.amount.toLocaleString()}</strong></div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialog(null)} disabled={deleting}>
              {language === "bn" ? "বাতিল" : "Cancel"}
            </Button>
            <Button variant="destructive" onClick={() => deleteDialog && handleDeleteOrder(deleteDialog)} disabled={deleting} className="gap-1.5">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {language === "bn" ? "ডিলিট" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fraud Check Dialog */}
      <Dialog open={fraudDialog} onOpenChange={setFraudDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              {language === "bn" ? "ফ্রড চেকার" : "Fraud Checker"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="01XXXXXXXXX" value={fraudPhone} onChange={e => setFraudPhone(e.target.value)} className="font-english" maxLength={11} />
              <Button onClick={() => checkFraud(fraudPhone)} disabled={checkingFraud} className="gap-1.5 shrink-0">
                {checkingFraud ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {language === "bn" ? "চেক" : "Check"}
              </Button>
            </div>
            {fraudResult && (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border-2 text-center ${
                  fraudResult.status === "Safe" ? "border-green-300 bg-green-50 dark:bg-green-950/30" :
                  fraudResult.status === "Warning" ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30" :
                  "border-red-300 bg-red-50 dark:bg-red-950/30"
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {fraudResult.status === "Safe" ? <ShieldCheck className="h-6 w-6 text-green-600" /> : <ShieldAlert className="h-6 w-6 text-red-600" />}
                    <span className="text-xl font-bold">{fraudResult.status}</span>
                  </div>
                  <p className="text-3xl font-bold">{fraudResult.score}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Fraud Score</p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2 bg-muted/50 rounded-lg"><p className="font-bold text-lg">{fraudResult.total_parcel}</p><p className="text-xs text-muted-foreground">Total</p></div>
                  <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg"><p className="font-bold text-lg text-green-600">{fraudResult.success_parcel}</p><p className="text-xs text-muted-foreground">Success</p></div>
                  <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg"><p className="font-bold text-lg text-red-600">{fraudResult.cancel_parcel}</p><p className="text-xs text-muted-foreground">Cancel</p></div>
                </div>
                {(fraudResult as any)?.response && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Courier Breakdown</p>
                    {Object.entries((fraudResult as any).response).map(([provider, info]: [string, any]) => (
                      info.status && (
                        <div key={provider} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-xs">
                          <span className="font-semibold capitalize">{provider}</span>
                          <span>{info.data?.success || 0}/{info.data?.total || 0} ({info.data?.deliveredPercentage || 0}%)</span>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Detail / Edit Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => { setSelectedOrder(null); setEditMode(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-accent" />
              {editMode ? (language === "bn" ? "অর্ডার এডিট" : "Edit Order") : (language === "bn" ? "অর্ডার বিস্তারিত" : "Order Details")}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && !editMode && (() => {
            const courier = getCourierInfo(selectedOrder);
            const items = getOrderItems(selectedOrder);
            return (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground text-xs">Order ID</span><br /><strong className="font-english">#{selectedOrder.id.slice(0, 8).toUpperCase()}</strong></div>
                  <div><span className="text-muted-foreground text-xs">{language === "bn" ? "নাম" : "Name"}</span><br /><strong>{selectedOrder.customer_name}</strong></div>
                  <div><span className="text-muted-foreground text-xs">{language === "bn" ? "ফোন" : "Phone"}</span><br /><strong className="font-english">{selectedOrder.customer_phone}</strong></div>
                  <div><span className="text-muted-foreground text-xs">{language === "bn" ? "মেথড" : "Method"}</span><br /><strong className="capitalize">{selectedOrder.payment_method}</strong></div>
                  <div><span className="text-muted-foreground text-xs">TrxID</span><br /><strong className="font-english">{selectedOrder.transaction_id}</strong></div>
                  <div><span className="text-muted-foreground text-xs">{language === "bn" ? "পরিমাণ" : "Amount"}</span><br /><strong className="text-accent">৳{selectedOrder.amount.toLocaleString()}</strong></div>
                  {selectedOrder.delivery_zone && (
                    <div><span className="text-muted-foreground text-xs">{language === "bn" ? "ডেলিভারি জোন" : "Delivery Zone"}</span><br /><strong>{selectedOrder.delivery_zone}</strong></div>
                  )}
                  {selectedOrder.delivery_charge !== null && (
                    <div><span className="text-muted-foreground text-xs">{language === "bn" ? "ডেলিভারি চার্জ" : "Delivery Charge"}</span><br /><strong>৳{selectedOrder.delivery_charge}</strong></div>
                  )}
                  {selectedOrder.discount !== null && selectedOrder.discount > 0 && (
                    <div><span className="text-muted-foreground text-xs">{language === "bn" ? "ডিসকাউন্ট" : "Discount"}</span><br /><strong className="text-green-600">৳{selectedOrder.discount}</strong></div>
                  )}
                  {selectedOrder.coupon_code && (
                    <div><span className="text-muted-foreground text-xs">{language === "bn" ? "কুপন" : "Coupon"}</span><br /><strong>{selectedOrder.coupon_code}</strong></div>
                  )}
                </div>

                {selectedOrder.fraud_score !== null && (
                  <div className={`p-3 rounded-lg border ${selectedOrder.fraud_status === "Safe" ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"}`}>
                    <div className="flex items-center gap-2">
                      {selectedOrder.fraud_status === "Safe" ? <ShieldCheck className="h-4 w-4 text-green-600" /> : <ShieldAlert className="h-4 w-4 text-red-600" />}
                      <span className="font-semibold text-sm">{selectedOrder.fraud_status} — {selectedOrder.fraud_score}%</span>
                    </div>
                  </div>
                )}

                {selectedOrder.address && (
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                    <span>{selectedOrder.address}</span>
                  </div>
                )}

                {items.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase">{language === "bn" ? "পণ্য" : "Items"}</span>
                    <div className="mt-1 space-y-1">
                      {items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm py-1 border-b border-border last:border-0">
                          <span>{item.name} ×{item.qty}</span>
                          <span className="font-semibold">৳{(item.qty * item.price)?.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {courier?.tracking_code && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold text-purple-800 dark:text-purple-300">Steadfast Courier</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Tracking: <strong className="font-english">{courier.tracking_code}</strong></div>
                      <div>ID: <strong className="font-english">{courier.consignment_id}</strong></div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => checkCourierStatus(selectedOrder)} disabled={checkingStatus}>
                        {checkingStatus ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
                        Check Status
                      </Button>
                      {trackingStatus && <Badge variant="outline" className="capitalize">{trackingStatus}</Badge>}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">{new Date(selectedOrder.created_at).toLocaleString()}</div>
                <Badge variant="outline" className={statusColors[selectedOrder.status]}>{statusLabels[selectedOrder.status]?.[language] || selectedOrder.status}</Badge>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => startEdit(selectedOrder)}>
                    <Edit3 className="h-3.5 w-3.5" /> {language === "bn" ? "এডিট" : "Edit"}
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs text-emerald-600" onClick={() => sendWhatsApp(selectedOrder)}>
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1 text-xs"
                    onClick={() => { setFraudPhone(selectedOrder.customer_phone); setFraudDialog(true); setFraudResult(null); checkFraud(selectedOrder.customer_phone); setSelectedOrder(null); }}>
                    <ShieldCheck className="h-3.5 w-3.5" /> Fraud Check
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1 text-xs" onClick={() => { setDeleteDialog(selectedOrder); setSelectedOrder(null); }}>
                    <Trash2 className="h-3.5 w-3.5" /> {language === "bn" ? "ডিলিট" : "Delete"}
                  </Button>
                  {selectedOrder.customer_email && (
                    <>
                      <Button size="sm" variant="outline" className="gap-1 text-xs text-blue-600 border-blue-200" onClick={() => {
                        supabase.functions.invoke("order-email", { body: { action: "order_confirmation", orderId: selectedOrder.id, siteUrl: window.location.origin } })
                          .then(() => toast.success("Confirmation email sent!")).catch(() => toast.error("Email failed"));
                      }}>
                        <Mail className="h-3.5 w-3.5" /> {language === "bn" ? "কনফার্মেশন ইমেইল" : "Send Confirmation"}
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-xs text-amber-600 border-amber-200" onClick={() => {
                        supabase.functions.invoke("order-email", { body: { action: "incomplete_reminder", orderId: selectedOrder.id, siteUrl: window.location.origin } })
                          .then(() => toast.success("Reminder email sent!")).catch(() => toast.error("Email failed"));
                      }}>
                        <Mail className="h-3.5 w-3.5" /> {language === "bn" ? "রিমাইন্ডার ইমেইল" : "Send Reminder"}
                      </Button>
                      {getCourierInfo(selectedOrder)?.tracking_code && (
                        <Button size="sm" variant="outline" className="gap-1 text-xs text-purple-600 border-purple-200" onClick={() => {
                          supabase.functions.invoke("order-email", { body: { action: "tracking_update", orderId: selectedOrder.id, siteUrl: window.location.origin } })
                            .then(() => toast.success("Tracking email sent!")).catch(() => toast.error("Email failed"));
                        }}>
                          <Mail className="h-3.5 w-3.5" /> {language === "bn" ? "ট্র্যাকিং ইমেইল" : "Send Tracking"}
                        </Button>
                      )}
                    </>
                  )}
                  {selectedOrder.status === "pending" && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => { updateStatus(selectedOrder.id, "confirmed"); setSelectedOrder(null); }}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
                      </Button>
                      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white gap-1" onClick={() => { updateStatus(selectedOrder.id, "payment_verification"); setSelectedOrder(null); }}>
                        <Clock className="h-3.5 w-3.5" /> Pay Verify
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => { updateStatus(selectedOrder.id, "cancelled"); setSelectedOrder(null); }}>
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </>
                  )}
                  {selectedOrder.status === "payment_verification" && (
                    <>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => { updateStatus(selectedOrder.id, "confirmed"); setSelectedOrder(null); }}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => { updateStatus(selectedOrder.id, "cancelled"); setSelectedOrder(null); }}>
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </>
                  )}
                  {(selectedOrder.status === "confirmed" || selectedOrder.status === "processing") && courierEnabled && !courier?.tracking_code && (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1" onClick={() => { setSelectedOrder(null); setShipDialog(selectedOrder); }}>
                      <Truck className="h-3.5 w-3.5" /> Ship
                    </Button>
                  )}
                  {selectedOrder.status === "confirmed" && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => { updateStatus(selectedOrder.id, "completed"); setSelectedOrder(null); }}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Edit Mode - Full Featured */}
          {selectedOrder && editMode && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">{language === "bn" ? "নাম" : "Name"}</Label>
                  <Input value={editForm.customer_name || ""} onChange={e => setEditForm(f => ({ ...f, customer_name: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">{language === "bn" ? "ফোন" : "Phone"}</Label>
                  <Input value={editForm.customer_phone || ""} onChange={e => setEditForm(f => ({ ...f, customer_phone: e.target.value }))} className="font-english" />
                </div>
                <div>
                  <Label className="text-xs">Email</Label>
                  <Input value={editForm.customer_email || ""} onChange={e => setEditForm(f => ({ ...f, customer_email: e.target.value }))} className="font-english" />
                </div>
                <div>
                  <Label className="text-xs">{language === "bn" ? "পরিমাণ" : "Amount"}</Label>
                  <Input type="number" value={editForm.amount || 0} onChange={e => setEditForm(f => ({ ...f, amount: Number(e.target.value) }))} className="font-english" />
                </div>
                <div>
                  <Label className="text-xs">{language === "bn" ? "মেথড" : "Payment Method"}</Label>
                  <Input value={editForm.payment_method || ""} onChange={e => setEditForm(f => ({ ...f, payment_method: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">TrxID</Label>
                  <Input value={editForm.transaction_id || ""} onChange={e => setEditForm(f => ({ ...f, transaction_id: e.target.value }))} className="font-english" />
                </div>
                <div>
                  <Label className="text-xs">{language === "bn" ? "ডেলিভারি জোন" : "Delivery Zone"}</Label>
                  <Input value={editForm.delivery_zone || ""} onChange={e => setEditForm(f => ({ ...f, delivery_zone: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-xs">{language === "bn" ? "ডেলিভারি চার্জ" : "Delivery Charge"}</Label>
                  <Input type="number" value={editForm.delivery_charge || 0} onChange={e => setEditForm(f => ({ ...f, delivery_charge: Number(e.target.value) }))} className="font-english" />
                </div>
                <div>
                  <Label className="text-xs">{language === "bn" ? "ডিসকাউন্ট" : "Discount"}</Label>
                  <Input type="number" value={editForm.discount || 0} onChange={e => setEditForm(f => ({ ...f, discount: Number(e.target.value) }))} className="font-english" />
                </div>
                <div>
                  <Label className="text-xs">{language === "bn" ? "কুপন কোড" : "Coupon Code"}</Label>
                  <Input value={editForm.coupon_code || ""} onChange={e => setEditForm(f => ({ ...f, coupon_code: e.target.value }))} className="font-english" />
                </div>
              </div>
              <div>
                <Label className="text-xs">{language === "bn" ? "ঠিকানা" : "Address"}</Label>
                <Textarea value={editForm.address || ""} onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))} rows={2} />
              </div>
              <div>
                <Label className="text-xs">{language === "bn" ? "স্ট্যাটাস" : "Status"}</Label>
                <Select value={editForm.status || "pending"} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {allStatuses.map(s => (
                      <SelectItem key={s} value={s}>{statusLabels[s]?.[language] || s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={saveEdit} disabled={saving} className="gap-1.5">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {language === "bn" ? "সেভ করুন" : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)} className="gap-1.5">
                  <X className="h-4 w-4" /> {language === "bn" ? "বাতিল" : "Cancel"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Ship Dialog */}
      <Dialog open={!!shipDialog} onOpenChange={() => setShipDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-purple-600" />
              Ship via Steadfast Courier
            </DialogTitle>
          </DialogHeader>
          {shipDialog && (
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-muted/50 rounded-xl space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Customer:</span><strong>{shipDialog.customer_name}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><strong className="font-english">{shipDialog.customer_phone}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Address:</span><strong className="text-right max-w-[60%]">{shipDialog.address || "N/A"}</strong></div>
                <div className="flex justify-between"><span className="text-muted-foreground">COD:</span><strong className="text-accent">৳{shipDialog.amount.toLocaleString()}</strong></div>
              </div>
              {!shipDialog.address && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-amber-700 dark:text-amber-300 text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0" />No address provided!
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipDialog(null)} disabled={shipping}>Cancel</Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-2" onClick={() => shipDialog && handleShipOrder(shipDialog)} disabled={shipping}>
              {shipping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {shipping ? "Shipping..." : "Ship Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
