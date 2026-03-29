import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Megaphone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NoticeBoard: React.FC = () => {
  const { language } = useLanguage();
  const [notice, setNotice] = useState<{ text_bn: string; text_en: string; enabled: boolean } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("setting_value").eq("setting_key", "banner_offers").maybeSingle()
      .then(({ data }) => {
        if (data?.setting_value) {
          const val = data.setting_value as any;
          if (val.notice_enabled) {
            setNotice({ text_bn: val.notice_text_bn || "", text_en: val.notice_text_en || "", enabled: true });
          }
        }
      });
  }, []);

  if (!notice || !notice.enabled || dismissed) return null;

  const text = language === "bn" ? notice.text_bn : notice.text_en;
  if (!text) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-accent text-accent-foreground overflow-hidden"
      >
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Megaphone className="h-4 w-4 shrink-0 animate-pulse" />
            <p className="text-sm font-medium truncate">{text}</p>
          </div>
          <button onClick={() => setDismissed(true)} className="shrink-0 p-1 hover:bg-white/20 rounded transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NoticeBoard;
