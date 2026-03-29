import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save, CreditCard, Smartphone, Shield, Upload, X, Image as ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentGatewayConfig {
  provider: string;
  bkash_app_key: string;
  bkash_app_secret: string;
  bkash_username: string;
  bkash_password: string;
  bkash_sandbox: boolean;
  enabled: boolean;
}

interface PaymentMethodsConfig {
  bkash_number: string;
  nagad_number: string;
  rocket_number: string;
  binance_id: string;
  binance_name: string;
  bkash_logo?: string;
  nagad_logo?: string;
  rocket_logo?: string;
  binance_logo?: string;
}

const LogoUploader: React.FC<{
  label: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}> = ({ label, currentUrl, onUpload, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Max 2MB file size");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `payment-logos/${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    onUpload(urlData.publicUrl);
    setUploading(false);
    toast.success("Logo uploaded!");
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
      {/* Preview */}
      <div className="w-12 h-12 rounded-lg border border-border bg-card flex items-center justify-center overflow-hidden shrink-0">
        {currentUrl ? (
          <img src={currentUrl} alt={label} className="w-full h-full object-contain" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label} Logo</p>
        <p className="text-xs text-muted-foreground truncate">
          {currentUrl ? "Logo uploaded" : "No logo set"}
        </p>
      </div>

      <div className="flex gap-1.5 shrink-0">
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2.5 gap-1.5 text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {currentUrl ? "Replace" : "Upload"}
        </Button>
        {currentUrl && (
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={onRemove}>
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

const AdminPaymentSettings: React.FC = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [gateway, setGateway] = useState<PaymentGatewayConfig>({
    provider: "manual", bkash_app_key: "", bkash_app_secret: "",
    bkash_username: "", bkash_password: "", bkash_sandbox: true, enabled: false,
  });

  const [methods, setMethods] = useState<PaymentMethodsConfig>({
    bkash_number: "01773243748", nagad_number: "01773243748", rocket_number: "01773243748",
    binance_id: "814381686", binance_name: "MD Shibrul Alom",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("setting_key, setting_value")
      .in("setting_key", ["payment_gateway", "payment_methods"]);
    if (data) {
      data.forEach(row => {
        if (row.setting_key === "payment_gateway") setGateway(row.setting_value as unknown as PaymentGatewayConfig);
        if (row.setting_key === "payment_methods") setMethods(row.setting_value as unknown as PaymentMethodsConfig);
      });
    }
    setLoading(false);
  };

  const saveSettings = async (key: string, value: any) => {
    setSaving(true);
    const { error } = await supabase.from("site_settings")
      .update({ setting_value: value, updated_at: new Date().toISOString() })
      .eq("setting_key", key);
    if (error) toast.error(error.message);
    else toast.success(language === "bn" ? "সেটিংস সেভ হয়েছে!" : "Settings saved!");
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <CreditCard className="h-6 w-6" />
        {language === "bn" ? "পেমেন্ট সেটিংস" : "Payment Settings"}
      </h1>

      <Tabs defaultValue="manual" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="manual" className="gap-2"><Smartphone className="h-4 w-4" />{language === "bn" ? "ম্যানুয়াল পেমেন্ট" : "Manual Payment"}</TabsTrigger>
          <TabsTrigger value="gateway" className="gap-2"><Shield className="h-4 w-4" />{language === "bn" ? "bKash PGW" : "bKash Gateway"}</TabsTrigger>
        </TabsList>

        {/* Manual Payment Numbers */}
        <TabsContent value="manual">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">{language === "bn" ? "মোবাইল পেমেন্ট নম্বর" : "Mobile Payment Numbers"}</CardTitle>
              <CardDescription>{language === "bn" ? "কাস্টমার এই নম্বরে Send Money করবে" : "Customers will send money to these numbers"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo Uploaders */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">{language === "bn" ? "পেমেন্ট লোগো" : "Payment Logos"}</Label>
                <LogoUploader
                  label="bKash"
                  currentUrl={methods.bkash_logo}
                  onUpload={url => setMethods({ ...methods, bkash_logo: url })}
                  onRemove={() => setMethods({ ...methods, bkash_logo: undefined })}
                />
                <LogoUploader
                  label="Nagad"
                  currentUrl={methods.nagad_logo}
                  onUpload={url => setMethods({ ...methods, nagad_logo: url })}
                  onRemove={() => setMethods({ ...methods, nagad_logo: undefined })}
                />
                <LogoUploader
                  label="Rocket"
                  currentUrl={methods.rocket_logo}
                  onUpload={url => setMethods({ ...methods, rocket_logo: url })}
                  onRemove={() => setMethods({ ...methods, rocket_logo: undefined })}
                />
                <LogoUploader
                  label="Binance"
                  currentUrl={methods.binance_logo}
                  onUpload={url => setMethods({ ...methods, binance_logo: url })}
                  onRemove={() => setMethods({ ...methods, binance_logo: undefined })}
                />
              </div>

              <div className="border-t border-border pt-4 space-y-4">
                <Label className="text-sm font-semibold">{language === "bn" ? "পেমেন্ট নম্বর" : "Payment Numbers"}</Label>
                <div>
                  <Label className="text-xs text-muted-foreground">bKash Number</Label>
                  <Input value={methods.bkash_number} onChange={e => setMethods({ ...methods, bkash_number: e.target.value })} className="mt-1.5 font-english" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Nagad Number</Label>
                  <Input value={methods.nagad_number} onChange={e => setMethods({ ...methods, nagad_number: e.target.value })} className="mt-1.5 font-english" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Rocket Number</Label>
                  <Input value={methods.rocket_number} onChange={e => setMethods({ ...methods, rocket_number: e.target.value })} className="mt-1.5 font-english" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Binance Pay ID</Label>
                  <Input value={methods.binance_id} onChange={e => setMethods({ ...methods, binance_id: e.target.value })} className="mt-1.5 font-english" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Binance Account Name</Label>
                  <Input value={methods.binance_name} onChange={e => setMethods({ ...methods, binance_name: e.target.value })} className="mt-1.5 font-english" />
                </div>
              </div>

              <Button onClick={() => saveSettings("payment_methods", methods)} disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {language === "bn" ? "সেভ করুন" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* bKash PGW API Settings */}
        <TabsContent value="gateway">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base">{language === "bn" ? "bKash Payment Gateway (PGW)" : "bKash Payment Gateway (PGW)"}</CardTitle>
              <CardDescription>
                {language === "bn"
                  ? "bKash Merchant Account থেকে API credentials দিন। OTP-based auto payment চালু হবে।"
                  : "Enter API credentials from bKash Merchant Account. Enables OTP-based auto payment."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-medium">{language === "bn" ? "bKash PGW চালু করুন" : "Enable bKash PGW"}</p>
                  <p className="text-xs text-muted-foreground">{language === "bn" ? "চালু করলে কাস্টমার OTP দিয়ে সরাসরি পে করতে পারবে" : "Customers can pay directly with OTP when enabled"}</p>
                </div>
                <Switch checked={gateway.enabled} onCheckedChange={v => setGateway({ ...gateway, enabled: v })} />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                <div>
                  <p className="font-medium">{language === "bn" ? "Sandbox মোড" : "Sandbox Mode"}</p>
                  <p className="text-xs text-muted-foreground">{language === "bn" ? "টেস্ট করার জন্য Sandbox চালু রাখুন" : "Keep sandbox on for testing"}</p>
                </div>
                <Switch checked={gateway.bkash_sandbox} onCheckedChange={v => setGateway({ ...gateway, bkash_sandbox: v })} />
              </div>

              <div>
                <Label>App Key</Label>
                <Input value={gateway.bkash_app_key} onChange={e => setGateway({ ...gateway, bkash_app_key: e.target.value })}
                  placeholder="bKash App Key" className="mt-1.5 font-english" />
              </div>
              <div>
                <Label>App Secret</Label>
                <Input type="password" value={gateway.bkash_app_secret} onChange={e => setGateway({ ...gateway, bkash_app_secret: e.target.value })}
                  placeholder="bKash App Secret" className="mt-1.5 font-english" />
              </div>
              <div>
                <Label>Username</Label>
                <Input value={gateway.bkash_username} onChange={e => setGateway({ ...gateway, bkash_username: e.target.value })}
                  placeholder="bKash Merchant Username" className="mt-1.5 font-english" />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={gateway.bkash_password} onChange={e => setGateway({ ...gateway, bkash_password: e.target.value })}
                  placeholder="bKash Merchant Password" className="mt-1.5 font-english" />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl text-sm space-y-2">
                <p className="font-medium text-blue-700 dark:text-blue-400">
                  {language === "bn" ? "bKash PGW কিভাবে পাবেন:" : "How to get bKash PGW:"}
                </p>
                <ol className="list-decimal list-inside space-y-1 text-blue-600 dark:text-blue-300">
                  <li>{language === "bn" ? "pgw.bkash.com এ Merchant Registration করুন" : "Register at pgw.bkash.com"}</li>
                  <li>{language === "bn" ? "Trade License ও NID দিন" : "Submit Trade License & NID"}</li>
                  <li>{language === "bn" ? "Approve হলে App Key, Secret, Username, Password পাবেন" : "After approval, you'll get App Key, Secret, Username, Password"}</li>
                  <li>{language === "bn" ? "এখানে বসিয়ে Enable করুন — ব্যস!" : "Paste here & enable — done!"}</li>
                </ol>
              </div>

              <Button onClick={() => saveSettings("payment_gateway", { ...gateway, provider: gateway.enabled ? "bkash_pgw" : "manual" })}
                disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {language === "bn" ? "সেভ করুন" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPaymentSettings;
