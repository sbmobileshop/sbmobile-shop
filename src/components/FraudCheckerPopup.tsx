import React, { useState, useEffect } from "react";
import { X, ShieldCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

const POPUP_KEY = "sb_fraud_popup_shown";
const POPUP_COOLDOWN = 1000 * 60 * 60 * 24; // 24 hours

const FraudCheckerPopup: React.FC = () => {
  const [show, setShow] = useState(false);
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const lastShown = localStorage.getItem(POPUP_KEY);
    if (lastShown && Date.now() - parseInt(lastShown) < POPUP_COOLDOWN) return;
    
    const timer = setTimeout(() => setShow(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(POPUP_KEY, Date.now().toString());
  };

  const handleGo = () => {
    handleClose();
    navigate("/fraud-checker");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Card */}
      <div className="relative bg-card rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-400 border border-border">
        {/* Close */}
        <button onClick={handleClose} className="absolute top-3 right-3 z-10 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-accent to-primary" />

        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-accent/10 ring-4 ring-accent/5">
            <ShieldCheck className="h-8 w-8 text-accent" />
          </div>

          <h3 className="text-lg font-bold text-foreground mb-2">
            {language === "bn" ? "🛡️ ফ্রি ফ্রড চেকার!" : "🛡️ Free Fraud Checker!"}
          </h3>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            {language === "bn"
              ? "ডেলিভারি দেওয়ার আগে কাস্টমারের নম্বর চেক করুন — সম্পূর্ণ ফ্রি! ফ্রড কাস্টমার চিনুন আগেই।"
              : "Check customer numbers before delivery — completely free! Identify fraud customers in advance."}
          </p>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1 rounded-xl text-sm">
              {language === "bn" ? "পরে দেখব" : "Later"}
            </Button>
            <Button onClick={handleGo} className="flex-1 rounded-xl text-sm gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90">
              {language === "bn" ? "চেক করুন" : "Check Now"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FraudCheckerPopup;
