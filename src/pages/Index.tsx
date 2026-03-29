import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import NoticeBoard from "@/components/home/NoticeBoard";
import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PaymentSection from "@/components/home/PaymentSection";
import CoursesSection from "@/components/home/CoursesSection";
import ToolsSection from "@/components/home/ToolsSection";
import AboutSection from "@/components/home/AboutSection";
import ContactSection from "@/components/home/ContactSection";
import WhyUsSection from "@/components/home/WhyUsSection";
import DeliverySection from "@/components/home/DeliverySection";
import FAQSection from "@/components/home/FAQSection";
import AbandonedCartPopup from "@/components/AbandonedCartPopup";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import SpinWheel from "@/components/SpinWheel";
import OnboardingGuide from "@/components/OnboardingGuide";
import useScrollAnimation from "@/hooks/useScrollAnimation";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Index: React.FC = () => {
  useScrollAnimation();
  const { visibility, loaded } = useSiteSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-[69px]" />
      <NoticeBoard />
      <main className="flex-1">
        {visibility.show_hero && <HeroSection />}
        {visibility.show_delivery && <DeliverySection />}
        {visibility.show_products && <FeaturedProducts />}
        {visibility.show_categories && <CategoriesSection />}
        {visibility.show_services && <ServicesSection />}
        {visibility.show_payment && <PaymentSection />}
        {visibility.show_courses && <CoursesSection />}
        {visibility.show_tools && <ToolsSection />}
        {visibility.show_why_us && <WhyUsSection />}
        <FAQSection />
        {visibility.show_about && <AboutSection />}
        {visibility.show_contact && <ContactSection />}
      </main>
      <Footer />
      <FloatingButtons />
      <AbandonedCartPopup />
      {visibility.show_pwa_prompt !== false && <PWAInstallPrompt />}
      <SpinWheel />
      <OnboardingGuide />
    </div>
  );
};

export default Index;
