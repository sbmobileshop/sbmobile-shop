"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSettings } from "@/store/settings";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get("order") || null;
  const { language } = useSettings();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          {language === "bn" ? "অর্ডার সফল!" : "Order Successful!"}
        </h1>
        
        <p className="text-muted-foreground mb-6">
          {language === "bn"
            ? "আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমাদের টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।"
            : "Your order has been successfully placed. Our team will contact you soon."}
        </p>

        {orderNumber && (
          <div className="bg-muted/30 rounded-xl p-4 mb-8">
            <p className="text-sm text-muted-foreground mb-1">
              {language === "bn" ? "অর্ডার নম্বর" : "Order Number"}
            </p>
            <p className="text-xl font-bold text-foreground font-english">{orderNumber}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.push("/order-tracking")} variant="outline" className="gap-2">
            <Package className="h-4 w-4" />
            {language === "bn" ? "অর্ডার ট্র্যাক করুন" : "Track Order"}
          </Button>
          <Button onClick={() => router.push("/")} className="btn-gradient gap-2">
            {language === "bn" ? "হোম পেজে যান" : "Go to Home"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderSuccessContent />
    </Suspense>
  );
}
