import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send, ShoppingBag, Copy, Check, MapPin, User, Phone, Mail, FileText, StickyNote, AlertCircle, CreditCard, Coins, Truck, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const paymentMethods = [
  { id: "bkash", name: "bKash", logo: "https://cdn.worldvectorlogo.com/logos/bkash.svg", color: "#e2136e" },
  { id: "nagad", name: "Nagad", logo: "https://www.logo.wine/a/logo/Nagad/Nagad-Logo.wine.svg", color: "#f6921e" },
  { id: "rocket", name: "Rocket", logo: "https://seekvectors.com/storage/images/dutch%20bangla%20rocket.svg", color: "#8b2f8b" },
  { id: "cod", name: "Cash on Delivery", logo: "", color: "hsl(var(--primary))" },
];

interface PaymentNumbers {
  bkash_number: string;
  nagad_number: string;
  rocket_number: string;
  binance_id: string;
  binance_name: string;
}

interface DeliveryZone {
  id: string;
  name: string;
  name_bn: string | null;
  charge: number;
  advance_amount: number;
  free_delivery_min: number;
}

const districts = [
  "Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh",
  "Comilla", "Gazipur", "Narayanganj", "Narsingdi", "Tangail", "Manikganj", "Munshiganj",
  "Faridpur", "Gopalganj", "Madaripur", "Shariatpur", "Kishoreganj", "Netrokona", "Jamalpur",
  "Sherpur", "Brahmanbaria", "Chandpur", "Lakshmipur", "Noakhali", "Feni", "Khagrachhari",
  "Rangamati", "Bandarban", "Cox's Bazar", "Habiganj", "Moulvibazar", "Sunamganj",
  "Bogura", "Chapainawabganj", "Joypurhat", "Naogaon", "Natore", "Nawabganj", "Pabna",
  "Sirajganj", "Bagerhat", "Chuadanga", "Jessore", "Jhenaidah", "Kushtia", "Magura",
  "Meherpur", "Narail", "Satkhira", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur",
  "Barguna", "Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh",
  "Thakurgaon",
];

const CopyBtn: React.FC<{ text: string; label?: string }> = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true); toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all active:scale-95 shrink-0">
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {label && <span className="hidden sm:inline">{copied ? "Copied" : label}</span>}
    </button>
  );
};

const CheckoutPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { items, totalPrice, clearCart } = useCart();
  const { siteInfo } = useSiteSettings();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  const [selectedMethod, setSelectedMethod] = useState("bkash");
  const [codAdvanceMethod, setCodAdvanceMethod] = useState("bkash");
  const [loading, setLoading] = useState(false);
  const [paymentNumbers, setPaymentNumbers] = useState<PaymentNumbers>({
    bkash_number: "01773243748", nagad_number: "01773243748", rocket_number: "01773243748",
    binance_id: "814381686", binance_name: "MD Shibrul Alom"
  });
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", transactionId: "", codAdvanceTrxId: "",
    address: "", district: "", postcode: "", notes: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase.from("site_settings").select("setting_value").eq("setting_key", "payment_methods").single()
      .then(({ data }) => {
        if (data?.setting_value) setPaymentNumbers(data.setting_value as unknown as PaymentNumbers);
      });
    // Load delivery zones
    supabase.from("delivery_zones").select("*").eq("is_active", true).order("sort_order" as any, { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const zones = data as unknown as DeliveryZone[];
          setDeliveryZones(zones);
          setSelectedZoneId(zones[0].id);
        }
      });
  }, []);

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);
  const isFreeDelivery = selectedZone ? totalPrice >= selectedZone.free_delivery_min : false;
  const deliveryCharge = isFreeDelivery ? 0 : (selectedZone?.charge || 0);
  const grandTotal = totalPrice + deliveryCharge;
  const advanceAmount = selectedZone?.advance_amount || 100;

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 11);
    setForm(f => ({ ...f, phone: clean }));
    setTouched(t => ({ ...t, phone: true }));
    if (clean.length > 0 && clean.length < 11) {
      setErrors(e => ({ ...e, phone: language === "bn" ? `${11 - clean.length} ডিজিট বাকি` : `${11 - clean.length} digits remaining` }));
    } else if (clean.length === 11 && !/^01\d{9}$/.test(clean)) {
      setErrors(e => ({ ...e, phone: language === "bn" ? "01 দিয়ে শুরু হতে হবে" : "Must start with 01" }));
    } else {
      setErrors(e => { const n = { ...e }; delete n.phone; return n; });
    }
  };

  const getNumber = (method?: string) => {
    const m = method || selectedMethod;
    const map: Record<string, string> = { bkash: paymentNumbers.bkash_number, nagad: paymentNumbers.nagad_number, rocket: paymentNumbers.rocket_number };
    return map[m] || "";
  };

  const isMobilePayment = ["bkash", "nagad", "rocket"].includes(selectedMethod);
  const selected = paymentMethods.find(p => p.id === selectedMethod)!;

  // Check if cart has only digital products
  const hasOnlyDigital = items.every(i => (i as any).product_type === "digital");
  const hasAnyDigital = items.some(i => (i as any).product_type === "digital");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = language === "bn" ? "সম্পূর্ণ নাম দিন (কমপক্ষে ২ অক্ষর)" : "Full name required (min 2 chars)";
    if (!/^01\d{9}$/.test(form.phone.trim())) e.phone = language === "bn" ? "সঠিক ১১ ডিজিট নম্বর দিন (01XXXXXXXXX)" : "Enter valid 11-digit number (01XXXXXXXXX)";
    if (!hasOnlyDigital) {
      if (!form.address.trim() || form.address.trim().length < 10) e.address = language === "bn" ? "সম্পূর্ণ ঠিকানা দিন (কমপক্ষে ১০ অক্ষর)" : "Full address required (min 10 chars)";
      if (!form.district.trim()) e.district = language === "bn" ? "জেলা নির্বাচন করুন" : "Select your district";
      if (!selectedZoneId) e.zone = language === "bn" ? "ডেলিভারি জোন নির্বাচন করুন" : "Select delivery zone";
    }
    if (hasOnlyDigital) {
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = language === "bn" ? "ডিজিটাল প্রোডাক্টের জন্য ইমেইল আবশ্যক" : "Email is required for digital products";
    }
    if (isMobilePayment && !form.transactionId.trim()) e.transactionId = language === "bn" ? "TrxID দিন — Send Money করার পর যে ID পাবেন" : "Enter TrxID from your payment confirmation";
    if (selectedMethod === "cod" && !hasOnlyDigital && !form.codAdvanceTrxId.trim()) e.codAdvanceTrxId = language === "bn" ? `৳${advanceAmount} অগ্রিম পেমেন্টের TrxID দিন` : `Enter TrxID for ৳${advanceAmount} advance payment`;
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = language === "bn" ? "সঠিক ইমেইল দিন" : "Enter valid email";
    setErrors(e);
    setTouched(Object.fromEntries(Object.keys(e).map(k => [k, true])));
    if (Object.keys(e).length > 0) {
      toast.error(language === "bn" ? "লাল চিহ্নিত ফিল্ডগুলো সঠিকভাবে পূরণ করুন" : "Please fix the highlighted fields");
      const firstErr = formRef.current?.querySelector('[data-error="true"]');
      firstErr?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const orderItems = items.map(i => ({ name: i.name, qty: i.quantity, price: i.price, product_type: (i as any).product_type || "physical" }));
      const orderId = crypto.randomUUID();
      const fullAddress = hasOnlyDigital ? "Digital Delivery" : `${form.address.trim()}, ${form.district}${form.postcode ? `, ${form.postcode}` : ""}`;
      const zoneName = hasOnlyDigital ? "" : (selectedZone ? (language === "bn" ? selectedZone.name_bn || selectedZone.name : selectedZone.name) : "");
      const finalDeliveryCharge = hasOnlyDigital ? 0 : deliveryCharge;
      const finalGrandTotal = hasOnlyDigital ? totalPrice : grandTotal;
      const { error } = await supabase.from("orders").insert({
        id: orderId,
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_email: form.email.trim() || null,
        address: fullAddress,
        payment_method: selectedMethod === "cod" ? `cod (advance via ${codAdvanceMethod})` : selectedMethod,
        transaction_id: selectedMethod === "cod" ? form.codAdvanceTrxId.trim() : form.transactionId.trim(),
        amount: finalGrandTotal,
        delivery_charge: finalDeliveryCharge,
        delivery_zone: zoneName || null,
        items_data: orderItems as any,
        notes: JSON.stringify({
          items: orderItems,
          customer_notes: form.notes.trim() || null,
          delivery_zone: zoneName,
          delivery_charge: finalDeliveryCharge,
          free_delivery: hasOnlyDigital ? true : isFreeDelivery,
          subtotal: totalPrice,
          has_digital: hasAnyDigital,
          ...(selectedMethod === "cod" && !hasOnlyDigital ? { cod_advance: { amount: advanceAmount, method: codAdvanceMethod, trxId: form.codAdvanceTrxId.trim() } } : {})
        }),
        status: "pending",
      });
      if (error) throw error;

      // Store individual order items in order_items table
      try {
        await supabase.from("order_items").insert(
          items.map(i => ({
            order_id: orderId,
            product_id: i.id,
            product_name: language === "bn" ? i.name_bn : i.name,
            quantity: i.quantity,
            price: i.price,
          }))
        );
      } catch (e) {
        console.error("Failed to save order items:", e);
      }

      // Send confirmation email if email provided
      if (form.email.trim()) {
        supabase.functions.invoke("order-email", {
          body: { action: "order_confirmation", orderId, siteUrl: window.location.origin },
        }).catch(console.error);
      }

      const itemsList = items.map(i => `• ${i.name} x${i.quantity} = ৳${(i.price * i.quantity).toLocaleString()}`).join("\n");
      const advanceInfo = selectedMethod === "cod" ? `\nAdvance: ৳${advanceAmount} via ${codAdvanceMethod} (TrxID: ${form.codAdvanceTrxId})` : "";
      const deliveryInfo = isFreeDelivery ? "\nDelivery: FREE" : `\nDelivery: ৳${deliveryCharge} (${zoneName})`;
      const msg = encodeURIComponent(
        `*${siteInfo.shop_name_en || 'SB Mobile Shop'} — New Order*\n\nName: ${form.name}\nPhone: ${form.phone}\nMethod: ${selectedMethod === "cod" ? `COD (৳${advanceAmount} advance)` : selected.name}\nTrxID: ${selectedMethod === "cod" ? form.codAdvanceTrxId : form.transactionId}\nSubtotal: ৳${totalPrice.toLocaleString()}${deliveryInfo}\nTotal: ৳${grandTotal.toLocaleString()}${advanceInfo}\nZone: ${zoneName}\nAddress: ${fullAddress}\n\nItems:\n${itemsList}`
      );
      const whatsappNum = siteInfo.whatsapp || siteInfo.phone || "+8801773243748";
      window.open(`https://wa.me/${whatsappNum.replace(/[^0-9+]/g, "")}?text=${msg}`, "_blank");

      clearCart();
      navigate(`/order-success?id=${orderId}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("cart.empty")}</h2>
            <Button onClick={() => navigate("/products")} className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
              {t("cart.continue")}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const ErrorMsg = ({ msg }: { msg?: string }) => {
    if (!msg) return null;
    return (
      <p className="text-[11px] text-destructive flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
        <AlertCircle className="h-3 w-3 shrink-0" /> {msg}
      </p>
    );
  };

  const fieldError = (key: string) => touched[key] ? errors[key] : undefined;
  const fieldClass = (key: string) => touched[key] && errors[key] ? "border-destructive ring-1 ring-destructive/20 bg-destructive/5" : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-[69px]" />
      <main className="flex-1 bg-muted/30 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
          <button onClick={() => navigate("/cart")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3 active:scale-[0.97]">
            <ArrowLeft className="h-4 w-4" /> {language === "bn" ? "কার্টে ফিরুন" : "Back to Cart"}
          </button>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-5 px-1">
            {[
              { n: 1, l: language === "bn" ? "পেমেন্ট" : "Pay", active: true },
              { n: 2, l: language === "bn" ? "তথ্য" : "Info", active: true },
              { n: 3, l: language === "bn" ? "সম্পন্ন" : "Done", active: false },
            ].map((s, i) => (
              <React.Fragment key={s.n}>
                {i > 0 && <div className={`flex-1 h-px ${s.active ? "bg-primary/40" : "bg-border"}`} />}
                <div className={`flex items-center gap-1 text-[11px] font-semibold ${s.active ? "text-primary" : "text-muted-foreground"}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${s.active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {s.n}
                  </div>
                  <span className="hidden sm:inline">{s.l}</span>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div className="grid lg:grid-cols-5 gap-4">
            {/* Left: Payment + Form */}
            <div className="lg:col-span-3 space-y-3">
              {/* Delivery Zone Selector - hide for digital-only orders */}
              {!hasOnlyDigital && deliveryZones.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-3 sm:p-4">
                  <h3 className="font-semibold text-sm mb-2.5 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    {language === "bn" ? "ডেলিভারি জোন" : "Delivery Zone"}
                  </h3>
                  <div className="space-y-1.5">
                    {deliveryZones.map(zone => {
                      const isSelected = selectedZoneId === zone.id;
                      const zoneFree = totalPrice >= zone.free_delivery_min;
                      return (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => setSelectedZoneId(zone.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all text-left active:scale-[0.98] ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-primary" : "border-muted-foreground/30"}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {language === "bn" ? (zone.name_bn || zone.name) : zone.name}
                              </p>
                              {zoneFree && (
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                  <BadgeCheck className="h-3 w-3" />
                                  {language === "bn" ? "ফ্রি ডেলিভারি!" : "Free Delivery!"}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {zoneFree ? (
                              <div>
                                <span className="text-xs line-through text-muted-foreground font-english">৳{zone.charge}</span>
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 ml-1 font-english">৳0</span>
                              </div>
                            ) : (
                              <span className="text-sm font-bold text-foreground font-english">৳{zone.charge}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {selectedZone && !isFreeDelivery && (
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                      {language === "bn"
                        ? `৳${selectedZone.free_delivery_min.toLocaleString()}+ অর্ডারে ফ্রি ডেলিভারি`
                        : `Free delivery on orders ৳${selectedZone.free_delivery_min.toLocaleString()}+`}
                    </p>
                  )}
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-card rounded-xl border border-border p-3 sm:p-4">
                <h3 className="font-semibold text-sm mb-2.5 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  {language === "bn" ? "পেমেন্ট মেথড" : "Payment Method"}
                </h3>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {paymentMethods.map(pm => (
                    <button key={pm.id} onClick={() => setSelectedMethod(pm.id)}
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 transition-all text-[10px] sm:text-xs font-semibold active:scale-[0.97] ${
                        selectedMethod === pm.id ? "shadow-md border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}>
                      {pm.logo ? <img src={pm.logo} alt={pm.name} className="h-6 w-6 object-contain" /> : <ShoppingBag className="h-5 w-5" />}
                      <span className="truncate">{pm.id === "cod" ? (language === "bn" ? "ক্যাশ" : "COD") : pm.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Send Money Instructions */}
              {isMobilePayment && (
                <div className="bg-card rounded-xl border border-border p-3 sm:p-4">
                  <p className="text-[11px] text-muted-foreground text-center mb-2 font-medium">
                    {language === "bn" ? `${selected.name}-এ Send Money করুন` : `Send Money to ${selected.name}`}
                  </p>
                  <div onClick={() => { navigator.clipboard.writeText(getNumber()); toast.success(language === "bn" ? "নম্বর কপি হয়েছে!" : "Number copied!"); }}
                    className="flex items-center justify-center gap-2 bg-muted/40 rounded-xl py-3 px-4 cursor-pointer hover:bg-muted/70 transition-colors active:scale-[0.98] group">
                    <span className="text-xl sm:text-2xl font-bold font-english tracking-wide" style={{ color: selected.color }}>
                      {getNumber()}
                    </span>
                    <CopyBtn text={getNumber()} label="Copy" />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    {language === "bn"
                      ? `৳${grandTotal.toLocaleString()} Send Money করে TrxID দিন`
                      : `Send ৳${grandTotal.toLocaleString()} & enter TrxID below`}
                  </p>
                </div>
              )}

              {/* COD note */}
              {selectedMethod === "cod" && (
                <div className="bg-card rounded-xl border border-border p-3 sm:p-4 space-y-3">
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-center">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                      {language === "bn" ? `অগ্রিম ৳${advanceAmount} পেমেন্ট আবশ্যক` : `৳${advanceAmount} Advance Payment Required`}
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
                      {language === "bn"
                        ? `অর্ডার কনফার্ম করতে ৳${advanceAmount} অগ্রিম Send Money করুন। বাকি ৳${Math.max(0, grandTotal - advanceAmount).toLocaleString()} ডেলিভারিতে দিবেন।`
                        : `Send ৳${advanceAmount} advance to confirm order. Pay remaining ৳${Math.max(0, grandTotal - advanceAmount).toLocaleString()} on delivery.`}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground text-center mb-2 font-medium">
                      {language === "bn" ? `৳${advanceAmount} পাঠাতে মাধ্যম বেছে নিন` : `Choose method to send ৳${advanceAmount}`}
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {paymentMethods.filter(p => p.id !== "cod").map(pm => (
                        <button key={pm.id} type="button" onClick={() => setCodAdvanceMethod(pm.id)}
                          className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border-2 transition-all text-[10px] font-semibold active:scale-[0.97] ${
                            codAdvanceMethod === pm.id ? "shadow-md border-primary bg-primary/5" : "border-border hover:border-primary/30"
                          }`}>
                          <img src={pm.logo} alt={pm.name} className="h-5 w-5 object-contain" />
                          <span>{pm.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div onClick={() => { navigator.clipboard.writeText(getNumber(codAdvanceMethod)); toast.success(language === "bn" ? "নম্বর কপি হয়েছে!" : "Number copied!"); }}
                    className="flex items-center justify-center gap-2 bg-muted/40 rounded-xl py-2.5 px-4 cursor-pointer hover:bg-muted/70 transition-colors active:scale-[0.98] group">
                    <span className="text-lg font-bold font-english tracking-wide" style={{ color: paymentMethods.find(p => p.id === codAdvanceMethod)?.color }}>
                      {getNumber(codAdvanceMethod)}
                    </span>
                    <CopyBtn text={getNumber(codAdvanceMethod)} label="Copy" />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    {language === "bn"
                      ? `${paymentMethods.find(p => p.id === codAdvanceMethod)?.name}-এ ৳${advanceAmount} Send Money করে নিচে TrxID দিন`
                      : `Send ৳${advanceAmount} via ${paymentMethods.find(p => p.id === codAdvanceMethod)?.name} & enter TrxID below`}
                  </p>
                </div>
              )}

              {/* Customer Form */}
              <form ref={formRef} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-3 sm:p-4 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {language === "bn" ? "আপনার তথ্য" : "Your Details"}
                </h3>

                <div data-error={!!fieldError("name")}>
                  <Label htmlFor="name" className="text-xs font-medium flex items-center gap-1.5 mb-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    {language === "bn" ? "পূর্ণ নাম" : "Full Name"} <span className="text-accent">*</span>
                  </Label>
                  <Input id="name" value={form.name}
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setTouched(t => ({ ...t, name: true })); }}
                    onBlur={() => setTouched(t => ({ ...t, name: true }))}
                    placeholder={language === "bn" ? "আপনার পূর্ণ নাম" : "Your full name"}
                    className={`h-11 text-sm ${fieldClass("name")}`} maxLength={100} />
                  <ErrorMsg msg={fieldError("name")} />
                </div>

                <div data-error={!!fieldError("phone")}>
                  <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-1.5 mb-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    {language === "bn" ? "মোবাইল নম্বর" : "Mobile Number"} <span className="text-accent">*</span>
                    {form.phone.length > 0 && (
                      <span className={`ml-auto text-[10px] font-mono ${form.phone.length === 11 ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {form.phone.length}/11
                      </span>
                    )}
                  </Label>
                  <Input id="phone" value={form.phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    onBlur={() => { setTouched(t => ({ ...t, phone: true })); if (form.phone.length > 0 && form.phone.length !== 11) setErrors(e => ({ ...e, phone: language === "bn" ? "১১ ডিজিট নম্বর আবশ্যক" : "Must be exactly 11 digits" })); }}
                    placeholder="01XXXXXXXXX" inputMode="tel" maxLength={11}
                    className={`h-11 text-sm font-english tracking-wider ${fieldClass("phone")}`} />
                  <ErrorMsg msg={fieldError("phone")} />
                </div>

                <div data-error={!!fieldError("email")}>
                  <Label htmlFor="email" className="text-xs font-medium flex items-center gap-1.5 mb-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {language === "bn" ? "ইমেইল" : "Email"} <span className="text-muted-foreground text-[10px]">({language === "bn" ? "ঐচ্ছিক" : "optional"})</span>
                  </Label>
                  <Input id="email" value={form.email} type="email"
                    onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setTouched(t => ({ ...t, email: true })); }}
                    placeholder="email@example.com" className={`h-11 text-sm font-english ${fieldClass("email")}`} maxLength={255} />
                  <ErrorMsg msg={fieldError("email")} />
                </div>

                {isMobilePayment && (
                  <div data-error={!!fieldError("transactionId")}>
                    <Label htmlFor="trxId" className="text-xs font-medium flex items-center gap-1.5 mb-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      {language === "bn" ? "ট্রানজেকশন আইডি (TrxID)" : "Transaction ID (TrxID)"} <span className="text-accent">*</span>
                    </Label>
                    <Input id="trxId" value={form.transactionId}
                      onChange={e => { setForm(f => ({ ...f, transactionId: e.target.value })); setTouched(t => ({ ...t, transactionId: true })); }}
                      onBlur={() => setTouched(t => ({ ...t, transactionId: true }))}
                      placeholder={language === "bn" ? "যেমন: ABC123XYZ" : "e.g. ABC123XYZ"}
                      className={`h-11 text-sm font-english tracking-wide ${fieldClass("transactionId")}`} maxLength={50} />
                    <ErrorMsg msg={fieldError("transactionId")} />
                  </div>
                )}

                {selectedMethod === "cod" && (
                  <div data-error={!!fieldError("codAdvanceTrxId")}>
                    <Label htmlFor="codTrxId" className="text-xs font-medium flex items-center gap-1.5 mb-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      {language === "bn" ? `অগ্রিম ৳${advanceAmount} এর TrxID` : `Advance ৳${advanceAmount} TrxID`} <span className="text-accent">*</span>
                    </Label>
                    <Input id="codTrxId" value={form.codAdvanceTrxId}
                      onChange={e => { setForm(f => ({ ...f, codAdvanceTrxId: e.target.value })); setTouched(t => ({ ...t, codAdvanceTrxId: true })); }}
                      onBlur={() => setTouched(t => ({ ...t, codAdvanceTrxId: true }))}
                      placeholder={language === "bn" ? `৳${advanceAmount} Send Money এর TrxID দিন` : `Enter TrxID from ৳${advanceAmount} payment`}
                      className={`h-11 text-sm font-english tracking-wide ${fieldClass("codAdvanceTrxId")}`} maxLength={50} />
                    <ErrorMsg msg={fieldError("codAdvanceTrxId")} />
                  </div>
                )}

                {/* Address section - hidden for digital-only */}
                {!hasOnlyDigital && (
                <div className="border-t border-border pt-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2 mb-2.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    {language === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Address"}
                    <span className="text-accent text-[10px] font-normal">({language === "bn" ? "আবশ্যক" : "Required"})</span>
                  </h4>
                  <div className="space-y-2.5">
                    <div data-error={!!fieldError("address")}>
                      <Label htmlFor="address" className="text-xs mb-1 block">
                        {language === "bn" ? "সম্পূর্ণ ঠিকানা" : "Full Address"} <span className="text-accent">*</span>
                      </Label>
                      <Textarea id="address" value={form.address}
                        onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setTouched(t => ({ ...t, address: true })); }}
                        onBlur={() => setTouched(t => ({ ...t, address: true }))}
                        placeholder={language === "bn" ? "বাড়ি/ফ্ল্যাট নম্বর, রোড, এলাকা, থানা..." : "House/Flat, Road, Area, Thana..."}
                        rows={2} className={`text-sm ${fieldClass("address")}`} maxLength={250} />
                      <ErrorMsg msg={fieldError("address")} />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div data-error={!!fieldError("district")}>
                        <Label htmlFor="district" className="text-xs mb-1 block">
                          {language === "bn" ? "জেলা" : "District"} <span className="text-accent">*</span>
                        </Label>
                        <select id="district" value={form.district}
                          onChange={e => { setForm(f => ({ ...f, district: e.target.value })); setTouched(t => ({ ...t, district: true })); }}
                          className={`w-full h-11 rounded-md border bg-background px-3 text-sm ${fieldClass("district") || "border-input"}`}>
                          <option value="">{language === "bn" ? "নির্বাচন করুন" : "Select"}</option>
                          {[...new Set(districts)].sort().map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ErrorMsg msg={fieldError("district")} />
                      </div>
                      <div>
                        <Label htmlFor="postcode" className="text-xs mb-1 block flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {language === "bn" ? "পোস্টকোড" : "Postcode"}
                        </Label>
                        <Input id="postcode" value={form.postcode}
                          onChange={e => setForm(f => ({ ...f, postcode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                          placeholder="e.g. 3170" inputMode="numeric" className="h-11 text-sm font-english" maxLength={6} />
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* Digital delivery notice */}
                {hasOnlyDigital && (
                  <div className="border-t border-border pt-3">
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
                      <p className="text-sm font-semibold text-primary">📧 {language === "bn" ? "ডিজিটাল ডেলিভারি" : "Digital Delivery"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{language === "bn" ? "পেমেন্ট ভেরিফাই হলে আপনার ইমেইলে অটো ডেলিভারি হবে" : "Auto delivery via email after payment verification"}</p>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="notes" className="text-xs flex items-center gap-1.5 mb-1">
                    <StickyNote className="h-3 w-3 text-muted-foreground" />
                    {language === "bn" ? "নোট" : "Notes"} <span className="text-muted-foreground text-[10px]">({language === "bn" ? "ঐচ্ছিক" : "optional"})</span>
                  </Label>
                  <Textarea id="notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={language === "bn" ? "বিশেষ নির্দেশনা..." : "Any instructions..."} rows={2} className="text-sm" maxLength={500} />
                </div>

                <div className="pt-1 pb-[env(safe-area-inset-bottom,0px)]">
                  <Button type="submit" disabled={loading}
                    className="w-full h-12 text-sm font-bold gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.97] bg-gradient-to-r from-primary to-accent text-white">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    {loading
                      ? (language === "bn" ? "প্রক্রিয়াকরণ..." : "Processing...")
                      : selectedMethod === "cod"
                        ? (language === "bn" ? `৳${advanceAmount} অগ্রিম দিয়ে অর্ডার করুন` : `Pay ৳${advanceAmount} Advance & Order`)
                        : (language === "bn" ? `৳${grandTotal.toLocaleString()} পে করুন` : `Pay ৳${grandTotal.toLocaleString()}`)}
                  </Button>
                </div>
              </form>

              {/* Binance */}
              <div className="p-3 bg-card rounded-xl border border-border">
                <h3 className="font-semibold text-xs mb-2 flex items-center gap-1.5">
                  <Coins className="h-3.5 w-3.5 text-primary" /> Crypto Payment (Binance)
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                    <div className="text-xs"><span className="text-muted-foreground">Name: </span><span className="font-semibold font-english">{paymentNumbers.binance_name}</span></div>
                    <CopyBtn text={paymentNumbers.binance_name} label="Copy" />
                  </div>
                  <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2">
                    <div className="text-xs"><span className="text-muted-foreground">ID: </span><span className="font-bold font-english">{paymentNumbers.binance_id}</span></div>
                    <CopyBtn text={paymentNumbers.binance_id} label="Copy" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2 order-first lg:order-last">
              <div className="bg-card rounded-xl border border-border p-3 sm:p-4 lg:sticky lg:top-24">
                <h3 className="font-semibold text-sm mb-2.5">{language === "bn" ? "অর্ডার সারাংশ" : "Order Summary"}</h3>
                <div className="space-y-1.5">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-xs text-muted-foreground">
                      <span className="truncate max-w-[65%]">{language === "bn" ? item.name_bn : item.name} x{item.quantity}</span>
                      <span className="font-english">৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="border-t border-border mt-2.5 pt-2 space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{language === "bn" ? "সাবটোটাল" : "Subtotal"}</span>
                    <span className="font-english">৳{totalPrice.toLocaleString()}</span>
                  </div>

                  {/* Delivery charge */}
                  {selectedZone && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {language === "bn" ? "ডেলিভারি" : "Delivery"}
                      </span>
                      {isFreeDelivery ? (
                        <span className="flex items-center gap-1">
                          <span className="line-through text-muted-foreground font-english">৳{selectedZone.charge}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-english">FREE</span>
                        </span>
                      ) : (
                        <span className="font-english text-foreground font-medium">৳{deliveryCharge.toLocaleString()}</span>
                      )}
                    </div>
                  )}

                  {isFreeDelivery && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-2.5 py-1.5">
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                      {language === "bn" ? "ফ্রি ডেলিভারি প্রয়োগ হয়েছে!" : "Free delivery applied!"}
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div className="border-t border-border mt-2 pt-2.5 flex justify-between font-bold text-base">
                  <span>{t("cart.total")}</span>
                  <span className="text-accent font-english">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
