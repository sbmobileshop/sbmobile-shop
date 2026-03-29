import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const RegisterPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      toast.error(language === "bn" ? "সব ফিল্ড পূরণ করুন" : "Fill all fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error(language === "bn" ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" : "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.name, form.phone);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(language === "bn" ? "অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল ভেরিফাই করুন।" : "Account created! Check your email to verify.");
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-secondary/30 py-12">
        <div className="w-full max-w-md mx-4">
          <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
                <span className="font-english font-bold text-primary-foreground text-lg">SB</span>
              </div>
              <h1 className="text-2xl font-bold text-card-foreground">{t("auth.register_title")}</h1>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input id="email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input id="password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="mt-1.5" minLength={6} />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t("auth.register_btn")}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {t("auth.have_account")} <Link to="/login" className="text-accent hover:underline font-medium">{t("nav.login")}</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;
