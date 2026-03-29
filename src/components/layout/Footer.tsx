import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Facebook, Phone, Mail, MapPin, MessageCircle, Youtube, Heart } from "lucide-react";

const Footer: React.FC = () => {
  const { language } = useLanguage();
  const { siteInfo, footer } = useSiteSettings();

  const socialLinks = [
    footer.facebook_url && { url: footer.facebook_url, Icon: Facebook, label: "Facebook" },
    footer.messenger_url && { url: footer.messenger_url, Icon: MessageCircle, label: "Messenger" },
    footer.youtube_url && { url: footer.youtube_url, Icon: Youtube, label: "YouTube" },
  ].filter(Boolean) as { url: string; Icon: React.ElementType; label: string }[];

  return (
    <footer className="bg-gradient-to-br from-[hsl(213,50%,13%)] to-[hsl(213,56%,8%)] text-white">
      <div className="container mx-auto px-4 py-14">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              {siteInfo.logo_url && <img src={siteInfo.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />}
              <h3 className="font-english font-bold text-xl">SB Mobile Shop</h3>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              {language === "bn" ? footer.footer_about_bn : footer.footer_about_en}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-accent/80 flex items-center justify-center transition-all duration-200 hover:scale-105"
                  aria-label={s.label}>
                  <s.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white/90">{language === "bn" ? "দ্রুত লিংক" : "Quick Links"}</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { link: "#home", en: "Home", bn: "হোম" },
                { link: "#services", en: "Services", bn: "সেবা" },
                { link: "#products", en: "Products", bn: "পণ্য" },
                { link: "#payment", en: "Payment", bn: "পেমেন্ট" },
                { link: "/order-tracking", en: "Track Order", bn: "অর্ডার ট্র্যাক" },
                { link: "#courses", en: "Courses", bn: "কোর্স" },
                { link: "#tools", en: "Tools", bn: "টুলস" },
              ].map((item) => (
                <li key={item.link}>
                  <a href={item.link} className="text-white/50 hover:text-accent transition-colors duration-200 inline-flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-accent/60" />
                    {language === "bn" ? item.bn : item.en}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white/90">{language === "bn" ? "যোগাযোগ" : "Contact"}</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`tel:+88${siteInfo.phone}`} className="flex items-center gap-2.5 text-white/50 hover:text-accent transition-colors">
                  <Phone className="h-4 w-4 text-accent/70 shrink-0" /> <span className="font-english">+88 {siteInfo.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/88${siteInfo.phone2}?text=${encodeURIComponent("Hi SB Mobile Shop! I'm reaching out from your website. I'd like to know more about your products and services.")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-white/50 hover:text-accent transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-accent/70 shrink-0" /> <span className="font-english">+88 {siteInfo.phone2}</span> <span className="text-xs text-accent/60">(WhatsApp)</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${siteInfo.email}`} className="flex items-center gap-2.5 text-white/50 hover:text-accent transition-colors">
                  <Mail className="h-4 w-4 text-accent/70 shrink-0" /> <span className="font-english">{siteInfo.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/50"><MapPin className="h-4 w-4 text-accent/70 shrink-0 mt-0.5" />
                {language === "bn" ? siteInfo.address_bn : siteInfo.address_en}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 mt-12 pt-6 pb-[env(safe-area-inset-bottom,0px)] text-center text-sm text-white/30 flex items-center justify-center gap-1.5">
          © {new Date().getFullYear()} {siteInfo.shop_name_en || "SB Mobile Shop"}.
          <Heart className="h-3 w-3 text-accent/50 fill-accent/50" />
          {language === "bn" ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
