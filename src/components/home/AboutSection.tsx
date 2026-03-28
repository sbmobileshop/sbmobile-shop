"use client";

import React from "react";
import { useSettings } from "@/store/settings";

const AboutSection = () => {
  const { settings, language } = useSettings();

  return (
    <section className="py-16 px-4 bg-muted/30" id="about">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              {language === "bn" ? "আমাদের সম্পর্কে" : "About Us"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === "bn"
                ? "SB Mobile Shop বাংলাদেশের অন্যতম নির্ভরযোগ্য অনলাইন মোবাইল ও গ্যাজেট শপ। আমরা সারাদেশে মোবাইল ফোন, এক্সেসরিজ, এবং বিভিন্ন ডিজিটাল প্রোডাক্ট সরবরাহ করে থাকি।"
                : "SB Mobile Shop is one of the most trusted online mobile and gadget shops in Bangladesh. We supply mobile phones, accessories, and various digital products across the country."}
            </p>
            <p className="text-muted-foreground">
              {language === "bn"
                ? "আমাদের লক্ষ্য হলো গ্রাহকদের সর্বোত্তম মানের পণ্য এবং সেবা প্রদান করা।"
                : "Our goal is to provide our customers with the best quality products and services."}
            </p>
          </div>
          <div className="relative">
            <img
              src="https://placehold.co/600x400/1d3557/white?text=About+Us"
              alt="About SB Mobile Shop"
              className="rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
