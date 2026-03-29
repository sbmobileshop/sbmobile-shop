import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, Copy, Upload, FileText, ExternalLink, X, Clock } from "lucide-react";

interface LandingPageReview {
  name: string;
  text: string;
  rating: number;
}

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  description: string;
  hero_image: string;
  hero_title: string;
  hero_subtitle: string;
  cta_text: string;
  cta_link: string;
  product_ids: string[];
  is_active: boolean;
  bg_color: string;
  offer_end_date: string;
  offer_label: string;
  features: string[];
  created_at: string;
  // New customizable sections
  about_text?: string;
  about_text_bn?: string;
  author_name?: string;
  author_bio?: string;
  author_bio_bn?: string;
  author_image?: string;
  why_buy_points?: string[];
  why_buy_points_bn?: string[];
  reviews?: LandingPageReview[];
  show_about?: boolean;
  show_author?: boolean;
  show_reviews?: boolean;
  show_why_buy?: boolean;
  show_gallery?: boolean;
  show_specs?: boolean;
  show_contact_bar?: boolean;
  contact_text?: string;
  contact_text_bn?: string;
}

const defaultPage: Partial<LandingPage> = {
  title: "", slug: "", description: "", hero_image: "", hero_title: "",
  hero_subtitle: "", cta_text: "এখনই অর্ডার করুন", cta_link: "",
  product_ids: [], is_active: true, bg_color: "#ffffff",
  offer_end_date: "", offer_label: "🔥 সীমিত সময়ের অফার!",
  features: [], about_text: "", about_text_bn: "", author_name: "", author_bio: "",
  author_bio_bn: "", author_image: "", why_buy_points: [], why_buy_points_bn: [],
  reviews: [], show_about: true, show_author: false, show_reviews: true,
  show_why_buy: true, show_gallery: true, show_specs: true, show_contact_bar: true,
  contact_text: "", contact_text_bn: "",
};

const AdminLandingPages: React.FC = () => {
  const { language } = useLanguage();
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string; image_url: string | null; price: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPage, setEditPage] = useState<Partial<LandingPage>>(defaultPage);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFeature, setNewFeature] = useState("");
  const [newWhyBuy, setNewWhyBuy] = useState("");
  const [newReview, setNewReview] = useState<LandingPageReview>({ name: "", text: "", rating: 5 });

  useEffect(() => { loadPages(); loadProducts(); }, []);

  const loadPages = async () => {
    setLoading(true);
    const { data } = await supabase.from("site_settings").select("*").eq("setting_key", "landing_pages").maybeSingle();
    if (data?.setting_value) setPages((data.setting_value as any) || []);
    setLoading(false);
  };

  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("id, name, image_url, price").eq("status", "active").order("name");
    if (data) setProducts(data);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]; if (!file) return;
      setUploading(true);
      const ext = file.name.split(".").pop();
      const path = `landing/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) { toast.error(error.message); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
      setEditPage(p => ({ ...p, hero_image: urlData.publicUrl }));
      setUploading(false);
      toast.success("Uploaded!");
    };
    input.click();
  };

  const handleSave = async () => {
    if (!editPage.title?.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    const slug = editPage.slug?.trim() || generateSlug(editPage.title!);
    const pageData: LandingPage = {
      id: editPage.id || crypto.randomUUID(),
      title: editPage.title!.trim(),
      slug,
      description: editPage.description || "",
      hero_image: editPage.hero_image || "",
      hero_title: editPage.hero_title || "",
      hero_subtitle: editPage.hero_subtitle || "",
      cta_text: editPage.cta_text || "এখনই অর্ডার করুন",
      cta_link: editPage.cta_link || "",
      product_ids: editPage.product_ids || [],
      is_active: editPage.is_active ?? true,
      bg_color: editPage.bg_color || "#ffffff",
      offer_end_date: editPage.offer_end_date || "",
      offer_label: editPage.offer_label || "",
      features: editPage.features || [],
      created_at: editPage.created_at || new Date().toISOString(),
      about_text: editPage.about_text || "",
      about_text_bn: editPage.about_text_bn || "",
      author_name: editPage.author_name || "",
      author_bio: editPage.author_bio || "",
      author_bio_bn: editPage.author_bio_bn || "",
      author_image: editPage.author_image || "",
      why_buy_points: editPage.why_buy_points || [],
      why_buy_points_bn: editPage.why_buy_points_bn || [],
      reviews: editPage.reviews || [],
      show_about: editPage.show_about ?? true,
      show_author: editPage.show_author ?? false,
      show_reviews: editPage.show_reviews ?? true,
      show_why_buy: editPage.show_why_buy ?? true,
      show_gallery: editPage.show_gallery ?? true,
      show_specs: editPage.show_specs ?? true,
      show_contact_bar: editPage.show_contact_bar ?? true,
      contact_text: editPage.contact_text || "",
      contact_text_bn: editPage.contact_text_bn || "",
    };

    const updated = isEditing ? pages.map(p => p.id === pageData.id ? pageData : p) : [...pages, pageData];
    const { data: existing } = await supabase.from("site_settings").select("id").eq("setting_key", "landing_pages").maybeSingle();
    let error;
    if (existing) {
      ({ error } = await supabase.from("site_settings").update({ setting_value: updated as any }).eq("setting_key", "landing_pages"));
    } else {
      ({ error } = await supabase.from("site_settings").insert({ setting_key: "landing_pages", setting_value: updated as any }));
    }
    if (error) toast.error(error.message);
    else { toast.success("Landing page saved!"); setPages(updated); setDialogOpen(false); }
    setSaving(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this landing page?")) return;
    const updated = pages.filter(p => p.id !== id);
    supabase.from("site_settings").select("id").eq("setting_key", "landing_pages").maybeSingle().then(({ data: existing }) => {
      if (existing) {
        supabase.from("site_settings").update({ setting_value: updated as any }).eq("setting_key", "landing_pages").then(() => {
          setPages(updated); toast.success("Deleted!");
        });
      }
    });
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/landing/${slug}`);
    toast.success("Link copied!");
  };

  const toggleProduct = (productId: string) => {
    setEditPage(prev => {
      const ids = prev.product_ids || [];
      return { ...prev, product_ids: ids.includes(productId) ? ids.filter(id => id !== productId) : [...ids, productId] };
    });
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setEditPage(p => ({ ...p, features: [...(p.features || []), newFeature.trim()] }));
    setNewFeature("");
  };

  const removeFeature = (index: number) => {
    setEditPage(p => ({ ...p, features: (p.features || []).filter((_, i) => i !== index) }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6" />
          {language === "bn" ? "ল্যান্ডিং পেজ" : "Landing Pages"}
        </h1>
        <Button onClick={() => { setEditPage({ ...defaultPage }); setIsEditing(false); setDialogOpen(true); }} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <Plus className="h-4 w-4" /> {language === "bn" ? "নতুন পেজ" : "New Page"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : pages.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          {language === "bn" ? "কোনো ল্যান্ডিং পেজ নেই। উপরে 'নতুন পেজ' ক্লিক করুন।" : "No landing pages yet. Click 'New Page' above."}
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {pages.map(page => (
            <Card key={page.id} className="border-border">
              <CardContent className="p-4 flex items-center gap-4">
                {page.hero_image && <img src={page.hero_image} alt={page.title} className="w-20 h-14 object-cover rounded-lg border" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">{page.title}</h3>
                    <Badge variant={page.is_active ? "default" : "secondary"} className="text-[10px]">{page.is_active ? "Active" : "Draft"}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">/landing/{page.slug} · {page.product_ids.length} products</p>
                  {page.offer_end_date && (
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> Timer ends: {new Date(page.offer_end_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button size="icon" variant="ghost" onClick={() => copyLink(page.slug)} title="Copy Link"><Copy className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => window.open(`/landing/${page.slug}`, "_blank")}><ExternalLink className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { setEditPage({ ...page }); setIsEditing(true); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(page.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Landing Page" : "Create Landing Page"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Page Title *</Label>
                <Input value={editPage.title || ""} onChange={e => setEditPage(p => ({ ...p, title: e.target.value, slug: p.slug || generateSlug(e.target.value) }))} className="mt-1.5" />
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input value={editPage.slug || ""} onChange={e => setEditPage(p => ({ ...p, slug: e.target.value }))} className="mt-1.5 font-english" />
              </div>
            </div>

            <div>
              <Label>Hero Image</Label>
              <div className="mt-2 flex items-center gap-3">
                {editPage.hero_image && <img src={editPage.hero_image} alt="" className="w-32 h-20 object-cover rounded-lg border" />}
                <Button size="sm" variant="outline" onClick={handleImageUpload} disabled={uploading} className="gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Upload
                </Button>
              </div>
              <Input placeholder="Or paste image URL..." value={editPage.hero_image || ""} onChange={e => setEditPage(p => ({ ...p, hero_image: e.target.value }))} className="mt-2 font-english text-xs" />
            </div>

            <div>
              <Label>Hero Title</Label>
              <Input value={editPage.hero_title || ""} onChange={e => setEditPage(p => ({ ...p, hero_title: e.target.value }))} className="mt-1.5" />
            </div>
            <div>
              <Label>Hero Subtitle</Label>
              <Textarea value={editPage.hero_subtitle || ""} onChange={e => setEditPage(p => ({ ...p, hero_subtitle: e.target.value }))} className="mt-1.5" rows={2} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>CTA Button Text</Label>
                <Input value={editPage.cta_text || ""} onChange={e => setEditPage(p => ({ ...p, cta_text: e.target.value }))} className="mt-1.5" />
              </div>
              <div>
                <Label>Offer Banner Text</Label>
                <Input value={editPage.offer_label || ""} onChange={e => setEditPage(p => ({ ...p, offer_label: e.target.value }))} className="mt-1.5" placeholder="🔥 সীমিত সময়ের অফার!" />
              </div>
            </div>

            {/* Timer */}
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <Label className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-accent" />
                Countdown Timer End Date
              </Label>
              <Input type="datetime-local" value={editPage.offer_end_date || ""} onChange={e => setEditPage(p => ({ ...p, offer_end_date: e.target.value }))} className="font-english" />
              <p className="text-[10px] text-muted-foreground mt-1">Leave empty to hide the countdown timer</p>
            </div>

            {/* Features */}
            <div>
              <Label className="mb-2 block">Features / USP Points</Label>
              <div className="space-y-1.5 mb-2">
                {(editPage.features || []).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                    <span className="text-sm flex-1">{f}</span>
                    <button onClick={() => removeFeature(i)} className="text-destructive hover:text-destructive/80"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addFeature(); }}} placeholder="Add feature point..." className="flex-1" />
                <Button type="button" size="sm" variant="outline" onClick={addFeature}>Add</Button>
              </div>
            </div>

            {/* Section Visibility Toggles */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
              <Label className="font-bold text-sm">Section Visibility Controls</Label>
              {[
                { key: "show_about", label: "About / Description Section" },
                { key: "show_why_buy", label: "Why Buy From Us Section" },
                { key: "show_reviews", label: "Customer Reviews Section" },
                { key: "show_author", label: "Author / Brand Section" },
                { key: "show_gallery", label: "Product Gallery Images" },
                { key: "show_specs", label: "Specifications Section" },
                { key: "show_contact_bar", label: "Contact Bar" },
              ].map(s => (
                <div key={s.key} className="flex items-center gap-3">
                  <Switch checked={(editPage as any)[s.key] ?? true} onCheckedChange={v => setEditPage(p => ({ ...p, [s.key]: v }))} />
                  <Label className="text-xs">{s.label}</Label>
                </div>
              ))}
            </div>

            {/* About Section */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
              <Label className="font-bold text-sm">📖 About / Description Section</Label>
              <div>
                <Label className="text-xs">About Text (English)</Label>
                <Textarea value={editPage.about_text || ""} onChange={e => setEditPage(p => ({ ...p, about_text: e.target.value }))} className="mt-1" rows={3} placeholder="Write about your product..." />
              </div>
              <div>
                <Label className="text-xs">About Text (বাংলা)</Label>
                <Textarea value={editPage.about_text_bn || ""} onChange={e => setEditPage(p => ({ ...p, about_text_bn: e.target.value }))} className="mt-1" rows={3} placeholder="পণ্য সম্পর্কে লিখুন..." />
              </div>
            </div>

            {/* Why Buy Points */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
              <Label className="font-bold text-sm">🛡️ Why Buy From Us Points</Label>
              <div className="space-y-1.5 mb-2">
                {(editPage.why_buy_points || []).map((p, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border">
                    <span className="text-sm flex-1">{p}</span>
                    <button onClick={() => setEditPage(prev => ({ ...prev, why_buy_points: (prev.why_buy_points || []).filter((_, idx) => idx !== i) }))} className="text-destructive"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={newWhyBuy} onChange={e => setNewWhyBuy(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (newWhyBuy.trim()) { setEditPage(p => ({ ...p, why_buy_points: [...(p.why_buy_points || []), newWhyBuy.trim()] })); setNewWhyBuy(""); } }}} placeholder="e.g. 100% Original Product" className="flex-1" />
                <Button type="button" size="sm" variant="outline" onClick={() => { if (newWhyBuy.trim()) { setEditPage(p => ({ ...p, why_buy_points: [...(p.why_buy_points || []), newWhyBuy.trim()] })); setNewWhyBuy(""); } }}>Add</Button>
              </div>
            </div>

            {/* Reviews */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
              <Label className="font-bold text-sm">⭐ Customer Reviews</Label>
              <div className="space-y-2 mb-2">
                {(editPage.reviews || []).map((r, i) => (
                  <div key={i} className="p-2 rounded-lg bg-background border border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{r.name} — {"⭐".repeat(r.rating)}</span>
                      <button onClick={() => setEditPage(prev => ({ ...prev, reviews: (prev.reviews || []).filter((_, idx) => idx !== i) }))} className="text-destructive"><X className="h-3.5 w-3.5" /></button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.text}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2">
                <Input value={newReview.name} onChange={e => setNewReview(r => ({ ...r, name: e.target.value }))} placeholder="Reviewer name" />
                <select value={newReview.rating} onChange={e => setNewReview(r => ({ ...r, rating: Number(e.target.value) }))} className="border rounded-md px-2 text-sm bg-background">
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                </select>
              </div>
              <Textarea value={newReview.text} onChange={e => setNewReview(r => ({ ...r, text: e.target.value }))} placeholder="Review text..." rows={2} />
              <Button type="button" size="sm" variant="outline" onClick={() => { if (newReview.name.trim() && newReview.text.trim()) { setEditPage(p => ({ ...p, reviews: [...(p.reviews || []), { ...newReview }] })); setNewReview({ name: "", text: "", rating: 5 }); } }}>Add Review</Button>
            </div>

            {/* Author / Brand Section */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
              <Label className="font-bold text-sm">👤 Author / Brand Info</Label>
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={editPage.author_name || ""} onChange={e => setEditPage(p => ({ ...p, author_name: e.target.value }))} className="mt-1" placeholder="Author or brand name" />
              </div>
              <div>
                <Label className="text-xs">Bio (English)</Label>
                <Textarea value={editPage.author_bio || ""} onChange={e => setEditPage(p => ({ ...p, author_bio: e.target.value }))} className="mt-1" rows={2} />
              </div>
              <div>
                <Label className="text-xs">Bio (বাংলা)</Label>
                <Textarea value={editPage.author_bio_bn || ""} onChange={e => setEditPage(p => ({ ...p, author_bio_bn: e.target.value }))} className="mt-1" rows={2} />
              </div>
              <div>
                <Label className="text-xs">Author Image URL</Label>
                <Input value={editPage.author_image || ""} onChange={e => setEditPage(p => ({ ...p, author_image: e.target.value }))} className="mt-1 font-english text-xs" placeholder="https://..." />
              </div>
            </div>

            {/* Contact Bar */}
            <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
              <Label className="font-bold text-sm">📞 Contact Bar Text</Label>
              <Input value={editPage.contact_text || ""} onChange={e => setEditPage(p => ({ ...p, contact_text: e.target.value }))} placeholder="Contact us at..." />
              <Input value={editPage.contact_text_bn || ""} onChange={e => setEditPage(p => ({ ...p, contact_text_bn: e.target.value }))} placeholder="যোগাযোগ করুন..." />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={editPage.is_active ?? true} onCheckedChange={v => setEditPage(p => ({ ...p, is_active: v }))} />
              <Label>Active (visible to visitors)</Label>
            </div>

            {/* Product Selection */}
            <div>
              <Label className="mb-2 block">Select Products (first product = main hero product)</Label>
              <div className="border rounded-xl max-h-[200px] overflow-y-auto p-2 space-y-1">
                {products.map(prod => (
                  <label key={prod.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${(editPage.product_ids || []).includes(prod.id) ? "bg-accent/10 border border-accent/30" : "hover:bg-muted/50"}`}>
                    <input type="checkbox" checked={(editPage.product_ids || []).includes(prod.id)} onChange={() => toggleProduct(prod.id)} className="accent-[hsl(var(--accent))] w-4 h-4" />
                    <div className="w-8 h-8 rounded bg-muted overflow-hidden shrink-0">
                      {prod.image_url && <img src={prod.image_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-sm flex-1 truncate">{prod.name}</span>
                    <span className="text-xs font-english text-accent font-semibold">৳{prod.price}</span>
                  </label>
                ))}
                {products.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No products found</p>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{(editPage.product_ids || []).length} products selected</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Save Page"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLandingPages;
