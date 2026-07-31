import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserWorkspaces } from "@/features/workspace/services/workspace.service";
import { LogoutButton } from "@/features/auth/components/logout-button";

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

      {/* Profil */}
      <div style={cardStyle}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "#F966AB" }}>Profil Saya</h2>
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={fullName} className="size-16 rounded-full object-cover ring-2" style={{ borderColor: "rgba(249,102,171,0.3)" }} />
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

      {/* Navigasi cepat */}
      <div style={cardStyle}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "#F966AB" }}>Navigasi</h2>
        <div className="space-y-2">
          {[
            { href: "/dashboard", label: "Beranda",   icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
            { href: "/workspaces", label: "Workspace", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
            { href: "/my-tasks",   label: "My Tasks",  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
            { href: "/schedule",   label: "Jadwal",    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:opacity-80"
              style={{ background: "rgba(249,102,171,0.05)", border: "1px solid rgba(249,102,171,0.08)" }}>
              <svg className="size-4 shrink-0" style={{ color: "#F966AB" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-sm font-medium" style={{ color: "#E9CFE8" }}>{item.label}</span>
              <svg className="size-3.5 ml-auto shrink-0" style={{ color: "rgba(233,207,232,0.3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Akun */}
      <div style={cardStyle}>
        <h2 className="text-sm font-bold mb-4" style={{ color: "#F966AB" }}>Akun</h2>
        <div className="space-y-3">
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
          <div style={{ borderTop: "1px solid rgba(249,102,171,0.08)", paddingTop: "0.75rem" }}>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
