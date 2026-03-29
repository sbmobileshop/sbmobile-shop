import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSound } from "@/contexts/SoundContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  ShoppingCart, Menu, X, Search, Globe, User, LogOut, Shield, UserCircle,
  Home, Wrench, Package, CreditCard, MapPin, GraduationCap, Settings, Info, Phone, MessageCircle,
  Volume2, VolumeX
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header: React.FC = () => {
  const { t, toggleLanguage, language } = useLanguage();
  const { totalItems } = useCart();
  const { user, isAdmin, profile, signOut } = useAuth();
  const { siteInfo } = useSiteSettings();
  const { muted, toggleMute } = useSound();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", label_bn: "হোম", path: "#home", icon: Home },
    { label: "Services", label_bn: "সেবা", path: "#services", icon: Wrench },
    { label: "Products", label_bn: "পণ্য", path: "#products", icon: Package },
    { label: "Payment", label_bn: "পেমেন্ট", path: "#payment", icon: CreditCard },
    { label: "Track Order", label_bn: "ট্র্যাক", path: "/order-tracking", icon: MapPin },
    { label: "Courses", label_bn: "কোর্স", path: "#courses", icon: GraduationCap },
    { label: "Tools", label_bn: "টুলস", path: "#tools", icon: Settings },
    { label: "About Us", label_bn: "আমাদের সম্পর্কে", path: "#about", icon: Info },
    { label: "Live Chat", label_bn: "লাইভ চ্যাট", path: "#live-chat", icon: MessageCircle },
    { label: "Contact", label_bn: "যোগাযোগ", path: "#contact", icon: Phone },
  ];

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    if (path === "#live-chat") {
      window.dispatchEvent(new CustomEvent("open-live-chat"));
      return;
    }
    if (path.startsWith("/")) {
      navigate(path);
      return;
    }
    if (path.startsWith("#")) {
      const el = document.querySelector(path);
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else { navigate("/"); setTimeout(() => { document.querySelector(path)?.scrollIntoView({ behavior: "smooth" }); }, 300); }
    } else navigate(path);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchExpanded(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <div className="gradient-bar" />
      <header className="fixed top-[5px] left-0 right-0 z-50 bg-card shadow-md transition-all" style={{ top: 'calc(5px + env(safe-area-inset-top, 0px))' }}>
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo - show full name on mobile */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {siteInfo.logo_url ? (
                <img src={siteInfo.logo_url} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #e63946, #1d3557)' }}>
                  <span className="font-english font-bold text-white text-sm sm:text-lg">SB</span>
                </div>
              )}
              <span className="font-english font-bold text-sm sm:text-xl whitespace-nowrap" style={{ color: '#e63946' }}>
                {siteInfo.shop_name_en || 'SB Mobile Shop'}
              </span>
            </Link>

            {/* Desktop nav - single line, no borders, proper spacing */}
            <nav className="hidden lg:flex items-center gap-0">
              {navItems.map(item => (
                <button key={item.path} onClick={() => handleNav(item.path)}
                  className="px-2.5 xl:px-3 py-2 text-[13px] xl:text-[14px] font-semibold text-foreground/80 hover:text-accent rounded-lg transition-colors whitespace-nowrap">
                  {language === "bn" ? item.label_bn : item.label}
                </button>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-0.5">
              <button onClick={() => setSearchExpanded(!searchExpanded)} className="p-2 text-foreground/70 hover:text-accent transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button onClick={toggleLanguage} className="p-2 text-foreground/70 hover:text-accent transition-colors">
                <Globe className="h-5 w-5" />
              </button>

              <button onClick={() => navigate("/cart")} className="p-2 text-foreground/70 hover:text-accent transition-colors relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center text-white" style={{ background: '#e63946' }}>
                    {totalItems}
                  </span>
                )}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 text-foreground/70 hover:text-accent transition-colors">
                    {user && profile?.avatar_url ? (
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={profile.avatar_url} alt="Profile" />
                        <AvatarFallback className="text-xs">{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Mute/Unmute toggle */}
                  <DropdownMenuItem onClick={toggleMute}>
                    {muted ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
                    {muted ? "Unmute Sound" : "Mute Sound"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user ? (
                    <>
                      <div className="px-3 py-2 text-sm">
                        <p className="font-medium">{profile?.full_name || user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          <Shield className="h-4 w-4 mr-2" /> Admin Panel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => navigate("/profile")}>
                        <UserCircle className="h-4 w-4 mr-2" /> {language === "bn" ? "প্রোফাইল" : "Profile"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }}>
                        <LogOut className="h-4 w-4 mr-2" /> {language === "bn" ? "লগআউট" : "Logout"}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/login")}>{language === "bn" ? "লগইন" : "Login"}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/register")}>{language === "bn" ? "রেজিস্টার" : "Register"}</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-foreground/70 hover:text-accent">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {searchExpanded && (
            <form onSubmit={handleSearch} className="pb-3 animate-fade-in">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder={language === "bn" ? "পণ্য খুঁজুন..." : "Search products..."}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-base focus:outline-none focus:border-accent transition-colors" />
            </form>
          )}
        </div>

        {/* Mobile menu with icons */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-border bg-card animate-fade-in max-h-[70vh] overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.path} onClick={() => handleNav(item.path)}
                  className="flex items-center gap-3 w-full text-left px-5 py-3.5 text-base font-semibold text-foreground/85 hover:text-accent hover:bg-muted/50 border-b border-border/50 transition-colors">
                  <Icon className="h-5 w-5 text-accent shrink-0" />
                  <span>{language === "bn" ? item.label_bn : item.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </header>
    </>
  );
};

export default Header;
