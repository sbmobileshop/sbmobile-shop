import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const CoursesSection: React.FC = () => {
  const { language } = useLanguage();
  const { courses } = useSiteSettings();

  return (
    <section className="py-12 md:py-16 bg-secondary/30" id="courses">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 text-center">
          {language === "bn" ? "আমাদের কোর্স" : "Our Courses"}
        </h2>
        <p className="text-muted-foreground text-center mb-8 max-w-lg mx-auto">
          {language === "bn" ? "প্রফেশনাল মোবাইল রিপেয়ার ও সফটওয়্যার ট্রেনিং" : "Professional mobile repair and software training"}
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {courses.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <Card className="border-border overflow-hidden hover:shadow-lg transition-shadow h-full">
                <img src={c.image} alt={language === "bn" ? c.title_bn : c.title_en} className="w-full h-48 object-cover" loading="lazy" />
                <CardContent className="p-5">
                  <h3 className="font-semibold text-lg text-card-foreground mb-2">{language === "bn" ? c.title_bn : c.title_en}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{language === "bn" ? c.desc_bn : c.desc_en}</p>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(c.link, "_blank")}>
                    {language === "bn" ? "বিস্তারিত" : "Learn More"} <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" size="sm" onClick={() => window.open("https://www.facebook.com/groups/827484245995152/?mibextid=K35XfP", "_blank")}>
            {language === "bn" ? "স্টুডেন্ট গ্রুপ" : "Students Group"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open("https://verifysbid.weebly.com/", "_blank")}>
            {language === "bn" ? "স্টুডেন্ট ভেরিফাই" : "Student Verify"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open("https://forms.gle/evqxBddUoDLrCQKk8", "_blank")}>
            {language === "bn" ? "কোর্সে ভর্তি" : "Course Admission"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
