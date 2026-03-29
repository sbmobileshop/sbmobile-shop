import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Loader2, Users, Download, Search, Phone, MessageSquare, ShieldCheck, ShieldAlert,
  Eye, ShoppingCart, TrendingUp, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface Customer {
  phone: string;
  name: string;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  orders: CustomerOrder[];
  fraudScore: number | null;
  fraudStatus: string | null;
}

interface CustomerOrder {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  transaction_id: string;
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
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  incomplete: "bg-orange-100 text-orange-800",
  payment_verification: "bg-cyan-100 text-cyan-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

const AdminCustomers: React.FC = () => {
  const { language } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [fraudResult, setFraudResult] = useState<FraudResult | null>(null);
  const [checkingFraud, setCheckingFraud] = useState(false);
  const [fraudDialog, setFraudDialog] = useState(false);

  useEffect(() => {
    supabase.from("orders").select("id, customer_name, customer_phone, customer_email, amount, status, payment_method, transaction_id, created_at, fraud_score, fraud_status")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }
        const map = new Map<string, Customer>();
        data.forEach((o: any) => {
          const orderEntry: CustomerOrder = {
            id: o.id, amount: Number(o.amount), status: o.status,
            payment_method: o.payment_method, created_at: o.created_at,
            transaction_id: o.transaction_id
          };
          const existing = map.get(o.customer_phone);
          if (existing) {
            existing.totalOrders++;
            existing.totalSpent += Number(o.amount);
            existing.orders.push(orderEntry);
            if (o.fraud_score !== null && existing.fraudScore === null) {
              existing.fraudScore = o.fraud_score;
              existing.fraudStatus = o.fraud_status;
            }
          } else {
            map.set(o.customer_phone, {
              phone: o.customer_phone,
              name: o.customer_name,
              email: o.customer_email,
              totalOrders: 1,
              totalSpent: Number(o.amount),
              lastOrder: o.created_at,
              orders: [orderEntry],
              fraudScore: o.fraud_score,
              fraudStatus: o.fraud_status,
            });
          }
        });
        setCustomers(Array.from(map.values()).sort((a, b) => b.totalOrders - a.totalOrders));
        setLoading(false);
      });
  }, []);

  const checkFraud = async (phone: string) => {
    const clean = phone.replace(/\D/g, "").slice(-11);
    if (clean.length !== 11) { toast.error("Invalid phone"); return; }
    setCheckingFraud(true);
    setFraudResult(null);
    try {
      const res = await supabase.functions.invoke("fraud-checker", { body: { phone: clean } });
      if (res.error) throw new Error(res.error.message);
      setFraudResult(res.data);
    } catch (err: any) {
      toast.error(err.message || "Fraud check failed");
    } finally {
      setCheckingFraud(false);
    }
  };

  const sendWhatsApp = (c: Customer) => {
    const msg = encodeURIComponent(
      `Hi ${c.name}! Thank you for being a valued customer at SB Mobile Shop. You've placed ${c.totalOrders} order(s) with us. We appreciate your trust! 🙏`
    );
    window.open(`https://wa.me/88${c.phone}?text=${msg}`, "_blank");
  };

  const filtered = customers.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.email || "").toLowerCase().includes(q);
  });

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const repeatCustomers = customers.filter(c => c.totalOrders >= 3).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-accent" />
          {language === "bn" ? "কাস্টমার ব্যবস্থাপনা" : "Customer Management"}
        </h1>
        <div className="flex gap-2">
          {customers.length > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => {
              const headers = ["Name","Phone","Email","Orders","Total Spent","Last Order","Type","Fraud"];
              const rows = customers.map(c => [
                c.name, c.phone, c.email || "", c.totalOrders, c.totalSpent,
                new Date(c.lastOrder).toLocaleDateString(), c.totalOrders >= 3 ? "Repeat" : "New",
                c.fraudScore !== null ? `${c.fraudStatus}(${c.fraudScore}%)` : "N/A"
              ]);
              const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
              const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = `customers-${new Date().toISOString().slice(0,10)}.csv`; a.click();
              URL.revokeObjectURL(url);
            }}>
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <p className="text-2xl font-bold text-foreground">{customers.length}</p>
          <p className="text-xs text-muted-foreground">{language === "bn" ? "মোট কাস্টমার" : "Total Customers"}</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <p className="text-2xl font-bold text-green-600">{repeatCustomers}</p>
          <p className="text-xs text-muted-foreground">{language === "bn" ? "রিপিট কাস্টমার" : "Repeat Customers"}</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <p className="text-2xl font-bold text-accent">৳{totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{language === "bn" ? "মোট আয়" : "Total Revenue"}</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center border border-border">
          <p className="text-2xl font-bold text-foreground">{customers.length > 0 ? Math.round(totalRevenue / customers.length) : 0}</p>
          <p className="text-xs text-muted-foreground">{language === "bn" ? "গড় খরচ" : "Avg Spend"}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder={language === "bn" ? "নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..." : "Search by name, phone, or email..."}
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">{language === "bn" ? "কোনো কাস্টমার নেই" : "No customers found"}</Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "bn" ? "নাম" : "Name"}</TableHead>
                  <TableHead>{language === "bn" ? "ফোন" : "Phone"}</TableHead>
                  <TableHead>{language === "bn" ? "অর্ডার" : "Orders"}</TableHead>
                  <TableHead>{language === "bn" ? "মোট খরচ" : "Total Spent"}</TableHead>
                  <TableHead>{language === "bn" ? "ফ্রড" : "Fraud"}</TableHead>
                  <TableHead>{language === "bn" ? "টাইপ" : "Type"}</TableHead>
                  <TableHead>{language === "bn" ? "অ্যাকশন" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.phone}>
                    <TableCell className="font-medium text-xs">{c.name}</TableCell>
                    <TableCell className="font-english text-xs">{c.phone}</TableCell>
                    <TableCell><Badge variant="outline">{c.totalOrders}</Badge></TableCell>
                    <TableCell className="font-bold text-accent text-xs">৳{c.totalSpent.toLocaleString()}</TableCell>
                    <TableCell>
                      {c.fraudScore !== null ? (
                        <Badge variant="outline" className={`text-[10px] ${
                          c.fraudStatus === "Safe" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {c.fraudStatus === "Safe" ? <ShieldCheck className="h-2.5 w-2.5 mr-0.5" /> : <ShieldAlert className="h-2.5 w-2.5 mr-0.5" />}
                          {c.fraudScore}%
                        </Badge>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      {c.totalOrders >= 5 ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">VIP</Badge>
                      ) : c.totalOrders >= 3 ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-[10px]">{language === "bn" ? "রিপিট" : "Repeat"}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">{language === "bn" ? "নতুন" : "New"}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-0.5">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedCustomer(c)} title="View Details">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-600" title="Fraud Check"
                          onClick={() => { setFraudDialog(true); setFraudResult(null); checkFraud(c.phone); }}>
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600" title="WhatsApp" onClick={() => sendWhatsApp(c)}>
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" title="Call" onClick={() => window.open(`tel:+88${c.phone}`)}>
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              {language === "bn" ? "কাস্টমার বিস্তারিত" : "Customer Details"}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground text-xs">{language === "bn" ? "নাম" : "Name"}</span><br /><strong>{selectedCustomer.name}</strong></div>
                <div><span className="text-muted-foreground text-xs">{language === "bn" ? "ফোন" : "Phone"}</span><br /><strong className="font-english">{selectedCustomer.phone}</strong></div>
                <div><span className="text-muted-foreground text-xs">Email</span><br /><strong className="font-english text-xs">{selectedCustomer.email || "—"}</strong></div>
                <div><span className="text-muted-foreground text-xs">{language === "bn" ? "মোট অর্ডার" : "Total Orders"}</span><br /><strong>{selectedCustomer.totalOrders}</strong></div>
                <div><span className="text-muted-foreground text-xs">{language === "bn" ? "মোট খরচ" : "Total Spent"}</span><br /><strong className="text-accent">৳{selectedCustomer.totalSpent.toLocaleString()}</strong></div>
                <div><span className="text-muted-foreground text-xs">{language === "bn" ? "শেষ অর্ডার" : "Last Order"}</span><br /><strong>{new Date(selectedCustomer.lastOrder).toLocaleDateString()}</strong></div>
              </div>

              {selectedCustomer.fraudScore !== null && (
                <div className={`p-3 rounded-lg border ${selectedCustomer.fraudStatus === "Safe" ? "bg-green-50 border-green-200 dark:bg-green-950/30" : "bg-red-50 border-red-200 dark:bg-red-950/30"}`}>
                  <div className="flex items-center gap-2">
                    {selectedCustomer.fraudStatus === "Safe" ? <ShieldCheck className="h-4 w-4 text-green-600" /> : <ShieldAlert className="h-4 w-4 text-red-600" />}
                    <span className="font-semibold">{selectedCustomer.fraudStatus} — {selectedCustomer.fraudScore}%</span>
                  </div>
                </div>
              )}

              {/* Order History */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">{language === "bn" ? "অর্ডার হিস্টোরি" : "Order History"}</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedCustomer.orders.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg border border-border/50">
                      <div>
                        <p className="font-english text-xs font-semibold">#{o.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-[10px] text-muted-foreground">{o.payment_method} • {new Date(o.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent text-xs">৳{o.amount.toLocaleString()}</p>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[o.status] || ""}`}>{o.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button size="sm" variant="outline" className="gap-1 text-xs text-emerald-600" onClick={() => sendWhatsApp(selectedCustomer)}>
                  <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                </Button>
                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => window.open(`tel:+88${selectedCustomer.phone}`)}>
                  <Phone className="h-3.5 w-3.5" /> Call
                </Button>
                <Button size="sm" variant="outline" className="gap-1 text-xs text-blue-600"
                  onClick={() => { setFraudDialog(true); setFraudResult(null); checkFraud(selectedCustomer.phone); setSelectedCustomer(null); }}>
                  <ShieldCheck className="h-3.5 w-3.5" /> Fraud Check
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fraud Dialog */}
      <Dialog open={fraudDialog} onOpenChange={setFraudDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Fraud Checker
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {checkingFraud && <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
            {fraudResult && (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border-2 text-center ${
                  fraudResult.status === "Safe" ? "border-green-300 bg-green-50 dark:bg-green-950/30" :
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
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCustomers;
