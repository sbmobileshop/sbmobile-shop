import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Truck, Phone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const DeliverySection: React.FC = () => {
  const { language } = useLanguage();
  const { delivery } = useSiteSettings();
  const navigate = useNavigate();

  const handleCta = () => {
    if (delivery.cta_link.startsWith("http")) {
      window.open(delivery.cta_link, "_blank");
    } else {
      navigate(delivery.cta_link);
    }
  };

  return (
    <section className="py-16 md:py-20 bg-background overflow-hidden" id="delivery">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-border">
              <img
                src={delivery.image_url}
                alt={language === "bn" ? delivery.title_bn : delivery.title_en}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
            {/* Decorative accent */}
            <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-2xl bg-accent/10 -z-10" />
            <div className="absolute -top-3 -left-3 w-16 h-16 rounded-xl bg-primary/10 -z-10" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold">
              <Truck className="h-4 w-4" />
              {language === "bn" ? "ডেলিভারি সার্ভিস" : "Delivery Service"}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {language === "bn" ? delivery.title_bn : delivery.title_en}
            </h2>

            <p className="text-muted-foreground leading-relaxed text-base">
              {language === "bn" ? delivery.desc_bn : delivery.desc_en}
            </p>

            {/* Contact info */}
            <div className="space-y-3 py-2">
              {delivery.phone_primary && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{language === "bn" ? "মোবাইল" : "Mobile"}</p>
                    <p className="font-semibold text-foreground font-english">{delivery.phone_primary}</p>
                  </div>
                </div>
              )}
              {delivery.phone_bkash && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">{language === "bn" ? "বিকাশ (পার্সোনাল)" : "bKash (Personal)"}</p>
                    <p className="font-semibold text-foreground font-english">{delivery.phone_bkash}</p>
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleCta} className="btn-gradient active:scale-[0.97]">
              {language === "bn" ? delivery.cta_text_bn : delivery.cta_text_en}
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DeliverySection;
