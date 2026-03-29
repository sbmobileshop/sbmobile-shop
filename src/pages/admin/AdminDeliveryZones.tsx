import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Truck, Plus, Save, Loader2, Trash2, GripVertical } from "lucide-react";

interface DeliveryZone {
  id: string;
  name: string;
  name_bn: string | null;
  charge: number;
  advance_amount: number;
  free_delivery_min: number;
  sort_order: number;
  is_active: boolean;
}

const AdminDeliveryZones: React.FC = () => {
  const { language } = useLanguage();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editZone, setEditZone] = useState<Partial<DeliveryZone> | null>(null);

  const loadZones = async () => {
    const { data } = await supabase
      .from("delivery_zones")
      .select("*")
      .order("sort_order", { ascending: true }) as { data: DeliveryZone[] | null };
    if (data) setZones(data);
    setLoading(false);
  };

  useEffect(() => { loadZones(); }, []);

  const handleSave = async () => {
    if (!editZone?.name?.trim()) {
      toast.error("Zone name is required");
      return;
    }
    setSaving(true);
    try {
      if (editZone.id) {
        const { error } = await supabase.from("delivery_zones").update({
          name: editZone.name.trim(),
          name_bn: editZone.name_bn?.trim() || null,
          charge: editZone.charge || 0,
          advance_amount: editZone.advance_amount || 100,
          free_delivery_min: editZone.free_delivery_min || 5000,
          sort_order: editZone.sort_order || 0,
          is_active: editZone.is_active ?? true,
        } as any).eq("id", editZone.id);
        if (error) throw error;
        toast.success("Zone updated");
      } else {
        const { error } = await supabase.from("delivery_zones").insert({
          name: editZone.name.trim(),
          name_bn: editZone.name_bn?.trim() || null,
          charge: editZone.charge || 0,
          advance_amount: editZone.advance_amount || 100,
          free_delivery_min: editZone.free_delivery_min || 5000,
          sort_order: zones.length + 1,
          is_active: true,
        } as any);
        if (error) throw error;
        toast.success("Zone added");
      }
      setEditZone(null);
      loadZones();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (zone: DeliveryZone) => {
    await supabase.from("delivery_zones").update({ is_active: !zone.is_active } as any).eq("id", zone.id);
    loadZones();
  };

  const deleteZone = async (id: string) => {
    if (!confirm("Delete this zone?")) return;
    await supabase.from("delivery_zones").delete().eq("id", id);
    toast.success("Zone deleted");
    loadZones();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Truck className="h-5 w-5 text-accent" />
          {language === "bn" ? "ডেলিভারি জোন" : "Delivery Zones"}
        </h1>
        <Button
          onClick={() => setEditZone({ name: "", name_bn: "", charge: 0, advance_amount: 100, free_delivery_min: 5000 })}
          size="sm" className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Plus className="h-4 w-4" /> {language === "bn" ? "নতুন জোন" : "Add Zone"}
        </Button>
      </div>

      {/* Zone List */}
      <div className="space-y-3">
        {zones.map((zone) => (
          <Card key={zone.id} className={`border ${zone.is_active ? "border-border" : "border-border/50 opacity-60"}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <h3 className="font-semibold text-sm">{zone.name}</h3>
                    {zone.name_bn && <span className="text-xs text-muted-foreground">({zone.name_bn})</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground ml-6">
                    <span>Charge: <strong className="text-foreground font-english">৳{zone.charge}</strong></span>
                    <span>Advance: <strong className="text-foreground font-english">৳{zone.advance_amount}</strong></span>
                    <span>Free above: <strong className="text-foreground font-english">৳{zone.free_delivery_min}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={zone.is_active} onCheckedChange={() => toggleActive(zone)} />
                  <Button variant="ghost" size="sm" onClick={() => setEditZone(zone)} className="text-xs h-8">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteZone(zone.id)} className="text-destructive hover:text-destructive h-8">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {zones.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <Truck className="h-10 w-10 mx-auto mb-2 opacity-30" />
            No delivery zones configured
          </div>
        )}
      </div>

      {/* Edit/Add Form */}
      {editZone && (
        <Card className="border-accent/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {editZone.id ? (language === "bn" ? "জোন এডিট" : "Edit Zone") : (language === "bn" ? "নতুন জোন" : "New Zone")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name (English) *</Label>
                <Input value={editZone.name || ""} onChange={e => setEditZone({ ...editZone, name: e.target.value })}
                  placeholder="e.g. Inside Sylhet" className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Name (Bangla)</Label>
                <Input value={editZone.name_bn || ""} onChange={e => setEditZone({ ...editZone, name_bn: e.target.value })}
                  placeholder="যেমন: সিলেটের ভিতরে" className="mt-1 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Delivery Charge (৳)</Label>
                <Input type="number" value={editZone.charge || 0} onChange={e => setEditZone({ ...editZone, charge: Number(e.target.value) })}
                  className="mt-1 text-sm font-english" min={0} />
              </div>
              <div>
                <Label className="text-xs">Advance Amount (৳)</Label>
                <Input type="number" value={editZone.advance_amount || 100} onChange={e => setEditZone({ ...editZone, advance_amount: Number(e.target.value) })}
                  className="mt-1 text-sm font-english" min={0} />
              </div>
              <div>
                <Label className="text-xs">Free Delivery Min (৳)</Label>
                <Input type="number" value={editZone.free_delivery_min || 5000} onChange={e => setEditZone({ ...editZone, free_delivery_min: Number(e.target.value) })}
                  className="mt-1 text-sm font-english" min={0} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} disabled={saving} size="sm" className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {language === "bn" ? "সংরক্ষণ" : "Save"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditZone(null)}>
                {language === "bn" ? "বাতিল" : "Cancel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <div className="p-4 bg-muted/40 rounded-xl border border-border text-xs text-muted-foreground space-y-1.5">
        <p className="font-medium text-foreground text-sm mb-1">
          {language === "bn" ? "কিভাবে কাজ করে" : "How it works"}
        </p>
        <p>• {language === "bn" ? "কাস্টমার চেকআউটে ডেলিভারি জোন সিলেক্ট করবে" : "Customer selects delivery zone at checkout"}</p>
        <p>• {language === "bn" ? "ডেলিভারি চার্জ অটো যোগ হবে টোটালে" : "Delivery charge auto-adds to total"}</p>
        <p>• {language === "bn" ? `Free Delivery Min এর উপরে অর্ডার হলে ডেলিভারি ফ্রি` : "Orders above Free Delivery Min get free delivery"}</p>
        <p>• {language === "bn" ? "COD তে Advance Amount অটো সেট হবে" : "COD advance amount auto-adjusts per zone"}</p>
      </div>
    </div>
  );
};

export default AdminDeliveryZones;
