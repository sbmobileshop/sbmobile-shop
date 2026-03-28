"use client";

import React, { useState, useMemo } from "react";
import { useSettings } from "@/store/settings";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Search,
  ShieldCheck,
  CreditCard,
  Cake,
  Apple,
  KeyRound,
  Star,
  Smartphone,
  Unlock,
  Bot,
  Camera,
  Globe,
  TabletSmartphone,
  Image,
  Moon,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

const iconMap: Record<string, React.ElementType> = {
  ShieldCheck,
  CreditCard,
  Cake,
  Apple,
  KeyRound,
  Wrench,
  Star,
  Smartphone,
  Unlock,
  Bot,
  Camera,
  Globe,
  TabletSmartphone,
  Image,
  Moon,
  Users,
};

const defaultTools = [
  { title: "SB Fraud Checker", titleBn: "ফ্রড চেকার", link: "/fraud-checker", icon: "ShieldCheck", btn: "Check Now", btnBn: "চেক করুন" },
  { title: "Student ID Card Maker", titleBn: "স্টুডেন্ট আইডি কার্ড", link: "#", icon: "CreditCard", btn: "Use Tool", btnBn: "ব্যবহার করুন" },
  { title: "Birthday Wish Template", titleBn: "জন্মদিনের শুভেচ্ছা", link: "#", icon: "Cake", btn: "Use Template", btnBn: "টেমপ্লেট" },
  { title: "Apple ID Slip Create", titleBn: "Apple ID স্লিপ", link: "#", icon: "Apple", btn: "Generate Slip", btnBn: "স্লিপ তৈরি" },
  { title: "Apple ID Pass Card", titleBn: "Apple ID পাস কার্ড", link: "#", icon: "KeyRound", btn: "Generate Pass", btnBn: "পাস তৈরি" },
  { title: "SB Web Tools", titleBn: "SB ওয়েব টুলস", link: "#", icon: "Wrench", btn: "Explore Tools", btnBn: "টুলস দেখুন" },
  { title: "Premium Service HUB", titleBn: "প্রিমিয়াম সার্ভিস", link: "#", icon: "Star", btn: "Visit HUB", btnBn: "HUB দেখুন" },
  { title: "Order New Apple ID", titleBn: "Apple ID অর্ডার", link: "#", icon: "Smartphone", btn: "Order Now", btnBn: "অর্ডার করুন" },
  { title: "iCloud Bypass Tool", titleBn: "iCloud বাইপাস", link: "#", icon: "Unlock", btn: "Submit Order", btnBn: "অর্ডার দিন" },
  { title: "SB AI Chat Support", titleBn: "AI চ্যাট সাপোর্ট", link: "#", icon: "Bot", btn: "Chat Now", btnBn: "চ্যাট করুন" },
  { title: "QR Code Generator", titleBn: "QR কোড জেনারেটর", link: "#", icon: "Camera", btn: "Generate QR", btnBn: "QR তৈরি" },
  { title: "IP Checker & Network Info", titleBn: "IP চেকার", link: "#", icon: "Globe", btn: "Check IP", btnBn: "চেক করুন" },
  { title: "Text Finder (Ctrl+F)", titleBn: "টেক্সট ফাইন্ডার", link: "#", icon: "Search", btn: "Find Text", btnBn: "খুঁজুন" },
  { title: "iPhone Model Variant", titleBn: "iPhone মডেল চেক", link: "#", icon: "TabletSmartphone", btn: "Check Variant", btnBn: "চেক করুন" },
  { title: "Wallpaper Studio", titleBn: "ওয়ালপেপার স্টুডিও", link: "#", icon: "Image", btn: "Get Wallpapers", btnBn: "ডাউনলোড" },
  { title: "Photo ID Card Maker", titleBn: "ফটো আইডি কার্ড", link: "#", icon: "Camera", btn: "Make Card", btnBn: "কার্ড তৈরি" },
  { title: "Ramadan Calendar 2026", titleBn: "রমজান ক্যালেন্ডার", link: "#", icon: "Moon", btn: "View Calendar", btnBn: "ক্যালেন্ডার" },
  { title: "Untik Followers Manager", titleBn: "Untik ফলোয়ার্স", link: "#", icon: "Users", btn: "Manage Now", btnBn: "ম্যানেজ" },
];

const ToolsSection = () => {
  const { language } = useSettings();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return defaultTools;
    const q = search.toLowerCase();
    return defaultTools.filter(
      (t) => t.title.toLowerCase().includes(q) || t.titleBn.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <section className="py-16 px-4 bg-muted/30" id="tools">
      <div className="container mx-auto">
        <div className="text-center animate-on-scroll mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {language === "bn" ? "আমাদের ওয়েব টুলস" : "Our Web Tools"}
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            {language === "bn" ? "স্টুডেন্ট ও কাস্টমারদের জন্য দরকারী টুলস" : "Useful tools for students and customers"}
          </p>
        </div>

        <div className="max-w-md mx-auto mt-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === "bn" ? "টুলস খুঁজুন এখানে..." : "Search tools here..."}
              className="w-full pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((tool, i) => {
              const IconComp = iconMap[tool.icon] || Wrench;
              return (
                <motion.div
                  key={tool.title}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="tool-card-styled"
                >
                  <div className="tool-icon flex items-center justify-center">
                    <IconComp className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {language === "bn" ? tool.titleBn : tool.title}
                  </h3>
                  {tool.link.startsWith("/") ? (
                    <button
                      onClick={() => router.push(tool.link)}
                      className="tool-btn"
                    >
                      {language === "bn" ? tool.btnBn : tool.btn}
                    </button>
                  ) : (
                    <a
                      href={tool.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tool-btn"
                    >
                      {language === "bn" ? tool.btnBn : tool.btn}
                    </a>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
              {language === "bn" ? "কোনো টুল পাওয়া যায়নি" : "No tools found"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
