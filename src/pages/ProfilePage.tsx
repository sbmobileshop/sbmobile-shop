import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera, Loader2, Save, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (user) {
      // Fetch full profile including avatar
      supabase.from("profiles").select("full_name, phone, avatar_url")
        .eq("user_id", user.id).maybeSingle()
        .then(({ data }) => {
          if (data) {
            setFullName(data.full_name || "");
            setPhone(data.phone || "");
            setAvatarUrl(data.avatar_url);
          }
        });
    }
  }, [user, authLoading, navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(language === "bn" ? "ছবি ২MB এর কম হতে হবে" : "Image must be under 2MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `avatars/${user.id}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      // Add cache buster
      const url = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(url);

      await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
      await refreshProfile();
      toast.success(language === "bn" ? "প্রোফাইল ছবি আপডেট হয়েছে" : "Profile photo updated");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({
        full_name: fullName.trim(),
        phone: phone.trim(),
      }).eq("user_id", user.id);
      if (error) throw error;
      await refreshProfile();
      toast.success(language === "bn" ? "প্রোফাইল আপডেট হয়েছে" : "Profile updated");
      navigate(-1);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-lg">
          <Card className="border-border">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-xl">{language === "bn" ? "আমার প্রোফাইল" : "My Profile"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-2 border-border">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="Profile" />
                    ) : null}
                    <AvatarFallback className="text-2xl bg-accent/10 text-accent">
                      {fullName ? fullName.charAt(0).toUpperCase() : <User className="h-10 w-10" />}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md hover:bg-accent/90 active:scale-95 transition-all">
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{language === "bn" ? "ছবি পরিবর্তন করুন" : "Change photo"}</p>
              </div>

              {/* Email (read-only) */}
              <div>
                <Label className="text-muted-foreground text-xs">{language === "bn" ? "ইমেইল" : "Email"}</Label>
                <Input value={user?.email || ""} disabled className="mt-1 bg-muted/30 text-sm" />
              </div>

              {/* Full Name */}
              <div>
                <Label>{language === "bn" ? "পুরো নাম" : "Full Name"}</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 text-sm" />
              </div>

              {/* Phone */}
              <div>
                <Label>{language === "bn" ? "ফোন নম্বর" : "Phone"}</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 text-sm font-english" />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2 font-semibold">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {language === "bn" ? "সংরক্ষণ করুন" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
