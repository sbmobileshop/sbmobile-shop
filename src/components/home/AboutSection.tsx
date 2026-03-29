import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { ExternalLink, ShoppingBag, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const AboutSection: React.FC = () => {
  const { language } = useLanguage();
  const { footer } = useSiteSettings();

  return (
    <section className="py-14 md:py-20 bg-background" id="about">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {language === "bn" ? "আমাদের সম্পর্কে" : "About Us"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {language === "bn" ? "আমাদের দোকান ও সেবা সম্পর্কে আরও জানুন" : "Learn more about our shop and services"}
          </p>

          <p className="text-foreground/80 leading-relaxed text-sm md:text-base mb-6">
            {language === "bn"
              ? "SB Mobile Shop — বাংলাদেশে মোবাইল এক্সেসরিজ ও রিপেয়ার সার্ভিসের ওয়ান-স্টপ সলিউশন। বছরের পর বছর ইন্ডাস্ট্রিতে অভিজ্ঞতা নিয়ে আমরা আমাদের মূল্যবান কাস্টমারদের সেরা মানের পণ্য ও সেবা প্রদান করে আসছি। আমাদের দক্ষ টেকনিশিয়ান টিম নিশ্চিত করে যে আপনার ডিভাইসগুলো সর্বোচ্চ যত্ন পায়।"
              : "Welcome to SB Mobile Shop - your one-stop solution for all mobile accessories and repair services in Bangladesh. With years of experience in the industry, we provide top-quality products and services to our valued customers. Our team of skilled technicians ensures that your devices receive the best care possible."}
          </p>

          <div className="inline-block border border-border rounded-lg px-5 py-2.5 mb-6">
            <span className="text-sm font-semibold tracking-wide text-foreground">
              {language === "bn" ? "SB Mobile Shop সম্পর্কে আরও জানুন" : "More About SB Mobile Shop"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 rounded-full px-6 font-semibold active:scale-[0.97] transition-all shadow-lg"
              onClick={() => window.open("/products", "_blank")}
            >
              <ShoppingBag className="h-4 w-4" />
              {language === "bn" ? "এক্সেসরিজ কিনুন" : "Buy Accessories"}
            </Button>
            <button
              onClick={() => window.open("https://sbgsm.netlify.app/", "_blank")}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-red-600 via-red-500 to-[#1a237e] hover:from-red-700 hover:to-[#0d1557] active:scale-[0.97] transition-all shadow-lg border-0"
            >
              <GraduationCap className="h-4 w-4" />
              {language === "bn" ? "GSM কোর্স" : "GSM Courses"}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
