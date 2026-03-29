import React from "react";
import { X, ShoppingCart, ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

interface MiniCartPopupProps {
  isOpen: boolean;
  onClose: () => void;
  addedItem: {
    name: string;
    name_bn: string;
    image: string;
    price: number;
    quantity: number;
    variant?: string;
  } | null;
  cartTotal: number;
  cartItemCount: number;
}

const MiniCartPopup: React.FC<MiniCartPopupProps> = ({
  isOpen,
  onClose,
  addedItem,
  cartTotal,
  cartItemCount,
}) => {
  const { language } = useLanguage();

  if (!addedItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-4 right-4 left-4 sm:left-auto sm:w-[380px] bg-card rounded-2xl border border-border shadow-2xl z-[61] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-semibold text-sm">
                  {language === "bn" ? "কার্টে যোগ হয়েছে!" : "Added to cart!"}
                </span>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 rounded-full transition-colors">
                <X className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
              </button>
            </div>

            {/* Added Item */}
            <div className="p-4">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                  {addedItem.image ? (
                    <img src={addedItem.image} alt={addedItem.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-bold">SB</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
                    {language === "bn" ? addedItem.name_bn : addedItem.name}
                  </h4>
                  {addedItem.variant && (
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">
                      {language === "bn" ? "রঙ" : "Color"}: {addedItem.variant}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-accent font-english text-sm">৳{addedItem.price.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">× {addedItem.quantity}</span>
                  </div>
                </div>
              </div>

              {/* Cart Summary */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">
                  {language === "bn" ? `কার্টে মোট (${cartItemCount}টি পণ্য)` : `Cart total (${cartItemCount} items)`}
                </span>
                <span className="font-bold text-accent font-english">৳{cartTotal.toLocaleString()}</span>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Link to="/cart" onClick={onClose}>
                  <Button variant="outline" className="w-full h-10 text-sm font-semibold gap-1.5 rounded-xl">
                    <ShoppingCart className="h-4 w-4" />
                    {language === "bn" ? "কার্ট দেখুন" : "View Cart"}
                  </Button>
                </Link>
                <Button onClick={onClose} className="h-10 text-sm font-semibold gap-1.5 rounded-xl btn-gradient">
                  {language === "bn" ? "কেনাকাটা চালান" : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MiniCartPopup;
