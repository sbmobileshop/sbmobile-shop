import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AbandonedCartPopup: React.FC = () => {
  const { t } = useLanguage();
  const { hasAbandonedCart, dismissAbandoned, totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {hasAbandonedCart && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-50 bg-card border border-border rounded-xl shadow-2xl p-4"
        >
          <button onClick={dismissAbandoned} className="absolute top-2 right-2 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <ShoppingCart className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-card-foreground">{t("popup.abandoned_title")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("popup.abandoned_desc")} ({totalItems})</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground text-xs" onClick={() => { navigate("/cart"); dismissAbandoned(); }}>
                  {t("popup.view_cart")}
                </Button>
                <Button size="sm" variant="ghost" className="text-xs" onClick={dismissAbandoned}>
                  {t("popup.dismiss")}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AbandonedCartPopup;
