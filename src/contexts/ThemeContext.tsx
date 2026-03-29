import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ThemePreset {
  id: string;
  name: string;
  name_bn: string;
  primary: string;
  accent: string;
  background: string;
  card: string;
  foreground: string;
  muted: string;
  border: string;
  sidebar_bg: string;
  gradient_from: string;
  gradient_to: string;
}

export const themePresets: ThemePreset[] = [
  {
    id: "default",
    name: "Red & Navy (Default)",
    name_bn: "লাল ও নেভি (ডিফল্ট)",
    primary: "213 50% 23%",
    accent: "355 78% 56%",
    background: "220 20% 97%",
    card: "0 0% 100%",
    foreground: "0 0% 20%",
    muted: "220 14% 96%",
    border: "220 13% 91%",
    sidebar_bg: "213 50% 18%",
    gradient_from: "355 78% 56%",
    gradient_to: "213 50% 23%",
  },
  {
    id: "ocean",
    name: "Ocean Blue",
    name_bn: "সমুদ্র নীল",
    primary: "200 80% 30%",
    accent: "185 75% 40%",
    background: "200 15% 97%",
    card: "0 0% 100%",
    foreground: "200 25% 15%",
    muted: "200 10% 95%",
    border: "200 10% 89%",
    sidebar_bg: "200 80% 20%",
    gradient_from: "185 75% 40%",
    gradient_to: "200 80% 30%",
  },
  {
    id: "forest",
    name: "Forest Green",
    name_bn: "বন সবুজ",
    primary: "155 50% 22%",
    accent: "142 60% 42%",
    background: "140 12% 97%",
    card: "0 0% 100%",
    foreground: "150 20% 15%",
    muted: "140 10% 95%",
    border: "140 10% 89%",
    sidebar_bg: "155 50% 16%",
    gradient_from: "142 60% 42%",
    gradient_to: "155 50% 22%",
  },
  {
    id: "royal",
    name: "Royal Purple",
    name_bn: "রাজকীয় বেগুনি",
    primary: "270 45% 30%",
    accent: "280 60% 50%",
    background: "270 12% 97%",
    card: "0 0% 100%",
    foreground: "270 20% 15%",
    muted: "270 10% 95%",
    border: "270 10% 89%",
    sidebar_bg: "270 45% 20%",
    gradient_from: "280 60% 50%",
    gradient_to: "270 45% 30%",
  },
  {
    id: "sunset",
    name: "Sunset Orange",
    name_bn: "সূর্যাস্ত কমলা",
    primary: "20 30% 20%",
    accent: "25 90% 55%",
    background: "30 15% 97%",
    card: "0 0% 100%",
    foreground: "20 25% 15%",
    muted: "30 10% 95%",
    border: "30 10% 89%",
    sidebar_bg: "20 30% 14%",
    gradient_from: "25 90% 55%",
    gradient_to: "20 30% 20%",
  },
  {
    id: "rosegold",
    name: "Rose Gold",
    name_bn: "রোজ গোল্ড",
    primary: "340 35% 28%",
    accent: "350 55% 58%",
    background: "340 12% 97%",
    card: "0 0% 100%",
    foreground: "340 20% 15%",
    muted: "340 10% 95%",
    border: "340 10% 89%",
    sidebar_bg: "340 35% 18%",
    gradient_from: "350 55% 58%",
    gradient_to: "340 35% 28%",
  },
];

export interface CustomThemeColors {
  primary: string;
  accent: string;
  background: string;
  card: string;
  foreground: string;
  muted: string;
  border: string;
  sidebar_bg: string;
  gradient_from: string;
  gradient_to: string;
}

export const defaultCustomColors: CustomThemeColors = {
  primary: "213 50% 23%",
  accent: "355 78% 56%",
  background: "220 20% 97%",
  card: "0 0% 100%",
  foreground: "0 0% 20%",
  muted: "220 14% 96%",
  border: "220 13% 91%",
  sidebar_bg: "213 50% 18%",
  gradient_from: "355 78% 56%",
  gradient_to: "213 50% 23%",
};

interface ThemeContextValue {
  activeTheme: string;
  customColors: CustomThemeColors;
  setTheme: (id: string) => void;
  setCustomColors: (colors: CustomThemeColors) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  activeTheme: "default",
  customColors: defaultCustomColors,
  setTheme: () => {},
  setCustomColors: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTheme, setActiveTheme] = useState("default");
  const [customColors, setCustomColorsState] = useState<CustomThemeColors>(defaultCustomColors);

  useEffect(() => {
    supabase.from("site_settings").select("setting_value").eq("setting_key", "active_theme").maybeSingle()
      .then(({ data }) => {
        if (data?.setting_value) {
          const val = data.setting_value as any;
          const themeId = val.theme_id || "default";
          setActiveTheme(themeId);
          if (themeId === "custom" && val.custom_colors) {
            const cc = { ...defaultCustomColors, ...val.custom_colors };
            setCustomColorsState(cc);
            applyCustomColors(cc);
          } else {
            applyTheme(themeId);
          }
        }
      });
  }, []);

  const applyColors = (colors: {
    primary: string; accent: string; background: string; card: string;
    foreground: string; muted: string; border: string; sidebar_bg: string;
    gradient_from: string; gradient_to: string;
  }) => {
    const root = document.documentElement;
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--card", colors.card);
    root.style.setProperty("--foreground", colors.foreground);
    root.style.setProperty("--card-foreground", colors.foreground);
    root.style.setProperty("--popover", colors.card);
    root.style.setProperty("--popover-foreground", colors.foreground);
    root.style.setProperty("--muted", colors.muted);
    root.style.setProperty("--border", colors.border);
    root.style.setProperty("--input", colors.border);
    root.style.setProperty("--ring", colors.accent);
    root.style.setProperty("--brand-red", colors.accent);
    root.style.setProperty("--brand-navy", colors.primary);
    root.style.setProperty("--sidebar-background", colors.sidebar_bg);
    root.style.setProperty("--sidebar-primary", colors.accent);
    root.style.setProperty("--sidebar-accent", colors.primary);
    root.style.setProperty("--sidebar-border", colors.primary);
    root.style.setProperty("--sidebar-ring", colors.accent);
    const gradientStyle = `linear-gradient(135deg, hsl(${colors.gradient_from}) 0%, hsl(${colors.gradient_to}) 100%)`;
    root.style.setProperty("--brand-gradient", gradientStyle);
  };

  const applyTheme = (id: string) => {
    const preset = themePresets.find(t => t.id === id) || themePresets[0];
    applyColors(preset);
  };

  const applyCustomColors = (colors: CustomThemeColors) => {
    applyColors(colors);
  };

  const setTheme = (id: string) => {
    setActiveTheme(id);
    if (id === "custom") {
      applyCustomColors(customColors);
    } else {
      applyTheme(id);
    }
  };

  const setCustomColors = (colors: CustomThemeColors) => {
    setCustomColorsState(colors);
    if (activeTheme === "custom") {
      applyCustomColors(colors);
    }
  };

  return (
    <ThemeContext.Provider value={{ activeTheme, customColors, setTheme, setCustomColors }}>
      {children}
    </ThemeContext.Provider>
  );
};
