"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useSettings } from "@/store/settings";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart();
  const { language } = useSettings();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground/30 mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {language === "bn" ? "আপনার কার্ট খালি" : "Your cart is empty"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === "bn"
              ? "কিছু পণ্য যোগ করতে আমাদের শপিং পেজ দেখুন"
              : "Add some products to your cart from our shop"}
          </p>
          <Button onClick={() => router.push("/#products")} className="btn-gradient">
            {language === "bn" ? "পণ্য দেখুন" : "Shop Now"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-8">
          {language === "bn" ? "শপিং কার্ট" : "Shopping Cart"} ({items.length})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-4 flex gap-4"
              >
                <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-bold text-xl">
                      SB
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {language === "bn" ? item.nameBn : item.name}
                  </h3>
                  <p className="text-accent font-bold mt-1">৳{item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-2 hover:bg-muted transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-4">
                {language === "bn" ? "অর্ডার সামারি" : "Order Summary"}
              </h2>
              
              <div className="space-y-3 text-sm border-b border-border pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === "bn" ? "সাবটোটাল" : "Subtotal"}
                  </span>
                  <span className="font-medium">৳{getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === "bn" ? "ডেলিভারি" : "Delivery"}
                  </span>
                  <span className="font-medium text-success">
                    {language === "bn" ? "ফ্রি" : "Free"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold text-lg">{language === "bn" ? "মোট" : "Total"}</span>
                <span className="font-bold text-lg text-accent">৳{getTotal().toLocaleString()}</span>
              </div>

              <Button
                onClick={() => router.push("/checkout")}
                className="w-full btn-gradient"
              >
                {language === "bn" ? "চেকআউট করুন" : "Proceed to Checkout"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <Button
                variant="ghost"
                onClick={clearCart}
                className="w-full mt-3 text-destructive"
              >
                {language === "bn" ? "কার্ট খালি করুন" : "Clear Cart"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
