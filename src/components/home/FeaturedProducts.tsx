"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/store/settings";
import { useCart } from "@/store/cart";
import {
  ShoppingCart,
  Eye,
  Search,
  X,
  Tag,
  Star,
  Truck,
  Heart,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  nameBn: string | null;
  price: number;
  oldPrice: number | null;
  imageUrl: string | null;
  inStock: boolean;
  featured: boolean;
  category: string | null;
}

const defaultProducts: Product[] = [
  { id: "1", name: "iPhone 15 Pro Max", nameBn: "আইফোন ১৫ প্রো ম্যাক্স", price: 145000, oldPrice: 155000, imageUrl: "https://placehold.co/400x400/e63946/white?text=iPhone", inStock: true, featured: true, category: "iPhone" },
  { id: "2", name: "Samsung Galaxy S24 Ultra", nameBn: "স্যামসাং গ্যালাক্সি এস২৪ আল্ট্রা", price: 125000, oldPrice: null, imageUrl: "https://placehold.co/400x400/1d3557/white?text=Samsung", inStock: true, featured: true, category: "Samsung" },
  { id: "3", name: "AirPods Pro 2", nameBn: "এয়ারপডস প্রো ২", price: 18500, oldPrice: 22000, imageUrl: "https://placehold.co/400x400/e63946/white?text=AirPods", inStock: true, featured: true, category: "Accessories" },
  { id: "4", name: "iPhone 14", nameBn: "আইফোন ১৪", price: 85000, oldPrice: 95000, imageUrl: "https://placehold.co/400x400/1d3557/white?text=iPhone+14", inStock: true, featured: false, category: "iPhone" },
  { id: "5", name: "Samsung Galaxy A54", nameBn: "স্যামসাং গ্যালাক্সি এ৫৪", price: 45000, oldPrice: 50000, imageUrl: "https://placehold.co/400x400/e63946/white?text=Galaxy+A", inStock: true, featured: false, category: "Samsung" },
  { id: "6", name: "MagSafe Charger", nameBn: "ম্যাগসেফ চার্জার", price: 3500, oldPrice: null, imageUrl: "https://placehold.co/400x400/1d3557/white?text=Magsafe", inStock: true, featured: false, category: "Accessories" },
  { id: "7", name: "iPhone 13", nameBn: "আইফোন ১৩", price: 65000, oldPrice: 75000, imageUrl: "https://placehold.co/400x400/e63946/white?text=iPhone+13", inStock: true, featured: false, category: "iPhone" },
  { id: "8", name: "Phone Case Premium", nameBn: "ফোন কেস প্রিমিয়াম", price: 800, oldPrice: 1200, imageUrl: "https://placehold.co/400x400/1d3557/white?text=Case", inStock: true, featured: false, category: "Accessories" },
];

const FeaturedProducts = () => {
  const router = useRouter();
  const { language } = useSettings();
  const { addItem, items: cartItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setProducts(defaultProducts);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) return;
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      nameBn: product.nameBn || product.name,
      price: product.price,
      image: product.imageUrl || "",
    }, 1);
  };

  const handleBuyNow = (product: Product) => {
    if (!product.inStock) return;
    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      nameBn: product.nameBn || product.name,
      price: product.price,
      image: product.imageUrl || "",
    }, 1);
    router.push("/checkout");
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-background" id="products">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  const sorted = [...products].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;

  let displayList = sorted;
  if (isSearching) {
    const matches = sorted.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.nameBn && p.nameBn.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
    );
    const nonMatches = sorted.filter((p) => !matches.includes(p));
    displayList = [...matches, ...nonMatches];
  }

  const displayProducts = showAll || isSearching ? displayList : displayList.slice(0, 12);

  const hasDiscount = (p: Product) => p.oldPrice && p.oldPrice > p.price;
  const discountPercent = (p: Product) =>
    hasDiscount(p) ? Math.round((1 - p.price / p.oldPrice!) * 100) : 0;

  return (
    <section className="py-16 px-4 bg-background overflow-x-hidden" id="products">
      <div className="container mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            {language === "bn" ? "সকল পণ্য" : "All Products"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {language === "bn"
              ? "সেরা মোবাইল এক্সেসরিজ কালেকশন"
              : "Check out our latest mobile accessories collection"}
          </p>
        </div>

        <div className="mb-3 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "bn" ? "পণ্য খুঁজুন..." : "Search products..."}
              className="w-full pl-9 pr-9 rounded-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 mt-4">
          {displayProducts.map((p, i) => {
            const isMatch = isSearching;
            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => router.push(`/product/${p.id}`)}
                className={`group bg-card rounded-2xl overflow-hidden cursor-pointer border hover:shadow-[0_12px_32px_-8px_hsl(var(--accent)/0.15)] transition-all duration-300 flex flex-col ${
                  isMatch
                    ? "border-accent ring-2 ring-accent/30 scale-[1.02]"
                    : "border-border hover:border-accent/30"
                }`}
              >
                <div className="relative aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-muted-foreground/15 text-5xl font-english font-bold select-none">
                      SB
                    </span>
                  )}

                  {!p.inStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {language === "bn" ? "স্টক আউট" : "Out of Stock"}
                      </span>
                    </div>
                  )}

                  {p.inStock && hasDiscount(p) && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-accent text-accent-foreground text-[11px] font-bold px-2 py-1 rounded-lg shadow-md">
                      <Tag className="h-3 w-3" />
                      -{discountPercent(p)}%
                    </div>
                  )}

                  {p.featured && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">
                      <Star className="h-3 w-3 fill-current" />
                      {language === "bn" ? "ফিচার্ড" : "Featured"}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(p.id);
                    }}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-card transition-all z-10 active:scale-90"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        wishlist.includes(p.id)
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span className="btn-gradient !py-2 !px-5 !text-xs !rounded-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="h-3.5 w-3.5" />{" "}
                      {language === "bn" ? "বিস্তারিত" : "Details"}
                    </span>
                  </div>
                </div>

                <div className="p-2 md:p-3.5 flex flex-col flex-1">
                  <h3 className="font-medium text-[12px] md:text-sm text-foreground line-clamp-2 mb-0.5 leading-snug group-hover:text-accent transition-colors duration-200 min-h-[2.4em]">
                    {language === "bn" ? p.nameBn || p.name : p.name}
                  </h3>
                  <div className="flex items-baseline gap-1.5 mb-1.5">
                    <span className="font-bold text-sm md:text-base text-accent font-english">
                      ৳{p.price.toLocaleString()}
                    </span>
                    {hasDiscount(p) && (
                      <span className="text-muted-foreground line-through text-[10px] font-english">
                        ৳{p.oldPrice!.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(p);
                      }}
                      disabled={!p.inStock}
                      className="py-1.5 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground active:scale-[0.96] border border-accent/20 hover:border-accent"
                    >
                      <ShoppingCart className="h-2.5 w-2.5 shrink-0" />
                      {language === "bn" ? "কার্ট" : "Cart"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (p.inStock) {
                          handleBuyNow(p);
                        }
                      }}
                      disabled={!p.inStock}
                      className="py-1.5 rounded-md text-[10px] font-semibold flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed btn-gradient active:scale-[0.96]"
                    >
                      {language === "bn" ? "কিনুন" : "Buy"}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {!isSearching && sorted.length > 12 && (
          <div className="flex justify-center mt-10">
            <Button
              onClick={() => setShowAll(!showAll)}
              variant="outline"
              className="gap-2 border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground rounded-full px-8 py-2.5 font-semibold"
            >
              {showAll
                ? language === "bn"
                  ? "কম দেখুন"
                  : "Show Less"
                : language === "bn"
                ? `সব পণ্য দেখুন (${sorted.length})`
                : `View All Products (${sorted.length})`}
              <ChevronRight
                className={`h-4 w-4 transition-transform duration-200 ${
                  showAll ? "rotate-90" : ""
                }`}
              />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
