import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  user_id: string | null;
  avatar_url?: string | null;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { language } = useLanguage();
  const { user, profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");

  const isLoggedIn = !!user;
  const userName = isLoggedIn ? (profile?.full_name || user?.email || "") : name;

  useEffect(() => {
    loadReviews();
  }, [productId]);

  useEffect(() => {
    if (isLoggedIn && profile?.full_name) setName(profile.full_name);
    if (isLoggedIn && profile?.phone) setPhone(profile.phone);
  }, [isLoggedIn, profile]);

  const loadReviews = async () => {
    const { data } = await supabase
      .from("product_reviews")
      .select("id, customer_name, rating, review_text, created_at, user_id")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch avatars for reviews with user_id
      const userIds = data.filter(r => r.user_id).map(r => r.user_id as string);
      let avatarMap: Record<string, string> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, avatar_url")
          .in("user_id", userIds);
        if (profiles) {
          profiles.forEach(p => {
            if (p.avatar_url) avatarMap[p.user_id] = p.avatar_url;
          });
        }
      }
      setReviews(data.map(r => ({
        ...r,
        avatar_url: r.user_id ? avatarMap[r.user_id] || null : null,
      })));
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reviewName = isLoggedIn ? userName : name.trim();
    if (!reviewName) { toast.error(language === "bn" ? "আপনার নাম দিন" : "Please enter your name"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      customer_name: reviewName,
      customer_phone: isLoggedIn ? (profile?.phone || null) : (phone.trim() || null),
      rating,
      review_text: text.trim() || null,
      user_id: user?.id || null,
    } as any);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(language === "bn" ? "রিভিউ সফলভাবে জমা হয়েছে!" : "Review submitted successfully!");
      loadReviews();
      if (!isLoggedIn) { setName(""); setPhone(""); }
      setRating(5); setText(""); setShowForm(false);
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          {language === "bn" ? "কাস্টমার রিভিউ" : "Customer Reviews"}
          {reviews.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({avgRating} · {reviews.length} {language === "bn" ? "টি রিভিউ" : "reviews"})
            </span>
          )}
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="gap-1.5 text-xs border-accent text-accent hover:bg-accent hover:text-accent-foreground rounded-lg">
          <Send className="h-3 w-3" /> {language === "bn" ? "রিভিউ দিন" : "Write Review"}
        </Button>
      </div>

      {reviews.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-muted/40 rounded-xl border border-border">
          <div className="text-3xl font-bold text-foreground">{avgRating}</div>
          <div>
            <div className="flex gap-0.5 mb-0.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(parseFloat(avgRating)) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/20"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{reviews.length} {language === "bn" ? "টি রিভিউ" : "reviews"}</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-muted/40 rounded-xl border border-border space-y-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2.5 p-2.5 bg-background rounded-lg border border-border">
              <Avatar className="w-8 h-8">
                {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="Profile" /> : null}
                <AvatarFallback className="text-xs bg-gradient-to-br from-accent/20 to-primary/20 text-accent font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">{userName}</span>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-1 block">{language === "bn" ? "আপনার নাম *" : "Your Name *"}</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder={language === "bn" ? "নাম লিখুন" : "Enter your name"} className="bg-background" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{language === "bn" ? "ফোন নম্বর (ঐচ্ছিক)" : "Phone (optional)"}</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="bg-background font-english" />
              </div>
            </>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">{language === "bn" ? "রেটিং" : "Rating"}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 active:scale-95">
                  <Star className={`h-7 w-7 ${star <= (hoverRating || rating) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{language === "bn" ? "আপনার মতামত" : "Your Review"}</label>
            <Textarea value={text} onChange={e => setText(e.target.value)} placeholder={language === "bn" ? "আপনার অভিজ্ঞতা লিখুন..." : "Share your experience..."} rows={3} className="bg-background" />
          </div>
          <Button type="submit" disabled={submitting} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {language === "bn" ? "রিভিউ জমা দিন" : "Submit Review"}
          </Button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <div className="flex justify-center gap-0.5 mb-2 opacity-30">
            {[1,2,3,4,5].map(s => <Star key={s} className="h-5 w-5 text-muted-foreground" />)}
          </div>
          {language === "bn" ? "এখনও কোনো রিভিউ নেই। প্রথম রিভিউ দিন!" : "No reviews yet. Be the first to review!"}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="p-4 bg-card rounded-xl border border-border">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10 shrink-0 ring-2 ring-border">
                  {r.avatar_url ? <AvatarImage src={r.avatar_url} alt={r.customer_name} /> : null}
                  <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-accent/20 to-primary/20 text-accent">
                    {r.customer_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-foreground">{r.customer_name}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} className={`h-3.5 w-3.5 ${star <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/20"}`} />
                      ))}
                    </div>
                  </div>
                  {r.review_text && <p className="text-sm text-muted-foreground leading-relaxed">{r.review_text}</p>}
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5">{new Date(r.created_at).toLocaleDateString("bn-BD")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
