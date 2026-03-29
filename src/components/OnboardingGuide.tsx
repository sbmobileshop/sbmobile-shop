import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { X, ShoppingCart, CreditCard, Truck, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSiteSettings } from "@/hooks/useSiteSettings";
const steps = [
  {
    target: "#products",
    icon: ShoppingCart,
    title_en: "1. Browse & Add to Cart",
    title_bn: "১. পণ্য দেখুন ও কার্টে যোগ করুন",
    desc_en: "Tap any product, then press 'Cart' or 'Buy' button",
    desc_bn: "'কার্ট' বা 'কিনুন' বাটনে ট্যাপ করুন",
  },
  {
    target: "header-cart",
    icon: CreditCard,
    title_en: "2. Checkout & Pay",
    title_bn: "২. চেকআউট ও পেমেন্ট",
    desc_en: "Fill your details, send money via bKash/Nagad, enter TrxID",
    desc_bn: "তথ্য দিন, বিকাশ/নগদে সেন্ড মানি করুন, TrxID দিন",
  },
  {
    target: "delivery",
    icon: Truck,
    title_en: "3. We Deliver",
    title_bn: "৩. আমরা ডেলিভারি দিই",
    desc_en: "Get your order delivered to your doorstep across Bangladesh",
    desc_bn: "সারা বাংলাদেশে আপনার ঠিকানায় ডেলিভারি পাবেন",
  },
  {
    target: "done",
    icon: CheckCircle,
    title_en: "You're all set!",
    title_bn: "আপনি প্রস্তুত!",
    desc_en: "Start shopping now — it's easy & fast",
    desc_bn: "এখনই শপিং শুরু করুন — সহজ ও দ্রুত",
  },
];

const STORAGE_KEY = "sb_onboarding_done";

const OnboardingGuide: React.FC = () => {
  const { language } = useLanguage();
  const { visibility } = useSiteSettings();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visibility.show_onboarding) return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [visibility.show_onboarding]);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  const next = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />
        
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-card rounded-2xl shadow-2xl border border-border/60 max-w-sm w-full overflow-hidden mb-4 sm:mb-0"
        >
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          <button
            onClick={dismiss}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center z-10"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <div className="p-6 text-center">
            {/* Animated icon */}
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Icon className="h-7 w-7 text-white" />
              </div>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-1.5">
              {language === "bn" ? current.title_bn : current.title_en}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {language === "bn" ? current.desc_bn : current.desc_en}
            </p>

            {/* Step indicators */}
            <div className="flex justify-center gap-1.5 mt-5 mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-6 bg-primary" : i < step ? "w-1.5 bg-primary/40" : "w-1.5 bg-muted-foreground/20"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={dismiss}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted transition-colors active:scale-[0.97]"
              >
                {language === "bn" ? "বাদ দিন" : "Skip"}
              </button>
              <button
                onClick={next}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-accent shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
              >
                {isLast
                  ? (language === "bn" ? "শুরু করুন!" : "Start Shopping!")
                  : (language === "bn" ? "পরবর্তী" : "Next")}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingGuide;
