import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useNavigate } from "react-router-dom";
import { icons, Wrench, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ToolsSection: React.FC = () => {
  const { language } = useLanguage();
  const { tools } = useSiteSettings();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return tools;
    const q = search.toLowerCase();
    return tools.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.title_bn.toLowerCase().includes(q)
    );
  }, [tools, search]);

  return (
    <section className="py-16 px-4 bg-muted/30" id="tools">
      <div className="container mx-auto">
        <div className="text-center animate-on-scroll mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{language === "bn" ? "আমাদের ওয়েব টুলস" : "Our Web Tools"}</h2>
          <p className="text-muted-foreground text-sm mt-2">{language === "bn" ? "স্টুডেন্ট ও কাস্টমারদের জন্য দরকারী টুলস" : "Useful tools for students and customers"}</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mt-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={language === "bn" ? "টুলস খুঁজুন এখানে..." : "Search tools here..."}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((tool, i) => {
              const IconComp = (icons as any)[tool.icon] || Wrench;
              return (
                <motion.div
                  key={tool.title}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="tool-card-styled"
                >
                  <div className="tool-icon flex items-center justify-center">
                    <IconComp className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{language === "bn" ? tool.title_bn : tool.title}</h3>
                  {tool.link.startsWith("/") ? (
                    <button onClick={() => navigate(tool.link)} className="tool-btn">
                      {language === "bn" ? tool.btn_bn : tool.btn}
                    </button>
                  ) : (
                    <a href={tool.link} target="_blank" rel="noopener noreferrer" className="tool-btn">
                      {language === "bn" ? tool.btn_bn : tool.btn}
                    </a>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
              {language === "bn" ? "কোনো টুল পাওয়া যায়নি" : "No tools found"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ToolsSection;
