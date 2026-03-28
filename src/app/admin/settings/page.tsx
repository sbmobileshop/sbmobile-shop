"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, Image, Globe, Phone, Mail, MapPin, CreditCard, Settings, Eye, EyeOff } from "lucide-react";

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
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setSettings({ ...defaultSettings, ...data });
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      toast.error("Error saving settings");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof SiteSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "hero", label: "Hero Section", icon: Image },
    { id: "footer", label: "Footer", icon: Globe },
    { id: "payment", label: "Payment", icon: CreditCard },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
        <Button onClick={handleSave} disabled={loading} className="btn-gradient gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "general" && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Shop Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Shop Name (English)
                  </label>
                  <Input
                    value={settings.shopNameEn}
                    onChange={(e) => updateField("shopNameEn", e.target.value)}
                    placeholder="SB Mobile Shop"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Shop Name (Bangla)
                  </label>
                  <Input
                    value={settings.shopNameBn}
                    onChange={(e) => updateField("shopNameBn", e.target.value)}
                    placeholder="SB মোবাইল শপ"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Primary Phone
                  </label>
                  <Input
                    value={settings.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="01711791122"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Secondary Phone
                  </label>
                  <Input
                    value={settings.phone2}
                    onChange={(e) => updateField("phone2", e.target.value)}
                    placeholder="01773243748"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="sbmobileshop24@gmail.com"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Address (English)
                </label>
                <Input
                  value={settings.addressEn}
                  onChange={(e) => updateField("addressEn", e.target.value)}
                  placeholder="Full address in English"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Address (Bangla)
                </label>
                <Input
                  value={settings.addressBn}
                  onChange={(e) => updateField("addressBn", e.target.value)}
                  placeholder="পূর্ণ ঠিকানা বাংলায়"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">WhatsApp Number</label>
                <Input
                  value={settings.whatsapp}
                  onChange={(e) => updateField("whatsapp", e.target.value)}
                  placeholder="+8801773243748"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Logo & Favicon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Logo URL</label>
                <Input
                  value={settings.logoUrl}
                  onChange={(e) => updateField("logoUrl", e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-muted-foreground mt-1">Recommended size: 200x200px</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Favicon URL</label>
                <Input
                  value={settings.faviconUrl}
                  onChange={(e) => updateField("faviconUrl", e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "hero" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Hero Section Settings
            </CardTitle>
            <CardDescription>Configure the main hero section on your homepage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Hero Title</label>
              <Input
                value={settings.heroTitle}
                onChange={(e) => updateField("heroTitle", e.target.value)}
                placeholder="SB Mobile Shop"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Subtitle (English)
                </label>
                <Input
                  value={settings.heroSubtitleEn}
                  onChange={(e) => updateField("heroSubtitleEn", e.target.value)}
                  placeholder="Come and visit here..."
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Subtitle (Bangla)
                </label>
                <Input
                  value={settings.heroSubtitleBn}
                  onChange={(e) => updateField("heroSubtitleBn", e.target.value)}
                  placeholder="আমাদের এখানে আসুন..."
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Tagline (English)
                </label>
                <Input
                  value={settings.heroTaglineEn}
                  onChange={(e) => updateField("heroTaglineEn", e.target.value)}
                  placeholder="Home Delivery All Over Bangladesh"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Tagline (Bangla)
                </label>
                <Input
                  value={settings.heroTaglineBn}
                  onChange={(e) => updateField("heroTaglineBn", e.target.value)}
                  placeholder="সারাদেশে হোম ডেলিভারি"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  CTA Button (English)
                </label>
                <Input
                  value={settings.heroCtaTextEn}
                  onChange={(e) => updateField("heroCtaTextEn", e.target.value)}
                  placeholder="Order Now"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  CTA Button (Bangla)
                </label>
                <Input
                  value={settings.heroCtaTextBn}
                  onChange={(e) => updateField("heroCtaTextBn", e.target.value)}
                  placeholder="এখনই অর্ডার করুন"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Background Image URL</label>
              <Input
                value={settings.heroBgUrl}
                onChange={(e) => updateField("heroBgUrl", e.target.value)}
                placeholder="https://example.com/hero-bg.jpg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Background Video URL (Optional)</label>
              <Input
                value={settings.heroVideoUrl}
                onChange={(e) => updateField("heroVideoUrl", e.target.value)}
                placeholder="https://example.com/hero-video.mp4"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "footer" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Footer Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                About Text (English)
              </label>
              <Input
                value={settings.footerAboutEn}
                onChange={(e) => updateField("footerAboutEn", e.target.value)}
                placeholder="Bangladesh's trusted online mobile & gadget shop."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                About Text (Bangla)
              </label>
              <Input
                value={settings.footerAboutBn}
                onChange={(e) => updateField("footerAboutBn", e.target.value)}
                placeholder="বাংলাদেশের বিশ্বস্ত অনলাইন মোবাইল ও গ্যাজেট শপ।"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Facebook Page URL</label>
              <Input
                value={settings.facebookUrl}
                onChange={(e) => updateField("facebookUrl", e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Messenger Link</label>
              <Input
                value={settings.messengerUrl}
                onChange={(e) => updateField("messengerUrl", e.target.value)}
                placeholder="http://m.me/yourpage"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">YouTube Channel</label>
              <Input
                value={settings.youtubeUrl}
                onChange={(e) => updateField("youtubeUrl", e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "payment" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Settings
            </CardTitle>
            <CardDescription>
              Configure your payment numbers. Customers will pay to these numbers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  bKash Number (Personal/Agent)
                </label>
                <Input
                  value={settings.bkashNumber}
                  onChange={(e) => updateField("bkashNumber", e.target.value)}
                  placeholder="017XXXXXXXX"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This number will be shown to customers for bKash payments
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Nagad Number (Personal/Agent)
                </label>
                <Input
                  value={settings.nagadNumber}
                  onChange={(e) => updateField("nagadNumber", e.target.value)}
                  placeholder="017XXXXXXXX"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Rocket Number (Personal/Agent)
                </label>
                <Input
                  value={settings.rocketNumber}
                  onChange={(e) => updateField("rocketNumber", e.target.value)}
                  placeholder="017XXXXXXXX"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-yellow-800 mb-2">Important Notes:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Use personal numbers for small business</li>
                <li>• For merchant accounts, contact bKash/Nagad/Rocket</li>
                <li>• Make sure your number is verified</li>
                <li>• Keep transaction minimum according to your policy</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
