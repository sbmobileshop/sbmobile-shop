import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Loader2, ShoppingBag, Star, Shield, Truck, Clock, CheckCircle2,
  Phone, MapPin, Copy, Check, Flame, Zap, Gift, ArrowRight, ArrowDown,
  AlertCircle, CreditCard, User, Mail, FileText, StickyNote, Send,
  Coins, BadgeCheck, Globe
} from "lucide-react";
import FloatingButtons from "@/components/FloatingButtons";

interface LandingPageReview {
  name: string;
  text: string;
  rating: number;
}

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  description: string;
  hero_image: string;
  hero_title: string;
  hero_subtitle: string;
  cta_text: string;
  cta_link: string;
  product_ids: string[];
  is_active: boolean;
  bg_color: string;
  offer_end_date?: string;
  offer_label?: string;
  features?: string[];
  created_at: string;
  about_text?: string;
  about_text_bn?: string;
  author_name?: string;
  author_bio?: string;
  author_bio_bn?: string;
  author_image?: string;
  why_buy_points?: string[];
  why_buy_points_bn?: string[];
  reviews?: LandingPageReview[];
  show_about?: boolean;
  show_author?: boolean;
  show_reviews?: boolean;
  show_why_buy?: boolean;
  show_gallery?: boolean;
  show_specs?: boolean;
  show_contact_bar?: boolean;
  contact_text?: string;
  contact_text_bn?: string;
}

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

const paymentMethods = [
  { id: "bkash", name: "bKash", logo: "https://cdn.worldvectorlogo.com/logos/bkash.svg", color: "#e2136e" },
  { id: "nagad", name: "Nagad", logo: "https://www.logo.wine/a/logo/Nagad/Nagad-Logo.wine.svg", color: "#f6921e" },
  { id: "rocket", name: "Rocket", logo: "https://seekvectors.com/storage/images/dutch%20bangla%20rocket.svg", color: "#8b2f8b" },
  { id: "cod", name: "Cash on Delivery", logo: "", color: "hsl(var(--primary))" },
];

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
  return (
    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(text); setCopied(true); toast.success("Copied!"); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/60 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all active:scale-95">
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {label && <span className="hidden sm:inline">{copied ? "Copied" : label}</span>}
    </button>
  );
};

const CountdownTimer: React.FC<{ endDate: string; label?: string }> = ({ endDate, label }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setExpired(true); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (expired) return null;

  const units = [
    { value: timeLeft.days, label: "দিন", labelEn: "Days" },
    { value: timeLeft.hours, label: "ঘণ্টা", labelEn: "Hours" },
    { value: timeLeft.minutes, label: "মিনিট", labelEn: "Minutes" },
    { value: timeLeft.seconds, label: "সেকেন্ড", labelEn: "Seconds" },
  ];

  return (
    <div className="text-center py-6">
      {label && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <Flame className="h-5 w-5 text-destructive animate-pulse" />
          <span className="text-sm font-bold text-destructive uppercase tracking-wider">{label}</span>
          <Flame className="h-5 w-5 text-destructive animate-pulse" />
        </div>
      )}
      <div className="flex items-center justify-center gap-3">
        {units.map((u, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg">
                {String(u.value).padStart(2, "0")}
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground mt-1.5 font-medium">{u.label}</span>
            </div>
            {i < units.length - 1 && <span className="text-2xl font-bold text-muted-foreground/40 mt-[-16px]">:</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const ErrorMsg = ({ msg }: { msg?: string }) => {
  if (!msg) return null;
  return (
    <p className="text-[11px] text-destructive flex items-center gap-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="h-3 w-3 shrink-0" /> {msg}
    </p>
  );
};

const LandingPageView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, setLanguage } = useLanguage();
  const { siteInfo } = useSiteSettings();
  const navigate = useNavigate();
  const orderRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [page, setPage] = useState<LandingPage | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("");

  // Checkout state
  const [quantity, setQuantity] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState("bkash");
  const [codAdvanceMethod, setCodAdvanceMethod] = useState("bkash");
  const [paymentNumbers, setPaymentNumbers] = useState<PaymentNumbers>({ bkash_number: "", nagad_number: "", rocket_number: "", binance_id: "", binance_name: "" });
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", transactionId: "", codAdvanceTrxId: "", address: "", district: "", postcode: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const isDigital = product?.product_type === "digital";

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "landing_pages").maybeSingle();
      if (data?.setting_value) {
        const pages = (data.setting_value as unknown) as LandingPage[];
        const found = pages.find(p => p.slug === slug && p.is_active);
        if (found) {
          setPage(found);
          if (found.product_ids.length > 0) {
            const { data: prods } = await supabase.from("products").select("*").in("id", found.product_ids).eq("status", "active");
            if (prods && prods.length > 0) {
              setProduct(prods[0]);
              setProducts(prods);
            }
          }
        }
      }
      const { data: payData } = await supabase.from("site_settings").select("setting_value").eq("setting_key", "payment_methods").single();
      if (payData?.setting_value) setPaymentNumbers(payData.setting_value as unknown as PaymentNumbers);
      const { data: zones } = await supabase.from("delivery_zones").select("*").eq("is_active", true).order("sort_order" as any, { ascending: true });
      if (zones && zones.length > 0) {
        setDeliveryZones(zones as unknown as DeliveryZone[]);
        setSelectedZoneId((zones as any)[0].id);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  const selectedZone = deliveryZones.find(z => z.id === selectedZoneId);
  const productPrice = product?.price || 0;
  const subtotal = productPrice * quantity;
  const isFreeDelivery = isDigital ? true : (selectedZone ? subtotal >= selectedZone.free_delivery_min : false);
  const deliveryCharge = isDigital ? 0 : (isFreeDelivery ? 0 : (selectedZone?.charge || 0));
  const grandTotal = subtotal + deliveryCharge;
  const advanceAmount = selectedZone?.advance_amount || 100;
  const discount = product?.old_price && product.old_price > product.price ? Math.round(((product.old_price - product.price) / product.old_price) * 100) : 0;

  const isMobilePayment = ["bkash", "nagad", "rocket"].includes(selectedMethod);
  const selected = paymentMethods.find(p => p.id === selectedMethod)!;
  const getNumber = (method?: string) => {
    const m = method || selectedMethod;
    const map: Record<string, string> = { bkash: paymentNumbers.bkash_number, nagad: paymentNumbers.nagad_number, rocket: paymentNumbers.rocket_number };
    return map[m] || "";
  };

  const scrollToOrder = () => {
    orderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const allImages = product ? [product.image_url, ...(product.gallery || [])].filter(Boolean) : [];
  const productColors = product?.colors ? (Array.isArray(product.colors) ? product.colors : []) : [];

  const handlePhoneChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 11);
    setForm(f => ({ ...f, phone: clean }));
    setTouched(t => ({ ...t, phone: true }));
    if (clean.length > 0 && clean.length < 11) {
      setErrors(e => ({ ...e, phone: `${11 - clean.length} ডিজিট বাকি` }));
    } else if (clean.length === 11 && !/^01\d{9}$/.test(clean)) {
      setErrors(e => ({ ...e, phone: "01 দিয়ে শুরু হতে হবে" }));
    } else {
      setErrors(e => { const n = { ...e }; delete n.phone; return n; });
    }
  };

  const fieldError = (key: string) => touched[key] ? errors[key] : undefined;
  const fieldClass = (key: string) => touched[key] && errors[key] ? "border-destructive ring-1 ring-destructive/20 bg-destructive/5" : "";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "সম্পূর্ণ নাম দিন";
    if (!/^01\d{9}$/.test(form.phone)) e.phone = "সঠিক ১১ ডিজিট নম্বর দিন";
    if (!isDigital) {
      if (!form.address.trim() || form.address.length < 10) e.address = "সম্পূর্ণ ঠিকানা দিন (কমপক্ষে ১০ অক্ষর)";
      if (!form.district.trim()) e.district = "জেলা নির্বাচন করুন";
      if (!selectedZoneId) e.zone = "ডেলিভারি জোন নির্বাচন করুন";
    }
    if (isDigital) {
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "ডিজিটাল প্রোডাক্টের জন্য ইমেইল আবশ্যক";
    }
    if (isMobilePayment && !form.transactionId.trim()) e.transactionId = "TrxID দিন";
    if (selectedMethod === "cod" && !isDigital && !form.codAdvanceTrxId.trim()) e.codAdvanceTrxId = `৳${advanceAmount} অগ্রিমের TrxID দিন`;
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "সঠিক ইমেইল দিন";
    setErrors(e);
    setTouched(Object.fromEntries(Object.keys(e).map(k => [k, true])));
    if (Object.keys(e).length > 0) {
      toast.error("লাল চিহ্নিত ফিল্ডগুলো সঠিকভাবে পূরণ করুন");
      const firstErr = formRef.current?.querySelector('[data-error="true"]');
      firstErr?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !product) return;
    setSubmitting(true);
    try {
      const orderId = crypto.randomUUID();
      const orderItems = [{ name: product.name, qty: quantity, price: product.price, product_type: product.product_type || "physical", ...(selectedColor ? { color: selectedColor } : {}) }];
      const fullAddress = isDigital ? "Digital Delivery" : `${form.address.trim()}, ${form.district}${form.postcode ? `, ${form.postcode}` : ""}`;
      const zoneName = isDigital ? "" : (selectedZone ? (language === "bn" ? selectedZone.name_bn || selectedZone.name : selectedZone.name) : "");

      const { error } = await supabase.from("orders").insert({
        id: orderId,
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim(),
        customer_email: form.email.trim() || null,
        address: fullAddress,
        payment_method: selectedMethod === "cod" ? `cod (advance via ${codAdvanceMethod})` : selectedMethod,
        transaction_id: selectedMethod === "cod" ? form.codAdvanceTrxId.trim() : form.transactionId.trim(),
        amount: grandTotal,
        delivery_zone: zoneName,
        delivery_charge: deliveryCharge,
        notes: JSON.stringify({
          items: orderItems,
          customer_notes: form.notes.trim() || null,
          delivery_zone: zoneName,
          delivery_charge: deliveryCharge,
          free_delivery: isFreeDelivery,
          subtotal,
          landing_page: page?.slug,
          has_digital: isDigital,
          ...(selectedColor ? { selected_color: selectedColor } : {}),
          ...(selectedMethod === "cod" && !isDigital ? { cod_advance: { amount: advanceAmount, method: codAdvanceMethod, trxId: form.codAdvanceTrxId.trim() } } : {})
        }),
        status: "pending",
      });
      if (error) throw error;

      if (form.email.trim()) {
        supabase.functions.invoke("order-email", {
          body: { action: "order_confirmation", orderId, siteUrl: window.location.origin },
        }).catch(console.error);
      }

      const whatsappNum = siteInfo.whatsapp || siteInfo.phone || "";
      const msg = encodeURIComponent(
        `*${siteInfo.shop_name_en} — Landing Page Order*\n\nProduct: ${product.name} x${quantity}${selectedColor ? `\nColor: ${selectedColor}` : ""}\nName: ${form.name}\nPhone: ${form.phone}\nMethod: ${selectedMethod}\nTrxID: ${selectedMethod === "cod" ? form.codAdvanceTrxId : form.transactionId}\nTotal: ৳${grandTotal.toLocaleString()}\nAddress: ${fullAddress}`
      );
      window.open(`https://wa.me/${whatsappNum.replace(/[^0-9+]/g, "")}?text=${msg}`, "_blank");
      navigate(`/order-success?id=${orderId}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (!page || !product) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
        <Button onClick={() => navigate("/")} variant="outline">Go Home</Button>
      </div>
    </div>
  );

  const features = page.features?.length ? page.features : [
    "১০০% অরিজিনাল প্রোডাক্ট",
    "দ্রুত ডেলিভারি সারা বাংলাদেশে",
    "ক্যাশ অন ডেলিভারি সুবিধা",
    "৭ দিনের রিটার্ন পলিসি",
    "পণ্য হাতে পেয়ে পেমেন্ট করার সুবিধা",
    "প্রোডাক্ট না পেলে রিটার্ন সুবিধা",
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Translate Button - Fixed Corner */}
      <button
        onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
        className="fixed top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-all active:scale-95 text-xs font-semibold text-foreground"
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        {language === "bn" ? "EN" : "বাং"}
      </button>

      {/* ===== HERO: Product Title + Main Image (Like Demo) ===== */}
      <section className="bg-white">
        {/* Product Title - Big, centered, colored */}
        <div className="pt-6 pb-4 px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent leading-tight"
          >
            {language === "bn" ? (product.name_bn || product.name) : product.name}
          </motion.h1>
          {product.brand && (
            <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
          )}
        </div>

        {/* Main Hero Image - Full width with green border like demo */}
        <div className="px-4 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-xl overflow-hidden border-4 border-emerald-500 shadow-xl"
          >
            <img
              src={product.image_url || page.hero_image}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </motion.div>
        </div>

        {/* Countdown Timer */}
        {page.offer_end_date && (
          <CountdownTimer endDate={page.offer_end_date} label={language === "bn" ? "অফার শেষ হওয়ার বাকি সময়" : "Offer Ends In"} />
        )}

        {/* Price Section - Strikethrough old + current discount (like demo) */}
        <div className="text-center py-5 px-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {product.old_price > product.price && (
              <div className="relative">
                <span className="text-xl sm:text-2xl font-bold text-muted-foreground">
                  {language === "bn" ? "রেগুলার মূল্য" : "Regular Price"}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-muted-foreground ml-1 line-through decoration-destructive decoration-[3px]">
                  ৳{product.old_price?.toLocaleString()}
                </span>
              </div>
            )}
            <div>
              <span className="text-xl sm:text-2xl font-bold text-accent">
                {language === "bn" ? "বর্তমান ডিসকাউন্ট মূল্য" : "Discount Price"}
              </span>
              <span className="text-3xl sm:text-4xl font-bold text-accent ml-1">
                ৳{product.price?.toLocaleString()}
              </span>
              <span className="text-lg font-bold text-accent ml-1">{language === "bn" ? "টাকা" : "BDT"}</span>
            </div>
          </div>
          {discount > 0 && (
            <Badge className="mt-2 bg-destructive text-destructive-foreground text-sm px-4 py-1">
              🔥 {discount}% OFF
            </Badge>
          )}
        </div>

        {/* CTA Button - Big green like demo */}
        <div className="px-4 max-w-md mx-auto pb-6">
          <Button
            onClick={scrollToOrder}
            size="lg"
            className="w-full h-14 text-lg font-bold gap-2 rounded-xl shadow-xl bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <ShoppingBag className="h-5 w-5" />
            {page.cta_text || (language === "bn" ? "অর্ডার করতে চাই" : "Order Now")}
          </Button>
        </div>
      </section>

      {/* ===== About Section (Customizable) ===== */}
      {(page.show_about !== false) && (
        <>
          <section className="bg-emerald-500 py-4 px-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
              {language === "bn" ? `${product.name_bn || product.name} কেন কিনবেন?` : `Why buy ${product.name}?`}
            </h2>
          </section>

          {(page.about_text || page.about_text_bn || product.description) && (
            <section className="bg-background py-4 px-4">
              <div className="max-w-2xl mx-auto">
                <p className="text-sm text-center text-muted-foreground leading-relaxed">
                  {language === "bn"
                    ? (page.about_text_bn || page.about_text || product.description_bn || product.description)
                    : (page.about_text || product.description)}
                </p>
              </div>
            </section>
          )}
        </>
      )}

      {/* Features checklist */}
      {features.length > 0 && (
        <section className="py-6 px-4 bg-background">
          <div className="max-w-2xl mx-auto space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-start gap-3 text-sm"
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-foreground leading-relaxed">{f}</span>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Price + CTA again after benefits */}
      <section className="bg-muted/30 py-5 px-4 text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {product.old_price > product.price && (
            <span className="text-lg text-muted-foreground line-through decoration-destructive decoration-2">৳{product.old_price?.toLocaleString()}</span>
          )}
          <span className="text-2xl sm:text-3xl font-bold text-accent">৳{product.price?.toLocaleString()} {language === "bn" ? "মাত্র" : "only"}</span>
        </div>
        <Button onClick={scrollToOrder} size="lg"
          className="mt-3 h-12 px-8 text-base font-bold gap-2 rounded-xl shadow-lg bg-accent hover:bg-accent/90 text-accent-foreground">
          <ShoppingBag className="h-5 w-5" />
          {language === "bn" ? "অর্ডার করতে চাই" : "Order Now"}
        </Button>
      </section>

      {/* ===== Customer Reviews Section (Customizable) ===== */}
      {(page.show_reviews !== false) && page.reviews && page.reviews.length > 0 && (
        <>
          <section className="bg-emerald-500 py-4 px-4">
            <h2 className="text-xl font-bold text-white text-center">
              {language === "bn" ? "কাস্টমার রিভিউ" : "Customer Reviews"}
            </h2>
          </section>
          <section className="py-6 px-4 bg-background">
            <div className="max-w-2xl mx-auto space-y-3">
              {page.reviews.map((r, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{r.name}</p>
                      <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">{r.text}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ===== Why Buy From Us (Customizable) ===== */}
      {(page.show_why_buy !== false) && (
        <>
          <section className="bg-emerald-500 py-4 px-4">
            <h2 className="text-xl font-bold text-white text-center">
              {language === "bn" ? "আমাদের কাছে কেন কিনবেন?" : "Why Buy From Us?"}
            </h2>
          </section>
          <section className="py-6 px-4 bg-background">
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(page.why_buy_points && page.why_buy_points.length > 0 ? page.why_buy_points : [
                  language === "bn" ? "১০০% অরিজিনাল প্রোডাক্ট গ্যারান্টি" : "100% Original Product Guarantee",
                  language === "bn" ? "সারা বাংলাদেশে হোম ডেলিভারি" : "Home Delivery All Over Bangladesh",
                  language === "bn" ? "পণ্য হাতে পেয়ে পেমেন্ট করুন" : "Pay After Receiving Product",
                  language === "bn" ? "সন্তুষ্ট না হলে রিটার্ন সুবিধা" : "Return If Not Satisfied",
                ]).map((text, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span className="text-sm font-medium text-foreground">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ===== Author / Brand Section (Customizable) ===== */}
      {page.show_author && page.author_name && (
        <section className="py-6 px-4 bg-muted/30">
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-4">
            {page.author_image && (
              <img src={page.author_image} alt={page.author_name} className="w-20 h-20 rounded-full object-cover border-2 border-accent" />
            )}
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-foreground">{page.author_name}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {language === "bn" ? (page.author_bio_bn || page.author_bio) : page.author_bio}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ===== Gallery Images (Customizable visibility) ===== */}
      {(page.show_gallery !== false) && allImages.length > 0 && (
        <section className="bg-background">
          <div className="max-w-2xl mx-auto">
            {allImages.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                alt={`${product.name} - ${i + 1}`}
                className="w-full h-auto block"
                loading={i === 0 ? "eager" : "lazy"}
              />
            ))}
          </div>
        </section>
      )}

      {/* Contact (Customizable) */}
      {(page.show_contact_bar !== false) && (
        <section className="py-4 bg-emerald-500">
          <div className="text-center">
            <a href={`https://wa.me/${siteInfo.whatsapp}`} target="_blank" rel="noopener noreferrer"
              className="text-white text-sm sm:text-base font-bold hover:underline flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              {language === "bn"
                ? (page.contact_text_bn || `যে কোন প্রয়োজনে যোগাযোগ করুন ${siteInfo.phone}`)
                : (page.contact_text || `Contact us ${siteInfo.phone}`)}
            </a>
          </div>
        </section>
      )}

      {/* Specifications */}
      {(page.show_specs !== false) && product.specifications && Object.keys(product.specifications).length > 0 && (
        <section className="py-6 border-b border-border bg-card">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-lg font-bold text-foreground text-center mb-4">
              {language === "bn" ? "বিস্তারিত তথ্য" : "Specifications"}
            </h2>
            <div className="space-y-1">
              {Object.entries(product.specifications).map(([key, val]: [string, any]) => (
                <div key={key} className="flex justify-between py-2.5 border-b border-border last:border-0 text-sm">
                  <span className="text-muted-foreground">{key}</span>
                  <span className="font-medium text-foreground">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Additional Products */}
      {products.length > 1 && (
        <section className="py-6 bg-muted/30 border-b border-border">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-lg font-bold text-foreground text-center mb-4">
              {language === "bn" ? "আরও পণ্য দেখুন" : "More Products"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.slice(1).map(p => (
                <div key={p.id} onClick={() => { setProduct(p); setQuantity(1); scrollToOrder(); }}
                  className="cursor-pointer bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]">
                  <div className="aspect-square bg-muted overflow-hidden">
                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-xl">SB</div>}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-foreground line-clamp-2">{language === "bn" ? (p.name_bn || p.name) : p.name}</p>
                    <p className="text-sm font-bold text-accent mt-1">৳{p.price?.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== ORDER FORM HEADING (Like Demo) ========== */}
      <section className="bg-emerald-500 py-4 px-4">
        <h2 className="text-xl font-bold text-white text-center">
          {language === "bn" ? "অর্ডার করতে নিচের ফর্মটি পূরণ করুন" : "Fill the form below to place your order"}
        </h2>
      </section>

      {/* ========== ORDER FORM SECTION ========== */}
      <section ref={orderRef} className="py-6 bg-background" id="order">
        <div className="container mx-auto px-3 sm:px-4 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}>

            {/* Selected product summary */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border mb-4">
              {product.image_url && <img src={product.image_url} alt="" className="w-14 h-14 rounded-lg object-cover border" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{language === "bn" ? (product.name_bn || product.name) : product.name}</p>
                <p className="text-accent font-bold font-english">৳{product.price?.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-1 border border-border rounded-lg">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2.5 py-1 text-lg hover:bg-muted rounded-l-lg">−</button>
                <span className="px-3 py-1 text-sm font-bold">{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-2.5 py-1 text-lg hover:bg-muted rounded-r-lg">+</button>
              </div>
            </div>

            {/* Color Selector */}
            {productColors.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-card border border-border">
                <p className="text-xs font-semibold mb-2">{language === "bn" ? "কালার সিলেক্ট করুন" : "Select Color"}</p>
                <div className="flex flex-wrap gap-2">
                  {productColors.map((c: any) => {
                    const colorName = typeof c === "string" ? c : c.name;
                    const isSelected = selectedColor === colorName;
                    return (
                      <button key={colorName} type="button" onClick={() => setSelectedColor(colorName)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"}`}>
                        {colorName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Delivery Zone */}
              {!isDigital && deliveryZones.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-3">
                  <h3 className="font-semibold text-sm mb-2.5 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-primary" />
                    {language === "bn" ? "ডেলিভারি জোন" : "Delivery Zone"}
                  </h3>
                  <div className="space-y-1.5">
                    {deliveryZones.map(zone => {
                      const isSelected = selectedZoneId === zone.id;
                      const zoneFree = subtotal >= zone.free_delivery_min;
                      return (
                        <button key={zone.id} type="button" onClick={() => setSelectedZoneId(zone.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border-2 transition-all text-left active:scale-[0.98] ${
                            isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"
                          }`}>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-primary" : "border-muted-foreground/30"}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{language === "bn" ? (zone.name_bn || zone.name) : zone.name}</p>
                              {zoneFree && (
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                  <BadgeCheck className="h-3 w-3" /> {language === "bn" ? "ফ্রি ডেলিভারি!" : "Free Delivery!"}
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
              <div className="bg-card rounded-xl border border-border p-3">
                <h3 className="font-semibold text-sm mb-2.5 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  {language === "bn" ? "পেমেন্ট মেথড" : "Payment Method"}
                </h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {paymentMethods.map(pm => (
                    <button key={pm.id} type="button" onClick={() => setSelectedMethod(pm.id)}
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 transition-all text-[10px] font-semibold active:scale-[0.97] ${
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
                <div className="bg-card rounded-xl border border-border p-3">
                  <p className="text-[11px] text-muted-foreground text-center mb-2 font-medium">
                    {language === "bn" ? `${selected.name}-এ Send Money করুন` : `Send Money to ${selected.name}`}
                  </p>
                  <div onClick={() => { navigator.clipboard.writeText(getNumber()); toast.success("নম্বর কপি হয়েছে!"); }}
                    className="flex items-center justify-center gap-2 bg-muted/40 rounded-xl py-3 px-4 cursor-pointer hover:bg-muted/70 transition-colors active:scale-[0.98]">
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

              {/* COD advance */}
              {selectedMethod === "cod" && !isDigital && (
                <div className="bg-card rounded-xl border border-border p-3 space-y-3">
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-center">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                      {language === "bn" ? `অগ্রিম ৳${advanceAmount} পেমেন্ট আবশ্যক` : `৳${advanceAmount} Advance Payment Required`}
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-1">
                      {language === "bn"
                        ? `অর্ডার কনফার্ম করতে ৳${advanceAmount} অগ্রিম Send Money করুন। বাকি ৳${Math.max(0, grandTotal - advanceAmount).toLocaleString()} ডেলিভারিতে দিবেন।`
                        : `Send ৳${advanceAmount} advance to confirm. Pay ৳${Math.max(0, grandTotal - advanceAmount).toLocaleString()} on delivery.`}
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
                  <div onClick={() => { navigator.clipboard.writeText(getNumber(codAdvanceMethod)); toast.success("নম্বর কপি হয়েছে!"); }}
                    className="flex items-center justify-center gap-2 bg-muted/40 rounded-xl py-2.5 px-4 cursor-pointer hover:bg-muted/70 transition-colors active:scale-[0.98]">
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
              <form ref={formRef} onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-3 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {language === "bn" ? "আপনার তথ্য" : "Your Details"}
                </h3>

                <div data-error={!!fieldError("name")}>
                  <Label className="text-xs font-medium flex items-center gap-1.5 mb-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    {language === "bn" ? "আপনার নাম" : "Your Name"} <span className="text-accent">*</span>
                  </Label>
                  <Input value={form.name}
                    onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setTouched(t => ({ ...t, name: true })); }}
                    onBlur={() => setTouched(t => ({ ...t, name: true }))}
                    placeholder={language === "bn" ? "আপনার পূর্ণ নাম" : "Your full name"}
                    className={`h-11 text-[16px] sm:text-sm ${fieldClass("name")}`} maxLength={100} />
                  <ErrorMsg msg={fieldError("name")} />
                </div>

                <div data-error={!!fieldError("phone")}>
                  <Label className="text-xs font-medium flex items-center gap-1.5 mb-1">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    {language === "bn" ? "আপনার ফোন নাম্বার" : "Your Phone Number"} <span className="text-accent">*</span>
                    {form.phone.length > 0 && (
                      <span className={`ml-auto text-[10px] font-mono ${form.phone.length === 11 ? "text-emerald-500" : "text-muted-foreground"}`}>
                        {form.phone.length}/11
                      </span>
                    )}
                  </Label>
                  <Input value={form.phone}
                    onChange={e => handlePhoneChange(e.target.value)}
                    onBlur={() => { setTouched(t => ({ ...t, phone: true })); }}
                    placeholder="01XXXXXXXXX" inputMode="tel" maxLength={11}
                    className={`h-11 text-[16px] sm:text-sm font-english tracking-wider ${fieldClass("phone")}`} />
                  <ErrorMsg msg={fieldError("phone")} />
                </div>

                <div data-error={!!fieldError("email")}>
                  <Label className="text-xs font-medium flex items-center gap-1.5 mb-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {language === "bn" ? "ইমেইল" : "Email"}
                    {isDigital ? <span className="text-accent">*</span> : <span className="text-muted-foreground text-[10px]">({language === "bn" ? "ঐচ্ছিক" : "optional"})</span>}
                  </Label>
                  <Input value={form.email} type="email"
                    onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setTouched(t => ({ ...t, email: true })); }}
                    placeholder="email@example.com" className={`h-11 text-[16px] sm:text-sm font-english ${fieldClass("email")}`} maxLength={255} />
                  <ErrorMsg msg={fieldError("email")} />
                </div>

                {isMobilePayment && (
                  <div data-error={!!fieldError("transactionId")}>
                    <Label className="text-xs font-medium flex items-center gap-1.5 mb-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      {language === "bn" ? "ট্রানজেকশন আইডি (TrxID)" : "Transaction ID (TrxID)"} <span className="text-accent">*</span>
                    </Label>
                    <Input value={form.transactionId}
                      onChange={e => { setForm(f => ({ ...f, transactionId: e.target.value })); setTouched(t => ({ ...t, transactionId: true })); }}
                      onBlur={() => setTouched(t => ({ ...t, transactionId: true }))}
                      placeholder={language === "bn" ? "যেমন: ABC123XYZ" : "e.g. ABC123XYZ"}
                      className={`h-11 text-[16px] sm:text-sm font-english tracking-wide ${fieldClass("transactionId")}`} maxLength={50} />
                    <ErrorMsg msg={fieldError("transactionId")} />
                  </div>
                )}

                {selectedMethod === "cod" && !isDigital && (
                  <div data-error={!!fieldError("codAdvanceTrxId")}>
                    <Label className="text-xs font-medium flex items-center gap-1.5 mb-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      {language === "bn" ? `অগ্রিম ৳${advanceAmount} এর TrxID` : `Advance ৳${advanceAmount} TrxID`} <span className="text-accent">*</span>
                    </Label>
                    <Input value={form.codAdvanceTrxId}
                      onChange={e => { setForm(f => ({ ...f, codAdvanceTrxId: e.target.value })); setTouched(t => ({ ...t, codAdvanceTrxId: true })); }}
                      onBlur={() => setTouched(t => ({ ...t, codAdvanceTrxId: true }))}
                      placeholder={language === "bn" ? `৳${advanceAmount} Send Money এর TrxID দিন` : `Enter TrxID from ৳${advanceAmount} payment`}
                      className={`h-11 text-[16px] sm:text-sm font-english tracking-wide ${fieldClass("codAdvanceTrxId")}`} maxLength={50} />
                    <ErrorMsg msg={fieldError("codAdvanceTrxId")} />
                  </div>
                )}

                {/* Address section */}
                {!isDigital && (
                  <div className="border-t border-border pt-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      {language === "bn" ? "আপনার সম্পূর্ণ ঠিকানা" : "Your Full Address"}
                    </h4>
                    <div className="space-y-2.5">
                      <div data-error={!!fieldError("address")}>
                        <Label className="text-xs mb-1 block">
                          {language === "bn" ? "সম্পূর্ণ ঠিকানা" : "Full Address"} <span className="text-accent">*</span>
                        </Label>
                        <Textarea value={form.address}
                          onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setTouched(t => ({ ...t, address: true })); }}
                          onBlur={() => setTouched(t => ({ ...t, address: true }))}
                          placeholder={language === "bn" ? "বাড়ি/ফ্ল্যাট নম্বর, রোড, এলাকা, থানা..." : "House/Flat, Road, Area, Thana..."}
                          rows={2} className={`text-[16px] sm:text-sm ${fieldClass("address")}`} maxLength={250} />
                        <ErrorMsg msg={fieldError("address")} />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div data-error={!!fieldError("district")}>
                          <Label className="text-xs mb-1 block">
                            {language === "bn" ? "জেলা" : "District"} <span className="text-accent">*</span>
                          </Label>
                          <select value={form.district}
                            onChange={e => { setForm(f => ({ ...f, district: e.target.value })); setTouched(t => ({ ...t, district: true })); }}
                            className={`w-full h-11 rounded-md border bg-background px-3 text-[16px] sm:text-sm ${fieldClass("district") || "border-input"}`}>
                            <option value="">{language === "bn" ? "নির্বাচন করুন" : "Select"}</option>
                            {[...new Set(districts)].sort().map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <ErrorMsg msg={fieldError("district")} />
                        </div>
                        <div>
                          <Label className="text-xs mb-1 block flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {language === "bn" ? "পোস্টকোড" : "Postcode"}
                          </Label>
                          <Input value={form.postcode}
                            onChange={e => setForm(f => ({ ...f, postcode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                            placeholder="e.g. 3170" inputMode="numeric" className="h-11 text-[16px] sm:text-sm font-english" maxLength={6} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Digital delivery notice */}
                {isDigital && (
                  <div className="border-t border-border pt-3">
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-center">
                      <p className="text-sm font-semibold text-primary">📧 {language === "bn" ? "ডিজিটাল ডেলিভারি" : "Digital Delivery"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{language === "bn" ? "পেমেন্ট ভেরিফাই হলে আপনার ইমেইলে অটো ডেলিভারি হবে" : "Auto delivery via email after payment verification"}</p>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs flex items-center gap-1.5 mb-1">
                    <StickyNote className="h-3 w-3 text-muted-foreground" />
                    {language === "bn" ? "নোট" : "Notes"} <span className="text-muted-foreground text-[10px]">({language === "bn" ? "ঐচ্ছিক" : "optional"})</span>
                  </Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder={language === "bn" ? "বিশেষ নির্দেশনা..." : "Any instructions..."} rows={2} className="text-[16px] sm:text-sm" maxLength={500} />
                </div>

                {/* Order Summary */}
                <div className="border-t border-border pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{language === "bn" ? "সাবটোটাল" : "Subtotal"}</span>
                    <span className="font-english">৳{subtotal.toLocaleString()}</span>
                  </div>
                  {!isDigital && selectedZone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1"><Truck className="h-3 w-3" /> {language === "bn" ? "ডেলিভারি" : "Delivery"}</span>
                      {isFreeDelivery ? (
                        <span className="flex items-center gap-1">
                          <span className="line-through text-muted-foreground font-english">৳{selectedZone.charge}</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold font-english">FREE</span>
                        </span>
                      ) : (
                        <span className="font-english font-medium">৳{deliveryCharge.toLocaleString()}</span>
                      )}
                    </div>
                  )}
                  {isFreeDelivery && !isDigital && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-2.5 py-1.5">
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
                      {language === "bn" ? "ফ্রি ডেলিভারি প্রয়োগ হয়েছে!" : "Free delivery applied!"}
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border text-base font-bold">
                    <span>{language === "bn" ? "মোট" : "Total"}</span>
                    <span className="text-accent text-lg font-english">৳{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-1 pb-[env(safe-area-inset-bottom,0px)]">
                  <Button type="submit" disabled={submitting}
                    className="w-full h-14 text-base font-bold gap-2 rounded-xl shadow-xl hover:shadow-2xl transition-all active:scale-[0.97] bg-accent text-accent-foreground">
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    {submitting
                      ? (language === "bn" ? "প্রক্রিয়াকরণ..." : "Processing...")
                      : selectedMethod === "cod" && !isDigital
                        ? (language === "bn" ? `অর্ডার করুন  ৳${grandTotal.toLocaleString()}` : `Place Order  ৳${grandTotal.toLocaleString()}`)
                        : (language === "bn" ? `অর্ডার করুন  ৳${grandTotal.toLocaleString()}` : `Place Order  ৳${grandTotal.toLocaleString()}`)}
                  </Button>
                </div>
              </form>

              {/* Binance */}
              {paymentNumbers.binance_id && (
                <div className="bg-card rounded-xl border border-border p-3">
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
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-5 bg-muted/30 text-center">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>{language === "bn" ? "নিরাপদ পেমেন্ট" : "Secure Payment"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Truck className="h-3.5 w-3.5 text-blue-500" />
              <span>{language === "bn" ? "সারা বাংলাদেশে ডেলিভারি" : "Nationwide Delivery"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-accent" />
              <span>{siteInfo.phone}</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground/60">
            © {new Date().getFullYear()} {siteInfo.shop_name_en}. All rights reserved.
          </p>
        </div>
      </footer>

      <FloatingButtons />
    </div>
  );
};

export default LandingPageView;
