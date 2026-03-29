import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Loader2, Coins, ChevronDown, Copy, Check, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CopyBtn: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-all active:scale-95">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
};

const PaymentSection: React.FC = () => {
  const { language } = useLanguage();
  const { payment, siteInfo } = useSiteSettings();
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", transactionId: "", amount: "", address: "", notes: "" });

  const paymentMethods = [
    payment.bkash_enabled && { id: "bkash", name: "bKash", number: payment.bkash_number, logo: "https://cdn.worldvectorlogo.com/logos/bkash.svg", color: "#e2136e" },
    payment.nagad_enabled && { id: "nagad", name: "Nagad", number: payment.nagad_number, logo: "https://www.logo.wine/a/logo/Nagad/Nagad-Logo.wine.svg", color: "#f6921e" },
    payment.rocket_enabled && { id: "rocket", name: "Rocket", number: payment.rocket_number, logo: "https://seekvectors.com/storage/images/dutch%20bangla%20rocket.svg", color: "#8b2f8b" },
  ].filter(Boolean) as { id: string; name: string; number: string; logo: string; color: string }[];

  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]?.id || "bkash");
  const selected = paymentMethods.find(p => p.id === selectedMethod) || paymentMethods[0];

  const validate = () => {
    const phone = form.phone.replace(/\D/g, "");
    if (!form.name.trim()) { toast.error(language === "bn" ? "নাম দিন" : "Enter name"); return false; }
    if (phone.length !== 11 || !phone.startsWith("01")) { toast.error(language === "bn" ? "সঠিক ১১ ডিজিট ফোন নম্বর দিন" : "Enter valid 11-digit phone"); return false; }
    if (!form.transactionId.trim()) { toast.error(language === "bn" ? "ট্রানজেকশন আইডি দিন" : "Enter TrxID"); return false; }
    if (!form.amount.trim() || isNaN(Number(form.amount))) { toast.error(language === "bn" ? "সঠিক পরিমাণ দিন" : "Valid amount required"); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("orders").insert({
        customer_name: form.name.trim(), customer_phone: form.phone.trim(), address: form.address.trim() || null,
        payment_method: selectedMethod, transaction_id: form.transactionId.trim(), amount: Number(form.amount),
        notes: form.notes.trim() || null, status: "pending",
      });
      if (error) throw error;
      const msg = encodeURIComponent(`*SB Mobile Shop — New Order*\n\nName: ${form.name}\nPhone: ${form.phone}\nMethod: ${selected?.name}\nTrxID: ${form.transactionId}\nAmount: ৳${form.amount}\nAddress: ${form.address || 'N/A'}`);
      window.open(`https://wa.me/${siteInfo.whatsapp}?text=${msg}`, "_blank");
      toast.success(language === "bn" ? "অর্ডার সফল! WhatsApp-এ কনফার্ম করুন।" : "Order placed successfully!");
      setForm({ name: "", phone: "", transactionId: "", amount: "", address: "", notes: "" });
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  if (!selected) return null;

  return (
    <section className="py-12 px-4 bg-background" id="payment">
      <div className="container mx-auto max-w-xl">
        {/* Collapsed: Icon bar */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm text-foreground">
                {language === "bn" ? "পেমেন্ট মেথড" : "Payment Methods"}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === "bn" ? "ক্লিক করে পেমেন্ট করুন" : "Tap to pay"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Payment icons row */}
            <div className="flex items-center -space-x-1">
              {paymentMethods.map(pm => (
                <div key={pm.id} className="w-8 h-8 rounded-full bg-white border-2 border-background shadow-sm flex items-center justify-center overflow-hidden">
                  <img src={pm.logo} alt={pm.name} className="w-5 h-5 object-contain" />
                </div>
              ))}
              {payment.binance_enabled && (
                <div className="w-8 h-8 rounded-full bg-[#F0B90B] border-2 border-background shadow-sm flex items-center justify-center">
                  <Coins className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </div>
        </button>

        {/* Expanded: Full payment form */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* Method selector */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {paymentMethods.map(pm => (
                    <button key={pm.id} onClick={() => setSelectedMethod(pm.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all active:scale-95 ${
                        selectedMethod === pm.id
                          ? 'border-current bg-white shadow-md'
                          : 'border-transparent bg-muted/40 hover:bg-muted/70'
                      }`}
                      style={selectedMethod === pm.id ? { color: pm.color, borderColor: pm.color } : {}}>
                      <img src={pm.logo} alt={pm.name} className="h-5 w-5 object-contain" />
                      {pm.name}
                    </button>
                  ))}
                </div>

                {/* Send money number with copy */}
                <div className="bg-muted/40 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">
                    {language === "bn" ? `${selected.name}-এ Send Money করুন` : `Send money to ${selected.name}`}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl font-bold font-english tracking-wide" style={{ color: selected.color }}>
                      {selected.number}
                    </span>
                    <CopyBtn text={selected.number} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {language === "bn" ? "Send Money করে নিচে TrxID দিন" : "Send money then enter TrxID below"}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={language === "bn" ? "আপনার নাম *" : "Your Name *"} required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                  <input value={form.phone} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 11); setForm({ ...form, phone: v }); }}
                    placeholder={language === "bn" ? "ফোন নম্বর (১১ ডিজিট) *" : "Phone (11 digits) *"} required inputMode="numeric"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-english" />
                  <input value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })}
                    placeholder={language === "bn" ? "ট্রানজেকশন আইডি (TrxID) *" : "Transaction ID (TrxID) *"} required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-english" />
                  <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder={language === "bn" ? "পরিমাণ (৳) *" : "Amount (৳) *"} required
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all font-english" />
                  <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder={language === "bn" ? "ডেলিভারি ঠিকানা" : "Delivery Address (optional)"}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg active:scale-[0.97] disabled:opacity-60"
                    style={{ background: selected.color }}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {loading ? (language === "bn" ? "প্রক্রিয়াকরণ..." : "Processing...") : (language === "bn" ? `${selected.name} দিয়ে পে করুন` : `Pay with ${selected.name}`)}
                  </button>
                </form>

                {/* Binance */}
                {payment.binance_enabled && (
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Coins className="h-4 w-4 text-[#F0B90B]" /> Crypto Payment
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Name:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium font-english">{payment.binance_name}</span>
                          <CopyBtn text={payment.binance_name} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">ID:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-english">{payment.binance_id}</span>
                          <CopyBtn text={payment.binance_id} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PaymentSection;
