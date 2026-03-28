import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PaymentSection from "@/components/home/PaymentSection";
import CoursesSection from "@/components/home/CoursesSection";
import ToolsSection from "@/components/home/ToolsSection";
import AboutSection from "@/components/home/AboutSection";
import ContactSection from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturedProducts />
      <PaymentSection />
      <CoursesSection />
      <ToolsSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
