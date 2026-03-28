"use client";

import React, { useState } from "react";
import { useSettings } from "@/store/settings";
import { Search, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function OrderTrackingPage() {
  const { language } = useSettings();
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!orderNumber.trim()) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/orders?orderNumber=${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        setOrder(null);
      }
    } catch (error) {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Package className="h-6 w-6" />;
      case "CONFIRMED":
        return <CheckCircle className="h-6 w-6" />;
      case "SHIPPED":
        return <Truck className="h-6 w-6" />;
      case "DELIVERED":
        return <CheckCircle className="h-6 w-6" />;
      case "CANCELLED":
        return <XCircle className="h-6 w-6" />;
      default:
        return <Package className="h-6 w-6" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; bn: string }> = {
      PENDING: { en: "Pending", bn: "পেন্ডিং" },
      CONFIRMED: { en: "Confirmed", bn: "নিশ্চিত" },
      PROCESSING: { en: "Processing", bn: "প্রসেসিং" },
      SHIPPED: { en: "Shipped", bn: "শিপড" },
      DELIVERED: { en: "Delivered", bn: "ডেলিভার্ড" },
      CANCELLED: { en: "Cancelled", bn: "বাতিল" },
    };
    return labels[status]?.[language] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-500";
      case "CONFIRMED":
      case "PROCESSING":
        return "text-blue-500";
      case "SHIPPED":
        return "text-purple-500";
      case "DELIVERED":
        return "text-green-500";
      case "CANCELLED":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-8 text-center">
          {language === "bn" ? "অর্ডার ট্র্যাক করুন" : "Track Your Order"}
        </h1>

        <div className="flex gap-3 mb-8">
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder={language === "bn" ? "অর্ডার নম্বর" : "Order Number"}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading} className="btn-gradient">
            <Search className="h-4 w-4 mr-2" />
            {language === "bn" ? "খুঁজুন" : "Search"}
          </Button>
        </div>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "bn" ? "অর্ডার নম্বর" : "Order Number"}
                </p>
                <p className="text-xl font-bold text-foreground">{order.orderNumber}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} bg-muted`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="space-y-4">
              {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"].map((status, index) => {
                const isActive = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"].indexOf(order.status) >= index;
                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${isActive ? getStatusColor(status) + " bg-muted" : "bg-muted/30 text-muted-foreground"}`}>
                      {getStatusIcon(status)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {getStatusLabel(status)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {!order && !loading && orderNumber && (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>{language === "bn" ? "কোনো অর্ডার পাওয়া যায়নি" : "No order found"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
