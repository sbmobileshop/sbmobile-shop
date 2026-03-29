import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Cache translations to avoid duplicate API calls
const translationCache = new Map<string, string>();

export function useAutoTranslate() {
  const [translating, setTranslating] = useState(false);

  const translate = useCallback(async (text: string, context?: string): Promise<string> => {
    if (!text?.trim()) return "";
    
    const cacheKey = text.trim();
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    setTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { text: text.trim(), context },
      });

      if (error) throw error;
      
      const translated = data?.translated || "";
      if (translated) {
        translationCache.set(cacheKey, translated);
      }
      return translated;
    } catch (err: any) {
      console.error("Translation error:", err);
      if (err?.message?.includes("429")) {
        toast.error("Translation rate limited, try again later");
      } else if (err?.message?.includes("402")) {
        toast.error("Translation credits exhausted");
      }
      return "";
    } finally {
      setTranslating(false);
    }
  }, []);

  const translateMultiple = useCallback(async (fields: { text: string; context?: string }[]): Promise<string[]> => {
    setTranslating(true);
    try {
      const results = await Promise.all(
        fields.map(f => translate(f.text, f.context))
      );
      return results;
    } finally {
      setTranslating(false);
    }
  }, [translate]);

  return { translate, translateMultiple, translating };
}
