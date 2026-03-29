import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ShieldCheck, Truck, Award, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { key: "why.original", descKey: "why.original_desc", icon: Award, gradient: "from-blue-500/15 to-blue-600/5" },
  { key: "why.delivery", descKey: "why.delivery_desc", icon: Truck, gradient: "from-emerald-500/15 to-emerald-600/5" },
  { key: "why.warranty", descKey: "why.warranty_desc", icon: ShieldCheck, gradient: "from-purple-500/15 to-purple-600/5" },
  { key: "why.support", descKey: "why.support_desc", icon: Headphones, gradient: "from-orange-500/15 to-orange-600/5" },
];

const WhyUsSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10 text-center">{t("section.why_us")}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center p-6 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br ${f.gradient}`}>
                <f.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-semibold text-base text-card-foreground mb-1">{t(f.key)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
