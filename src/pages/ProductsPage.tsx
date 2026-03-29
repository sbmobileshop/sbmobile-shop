import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ShoppingCart, Eye, Loader2, Star, Tag, Truck, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import useScrollAnimation from "@/hooks/useScrollAnimation";

interface Product {
  id: string;
  name: string;
  name_bn: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  in_stock: boolean;
  stock: number;
  featured: boolean;
  category: string | null;
  tags: string[] | null;
}

const categoryOrder = [
  "accessories", "smartphones", "earbuds", "chargers", "covers",
  "gadgets", "feature_phones", "digital",
];

const categoryLabels: Record<string, { en: string; bn: string }> = {
  accessories: { en: "Accessories", bn: "এক্সেসরিজ" },
  smartphones: { en: "Smartphones", bn: "স্মার্টফোন" },
  earbuds: { en: "Earbuds", bn: "ইয়ারবাড" },
  chargers: { en: "Chargers", bn: "চার্জার" },
  covers: { en: "Back Covers", bn: "ব্যাক কভার" },
  gadgets: { en: "Gadgets", bn: "গ্যাজেট" },
  feature_phones: { en: "Feature Phones", bn: "ফিচার ফোন" },
  digital: { en: "Digital Products", bn: "ডিজিটাল প্রোডাক্ট" },
  uncategorized: { en: "Other Products", bn: "অন্যান্য পণ্য" },
};

const ProductsPage: React.FC = () => {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useScrollAnimation();

  useEffect(() => {
    supabase.from("products")
      .select("id, name, name_bn, price, old_price, image_url, in_stock, stock, featured, category, tags")
      .eq("status", "active")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setProducts(data as unknown as Product[]);
        setLoading(false);
      });
  }, []);

  const handleAdd = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    if (!p.in_stock) return;
    addItem({ id: p.id, name: p.name, name_bn: p.name_bn || p.name, price: p.price, image: p.image_url || "" });
    toast.success(language === "bn" ? "কার্টে যোগ হয়েছে!" : "Added to cart!");
  };

  const hasDiscount = (p: Product) => p.old_price && p.old_price > p.price;
  const discountPercent = (p: Product) => hasDiscount(p) ? Math.round((1 - p.price / p.old_price!) * 100) : 0;
  const hasFreeDelivery = (p: Product) => p.tags?.some(t => t.toLowerCase().includes("free delivery") || t.toLowerCase().includes("free-delivery"));

  // Group by category
  const grouped = new Map<string, Product[]>();
  for (const cat of categoryOrder) {
    const items = products.filter(p => p.category === cat);
    if (items.length > 0) grouped.set(cat, items);
  }
  const remaining = products.filter(p => !categoryOrder.includes(p.category || ""));
  if (remaining.length > 0) grouped.set("uncategorized", remaining);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-[69px]" />
      <main className="flex-1 bg-muted/30">
        {/* Page Header */}
        <div className="relative py-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{language === "bn" ? "আমাদের সকল পণ্য" : "All Products"}</h1>
            <p className="text-white/70 mt-1.5 text-sm">{products.length} {language === "bn" ? "টি পণ্য পাওয়া গেছে" : "products found"}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">{language === "bn" ? "কোনো পণ্য পাওয়া যায়নি" : "No products found"}</div>
        ) : (
          <div className="container mx-auto px-4 py-8 space-y-12">
            {Array.from(grouped.entries()).map(([cat, items]) => (
              <section key={cat}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-accent to-primary" />
                  <h2 className="text-xl font-bold text-foreground">
                    {language === "bn" ? (categoryLabels[cat]?.bn || cat) : (categoryLabels[cat]?.en || cat)}
                  </h2>
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">{items.length}</span>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {items.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 14, filter: "blur(3px)" }}
                      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ delay: i * 0.03, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => navigate(`/product/${p.id}`)}
                      className="bg-card rounded-2xl overflow-hidden cursor-pointer group border border-border hover:border-accent/30 hover:shadow-[0_8px_24px_-6px_hsl(var(--accent)/0.12)] transition-all duration-300"
                    >
                      <div className="relative aspect-square bg-muted/40 flex items-center justify-center overflow-hidden">
                        {p.image_url
                          ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" loading="lazy" />
                          : <span className="text-muted-foreground/15 text-5xl font-english font-bold select-none">SB</span>}
                        
                        {/* Out of stock */}
                        {!p.in_stock && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                              {language === "bn" ? "স্টক আউট" : "Out of Stock"}
                            </span>
                          </div>
                        )}

                        {/* Discount badge */}
                        {p.in_stock && hasDiscount(p) && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-accent text-accent-foreground text-[11px] font-bold px-2 py-1 rounded-lg shadow-md">
                            <Tag className="h-3 w-3" />
                            -{discountPercent(p)}%
                          </div>
                        )}

                        {/* Free delivery */}
                        {p.in_stock && hasFreeDelivery(p) && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">
                            <Truck className="h-3 w-3" />
                            {language === "bn" ? "ফ্রি" : "Free"}
                          </div>
                        )}

                        {/* Featured */}
                        {p.featured && !hasFreeDelivery(p) && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">
                            <Star className="h-3 w-3 fill-current" />
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                          <span className="bg-white text-foreground px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <Eye className="h-3.5 w-3.5" /> {language === "bn" ? "বিস্তারিত" : "View"}
                          </span>
                        </div>
                      </div>

                      <div className="p-3">
                        <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1.5 leading-snug group-hover:text-accent transition-colors min-h-[2.5em]">
                          {language === "bn" ? (p.name_bn || p.name) : p.name}
                        </h3>
                        <div className="flex items-baseline gap-2 mb-2.5">
                          <span className="font-bold text-base text-accent font-english">৳{p.price.toLocaleString()}</span>
                          {hasDiscount(p) && <span className="text-muted-foreground line-through text-xs font-english">৳{p.old_price!.toLocaleString()}</span>}
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={(e) => handleAdd(e, p)} disabled={!p.in_stock}
                            className="flex-1 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground active:scale-[0.97] border border-accent/20 hover:border-accent">
                            <ShoppingCart className="h-3 w-3" />
                            <span className="hidden sm:inline">{language === "bn" ? "কার্ট" : "Cart"}</span>
                            <span className="sm:hidden">+</span>
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); if (p.in_stock) { handleAdd(e, p); navigate("/checkout"); } }}
                            disabled={!p.in_stock}
                            className="flex-1 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed btn-gradient active:scale-[0.97]">
                            <Zap className="h-3 w-3" />
                            {language === "bn" ? "কিনুন" : "Buy"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;
