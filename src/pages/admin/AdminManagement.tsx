import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, UserPlus, Trash2, Key, Shield, Crown } from "lucide-react";

const SUPER_ADMIN_EMAIL = "shibrul48@gmail.com";

interface Admin {
  user_id: string;
  email: string;
  is_super: boolean;
  created_at: string;
}

const AdminManagement: React.FC = () => {
  const { language } = useLanguage();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePassword, setChangePassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAdmins(); }, []);

  const callAdminFn = async (body: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("admin-management", {
      body,
      headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    });
    if (res.error) throw new Error(res.error.message);
    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  };

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await callAdminFn({ action: "list-admins" });
      setAdmins(data.admins || []);
    } catch (err: any) { toast.error(err.message); }
    setLoading(false);
  };

  const handleAddAdmin = async () => {
    if (!newEmail.trim() || !newPassword.trim()) { toast.error("Email & password required"); return; }
    setSaving(true);
    try {
      await callAdminFn({ action: "add-admin", email: newEmail.trim(), password: newPassword.trim() });
      toast.success(language === "bn" ? "নতুন অ্যাডমিন যোগ হয়েছে!" : "Admin added!");
      setAddOpen(false); setNewEmail(""); setNewPassword("");
      loadAdmins();
    } catch (err: any) { toast.error(err.message); }
    setSaving(false);
  };

  const handleRemoveAdmin = async (admin: Admin) => {
    if (admin.is_super) { toast.error("Cannot remove super admin"); return; }
    if (!confirm(language === "bn" ? "এই অ্যাডমিন সরাতে চান?" : "Remove this admin?")) return;
    try {
      await callAdminFn({ action: "remove-admin", target_user_id: admin.user_id });
      toast.success("Removed!");
      loadAdmins();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleChangePassword = async () => {
    if (!changePassword.trim() || changePassword.length < 6) { toast.error("Min 6 characters"); return; }
    setSaving(true);
    try {
      await callAdminFn({ action: "change-password", target_user_id: selectedAdmin!.user_id, password: changePassword.trim() });
      toast.success(language === "bn" ? "পাসওয়ার্ড পরিবর্তন হয়েছে!" : "Password changed!");
      setPwOpen(false); setChangePassword("");
    } catch (err: any) { toast.error(err.message); }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Shield className="h-6 w-6" />
        {language === "bn" ? "অ্যাডমিন ব্যবস্থাপনা" : "Admin Management"}
      </h1>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">{language === "bn" ? "অ্যাডমিন তালিকা" : "Admin List"}</CardTitle>
            <CardDescription>{language === "bn" ? "Super Admin সরানো বা পরিবর্তন করা যাবে না" : "Super Admin cannot be removed or changed"}</CardDescription>
          </div>
          <Button onClick={() => setAddOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
            <UserPlus className="h-4 w-4" /> {language === "bn" ? "অ্যাডমিন যোগ" : "Add Admin"}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "bn" ? "ইমেইল" : "Email"}</TableHead>
                  <TableHead>{language === "bn" ? "ভূমিকা" : "Role"}</TableHead>
                  <TableHead>{language === "bn" ? "যোগ হয়েছে" : "Added"}</TableHead>
                  <TableHead className="text-right">{language === "bn" ? "অ্যাকশন" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map(admin => (
                  <TableRow key={admin.user_id}>
                    <TableCell className="font-english font-medium">{admin.email}</TableCell>
                    <TableCell>
                      {admin.is_super ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1">
                          <Crown className="h-3 w-3" /> Super Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Admin</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(admin.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" className="gap-1" onClick={() => { setSelectedAdmin(admin); setPwOpen(true); }}>
                          <Key className="h-3.5 w-3.5" /> {language === "bn" ? "পাসওয়ার্ড" : "Password"}
                        </Button>
                        {!admin.is_super && (
                          <Button size="sm" variant="ghost" className="text-destructive gap-1" onClick={() => handleRemoveAdmin(admin)}>
                            <Trash2 className="h-3.5 w-3.5" /> {language === "bn" ? "সরান" : "Remove"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "bn" ? "নতুন অ্যাডমিন যোগ করুন" : "Add New Admin"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Email</Label>
              <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="admin@example.com" className="mt-1.5 font-english" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="mt-1.5 font-english" />
            </div>
            <Button onClick={handleAddAdmin} disabled={saving} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {language === "bn" ? "অ্যাডমিন যোগ করুন" : "Add Admin"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === "bn" ? "পাসওয়ার্ড পরিবর্তন" : "Change Password"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground font-english">{selectedAdmin?.email}</p>
            <div>
              <Label>{language === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}</Label>
              <Input type="password" value={changePassword} onChange={e => setChangePassword(e.target.value)} placeholder="Min 6 characters" className="mt-1.5 font-english" />
            </div>
            <Button onClick={handleChangePassword} disabled={saving} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
              {language === "bn" ? "পাসওয়ার্ড পরিবর্তন করুন" : "Change Password"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;
