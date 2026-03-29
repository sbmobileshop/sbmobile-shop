import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Tag } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminCoupons: React.FC = () => {
  const { language } = useLanguage();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: "", discount_type: "percentage", discount_value: "10",
    min_order_amount: "0", max_uses: "", expires_at: "",
  });

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (data) setCoupons(data as unknown as Coupon[]);
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async () => {
    if (!form.code.trim()) { toast.error("Enter coupon code"); return; }
    if (!form.discount_value || Number(form.discount_value) <= 0) { toast.error("Enter discount value"); return; }
    setSaving(true);
    const { error } = await supabase.from("coupons").insert({
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
    } as any);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(language === "bn" ? "কুপন তৈরি হয়েছে!" : "Coupon created!");
    setShowForm(false);
    setForm({ code: "", discount_type: "percentage", discount_value: "10", min_order_amount: "0", max_uses: "", expires_at: "" });
    fetchCoupons();
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from("coupons").update({ is_active: active } as any).eq("id", id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    toast.success(language === "bn" ? "কুপন ডিলিট হয়েছে" : "Coupon deleted");
    fetchCoupons();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Tag className="h-6 w-6 text-accent" />
          {language === "bn" ? "কুপন ব্যবস্থাপনা" : "Coupon Management"}
        </h1>
        <Button onClick={() => setShowForm(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <Plus className="h-4 w-4" /> {language === "bn" ? "নতুন কুপন" : "New Coupon"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : coupons.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">{language === "bn" ? "কোনো কুপন নেই" : "No coupons yet"}</CardContent></Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "bn" ? "কোড" : "Code"}</TableHead>
                <TableHead>{language === "bn" ? "ডিসকাউন্ট" : "Discount"}</TableHead>
                <TableHead>{language === "bn" ? "মিনিমাম" : "Min Order"}</TableHead>
                <TableHead>{language === "bn" ? "ব্যবহার" : "Usage"}</TableHead>
                <TableHead>{language === "bn" ? "মেয়াদ" : "Expires"}</TableHead>
                <TableHead>{language === "bn" ? "স্ট্যাটাস" : "Status"}</TableHead>
                <TableHead>{language === "bn" ? "অ্যাকশন" : "Actions"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-english font-bold">{c.code}</TableCell>
                  <TableCell>{c.discount_type === "percentage" ? `${c.discount_value}%` : `৳${c.discount_value}`}</TableCell>
                  <TableCell>৳{c.min_order_amount}</TableCell>
                  <TableCell>{c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}</TableCell>
                  <TableCell className="text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "∞"}</TableCell>
                  <TableCell>
                    <Switch checked={c.is_active} onCheckedChange={v => toggleActive(c.id, v)} />
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteCoupon(c.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "bn" ? "নতুন কুপন তৈরি" : "Create New Coupon"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === "bn" ? "কুপন কোড" : "Coupon Code"}</Label>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE20" className="mt-1.5 font-english" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{language === "bn" ? "ধরন" : "Type"}</Label>
                <Select value={form.discount_type} onValueChange={v => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">{language === "bn" ? "শতাংশ (%)" : "Percentage (%)"}</SelectItem>
                    <SelectItem value="fixed">{language === "bn" ? "নির্দিষ্ট (৳)" : "Fixed (৳)"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === "bn" ? "মান" : "Value"}</Label>
                <Input type="number" value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })} className="mt-1.5 font-english" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{language === "bn" ? "মিনিমাম অর্ডার (৳)" : "Min Order (৳)"}</Label>
                <Input type="number" value={form.min_order_amount} onChange={e => setForm({ ...form, min_order_amount: e.target.value })} className="mt-1.5 font-english" />
              </div>
              <div>
                <Label>{language === "bn" ? "সর্বোচ্চ ব্যবহার" : "Max Uses"}</Label>
                <Input type="number" value={form.max_uses} onChange={e => setForm({ ...form, max_uses: e.target.value })} placeholder="∞" className="mt-1.5 font-english" />
              </div>
            </div>
            <div>
              <Label>{language === "bn" ? "মেয়াদ শেষ" : "Expiry Date"}</Label>
              <Input type="date" value={form.expires_at} onChange={e => setForm({ ...form, expires_at: e.target.value })} className="mt-1.5 font-english" />
            </div>
            <Button onClick={handleCreate} disabled={saving} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {language === "bn" ? "কুপন তৈরি করুন" : "Create Coupon"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
