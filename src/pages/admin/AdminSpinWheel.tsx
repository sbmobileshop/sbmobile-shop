import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2, Gift, Sparkles } from "lucide-react";
import { defaultSpinSettings, type SpinWheelSettings, type SpinSegment } from "@/components/SpinWheel";
import { invalidateSettingsCache } from "@/hooks/useSiteSettings";

const colorPresets = [
  { label: "Navy", value: "213 50% 23%" },
  { label: "Red", value: "355 78% 56%" },
  { label: "Green", value: "142 71% 45%" },
  { label: "Gold", value: "45 93% 48%" },
  { label: "Gray", value: "220 14% 70%" },
  { label: "Gray Light", value: "220 14% 80%" },
  { label: "Purple", value: "270 60% 50%" },
  { label: "Teal", value: "180 50% 40%" },
];

const AdminSpinWheel: React.FC = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<SpinWheelSettings>(defaultSpinSettings);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("setting_value").eq("setting_key", "spin_wheel").maybeSingle().then(({ data }) => {
      if (data?.setting_value) {
        setSettings({ ...defaultSpinSettings, ...(data.setting_value as any) });
      }
      setLoaded(true);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const { data: existing } = await supabase.from("site_settings").select("id").eq("setting_key", "spin_wheel").maybeSingle();
    let error;
    if (existing) {
      ({ error } = await supabase.from("site_settings").update({ setting_value: settings as any }).eq("setting_key", "spin_wheel"));
    } else {
      ({ error } = await supabase.from("site_settings").insert({ setting_key: "spin_wheel", setting_value: settings as any }));
    }
    setSaving(false);
    invalidateSettingsCache();
    if (error) toast.error("Save failed: " + error.message);
    else toast.success(language === "bn" ? "সেভ হয়েছে!" : "Saved!");
  };

  const updateSeg = (idx: number, updates: Partial<SpinSegment>) => {
    setSettings(p => ({
      ...p,
      segments: p.segments.map((s, i) => i === idx ? { ...s, ...updates } : s),
    }));
  };

  const addSegment = () => {
    setSettings(p => ({
      ...p,
      segments: [...p.segments, {
        label_en: "New Prize",
        label_bn: "নতুন পুরস্কার",
        value: "CODE",
        color: "213 50% 23%",
        probability: 10,
      }],
    }));
  };

  const removeSeg = (idx: number) => {
    setSettings(p => ({ ...p, segments: p.segments.filter((_, i) => i !== idx) }));
  };

  if (!loaded) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Gift className="h-6 w-6 text-accent" />
        {language === "bn" ? "স্পিন হুইল অফার" : "Spin Wheel Offer"}
      </h1>

      {/* Enable/Disable */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">{language === "bn" ? "স্পিন হুইল সক্রিয়" : "Enable Spin Wheel"}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === "bn" ? "কাস্টমারদের জন্য স্পিন টু উইন পপআপ দেখান" : "Show spin-to-win popup for customers"}
              </p>
            </div>
            <Switch checked={settings.enabled} onCheckedChange={v => setSettings(p => ({ ...p, enabled: v }))} />
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card className="border-border">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4" /> {language === "bn" ? "সাধারণ সেটিংস" : "General Settings"}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Title (English)</Label>
              <Input value={settings.title_en} onChange={e => setSettings(p => ({ ...p, title_en: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label>Title (Bangla)</Label>
              <Input value={settings.title_bn} onChange={e => setSettings(p => ({ ...p, title_bn: e.target.value }))} className="mt-1.5" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Subtitle (English)</Label>
              <Input value={settings.subtitle_en} onChange={e => setSettings(p => ({ ...p, subtitle_en: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label>Subtitle (Bangla)</Label>
              <Input value={settings.subtitle_bn} onChange={e => setSettings(p => ({ ...p, subtitle_bn: e.target.value }))} className="mt-1.5" />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>{language === "bn" ? "দেখানোর সময় (সেকেন্ড)" : "Show after (seconds)"}</Label>
              <Input type="number" value={settings.show_after_seconds} onChange={e => setSettings(p => ({ ...p, show_after_seconds: parseInt(e.target.value) || 10 }))} className="mt-1.5 font-english" />
            </div>
            <div>
              <Label>{language === "bn" ? "সর্বোচ্চ স্পিন/ইউজার" : "Max spins/user"}</Label>
              <Input type="number" value={settings.max_spins_per_user} onChange={e => setSettings(p => ({ ...p, max_spins_per_user: parseInt(e.target.value) || 1 }))} className="mt-1.5 font-english" />
            </div>
            <div>
              <Label>{language === "bn" ? "কুলডাউন (দিন)" : "Cooldown (days)"}</Label>
              <Input type="number" value={settings.cooldown_days || 7} onChange={e => setSettings(p => ({ ...p, cooldown_days: parseInt(e.target.value) || 7 }))} className="mt-1.5 font-english" />
              <p className="text-[10px] text-muted-foreground mt-0.5">{language === "bn" ? "৭ = সপ্তাহে ১ বার" : "7 = once per week"}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-end gap-2 pb-0.5">
              <div className="flex items-center gap-2">
                <Switch checked={settings.show_on_exit_intent} onCheckedChange={v => setSettings(p => ({ ...p, show_on_exit_intent: v }))} />
                <Label className="text-sm">{language === "bn" ? "Exit Intent এ দেখান" : "Show on exit intent"}</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segments */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>{language === "bn" ? "হুইল সেগমেন্ট" : "Wheel Segments"}</span>
            <Button size="sm" variant="outline" onClick={addSegment} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> {language === "bn" ? "সেগমেন্ট যোগ" : "Add Segment"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.segments.map((seg, idx) => (
            <div key={idx} className="p-3 border border-border rounded-xl space-y-2 bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md shrink-0 border" style={{ background: `hsl(${seg.color})` }} />
                <Input value={seg.label_en} onChange={e => updateSeg(idx, { label_en: e.target.value })} placeholder="Label EN" className="flex-1 text-sm" />
                <Input value={seg.label_bn} onChange={e => updateSeg(idx, { label_bn: e.target.value })} placeholder="Label BN" className="flex-1 text-sm" />
                <Button size="icon" variant="ghost" className="text-destructive shrink-0" onClick={() => removeSeg(idx)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input value={seg.value} onChange={e => updateSeg(idx, { value: e.target.value })} placeholder='Coupon code or "no_luck"' className="text-xs font-mono" />
                </div>
                <div className="w-20">
                  <Input type="number" value={seg.probability} onChange={e => updateSeg(idx, { probability: parseInt(e.target.value) || 0 })} placeholder="%" className="text-xs font-english" />
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {colorPresets.map(cp => (
                  <button
                    key={cp.value}
                    onClick={() => updateSeg(idx, { color: cp.value })}
                    className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 active:scale-95 ${seg.color === cp.value ? "border-foreground ring-1 ring-foreground/30 scale-110" : "border-transparent"}`}
                    style={{ background: `hsl(${cp.value})` }}
                    title={cp.label}
                  />
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            {language === "bn"
              ? 'probability = জেতার সম্ভাবনা (ওজন)। "no_luck" = কোনো পুরস্কার নেই।'
              : 'Probability = chance weight. Use "no_luck" as value for losing segments.'}
          </p>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {language === "bn" ? "সেভ করুন" : "Save Settings"}
      </Button>
    </div>
  );
};

export default AdminSpinWheel;
