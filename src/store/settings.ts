import { create } from "zustand";

interface SiteSettings {
  shopNameEn: string;
  shopNameBn: string;
  phone: string;
  phone2: string;
  email: string;
  addressEn: string;
  addressBn: string;
  whatsapp: string;
  logoUrl: string;
  faviconUrl: string;
  heroBgUrl: string;
  heroTitle: string;
  heroSubtitleEn: string;
  heroSubtitleBn: string;
  heroTaglineEn: string;
  heroTaglineBn: string;
  heroCtaTextEn: string;
  heroCtaTextBn: string;
  heroVideoUrl: string;
  footerAboutEn: string;
  footerAboutBn: string;
  facebookUrl: string;
  messengerUrl: string;
  youtubeUrl: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  showHero: boolean;
  showCategories: boolean;
  showServices: boolean;
  showProducts: boolean;
  showPayment: boolean;
  showCourses: boolean;
  showTools: boolean;
  showWhyUs: boolean;
  showAbout: boolean;
  showContact: boolean;
}

const defaultSettings: SiteSettings = {
  shopNameEn: "SB Mobile Shop",
  shopNameBn: "SB মোবাইল শপ",
  phone: "01711791122",
  phone2: "01773243748",
  email: "sbmobileshop24@gmail.com",
  addressEn: "Al-Amin Super Market (2nd Floor), College Road, Beanibazar, Sylhet.",
  addressBn: "আল-আমিন সুপার মার্কেট (২য় তলা), কলেজ রোড, বিয়ানীবাজার, সিলেট।",
  whatsapp: "+8801773243748",
  logoUrl: "",
  faviconUrl: "",
  heroBgUrl: "https://sbmobile.shop/assets/images/hero-bg.jpg",
  heroTitle: "SB Mobile Shop",
  heroSubtitleEn: "Come and visit here for accessories & mobile repair",
  heroSubtitleBn: "আমাদের এখানে আসুন এক্সেসরিজ ও মোবাইল রিপেয়ারের জন্য",
  heroTaglineEn: "Home Delivery All Over Bangladesh",
  heroTaglineBn: "সারাদেশে হোম ডেলিভারি",
  heroCtaTextEn: "Order Now",
  heroCtaTextBn: "এখনই অর্ডার করুন",
  heroVideoUrl: "",
  footerAboutEn: "Bangladesh's trusted online mobile & gadget shop.",
  footerAboutBn: "বাংলাদেশের বিশ্বস্ত অনলাইন মোবাইল ও গ্যাজেট শপ।",
  facebookUrl: "https://www.facebook.com/sbmobileshopbb",
  messengerUrl: "http://m.me/sbmobileshopbb",
  youtubeUrl: "",
  bkashNumber: "01773243748",
  nagadNumber: "01773243748",
  rocketNumber: "01773243748",
  showHero: true,
  showCategories: true,
  showServices: true,
  showProducts: true,
  showPayment: true,
  showCourses: true,
  showTools: true,
  showWhyUs: true,
  showAbout: true,
  showContact: true,
};

interface SettingsStore {
  settings: SiteSettings;
  language: "en" | "bn";
  setSettings: (settings: Partial<SiteSettings>) => void;
  toggleLanguage: () => void;
}

export const useSettings = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  language: "bn",
  
  setSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
    
  toggleLanguage: () =>
    set((state) => ({
      language: state.language === "en" ? "bn" : "en",
    })),
}));
