import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldOff } from "lucide-react";

const AdminGuard: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-center p-8 bg-card rounded-xl border border-border max-w-md mx-4">
          <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldOff className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-xl font-bold text-card-foreground mb-2">Access Denied</h2>
          <p className="text-sm text-muted-foreground">You don't have admin access. Contact the shop owner.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminGuard;
