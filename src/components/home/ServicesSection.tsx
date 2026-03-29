import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { icons, Wrench } from "lucide-react";
import { motion } from "framer-motion";

const ServicesSection: React.FC = () => {
  const { language } = useLanguage();
  const { services } = useSiteSettings();

  return (
    <section className="py-16 px-4 bg-background" id="services">
      <div className="container mx-auto">
        <div className="section-title-styled animate-on-scroll">
          <h2>{language === "bn" ? "আমাদের সেবাসমূহ" : "Our Services"}</h2>
          <p>{language === "bn" ? "প্রফেশনাল সার্ভিস ও মানসম্পন্ন পণ্য" : "We provide top-quality mobile repair and accessories with professional service"}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-10">
          {services.map((s, i) => {
            const IconComp = (icons as any)[s.icon] || Wrench;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="card-hover bg-card rounded-2xl p-8 text-center"
              >
                <div className="feature-icon-circle">
                  <IconComp className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{language === "bn" ? s.title_bn : s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{language === "bn" ? s.desc_bn : s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
