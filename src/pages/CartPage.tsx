import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center py-16">
            <ShoppingBag className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">{t("cart.empty")}</h2>
            <Button onClick={() => navigate("/products")} className="mt-4 btn-gradient">
              {t("cart.continue")}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-28 sm:pb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 active:scale-95 transition-all">
            <ArrowLeft className="h-4 w-4" /> {t("cart.continue")}
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground mb-4">{t("cart.title")}</h1>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Cart items */}
            <div className="lg:col-span-2 space-y-2.5">
              {items.map(item => (
                <div key={item.id} className="bg-card rounded-xl border border-border p-3 sm:p-4 flex items-center gap-3">
                  <div
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-lg flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                  >
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-muted-foreground/30 font-english font-bold text-sm">SB</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-card-foreground line-clamp-2 leading-snug">{language === "bn" ? item.name_bn : item.name}</h3>
                    <p className="text-accent font-bold text-sm mt-1 font-english">{t("product.taka")}{item.price.toLocaleString()}</p>
                    {/* Quantity controls inline on mobile */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold font-english">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto h-7 w-7 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary - sticky bottom on mobile */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border p-3 sm:p-0 sm:relative sm:border-t-0 sm:rounded-xl sm:border sm:border-border sm:p-6 sm:h-fit sm:sticky sm:top-24 safe-area-bottom">
              <div className="hidden sm:block mb-4">
                <h3 className="font-semibold text-lg">{t("cart.title")}</h3>
                <div className="space-y-2 text-sm mt-3">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-muted-foreground">
                      <span className="truncate max-w-[60%]">{language === "bn" ? item.name_bn : item.name} x{item.quantity}</span>
                      <span className="font-english">{t("product.taka")}{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border mt-4 pt-4 flex justify-between font-bold text-lg">
                  <span>{t("cart.total")}</span>
                  <span className="text-accent font-english">{t("product.taka")}{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:block gap-4">
                <div className="sm:hidden">
                  <p className="text-xs text-muted-foreground">{t("cart.total")}</p>
                  <p className="text-lg font-bold text-accent font-english">{t("product.taka")}{totalPrice.toLocaleString()}</p>
                </div>
                <Button
                  className="btn-gradient font-semibold px-8 sm:w-full sm:mt-0"
                  size="lg"
                  onClick={() => navigate("/checkout")}
                >
                  {t("cart.checkout")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
