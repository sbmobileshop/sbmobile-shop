"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/store/settings";
import { useCart } from "@/store/cart";
import {
  Search,
  Globe,
  ShoppingCart,
  Menu,
  X,
  User,
  Home,
  Wrench,
  Package,
  CreditCard,
  MapPin,
  GraduationCap,
  Settings,
  Info,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const { settings, language, toggleLanguage } = useSettings();
  const { items } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navItems = [
    { label: "Home", labelBn: "হোম", path: "/", icon: Home },
    { label: "Services", labelBn: "সেবা", path: "#services", icon: Wrench },
    { label: "Products", labelBn: "পণ্য", path: "#products", icon: Package },
    { label: "Payment", labelBn: "পেমেন্ট", path: "#payment", icon: CreditCard },
    { label: "Track Order", labelBn: "ট্র্যাক", path: "/order-tracking", icon: MapPin },
    { label: "Courses", labelBn: "কোর্স", path: "#courses", icon: GraduationCap },
    { label: "Tools", labelBn: "টুলস", path: "#tools", icon: Settings },
    { label: "About Us", labelBn: "আমাদের সম্পর্কে", path: "#about", icon: Info },
    { label: "Contact", labelBn: "যোগাযোগ", path: "#contact", icon: Phone },
  ];

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith("#")) {
      const el = document.querySelector(path);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <div className="gradient-bar" />
      <header className="fixed top-[5px] left-0 right-0 z-50 bg-card shadow-md" style={{ top: 'calc(5px + env(safe-area-inset-top, 0px))' }}>
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #e63946, #1d3557)' }}>
                  <span className="font-english font-bold text-white text-sm sm:text-lg">SB</span>
                </div>
              )}
              <span className="font-english font-bold text-sm sm:text-xl whitespace-nowrap" style={{ color: '#e63946' }}>
                {settings.shopNameEn}
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className="px-2.5 xl:px-3 py-2 text-[13px] xl:text-[14px] font-semibold text-foreground/80 hover:text-accent rounded-lg transition-colors whitespace-nowrap"
                  >
                    {language === "bn" ? item.labelBn : item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-foreground/70 hover:text-accent transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
              
              <button
                onClick={toggleLanguage}
                className="p-2 text-foreground/70 hover:text-accent transition-colors"
              >
                <Globe className="h-5 w-5" />
              </button>

              <Link href="/cart" className="p-2 text-foreground/70 hover:text-accent transition-colors relative">
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center text-white" style={{ background: '#e63946' }}>
                    {items.length}
                  </span>
                )}
              </Link>

              <Link href="/login" className="p-2 text-foreground/70 hover:text-accent transition-colors">
                <User className="h-5 w-5" />
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-foreground/70 hover:text-accent"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <form onSubmit={handleSearch} className="pb-3 animate-fade-in">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === "bn" ? "পণ্য খুঁজুন..." : "Search products..."}
                className="w-full"
                autoFocus
              />
            </form>
          )}
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-border bg-card animate-fade-in max-h-[70vh] overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-base font-semibold text-foreground/85 hover:text-accent hover:bg-muted/50 border-b border-border/50 transition-colors"
                >
                  <Icon className="h-5 w-5 text-accent shrink-0" />
                  <span>{language === "bn" ? item.labelBn : item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </header>
      <div className="h-[70px]" />
    </>
  );
};

export default Header;
