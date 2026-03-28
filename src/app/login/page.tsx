"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/store/settings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { language } = useSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (formData.email === "admin@sbmobile.shop" && formData.password === "admin123") {
        router.push("/admin");
        toast.success(language === "bn" ? "অ্যাডমিন ড্যাশবোর্ড" : "Welcome to Admin Dashboard");
      } else {
        router.push("/");
        toast.success(language === "bn" ? "সফলভাবে লগইন হয়েছে" : "Successfully logged in");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {language === "bn" ? "লগইন করুন" : "Login"}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {language === "bn"
              ? "আপনার অ্যাকাউন্টে লগইন করুন"
              : "Sign in to your account"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {language === "bn" ? "ইমেইল" : "Email"}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                {language === "bn" ? "পাসওয়ার্ড" : "Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-gradient">
              {loading ? (
                <span className="animate-pulse">
                  {language === "bn" ? "লোড হচ্ছে..." : "Loading..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {language === "bn" ? "লগইন" : "Login"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {language === "bn" ? "অ্যাকাউন্ট নেই?" : "Don't have an account?"}{" "}
              <a href="/register" className="text-accent hover:underline">
                {language === "bn" ? "রেজিস্টার" : "Register"}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
