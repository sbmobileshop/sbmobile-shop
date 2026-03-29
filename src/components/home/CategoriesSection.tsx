import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Smartphone, Phone, Headphones, Watch, Disc3, BatteryCharging, ShieldCheck, Package } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { key: "cat.smartphones", icon: Smartphone },
  { key: "cat.feature_phones", icon: Phone },
  { key: "cat.accessories", icon: ShieldCheck },
  { key: "cat.gadgets", icon: Watch },
  { key: "cat.earbuds", icon: Headphones },
  { key: "cat.chargers", icon: BatteryCharging },
  { key: "cat.covers", icon: Disc3 },
  { key: "cat.digital", icon: Package },
];

const CategoriesSection: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">{t("section.categories")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.key}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => navigate("/products")}
              className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-md transition-all duration-300 group active:scale-[0.97]"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-accent/10 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                <cat.icon className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium text-card-foreground text-center">{t(cat.key)}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
