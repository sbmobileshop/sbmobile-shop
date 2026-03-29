import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ShoppingCart, CreditCard, Truck, RotateCcw, Phone, Shield, Clock, HelpCircle } from "lucide-react";

const faqData = [
  {
    icon: ShoppingCart,
    q_en: "How do I place an order?",
    q_bn: "কিভাবে অর্ডার করব?",
    a_en: "Browse our products, add items to cart, fill in your details (name, phone, address), choose a payment method (bKash/Nagad/COD), and confirm your order. You'll get an order confirmation instantly.",
    a_bn: "আমাদের প্রোডাক্ট ব্রাউজ করুন, কার্টে যোগ করুন, আপনার তথ্য দিন (নাম, ফোন, ঠিকানা), পেমেন্ট মেথড বাছাই করুন (বিকাশ/নগদ/COD), এবং অর্ডার নিশ্চিত করুন।",
  },
  {
    icon: CreditCard,
    q_en: "What payment methods do you accept?",
    q_bn: "কোন কোন পেমেন্ট মেথড গ্রহণ করেন?",
    a_en: "We accept bKash, Nagad, Rocket, Binance (USDT), and Cash on Delivery (COD). For mobile payments, send money to our number and enter the Transaction ID during checkout.",
    a_bn: "আমরা বিকাশ, নগদ, রকেট, বাইন্যান্স (USDT), এবং ক্যাশ অন ডেলিভারি (COD) গ্রহণ করি। মোবাইল পেমেন্টের জন্য আমাদের নম্বরে সেন্ড মানি করে Transaction ID দিন।",
  },
  {
    icon: Truck,
    q_en: "How long does delivery take?",
    q_bn: "ডেলিভারি কত দিনে পাব?",
    a_en: "Dhaka: 1-2 business days. Outside Dhaka: 2-4 business days. We use Steadfast Courier for reliable and trackable delivery across Bangladesh.",
    a_bn: "ঢাকা: ১-২ কর্মদিবস। ঢাকার বাইরে: ২-৪ কর্মদিবস। আমরা Steadfast Courier ব্যবহার করি — ট্র্যাকিং সুবিধাসহ।",
  },
  {
    icon: RotateCcw,
    q_en: "What is your return/exchange policy?",
    q_bn: "রিটার্ন/এক্সচেঞ্জ পলিসি কি?",
    a_en: "We offer 7-day replacement guarantee for manufacturing defects. Contact us within 7 days of receiving your product with photos/video of the issue.",
    a_bn: "ম্যানুফ্যাকচারিং ত্রুটির জন্য ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি দিই। প্রোডাক্ট পাওয়ার ৭ দিনের মধ্যে সমস্যার ছবি/ভিডিওসহ যোগাযোগ করুন।",
  },
  {
    icon: Shield,
    q_en: "Are products original with warranty?",
    q_bn: "প্রোডাক্ট কি আসল ও ওয়ারেন্টি আছে?",
    a_en: "Yes, all our products are 100% original with brand warranty. We source directly from authorized distributors.",
    a_bn: "হ্যাঁ, আমাদের সব প্রোডাক্ট ১০০% আসল এবং ব্র্যান্ড ওয়ারেন্টি সহ। আমরা সরাসরি অথরাইজড ডিস্ট্রিবিউটর থেকে সংগ্রহ করি।",
  },
  {
    icon: Phone,
    q_en: "How can I contact customer support?",
    q_bn: "কাস্টমার সাপোর্টে কিভাবে যোগাযোগ করব?",
    a_en: "Call us, message on Facebook/Messenger, or WhatsApp. Our support team is available 10AM-10PM every day.",
    a_bn: "কল করুন, ফেসবুক/মেসেঞ্জারে মেসেজ দিন, বা WhatsApp করুন। আমাদের সাপোর্ট টিম প্রতিদিন সকাল ১০টা-রাত ১০টা পর্যন্ত।",
  },
  {
    icon: Clock,
    q_en: "Can I track my order?",
    q_bn: "আমার অর্ডার ট্র্যাক করতে পারব?",
    a_en: "Yes! After shipping, you'll receive a tracking code. Use it on the Order Success page or contact us for live status updates.",
    a_bn: "হ্যাঁ! শিপিংয়ের পরে আপনি একটি ট্র্যাকিং কোড পাবেন। Order Success পেজে ব্যবহার করুন অথবা আমাদের সাথে যোগাযোগ করুন।",
  },
  {
    icon: HelpCircle,
    q_en: "Do you offer free delivery?",
    q_bn: "ফ্রি ডেলিভারি দেন কি?",
    a_en: "Yes, we offer free delivery on orders above ৳5,000. For orders below that, a small delivery charge applies based on your location.",
    a_bn: "হ্যাঁ, ৳৫,০০০+ অর্ডারে ফ্রি ডেলিভারি। এর কম অর্ডারে আপনার এলাকা অনুযায়ী সামান্য ডেলিভারি চার্জ প্রযোজ্য।",
  },
];

const FAQSection: React.FC = () => {
  const { language } = useLanguage();

  return (
    <section className="py-12 sm:py-16 px-4 bg-muted/30">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 scroll-animate">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground" style={{ textWrap: "balance" }}>
            {language === "bn" ? "সচরাচর জিজ্ঞাসা" : "Frequently Asked Questions"}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {language === "bn" ? "অর্ডার করার নিয়ম ও সাধারণ প্রশ্ন" : "How to order & common questions"}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-2 scroll-animate">
          {faqData.map((faq, idx) => {
            const Icon = faq.icon;
            return (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="bg-card border border-border/60 rounded-xl px-4 shadow-sm hover:shadow-md transition-shadow data-[state=open]:shadow-md data-[state=open]:border-primary/20"
              >
                <AccordionTrigger className="text-left text-sm sm:text-base font-medium py-4 gap-3 hover:no-underline [&[data-state=open]>svg]:text-primary">
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    {language === "bn" ? faq.q_bn : faq.q_en}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pl-11">
                  {language === "bn" ? faq.a_bn : faq.a_en}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
