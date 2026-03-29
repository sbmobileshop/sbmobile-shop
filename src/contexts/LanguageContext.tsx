import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Language = "bn" | "en";

interface Translations {
  [key: string]: { bn: string; en: string };
}

const translations: Translations = {
  // Nav
  "nav.home": { bn: "হোম", en: "Home" },
  "nav.products": { bn: "পণ্যসমূহ", en: "Products" },
  "nav.categories": { bn: "ক্যাটাগরি", en: "Categories" },
  "nav.offers": { bn: "অফার", en: "Offers" },
  "nav.tools": { bn: "টুলস", en: "Tools" },
  "nav.courses": { bn: "কোর্স", en: "Courses" },
  "nav.contact": { bn: "যোগাযোগ", en: "Contact" },
  "nav.login": { bn: "লগইন", en: "Login" },
  "nav.register": { bn: "রেজিস্টার", en: "Register" },
  "nav.cart": { bn: "কার্ট", en: "Cart" },
  "nav.my_account": { bn: "আমার অ্যাকাউন্ট", en: "My Account" },
  "nav.logout": { bn: "লগআউট", en: "Logout" },
  "nav.admin": { bn: "অ্যাডমিন", en: "Admin" },
  "nav.search": { bn: "পণ্য খুঁজুন...", en: "Search products..." },

  // Hero
  "hero.title": { bn: "সেরা দামে অরিজিনাল মোবাইল ও গ্যাজেট", en: "Original Mobiles & Gadgets at Best Prices" },
  "hero.subtitle": { bn: "বাংলাদেশের বিশ্বস্ত মোবাইল শপ — ওয়ারেন্টি সহ", en: "Bangladesh's Trusted Mobile Shop — With Warranty" },
  "hero.shop_now": { bn: "এখনই কিনুন", en: "Shop Now" },
  "hero.view_offers": { bn: "অফার দেখুন", en: "View Offers" },

  // Categories
  "cat.smartphones": { bn: "স্মার্টফোন", en: "Smartphones" },
  "cat.feature_phones": { bn: "ফিচার ফোন", en: "Feature Phones" },
  "cat.accessories": { bn: "এক্সেসরিজ", en: "Accessories" },
  "cat.gadgets": { bn: "গ্যাজেট", en: "Gadgets" },
  "cat.earbuds": { bn: "ইয়ারবাড", en: "Earbuds" },
  "cat.chargers": { bn: "চার্জার", en: "Chargers" },
  "cat.covers": { bn: "ব্যাক কভার", en: "Back Covers" },
  "cat.digital": { bn: "ডিজিটাল প্রোডাক্ট", en: "Digital Products" },

  // Sections
  "section.featured": { bn: "ফিচার্ড পণ্য", en: "Featured Products" },
  "section.new_arrivals": { bn: "নতুন আগমন", en: "New Arrivals" },
  "section.best_sellers": { bn: "বেস্ট সেলার", en: "Best Sellers" },
  "section.categories": { bn: "ক্যাটাগরি সমূহ", en: "Browse Categories" },
  "section.why_us": { bn: "কেন আমাদের কাছ থেকে কিনবেন?", en: "Why Buy From Us?" },

  // Product
  "product.add_to_cart": { bn: "কার্টে যোগ করুন", en: "Add to Cart" },
  "product.buy_now": { bn: "এখনই কিনুন", en: "Buy Now" },
  "product.in_stock": { bn: "স্টকে আছে", en: "In Stock" },
  "product.out_of_stock": { bn: "স্টক আউট", en: "Out of Stock" },
  "product.price": { bn: "মূল্য", en: "Price" },
  "product.taka": { bn: "৳", en: "৳" },
  "product.details": { bn: "বিস্তারিত", en: "Details" },
  "product.reviews": { bn: "রিভিউ", en: "Reviews" },

  // Cart & Checkout
  "cart.title": { bn: "শপিং কার্ট", en: "Shopping Cart" },
  "cart.empty": { bn: "আপনার কার্ট খালি", en: "Your cart is empty" },
  "cart.total": { bn: "মোট", en: "Total" },
  "cart.checkout": { bn: "চেকআউট", en: "Checkout" },
  "cart.continue": { bn: "শপিং চালিয়ে যান", en: "Continue Shopping" },

  // Auth
  "auth.login_title": { bn: "লগইন করুন", en: "Login" },
  "auth.register_title": { bn: "অ্যাকাউন্ট তৈরি করুন", en: "Create Account" },
  "auth.email": { bn: "ইমেইল", en: "Email" },
  "auth.password": { bn: "পাসওয়ার্ড", en: "Password" },
  "auth.name": { bn: "পুরো নাম", en: "Full Name" },
  "auth.phone": { bn: "মোবাইল নম্বর", en: "Phone Number" },
  "auth.login_btn": { bn: "লগইন", en: "Login" },
  "auth.register_btn": { bn: "রেজিস্টার করুন", en: "Register" },
  "auth.no_account": { bn: "অ্যাকাউন্ট নেই?", en: "Don't have an account?" },
  "auth.have_account": { bn: "অ্যাকাউন্ট আছে?", en: "Already have an account?" },
  "auth.forgot_password": { bn: "পাসওয়ার্ড ভুলে গেছেন?", en: "Forgot Password?" },
  "auth.member_since": { bn: "সদস্য থেকে", en: "Member Since" },

  // Footer
  "footer.about": { bn: "আমাদের সম্পর্কে", en: "About Us" },
  "footer.about_text": { bn: "SB Mobile Shop — বাংলাদেশের বিশ্বস্ত অনলাইন মোবাইল ও গ্যাজেট শপ।", en: "SB Mobile Shop — Bangladesh's trusted online mobile & gadget shop." },
  "footer.quick_links": { bn: "দ্রুত লিংক", en: "Quick Links" },
  "footer.support": { bn: "সাপোর্ট", en: "Support" },
  "footer.privacy": { bn: "প্রাইভেসি পলিসি", en: "Privacy Policy" },
  "footer.terms": { bn: "শর্তাবলী", en: "Terms & Conditions" },
  "footer.refund": { bn: "রিফান্ড পলিসি", en: "Refund Policy" },
  "footer.shipping": { bn: "শিপিং তথ্য", en: "Shipping Info" },
  "footer.contact_us": { bn: "যোগাযোগ করুন", en: "Contact Us" },
  "footer.copyright": { bn: "© 2026 SB Mobile Shop. সর্বস্বত্ব সংরক্ষিত।", en: "© 2026 SB Mobile Shop. All rights reserved." },
  "footer.follow": { bn: "ফলো করুন", en: "Follow Us" },

  // Why us
  "why.warranty": { bn: "অফিসিয়াল ওয়ারেন্টি", en: "Official Warranty" },
  "why.warranty_desc": { bn: "সকল পণ্যে অফিসিয়াল ওয়ারেন্টি", en: "Official warranty on all products" },
  "why.delivery": { bn: "দ্রুত ডেলিভারি", en: "Fast Delivery" },
  "why.delivery_desc": { bn: "সারাদেশে দ্রুত ও নিরাপদ ডেলিভারি", en: "Fast & safe delivery nationwide" },
  "why.original": { bn: "১০০% অরিজিনাল", en: "100% Original" },
  "why.original_desc": { bn: "শুধুমাত্র অরিজিনাল পণ্য বিক্রি করি", en: "We only sell original products" },
  "why.support": { bn: "২৪/৭ সাপোর্ট", en: "24/7 Support" },
  "why.support_desc": { bn: "যেকোনো সময় সাহায্য নিন", en: "Get help anytime" },

  // Common
  "common.see_all": { bn: "সব দেখুন", en: "See All" },
  "common.loading": { bn: "লোড হচ্ছে...", en: "Loading..." },
  "common.language": { bn: "English", en: "বাংলা" },

  // Abandoned cart popup
  "popup.abandoned_title": { bn: "আপনার কার্টে পণ্য আছে!", en: "You have items in your cart!" },
  "popup.abandoned_desc": { bn: "আপনার অসম্পূর্ণ অর্ডারটি সম্পন্ন করুন", en: "Complete your pending order" },
  "popup.view_cart": { bn: "কার্ট দেখুন", en: "View Cart" },
  "popup.dismiss": { bn: "পরে", en: "Later" },

  // Admin
  "admin.dashboard": { bn: "ড্যাশবোর্ড", en: "Dashboard" },
  "admin.products": { bn: "পণ্য ব্যবস্থাপনা", en: "Products" },
  "admin.orders": { bn: "অর্ডার", en: "Orders" },
  "admin.customers": { bn: "কাস্টমার", en: "Customers" },
  "admin.settings": { bn: "সেটিংস", en: "Settings" },
  "admin.pos": { bn: "POS", en: "POS" },
  "admin.reports": { bn: "রিপোর্ট", en: "Reports" },
  "admin.bulk_email": { bn: "বাল্ক ইমেইল", en: "Bulk Email" },
  "admin.coupons": { bn: "কুপন", en: "Coupons" },
  "admin.shipping": { bn: "শিপিং", en: "Shipping" },
  "admin.payment_settings": { bn: "পেমেন্ট সেটিংস", en: "Payment Settings" },
  "admin.admin_mgmt": { bn: "অ্যাডমিন ব্যবস্থাপনা", en: "Admin Management" },
  "admin.landing_pages": { bn: "ল্যান্ডিং পেজ", en: "Landing Pages" },
  "admin.reviews": { bn: "রিভিউ", en: "Reviews" },
  "admin.spin_wheel": { bn: "স্পিন হুইল", en: "Spin Wheel" },
  "admin.live_chat": { bn: "লাইভ চ্যাট", en: "Live Chat" },
  "admin.delivery_zones": { bn: "ডেলিভারি জোন", en: "Delivery Zones" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("sb-language");
    return (saved === "en" || saved === "bn") ? saved : "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("sb-language", lang);
    document.documentElement.lang = lang;
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "bn" ? "en" : "bn");
  }, [language, setLanguage]);

  const t = useCallback((key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language];
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
