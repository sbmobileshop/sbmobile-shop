import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductReviews from "@/components/ProductReviews";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, ArrowLeft, Minus, Plus, Share2, ChevronLeft, ChevronRight, Copy, X, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  name: string;
  name_bn: string | null;
  description: string | null;
  description_bn: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  gallery: string[] | null;
  in_stock: boolean;
  stock: number;
  category: string | null;
  brand: string | null;
  sku: string | null;
  slug: string | null;
  specifications: Record<string, string> | null;
  meta_title: string | null;
  meta_description: string | null;
  colors: string[] | null;
  product_type: string;
}

const COLOR_HEX_MAP: Record<string, string> = {
  White: "#FFFFFF", Black: "#000000", Red: "#EF4444", Blue: "#3B82F6",
  Green: "#22C55E", Gold: "#EAB308", Silver: "#A8A29E", Pink: "#EC4899",
  Purple: "#A855F7", Orange: "#F97316", Gray: "#6B7280", Navy: "#1E3A5F",
};

/* ─── Fullscreen Lightbox (Daraz-style) ─── */
const ImageLightbox: React.FC<{
  images: string[];
  startIndex: number;
  onClose: () => void;
}> = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const prev = () => { setCurrent(i => (i > 0 ? i - 1 : images.length - 1)); setScale(1); };
  const next = () => { setCurrent(i => (i < images.length - 1 ? i + 1 : 0)); setScale(1); };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    if (Math.abs(dx) > 60) dx > 0 ? prev() : next();
    touchStart.current = null;
  };

  const toggleZoom = () => setScale(s => (s === 1 ? 2.5 : 1));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 text-white shrink-0">
        <span className="text-sm font-medium">{current + 1} / {images.length}</span>
        <div className="flex gap-2">
          <button onClick={toggleZoom} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ZoomIn className="h-5 w-5" />
          </button>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={toggleZoom}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current]}
            alt=""
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
            draggable={false}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 px-4 py-3 bg-black/60 overflow-x-auto justify-center shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setScale(1); }}
              className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${i === current ? "border-accent scale-105" : "border-white/20 opacity-60"}`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/* ─── Hover Zoom Component (GadStyle-style) ─── */
const HoverZoomImage: React.FC<{
  src: string;
  alt: string;
  onClick: () => void;
  children?: React.ReactNode;
}> = ({ src, alt, onClick, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [bgPos, setBgPos] = useState("center");

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setBgPos(`${x}% ${y}%`);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-square rounded-2xl overflow-hidden border border-border cursor-crosshair group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Normal image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${isHovering ? "opacity-0" : "opacity-100"}`}
        draggable={false}
      />

      {/* Zoomed background on hover */}
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${isHovering ? "opacity-100" : "opacity-0"}`}
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "250%",
          backgroundPosition: bgPos,
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Zoom hint */}
      {!isHovering && (
        <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none md:flex hidden">
          <ZoomIn className="h-3 w-3" /> Hover to zoom
        </div>
      )}

      {children}
    </div>
  );
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("products").select("*").eq("id", id).eq("status", "active").single()
      .then(({ data }) => {
        if (data) {
          const p = data as any;
          const prod = {
            ...p,
            gallery: Array.isArray(p.gallery) ? p.gallery : [],
            specifications: p.specifications && typeof p.specifications === 'object' ? p.specifications : null,
            colors: Array.isArray(p.colors) ? p.colors : [],
          };
          setProduct(prod);
          if (prod.colors && prod.colors.length > 0) setSelectedColor(prod.colors[0]);
          if (p.meta_title) document.title = p.meta_title;
          if (p.category) {
            supabase.from("products").select("id, name, name_bn, price, old_price, image_url, in_stock")
              .eq("status", "active").eq("category", p.category).neq("id", p.id).limit(4)
              .then(({ data: related }) => { if (related) setRelatedProducts(related); });
          }
        }
        setLoading(false);
      });
  }, [id]);

  const handleAdd = () => {
    if (!product || !product.in_stock) return;
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error(language === "bn" ? "রঙ নির্বাচন করুন" : "Please select a color");
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        name_bn: product.name_bn || product.name,
        price: product.price,
        image: product.image_url || "",
        variant: selectedColor || undefined,
        product_type: product.product_type || "physical",
      });
    }
    toast.success(language === "bn" ? `${quantity}টি কার্টে যোগ হয়েছে!` : `${quantity} added to cart!`);
  };

  const handleBuyNow = () => {
    handleAdd();
    navigate("/checkout");
  };

  const allImages = product ? [product.image_url, ...(product.gallery || [])].filter(Boolean) as string[] : [];

  const share = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success(language === "bn" ? "লিংক কপি হয়েছে!" : "Link copied!");
  };

  const handleSwipeStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const handleSwipeEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null || allImages.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) {
      dx > 0
        ? setSelectedImage(i => (i > 0 ? i - 1 : allImages.length - 1))
        : setSelectedImage(i => (i < allImages.length - 1 ? i + 1 : 0));
    }
    touchStart.current = null;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-[69px]" />
      <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></main>
      <Footer />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-[69px]" />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">{language === "bn" ? "পণ্য পাওয়া যায়নি" : "Product not found"}</h2>
          <Button onClick={() => navigate("/products")}>{language === "bn" ? "পণ্য দেখুন" : "Browse Products"}</Button>
        </div>
      </main>
      <Footer />
    </div>
  );

  const shareableLink = `${window.location.origin}/product/${product.id}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="h-[69px]" />

      <AnimatePresence>
        {lightboxOpen && allImages.length > 0 && (
          <ImageLightbox images={allImages} startIndex={selectedImage} onClose={() => setLightboxOpen(false)} />
        )}
      </AnimatePresence>

      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent mb-4">
            <ArrowLeft className="h-4 w-4" /> {language === "bn" ? "পেছনে যান" : "Go Back"}
          </button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* ─── Image Gallery with Hover Zoom ─── */}
            <div>
              {/* Desktop: hover zoom | Mobile: tap to lightbox */}
              <div
                className="mb-3"
                onTouchStart={handleSwipeStart}
                onTouchEnd={handleSwipeEnd}
              >
                {allImages.length > 0 ? (
                  <>
                    {/* Desktop hover zoom */}
                    <div className="hidden md:block">
                      <HoverZoomImage
                        src={allImages[selectedImage]}
                        alt={product.name}
                        onClick={() => setLightboxOpen(true)}
                      >
                        {/* Image counter pill */}
                        {allImages.length > 1 && (
                          <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium pointer-events-none">
                            {selectedImage + 1}/{allImages.length}
                          </span>
                        )}
                        {!product.in_stock && (
                          <div className="absolute top-3 right-3 pointer-events-none">
                            <Badge variant="destructive">{language === "bn" ? "স্টক আউট" : "Out of Stock"}</Badge>
                          </div>
                        )}
                        {product.old_price && product.old_price > product.price && (
                          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground shadow-lg pointer-events-none">
                            -{Math.round((1 - product.price / product.old_price) * 100)}%
                          </Badge>
                        )}

                        {/* Nav arrows */}
                        {allImages.length > 1 && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedImage(i => i > 0 ? i - 1 : allImages.length - 1); }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <ChevronLeft className="h-4 w-4 text-foreground" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedImage(i => i < allImages.length - 1 ? i + 1 : 0); }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <ChevronRight className="h-4 w-4 text-foreground" />
                            </button>
                          </>
                        )}
                      </HoverZoomImage>
                    </div>

                    {/* Mobile: simple image with tap to lightbox */}
                    <div
                      className="md:hidden relative aspect-square bg-card rounded-2xl overflow-hidden border border-border cursor-pointer group"
                      onClick={() => setLightboxOpen(true)}
                    >
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={selectedImage}
                          src={allImages[selectedImage]}
                          alt={product.name}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-full h-full object-cover"
                        />
                      </AnimatePresence>

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <ZoomIn className="h-3.5 w-3.5" />
                          {language === "bn" ? "ছবি দেখুন" : "View Photos"}
                        </span>
                      </div>

                      {allImages.length > 1 && (
                        <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                          {selectedImage + 1}/{allImages.length}
                        </span>
                      )}

                      {!product.in_stock && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="destructive">{language === "bn" ? "স্টক আউট" : "Out of Stock"}</Badge>
                        </div>
                      )}
                      {product.old_price && product.old_price > product.price && (
                        <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground shadow-lg">
                          -{Math.round((1 - product.price / product.old_price) * 100)}%
                        </Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="aspect-square rounded-2xl overflow-hidden border border-border bg-muted flex items-center justify-center">
                    <span className="text-6xl font-bold text-muted-foreground/10 font-english">SB</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-200 ${
                        i === selectedImage
                          ? "border-accent ring-2 ring-accent/30 scale-105"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ─── Product Info ─── */}
            <div>
              {product.category && (
                <Badge variant="outline" className="mb-2 text-xs">{product.category}</Badge>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {language === "bn" ? (product.name_bn || product.name) : product.name}
              </h1>
              {product.brand && <p className="text-sm text-muted-foreground mb-3">Brand: <strong>{product.brand}</strong></p>}
              {product.sku && <p className="text-xs text-muted-foreground mb-3 font-english">SKU: {product.sku}</p>}

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-accent">৳{product.price.toLocaleString()}</span>
                {product.old_price && product.old_price > product.price && (
                  <span className="text-lg text-muted-foreground line-through">৳{product.old_price.toLocaleString()}</span>
                )}
              </div>

              <div className="flex items-center gap-2 mb-6">
                {product.in_stock ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">{language === "bn" ? `স্টকে আছে (${product.stock})` : `In Stock (${product.stock})`}</Badge>
                ) : (
                  <Badge variant="destructive">{language === "bn" ? "স্টক আউট" : "Out of Stock"}</Badge>
                )}
              </div>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-6">
                  <span className="text-sm font-medium block mb-2">{language === "bn" ? "রঙ নির্বাচন করুন:" : "Select Color:"}</span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-sm font-medium ${
                          selectedColor === color
                            ? "border-accent bg-accent/10 text-accent shadow-sm"
                            : "border-border hover:border-accent/50 text-foreground"
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-border/50 shrink-0"
                          style={{ backgroundColor: COLOR_HEX_MAP[color] || "#888" }}
                        />
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.in_stock && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm font-medium">{language === "bn" ? "পরিমাণ:" : "Quantity:"}</span>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                    <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
                    <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mb-4">
                <Button onClick={handleAdd} disabled={!product.in_stock} className="flex-1 btn-gradient !rounded-xl gap-2 !py-6">
                  <ShoppingCart className="h-5 w-5" /> {language === "bn" ? "কার্টে যোগ করুন" : "Add to Cart"}
                </Button>
                <Button onClick={handleBuyNow} disabled={!product.in_stock} variant="outline" className="flex-1 !py-6 !rounded-xl font-semibold border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  {language === "bn" ? "এখনই কিনুন" : "Buy Now"}
                </Button>
              </div>

              {/* Shareable Link */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-muted/50 rounded-xl">
                <input type="text" readOnly value={shareableLink} className="flex-1 bg-transparent text-xs font-english text-muted-foreground outline-none" />
                <Button size="sm" variant="ghost" onClick={share} className="gap-1.5 shrink-0">
                  <Copy className="h-3.5 w-3.5" /> {language === "bn" ? "কপি" : "Copy"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`, "_blank")} className="shrink-0">
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Description */}
              {(product.description || product.description_bn) && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-2">{language === "bn" ? "বিবরণ" : "Description"}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {language === "bn" ? (product.description_bn || product.description) : product.description}
                  </p>
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">{language === "bn" ? "বিস্তারিত তথ্য" : "Specifications"}</h3>
                  <div className="border border-border rounded-xl overflow-hidden">
                    {Object.entries(product.specifications).map(([key, val], i) => (
                      <div key={key} className={`flex text-sm ${i % 2 === 0 ? "bg-muted/30" : "bg-card"}`}>
                        <span className="w-1/3 px-4 py-2.5 font-medium text-foreground border-r border-border">{key}</span>
                        <span className="flex-1 px-4 py-2.5 text-muted-foreground">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Reviews */}
              <ProductReviews productId={product.id} />
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold text-foreground mb-6">{language === "bn" ? "সম্পর্কিত পণ্য" : "Related Products"}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((p: any) => (
                  <motion.div key={p.id} whileHover={{ y: -5 }}
                    className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer"
                    onClick={() => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); }}>
                    <div className="aspect-square overflow-hidden">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                        : <span className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground/20 text-3xl font-bold font-english">SB</span>}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                        {language === "bn" ? (p.name_bn || p.name) : p.name}
                      </h3>
                      <span className="font-bold text-accent">৳{p.price.toLocaleString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;
