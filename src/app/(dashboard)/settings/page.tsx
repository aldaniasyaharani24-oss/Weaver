import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaces } from "@/features/workspace/services/workspace.service";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, workspaces] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single(),
    getUserWorkspaces(user.id).catch(() => []),
  ]);

  const fullName   = profileResult.data?.full_name ?? "";
  const avatarUrl  = profileResult.data?.avatar_url ?? null;
  const email      = user.email ?? "";
  const initials   = fullName
    ? fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase();
  const joinedDate = new Date(user.created_at).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

  const cardStyle = {
    background: "rgba(30,32,72,0.8)",
    border: "1px solid rgba(249,102,171,0.12)",
    borderRadius: "1rem",
    padding: "1.25rem",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <svg className="size-6" style={{ color: "#F966AB" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          Profil
        </h1>
        <p className="text-xs" style={{ color: "rgba(233,207,232,0.5)" }}>
          Kelola profil dan preferensi akun Anda.
        </p>
      </div>

      {/* Profil Saya */}
      <div style={cardStyle}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "#F966AB" }}>Profil Saya</h2>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={fullName} className="size-16 rounded-full object-cover ring-2"
              style={{ borderColor: "rgba(249,102,171,0.3)" }} />
          ) : (
            <div className="size-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #AE0849, #E21C70)" }}>
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold truncate" style={{ color: "#E9CFE8" }}>
              {fullName || "Pengguna Weaver"}
            </p>
            <p className="text-sm truncate" style={{ color: "rgba(233,207,232,0.5)" }}>{email}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(233,207,232,0.35)" }}>
              Bergabung sejak {joinedDate}
            </p>
          </div>
        </div>
      </div>

      {/* Statistik */}
      <div style={cardStyle}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "#F966AB" }}>Statistik</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-3 text-center"
            style={{ background: "rgba(249,102,171,0.07)", border: "1px solid rgba(249,102,171,0.15)" }}>
            <p className="text-2xl font-bold" style={{ color: "#F966AB" }}>{workspaces.length}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(233,207,232,0.5)" }}>Workspace</p>
          </div>
          <div className="rounded-xl p-3 text-center"
            style={{ background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.15)" }}>
            <p className="text-2xl font-bold text-emerald-400">
              {workspaces.reduce((sum, w) => sum + (w.board_count ?? 0), 0)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(233,207,232,0.5)" }}>Board Aktif</p>
          </div>
        </div>
      </div>

      {/* Akun */}
      <div style={cardStyle}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "#F966AB" }}>Akun</h2>
        <div className="space-y-3">

          {/* Email */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: "#E9CFE8" }}>Email</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(233,207,232,0.4)" }}>{email}</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
              Terverifikasi
            </span>
          </div>

          {/* Sandi */}
          <div className="flex items-center justify-between" style={{ borderTop: "1px solid rgba(249,102,171,0.08)", paddingTop: "0.75rem" }}>
            <div>
              <p className="text-sm font-medium" style={{ color: "#E9CFE8" }}>Sandi Akun</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(233,207,232,0.4)" }}>••••••••</p>
            </div>
          </div>

          {/* Form ganti sandi */}
          <ChangePasswordForm />

          {/* Logout */}
          <div style={{ borderTop: "1px solid rgba(249,102,171,0.08)", paddingTop: "0.75rem" }}>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
