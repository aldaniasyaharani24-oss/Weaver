"use client";

import { logout } from "@/features/auth/actions/auth.actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all dash-logout-btn"
      >
        Keluar
      </button>
    </form>
  );
}
