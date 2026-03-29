import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Facebook, MessageCircle, Users, Globe, Navigation } from "lucide-react";
import { motion } from "framer-motion";

const ContactSection: React.FC = () => {
  const { language } = useLanguage();
  const { siteInfo, footer } = useSiteSettings();

  const contactLinks = [
    { label: "CUSTOMER GROUP", label_bn: "কাস্টমার গ্রুপ", url: "https://www.facebook.com/groups/sbmobileshop", icon: Users, color: "bg-blue-600 hover:bg-blue-700" },
    { label: "GSM STUDENTS GROUP", label_bn: "GSM স্টুডেন্ট গ্রুপ", url: "https://www.facebook.com/groups/827484245995152/?mibextid=K35XfP", icon: Users, color: "bg-green-600 hover:bg-green-700" },
    { label: "OUR WEBSITE", label_bn: "আমাদের ওয়েবসাইট", url: "https://sbmobileshop.com", icon: Globe, color: "bg-purple-600 hover:bg-purple-700" },
    { label: "MESSAGE US", label_bn: "মেসেজ করুন", url: footer.messenger_url, icon: MessageCircle, color: "bg-sky-500 hover:bg-sky-600" },
    { label: "OUR LOCATION", label_bn: "আমাদের লোকেশন", url: footer.google_maps_url, icon: Navigation, color: "bg-red-500 hover:bg-red-600" },
    { label: "FACEBOOK PAGE", label_bn: "ফেসবুক পেইজ", url: footer.facebook_url, icon: Facebook, color: "bg-blue-500 hover:bg-blue-600" },
    { label: "EMAIL US", label_bn: "ইমেইল করুন", url: `mailto:${siteInfo.email}`, icon: Mail, color: "bg-orange-500 hover:bg-orange-600" },
  ];

  return (
    <section className="py-14 md:py-20 bg-background" id="contact">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
            {language === "bn" ? "যোগাযোগ করুন" : "Contact Us"}
          </h2>
          <p className="text-muted-foreground text-center mb-6 text-sm">
            {language === "bn" ? "যেকোনো প্রয়োজনে আমাদের টিমের সাথে যোগাযোগ করুন" : "Get in touch with our team for any inquiries"}
          </p>
        </motion.div>

        {/* Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="max-w-2xl mx-auto mb-8 bg-card rounded-2xl p-5 md:p-6 border border-border shadow-sm"
        >
          <p className="text-foreground/80 text-sm leading-relaxed mb-4">
            {language === "bn"
              ? "আমাদের সাথে যোগাযোগ করতে নিচের SB Mobile Shop ফেইসবুক পেইজটিতে ক্লিক করুন। আমাদের দোকানে সরাসরি এসে আপনারা সকল প্রকার মোবাইল এক্সেসরিজ এবং মোবাইলের সফটওয়্যারজনিত ও হার্ডওয়্যারজনিত সমস্যার সমাধান করতে পারবেন। আমাদের এখানে রয়েছেন সুদক্ষ মোবাইল টেকনিশিয়ানরা। নতুন নতুন স্মার্ট ফোনের নতুন নতুন ফিচারে যে সকল সমস্যা দেখা দেয় তার সব কিছুর সমাধান করে দেবেন আমাদের ১৫ বছরেরও বেশি অভিজ্ঞতা সম্পন্ন BTSI অনুমোদিত মোবাইল ইঞ্জিনিয়াররা।"
              : "Contact us through our SB Mobile Shop Facebook page below. Visit our shop for all types of mobile accessories and solutions for both software and hardware issues. Our skilled mobile technicians with over 15 years of BTSI-certified experience can solve all problems with the latest smartphone features."}
          </p>
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
            <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <span>
              {language === "bn"
                ? "আমাদের দোকানঃ আল-আমিন সুপার মার্কেট (২য় তলা), কলেজ রোড, বিয়ানীবাজার, সিলেট।"
                : "Our Shop: Al-Amin Super Market (2nd Floor), College Road, Beanibazar, Sylhet."}
            </span>
          </div>
        </motion.div>

        {/* Contact Buttons */}
        <div className="flex flex-wrap gap-2.5 justify-center max-w-2xl mx-auto">
          {contactLinks.map((link, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <button
                onClick={() => window.open(link.url, "_blank")}
                className={`${link.color} text-white px-4 py-2 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 active:scale-[0.95] transition-all shadow-md hover:shadow-lg`}
              >
                <link.icon className="h-3.5 w-3.5" />
                {language === "bn" ? link.label_bn : link.label}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
