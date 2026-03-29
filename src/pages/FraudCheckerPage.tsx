import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShieldCheck, ShieldAlert, Loader2, Search, Share2, Copy, Check,
  Phone, Package, CheckCircle2, XCircle, TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface FraudResult {
  phone: string;
  status: string;
  score: number;
  total_parcel: number;
  success_parcel: number;
  cancel_parcel: number;
  response?: Record<string, any>;
}

const FraudCheckerPage: React.FC = () => {
  const { language } = useLanguage();
  const { siteInfo } = useSiteSettings();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FraudResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCheck = async () => {
    const clean = phone.replace(/\D/g, "").slice(-11);
    if (clean.length !== 11 || !clean.startsWith("01")) {
      toast.error(language === "bn" ? "সঠিক ১১ ডিজিট নম্বর দিন (01XXXXXXXXX)" : "Enter valid 11-digit number (01XXXXXXXXX)");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await supabase.functions.invoke("fraud-checker", { body: { phone: clean } });
      if (res.error) throw new Error(res.error.message);
      setResult(res.data);
    } catch (err: any) {
      toast.error(err.message || "Fraud check failed");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = language === "bn"
      ? `SB Mobile Shop ফ্রড চেকার — যেকোনো নম্বর চেক করুন ফ্রী! ${url}`
      : `SB Mobile Shop Fraud Checker — Check any number for free! ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "SB Fraud Checker", text, url });
      } catch { }
    } else {
      navigator.clipboard.writeText(text);
      toast.success(language === "bn" ? "লিংক কপি হয়েছে!" : "Link copied!");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheck();
  };

  const getScoreColor = (score: number) => {
    if (score <= 20) return { bg: "from-emerald-500 to-green-600", text: "text-emerald-700", ring: "ring-emerald-200" };
    if (score <= 50) return { bg: "from-amber-500 to-orange-500", text: "text-amber-700", ring: "ring-amber-200" };
    return { bg: "from-red-500 to-rose-600", text: "text-red-700", ring: "ring-red-200" };
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-[69px]" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 px-4 overflow-hidden" style={{ background: "linear-gradient(135deg, #0f1a2e 0%, #1a2744 40%, #2c1a1a 100%)" }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#c0392b] blur-[100px]" />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#1a2744] blur-[120px]" />
          </div>
          <div className="container mx-auto max-w-2xl relative z-10 text-center">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center overflow-hidden ring-4 ring-white/10 shadow-2xl" style={{ background: "linear-gradient(135deg, #c0392b, #1a2744)" }}>
              {siteInfo.logo_url ? (
                <img src={siteInfo.logo_url} alt="SB" className="w-full h-full object-cover" />
              ) : (
                <ShieldCheck className="h-10 w-10 text-white" />
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3" style={{ lineHeight: "1.15" }}>
              {language === "bn" ? "ফ্রড চেকার" : "Fraud Checker"}
            </h1>
            <p className="text-white/60 text-sm sm:text-base mb-8 max-w-md mx-auto">
              {language === "bn"
                ? "যেকোনো মোবাইল নম্বরের ডেলিভারি রেকর্ড চেক করুন — সম্পূর্ণ ফ্রি!"
                : "Check delivery records of any mobile number — completely free!"}
            </p>

            {/* Search Box */}
            <div className="max-w-md mx-auto">
              <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-2xl p-2 ring-1 ring-white/10">
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    onKeyDown={handleKeyDown}
                    placeholder="01XXXXXXXXX"
                    className="pl-10 font-english text-base bg-transparent border-0 text-white placeholder:text-white/30 focus-visible:ring-0 h-12"
                    maxLength={11}
                  />
                </div>
                <Button
                  onClick={handleCheck}
                  disabled={loading || phone.length < 11}
                  className="h-12 px-6 rounded-xl font-semibold text-white gap-2"
                  style={{ background: "linear-gradient(135deg, #c0392b, #e74c3c)" }}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {language === "bn" ? "চেক" : "Check"}
                </Button>
              </div>
            </div>

            {/* Share buttons */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5 text-xs rounded-xl" onClick={handleShare}>
                <Share2 className="h-3.5 w-3.5" />
                {language === "bn" ? "শেয়ার করুন" : "Share Tool"}
              </Button>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5 text-xs rounded-xl" onClick={handleCopyLink}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? (language === "bn" ? "কপি হয়েছে" : "Copied") : (language === "bn" ? "লিংক কপি" : "Copy Link")}
              </Button>
            </div>
          </div>
        </section>

        {/* Result Section */}
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-2xl">
            {loading && (
              <div className="text-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-[#c0392b] mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">{language === "bn" ? "চেক করা হচ্ছে..." : "Checking..."}</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Score Card */}
                <Card className="overflow-hidden border-0 shadow-xl">
                  <div className={`p-6 text-center text-white bg-gradient-to-br ${getScoreColor(result.score).bg}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {result.score <= 30 ? (
                        <ShieldCheck className="h-8 w-8" />
                      ) : (
                        <ShieldAlert className="h-8 w-8" />
                      )}
                      <span className="text-2xl font-bold">{result.status}</span>
                    </div>
                    <p className="text-5xl font-black">{result.score}%</p>
                    <p className="text-sm opacity-80 mt-1">{language === "bn" ? "ফ্রড স্কোর" : "Fraud Score"}</p>
                    <p className="font-english text-sm opacity-70 mt-2">📱 {result.phone}</p>
                  </div>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="border-border">
                    <CardContent className="p-4 text-center">
                      <Package className="h-5 w-5 mx-auto mb-1.5 text-[#1a2744]" />
                      <p className="text-2xl font-bold text-foreground">{result.total_parcel}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">{language === "bn" ? "মোট পার্সেল" : "Total"}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-4 text-center">
                      <CheckCircle2 className="h-5 w-5 mx-auto mb-1.5 text-emerald-600" />
                      <p className="text-2xl font-bold text-emerald-600">{result.success_parcel}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">{language === "bn" ? "সফল" : "Success"}</p>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="p-4 text-center">
                      <XCircle className="h-5 w-5 mx-auto mb-1.5 text-[#c0392b]" />
                      <p className="text-2xl font-bold text-[#c0392b]">{result.cancel_parcel}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">{language === "bn" ? "বাতিল" : "Cancel"}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Success rate bar */}
                {result.total_parcel > 0 && (
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3.5 w-3.5" />
                          {language === "bn" ? "সফলতার হার" : "Success Rate"}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {Math.round((result.success_parcel / result.total_parcel) * 100)}%
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700"
                          style={{ width: `${(result.success_parcel / result.total_parcel) * 100}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Courier Breakdown */}
                {result.response && Object.keys(result.response).length > 0 && (
                  <Card className="border-border">
                    <CardContent className="p-4">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-3">{language === "bn" ? "কুরিয়ার বিশ্লেষণ" : "Courier Breakdown"}</p>
                      <div className="space-y-2">
                        {Object.entries(result.response).map(([provider, info]: [string, any]) => (
                          info.status && (
                            <div key={provider} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                              <span className="font-semibold text-sm capitalize text-foreground">{provider}</span>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-emerald-600 font-bold">{info.data?.success || 0} ✓</span>
                                <span className="text-[#c0392b] font-bold">{info.data?.cancel || 0} ✗</span>
                                <span className="text-muted-foreground">{info.data?.total || 0} total</span>
                                <span className="font-bold text-foreground bg-muted rounded-lg px-2 py-0.5">{info.data?.deliveredPercentage || 0}%</span>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Share result */}
                <div className="text-center pt-2">
                  <Button variant="outline" className="gap-2 rounded-xl" onClick={() => {
                    const text = `📱 Fraud Check Result for ${result.phone}\n🛡️ Status: ${result.status} (${result.score}%)\n📦 Total: ${result.total_parcel} | ✅ Success: ${result.success_parcel} | ❌ Cancel: ${result.cancel_parcel}\n\nChecked on: ${siteInfo.shop_name_en} Fraud Checker\n${window.location.href}`;
                    if (navigator.share) {
                      navigator.share({ title: "Fraud Check Result", text });
                    } else {
                      navigator.clipboard.writeText(text);
                      toast.success("Result copied!");
                    }
                  }}>
                    <Share2 className="h-4 w-4" />
                    {language === "bn" ? "রেজাল্ট শেয়ার করুন" : "Share Result"}
                  </Button>
                </div>
              </div>
            )}

            {!result && !loading && (
              <div className="text-center py-12">
                <ShieldCheck className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  {language === "bn"
                    ? "একটি মোবাইল নম্বর দিয়ে চেক করুন — ফ্রড কাস্টমার চিনুন আগেই!"
                    : "Enter a mobile number to check — identify fraud customers before delivery!"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Info section */}
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="border-border text-center">
                <CardContent className="p-5">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a2744, #243352)" }}>
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{language === "bn" ? "১০০% ফ্রি" : "100% Free"}</h3>
                  <p className="text-xs text-muted-foreground">{language === "bn" ? "কোনো চার্জ নেই, যতবার খুশি চেক করুন" : "No charges, check unlimited times"}</p>
                </CardContent>
              </Card>
              <Card className="border-border text-center">
                <CardContent className="p-5">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c0392b, #e74c3c)" }}>
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{language === "bn" ? "রিয়েল ডেটা" : "Real Data"}</h3>
                  <p className="text-xs text-muted-foreground">{language === "bn" ? "সকল কুরিয়ার কোম্পানির রিয়েল ডেটা" : "Real data from all courier companies"}</p>
                </CardContent>
              </Card>
              <Card className="border-border text-center">
                <CardContent className="p-5">
                  <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1a2744, #c0392b)" }}>
                    <Share2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">{language === "bn" ? "শেয়ারযোগ্য" : "Shareable"}</h3>
                  <p className="text-xs text-muted-foreground">{language === "bn" ? "যেকাউকে শেয়ার করুন, সবার জন্য ফ্রি" : "Share with anyone, free for everyone"}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FraudCheckerPage;
