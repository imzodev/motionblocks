"use client";

import React, { useState, useEffect } from "react";
import { AdminLoginForm } from "./AdminLoginForm";
import { Loader2 } from "lucide-react";

interface AdminAuthGateProps {
  children: React.ReactNode;
}

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/auth/check");
      setIsAuthenticated(res.ok);
    } catch {
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginForm onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
}
