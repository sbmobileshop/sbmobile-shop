import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, Image, Search, Package, Download, Languages, FileText, Upload } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";

interface Product {
  id: string;
  name: string;
  name_bn: string | null;
  slug: string | null;
  description: string | null;
  description_bn: string | null;
  price: number;
  old_price: number | null;
  category: string | null;
  brand: string | null;
  sku: string | null;
  stock: number;
  in_stock: boolean;
  featured: boolean;
  image_url: string | null;
  gallery: string[];
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
  specifications: Record<string, string>;
  tags: string[];
  sort_order: number;
  status: string;
  created_at: string;
  colors: string[];
  product_type: string;
  digital_file_url: string | null;
  digital_note: string | null;
}

const defaultProduct: Partial<Product> = {
  name: "", name_bn: "", slug: "", description: "", description_bn: "",
  price: 0, old_price: 0, category: "smartphones", brand: "", sku: "",
  stock: 10, in_stock: true, featured: false, image_url: "",
  gallery: [], meta_title: "", meta_description: "", meta_keywords: "",
  og_image: "", specifications: {}, tags: [], sort_order: 0, status: "active",
  colors: [], product_type: "physical", digital_file_url: "", digital_note: "",
};

const PRESET_COLORS = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Red", hex: "#EF4444" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Green", hex: "#22C55E" },
  { name: "Gold", hex: "#EAB308" },
  { name: "Silver", hex: "#A8A29E" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Orange", hex: "#F97316" },
  { name: "Gray", hex: "#6B7280" },
  { name: "Navy", hex: "#1E3A5F" },
];

const defaultCategories = [
  { value: "smartphones", label: "Smartphones", label_bn: "স্মার্টফোন" },
  { value: "feature_phones", label: "Feature Phones", label_bn: "ফিচার ফোন" },
  { value: "accessories", label: "Accessories", label_bn: "এক্সেসরিজ" },
  { value: "gadgets", label: "Gadgets", label_bn: "গ্যাজেট" },
  { value: "earbuds", label: "Earbuds", label_bn: "ইয়ারবাড" },
  { value: "chargers", label: "Chargers", label_bn: "চার্জার" },
  { value: "covers", label: "Back Covers", label_bn: "ব্যাক কভার" },
  { value: "digital", label: "Digital Products", label_bn: "ডিজিটাল প্রোডাক্ট" },
];

const AdminProducts: React.FC = () => {
  const { language } = useLanguage();
  const { translate, translating } = useAutoTranslate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product>>(defaultProduct);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [categories, setCategories] = useState(defaultCategories);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatLabelBn, setNewCatLabelBn] = useState("");

  // Load custom categories from site_settings
  useEffect(() => {
    supabase.from("site_settings").select("setting_value").eq("setting_key", "custom_categories").single()
      .then(({ data }) => {
        if (data?.setting_value) {
          const custom = data.setting_value as any[];
          if (Array.isArray(custom) && custom.length > 0) {
            setCategories([...defaultCategories, ...custom]);
          }
        }
      });
  }, []);

  const addNewCategory = async () => {
    if (!newCatLabel.trim()) return;
    const value = newCatLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const newCat = { value, label: newCatLabel.trim(), label_bn: newCatLabelBn.trim() || newCatLabel.trim() };
    const updatedCustom = categories.filter(c => !defaultCategories.some(d => d.value === c.value));
    updatedCustom.push(newCat);
    await supabase.from("site_settings").upsert({
      setting_key: "custom_categories",
      setting_value: updatedCustom as any,
    }, { onConflict: "setting_key" });
    setCategories([...defaultCategories, ...updatedCustom]);
    setEditProduct(prev => ({ ...prev, category: value }));
    setNewCatLabel(""); setNewCatLabelBn(""); setShowAddCategory(false);
    toast.success(language === "bn" ? "নতুন ক্যাটাগরি যোগ হয়েছে!" : "Category added!");
  };

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    // Admin needs to see all products including inactive ones
    // Use service role or RPC for admin view - for now fetch active
    const { data, error } = await supabase.from("products").select("*").order("sort_order", { ascending: true });
    if (data) setProducts(data as unknown as Product[]);
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image_url" | "og_image" | "gallery") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    const url = urlData.publicUrl;

    if (field === "gallery") {
      setEditProduct(prev => ({ ...prev, gallery: [...(prev.gallery || []), url] }));
    } else {
      setEditProduct(prev => ({ ...prev, [field]: url }));
    }
    setUploading(false);
    toast.success(language === "bn" ? "ছবি আপলোড হয়েছে!" : "Image uploaded!");
  };

  const removeGalleryImage = (idx: number) => {
    setEditProduct(prev => ({
      ...prev,
      gallery: (prev.gallery || []).filter((_, i) => i !== idx),
    }));
  };

  const addSpec = () => {
    if (!specKey.trim()) return;
    setEditProduct(prev => ({
      ...prev,
      specifications: { ...(prev.specifications || {}), [specKey.trim()]: specValue.trim() },
    }));
    setSpecKey(""); setSpecValue("");
  };

  const removeSpec = (key: string) => {
    const specs = { ...(editProduct.specifications || {}) };
    delete specs[key];
    setEditProduct(prev => ({ ...prev, specifications: specs }));
  };

  const handleSave = async () => {
    if (!editProduct.name?.trim()) { toast.error(language === "bn" ? "পণ্যের নাম দিন" : "Product name required"); return; }
    setSaving(true);
    const slug = editProduct.slug?.trim() || generateSlug(editProduct.name);
    const isDigital = editProduct.product_type === "digital";
    
    // Auto-generate SEO fields if empty
    const autoMetaTitle = editProduct.meta_title?.trim() || `${editProduct.name} - SB Mobile Shop`;
    const autoMetaDesc = editProduct.meta_description?.trim() || 
      (editProduct.description ? editProduct.description.replace(/<[^>]*>/g, '').substring(0, 155) + '...' : `Buy ${editProduct.name} at best price from SB Mobile Shop. ৳${editProduct.price}`);
    
    const payload = {
      name: editProduct.name.trim(),
      name_bn: editProduct.name_bn?.trim() || null,
      slug,
      description: editProduct.description?.trim() || null,
      description_bn: editProduct.description_bn?.trim() || null,
      price: Number(editProduct.price) || 0,
      old_price: Number(editProduct.old_price) || 0,
      category: editProduct.category || "uncategorized",
      brand: editProduct.brand?.trim() || null,
      sku: editProduct.sku?.trim() || null,
      stock: isDigital ? 999 : (Number(editProduct.stock) || 0),
      in_stock: isDigital ? true : (editProduct.in_stock ?? true),
      featured: editProduct.featured ?? false,
      image_url: editProduct.image_url || null,
      gallery: editProduct.gallery || [],
      meta_title: autoMetaTitle,
      meta_description: autoMetaDesc,
      meta_keywords: editProduct.meta_keywords?.trim() || null,
      og_image: editProduct.og_image || editProduct.image_url || null,
      specifications: editProduct.specifications || {},
      tags: editProduct.tags || [],
      sort_order: Number(editProduct.sort_order) || 0,
      status: editProduct.status || "active",
      colors: editProduct.colors || [],
      product_type: editProduct.product_type || "physical",
      digital_file_url: isDigital ? (editProduct.digital_file_url?.trim() || null) : null,
      digital_note: isDigital ? (editProduct.digital_note?.trim() || null) : null,
    };

    let error;
    if (isEditing && editProduct.id) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editProduct.id));
    } else {
      ({ error } = await supabase.from("products").insert(payload));
    }

    if (error) toast.error(error.message);
    else {
      toast.success(language === "bn" ? "পণ্য সেভ হয়েছে!" : "Product saved!");
      setDialogOpen(false);
      loadProducts();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === "bn" ? "মুছে ফেলতে চান?" : "Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted!"); loadProducts(); }
  };

  const openAdd = () => { setEditProduct({ ...defaultProduct }); setIsEditing(false); setDialogOpen(true); };
  const openEdit = (p: Product) => { setEditProduct({ ...p }); setIsEditing(true); setDialogOpen(true); };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.name_bn || "").includes(searchQuery);
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Package className="h-6 w-6" />
          {language === "bn" ? "পণ্য ব্যবস্থাপনা" : "Product Management"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => {
            if (filtered.length === 0) return;
            const headers = ["Name","Name BN","Price","Old Price","Stock","Category","SKU","Status"];
            const rows = filtered.map(p => [
              p.name, p.name_bn || "", p.price, p.old_price || "", p.stock, p.category || "", p.sku || "", p.status
            ]);
            const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
            const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `products-${new Date().toISOString().slice(0,10)}.csv`; a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button onClick={openAdd} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            <Plus className="h-4 w-4" /> {language === "bn" ? "নতুন পণ্য" : "Add Product"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={language === "bn" ? "পণ্য খুঁজুন..." : "Search products..."} value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === "bn" ? "সব ক্যাটাগরি" : "All Categories"}</SelectItem>
            {categories.map(c => <SelectItem key={c.value} value={c.value}>{language === "bn" ? c.label_bn : c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          {language === "bn" ? "কোনো পণ্য পাওয়া যায়নি। উপরে 'নতুন পণ্য' ক্লিক করুন।" : "No products found. Click 'Add Product' above."}
        </CardContent></Card>
      ) : (
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{language === "bn" ? "ছবি" : "Image"}</TableHead>
                <TableHead>{language === "bn" ? "পণ্য" : "Product"}</TableHead>
                <TableHead>{language === "bn" ? "দাম" : "Price"}</TableHead>
                <TableHead>{language === "bn" ? "স্টক" : "Stock"}</TableHead>
                <TableHead>{language === "bn" ? "ক্যাটাগরি" : "Category"}</TableHead>
                <TableHead>{language === "bn" ? "স্ট্যাটাস" : "Status"}</TableHead>
                <TableHead className="text-right">{language === "bn" ? "অ্যাকশন" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        : <span className="text-muted-foreground/30 text-xs font-english font-bold">SB</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{language === "bn" ? (p.name_bn || p.name) : p.name}</div>
                    {p.sku && <div className="text-xs text-muted-foreground font-english">SKU: {p.sku}</div>}
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-accent">৳{p.price.toLocaleString()}</span>
                    {p.old_price && p.old_price > p.price && (
                      <span className="text-xs text-muted-foreground line-through ml-1">৳{p.old_price.toLocaleString()}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.stock > 0 ? "default" : "destructive"} className="text-xs">
                      {p.stock > 0 ? p.stock : (language === "bn" ? "স্টক আউট" : "Out")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{categories.find(c => c.value === p.category)?.[language === "bn" ? "label_bn" : "label"] || p.category}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-xs">
                      {p.status === "active" ? (language === "bn" ? "সক্রিয়" : "Active") : (language === "bn" ? "ড্রাফট" : "Draft")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? (language === "bn" ? "পণ্য সম্পাদনা" : "Edit Product") : (language === "bn" ? "নতুন পণ্য যোগ করুন" : "Add New Product")}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="mt-2">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="basic">{language === "bn" ? "মূল তথ্য" : "Basic"}</TabsTrigger>
              <TabsTrigger value="media">{language === "bn" ? "ছবি" : "Media"}</TabsTrigger>
              <TabsTrigger value="specs">{language === "bn" ? "স্পেসিফিকেশন" : "Specs"}</TabsTrigger>
              <TabsTrigger value="seo">{language === "bn" ? "SEO" : "SEO"}</TabsTrigger>
            </TabsList>

            {/* Basic Info */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>{language === "bn" ? "পণ্যের নাম (English) *" : "Product Name (English) *"}</Label>
                  <Input value={editProduct.name || ""} onChange={e => {
                    setEditProduct(prev => ({ ...prev, name: e.target.value, slug: prev.slug || generateSlug(e.target.value) }));
                  }} className="mt-1.5 font-english" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label>{language === "bn" ? "পণ্যের নাম (বাংলা)" : "Product Name (Bangla)"}</Label>
                    <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1 text-accent" disabled={translating || !editProduct.name?.trim()}
                      onClick={async () => {
                        const result = await translate(editProduct.name || "", "product name");
                        if (result) setEditProduct(prev => ({ ...prev, name_bn: result }));
                      }}>
                      {translating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      Auto BN
                    </Button>
                  </div>
                  <Input value={editProduct.name_bn || ""} onChange={e => setEditProduct(prev => ({ ...prev, name_bn: e.target.value }))} className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Slug (URL)</Label>
                <Input value={editProduct.slug || ""} onChange={e => setEditProduct(prev => ({ ...prev, slug: e.target.value }))} className="mt-1.5 font-english" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>{language === "bn" ? "বিবরণ (English)" : "Description (English)"}</Label>
                  <RichTextEditor
                    value={editProduct.description || ""}
                    onChange={v => setEditProduct(prev => ({ ...prev, description: v }))}
                    placeholder={language === "bn" ? "পণ্যের বিবরণ লিখুন..." : "Write product description..."}
                    rows={5}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label>{language === "bn" ? "বিবরণ (বাংলা)" : "Description (Bangla)"}</Label>
                    <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1 text-accent" disabled={translating || !editProduct.description?.trim()}
                      onClick={async () => {
                        const result = await translate(editProduct.description || "", "product description");
                        if (result) setEditProduct(prev => ({ ...prev, description_bn: result }));
                      }}>
                      {translating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                      Auto BN
                    </Button>
                  </div>
                  <RichTextEditor
                    value={editProduct.description_bn || ""}
                    onChange={v => setEditProduct(prev => ({ ...prev, description_bn: v }))}
                    placeholder={language === "bn" ? "বাংলায় বিবরণ..." : "Bangla description..."}
                    rows={5}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label>{language === "bn" ? "দাম (৳)" : "Price (৳)"}</Label>
                  <Input type="number" value={editProduct.price || ""} onChange={e => setEditProduct(prev => ({ ...prev, price: Number(e.target.value) }))} className="mt-1.5 font-english" />
                </div>
                <div>
                  <Label>{language === "bn" ? "আগের দাম" : "Old Price"}</Label>
                  <Input type="number" value={editProduct.old_price || ""} onChange={e => setEditProduct(prev => ({ ...prev, old_price: Number(e.target.value) }))} className="mt-1.5 font-english" />
                </div>
                <div>
                  <Label>{language === "bn" ? "স্টক" : "Stock"}</Label>
                  <Input type="number" value={editProduct.stock ?? 0} onChange={e => setEditProduct(prev => ({ ...prev, stock: Number(e.target.value), in_stock: Number(e.target.value) > 0 }))} className="mt-1.5 font-english" />
                </div>
                <div>
                  <Label>SKU</Label>
                  <Input value={editProduct.sku || ""} onChange={e => setEditProduct(prev => ({ ...prev, sku: e.target.value }))} className="mt-1.5 font-english" />
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label>{language === "bn" ? "ক্যাটাগরি" : "Category"}</Label>
                  <Select value={editProduct.category || "smartphones"} onValueChange={v => {
                    if (v === "__add_new__") { setShowAddCategory(true); return; }
                    setEditProduct(prev => ({ ...prev, category: v }));
                  }}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.value} value={c.value}>{language === "bn" ? c.label_bn : c.label}</SelectItem>)}
                      <SelectItem value="__add_new__" className="text-accent font-semibold">
                        + {language === "bn" ? "নতুন ক্যাটাগরি" : "Add New Category"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {showAddCategory && (
                    <div className="mt-2 p-3 border border-border rounded-lg bg-muted/50 space-y-2">
                      <Input placeholder={language === "bn" ? "ক্যাটাগরি নাম (English)" : "Category name (English)"} value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} className="text-sm" />
                      <Input placeholder={language === "bn" ? "ক্যাটাগরি নাম (বাংলা)" : "Category name (Bangla)"} value={newCatLabelBn} onChange={e => setNewCatLabelBn(e.target.value)} className="text-sm" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={addNewCategory} disabled={!newCatLabel.trim()} className="bg-accent text-accent-foreground text-xs">
                          {language === "bn" ? "যোগ করুন" : "Add"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowAddCategory(false)} className="text-xs">
                          {language === "bn" ? "বাতিল" : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <Label>{language === "bn" ? "ব্র্যান্ড" : "Brand"}</Label>
                  <Input value={editProduct.brand || ""} onChange={e => setEditProduct(prev => ({ ...prev, brand: e.target.value }))} className="mt-1.5 font-english" />
                </div>
                <div>
                  <Label>{language === "bn" ? "স্ট্যাটাস" : "Status"}</Label>
                  <Select value={editProduct.status || "active"} onValueChange={v => setEditProduct(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{language === "bn" ? "সক্রিয়" : "Active"}</SelectItem>
                      <SelectItem value="draft">{language === "bn" ? "ড্রাফট" : "Draft"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <Switch checked={editProduct.featured || false} onCheckedChange={v => setEditProduct(prev => ({ ...prev, featured: v }))} />
                  <Label>{language === "bn" ? "ফিচার্ড পণ্য" : "Featured Product"}</Label>
                </div>
                <div>
                  <Label>{language === "bn" ? "সর্ট অর্ডার" : "Sort Order"}</Label>
                  <Input type="number" value={editProduct.sort_order || 0} onChange={e => setEditProduct(prev => ({ ...prev, sort_order: Number(e.target.value) }))} className="w-20 ml-2 inline font-english" />
                </div>
                <div>
                  <Label>{language === "bn" ? "পণ্যের ধরণ" : "Product Type"}</Label>
                  <Select value={editProduct.product_type || "physical"} onValueChange={v => setEditProduct(prev => ({ ...prev, product_type: v }))}>
                    <SelectTrigger className="w-40 ml-2 inline-flex"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">{language === "bn" ? "ফিজিক্যাল (ডেলিভারি)" : "Physical (Delivery)"}</SelectItem>
                      <SelectItem value="digital">{language === "bn" ? "ডিজিটাল (ইমেইল)" : "Digital (Email)"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Digital Product Fields */}
              {editProduct.product_type === "digital" && (
                <div className="p-4 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 space-y-3">
                  <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    {language === "bn" ? "ডিজিটাল প্রোডাক্ট সেটিংস" : "Digital Product Settings"}
                  </h4>
                  <p className="text-xs text-muted-foreground">{language === "bn" ? "পেমেন্ট ভেরিফাই হলে অটো ইমেইলে ডেলিভারি হবে। Steadfast কুরিয়ার স্কিপ হবে।" : "Auto email delivery after payment verification. Steadfast courier will be skipped."}</p>
                  <div>
                    <Label>{language === "bn" ? "ডিজিটাল ফাইল URL" : "Digital File URL"}</Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input value={editProduct.digital_file_url || ""} onChange={e => setEditProduct(prev => ({ ...prev, digital_file_url: e.target.value }))} placeholder="https://drive.google.com/... or upload" className="font-english text-xs flex-1" />
                      <Button type="button" size="sm" variant="outline" className="gap-1 shrink-0" onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.onchange = async (ev: any) => {
                          const file = ev.target.files?.[0];
                          if (!file) return;
                          const ext = file.name.split(".").pop();
                          const path = `digital/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                          const { error } = await supabase.storage.from("product-images").upload(path, file);
                          if (error) { toast.error(error.message); return; }
                          const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
                          setEditProduct(prev => ({ ...prev, digital_file_url: urlData.publicUrl }));
                          toast.success("File uploaded!");
                        };
                        input.click();
                      }}>
                        <Upload className="h-3.5 w-3.5" /> {language === "bn" ? "আপলোড" : "Upload"}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>{language === "bn" ? "ডিজিটাল নোট / লাইসেন্স কী" : "Digital Note / License Key"}</Label>
                    <Textarea value={editProduct.digital_note || ""} onChange={e => setEditProduct(prev => ({ ...prev, digital_note: e.target.value }))} className="mt-1.5 font-english" rows={3}
                      placeholder={language === "bn" ? "লাইসেন্স কী, ডাউনলোড লিংক, বা অন্য কোনো নোট..." : "License key, download instructions, or any note..."} />
                  </div>
                </div>
              )}
              <div>
                <Label>{language === "bn" ? "ট্যাগ" : "Tags"}</Label>
                <div className="mt-1.5 flex flex-wrap gap-1.5 mb-2">
                  {["Free Delivery", "Hot Deal", "New Arrival", "Best Seller", "Limited Stock", "Discount", "Trending", "Exclusive"].map(tag => (
                    <Button key={tag} type="button" size="sm" variant={(editProduct.tags || []).includes(tag) ? "default" : "outline"}
                      className="text-[10px] h-6 px-2 rounded-full"
                      onClick={() => {
                        setEditProduct(prev => {
                          const tags = prev.tags || [];
                          return { ...prev, tags: tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag] };
                        });
                      }}>
                      {tag}
                    </Button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 border rounded-md bg-background min-h-[42px]">
                  {(editProduct.tags || []).map((tag, ti) => (
                    <span key={ti} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                      {tag}
                      <button type="button" onClick={() => setEditProduct(prev => ({ ...prev, tags: (prev.tags || []).filter((_, i) => i !== ti) }))} className="hover:text-destructive">×</button>
                    </span>
                  ))}
                  <input
                    placeholder={language === "bn" ? "কাস্টম ট্যাগ লিখে Enter দিন..." : "Type custom tag, press Enter..."}
                    className="flex-1 min-w-[120px] text-sm bg-transparent outline-none"
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val && !(editProduct.tags || []).includes(val)) {
                          setEditProduct(prev => ({ ...prev, tags: [...(prev.tags || []), val] }));
                        }
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                  />
                </div>
              </div>
              {/* Colors */}
              <div>
                <Label>{language === "bn" ? "রঙ (Colors)" : "Available Colors"}</Label>
                <div className="mt-1.5 flex flex-wrap gap-1.5 mb-2">
                  {PRESET_COLORS.map(color => {
                    const selected = (editProduct.colors || []).includes(color.name);
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => {
                          setEditProduct(prev => {
                            const colors = prev.colors || [];
                            return { ...prev, colors: selected ? colors.filter(c => c !== color.name) : [...colors, color.name] };
                          });
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                          selected ? "border-accent bg-accent/10 text-accent ring-1 ring-accent/30" : "border-border hover:border-accent/50"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-border/50 shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}
                      </button>
                    );
                  })}
                </div>
                {(editProduct.colors || []).length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {language === "bn" ? "নির্বাচিত:" : "Selected:"} {(editProduct.colors || []).join(", ")}
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Media */}
            <TabsContent value="media" className="space-y-4 mt-4">
              <div>
                <Label>{language === "bn" ? "মূল ছবি" : "Main Image"}</Label>
                <div className="mt-2 flex items-center gap-4">
                  {editProduct.image_url && (
                    <img src={editProduct.image_url} alt="Product" className="w-24 h-24 object-cover rounded-lg border" />
                  )}
                  <label className="cursor-pointer px-4 py-2 rounded-lg border border-dashed border-border hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                    {language === "bn" ? "ছবি আপলোড করুন" : "Upload Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "image_url")} />
                  </label>
                </div>
                <div className="mt-2">
                  <Input placeholder={language === "bn" ? "অথবা ছবির URL পেস্ট করুন..." : "Or paste image URL..."} value={editProduct.image_url || ""} onChange={e => setEditProduct(prev => ({ ...prev, image_url: e.target.value }))} className="font-english text-xs" />
                </div>
              </div>

              <div>
                <Label>{language === "bn" ? "গ্যালারি ছবি" : "Gallery Images"}</Label>
                <div className="mt-2 flex flex-wrap gap-3">
                  {(editProduct.gallery || []).map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`Gallery ${i}`} className="w-20 h-20 object-cover rounded-lg border" />
                      <button onClick={() => removeGalleryImage(i)} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                    </div>
                  ))}
                  <label className="cursor-pointer w-20 h-20 rounded-lg border border-dashed border-border hover:bg-muted/50 transition-colors flex items-center justify-center">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5 text-muted-foreground" />}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "gallery")} />
                  </label>
                </div>
                <div className="mt-2 flex gap-2">
                  <Input id="gallery-url-input" placeholder={language === "bn" ? "গ্যালারি ছবির URL পেস্ট করুন..." : "Paste gallery image URL..."} className="font-english text-xs" />
                  <Button type="button" size="sm" variant="outline" onClick={() => {
                    const input = document.getElementById("gallery-url-input") as HTMLInputElement;
                    if (input?.value?.trim()) {
                      setEditProduct(prev => ({ ...prev, gallery: [...(prev.gallery || []), input.value.trim()] }));
                      input.value = "";
                    }
                  }}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </TabsContent>

            {/* Specifications */}
            <TabsContent value="specs" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Input placeholder={language === "bn" ? "নাম (যেমন: RAM)" : "Key (e.g. RAM)"} value={specKey} onChange={e => setSpecKey(e.target.value)} className="font-english" />
                <Input placeholder={language === "bn" ? "মান (যেমন: 8GB)" : "Value (e.g. 8GB)"} value={specValue} onChange={e => setSpecValue(e.target.value)} className="font-english" />
                <Button type="button" onClick={addSpec} variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
              </div>
              {Object.entries(editProduct.specifications || {}).length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableBody>
                      {Object.entries(editProduct.specifications || {}).map(([k, v]) => (
                        <TableRow key={k}>
                          <TableCell className="font-medium font-english">{k}</TableCell>
                          <TableCell className="font-english">{v}</TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" className="text-destructive h-7 w-7" onClick={() => removeSpec(k)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* SEO */}
            <TabsContent value="seo" className="space-y-4 mt-4">
              <div>
                <Label>Meta Title</Label>
                <Input value={editProduct.meta_title || ""} onChange={e => setEditProduct(prev => ({ ...prev, meta_title: e.target.value }))} className="mt-1.5 font-english"
                  placeholder="Product name - SB Mobile Shop" />
                <p className="text-xs text-muted-foreground mt-1">{(editProduct.meta_title || "").length}/60 characters</p>
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea value={editProduct.meta_description || ""} onChange={e => setEditProduct(prev => ({ ...prev, meta_description: e.target.value }))} className="mt-1.5"
                  placeholder="Product description for search engines..." rows={3} />
                <p className="text-xs text-muted-foreground mt-1">{(editProduct.meta_description || "").length}/160 characters</p>
              </div>
              <div>
                <Label>Meta Keywords</Label>
                <Input value={editProduct.meta_keywords || ""} onChange={e => setEditProduct(prev => ({ ...prev, meta_keywords: e.target.value }))} className="mt-1.5"
                  placeholder="mobile, smartphone, samsung, beanibazar..." />
              </div>
              <div>
                <Label>OG Image (Facebook/Social)</Label>
                <div className="mt-2 flex items-center gap-4">
                  {editProduct.og_image && <img src={editProduct.og_image} alt="OG" className="w-32 h-20 object-cover rounded-lg border" />}
                  <label className="cursor-pointer px-4 py-2 rounded-lg border border-dashed border-border hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                    {language === "bn" ? "OG ছবি আপলোড" : "Upload OG Image"}
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "og_image")} />
                  </label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{language === "bn" ? "বাতিল" : "Cancel"}</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? (language === "bn" ? "সেভ হচ্ছে..." : "Saving...") : (language === "bn" ? "সেভ করুন" : "Save Product")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
