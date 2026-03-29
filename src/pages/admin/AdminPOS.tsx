import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search, ShoppingCart, Plus, Minus, Trash2, Loader2,
  Printer, CheckCircle2, X, ReceiptText, Volume2, VolumeX
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Product {
  id: string; name: string; name_bn: string | null; price: number; stock: number;
  in_stock: boolean; image_url: string | null; sku: string | null; category: string | null;
}

interface SaleItem {
  product: Product; quantity: number;
}

interface InvoiceData {
  id: string;
  date: string;
  items: { name: string; qty: number; price: number; total: number }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
}

// Sound utility
const playSound = (type: 'add' | 'remove' | 'success' | 'error' | 'click') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = 0.08;

    switch (type) {
      case 'add':
        osc.frequency.value = 800;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
        break;
      case 'remove':
        osc.frequency.value = 400;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start(); osc.stop(ctx.currentTime + 0.2);
        break;
      case 'success':
        osc.frequency.value = 523;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.stop(ctx.currentTime + 0.4);
        break;
      case 'error':
        osc.frequency.value = 200;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
        break;
      case 'click':
        osc.frequency.value = 1200;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(); osc.stop(ctx.currentTime + 0.05);
        break;
    }
  } catch {}
};

const AdminPOS: React.FC = () => {
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.from("products").select("id, name, name_bn, price, stock, in_stock, image_url, sku, category")
      .eq("status", "active").order("name")
      .then(({ data }) => {
        if (data) setProducts(data as unknown as Product[]);
        setLoading(false);
      });
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category || "uncategorized"));
    return ["all", ...Array.from(cats)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (selectedCategory !== "all") list = list.filter(p => (p.category || "uncategorized") === selectedCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || (p.name_bn && p.name_bn.includes(q)) || (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    return list.slice(0, 50);
  }, [products, search, selectedCategory]);

  const addToSale = (p: Product) => {
    if (!p.in_stock || p.stock <= 0) { if (soundEnabled) playSound('error'); return; }
    setSaleItems(prev => {
      const existing = prev.find(i => i.product.id === p.id);
      if (existing) {
        if (existing.quantity >= p.stock) {
          toast.error(language === "bn" ? "স্টক সীমা!" : "Stock limit!");
          if (soundEnabled) playSound('error');
          return prev;
        }
        if (soundEnabled) playSound('add');
        return prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      if (soundEnabled) playSound('add');
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setSaleItems(prev => prev.filter(i => i.product.id !== id));
      if (soundEnabled) playSound('remove');
      return;
    }
    const item = saleItems.find(i => i.product.id === id);
    if (item && qty > item.product.stock) { toast.error("Max stock reached"); if (soundEnabled) playSound('error'); return; }
    setSaleItems(prev => prev.map(i => i.product.id === id ? { ...i, quantity: qty } : i));
    if (soundEnabled) playSound('click');
  };

  const subtotal = saleItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);
  const totalItems = saleItems.reduce((s, i) => s + i.quantity, 0);

  const clearSale = () => {
    setSaleItems([]);
    setDiscount(0);
    setCustomerName("");
    setCustomerPhone("");
    if (soundEnabled) playSound('remove');
  };

  const completeSale = async () => {
    if (saleItems.length === 0) return;
    setCompleting(true);
    try {
      const txnId = `POS-${Date.now()}`;
      const itemsData = saleItems.map(i => ({
        name: i.product.name, qty: i.quantity, price: i.product.price, total: i.product.price * i.quantity
      }));

      const { data: order, error } = await supabase.from("orders").insert({
        customer_name: customerName.trim() || "Walk-in Customer",
        customer_phone: customerPhone.trim() || "N/A",
        payment_method: paymentMethod,
        transaction_id: txnId,
        amount: total,
        discount: discount,
        status: "completed",
        items_data: itemsData,
        notes: "POS Sale",
      }).select("id").single();
      if (error) throw error;

      // Insert order items
      const orderItems = saleItems.map(i => ({
        order_id: order.id,
        product_id: i.product.id,
        product_name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      }));
      await supabase.from("order_items").insert(orderItems);

      // Deduct stock
      for (const item of saleItems) {
        const newStock = item.product.stock - item.quantity;
        await supabase.from("products").update({
          stock: newStock,
          in_stock: newStock > 0,
        } as any).eq("id", item.product.id);
      }

      // Generate invoice
      const inv: InvoiceData = {
        id: txnId,
        date: new Date().toLocaleString("en-BD"),
        items: itemsData,
        subtotal,
        discount,
        total,
        paymentMethod,
        customerName: customerName.trim() || "Walk-in Customer",
        customerPhone: customerPhone.trim() || "N/A",
      };
      setInvoiceData(inv);
      setShowInvoice(true);

      if (soundEnabled) playSound('success');
      toast.success(language === "bn" ? "বিক্রি সম্পন্ন!" : "Sale completed!");

      setSaleItems([]);
      setCustomerName("");
      setCustomerPhone("");
      setDiscount(0);

      // Refresh products
      const { data: refreshed } = await supabase.from("products").select("id, name, name_bn, price, stock, in_stock, image_url, sku, category")
        .eq("status", "active").order("name");
      if (refreshed) setProducts(refreshed as unknown as Product[]);
    } catch (err: any) {
      toast.error(err.message);
      if (soundEnabled) playSound('error');
    } finally {
      setCompleting(false);
    }
  };

  const printInvoice = () => {
    if (!invoiceRef.current) return;
    const printWin = window.open('', '_blank', 'width=400,height=600');
    if (!printWin) return;
    printWin.document.write(`
      <html><head><title>Invoice</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; padding: 10px; font-size: 12px; max-width: 300px; margin: 0 auto; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .line { border-top: 1px dashed #000; margin: 6px 0; }
        .row { display: flex; justify-content: space-between; padding: 2px 0; }
        .total-row { font-size: 16px; font-weight: bold; }
        h2 { font-size: 16px; margin-bottom: 4px; }
        @media print { body { padding: 0; } }
      </style></head><body>
      ${invoiceRef.current.innerHTML}
      <script>window.print();window.close();</script>
      </body></html>
    `);
    printWin.document.close();
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ReceiptText className="h-5 w-5 text-accent" />
          POS
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          {saleItems.length > 0 && (
            <Badge variant="secondary" className="font-english text-xs">
              {totalItems} items • ৳{total.toLocaleString()}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-3 min-h-0">
        {/* LEFT: Products */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Search + Category filter */}
          <div className="flex gap-2 mb-3 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={language === "bn" ? "পণ্য খুঁজুন..." : "Search..."} className="pl-10 h-9 text-sm" />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-1.5 mb-3 flex-shrink-0 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => { setSelectedCategory(cat); if (soundEnabled) playSound('click'); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}>
                {cat === "all" ? (language === "bn" ? "সব" : "All") : cat}
              </button>
            ))}
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {filtered.map(p => {
                  const inCart = saleItems.find(i => i.product.id === p.id);
                  return (
                    <button key={p.id} onClick={() => addToSale(p)} disabled={!p.in_stock || p.stock <= 0}
                      className={`relative bg-card border rounded-xl p-2 text-left transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.97] ${
                        inCart ? 'border-accent shadow-sm ring-1 ring-accent/30' : 'border-border hover:border-accent/40 hover:shadow-sm'
                      }`}>
                      {inCart && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center z-10">
                          {inCart.quantity}
                        </div>
                      )}
                      <div className="aspect-square bg-muted rounded-lg mb-1.5 overflow-hidden flex items-center justify-center">
                        {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" alt={p.name} /> :
                          <span className="text-muted-foreground/20 font-bold font-english text-sm">SB</span>}
                      </div>
                      <p className="text-[11px] font-medium text-foreground line-clamp-2 leading-tight mb-1">
                        {language === "bn" ? (p.name_bn || p.name) : p.name}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-accent font-english">৳{p.price.toLocaleString()}</span>
                        <span className="text-[9px] text-muted-foreground font-english">{p.stock}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Sale panel */}
        <div className="w-72 xl:w-80 flex-shrink-0 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold">{language === "bn" ? "কার্ট" : "Cart"}</span>
              {totalItems > 0 && <Badge variant="outline" className="text-[10px] h-5">{totalItems}</Badge>}
            </div>
            {saleItems.length > 0 && (
              <button onClick={clearSale} className="text-xs text-destructive hover:underline">
                {language === "bn" ? "ক্লিয়ার" : "Clear"}
              </button>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto min-h-0 p-2">
            {saleItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">{language === "bn" ? "পণ্য যোগ করুন" : "Add products to cart"}</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {saleItems.map(item => (
                  <div key={item.product.id} className="flex items-center gap-2 bg-muted/40 rounded-lg p-2">
                    <div className="w-8 h-8 rounded bg-background overflow-hidden flex-shrink-0">
                      {item.product.image_url ? <img src={item.product.image_url} className="w-full h-full object-cover" /> :
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">SB</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium truncate">{language === "bn" ? (item.product.name_bn || item.product.name) : item.product.name}</p>
                      <p className="text-[10px] text-accent font-bold font-english">৳{item.product.price.toLocaleString()} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => updateQty(item.product.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-background border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-all">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-[11px] font-bold font-english">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-background border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-all">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button onClick={() => updateQty(item.product.id, 0)} className="text-destructive/60 hover:text-destructive active:scale-95 transition-all">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom: Customer + totals */}
          {saleItems.length > 0 && (
            <div className="border-t border-border p-3 space-y-2 bg-muted/20">
              <Input value={customerName} onChange={e => setCustomerName(e.target.value)}
                placeholder={language === "bn" ? "কাস্টমার নাম (ঐচ্ছিক)" : "Customer name (optional)"} className="h-8 text-xs" />
              <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                placeholder={language === "bn" ? "ফোন (ঐচ্ছিক)" : "Phone (optional)"} className="h-8 text-xs font-english" />

              <div className="flex gap-2">
                <Select value={paymentMethod} onValueChange={v => { setPaymentMethod(v); if (soundEnabled) playSound('click'); }}>
                  <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">{language === "bn" ? "নগদ" : "Cash"}</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="card">{language === "bn" ? "কার্ড" : "Card"}</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" value={discount || ""} onChange={e => setDiscount(Number(e.target.value) || 0)}
                  placeholder={language === "bn" ? "ছাড়" : "Discount"} className="h-8 text-xs w-20 font-english" />
              </div>

              {/* Totals */}
              <div className="space-y-1 text-xs pt-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>{language === "bn" ? "সাবটোটাল" : "Subtotal"}</span>
                  <span className="font-english">৳{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>{language === "bn" ? "ছাড়" : "Discount"}</span>
                    <span className="font-english">-৳{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-1 border-t border-border">
                  <span>{language === "bn" ? "মোট" : "Total"}</span>
                  <span className="text-accent font-english">৳{total.toLocaleString()}</span>
                </div>
              </div>

              <Button onClick={completeSale} disabled={completing}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 font-semibold h-10 active:scale-[0.98] transition-transform">
                {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {language === "bn" ? "বিক্রি সম্পন্ন" : "Complete Sale"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      <Dialog open={showInvoice} onOpenChange={setShowInvoice}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5" /> Invoice
            </DialogTitle>
          </DialogHeader>

          <div ref={invoiceRef}>
            <div className="center" style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '2px' }}>SB Mobile Shop</h2>
              <p style={{ fontSize: '11px', color: '#666' }}>Thank you for your purchase!</p>
              <div style={{ borderTop: '1px dashed #ccc', margin: '8px 0' }} />
            </div>

            {invoiceData && (
              <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Invoice: {invoiceData.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Date: {invoiceData.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Customer: {invoiceData.customerName}</span>
                </div>
                {invoiceData.customerPhone !== "N/A" && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Phone: {invoiceData.customerPhone}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Payment: {invoiceData.paymentMethod.toUpperCase()}</span>
                </div>

                <div style={{ borderTop: '1px dashed #ccc', margin: '8px 0' }} />

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span style={{ flex: 2 }}>Item</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>Qty</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>Price</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>Total</span>
                </div>

                <div style={{ borderTop: '1px dashed #ccc', margin: '4px 0' }} />

                {invoiceData.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span style={{ flex: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                    <span style={{ flex: 1, textAlign: 'center' }}>{item.qty}</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>৳{item.price}</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>৳{item.total}</span>
                  </div>
                ))}

                <div style={{ borderTop: '1px dashed #ccc', margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span>Subtotal:</span><span>৳{invoiceData.subtotal.toLocaleString()}</span>
                </div>
                {invoiceData.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#e63946' }}>
                    <span>Discount:</span><span>-৳{invoiceData.discount.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px dashed #ccc', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontWeight: 'bold', fontSize: '16px' }}>
                  <span>TOTAL:</span><span>৳{invoiceData.total.toLocaleString()}</span>
                </div>

                <div style={{ borderTop: '1px dashed #ccc', margin: '8px 0' }} />
                <p style={{ textAlign: 'center', fontSize: '10px', color: '#999' }}>Thank you for shopping with us!</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-2">
            <Button onClick={printInvoice} className="flex-1 gap-2">
              <Printer className="h-4 w-4" /> {language === "bn" ? "প্রিন্ট" : "Print"}
            </Button>
            <Button variant="outline" onClick={() => setShowInvoice(false)} className="flex-1">
              {language === "bn" ? "বন্ধ করুন" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPOS;
