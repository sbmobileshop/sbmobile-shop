"use client";

import React from "react";
import { useSettings } from "@/store/settings";
import { Wrench, ShoppingBag, Truck } from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ElementType> = {
  Wrench,
  ShoppingBag,
  Truck,
};

const defaultServices = [
  {
    title: "Mobile Repair",
    titleBn: "মোবাইল রিপেয়ার",
    description: "Software and hardware problem solving for all mobile brands with warranty and quality assurance.",
    descriptionBn: "সফটওয়্যার ও হার্ডওয়্যার সমস্যার সমাধান — ওয়ারেন্টি সহ",
    icon: "Wrench",
  },
  {
    title: "Accessories",
    titleBn: "এক্সেসরিজ",
    description: "High-quality mobile accessories at competitive prices with original products.",
    descriptionBn: "সেরা মানের মোবাইল এক্সেসরিজ — সেরা দামে",
    icon: "ShoppingBag",
  },
  {
    title: "Home Delivery",
    titleBn: "হোম ডেলিভারি",
    description: "Fast and reliable delivery service across Bangladesh with secure packaging.",
    descriptionBn: "সারাদেশে দ্রুত ও নিরাপদ ডেলিভারি",
    icon: "Truck",
  },
];

const ServicesSection = () => {
  const { language } = useSettings();

  return (
    <section className="py-16 px-4 bg-secondary/30" id="services">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {language === "bn" ? "আমাদের সেবাসমূহ" : "Our Services"}
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            {language === "bn"
              ? "আমরা আপনার জন্য সেরা সেবা প্রদান করি"
              : "We provide the best services for you"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {defaultServices.map((service, i) => {
            const IconComp = iconMap[service.icon] || Wrench;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover bg-card rounded-2xl p-8 text-center"
              >
                <div className="feature-icon-circle">
                  <IconComp className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {language === "bn" ? service.titleBn : service.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {language === "bn" ? service.descriptionBn : service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
