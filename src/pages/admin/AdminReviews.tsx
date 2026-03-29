import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Star, Check, X, Trash2, MessageSquare, Pencil, Eye, EyeOff } from "lucide-react";

interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  customer_phone: string | null;
  rating: number;
  review_text: string | null;
  is_approved: boolean;
  created_at: string;
}

const AdminReviews: React.FC = () => {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editReview, setEditReview] = useState<Review | null>(null);
  const [editName, setEditName] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("product_reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setReviews(data as unknown as Review[]);
    setLoading(false);
  };

  const toggleApproval = async (id: string, approved: boolean) => {
    const { error } = await supabase.from("product_reviews").update({ is_approved: approved }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(approved ? "Approved!" : "Hidden!"); loadReviews(); }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted!"); loadReviews(); }
  };

  const openEdit = (r: Review) => {
    setEditReview(r);
    setEditName(r.customer_name);
    setEditRating(r.rating);
    setEditText(r.review_text || "");
  };

  const saveEdit = async () => {
    if (!editReview) return;
    setSaving(true);
    const { error } = await supabase.from("product_reviews").update({
      customer_name: editName,
      rating: editRating,
      review_text: editText || null,
    }).eq("id", editReview.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Review updated!"); setEditReview(null); loadReviews(); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        {t("admin.reviews")}
      </h1>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : reviews.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          No reviews yet.
        </CardContent></Card>
      ) : (
        <Card className="border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map(r => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{r.customer_name}</div>
                    {r.customer_phone && <div className="text-xs text-muted-foreground font-english">{r.customer_phone}</div>}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/20"}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.review_text || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.is_approved ? "default" : "secondary"} className="text-[10px]">
                      {r.is_approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="icon" variant="ghost" className="text-blue-600 h-8 w-8" onClick={() => openEdit(r)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {!r.is_approved ? (
                        <Button size="icon" variant="ghost" className="text-green-600 h-8 w-8" onClick={() => toggleApproval(r.id, true)} title="Approve">
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button size="icon" variant="ghost" className="text-yellow-600 h-8 w-8" onClick={() => toggleApproval(r.id, false)} title="Hide">
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => deleteReview(r.id)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Edit Review Dialog */}
      <Dialog open={!!editReview} onOpenChange={o => !o && setEditReview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Review</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customer Name</Label>
              <Input value={editName} onChange={e => setEditName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>Rating</Label>
              <div className="flex gap-1 mt-1.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} type="button" onClick={() => setEditRating(s)} className="p-0.5">
                    <Star className={`h-6 w-6 transition-colors ${s <= editRating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30 hover:text-yellow-400"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Review Text</Label>
              <Textarea value={editText} onChange={e => setEditText(e.target.value)} rows={4} className="mt-1.5" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditReview(null)}>Cancel</Button>
              <Button onClick={saveEdit} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminReviews;
