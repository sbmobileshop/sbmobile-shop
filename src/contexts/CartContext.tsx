import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import MiniCartPopup from "@/components/cart/MiniCartPopup";

export interface CartItem {
  id: string;
  name: string;
  name_bn: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
  product_type?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  hasAbandonedCart: boolean;
  dismissAbandoned: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "sb-cart";
const CART_DISMISSED_KEY = "sb-cart-dismissed";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem(CART_DISMISSED_KEY) === "true";
  });

  // MiniCartPopup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<Omit<CartItem, "quantity"> & { quantity: number } | null>(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.variant === item.variant);
      if (existing) {
        return prev.map(i => i.id === item.id && i.variant === item.variant
          ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    // Play add sound
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const isMuted = localStorage.getItem("sb-sound-muted") === "true";
      if (!isMuted) {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = "sine"; osc.frequency.setValueAtTime(880, ctx.currentTime);
        g.gain.setValueAtTime(0.25, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(g); g.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.15);
        setTimeout(() => { const o2 = ctx.createOscillator(); const g2 = ctx.createGain(); o2.type = "sine"; o2.frequency.setValueAtTime(1100, ctx.currentTime); g2.gain.setValueAtTime(0.2, ctx.currentTime); g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12); o2.connect(g2); g2.connect(ctx.destination); o2.start(); o2.stop(ctx.currentTime + 0.12); }, 100);
      }
    } catch {}
    // Show popup
    setLastAddedItem({ ...item, quantity: 1 });
    setPopupOpen(true);
    setTimeout(() => setPopupOpen(false), 4000);
  }, []);

  const removeItem = useCallback((id: string) => {
    try {
      const isMuted = localStorage.getItem("sb-sound-muted") === "true";
      if (!isMuted) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = "sine"; osc.frequency.setValueAtTime(500, ctx.currentTime);
        g.gain.setValueAtTime(0.2, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.connect(g); g.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.15);
        setTimeout(() => { const o2 = ctx.createOscillator(); const g2 = ctx.createGain(); o2.type = "sine"; o2.frequency.setValueAtTime(350, ctx.currentTime); g2.gain.setValueAtTime(0.15, ctx.currentTime); g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2); o2.connect(g2); g2.connect(ctx.destination); o2.start(); o2.stop(ctx.currentTime + 0.2); }, 100);
      }
    } catch {}
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => { setItems([]); }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const hasAbandonedCart = items.length > 0 && !dismissed;

  const dismissAbandoned = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem(CART_DISMISSED_KEY, "true");
  }, []);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart,
      totalItems, totalPrice, hasAbandonedCart, dismissAbandoned
    }}>
      {children}
      <MiniCartPopup
        isOpen={popupOpen}
        onClose={() => setPopupOpen(false)}
        addedItem={lastAddedItem}
        cartTotal={totalPrice}
        cartItemCount={totalItems}
      />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
