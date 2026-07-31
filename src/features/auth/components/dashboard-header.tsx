"use client";

import { logout } from "../actions/auth.actions";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

interface DashboardHeaderProps {
  user: User;
  fullName?: string | null;
}

export function DashboardHeader({ user, fullName }: DashboardHeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">K</span>
          </div>
          <span className="font-semibold">Kanban AI</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {fullName || user.email}
          </span>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
