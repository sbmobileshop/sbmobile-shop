"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cart";
import { useSettings } from "@/store/settings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, CheckCircle, AlertCircle, Phone, Wallet } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const { settings, language } = useSettings();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    paymentMethod: "CASH_ON_DELIVERY",
    transactionId: "",
    senderNumber: "",
  });

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (["BKASH", "NAGAD", "ROCKET"].includes(formData.paymentMethod)) {
      if (!formData.senderNumber || !formData.transactionId) {
        toast.error(language === "bn" ? "সেন্ডার নম্বর এবং ট্রানজ্যাকশন আইডি দিন" : "Enter sender number and transaction ID");
        return;
      }
    }

    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: getTotal(),
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        router.push(`/order-success?order=${order.orderNumber}`);
      } else {
        toast.error(language === "bn" ? "অর্ডার ব্যর্থ হয়েছে" : "Order failed");
      }
    } catch (error) {
      console.error("Order error:", error);
      toast.error(language === "bn" ? "কিছু সমস্যা হয়েছে" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPaymentNumber = () => {
    switch (formData.paymentMethod) {
      case "BKASH": return settings.bkashNumber || "01773243748";
      case "NAGAD": return settings.nagadNumber || "01773243748";
      case "ROCKET": return settings.rocketNumber || "01773243748";
      default: return "";
    }
  };

  const getPaymentName = () => {
    switch (formData.paymentMethod) {
      case "BKASH": return "bKash";
      case "NAGAD": return "Nagad";
      case "ROCKET": return "Rocket";
      default: return "";
    }
  };

  const paymentMethods = [
    { id: "CASH_ON_DELIVERY", name: language === "bn" ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery", icon: "💵" },
    { id: "BKASH", name: "bKash", icon: "💰" },
    { id: "NAGAD", name: "Nagad", icon: "💳" },
    { id: "ROCKET", name: "Rocket", icon: "🚀" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-foreground mb-8">
          {language === "bn" ? "চেকআউট" : "Checkout"}
        </h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                {language === "bn" ? "সম্পূর্ণ তথ্য" : "Complete Information"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    {language === "bn" ? "নাম" : "Name"} *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === "bn" ? "আপনার নাম" : "Your name"}
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      {language === "bn" ? "ফোন নম্বর" : "Phone Number"} *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      {language === "bn" ? "ইমেইল" : "Email"}
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    {language === "bn" ? "ঠিকানা" : "Address"} *
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={language === "bn" ? "সম্পূর্ণ ঠিকানা" : "Full address"}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                {language === "bn" ? "পেমেন্ট পদ্ধতি" : "Payment Method"}
              </h2>

              <div className="grid sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === method.id
                        ? "border-accent bg-accent/5"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value, transactionId: "", senderNumber: "" })}
                      className="sr-only"
                    />
                    <span className="text-xl">{method.icon}</span>
                    <span className="font-medium text-foreground">{method.name}</span>
                  </label>
                ))}
              </div>

              {["BKASH", "NAGAD", "ROCKET"].includes(formData.paymentMethod) && (
                <div className="mt-4 space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">
                        {language === "bn" ? "পেমেন্ট নির্দেশনা" : "Payment Instructions"}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-green-700">
                      <p>1. {language === "bn" ? "আপনার " + getPaymentName() + " অ্যাপ খুনুন" : "Open your " + getPaymentName() + " app"}</p>
                      <p>2. {language === "bn" ? "Send Money অপশনে ক্লিক করুন" : "Click on Send Money option"}</p>
                      <p>3. {language === "bn" ? "নিচের নম্বরে পেমেন্ট করুন" : "Make payment to the number below"}</p>
                    </div>

                    <div className="mt-4 bg-white rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600">{getPaymentName()} {language === "bn" ? "নম্বর" : "Number"}</p>
                        <p className="text-xl font-bold text-green-800 font-english">{getPaymentNumber()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(getPaymentNumber())}
                        className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                      >
                        {copied ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-green-600" />}
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-green-600">
                      {language === "bn" 
                        ? `Send ৳${getTotal().toLocaleString()} to ${getPaymentNumber()}`
                        : `Send ৳${getTotal().toLocaleString()} to ${getPaymentNumber()}`
                      }
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        <Phone className="h-4 w-4 inline mr-1" />
                        {language === "bn" ? "আপনার নম্বর (Sender)" : "Your Number (Sender)"}
                      </label>
                      <Input
                        type="tel"
                        value={formData.senderNumber}
                        onChange={(e) => setFormData({ ...formData, senderNumber: e.target.value })}
                        placeholder="01XXXXXXXXX"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        {language === "bn" ? "ট্রানজ্যাকশন আইডি" : "Transaction ID"}
                      </label>
                      <Input
                        value={formData.transactionId}
                        onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                        placeholder={language === "bn" ? "যেমন: ABC123XYZ" : "e.g., ABC123XYZ"}
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-700">
                      {language === "bn" 
                        ? "সঠিক ট্রানজ্যাকশন আইডি দিন। ভুল আইডি দিলে অর্ডার বাতিল হতে পারে।"
                        : "Provide correct transaction ID. Wrong ID may result in order cancellation."
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-foreground mb-4">
                {language === "bn" ? "অর্ডার সামারি" : "Order Summary"}
              </h2>

              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {language === "bn" ? item.nameBn : item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3 text-sm">
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

              <div className="flex justify-between mt-4 pt-4 border-t border-border">
                <span className="font-bold text-lg">{language === "bn" ? "মোট" : "Total"}</span>
                <span className="font-bold text-lg text-accent">
                  ৳{getTotal().toLocaleString()}
                </span>
              </div>

              <Button type="submit" disabled={loading} className="w-full mt-6 btn-gradient">
                {loading ? (
                  <span className="animate-pulse">
                    {language === "bn" ? "প্রসেসিং..." : "Processing..."}
                  </span>
                ) : (
                  <span>
                    {language === "bn" ? "অর্ডার নিশ্চিত করুন" : "Confirm Order"}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
