import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection: React.FC = () => {
  const { language } = useLanguage();
  const { hero } = useSiteSettings();
  const navigate = useNavigate();

  return (
    <>
      <section className="relative min-h-[80vh] flex items-center justify-center text-center overflow-hidden" id="home"
        style={{ backgroundImage: `url(${hero.hero_bg_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

        {hero.hero_video_url && (
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={hero.hero_video_url} type="video/mp4" />
          </video>
        )}
        {hero.hero_video_url && <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />}

        <div className="relative z-10 px-4 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl md:text-6xl font-bold text-white mb-4 font-english leading-[1.1]"
          >
            {hero.hero_title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-white/80 italic mb-3"
          >
            "{language === "bn" ? hero.hero_subtitle_bn : hero.hero_subtitle_en}"
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-lg text-white/65 mb-8"
          >
            {language === "bn" ? hero.hero_tagline_bn : hero.hero_tagline_en}
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => navigate("/products")}
            className="btn-gradient active:scale-[0.97]"
          >
            <span>{language === "bn" ? hero.hero_cta_text_bn : hero.hero_cta_text_en}</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </section>
      <div className="gradient-bottom-border" />
    </>
  );
};

export default HeroSection;
