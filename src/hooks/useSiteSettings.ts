import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteInfo {
  shop_name_en: string;
  shop_name_bn: string;
  phone: string;
  phone2: string;
  email: string;
  address_en: string;
  address_bn: string;
  whatsapp: string;
  logo_url: string;
  favicon_url: string;
}

export interface BannerSettings {
  banner_text_bn: string;
  banner_text_en: string;
  banner_enabled: boolean;
  facebook_page: string;
  messenger_link: string;
  meta_pixel_id: string;
  notice_text_bn: string;
  notice_text_en: string;
  notice_enabled: boolean;
}

export interface HeroSettings {
  hero_bg_url: string;
  hero_title: string;
  hero_subtitle_en: string;
  hero_subtitle_bn: string;
  hero_tagline_en: string;
  hero_tagline_bn: string;
  hero_cta_text_en: string;
  hero_cta_text_bn: string;
  hero_cta_link: string;
  hero_video_url: string;
}

export interface FooterSettings {
  footer_about_en: string;
  footer_about_bn: string;
  facebook_url: string;
  messenger_url: string;
  whatsapp_url: string;
  youtube_url: string;
  instagram_url: string;
  google_maps_url: string;
}

export interface SectionVisibility {
  show_hero: boolean;
  show_categories: boolean;
  show_services: boolean;
  show_products: boolean;
  show_payment: boolean;
  show_courses: boolean;
  show_tools: boolean;
  show_why_us: boolean;
  show_about: boolean;
  show_contact: boolean;
  show_reviews: boolean;
  show_pwa_prompt: boolean;
  show_delivery: boolean;
  show_onboarding: boolean;
}

export interface PaymentSettings {
  bkash_number: string;
  nagad_number: string;
  rocket_number: string;
  binance_name: string;
  binance_id: string;
  bkash_enabled: boolean;
  nagad_enabled: boolean;
  rocket_enabled: boolean;
  binance_enabled: boolean;
}

export interface DeliverySettings {
  title_en: string;
  title_bn: string;
  desc_en: string;
  desc_bn: string;
  image_url: string;
  phone_primary: string;
  phone_bkash: string;
  cta_text_en: string;
  cta_text_bn: string;
  cta_link: string;
}

export interface ToolItem {
  title: string;
  title_bn: string;
  link: string;
  icon: string;
  btn: string;
  btn_bn: string;
}

export interface ServiceItem {
  title: string;
  title_bn: string;
  desc: string;
  desc_bn: string;
  icon: string;
}

export interface CourseItem {
  title_en: string;
  title_bn: string;
  desc_en: string;
  desc_bn: string;
  link: string;
  image: string;
}

export interface CategoryItem {
  value: string;
  label: string;
  label_bn: string;
  icon: string;
  color: string;
}

// Defaults
export const defaultSiteInfo: SiteInfo = {
  shop_name_en: "SB Mobile Shop",
  shop_name_bn: "SB মোবাইল শপ",
  phone: "01711791122",
  phone2: "01773243748",
  email: "sbmobileshop24@gmail.com",
  address_en: "Al-Amin Super Market (2nd Floor), College Road, Beanibazar, Sylhet.",
  address_bn: "আল-আমিন সুপার মার্কেট (২য় তলা), কলেজ রোড, বিয়ানীবাজার, সিলেট।",
  whatsapp: "+8801773243748",
  logo_url: "",
  favicon_url: "",
};

export const defaultBanner: BannerSettings = {
  banner_text_bn: "সারাদেশে ফ্রি ডেলিভারি ৫,০০০৳+ অর্ডারে!",
  banner_text_en: "Free delivery nationwide on orders above ৳5,000!",
  banner_enabled: true,
  facebook_page: "https://www.facebook.com/sbmobileshopbb",
  messenger_link: "http://m.me/sbmobileshopbb",
  meta_pixel_id: "",
  notice_text_bn: "আমাদের নতুন কালেকশন দেখুন!",
  notice_text_en: "Check out our new collection!",
  notice_enabled: false,
};

export const defaultHero: HeroSettings = {
  hero_bg_url: "https://sbmobile.shop/assets/images/hero-bg.jpg",
  hero_title: "SB Mobile Shop",
  hero_subtitle_en: "Come and visit here for accessories & mobile repair",
  hero_subtitle_bn: "আমাদের এখানে আসুন এক্সেসরিজ ও মোবাইল রিপেয়ারের জন্য",
  hero_tagline_en: "Home Delivery All Over Bangladesh",
  hero_tagline_bn: "সারাদেশে হোম ডেলিভারি",
  hero_cta_text_en: "Order Now",
  hero_cta_text_bn: "এখনই অর্ডার করুন",
  hero_cta_link: "https://m.me/sbmobileshopbb",
  hero_video_url: "",
};

export const defaultFooter: FooterSettings = {
  footer_about_en: "Bangladesh's trusted online mobile & gadget shop.",
  footer_about_bn: "বাংলাদেশের বিশ্বস্ত অনলাইন মোবাইল ও গ্যাজেট শপ।",
  facebook_url: "https://www.facebook.com/sbmobileshopbb",
  messenger_url: "http://m.me/sbmobileshopbb",
  whatsapp_url: "https://wa.me/+8801773243748",
  youtube_url: "",
  instagram_url: "",
  google_maps_url: "https://www.google.com/maps/place/S.B+Mobile+shop+%26+Computer/@24.8212112,92.1586776,21z",
};

export const defaultVisibility: SectionVisibility = {
  show_hero: true,
  show_categories: true,
  show_services: true,
  show_products: true,
  show_payment: true,
  show_courses: true,
  show_tools: true,
  show_why_us: true,
  show_about: true,
  show_contact: true,
  show_reviews: false,
  show_pwa_prompt: true,
  show_delivery: true,
  show_onboarding: false,
};

export const defaultPayment: PaymentSettings = {
  bkash_number: "01773243748",
  nagad_number: "01773243748",
  rocket_number: "01773243748",
  binance_name: "MD Shibrul Alom",
  binance_id: "814381686",
  bkash_enabled: true,
  nagad_enabled: true,
  rocket_enabled: true,
  binance_enabled: true,
};

export const defaultDelivery: DeliverySettings = {
  title_en: "Home Delivery Service",
  title_bn: "হোম ডেলিভারি সার্ভিস",
  desc_en: "We provide home delivery all over Bangladesh. Contact us for details.",
  desc_bn: "আমরা সারা বাংলাদেশে হোম ডেলিভারি দিয়ে থাকি। বিস্তারিত জানতে যোগাযোগ করুন।",
  image_url: "https://sbmobile.shop/assets/images/delivery_poster.JPG",
  phone_primary: "+88 01711-791122",
  phone_bkash: "+88 01773 243 748",
  cta_text_en: "Shop Now",
  cta_text_bn: "এখনই কিনুন",
  cta_link: "/products",
};

export const defaultTools: ToolItem[] = [
  { title: "SB Fraud Checker", title_bn: "ফ্রড চেকার", link: "/fraud-checker", icon: "ShieldCheck", btn: "Check Now", btn_bn: "চেক করুন" },
  { title: "Student ID Card Maker", title_bn: "স্টুডেন্ট আইডি কার্ড", link: "https://www.canva.com/design/DAGMvdd-EqQ/o1OZl2-wOeZkUYlw5wkpKQ/view", icon: "IdCard", btn: "Use Tool", btn_bn: "ব্যবহার করুন" },
  { title: "Birthday Wish Template", title_bn: "জন্মদিনের শুভেচ্ছা", link: "https://www.canva.com/design/DAGoK69ziBY/EKXd91R1-42eLa4dwp9BaA/view", icon: "Cake", btn: "Use Template", btn_bn: "টেমপ্লেট" },
  { title: "Apple ID Slip Create", title_bn: "Apple ID স্লিপ", link: "https://sb-aple-id-database-redirect.netlify.app/", icon: "Apple", btn: "Generate Slip", btn_bn: "স্লিপ তৈরি" },
  { title: "Apple ID Pass Card", title_bn: "Apple ID পাস কার্ড", link: "https://pass-card-gen-byshibrul.netlify.app/", icon: "KeyRound", btn: "Generate Pass", btn_bn: "পাস তৈরি" },
  { title: "SB Web Tools", title_bn: "SB ওয়েব টুলস", link: "https://sbwebtools.netlify.app/", icon: "Wrench", btn: "Explore Tools", btn_bn: "টুলস দেখুন" },
  { title: "Premium Service HUB", title_bn: "প্রিমিয়াম সার্ভিস", link: "https://premium-service-hub.netlify.app/", icon: "Star", btn: "Visit HUB", btn_bn: "HUB দেখুন" },
  { title: "Order New Apple ID", title_bn: "Apple ID অর্ডার", link: "https://script.google.com/macros/s/AKfycby7JQBIJYbN-_WqhBpntiHUsVauciP3Wh0bhZh0McXj3ONrnQ7c5cvPgXFah3Z7I2RVgw/exec", icon: "Smartphone", btn: "Order Now", btn_bn: "অর্ডার করুন" },
  { title: "iCloud Bypass Tool", title_bn: "iCloud বাইপাস", link: "https://bypass-server-order.netlify.app/", icon: "Unlock", btn: "Submit Order", btn_bn: "অর্ডার দিন" },
  { title: "SB AI Chat Support", title_bn: "AI চ্যাট সাপোর্ট", link: "https://sbaichat.netlify.app/", icon: "Bot", btn: "Chat Now", btn_bn: "চ্যাট করুন" },
  { title: "QR Code Generator", title_bn: "QR কোড জেনারেটর", link: "https://qr-gen-its.netlify.app/", icon: "Camera", btn: "Generate QR", btn_bn: "QR তৈরি" },
  { title: "IP Checker & Network Info", title_bn: "IP চেকার", link: "https://sn-check-ip.netlify.app/", icon: "Globe", btn: "Check IP", btn_bn: "চেক করুন" },
  { title: "Text Finder (Ctrl+F)", title_bn: "টেক্সট ফাইন্ডার", link: "https://text-tool-ctrlf.netlify.app/", icon: "Search", btn: "Find Text", btn_bn: "খুঁজুন" },
  { title: "iPhone Model Variant", title_bn: "iPhone মডেল চেক", link: "https://iphone-variant.netlify.app/", icon: "TabletSmartphone", btn: "Check Variant", btn_bn: "চেক করুন" },
  { title: "Wallpaper Studio", title_bn: "ওয়ালপেপার স্টুডিও", link: "https://wallpaperbyits.netlify.app/", icon: "Image", btn: "Get Wallpapers", btn_bn: "ডাউনলোড" },
  { title: "Photo ID Card Maker", title_bn: "ফটো আইডি কার্ড", link: "https://photo-card-maker.netlify.app/", icon: "CameraIcon", btn: "Make Card", btn_bn: "কার্ড তৈরি" },
  { title: "Ramadan Calendar 2026", title_bn: "রমজান ক্যালেন্ডার", link: "https://ramadan2026cal.netlify.app/", icon: "Moon", btn: "View Calendar", btn_bn: "ক্যালেন্ডার" },
  { title: "Untik Followers Manager", title_bn: "Untik ফলোয়ার্স", link: "https://untik-following-tool.netlify.app/", icon: "Users", btn: "Manage Now", btn_bn: "ম্যানেজ" },
];

export const defaultServices: ServiceItem[] = [
  { title: "Mobile Repair", title_bn: "মোবাইল রিপেয়ার", desc: "Software and hardware problem solving for all mobile brands with warranty and quality assurance.", desc_bn: "সফটওয়্যার ও হার্ডওয়্যার সমস্যার সমাধান — ওয়ারেন্টি সহ", icon: "Wrench" },
  { title: "Accessories", title_bn: "এক্সেসরিজ", desc: "High-quality mobile accessories at competitive prices with original products.", desc_bn: "সেরা মানের মোবাইল এক্সেসরিজ — সেরা দামে", icon: "ShoppingBag" },
  { title: "Home Delivery", title_bn: "হোম ডেলিভারি", desc: "Fast and reliable delivery service across Bangladesh with secure packaging.", desc_bn: "সারাদেশে দ্রুত ও নিরাপদ ডেলিভারি", icon: "Truck" },
];

export const defaultCourses: CourseItem[] = [
  { title_en: "Mobile Hardware Repair Course", title_bn: "মোবাইল হার্ডওয়্যার রিপেয়ার কোর্স", desc_en: "Comprehensive training on mobile hardware troubleshooting and repair.", desc_bn: "মোবাইল হার্ডওয়্যার ট্রাবলশুটিং ও রিপেয়ার টেকনিক শিখুন।", link: "https://youtu.be/mOuwf_5uoWE?si=L2IOsdHZkFMfjguJ", image: "https://sbmobile.shop/assets/images/course1.png" },
  { title_en: "Mobile Software Course", title_bn: "মোবাইল সফটওয়্যার কোর্স", desc_en: "Master mobile software troubleshooting, flashing, and advanced techniques.", desc_bn: "মোবাইল সফটওয়্যার, ফ্ল্যাশিং ও অ্যাডভান্সড টেকনিক শিখুন।", link: "https://youtu.be/qM5DKr9ioKI?si=LNQ2IwwhF1t8jyUW", image: "https://sbmobile.shop/assets/images/course2.png" },
  { title_en: "Advanced Mobile Engineering", title_bn: "অ্যাডভান্সড মোবাইল ইঞ্জিনিয়ারিং", desc_en: "For experienced technicians looking to master advanced repair techniques.", desc_bn: "অভিজ্ঞ টেকনিশিয়ানদের জন্য অ্যাডভান্সড রিপেয়ার টেকনিক।", link: "https://youtu.be/s4VqqemcdYo?si=dSsXXHlQEeg2qTuK", image: "https://sbmobile.shop/assets/images/course3.png" },
];

// Cache
let settingsCache: Record<string, any> = {};
let cacheTime = 0;
const CACHE_TTL = 30000;

export function useSiteSettings() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(defaultSiteInfo);
  const [banner, setBanner] = useState<BannerSettings>(defaultBanner);
  const [hero, setHero] = useState<HeroSettings>(defaultHero);
  const [footer, setFooter] = useState<FooterSettings>(defaultFooter);
  const [visibility, setVisibility] = useState<SectionVisibility>(defaultVisibility);
  const [payment, setPayment] = useState<PaymentSettings>(defaultPayment);
  const [delivery, setDelivery] = useState<DeliverySettings>(defaultDelivery);
  const [tools, setTools] = useState<ToolItem[]>(defaultTools);
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);
  const [courses, setCourses] = useState<CourseItem[]>(defaultCourses);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const now = Date.now();
    if (settingsCache._loaded && now - cacheTime < CACHE_TTL) {
      if (settingsCache.site_info) setSiteInfo({ ...defaultSiteInfo, ...settingsCache.site_info });
      if (settingsCache.banner_offers) setBanner({ ...defaultBanner, ...settingsCache.banner_offers });
      if (settingsCache.hero_settings) setHero({ ...defaultHero, ...settingsCache.hero_settings });
      if (settingsCache.footer_settings) setFooter({ ...defaultFooter, ...settingsCache.footer_settings });
      if (settingsCache.section_visibility) setVisibility({ ...defaultVisibility, ...settingsCache.section_visibility });
      if (settingsCache.payment_settings) setPayment({ ...defaultPayment, ...settingsCache.payment_settings });
      if (settingsCache.delivery_settings) setDelivery({ ...defaultDelivery, ...settingsCache.delivery_settings });
      if (settingsCache.tools_list) setTools(settingsCache.tools_list);
      if (settingsCache.services_list) setServices(settingsCache.services_list);
      if (settingsCache.courses_list) setCourses(settingsCache.courses_list);
      setLoaded(true);
      return;
    }

    supabase.from("site_settings").select("setting_key, setting_value").then(({ data }) => {
      if (data) {
        const map: Record<string, any> = {};
        data.forEach((row: any) => { map[row.setting_key] = row.setting_value; });
        settingsCache = { ...map, _loaded: true };
        cacheTime = Date.now();

        if (map.site_info) setSiteInfo({ ...defaultSiteInfo, ...map.site_info });
        if (map.banner_offers) setBanner({ ...defaultBanner, ...map.banner_offers });
        if (map.hero_settings) setHero({ ...defaultHero, ...map.hero_settings });
        if (map.footer_settings) setFooter({ ...defaultFooter, ...map.footer_settings });
        if (map.section_visibility) setVisibility({ ...defaultVisibility, ...map.section_visibility });
        if (map.payment_settings) setPayment({ ...defaultPayment, ...map.payment_settings });
        if (map.delivery_settings) setDelivery({ ...defaultDelivery, ...map.delivery_settings });
        if (map.tools_list) setTools(map.tools_list);
        if (map.services_list) setServices(map.services_list);
        if (map.courses_list) setCourses(map.courses_list);
      }
      setLoaded(true);
    });
  }, []);

  return { siteInfo, banner, hero, footer, visibility, payment, delivery, tools, services, courses, loaded };
}

export function invalidateSettingsCache() {
  settingsCache = {};
  cacheTime = 0;
}
