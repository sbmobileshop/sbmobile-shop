import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingCart, Eye, Loader2, ChevronRight, Truck, Tag, Star, Search, X, SlidersHorizontal, ArrowUpDown, Heart } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
  description: string | null;
}

interface ReviewStats {
  [productId: string]: { avg: number; count: number };
}

const FeaturedProducts: React.FC = () => {
  const { language } = useLanguage();
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewStats, setReviewStats] = useState<ReviewStats>({});
  const [sortBy, setSortBy] = useState<string>("default");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStock, setFilterStock] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, name_bn, price, old_price, image_url, in_stock, stock, featured, category, tags, description")
        .eq("status", "active")
        .order("sort_order", { ascending: true });
      if (data) {
        setProducts(data as unknown as Product[]);
        // Fetch review stats for all products
        const { data: reviews } = await supabase
          .from("product_reviews")
          .select("product_id, rating")
          .eq("is_approved", true);
        if (reviews && reviews.length > 0) {
          const stats: ReviewStats = {};
          reviews.forEach((r: any) => {
            if (!stats[r.product_id]) stats[r.product_id] = { avg: 0, count: 0 };
            stats[r.product_id].count++;
            stats[r.product_id].avg += r.rating;
          });
          Object.keys(stats).forEach(pid => {
            stats[pid].avg = stats[pid].avg / stats[pid].count;
          });
          setReviewStats(stats);
        }
      }
      if (error) console.error("Products fetch error:", error);
      setLoading(false);
    };
    fetchProducts();

    const channel = supabase
      .channel("products-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleAdd = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    if (!p.in_stock) return;
    addItem({ id: p.id, name: p.name, name_bn: p.name_bn || p.name, price: p.price, image: p.image_url || "" });
    toast.success(language === "bn" ? "কার্টে যোগ হয়েছে!" : "Added to cart!");
  };

  if (loading) return (
    <section className="py-16 px-4 bg-background" id="products">
      <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    </section>
  );

  if (products.length === 0) return null;

  const featured = products.filter(p => p.featured);
  const others = products.filter(p => !p.featured);
  const sorted = [...featured, ...others];

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];

  // Search logic
  const query = searchQuery.trim().toLowerCase();
  const isSearching = query.length > 0;
  
  let displayList: Product[];
  let matchIds = new Set<string>();
  
  if (isSearching) {
    const matches = sorted.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.name_bn && p.name_bn.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query)) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
    const nonMatches = sorted.filter(p => !matches.includes(p));
    matchIds = new Set(matches.map(p => p.id));
    displayList = [...matches, ...nonMatches];
  } else {
    displayList = sorted;
  }

  // Apply category filter
  if (filterCategory !== "all") {
    displayList = displayList.filter(p => p.category === filterCategory);
  }

  // Apply stock filter
  if (filterStock === "instock") {
    displayList = displayList.filter(p => p.in_stock);
  } else if (filterStock === "outofstock") {
    displayList = displayList.filter(p => !p.in_stock);
  }

  // Apply sorting
  if (sortBy === "price-low") {
    displayList = [...displayList].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-high") {
    displayList = [...displayList].sort((a, b) => b.price - a.price);
  } else if (sortBy === "newest") {
    displayList = [...displayList].reverse();
  } else if (sortBy === "rating") {
    displayList = [...displayList].sort((a, b) => (reviewStats[b.id]?.avg || 0) - (reviewStats[a.id]?.avg || 0));
  }

  const displayProducts = showAll || isSearching ? displayList : displayList.slice(0, 12);

  const hasDiscount = (p: Product) => p.old_price && p.old_price > p.price;
  const discountPercent = (p: Product) => hasDiscount(p) ? Math.round((1 - p.price / p.old_price!) * 100) : 0;
  const hasFreeDelivery = (p: Product) => p.tags?.some(t => t.toLowerCase().includes("free delivery") || t.toLowerCase().includes("free-delivery"));

  return (
    <section className="py-16 px-4 bg-background overflow-x-hidden" id="products">
      <div className="container mx-auto">
        {/* Title - clearly visible above everything */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{language === "bn" ? "সকল পণ্য" : "All Products"}</h2>
          <p className="text-muted-foreground text-sm mt-1">{language === "bn" ? "সেরা মোবাইল এক্সেসরিজ কালেকশন" : "Check out our latest mobile accessories collection"}</p>
        </div>

        {/* Search Bar */}
        <div className="mb-3 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === "bn" ? "পণ্য খুঁজুন..." : "Search products..."}
              className="w-full h-10 pl-9 pr-9 rounded-full border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {isSearching && (
            <p className="text-center text-[11px] text-muted-foreground mt-1.5">
              {matchIds.size} {language === "bn" ? "টি পণ্য পাওয়া গেছে" : "products found"}
            </p>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="max-w-2xl mx-auto mb-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="h-9 px-3 rounded-full border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
            >
              <option value="default">{language === "bn" ? "ডিফল্ট" : "Default"}</option>
              <option value="price-low">{language === "bn" ? "দাম: কম → বেশি" : "Price: Low → High"}</option>
              <option value="price-high">{language === "bn" ? "দাম: বেশি → কম" : "Price: High → Low"}</option>
              <option value="newest">{language === "bn" ? "নতুন আগে" : "Newest First"}</option>
              <option value="rating">{language === "bn" ? "রেটিং" : "Top Rated"}</option>
            </select>

            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="h-9 px-3 rounded-full border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
            >
              <option value="all">{language === "bn" ? "সব ক্যাটাগরি" : "All Categories"}</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Stock filter */}
            <select
              value={filterStock}
              onChange={e => setFilterStock(e.target.value)}
              className="h-9 px-3 rounded-full border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 cursor-pointer"
            >
              <option value="all">{language === "bn" ? "সব পণ্য" : "All Stock"}</option>
              <option value="instock">{language === "bn" ? "স্টকে আছে" : "In Stock"}</option>
              <option value="outofstock">{language === "bn" ? "স্টক আউট" : "Out of Stock"}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 mt-4">
          {displayProducts.map((p, i) => {
            const isMatch = isSearching && matchIds.has(p.id);
            return (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => navigate(`/product/${p.id}`)}
                className={`group bg-card rounded-2xl overflow-hidden cursor-pointer border hover:shadow-[0_12px_32px_-8px_hsl(var(--accent)/0.15)] transition-all duration-300 flex flex-col ${
                  isMatch
                    ? "border-accent shadow-[0_0_16px_-2px_hsl(var(--accent)/0.4)] ring-2 ring-accent/30 scale-[1.02]"
                    : isSearching && !isMatch
                      ? "border-border opacity-50"
                      : "border-border hover:border-accent/30"
                }`}
              >
                {/* Image */}
                <div className="relative aspect-square bg-muted/50 flex items-center justify-center overflow-hidden">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" loading="lazy" />
                    : <span className="text-muted-foreground/15 text-5xl font-english font-bold select-none">SB</span>}
                  
                  {!p.in_stock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {language === "bn" ? "স্টক আউট" : "Out of Stock"}
                      </span>
                    </div>
                  )}

                  {p.in_stock && hasDiscount(p) && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-accent text-accent-foreground text-[11px] font-bold px-2 py-1 rounded-lg shadow-md">
                      <Tag className="h-3 w-3" />
                      -{discountPercent(p)}%
                    </div>
                  )}

                  {p.in_stock && hasFreeDelivery(p) && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">
                      <Truck className="h-3 w-3" />
                      {language === "bn" ? "ফ্রি ডেলিভারি" : "Free Delivery"}
                    </div>
                  )}

                  {p.featured && !hasFreeDelivery(p) && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-lg shadow-md">
                      <Star className="h-3 w-3 fill-current" />
                      {language === "bn" ? "ফিচার্ড" : "Featured"}
                    </div>
                  )}

                  {/* Wishlist Heart */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleItem(p.id); toast.success(isInWishlist(p.id) ? (language === "bn" ? "ফেভারিট থেকে সরানো হয়েছে" : "Removed from favorites") : (language === "bn" ? "ফেভারিটে যোগ হয়েছে" : "Added to favorites")); }}
                    className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-card transition-all z-10 active:scale-90"
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist(p.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </button>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span className="btn-gradient !py-2 !px-5 !text-xs !rounded-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="h-3.5 w-3.5" /> {language === "bn" ? "বিস্তারিত" : "Details"}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2 md:p-3.5 flex flex-col flex-1">
                  <h3 className="font-medium text-[12px] md:text-sm text-foreground line-clamp-2 mb-0.5 leading-snug group-hover:text-accent transition-colors duration-200 min-h-[2.4em]">
                    {language === "bn" ? (p.name_bn || p.name) : p.name}
                  </h3>
                  {p.description && (
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1">{p.description}</p>
                  )}
                  {/* Star Rating */}
                  {reviewStats[p.id] && reviewStats[p.id].count > 0 && (
                    <div className="flex items-center gap-1 mb-1">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`h-2.5 w-2.5 ${s <= Math.round(reviewStats[p.id].avg) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/20"}`} />
                        ))}
                      </div>
                      <span className="text-[9px] text-muted-foreground">({reviewStats[p.id].count})</span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1.5 mb-1.5">
                    <span className="font-bold text-sm md:text-base text-accent font-english">৳{p.price.toLocaleString()}</span>
                    {hasDiscount(p) && (
                      <span className="text-muted-foreground line-through text-[10px] font-english">৳{p.old_price!.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-1 mt-auto">
                    <button
                      onClick={(e) => handleAdd(e, p)}
                      disabled={!p.in_stock}
                      className="py-1.5 rounded-md text-[10px] font-semibold flex items-center justify-center gap-1 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground active:scale-[0.96] border border-accent/20 hover:border-accent"
                    >
                      <ShoppingCart className="h-2.5 w-2.5 shrink-0" />
                      {language === "bn" ? "কার্ট" : "Cart"}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (p.in_stock) { handleAdd(e, p); navigate("/checkout"); } }}
                      disabled={!p.in_stock}
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
            <Button onClick={() => setShowAll(!showAll)} variant="outline"
              className="gap-2 border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground rounded-full px-8 py-2.5 font-semibold shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.97]">
              {showAll
                ? (language === "bn" ? "কম দেখুন" : "Show Less")
                : (language === "bn" ? `সব পণ্য দেখুন (${sorted.length})` : `View All Products (${sorted.length})`)}
              <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${showAll ? "rotate-90" : ""}`} />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
