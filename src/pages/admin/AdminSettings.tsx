import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Save, Megaphone, Image, Upload, Plus, Trash2, Eye, EyeOff, Settings, CreditCard, Globe, Layout, Palette, Check, Languages, Store, ImageIcon, Bell, LayoutGrid, Link2, Wrench, Cog, GraduationCap, Paintbrush, Truck, Key, Mail } from "lucide-react";
import IconPicker from "@/components/admin/IconPicker";
import { invalidateSettingsCache, defaultSiteInfo, defaultBanner, defaultHero, defaultFooter, defaultVisibility, defaultPayment, defaultDelivery, defaultTools, defaultServices, defaultCourses } from "@/hooks/useSiteSettings";
import type { SiteInfo, BannerSettings, HeroSettings, FooterSettings, SectionVisibility, PaymentSettings, DeliverySettings, ToolItem, ServiceItem, CourseItem } from "@/hooks/useSiteSettings";
import { useTheme, themePresets, defaultCustomColors, type CustomThemeColors } from "@/contexts/ThemeContext";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

const AdminSettings: React.FC = () => {
  const { language } = useLanguage();
  const { activeTheme, setTheme, customColors, setCustomColors } = useTheme();
  const { translate, translating } = useAutoTranslate();
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(defaultSiteInfo);
  const [banner, setBanner] = useState<BannerSettings>(defaultBanner);
  const [hero, setHero] = useState<HeroSettings>(defaultHero);
  const [footer, setFooter] = useState<FooterSettings>(defaultFooter);
  const [visibility, setVisibility] = useState<SectionVisibility>(defaultVisibility);
  const [payment, setPayment] = useState<PaymentSettings>(defaultPayment);
  const [tools, setTools] = useState<ToolItem[]>(defaultTools);
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);
  const [courses, setCourses] = useState<CourseItem[]>(defaultCourses);
  const [delivery, setDelivery] = useState<DeliverySettings>(defaultDelivery);
  const [apiKeys, setApiKeys] = useState({
    steadfast_api_key: "",
    steadfast_secret_key: "",
    fraud_checker_api_key: "",
  });
  const [digitalEmailTemplate, setDigitalEmailTemplate] = useState({
    subject: "🎉 আপনার ডিজিটাল প্রোডাক্ট রেডি! — Order #{order_id}",
    heading: "ডিজিটাল প্রোডাক্ট ডেলিভারি",
    body_text: "প্রিয় {customer_name},\n\nআপনার পেমেন্ট সফলভাবে ভেরিফাই হয়েছে! নিচে আপনার ডিজিটাল প্রোডাক্ট এর তথ্য দেওয়া হলো:",
    footer_text: "ধন্যবাদ! কোনো সমস্যা হলে যোগাযোগ করুন।",
    button_text: "ডাউনলোড করুন",
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("setting_key, setting_value").then(({ data }) => {
      if (data) {
        const map: Record<string, any> = {};
        data.forEach((row: any) => { map[row.setting_key] = row.setting_value; });
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
        if (map.api_keys) setApiKeys(prev => ({ ...prev, ...map.api_keys }));
        if (map.digital_email_template) setDigitalEmailTemplate(prev => ({ ...prev, ...map.digital_email_template }));
      }
      setLoaded(true);
    });
  }, []);

  const saveSetting = async (key: string, value: any) => {
    setSaving(key);
    const { data: existing } = await supabase.from("site_settings").select("id").eq("setting_key", key).maybeSingle();
    let error;
    if (existing) {
      ({ error } = await supabase.from("site_settings").update({ setting_value: value as any }).eq("setting_key", key));
    } else {
      ({ error } = await supabase.from("site_settings").insert({ setting_key: key, setting_value: value as any }));
    }
    setSaving(null);
    invalidateSettingsCache();
    if (error) toast.error("Save failed: " + error.message);
    else toast.success(language === "bn" ? "সেভ হয়েছে!" : "Saved successfully!");
  };

  const handleImageUpload = async (callback: (url: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const ext = file.name.split(".").pop();
      const path = `site/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) { toast.error(error.message); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      callback(urlData.publicUrl);
      setUploading(false);
      toast.success("Uploaded!");
    };
    input.click();
  };

  const SaveBtn = ({ settingKey, value }: { settingKey: string; value: any }) => (
    <Button onClick={() => saveSetting(settingKey, value)} disabled={saving === settingKey} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
      {saving === settingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      Save
    </Button>
  );

  const TranslateBtn = ({ enText, onTranslated, context }: { enText: string; onTranslated: (bn: string) => void; context?: string }) => (
    <Button
      type="button"
      size="sm"
      variant="outline"
      disabled={translating || !enText?.trim()}
      onClick={async () => {
        const bn = await translate(enText, context);
        if (bn) { onTranslated(bn); toast.success("Auto-translated!"); }
      }}
      className="gap-1 text-xs shrink-0"
    >
      {translating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
      Auto BN
    </Button>
  );

  if (!loaded) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6" />
        {language === "bn" ? "সাইট সেটিংস — ফুল কন্ট্রোল" : "Site Settings — Full Control"}
      </h1>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex flex-wrap gap-2 h-auto bg-transparent p-0">
          {[
            { value: "general", Icon: Store, label: language === "bn" ? "সাইট তথ্য" : "Site Info" },
            { value: "hero", Icon: ImageIcon, label: language === "bn" ? "হিরো ব্যানার" : "Hero" },
            { value: "banner", Icon: Bell, label: language === "bn" ? "নোটিশ/পিক্সেল" : "Notice/Pixel" },
            { value: "sections", Icon: LayoutGrid, label: language === "bn" ? "সেকশন দেখানো" : "Sections" },
            { value: "payment", Icon: CreditCard, label: language === "bn" ? "পেমেন্ট" : "Payment" },
            { value: "footer", Icon: Link2, label: language === "bn" ? "ফুটার/সোশ্যাল" : "Footer" },
            { value: "tools", Icon: Wrench, label: language === "bn" ? "টুলস" : "Tools" },
            { value: "services", Icon: Cog, label: language === "bn" ? "সেবা" : "Services" },
            { value: "courses", Icon: GraduationCap, label: language === "bn" ? "কোর্স" : "Courses" },
            { value: "delivery", Icon: Truck, label: language === "bn" ? "ডেলিভারি" : "Delivery" },
            { value: "digital_email", Icon: Mail, label: language === "bn" ? "ডিজিটাল ইমেইল" : "Digital Email" },
            { value: "api", Icon: Key, label: language === "bn" ? "API কী" : "API Keys" },
            { value: "theme", Icon: Paintbrush, label: language === "bn" ? "থিম" : "Theme" },
          ].map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs px-4 py-2.5 rounded-full border-2 border-accent/30 text-accent font-semibold bg-background shadow-sm hover:bg-accent/5 hover:border-accent/50 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:border-accent data-[state=active]:shadow-md transition-all duration-200 gap-1.5"
            >
              <tab.Icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* General / Site Info */}
        <TabsContent value="general">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> {language === "bn" ? "সাইট তথ্য" : "Site Information"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Upload */}
              <div>
                <Label>{language === "bn" ? "সাইট লোগো" : "Site Logo"}</Label>
                <div className="mt-2 flex items-center gap-4">
                  {siteInfo.logo_url && <img src={siteInfo.logo_url} alt="Logo" className="w-16 h-16 object-cover rounded-lg border" />}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleImageUpload(url => setSiteInfo(p => ({...p, logo_url: url})))} disabled={uploading} className="gap-1.5">
                      <Upload className="h-3.5 w-3.5" /> {language === "bn" ? "আপলোড" : "Upload"}
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <Input placeholder="Or paste image URL..." value={siteInfo.logo_url} onChange={e => setSiteInfo(p => ({...p, logo_url: e.target.value}))} className="font-english text-xs" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Shop Name (English)</Label>
                  <Input value={siteInfo.shop_name_en} onChange={e => setSiteInfo(p => ({ ...p, shop_name_en: e.target.value }))} className="mt-1.5 font-english" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Shop Name (Bangla)</Label>
                    <TranslateBtn enText={siteInfo.shop_name_en} onTranslated={bn => setSiteInfo(p => ({...p, shop_name_bn: bn}))} context="shop name" />
                  </div>
                  <Input value={siteInfo.shop_name_bn} onChange={e => setSiteInfo(p => ({ ...p, shop_name_bn: e.target.value }))} className="mt-1.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Phone 1</Label><Input value={siteInfo.phone} onChange={e => setSiteInfo(p => ({ ...p, phone: e.target.value }))} className="mt-1.5 font-english" /></div>
                <div><Label>Phone 2</Label><Input value={siteInfo.phone2} onChange={e => setSiteInfo(p => ({ ...p, phone2: e.target.value }))} className="mt-1.5 font-english" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Email</Label><Input value={siteInfo.email} onChange={e => setSiteInfo(p => ({ ...p, email: e.target.value }))} className="mt-1.5 font-english" /></div>
                <div><Label>WhatsApp</Label><Input value={siteInfo.whatsapp} onChange={e => setSiteInfo(p => ({ ...p, whatsapp: e.target.value }))} className="mt-1.5 font-english" /></div>
              </div>
              <div>
                <Label>Address (English)</Label>
                <Textarea value={siteInfo.address_en} onChange={e => setSiteInfo(p => ({ ...p, address_en: e.target.value }))} className="mt-1.5" rows={2} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label>Address (Bangla)</Label>
                  <TranslateBtn enText={siteInfo.address_en} onTranslated={bn => setSiteInfo(p => ({...p, address_bn: bn}))} context="shop address" />
                </div>
                <Textarea value={siteInfo.address_bn} onChange={e => setSiteInfo(p => ({ ...p, address_bn: e.target.value }))} className="mt-1.5" rows={2} />
              </div>
              <SaveBtn settingKey="site_info" value={siteInfo} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">{language === "bn" ? "হিরো ব্যানার সেটিংস" : "Hero Banner Settings"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Background Image</Label>
                <div className="mt-2 p-4 border-2 border-dashed border-border rounded-xl bg-muted/30 space-y-3">
                  <div className="flex items-center gap-4">
                    {hero.hero_bg_url && <img src={hero.hero_bg_url} alt="Hero BG" className="w-40 h-24 object-cover rounded-lg border shadow-sm" />}
                    <div className="flex-1 space-y-1">
                      <Button size="sm" variant="outline" onClick={() => handleImageUpload(url => setHero(p => ({...p, hero_bg_url: url})))} disabled={uploading} className="gap-1.5 w-full">
                        <Upload className="h-3.5 w-3.5" /> Choose File
                      </Button>
                      <Input placeholder="Or paste image URL..." value={hero.hero_bg_url} onChange={e => setHero(p => ({...p, hero_bg_url: e.target.value}))} className="font-english text-xs" />
                    </div>
                  </div>
                  <div className="bg-background/80 rounded-lg p-3 text-xs space-y-2 border">
                    <p className="font-semibold text-foreground flex items-center gap-1.5"><Image className="h-3.5 w-3.5" /> Recommended Image Sizes</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="font-medium text-primary">Desktop</p>
                        <p className="text-muted-foreground">Size: <span className="font-mono text-foreground">1920 × 1080px</span></p>
                        <p className="text-muted-foreground">Safe area: <span className="font-mono text-foreground">1200 × 600px</span> center</p>
                        <p className="text-muted-foreground">Margins: 360px left/right</p>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-primary">Mobile</p>
                        <p className="text-muted-foreground">Safe area: <span className="font-mono text-foreground">375 × 500px</span> center</p>
                        <p className="text-muted-foreground">Top safe: 80px (header overlap)</p>
                        <p className="text-muted-foreground">Text zone: center 60%</p>
                      </div>
                    </div>
                    <p className="text-muted-foreground/80 italic">Keep important content in center. Text overlays on the image — use dark/moody images for best readability.</p>
                  </div>
                </div>
              </div>
              <div>
                <Label>{language === "bn" ? "ভিডিও URL (ঐচ্ছিক)" : "Video URL (optional)"}</Label>
                <Input value={hero.hero_video_url} onChange={e => setHero(p => ({...p, hero_video_url: e.target.value}))} placeholder="https://..." className="mt-1.5 font-english" />
                <p className="text-xs text-muted-foreground mt-1">MP4 video URL - will play as background</p>
              </div>
              <div><Label>Hero Title</Label><Input value={hero.hero_title} onChange={e => setHero(p => ({...p, hero_title: e.target.value}))} className="mt-1.5 font-english" /></div>
              <div className="space-y-2">
                <div><Label>Subtitle (English)</Label><Input value={hero.hero_subtitle_en} onChange={e => setHero(p => ({...p, hero_subtitle_en: e.target.value}))} className="mt-1.5" /></div>
                <div className="flex items-center gap-2">
                  <Input value={hero.hero_subtitle_bn} onChange={e => setHero(p => ({...p, hero_subtitle_bn: e.target.value}))} placeholder="Bangla (auto)" className="flex-1 text-sm" />
                  <TranslateBtn enText={hero.hero_subtitle_en} onTranslated={bn => setHero(p => ({...p, hero_subtitle_bn: bn}))} context="hero subtitle" />
                </div>
              </div>
              <div className="space-y-2">
                <div><Label>Tagline (English)</Label><Input value={hero.hero_tagline_en} onChange={e => setHero(p => ({...p, hero_tagline_en: e.target.value}))} className="mt-1.5" /></div>
                <div className="flex items-center gap-2">
                  <Input value={hero.hero_tagline_bn} onChange={e => setHero(p => ({...p, hero_tagline_bn: e.target.value}))} placeholder="Bangla (auto)" className="flex-1 text-sm" />
                  <TranslateBtn enText={hero.hero_tagline_en} onTranslated={bn => setHero(p => ({...p, hero_tagline_bn: bn}))} context="hero tagline" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>CTA Text (English)</Label><Input value={hero.hero_cta_text_en} onChange={e => setHero(p => ({...p, hero_cta_text_en: e.target.value}))} className="mt-1.5" /></div>
                  <div className="flex items-center gap-2">
                    <Input value={hero.hero_cta_text_bn} onChange={e => setHero(p => ({...p, hero_cta_text_bn: e.target.value}))} placeholder="Bangla (auto)" className="flex-1 text-sm" />
                    <TranslateBtn enText={hero.hero_cta_text_en} onTranslated={bn => setHero(p => ({...p, hero_cta_text_bn: bn}))} context="call to action button" />
                  </div>
                </div>
                <div><Label>CTA Link</Label><Input value={hero.hero_cta_link} onChange={e => setHero(p => ({...p, hero_cta_link: e.target.value}))} className="mt-1.5 font-english" /></div>
              </div>
              <SaveBtn settingKey="hero_settings" value={hero} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banner & Pixel */}
        <TabsContent value="banner">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Megaphone className="h-4 w-4 text-accent" /> {language === "bn" ? "নোটিশ বোর্ড ও মেটা পিক্সেল" : "Notice Board & Meta Pixel"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between"><Label>Enable Top Banner</Label><Switch checked={banner.banner_enabled} onCheckedChange={v => setBanner(p => ({...p, banner_enabled: v}))} /></div>
              <div>
                <Label>Banner Text (English)</Label>
                <Input value={banner.banner_text_en} onChange={e => setBanner(p => ({...p, banner_text_en: e.target.value}))} className="mt-1.5" />
              </div>
              <div className="flex items-center gap-2">
                <Input value={banner.banner_text_bn} onChange={e => setBanner(p => ({...p, banner_text_bn: e.target.value}))} placeholder="Bangla (auto)" className="flex-1 text-sm" />
                <TranslateBtn enText={banner.banner_text_en} onTranslated={bn => setBanner(p => ({...p, banner_text_bn: bn}))} context="banner promotion text" />
              </div>
              <div className="border-t border-border pt-4" />
              <div className="flex items-center justify-between"><Label>Enable Notice Board</Label><Switch checked={banner.notice_enabled} onCheckedChange={v => setBanner(p => ({...p, notice_enabled: v}))} /></div>
              <div>
                <Label>Notice Text (English)</Label>
                <Textarea value={banner.notice_text_en} onChange={e => setBanner(p => ({...p, notice_text_en: e.target.value}))} className="mt-1.5" rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <Textarea value={banner.notice_text_bn} onChange={e => setBanner(p => ({...p, notice_text_bn: e.target.value}))} placeholder="Bangla (auto)" className="flex-1 text-sm" rows={2} />
                <TranslateBtn enText={banner.notice_text_en} onTranslated={bn => setBanner(p => ({...p, notice_text_bn: bn}))} context="notice board text" />
              </div>
              <div className="border-t border-border pt-4" />
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label>Facebook Page URL</Label><Input value={banner.facebook_page} onChange={e => setBanner(p => ({...p, facebook_page: e.target.value}))} className="mt-1.5 font-english" /></div>
                <div><Label>Meta Pixel ID</Label><Input value={banner.meta_pixel_id} onChange={e => setBanner(p => ({...p, meta_pixel_id: e.target.value}))} placeholder="123456789" className="mt-1.5 font-english" /></div>
              </div>
              <SaveBtn settingKey="banner_offers" value={banner} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section Visibility */}
        <TabsContent value="sections">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Layout className="h-4 w-4" /> {language === "bn" ? "সেকশন দেখানো/লুকানো" : "Section Visibility"}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(visibility).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <Label className="flex items-center gap-2">
                    {val ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    {key.replace("show_", "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  <Switch checked={val} onCheckedChange={v => setVisibility(p => ({...p, [key]: v}))} />
                </div>
              ))}
              <SaveBtn settingKey="section_visibility" value={visibility} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> {language === "bn" ? "পেমেন্ট সেটিংস" : "Payment Settings"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3 p-4 border rounded-xl">
                  <div className="flex items-center justify-between"><Label className="font-semibold">bKash</Label><Switch checked={payment.bkash_enabled} onCheckedChange={v => setPayment(p => ({...p, bkash_enabled: v}))} /></div>
                  <Input value={payment.bkash_number} onChange={e => setPayment(p => ({...p, bkash_number: e.target.value}))} placeholder="Number" className="font-english" />
                </div>
                <div className="space-y-3 p-4 border rounded-xl">
                  <div className="flex items-center justify-between"><Label className="font-semibold">Nagad</Label><Switch checked={payment.nagad_enabled} onCheckedChange={v => setPayment(p => ({...p, nagad_enabled: v}))} /></div>
                  <Input value={payment.nagad_number} onChange={e => setPayment(p => ({...p, nagad_number: e.target.value}))} placeholder="Number" className="font-english" />
                </div>
                <div className="space-y-3 p-4 border rounded-xl">
                  <div className="flex items-center justify-between"><Label className="font-semibold">Rocket</Label><Switch checked={payment.rocket_enabled} onCheckedChange={v => setPayment(p => ({...p, rocket_enabled: v}))} /></div>
                  <Input value={payment.rocket_number} onChange={e => setPayment(p => ({...p, rocket_number: e.target.value}))} placeholder="Number" className="font-english" />
                </div>
                <div className="space-y-3 p-4 border rounded-xl">
                  <div className="flex items-center justify-between"><Label className="font-semibold">Binance</Label><Switch checked={payment.binance_enabled} onCheckedChange={v => setPayment(p => ({...p, binance_enabled: v}))} /></div>
                  <Input value={payment.binance_name} onChange={e => setPayment(p => ({...p, binance_name: e.target.value}))} placeholder="Name" className="font-english" />
                  <Input value={payment.binance_id} onChange={e => setPayment(p => ({...p, binance_id: e.target.value}))} placeholder="ID" className="font-english" />
                </div>
              </div>
              <SaveBtn settingKey="payment_settings" value={payment} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer & Social */}
        <TabsContent value="footer">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base">{language === "bn" ? "ফুটার ও সোশ্যাল লিংক" : "Footer & Social Links"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Footer About (English)</Label>
                <Textarea value={footer.footer_about_en} onChange={e => setFooter(p => ({...p, footer_about_en: e.target.value}))} className="mt-1.5" rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <Textarea value={footer.footer_about_bn} onChange={e => setFooter(p => ({...p, footer_about_bn: e.target.value}))} placeholder="Bangla (auto)" className="flex-1 text-sm" rows={2} />
                <TranslateBtn enText={footer.footer_about_en} onTranslated={bn => setFooter(p => ({...p, footer_about_bn: bn}))} context="footer about section" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label>Facebook</Label><Input value={footer.facebook_url} onChange={e => setFooter(p => ({...p, facebook_url: e.target.value}))} className="mt-1.5 font-english" /></div>
                <div><Label>Messenger</Label><Input value={footer.messenger_url} onChange={e => setFooter(p => ({...p, messenger_url: e.target.value}))} className="mt-1.5 font-english" /></div>
                <div><Label>WhatsApp</Label><Input value={footer.whatsapp_url} onChange={e => setFooter(p => ({...p, whatsapp_url: e.target.value}))} className="mt-1.5 font-english" /></div>
                <div><Label>YouTube</Label><Input value={footer.youtube_url} onChange={e => setFooter(p => ({...p, youtube_url: e.target.value}))} className="mt-1.5 font-english" /></div>
                <div><Label>Instagram</Label><Input value={footer.instagram_url} onChange={e => setFooter(p => ({...p, instagram_url: e.target.value}))} className="mt-1.5 font-english" /></div>
                <div><Label>Google Maps</Label><Input value={footer.google_maps_url} onChange={e => setFooter(p => ({...p, google_maps_url: e.target.value}))} className="mt-1.5 font-english" /></div>
              </div>
              <SaveBtn settingKey="footer_settings" value={footer} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Management */}
        <TabsContent value="tools">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                {language === "bn" ? "টুলস ম্যানেজমেন্ট" : "Tools Management"}
                <Button size="sm" variant="outline" onClick={() => setTools(p => [...p, { title: "", title_bn: "", link: "", icon: "Wrench", btn: "Open", btn_bn: "খুলুন" }])} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> {language === "bn" ? "নতুন টুল" : "Add Tool"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[60vh] overflow-y-auto">
              {tools.map((tool, idx) => (
                <div key={idx} className="p-3 border rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <IconPicker value={tool.icon} onChange={v => { const t = [...tools]; t[idx] = {...t[idx], icon: v}; setTools(t); }} />
                    <Input value={tool.title} onChange={e => { const t = [...tools]; t[idx] = {...t[idx], title: e.target.value}; setTools(t); }} placeholder="Title (English)" className="flex-1 font-english text-sm" />
                    <TranslateBtn enText={tool.title} onTranslated={bn => { const t = [...tools]; t[idx] = {...t[idx], title_bn: bn}; setTools(t); }} context="tool name" />
                    <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => setTools(p => p.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value={tool.link} onChange={e => { const t = [...tools]; t[idx] = {...t[idx], link: e.target.value}; setTools(t); }} placeholder="URL" className="flex-1 font-english text-xs" />
                    <Input value={tool.btn} onChange={e => { const t = [...tools]; t[idx] = {...t[idx], btn: e.target.value}; setTools(t); }} placeholder="Button EN" className="w-28 text-xs" />
                    <TranslateBtn enText={tool.btn} onTranslated={bn => { const t = [...tools]; t[idx] = {...t[idx], btn_bn: bn}; setTools(t); }} context="button text" />
                  </div>
                </div>
              ))}
              <SaveBtn settingKey="tools_list" value={tools} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Management */}
        <TabsContent value="services">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                {language === "bn" ? "সেবা ম্যানেজমেন্ট" : "Services Management"}
                <Button size="sm" variant="outline" onClick={() => setServices(p => [...p, { title: "", title_bn: "", desc: "", desc_bn: "", icon: "Wrench" }])} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.map((s, idx) => (
                <div key={idx} className="p-3 border rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <IconPicker value={s.icon} onChange={v => { const a = [...services]; a[idx] = {...a[idx], icon: v}; setServices(a); }} />
                    <Input value={s.title} onChange={e => { const a = [...services]; a[idx] = {...a[idx], title: e.target.value}; setServices(a); }} placeholder="Title (English)" className="flex-1 text-sm" />
                    <TranslateBtn enText={s.title} onTranslated={bn => { const a = [...services]; a[idx] = {...a[idx], title_bn: bn}; setServices(a); }} context="service title" />
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setServices(p => p.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div>
                    <Textarea value={s.desc} onChange={e => { const a = [...services]; a[idx] = {...a[idx], desc: e.target.value}; setServices(a); }} placeholder="Description (English)" rows={2} className="text-xs" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Textarea value={s.desc_bn} onChange={e => { const a = [...services]; a[idx] = {...a[idx], desc_bn: e.target.value}; setServices(a); }} placeholder="Description Bangla (auto)" rows={2} className="text-xs flex-1" />
                    <TranslateBtn enText={s.desc} onTranslated={bn => { const a = [...services]; a[idx] = {...a[idx], desc_bn: bn}; setServices(a); }} context="service description" />
                  </div>
                </div>
              ))}
              <SaveBtn settingKey="services_list" value={services} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Management */}
        <TabsContent value="courses">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                {language === "bn" ? "কোর্স ম্যানেজমেন্ট" : "Courses Management"}
                <Button size="sm" variant="outline" onClick={() => setCourses(p => [...p, { title_en: "", title_bn: "", desc_en: "", desc_bn: "", link: "", image: "" }])} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {courses.map((c, idx) => (
                <div key={idx} className="p-3 border rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Input value={c.title_en} onChange={e => { const a = [...courses]; a[idx] = {...a[idx], title_en: e.target.value}; setCourses(a); }} placeholder="Title (English)" className="flex-1 text-sm" />
                    <TranslateBtn enText={c.title_en} onTranslated={bn => { const a = [...courses]; a[idx] = {...a[idx], title_bn: bn}; setCourses(a); }} context="course title" />
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => setCourses(p => p.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                  <div>
                    <Textarea value={c.desc_en} onChange={e => { const a = [...courses]; a[idx] = {...a[idx], desc_en: e.target.value}; setCourses(a); }} placeholder="Description (English)" rows={2} className="text-xs" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Textarea value={c.desc_bn} onChange={e => { const a = [...courses]; a[idx] = {...a[idx], desc_bn: e.target.value}; setCourses(a); }} placeholder="Description Bangla (auto)" rows={2} className="text-xs flex-1" />
                    <TranslateBtn enText={c.desc_en} onTranslated={bn => { const a = [...courses]; a[idx] = {...a[idx], desc_bn: bn}; setCourses(a); }} context="course description" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input value={c.link} onChange={e => { const a = [...courses]; a[idx] = {...a[idx], link: e.target.value}; setCourses(a); }} placeholder="YouTube/Link" className="flex-1 font-english text-xs" />
                    <Input value={c.image} onChange={e => { const a = [...courses]; a[idx] = {...a[idx], image: e.target.value}; setCourses(a); }} placeholder="Image URL" className="flex-1 font-english text-xs" />
                    <Button size="sm" variant="outline" onClick={() => handleImageUpload(url => { const a = [...courses]; a[idx] = {...a[idx], image: url}; setCourses(a); })} disabled={uploading}>
                      <Upload className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              <SaveBtn settingKey="courses_list" value={courses} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Presets */}
        <TabsContent value="theme">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4" /> {language === "bn" ? "থিম প্রিসেট" : "Theme Presets"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {language === "bn" ? "পুরো ওয়েবসাইটের রঙ পরিবর্তন করুন" : "Change the entire website color scheme"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {themePresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setTheme(preset.id);
                      saveSetting("active_theme", { theme_id: preset.id });
                    }}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left group ${
                      activeTheme === preset.id
                        ? "border-accent shadow-lg ring-2 ring-accent/20"
                        : "border-border hover:border-accent/40 hover:shadow-md"
                    }`}
                  >
                    {activeTheme === preset.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                        <Check className="h-3 w-3 text-accent-foreground" />
                      </div>
                    )}
                    <div className="flex gap-1.5 mb-3">
                      <div className="w-8 h-8 rounded-lg" style={{ background: `hsl(${preset.primary})` }} />
                      <div className="w-8 h-8 rounded-lg" style={{ background: `hsl(${preset.accent})` }} />
                      <div className="w-8 h-8 rounded-lg border" style={{ background: `hsl(${preset.background})` }} />
                    </div>
                    <div className="flex gap-1 mb-2">
                      <div className="h-1.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, hsl(${preset.gradient_from}), hsl(${preset.gradient_to}))` }} />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {language === "bn" ? preset.name_bn : preset.name}
                    </p>
                  </button>
                ))}

                {/* Custom Theme Button */}
                <button
                  onClick={() => {
                    setTheme("custom");
                    saveSetting("active_theme", { theme_id: "custom", custom_colors: customColors });
                  }}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left group ${
                    activeTheme === "custom"
                      ? "border-accent shadow-lg ring-2 ring-accent/20"
                      : "border-dashed border-border hover:border-accent/40 hover:shadow-md"
                  }`}
                >
                  {activeTheme === "custom" && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                      <Check className="h-3 w-3 text-accent-foreground" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-8 h-8 rounded-lg" style={{ background: `hsl(${customColors.primary})` }} />
                    <div className="w-8 h-8 rounded-lg" style={{ background: `hsl(${customColors.accent})` }} />
                    <div className="w-8 h-8 rounded-lg border" style={{ background: `hsl(${customColors.background})` }} />
                  </div>
                  <div className="flex gap-1 mb-2">
                    <div className="h-1.5 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, hsl(${customColors.gradient_from}), hsl(${customColors.gradient_to}))` }} />
                  </div>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                    <Paintbrush className="h-3.5 w-3.5" />
                    {language === "bn" ? "কাস্টম থিম" : "Custom Theme"}
                  </p>
                </button>
              </div>

              {/* Custom Color Pickers - only show when custom is selected */}
              {activeTheme === "custom" && (
                <div className="mt-6 p-4 border border-border rounded-xl bg-muted/30 space-y-4">
                  <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                    <Paintbrush className="h-4 w-4 text-accent" />
                    {language === "bn" ? "কাস্টম রঙ সেট করুন" : "Set Custom Colors"}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {language === "bn" ? 'HSL ফরম্যাটে লিখুন, যেমন: "213 50% 23%"' : 'Enter HSL values, e.g. "213 50% 23%"'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: "primary", label: "Primary" },
                      { key: "accent", label: "Accent" },
                      { key: "background", label: "Background" },
                      { key: "foreground", label: "Text" },
                      { key: "card", label: "Card" },
                      { key: "muted", label: "Muted" },
                      { key: "border", label: "Border" },
                      { key: "sidebar_bg", label: "Sidebar BG" },
                      { key: "gradient_from", label: "Gradient From" },
                      { key: "gradient_to", label: "Gradient To" },
                    ] as { key: keyof CustomThemeColors; label: string }[]).map(({ key, label }) => (
                      <div key={key}>
                        <Label className="text-xs flex items-center gap-2 mb-1">
                          <div className="w-4 h-4 rounded border shrink-0" style={{ background: `hsl(${customColors[key]})` }} />
                          {label}
                        </Label>
                        <Input
                          value={customColors[key]}
                          onChange={e => {
                            const updated = { ...customColors, [key]: e.target.value };
                            setCustomColors(updated);
                          }}
                          placeholder="213 50% 23%"
                          className="text-xs font-english h-8"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => {
                      setTheme("custom");
                      saveSetting("active_theme", { theme_id: "custom", custom_colors: customColors });
                    }}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {language === "bn" ? "কাস্টম থিম সেভ করুন" : "Save Custom Theme"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4 text-accent" />
                {language === "bn" ? "API কী সেটিংস" : "API Key Settings"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Steadfast Courier */}
              <div className="p-4 border rounded-xl space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  Steadfast Courier API
                </h4>
                <p className="text-xs text-muted-foreground">
                  {language === "bn" ? "Steadfast/Packzy কুরিয়ার ইন্টিগ্রেশনের জন্য API কী দিন" : "Enter your Steadfast/Packzy courier API credentials"}
                </p>
                <div>
                  <Label className="text-xs">API Key</Label>
                  <Input
                    value={apiKeys.steadfast_api_key}
                    onChange={e => setApiKeys(p => ({ ...p, steadfast_api_key: e.target.value }))}
                    placeholder="Enter Steadfast API Key"
                    className="mt-1 font-english text-xs"
                    type="password"
                  />
                </div>
                <div>
                  <Label className="text-xs">Secret Key</Label>
                  <Input
                    value={apiKeys.steadfast_secret_key}
                    onChange={e => setApiKeys(p => ({ ...p, steadfast_secret_key: e.target.value }))}
                    placeholder="Enter Steadfast Secret Key"
                    className="mt-1 font-english text-xs"
                    type="password"
                  />
                </div>
              </div>

              {/* Fraud Checker */}
              <div className="p-4 border rounded-xl space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4 text-primary" />
                  Fraud Checker API
                </h4>
                <p className="text-xs text-muted-foreground">
                  {language === "bn" ? "ফ্রড চেকার API কী দিন — অর্ডারে ফোন নম্বর যাচাই করতে ব্যবহার হবে" : "Enter Fraud Checker API key — used to verify phone numbers on orders"}
                </p>
                <div>
                  <Label className="text-xs">API Key</Label>
                  <Input
                    value={apiKeys.fraud_checker_api_key}
                    onChange={e => setApiKeys(p => ({ ...p, fraud_checker_api_key: e.target.value }))}
                    placeholder="Enter Fraud Checker API Key"
                    className="mt-1 font-english text-xs"
                    type="password"
                  />
                </div>
              </div>

              <SaveBtn settingKey="api_keys" value={apiKeys} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Section */}
        <TabsContent value="delivery">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4 text-accent" />
                {language === "bn" ? "হোম ডেলিভারি সেটিংস" : "Home Delivery Settings"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{language === "bn" ? "ডেলিভারি পোস্টার ইমেজ" : "Delivery Poster Image"}</Label>
                <div className="mt-2 flex items-center gap-4">
                  {delivery.image_url && <img src={delivery.image_url} alt="Delivery" className="w-40 h-28 object-cover rounded-lg border shadow-sm" />}
                  <div className="flex-1 space-y-2">
                    <Button size="sm" variant="outline" onClick={() => handleImageUpload(url => setDelivery(p => ({...p, image_url: url})))} disabled={uploading} className="gap-1.5 w-full">
                      <Upload className="h-3.5 w-3.5" /> {language === "bn" ? "ইমেজ আপলোড" : "Upload Image"}
                    </Button>
                    <Input placeholder="Or paste image URL..." value={delivery.image_url} onChange={e => setDelivery(p => ({...p, image_url: e.target.value}))} className="font-english text-xs" />
                  </div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Title (English)</Label>
                  <Input value={delivery.title_en} onChange={e => setDelivery(p => ({...p, title_en: e.target.value}))} className="mt-1.5" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label>Title (Bangla)</Label>
                    <Input value={delivery.title_bn} onChange={e => setDelivery(p => ({...p, title_bn: e.target.value}))} className="mt-1.5" />
                  </div>
                  <TranslateBtn enText={delivery.title_en} onTranslated={bn => setDelivery(p => ({...p, title_bn: bn}))} context="delivery section title" />
                </div>
              </div>
              <div>
                <Label>Description (English)</Label>
                <Textarea value={delivery.desc_en} onChange={e => setDelivery(p => ({...p, desc_en: e.target.value}))} className="mt-1.5" rows={2} />
              </div>
              <div className="flex items-center gap-2">
                <Textarea value={delivery.desc_bn} onChange={e => setDelivery(p => ({...p, desc_bn: e.target.value}))} placeholder="Bangla (auto)" className="flex-1 text-sm" rows={2} />
                <TranslateBtn enText={delivery.desc_en} onTranslated={bn => setDelivery(p => ({...p, desc_bn: bn}))} context="delivery section description" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>{language === "bn" ? "প্রাইমারি ফোন" : "Primary Phone"}</Label>
                  <Input value={delivery.phone_primary} onChange={e => setDelivery(p => ({...p, phone_primary: e.target.value}))} className="mt-1.5 font-english" />
                </div>
                <div>
                  <Label>{language === "bn" ? "বিকাশ নম্বর" : "bKash Number"}</Label>
                  <Input value={delivery.phone_bkash} onChange={e => setDelivery(p => ({...p, phone_bkash: e.target.value}))} className="mt-1.5 font-english" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>CTA Text (English)</Label>
                  <Input value={delivery.cta_text_en} onChange={e => setDelivery(p => ({...p, cta_text_en: e.target.value}))} className="mt-1.5" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label>CTA Text (Bangla)</Label>
                    <Input value={delivery.cta_text_bn} onChange={e => setDelivery(p => ({...p, cta_text_bn: e.target.value}))} className="mt-1.5" />
                  </div>
                  <TranslateBtn enText={delivery.cta_text_en} onTranslated={bn => setDelivery(p => ({...p, cta_text_bn: bn}))} context="call to action button" />
                </div>
              </div>
              <div>
                <Label>CTA Link</Label>
                <Input value={delivery.cta_link} onChange={e => setDelivery(p => ({...p, cta_link: e.target.value}))} className="mt-1.5 font-english" placeholder="/products or https://..." />
              </div>
              <SaveBtn settingKey="delivery_settings" value={delivery} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Digital Email Template */}
        <TabsContent value="digital_email">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" /> {language === "bn" ? "ডিজিটাল প্রোডাক্ট ইমেইল টেমপ্লেট" : "Digital Product Email Template"}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">{language === "bn" ? "ডিজিটাল প্রোডাক্টের পেমেন্ট ভেরিফাই হলে এই ফরম্যাটে অটো ইমেইল যাবে। Variables: {customer_name}, {order_id}, {product_name}, {download_url}, {digital_note}" : "This template is used when digital product payment is verified. Variables: {customer_name}, {order_id}, {product_name}, {download_url}, {digital_note}"}</p>
              <div>
                <Label>{language === "bn" ? "ইমেইল সাবজেক্ট" : "Email Subject"}</Label>
                <Input value={digitalEmailTemplate.subject} onChange={e => setDigitalEmailTemplate(p => ({...p, subject: e.target.value}))} className="mt-1.5" />
              </div>
              <div>
                <Label>{language === "bn" ? "হেডিং" : "Heading"}</Label>
                <Input value={digitalEmailTemplate.heading} onChange={e => setDigitalEmailTemplate(p => ({...p, heading: e.target.value}))} className="mt-1.5" />
              </div>
              <div>
                <Label>{language === "bn" ? "বডি টেক্সট" : "Body Text"}</Label>
                <Textarea value={digitalEmailTemplate.body_text} onChange={e => setDigitalEmailTemplate(p => ({...p, body_text: e.target.value}))} className="mt-1.5" rows={4} />
              </div>
              <div>
                <Label>{language === "bn" ? "বাটন টেক্সট" : "Button Text"}</Label>
                <Input value={digitalEmailTemplate.button_text} onChange={e => setDigitalEmailTemplate(p => ({...p, button_text: e.target.value}))} className="mt-1.5" />
              </div>
              <div>
                <Label>{language === "bn" ? "ফুটার টেক্সট" : "Footer Text"}</Label>
                <Input value={digitalEmailTemplate.footer_text} onChange={e => setDigitalEmailTemplate(p => ({...p, footer_text: e.target.value}))} className="mt-1.5" />
              </div>
              <SaveBtn settingKey="digital_email_template" value={digitalEmailTemplate} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
