"use client";

import React from "react";
import { useSettings } from "@/store/settings";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

const ContactSection = () => {
  const { settings, language } = useSettings();

  return (
    <section className="py-16 px-4 bg-card" id="contact">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {language === "bn" ? "যোগাযোগ করুন" : "Contact Us"}
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            {language === "bn"
              ? "যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন"
              : "Contact us for any questions"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-muted/30 rounded-2xl p-6 text-center card-hover">
            <div className="feature-icon-circle w-14 h-14 mx-auto mb-4">
              <Phone className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {language === "bn" ? "ফোন" : "Phone"}
            </h3>
            <p className="text-muted-foreground text-sm font-english">+88 {settings.phone}</p>
            <p className="text-muted-foreground text-sm font-english">+88 {settings.phone2}</p>
          </div>

          <div className="bg-muted/30 rounded-2xl p-6 text-center card-hover">
            <div className="feature-icon-circle w-14 h-14 mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">WhatsApp</h3>
            <p className="text-muted-foreground text-sm font-english">{settings.whatsapp}</p>
          </div>

          <div className="bg-muted/30 rounded-2xl p-6 text-center card-hover">
            <div className="feature-icon-circle w-14 h-14 mx-auto mb-4">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {language === "bn" ? "ইমেইল" : "Email"}
            </h3>
            <p className="text-muted-foreground text-sm font-english">{settings.email}</p>
          </div>

          <div className="bg-muted/30 rounded-2xl p-6 text-center card-hover">
            <div className="feature-icon-circle w-14 h-14 mx-auto mb-4">
              <MapPin className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              {language === "bn" ? "ঠিকানা" : "Address"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === "bn" ? settings.addressBn : settings.addressEn}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
