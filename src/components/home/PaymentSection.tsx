"use client";

import React from "react";
import { useSettings } from "@/store/settings";
import { motion } from "framer-motion";

const PaymentSection = () => {
  const { settings, language } = useSettings();

  const paymentMethods = [
    { name: "bKash", number: settings.bkashNumber, enabled: true, logo: "💰" },
    { name: "Nagad", number: settings.nagadNumber, enabled: true, logo: "💳" },
    { name: "Rocket", number: settings.rocketNumber, enabled: true, logo: "🚀" },
  ];

  return (
    <section className="py-16 px-4 bg-card" id="payment">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {language === "bn" ? "পেমেন্ট পদ্ধতি" : "Payment Methods"}
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            {language === "bn"
              ? "আপনার সুবিধার জন্য আমরা বিভিন্ন পেমেন্ট অপশন প্রদান করি"
              : "We provide various payment options for your convenience"}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {paymentMethods.map(
            (method, i) =>
              method.enabled && (
                <motion.div
                  key={method.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="payment-btn min-w-[200px]"
                >
                  <span className="text-2xl">{method.logo}</span>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{method.name}</p>
                    <p className="text-xs text-muted-foreground font-english">
                      {method.number}
                    </p>
                  </div>
                </motion.div>
              )
          )}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            {language === "bn"
              ? "পেমেন্ট করার পর আমাদের জানান"
              : "Please inform us after making payment"}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PaymentSection;
