import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { X, Gift, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface SpinSegment {
  label_en: string;
  label_bn: string;
  value: string;
  color: string;
  probability: number;
}

export interface SpinWheelSettings {
  enabled: boolean;
  title_en: string;
  title_bn: string;
  subtitle_en: string;
  subtitle_bn: string;
  segments: SpinSegment[];
  show_after_seconds: number;
  show_on_exit_intent: boolean;
  max_spins_per_user: number;
  cooldown_days: number;
}

export const defaultSpinSettings: SpinWheelSettings = {
  enabled: false,
  title_en: "Spin & Win!",
  title_bn: "ঘোরান ও জিতুন!",
  subtitle_en: "Try your luck for an exclusive discount",
  subtitle_bn: "এক্সক্লুসিভ ডিসকাউন্টের জন্য ভাগ্য পরীক্ষা করুন",
  segments: [
    { label_en: "10% OFF", label_bn: "১০% ছাড়", value: "SPIN10", color: "213 50% 23%", probability: 20 },
    { label_en: "No Luck", label_bn: "ভাগ্য নেই", value: "no_luck", color: "220 14% 80%", probability: 30 },
    { label_en: "5% OFF", label_bn: "৫% ছাড়", value: "SPIN5", color: "355 78% 56%", probability: 25 },
    { label_en: "Free Ship", label_bn: "ফ্রি শিপিং", value: "FREESHIP", color: "142 71% 45%", probability: 10 },
    { label_en: "No Luck", label_bn: "ভাগ্য নেই", value: "no_luck", color: "220 14% 70%", probability: 30 },
    { label_en: "15% OFF", label_bn: "১৫% ছাড়", value: "SPIN15", color: "45 93% 48%", probability: 5 },
  ],
  show_after_seconds: 15,
  show_on_exit_intent: true,
  max_spins_per_user: 1,
  cooldown_days: 7,
};

// SVG polar coordinate helper
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

const SpinWheel: React.FC = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<SpinWheelSettings>(defaultSpinSettings);
  const [visible, setVisible] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinSegment | null>(null);
  const [rotation, setRotation] = useState(0);
  const [copied, setCopied] = useState(false);
  const hasShown = useRef(false);

  useEffect(() => {
    supabase.from("site_settings").select("setting_value").eq("setting_key", "spin_wheel").maybeSingle().then(({ data }) => {
      if (data?.setting_value) {
        setSettings({ ...defaultSpinSettings, ...(data.setting_value as any) });
      }
    });
  }, []);

  const canSpin = useCallback(() => {
    const lastSpin = localStorage.getItem("spin_last_time");
    const cooldownMs = (settings.cooldown_days || 7) * 24 * 60 * 60 * 1000;
    if (lastSpin) {
      const elapsed = Date.now() - parseInt(lastSpin);
      if (elapsed < cooldownMs) return false;
    }
    return true;
  }, [settings.cooldown_days]);

  useEffect(() => {
    if (!settings.enabled || hasShown.current) return;

    const timer = setTimeout(() => {
      if (!hasShown.current && canSpin()) {
        setVisible(true);
        hasShown.current = true;
      }
    }, settings.show_after_seconds * 1000);

    const handleExit = (e: MouseEvent) => {
      if (settings.show_on_exit_intent && e.clientY <= 5 && !hasShown.current && canSpin()) {
        setVisible(true);
        hasShown.current = true;
      }
    };

    document.addEventListener("mouseout", handleExit);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", handleExit);
    };
  }, [settings.enabled, settings.show_after_seconds, settings.show_on_exit_intent, canSpin]);

  const pickSegment = useCallback((): number => {
    const total = settings.segments.reduce((s, seg) => s + seg.probability, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < settings.segments.length; i++) {
      rand -= settings.segments[i].probability;
      if (rand <= 0) return i;
    }
    return settings.segments.length - 1;
  }, [settings.segments]);

  const handleSpin = () => {
    if (spinning || result) return;
    if (!canSpin()) {
      toast.error(language === "bn" ? "আপনি ইতিমধ্যে এই সপ্তাহে স্পিন করেছেন!" : "You already spun this week! Come back later.");
      return;
    }
    setSpinning(true);

    // Play spin tick sound
    const isMuted = localStorage.getItem("sb-sound-muted") === "true";
    let tickInterval: ReturnType<typeof setInterval> | null = null;
    if (!isMuted) {
      let tickCount = 0;
      tickInterval = setInterval(() => {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator(); const g = ctx.createGain();
          osc.type = "square"; osc.frequency.setValueAtTime(600 + Math.random() * 400, ctx.currentTime);
          g.gain.setValueAtTime(0.08, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          osc.connect(g); g.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.05);
        } catch {}
        tickCount++;
        if (tickCount > 35 && tickInterval) clearInterval(tickInterval);
      }, 120);
    }

    const winIdx = pickSegment();
    const segCount = settings.segments.length;
    const segAngle = 360 / segCount;
    const targetAngle = 360 - (winIdx * segAngle + segAngle / 2);
    const fullSpins = 5 * 360;
    const finalRotation = rotation + fullSpins + targetAngle + (Math.random() * 10 - 5);

    setRotation(finalRotation);

    setTimeout(() => {
      if (tickInterval) clearInterval(tickInterval);
      setSpinning(false);
      setResult(settings.segments[winIdx]);
      localStorage.setItem("spin_last_time", Date.now().toString());
      const count = parseInt(localStorage.getItem("spin_count") || "0") + 1;
      localStorage.setItem("spin_count", count.toString());

      if (settings.segments[winIdx].value !== "no_luck") {
        // Play win sound
        if (!isMuted) {
          const notes = [523, 659, 784, 1047];
          notes.forEach((freq, i) => {
            setTimeout(() => {
              try {
                const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                const osc = ctx.createOscillator(); const g = ctx.createGain();
                osc.type = "sine"; osc.frequency.setValueAtTime(freq, ctx.currentTime);
                g.gain.setValueAtTime(0.2, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                osc.connect(g); g.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.25);
              } catch {}
            }, i * 150);
          });
        }
        toast.success(language === "bn" ? "অভিনন্দন! আপনি জিতেছেন!" : "Congratulations! You won!");
      }
    }, 4500);
  };

  const handleCopy = () => {
    if (result && result.value !== "no_luck") {
      navigator.clipboard.writeText(result.value);
      setCopied(true);
      toast.success(language === "bn" ? "কোড কপি হয়েছে!" : "Code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // SVG wheel data
  const wheelSize = 280;
  const cx = wheelSize / 2;
  const cy = wheelSize / 2;
  const radius = cx - 6;
  const segCount = settings.segments.length;
  const segAngle = 360 / segCount;

  const svgSegments = useMemo(() => {
    return settings.segments.map((seg, i) => {
      const startAngle = i * segAngle;
      const endAngle = startAngle + segAngle;
      const d = describeArc(cx, cy, radius, startAngle, endAngle);

      // Text position: midpoint of arc, pushed inward
      const midAngle = startAngle + segAngle / 2;
      const textR = radius * 0.65;
      const textPos = polarToCartesian(cx, cy, textR, midAngle);
      const label = language === "bn" ? seg.label_bn : seg.label_en;

      return { d, color: `hsl(${seg.color})`, label, textPos, midAngle };
    });
  }, [settings.segments, language, segAngle, cx, cy, radius]);

  if (!visible || !settings.enabled) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !spinning && setVisible(false)} />
      
      <div className="relative bg-card rounded-2xl shadow-2xl border border-border/50 max-w-sm w-full p-6 animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
        
        <button
          onClick={() => !spinning && setVisible(false)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted hover:bg-muted-foreground/10 flex items-center justify-center transition-colors z-10"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            {language === "bn" ? "বিশেষ অফার" : "Special Offer"}
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {language === "bn" ? settings.title_bn : settings.title_en}
          </h3>
          <p className="text-muted-foreground text-xs mt-1">
            {language === "bn" ? settings.subtitle_bn : settings.subtitle_en}
          </p>
        </div>

        {/* SVG Wheel */}
        <div className="relative flex justify-center mb-4">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
            <svg width="24" height="28" viewBox="0 0 24 28" fill="none">
              <path d="M12 28L0 0H24L12 28Z" fill="hsl(var(--accent))" />
              <path d="M12 28L0 0H24L12 28Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          
          <div
            className="transition-transform will-change-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: spinning ? "4.5s" : "0s",
              transitionTimingFunction: "cubic-bezier(0.17, 0.67, 0.12, 0.99)",
            }}
          >
            <svg
              width={wheelSize}
              height={wheelSize}
              viewBox={`0 0 ${wheelSize} ${wheelSize}`}
              className="drop-shadow-xl"
              style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" }}
            >
              <defs>
                <filter id="wheelShadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
                </filter>
                <clipPath id="wheelClip">
                  <circle cx={cx} cy={cy} r={radius} />
                </clipPath>
              </defs>

              {/* Outer ring */}
              <circle cx={cx} cy={cy} r={radius + 3} fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity="0.5" />
              <circle cx={cx} cy={cy} r={radius} fill="none" stroke="white" strokeWidth="2" opacity="0.3" />

              {/* Segments */}
              <g clipPath="url(#wheelClip)">
                {svgSegments.map((seg, i) => (
                  <path key={i} d={seg.d} fill={seg.color} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
                ))}
              </g>

              {/* Segment labels */}
              {svgSegments.map((seg, i) => (
                <text
                  key={`t-${i}`}
                  x={seg.textPos.x}
                  y={seg.textPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="system-ui, sans-serif"
                  transform={`rotate(${seg.midAngle}, ${seg.textPos.x}, ${seg.textPos.y})`}
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}
                >
                  {seg.label}
                </text>
              ))}

              {/* Center hub */}
              <circle cx={cx} cy={cy} r="26" fill="hsl(var(--primary))" stroke="white" strokeWidth="3" />
              <circle cx={cx} cy={cy} r="22" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="11"
                fontWeight="800"
                fontFamily="system-ui, sans-serif"
                letterSpacing="1"
              >
                SPIN
              </text>
            </svg>
          </div>
        </div>

        {result ? (
          <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {result.value !== "no_luck" ? (
              <>
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <Gift className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {language === "bn" ? "আপনি জিতেছেন:" : "You won:"}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {language === "bn" ? result.label_bn : result.label_en}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-4 py-2.5 rounded-lg text-sm font-mono font-bold text-foreground tracking-wider">
                    {result.value}
                  </code>
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1.5 shrink-0">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? (language === "bn" ? "কপি হয়েছে" : "Copied") : (language === "bn" ? "কপি" : "Copy")}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "bn" ? "চেকআউটে এই কোড ব্যবহার করুন" : "Use this code at checkout"}
                </p>
              </>
            ) : (
              <div className="py-2">
                <p className="text-muted-foreground text-sm">
                  {language === "bn" ? "এবার ভাগ্য হয়নি! পরের সপ্তাহে চেষ্টা করুন।" : "No luck this time! Try again next week."}
                </p>
              </div>
            )}
            <Button onClick={() => setVisible(false)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {language === "bn" ? "বন্ধ করুন" : "Close"}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleSpin}
            disabled={spinning}
            className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.97]"
          >
            {spinning ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⟳</span>
                {language === "bn" ? "ঘুরছে..." : "Spinning..."}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                {language === "bn" ? "ভাগ্য পরীক্ষা করুন!" : "Try Your Luck!"}
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SpinWheel;
